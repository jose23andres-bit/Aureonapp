# BROLY — Informe de entrega (18/10/2026)

Estado: **implementado y verificado en local. No desplegado.** Nada se ha publicado en Netlify ni se ha modificado en Supabase.

Ver también: `01-AUDITORIA-INICIAL.md` (estado de partida) y `03-CONFIGURACION-Y-DESPLIEGUE.md` (pasos pendientes).

## 1. Qué hace BROLY ahora

| Capacidad | Estado real |
|---|---|
| Libélula biomecánica SVG (4 alas iridiscentes, ojos facetados, abdomen segmentado, circuitos) | Funciona. 6 estados: reposo, activo, escuchando, procesando, respondiendo, ejecutando |
| Botón flotante + panel conversacional (escritorio y móvil) | Funciona. **Solo visible con sesión de administrador**; los visitantes no ven ningún cambio |
| Conversación con un modelo de IA real | Funciona en cuanto exista `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` en Netlify. Sin clave: "modo órdenes directas", y BROLY lo indica |
| Selección de modelo intercambiable | OpenAI (o compatible, vía `OPENAI_BASE_URL`) o Anthropic, con `BROLY_AI_PROVIDER` y `BROLY_AI_MODEL` |
| Acciones: propuesta → en ejecución → completada → **completada y verificada** | Funciona. Lo que lee Google o guarda recuerdos exige pulsar «Aprobar» |
| Verificación de resultados | Tras ejecutar, BROLY vuelve a leer en Supabase lo que guardó y lo compara |
| Planes divididos en pasos | Se guardan y los pasos se marcan a mano; no se ejecuta ningún paso automáticamente |
| Memoria personal controlable | Añadir, corregir y borrar desde la pestaña Memoria. BROLY solo guarda lo que tú apruebas |
| Historial persistente | Conversaciones, mensajes, acciones, tareas y registro de actividad en Supabase |
| Dictado por voz y respuestas habladas | Web Speech API del navegador. Usa la voz masculina de español de España del dispositivo (p. ej., "Jorge" en iPhone), con un tono algo más grave. Micrófono habilitado solo para el propio sitio (`microphone=(self)`) |
| Voz premium «cinematográfica» | OpenAI TTS (`gpt-4o-mini-tts`, voz con licencia `onyx`): masculina, grave, cálida, en español de España. **No imita a ninguna persona real.** El panel avisa de que es una voz generada por IA, como exige la política de OpenAI. Límite diario de caracteres. Si falla o no hay clave, usa la voz del dispositivo |
| Gmail + Calendar en solo lectura | Implementado (fase 1 + chat). Requiere credenciales Google y aplicar las migraciones |
| Resumen diario en segundo plano | Netlify Scheduled Function, **desactivada** salvo `BROLY_DAILY_SUMMARY_ENABLED=true` |
| Valoración de respuestas (👍/👎) | Se guarda en cada mensaje, como base para evaluar la calidad |

**Lo que BROLY no puede hacer, por diseño:** enviar correos, publicar, pagar o comprar, navegar, ejecutar código, cambiar sus propias reglas o permisos. El registro de herramientas es una lista cerrada en el servidor; la base de datos rechaza cualquier herramienta que no esté en esa lista (restricción `CHECK`).

## 2. Archivos modificados (existentes)

| Archivo | Cambio |
|---|---|
| `src/components/aureon.tsx` | +1 import y `<BrolyDock/>` justo después de los widgets flotantes existentes. Nada más |
| `src/components/broly.tsx` | Emblema de libélula en lugar del icono genérico; texto que remite al panel; quitadas dos importaciones sin usar; la barra superior pasa de `<header>` a `<div>`, porque la regla global `header{height:92px}` la deformaba |
| `src/components/broly.test.tsx` | La prueba que ya fallaba en el original ahora busca el `h1` (había dos headings con "BROLY") |
| `src/routes/$.tsx` | Título "BROLY · Asistente personal privado" y `noindex, nofollow` para `/broly` (antes salía "Colección" y era indexable) |
| `netlify/functions/broly.mts` | Convertido en enrutador fino. Mantiene **la misma URL** (callback OAuth registrado), las mismas acciones de la fase 1 y el mismo formato de tokens cifrados. Añade las nuevas acciones. Los errores internos ya no exponen su mensaje |
| `scripts/verify-broly.mjs` | Lee el código modular y añade 4 comprobaciones de seguridad |
| `.env.example` | Nombres de las nuevas variables opcionales (sin valores reales) |
| `netlify.toml` | `Permissions-Policy`: `microphone=()` → `microphone=(self)`, autorizado por el propietario. Permite el dictado en el propio dominio (BROLY y asistente comercial); el navegador sigue pidiendo permiso. Cámara y geolocalización siguen bloqueadas |

