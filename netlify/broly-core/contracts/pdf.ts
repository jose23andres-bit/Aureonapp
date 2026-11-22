/// <reference types="node" />
// Contract PDF renderer (pdf-lib, no native deps). Draft mode: missing data become fillable form fields.
// Final mode: all values printed, plus the electronic acceptance record (who, when, IP, SHA-256).
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { COMMON_CLAUSES, DISCLAIMER, allFields, partyFields, type Template } from './library'

export type Acceptance = { name: string; doc?: string; at: string; ip: string; userAgent: string; hash: string }
export type OwnerApproval = { at: string; by: string }

const GOLD = rgb(0.72, 0.58, 0.33), INK = rgb(0.1, 0.1, 0.1), MUTED = rgb(0.42, 0.42, 0.4), LINE = rgb(0.82, 0.78, 0.7)
const A4 = { w: 595.28, h: 841.89 }, M = 56

/** Standard fonts use WinAnsi: keep Spanish characters, replace the rest. */
export const ansi = (s: string) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D\u2033]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...').replace(/[\u00a0\u202f]/g, ' ')
  .replace(/[^\x20-\x7E\u00A1-\u00FF\u20AC\n]/g, '')

export function fillText(text: string, data: Record<string, string>, blank = '__________') {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => (data[k]?.trim() ? data[k].trim() : blank))
}

class Writer {
  page!: PDFPage
  y = 0
  n = 0
  constructor(public doc: PDFDocument, public font: PDFFont, public bold: PDFFont, public title: string, public ref: string) { this.newPage() }
  newPage() {
    this.page = this.doc.addPage([A4.w, A4.h]); this.n++
    this.page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: GOLD })
    this.page.drawText('AUREON AI PROJECT', { x: M, y: A4.h - 34, size: 8.5, font: this.bold, color: GOLD })
    this.page.drawText(ansi(this.ref), { x: A4.w - M - this.font.widthOfTextAtSize(ansi(this.ref), 8), y: A4.h - 34, size: 8, font: this.font, color: MUTED })
    const foot = ansi(`${this.title} · página ${this.n}`)
    this.page.drawText(foot, { x: M, y: 30, size: 7.5, font: this.font, color: MUTED })
    this.y = A4.h - 64
  }
  need(h: number) { if (this.y - h < 56) this.newPage() }
  lines(text: string, size: number, font: PDFFont, width = A4.w - 2 * M) {
    const out: string[] = []
    for (const para of ansi(text).split('\n')) {
      let line = ''
      for (const word of para.split(/\s+/)) {
        const test = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(test, size) > width && line) { out.push(line); line = word } else line = test
      }
      out.push(line)
    }
    return out
  }
  para(text: string, { size = 9.6, font = this.font, color = INK, gap = 6, indent = 0 } = {}) {
    for (const l of this.lines(text, size, font, A4.w - 2 * M - indent)) { this.need(size + 4); this.page.drawText(l, { x: M + indent, y: this.y, size, font, color }); this.y -= size * 1.42 }
    this.y -= gap
  }
}

