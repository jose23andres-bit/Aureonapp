import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Broly } from './broly'

vi.mock('../lib/supabase', () => ({ getAccessToken: () => 'test-admin-token' }))
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('BROLY Phase 1 workspace', () => {
  it('renders the first automation and keeps Google actions explicitly read-only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ google: null, tasks: [], activity: [] }) }))
    render(<Broly />)
    expect(screen.getByRole('heading', { level: 1, name: /BROLY/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Resumen ejecutivo diario/i })).toBeTruthy()
    expect(screen.getAllByText(/No envía mensajes/i).length).toBeGreaterThan(0)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
  })

  it('records a typed instruction and refreshes task/activity state', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ google: null, tasks: [], activity: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ message: 'Instrucción registrada.' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ google: null, tasks: [], activity: [{ id: 1, event_type: 'instruction_logged', message: 'Instrucción registrada', created_at: new Date().toISOString() }] }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<Broly />)
    fireEvent.change(screen.getByLabelText('Tu instrucción'), { target: { value: 'Prepara mi resumen de hoy' } })
    fireEvent.click(screen.getByRole('button', { name: /Registrar instrucción/i }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Instrucción registrada.'))
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ text: 'Prepara mi resumen de hoy' })
  })
})
