// Browser voice for BROLY: Web Speech API (dictation) + speechSynthesis (spoken replies).
// The microphone permission is requested only when the user presses the mic button.
// Note: in Chrome, dictation audio is processed by Google's speech service; in Safari, by Apple.

type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void; stop: () => void; abort: () => void
}
type RecognitionCtor = new () => Recognition

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

/** Detects the site's Permissions-Policy (netlify.toml must allow microphone=(self)). */
export function microphoneAllowedByPolicy() {
  if (typeof document === 'undefined') return true
  const d = document as unknown as { permissionsPolicy?: { allowsFeature?: (f: string) => boolean }; featurePolicy?: { allowsFeature?: (f: string) => boolean } }
  const policy = d.permissionsPolicy || d.featurePolicy
  return policy?.allowsFeature ? policy.allowsFeature('microphone') : true
}

export function voiceSupport() {
  return {
    dictation: Boolean(recognitionCtor()),
    policyAllowsMic: microphoneAllowedByPolicy(),
    synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  }
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Permiso de micrófono denegado. Actívalo en los ajustes del navegador para este sitio.',
  'service-not-allowed': 'El navegador no permite el dictado en esta página.',
  'no-speech': 'No he oído nada. Vuelve a intentarlo.',
  'audio-capture': 'No se encuentra ningún micrófono.',
  network: 'El servicio de dictado del navegador no está disponible (sin conexión).',
}

export function startDictation(handlers: { onText: (text: string) => void; onEnd: () => void; onError: (message: string) => void }) {
  const Ctor = recognitionCtor()
  if (!Ctor) { handlers.onError('Este navegador no ofrece dictado por voz. Prueba Chrome o Safari actualizados, o escribe tu mensaje.'); return null }
  if (!microphoneAllowedByPolicy()) { handlers.onError('El micrófono está bloqueado por la política de seguridad del sitio (Permissions-Policy en netlify.toml). Ver docs/broly.'); return null }
  const rec = new Ctor()
  rec.lang = 'es-ES'; rec.interimResults = false; rec.maxAlternatives = 1; rec.continuous = false
  rec.onresult = e => { const text = Array.from(e.results).map(r => r[0]?.transcript || '').join(' ').trim(); if (text) handlers.onText(text) }
  rec.onerror = e => handlers.onError(ERRORS[e.error || ''] || 'No se pudo usar el dictado por voz.')
  rec.onend = () => handlers.onEnd()
  try { rec.start() } catch { handlers.onError('No se pudo activar el micrófono.'); return null }
  return () => { try { rec.stop() } catch { /* already stopped */ } }
}

// Male es-ES voices shipped by iOS/macOS (Jorge, Diego...), Windows (Pablo, Álvaro...) and Chrome/Android.
const MALE_ES = /jorge|diego|pablo|[aá]lvaro|enrique|juan|carlos|ra[uú]l|antonio|alberto|dar[ií]o|male|hombre|masculin/i

export function pickBrolyVoice(voices: SpeechSynthesisVoice[]) {
  const es = voices.filter(v => v.lang?.toLowerCase().startsWith('es'))
  const spain = es.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith('es-es'))
  return spain.find(v => MALE_ES.test(v.name)) || es.find(v => MALE_ES.test(v.name)) || spain[0] || es[0] || null
}

export function speak(text: string, handlers: { onStart?: () => void; onEnd?: () => void } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.slice(0, 1500))
  u.lang = 'es-ES'
  // BROLY's voice: a calm, deep male Spanish (Spain) voice from the device, slightly lowered.
  u.rate = 0.97; u.pitch = 0.82
  const voice = pickBrolyVoice(window.speechSynthesis.getVoices())
  if (voice) u.voice = voice
  u.onstart = () => handlers.onStart?.()
  u.onend = () => handlers.onEnd?.()
  u.onerror = () => handlers.onEnd?.()
  window.speechSynthesis.speak(u)
  return true
}

export function stopSpeaking() { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel() }
