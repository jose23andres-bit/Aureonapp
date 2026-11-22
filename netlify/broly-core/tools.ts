/// <reference types="node" />
// Closed, server-side tool registry. The model can only *name* one of these tools; arguments are
// validated with zod, approval requirements are fixed in code and cannot be changed by the model,
// by user messages or by external content. There is no generic "run command" / HTTP tool.
import { z } from 'zod'
import { BrolyError } from './env'
import { createAgendaTask, executeAgendaSummary, madridDayWindow, type DayWindow } from './google'
import { db, q, type User } from './supabase'
import { assertSafeMemory, enforceMemoryLimit } from './memory'
import { CATEGORIES, TEMPLATES } from './contracts/library'
import { createContract, resolveTemplate } from './contracts/service'
import type { ToolSpec } from './ai'

export type Risk = 'lectura-interna' | 'escritura-interna' | 'lectura-externa' | 'envio-externo'
export type ToolContext = { user: User; conversationId?: string | null; dayWindow?: DayWindow | null }
export type ToolOutput = { output: Record<string, unknown>; modelContent?: string; taskId?: string | null }
export type Verification = { ok: boolean; detail: string; checkedAt: string }

export class NeedsConnectionError extends BrolyError { constructor(message: string) { super(message, 409) } }

export const MEMORY_CATEGORIES = ['preferencia', 'proyecto', 'dato', 'otro'] as const

type ToolDef<S extends z.ZodTypeAny> = {
  name: string
  label: string
  description: string
  parameters: Record<string, unknown>
  schema: S
  requiresApproval: boolean
  risk: Risk
  summarize: (args: z.infer<S>) => string
  run: (ctx: ToolContext, args: z.infer<S>) => Promise<ToolOutput>
  verify?: (ctx: ToolContext, out: ToolOutput) => Promise<Omit<Verification, 'checkedAt'>>
}
const def = <S extends z.ZodTypeAny>(d: ToolDef<S>) => d

const empty = z.object({}).strict()
const memoryArgs = z.object({ content: z.string().trim().min(3).max(500), category: z.enum(MEMORY_CATEGORIES).default('otro') })
const planArgs = z.object({
  objective: z.string().trim().min(3).max(180),
  steps: z.array(z.object({ title: z.string().trim().min(2).max(160), detail: z.string().trim().max(400).optional() })).min(1).max(10),
})

const contractArgs = z.object({
  template: z.string().trim().min(2).max(80),
  clientName: z.string().trim().max(120).optional(),
  clientPhone: z.string().trim().max(30).optional(),
  clientEmail: z.string().trim().max(120).optional(),
  ownerRole: z.string().trim().max(40).optional(),
  clientRole: z.string().trim().max(40).optional(),
  data: z.record(z.string(), z.union([z.string(), z.number()]).transform(v => String(v))).optional(),
  send: z.boolean().default(true),
}).strict()

