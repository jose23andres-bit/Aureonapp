import './broly.css'
import { useId } from 'react'

// BROLY: original AUREON warrior (not based on any licensed design).
// Base form at rest (dark spiked hair, calm aura); powered form while working
// (golden energy hair, flames, sparks), in the spirit of a classic anime transformation.
export type AvatarState = 'idle' | 'active' | 'listening' | 'thinking' | 'speaking' | 'executing'
/** @deprecated kept for older imports; use AvatarState. */
export type DragonflyState = AvatarState

const LABEL: Record<AvatarState, string> = { idle: 'en reposo', active: 'listo', listening: 'escuchando', thinking: 'procesando', speaking: 'respondiendo', executing: 'ejecutando una tarea' }
export const WARRIOR_STATES = new Set<AvatarState>(['listening', 'thinking', 'speaking', 'executing'])

export function Warrior({ size = 48, state = 'thinking' }: { size?: number; state?: AvatarState }) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (k: string) => `${raw}${k}`
  const url = (k: string) => `url(#${id(k)})`
  const powered = WARRIOR_STATES.has(state)
  const hair = powered ? url('h') : url('k')
  const hairStroke = powered ? '#a8701a' : '#05070a'
  return (
    <svg className={`bly-warrior ${powered ? 'is-powered' : 'is-base'}`} data-state={state} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`BROLY en modo guerrero, ${LABEL[state]}`}>
      <defs>
        {/* Keep the golden hair gradient as the FIRST linearGradient (asserted by tests). */}
        <linearGradient id={id('h')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d1" />
          <stop offset="0.45" stopColor="#f5c84c" />
          <stop offset="1" stopColor="#c9861b" />
        </linearGradient>
        <linearGradient id={id('k')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3f48" />
          <stop offset="0.5" stopColor="#15181d" />
          <stop offset="1" stopColor="#050608" />
        </linearGradient>
        <radialGradient id={id('a')} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#f2c14e" stopOpacity="0.7" />
          <stop offset="0.7" stopColor="#5ef2d6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#5ef2d6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('c')} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#d5b779" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#d5b779" stopOpacity="0.1" />
          <stop offset="1" stopColor="#d5b779" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('s')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3cfad" />
          <stop offset="1" stopColor="#c48a63" />
        </linearGradient>
        <linearGradient id={id('r')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2e33" />
          <stop offset="1" stopColor="#0a0b0d" />
        </linearGradient>
        <linearGradient id={id('g')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffeaa6" />
          <stop offset="1" stopColor="#c3933a" />
        </linearGradient>
        <filter id={id('w')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Aura: calm golden glow at rest, rising energy flames when powered */}
      <g className="bly-w-aura">
        <ellipse cx="100" cy="112" rx="94" ry="90" fill={powered ? url('a') : url('c')} />
        {powered && <path className="bly-w-flame" d="M30 150 C26 110 44 86 40 54 C58 78 56 104 66 118 C70 92 80 70 74 34 C94 62 92 92 100 108 C108 92 106 62 126 34 C120 70 130 92 134 118 C144 104 142 78 160 54 C156 86 174 110 170 150 Z" fill="#ffe08a" opacity="0.32" />}
      </g>

      {/* Spiked hair, behind the head (taller when powered) */}
      <path className="bly-w-hair" d={powered
        ? 'M64 92 L44 52 L70 66 L64 22 L90 54 L100 6 L110 54 L136 22 L130 66 L156 52 L136 92 L128 72 L72 72 Z'
        : 'M66 92 L50 62 L72 70 L70 36 L90 60 L100 24 L110 60 L130 36 L128 70 L150 62 L134 92 L128 74 L72 74 Z'}
        fill={hair} stroke={hairStroke} strokeWidth="1.2" strokeLinejoin="round" filter={powered ? url('w') : undefined} />

      {/* Gi with gold-trimmed armour, belt and the AUREON emblem */}
      <path d="M26 200 C30 160 58 140 100 138 C142 140 170 160 174 200 Z" fill={url('r')} stroke={url('g')} strokeWidth="2" />
      <path d="M36 172 C40 152 54 146 70 146 L64 176 Z M164 172 C160 152 146 146 130 146 L136 176 Z" fill="#14171a" stroke={url('g')} strokeWidth="1.6" />
      <path d="M78 142 L100 168 L122 142" fill="none" stroke="#c9861b" strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
      <path d="M100 150 L114 186 L105 186 L100 174 L95 186 L86 186 Z" fill={url('g')} filter={url('w')} />
      <path d="M60 192 L140 192" stroke="#c9861b" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

      {/* Neck and head */}
      <path d="M88 116 L112 116 L114 142 L86 142 Z" fill={url('s')} />
      <path d="M70 84 C70 62 84 52 100 52 C116 52 130 62 130 84 C130 106 118 124 100 128 C82 124 70 106 70 84 Z" fill={url('s')} stroke="#9a6644" strokeWidth="1" />

      {/* Front fringe */}
      <path d="M70 76 L80 58 L88 72 L100 54 L112 72 L120 58 L130 76 L130 66 C122 52 78 52 70 66 Z" fill={hair} stroke={hairStroke} strokeWidth="1" strokeLinejoin="round" />

      {/* Brows and eyes: dark and calm at rest, glowing when powered */}
      <path d="M78 82 L95 86 M122 82 L105 86" stroke="#3b2414" strokeWidth="3" strokeLinecap="round" />
      <g className="bly-w-eyes" filter={powered ? url('w') : undefined}>
        <path d="M80 90 L95 90 L93 96 L83 95 Z" fill={powered ? '#5ef2d6' : '#1b2530'} />
        <path d="M120 90 L105 90 L107 96 L117 95 Z" fill={powered ? '#5ef2d6' : '#1b2530'} />
        {!powered && <><circle cx="89" cy="92" r="1.3" fill="#fff" /><circle cx="111" cy="92" r="1.3" fill="#fff" /></>}
      </g>
      <path className="bly-w-mouth" d="M92 112 L108 112" stroke="#6b4329" strokeWidth="2.4" strokeLinecap="round" />

      {/* Energy sparks (powered only) */}
      {powered && (
        <g className="bly-w-sparks" fill="#fff3c4">
          <path d="M34 120 l4 -10 l2 8 l6 -2 l-5 9 z" />
          <path d="M164 108 l-4 -10 l-2 8 l-6 -2 l5 9 z" />
          <path d="M150 168 l3 -7 l2 6 l5 -1 l-4 6 z" />
        </g>
      )}
    </svg>
  )
}

/** BROLY is always the warrior: base form at rest, powered form (with a flash) while working. */
export function BrolyAvatar({ size = 48, state = 'idle' }: { size?: number; state?: AvatarState }) {
  const powered = WARRIOR_STATES.has(state)
  return (
    <span className={`bly-avatar is-warrior ${powered ? 'is-powered' : 'is-base'}`} style={{ width: size, height: size }} data-form="warrior" data-power={powered ? 'on' : 'off'}>
      <span key={powered ? 'p' : 'b'} className={`bly-avatar-layer ${powered ? 'bly-avatar-warrior' : 'bly-avatar-base'}`}>
        <Warrior size={size} state={state} />
        {powered && <span className="bly-flash" aria-hidden="true" />}
      </span>
    </span>
  )
}
