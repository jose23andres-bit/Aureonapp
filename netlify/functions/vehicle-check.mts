// AUREON Vehicle Check — free VIN (bastidor) decoder.
// Data: NHTSA vPIC (official, free, public domain) + NHTSA recalls (US market). No scraping of paid
// history providers: full history goes through carVertical (affiliate) or the official DGT report.
// Responses are cached on Netlify's CDN for 24 h per VIN.

const TRANSLIT: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 }
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

// ISO 3780 country/region of manufacture from the first two characters (most common ranges).
const REGIONS: Array<[RegExp, string]> = [
  [/^W/, 'Alemania'], [/^Z[A-R]/, 'Italia'], [/^V[F-R]/, 'Francia'], [/^V[S-W]/, 'España'], [/^S[A-M]/, 'Reino Unido'],
  [/^Y[S-W]/, 'Suecia'], [/^Y[A-E]/, 'Bélgica'], [/^X[L-R]/, 'Países Bajos'], [/^T[J-P]/, 'Chequia'], [/^T[R-V]/, 'Hungría'],
  [/^S[U-Z]/, 'Polonia'], [/^T[A-H]/, 'Suiza'], [/^V[A-E]/, 'Austria'], [/^X[S-W0-4]/, 'Rusia'], [/^U[5-7]/, 'Eslovaquia'],
  [/^J/, 'Japón'], [/^K[L-R]/, 'Corea del Sur'], [/^L/, 'China'], [/^M[A-E]/, 'India'], [/^N[L-R]/, 'Turquía'],
  [/^[1-5]/, 'Norteamérica (EE. UU./Canadá/México)'], [/^3/, 'México'], [/^9[A-E3-9]/, 'Brasil'], [/^6/, 'Australia'], [/^A[A-H]/, 'Sudáfrica'],
]

export function normalizeVin(raw: string) { return raw.toUpperCase().replace(/[\s-]/g, '') }

export function validateVin(vin: string) {
  if (vin.length !== 17) return { ok: false, reason: `El bastidor debe tener 17 caracteres (tiene ${vin.length}).` }
  const bad = [...vin].filter(c => !/[A-HJ-NPR-Z0-9]/.test(c))
  if (bad.length) return { ok: false, reason: `Caracteres no válidos: ${[...new Set(bad)].join(', ')}. Los bastidores nunca usan I, O ni Q.` }
  return { ok: true, reason: '' }
}

/** North-American check digit (position 9). Optional in Europe, so a mismatch is informative only. */
export function checkDigit(vin: string) {
  const sum = [...vin].reduce((acc, c, i) => acc + (/[0-9]/.test(c) ? Number(c) : TRANSLIT[c] || 0) * WEIGHTS[i], 0)
  const expected = sum % 11 === 10 ? 'X' : String(sum % 11)
  return { expected, actual: vin[8], valid: vin[8] === expected }
}

export const regionOf = (vin: string) => REGIONS.find(([re]) => re.test(vin))?.[1] || 'No identificado'

const clean = (v: unknown) => { const s = String(v ?? '').trim(); return s && s !== 'Not Applicable' && s !== '0' ? s : '' }

export async function decode(vin: string) {
  const r = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`, { signal: AbortSignal.timeout(9000) })
  if (!r.ok) throw new Error(`vpic ${r.status}`)
  const row = ((await r.json()) as { Results?: Array<Record<string, unknown>> }).Results?.[0] || {}
  const disp = Number(clean(row.DisplacementL))
  const spec = {
    make: clean(row.Make), model: clean(row.Model), year: clean(row.ModelYear), trim: clean(row.Trim) || clean(row.Series),
    body: clean(row.BodyClass), drive: clean(row.DriveType), fuel: clean(row.FuelTypePrimary), transmission: clean(row.TransmissionStyle),
    engine: [clean(row.EngineCylinders) && `${clean(row.EngineCylinders)} cilindros`, disp ? `${disp.toFixed(1)} L` : '', clean(row.EngineHP) && `${clean(row.EngineHP)} CV (aprox.)`].filter(Boolean).join(' · '),
    doors: clean(row.Doors), manufacturer: clean(row.Manufacturer), plant: [clean(row.PlantCity), clean(row.PlantCountry)].filter(Boolean).join(', '),
  }
  const codes = clean(row.ErrorCode).split(',').map(s => s.trim()).filter(Boolean)
  return { spec, decoderNotes: codes.includes('0') && codes.length === 1 ? [] : clean(row.ErrorText).split(/;\s*/).filter(Boolean).slice(0, 4) }
}

export async function recalls(make: string, model: string, year: string) {
  if (!make || !model || !year) return { available: false, items: [] as Array<Record<string, string>> }
  const r = await fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}`, { signal: AbortSignal.timeout(9000) })
  if (!r.ok) return { available: false, items: [] }
  const d = await r.json() as { results?: Array<Record<string, string>> }
  return { available: true, items: (d.results || []).slice(0, 8).map(x => ({ id: x.NHTSACampaignNumber, date: x.ReportReceivedDate, component: x.Component, summary: String(x.Summary || '').slice(0, 400), remedy: String(x.Remedy || '').slice(0, 300) })) }
}

const json = (data: unknown, status = 200, cache = 'public, max-age=300') => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache, ...(status === 200 ? { 'Netlify-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } : {}), 'X-Content-Type-Options': 'nosniff' } })

export default async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'Método no permitido.' }, 405, 'no-store')
  const vin = normalizeVin(new URL(req.url).searchParams.get('vin') || '').slice(0, 20)
  const v = validateVin(vin)
  if (!v.ok) return json({ error: v.reason }, 400, 'no-store')
  try {
    const { spec, decoderNotes } = await decode(vin)
    const rc = await recalls(spec.make, spec.model, spec.year).catch(() => ({ available: false, items: [] }))
    return json({ vin, valid: true, region: regionOf(vin), wmi: vin.slice(0, 3), checkDigit: checkDigit(vin), spec, decoderNotes, recalls: rc, source: 'NHTSA vPIC + NHTSA Recalls (datos públicos oficiales)', generatedAt: new Date().toISOString() })
  } catch {
    return json({ vin, valid: true, region: regionOf(vin), wmi: vin.slice(0, 3), checkDigit: checkDigit(vin), spec: null, decoderNotes: ['El servicio de decodificación no responde ahora mismo. Inténtalo en unos minutos.'], recalls: { available: false, items: [] } }, 200, 'no-store')
  }
}
