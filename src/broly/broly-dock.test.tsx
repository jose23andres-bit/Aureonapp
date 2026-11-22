import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { BrolyDock } from './broly-dock'
import { BrolyAvatar, Warrior } from './warrior'

let token = ''
vi.mock('../lib/supabase', () => ({ getAccessToken: () => token }))

const status = { google: null, tasks: [], activity: [], ai: { configured: true, provider: 'openai', model: 'gpt-4o-mini' }, capabilities: [] }
const proposed = { id: 'a1', conversation_id: 'c1', tool: 'save_memory', label: 'Guardar un recuerdo', summary: 'Recordar (preferencia): «viñetas»', risk: 'escritura-interna', status: 'proposed', result: null, verification: null, error_message: null, created_at: '2026-10-18T10:00:00Z', expires_at: '2026-10-18T10:30:00Z', requiresApproval: true }

function api(routes: Record<string, (body: unknown) => unknown>) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    const action = new URL(url, 'https://x').searchParams.get('action') || ''
    const h = routes[action]
    if (!h) return { ok: false, status: 404, json: async () => ({ error: `no route ${action}` }) }
    return { ok: true, status: 200, json: async () => h(init?.body ? JSON.parse(String(init.body)) : undefined) }
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

beforeEach(() => { token = '' })
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('Guerrero BROLY', () => {
  it('usa ids de gradiente únicos por instancia (sin colisiones con varios guerreros)', () => {
    render(<><Warrior state="idle" /><Warrior state="speaking" /></>)
    const ids = Array.from(document.querySelectorAll('linearGradient, radialGradient')).map(g => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('ya no existe la libélula: ningún avatar menciona una libélula', () => {
    render(<BrolyAvatar state="idle" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toMatch(/libélula/)
  })
})

describe('BrolyDock', () => {
  it('no aparece para visitantes sin sesión de administrador', () => {
    render(<BrolyDock />)
    expect(document.body.innerHTML).toBe('<div></div>')
  })

  it('con sesión: abre el panel, muestra el modelo y se cierra devolviendo el foco', async () => {
    token = 'admin'
    api({ status: () => status, conversation: () => ({ conversationId: null, messages: [], actions: [] }) })
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    const dialog = screen.getByRole('dialog', { name: /BROLY/ })
    await waitFor(() => expect(within(dialog).getByText(/IA gpt-4o-mini/)).toBeTruthy())
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /Abrir BROLY/ })))
  })

  it('envía un mensaje, muestra la propuesta y solo ejecuta al aprobar', async () => {
    token = 'admin'
    let conversation = { conversationId: null as string | null, messages: [] as unknown[], actions: [] as unknown[] }
    const fetchMock = api({
      status: () => status,
      conversation: () => conversation,
      chat: () => ({
        conversationId: 'c1',
        userMessage: { id: 'u1', role: 'user', content: 'Recuerda que prefiero viñetas', created_at: '2026-10-18T10:00:00Z' },
        assistantMessage: { id: 'm1', role: 'assistant', content: 'Te propongo recordarlo.', metadata: { mode: 'ai', actionIds: ['a1'] }, created_at: '2026-10-18T10:00:01Z' },
        actions: [proposed],
      }),
      'action-decide': () => {
        const done = { ...proposed, status: 'verified', verification: { ok: true, detail: 'El recuerdo está guardado y coincide con lo aprobado.', checkedAt: '' } }
        conversation = { conversationId: 'c1', messages: [{ id: 'm1', role: 'assistant', content: 'Te propongo recordarlo.', metadata: { actionIds: ['a1'] }, created_at: '2026-10-18T10:00:01Z' }], actions: [done] }
        return { action: done }
      },
    })
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    await waitFor(() => expect(screen.getByText(/IA gpt-4o-mini/)).toBeTruthy())
    fireEvent.change(screen.getByLabelText('Mensaje para BROLY'), { target: { value: 'Recuerda que prefiero viñetas' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(screen.getByText('Propuesta · pendiente de tu aprobación')).toBeTruthy())
    expect(fetchMock.mock.calls.some(c => String(c[0]).includes('action-decide'))).toBe(false)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Aprobar y ejecutar/ })) })
    await waitFor(() => expect(screen.getByText('Completada y verificada')).toBeTruthy())
    expect(screen.getByText(/coincide con lo aprobado/)).toBeTruthy()
    const decideCall = fetchMock.mock.calls.find(c => String(c[0]).includes('action-decide'))!
    expect(JSON.parse(String(decideCall[1]!.body))).toMatchObject({ actionId: 'a1', decision: 'approve' })
  })

  it('muestra errores reales del servidor (p. ej., sesión caducada) sin inventar respuestas', async () => {
    token = 'admin'
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: 'x' }) })))
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/sesión ha caducado/))
  })

  it('memoria: lista, corrige y borra recuerdos', async () => {
    token = 'admin'
    let memories = [{ id: 'm1', content: 'Prefiere viñetas', category: 'preferencia', source: 'user', created_at: '2026-10-18T10:00:00Z', updated_at: '2026-10-18T10:00:00Z' }]
    const fetchMock = api({
      status: () => status, conversation: () => ({ conversationId: null, messages: [], actions: [] }),
      memories: () => ({ memories }),
      'memory-delete': () => { memories = []; return { ok: true } },
    })
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    fireEvent.click(screen.getByRole('button', { name: /Memoria/ }))
    await waitFor(() => expect(screen.getByText('Prefiere viñetas')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: /Corregir recuerdo/ }))
    expect((screen.getByLabelText('Contenido del recuerdo') as HTMLTextAreaElement).value).toBe('Prefiere viñetas')
    fireEvent.click(screen.getByRole('button', { name: /Borrar recuerdo/ }))
    await waitFor(() => expect(screen.getByText('Todavía no hay recuerdos.')).toBeTruthy())
    expect(fetchMock.mock.calls.some(c => String(c[0]).includes('memory-delete'))).toBe(true)
  })

  it('dictado: avisa si el navegador no lo admite en lugar de fingir que escucha', async () => {
    token = 'admin'
    api({ status: () => status, conversation: () => ({ conversationId: null, messages: [], actions: [] }) })
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Dictar por voz' }))
    expect(screen.getByRole('alert').textContent).toMatch(/no ofrece dictado/)
  })
})

