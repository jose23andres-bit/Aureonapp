/// <reference types="node" />
// Model-agnostic adapter with an ordered chain of interchangeable providers and fallback.
// No SDK dependency: plain fetch to OpenAI-compatible or Anthropic Messages endpoints.
// Each provider is tried at most once per request (no retry loops) and within a shared time budget.
import { BrolyError } from './env'

export type Provider = 'openai' | 'anthropic' | 'gemini' | 'groq' | 'openrouter' | 'omniroute' | 'pollinations'
export type AIConfig = { provider: Provider; model: string; apiKey: string; endpoint: string; protocol: 'openai' | 'anthropic'; free: boolean; label: string }
export type ToolCall = { id: string; name: string; args: Record<string, unknown> }
export type Turn =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
  | { role: 'tool'; results: Array<{ id: string; name: string; content: string }> }
export type ToolSpec = { name: string; description: string; parameters: Record<string, unknown> }
export type ModelResult = { text: string; toolCalls: ToolCall[]; usage: { input: number; output: number } }

export class ProviderError extends BrolyError {
  constructor(message: string, public provider: Provider, public httpStatus: number) { super(message, 502) }
}

const DEFAULT_ORDER: Provider[] = ['openai', 'anthropic', 'gemini', 'groq', 'openrouter', 'omniroute', 'pollinations']

