// Public contract endpoint for the client (no login): access only with the secret link token.
// GET ?token=…        → contract data needed to complete it (this contract only)
// GET ?token=…&pdf=1  → PDF (fillable draft, or signed final with acceptance record)
// POST {token, values, signerName, signerDoc, accept} → completes and signs electronically
import { completeContract, contractPdf, publicContract } from '../broly-core/contracts/service'
import { BrolyError, reply } from '../broly-core/env'

const hits = new Map<string, number[]>()
function limited(ip: string, max = 30) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 600000)
  list.push(now); hits.set(ip, list)
  return list.length > max
}

export default async (req: Request) => {
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida'
  try {
    if (limited(ip)) return reply({ error: 'Demasiadas solicitudes. Inténtelo en unos minutos.' }, 429)
    const url = new URL(req.url)
    if (req.method === 'GET') {
      const token = url.searchParams.get('token') || ''
      if (url.searchParams.get('pdf') === '1') {
        const { bytes, ref } = await contractPdf(token)
        return new Response(bytes as BodyInit, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${ref}.pdf"`, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' } })
      }
      return reply(await publicContract(token), 200, { 'X-Robots-Tag': 'noindex' })
    }
    if (req.method === 'POST') {
      const text = await req.text()
      if (text.length > 30000) return reply({ error: 'Datos demasiado extensos.' }, 413)
      const body = JSON.parse(text || '{}')
      return reply(await completeContract(String(body.token || ''), body, { ip, userAgent: req.headers.get('user-agent') || '' }))
    }
    return reply({ error: 'Método no permitido.' }, 405)
  } catch (e) {
    if (e instanceof BrolyError) return reply({ error: e.message }, e.status)
    if (e instanceof SyntaxError) return reply({ error: 'Datos no válidos.' }, 400)
    console.error('[contract]', (e as Error).message)
    return reply({ error: 'No se pudo procesar el contrato.' }, 500)
  }
}
