import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AILab } from './ai-lab'

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ webKitsAvailable: false }) }))
})

describe('Aureon AI Lab', () => {
  it('muestra el catálogo y filtra por categoría', async () => {
    render(<AILab />)
    expect(screen.getByRole('heading', { name: /encuentra la skill/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /react best practices/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Diseño' }))
    expect(screen.getByRole('heading', { name: /web design guidelines/i })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /react best practices/i })).toBeNull()
  })

  it('filtra el catálogo por texto y muestra el estado vacío', () => {
    render(<AILab />)
    fireEvent.change(screen.getByRole('textbox', { name: /buscar habilidades/i }), { target: { value: 'react native' } })
    expect(screen.getByRole('heading', { name: /react native skills/i })).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox', { name: /buscar habilidades/i }), { target: { value: 'esto-no-existe' } })
    expect(screen.getByText(/no hay resultados/i)).toBeTruthy()
  })

  it('muestra el enlace de pago de Revolut por 50 € y explica la entrega manual', () => {
    render(<AILab />)
    const checkout = screen.getByRole('link', { name: /comprar el kit completo · 50 €/i })
    expect(checkout.getAttribute('href')).toBe('https://checkout.revolut.com/pay/05b79b03-6b72-4137-a578-690049bfeaee')
    expect(checkout.getAttribute('target')).toBe('_blank')
    expect(screen.getByText(/entrega del paquete digital se realiza manualmente/i)).toBeTruthy()
  })
})
