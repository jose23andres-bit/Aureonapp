/// <reference types="node" />
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { BrolyError, required } from './env'

export type GoogleTokens = { access_token: string; refresh_token?: string; expiry_date?: number; scope?: string; token_type?: string }

function keyBytes() {
  const b = Buffer.from(required('BROLY_TOKEN_ENCRYPTION_KEY'), 'hex')
  if (b.length !== 32) throw new BrolyError('BROLY_TOKEN_ENCRYPTION_KEY debe ser una clave hexadecimal de 64 caracteres.', 503)
  return b
}

/** AES-256-GCM. Format: iv.tag.ciphertext (base64url) — unchanged from phase 1 so stored tokens stay readable. */
export function encrypt(value: unknown) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyBytes(), iv)
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), data.toString('base64url')].join('.')
}

export function decrypt(value: string): GoogleTokens {
  const [iv, tag, data] = value.split('.')
  const decipher = createDecipheriv('aes-256-gcm', keyBytes(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8'))
}

export function signState(payload: string) {
  return createHmac('sha256', required('BROLY_STATE_SECRET')).update(payload).digest('base64url')
}

export function createState(userId: string, ttlMs = 10 * 60 * 1000) {
  const payload = Buffer.from(JSON.stringify({ userId, nonce: randomBytes(12).toString('hex'), exp: Date.now() + ttlMs })).toString('base64url')
  return `${payload}.${signState(payload)}`
}

export function validState(state: string) {
  const [payload, sig] = state.split('.')
  if (!payload || !sig) return null
  const a = Buffer.from(sig), b = Buffer.from(signState(payload))
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { userId: string; nonce: string; exp: number }
    return parsed.exp < Date.now() ? null : parsed
  } catch { return null }
}
