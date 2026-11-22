// @vitest-environment node
/// <reference types="node" />
import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PDFDocument, PDFName } from 'pdf-lib'
import { candidates, heuristic, redact } from '../../netlify/broly-core/leads/filter'
import { readJob } from '../../netlify/broly-core/leads/job'
import { renderLeadReport } from '../../netlify/broly-core/leads/report'
import { runRadar } from '../../netlify/broly-core/leads/run'
import { allQueries, queriesForRun } from '../../netlify/broly-core/leads/sources'
import backgroundFn from '../../netlify/functions/radar-background.mts'
import scheduledFn, { config as scheduleConfig } from '../../netlify/functions/radar-scheduled.mts'
import workerFn from '../../netlify/functions/whatsapp-process-background.mts'
import brolyFn from '../../netlify/functions/broly.mts'
import { ADMIN, createBackend, req, type BraveResult } from './test-utils/fake-backend'

const ENV = { SUPABASE_SERVICE_ROLE_KEY: 'service-role-test', BROLY_STATE_SECRET: 'state-secret', URL: 'https://aureon.test', BRAVE_SEARCH_API_KEY: 'brave-test',
  WHATSAPP_TOKEN: 'wa-token', WHATSAPP_PHONE_NUMBER_ID: '111', WHATSAPP_APP_SECRET: 'app-secret', WHATSAPP_OWNER_NUMBER: '+34 722 705 922', WHATSAPP_REPORT_TO: '+34 722 705 922', BROLY_OWNER_USER_ID: ADMIN.id }
const CLEAN = ['OPENAI_API_KEY', 'WHATSAPP_REPORT_TEMPLATE', 'LEADS_ENABLED', 'LEADS_MAX_QUERIES']
let be: ReturnType<typeof createBackend>
beforeEach(() => { Object.assign(process.env, ENV); for (const k of CLEAN) delete process.env[k]; be = createBackend(); vi.stubGlobal('fetch', be.fetch) })
afterEach(() => vi.unstubAllGlobals())

const hit = (title: string, snippet: string, url = `https://www.forocoches.com/foro/showthread.php?t=${Math.random().toString(36).slice(2)}`, category = 'djs') => ({ url, title, snippet, age: '2026-10-18T10:00:00', query: 'q', category })
const SAMPLE: BraveResult[] = [
  { url: 'https://www.forocoches.com/foro/showthread.php?t=1', title: 'Busco DJ para boda en Madrid el 14 de noviembre', description: 'Hola, necesitamos un DJ para unos 120 invitados en Pozuelo. ¿Alguien recomienda alguno?', page_age: '2026-10-18T09:00:00' },
  { url: 'https://www.bodas.net/musica/dj-madrid', title: 'DJ para bodas en Madrid desde 300 € | Contrata ya', description: 'Ofrecemos los mejores DJ de Madrid. Presupuesto sin compromiso.' },
  { url: 'https://www.reddit.com/r/Madrid/comments/abc/', title: 'Necesito DJ urgente este sábado en Madrid', description: 'Se nos ha caído el DJ. Llamadme al 600 111 222 o escribid a juan@correo.es' },
  { url: 'https://www.facebook.com/groups/x/posts/1', title: 'Busco DJ en Madrid', description: 'Grupo de Facebook' },
]
const waMessages = () => be.calls.filter(c => c.url.endsWith('/messages')).map(c => c.body as Record<string, unknown>)
const ownerWrote = (minutesAgo = 10) => be.tables.broly_wa_inbox.push({ id: 1, wa_message_id: `w${Math.random()}`, from_phone: '34722705922', body: 'hola', direction: 'in', created_at: new Date(Date.now() - minutesAgo * 60000).toISOString() })

