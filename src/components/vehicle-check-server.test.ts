// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { checkDigit, normalizeVin, regionOf, validateVin } from '../../netlify/functions/vehicle-check.mts'

afterEach(() => vi.unstubAllGlobals())
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'Content-Type': 'application/json' } })

describe('función vehicle-check', () => {
  it('normaliza y valida bastidores (ISO 3779)', () => {
    expect(normalizeVin(' wp0-ab2a99 ls227654 ')).toBe('WP0AB2A99LS227654')
    expect(validateVin('WP0AB2A99LS227654').ok).toBe(true)
    expect(validateVin('WP0AB2A99LS2276').reason).toMatch(/17/)
    expect(validateVin('WP0AB2A99LS22765I').reason).toMatch(/I, O ni Q/)
  })
  it('calcula el dígito de control norteamericano y la región de fabricación', () => {
    expect(checkDigit('1M8GDM9AXKP042788').valid).toBe(true) // ejemplo estándar con dígito X
    expect(regionOf('WP0AB2A99LS227654')).toBe('Alemania')
    expect(regionOf('VSSZZZ6JZ9R123456')).toBe('España')
    expect(regionOf('ZFF79ALA4J0233145')).toBe('Italia')
  })
  it('rechaza VIN inválidos sin llamar a servicios externos', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    const r = await handler(new Request('https://x/.netlify/functions/vehicle-check?vin=123'))
    expect(r.status).toBe(400)
    expect(f).not.toHaveBeenCalled()
  })
  it('decodifica con NHTSA, añade llamadas a revisión y cachea 24 h en el CDN', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => String(url).includes('vpic')
      ? json({ Results: [{ Make: 'PORSCHE', Model: '911', ModelYear: '2020', Trim: 'Carrera 4S', BodyClass: 'Coupe', EngineCylinders: '6', DisplacementL: '2.981', EngineHP: '443', FuelTypePrimary: 'Gasoline', PlantCountry: 'GERMANY', PlantCity: 'STUTTGART', ErrorCode: '1', ErrorText: '1 - Check Digit (9th position) does not calculate properly' }] })
      : json({ results: [{ NHTSACampaignNumber: '24V155000', ReportReceivedDate: '28/02/2024', Component: 'WINDSHIELD', Summary: 'x', Remedy: 'y' }] })))
    const r = await handler(new Request('https://x/.netlify/functions/vehicle-check?vin=WP0AB2A99LS227654'))
    const d = await r.json()
    expect(r.headers.get('netlify-cdn-cache-control')).toMatch(/s-maxage=86400/)
    expect(d.spec).toMatchObject({ make: 'PORSCHE', model: '911', year: '2020', engine: '6 cilindros · 3.0 L · 443 CV (aprox.)', plant: 'STUTTGART, GERMANY' })
    expect(d.recalls.items[0].id).toBe('24V155000')
    expect(d.region).toBe('Alemania')
  })
  it('si NHTSA no responde, lo dice y no inventa datos', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json({}, 503)))
    const d = await (await handler(new Request('https://x/.netlify/functions/vehicle-check?vin=WP0AB2A99LS227654'))).json()
    expect(d.spec).toBeNull()
    expect(d.decoderNotes[0]).toMatch(/no responde/)
  })
})