export async function renderContract(t: Template, data: Record<string, string>, opts: { ref: string; mode: 'draft' | 'final'; fillUrl?: string; acceptance?: Acceptance; owner?: OwnerApproval }) {
  const doc = await PDFDocument.create()
  doc.setTitle(ansi(`${t.title} · ${opts.ref}`)); doc.setAuthor('AUREON AI PROJECT · BROLY'); doc.setSubject(ansi(t.summary)); doc.setCreator('BROLY'); doc.setProducer('AUREON AI PROJECT')
  const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold), serif = await doc.embedFont(StandardFonts.TimesRoman)
  const w = new Writer(doc, font, bold, ansi(t.title), opts.ref)
  const form = doc.getForm()
  const draft = opts.mode === 'draft'

  // Title block
  for (const l of w.lines(t.title.toUpperCase(), 17, serif)) { w.page.drawText(l, { x: M, y: w.y, size: 17, font: serif, color: INK }); w.y -= 22 }
  w.para(t.law, { size: 8, color: MUTED, gap: 4 })
  if (draft && opts.fillUrl) w.para(`Complete los datos marcados directamente en este PDF o, si lo prefiere, en: ${opts.fillUrl}`, { size: 8.5, color: GOLD, font: bold, gap: 10 })

  // Data table: one row per field; missing values -> fillable text fields in draft mode
  const section = (label: string) => { w.need(30); w.y -= 4; w.page.drawText(ansi(label.toUpperCase()), { x: M, y: w.y, size: 8.5, font: bold, color: GOLD }); w.y -= 6; w.page.drawLine({ start: { x: M, y: w.y }, end: { x: A4.w - M, y: w.y }, thickness: 0.6, color: LINE }); w.y -= 14 }
  const row = (key: string, label: string, long = false) => {
    const val = (data[key] || '').trim()
    const labelW = 170, valX = M + labelW, valW = A4.w - M - valX
    const labelLines = w.lines(label, 8.3, font, labelW - 8)
    const valLines = val ? w.lines(val, 9.2, bold, valW) : []
    const h = Math.max(labelLines.length * 11, val ? valLines.length * 12.5 : long ? 40 : 18) + 6
    w.need(h + 2)
    labelLines.forEach((l, i) => w.page.drawText(l, { x: M, y: w.y - i * 11, size: 8.3, font, color: MUTED }))
    if (val) valLines.forEach((l, i) => w.page.drawText(l, { x: valX, y: w.y - i * 12.5, size: 9.2, font: bold, color: INK }))
    else if (draft) {
      const f = form.createTextField(`f_${key}`)
      if (long) f.enableMultiline()
      f.addToPage(w.page, { x: valX, y: w.y - h + 10, width: valW, height: h - 6, font, borderColor: GOLD, backgroundColor: rgb(1, 0.985, 0.95), borderWidth: 0.8 })
      f.setFontSize(9)
    } else w.page.drawText('__________________________', { x: valX, y: w.y, size: 9, font, color: MUTED })
    w.y -= h
  }
  section('Fecha'); row('fecha', 'Fecha de firma')
  for (const p of t.parties) { section(p.label); for (const f of partyFields(p)) row(f.key, f.label.replace(`${p.label}: `, '')) }
  section('Datos de la operación'); for (const f of t.fields) row(f.key, f.label, f.long)

  // Clauses
  w.y -= 8; section('Reunidos y acuerdan')
  const parties = t.parties.map(p => `${(data[`${p.role}_nombre`] || '').trim() || '__________'}, con documento ${(data[`${p.role}_doc`] || '').trim() || '__________'}, en calidad de ${p.label}`).join('; y ')
  w.para(`Las partes, ${parties}, se reconocen capacidad suficiente para obligarse y acuerdan las siguientes cláusulas:`, { gap: 10 })
  const clauses = [...t.clauses, ...COMMON_CLAUSES]
  clauses.forEach(([h, body], i) => { w.need(40); w.para(`${i + 1}. ${h}`, { font: bold, size: 9.8, gap: 2 }); w.para(fillText(body, data), { gap: 8 }) })
  if (t.notice) w.para(t.notice, { size: 8.4, color: MUTED, gap: 8 })

  // Signatures
  w.need(150); w.y -= 10; section('Firmas')
  const colW = (A4.w - 2 * M - 24) / 2
  const top = w.y
  t.parties.slice(0, 2).forEach((p, i) => {
    const x = M + i * (colW + 24)
    w.page.drawText(ansi(p.label), { x, y: top, size: 8.5, font: bold, color: INK })
    w.page.drawRectangle({ x, y: top - 72, width: colW, height: 60, borderColor: LINE, borderWidth: 0.8 })
    w.page.drawText(ansi(`Nombre: ${(data[`${p.role}_nombre`] || '').trim()}`), { x, y: top - 86, size: 8, font, color: MUTED })
  })
  w.y = top - 104
  if (opts.owner) w.para(`Envío y condiciones aprobados por AUREON a través de BROLY el ${opts.owner.at} (${opts.owner.by}).`, { size: 8, color: MUTED, gap: 4 })
  if (opts.acceptance) {
    const a = opts.acceptance
    w.need(90); section('Registro de firma electrónica')
    w.para(`Aceptado y firmado electrónicamente por ${a.name}${a.doc ? ` (${a.doc})` : ''} el ${a.at}, desde la IP ${a.ip}. Dispositivo: ${a.userAgent.slice(0, 140)}.`, { size: 8.4, gap: 3 })
    w.para(`Huella SHA-256 del contenido aceptado: ${a.hash}`, { size: 7.6, color: MUTED, gap: 3 })
    w.para('Firma electrónica simple conforme al Reglamento (UE) 910/2014 (eIDAS). Las partes aceptan este registro como prueba de la aceptación.', { size: 7.6, color: MUTED, gap: 4 })
  }
  w.para(DISCLAIMER, { size: 7.4, color: MUTED, gap: 0 })
  if (draft) form.updateFieldAppearances(font)
  return await doc.save()
}

/** Fields still empty for a template (client must complete them). */
export const missingFields = (t: Template, data: Record<string, string>) => allFields(t).filter(f => !(data[f.key] || '').trim())
