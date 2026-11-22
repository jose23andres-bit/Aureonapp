# BROLY — Configuración y despliegue seguro

Haz los pasos en orden. **No publiques en producción hasta completar el paso 5.**

## 1. Supabase (proyecto `picvzxqkacgiyqflhpys`)

1. Project Settings → General: comprueba que la región es **eu-west-3 (París)**. El código no cambia la región.
2. SQL Editor: ejecuta **en este orden** (ninguna de las dos está aplicada todavía):
   1. `supabase/migrations/20261018090000_broly_phase1.sql`
   2. `supabase/migrations/20261018120000_broly_assistant.sql`
3. Comprueba que existen `broly_tasks`, `broly_activity`, `broly_connections`, `broly_conversations`, `broly_messages`, `broly_actions` y `broly_memories`, con RLS activado.
4. Comprueba que tu correo está en `admin_allowlist`.

## 2. Variables de entorno en Netlify (Site configuration → Environment variables)

Todas son solo de servidor: **nunca** con prefijo `VITE_`, ni en el repositorio, ni en el chat.

| Variable | Obligatoria | Uso |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Acceso del servidor a las tablas BROLY |
| `BROLY_TOKEN_ENCRYPTION_KEY` | Sí (Google) | `openssl rand -hex 32` (64 caracteres hex). No la cambies después: los tokens guardados dejarían de poder descifrarse |
| `BROLY_STATE_SECRET` | Sí (Google) | `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Sí (Google) | Credenciales OAuth |
| `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` | Para conversar | Las mismas que ya usa el asistente comercial |
| `BROLY_AI_PROVIDER` | No | `openai` o `anthropic` (por defecto, el que tenga clave) |
| `BROLY_AI_MODEL` | No | Por defecto `OPENAI_MODEL` → `gpt-4o-mini`, o `ANTHROPIC_MODEL` |
| `BROLY_CHAT_HOURLY_LIMIT` | No | Mensajes por hora (por defecto 40). Control de costes |
| `BROLY_MAX_OUTPUT_TOKENS` | No | Por defecto 700 |
| `BROLY_TTS_VOICE` | No | Voz premium de OpenAI (por defecto `onyx`, grave). Alternativas masculinas: `ash`, `echo`, `cedar`. Escúchalas en https://www.openai.fm |
| `BROLY_TTS_DAILY_CHAR_LIMIT` | No | Caracteres leídos por día con la voz premium (por defecto 15.000). Control de costes |
| `BROLY_TTS_ENABLED` | No | `false` desactiva la voz premium (usa la del dispositivo) |
| `BROLY_DAILY_SUMMARY_ENABLED` | No | `true` activa el resumen diario a las 07:00 (verano) / 06:00 (invierno), hora de Madrid |

## 3. Google Cloud

1. Activa **Gmail API** y **Google Calendar API**.
2. Pantalla de consentimiento OAuth: modo "Testing", con tu cuenta como usuario de prueba.
3. Credencial OAuth de tipo *Web application*. URI de redirección exacta (la misma de la fase 1):
   - `https://aureonaiproject.netlify.app/.netlify/functions/broly`
   - y la URL de la Deploy Preview si vas a probar ahí.
4. Permisos solicitados: `openid`, `email`, `gmail.readonly` y `calendar.readonly`. Ninguno permite enviar ni editar.

## 4. Micrófono y voz

Ya aplicado: `netlify.toml` permite el micrófono solo en el propio sitio (`microphone=(self)`). La voz de BROLY es la voz masculina en español del dispositivo; en el iPhone se puede instalar una de más calidad en Ajustes → Accesibilidad → Contenido leído → Voces → Español (España).

## 5. Despliegue seguro

1. Sube los cambios a una rama y abre una **Deploy Preview** (sin publicar en producción).
2. En la preview: entra en `/admin`, comprueba que aparece la libélula (abajo a la derecha, encima del asistente comercial) y recorre todas las páginas públicas.
3. Prueba lo siguiente: un mensaje de chat; «recuerda que …» → Aprobar → "Completada y verificada"; la pestaña Memoria (corregir y borrar); Conectar Google → resumen → aprobar; y un mensaje sin la clave de IA.
4. En Supabase, comprueba que se crean filas en `broly_actions`, `broly_messages` y `broly_activity`.
5. Solo entonces publica. Para volver atrás, en Netlify: Deploys → despliegue anterior → "Publish deploy". Las migraciones solo añaden tablas, así que la web anterior sigue funcionando con ellas aplicadas.

## Costes recurrentes estimados

- **IA**: con `gpt-4o-mini`, una respuesta típica consume unos 2.000 tokens de entrada y 300 de salida, menos de 0,001 € por mensaje. Con 40 mensajes al día, menos de 1 € al mes. Los modelos Claude Sonnet o GPT-4o cuestan entre 10 y 20 veces más. Compruébalo en las tarifas actuales de tu proveedor.
- **Voz premium (OpenAI TTS)**: tarifa publicada de 0,60 $ por millón de tokens de texto de entrada y 12 $ por millón de tokens de audio de salida ([modelo gpt-4o-mini-tts](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts)). Para un uso personal (unos minutos de voz al día) cuesta del orden de pocos euros al mes. El tope `BROLY_TTS_DAILY_CHAR_LIMIT` lo limita. El dictado y la voz del dispositivo son gratis.
- **Google APIs**: 0 € dentro de las cuotas gratuitas de Gmail y Calendar.
- **Netlify / Supabase**: el uso de BROLY por un único administrador cabe en los planes actuales. La tarea programada, si se activa, hace 1 ejecución al día.
