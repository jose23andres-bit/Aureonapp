# AUREON AI PROJECT — auditoría estricta de seguridad
Fecha: 16/10/2026
ZIP base: AUREON_AI_PROJECT_CRYPTO_OPPORTUNITY_RICH_GTA6.zip

## Hallazgos críticos / altos

1. **El PDF de 50 € estaba en `public/` y era accesible por URL directa sin verificar pago.** Corregido en este paquete: se mueve a `private-products/guia-cripto-trading-inversion-2026.pdf`, fuera del directorio público de compilación, y se elimina el enlace directo del catálogo. La entrega del PDF sigue siendo manual después de comprobar el pago en Revolut. No se ha creado un sistema automático de licencias/descarga.
2. **El ZIP de 499 € no se desbloquea automáticamente al pagar.** El flujo visible informa de entrega manual y contacto tras verificar el pago. No debe anunciarse como descarga protegida/automática.
3. **El contenido público de la web no puede hacerse incopiable.** HTML, CSS, JavaScript, imágenes y texto que se sirven al navegador pueden inspeccionarse o capturarse. Los cambios solo protegen el archivo del producto frente a una URL pública directa; no impiden screenshots, reproducción visual ni que un comprador copie lo que legítimamente recibe.

## Mejoras añadidas en esta revisión final

- Se añadió un límite de solicitudes de mejor esfuerzo con Netlify Blobs: consultas cripto (30/10 min por IP), asistente IA (12/min) y formularios (8/10 min). Responde con HTTP 429 al excederlo. Es una capa disuasoria y no un WAF: los contadores distribuidos pueden sufrir carreras bajo concurrencia y debe complementarse con controles de plataforma.
- Se añadió timeout de 18 segundos para la llamada del asistente y límite de tamaño de 70 KB para la petición.
- Se añadió Content-Security-Policy-Report-Only, además de las cabeceras previas. Se deja en observación para evitar romper integraciones sin revisar informes; aún no equivale a una CSP aplicada.
- El verificador estático ahora incluye estas protecciones y reporta 23 comprobaciones estáticas correctas.

## Controles que ya existen en el código (requieren verificación en producción)

- El administrador utiliza inicio de sesión de Supabase y una lista de correos autorizados.
- La capa Supabase utiliza una clave pública, no una service-role key en el cliente; las políticas RLS deben mantenerse activas y verificarse en el proyecto real.
- La API administrativa de Netlify exige usuario con rol admin y un correo autorizado.
- El ZIP de 499 € se entrega manualmente; no existe un enlace público al ZIP del producto dentro de `public/`.
- `robots.txt` desaconseja indexar `/admin`, pero robots.txt NO es un mecanismo de autenticación.
- Se endurecieron cabeceras de Netlify: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies` y `Cross-Origin-Opener-Policy`.

## Pendiente obligatorio antes de afirmar que la web está segura

- Ejecutar `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, `pnpm lint` y `pnpm test` en entorno Node compatible.
- Desplegar primero en una URL de previsualización; comprobar las cabeceras HTTP reales, rutas SSR, login, cierre de sesión, expiración de sesión y acceso directo a `/admin`.
- Probar RLS en Supabase con sesión anónima, usuario autenticado no administrador y administrador; intentar leer/escribir `content_items`, `admin_allowlist` y el bucket de Storage.
- Confirmar que las claves `OPENAI_API_KEY`, `COINGECKO_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY` y cualquier credencial se configuran solo en variables de entorno del servidor; no usar prefijos `VITE_` para secretos. Rotar cualquier secreto que haya sido compartido o publicado accidentalmente.
- Añadir limitación de tasa/abuso a endpoints públicos `/api/assistant`, `/api/crypto` y `/api/inquiries`, validación de entradas, protección anti-spam y alertas de gasto de IA. No se considera implementado en este ZIP.
- Configurar CSP en modo Report-Only, revisar los informes y solo después valorar una política aplicada. No se ha impuesto CSP de bloqueo porque podría romper integraciones externas sin pruebas.
- Configurar MFA para la cuenta administradora y activar protección contra contraseñas filtradas en Supabase Auth.
- Realizar análisis de dependencias y una prueba de penetración autorizada antes de manejar ventas/datos sensibles a escala.

## Valoración honesta

Este paquete mejora un fallo concreto de acceso directo al PDF de pago y añade cabeceras de seguridad. No equivale a una auditoría profesional de penetración ni demuestra que la web esté libre de vulnerabilidades. Se ejecutó `node scripts/verify-aureon.mjs`: 23 comprobaciones estáticas correctas. No se pudo instalar el gestor pnpm porque el entorno no pudo conectar con registry.npmjs.org; por ello no se ejecutaron compilación completa, typecheck, lint ni pruebas Vitest. Tampoco se publicó a Netlify desde este proceso. La protección real depende de desplegarlo y completar los controles pendientes.
