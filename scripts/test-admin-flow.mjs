// Prueba del flujo del administrador con un Supabase simulado (sin red, sin credenciales reales).
// Cubre: login -> allowlist -> carga autenticada -> guardar -> reflejo en lectura pública -> RLS simulada.
// Uso: node scripts/test-admin-flow.mjs   (usa el paquete `typescript` del proyecto; opcional TS_PATH=/ruta/a/typescript)
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { strict as assert } from 'node:assert'

const require = createRequire(import.meta.url)
let ts
try { ts = require('typescript') } catch { ts = require(process.env.TS_PATH || 'typescript') }
const transpile = (src, jsx = false) => ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: jsx ? ts.JsxEmit.Preserve : undefined } }).outputText

// ---------- Supabase simulado con RLS ----------
const ADMIN = 'admin@aureon.test', PASS = 'correcta-123'
const db = { allow: [{ email: ADMIN }], items: [
  { id: 'a1', section: 'luxury_cars', title: 'Ferrari borrador', published: false, availability: 'draft', sort_order: 1, features: {}, image_urls: [] },
  { id: 'a2', section: 'supercar_rentals', title: 'Urus', published: true, availability: 'available', sort_order: 2, features: {}, image_urls: [] },
] }
const calls = []
const emailOf = (auth) => auth === 'Bearer admin-token' ? ADMIN : null
globalThis.window = {}
const store = new Map()
globalThis.sessionStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) }
globalThis.fetch = async (url, opts = {}) => {
  const u = new URL(url), h = new Headers(opts.headers), auth = h.get('Authorization') || '', email = emailOf(auth)
  calls.push({ method: opts.method || 'GET', path: u.pathname + u.search, auth })
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  if (!h.get('apikey')) return json({ message: 'No API key' }, 401)
  if (u.pathname === '/auth/v1/token') { const b = JSON.parse(opts.body); return b.email === ADMIN && b.password === PASS ? json({ access_token: 'admin-token', refresh_token: 'r', user: { id: 'u1', email: ADMIN } }) : json({ error_description: 'Invalid login credentials' }, 400) }
  if (u.pathname === '/auth/v1/logout') return new Response(null, { status: 204 })
  if (u.pathname === '/auth/v1/user') return email ? json({ id: 'u1', email }) : json({ msg: 'invalid JWT' }, 401)
  if (u.pathname === '/rest/v1/admin_allowlist') { if (!email) return json([]); const q = (u.searchParams.get('email') || '').replace(/^(eq|ilike)\./, '').toLowerCase(); return json(db.allow.filter(r => r.email.toLowerCase() === q && r.email.toLowerCase() === email.toLowerCase())) }
  if (u.pathname === '/rest/v1/content_items') {
    if ((opts.method || 'GET') === 'GET') { let rows = email ? db.items : db.items.filter(i => i.published && i.availability !== 'draft'); if (u.searchParams.get('published') === 'eq.true') rows = rows.filter(i => i.published); return json(rows) }
    if (!email) return json({ message: 'new row violates row-level security policy' }, 403)
    const body = JSON.parse(opts.body)
    if (opts.method === 'PATCH') { const id = u.searchParams.get('id').replace('eq.', ''); const row = db.items.find(i => i.id === id); Object.assign(row, body); return json([row]) }
    const row = { id: 'n' + (db.items.length + 1), ...body }; db.items.push(row); return json([row])
  }
  return json({ message: 'not found' }, 404)
}

// ---------- Carga del módulo real src/lib/supabase.ts ----------
const mod = await import('data:text/javascript;base64,' + Buffer.from(transpile(readFileSync('src/lib/supabase.ts', 'utf8'))).toString('base64'))
let n = 0
const step = async (name, fn) => { try { await fn() } catch (e) { console.error('FALLO  ' + name + '\n   ' + String(e?.message || e).slice(0, 300)); process.exit(1) } n++; console.log('OK  ' + name) }

