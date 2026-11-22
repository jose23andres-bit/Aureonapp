# AUREON AI PROJECT

Web editorial en español de José Andrés Gómez con seis categorías comerciales, recursos de IA y contacto privado. Construida con TanStack Start, React, TypeScript y CSS adaptable. Usa Netlify Functions, Netlify Database con Drizzle y Netlify Blobs; el panel privado utiliza Netlify Identity y exige el rol `admin` en el servidor.

## Desarrollo

Instala con `pnpm install` y ejecuta `pnpm dev`. Para trabajar con autenticación, funciones y almacenamiento usa `netlify dev --port 8889`. El despliegue utiliza la configuración de `netlify.toml`; Netlify aplica las migraciones automáticamente. No apliques las migraciones manualmente.

## Publicación y puesta en marcha

Revisa la vista previa que crea Netlify y publica el despliegue desde el proyecto `aureon-ai-website`. No se necesitan claves de Supabase: los datos utilizan la base de datos gestionada por Netlify. No se ha conectado Supabase.

Identity ha sido habilitado. En Netlify, configura el registro como solo por invitación, invita únicamente a `joseandresautomatiza@gmail.com` y asigna el rol `admin`. La API también comprueba ese correo, además del rol, para impedir el acceso a otras cuentas. Abre `/admin` para aceptar la invitación, iniciar sesión y gestionar contenidos. La mera creación de una cuenta no da acceso a los datos privados.

El catálogo se inicializa mediante migración con las fichas de vehículos de venta, los 16 modelos de alquiler de referencia y las fichas de La Moraleja y Estremera, que pasan a ser gestionables desde administración. Los formularios envían solicitudes privadas mediante `/api/inquiries`; solo confirman el envío tras una respuesta exitosa del servidor. Verifica un envío y su revisión desde administración después del despliegue. Las solicitudes nunca generan anuncios automáticamente. Los archivos de solicitudes quedan en un almacén privado; solo la cuenta administradora autorizada puede descargarlos. Deben establecerse plazos de conservación y revisar los textos legales antes de la apertura comercial.

## Gestión de contenido

El panel permite crear, editar, publicar, retirar y eliminar fichas. El panel incluye campos sencillos para nombre, slug, tipo, estado, descripción, marca, modelo, ubicación, precio propio, tarifa de referencia, fotografías y características; las opciones JSON avanzadas quedan plegadas para bloques especiales. Tipos comerciales: `coches-en-venta`, `villas-en-venta`, `alquiler-villas`, `alquiler-coches`, `ofertas`, `ocio-vip`. Otros tipos: `link`, `video`, `content`.

Una ficha admite `description`, `location`, `brand`, `model`, `price`, `features` (objeto), `images` (URLs HTTPS), `offMarket` y `ownership`. No rellenar datos desconocidos. La administración permite subir WebP a Netlify Blobs y añadirlos a la galería. Las imágenes subidas solo se sirven públicamente cuando forman parte de una ficha publicada. Cada ficha se muestra en `/<tipo>/<slug>`.

Los enlaces iniciales están centralizados en `src/lib/content.ts`. Se pueden modificar desde el panel: al guardar una marca con el mismo slug, el registro de base de datos sustituye el valor inicial en todo el sitio. Para desactivar un destino inicial, cambia su URL a un destino comercial válido; retirar el registro restaura el valor inicial. Los nuevos enlaces también se muestran en ofertas. Los enlaces iniciales se preservan tal como fueron proporcionados.

Un contenido con `placement: "hero"`, `headline` y `body` modifica la portada. Un contenido con `placement: "banner"`, `headline`, `description` y `url` añade una promoción en la portada. Los vídeos se gestionan como enlaces con tipo `video`, `url` y `description`, sin actualización automática ni API de YouTube.

## Recursos y dependencias pendientes

El retrato y los recortes editoriales proceden de los adjuntos. Las imágenes conceptuales se etiquetan expresamente y no se presentan como inventario. Los originales usados están bajo `public/img`. El dossier PDF «Villa 9.8 Jose Andrés» no se encontró entre los cuatro adjuntos. Por ello no se publica una ficha de la villa ni fotografías sustitutas. Tras recibirlo, importa sus fotografías originales y crea la ficha OFF MARKET con los datos documentados, sin dirección exacta.

El prompt SEO completo está disponible en `/recursos/prompt-maestro-seo.txt` y se puede copiar o descargar. No se han añadido estadísticas, inventario, reseñas ni precios inventados. Faltan documentos de inventario, vídeos de automoción verificados y datos fiscales y de contacto legal. Fourvenues bloqueó la inspección automatizada con HTTP 403; se mantuvo su URL original.

La compilación y las comprobaciones de ejecución deben completarse en el pipeline de Netlify antes de publicar. En esta sesión no se pudo ejecutar una compilación local porque el ZIP no incluye `node_modules`; el proyecto modificado no se ha desplegado.


