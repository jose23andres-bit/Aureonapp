import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { CollabVillas, whatsappHref } from './collab-villas'
import { collabDestinations, collabVillas } from '../lib/villas-colaboradores'

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/') })
const WA = 'https://wa.me/message/HZA7ZUG4DJ7ZK1'

describe('Villas colaboradores', () => {
  it('incluye las 39 villas de los 10 destinos, con referencias únicas', () => {
    expect(collabVillas).toHaveLength(39)
    expect(collabDestinations).toHaveLength(10)
    expect(new Set(collabVillas.map(v => v.ref)).size).toBe(39)
    expect(collabDestinations.reduce((n, d) => n + d.count, 0)).toBe(39)
  })
  it('no inventa: solo las fichas con descripción del dosier se marcan como completas', () => {
    for (const v of collabVillas) if (v.status === 'completa') expect(v.description.length).toBeGreaterThan(20)
    for (const v of collabVillas) if (!v.description) expect(Object.keys(v.facts)).toHaveLength(0)
  })
  it('filtra por destino y por búsqueda, y muestra las fichas completas primero', () => {
    render(<CollabVillas contact={WA} />)
    fireEvent.click(screen.getByRole('button', { name: /Mykonos 4/ }))
    expect(screen.getByText('4 villas')).toBeTruthy()
    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/), { target: { value: 'ornos' } })
    expect(screen.getByText('2 villas')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ver Villa Sculpture/ })).toBeTruthy()
  })
  it('abre la ficha, navega por las fotos, enlaza a WhatsApp y se cierra con Escape', () => {
    render(<CollabVillas contact={WA} />)
    fireEvent.click(screen.getByRole('button', { name: /Mónaco y Riviera/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ver Villa Cap Ferrat/ }))
    const dialog = screen.getByRole('dialog', { name: /Villa Cap Ferrat/ })
    expect(window.location.hash).toBe('#villa-villa-0-monaco')
    expect(within(dialog).getByText('14')).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Foto siguiente' }))
    expect(within(dialog).getByText(/2 \//)).toBeTruthy()
    const wa = within(dialog).getByRole('link', { name: /Consultar por WhatsApp/ })
    expect(wa.getAttribute('href')).toBe(WA)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
  it('con un enlace wa.me/<número> rellena el mensaje con la referencia de la villa', () => {
    const v = collabVillas.find(x => x.slug === 'villa-3-marbella')!
    expect(decodeURIComponent(whatsappHref('https://wa.me/34600000000', v))).toContain('Villa Sierra Blanca (AUR-MAR-04)')
  })
  it('el enlace #villa-<slug> abre la ficha directamente (compartible)', () => {
    window.history.replaceState(null, '', '/alquiler-villas#villa-villa-1-tulum')
    render(<CollabVillas contact={WA} />)
    expect(screen.getByRole('dialog', { name: /Casa Tulum/ })).toBeTruthy()
  })
  it('todas las imágenes referenciadas existen en public/', async () => {
    const fs = await import('node:fs')
    for (const v of collabVillas) for (const p of v.images) expect(fs.existsSync(`public${p}`), p).toBe(true)
  })
})
