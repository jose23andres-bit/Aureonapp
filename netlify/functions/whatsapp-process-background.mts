// Background worker (Netlify background function, up to 15 min): runs BROLY for one WhatsApp message.
// Only accepts jobs signed by the webhook (HMAC with BROLY_STATE_SECRET).
import { createHmac, timingSafeEqual } from 'node:crypto'
import { handleClient, handleOwner, type Incoming } from '../broly-core/wa-assistant'
import { sendText, waConfig } from '../broly-core/whatsapp'

export default async (req: Request) => {
  const cfg = waConfig()
  const raw = await req.text()
  const secret = process.env.BROLY_STATE_SECRET || ''
  const expected = Buffer.from(createHmac('sha256', secret).update(raw).digest('hex'))
  const got = Buffer.from(req.headers.get('x-broly-job') || '')
  if (!cfg || !secret || got.length !== expected.length || !timingSafeEqual(got, expected)) return new Response('Forbidden', { status: 403 })
  const m = JSON.parse(raw) as Incoming
  try {
    if (cfg.owner && m.from === cfg.owner) await handleOwner(cfg, m)
    else await handleClient(cfg, m)
  } catch (e) {
    console.error('[whatsapp-worker]', (e as Error).message)
    if (cfg.owner && m.from === cfg.owner) await sendText(cfg, cfg.owner, `⚠️ BROLY no ha podido procesar tu mensaje: ${(e as Error).message.slice(0, 300)}`).catch(() => null)
  }
  return new Response('done')
}
