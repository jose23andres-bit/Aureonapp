# Aureon AI Lab — pruebas, asistente y pagos

## Asistente de IA ya incluido
La web ya contiene el widget comercial `SalesAgent` y la función `POST /api/assistant`. Para activarlo en Netlify configura `OPENAI_API_KEY`. Opcionales para avisos: `RESEND_API_KEY`, `AUREON_NOTIFY_FROM`, `AUREON_NOTIFY_EMAIL`; para avisos por WhatsApp, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` y `AUREON_WHATSAPP_TO`. Las claves deben configurarse solo en variables de entorno privadas del servidor, nunca en el frontend.

## Checkout Stripe preparado, apagado por defecto
Se añade `GET /api/checkout/status` y `POST /api/checkout`. La compra permanece deshabilitada hasta que ambas variables privadas estén configuradas en Netlify:
- `STRIPE_SECRET_KEY`: clave secreta de Stripe, preferiblemente empieza probando con una clave `sk_test_`.
- `STRIPE_PRICE_AUREON_WEB_KITS`: ID `price_...` de un producto real de Aureon Web Kits creado en Stripe.

Cuando existan ambas variables, la tarjeta de Web Kits permite crear una sesión de Stripe Checkout. El servidor solo acepta el producto allowlisted `web-kits`, y genera URLs de éxito/cancelación desde el host de la petición. No se deben activar pagos reales hasta que el producto, precio, impuestos, política de devoluciones, condiciones de venta, privacidad y soporte estén listos. El endpoint usa Stripe Checkout hospedado y no recibe datos de tarjeta en Aureon.

## Verificación local
Requiere Node.js compatible con `package.json` (Node 22.13+), pnpm 9.15.4 y acceso al registro npm:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

En el entorno de trabajo donde se preparó este ZIP no hubo conectividad con `registry.npmjs.org`, por lo que no se pudo descargar pnpm ni las dependencias ni ejecutar esas tareas. No se afirma que build/tests hayan pasado.

## Despliegue
Netlify no está conectado/autenticado en la sesión usada para preparar estos cambios. Después de configurar variables, probar en un deploy preview antes de publicar en producción. Verificar `/ai-lab`, navegación, filtros, API assistant y que checkout se mantenga desactivado si no hay precio configurado.


## Kit de replicación Aureon · 50 €

La tarjeta Aureon Web Kits enlaza al payment link de Revolut proporcionado por el propietario. El pago se procesa en Revolut; la entrega del kit es MANUAL después de comprobar el pago en el panel de Revolut. La página pública no verifica automáticamente los pagos ni desbloquea descargas. No presentar una redirección ni una captura del usuario como prueba de pago.

Enlace configurado: https://checkout.revolut.com/pay/05b79b03-6b72-4137-a578-690049bfeaee
Contacto de entrega: WhatsApp de Aureon enlazado en la tarjeta.

El producto se vende como kit original de integración/documentación de Aureon. Las skills y recursos de terceros deben mantener sus avisos de autoría y licencias originales; no se promete propiedad exclusiva sobre el repositorio de Vercel.
