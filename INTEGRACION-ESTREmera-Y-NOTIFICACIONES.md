# AUREON AI PROJECT — Estado de integración de esta entrega

Esta entrega parte del ZIP `Aureon .zip` que ha facilitado el usuario. Se ha mantenido la estructura TanStack Start/Vite, las rutas, los componentes, el catálogo y la integración de administración existente.

## Incorporado en el código
- Ficha editorial de la villa de Estremera, Madrid, dentro de la categoría existente **Alquiler de villas**.
- Las 10 fotografías proporcionadas para esta propiedad, guardadas en `public/img/estremera-villa-01.jpg` a `estremera-villa-10.jpg`.
- Texto comercial: bodas, eventos privados, celebraciones y estancias; precio a consultar; disponibilidad a consultar.
- Formulario de consulta privada asociado a la propiedad, sin afirmar que una solicitud sea una reserva.
- Estilos responsive para galería, datos clave y usos.
- Notificación por correo de nuevas consultas mediante Resend, si se configuran las variables indicadas abajo. La solicitud se guarda primero en la base de datos existente; si el correo falla, la consulta permanece guardada.
- Respuesta de la API con estado de notificación (`sent`, `failed` o `not_configured`).

## Variables de entorno para activar correo
- `RESEND_API_KEY`: clave API del proveedor Resend.
- `AUREON_NOTIFY_FROM`: remitente verificado en Resend.
- `AUREON_NOTIFY_EMAIL`: opcional; por defecto `joseandresautomatiza@gmail.com`.

No añadas estas claves al frontend ni las subas al repositorio. Configúralas en Netlify > Site configuration > Environment variables y vuelve a desplegar.

## Pendiente / no afirmar como terminado
- El envío de WhatsApp requiere un número de destino y una integración autorizada de WhatsApp Business Platform o proveedor compatible; no se ha fingido una entrega de WhatsApp.
- El agente conversacional con IA requiere elegir y configurar un proveedor/modelo y sus credenciales. Este ZIP no presenta un chatbot simulado como si fuera un agente IA funcional.
- La música ambiental requiere un archivo de audio con licencia adecuada; no se añade audio inventado ni autoplay.
- Las fichas de vehículos y villas de venta solo deben publicarse cuando estén respaldadas por datos e imágenes reales.
- El ZIP no se ha publicado en Netlify desde este entorno.

## Validación
La modificación se ha aplicado al código fuente y se ha empaquetado. No se ha podido confirmar una compilación de producción en este entorno; ejecutar `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test` y `pnpm build` antes de desplegar.

## Agente comercial IA — implementación añadida
- Widget flotante de conversación en la web, con estilo negro/dorado y aviso de privacidad visible.
- Endpoint servidor `/api/assistant`: conecta con API compatible con OpenAI usando variables de entorno; no expone la clave al navegador.
- Clasifica las conversaciones como consultas comerciales y guarda los leads en la tabla `inquiries`, visible en el panel privado existente cuando el rol administrador está configurado.
- Correo al propietario mediante Resend cuando están configurados `RESEND_API_KEY` y `AUREON_NOTIFY_FROM`. Destino por defecto `joseandresautomatiza@gmail.com`, configurable con `AUREON_NOTIFY_EMAIL`.
- WhatsApp opcional mediante Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `AUREON_WHATSAPP_TO`. El destino debe estar en formato aceptado por Twilio; el proveedor y la cuenta deben estar habilitados.
- Variables de IA: `OPENAI_API_KEY` obligatoria; opcionales `OPENAI_BASE_URL` y `OPENAI_MODEL` (por defecto `gpt-4o-mini`). Configurar todas como secretos/variables en Netlify, nunca en frontend.
- La notificación se intenta para conversaciones con al menos tres mensajes de usuario, cuando se aporta contacto o cuando el último mensaje contiene una señal de interés comercial. Es una heurística inicial; debe revisarse en pruebas reales.
- El chatbot no confirma precios, inventario ni disponibilidad. El análisis que se envía por correo incluye la conversación y la respuesta generada, no un análisis estructurado independiente validado por un humano.

## Pendiente de configurar y probar
1. Añadir las variables anteriores en Netlify.
2. Confirmar que el esquema de la base de datos `inquiries` está desplegado en el entorno de producción.
3. Probar correo real, WhatsApp real, permisos del panel y comportamiento anti-spam/rate limiting.
4. Ejecutar build y tests y revisar el despliegue. No se ha publicado automáticamente.
