# Cambios: catálogo de vehículos y navegación persistente

## Catálogo de vehículos
- Se ha añadido un catálogo editorial de 16 fichas a `/coches-en-venta` a partir de la imagen facilitada por el propietario.
- Cada ficha incluye marca, modelo, potencia/características visibles y precio transcrito.
- Las imágenes de cada vehículo se han recortado de la captura original para reutilizarlas como miniaturas locales.
- Incluye búsqueda por texto, filtro por marca, filtro por precio máximo y ficha individual por vehículo.
- Los datos de precio, año, kilometraje y especificaciones son los que aparecen en la imagen de referencia y deben confirmarse antes de publicar una operación. No se ha conectado inventario externo.
- Se incluye la ficha de llantas originales de Lamborghini Urus de 22 pulgadas porque aparece en la captura, claramente identificada como accesorio.

## Navegación
- Los enlaces internos se gestionan mediante el router de la aplicación para evitar recargas completas al moverse entre secciones.
- Se añade un acceso persistente «Inicio» en páginas interiores.
- Los enlaces externos se abren en otra pestaña para mantener AUREON disponible en la pestaña original.
- Las fotografías de las villas se amplían en una lightbox dentro de la propia web; no abren una pestaña nueva.
- El historial del navegador sigue disponible para volver atrás cuando el usuario lo desee.

## Validación
- Integridad del ZIP original comprobada antes de modificar.
- Se ha intentado instalar dependencias y ejecutar build, pero el entorno no pudo acceder a registry.npmjs.org; por tanto, la compilación no se ha podido ejecutar aquí.
- Antes de publicar, ejecutar `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test` y `pnpm build` en un entorno con acceso al registro de paquetes.
