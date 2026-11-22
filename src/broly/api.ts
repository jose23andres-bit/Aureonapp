import { getAccessToken } from '../lib/supabase'

export type ActionStatus = 'proposed' | 'running' | 'completed' | 'verified' | 'failed' | 'rejected' | 'expired' | 'needs_connection'
export type BrolyAction = {
  id: string; conversation_id: string | null; tool: string; label: string; summary: string; risk: string; status: ActionStatus
  result: Record<string, unknown> | null; verification: { ok: boolean; detail: string; checkedAt: string } | null
  error_message: string | null; created_at: string; expires_at: string; requiresApproval: boolean
}
export type BrolyMessage = { id: string; role: 'user' | 'assistant'; content: string; metadata?: Record<string, unknown>; feedback?: number | null; created_at: string }
export type BrolyMemory = { id: string; content: string; category: string; source: 'user' | 'assistant'; scope?: 'private' | 'global'; editable?: boolean; created_at: string; updated_at: string }
export type PlanStep = { title: string; detail?: string; done: boolean }
export type BrolyTask = { id: string; title: string; task_type: string; status: string; error_message?: string | null; created_at: string; completed_at?: string | null; result?: { summary?: string } | null; input?: { steps?: PlanStep[] } | null }
export type BrolyStatus = {
  google: { connected_email?: string } | null
  tasks: BrolyTask[]
  activity: Array<{ id: number; event_type: string; message: string; created_at: string }>
  ai?: { configured: boolean; provider: string | null; model: string | null; label?: string | null; free?: boolean | null; chain?: Array<{ provider: string; label: string; model: string; free: boolean }> }
  capabilities?: Array<{ tool: string; label: string; risk: string; requiresApproval: boolean }>
  dailySummary?: { enabled: boolean }
  voice?: { premium: boolean; provider: string | null; voice: string | null; model: string | null }
}

export class BrolyApiError extends Error { constructor(message: string, public status: number) { super(message) } }

export function hasAdminSession() { return Boolean(getAccessToken()) }

export async function brolyApi<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: unknown, params: Record<string, string> = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new BrolyApiError('Inicia sesión como administrador en /admin para usar BROLY.', 401)
  const qs = new URLSearchParams({ action, ...params })
  const r = await fetch(`/.netlify/functions/broly?${qs}`, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const data = await r.json().catch(() => ({ error: 'Respuesta no válida del servidor. ¿Está desplegada la función BROLY?' }))
  if (!r.ok) throw new BrolyApiError(r.status === 401 ? 'Tu sesión ha caducado. Vuelve a iniciar sesión en /admin.' : (data.error || `Error ${r.status}`), r.status)
  return data as T
}

/** Local calendar day of the browser, same contract as phase 1. */
export function todayWindow() {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(start); end.setDate(end.getDate() + 1)
  return { dayStart: start.toISOString(), dayEnd: end.toISOString(), dayLabel: start.toLocaleDateString('es-ES') }
}