## Cambios de octubre de 2026

- La oportunidad inmobiliaria de Dolores (36 m², 60.000 € sin reformar) se muestra en la portada y en la categoría de villas en venta, con ficha propia. Los 75.000 € reformado y 700 €/mes se describen como estimaciones orientativas.
- La portada incluye los dos enlaces de referido de Revolut y el vídeo informativo debajo; la sección de ofertas conserva su propia presentación.
- Una migración nueva incorpora los 16 modelos que aparecen en el buscador público de Beyond Cars. Sus tarifas se almacenan como referencias externas, no como precios propios confirmados de AUREON. Las imágenes del catálogo de alquiler son ilustrativas hasta que el administrador las sustituya por fotografías autorizadas y confirme disponibilidad, precio, seguro, fianza y titularidad.
- El catálogo público y el panel de administración usan Supabase Auth, `content_items` y Storage. La lista privada de administradores contiene la cuenta autorizada; no se ha creado ni expuesto una contraseña. Las fichas del catálogo principal se guardan en Supabase para poder añadir, editar, retirar y eliminar anuncios sin reconstruir el ZIP.


## Aureon AI Lab (integración de octubre de 2026)

- Nueva ruta pública `/ai-lab` con catálogo filtrable, enlaces a fuentes originales y comandos de instalación copiables.
- La navegación principal, el pie de página y el banner editorial enlazan al AI Lab.
- Se distinguen las skills de la colección oficial `vercel-labs/agent-skills` de los archivos del ZIP aportado: `find-skills` es una skill; `pr-labeling` y `triage` son workflows específicos del repositorio, no skills universales.
- El catálogo no ejecuta comandos, no instala paquetes en los dispositivos de los visitantes y no se conecta a APIs ni a servicios de pago.
- Los productos “Aureon Web Kits”, “Aureon Automation” y “Aureon AI Assistant” aparecen explícitamente como propuestas futuras, no como productos disponibles.
- La ruta estática se sirve mediante el enrutador de la aplicación. Antes de publicar, ejecutar `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` en el pipeline del proyecto.


## Profesionalización y publicación segura

Consulta `docs/PLAN-PROFESIONALIZACION-AUREON.md` para el plan por fases, el estado real de las validaciones y los criterios para publicar. El procedimiento de preview y rollback está en `docs/RUNBOOK-DESPLIEGUE-NETLIFY.md`.

Comprobación estática rápida: `pnpm verify:aureon`. Esta comprobación no sustituye `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` ni la revisión del deploy de preview.


## Afiliación y catálogo editable (16 de octubre de 2026)

- Los 34 registros del catálogo anterior (coches, alquileres y villas) se han importado a `public.content_items`; la oportunidad de Dolores se ha añadido como ficha editable.
- El catálogo de la aplicación lee las fichas públicas de Supabase; el antiguo endpoint de catálogo de Netlify deja de ser la fuente de la vista pública en esta versión.
- El administrador permite añadir, editar, publicar, retirar y eliminar fichas, subir varias fotografías desde el móvil y quitar fotos de una ficha. Las imágenes se almacenan en el bucket `aureon-catalog` con políticas de subida y borrado limitadas al administrador.
- Las categorías de relojes/joyas y cursos/mentorías admiten enlaces de afiliado. Los dos enlaces Hotmart ya incluidos se presentan en cursos. No se han inventado enlaces de seguimiento de relojes/joyas: para cobrar comisiones, primero hay que obtener los enlaces aprobados de Amazon Afiliados, Awin, AliExpress Portals u otro programa.
- Lee `docs/PLAN-MONETIZACION-AFILIADOS.md` para el plan de afiliación y `docs/ADMINISTRACION-SIN-ZIP.md` para el flujo desde el móvil.
- La base de datos Supabase sí se ha actualizado en esta sesión; el código web sigue pendiente de desplegar en Netlify. No se ha publicado la web ni se ha verificado un build completo porque no están instaladas las dependencias (`pnpm`/`node_modules`).


## Aureon Crypto Intelligence

El AI Lab incluye un buscador de criptomonedas y tokens con ficha de mercado y explicación educativa mediante el asistente. Consulta `AUREON-CRYPTO-INTELLIGENCE.md` para conocer los límites, las fuentes y las variables de entorno opcionales (`COINGECKO_API_KEY` y la ya existente `OPENAI_API_KEY`). Las claves se configuran en Netlify, no en el frontend. La integración está incluida en el código del ZIP, pero requiere desplegar el proyecto y probar las APIs en el entorno real.


## Seguridad y publicación

Consulta `AUDITORIA-SEGURIDAD-2026-10-16.md` y completa `SECURITY-RELEASE-CHECKLIST.md` antes de anunciar pagos/descargas como automáticos o la web como auditada. El PDF de formación está fuera de `public/`; su entrega sigue siendo manual tras verificar el pago.