describe('qué busca y dónde', () => {
  it('reparte las búsquedas en turnos de 12 h dentro del crédito gratuito de Brave', () => {
    const all = allQueries('Madrid')
    expect(all.length).toBeGreaterThan(16)
    expect(new Set(all.map(q => q.category)).size).toBe(10)
    const a = queriesForRun('Madrid', 16, 0), b = queriesForRun('Madrid', 16, 12 * 3600000)
    expect(a.length).toBeLessThanOrEqual(16)
    expect(new Set([...a, ...b].map(x => x.q))).toEqual(new Set(all.map(x => x.q))) // two runs cover every query
    expect(16 * 2 * 31).toBeLessThanOrEqual(1000) // $5 free credit = 1,000 requests/month
    expect(all.some(q => q.q.includes('site:milanuncios.com')) && all.some(q => q.q.includes('wallapop')) && all.some(q => q.q.includes('idealista')) && all.some(q => q.q.includes('coches.net'))).toBe(true)
  })
  it('distingue a quien pide algo de los anuncios, profesionales y redes con login', () => {
    expect(heuristic(hit('Busco DJ para boda en Madrid el 14 de noviembre', '¿Alguien recomienda alguno?'), 'Madrid')).toMatchObject({ zone: 'Madrid', urgency: 'media' })
    expect(heuristic(hit('DJ para bodas en Madrid desde 300 € | Contrata ya', 'Ofrecemos los mejores DJ'), 'Madrid')).toBeNull()
    expect(heuristic(hit('Compro oro y relojes, pago al contado en Madrid', 'Tasación gratis', undefined, 'relojes'), 'Madrid')).toBeNull()
    expect(heuristic(hit('Busco DJ en Madrid', '', 'https://www.facebook.com/groups/1'), 'Madrid')).toBeNull()
    expect(heuristic(hit('Busco DJ para boda en Barcelona', ''), 'Madrid')).toBeNull()
    expect(heuristic(hit('Busco villa con piscina en Ibiza para 12', '', undefined, 'villas'), 'Madrid')).toMatchObject({ zone: 'Ibiza' }) // villas: any zone
    expect(heuristic(hit('Necesito DJ urgente este sábado en Pozuelo', ''), 'Madrid')).toMatchObject({ urgency: 'alta', zone: 'Pozuelo' })
  })
  it('no confunde dos hilos del mismo foro, pero sí reconoce el mismo enlace con rastreadores', () => {
    const a = hit('Busco DJ en Madrid', '', 'https://www.forocoches.com/foro/showthread.php?t=1')
    const b = hit('Busco DJ para boda en Madrid', '', 'https://www.forocoches.com/foro/showthread.php?t=2')
    const c = hit('Busco DJ en Madrid', '', 'https://forocoches.com/foro/showthread.php?t=1&utm_source=x#post5')
    expect(candidates([a, b, c], 'Madrid')).toHaveLength(2)
    expect(heuristic(a, 'Madrid')!.request).not.toMatch(/·$/)
  })
  it('oculta teléfonos, emails y usuarios: el informe apunta a la publicación, no es una ficha de personas', () => {
    expect(redact('Llamadme al 600 111 222 o +34 600-111-222, juan@correo.es, @juanito_dj')).toBe('Llamadme al [teléfono oculto] o [teléfono oculto], [email oculto], [usuario oculto]')
    expect(redact('Boda el 14/11 para 120 invitados, presupuesto 1.500 €')).toBe('Boda el 14/11 para 120 invitados, presupuesto 1.500 €')
    const l = candidates([hit('Necesito DJ urgente en Madrid', 'Llamadme al 600 111 222 o juan@correo.es')], 'Madrid')[0]
    expect(JSON.stringify(l)).not.toMatch(/600 111 222|juan@correo/)
  })
  it('la medicina estética se marca como dato sensible con un siguiente paso prudente', () => {
    const l = heuristic(hit('Busco clínica de botox en Madrid, ¿recomendación?', '', undefined, 'estetica'), 'Madrid')!
    expect(l.sensitive).toBe(true)
    expect(l.next_step).toMatch(/clínica autorizada/)
  })
})

