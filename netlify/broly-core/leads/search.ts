/// <reference types="node" />
// Brave Search API (official, paid per request, $5 free credit/month). Reads titles and snippets of
// public pages that Brave has already indexed: no portal is visited or scraped.
import { BrolyError } from '../env'

export type SearchHit = { url: string; title: string; snippet: string; age: string | null; query: string; category: string }

const strip = (s: unknown) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

export async function braveSearch(key: string, q: string, category: string, freshness = 'pw'): Promise<SearchHit[]> {
  const u = new URL('https://api.search.brave.com/res/v1/web/search')
  u.search = new URLSearchParams({ q, country: 'ES', search_lang: 'es', count: '20', freshness, extra_snippets: 'true', safesearch: 'moderate' }).toString()
  const r = await fetch(u, { headers: { Accept: 'application/json', 'X-Subscription-Token': key }, signal: AbortSignal.timeout(12000) })
  if (r.status === 401 || r.status === 403) throw new BrolyError('Brave Search ha rechazado la clave (BRAVE_SEARCH_API_KEY).', 502)
  if (r.status === 429) throw new BrolyError('Brave Search: límite de peticiones o de crédito alcanzado.', 429)
  if (!r.ok) throw new BrolyError(`Brave Search respondió ${r.status}.`, 502)
  const d = await r.json() as { web?: { results?: Array<{ url?: string; title?: string; description?: string; extra_snippets?: string[]; age?: string; page_age?: string }> } }
  return (d.web?.results || []).filter(x => x.url && /^https:\/\//.test(x.url)).map(x => ({
    url: String(x.url), title: strip(x.title).slice(0, 200), snippet: strip([x.description, ...(x.extra_snippets || [])].join(' · ')).slice(0, 900),
    age: x.page_age || x.age || null, query: q, category,
  }))
}

/** Runs queries with limited concurrency and a small pause, so the plan's rate limit is respected. */
export async function searchAll(key: string, queries: Array<{ q: string; category: string }>, opts: { concurrency?: number; freshness?: string; pauseMs?: number } = {}) {
  const hits: SearchHit[] = []
  const errors: string[] = []
  let i = 0, done = 0
  const worker = async () => {
    while (i < queries.length) {
      const job = queries[i++]
      done++
      try { hits.push(...await braveSearch(key, job.q, job.category, opts.freshness)) } catch (e) { errors.push(`${job.q}: ${(e as Error).message}`); if ((e as BrolyError).status === 429) i = queries.length }
      if (opts.pauseMs) await new Promise(r => setTimeout(r, opts.pauseMs))
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, opts.concurrency || 2) }, worker))
  return { hits, errors, requests: done }
}
