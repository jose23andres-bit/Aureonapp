# Cambios visuales seguros — 17/10/2026

- `/alquiler-coches`: usa el póster completo de superdeportivos enviado por el usuario, respetando su proporción original y sin superponer el texto de la plantilla. Se mantiene el catálogo de vehículos debajo.
- `/ocio-vip`: se elimina el panel de título negro vacío que aparecía antes de los apartados de discotecas, DJs y alquiler de eventos. Los apartados existentes se conservan.
- `/ai-lab` desde la portada: se sustituye el banner de ideas/IA por el diseño editorial proporcionado, conservando el enlace al AI Lab.
- `/alquiler-villas`: se muestra el diseño de villas proporcionado a su proporción original, sin duplicar el título ni la caja de búsqueda que ya están impresos en la imagen. El catálogo y su formulario funcional permanecen debajo.
- Catálogos de coches y propiedades: el formulario de consulta queda renderizado una sola vez por el componente Catalog (lista o ficha de detalle), sin una segunda copia desde la página de categoría.
- El aviso de catálogo de superdeportivos no se repite debajo del póster, que ya incluye el aviso informativo.
- Se mantienen el CRM, las funciones Netlify y la configuración Supabase sin cambios deliberados en esta reparación visual.

## Validación

- ZIP original leído sin errores.
- `node scripts/verify-aureon.mjs`: 33 comprobaciones estáticas correctas.
- `node scripts/test-admin-flow.mjs`: 13 pruebas correctas.
- No se ejecutó `vite build` ni `tsc`, porque `node_modules` no está incluido y `pnpm` no está instalado en este entorno. Antes de publicar, compilar en Netlify o con el gestor del proyecto y comprobar las rutas afectadas en móvil y escritorio.
