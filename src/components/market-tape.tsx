import { useEffect, useState } from 'react'
import './market-tape.css'

// Compact, single-line live market tape ("katana" style: sharp gold blade sweep, smooth scroll).
// Data comes from /.netlify/functions/market-tape (real quotes, CDN-cached 60 s).
export type TapeQuote = { id: string; name: string; group: string; price: number; changePct: number | null; currency: string; decimals: number }
type Tape = { quotes: TapeQuote[]; updatedAt: string }

const ENDPOINT = '/.netlify/functions/market-tape'
const REFRESH_MS = 60_000
const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' }

export function formatPrice(q: TapeQuote) {
  const n = new Intl.NumberFormat('es-ES', { minimumFractionDigits: q.decimals, maximumFractionDigits: q.decimals }).format(q.price)
  if (q.group === 'indice' || q.group === 'divisa') return n
  return `${n} ${SYMBOL[q.currency] || q.currency}`.trim()
}
export function formatChange(p: number | null) {
  if (p == null) return ''
  return `${p > 0 ? '+' : p < 0 ? '−' : ''}${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(p))}%`
}

function Items({ quotes, hidden }: { quotes: TapeQuote[]; hidden?: boolean }) {
  return (
    <ul className="mkt-items" aria-hidden={hidden || undefined}>
      {quotes.map(q => {
        const dir = q.changePct == null ? 'flat' : q.changePct > 0 ? 'up' : q.changePct < 0 ? 'down' : 'flat'
        return (
          <li key={q.id} className={`mkt-item mkt-${dir}`}>
            <span className="mkt-name">{q.name}</span>
            <span className="mkt-price">{formatPrice(q)}</span>
            {q.changePct != null && <span className="mkt-chg"><i aria-hidden="true">{dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'}</i>{formatChange(q.changePct)}</span>}
          </li>
        )
      })}
      <li className="mkt-item mkt-note">Datos de terceros con posible retraso · No es asesoramiento financiero</li>
    </ul>
  )
}

export function MarketTape() {
  const [tape, setTape] = useState<Tape | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    const load = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      fetch(ENDPOINT)
        .then(r => (r.ok ? r.json() as Promise<Tape> : Promise.reject(new Error(String(r.status)))))
        .then(d => { if (alive && Array.isArray(d.quotes) && d.quotes.length) { setTape(d); setFailed(false) } else if (alive) setFailed(true) })
        .catch(() => { if (alive) setFailed(true) })
    }
    load()
    const id = window.setInterval(load, REFRESH_MS)
    return () => { alive = false; window.clearInterval(id) }
  }, [])

  const quotes = tape?.quotes || []
  const seconds = Math.max(30, quotes.length * 3.2)
  return (
    <section className="mkt-tape" aria-label="Mercados en directo: índices, acciones, divisas, materias primas y criptomonedas">
      <div className="mkt-label"><i className={quotes.length ? 'mkt-live' : 'mkt-live is-off'} aria-hidden="true" /> <span>MERCADOS</span></div>
      <div className="mkt-viewport">
        {quotes.length ? (
          <div className="mkt-track" style={{ animationDuration: `${seconds}s` }}>
            <Items quotes={quotes} />
            <Items quotes={quotes} hidden />
          </div>
        ) : (
          <p className="mkt-status" role="status">{failed ? 'Cotizaciones no disponibles en este momento' : 'Cargando cotizaciones…'}</p>
        )}
        <span className="mkt-blade" aria-hidden="true" />
      </div>
    </section>
  )
}
