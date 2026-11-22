/// <reference types="node" />
// Server-only configuration for BROLY. Never import this module from browser code.

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://picvzxqkacgiyqflhpys.supabase.co'
// Public publishable key (already present in the frontend bundle). Not a secret.
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_K6bP4cu3BnG3UX1Ow8U1JA_Q9PfVXtV'

export class BrolyError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

export function required(name: string) {
  const value = process.env[name]
  if (!value) throw new BrolyError(`Falta configurar ${name} en los secretos de Netlify.`, 503)
  return value
}

export function intEnv(name: string, fallback: number, min: number, max: number) {
  const n = Number(process.env[name])
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback
}

export const reply = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', ...headers } })
