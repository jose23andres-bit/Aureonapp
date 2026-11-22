# BROLY — Reparación final y evolución (18/10/2026, noche)

Base: el último ZIP del propietario (`AUREON_AI_PROJECT…`, Drive `1guLhAy0…`). Se integraron sus cambios (Ocio VIP como sección propia, accesos a `/admin` y `/ocio-vip` en el pie y el ajuste `sb_secret_` en `supabase.ts`) sin perder nada.

## 1. Estado real de producción (comprobado contra `aureonaiproject.netlify.app`)

- La web vuelve a estar publicada. Funcionan `/`, `/admin`, `/broly`, `/comprobar-coche`, `og-aureon.jpg`, `market-tape`, `vehicle-check` y `/api/catalog`.
- `/.netlify/functions/broly` responde 401 sin sesión, que es lo correcto.
- Supabase: las 7 tablas `broly_*` **existen** (devuelven 42501 a la clave pública, es decir, están protegidas). Las migraciones de fase 1 y del asistente ya están aplicadas y **no deben repetirse**.

## 2. Errores encontrados y causa raíz

| Fallo | Causa raíz | Corrección |
|---|---|---|
| **HTTP 502 de BROLY** | 1) Las claves nuevas de Supabase `sb_secret_…` no son JWT. Enviarlas en `Authorization: Bearer` hace que Supabase rechace la petición, y el código convertía ese error en un 502. 2) Cualquier fallo de la base de datos o del proveedor de IA se devolvía como 502 sin explicación. 3) Una conversación con varias rondas de herramientas podía acercarse al límite de 60 s de Netlify, que corta la función con 502. | La clave `sb_secret_` se envía solo como `apikey`; también se acepta `SUPABASE_SECRET_KEY`. Una clave incorrecta devuelve **503 con un mensaje claro**. Los errores internos devuelven 500 y se registran en Netlify sin datos sensibles. El chat tiene un **presupuesto de 45 s**, cada proveedor un tiempo máximo y no se lanza otra ronda si no queda margen. |
| Un único proveedor de IA | Si OpenAI fallaba o se agotaba la cuota, BROLY no podía responder. | Cadena de proveedores con respaldo: cada uno se intenta **una sola vez**, sin bucles. |
| Memoria sin selección | Se enviaban siempre los 30 últimos recuerdos al modelo. | Recuperación por relevancia (máx. 12 recuerdos y 2.500 caracteres), resumen de conversaciones largas, memoria del sistema compartida, límites y filtro contra instrucciones maliciosas. |
| Modo sin IA muy limitado | Solo entendía dos órdenes. | Modo local con datos reales: «estado», «mis tareas», «mis recuerdos», «ayuda», «resumen de agenda», «recuerda que…». |

## 3. Proveedores de IA (arquitectura intercambiable)

Orden por defecto: `openai → anthropic → gemini → groq → openrouter → omniroute`. Se usa solo el que tenga clave. El orden se cambia con `BROLY_AI_PROVIDERS`.

| Proveedor | Variable | Coste |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | De pago (ya usado por la web) |
| Anthropic | `ANTHROPIC_API_KEY` | De pago |
| Google Gemini | `GEMINI_API_KEY` | **Nivel gratuito** con límites (Google AI Studio) |
| Groq | `GROQ_API_KEY` | **Nivel gratuito** con límites |
| OpenRouter | `OPENROUTER_API_KEY` | Modelos `:free`; el modelo por defecto `openrouter/free` elige uno disponible (verificado en su catálogo) |
| OmniRoute | `OMNIROUTE_BASE_URL` (+ `OMNIROUTE_API_KEY`) | Ver §5 |
| Pollinations (sin clave) | `BROLY_ALLOW_KEYLESS_FREE=true` | Gratis, **desactivado por defecto**: los mensajes van a un tercero sin acuerdo de servicio, con límite de 1 respuesta cada 30 s por IP |

