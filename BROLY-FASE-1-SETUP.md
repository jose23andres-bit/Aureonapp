# AUREON BROLY — Fase 1

## Qué funciona en esta fase
- Ruta privada `/broly` dentro de la aplicación existente.
- Reutiliza la sesión Supabase ya utilizada por el panel `/admin` y verifica la allowlist `admin_allowlist` en el servidor.
- Cola persistente de tareas y registro de auditoría en Supabase.
- Primer flujo real: resumen de agenda de hoy + correo reciente de Gmail (solo lectura), resumen con OpenAI si `OPENAI_API_KEY` está configurada y fallback a resumen determinista si no lo está.
- Interfaz de voz mediante Web Speech API del navegador (dictado) y `speechSynthesis` (lectura en voz alta). No necesita subir audio a un proveedor externo.
- OAuth Google con scopes mínimos de lectura: Gmail y Calendar. Tokens cifrados con AES-256-GCM antes de guardarse.
- No envía correo, no crea/edita eventos y no ejecuta instrucciones arbitrarias en esta fase.

## 1. Ejecutar migración
En Supabase SQL Editor, ejecutar `supabase/migrations/20261018090000_broly_phase1.sql`. El proyecto ya existente mantiene su URL/configuración. Verificar que el proyecto Supabase se encuentra en la región solicitada `eu-west-3` desde Project Settings; este paquete no cambia la región del proyecto.

## 2. Secretos de Netlify
Configurar en Site configuration → Environment variables (solo server-side):
- `SUPABASE_SERVICE_ROLE_KEY`: service role key del proyecto. No añadir prefijo `VITE_` y nunca ponerla en el cliente.
- `SUPABASE_URL`: URL del proyecto existente (por defecto el código usa la URL actual).
- `SUPABASE_PUBLISHABLE_KEY`: publishable key pública (por defecto usa la actual del proyecto).
- `BROLY_TOKEN_ENCRYPTION_KEY`: 32 bytes aleatorios en hexadecimal (64 caracteres). Generar con `openssl rand -hex 32`.
- `BROLY_STATE_SECRET`: secreto aleatorio para firmar el estado OAuth. Generar con `openssl rand -hex 32`.
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: credenciales OAuth de Google Cloud.
- `OPENAI_API_KEY` (opcional): si no está, el flujo produce un resumen estructurado sin llamada a IA.
- `OPENAI_MODEL` (opcional; por defecto `gpt-4o-mini`).

No copiar ningún secreto a `.env` del frontend, al repositorio ni al chat. Tras modificar variables, volver a desplegar Netlify.

## 3. Google OAuth
En Google Cloud Console:
1. Activar Gmail API y Google Calendar API.
2. Configurar pantalla de consentimiento OAuth y añadir como usuario de prueba la cuenta Google administradora.
3. Crear credenciales OAuth de tipo Web application.
4. Añadir el URI autorizado exacto `https://TU-DOMINIO/.netlify/functions/broly` (y el dominio de deploy de pruebas si se usará).
5. Añadir `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` a Netlify.

La primera conexión solicita `openid`, `email`, Gmail readonly y Calendar readonly. No concede permiso de envío ni de edición del calendario.

## 4. Acceso
Iniciar sesión primero en `/admin` con la cuenta incluida en `admin_allowlist`, después abrir `/broly`. Si no existe sesión autorizada, la API responde 401/403. El navegador no recibe la service-role key ni los tokens OAuth.

## 5. Validación antes de producción
- Aplicar migración y verificar tablas.
- Añadir variables de entorno y URI OAuth.
- Probar conexión Google, resumen con y sin `OPENAI_API_KEY`, tarea sin conexión Google y fallo de proveedor.
- Verificar en Supabase que cada ejecución genera `broly_tasks` y `broly_activity`.
- Confirmar permisos de micrófono en el navegador para dictado. La voz depende de soporte del navegador y HTTPS.

## Limitaciones conocidas
- Google OAuth no se puede completar hasta añadir credenciales reales y autorizar el callback.
- No hay todavía ejecución programada en background; el resumen se ejecuta bajo demanda desde el panel.
- En la fase 1, las instrucciones generales solo se registran como tarea. La única automatización conectada a aplicaciones externas es el resumen de Gmail/Calendar.
- El ZIP no se considera desplegado ni verificado en producción hasta completar la compilación y las pruebas de integración con las credenciales del propietario.
