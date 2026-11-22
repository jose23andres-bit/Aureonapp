/// <reference types="node" />
// Premium voice for BROLY: OpenAI text-to-speech with a licensed built-in voice.
// It does NOT imitate any real person. OpenAI's usage policy requires telling the user the voice is
// AI-generated; the panel shows that disclosure. Falls back to the device voice when not configured.
import { BrolyError, intEnv } from './env'
import { madridDayWindow } from './google'
import { db, log, q, type User } from './supabase'

const DEFAULT_INSTRUCTIONS = [
  'Habla en español de España, con acento castellano neutro y pronunciación muy clara.',
  'Voz masculina grave, cálida y segura. Ritmo pausado y elegante, con presencia de narrador cinematográfico sobrio, sin exagerar.',
  'Tono de asistente personal de confianza: sereno, preciso y cercano.',
  'No imites a ninguna persona real, actor ni actor de doblaje.',
].join(' ')

export type TTSConfig = { apiKey: string; endpoint: string; model: string; voice: string; instructions: string }

export function ttsConfig(env: NodeJS.ProcessEnv = process.env): TTSConfig | null {
  if (env.BROLY_TTS_ENABLED === 'false' || !env.OPENAI_API_KEY) return null
  return {
    apiKey: env.OPENAI_API_KEY,
    endpoint: env.BROLY_TTS_URL || 'https://api.openai.com/v1/audio/speech',
    model: env.BROLY_TTS_MODEL || 'gpt-4o-mini-tts',
    voice: env.BROLY_TTS_VOICE || 'onyx',
    instructions: (env.BROLY_TTS_INSTRUCTIONS || DEFAULT_INSTRUCTIONS).slice(0, 1500),
  }
}

export const MAX_TTS_CHARS = 1200

/** Removes formatting symbols that would otherwise be read aloud. */
export function speakableText(raw: string) {
  return raw.replace(/https?:\/\/\S+/g, 'enlace').replace(/[*#`_>|~]+/g, ' ').replace(/•/g, ',').replace(/\s+/g, ' ').trim().slice(0, MAX_TTS_CHARS)
}

export async function synthesize(user: User, body: { text?: unknown }) {
  const cfg = ttsConfig()
  if (!cfg) throw new BrolyError('La voz premium necesita OPENAI_API_KEY en Netlify (o está desactivada con BROLY_TTS_ENABLED=false). Uso la voz del dispositivo.', 503)
  const text = speakableText(String(body?.text || ''))
  if (!text) throw new BrolyError('No hay texto que leer.', 400)

  // Daily cost cap, counted from today's activity log (Europe/Madrid day).
  const limit = intEnv('BROLY_TTS_DAILY_CHAR_LIMIT', 15000, 500, 500000)
  const since = madridDayWindow().start
  const used = (await db<Array<{ metadata: { chars?: number } }>>(`broly_activity?user_id=eq.${q(user.id)}&event_type=eq.tts&created_at=gte.${q(since)}&select=metadata&limit=2000`))
    .reduce((n, r) => n + Number(r.metadata?.chars || 0), 0)
  if (used + text.length > limit) throw new BrolyError(`Se ha alcanzado el límite diario de voz premium (${limit} caracteres, BROLY_TTS_DAILY_CHAR_LIMIT). Uso la voz del dispositivo.`, 429)

  const r = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: cfg.model, voice: cfg.voice, input: text, instructions: cfg.instructions, response_format: 'mp3' }),
    signal: AbortSignal.timeout(25000),
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({})) as { error?: { message?: string } }
    throw new BrolyError(`El servicio de voz ha devuelto un error ${r.status}: ${String(err?.error?.message || 'sin detalle').slice(0, 160)}`, 502)
  }
  const audio = await r.arrayBuffer()
  await log(user.id, 'tts', 'Respuesta leída con voz premium (IA).', null, { chars: text.length, model: cfg.model, voice: cfg.voice })
  return new Response(audio, { status: 200, headers: { 'Content-Type': r.headers.get('content-type') || 'audio/mpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

export function voiceInfo() {
  const cfg = ttsConfig()
  return cfg ? { premium: true, provider: 'openai', voice: cfg.voice, model: cfg.model } : { premium: false, provider: null, voice: null, model: null }
}
