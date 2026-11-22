// Premium voice playback (server-side OpenAI TTS) with automatic fallback to the device voice.
import { getAccessToken } from '../lib/supabase'
import { speak as deviceSpeak, stopSpeaking as stopDevice } from './speech'

// 10 ms of silence: played inside a user gesture so iOS Safari allows the later, async playback.
const SILENCE = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

let audio: HTMLAudioElement | null = null
let currentUrl = ''
let seq = 0

function element() {
  if (!audio && typeof Audio !== 'undefined') { audio = new Audio(); audio.preload = 'auto' }
  return audio
}

/** Call synchronously from a click/tap handler. */
export function unlockAudio() {
  const a = element()
  if (!a || currentUrl) return
  a.src = SILENCE
  try { const p = a.play(); if (p && typeof p.catch === 'function') p.catch(() => { /* only needed to unlock */ }) } catch { /* unsupported */ }
}

export function stopVoice() {
  seq++
  stopDevice()
  if (audio) { audio.pause(); audio.removeAttribute('src') }
  if (currentUrl) { URL.revokeObjectURL(currentUrl); currentUrl = '' }
}

type Handlers = { onStart?: () => void; onEnd?: () => void; onFallback?: (reason: string) => void }

/** Speaks with the premium AI voice when available; otherwise (or on any error) with the device voice. */
export async function speakText(text: string, premium: boolean, h: Handlers = {}) {
  stopVoice()
  const mine = seq
  const fallback = (reason: string) => { if (mine !== seq) return; if (reason) h.onFallback?.(reason); if (!deviceSpeak(text, { onStart: h.onStart, onEnd: h.onEnd })) h.onEnd?.() }
  const token = getAccessToken()
  if (!premium || !token) return fallback('')
  h.onStart?.()
  try {
    const r = await fetch('/.netlify/functions/broly?action=tts', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    if (!r.ok) { const d = await r.json().catch(() => ({})) as { error?: string }; throw new Error(d.error || `Error ${r.status}`) }
    const blob = await r.blob()
    if (mine !== seq) return
    const a = element()
    if (!a) throw new Error('Este navegador no puede reproducir audio.')
    currentUrl = URL.createObjectURL(blob)
    a.src = currentUrl
    a.onended = () => { if (mine === seq) { h.onEnd?.(); stopVoice() } }
    a.onerror = () => fallback('No se pudo reproducir la voz premium.')
    await a.play()
  } catch (e) {
    fallback(e instanceof Error ? e.message : 'Voz premium no disponible.')
  }
}