Ningún proveedor gratuito es ilimitado. Cuando uno devuelve 429 o 402 (cuota agotada), BROLY lo dice y pasa al siguiente.

## 4. Memoria persistente (ideas de claude-mem y Headroom, implementadas de forma nativa en Supabase)

- **Memoria privada** de cada administrador y **memoria del sistema** compartida (`scope = 'global'`), que otros administradores ven pero no pueden editar ni borrar.
- Al modelo solo se envían los recuerdos **relevantes** para el mensaje actual.
- Cuando una conversación supera 24 mensajes, los antiguos se **resumen**; siempre se envían literalmente los 12 últimos.
- Los recuerdos y resúmenes van delimitados y etiquetados como «dato, no instrucciones».
- No se guardan textos que intenten cambiar las reglas («ignora tus reglas», «ahora eres…», «sin aprobación») ni contraseñas, claves o datos bancarios.
- Límite de `BROLY_MEMORY_MAX` recuerdos por usuario (200). Con `BROLY_RETENTION_DAYS`, la tarea diaria borra mensajes y actividad más antiguos.
- Migración **incremental**: `supabase/migrations/20261018200000_broly_memory_v2.sql`, también en `PEGAR-EN-SUPABASE.sql`. Solo añade columnas y se puede repetir. **El código funciona antes y después de aplicarla**: sin ella no hay resúmenes ni memoria del sistema, pero el chat no se rompe.

## 5. Evaluación de proyectos externos (verificados el 18/10/2026)

| Proyecto | Qué es | Decisión |
|---|---|---|
| **OmniRoute** (omniroute.online) | Pasarela abierta *autoalojada* (`npm i -g omniroute`, puerto 20128) con API compatible con OpenAI en `/v1`, respaldo entre proveedores, compresión y caché. | **Adaptador listo** (`OMNIROUTE_BASE_URL`, modelo `auto`). **Pendiente:** hay que alojarlo en un servidor propio accesible desde Internet. No funciona dentro de Netlify ni en `localhost`, así que **no está conectado**. |
| **claude-mem** (Apache-2.0) | Memoria persistente para agentes de programación (sesiones de Claude Code). | No se instala: está pensado para el entorno del desarrollador, no para una web. Se adoptaron sus ideas en Supabase (§4). |
| **Headroom** | Capa de compresión de contexto para aplicaciones LLM. | No se instala (añadiría un servicio y una dependencia). Se aplicó la idea de forma determinista: selección de recuerdos, resúmenes y recorte del historial. |
| **Ruflo** (ruvnet/claude-flow) | Orquestador de enjambres multiagente. | **Descartado por ahora.** BROLY tiene 4 herramientas cerradas; un enjambre añadiría coste, latencia y riesgo sin mejora demostrable. |
| **Task Observer** («one skill to rule them all») | Convierte correcciones de sesiones en mejoras de procedimientos. | No se automatiza en producción. Las valoraciones 👍/👎 ya se guardan por mensaje para revisarlas a mano. Ninguna autoedición sin pruebas ni revisión. |

## 6. Pruebas ejecutadas

- **Local, código:** instalación limpia (`pnpm install --frozen-lockfile`), build de producción OK y **92/92 tests**: 59 de BROLY, incluida la regresión del 502 con `sb_secret_`, el respaldo entre proveedores, el modo local, la memoria v2, los resúmenes y el aislamiento entre administradores. TypeScript: 10 errores, **todos preexistentes**. Lint: 0 errores en el código nuevo. Las migraciones v1, v2 y v3 se validaron en Postgres real (PGlite). Ningún secreto en el bundle del navegador. CSS global idéntico al original.
- **Conversación real con un modelo de IA real** (Pollinations, `gpt-oss-20b`), con la función BROLY real. Supabase y Auth se emularon en memoria porque no hay credenciales de producción. Resultado: responde, propone guardar un recuerdo, la aprobación queda «completada y verificada», y en una conversación nueva BROLY usa ese recuerdo.
- **Navegador real, escritorio 1440×900 y móvil 390×844:** abrir la libélula, enviar un mensaje, ver el estado «procesando» y la respuesta en unos 5,5 s, y recuperar el historial tras recargar.
- **Producción:** comprobados los endpoints públicos y el 401 de BROLY sin sesión. **No se ha podido probar una conversación en producción**, porque requiere la sesión de administrador y las claves en Netlify.

