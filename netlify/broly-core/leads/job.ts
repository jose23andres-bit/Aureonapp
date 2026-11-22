/// <reference types="node" />
// Signed hand-off to the background function (scheduled functions are cut at 30 s, background ones at 15 min).
import { createHmac, timingSafeEqual } from 'node:crypto'

export type RadarJob = { trigger: 'schedule' | 'manual'; ts: number }

const sign = (raw: string) => createHmac('sha256', process.env.BROLY_STATE_SECRET || '').update(`radar:${raw}`).digest('hex')

export async function queueRadar(origin: string, trigger: RadarJob['trigger']) {
  if (!process.env.BROLY_STATE_SECRET) throw new Error('Falta BROLY_STATE_SECRET.')
  const raw = JSON.stringify({ trigger, ts: Date.now() } satisfies RadarJob)
  const r = await fetch(`${origin.replace(/\/+$/, '')}/.netlify/functions/radar-background`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-broly-job': sign(raw) }, body: raw, signal: AbortSignal.timeout(8000) })
  return r.status
}

/** Valid signature and not older than 10 minutes (a captured job cannot be replayed later). */
export function readJob(raw: string, header: string | null): RadarJob | null {
  if (!process.env.BROLY_STATE_SECRET) return null
  const expected = Buffer.from(sign(raw)), got = Buffer.from(header || '')
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null
  try {
    const job = JSON.parse(raw) as RadarJob
    if (!['schedule', 'manual'].includes(job.trigger) || Math.abs(Date.now() - Number(job.ts)) > 10 * 60000) return null
    return job
  } catch { return null }
}
