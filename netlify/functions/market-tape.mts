// AUREON market tape: real quotes for the compact homepage ticker.
// Markets: Yahoo Finance chart data (public, unofficial endpoint, may be delayed).
// Crypto: CoinGecko (uses COINGECKO_API_KEY if present, same as the existing /api code).
// Responses are cached on Netlify's CDN for 60 s so visitors never hammer the upstream APIs.

type Quote = { id: string; name: string; group: 'indice' | 'accion' | 'divisa' | 'materia' | 'cripto'; price: number; changePct: number | null; currency: string; decimals: number }

const MARKETS: Array<Omit<Quote, 'price' | 'changePct' | 'currency'> & { symbol: string }> = [
  { id: 'spx', symbol: '^GSPC', name: 'S&P 500', group: 'indice', decimals: 2 },
  { id: 'ndx', symbol: '^IXIC', name: 'Nasdaq', group: 'indice', decimals: 2 },
  { id: 'dji', symbol: '^DJI', name: 'Dow Jones', group: 'indice', decimals: 2 },
  { id: 'ibex', symbol: '^IBEX', name: 'IBEX 35', group: 'indice', decimals: 2 },
  { id: 'dax', symbol: '^GDAXI', name: 'DAX', group: 'indice', decimals: 2 },
  { id: 'sx5e', symbol: '^STOXX50E', name: 'Euro Stoxx 50', group: 'indice', decimals: 2 },
  { id: 'ftse', symbol: '^FTSE', name: 'FTSE 100', group: 'indice', decimals: 2 },
  { id: 'n225', symbol: '^N225', name: 'Nikkei 225', group: 'indice', decimals: 2 },
  { id: 'nvda', symbol: 'NVDA', name: 'Nvidia', group: 'accion', decimals: 2 },
  { id: 'aapl', symbol: 'AAPL', name: 'Apple', group: 'accion', decimals: 2 },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft', group: 'accion', decimals: 2 },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla', group: 'accion', decimals: 2 },
  { id: 'eurusd', symbol: 'EURUSD=X', name: 'EUR/USD', group: 'divisa', decimals: 4 },
  { id: 'gold', symbol: 'GC=F', name: 'Oro', group: 'materia', decimals: 1 },
  { id: 'brent', symbol: 'BZ=F', name: 'Brent', group: 'materia', decimals: 2 },
]
const STABLECOINS = new Set(['usdt', 'usdc', 'usds', 'dai', 'fdusd', 'usde', 'tusd', 'pyusd', 'usdd', 'busd', 'usd1', 'steth', 'wbtc', 'weth', 'wsteth', 'weeth', 'cbbtc'])
const TTL_MS = 60_000
let memo: { at: number; body: string } | null = null

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

async function markets(): Promise<Quote[]> {
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(MARKETS.map(m => m.symbol).join(','))}&range=1d&interval=1d`
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (AUREON market tape)', Accept: 'application/json' }, signal: AbortSignal.timeout(6000) })
  if (!r.ok) throw new Error(`markets ${r.status}`)
  const data = await r.json() as { spark?: { result?: Array<{ symbol: string; response?: Array<{ meta?: Record<string, unknown> }> }> } }
  const bySymbol = new Map((data.spark?.result || []).map(x => [x.symbol, x.response?.[0]?.meta || {}]))
  return MARKETS.flatMap(m => {
    const meta = bySymbol.get(m.symbol); const price = num(meta?.regularMarketPrice); const prev = num(meta?.chartPreviousClose) ?? num(meta?.previousClose)
    if (price == null) return []
    return [{ id: m.id, name: m.name, group: m.group, decimals: m.decimals, price, changePct: prev ? ((price - prev) / prev) * 100 : null, currency: String(meta?.currency || '') }]
  })
}

async function crypto(): Promise<Quote[]> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (process.env.COINGECKO_API_KEY) headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY
  const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&price_change_percentage=24h', { headers, signal: AbortSignal.timeout(6000) })
  if (!r.ok) throw new Error(`crypto ${r.status}`)
  const rows = await r.json() as Array<{ id: string; symbol: string; current_price: number; price_change_percentage_24h: number | null }>
  return rows.filter(c => /^[a-z0-9]{2,6}$/i.test(String(c.symbol)) && !STABLECOINS.has(String(c.symbol).toLowerCase())).slice(0, 10).flatMap(c => {
    const price = num(c.current_price); if (price == null) return []
    return [{ id: `c-${c.id}`, name: String(c.symbol).toUpperCase(), group: 'cripto' as const, price, changePct: num(c.price_change_percentage_24h), currency: 'USD', decimals: price >= 100 ? 0 : price >= 1 ? 2 : 4 }]
  })
}

export async function buildTape() {
  const [m, c] = await Promise.allSettled([markets(), crypto()])
  const quotes = [...(m.status === 'fulfilled' ? m.value : []), ...(c.status === 'fulfilled' ? c.value : [])]
  return { quotes, updatedAt: new Date().toISOString(), sources: { markets: m.status === 'fulfilled', crypto: c.status === 'fulfilled' } }
}

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 })
  if (!memo || Date.now() - memo.at > TTL_MS) {
    const tape = await buildTape()
    if (!tape.quotes.length && memo) {
      // Upstream down: keep serving the last good snapshot instead of an empty tape.
    } else memo = { at: Date.now(), body: JSON.stringify(tape) }
  }
  const body = memo?.body || JSON.stringify({ quotes: [], updatedAt: new Date().toISOString(), sources: { markets: false, crypto: false } })
  return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=30', 'Netlify-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', 'X-Content-Type-Options': 'nosniff' } })
}
