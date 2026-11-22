// Decides whether a search hit is somebody ASKING for something (a lead) and not an offer or an ad.
// Also removes contact data from the text: the report points to the public post, it is not a file on people.
import { createHash } from 'node:crypto'
import type { SearchHit } from './search'
import { HOLIDAY_ZONES, categoryById, zoneTerms } from './sources'

export type Lead = {
  url_hash: string; url: string; source: string; category: string; title: string; snippet: string; request: string
  zone: string | null; urgency: 'alta' | 'media' | 'baja'; score: number; age: string | null; next_step: string; sensitive: boolean; ai: boolean
}

const DEMAND = /\b(busco|buscamos|buscando|necesito|necesitamos|se busca|se necesita|compro|compramos|quiero (alquilar|contratar|comprar|reservar)|queremos (alquilar|contratar|comprar|reservar)|alguien (sabe|conoce|recomienda|me recomienda|ha contratado)|me recomend[aá]is|recomendaci[oó]n(es)? (de|para)|presupuesto para|d[oó]nde (puedo|encuentro|contratar|alquilar))\b/i
const OFFER = /^(vendo|se vende|venta de|se alquila|alquilo|ofrezco|ofrecemos|oferta|precio|desde \d|\d+ ?€|alquiler de .* desde|empresa de|servicio de|somos|contrata|reserva ya|los \d+ mejores|top \d+|mejores)/i
const OFFER_ANYWHERE = /\b(vendo|se vende|ofrezco mis servicios|ofrecemos|nuestros servicios|llámanos|ll[aá]manos|whatsapp para reservas|presupuesto sin compromiso|tarifas desde)\b/i
// Professional buyers ("compro oro, pago al contado", "compramos tu coche") are businesses, not leads.
const DEALER = /\b(compr(o|amos) (oro|todo|tu|su|coches|relojes|joyas|veh[ií]culos)|pago al contado|tasaci[oó]n (gratis|gratuita|al momento)|pagamos (m[aá]s|al momento))\b/i
const URGENT = /\b(urgente|urge|esta semana|este (fin de semana|s[aá]bado|viernes|domingo)|mañana|hoy|lo antes posible|para ya)\b/i
const SOON = /\b((el )?(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo) \d{1,2}|próxim[oa]s? (semana|mes)|en (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)|el \d{1,2} de)\b/i
const BLOCKED_HOSTS = /(^|\.)(facebook\.com|instagram\.com|tiktok\.com|linkedin\.com|x\.com|twitter\.com)$/i // logged-in networks: not indexed reliably and their terms forbid automated collection

export const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' } }
/** Same post = same hash: drops fragment, tracking parameters and trailing slash, keeps real ids (?t=123). */
export function canonicalUrl(url: string) {
  try {
    const u = new URL(url)
    u.hash = ''
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|ref$|ref_src$|share$|s$)/i.test(k)) u.searchParams.delete(k)
    u.searchParams.sort()
    return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/+$/, '')}${u.search}`
  } catch { return url }
}
export const hashUrl = (url: string) => createHash('sha256').update(canonicalUrl(url)).digest('hex')

/** Removes phone numbers, emails and @handles: the owner contacts people through the post itself. */
export function redact(s: string) {
  return s.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email oculto]')
    .replace(/(\+?\d[\d\s.-]{7,}\d)/g, m => (m.replace(/\D/g, '').length >= 9 ? '[teléfono oculto]' : m))
    .replace(/(^|\s)@[\w.]{3,}/g, '$1[usuario oculto]')
}

export function zoneOf(text: string, city: string, terms = zoneTerms(city)) {
  const t = text.toLowerCase()
  return terms.find(z => new RegExp(`(^|[^a-záéíóúñ])${z}([^a-záéíóúñ]|$)`, 'i').test(t)) || null
}

export function heuristic(hit: SearchHit, city: string): Lead | null {
  const host = hostOf(hit.url)
  if (!host || BLOCKED_HOSTS.test(host)) return null
  const text = `${hit.title} · ${hit.snippet}`
  if (!DEMAND.test(text)) return null
  if (OFFER.test(hit.title.trim()) || DEALER.test(text) || (OFFER_ANYWHERE.test(text) && !DEMAND.test(hit.title))) return null
  const cat = categoryById(hit.category)
  const zone = zoneOf(text, city) || (cat?.anyZone ? zoneOf(text, city, HOLIDAY_ZONES) : null)
  if (!zone && !cat?.anyZone) return null
  const urgency = URGENT.test(text) ? 'alta' : SOON.test(text) ? 'media' : 'baja'
  let score = 50 + (DEMAND.test(hit.title) ? 20 : 0) + (zone ? 10 : 0) + ({ alta: 20, media: 10, baja: 0 } as const)[urgency]
  if (/\b(foro|reddit|comunidad|milanuncios)\b/i.test(host)) score += 5
  const request = redact(firstDemandSentence(text) || hit.title).slice(0, 220)
  return {
    url_hash: hashUrl(hit.url), url: hit.url, source: host, category: hit.category, title: redact(hit.title).slice(0, 180), snippet: redact(hit.snippet).slice(0, 500),
    request, zone: zone ? capital(zone) : null, urgency, score: Math.min(100, score), age: hit.age, ai: false, sensitive: Boolean(cat?.sensitive),
    next_step: cat?.sensitive ? 'Solo derivar a una clínica autorizada; responder en el propio hilo, sin pedir datos de salud.' : 'Responder en el propio anuncio o hilo presentando AUREON; no escribir por otros canales sin su permiso.',
  }
}

function firstDemandSentence(text: string) {
  return text.split(/(?<=[.!?·])\s+/).find(s => DEMAND.test(s))?.replace(/[\s·]+$/, '').trim()
}
const capital = (s: string) => s.replace(/(^|\s)\S/g, m => m.toUpperCase())

/** Heuristic pass + dedupe by URL. Keeps the best score per URL. */
export function candidates(hits: SearchHit[], city: string) {
  const byHash = new Map<string, Lead>()
  for (const h of hits) {
    const l = heuristic(h, city)
    if (l && (!byHash.has(l.url_hash) || byHash.get(l.url_hash)!.score < l.score)) byHash.set(l.url_hash, l)
  }
  return [...byHash.values()].sort((a, b) => b.score - a.score)
}