describe('Voz de BROLY', () => {
  it('elige una voz masculina de español de España si el dispositivo la tiene', async () => {
    const { pickBrolyVoice } = await import('./speech')
    const v = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice
    expect(pickBrolyVoice([v('Mónica', 'es-ES'), v('Jorge', 'es-ES'), v('Samantha', 'en-US')])?.name).toBe('Jorge')
    expect(pickBrolyVoice([v('Paulina', 'es-MX'), v('Mónica', 'es-ES')])?.name).toBe('Mónica')
    expect(pickBrolyVoice([v('Samantha', 'en-US')])).toBeNull()
  })
})

describe('Voz premium en el panel', () => {
  it('con voz premium activa, lee la respuesta con la voz IA y muestra el aviso de voz generada por IA', async () => {
    token = 'admin'
    window.localStorage.setItem('broly_voice_replies', '1')
    const play = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    URL.createObjectURL = vi.fn(() => 'blob:voz')
    URL.revokeObjectURL = vi.fn()
    const premiumStatus = { ...status, voice: { premium: true, provider: 'openai', voice: 'onyx', model: 'gpt-4o-mini-tts' } }
    const fetchMock = vi.fn(async (url: string) => {
      const action = new URL(url, 'https://x').searchParams.get('action')
      if (action === 'tts') return { ok: true, status: 200, blob: async () => new Blob(['mp3']), json: async () => ({}) }
      const data = action === 'status' ? premiumStatus : action === 'conversation' ? { conversationId: null, messages: [], actions: [] }
        : { conversationId: 'c1', userMessage: { id: 'u1', role: 'user', content: 'hola', created_at: '' }, assistantMessage: { id: 'm1', role: 'assistant', content: 'Buenos días, José Andrés.', metadata: { mode: 'ai' }, created_at: '2026-10-18T10:00:00Z' }, actions: [] }
      return { ok: true, status: 200, json: async () => data }
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<BrolyDock />)
    fireEvent.click(screen.getByRole('button', { name: /Abrir BROLY/ }))
    await waitFor(() => expect(screen.getByText(/generada por IA \(OpenAI\)/)).toBeTruthy())
    fireEvent.change(screen.getByLabelText('Mensaje para BROLY'), { target: { value: 'hola' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(c => String(c[0]).includes('action=tts'))).toBe(true))
    const ttsCall = fetchMock.mock.calls.find(c => String(c[0]).includes('action=tts'))!
    expect(JSON.parse(String((ttsCall as unknown as [string, RequestInit])[1].body))).toEqual({ text: 'Buenos días, José Andrés.' })
    await waitFor(() => expect(play).toHaveBeenCalled())
    window.localStorage.removeItem('broly_voice_replies')
  })
})

describe('Transformación en guerrero', () => {
  it('siempre es guerrero: forma base en reposo y se transforma al escuchar, pensar, responder o ejecutar', () => {
    const { rerender } = render(<BrolyAvatar state="idle" />)
    expect(document.querySelector('[data-form]')?.getAttribute('data-form')).toBe('warrior')
    expect(document.querySelector('[data-power]')?.getAttribute('data-power')).toBe('off')
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/modo guerrero, en reposo/)
    for (const s of ['listening', 'thinking', 'speaking', 'executing'] as const) {
      rerender(<BrolyAvatar state={s} />)
      expect(document.querySelector('[data-form]')?.getAttribute('data-form')).toBe('warrior')
      expect(document.querySelector('[data-power]')?.getAttribute('data-power')).toBe('on')
      expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/modo guerrero/)
    }
    rerender(<BrolyAvatar state="active" />)
    expect(document.querySelector('[data-power]')?.getAttribute('data-power')).toBe('off')
  })
  it('el guerrero es un diseño propio: sin pelo verde y con el emblema dorado de AUREON', () => {
    render(<Warrior state="speaking" />)
    const hairStops = [...document.querySelectorAll('linearGradient')][0].querySelectorAll('stop')
    expect([...hairStops].map(x => x.getAttribute('stop-color'))).toEqual(['#fff7d1', '#f5c84c', '#c9861b'])
    expect(document.querySelector('svg')?.getAttribute('data-state')).toBe('speaking')
  })
})