/** Builds the config of one provider from env, or null if it has no credentials / is not enabled. */
export function providerConfig(p: Provider, env: NodeJS.ProcessEnv = process.env): AIConfig | null {
  const model = (fallback: string, specific?: string) => specific || fallback
  switch (p) {
    case 'openai':
      return env.OPENAI_API_KEY ? { provider: p, protocol: 'openai', free: false, label: 'OpenAI', apiKey: env.OPENAI_API_KEY, endpoint: env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions', model: model(env.OPENAI_MODEL || 'gpt-4o-mini', env.BROLY_OPENAI_MODEL) } : null
    case 'anthropic':
      return env.ANTHROPIC_API_KEY ? { provider: p, protocol: 'anthropic', free: false, label: 'Anthropic', apiKey: env.ANTHROPIC_API_KEY, endpoint: 'https://api.anthropic.com/v1/messages', model: model(env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514', env.BROLY_ANTHROPIC_MODEL) } : null
    case 'gemini': // Google AI Studio key; has a free tier with rate limits.
      // 'gemini-flash-latest' always points to a current Flash model (gemini-2.5-flash was retired for new keys).
      return env.GEMINI_API_KEY ? { provider: p, protocol: 'openai', free: true, label: 'Google Gemini', apiKey: env.GEMINI_API_KEY, endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: model('gemini-flash-latest', env.GEMINI_MODEL) } : null
    case 'groq': // Free tier with rate limits.
      return env.GROQ_API_KEY ? { provider: p, protocol: 'openai', free: true, label: 'Groq', apiKey: env.GROQ_API_KEY, endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: model('llama-3.3-70b-versatile', env.GROQ_MODEL) } : null
    case 'openrouter': // "openrouter/free" routes to currently available free models.
      return env.OPENROUTER_API_KEY ? { provider: p, protocol: 'openai', free: true, label: 'OpenRouter', apiKey: env.OPENROUTER_API_KEY, endpoint: 'https://openrouter.ai/api/v1/chat/completions', model: model('openrouter/free', env.OPENROUTER_MODEL) } : null
    case 'omniroute': // Self-hosted OmniRoute gateway (OpenAI-compatible /v1). Must be reachable from Netlify.
      return env.OMNIROUTE_BASE_URL ? { provider: p, protocol: 'openai', free: true, label: 'OmniRoute', apiKey: env.OMNIROUTE_API_KEY || '', endpoint: `${env.OMNIROUTE_BASE_URL.replace(/\/+$/, '')}/chat/completions`, model: model('auto', env.OMNIROUTE_MODEL) } : null
    case 'pollinations': // Keyless public endpoint. Opt-in only: conversations go to a third party with no SLA.
      return env.BROLY_ALLOW_KEYLESS_FREE === 'true' ? { provider: p, protocol: 'openai', free: true, label: 'Pollinations (sin clave)', apiKey: '', endpoint: 'https://text.pollinations.ai/openai', model: model('openai', env.POLLINATIONS_MODEL) } : null
  }
}

/** Ordered list of usable providers. BROLY_AI_PROVIDERS="gemini,openai" overrides the order. */
export function aiChain(env: NodeJS.ProcessEnv = process.env): AIConfig[] {
  const legacy = (env.BROLY_AI_PROVIDER || '').trim().toLowerCase()
  const listed = (env.BROLY_AI_PROVIDERS || legacy || '').split(',').map(s => s.trim().toLowerCase()).filter((s): s is Provider => (DEFAULT_ORDER as string[]).includes(s))
  const order = listed.length ? listed : DEFAULT_ORDER
  const chain = order.map(p => providerConfig(p, env)).filter((c): c is AIConfig => Boolean(c))
  if (env.BROLY_AI_MODEL && chain[0]) chain[0] = { ...chain[0], model: env.BROLY_AI_MODEL }
  return chain
}

/** First available provider (kept for single-shot uses such as the agenda summary). */
export function aiConfig(env: NodeJS.ProcessEnv = process.env): AIConfig | null { return aiChain(env)[0] || null }

type Json = Record<string, unknown>

function toOpenAI(system: string, turns: Turn[]) {
  const out: Json[] = [{ role: 'system', content: system }]
  for (const t of turns) {
    if (t.role === 'user') out.push({ role: 'user', content: t.content })
    else if (t.role === 'assistant') out.push({ role: 'assistant', content: t.content || null, ...(t.toolCalls?.length ? { tool_calls: t.toolCalls.map(c => ({ id: c.id, type: 'function', function: { name: c.name, arguments: JSON.stringify(c.args) } })) } : {}) })
    else for (const r of t.results) out.push({ role: 'tool', tool_call_id: r.id, content: r.content })
  }
  return out
}

export function toAnthropic(turns: Turn[]) {
  const out: Array<{ role: 'user' | 'assistant'; content: Json[] }> = []
  const push = (role: 'user' | 'assistant', blocks: Json[]) => {
    if (!blocks.length) return
    const last = out[out.length - 1]
    if (last && last.role === role) last.content.push(...blocks) // Anthropic requires alternating roles
    else out.push({ role, content: blocks })
  }
  for (const t of turns) {
    if (t.role === 'user') push('user', [{ type: 'text', text: t.content }])
    else if (t.role === 'assistant') push('assistant', [...(t.content ? [{ type: 'text', text: t.content }] : []), ...(t.toolCalls || []).map(c => ({ type: 'tool_use', id: c.id, name: c.name, input: c.args }))])
    else push('user', t.results.map(r => ({ type: 'tool_result', tool_use_id: r.id, content: r.content })))
  }
  while (out.length && out[0].role !== 'user') out.shift()
  return out
}

function parseArgs(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>
  try { const v = JSON.parse(String(raw || '{}')); return v && typeof v === 'object' ? v : {} } catch { return {} }
}

/** Some reasoning models wrap thoughts in <think> tags; never show them to the user. */
const stripThinking = (s: string) => s.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

export async function callModel(cfg: AIConfig, opts: { system: string; turns: Turn[]; tools?: ToolSpec[]; maxTokens?: number; timeoutMs?: number }): Promise<ModelResult> {
  const maxTokens = opts.maxTokens ?? 800
  const signal = AbortSignal.timeout(Math.max(1000, opts.timeoutMs ?? 20000))
  let r: Response
  try {
    if (cfg.protocol === 'openai') {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`
      if (cfg.provider === 'openrouter') { headers['HTTP-Referer'] = 'https://aureonaiproject.netlify.app'; headers['X-Title'] = 'AUREON BROLY' }
      r = await fetch(cfg.endpoint, { method: 'POST', signal, headers, body: JSON.stringify({ model: cfg.model, temperature: 0.3, max_tokens: maxTokens, messages: toOpenAI(opts.system, opts.turns), ...(opts.tools?.length ? { tools: opts.tools.map(t => ({ type: 'function', function: t })), tool_choice: 'auto' } : {}) }) })
    } else {
      r = await fetch(cfg.endpoint, { method: 'POST', signal, headers: { 'x-api-key': cfg.apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: cfg.model, max_tokens: maxTokens, system: opts.system, messages: toAnthropic(opts.turns), ...(opts.tools?.length ? { tools: opts.tools.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters })) } : {}) }) })
    }
  } catch (e) {
    const timeout = (e as Error)?.name === 'TimeoutError' || (e as Error)?.name === 'AbortError'
    throw new ProviderError(`${cfg.label}: ${timeout ? 'no respondió a tiempo' : 'no se pudo conectar'}.`, cfg.provider, 0)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await r.json().catch(() => ({}))
  if (!r.ok) {
    const hint = r.status === 401 || r.status === 403 ? 'clave no válida o sin permisos' : r.status === 429 || r.status === 402 ? 'límite de uso o cuota agotada' : r.status === 404 ? `modelo «${cfg.model}» no disponible` : 'error del servicio'
    throw new ProviderError(`${cfg.label}: ${hint} (HTTP ${r.status}). ${String(data?.error?.message || '').slice(0, 140)}`.trim(), cfg.provider, r.status)
  }
  if (cfg.protocol === 'openai') {
    const msg = data?.choices?.[0]?.message || {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolCalls: ToolCall[] = (msg.tool_calls || []).filter((c: any) => c?.function?.name).map((c: any, i: number) => ({ id: String(c.id || `call_${i}`), name: String(c.function.name), args: parseArgs(c.function.arguments) }))
    return { text: stripThinking(String(msg.content || '')), toolCalls, usage: { input: Number(data?.usage?.prompt_tokens || 0), output: Number(data?.usage?.completion_tokens || 0) } }
  }
  const blocks: Json[] = Array.isArray(data?.content) ? data.content : []
  return {
    text: stripThinking(blocks.filter(b => b.type === 'text').map(b => String(b.text || '')).join('\n')),
    toolCalls: blocks.filter(b => b.type === 'tool_use').map(b => ({ id: String(b.id), name: String(b.name), args: parseArgs(b.input) })),
    usage: { input: Number(data?.usage?.input_tokens || 0), output: Number(data?.usage?.output_tokens || 0) },
  }
}

/**
 * Tries the providers in order. On failure moves to the next one, at most once each, while the
 * shared deadline allows (Netlify synchronous functions are cut at 60 s and answer 502).
 */
export async function callWithFallback(chain: AIConfig[], opts: { system: string; turns: Turn[]; tools?: ToolSpec[]; maxTokens?: number; deadline: number; prefer?: Provider }) {
  const ordered = opts.prefer ? [...chain.filter(c => c.provider === opts.prefer), ...chain.filter(c => c.provider !== opts.prefer)] : chain
  const errors: string[] = []
  for (const cfg of ordered) {
    const remaining = opts.deadline - Date.now()
    if (remaining < 4000) { errors.push('Sin tiempo para más proveedores.'); break }
    try {
      const res = await callModel(cfg, { ...opts, timeoutMs: Math.min(20000, remaining - 2000) })
      return { res, cfg, errors }
    } catch (e) { errors.push((e as Error).message) }
  }
  throw new BrolyError(errors.join(' · ') || 'No hay proveedores de IA configurados.', 502)
}

/** Plain completion without tools (used to polish the agenda summary). */
export async function complete(cfg: AIConfig, system: string, user: string, maxTokens = 900) {
  const r = await callModel(cfg, { system, turns: [{ role: 'user', content: user }], maxTokens, timeoutMs: 15000 })
  return r.text
}
