/// <reference types="node" />
import { createHash, randomBytes } from 'node:crypto'
import { BrolyError } from '../env'
import { db, log, q, type User } from '../supabase'
import { normPhone, sendContract, sendText, waConfig } from '../whatsapp'
import { allFields, getTemplate, findTemplate, type Template } from './library'
import { missingFields, renderContract, type Acceptance } from './pdf'

export type ContractRow = { id: string; user_id: string; ref: string; template_id: string; title: string; data: Record<string, string>; status: 'draft' | 'sent' | 'completed' | 'cancelled'; token_hash: string; client_name: string | null; client_phone: string | null; client_email: string | null; owner_role: string | null; sent_via: string | null; acceptance: Acceptance | null; created_at: string; sent_at: string | null; completed_at: string | null; expires_at: string }

const sha = (s: string) => createHash('sha256').update(s).digest('hex')
const siteUrl = () => (process.env.URL || 'https://aureonaiproject.netlify.app').replace(/\/+$/, '')
const nowEs = (d: Date | string = new Date()) => new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(new Date(d))
const clean = (v: unknown) => Array.from(String(v ?? ''), ch => (ch.charCodeAt(0) < 32 ? ' ' : ch)).join('').trim().slice(0, 1500)

/** AUREON's own legal data (set once in Netlify) is pre-filled into the party AUREON plays. */
function ownerData(role: string | null): Record<string, string> {
  if (!role) return {}
  const e = process.env
  return Object.fromEntries(Object.entries({ [`${role}_nombre`]: e.AUREON_LEGAL_NAME, [`${role}_doc`]: e.AUREON_LEGAL_ID, [`${role}_domicilio`]: e.AUREON_LEGAL_ADDRESS, [`${role}_contacto`]: e.AUREON_LEGAL_CONTACT }).filter(([, v]) => v)) as Record<string, string>
}

export function resolveTemplate(idOrText: string): Template {
  const t = getTemplate(idOrText) || findTemplate(idOrText)
  if (!t) throw new BrolyError('No encuentro un modelo de contrato para eso. Pide la lista de contratos disponibles.', 400)
  return t
}

export type ContractInput = { template: string; clientName?: string; clientPhone?: string; clientEmail?: string; ownerRole?: string; clientRole?: string; data?: Record<string, unknown>; send?: boolean }

export async function createContract(user: User, input: ContractInput) {
  const t = resolveTemplate(input.template)
  const keys = new Set(allFields(t).map(f => f.key))
  const ownerRole = input.ownerRole && t.parties.some(p => p.role === input.ownerRole) ? input.ownerRole : null
  const clientRole = input.clientRole && t.parties.some(p => p.role === input.clientRole) ? input.clientRole : t.parties.find(p => p.role !== ownerRole)?.role || null
  const data: Record<string, string> = { ...ownerData(ownerRole) }
  for (const [k, v] of Object.entries(input.data || {})) if (keys.has(k) && clean(v)) data[k] = clean(v)
  if (clientRole && input.clientName && !data[`${clientRole}_nombre`]) data[`${clientRole}_nombre`] = clean(input.clientName)
  if (clientRole && (input.clientPhone || input.clientEmail) && !data[`${clientRole}_contacto`]) data[`${clientRole}_contacto`] = [input.clientEmail ? clean(input.clientEmail) : '', input.clientPhone ? `+${normPhone(input.clientPhone)}` : ''].filter(Boolean).join(' · ')
  if (!data.fecha) data.fecha = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(new Date())
  const token = randomBytes(24).toString('base64url')
  const count = await db<Array<{ id: string }>>(`broly_contracts?user_id=eq.${q(user.id)}&select=id`).catch(() => [])
  const ref = `AUR-CT-${new Date().getFullYear()}-${String(count.length + 1).padStart(4, '0')}`
  const rows = await db<ContractRow[]>('broly_contracts', { method: 'POST', body: JSON.stringify({ user_id: user.id, ref, template_id: t.id, title: t.title, data, status: 'draft', token_hash: sha(token), client_name: input.clientName ? clean(input.clientName) : null, client_phone: input.clientPhone ? normPhone(input.clientPhone) : null, client_email: input.clientEmail ? clean(input.clientEmail) : null, owner_role: ownerRole, expires_at: new Date(Date.now() + 30 * 86400000).toISOString() }) })
  const row = rows[0]
  const link = `${siteUrl()}/contrato/${token}`
  await log(user.id, 'contract_created', `Contrato preparado: ${t.title} (${ref}).`, null, { contractId: row.id, template: t.id })
  let sent: { via: string } | null = null, sendError = ''
  if (input.send && row.client_phone) {
    const cfg = waConfig()
    try {
      if (!cfg) throw new BrolyError('WhatsApp no está configurado (WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID).', 503)
      const pdf = await renderContract(t, data, { ref, mode: 'draft', fillUrl: link, owner: ownerRole ? { at: nowEs(), by: user.email || 'administrador' } : undefined })
      sent = await sendContract(cfg, row.client_phone, pdf, `${ref}.pdf`, { clientName: row.client_name || '', title: t.title, link })
      await db(`broly_contracts?id=eq.${q(row.id)}`, { method: 'PATCH', body: JSON.stringify({ status: 'sent', sent_via: `whatsapp-${sent.via}`, sent_at: new Date().toISOString() }) })
      await log(user.id, 'contract_sent', `Contrato ${ref} enviado por WhatsApp.`, null, { contractId: row.id, via: sent.via })
    } catch (e) { sendError = (e as Error).message; await log(user.id, 'contract_send_failed', `No se pudo enviar ${ref} por WhatsApp.`, null, { reason: sendError.slice(0, 180) }) }
  }
  return { id: row.id, ref, title: t.title, link, missing: missingFields(t, data).length, sent: Boolean(sent), sentVia: sent?.via || null, sendError: sendError || null }
}

