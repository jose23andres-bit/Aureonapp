import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { ChevronLeft, ChevronRight, Copy, Expand, Images, LayoutGrid, MapPin, MessageCircle, Pause, Play, Search, Sparkles, Video, X, Clapperboard } from 'lucide-react'
import { collabDestinations, collabVillas, type CollabVilla } from '../lib/villas-colaboradores'
import { img } from '../lib/content'
import './collab-villas.css'

// 2026 interaction layer: View Transitions API (shared-element card → ficha, animated re-ordering
// when filtering), scroll-driven animations (CSS animation-timeline, progressive enhancement),
// cinematic "Higgsfield-style" transitions recreated in CSS (wipe, zoom-through, Ken Burns),
// 3D tilt with glare on precise pointers, pointer spotlight. Everything degrades gracefully and
// respects prefers-reduced-motion.

const PAGE = 12
const SLIDE_MS = 6500
const STATUS: Record<CollabVilla['status'], string> = { completa: 'Ficha completa', fotos: 'Fotografías · datos bajo petición', pendiente: 'Información bajo petición' }
const FX = ['wipe', 'zoom', 'iris', 'slide'] as const
const src = (path: string, w: number) => img(path.replace('/img/', ''), w)
const vtName = (prefix: string, slug: string) => `${prefix}-${slug.replace(/[^a-z0-9-]/gi, '')}`

type VTDoc = Document & { startViewTransition?: (cb: () => void) => unknown }
/** Runs a state update inside a View Transition when the browser supports it. */
function withTransition(update: () => void) {
  const doc = typeof document !== 'undefined' ? (document as VTDoc) : null
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (doc?.startViewTransition && !reduce) doc.startViewTransition(() => flushSync(update))
  else update()
}
const reducedMotion = () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/** WhatsApp link: if it is a wa.me/<number> link the villa reference is pre-filled; otherwise the plain link is used. */
export function whatsappHref(contact: string, villa: CollabVilla) {
  const text = `Hola, me interesa la villa ${villa.name} (${villa.ref}) de la colección AUREON. ¿Disponibilidad y precio?`
  return /^https:\/\/wa\.me\/\d+/.test(contact) ? `${contact.split('?')[0]}?text=${encodeURIComponent(text)}` : contact
}

function useCountUp(target: number, run: boolean, ms = 1200) {
  const [n, setN] = useState(target)
  useEffect(() => {
    if (!run || reducedMotion()) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / ms); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return n
}

/* ---------------- Cinematic hero reel ---------------- */
function HeroReel({ villas, onOpen }: { villas: CollabVilla[]; onOpen: (v: CollabVilla) => void }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const touch = useRef<number | null>(null)
  const n = villas.length
  const go = useCallback((d: number) => setI(x => (x + d + n) % n), [n])
  useEffect(() => {
    if (paused || n < 2 || reducedMotion()) return
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') go(1) }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [paused, n, go, i])
  if (!n) return null
  const v = villas[i]
  const fx = FX[i % FX.length]
  return (
    <div className="cv-hero" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touch.current = e.touches[0].clientX }} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null }}
      aria-roledescription="carrusel" aria-label="Villas destacadas">
      {villas.map((x, k) => k === i || k === (i - 1 + n) % n ? (
        <div key={x.slug} className={`cv-slide ${k === i ? `is-on fx-${fx}` : 'is-prev'}`} aria-hidden={k !== i}>
          <img src={src(x.images[0], 1600)} alt="" />
        </div>
      ) : null)}
      <div className="cv-hero-shade" aria-hidden="true" />
      <div className="cv-hero-grain" aria-hidden="true" />
      <div className="cv-hero-copy" key={v.slug}>
        <span className="cv-hero-kicker"><Sparkles size={13} /> {v.location}</span>
        <h3 className="cv-hero-title">{v.name.split(' ').map((word, w, all) => { const before = all.slice(0, w).join(' ').length; return <span key={w} className="cv-word">{word.split('').map((ch, k) => <span key={k} style={{ animationDelay: `${120 + (before + k) * 22}ms` }}>{ch}</span>)}{w < all.length - 1 ? ' ' : ''}</span> })}</h3>
        <p>{v.description}</p>
        <div className="cv-hero-actions">
          <button type="button" className="cv-hero-cta" onClick={() => onOpen(v)} aria-label={`Abrir ficha de ${v.name}`}>Descubrir villa <ChevronRight size={16} /></button>
          <span className="cv-hero-ref">{v.ref}</span>
        </div>
      </div>
      <div className="cv-hero-nav">
        <button type="button" onClick={() => go(-1)} aria-label="Villa destacada anterior"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
        <button type="button" onClick={() => go(1)} aria-label="Villa destacada siguiente"><ChevronRight size={18} /></button>
      </div>
      <div className="cv-hero-bars" aria-hidden="true">
        {villas.map((x, k) => <span key={x.slug} className={k < i ? 'is-done' : k === i ? (paused ? 'is-on is-paused' : 'is-on') : ''} style={{ animationDuration: `${SLIDE_MS}ms` }} />)}
      </div>
      <span className="cv-hero-count" aria-live="polite">{String(i + 1).padStart(2, '0')} <i>/ {String(n).padStart(2, '0')}</i></span>
    </div>
  )
}

