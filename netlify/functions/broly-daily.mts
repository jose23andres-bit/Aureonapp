// Optional background job: daily agenda + mail summary (Netlify Scheduled Function).
// DISABLED unless BROLY_DAILY_SUMMARY_ENABLED=true is set in Netlify. Read-only Google access,
// only for Google connections whose Supabase user is still in admin_allowlist.
// Schedule is UTC: 05:00 UTC = 07:00 Madrid (summer) / 06:00 Madrid (winter).
import { createAgendaTask, executeAgendaSummary, madridDayWindow } from '../broly-core/google'
import { adminUserById, db, log } from '../broly-core/supabase'

async function retention() {
  // Optional data-retention policy: BROLY_RETENTION_DAYS=180 deletes chat messages and activity older than that.
  const days = Number(process.env.BROLY_RETENTION_DAYS)
  if (!Number.isFinite(days) || days < 7) return 0
  const before = new Date(Date.now() - days * 86400000).toISOString()
  const [m, a] = await Promise.all([
    db<unknown[]>(`broly_messages?created_at=lt.${encodeURIComponent(before)}`, { method: 'DELETE' }),
    db<unknown[]>(`broly_activity?created_at=lt.${encodeURIComponent(before)}`, { method: 'DELETE' }),
  ])
  return (m?.length || 0) + (a?.length || 0)
}

export default async () => {
  const purged = await retention().catch(() => 0)
  if (process.env.BROLY_DAILY_SUMMARY_ENABLED !== 'true') return new Response(`BROLY daily summary disabled${purged ? ` · ${purged} registros antiguos eliminados` : ''}`, { status: 200 })
  const connections = await db<Array<{ user_id: string }>>('broly_connections?provider=eq.google&select=user_id&limit=5')
  const window = madridDayWindow()
  let done = 0
  for (const c of connections) {
    const user = await adminUserById(c.user_id).catch(() => null)
    if (!user) continue
    try {
      const taskId = await createAgendaTask(user.id, 'Resumen diario automático de agenda y correo', 'schedule')
      await executeAgendaSummary(user, taskId, window)
      done++
    } catch (e) {
      await log(user.id, 'schedule_failed', 'El resumen diario programado ha fallado.', null, { reason: (e as Error).message.slice(0, 180) }).catch(() => {})
    }
  }
  return new Response(`BROLY daily summary: ${done} completed`, { status: 200 })
}

export const config = { schedule: '0 5 * * *' }
