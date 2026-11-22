# Cambios 2026-11-22 · AUREON como app

## Qué cambia
- **Cabecera tipo app** fija con logotipo, accesos rápidos en escritorio (Coches, Villas, Ocio VIP, Oportunidades), contacto privado y botón de menú.
- **Menú real** (sustituye la imagen con zonas táctiles): mismos grupos y orden del menú original, «Explora Aureon» y «Conecta», con iconos dorados. Se cierra con Escape, al tocar fuera o al elegir una opción.
- **Barra inferior** en móvil y tablet: Inicio, Coches, Villas, VIP y Menú, con la sección activa marcada. Respeta la zona segura del iPhone. Los botones flotantes (BROLY, radio) suben por encima de ella.
- **Instalable como app**: `public/manifest.webmanifest`, iconos en `public/icons/`, `apple-touch-icon` y modo pantalla completa (`viewport-fit=cover`).
- **Asistente verde retirado** (`SalesAgent` y `AureonCompanion`). Se conserva `POST /api/assistant` porque lo usa AI Lab.
- **BROLY siempre es guerrero**: forma base (pelo oscuro) en reposo y transformación dorada con aura al escuchar, pensar, responder o ejecutar. Se elimina `src/broly/dragonfly.tsx`. Diseño propio, no basado en personajes con licencia.
- **BROLY y Gemini**: el modelo por defecto pasa de `gemini-2.5-flash` (retirado por Google para claves nuevas) a `gemini-flash-latest`. Se puede fijar otro con `GEMINI_MODEL`.

## Editable desde el administrador
- Nuevo bloque **«Portada de la app»** en `/admin`: frase superior, titular, texto e imagen (ruta, URL o subida desde el móvil), con opción de publicar o dejar en borrador. Se guarda en `content_items` (sección `banners`, slug `portada-app`, `features.placement = 'hero'`). Los campos vacíos usan el texto original.
- Corrección: `contentItemToEntry` no pasaba `placement`, `headline` ni `body`, así que la portada no era editable aunque la web los leyera.

## Verificación
- `pnpm build` correcto, `pnpm test` 131/131, `verify:aureon`, `verify:broly` y `verify:admin` correctos.
- `pnpm typecheck` mantiene 7 avisos de variables sin usar heredados del código anterior; no se introduce ninguno.

## Pendiente
- No se ha publicado en Netlify. Para que BROLY use solo Gemini y no pruebe antes OpenAI y Anthropic, se puede añadir `BROLY_AI_PROVIDERS=gemini` en las variables de Netlify.
