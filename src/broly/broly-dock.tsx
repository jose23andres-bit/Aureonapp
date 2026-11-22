import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Ban, Brain, Check, CircleAlert, Clock3, ExternalLink, Link2Off, ListTodo, LoaderCircle, MessageSquare, Mic, MicOff, Pencil, Plus, Radar, RefreshCw, Send, ShieldCheck, ThumbsDown, ThumbsUp, Trash2, Volume2, VolumeX, X } from 'lucide-react'
import { type AvatarState } from './warrior'
import { BrolyAvatar } from './warrior'
import { getAccessToken } from '../lib/supabase'
import { brolyApi, hasAdminSession, todayWindow, type BrolyAction, type BrolyMemory, type BrolyMessage, type BrolyStatus, type BrolyTask } from './api'
import { startDictation, voiceSupport } from './speech'
import { speakText, stopVoice, unlockAudio } from './voice-player'
import './broly.css'

// The dock is only rendered for an active admin session (same Supabase session as /admin).
// Public visitors never see it, so the public site is unchanged for them.
function subscribeSession(cb: () => void) {
  const id = window.setInterval(cb, 2000)
  window.addEventListener('focus', cb)
  window.addEventListener('storage', cb)
  return () => { window.clearInterval(id); window.removeEventListener('focus', cb); window.removeEventListener('storage', cb) }
}