export const TOOLS = {
  list_tasks: def({
    name: 'list_tasks', label: 'Consultar tareas recientes', risk: 'lectura-interna', requiresApproval: false,
    description: 'Lista las 10 tareas y planes más recientes de BROLY (título, tipo, estado). Solo lectura interna.',
    parameters: { type: 'object', properties: {}, additionalProperties: false }, schema: empty,
    summarize: () => 'Consultar el historial de tareas',
    run: async ({ user }) => {
      const rows = await db<Array<Record<string, unknown>>>(`broly_tasks?user_id=eq.${q(user.id)}&select=id,title,task_type,status,created_at,completed_at&order=created_at.desc&limit=10`)
      return { output: { count: rows.length }, modelContent: JSON.stringify(rows) }
    },
  }),
  create_plan: def({
    name: 'create_plan', label: 'Guardar plan de acción', risk: 'escritura-interna', requiresApproval: false,
    description: 'Guarda un plan de acción dividido en pasos dentro del historial de BROLY. No ejecuta ningún paso: solo los registra para que el administrador los siga.',
    parameters: { type: 'object', properties: { objective: { type: 'string', description: 'Objetivo en una frase' }, steps: { type: 'array', minItems: 1, maxItems: 10, items: { type: 'object', properties: { title: { type: 'string' }, detail: { type: 'string' } }, required: ['title'] } } }, required: ['objective', 'steps'], additionalProperties: false },
    schema: planArgs,
    summarize: a => `Plan: ${a.objective} (${a.steps.length} pasos)`,
    run: async ({ user, conversationId }, a) => {
      const rows = await db<Array<{ id: string }>>('broly_tasks', { method: 'POST', body: JSON.stringify({ user_id: user.id, title: a.objective.slice(0, 180), task_type: 'plan', status: 'planned', input: { objective: a.objective, conversationId: conversationId || null, steps: a.steps.map(s => ({ title: s.title, detail: s.detail || '', done: false })) } }) })
      return { output: { taskId: rows[0].id, steps: a.steps.length }, taskId: rows[0].id, modelContent: `Plan guardado con ${a.steps.length} pasos (id ${rows[0].id}). Ningún paso se ha ejecutado.` }
    },
    verify: async ({ user }, out) => {
      const rows = await db<Array<{ status: string; input: { steps?: unknown[] } }>>(`broly_tasks?id=eq.${q(String(out.taskId))}&user_id=eq.${q(user.id)}&select=status,input`)
      const ok = rows.length === 1 && rows[0].status === 'planned' && Array.isArray(rows[0].input?.steps)
      return { ok, detail: ok ? 'El plan está guardado en Supabase.' : 'No se encontró el plan guardado.' }
    },
  }),
  save_memory: def({
    name: 'save_memory', label: 'Guardar un recuerdo', risk: 'escritura-interna', requiresApproval: true,
    description: 'Propone guardar una preferencia, proyecto o dato duradero del administrador para futuras conversaciones. Requiere aprobación. No guardes contraseñas, datos bancarios ni datos de salud.',
    parameters: { type: 'object', properties: { content: { type: 'string', description: 'Recuerdo breve en tercera persona' }, category: { type: 'string', enum: [...MEMORY_CATEGORIES] } }, required: ['content'], additionalProperties: false },
    schema: memoryArgs,
    summarize: a => `Recordar (${a.category}): «${a.content}»`,
    run: async ({ user }, a) => {
      assertSafeMemory(a.content)
      await enforceMemoryLimit(user.id)
      const rows = await db<Array<{ id: string }>>('broly_memories', { method: 'POST', body: JSON.stringify({ user_id: user.id, content: a.content, category: a.category, source: 'assistant' }) })
      return { output: { memoryId: rows[0].id, content: a.content } }
    },
    verify: async ({ user }, out) => {
      const rows = await db<Array<{ content: string }>>(`broly_memories?id=eq.${q(String(out.output.memoryId))}&user_id=eq.${q(user.id)}&select=content`)
      const ok = rows.length === 1 && rows[0].content === out.output.content
      return { ok, detail: ok ? 'El recuerdo está guardado y coincide con lo aprobado.' : 'No se pudo comprobar el recuerdo guardado.' }
    },
  }),
  agenda_summary: def({
    name: 'agenda_summary', label: 'Resumen de agenda y correo (Google, solo lectura)', risk: 'lectura-externa', requiresApproval: true,
    description: 'Lee el calendario principal de hoy y hasta 8 correos recientes de Gmail en modo solo lectura y prepara un resumen. Requiere aprobación porque accede a datos externos.',
    parameters: { type: 'object', properties: {}, additionalProperties: false }, schema: empty,
    summarize: () => 'Leer Google Calendar (hoy) y Gmail (8 correos recientes) en solo lectura y resumirlos',
    run: async ({ user, dayWindow }) => {
      const taskId = await createAgendaTask(user.id, 'Resumen de agenda y correo de hoy', 'chat')
      const outcome = await executeAgendaSummary(user, taskId, dayWindow || madridDayWindow())
      if (outcome.status === 'needs_connection') throw new NeedsConnectionError(outcome.message)
      return { taskId, output: { taskId, summary: outcome.summary, eventCount: outcome.events.length, messageCount: outcome.messages.length, aiUsed: outcome.aiUsed } }
    },
    verify: async ({ user }, out) => {
      const rows = await db<Array<{ status: string; result: { summary?: string } | null }>>(`broly_tasks?id=eq.${q(String(out.taskId))}&user_id=eq.${q(user.id)}&select=status,result`)
      const ok = rows.length === 1 && rows[0].status === 'completed' && Boolean(rows[0].result?.summary)
      return { ok, detail: ok ? 'La tarea consta como completada en Supabase con su resumen guardado.' : 'La tarea no consta como completada en Supabase.' }
    },
  }),
  list_contract_templates: def({
    name: 'list_contract_templates', label: 'Consultar modelos de contrato', risk: 'lectura-interna', requiresApproval: false,
    description: 'Devuelve el catálogo de modelos de contrato disponibles (id, título, partes con su rol y datos que piden). Úsala antes de preparar un contrato para elegir el modelo y los nombres exactos de los campos.',
    parameters: { type: 'object', properties: { categoria: { type: 'string', description: 'Opcional: filtra por categoría' } }, additionalProperties: false },
    schema: z.object({ categoria: z.string().max(80).optional() }).strict(),
    summarize: () => 'Consultar el catálogo de contratos',
    run: async (_ctx, a) => {
      const list = TEMPLATES.filter(t => !a.categoria || t.category.toLowerCase().includes(a.categoria.toLowerCase())).map(t => ({ id: t.id, titulo: t.title, categoria: t.category, partes: t.parties.map(p => `${p.role} (${p.label})`), campos: t.fields.map(f => f.key) }))
      return { output: { count: list.length }, modelContent: JSON.stringify({ categorias: CATEGORIES, modelos: list, nota: 'Los campos de cada parte son <rol>_nombre, <rol>_doc, <rol>_domicilio y <rol>_contacto. Usa ownerRole para el rol de AUREON.' }) }
    },
  }),
  prepare_contract: def({
    name: 'prepare_contract', label: 'Preparar y enviar contrato en PDF', risk: 'envio-externo', requiresApproval: true,
    description: 'Prepara un contrato en PDF rellenable a partir de un modelo y, si hay teléfono y send=true, se lo envía al cliente por WhatsApp con un enlace seguro para completarlo y firmarlo. Requiere aprobación. No inventes datos: deja vacío lo que no conozcas para que lo rellene el cliente.',
    parameters: { type: 'object', properties: {
      template: { type: 'string', description: 'id del modelo (de list_contract_templates) o descripción, p. ej. "ncnda"' },
      clientName: { type: 'string' }, clientPhone: { type: 'string', description: 'Teléfono del cliente con prefijo, p. ej. 34600111222' }, clientEmail: { type: 'string' },
      ownerRole: { type: 'string', description: 'Rol de AUREON en el contrato (p. ej. intermediario, mediador, propietario)' },
      clientRole: { type: 'string', description: 'Rol del cliente en el contrato' },
      data: { type: 'object', additionalProperties: { type: 'string' }, description: 'Valores conocidos: claves de campos del modelo' },
      send: { type: 'boolean', description: 'Enviar por WhatsApp al cliente (por defecto sí)' },
    }, required: ['template'], additionalProperties: false },
    schema: contractArgs,
    summarize: a => { let title = a.template; try { title = resolveTemplate(a.template).title } catch { /* shown as given */ } return `${title} para ${a.clientName || 'el cliente'}${a.clientPhone && a.send !== false ? ` · enviar por WhatsApp a +${String(a.clientPhone).replace(/\D/g, '')}` : ' · sin envío'}${a.data ? ` · ${Object.keys(a.data).length} datos rellenados` : ''}` },
    run: async ({ user }, a) => {
      const r = await createContract(user, a)
      return { output: { ...r, summary: `Contrato ${r.ref} · ${r.title}\nEnlace para completar y firmar: ${r.link}\nDatos pendientes: ${r.missing}${r.sent ? `\nEnviado por WhatsApp (${r.sentVia === 'template' ? 'plantilla' : 'mensaje'})` : r.sendError ? `\nNo enviado: ${r.sendError}` : ''}` }, modelContent: JSON.stringify(r) }
    },
    verify: async ({ user }, out) => {
      const rows = await db<Array<{ status: string }>>(`broly_contracts?id=eq.${q(String(out.output.id))}&user_id=eq.${q(user.id)}&select=status`)
      const ok = rows.length === 1 && (out.output.sent ? rows[0].status === 'sent' : rows[0].status === 'draft')
      return { ok, detail: ok ? (out.output.sent ? 'Contrato guardado y enviado por WhatsApp.' : 'Contrato guardado; enlace listo para compartir.') : 'No se pudo comprobar el contrato guardado.' }
    },
  }),
}

export type ToolName = keyof typeof TOOLS
export const isToolName = (n: string): n is ToolName => Object.prototype.hasOwnProperty.call(TOOLS, n)
export const toolSpecs = (): ToolSpec[] => Object.values(TOOLS).map(t => ({ name: t.name, description: t.description, parameters: t.parameters }))

export function validateArgs(name: ToolName, args: unknown) {
  const parsed = TOOLS[name].schema.safeParse(args ?? {})
  if (!parsed.success) throw new BrolyError(`Argumentos no válidos para ${name}: ${parsed.error.issues.map(i => i.message).join('; ').slice(0, 200)}`, 400)
  return parsed.data as Record<string, unknown>
}

export function describeTool(name: ToolName, args: Record<string, unknown>) {
  const t = TOOLS[name]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { tool: name, label: t.label, risk: t.risk, requiresApproval: t.requiresApproval, summary: (t.summarize as (a: any) => string)(args) }
}

/** Public, honest capability list shown in the UI. */
export const capabilities = () => Object.values(TOOLS).map(t => ({ tool: t.name, label: t.label, risk: t.risk, requiresApproval: t.requiresApproval }))
