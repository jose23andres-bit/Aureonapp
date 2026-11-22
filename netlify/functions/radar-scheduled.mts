// Radar BROLY: every 12 h (07:00 and 19:00 UTC = 09:00/21:00 Madrid in summer, 08:00/20:00 in winter).
// Scheduled functions are limited to 30 s, so it only queues a signed job for radar-background.
import { queueRadar } from '../broly-core/leads/job'
import { radarConfig } from '../broly-core/leads/run'

export default async () => {
  const cfg = radarConfig()
  if (!cfg.enabled) return new Response('Radar BROLY desactivado (falta BRAVE_SEARCH_API_KEY o LEADS_ENABLED=false).', { status: 200 })
  const origin = process.env.URL || process.env.DEPLOY_PRIME_URL || ''
  if (!origin) return new Response('Falta la URL del sitio.', { status: 500 })
  const status = await queueRadar(origin, 'schedule').catch(e => `error ${(e as Error).message}`)
  return new Response(`Radar BROLY en cola (${status}).`, { status: 200 })
}

export const config = { schedule: '0 7,19 * * *' }