describe('informe PDF', () => {
  it('portada, gráfico y una ficha por oportunidad con enlace pulsable; acentos correctos', async () => {
    const leads = candidates([hit('Busco DJ para boda en Madrid', '¿Alguien recomienda? Somos 120.'), hit('Necesito equipo de sonido para fiesta en Alcobendas', '', undefined, 'sonido'), hit('Busco clínica botox Madrid', '', undefined, 'estetica')], 'Madrid')
    const bytes = await renderLeadReport(leads, { city: 'Madrid', from: new Date(Date.now() - 12 * 3600000), to: new Date(), requests: 16, found: 40, aiUsed: false, retentionDays: 30, ref: 'RAD-TEST' })
    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(2)
    const annots = pdf.getPages().flatMap(p => { const a = p.node.lookup(PDFName.of('Annots')) as unknown as { size?: () => number } | undefined; return a?.size ? [a.size()] : [] })
    expect(annots.reduce((x, y) => x + y, 0)).toBe(leads.length)
    expect(pdf.getTitle()).toBe('Radar BROLY · RAD-TEST')
    const empty = await PDFDocument.load(await renderLeadReport([], { city: 'Madrid', from: new Date(), to: new Date(), requests: 16, found: 0, aiUsed: false, retentionDays: 30, ref: 'RAD-0' }))
    expect(empty.getPageCount()).toBe(1)
  })
})

describe('turno completo: buscar → filtrar → solo lo nuevo → PDF → WhatsApp', () => {
  it('con la conversación abierta envía el PDF con un resumen; el siguiente turno no repite a nadie', async () => {
    be.brave.handler = () => SAMPLE
    ownerWrote()
    const r = await runRadar('schedule') as Awaited<ReturnType<typeof runRadar>> & { leads: unknown[] }
    expect(r.leads).toHaveLength(2) // the forum post and the reddit one; the ad and Facebook are discarded
    expect(be.tables.broly_leads).toHaveLength(2)
    expect(JSON.stringify(be.tables.broly_leads)).not.toMatch(/600 111 222|juan@correo/)
    const doc = waMessages().find(m => m.type === 'document') as { to: string; document: { caption: string; filename: string } }
    expect(doc.to).toBe('34722705922')
    expect(doc.document.filename).toMatch(/^RAD-\d{8}-\d{4}\.pdf$/)
    expect(doc.document.caption).toMatch(/\*2\* personas buscando lo que ofreces en Madrid/)
    expect(be.tables.broly_lead_runs[0]).toMatchObject({ status: 'ok', new_leads: 2, sent_via: 'session' })
    expect(be.calls.filter(c => c.url.startsWith('https://api.search.brave.com')).length).toBeLessThanOrEqual(16)
    const braveCall = be.calls.find(c => c.url.startsWith('https://api.search.brave.com'))!
    expect(braveCall.headers['x-subscription-token']).toBe('brave-test')
    expect(new URL(braveCall.url).searchParams.get('country')).toBe('ES')

    be.calls.length = 0
    const again = await runRadar('schedule') as { leads: unknown[] }
    expect(again.leads).toHaveLength(0)
    expect(be.tables.broly_leads).toHaveLength(2)
    expect(waMessages()).toEqual([expect.objectContaining({ type: 'text' })]) // free text inside the window, no PDF, no template
    expect((waMessages()[0] as { text: { body: string } }).text.body).toMatch(/No hay peticiones nuevas/)
  })
  it('fuera de las 24 h sin plantilla no envía (lo deja anotado); con plantilla usa la plantilla con el PDF', async () => {
    be.brave.handler = () => SAMPLE
    await runRadar('schedule')
    expect(waMessages()).toHaveLength(0)
    expect(be.tables.broly_lead_runs[0].error).toMatch(/24 h/)
    process.env.WHATSAPP_REPORT_TEMPLATE = 'radar_broly'
    be.brave.handler = () => [{ url: 'https://www.milanuncios.com/x/busco-dj-123.htm', title: 'Busco DJ para cumpleaños en Getafe', description: 'Fiesta de 40 personas' }]
    await runRadar('schedule')
    expect(waMessages()[0]).toMatchObject({ type: 'template', template: { name: 'radar_broly', components: [{ type: 'header' }, { type: 'body' }] } })
  })
  it('la IA puede descartar y resumir, pero no saltarse el filtrado de datos personales', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    be.brave.handler = () => SAMPLE
    ownerWrote()
    be.ai.openai.push(() => ({ choices: [{ message: { content: JSON.stringify({ items: [{ id: 0, lead: true, categoria: 'inventada', que_busca: 'DJ para boda de 120 invitados en Pozuelo; contacto 699 888 777', zona: 'Pozuelo', urgencia: 'media' }, { id: 1, lead: false }] }) } }] }))
    const r = await runRadar('manual') as { leads: Array<{ request: string; category: string; ai: boolean }> }
    expect(r.leads).toHaveLength(1)
    expect(r.leads[0]).toMatchObject({ ai: true, category: 'djs' })
    expect(r.leads[0].request).toBe('DJ para boda de 120 invitados en Pozuelo; contacto [teléfono oculto]')
  })
  it('si Brave corta por límite deja de buscar y lo explica; sin clave no hace nada', async () => {
    be.brave.status = 429
    await expect(runRadar('schedule')).rejects.toThrow(/Ninguna búsqueda/)
    expect(be.calls.filter(c => c.url.startsWith('https://api.search.brave.com')).length).toBeLessThanOrEqual(2)
    delete process.env.BRAVE_SEARCH_API_KEY
    await expect(runRadar('manual')).rejects.toThrow(/BRAVE_SEARCH_API_KEY/)
  })
})

