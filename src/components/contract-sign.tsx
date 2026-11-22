import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, CircleAlert, Download, FileSignature, LoaderCircle, ShieldCheck } from 'lucide-react'
import './contract-sign.css'

type Field = { key: string; label: string; long?: boolean; value: string }
type PublicContract = { ref: string; title: string; summary: string; law: string; status: string; parties: Array<{ role: string; label: string }>; fields: Field[]; clauses: Array<[string, string]>; completedAt: string | null }
const API = '/.netlify/functions/contract'

export function ContractSign({ token }: { token: string }) {
  const [c, setC] = useState<PublicContract | null>(null)
  const [error, setError] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [signer, setSigner] = useState({ name: '', doc: '' })
  const [accept, setAccept] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ hash: string } | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${API}?token=${encodeURIComponent(token)}`).then(r => r.json().then(d => ({ ok: r.ok, d }))).then(({ ok, d }) => { if (!alive) return; if (!ok) setError(d.error || 'No se pudo abrir el contrato.'); else setC(d) }).catch(() => alive && setError('No se pudo abrir el contrato.'))
    return () => { alive = false }
  }, [token])

  const missing = useMemo(() => (c?.fields || []).filter(f => !f.value), [c])
  const pending = missing.filter(f => !(values[f.key] || '').trim()).length
  const fill = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (_, k) => { const f = c?.fields.find(x => x.key === k); return (f?.value || values[k] || '').trim() || '______' })

  async function sign(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, values, signerName: signer.name, signerDoc: signer.doc, accept }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'No se pudo firmar.')
      setDone({ hash: d.hash })
      requestAnimationFrame(() => document.querySelector('.ct')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo firmar.') } finally { setBusy(false) }
  }

  if (error && !c) return <main className="section inner ct"><div className="ct-card ct-center"><CircleAlert size={30} /><h1>Contrato no disponible</h1><p>{error}</p></div></main>
  if (!c) return <main className="section inner ct"><div className="ct-card ct-center"><LoaderCircle size={28} className="ct-spin" /><p>Abriendo contrato…</p></div></main>
  const pdf = `${API}?token=${encodeURIComponent(token)}&pdf=1`
  if (done || c.status === 'completed') return (
    <main className="section inner ct"><div className="ct-card ct-center ct-done">
      <CheckCircle2 size={44} /><span className="eyebrow">{c.ref}</span><h1>Contrato <em>firmado.</em></h1>
      <p>{c.title} queda firmado electrónicamente. AUREON ha recibido la confirmación.</p>
      {done && <small className="ct-hash">Huella SHA-256: {done.hash}</small>}
      <a className="button gold" href={pdf} target="_blank" rel="noopener noreferrer"><Download size={16} /> Descargar PDF firmado</a>
    </div></main>
  )
  return (
    <main className="section inner ct">
      <div className="ct-head">
        <span className="eyebrow"><FileSignature size={14} /> CONTRATO · {c.ref}</span>
        <h1>{c.title}</h1>
        <p>{c.summary}</p>
        <div className="ct-progress" aria-label={`${missing.length - pending} de ${missing.length} datos completados`}><span style={{ width: `${missing.length ? ((missing.length - pending) / missing.length) * 100 : 100}%` }} /></div>
        <a className="ct-pdf" href={pdf} target="_blank" rel="noopener noreferrer"><Download size={14} /> Ver borrador en PDF</a>
      </div>
      <form className="ct-grid" onSubmit={sign}>
        <section className="ct-card">
          <h2>Datos del contrato</h2>
          {c.fields.map(f => f.value
            ? <div key={f.key} className="ct-fixed"><span>{f.label}</span><strong>{f.value}</strong></div>
            : <label key={f.key} className="ct-field">{f.label}{f.long
                ? <textarea rows={3} value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} required />
                : <input value={values[f.key] || ''} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} required />}</label>)}
        </section>
        <section className="ct-card">
          <h2>Cláusulas</h2>
          {c.clauses.map(([h, b], i) => <details key={h} className="ct-clause" open={i < 2}><summary>{i + 1}. {h} <ChevronDown size={14} /></summary><p>{fill(b)}</p></details>)}
          <p className="ct-law">{c.law} El PDF incluye además las cláusulas de protección de datos, notificaciones, firma electrónica y jurisdicción.</p>
          <div className="ct-sign">
            <h2>Firma electrónica</h2>
            <label className="ct-field">Nombre completo del firmante<input value={signer.name} onChange={e => setSigner(s => ({ ...s, name: e.target.value }))} required minLength={3} autoComplete="name" /></label>
            <label className="ct-field">DNI, NIE o pasaporte<input value={signer.doc} onChange={e => setSigner(s => ({ ...s, doc: e.target.value }))} required /></label>
            {signer.name && <div className="ct-signature" aria-hidden="true">{signer.name}</div>}
            <label className="ct-accept"><input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} required /> He leído el contrato completo (incluido el PDF), acepto su contenido y lo firmo electrónicamente. Se registrarán la fecha, la IP y una huella del documento.</label>
            {error && <p className="ct-error" role="alert"><CircleAlert size={14} /> {error}</p>}
            <button className="button gold" disabled={busy || pending > 0 || !accept}>{busy ? <LoaderCircle size={16} className="ct-spin" /> : <ShieldCheck size={16} />} {pending ? `Faltan ${pending} datos` : 'Firmar contrato'}</button>
          </div>
        </section>
      </form>
    </main>
  )
}