## 7. BROLY modo guerrero y skills de Instagram

- **Transformación:** la libélula pasa a «modo guerrero» con un destello dorado mientras BROLY escucha, piensa, responde o ejecuta, y vuelve a ser libélula al terminar (`src/broly/warrior.tsx`). Es un **personaje original de AUREON**: pelo de energía dorado, armadura negra y dorada con el emblema «A», ojos cian y aura. **No reproduce a ningún personaje con licencia.** Respeta «reducir movimiento».
- **Skills de Instagram** (`.agents/skills/ig-*`, MIT, de Jake Schincariol): 13 skills de contenido. Revisadas antes de instalarlas: los scripts de Python no hacen llamadas de red, no ejecutan comandos y no piden credenciales. Están adaptadas al español (ver `_instagram-agent/ADAPTACION-ES.md`). Son herramientas para el asistente de desarrollo: no forman parte de la web ni publican en Instagram.

## 8. Villas de colaboradores (julio 2026)

- Origen: carpeta compartida de Drive con 10 destinos y **39 villas**: Bali, Cannes, Mykonos, islas privadas, Maldivas, Marbella, Mónaco y Riviera, República Dominicana, Seychelles y Tulum.
- Se publican en **Alquiler de villas** (`#villas-colaboradores`) con filtros por destino, buscador, opción «solo fichas completas», «ver más», ficha con galería (flechas, miniaturas, deslizar con el dedo, teclado) y enlace directo `#villa-<slug>` para compartir.
- Contacto: botón pequeño **«Consultar por WhatsApp»** con el enlace de contacto de la web (el que se edita desde el administrador), más la referencia `AUR-XXX-NN`. Si el enlace es `wa.me/<número>`, el mensaje sale ya escrito con la villa y su referencia.
- Datos: **solo los que constan en los dosieres**. Hay 11 fichas completas; 22 con fotos y datos bajo petición, y 6 sin material, que se muestran como «información bajo petición». Las tarifas que aparecen son las del colaborador, marcadas como sujetas a confirmación. No se publica el nombre del colaborador ni enlaces a su Drive. Los vídeos se indican como «disponibles bajo petición».
- Fotos: 148 imágenes en WebP de 1100 px como máximo (7,5 MB) en `public/img/villas-colaboradores/`, servidas a través del CDN de imágenes de Netlify. Se descartaron las páginas de texto y los fotogramas negros. Datos en `src/lib/villas-colaboradores.ts`.
- **Pendiente del propietario:** confirmar que el colaborador autoriza publicar estas fotos y datos.

### 8.1 Capa interactiva 2026 de las villas (Alquiler de villas)
- **Carrusel cinematográfico** con las 11 fichas completas. Usa cuatro transiciones que se van alternando (barrido diagonal, zoom a través, iris y deslizamiento), recreadas en CSS al estilo de los efectos de vídeo de Higgsfield, sin usar vídeos. Además: efecto Ken Burns, grano de película, título que aparece letra a letra, barras de progreso, pausa al pasar el ratón y deslizar con el dedo.
- **View Transitions API:** la foto de la tarjeta se transforma en la galería de la ficha, y las tarjetas se recolocan animadas al filtrar. Los navegadores sin soporte funcionan igual, sin la animación.
- **Animaciones vinculadas al scroll** (`animation-timeline: view()`) en el carrusel y el título, como mejora progresiva.
- **Tarjetas:** inclinación 3D con reflejo de luz (solo con ratón), borde dorado que gira, segunda foto que entra con un barrido y aparición escalonada al hacer scroll.
- **Barra de filtros fija con efecto cristal**, contadores animados y conmutador entre cuadrícula y **vista cine** (tira horizontal que encaja cada villa).
- **Ficha:** se abre en un portal sobre la página, con transiciones entre fotos, presentación automática, pantalla completa y botón de WhatsApp con pulso suave. Mientras está abierta se ocultan los botones flotantes.
- Respeta «reducir movimiento». Comprobado en Chromium real en escritorio y móvil: View Transitions y scroll-timeline activos, sin errores y sin scroll horizontal.

