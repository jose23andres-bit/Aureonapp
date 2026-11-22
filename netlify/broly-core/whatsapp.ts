/// <reference types="node" />
// WhatsApp Business Platform (Cloud API, official). No unofficial clients: they risk banning the number.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { BrolyError } from './env'
import { db, q } from './supabase'

export type WAConfig = { token: string; phoneId: string; version: string; appSecret: string; verifyToken: string; owner: string; ownerUserId: string; template: string; templateLang: string }

export const normPhone = (p: string) => String(p || '').replace(/[^\d]/g, '').replace(/^00/, '')

export function waConfig(env: NodeJS.ProcessEnv = process.env): WAConfig | null {
  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) return null
  return { token: env.WHATSAPP_TOKEN, phoneId: env.WHATSAPP_PHONE_NUMBER_ID, version: env.WHATSAPP_GRAPH_VERSION || 'v25.0', appSecret: env.WHATSAPP_APP_SECRET || '', verifyToken: env.WHATSAPP_VERIFY_TOKEN || '', owner: normPhone(env.WHATSAPP_OWNER_NUMBER || ''), ownerUserId: env.BROLY_OWNER_USER_ID || '', template: env.WHATSAPP_CONTRACT_TEMPLATE || '', templateLang: env.WHATSAPP_TEMPLATE_LANG || 'es' }
}

/** Meta signs every webhook with the App Secret (X-Hub-Signature-256). Unsigned or forged calls are rejected. */
export function validSignature(raw: string, header: string | null, secret: string) {
  if (!secret || !header?.startsWith('sha256=')) return false
  const expected = Buffer.from('sha256=' + createHmac('sha256', secret).update(raw).digest('hex'))
  const got = Buffer.from(header)
  return got.length === expected.length && timingSafeEqual(got, expected)
}

async function graph(cfg: WAConfig, path: string, init: RequestInit) {
  const r = await fetch(`https://graph.facebook.com/${cfg.version}/${path}`, { ...init, headers: { Authorization: `Bearer ${cfg.token}`, ...(init.headers || {}) }, signal: AbortSignal.timeout(15000) })
  const d = await r.json().catch(() => ({})) as { error?: { message?: string; code?: number }; id?: string; messages?: Array<{ id: string }> }
  if (!r.ok) throw new BrolyError(`WhatsApp ha rechazado la petición (${r.status}${d.error?.code ? ` · código ${d.error.code}` : ''}): ${String(d.error?.message || 'sin detalle').slice(0, 180)}`, 502)
  return d
}

export const sendText = (cfg: WAConfig, to: string, body: string) =>
  graph(cfg, `${cfg.phoneId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: normPhone(to), type: 'text', text: { body: body.slice(0, 4000), preview_url: true } }) })

export async function uploadPdf(cfg: WAConfig, bytes: Uint8Array, filename: string) {
  const fd = new FormData()
  fd.append('messaging_product', 'whatsapp'); fd.append('type', 'application/pdf')
  fd.append('file', new Blob([bytes as BlobPart], { type: 'application/pdf' }), filename)
  const d = await graph(cfg, `${cfg.phoneId}/media`, { method: 'POST', body: fd })
  if (!d.id) throw new BrolyError('WhatsApp no ha devuelto el identificador del PDF.', 502)
  return d.id
}

/** Last time this number wrote to us: free-form messages are only allowed within 24 h (Meta's customer-service window). */
export async function lastInbound(phone: string) {
  const rows = await db<Array<{ created_at: string }>>(`broly_wa_inbox?from_phone=eq.${q(normPhone(phone))}&select=created_at&order=created_at.desc&limit=1`).catch(() => [])
  return rows[0] ? new Date(rows[0].created_at).getTime() : 0
}

/**
 * Sends a report PDF to the owner. Inside the 24 h window: document + caption (no template cost).
 * Outside: approved template WHATSAPP_REPORT_TEMPLATE (header: document; body {{1}} date, {{2}} count).
 */
export async function sendReport(cfg: WAConfig, to: string, pdf: Uint8Array, filename: string, info: { caption: string; date: string; count: number }) {
  const open = Date.now() - await lastInbound(to) < 23.5 * 3600 * 1000
  const template = process.env.WHATSAPP_REPORT_TEMPLATE || ''
  if (!open && !template) throw new BrolyError('No has escrito a BROLY en las últimas 24 h y no hay plantilla aprobada (WHATSAPP_REPORT_TEMPLATE). Escríbele «hola» o crea la plantilla en Meta (ver docs/broly).', 409)
  const mediaId = await uploadPdf(cfg, pdf, filename)
  if (open) {
    await graph(cfg, `${cfg.phoneId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: normPhone(to), type: 'document', document: { id: mediaId, filename, caption: info.caption.slice(0, 1000) } }) })
    return { via: 'session' as const }
  }
  await graph(cfg, `${cfg.phoneId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: normPhone(to), type: 'template', template: { name: template, language: { code: cfg.templateLang }, components: [
    { type: 'header', parameters: [{ type: 'document', document: { id: mediaId, filename } }] },
    { type: 'body', parameters: [{ type: 'text', text: info.date.slice(0, 60) }, { type: 'text', text: String(info.count) }] },
  ] } }) })
  return { via: 'template' as const }
}

/** Sends a contract PDF + fill link. Inside the 24 h window: normal message. Outside: approved template (required by Meta). */
export async function sendContract(cfg: WAConfig, to: string, pdf: Uint8Array, filename: string, info: { clientName: string; title: string; link: string }) {
  const mediaId = await uploadPdf(cfg, pdf, filename)
  const open = Date.now() - await lastInbound(to) < 23.5 * 3600 * 1000
  if (open) {
    await graph(cfg, `${cfg.phoneId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: normPhone(to), type: 'document', document: { id: mediaId, filename, caption: `${info.title}\nPuede rellenarlo en el PDF o aquí: ${info.link}` } }) })
    return { via: 'session' as const }
  }
  if (!cfg.template) throw new BrolyError('El cliente no ha escrito en las últimas 24 h y no hay plantilla aprobada (WHATSAPP_CONTRACT_TEMPLATE). Pídele que te escriba primero o crea la plantilla en Meta (ver docs/broly).', 409)
  await graph(cfg, `${cfg.phoneId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: normPhone(to), type: 'template', template: { name: cfg.template, language: { code: cfg.templateLang }, components: [
    { type: 'header', parameters: [{ type: 'document', document: { id: mediaId, filename } }] },
    { type: 'body', parameters: [{ type: 'text', text: info.clientName.slice(0, 60) || 'cliente' }, { type: 'text', text: info.title.slice(0, 120) }, { type: 'text', text: info.link }] },
  ] } }) })
  return { via: 'template' as const }
}