/* ---------------- Card with 3D tilt, glare and hover preview ---------------- */
function Card({ v, index, openSlug, onOpen }: { v: CollabVilla; index: number; openSlug: string | null; onOpen: (v: CollabVilla) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const facts = Object.entries(v.facts).slice(0, 3)
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion()) return
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * 9}deg`); el.style.setProperty('--ry', `${(x - 0.5) * 11}deg`)
    el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`)
  }
  const reset = () => { const el = ref.current; if (el) { el.style.removeProperty('--rx'); el.style.removeProperty('--ry') } }
  return (
    <button ref={ref} type="button" className={`cv-card cv-${v.status}`} onClick={() => onOpen(v)} onPointerMove={onMove} onPointerLeave={reset}
      style={{ viewTransitionName: vtName('cvc', v.slug), ['--i' as string]: index % PAGE } as React.CSSProperties} aria-label={`Ver ${v.name}, ${v.location}`}>
      <span className="cv-media" style={{ viewTransitionName: openSlug === v.slug ? 'none' : vtName('cvi', v.slug) }}>
        {v.images[0]
          ? <><img src={src(v.images[0], 720)} alt="" loading="lazy" decoding="async" />{v.images[1] && <img className="cv-alt" src={src(v.images[1], 720)} alt="" loading="lazy" decoding="async" />}</>
          : <span className="cv-placeholder" aria-hidden="true"><span>A</span><small>Fotografías bajo petición</small></span>}
        <span className="cv-ref">{v.ref}</span>
        {v.images.length > 1 && <span className="cv-count"><Images size={12} /> {v.images.length}</span>}
        <span className="cv-glare" aria-hidden="true" />
      </span>
      <span className="cv-body">
        <span className="cv-loc"><MapPin size={12} /> {v.location}</span>
        <strong>{v.name}</strong>
        {facts.length ? <span className="cv-facts">{facts.map(([k, val]) => <span key={k}>{val} <small>{k.toLowerCase()}</small></span>)}</span> : <span className="cv-status">{STATUS[v.status]}</span>}
        {v.price?.from && <span className="cv-price">Desde {new Intl.NumberFormat('es-ES').format(v.price.from)} €/semana</span>}
        <span className="cv-go" aria-hidden="true">Ver ficha <ChevronRight size={13} /></span>
      </span>
    </button>
  )
}

