import { useState } from 'react'
import { ArrowUpRight, CarFront, CircleAlert, FileSearch, LoaderCircle, ScanLine, ShieldCheck, Wrench } from 'lucide-react'
import './vehicle-check.css'

// Replace with the personal carVertical affiliate link once the referral account is approved.
export const CARVERTICAL_URL = 'https://www.carvertical.com/es'
export const DGT_REPORT_URL = 'https://sede.dgt.gob.es/es/vehiculos/informacion-de-vehiculos/informe-de-un-vehiculo/'

type Result = {
  vin: string; region: string; wmi: string; checkDigit: { expected: string; actual: string; valid: boolean }
  spec: null | { make: string; model: string; year: string; trim: string; body: string; drive: string; fuel: string; transmission: string; engine: string; doors: string; manufacturer: string; plant: string }
  decoderNotes: string[]; recalls: { available: boolean; items: Array<{ id: string; date: string; component: string; summary: string; remedy: string }> }
}

const EXAMPLE = 'WP0AB2A99LS227654'
const FUEL: Record<string, string> = { Gasoline: 'Gasolina', Diesel: 'Diésel', Electric: 'Eléctrico', 'Flexible Fuel Vehicle (FFV)': 'Flex', Hybrid: 'Híbrido' }

export function vinProblem(raw: string) {
  const vin = raw.toUpperCase().replace(/[\s-]/g, '')
  if (!vin) return 'Escribe el número de bastidor.'
  if (/[IOQ]/.test(vin)) return 'Los bastidores nunca usan las letras I, O ni Q (suelen confundirse con 1 y 0).'
  if (/[^A-Z0-9]/.test(vin)) return 'Solo se admiten letras y números.'
  if (vin.length !== 17) return `Faltan o sobran caracteres: tiene ${vin.length} y deben ser 17.`
  return ''
}

function checklist(r: Result) {
  const items = [
    'Comprueba que el bastidor del documento coincide con el grabado en el chasis y en la base del parabrisas.',
    'Pide el informe oficial de la DGT: cargas, embargos, titulares, ITV y kilometraje registrado.',
    'Verifica el historial de mantenimiento en el concesionario oficial de la marca.',
  ]
  const year = Number(r.spec?.year || 0)
  if (year && year < new Date().getFullYear() - 8) items.push('Vehículo de más de 8 años: revisa con especial atención la suspensión, los frenos y las fugas.')
  if (/electric/i.test(r.spec?.fuel || '')) items.push('Eléctrico: solicita el certificado del estado de salud de la batería (SoH).')
  if (/diesel/i.test(r.spec?.fuel || '')) items.push('Diésel: pregunta por el filtro de partículas (DPF) y la válvula EGR.')
  if (r.region !== 'España') items.push(`Fabricado en ${r.region}: si es importado, confirma la homologación y la fecha de primera matriculación en España.`)
  if (r.recalls.items.length) items.push(`Hay ${r.recalls.items.length} llamada(s) a revisión registradas para este modelo en EE. UU.: confirma con la marca si aplican a este vehículo y si están hechas.`)
  return items
}