## 9. BROLY en WhatsApp y contratos automáticos (19/10/2026)

### 9.1 Funcionamiento
1. Escribes a BROLY desde tu WhatsApp, por ejemplo: «Hazme un NCNDA para Juan Pérez, +34 600 111 222. Operación: venta de villa en Marbella, comisión 5 %».
2. BROLY elige el modelo, rellena **solo los datos que le has dado** (los demás los deja en blanco, no inventa) y te contesta con un resumen: *«Responde SÍ para aprobar o NO para cancelar»*. Sin tu «sí» no se crea ni se envía nada. También puedes aprobarlo desde el panel de BROLY de la web.
3. Al aprobarlo, se genera el PDF con la referencia `AUR-CT-2026-000X` y se envía al cliente por WhatsApp junto a un enlace seguro `https://<web>/contrato/<código>`.
4. El cliente puede rellenar el PDF directamente (los campos que faltan son editables) o, mejor, abrir el enlace. Allí completa lo que falta, escribe su nombre y DNI, acepta y firma. **No puede cambiar los datos que tú ya rellenaste.**
5. Queda un registro de la firma (nombre, documento, fecha, IP, dispositivo y huella SHA-256), se genera el PDF final, que ya no se puede editar, y recibes un aviso por WhatsApp con el enlace de descarga.

En el enlace solo va un código aleatorio de 192 bits; en la base de datos se guarda únicamente su huella. Si no se firma, el enlace caduca a los 30 días; una vez firmado, sirve para descargar el PDF. La página no se indexa en Google.

### 9.2 Modelos incluidos (32 modelos en 11 categorías)
- **Confidencialidad e intermediación:** NDA unilateral; NDA mutuo; NCNDA (no elusión, no competencia y confidencialidad: protege al intermediario para que no se lo salten); encargo de intermediación para venta; encargo de búsqueda; reparto de comisiones entre intermediarios; carta de intenciones (LOI).
- **Inmobiliario:** arras penitenciales; arras confirmatorias; reserva con señal; arrendamiento de temporada; arrendamiento de local.
- **Alquiler de villas:** alquiler vacacional; confirmación de reserva con señal; gestión y comercialización de villa.
- **Vehículos:** compraventa entre particulares; alquiler de vehículo de lujo; depósito para venta; reserva con señal.
- **Eventos y ocio:** contratación de DJ o artista; alquiler de sala o espacio; alquiler de equipos.
- **Lujo y joyería:** compraventa de reloj o joya.
- **Servicios y colaboración:** prestación de servicios; agencia comercial; afiliación y marketing; consultoría o mentoría; diseño web o desarrollo de software.
- **Propiedad intelectual e imagen:** derechos de imagen; cesión de fotografías y contenidos.
- **Financiero:** préstamo entre particulares; reconocimiento de deuda.
- **Sociedades:** colaboración empresarial (joint venture).
- **Protección de datos:** encargado del tratamiento (RGPD, art. 28).

Todos los modelos incluyen cláusulas de protección de datos, notificaciones, firma electrónica y jurisdicción. **Aviso:** son modelos orientativos basados en la normativa española (Código Civil, LAU, Ley 1/2019 de Secretos Empresariales, RGPD, eIDAS…), no asesoramiento jurídico. En operaciones importantes, que los revise un abogado. Se usa firma electrónica simple (eIDAS), que es válida como prueba, aunque su fuerza es menor que la de una firma avanzada o cualificada. Los contratos que exigen escritura pública (por ejemplo, la compraventa de un inmueble) siguen necesitando notario.

