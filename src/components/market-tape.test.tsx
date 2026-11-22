import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MarketTape, formatChange, formatPrice } from './market-tape'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const quotes = [
  { id: 'ibex', name: 'IBEX 35', group: 'indice', price: 19326.3, changePct: 0.77, currency: 'EUR', decimals: 2 },
  { id: 'c-bitcoin', name: 'BTC', group: 'cripto', price: 81276, changePct: -0.25, currency: 'USD', decimals: 0 },
]

describe('MarketTape', () => {
  it('formatea precios y variaciones en español', () => {
    expect(formatPrice(quotes[0])).toBe('19.326,30')
    expect(formatPrice(quotes[1])).toBe('81.276 $')
    expect(formatChange(0.77)).toBe('+0,77%')
    expect(formatChange(-0.25)).toBe('−0,25%')
    expect(formatChange(null)).toBe('')
  })
  it('muestra cotizaciones reales en una sola línea con subidas y bajadas', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ quotes, updatedAt: '' }) })))
    render(<MarketTape />)
    await waitFor(() => expect(screen.getAllByText('IBEX 35').length).toBe(2)) // duplicated track for seamless loop
    expect(document.querySelectorAll('.mkt-items')[1].getAttribute('aria-hidden')).toBe('true')
    expect(document.querySelector('.mkt-up .mkt-chg')?.textContent).toContain('+0,77%')
    expect(document.querySelector('.mkt-down .mkt-chg')?.textContent).toContain('−0,25%')
    expect(screen.getAllByText(/No es asesoramiento financiero/).length).toBeGreaterThan(0)
  })
  it('si no hay datos lo dice, en vez de dejar franjas vacías', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 502, json: async () => ({}) })))
    render(<MarketTape />)
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/no disponibles/))
  })
})