describe('programación y seguridad', () => {
  it('se programa cada 12 h y solo encola un trabajo firmado', async () => {
    expect(scheduleConfig.schedule).toBe('0 7,19 * * *')
    await scheduledFn()
    const job = be.calls.find(c => c.url === 'https://aureon.test/.netlify/functions/radar-background')!
    expect(readJob(JSON.stringify(job.body), job.headers['x-broly-job'])).toMatchObject({ trigger: 'schedule' })
    delete process.env.BRAVE_SEARCH_API_KEY; be.calls.length = 0
    expect(await (await scheduledFn()).text()).toMatch(/desactivado/)
    expect(be.calls).toHaveLength(0)
  })
  it('el trabajador rechaza trabajos sin firma o antiguos', async () => {
    const raw = JSON.stringify({ trigger: 'manual', ts: Date.now() })
    const sig = (s: string) => createHmac('sha256', 'state-secret').update(`radar:${s}`).digest('hex')
    expect((await backgroundFn(new Request('https://aureon.test/x', { method: 'POST', body: raw }))).status).toBe(403)
    const old = JSON.stringify({ trigger: 'manual', ts: Date.now() - 3600000 })
    expect((await backgroundFn(new Request('https://aureon.test/x', { method: 'POST', body: old, headers: { 'x-broly-job': sig(old) } }))).status).toBe(403)
    be.brave.handler = () => SAMPLE
    expect((await backgroundFn(new Request('https://aureon.test/x', { method: 'POST', body: raw, headers: { 'x-broly-job': sig(raw) } }))).status).toBe(200)
    expect(be.tables.broly_lead_runs[0].status).toBe('ok')
  })
  it('panel: solo el administrador ve el radar y descarga el PDF', async () => {
    be.brave.handler = () => SAMPLE
    await runRadar('manual')
    expect((await brolyFn(req('radar', { token: 'other-token' }))).status).toBe(403)
    const info = await (await brolyFn(req('radar'))).json()
    expect(info).toMatchObject({ configured: true, enabled: true, city: 'Madrid', to: '+3472•••922' })
    expect(info.leads).toHaveLength(2)
    const pdf = await brolyFn(req('radar-report', { params: { run: info.runs[0].id } }))
    expect(pdf.headers.get('content-type')).toBe('application/pdf')
    expect((await PDFDocument.load(await pdf.arrayBuffer())).getPageCount()).toBeGreaterThan(1)
    expect((await (await brolyFn(req('radar-run', { body: {} }))).json())).toMatchObject({ queued: true })
  })
  it('desde WhatsApp: escribir «informe» lanza el radar y llega el PDF', async () => {
    be.brave.handler = () => SAMPLE
    ownerWrote(1)
    const m = JSON.stringify({ id: 'w-inf', from: '34722705922', name: 'José', text: 'Informe', ts: Date.now() })
    const r = await workerFn(new Request('https://aureon.test/.netlify/functions/whatsapp-process-background', { method: 'POST', body: m, headers: { 'x-broly-job': createHmac('sha256', 'state-secret').update(m).digest('hex') } }))
    expect(r.status).toBe(200)
    expect(waMessages().map(x => x.type)).toEqual(['text', 'document'])
  })
})
