# Reparación definitiva del administrador (17/10/2026)

## Causa
En `src/components/aureon.tsx` de la versión «ADMIN_EXCLUSIVO_REPARADO» se perdieron cuatro símbolos que la versión buena
(«DEFINITIVO_PROMOCION_URUS») sí tenía. Vite/esbuild no comprueba tipos, así que `pnpm build` compilaba, pero el navegador
lanzaba `ReferenceError` en tiempo de ejecución:

| Símbolo | Dónde se usa | Efecto |
|---|---|---|
| `Download` (icono lucide-react, sin importar) | Vista del panel tras iniciar sesión (botón «Descargar Crypto & Trading») | Al pulsar «Entrar» el panel se renderiza y se rompe → **el error del login** |
| `formatFeatureLines` | `selectItem()` | Abrir/editar una ficha falla |
| `parseFeatureLines` | `save()` | Guardar una ficha falla |
| `Legal` (componente) | Rutas `/privacidad`, `/cookies`, `/aviso-legal` | Esas páginas se rompen |

## Cambios
- `src/components/aureon.tsx`: se importa `Download`; se restauran `Legal`, `formatFeatureLines` y `parseFeatureLines` tal cual estaban en la versión buena.
  Además, si la lectura autenticada del catálogo falla, el panel reintenta con la lectura pública anterior (no relaja ninguna política RLS).
- `scripts/verify-aureon.mjs`: nuevo control que falla si vuelven a faltar esos símbolos.
- `scripts/test-admin-flow.mjs` (+ `pnpm verify:admin`): prueba login → allowlist → carga → guardar → reflejo público contra un Supabase simulado.
- `package.json`: solo se añade el script `verify:admin`.

No se han tocado: AdSense (`__root.tsx`), Netlify, Supabase, migraciones, datos, imágenes, vídeos ni enlaces de afiliación.

## Antes de publicar
1. `pnpm install && pnpm typecheck && pnpm test && pnpm build && pnpm verify:aureon && pnpm verify:admin`
2. Publicar `dist/client` en el sitio Netlify correcto.
3. Entrar en `/admin`, abrir una ficha, guardar un cambio y comprobarlo en la web pública.
4. En Supabase Auth, desactivar «Allow new users to sign up» (solo se necesita la cuenta administradora).
   El SQL `SUPABASE-DIAGNOSTICO-ADMIN.sql` es solo de lectura.