await step('Login con credenciales incorrectas falla con mensaje de Supabase', async () => {
  await assert.rejects(mod.signIn(ADMIN, 'mala'), /Invalid login credentials/)
})
await step('Login del administrador devuelve sesión y guarda el token', async () => {
  const user = await mod.signIn(ADMIN, PASS); assert.equal(user.email, ADMIN); assert.equal(mod.getAccessToken(), 'admin-token')
})
await step('getCurrentUser recupera el usuario con el token', async () => { assert.equal((await mod.getCurrentUser()).email, ADMIN) })
await step('checkAdmin acepta al administrador (también con mayúsculas)', async () => {
  assert.equal(await mod.checkAdmin(ADMIN), true); assert.equal(await mod.checkAdmin('  ' + ADMIN.toUpperCase()), true)
})
await step('checkAdmin rechaza un correo que no está en admin_allowlist', async () => { assert.equal(await mod.checkAdmin('otro@x.com'), false) })
await step('Carga autenticada devuelve TODAS las fichas (incluye borradores) usando el token del admin', async () => {
  const rows = await mod.getContentItems(false, true); assert.equal(rows.length, 2); assert.ok(calls.at(-1).auth === 'Bearer admin-token')
})
await step('Lectura pública (anónima) solo ve fichas publicadas', async () => {
  const rows = await mod.getContentItems(true); assert.deepEqual(rows.map(r => r.id), ['a2']); assert.ok(calls.at(-1).auth.startsWith('Bearer sb_publishable_'))
})
await step('Guardar (PATCH) una modificación: título, precio y publicación', async () => {
  const saved = await mod.saveContentItem({ id: 'a1', title: 'Ferrari 296 GTB', price: 320000, published: true, availability: 'available' })
  assert.equal(saved.title, 'Ferrari 296 GTB')
})
await step('La modificación se refleja en la web pública', async () => {
  const pub = await mod.getContentItems(true); const f = pub.find(r => r.id === 'a1'); assert.ok(f); assert.equal(f.title, 'Ferrari 296 GTB'); assert.equal(f.price, 320000)
})
await step('Crear una ficha nueva (POST) y verla en el panel', async () => {
  const created = await mod.saveContentItem({ section: 'real_estate', title: 'Villa nueva', published: false, availability: 'draft' })
  assert.ok(created.id); assert.equal((await mod.getContentItems(false, true)).length, 3)
})
await step('Cerrar sesión borra el token y bloquea el guardado', async () => {
  await mod.signOut(); assert.equal(mod.getAccessToken(), ''); await assert.rejects(mod.saveContentItem({ id: 'a1', title: 'x' }), /sesión ha caducado/)
})
await step('RLS simulada: un usuario sin token no puede escribir ni ve borradores', async () => {
  const r = await mod.getContentItems(false, true); assert.ok(r.every(i => i.published))
})

// ---------- Helpers del panel (los que faltaban en la versión rota) ----------
const src = readFileSync('src/components/aureon.tsx', 'utf8')
const grab = (name) => { const m = src.match(new RegExp('^function ' + name + '\\(.*$', 'm')); assert.ok(m, name + ' no está definida en aureon.tsx'); return m[0] }
const helpers = transpile(grab('formatFeatureLines') + '\n' + grab('parseFeatureLines') + '\nexport {formatFeatureLines,parseFeatureLines}')
const h = await import('data:text/javascript;base64,' + Buffer.from(helpers).toString('base64'))
await step('formatFeatureLines/parseFeatureLines: ida y vuelta conserva las características', async () => {
  const f = { motor: 'V8 biturbo', plazas: 5, extras: ['techo', 'carbono'], catalogKind: 'villa', hideFallbackImage: true }
  const text = h.formatFeatureLines(f); assert.ok(!/catalogKind|hideFallbackImage/.test(text))
  assert.deepEqual(h.parseFeatureLines(text), { motor: 'V8 biturbo', plazas: 5, extras: ['techo', 'carbono'] })
  assert.throws(() => h.parseFeatureLines('sin separador'), /Formato incorrecto/)
})
console.log(`\n${n} pruebas de flujo correctas`)
