# Auditoría y cambios — BROLY Fase 1

## Auditoría previa del ZIP maestro
- El ZIP maestro contiene una aplicación React/TypeScript con TanStack Router, Vite y funciones Netlify.
- Existe un catch-all para las rutas de la aplicación y una página principal que resuelve varias rutas internamente; se añadió `/broly` a esa resolución en lugar de reemplazar el router.
- Supabase ya se utiliza para autenticación, catálogo y administración. La URL y la publishable key existentes se conservan; no se modificó la región del proyecto.
- Netlify ya utiliza `netlify/functions` y `netlify.toml`; se añadió una función independiente `broly.mts` sin alterar las funciones existentes.
- Tests existentes localizados antes de los cambios: `src/components/ai-lab.test.tsx`, `src/components/ui/controls.test.tsx`, `src/components/ui/overlays.test.tsx`, `src/components/error-pages.test.tsx`, `src/examples/validated-form.test.tsx`, `src/lib/catalog-preservation.test.ts`, `src/router.ssr.test.tsx`.

## Cambios realizados
- Nuevo panel privado `/broly` y enlace de entrada desde AI Lab.
- Función Netlify para autenticar al usuario mediante Supabase, comprobar `admin_allowlist`, iniciar OAuth de Google, cifrar tokens con AES-256-GCM y ejecutar el resumen diario de Gmail/Calendar en modo solo lectura.
- Nueva migración SQL para tareas, actividad y conexión Google. La tabla de tokens no está expuesta al cliente y las tablas se administran mediante la función server-side.
- Nueva automatización bajo demanda: calendario local del día + hasta 8 correos recientes de los últimos dos días, con resumen IA si se configura `OPENAI_API_KEY`; sin la clave usa un resumen estructurado de respaldo.
- Dictado y lectura en voz alta con las APIs de voz del navegador.
- Pruebas de componente y verificador estático `pnpm verify:broly`.

## Validación realizada
- `node scripts/verify-broly.mjs`: PASS en todas las comprobaciones estáticas.
- `unzip -t` del ZIP de salida: se ejecutará antes de entregar.
- No se pudo ejecutar la instalación/build/tests de Vite/Vitest: no hay `node_modules`, y Corepack no pudo descargar pnpm por falta de acceso a `registry.npmjs.org`.
- `tsc --noEmit` no llegó a compilar el proyecto: falta `vite/client` al no estar instaladas las dependencias.
- No se probaron OAuth de Google, las llamadas reales a Supabase ni OpenAI porque requieren secretos del propietario y despliegue. No se afirma que esté publicado.

## Acciones del propietario necesarias
1. Aplicar `supabase/migrations/20261018090000_broly_phase1.sql` en Supabase SQL Editor.
2. Añadir los secretos server-side indicados en `BROLY-FASE-1-SETUP.md` a Netlify.
3. Configurar Gmail API y Calendar API en Google Cloud, y registrar el callback `https://TU-DOMINIO/.netlify/functions/broly`.
4. Desplegar en una preview y completar las pruebas de integración antes de producción.
