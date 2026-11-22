// @vitest-environment node
/// <reference types="node" />
import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { CATEGORIES, COMMON_CLAUSES, TEMPLATES, allFields, findTemplate } from '../../netlify/broly-core/contracts/library'
import { ansi, missingFields, renderContract } from '../../netlify/broly-core/contracts/pdf'
import contractFn from '../../netlify/functions/contract.mts'
import waFn from '../../netlify/functions/whatsapp.mts'
import workerFn from '../../netlify/functions/whatsapp-process-background.mts'
import brolyFn from '../../netlify/functions/broly.mts'
import { ADMIN, createBackend, req } from './test-utils/fake-backend'

const ENV = { SUPABASE_SERVICE_ROLE_KEY: 'service-role-test', BROLY_TOKEN_ENCRYPTION_KEY: 'a'.repeat(64), BROLY_STATE_SECRET: 'state-secret', URL: 'https://aureon.test',
  WHATSAPP_TOKEN: 'wa-token', WHATSAPP_PHONE_NUMBER_ID: '111', WHATSAPP_APP_SECRET: 'app-secret', WHATSAPP_VERIFY_TOKEN: 'verify-me', WHATSAPP_OWNER_NUMBER: '+34 600 000 001', BROLY_OWNER_USER_ID: ADMIN.id,
  AUREON_LEGAL_NAME: 'José Andrés Gómez', AUREON_LEGAL_ID: '00000000T', AUREON_LEGAL_CONTACT: 'aureon@ejemplo.es' }
let be: ReturnType<typeof createBackend>
beforeEach(() => { Object.assign(process.env, ENV); delete process.env.OPENAI_API_KEY; delete process.env.WHATSAPP_CONTRACT_TEMPLATE; be = createBackend(); vi.stubGlobal('fetch', be.fetch) })
afterEach(() => vi.unstubAllGlobals())

