/// <reference types="node" />
// "Radar BROLY" PDF report: cover with figures, demand by category and one card per lead with a
// clickable link to the public post. pdf-lib only (no native deps), WinAnsi text via ansi().
import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { ansi } from '../contracts/pdf'
import type { Lead } from './filter'
import { categoryById } from './sources'

const A4 = { w: 595.28, h: 841.89 }, M = 42
const NIGHT = rgb(0.055, 0.055, 0.047), GOLD = rgb(0.78, 0.63, 0.36), GOLD_SOFT = rgb(0.96, 0.92, 0.84), INK = rgb(0.11, 0.11, 0.1), MUTED = rgb(0.43, 0.43, 0.4), LINE = rgb(0.86, 0.83, 0.77), WHITE = rgb(1, 1, 1)
const URG = { alta: rgb(0.78, 0.25, 0.2), media: rgb(0.85, 0.6, 0.18), baja: rgb(0.45, 0.55, 0.45) } as const

export type ReportMeta = { city: string; from: Date; to: Date; requests: number; found: number; aiUsed: boolean; retentionDays: number; ref: string }

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', ...opts }).format(d)

function wrap(text: string, font: PDFFont, size: number, width: number, max = 99) {
  const out: string[] = []
  let line = ''
  for (const word of ansi(text).split(/\s+/)) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > width && line) { out.push(line); line = word } else line = test
  }
  if (line) out.push(line)
  if (out.length > max) { out.length = max; out[max - 1] = out[max - 1].replace(/\s*\S*$/, '') + '...' }
  return out
}

function link(doc: PDFDocument, page: PDFPage, rect: [number, number, number, number], url: string) {
  const annot = doc.context.register(doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: rect, Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }))
  const annots = page.node.lookup(PDFName.of('Annots'))
  if (annots && 'push' in annots) (annots as unknown as { push: (x: unknown) => void }).push(annot)
  else page.node.set(PDFName.of('Annots'), doc.context.obj([annot]))
}