## 3. Archivos nuevos

- `src/broly/dragonfly.tsx`: libélula SVG animada (sin dependencias).
- `src/broly/broly-dock.tsx`: botón flotante y panel (Conversación · Memoria · Tareas).
- `src/broly/broly.css`: estilos aislados (todo bajo `.bly-*`).
- `src/broly/api.ts`, `src/broly/speech.ts`: cliente de la API y voz del navegador.
- `src/broly/voice-player.ts` y `netlify/broly-core/voice.ts`: voz premium (servidor → OpenAI TTS; la clave nunca llega al navegador).
- `netlify/broly-core/*.ts`: `env`, `supabase`, `crypto`, `google`, `ai`, `tools`, `assistant`.
- `netlify/functions/broly-daily.mts`: tarea programada (desactivada por defecto).
- `supabase/migrations/20261018120000_broly_assistant.sql`: 4 tablas nuevas, ampliación de 2 `CHECK`. Solo añade, no borra nada.
- Pruebas: `src/broly/broly-server.test.ts` (30), `src/broly/broly-dock.test.tsx` (8), `src/broly/test-utils/fake-backend.ts`.

No se han añadido dependencias: `package.json` y `pnpm-lock.yaml` están sin cambios.

## 4. Pruebas ejecutadas (resultados reales)

| Comprobación | Original | Ahora |
|---|---|---|
| `pnpm build` (build limpio) | OK | **OK** |
| `pnpm test` | 19/20 (1 fallo) | **58/58** |
| `pnpm typecheck` | 11 errores | 10 (todos preexistentes, ninguno nuevo) |
| `pnpm lint` | 91 errores | 74 (ninguno en el código nuevo de BROLY) |
| `verify:aureon`, `verify:broly` | PASS | PASS |
| CSS global (`index-*.css`) | — | **Idéntico byte a byte** (mismo hash) |
| SSR de 22 rutas originales | 200 | 200. Las 21 rutas públicas tienen el **mismo HTML**; solo se añade `<link>` al CSS aislado de BROLY. `/broly` cambia como estaba previsto |
| Migraciones en Postgres real (PGlite) | — | 12/12: se aplican, se pueden re-ejecutar, RLS en 7 tablas, sin permisos para `anon` ni `authenticated` |
| Bundle de funciones con esbuild | — | `broly.mts` y `broly-daily.mts` empaquetan y exportan correctamente |
| Secretos en el bundle del navegador | — | Ninguno |
| Navegador real (Chrome headless) | — | Escritorio 1440×900 y móvil 390×844: sin solapes con el asistente comercial ni scroll horizontal; Escape cierra y devuelve el foco; la libélula se aparta cuando se abre el asistente comercial |

Las pruebas de servidor ejecutan el **handler real** contra un doble en memoria de Supabase, Google y la IA. Se comprobó que detectan errores: al desactivar la aprobación de la memoria, fallan 4 pruebas.

**Sin probar, porque requiere tus credenciales:** OAuth real de Google, llamadas reales a OpenAI o Anthropic, la base de datos real de Supabase y el dictado en dispositivos reales.

## 5. Riesgos y decisiones pendientes (no aplicadas)

1. **Micrófono**: cambiado a `microphone=(self)` con tu autorización. Para volver atrás, restaura `microphone=()` en `netlify.toml`.
2. **Primer despliegue**: la web publicada no tiene BROLY (`/.netlify/functions/broly` → 404). Este ZIP incluye **todos** los cambios acumulados que aún no estaban desplegados (fase 1 y otros), no solo los de BROLY. Revisa primero la Deploy Preview.
3. **Sesión**: el token de `/admin` caduca a la hora aproximadamente y no se renueva solo (comportamiento existente). BROLY lo indica y pide volver a `/admin`.
4. **Privacidad de voz**: en Chrome, el dictado se procesa en servidores de Google; en Safari, en los de Apple.

## 6. Cambios posteriores (18/10/2026, tarde)