const json = async (r: Response) => ({ status: r.status, body: await r.json() })
const signed = (payload: unknown) => { const raw = JSON.stringify(payload); return new Request('https://aureon.test/.netlify/functions/whatsapp', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': 'sha256=' + createHmac('sha256', 'app-secret').update(raw).digest('hex') } }) }
const waMsg = (from: string, text: string, id = `wamid.${Math.random()}`) => ({ entry: [{ changes: [{ value: { contacts: [{ wa_id: from, profile: { name: 'Juan' } }], messages: [{ id, from, timestamp: String(Math.floor(Date.now() / 1000)), type: 'text', text: { body: text } }] } }] }] })

describe('biblioteca de contratos', () => {
  it('ofrece más de 30 modelos en 11 categorías, con ids únicos', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(30)
    expect(new Set(TEMPLATES.map(t => t.id)).size).toBe(TEMPLATES.length)
    expect(new Set(TEMPLATES.map(t => t.category))).toEqual(new Set(CATEGORIES))
  })
  it('cada {{campo}} de las cláusulas existe en el modelo (ningún hueco imposible de rellenar)', () => {
    for (const t of TEMPLATES) {
      const keys = new Set(allFields(t).map(f => f.key))
      for (const [, body] of [...t.clauses, ...COMMON_CLAUSES]) for (const [, k] of body.matchAll(/\{\{(\w+)\}\}/g)) expect(keys.has(k), `${t.id}: {{${k}}}`).toBe(true)
      expect(t.law.length).toBeGreaterThan(10)
    }
  })
  it('ningún modelo repite el nombre de un campo (cada campo del PDF es único)', () => {
    for (const t of TEMPLATES) {
      const keys = allFields(t).map(f => f.key)
      expect(new Set(keys).size, t.id).toBe(keys.length)
    }
  })
  it('incluye NDA, no elusión para intermediarios, arras, villas, vehículos y RGPD', () => {
    for (const id of ['nda-unilateral', 'nda-mutuo', 'ncnda', 'arras-penitenciales', 'alquiler-villa-vacacional', 'compraventa-vehiculo', 'encargado-tratamiento']) expect(TEMPLATES.some(t => t.id === id)).toBe(true)
    expect(findTemplate('que no me salten en la operación')?.id).toBe('ncnda')
    expect(findTemplate('contrato de alquiler de la villa')?.id).toBe('alquiler-villa-vacacional')
    expect(findTemplate('vender un coche usado')?.id).toBe('compraventa-vehiculo')
  })
})

describe('PDF', () => {
  it('borrador con campos rellenables solo donde faltan datos; texto en español sin perder acentos', async () => {
    const t = TEMPLATES.find(x => x.id === 'ncnda')!
    const data = { intermediario_nombre: 'José Andrés Gómez', comision: '5 %', ciudad: 'Madrid' }
    const bytes = await renderContract(t, data, { ref: 'AUR-CT-2026-0001', mode: 'draft', fillUrl: 'https://aureon.test/contrato/x' })
    const pdf = await PDFDocument.load(bytes)
    const names = pdf.getForm().getFields().map(f => f.getName())
    expect(names.length).toBe(missingFields(t, data).length)
    expect(names).not.toContain('f_comision')
    expect(names).toContain('f_contraparte_nombre')
    expect(ansi('Compraventa «señal» — 5 € ñ')).toBe('Compraventa «señal» - 5 € ñ')
  })
  it('todos los modelos generan PDF válido', async () => {
    for (const t of TEMPLATES) expect((await renderContract(t, {}, { ref: 'R', mode: 'draft' })).byteLength).toBeGreaterThan(2000)
  })
})

describe('flujo completo: preparar → enviar por WhatsApp → completar → firmar', () => {
  async function prepare(extra: Record<string, unknown> = {}) {
    process.env.OPENAI_API_KEY = 'sk-test'
    be.ai.openai.push(() => ({ choices: [{ message: { content: 'Preparo el NCNDA.', tool_calls: [{ id: 'c1', type: 'function', function: { name: 'prepare_contract', arguments: JSON.stringify({ template: 'ncnda', clientName: 'Juan Pérez', clientPhone: '+34 600 111 222', ownerRole: 'intermediario', data: { comision: '5 %', operacion: 'Venta de villa en Marbella', ciudad: 'Madrid' }, ...extra }) } }] } }] }))
    const chat = await json(await brolyFn(req('chat', { body: { message: 'Hazme un contrato de no elusión para Juan' } })))
    expect(chat.body.actions[0]).toMatchObject({ tool: 'prepare_contract', status: 'proposed', requiresApproval: true })
    expect(be.tables.broly_contracts).toHaveLength(0) // nothing happens before approval
    return chat.body.actions[0].id
  }

  it('sin aprobación no se crea ni envía nada; al aprobar, cliente dentro de 24 h → documento por WhatsApp', async () => {
    be.tables.broly_wa_inbox.push({ id: 1, wa_message_id: 'x', from_phone: '34600111222', body: 'hola', direction: 'in', created_at: new Date().toISOString() })
    const id = await prepare()
    const r = await json(await brolyFn(req('action-decide', { body: { actionId: id, decision: 'approve' } })))
    expect(r.body.action.status).toBe('verified')
    const c = be.tables.broly_contracts[0]
    expect(c).toMatchObject({ status: 'sent', sent_via: 'whatsapp-session', client_phone: '34600111222', template_id: 'ncnda' })
    expect((c.data as Record<string, string>).intermediario_nombre).toBe('José Andrés Gómez') // AUREON legal data pre-filled
    const sent = be.calls.filter(x => x.url.includes('graph.facebook.com'))
    expect(sent.map(x => x.url.split('/').pop())).toEqual(['media', 'messages'])
    expect((sent[1].body as { type: string }).type).toBe('document')
    expect(String(r.body.action.result.summary)).toMatch(/https:\/\/aureon\.test\/contrato\/[A-Za-z0-9_-]{30,}/)
    expect(c.token_hash).not.toContain(String(r.body.action.result.link).split('/').pop()) // only the hash is stored
  })

  it('cliente fuera de 24 h y sin plantilla: lo explica y deja el enlace para compartir', async () => {
    const id = await prepare()
    const r = await json(await brolyFn(req('action-decide', { body: { actionId: id, decision: 'approve' } })))
    expect(be.tables.broly_contracts[0].status).toBe('draft')
    expect(r.body.action.result.summary).toMatch(/No enviado: .*24 h/)
  })

  it('con plantilla aprobada fuera de 24 h usa el mensaje de plantilla con el PDF en la cabecera', async () => {
    process.env.WHATSAPP_CONTRACT_TEMPLATE = 'contrato_aureon'
    const id = await prepare()
    await brolyFn(req('action-decide', { body: { actionId: id, decision: 'approve' } }))
    const msg = be.calls.filter(x => x.url.endsWith('/messages'))[0].body as { type: string; template: { name: string } }
    expect(msg).toMatchObject({ type: 'template', template: { name: 'contrato_aureon' } })
  })

  it('el cliente completa lo que falta y firma; no puede cambiar lo ya rellenado; queda el registro y se avisa al dueño', async () => {
    const id = await prepare({ send: false })
    const link = (await json(await brolyFn(req('action-decide', { body: { actionId: id, decision: 'approve' } })))).body.action.result.link as string
    const token = link.split('/').pop()!
    const view = await json(await contractFn(new Request(`https://aureon.test/.netlify/functions/contract?token=${token}`)))
    expect(view.status).toBe(200)
    expect(view.body.fields.find((f: { key: string }) => f.key === 'comision').value).toBe('5 %')
    expect(JSON.stringify(view.body)).not.toContain('token_hash')
    const values = Object.fromEntries(view.body.fields.filter((f: { value: string }) => !f.value).map((f: { key: string }) => [f.key, `valor ${f.key}`]))
    values.comision = '0 %' // attempt to tamper a pre-filled value
    const bad = await json(await contractFn(new Request('https://aureon.test/x', { method: 'POST', body: JSON.stringify({ token, values, signerName: 'Juan Pérez', signerDoc: '1X', accept: false }) })))
    expect(bad.status).toBe(400)
    const ok = await json(await contractFn(new Request('https://aureon.test/x', { method: 'POST', headers: { 'x-nf-client-connection-ip': '1.2.3.4', 'user-agent': 'iPhone' }, body: JSON.stringify({ token, values, signerName: 'Juan Pérez', signerDoc: '1X', accept: true }) })))
    expect(ok.status).toBe(200)
    const c = be.tables.broly_contracts[0]
    expect(c.status).toBe('completed')
    expect((c.data as Record<string, string>).comision).toBe('5 %')
    expect(c.acceptance).toMatchObject({ name: 'Juan Pérez', ip: '1.2.3.4', hash: ok.body.hash })
    expect(be.calls.some(x => x.url.endsWith('/messages') && JSON.stringify(x.body).includes('ha firmado'))).toBe(true)
    const pdf = await contractFn(new Request(`https://aureon.test/.netlify/functions/contract?token=${token}&pdf=1`))
    expect(pdf.headers.get('content-type')).toBe('application/pdf')
    expect((await PDFDocument.load(await pdf.arrayBuffer())).getForm().getFields()).toHaveLength(0) // final, not fillable
    expect((await contractFn(new Request('https://aureon.test/x', { method: 'POST', body: JSON.stringify({ token, values, signerName: 'Otro', accept: true }) }))).status).toBe(409)
  })

  it('un token inventado no da acceso a nada', async () => {
    expect((await contractFn(new Request('https://aureon.test/x?token=inventadoinventadoinventado'))).status).toBe(404)
  })
})

describe('webhook de WhatsApp', () => {
  it('verificación de Meta solo con el token correcto', async () => {
    expect((await waFn(new Request('https://aureon.test/w?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42'))).status).toBe(200)
    expect((await waFn(new Request('https://aureon.test/w?hub.mode=subscribe&hub.verify_token=mal&hub.challenge=42'))).status).toBe(403)
  })
  it('rechaza mensajes sin la firma de Meta y no duplica reintentos', async () => {
    expect((await waFn(new Request('https://aureon.test/w', { method: 'POST', body: JSON.stringify(waMsg('34600111222', 'hola')) }))).status).toBe(401)
    const p = waMsg('34600111222', 'hola', 'wamid.same')
    expect(await (await waFn(signed(p))).text()).toBe('ok 1')
    expect(await (await waFn(signed(p))).text()).toBe('ok 0')
    expect(be.tables.broly_wa_inbox).toHaveLength(1)
  })
  it('el trabajador solo acepta trabajos firmados', async () => {
    expect((await workerFn(new Request('https://aureon.test/b', { method: 'POST', body: '{}', headers: { 'x-broly-job': 'falso' } }))).status).toBe(403)
  })
  it('el dueño habla con BROLY por WhatsApp y aprueba respondiendo «sí»', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    be.ai.openai.push(() => ({ choices: [{ message: { content: 'Te preparo un NDA mutuo.', tool_calls: [{ id: 'c', type: 'function', function: { name: 'prepare_contract', arguments: JSON.stringify({ template: 'nda-mutuo', clientName: 'Ana', send: false }) } }] } }] }))
    const job = (text: string) => { const raw = JSON.stringify({ id: `w${Math.random()}`, from: '34600000001', name: 'José', text, ts: Date.now() }); return new Request('https://aureon.test/b', { method: 'POST', body: raw, headers: { 'x-broly-job': createHmac('sha256', 'state-secret').update(raw).digest('hex') } }) }
    await workerFn(job('NDA mutuo con Ana para el proyecto de Tulum'))
    const first = be.calls.filter(x => x.url.endsWith('/messages')).pop()!.body as { text: { body: string } }
    expect(first.text.body).toMatch(/Responde \*SÍ\*/)
    await workerFn(job('Sí'))
    const second = be.calls.filter(x => x.url.endsWith('/messages')).pop()!.body as { text: { body: string } }
    expect(second.text.body).toMatch(/Hecho/)
    expect(be.tables.broly_contracts[0]).toMatchObject({ template_id: 'nda-mutuo', client_name: 'Ana' })
  })
  it('los mensajes de clientes se reenvían al dueño y no se contestan solos salvo que se active', async () => {
    const raw = JSON.stringify({ id: 'w1', from: '34611222333', name: 'Laura', text: '¿Está libre la villa Sweet en agosto?', ts: Date.now() })
    await workerFn(new Request('https://aureon.test/b', { method: 'POST', body: raw, headers: { 'x-broly-job': createHmac('sha256', 'state-secret').update(raw).digest('hex') } }))
    const msgs = be.calls.filter(x => x.url.endsWith('/messages')).map(x => x.body as { to: string; text: { body: string } })
    expect(msgs).toHaveLength(1)
    expect(msgs[0].to).toBe('34600000001')
    expect(msgs[0].text.body).toMatch(/Laura/)
  })
})