### 9.3 Configuración en Meta (la haces tú, una sola vez)
Se usa la **API oficial de WhatsApp Cloud**. Las apps no oficiales que leen tu WhatsApp personal están prohibidas por Meta y pueden hacer que te bloqueen el número.
1. Entra en developers.facebook.com, crea una app de tipo *Empresa* y añade el producto **WhatsApp**. Añade un número: puede ser uno nuevo o tu número de WhatsApp Business mediante *coexistencia*, que te permite seguir usando la app en el móvil.
2. En *Configuración de la API* copia el **identificador del número de teléfono** (`WHATSAPP_PHONE_NUMBER_ID`). En *Configuración del negocio → Usuarios del sistema*, crea un token permanente con los permisos `whatsapp_business_messaging` y `whatsapp_business_management` (`WHATSAPP_TOKEN`).
3. En *Configuración de la app → Básica* copia la **clave secreta de la app** (`WHATSAPP_APP_SECRET`).
4. En *WhatsApp → Configuración → Webhook*, pon la URL de devolución de llamada `https://aureonaiproject.netlify.app/.netlify/functions/whatsapp` y como token de verificación el mismo texto que pongas en `WHATSAPP_VERIFY_TOKEN`. Después, suscríbete al campo **messages**.
5. En Netlify (*Site configuration → Environment variables*), añade las variables `WHATSAPP_*`, `BROLY_OWNER_USER_ID` (tu id de usuario admin en Supabase), `WHATSAPP_OWNER_NUMBER` (tu móvil con prefijo, por ejemplo `34600…`) y, si quieres, `AUREON_LEGAL_NAME/ID/ADDRESS/CONTACT` para que tus datos se rellenen solos en los contratos. Vuelve a desplegar.
6. En Supabase, abre el SQL Editor y ejecuta `PEGAR-EN-SUPABASE.sql`. Se puede ejecutar varias veces sin problema.

### 9.4 La regla de las 24 horas y la plantilla
WhatsApp solo deja enviar mensajes libres si el cliente te ha escrito en las últimas 24 horas. Si no, BROLY te avisa y te deja el enlace para que lo compartas tú. Para poder enviar el contrato siempre, crea en el *Administrador de WhatsApp → Plantillas de mensajes* una plantilla de categoría **Utilidad**, en español y con variables **numeradas**:
- Encabezado: **Documento**.
- Cuerpo, por ejemplo: `Hola {{1}}, le enviamos el documento «{{2}}» de AUREON AI PROJECT. Puede revisarlo, completarlo y firmarlo aquí: {{3}}`
- Cuando Meta la apruebe, pon su nombre en `WHATSAPP_CONTRACT_TEMPLATE` (y `WHATSAPP_TEMPLATE_LANG=es`). Meta cobra por cada mensaje de plantilla según su tarifa vigente para España; los mensajes dentro de las 24 horas no tienen coste de plantilla.

### 9.5 Mensajes de clientes
- Los mensajes que recibe tu número de empresa te llegan reenviados a tu WhatsApp (`BROLY_WA_FORWARD=true`).
- Desde enero de 2026, Meta prohíbe los asistentes de IA de uso general en la API de WhatsApp. Por eso, la respuesta automática a clientes está **desactivada** por defecto. Si activas `BROLY_WA_CLIENT_AUTOREPLY=true`, solo responde sobre los servicios de AUREON, sin acceso a herramientas ni a tus datos, y siempre ofrece pasar con una persona.

