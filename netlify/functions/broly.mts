// BROLY server function. URL unchanged from phase 1: /.netlify/functions/broly (also the Google OAuth redirect URI).
// Phase 1 actions (status, google-connect, run, speak, OAuth callback) keep the same contract.
// Phase 2+ adds: chat, conversation(s), action-decide, memories, plan-step, feedback, google-disconnect, tts (premium voice).
import { assistantInfo, chat, decideAction, deleteConversation, deleteMemory, getConversation, listMemories, saveMemory, setFeedback, updatePlanStep } from '../broly-core/assistant'
import { validState } from '../broly-core/crypto'
import { BrolyError, reply } from '../broly-core/env'
import { createAgendaTask, disconnectGoogle, executeAgendaSummary, googleConnectUrl, handleGoogleCallback, parseDayWindow } from '../broly-core/google'
import { db, log, q, requireAdmin } from '../broly-core/supabase'
import { synthesize } from '../broly-core/voice'
import { listContracts } from '../broly-core/contracts/service'
import { CATEGORIES, TEMPLATES } from '../broly-core/contracts/library'
import { queueRadar } from '../broly-core/leads/job'
import { radarConfig, radarOverview, reportForRun } from '../broly-core/leads/run'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonBody(req: Request): Promise<any> {
  const text = await req.text()
  if (text.length > 20000) throw new BrolyError('Petición demasiado grande.', 413)
  try { return text ? JSON.parse(text) : {} } catch { throw new BrolyError('JSON no válido.', 400) }
}

export default async (req: Request) => {
  try {
    const url = new URL(req.url), action = url.searchParams.get('action') || ''

    // Google OAuth redirect (no browser session here; identity comes from the signed, expiring state).
    if (req.method === 'GET' && (action === 'google-callback' || (url.searchParams.has('state') && (url.searchParams.has('code') || url.searchParams.has('error'))))) {
      const state = validState(url.searchParams.get('state') || '')
      if (!state) return reply({ error: 'Estado OAuth inválido o caducado. Vuelve a iniciar la conexión desde BROLY.' }, 400)
      return await handleGoogleCallback(req, state.userId)
    }

    if (req.method !== 'GET' && req.method !== 'POST') return reply({ error: 'Método no permitido.' }, 405)
    const user = await requireAdmin(req)
    const isGet = req.method === 'GET', isPost = req.method === 'POST'

    if (action === 'status' && isGet) {
      const [connections, tasks, activity] = await Promise.all([
        db(`broly_connections?user_id=eq.${q(user.id)}&provider=eq.google&select=connected_email,connected_at,scopes`),
        db(`broly_tasks?user_id=eq.${q(user.id)}&select=id,title,task_type,status,error_message,created_at,completed_at,result,input&order=created_at.desc&limit=20`),
        db(`broly_activity?user_id=eq.${q(user.id)}&select=id,event_type,message,created_at,task_id&order=created_at.desc&limit=30`),
      ])
      return reply({ google: connections[0] || null, tasks, activity, ...assistantInfo() })
    }
    if (action === 'google-connect' && isGet) return reply({ url: googleConnectUrl(req, user) })
    if (action === 'google-disconnect' && isPost) { await disconnectGoogle(user.id); return reply({ ok: true }) }

    if (action === 'run' && isPost) {
      const body = await jsonBody(req)
      if (body?.taskType !== 'agenda-summary') return reply({ error: 'Tipo de tarea no admitido.' }, 400)
      const dayWindow = parseDayWindow(body)
      if (!dayWindow) return reply({ error: 'Ventana horaria inválida.' }, 400)
      const taskId = await createAgendaTask(user.id, 'Resumen de agenda y correo de hoy', 'panel')
      try { return reply({ task: await executeAgendaSummary(user, taskId, dayWindow) }) } catch (error) { return reply({ error: error instanceof Error ? error.message : 'La tarea falló.', taskId }, 502) }
    }
    if (action === 'speak' && isPost) {
      const body = await jsonBody(req)
      const text = String(body?.text || '').trim().slice(0, 3000)
      if (!text) return reply({ error: 'Escribe una instrucción.' }, 400)
      const rows = await db('broly_tasks', { method: 'POST', body: JSON.stringify({ user_id: user.id, title: text.slice(0, 180), task_type: 'general', status: 'completed', input: { text }, result: { message: 'Instrucción registrada. Para conversar y proponer acciones usa la libélula BROLY.' }, completed_at: new Date().toISOString() }) })
      await log(user.id, 'instruction_logged', 'Instrucción registrada; no se han ejecutado acciones externas.', rows[0]?.id)
      return reply({ message: 'He registrado tu instrucción. No he enviado mensajes ni modificado eventos. Para conversar conmigo y proponer acciones, abre la libélula BROLY.' })
    }

    if (action === 'chat' && isPost) return reply(await chat(user, await jsonBody(req)))
    if (action === 'conversation' && isGet) return reply(await getConversation(user, url.searchParams.get('id')))
    if (action === 'conversations' && isGet) return reply({ conversations: await db(`broly_conversations?user_id=eq.${q(user.id)}&select=id,title,created_at,updated_at&order=updated_at.desc&limit=20`) })
    if (action === 'conversation-delete' && isPost) return reply(await deleteConversation(user, (await jsonBody(req))?.id))
    if (action === 'action-decide' && isPost) return reply(await decideAction(user, await jsonBody(req)))
    if (action === 'memories' && isGet) return reply(await listMemories(user))
    if (action === 'memory-save' && isPost) return reply(await saveMemory(user, await jsonBody(req)))
    if (action === 'memory-delete' && isPost) return reply(await deleteMemory(user, (await jsonBody(req))?.id))
    if (action === 'plan-step' && isPost) return reply(await updatePlanStep(user, await jsonBody(req)))
    if (action === 'feedback' && isPost) return reply(await setFeedback(user, await jsonBody(req)))
    if (action === 'contracts' && isGet) return reply(await listContracts(user))
    if (action === 'contract-templates' && isGet) return reply({ categories: CATEGORIES, templates: TEMPLATES.map(t => ({ id: t.id, title: t.title, category: t.category, summary: t.summary })) })
    if (action === 'tts' && isPost) return await synthesize(user, await jsonBody(req))
    if (action === 'radar' && isGet) return reply(await radarOverview())
    if (action === 'radar-run' && isPost) {
      if (!radarConfig().key) return reply({ error: 'Falta BRAVE_SEARCH_API_KEY en Netlify (ver docs/broly, sección 10).' }, 503)
      const status = await queueRadar(url.origin, 'manual')
      await log(user.id, 'radar_queued', 'Radar BROLY lanzado a mano desde el panel.')
      return reply({ queued: status === 202 || status === 200, status })
    }
    if (action === 'radar-report' && isGet) {
      const { bytes, ref } = await reportForRun(url.searchParams.get('run') || '')
      return new Response(bytes as BodyInit, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${ref}.pdf"`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
    }

    return reply({ error: 'Acción no encontrada.' }, 404)
  } catch (error) {
    if (error instanceof BrolyError) return reply({ error: error.message }, error.status)
    return reply({ error: 'Error interno de BROLY.' }, 500)
  }
}