export function VehicleCheck({ compact = false }: { compact?: boolean }) {
  const [vin, setVin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  async function check(e?: React.FormEvent, value = vin) {
    e?.preventDefault()
    const problem = vinProblem(value)
    if (problem) { setError(problem); setResult(null); return }
    setBusy(true); setError(''); setResult(null)
    try {
      const r = await fetch(`/.netlify/functions/vehicle-check?vin=${encodeURIComponent(value.toUpperCase().replace(/[\s-]/g, ''))}`)
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'No se pudo comprobar el bastidor.')
      setResult(d)
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo comprobar el bastidor.') } finally { setBusy(false) }
  }

  const len = vin.replace(/[\s-]/g, '').length
  const s = result?.spec
  return (
    <section className={`vc ${compact ? 'vc-compact' : ''}`} aria-labelledby="vc-title">
      <div className="vc-head">
        <span className="vc-eyebrow"><ScanLine size={14} /> AUREON VEHICLE CHECK</span>
        <h2 id="vc-title">Comprueba un coche <em>antes de comprarlo.</em></h2>
        <p>Introduce el número de bastidor (VIN) y obtén al instante su ficha técnica de fábrica y las llamadas a revisión. Gratis y con datos oficiales.</p>
      </div>
      <form className="vc-form" onSubmit={check}>
        <label htmlFor="vc-vin">Número de bastidor (VIN)</label>
        <div className="vc-input">
          <input id="vc-vin" value={vin} onChange={ev => setVin(ev.target.value.toUpperCase().slice(0, 20))} placeholder="Ej.: WP0AB2A99LS227654" autoComplete="off" autoCapitalize="characters" spellCheck={false} inputMode="text" aria-describedby="vc-help" />
          <span className={`vc-count ${len === 17 ? 'is-ok' : ''}`} aria-hidden="true">{len}/17</span>
          <button type="submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="vc-spin" /> : <FileSearch size={17} />} {busy ? 'Analizando…' : 'Comprobar'}</button>
        </div>
        <small id="vc-help">Está en la ficha técnica, en el permiso de circulación (casilla E) y en la base del parabrisas. <button type="button" className="vc-link" onClick={() => { setVin(EXAMPLE); void check(undefined, EXAMPLE) }}>Probar con un ejemplo</button></small>
      </form>
      {error && <p className="vc-error" role="alert"><CircleAlert size={16} /> {error}</p>}
      {busy && <div className="vc-scan" aria-hidden="true"><span /></div>}
      {result && (
        <div className="vc-result" aria-live="polite">
          <div className="vc-card vc-id">
            <CarFront size={22} />
            <div>
              <strong>{s?.make ? `${s.make} ${s.model}` : 'Fabricante identificado'}{s?.year ? ` · ${s.year}` : ''}</strong>
              <span>{s?.trim || s?.body || 'Datos parciales del fabricante'}</span>
            </div>
            <span className="vc-vin">{result.vin}</span>
          </div>
          <dl className="vc-grid">
            {([['Origen', result.region], ['Fabricante', s?.manufacturer], ['Planta', s?.plant], ['Carrocería', s?.body], ['Motor', s?.engine], ['Combustible', s?.fuel && (FUEL[s.fuel] || s.fuel)], ['Tracción', s?.drive], ['Cambio', s?.transmission], ['Puertas', s?.doors]] as Array<[string, string | undefined]>).filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {!result.checkDigit.valid && <p className="vc-note"><CircleAlert size={14} /> El dígito de control (posición 9) no cuadra con la norma norteamericana. En coches europeos es habitual; en uno importado de EE. UU. sería una señal de alerta.</p>}
          {result.decoderNotes.length > 0 && !s?.make && <p className="vc-note"><CircleAlert size={14} /> {result.decoderNotes[0]}</p>}
          <div className="vc-card">
            <h3><Wrench size={16} /> Llamadas a revisión {result.recalls.available ? `(${result.recalls.items.length})` : ''}</h3>
            {result.recalls.items.length ? (
              <ul className="vc-recalls">{result.recalls.items.map(x => <li key={x.id}><strong>{x.component}</strong><span>{x.date} · campaña {x.id}</span><p>{x.summary}</p></li>)}</ul>
            ) : <p className="vc-muted">{result.recalls.available ? 'No constan llamadas a revisión para este modelo y año en la base de datos de EE. UU.' : 'Sin datos de llamadas a revisión para este vehículo.'}</p>}
          </div>
          <div className="vc-card">
            <h3><ShieldCheck size={16} /> Lista de comprobación antes de comprar</h3>
            <ol className="vc-list">{checklist(result).map(t => <li key={t}>{t}</li>)}</ol>
          </div>
          <div className="vc-cta">
            <a className="vc-cta-main" href={CARVERTICAL_URL} target="_blank" rel="sponsored noopener noreferrer">
              <span><strong>Historial completo con carVertical</strong><small>Kilómetros, daños, robos, importación y fotos anteriores</small></span><ArrowUpRight size={18} />
            </a>
            <a className="vc-cta-alt" href={DGT_REPORT_URL} target="_blank" rel="noopener noreferrer">
              <span><strong>Informe oficial de la DGT</strong><small>Cargas, titulares, ITV y kilometraje en España</small></span><ArrowUpRight size={18} />
            </a>
          </div>
          <p className="vc-legal">Ficha técnica y llamadas a revisión: NHTSA (EE. UU.), datos públicos oficiales que pueden ser incompletos en vehículos europeos. Esta comprobación no sustituye un informe de historial ni una inspección profesional. Enlace de carVertical patrocinado.</p>
        </div>
      )}
    </section>
  )
}

export function VehicleCheckCta() {
  return (
    <a className="vc-strip" href="/comprobar-coche">
      <ScanLine size={18} aria-hidden="true" />
      <span><strong>¿Vas a comprar un coche?</strong> Comprueba su bastidor gratis: ficha de fábrica, llamadas a revisión e historial.</span>
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  )
}