/* ---------------- Cinematic detail ---------------- */
function Detail({ v, contact, onClose, onNav }: { v: CollabVilla; contact: string; onClose: () => void; onNav: (d: 1 | -1) => void }) {
  const [i, setI] = useState(0)
  const [dir, setDir] = useState(1)
  const [play, setPlay] = useState(false)
  const [copied, setCopied] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const touch = useRef<number | null>(null)
  const n = v.images.length
  const go = useCallback((d: number) => { if (!n) return; setDir(d); setI(x => (x + d + n) % n) }, [n])
  useEffect(() => { box.current?.focus() }, [v.slug])
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  useEffect(() => {
    if (!play || n < 2) return
    const id = window.setInterval(() => go(1), 3800)
    return () => window.clearInterval(id)
  }, [play, n, go])
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
  }
  async function copyRef() {
    try { await navigator.clipboard.writeText(v.ref); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { /* clipboard unavailable */ }
  }
  const fullscreen = () => { const g = gallery.current as (HTMLDivElement & { requestFullscreen?: () => Promise<void> }) | null; if (document.fullscreenElement) void document.exitFullscreen?.(); else void g?.requestFullscreen?.() }
  const fx = FX[(i + v.slug.length) % FX.length]
  return (
    <div className="cv-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={box} className="cv-dialog" role="dialog" aria-modal="true" aria-label={`${v.name}, ${v.location}`} tabIndex={-1} onKeyDown={onKey}>
        <button type="button" className="cv-close" onClick={onClose} aria-label="Cerrar ficha"><X size={20} /></button>
        <div ref={gallery} className="cv-gallery" style={{ viewTransitionName: vtName('cvi', v.slug) }}
          onTouchStart={e => { touch.current = e.touches[0].clientX }} onTouchEnd={e => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null }}>
          {n ? <img key={v.images[i]} className={`cv-main fx-${fx} ${dir < 0 ? 'is-back' : ''}`} src={src(v.images[i], 1600)} alt={`${v.name}: fotografía ${i + 1} de ${n}`} />
            : <div className="cv-placeholder cv-main" aria-hidden="true"><span>A</span><small>Fotografías bajo petición</small></div>}
          <div className="cv-gallery-shade" aria-hidden="true" />
          {n > 1 && <>
            <button type="button" className="cv-arrow cv-prev" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft size={22} /></button>
            <button type="button" className="cv-arrow cv-next" onClick={() => go(1)} aria-label="Foto siguiente"><ChevronRight size={22} /></button>
            <span className="cv-index">{i + 1} / {n}</span>
            <div className="cv-gallery-tools">
              <button type="button" onClick={() => setPlay(p => !p)} aria-pressed={play} aria-label={play ? 'Detener presentación' : 'Reproducir presentación'}>{play ? <Pause size={15} /> : <Clapperboard size={15} />}</button>
              <button type="button" onClick={fullscreen} aria-label="Pantalla completa"><Expand size={15} /></button>
            </div>
            {play && <span className="cv-play-bar" key={i} aria-hidden="true" />}
          </>}
        </div>
        {n > 1 && <div className="cv-thumbs">{v.images.map((p, k) => <button type="button" key={p} className={k === i ? 'is-on' : ''} onClick={() => { setDir(k > i ? 1 : -1); setI(k) }} aria-label={`Ver foto ${k + 1}`}><img src={src(p, 240)} alt="" loading="lazy" /></button>)}</div>}
        <div className="cv-info">
          <span className="eyebrow">COLECCIÓN COLABORADORES · {v.ref}</span>
          <h3>{v.name}</h3>
          <p className="cv-where"><MapPin size={14} /> {v.location}</p>
          {Object.keys(v.facts).length > 0 && <dl className="cv-dl">{Object.entries(v.facts).map(([k, val], idx) => <div key={k} style={{ animationDelay: `${120 + idx * 70}ms` }}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>}
          {v.description && <p className="cv-desc">{v.description}</p>}
          {v.highlights.length > 0 && <ul className="cv-hl">{v.highlights.map((h, idx) => <li key={h} style={{ animationDelay: `${200 + idx * 70}ms` }}><Sparkles size={12} /> {h}</li>)}</ul>}
          {v.price && <p className="cv-pricebox">{v.price.label}</p>}
          {v.status !== 'completa' && <p className="cv-note">Ficha en preparación: capacidad, servicios y tarifas se facilitan bajo petición.</p>}
          {v.video && <p className="cv-note"><Video size={13} /> Vídeo de la propiedad disponible bajo petición.</p>}
          <div className="cv-cta">
            <a className="cv-wa" href={whatsappHref(contact, v)} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> Consultar por WhatsApp</a>
            <button type="button" className="cv-copy" onClick={() => void copyRef()}><Copy size={12} /> {copied ? 'Referencia copiada' : `Ref. ${v.ref}`}</button>
          </div>
          <small className="cv-legal">Fotografías y datos facilitados por colaboradores. Disponibilidad, precio y condiciones se confirman personalmente antes de cualquier reserva; AUREON no procesa pagos desde la web.</small>
          <div className="cv-nav"><button type="button" onClick={() => onNav(-1)}><ChevronLeft size={14} /> Anterior</button><button type="button" onClick={() => onNav(1)}>Siguiente <ChevronRight size={14} /></button></div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Section ---------------- */
export function CollabVillas({ contact }: { contact: string }) {
  const [dest, setDest] = useState('todos')
  const [q, setQ] = useState('')
  const [onlyComplete, setOnlyComplete] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'cine'>('grid')
  const [limit, setLimit] = useState(PAGE)
  const [open, setOpen] = useState<CollabVilla | null>(null)
  const [seen, setSeen] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)

  const featured = useMemo(() => collabVillas.filter(v => v.status === 'completa' && v.images.length >= 3), [])
  const list = useMemo(() => {
    const term = q.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const rank = { completa: 0, fotos: 1, pendiente: 2 }
    return collabVillas
      .filter(v => dest === 'todos' || v.destination === dest)
      .filter(v => !onlyComplete || v.status === 'completa')
      .filter(v => !term || `${v.name} ${v.location} ${v.ref} ${v.highlights.join(' ')}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term))
      .sort((a, b) => rank[a.status] - rank[b.status])
  }, [dest, q, onlyComplete])

  // Enables the reveal styles only once JS runs (no-JS / SSR shows cards normally).
  useEffect(() => { root.current?.classList.add('cv-js') }, [])

  // Scroll reveal (staggered) + count-up trigger.
  useEffect(() => {
    const el = grid.current
    if (!el) return
    const cards = [...el.querySelectorAll<HTMLElement>('.cv-card')]
    if (typeof IntersectionObserver === 'undefined' || reducedMotion()) { cards.forEach(c => c.classList.add('is-in')); return }
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    cards.forEach(c => io.observe(c))
    return () => io.disconnect()
  }, [list, limit, layout])
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Deep link: /alquiler-villas#villa-<slug> opens the villa directly (shareable).
  useEffect(() => {
    const fromHash = () => { const m = window.location.hash.match(/^#villa-(.+)$/); setOpen(m ? collabVillas.find(v => v.slug === m[1]) || null : null) }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  const show = (v: CollabVilla) => { lastFocus.current = document.activeElement as HTMLElement; withTransition(() => setOpen(v)); history.replaceState(null, '', `#villa-${v.slug}`) }
  const close = () => { withTransition(() => setOpen(null)); history.replaceState(null, '', window.location.pathname + window.location.search); window.setTimeout(() => lastFocus.current?.focus(), 0) }
  const nav = (d: 1 | -1) => { if (!open) return; const pool = list.length ? list : collabVillas; const k = pool.findIndex(v => v.slug === open.slug); const next = pool[(k + d + pool.length) % pool.length]; withTransition(() => setOpen(next)); history.replaceState(null, '', `#villa-${next.slug}`) }
  const filter = (fn: () => void) => withTransition(() => { fn(); setLimit(PAGE) })
  const spotlight = (e: React.PointerEvent) => { if (e.pointerType !== 'mouse') return; const el = root.current; if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty('--sx', `${e.clientX - r.left}px`); el.style.setProperty('--sy', `${e.clientY - r.top}px`) }

  const total = collabVillas.length
  const villasN = useCountUp(total, seen)
  const destN = useCountUp(collabDestinations.length, seen)
  const photosN = useCountUp(collabVillas.reduce((s, v) => s + v.images.length, 0), seen, 1600)
  return (
    <section ref={root} id="villas-colaboradores" className="cv" aria-labelledby="cv-title" onPointerMove={spotlight}>
      <span className="cv-spot" aria-hidden="true" />
      <HeroReel villas={featured} onOpen={show} />
      <div className="cv-head">
        <span className="eyebrow">COLECCIÓN PRIVADA · COLABORADORES 2026</span>
        <h2 id="cv-title">Villas por el <em>mundo.</em></h2>
        <p>De Mykonos a Tulum. Abre cualquier ficha y consúltala por WhatsApp con su referencia.</p>
        <div className="cv-stats" aria-label={`${total} villas, ${collabDestinations.length} destinos`}>
          <span><b>{villasN}</b> villas</span><span><b>{destN}</b> destinos</span><span><b>{photosN}</b> fotografías</span>
        </div>
      </div>
      <div className="cv-bar">
        <div className="cv-dests" role="group" aria-label="Filtrar por destino">
          <button type="button" aria-pressed={dest === 'todos'} className={dest === 'todos' ? 'is-on' : ''} onClick={() => filter(() => setDest('todos'))}>Todos <small>{total}</small></button>
          {collabDestinations.map(d => <button type="button" key={d.id} aria-pressed={dest === d.id} className={dest === d.id ? 'is-on' : ''} onClick={() => filter(() => setDest(d.id))}>{d.name} <small>{d.count}</small></button>)}
        </div>
        <div className="cv-tools">
          <label className="cv-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Buscar villa</span><input value={q} onChange={e => { setQ(e.target.value); setLimit(PAGE) }} placeholder="Buscar por nombre, zona o referencia" /></label>
          <label className="cv-toggle"><input type="checkbox" checked={onlyComplete} onChange={e => { const c = e.target.checked; filter(() => setOnlyComplete(c)) }} /> Solo fichas completas</label>
          <div className="cv-layout" role="group" aria-label="Vista">
            <button type="button" aria-pressed={layout === 'grid'} className={layout === 'grid' ? 'is-on' : ''} onClick={() => withTransition(() => setLayout('grid'))} aria-label="Vista en cuadrícula"><LayoutGrid size={15} /></button>
            <button type="button" aria-pressed={layout === 'cine'} className={layout === 'cine' ? 'is-on' : ''} onClick={() => withTransition(() => setLayout('cine'))} aria-label="Vista cine"><Clapperboard size={15} /></button>
          </div>
          <span className="cv-result" aria-live="polite">{list.length} {list.length === 1 ? 'villa' : 'villas'}</span>
        </div>
      </div>
      {list.length ? (
        <div ref={grid} className={layout === 'cine' ? 'cv-grid cv-cine' : 'cv-grid'}>{(layout === 'cine' ? list : list.slice(0, limit)).map((v, k) => <Card key={v.slug} v={v} index={k} openSlug={open?.slug || null} onOpen={show} />)}</div>
      ) : <p className="cv-empty">No hay villas con esos filtros. <button type="button" onClick={() => filter(() => { setQ(''); setDest('todos'); setOnlyComplete(false) })}>Ver todas</button></p>}
      {layout === 'grid' && list.length > limit && <div className="cv-more"><button type="button" onClick={() => setLimit(l => l + PAGE)}>Ver más villas ({list.length - limit})</button></div>}
      {open && typeof document !== 'undefined' && createPortal(<div className="cv-portal"><Detail key={open.slug} v={open} contact={contact} onClose={close} onNav={nav} /></div>, document.body)}
    </section>
  )
}
