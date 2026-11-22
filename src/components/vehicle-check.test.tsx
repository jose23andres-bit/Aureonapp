import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { VehicleCheck, vinProblem } from './vehicle-check'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

const result = {
  vin: 'WP0AB2A99LS227654', region: 'Alemania', wmi: 'WP0', checkDigit: { expected: '0', actual: '9', valid: false },
  spec: { make: 'PORSCHE', model: '911', year: '2020', trim: 'Carrera S / Carrera 4S', body: 'Coupe', drive: '', fuel: 'Gasoline', transmission: '', engine: '6 cilindros · 3.0 L', doors: '2', manufacturer: 'DR. ING. H.C.F. PORSCHE AG', plant: 'STUTTGART, GERMANY' },
  decoderNotes: [], recalls: { available: true, items: [{ id: '24V155000', date: '28/02/2024', component: 'VISIBILITY:WINDSHIELD', summary: 'Parabrisas mal fijado.', remedy: 'Sustitución.' }] },
}

describe('AUREON Vehicle Check', () => {
  it('valida el bastidor antes de llamar al servidor', () => {
    expect(vinProblem('')).toMatch(/Escribe/)
    expect(vinProblem('WP0AB2A99LS22765O')).toMatch(/I, O ni Q/)
    expect(vinProblem('WP0AB2A99')).toMatch(/tiene 9/)
    expect(vinProblem('wp0ab2a99ls227654')).toBe('')
  })
  it('no consulta nada con un VIN inválido', () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    render(<VehicleCheck />)
    fireEvent.change(screen.getByLabelText(/Número de bastidor/), { target: { value: 'ABC' } })
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }))
    expect(screen.getByRole('alert').textContent).toMatch(/17/)
    expect(f).not.toHaveBeenCalled()
  })
  it('muestra ficha, llamadas a revisión, checklist y los enlaces a carVertical y DGT', async () => {
    const f = vi.fn(async () => ({ ok: true, json: async () => result })); vi.stubGlobal('fetch', f)
    render(<VehicleCheck />)
    fireEvent.change(screen.getByLabelText(/Número de bastidor/), { target: { value: 'wp0ab2a99ls227654' } })
    expect(screen.getByText('17/17')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/ }))
    await waitFor(() => expect(screen.getByText('PORSCHE 911 · 2020')).toBeTruthy())
    expect(String((f.mock.calls[0] as unknown[])[0])).toContain('vin=WP0AB2A99LS227654')
    expect(screen.getByText('VISIBILITY:WINDSHIELD')).toBeTruthy()
    expect(screen.getByText('Gasolina')).toBeTruthy()
    expect(screen.getByText(/Fabricado en Alemania/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /carVertical/ }).getAttribute('rel')).toContain('sponsored')
    expect(screen.getByRole('link', { name: /DGT/ }).getAttribute('href')).toContain('sede.dgt.gob.es')
  })
})
