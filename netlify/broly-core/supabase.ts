/// <reference types="node" />
import { BrolyError, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env'

export type User = { id: string; email?: string }

export function bearer(req: Request) {
  return (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
}

/** Validates the Supabase session token sent by the browser (same session used by /admin). */
export async function getUser(token: string): Promise<User | null> {
  if (!token) return null
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(7000) })
  if (!r.ok) return null
  return await r.json() as User
}

/** Same allowlist check used by phase 1: the user's own token must be able to read its row in admin_allowlist. */
export async function isAdmin(user: User, token: string) {
  if (!user.email) return false
  const r = await fetch(`${SUPABASE_URL}/rest/v1/admin_allowlist?email=eq.${encodeURIComponent(user.email)}&select=email`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(7000) })
  if (!r.ok) return false
  const rows = await r.json() as Array<{ email: string }>
  return rows.some(x => x.email.toLowerCase() === user.email!.toLowerCase())
}

/** Authenticates and authorizes the request. Throws BrolyError(401/403). */
export async function requireAdmin(req: Request): Promise<User> {
  const token = bearer(req)
  const user = await getUser(token)
  if (!user) throw new BrolyError('Inicia sesión con tu cuenta administradora de AUREON.', 401)
  if (!await isAdmin(user, token)) throw new BrolyError('Acceso restringido al administrador autorizado.', 403)
  return user
}

/** Server key: legacy service_role JWT or new sb_secret_ key (SUPABASE_SECRET_KEY takes precedence). */
export function serviceKey() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new BrolyError('Falta configurar SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SECRET_KEY) en los secretos de Netlify.', 503)
  return key.trim()
}

/** New sb_secret_ keys are not JWTs: Supabase rejects them in "Authorization: Bearer". Send them only as apikey. */
export function serviceHeaders(): Record<string, string> {
  const key = serviceKey()
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` }
}

function dbHeaders() {
  return { ...serviceHeaders(), 'Content-Type': 'application/json' }
}

/** PostgREST call with the service role. Only used server-side, always scoped by user_id in the query. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function db<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...dbHeaders(), Prefer: 'return=representation', ...(init.headers || {}) }, signal: AbortSignal.timeout(9000) })
  const text = await r.text()
  let body: unknown
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!r.ok) {
    const b = body as { message?: string; hint?: string } | null
    const missing = typeof b?.message === 'string' && /schema cache|does not exist/i.test(b.message)
    const badKey = r.status === 401 || /invalid api key|jwt/i.test(String(b?.message || ''))
    if (badKey) throw new BrolyError('Supabase rechaza la clave de servidor. Revisa SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY en Netlify (debe ser la clave secret o service_role del proyecto picvzxqkacgiyqflhpys).', 503)
    console.error('[broly] supabase', r.status, path.split('?')[0], String(b?.message || '').slice(0, 160))
    throw new BrolyError(missing ? 'Faltan tablas o columnas de BROLY en Supabase. Aplica las migraciones pendientes (PEGAR-EN-SUPABASE.sql, ver docs/broly).' : 'La base de datos ha rechazado la operación. Revisa el registro de la función en Netlify.', missing ? 503 : 500)
  }
  return body as T
}

export const q = encodeURIComponent

export async function log(userId: string, eventType: string, message: string, taskId?: string | null, metadata: Record<string, unknown> = {}) {
  await db('broly_activity', { method: 'POST', body: JSON.stringify({ user_id: userId, event_type: eventType, message: message.slice(0, 500), task_id: taskId || null, metadata }) })
}

/** Service-role lookup used only by the scheduled job (no browser session available there). */
export async function adminUserById(userId: string): Promise<User | null> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${q(userId)}`, { headers: serviceHeaders(), signal: AbortSignal.timeout(7000) })
  // The Auth Admin API may require the legacy service_role JWT; say so instead of failing silently.
  if ((r.status === 401 || r.status === 403) && serviceKey().startsWith('sb_secret_')) throw new BrolyError('La tarea programada requiere la clave JWT service_role de Supabase para Auth Admin; la clave sb_secret_ solo sirve para la Data API.', 503)
  if (!r.ok) return null
  const u = await r.json() as User
  if (!u.email) return null
  const rows = await db<Array<{ email: string }>>(`admin_allowlist?email=eq.${q(u.email)}&select=email`)
  return rows.some(x => x.email.toLowerCase() === u.email!.toLowerCase()) ? u : null
}