const STATUS_LABEL: Record<string, string> = {
  proposed: 'Propuesta · pendiente de tu aprobación', running: 'En ejecución', completed: 'Completada', verified: 'Completada y verificada',
  failed: 'Error', rejected: 'Rechazada', expired: 'Caducada', needs_connection: 'Falta conectar Google',
  planned: 'Plan en curso', queued: 'En cola', cancelled: 'Cancelada',
}
const RISK_LABEL: Record<string, string> = { 'lectura-interna': 'Lectura interna', 'escritura-interna': 'Guarda datos en BROLY', 'lectura-externa': 'Lee datos de Google', 'envio-externo': 'Envía un documento por WhatsApp' }
type RadarRun = { id: string; ref: string; status: string; started_at: string; new_leads: number; sent_via: string | null; error: string | null }
type RadarLead = { id: string; url: string; source: string; request: string; zone: string | null; urgency: string; score: number; sensitive: boolean }
type RadarInfo = { configured: boolean; enabled: boolean; city: string; budget: number; to: string | null; runs: RadarRun[]; leads: RadarLead[] }
const SENT_LABEL: Record<string, string> = { session: 'enviado por WhatsApp', template: 'enviado (plantilla)', 'session-text': 'aviso sin novedades', 'none-empty': 'sin novedades' }
const CATEGORIES = ['preferencia', 'proyecto', 'dato', 'otro']
const VOICE_KEY = 'broly_voice_replies'
type Tab = 'chat' | 'memory' | 'tasks'

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback)
const time = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export function BrolyDock() {
  const session = useSyncExternalStore(subscribeSession, hasAdminSession, () => false)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('chat')
  const [status, setStatus] = useState<BrolyStatus | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<BrolyMessage[]>([])
  const [actions, setActions] = useState<Record<string, BrolyAction>>({})
  const [memories, setMemories] = useState<BrolyMemory[]>([])
  const [contracts, setContracts] = useState<Array<{ id: string; ref: string; title: string; status: string; client_name: string | null; created_at: string }>>([])
  const [radar, setRadar] = useState<RadarInfo | null>(null)
  const [radarBusy, setRadarBusy] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [deciding, setDeciding] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceReplies, setVoiceReplies] = useState(false)
  const [memoryDraft, setMemoryDraft] = useState({ id: '', content: '', category: 'preferencia', scope: 'private' })
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stopDictation = useRef<(() => void) | null>(null)
  const loadSeq = useRef(0) // ignores stale loads that finish after a newer chat/load

  useEffect(() => () => { stopVoice(); stopDictation.current?.() }, [])
  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight }, [messages, actions, sending])

  if (!session) return null

  const state: AvatarState = listening ? 'listening' : deciding ? 'executing' : sending ? 'thinking' : speaking ? 'speaking' : open ? 'active' : 'idle'

  async function loadAll(id: string | null = conversationId) {
    const seq = ++loadSeq.current
    setLoading(true); setError('')
    try {
      const [s, c] = await Promise.all([
        brolyApi<BrolyStatus>('status'),
        brolyApi<{ conversationId: string | null; messages: BrolyMessage[]; actions: BrolyAction[] }>('conversation', 'GET', undefined, id ? { id } : {}),
      ])
      if (seq !== loadSeq.current) return
      setStatus(s); setConversationId(c.conversationId); setMessages(c.messages)
      setActions(Object.fromEntries(c.actions.map(a => [a.id, a])))
    } catch (e) { if (seq === loadSeq.current) setError(errMsg(e, 'No se pudo conectar con BROLY.')) } finally { if (seq === loadSeq.current) setLoading(false) }
  }

  function openPanel() {
    setOpen(true)
    try { setVoiceReplies(window.localStorage.getItem(VOICE_KEY) === '1') } catch { /* storage unavailable */ }
    void loadAll()
    window.setTimeout(() => panelRef.current?.focus(), 0)
  }
  function closePanel() {
    setOpen(false); stopVoice(); setSpeaking(false); stopDictation.current?.()
    window.setTimeout(() => fabRef.current?.focus(), 0)
  }

  const premiumVoice = Boolean(status?.voice?.premium)
  function sayNow(value: string) {
    void speakText(value, premiumVoice, { onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false), onFallback: reason => setError(`Voz premium no disponible (${reason}). Uso la voz del dispositivo.`) })
  }
  function say(value: string) { if (voiceReplies) sayNow(value) }

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    const value = text.trim()
    if (!value || sending || loading) return
    if (voiceReplies) unlockAudio() // inside the user gesture, so iOS lets the reply play later
    loadSeq.current++ // a pending history load must not overwrite this exchange
    setLoading(false); setSending(true); setError(''); setText('')
    const temp: BrolyMessage = { id: `local-${messages.length}`, role: 'user', content: value, created_at: new Date().toISOString() }
    setMessages(m => [...m, temp])
    try {
      const r = await brolyApi<{ conversationId: string; userMessage: BrolyMessage; assistantMessage: BrolyMessage; actions: BrolyAction[] }>('chat', 'POST', { conversationId, message: value })
      setConversationId(r.conversationId)
      setMessages(m => [...m.filter(x => x.id !== temp.id), r.userMessage, r.assistantMessage])
      setActions(a => ({ ...a, ...Object.fromEntries(r.actions.map(x => [x.id, x])) }))
      say(r.assistantMessage.content)
    } catch (err) {
      setMessages(m => m.filter(x => x.id !== temp.id)); setText(value); setError(errMsg(err, 'No se pudo enviar el mensaje.'))
    } finally { setSending(false) }
  }

  async function decide(action: BrolyAction, decision: 'approve' | 'reject') {
    if (voiceReplies) unlockAudio()
    setDeciding(action.id); setError('')
    setActions(a => ({ ...a, [action.id]: { ...action, status: decision === 'approve' ? 'running' : action.status } }))
    try {
      const r = await brolyApi<{ action: BrolyAction }>('action-decide', 'POST', { actionId: action.id, decision, ...todayWindow() })
      setActions(a => ({ ...a, [r.action.id]: r.action }))
      await loadAll(conversationId)
      if (decision === 'approve') say(`${STATUS_LABEL[r.action.status] || r.action.status}: ${r.action.label}`)
    } catch (err) { setError(errMsg(err, 'No se pudo completar la acción.')); await loadAll(conversationId) } finally { setDeciding(null) }
  }

  function toggleMic() {
    if (listening) { stopDictation.current?.(); return }
    setError('')
    stopDictation.current = startDictation({
      onText: t => setText(old => (old ? `${old} ${t}` : t)),
      onEnd: () => { setListening(false); stopDictation.current = null },
      onError: m => { setListening(false); setError(m) },
    })
    if (stopDictation.current) setListening(true)
  }

  function toggleVoiceReplies() {
    const next = !voiceReplies
    setVoiceReplies(next)
    if (next) unlockAudio(); else { stopVoice(); setSpeaking(false) }
    try { window.localStorage.setItem(VOICE_KEY, next ? '1' : '0') } catch { /* storage unavailable */ }
  }

  async function newConversation() { setConversationId(null); setMessages([]); setActions({}); setError('') }

  async function loadMemories() {
    try { setMemories((await brolyApi<{ memories: BrolyMemory[] }>('memories')).memories) } catch (e) { setError(errMsg(e, 'No se pudo cargar la memoria.')) }
  }
  async function saveMemory(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try {
      await brolyApi('memory-save', 'POST', { id: memoryDraft.id || undefined, content: memoryDraft.content, category: memoryDraft.category, scope: memoryDraft.scope })
      setMemoryDraft({ id: '', content: '', category: 'preferencia', scope: 'private' }); await loadMemories()
    } catch (err) { setError(errMsg(err, 'No se pudo guardar el recuerdo.')) }
  }
  async function deleteMemory(id: string) {
    setError('')
    try { await brolyApi('memory-delete', 'POST', { id }); await loadMemories() } catch (err) { setError(errMsg(err, 'No se pudo borrar el recuerdo.')) }
  }
  async function toggleStep(task: BrolyTask, index: number, done: boolean) {
    try { await brolyApi('plan-step', 'POST', { taskId: task.id, index, done }); await loadAll() } catch (err) { setError(errMsg(err, 'No se pudo actualizar el paso.')) }
  }
  async function connectGoogle() {
    try { const r = await brolyApi<{ url: string }>('google-connect'); window.location.href = r.url } catch (err) { setError(errMsg(err, 'No se pudo iniciar la conexión con Google.')) }
  }
  async function feedback(m: BrolyMessage, value: 1 | -1) {
    const next = m.feedback === value ? 0 : value
    try { await brolyApi('feedback', 'POST', { messageId: m.id, value: next }); setMessages(list => list.map(x => (x.id === m.id ? { ...x, feedback: next || null } : x))) } catch (err) { setError(errMsg(err, 'No se pudo guardar la valoración.')) }
  }

  async function loadContracts() { try { setContracts((await brolyApi<{ contracts: typeof contracts }>('contracts')).contracts) } catch { setContracts([]) } }
  async function loadRadar() { try { setRadar(await brolyApi<RadarInfo>('radar')) } catch { setRadar(null) } }
  async function runRadarNow() {
    setRadarBusy(true); setError('')
    try { await brolyApi('radar-run', 'POST', {}); window.setTimeout(() => { void loadRadar(); setRadarBusy(false) }, 4000) } catch (err) { setError(errMsg(err, 'No se pudo lanzar el radar.')); setRadarBusy(false) }
  }
  async function openReport(run: RadarRun) {
    const w = window.open('', '_blank') // opened synchronously so mobile browsers do not block it
    try {
      const r = await fetch(`/.netlify/functions/broly?action=radar-report&run=${encodeURIComponent(run.id)}`, { headers: { Authorization: `Bearer ${getAccessToken() || ''}` } })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`)
      const href = URL.createObjectURL(await r.blob())
      if (w) w.location.assign(href); else window.location.assign(href)
    } catch (err) { w?.close(); setError(errMsg(err, 'No se pudo abrir el informe.')) }
  }
  function switchTab(next: Tab) { setTab(next); if (next === 'memory') void loadMemories(); if (next === 'tasks') { void loadAll(); void loadContracts(); void loadRadar() } }

  const voice = voiceSupport()
  const ai = status?.ai
  const stateText = { idle: 'En reposo', active: 'Listo', listening: 'Escuchando…', thinking: 'Procesando…', speaking: 'Respondiendo…', executing: 'Ejecutando tarea…' }[state]

  return (
    <div className="bly-root">
      {!open && (
        <button ref={fabRef} type="button" className="bly-fab" onClick={openPanel} aria-label="Abrir BROLY, tu asistente personal" title="BROLY · asistente personal">
          <BrolyAvatar size={46} state={state} />
        </button>
      )}
      {open && (
        <section ref={panelRef} className="bly-panel" role="dialog" aria-label="BROLY, asistente personal" tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') closePanel() }}>
          <div className="bly-head">
            <div className="bly-identity">
              <span className="bly-head-fly"><BrolyAvatar size={50} state={state} /></span>
              <div>
                <strong>BROLY</strong>
                <small aria-live="polite">{stateText} · {ai ? (ai.configured ? `IA ${ai.label ? `${ai.label} · ` : ''}${ai.model}${ai.free ? ' (gratuito)' : ''}` : 'Modo local sin IA') : 'Conectando…'}</small>
              </div>
            </div>
            <div className="bly-head-actions">
              <button type="button" onClick={toggleVoiceReplies} aria-pressed={voiceReplies} aria-label={voiceReplies ? 'Desactivar respuestas habladas' : 'Activar respuestas habladas'} title={premiumVoice ? `Respuestas habladas · voz IA (${status?.voice?.voice})` : "Respuestas habladas · voz del dispositivo"} disabled={!voice.synthesis && !premiumVoice}>{voiceReplies ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
              <button type="button" onClick={closePanel} aria-label="Cerrar BROLY y volver a la página"><X size={19} /></button>
            </div>
          </div>
          <div className="bly-tabs" role="group" aria-label="Secciones de BROLY">
            {([['chat', 'Conversación', MessageSquare], ['memory', 'Memoria', Brain], ['tasks', 'Tareas', ListTodo]] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" className={tab === id ? 'is-active' : ''} aria-pressed={tab === id} onClick={() => switchTab(id)}><Icon size={14} /> {label}</button>
            ))}
          </div>
          {error && <p className="bly-error" role="alert"><CircleAlert size={15} /> {error}</p>}

          {tab === 'chat' && (
            <>
              <div className="bly-messages" ref={listRef} aria-live="polite">
                {loading && !messages.length && <p className="bly-muted"><LoaderCircle size={14} className="bly-spin" /> Cargando conversación…</p>}
                {!loading && !messages.length && (
                  <div className="bly-welcome">
                    <p>Hola, José Andrés. Soy BROLY.</p>
                    <p className="bly-muted">Pídeme un plan, que recuerde algo o tu resumen de agenda y correo. Todo lo que lea datos externos o guarde recuerdos te lo propondré antes de hacerlo.</p>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`bly-msg bly-msg-${m.role}`}>
                    <p>{m.content}</p>
                    {m.role === 'assistant' && Array.isArray(m.metadata?.actionIds) && (m.metadata.actionIds as string[]).map(id => actions[id] && <ActionCard key={id} action={actions[id]} busy={deciding === id} onDecide={decide} />)}
                    {m.role === 'assistant' && !m.id.startsWith('local-') && m.metadata?.kind !== 'action_result' && (
                      <div className="bly-msg-tools">
                        <span>{time(m.created_at)}{m.metadata?.mode === 'rules' ? ' · modo local' : m.metadata?.mode === 'ai-error' ? ' · sin respuesta de IA' : m.metadata?.providerLabel ? ` · ${String(m.metadata.providerLabel)}` : ''}{Array.isArray(m.metadata?.fallbacks) && (m.metadata.fallbacks as unknown[]).length && m.metadata?.mode === 'ai' ? ' (respaldo)' : ''}</span>
                        <button type="button" aria-label="Escuchar" onClick={() => { unlockAudio(); sayNow(m.content) }} disabled={!voice.synthesis && !premiumVoice}><Volume2 size={13} /></button>
                        <button type="button" aria-label="Respuesta útil" aria-pressed={m.feedback === 1} onClick={() => void feedback(m, 1)}><ThumbsUp size={13} /></button>
                        <button type="button" aria-label="Respuesta mejorable" aria-pressed={m.feedback === -1} onClick={() => void feedback(m, -1)}><ThumbsDown size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
                {sending && <p className="bly-muted bly-thinking"><BrolyAvatar size={34} state="thinking" /> BROLY se transforma y está pensando…</p>}
              </div>
              <form className="bly-compose" onSubmit={send}>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={2} maxLength={4000} placeholder={listening ? 'Escuchando…' : 'Escribe o dicta a BROLY…'} aria-label="Mensaje para BROLY" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} />
                <div className="bly-compose-actions">
                  <button type="button" className={listening ? 'bly-mic is-listening' : 'bly-mic'} onClick={toggleMic} aria-pressed={listening} aria-label={listening ? 'Detener dictado' : 'Dictar por voz'} title={voice.policyAllowsMic ? 'Dictar por voz' : 'Micrófono bloqueado por la política del sitio'}>{listening ? <MicOff size={17} /> : <Mic size={17} />}</button>
                  <button type="submit" className="bly-send" disabled={sending || loading || !text.trim()} aria-label="Enviar"><Send size={17} /></button>
                </div>
              </form>
              <div className="bly-foot">
                <button type="button" onClick={() => void newConversation()}><Plus size={13} /> Nueva conversación</button>
                <span><ShieldCheck size={12} /> Sin envíos ni compras</span>
              </div>
              <div className="bly-foot bly-voice-note">
                <span>{premiumVoice ? 'La voz de BROLY está generada por IA (OpenAI); no es una voz humana.' : 'Voz del dispositivo (sintetizada, no humana).'}</span>
              </div>
            </>
          )}

          {tab === 'memory' && (
            <div className="bly-scroll">
              <p className="bly-muted">Solo recuerdo lo que tú escribes aquí o lo que apruebas en la conversación. Puedes corregir o borrar cualquier recuerdo.</p>
              <form className="bly-memory-form" onSubmit={saveMemory}>
                <textarea value={memoryDraft.content} onChange={e => setMemoryDraft(d => ({ ...d, content: e.target.value }))} rows={2} maxLength={500} placeholder="Ej.: prefiero los resúmenes en viñetas" aria-label="Contenido del recuerdo" />
                <div>
                  <select value={memoryDraft.category} onChange={e => setMemoryDraft(d => ({ ...d, category: e.target.value }))} aria-label="Categoría">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <button type="submit" disabled={memoryDraft.content.trim().length < 3}>{memoryDraft.id ? 'Guardar corrección' : 'Añadir recuerdo'}</button>
                  <label className="bly-scope"><input type="checkbox" checked={memoryDraft.scope === 'global'} onChange={e => setMemoryDraft(d => ({ ...d, scope: e.target.checked ? 'global' : 'private' }))} /> Memoria del sistema (compartida entre administradores)</label>
                  {memoryDraft.id && <button type="button" onClick={() => setMemoryDraft({ id: '', content: '', category: 'preferencia', scope: 'private' })}>Cancelar</button>}
                </div>
              </form>
              {memories.length ? (
                <ul className="bly-list">
                  {memories.map(m => (
                    <li key={m.id}>
                      <div><span className="bly-chip">{m.scope === 'global' ? 'sistema · ' : ''}{m.category}</span><p>{m.content}</p><small>{m.editable === false ? 'Memoria del sistema de otro administrador' : m.source === 'assistant' ? 'Propuesto por BROLY y aprobado' : 'Añadido por ti'} · {new Date(m.updated_at).toLocaleDateString('es-ES')}</small></div>
                      {m.editable !== false && <div className="bly-row-actions">
                        <button type="button" aria-label={`Corregir recuerdo: ${m.content}`} onClick={() => setMemoryDraft({ id: m.id, content: m.content, category: m.category, scope: m.scope === 'global' ? 'global' : 'private' })}><Pencil size={14} /></button>
                        <button type="button" aria-label={`Borrar recuerdo: ${m.content}`} onClick={() => void deleteMemory(m.id)}><Trash2 size={14} /></button>
                      </div>}
                    </li>
                  ))}
                </ul>
              ) : <p className="bly-muted">Todavía no hay recuerdos.</p>}
            </div>
          )}

          {tab === 'tasks' && (
            <div className="bly-scroll">
              <div className="bly-connection">
                {status?.google?.connected_email ? <span><Check size={14} /> Google conectado: {status.google.connected_email} (solo lectura)</span> : <><span><Link2Off size={14} /> Gmail y Calendar sin conectar</span><button type="button" onClick={() => void connectGoogle()}>Conectar Google <ExternalLink size={13} /></button></>}
              </div>
              <div className="bly-section-head"><strong>Tareas y planes</strong><button type="button" onClick={() => void loadAll()} aria-label="Actualizar tareas"><RefreshCw size={13} /></button></div>
              {status?.tasks?.length ? (
                <ul className="bly-list">
                  {status.tasks.map(t => (
                    <li key={t.id} className="bly-task">
                      <div>
                        <span className={`bly-badge bly-badge-${t.status}`}>{STATUS_LABEL[t.status] || t.status}</span>
                        <p>{t.title}</p>
                        <small>{new Date(t.created_at).toLocaleString('es-ES')} · {t.task_type === 'plan' ? 'plan' : t.task_type === 'agenda-summary' ? 'resumen' : 'instrucción'}</small>
                        {t.error_message && <small className="bly-err-text">{t.error_message}</small>}
                        {t.task_type === 'plan' && t.input?.steps && (
                          <ol className="bly-steps">
                            {t.input.steps.map((s, i) => <li key={i}><label><input type="checkbox" checked={s.done} onChange={e => void toggleStep(t, i, e.target.checked)} /> {s.title}</label>{s.detail && <small>{s.detail}</small>}</li>)}
                          </ol>
                        )}
                        {t.result?.summary && <details><summary>Ver resumen</summary><pre>{t.result.summary}</pre></details>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="bly-muted">Sin tareas todavía.</p>}
              <div className="bly-section-head"><strong>Contratos</strong></div>
              {contracts.length ? <ul className="bly-list">{contracts.slice(0, 10).map(c => <li key={c.id}><div><span className={`bly-badge bly-badge-${c.status === 'completed' ? 'verified' : c.status === 'sent' ? 'running' : 'proposed'}`}>{({ draft: 'Preparado', sent: 'Enviado', completed: 'Firmado', cancelled: 'Anulado' } as Record<string, string>)[c.status] || c.status}</span><p>{c.title}</p><small>{c.ref} · {c.client_name || 'sin cliente'} · {new Date(c.created_at).toLocaleDateString('es-ES')}</small></div></li>)}</ul> : <p className="bly-muted">Pídele a BROLY «prepara un NDA para…» y aparecerá aquí.</p>}
              <div className="bly-section-head"><strong>Radar de clientes</strong>{radar?.configured && <button type="button" onClick={() => void runRadarNow()} disabled={radarBusy} aria-label="Lanzar el radar ahora" title="Lanzar el radar ahora">{radarBusy ? <LoaderCircle size={14} className="bly-spin" /> : <Radar size={14} />}</button>}</div>
              {!radar ? <p className="bly-muted">Cargando radar…</p> : !radar.configured ? <p className="bly-muted">Para activarlo añade BRAVE_SEARCH_API_KEY en Netlify (guía: docs/broly, sección 10). Busca cada 12 h personas que piden lo que ofreces y te manda el informe por WhatsApp.</p> : (
                <>
                  <p className="bly-muted">{radar.enabled ? `Activo · ${radar.city} · ${radar.budget} búsquedas cada 12 h${radar.to ? ` · informe a ${radar.to}` : ' · falta WHATSAPP_REPORT_TO'}` : 'Pausado (LEADS_ENABLED=false).'}</p>
                  {radar.runs.length ? <ul className="bly-list">{radar.runs.slice(0, 4).map(r => <li key={r.id}><div><span className={`bly-badge bly-badge-${r.status === 'ok' ? 'verified' : r.status === 'running' ? 'running' : 'failed'}`}>{r.status === 'ok' ? `${r.new_leads} nuevas` : r.status === 'running' ? 'Buscando…' : 'Error'}</span><p>{r.ref}</p><small>{new Date(r.started_at).toLocaleString('es-ES')}{r.sent_via ? ` · ${SENT_LABEL[r.sent_via] || r.sent_via}` : ''}{r.error ? ` · ${r.error}` : ''}</small></div>{r.status === 'ok' && r.new_leads > 0 && <div className="bly-row-actions"><button type="button" onClick={() => void openReport(r)} aria-label={`Abrir informe ${r.ref}`} title="Abrir PDF"><ExternalLink size={14} /></button></div>}</li>)}</ul> : <p className="bly-muted">Aún no hay informes. El primero sale en el próximo turno (09:00 o 21:00) o pulsa el radar.</p>}
                  {radar.leads.length > 0 && <ul className="bly-list">{radar.leads.slice(0, 8).map(l => <li key={l.id}><div><span className={`bly-badge bly-badge-${l.urgency === 'alta' ? 'failed' : l.urgency === 'media' ? 'proposed' : 'planned'}`}>Urgencia {l.urgency}</span><p>{l.request}</p><small>{l.source}{l.zone ? ` · ${l.zone}` : ''} · {l.score}/100{l.sensitive ? ' · dato sensible' : ''}</small></div><div className="bly-row-actions"><a href={l.url} target="_blank" rel="noopener noreferrer nofollow" aria-label="Abrir publicación" title="Abrir publicación"><ExternalLink size={14} /></a></div></li>)}</ul>}
                </>
              )}
              <div className="bly-section-head"><strong>Registro de actividad</strong></div>
              {status?.activity?.length ? <ul className="bly-activity">{status.activity.slice(0, 12).map(a => <li key={a.id}><Clock3 size={12} /> <span>{a.message}</span><small>{new Date(a.created_at).toLocaleString('es-ES')}</small></li>)}</ul> : <p className="bly-muted">Sin actividad registrada.</p>}
              <a className="bly-link" href="/broly">Abrir el espacio completo de BROLY <ExternalLink size={13} /></a>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function ActionCard({ action, busy, onDecide }: { action: BrolyAction; busy: boolean; onDecide: (a: BrolyAction, d: 'approve' | 'reject') => void }) {
  const summary = typeof action.result?.summary === 'string' ? action.result.summary : ''
  return (
    <div className={`bly-action bly-action-${action.status}`} data-status={action.status}>
      <div className="bly-action-head">
        <strong>{action.label}</strong>
        <span className={`bly-badge bly-badge-${action.status}`}>{busy && action.status === 'running' ? 'En ejecución…' : STATUS_LABEL[action.status] || action.status}</span>
      </div>
      <p>{action.summary}</p>
      <small>{RISK_LABEL[action.risk] || action.risk}{action.status === 'proposed' ? ` · caduca a las ${time(action.expires_at)}` : ''}</small>
      {action.verification && <small className={`bly-verify ${action.verification.ok ? 'bly-ok-text' : 'bly-err-text'}`}>{action.verification.ok ? <Check size={12} aria-label="Verificado" /> : <CircleAlert size={12} aria-label="Sin verificar" />}{action.verification.detail}</small>}
      {action.error_message && <small className="bly-err-text">{action.error_message}</small>}
      {summary && <details><summary>Ver resultado</summary><pre>{summary}</pre></details>}
      {action.status === 'proposed' && (
        <div className="bly-action-buttons">
          <button type="button" className="bly-approve" disabled={busy} onClick={() => onDecide(action, 'approve')}><Check size={14} /> Aprobar y ejecutar</button>
          <button type="button" className="bly-reject" disabled={busy} onClick={() => onDecide(action, 'reject')}><Ban size={14} /> Rechazar</button>
        </div>
      )}
    </div>
  )
}
