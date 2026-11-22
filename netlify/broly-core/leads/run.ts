/// <reference types="node" />
// One Radar run: search -> filter -> (optional) AI review -> only NEW leads -> PDF -> WhatsApp to the owner.
// Called every 12 h by the scheduled function (through a signed background job) or on demand.
import { BrolyError, intEnv } from '../env'
import { db, q } from '../supabase'
import { normPhone, sendReport, sendText, waConfig } from '../whatsapp'
import { aiReview } from './classify'
import { candidates, type Lead } from './filter'
import { renderLeadReport, whatsappSummary, type ReportMeta } from './report'
import { searchAll } from './search'
import { queriesForRun } from './sources'

export type RunRow = { id: string; ref: string; status: string; started_at: string; finished_at: string | null; requests: number; hits: number; new_leads: number; ai_used: boolean; sent_via: string | null; error: string | null; trigger: string }

export function radarConfig(env: NodeJS.ProcessEnv = process.env) {
  const key = env.BRAVE_SEARCH_API_KEY || ''
  return {
    key, enabled: Boolean(key) && env.LEADS_ENABLED !== 'false',
    city: (env.LEADS_CITY || 'Madrid').slice(0, 40),
    budget: intEnv('LEADS_MAX_QUERIES', 16, 1, 60),
    freshness: ['pd', 'pw', 'pm'].includes(env.LEADS_FRESHNESS || '') ? String(env.LEADS_FRESHNESS) : 'pw',
    categories: (env.LEADS_CATEGORIES || '').split(',').map(s => s.trim()).filter(Boolean),
    maxPerReport: intEnv('LEADS_MAX_PER_REPORT', 40, 5, 120),
    retentionDays: intEnv('LEADS_RETENTION_DAYS', 30, 7, 365),
    to: normPhone(env.WHATSAPP_REPORT_TO || env.WHATSAPP_OWNER_NUMBER || ''),
  }
}

const madridRef = (d: Date) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d).map(x => [x.type, x.value]))
  return `RAD-${p.year}${p.month}${p.day}-${p.hour}${p.minute}`
}

async function retention(days: number) {
  const before = q(new Date(Date.now() - days * 86400000).toISOString())
  await db(`broly_leads?created_at=lt.${before}`, { method: 'DELETE' }).catch(() => null)
  await db(`broly_lead_runs?started_at=lt.${before}`, { method: 'DELETE' }).catch(() => null)
}