- **Mercados**: el panel de TradingView, de unos 220 px y con las tres franjas vacías, se sustituye por una **cinta de una sola línea** (34 px en escritorio y 30 px en móvil) con **cotizaciones reales**: 8 índices (S&P 500, Nasdaq, Dow Jones, IBEX 35, DAX, Euro Stoxx 50, FTSE 100 y Nikkei), 4 acciones, EUR/USD, oro, Brent y las 10 principales criptomonedas sin stablecoins. Se actualiza cada 60 s, con un destello dorado "katana" y una línea de luz. Se pausa al pasar el dedo o el ratón y respeta "reducir movimiento".
  - Datos: función nueva `netlify/functions/market-tape.mts`. Los mercados vienen de Yahoo Finance, un endpoint público no oficial que puede tener retraso; las criptomonedas, de CoinGecko, que usa `COINGECKO_API_KEY` si existe. La respuesta queda en caché del CDN durante 60 s. Si una fuente falla se sirve la otra, y si fallan las dos se muestra «Cotizaciones no disponibles».
  - Archivos: `src/components/market-tape.tsx` y `.css` (nuevos). En `aureon.tsx` se cambia `<MarketTicker/>` por `<MarketTape/>` y se elimina el componente antiguo, que ya no se usaba. El CSS global no cambia.
- **BROLY conoce el Telegram oficial**: https://t.me/AureonAIproject. Lo comparte cuando se le pregunta y sabe que todavía no puede publicar en Telegram.

## 7. Auditoría completa y AUREON Vehicle Check (18/10/2026, tarde)

**Auditoría en navegador real** (22 rutas, escritorio y móvil, build de producción): todas responden 200, sin scroll horizontal ni botones sin etiqueta.
- Se detectaron y corrigieron **2 fotos rotas** de alquiler: el Porsche 911 992 (el servidor externo bloquea el enlace, 403) y el Range Rover Vogue (404). Ahora muestran la imagen ilustrativa existente con su etiqueta, hasta que subas fotos propias desde el administrador.
- **Pendiente de tu decisión, sin aplicar:** el script de Google AdSense inserta anuncios antes de que React arranque y provoca el error de hidratación #418 en casi todas las páginas. Ya pasaba en el original. React vuelve a pintar la página y funciona, pero es más lento. Solucionarlo implica cargar AdSense después de que la página arranque, y eso puede afectar a la verificación de AdSense, así que necesita tu autorización.
- La radio (Ibiza Global Radio) redirige su emisión a otro servidor. Funciona en navegadores normales; no se ha tocado.

**Nuevo: AUREON Vehicle Check** (`/comprobar-coche`, más una franja de acceso en Coches de lujo y Superdeportivos):
- Valida el bastidor (17 caracteres, sin I/O/Q, dígito de control) y obtiene la ficha de fábrica y las llamadas a revisión de **NHTSA**, con datos oficiales gratuitos. También indica el país de fabricación y genera una lista de comprobación antes de comprar.
- Botones a **carVertical** (`rel="sponsored"`) y al **informe oficial de la DGT**. **Pon tu enlace de afiliado** en `CARVERTICAL_URL` (`src/components/vehicle-check.tsx`) cuando te aprueben.
- Función `netlify/functions/vehicle-check.mts`, con 24 h de caché por bastidor en el CDN. No copia datos de proveedores de pago.

**YouTube:** los enlaces de la web apuntan ahora a https://www.youtube.com/@aureonaiproject, y BROLY conoce el canal.

## 8. Vista previa al compartir enlaces (WhatsApp, Telegram, Facebook, X)

- Nueva imagen de marca `public/og-aureon.jpg` (1200×630, 120 KB, JPG, formato que aceptan todas las apps) con el banner AUREON, el retrato y el lema.
- Etiquetas `og:image` (con tamaño, tipo y texto alternativo), `og:site_name`, `og:locale`, `twitter:image/title/description` y `theme-color` en todas las páginas. `/comprobar-coche` tiene título y descripción propios.
- La dirección absoluta de la imagen, la canónica y `og:url` se toman de la variable `URL` que Netlify fija al compilar, así que siguen siendo correctas aunque cambie el dominio del sitio.
- WhatsApp y Facebook guardan en caché las vistas previas antiguas. Para forzar la nueva: https://developers.facebook.com/tools/debug/ → pega la URL → «Volver a extraer».
