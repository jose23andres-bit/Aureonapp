import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import path from 'node:path'

const read = (p) => readFileSync(path.resolve(p), 'utf8')
const aureon = read('src/components/aureon.tsx')
const lab = read('src/components/ai-lab.tsx')
const api = read('netlify/functions/api.mts')
const route = read('src/routes/$.tsx')
const css = read('src/styles.css')
const content = read('src/lib/content.ts')
const supabase = read('src/lib/supabase.ts')
const monetization = read('docs/PLAN-MONETIZACION-AFILIADOS.md')
const adminGuide = read('docs/ADMINISTRACION-SIN-ZIP.md')
const checks = []
function check(name, fn) { fn(); checks.push(name) }

check('AI Lab aparece en la navegación principal', () => assert.match(aureon, /href=\"\/ai-lab\"/))
check('AI Lab está conectado a la ruta catch-all', () => assert.match(aureon, /parts\[0\]==='ai-lab'\s*\?\s*<AILab\/>/))
check('La ruta incorpora metadatos de AI Lab', () => { assert.match(route, /ai-lab/); assert.match(route, /description/) })
check('El catálogo implementa búsqueda y filtros', () => { assert.match(lab, /useMemo/); assert.match(lab, /matchesCategory/); assert.match(lab, /search\.includes\(query/); assert.match(lab, /ailab-filters/) })
check('El enlace de pago es el enlace de Revolut indicado y muestra 50 €', () => {
  assert.match(lab, /https:\/\/checkout\.revolut\.com\/pay\/05b79b03-6b72-4137-a578-690049bfeaee/)
  assert.match(lab, /Comprar el kit completo · 50 €/)
  assert.match(lab, /entrega del paquete digital se realiza manualmente/)
})
// El asistente verde flotante se retiró del diseño de la app; la API se conserva porque la usa AI Lab.
check('El asistente verde ya no se muestra y la API del servidor se conserva', () => { assert.doesNotMatch(aureon, /SalesAgent|AureonCompanion/); assert.match(api, /path==='\/api\/assistant'/); assert.match(api, /OPENAI_API_KEY/) })
check('Los pagos por Stripe permanecen condicionados a configuración del servidor', () => { assert.match(api, /STRIPE_SECRET_KEY/); assert.match(api, /STRIPE_PRICE_AUREON_WEB_KITS/); assert.match(api, /path==='\/api\/checkout\/status'/) })
check('Los estilos adaptables de AI Lab existen', () => { assert.match(css, /\.ailab-page/); assert.match(css, /@media\(max-width:760px\)/); assert.match(css, /\.ailab-checkout/) })
check('Las pruebas de AI Lab cubren búsqueda, filtros y Revolut', () => {
  const t = read('src/components/ai-lab.test.tsx')
  assert.match(t, /filtra el catálogo por texto/)
  assert.match(t, /enlace de pago de Revolut por 50 €/)
})
check('El catálogo conserva las categorías comerciales principales', () => {
  for (const slug of ['coches-en-venta','villas-en-venta','alquiler-villas','alquiler-coches','ofertas']) assert.ok(content.includes(`slug:'${slug}'`), `Falta categoría ${slug}`)
})
check('Las imágenes principales de categoría existen', () => {
  const imageNames = [...content.matchAll(/image:'([^']+)'/g)].map(m => m[1])
  for (const imageName of imageNames) {
    assert.ok(existsSync(path.resolve('public/img', imageName)), `Falta public/img/${imageName}`)
  }
})
check('SEO básico: sitemap declarado en robots.txt y rutas públicas listadas', () => {
  const robots = read('public/robots.txt')
  const sitemap = read('public/sitemap.xml')
  assert.match(robots, /Sitemap:\s*https:\/\/aureonaiproject\.netlify\.app\/sitemap\.xml/)
  assert.match(sitemap, /<loc>https:\/\/aureonaiproject\.netlify\.app\/ai-lab<\/loc>/)
  assert.match(sitemap, /<loc>https:\/\/aureonaiproject\.netlify\.app\/coches-en-venta<\/loc>/)
  assert.match(sitemap, /<loc>https:\/\/aureonaiproject\.netlify\.app\/villas-en-venta<\/loc>/)
  assert.doesNotMatch(sitemap, /\/admin|\/api\//)
})
check('Netlify publica el directorio de build esperado', () => {
  const n = read('netlify.toml')
  assert.match(n, /command\s*=\s*\"pnpm build\"/)
  assert.match(n, /publish\s*=\s*\"dist\/client\"/)
})
check('Catálogo público y administración leen/escriben en Supabase', () => { assert.match(aureon, /getContentItems\(false\)/); assert.match(aureon, /saveContentItem\(payload\)/); assert.match(aureon, /retirada del catálogo público y conservada/); assert.doesNotMatch(aureon, /deleteContentItem\(/); assert.doesNotMatch(aureon, /localVehicleEntries|api\('\/api\/catalog'/) })
check('Administrador admite relojes, joyas, cursos y enlaces afiliados', () => { assert.match(aureon, /watches_jewelry/); assert.match(aureon, /courses/); assert.match(aureon, /Enlace afiliado/); assert.match(aureon, /admin-photo-picker/); assert.match(aureon, /admin-photo-list/) })
check('Catálogo de afiliación usa enlaces rastreables y etiqueta de transparencia', () => { assert.match(aureon, /function AffiliateCards/); assert.match(aureon, /sponsored nofollow noopener noreferrer/); assert.match(aureon, /Enlace de afiliación/) })
check('Oportunidades inmobiliarias se muestran desde fichas editables', () => { assert.match(aureon, /function InvestmentOpportunities/); assert.match(aureon, /investment_opportunities/); assert.match(supabase, /investment_opportunities:'oportunidades'/) })
check('Documentación de monetización y administración incluida', () => { assert.match(monetization, /AliExpress Portals/); assert.match(monetization, /Hotmart/); assert.match(adminGuide, /sin volver a generar el ZIP/i) })
check('La retirada de fichas es no destructiva y no precarga un correo personal', () => { assert.match(aureon, /Retirar esta ficha/); assert.match(aureon, /Se conservará en el administrador/); assert.doesNotMatch(aureon, /defaultValue=\"joseandresautomatiza@gmail.com\"/) })
check('La copia de seguridad local de fichas antiguas está integrada', () => { const legacy = read('src/lib/legacy-content.ts'); const preservation = read('src/lib/catalog-preservation.ts'); assert.match(preservation, /legacyCatalogItems/); assert.match(preservation, /mergeCatalogEntries/); assert.ok((legacy.match(/\"slug\"/g)||[]).length >= 30) })

check('API pública con límites de abuso para IA, criptomonedas y formularios', () => {
  assert.match(api, /async function rateLimit/);
  assert.match(api, /limited\(req,'crypto',30,10\*60\*1000\)/);
  assert.match(api, /limited\(req,'assistant',12,60\*1000\)/);
  assert.match(api, /limited\(req,'inquiries',8,10\*60\*1000\)/);
  assert.match(api, /AbortSignal\.timeout\(18000\)/);
})
check('Producto PDF premium fuera del directorio público', () => {
  assert.ok(existsSync('private-products/guia-cripto-trading-inversion-2026.pdf'));
  assert.ok(!existsSync('public/guia-cripto-trading-inversion-2026.pdf'));
  assert.match(lab, /entrega manual tras verificar el pago/);
})
check('Cabeceras de seguridad y CSP en modo observación', () => {
  const n=read('netlify.toml');
  for (const header of ['X-Content-Type-Options','Referrer-Policy','X-Frame-Options','Strict-Transport-Security','Permissions-Policy','Content-Security-Policy-Report-Only']) assert.match(n,new RegExp(header));
})

check('Banner promocional configurable desde administración con duración ajustable', () => {
  const app=read('src/components/aureon.tsx');
  assert.match(app,/setUrusPromoVisible\(true\)/);
  assert.match(app,/durationSeconds/);
  assert.match(app,/promotionPopup/);
  assert.match(app,/Guardar y activar promoción/);
  assert.match(app,/O subir una imagen nueva desde tu móvil/);
  assert.match(app,/Las promociones anteriores se conservan en Supabase/);
  assert.match(app,/setUrusPromoVisible\(false\),duration\*1000/);
  assert.match(app,/promo-urus-weekend\.jpeg/);
  assert.match(app,/onClick=\{\(\)=>setUrusPromoVisible\(false\)\}/);
})
check('Página de promoción incluye vídeo oficial y contacto WhatsApp', () => {
  const app=read('src/components/aureon.tsx');
  assert.match(app,/promocion-urus/);
  assert.match(app,/youtube-nocookie\.com\/embed\/\$\{videoId\}/);
  assert.match(app,/Contenido audiovisual de terceros/);
  assert.match(app,/contactUrl\|\|WA/);
  assert.ok(existsSync('public/img/promo-urus-weekend.jpeg'));
})

check('Hero principal usa la nueva referencia diurna sin texto ni botones incrustados', () => {
  assert.match(aureon,/aureon-hero-daylight-redesign\.webp/)
  assert.ok(existsSync('public/img/aureon-hero-daylight-redesign.webp'))
})
check('Los productos digitales con precio antes consultable muestran 50 € y enlace Revolut', () => {
  assert.match(lab,/Comprar guía y plantillas · 50 €/)
  assert.match(lab,/Comprar guía IA · 50 €/)
  assert.match(lab,/Comprar guía SEO · 50 €/)
  assert.match(lab,/05b79b03-6b72-4137-a578-690049bfeaee/)
})
check('Descarga de Crypto & Trading en administración exige sesión y allowlist', () => {
  assert.match(aureon,/Descargas de administrador/)
  assert.match(aureon,/api\/admin-download\?file=crypto-guide/)
  assert.match(api,/path==='\/api\/admin-download'/)
  assert.match(api,/admin_allowlist/)
  assert.match(api,/Esta cuenta no tiene permisos de administrador/)
  assert.ok(existsSync('netlify/functions/private-downloads.mts'))
})


check('El proyecto solo expone el acceso privado del administrador, no cuentas de cliente', () => {
  assert.match(aureon, /parts\[0\]==='admin'\s*\?\s*<Admin\/>/)
  assert.doesNotMatch(aureon, /CustomerAccount|AdminCustomerCRM|Crear cuenta|Mi cuenta \/ Registro|ÁREA DE CLIENTES/)
  assert.doesNotMatch(supabase, /signUpCustomer|createCustomerInquiry|getCustomerDashboard|getAdminCustomerRecords|createAdminOrder/)
})
check('El catálogo de administrador se consulta con sesión autenticada', () => {
  assert.match(supabase, /getContentItems\(publishedOnly=false,authenticated=false\)/)
  assert.match(aureon, /getContentItems\(false,true\)/)
  assert.match(supabase, /email=ilike\./)
})


check('Coches y propiedades son escaparate y no tienen botones de compra propios', () => {
  assert.match(content, /ESCAPARATE AUTOMÓVIL/)
  assert.match(content, /no se venden vehículos directamente desde Aureon/)
  assert.match(content, /no se venden inmuebles directamente desde Aureon/)
  assert.match(aureon, /No hay botones de compra de artículos físicos/)
  assert.match(aureon, /Consultar web oficial del proyecto/)
  assert.doesNotMatch(aureon, /Web oficial y acceso de compra/)
})
check('Reglas de monetización digital y tope de 499 € documentadas', () => {
  const policy = read('PRODUCTOS-Y-ESCAPARATE-REGLAS.md')
  assert.match(policy, /499 €/)
  assert.match(policy, /No se marca automáticamente una compra de Revolut como pagada|verificarlo con el proveedor/)
  assert.match(policy, /El administrador autorizado debe poder descargar gratis/)
})

check('Regresión del administrador: ningún símbolo del panel queda sin definir', () => {
  const lucideImport = aureon.match(/import \{([^}]*)\} from 'lucide-react'/)?.[1] || ''
  assert.match(lucideImport, /\bDownload\b/, 'Download se usa en el panel y debe importarse de lucide-react')
  assert.match(aureon, /^function Legal\(/m, 'La página Legal (privacidad/cookies/aviso legal) debe existir')
  assert.match(aureon, /^function formatFeatureLines\(/m, 'formatFeatureLines debe existir: la usa selectItem()')
  assert.match(aureon, /^function parseFeatureLines\(/m, 'parseFeatureLines debe existir: la usa save()')
})
console.log(`OK: ${checks.length} comprobaciones estáticas`)
for (const name of checks) console.log(`- ${name}`)
