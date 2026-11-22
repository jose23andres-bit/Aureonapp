// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { buildTape } from '../../netlify/functions/market-tape.mts'

afterEach(() => { vi.unstubAllGlobals(); delete process.env.COINGECKO_API_KEY })

const yahoo = { spark: { result: [
  { symbol: '^GSPC', response: [{ meta: { regularMarketPrice: 7659.44, chartPreviousClose: 7744.06, currency: 'USD' } }] },
  { symbol: '^IBEX', response: [{ meta: { regularMarketPrice: 19326.3, chartPreviousClose: 19177.7, currency: 'EUR' } }] },
] } }
const gecko = [
  { id: 'bitcoin', symbol: 'btc', current_price: 81276, price_change_percentage_24h: -0.25 },
  { id: 'tether', symbol: 'usdt', current_price: 1, price_change_percentage_24h: 0.01 },
  { id: 'ripple', symbol: 'xrp', current_price: 1.28, price_change_percentage_24h: -1.65 },
]
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { 'Content-Type': 'application/json' } })

describe('función market-tape', () => {
  it('combina mercados (Yahoo) y criptomonedas (CoinGecko), calcula la variación y excluye stablecoins', async () => {
    process.env.COINGECKO_API_KEY = 'demo-key'
    const f = vi.fn(async (url: string) => (String(url).includes('yahoo') ? json(yahoo) : json(gecko)))
    vi.stubGlobal('fetch', f)
    const tape = await buildTape()
    expect(tape.sources).toEqual({ markets: true, crypto: true })
    const ibex = tape.quotes.find(q => q.id === 'ibex')!
    expect(ibex.changePct).toBeCloseTo(((19326.3 - 19177.7) / 19177.7) * 100, 5)
    expect(tape.quotes.map(q => q.name)).toEqual(['S&P 500', 'IBEX 35', 'BTC', 'XRP'])
    const geckoCall = f.mock.calls.find(c => String(c[0]).includes('coingecko')) as unknown as [string, RequestInit]
    expect((geckoCall[1].headers as Record<string, string>)['x-cg-demo-api-key']).toBe('demo-key')
  })
  it('si una fuente falla, sirve la otra; la respuesta va cacheada en el CDN', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (String(url).includes('yahoo') ? json({}, 429) : json(gecko))))
    const tape = await buildTape()
    expect(tape.sources).toEqual({ markets: false, crypto: true })
    expect(tape.quotes.length).toBe(2)
    const res = await handler(new Request('https://x/.netlify/functions/market-tape'))
    expect(res.status).toBe(200)
    expect(res.headers.get('netlify-cdn-cache-control')).toMatch(/s-maxage=60/)
  })
})
