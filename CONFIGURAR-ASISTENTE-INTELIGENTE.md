# Aureon AI Assistant: alcance y configuración

El asistente es una interfaz conversacional de Aureon respaldada por la API del proveedor configurado. No es el producto ChatGPT alojado dentro de la web ni tiene acceso ilimitado a Internet: usa el modelo indicado y solo dispone de herramientas/datos que se conecten explícitamente.

## Proveedor recomendado

En Netlify → Site configuration → Environment variables, configura `OPENAI_API_KEY`. La función del servidor prioriza OpenAI si hay una clave válida. Por defecto utiliza `gpt-4o-mini`; para elegir otro modelo disponible en tu cuenta, establece `OPENAI_MODEL`. Como alternativa, configura `ANTHROPIC_API_KEY` y opcionalmente `ANTHROPIC_MODEL`; Anthropic se usa cuando no está configurada la clave de OpenAI.

Nunca incluyas claves en el HTML, los archivos `src/`, el ZIP público ni el repositorio. La API puede tener costes y límites de uso. Después de guardar variables, vuelve a desplegar y comprueba Netlify → Functions → `api` si hay errores.

## Qué sabe hacer

- Responder preguntas generales y explicar conceptos, razonar, redactar, traducir, ayudar con estudios, matemáticas, programación, ciencia, historia, cultura y tecnología.
- Orientar sobre motores, automoción, coches deportivos y clásicos, mecánica general y mantenimiento, distinguiendo las recomendaciones generales de un diagnóstico presencial.
- Conocer el contexto comercial de Aureon: coches de lujo, compraventa y alquiler, villas e inmuebles, oportunidades, Ocio VIP (Joy Eslava y HEAT), DJs, alquiler de equipos para eventos, AI Lab, productos digitales, automatización, marketing, SEO, afiliación y educación sobre criptoactivos.
- Conversar con contexto de la sesión, hacer preguntas de seguimiento y no enviar automáticamente al usuario a WhatsApp.

No se debe prometer que sabe literalmente todo. Sin una herramienta de navegación o datos conectados, no puede verificar en directo precios, noticias, normativa, disponibilidad, inventario o cotizaciones. Debe indicar esa limitación y proponer cómo comprobar los datos. No debe inventar reservas, tarifas ni confirmaciones.

## Widget

El lanzador es un botón pequeño, redondo y flotante a la derecha, con la mascota original de Aureon y sin el texto grande “Habla con Aureon”. Al tocarlo se abre el panel de chat con escritura, dictado y voz opcional. La mascota es una ilustración original y no usa activos oficiales de terceros.

## Pruebas después del despliegue

1. Pregunta “¿Qué servicios ofrece Aureon?”
2. Pregunta “Explícame cómo funciona un motor turbo y qué mantenimiento necesita”.
3. Pregunta “¿Qué equipo se necesita para sonorizar una boda?”.
4. Pregunta “¿Qué información hay que confirmar antes de contratar un DJ?”.
5. Pregunta algo que requiera actualidad y comprueba que no inventa datos actuales.

Una clave válida, un modelo habilitado y límites/coste disponibles son necesarios para respuestas reales. Este ZIP no incluye claves privadas ni añade acceso de búsqueda web en directo.
