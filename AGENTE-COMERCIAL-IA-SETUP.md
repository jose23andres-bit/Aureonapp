# Configuración del agente comercial AUREON

## Variables obligatorias en Netlify
- `OPENAI_API_KEY`: clave de un proveedor compatible con OpenAI API. Nunca ponerla en el código frontend.
- `RESEND_API_KEY`: clave de Resend para envío de correos.
- `AUREON_NOTIFY_FROM`: remitente verificado en Resend (por ejemplo, una dirección de un dominio que controles).
- `AUREON_NOTIFY_EMAIL`: opcional; por defecto `joseandresautomatiza@gmail.com`.

## Opcionales
- `OPENAI_BASE_URL`: URL completa del endpoint de chat completions. Por defecto OpenAI `/v1/chat/completions`.
- `OPENAI_MODEL`: por defecto `gpt-4o-mini`.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `AUREON_WHATSAPP_TO`: permiten avisos por WhatsApp mediante Twilio, si la cuenta, remitente, destino y permisos están habilitados.

Configura las variables desde Netlify → Site configuration → Environment variables y vuelve a desplegar. No añadas secretos al ZIP ni al repositorio.

## Qué se añadió
- Widget conversacional accesible desde todas las páginas.
- Endpoint servidor `/api/assistant` con instrucciones comerciales para las seis categorías, respuesta del modelo y guardado de oportunidades en `inquiries` cuando se detecta una señal comercial.
- Envío de correo vía Resend y WhatsApp opcional vía Twilio.

## Limitaciones que requieren pruebas antes de producción
- Este entorno no tiene `node_modules`, por lo que no se pudo ejecutar build, typecheck ni tests.
- No se han proporcionado credenciales de IA, correo o WhatsApp; no se han podido probar entregas reales.
- El análisis de prioridad es inicial y no está aún generado como un objeto estructurado validado. El panel debe revisarse para confirmar que el registro de chat se presenta de forma cómoda.
- La base de datos y sus migraciones deben estar desplegadas en Netlify; el código asume la tabla existente `inquiries`.
- No se ha implementado una limitación distribuida de peticiones por IP; antes de abrirlo al público debe añadirse protección anti-abuso (por ejemplo, rate limit gestionado en el servidor/WAF).
- El consentimiento mostrado en el widget es informativo; debe revisarse la redacción legal y la base jurídica antes de producción.
- El envío de WhatsApp depende de la ventana de conversación, plantillas y políticas del proveedor; probar y respetar sus requisitos.
