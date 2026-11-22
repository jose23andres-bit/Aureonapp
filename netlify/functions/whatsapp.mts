// WhatsApp Cloud API webhook. GET: Meta verification. POST: signed messages.
// It answers Meta within milliseconds (stores + dedupes) and hands the work to a background function.
import { createHmac } from 'node:crypto'
import { db } from '../broly-core/supabase'
import { parseWebhook } from '../broly-core/wa-assistant'
import { validSignature, waConfig } from '../broly-core/whatsapp'

export default async (req: Request) => {
  const cfg = waConfig()
  if (!cfg) return new Response('WhatsApp no configurado', { status: 503 })
  const url = new URL(req.url)
  if (req.method === 'GET') {
    const ok = url.searchParams.get('hub.mode') === 'subscribe' && cfg.verifyToken && url.searchParams.get('hub.verify_token') === cfg.verifyToken
    return ok ? new Response(url.searchParams.get('hub.challenge') || '', { status: 200 }) : new Response('Forbidden', { status: 403 })
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const raw = await req.text()
  if (!validSignature(raw, req.headers.get('x-hub-signature-256'), cfg.appSecret)) return new Response('Invalid signature', { status: 401 })
  let fresh = 0
  for (const m of parseWebhook(JSON.parse(raw || '{}'))) {
    // Dedupe: Meta retries deliveries; wa_message_id is UNIQUE, a repeat insert is ignored.
    const rows = await db<unknown[]>('broly_wa_inbox?on_conflict=wa_message_id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ wa_message_id: m.id, from_phone: m.from, from_name: m.name || null, body: m.text, direction: 'in' }) }).catch(() => [])
    if (!rows.length) continue
    fresh++
    const job = JSON.stringify(m)
    const sig = createHmac('sha256', process.env.BROLY_STATE_SECRET || '').update(job).digest('hex')
    await fetch(`${url.origin}/.netlify/functions/whatsapp-process-background`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-broly-job': sig }, body: job, signal: AbortSignal.timeout(4000) }).catch(() => null)
  }
  return new Response(`ok ${fresh}`, { status: 200 })
}