export async function listContracts(user: User) {
  const rows = await db<ContractRow[]>(`broly_contracts?user_id=eq.${q(user.id)}&select=id,ref,title,template_id,status,client_name,client_phone,created_at,sent_at,completed_at&order=created_at.desc&limit=50`)
  return { contracts: rows }
}

async function byToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) throw new BrolyError('Enlace de contrato no válido.', 404)
  const rows = await db<ContractRow[]>(`broly_contracts?token_hash=eq.${sha(token)}&select=*`)
  const c = rows[0]
  if (!c || c.status === 'cancelled') throw new BrolyError('Este contrato no existe o ha sido anulado.', 404)
  if (c.status !== 'completed' && new Date(c.expires_at).getTime() < Date.now()) throw new BrolyError('El enlace ha caducado. Pide uno nuevo.', 410)
  return { c, t: getTemplate(c.template_id)! }
}

/** Public view for the client: only this contract, only what is needed to complete it. */
export async function publicContract(token: string) {
  const { c, t } = await byToken(token)
  return { ref: c.ref, title: t.title, summary: t.summary, law: t.law, status: c.status, parties: t.parties, fields: allFields(t).map(f => ({ ...f, value: c.data[f.key] || '' })), clauses: t.clauses.map(([h, b]) => [h, b]), completedAt: c.completed_at }
}

export async function contractPdf(token: string) {
  const { c, t } = await byToken(token)
  return { bytes: await renderContract(t, c.data, { ref: c.ref, mode: c.status === 'completed' ? 'final' : 'draft', fillUrl: `${siteUrl()}/contrato/${token}`, acceptance: c.acceptance || undefined, owner: c.owner_role ? { at: nowEs(c.created_at), by: 'AUREON' } : undefined }), ref: c.ref }
}

export async function completeContract(token: string, body: { values?: Record<string, unknown>; signerName?: unknown; signerDoc?: unknown; accept?: unknown }, meta: { ip: string; userAgent: string }) {
  const { c, t } = await byToken(token)
  if (c.status === 'completed') throw new BrolyError('Este contrato ya está firmado.', 409)
  if (body.accept !== true) throw new BrolyError('Debe aceptar el contrato para firmarlo.', 400)
  const name = clean(body.signerName).slice(0, 120)
  if (name.length < 3) throw new BrolyError('Escriba su nombre completo como firma.', 400)
  const data = { ...c.data }
  for (const f of allFields(t)) { const v = clean(body.values?.[f.key]); if (!data[f.key]?.trim() && v) data[f.key] = v } // pre-filled values cannot be altered by the client
  const missing = missingFields(t, data)
  if (missing.length) throw new BrolyError(`Faltan datos obligatorios: ${missing.slice(0, 4).map(f => f.label).join(', ')}${missing.length > 4 ? '…' : ''}.`, 400)
  const hash = sha(JSON.stringify({ template: t.id, ref: c.ref, data }))
  const acceptance: Acceptance = { name, doc: clean(body.signerDoc).slice(0, 40) || undefined, at: nowEs(), ip: meta.ip.slice(0, 64), userAgent: meta.userAgent.slice(0, 200), hash }
  const rows = await db<ContractRow[]>(`broly_contracts?id=eq.${q(c.id)}&status=neq.completed`, { method: 'PATCH', body: JSON.stringify({ data, status: 'completed', acceptance, completed_at: new Date().toISOString() }) })
  if (!rows.length) throw new BrolyError('Este contrato ya está firmado.', 409)
  await log(c.user_id, 'contract_signed', `Contrato ${c.ref} firmado por ${name}.`, null, { contractId: c.id, hash })
  const cfg = waConfig()
  if (cfg?.owner) await sendText(cfg, cfg.owner, `✅ BROLY: ${name} ha firmado el contrato ${c.ref} (${t.title}). PDF firmado: ${siteUrl()}/.netlify/functions/contract?token=${token}&pdf=1`).catch(() => null)
  return { ok: true, ref: c.ref, hash }
}