### 9.6 Pruebas (todas en local, con Meta y Supabase emulados)
- 16 pruebas de contratos: 32 modelos con PDF válido; ningún campo imposible de rellenar ni duplicado; nada sucede sin aprobación; envío dentro y fuera de la ventana de 24 horas, con y sin plantilla; el cliente no puede alterar los datos ya rellenados; un código inventado no da acceso; firma registrada y PDF final no editable. También se prueba el webhook: verificación de Meta, firma `X-Hub-Signature-256`, reintentos sin duplicar, trabajador firmado y aprobación con «sí».
- Prueba en Chromium real (escritorio y móvil) de `/contrato/<código>`: rellenar, firmar, ver la confirmación y descargar el PDF.
- La migración se ha ejecutado dos veces en Postgres (PGlite) sobre las migraciones anteriores de BROLY.
- **Sin probar contra los servidores reales de Meta ni de Supabase:** necesitan tus credenciales. La primera prueba real que conviene hacer: escríbele «hola» a tu número de empresa desde otro móvil y, después, pide a BROLY un NDA para ese número.

## 10. Radar BROLY: clientes potenciales cada 12 horas por WhatsApp (19/10/2026)

### 10.1 Funcionamiento
- **Cuándo:** todos los días a las 09:00 y a las 21:00 (hora de Madrid en verano; en invierno, a las 08:00 y a las 20:00). Lo lanza `radar-scheduled`, que solo deja en cola un trabajo firmado. La búsqueda la hace `radar-background`, porque una función programada solo puede durar 30 segundos y una en segundo plano hasta 15 minutos. También puedes lanzarlo cuando quieras: escribe **«informe»** a BROLY por WhatsApp o pulsa el icono del radar en *Tareas* del panel.
- **Qué busca:** personas que **piden** algo de lo que ofreces en Madrid y alrededores: DJ, eventos y fiestas, equipos de sonido e iluminación, ocio VIP, alquiler y compra de coches de lujo, villas (en cualquier zona), vivienda de lujo, relojes y joyas, y medicina estética. Las búsquedas están en `netlify/broly-core/leads/sources.ts`.
- **Dónde:** consulta resultados públicos que Brave Search ya tiene indexados (título y extracto) de Milanuncios, Wallapop, idealista, coches.net, Forocoches, Reddit, la comunidad de bodas.net y otros foros. **No entra en esos portales ni usa cuentas.** Sus condiciones prohíben extraer datos de forma automatizada, e idealista ya ha llevado a los tribunales a quien lo hacía. Facebook, Instagram, TikTok, LinkedIn y X se descartan: requieren iniciar sesión y no permiten la recogida automática.
- **Filtro:** descarta anuncios, ofertas, empresas que se promocionan y compraventas profesionales («compro oro, pago al contado»). Se queda con quien escribe «busco», «necesito», «¿alguien recomienda…?» o similar, en la zona indicada. Calcula una urgencia («este sábado» es alta; «el 14 de noviembre», media) y una puntuación de 0 a 100. Si hay IA configurada, BROLY revisa cada resultado y lo resume, sin añadir datos.
- **Sin repetidos:** cada publicación se guarda con una huella de su enlace y solo se envía una vez. Pasados `LEADS_RETENTION_DAYS` días (30 por defecto) se borra.
- **Informe:** un PDF con portada, cifras, demanda por categoría, prioridades del día y una ficha por persona: qué busca, zona, fuente, fecha, urgencia, siguiente paso y enlace a la publicación. Te llega por WhatsApp al número `WHATSAPP_REPORT_TO` junto con un resumen. Si no hay nada nuevo, solo recibes un aviso de texto (sin coste de plantilla) y únicamente si la conversación está abierta.