export async function renderLeadReport(leads: Lead[], meta: ReportMeta) {
  const doc = await PDFDocument.create()
  doc.setTitle(ansi(`Radar BROLY · ${meta.ref}`)); doc.setAuthor('AUREON AI PROJECT · BROLY'); doc.setCreator('BROLY'); doc.setProducer('AUREON AI PROJECT')
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold), serif = await doc.embedFont(StandardFonts.TimesRoman), serifI = await doc.embedFont(StandardFonts.TimesRomanItalic)
  let page!: PDFPage, y = 0, n = 0
  const text = (s: string, x: number, yy: number, size: number, f: PDFFont = font, color = INK) => page.drawText(ansi(s), { x, y: yy, size, font: f, color })
  const footer = () => {
    text(`Radar BROLY · ${meta.ref} · página ${n}`, M, 24, 7, font, MUTED)
    const r = 'AUREON AI PROJECT'
    text(r, A4.w - M - bold.widthOfTextAtSize(r, 7), 24, 7, bold, GOLD)
  }
  const newPage = (cover = false) => {
    page = doc.addPage([A4.w, A4.h]); n++
    if (!cover) {
      page.drawRectangle({ x: 0, y: A4.h - 5, width: A4.w, height: 5, color: GOLD })
      text('RADAR BROLY', M, A4.h - 30, 8, bold, GOLD)
      const d = fmt(meta.to, { dateStyle: 'long', timeStyle: 'short' })
      text(d, A4.w - M - font.widthOfTextAtSize(ansi(d), 7.5), A4.h - 30, 7.5, font, MUTED)
      y = A4.h - 56
    }
    footer()
  }
  const need = (h: number) => { if (y - h < 48) newPage() }

  // ---- Cover
  newPage(true)
  page.drawRectangle({ x: 0, y: A4.h - 300, width: A4.w, height: 300, color: NIGHT })
  page.drawRectangle({ x: 0, y: A4.h - 303, width: A4.w, height: 3, color: GOLD })
  for (let i = 0; i < 9; i++) page.drawCircle({ x: A4.w - 70, y: A4.h - 150, size: 22 + i * 15, borderColor: GOLD, borderWidth: 0.35, borderOpacity: 0.5 - i * 0.05 })
  page.drawCircle({ x: A4.w - 70, y: A4.h - 150, size: 4, color: GOLD })
  text('AUREON AI PROJECT · BROLY', M, A4.h - 62, 8.5, bold, GOLD)
  text('Radar de oportunidades', M, A4.h - 118, 34, serif, WHITE)
  text(`Personas que buscan lo que ofreces · ${meta.city}`, M, A4.h - 146, 12, serifI, GOLD_SOFT)
  text(`${fmt(meta.from, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}  ->  ${fmt(meta.to, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, M, A4.h - 172, 9, font, rgb(0.75, 0.74, 0.7))
  text(`Informe ${meta.ref}`, M, A4.h - 270, 8, font, rgb(0.6, 0.6, 0.56))

  const urgent = leads.filter(l => l.urgency === 'alta').length
  const cats = new Map<string, number>()
  for (const l of leads) cats.set(l.category, (cats.get(l.category) || 0) + 1)
  const kpis: Array<[string, string]> = [[String(leads.length), 'oportunidades nuevas'], [String(urgent), 'urgentes'], [String(cats.size), 'categorías con demanda'], [String(meta.requests), 'búsquedas realizadas']]
  const kw = (A4.w - 2 * M - 3 * 10) / 4
  kpis.forEach(([v, l], i) => {
    const x = M + i * (kw + 10), top = A4.h - 330
    page.drawRectangle({ x, y: top - 70, width: kw, height: 70, color: GOLD_SOFT, borderColor: LINE, borderWidth: 0.6 })
    text(v, x + 12, top - 38, 26, serif, INK)
    text(l, x + 12, top - 56, 7.6, font, MUTED)
  })
  y = A4.h - 430

  // Demand by category (bar chart)
  text('DEMANDA POR CATEGORÍA', M, y, 8.5, bold, GOLD); y -= 8
  page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 0.6, color: LINE }); y -= 18
  const max = Math.max(1, ...cats.values())
  const sorted = [...cats.entries()].sort((a, b) => b[1] - a[1])
  if (!sorted.length) { text('Sin peticiones nuevas en esta ventana. BROLY seguirá buscando en el próximo turno.', M, y, 10, serifI, MUTED); y -= 20 }
  for (const [id, count] of sorted) {
    const label = categoryById(id)?.label || id
    text(label, M, y, 8.6, font, INK)
    const bx = M + 170, bw = (A4.w - M - bx - 30) * (count / max)
    page.drawRectangle({ x: bx, y: y - 2, width: A4.w - M - bx - 30, height: 9, color: rgb(0.95, 0.94, 0.91) })
    page.drawRectangle({ x: bx, y: y - 2, width: Math.max(4, bw), height: 9, color: GOLD })
    text(String(count), A4.w - M - 20, y, 8.6, bold, INK)
    y -= 17
  }
  y -= 12
  const top3 = leads.slice(0, 3)
  if (top3.length) {
    text('PRIORIDAD DE HOY', M, y, 8.5, bold, GOLD); y -= 8
    page.drawLine({ start: { x: M, y }, end: { x: A4.w - M, y }, thickness: 0.6, color: LINE }); y -= 16
    top3.forEach((l, i) => { for (const [j, line] of wrap(`${i + 1}. ${l.request}`, font, 9, A4.w - 2 * M, 2).entries()) { text(line, M, y, 9, j ? font : bold, INK); y -= 12 } y -= 4 })
  }
  y = Math.min(y, 120)
  for (const line of wrap('Cómo se elabora: BROLY consulta resultados públicos ya indexados por Brave Search (título y extracto), descarta anuncios y ofertas y se queda con las personas que piden algo. No entra en los portales ni en cuentas privadas. Los teléfonos y emails se ocultan: contacta siempre a través de la propia publicación.', font, 7.4, A4.w - 2 * M)) { text(line, M, y, 7.4, font, MUTED); y -= 10 }

  // ---- Cards grouped by category
  const card = (l: Lead) => {
    const reqLines = wrap(l.request, bold, 10, A4.w - 2 * M - 30, 3)
    const ctxLines = wrap(l.title !== l.request ? l.title : l.snippet, font, 8, A4.w - 2 * M - 30, 2)
    const stepLines = wrap(`Siguiente paso: ${l.next_step}`, font, 8, A4.w - 2 * M - 30, 2)
    return { reqLines, ctxLines, stepLines, h: 30 + reqLines.length * 13 + ctxLines.length * 10 + stepLines.length * 10 + (l.sensitive ? 12 : 0) + 18 }
  }
  if (leads.length) newPage()
  let firstGroup = true
  for (const [id] of sorted) {
    const group = leads.filter(l => l.category === id)
    if (!firstGroup) y -= 16
    firstGroup = false
    need(32 + card(group[0]).h) // a category title never stays alone at the bottom of a page
    page.drawRectangle({ x: M, y: y - 4, width: 3, height: 16, color: GOLD })
    text(categoryById(id)?.label || id, M + 10, y, 15, serif, INK)
    text(`${group.length} ${group.length === 1 ? 'oportunidad' : 'oportunidades'}`, A4.w - M - 80, y + 2, 8, font, MUTED)
    y -= 22
    for (const l of group) {
      const { reqLines, ctxLines, stepLines, h } = card(l)
      need(h + 10)
      const top = y
      page.drawRectangle({ x: M, y: top - h, width: A4.w - 2 * M, height: h, color: WHITE, borderColor: LINE, borderWidth: 0.7 })
      page.drawRectangle({ x: M, y: top - h, width: 4, height: h, color: URG[l.urgency] })
      let cy = top - 16
      const badge = `URGENCIA ${l.urgency.toUpperCase()}`
      const bw = bold.widthOfTextAtSize(badge, 6.5) + 10
      page.drawRectangle({ x: M + 16, y: cy - 3, width: bw, height: 11, color: URG[l.urgency] })
      text(badge, M + 21, cy, 6.5, bold, WHITE)
      text(`${l.score}/100${l.ai ? ' · revisado por IA' : ''}`, M + 22 + bw, cy, 7, font, MUTED)
      const meta2 = [l.zone ? `Zona: ${l.zone}` : 'Zona: no indicada', l.source, l.age ? `publicado ${fmtAge(l.age)}` : ''].filter(Boolean).join('  ·  ')
      text(meta2, A4.w - M - 12 - font.widthOfTextAtSize(ansi(meta2), 7), cy, 7, font, MUTED)
      cy -= 18
      for (const line of reqLines) { text(line, M + 16, cy, 10, bold, INK); cy -= 13 }
      for (const line of ctxLines) { text(line, M + 16, cy, 8, font, MUTED); cy -= 10 }
      cy -= 2
      for (const line of stepLines) { text(line, M + 16, cy, 8, font, INK); cy -= 10 }
      if (l.sensitive) { text('Dato sensible (salud): no guardar ni pedir datos médicos; solo derivar a una clínica autorizada.', M + 16, cy, 7.4, bold, URG.alta); cy -= 12 }
      const lt = 'Abrir publicación  ->'
      text(lt, M + 16, cy - 2, 8.4, bold, GOLD)
      link(doc, page, [M + 14, cy - 6, M + 20 + bold.widthOfTextAtSize(lt, 8.4), cy + 8], l.url)
      const shown = l.url.length > 70 ? l.url.slice(0, 70) + '...' : l.url
      text(shown, M + 26 + bold.widthOfTextAtSize(lt, 8.4), cy - 2, 7, font, MUTED)
      y = top - h - 10
    }
    y -= 8
  }
  if (leads.length) {
    need(40)
    for (const line of wrap(`Uso responsable: estas publicaciones son públicas, pero las personas no te han dado permiso para que les escribas por otros canales (LSSI art. 21 y RGPD). Contesta en el propio anuncio o hilo y respeta las normas de cada web. BROLY borra estos registros a los ${meta.retentionDays} días.`, font, 7.4, A4.w - 2 * M)) { text(line, M, y, 7.4, font, MUTED); y -= 10 }
  }
  return await doc.save()
}

function fmtAge(age: string) {
  const d = new Date(age)
  if (!Number.isNaN(d.getTime())) return fmt(d, { day: 'numeric', month: 'short' })
  return age.slice(0, 24)
}

/** Short WhatsApp text that goes with the PDF. */
export function whatsappSummary(leads: Lead[], meta: ReportMeta) {
  const cats = new Map<string, number>()
  for (const l of leads) cats.set(l.category, (cats.get(l.category) || 0) + 1)
  if (!leads.length) return `🛰️ *Radar BROLY* · ${fmt(meta.to, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}\nNo hay peticiones nuevas en ${meta.city} en estas 12 h (${meta.requests} búsquedas). Sigo buscando.`
  const lines = [...cats.entries()].sort((a, b) => b[1] - a[1]).map(([id, c]) => `• ${categoryById(id)?.label || id}: ${c}`)
  const top = leads.slice(0, 3).map((l, i) => `${i + 1}. ${l.request.slice(0, 110)}${l.urgency === 'alta' ? ' 🔥' : ''}`)
  return `🛰️ *Radar BROLY* · ${fmt(meta.to, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}\n*${leads.length}* personas buscando lo que ofreces en ${meta.city}:\n${lines.join('\n')}\n\n*Prioridad:*\n${top.join('\n')}\n\nTodo el detalle y los enlaces, en el PDF.`
}
