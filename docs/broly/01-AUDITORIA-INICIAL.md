# BROLY · Fase 1 — Auditoría inicial (18/10/2026)

Estado del proyecto **antes de cualquier modificación**, medido sobre el ZIP original.

## Copia de seguridad

- ZIP original intacto: `backups/AUREON-original-2026-10-18.zip` (fuera del proyecto, en el espacio de trabajo).
- SHA-256: `04ab214989570214b7e23aa8f64a8c11689d79ac3b5226a36be050fd56e23909`
- 327 entradas, `unzip -t` sin errores.

## Stack detectado

- React 19 + TypeScript + Vite 8 + TanStack Start/Router, Tailwind 4, pnpm 9.15.4.
- Netlify: SSR (`@netlify/vite-plugin-tanstack-start`), funciones `api.mts`, `broly.mts`, `private-downloads.mts`.
- Supabase (`picvzxqkacgiyqflhpys`): Auth, `content_items`, `admin_allowlist`, Storage. El panel `/admin` usa Supabase Auth con sesión en `sessionStorage`.
- Toda la aplicación pública se renderiza desde `src/components/aureon.tsx` (rutas `/` y `/$`).

## Resultados de la línea base (código original, sin cambios)

| Comprobación | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | OK |
| `pnpm build` | **OK** (cliente + SSR) |
| `pnpm test` | **19 OK, 1 fallo**: `broly.test.tsx` busca un heading `/BROLY/` y encuentra dos (`BROLY Executive AI` y `Habla con BROLY`) |
| `pnpm typecheck` | **11 errores** preexistentes (importaciones sin usar TS6133, `routeTree.gen` hasta compilar) |
| `pnpm lint` | **91 errores, 2 avisos** preexistentes (`any`, `no-undef` en scripts, variables sin usar) |
| `verify:aureon` / `verify:broly` | PASS |
| SSR de 22 rutas | Todas responden 200 (instantánea guardada para comparar después) |

## Estado real de BROLY fase 1 (ya existía en el ZIP)

- Página privada `/broly` (`src/components/broly.tsx`), función `netlify/functions/broly.mts` y migración `20261018090000_broly_phase1.sql`.
- **La migración no está aplicada en Supabase**: `broly_tasks`, `broly_activity` y `broly_connections` devuelven `PGRST205` (la tabla no existe).
- **La web publicada no incluye BROLY**: `/.netlify/functions/broly` devuelve 404 en `aureonaiproject.netlify.app`. El ZIP contiene cambios que todavía no se han desplegado.
- Las instrucciones escritas solo se registraban, sin modelo de IA conversacional.

## Riesgos detectados

1. **Micrófono bloqueado**: `netlify.toml` envía `Permissions-Policy: microphone=()`. En producción el dictado no funcionará (tampoco el del asistente comercial) hasta cambiarlo a `microphone=(self)`. **No se ha modificado**: requiere tu autorización (ver informe final).
2. **Esquinas ocupadas**: el asistente comercial (`.sales-agent`) está abajo a la derecha (z-index 1000); el botón "volver" está abajo a la izquierda (z-index 900). BROLY debe situarse sin taparlos.
3. **Sesión de administrador**: el token de Supabase está en `sessionStorage` y no se renueva solo (caduca en aproximadamente 1 hora). BROLY lo reutiliza sin cambiar el sistema de autenticación.
4. La función BROLY depende de `SUPABASE_SERVICE_ROLE_KEY`, que solo debe existir en Netlify.
5. El README dice en un apartado que "no se ha conectado Supabase", pero el código usa Supabase. La fuente de verdad es el código.

## Archivos estrictamente necesarios para integrar BROLY

- Existentes (cambios mínimos): `src/components/aureon.tsx` (montar la libélula), `src/components/broly.tsx`, `src/components/broly.test.tsx`, `netlify/functions/broly.mts`, `src/routes/$.tsx` (título y `noindex` de `/broly`).
- Nuevos: `src/broly/*`, `netlify/broly-core/*`, `netlify/functions/broly-daily.mts`, una nueva migración SQL y la documentación en `docs/broly/`.