export async function runRadar(trigger: 'schedule' | 'manual' | 'whatsapp', opts: { send?: boolean } = {}) {
  const cfg = radarConfig()
  if (!cfg.key) throw new BrolyError('El radar necesita BRAVE_SEARCH_API_KEY en Netlify (ver docs/broly, sección 10).', 503)
  if (!cfg.enabled && trigger === 'schedule') return { skipped: 'LEADS_ENABLED=false' }
  // One run at a time: a run that is still "running" (less than 15 min old) blocks a new one.
  const busy = await db<RunRow[]>(`broly_lead_runs?status=eq.running&started_at=gte.${q(new Date(Date.now() - 15 * 60000).toISOString())}&select=id&limit=1`)
  if (busy.length) throw new BrolyError('Ya hay un radar en marcha; espera a que termine.', 409)
  const last = await db<RunRow[]>('broly_lead_runs?status=eq.ok&select=finished_at&order=finished_at.desc&limit=1')
  const now = new Date()
  const from = last[0]?.finished_at ? new Date(last[0].finished_at) : new Date(now.getTime() - 12 * 3600000)
  const ref = madridRef(now)
  const run = (await db<RunRow[]>('broly_lead_runs', { method: 'POST', body: JSON.stringify({ ref, status: 'running', trigger, started_at: now.toISOString() }) }))[0]
  try {
    await retention(cfg.retentionDays)
    const queries = queriesForRun(cfg.city, cfg.budget, now.getTime(), cfg.categories)
    const { hits, errors, requests } = await searchAll(cfg.key, queries, { concurrency: 2, freshness: cfg.freshness, pauseMs: 250 })
    if (!hits.length && errors.length && errors.length >= requests) throw new BrolyError(`Ninguna búsqueda ha funcionado: ${errors[0]}`, 502)
    let found = candidates(hits, cfg.city)
    // Only leads never reported before (URL hash already stored = already sent).
    if (found.length) {
      const seen = new Set<string>()
      for (let i = 0; i < found.length; i += 60) {
        const chunk = found.slice(i, i + 60).map(l => l.url_hash)
        for (const r of await db<Array<{ url_hash: string }>>(`broly_leads?url_hash=in.(${chunk.join(',')})&select=url_hash`)) seen.add(r.url_hash)
      }
      found = found.filter(l => !seen.has(l.url_hash))
    }
    const reviewed = await aiReview(found, Date.now() + 120000)
    const leads: Lead[] = reviewed.leads.sort((a, b) => b.score - a.score).slice(0, cfg.maxPerReport)
    if (leads.length) await db('broly_leads?on_conflict=url_hash', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(leads.map(l => ({ ...l, run_id: run.id }))) })
    const meta: ReportMeta = { city: cfg.city, from, to: now, requests, found: hits.length, aiUsed: reviewed.used, retentionDays: cfg.retentionDays, ref }
    let sentVia: string | null = null, sendError: string | null = null
    const wa = waConfig()
    if (opts.send !== false && wa && cfg.to) {
      try {
        if (leads.length) {
          const pdf = await renderLeadReport(leads, meta)
          sentVia = (await sendReport(wa, cfg.to, pdf, `${ref}.pdf`, { caption: whatsappSummary(leads, meta), date: new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'short' }).format(now), count: leads.length })).via
        } else if (Date.now() - await lastInboundSafe(cfg.to) < 23.5 * 3600000) {
          await sendText(wa, cfg.to, whatsappSummary(leads, meta)); sentVia = 'session-text'
        } else sentVia = 'none-empty' // nothing new and the window is closed: no paid template for an empty report
      } catch (e) { sendError = (e as Error).message.slice(0, 300) }
    } else if (opts.send !== false) sendError = 'WhatsApp no está configurado (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_REPORT_TO).'
    const patch = { status: 'ok', finished_at: new Date().toISOString(), requests, hits: hits.length, new_leads: leads.length, ai_used: reviewed.used, sent_via: sentVia, error: [sendError, reviewed.error && `IA: ${reviewed.error}`, errors.length ? `${errors.length} búsquedas fallidas` : null].filter(Boolean).join(' · ') || null }
    await db(`broly_lead_runs?id=eq.${q(run.id)}`, { method: 'PATCH', body: JSON.stringify(patch) })
    return { run: { ...run, ...patch }, leads }
  } catch (e) {
    await db(`broly_lead_runs?id=eq.${q(run.id)}`, { method: 'PATCH', body: JSON.stringify({ status: 'error', finished_at: new Date().toISOString(), error: (e as Error).message.slice(0, 300) }) }).catch(() => null)
    throw e
  }
}

async function lastInboundSafe(phone: string) {
  const rows = await db<Array<{ created_at: string }>>(`broly_wa_inbox?from_phone=eq.${q(phone)}&direction=eq.in&select=created_at&order=created_at.desc&limit=1`).catch(() => [])
  return rows[0] ? new Date(rows[0].created_at).getTime() : 0
}

/** PDF of a past run (admin panel). */
export async function reportForRun(runId: string) {
  const runs = await db<RunRow[]>(`broly_lead_runs?id=eq.${q(runId)}&select=*`)
  if (!runs[0]) throw new BrolyError('Informe no encontrado.', 404)
  const leads = await db<Lead[]>(`broly_leads?run_id=eq.${q(runId)}&select=*&order=score.desc`)
  const r = runs[0]
  const to = new Date(r.finished_at || r.started_at)
  const cfg = radarConfig()
  return { bytes: await renderLeadReport(leads, { city: cfg.city, from: new Date(to.getTime() - 12 * 3600000), to, requests: r.requests, found: r.hits, aiUsed: r.ai_used, retentionDays: cfg.retentionDays, ref: r.ref }), ref: r.ref }
}

export async function radarOverview() {
  const cfg = radarConfig()
  const [runs, leads] = await Promise.all([
    db<RunRow[]>('broly_lead_runs?select=*&order=started_at.desc&limit=10').catch(() => []),
    db<Array<Lead & { id: string; created_at: string }>>('broly_leads?select=id,url,source,category,request,zone,urgency,score,created_at,sensitive&order=created_at.desc&limit=30').catch(() => []),
  ])
  return { configured: Boolean(cfg.key), enabled: cfg.enabled, city: cfg.city, budget: cfg.budget, to: cfg.to ? `+${cfg.to.slice(0, 4)}•••${cfg.to.slice(-3)}` : null, runs, leads }
}
