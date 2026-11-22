// Radar BROLY worker (background function, up to 15 min). Only accepts recent jobs signed with BROLY_STATE_SECRET.
import { readJob } from '../broly-core/leads/job'
import { radarConfig, runRadar } from '../broly-core/leads/run'
import { sendText, waConfig } from '../broly-core/whatsapp'

export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const job = readJob(await req.text(), req.headers.get('x-broly-job'))
  if (!job) return new Response('Forbidden', { status: 403 })
  try {
    await runRadar(job.trigger)
  } catch (e) {
    console.error('[radar]', (e as Error).message)
    const wa = waConfig(), to = radarConfig().to
    if (wa && to && (e as { status?: number }).status !== 409) await sendText(wa, to, `⚠️ Radar BROLY no ha podido completarse: ${(e as Error).message.slice(0, 300)}`).catch(() => null)
  }
  return new Response('done')
}