### 10.2 Lo que el radar no hace
- **No hace fichas de personas.** Antes de guardar o enviar nada se ocultan los teléfonos, los emails y los @usuarios. No se cruzan datos de distintas fuentes para averiguar quién es alguien: en España eso sería tratar datos personales sin base legal (RGPD) y Meta no lo permite en WhatsApp. El informe te lleva a la publicación y respondes allí. Escribirles por WhatsApp o email sin su permiso es una comunicación comercial no solicitada (LSSI, art. 21).
- **Medicina estética:** buscar bótox revela un dato de salud. Esas fichas salen marcadas como **dato sensible**, sin guardar detalles médicos, y el siguiente paso es derivar a una clínica autorizada: en España el bótox solo puede aplicarlo un médico en un centro sanitario autorizado.
- **No son «200 agentes».** El resultado depende de cuántas búsquedas se hacen, no de cuántos «agentes» se lancen. El radar hace `LEADS_MAX_QUERIES` búsquedas por turno (16 por defecto, 2 a la vez) y las va alternando, de modo que en 24 horas se cubren todas. 200 búsquedas cada 12 horas costarían unos 60 € al mes en Brave y saldrían casi siempre los mismos resultados.
- **Cobertura real:** los portales de anuncios publican sobre todo ofertas. Las peticiones aparecen sobre todo en foros, en Reddit y en la sección de demandas de Milanuncios. idealista y coches.net casi nunca tienen gente buscando, y las publicaciones de las últimas horas pueden tardar en aparecer en el buscador. Habrá días con pocos resultados o ninguno.

### 10.3 Configuración
1. Crea la cuenta en **api-dashboard.search.brave.com** y elige el plan *Search*. Incluye 5 $ de crédito gratuito al mes, unas 1.000 búsquedas; después cuesta 5 $ por cada 1.000. Brave pide una tarjeta para verificar tu identidad. Pon un **límite de gasto** en el panel de Brave. Con 16 búsquedas por turno, 2 turnos al día y 31 días salen 992 búsquedas: dentro del crédito gratuito.
2. En Netlify añade `BRAVE_SEARCH_API_KEY` y `WHATSAPP_REPORT_TO=34722705922`. Puedes cambiar `LEADS_CITY`, `LEADS_MAX_QUERIES`, `LEADS_FRESHNESS` (`pd` = 24 h, `pw` = semana, `pm` = mes) y `LEADS_CATEGORIES` (por ejemplo, `djs,eventos,sonido`). El resto de variables de WhatsApp son las de la sección 9.
3. En Supabase ejecuta `PEGAR-EN-SUPABASE.sql`. Incluye las tablas `broly_leads` y `broly_lead_runs`, solo accesibles desde el servidor.
4. **Para que te llegue siempre el PDF:** WhatsApp solo permite enviarte mensajes libres si has escrito a BROLY en las últimas 24 horas. Si no le escribes a diario, crea en Meta una plantilla de categoría **Utilidad** con encabezado **Documento** y un cuerpo como `Radar BROLY del {{1}}: {{2}} oportunidades nuevas. Tienes el detalle en el PDF.`. Cuando la aprueben, pon su nombre en `WHATSAPP_REPORT_TEMPLATE`. Cada envío de plantilla tiene el coste que fija Meta, y Meta puede reclasificar la categoría. Si la conversación está cerrada y no hay plantilla, el informe queda guardado en el panel y no se envía.
5. **Importante:** el número que envía (el de WhatsApp Business conectado a la API) **no puede ser el mismo** que el que recibe. Si +34 722 705 922 es el número que conectas a la API, los informes deben ir a otro número tuyo.

### 10.4 Pruebas (en local, con Brave, Meta y Supabase simulados)
- 14 pruebas del radar: reparto de búsquedas y presupuesto; separación entre peticiones y anuncios, profesionales y redes con inicio de sesión; zona y urgencia; ocultación de teléfonos, emails y usuarios (también en lo que devuelve la IA); enlaces duplicados; PDF con un enlace pulsable por ficha; turno completo sin repetir a nadie; ventana de 24 horas y plantilla; corte por límite de Brave; programación cada 12 horas con trabajo firmado y no reutilizable; panel solo para administradores; orden «informe» por WhatsApp.
- Migración ejecutada dos veces en Postgres (PGlite), con sus restricciones comprobadas.
- **No probado contra los servicios reales** (Brave, Meta y Supabase): hacen falta tus claves. Para la primera prueba real, escribe «informe» a BROLY por WhatsApp.
