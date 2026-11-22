# AUREON AI PROJECT — Referidos Revolut y consistencia del logo

## Cambios
- El área de “Abrir cuenta personal” del banner enlaza al referido personal configurado en `src/lib/content.ts` (slug `revolut`).
- El área de “Abrir cuenta empresa” enlaza al referido Revolut Business configurado en `src/lib/content.ts` (slug `business`).
- En escritorio se conservan zonas clicables alineadas con los botones dibujados en el banner. En móvil se muestran dos botones reales y accesibles debajo de la imagen, porque las zonas de la imagen serían demasiado pequeñas para tocar con comodidad.
- Los dos enlaces abren en una pestaña nueva e incluyen `rel="sponsored noopener noreferrer"`.
- Se conserva el componente compartido `Brand` y el mismo archivo `public/img/aureon-logo.webp` para el logotipo del encabezado y del pie; las dimensiones se normalizan para escritorio y móvil.
- Se añade una nota de transparencia sobre enlaces promocionales/de referido.

## Enlaces de referido
Las URLs se conservan desde `src/lib/content.ts`, evitando duplicarlas en el componente: `revolut` para la cuenta personal y `business` para Revolut Business.

## Validación
Revisar visualmente las zonas clicables en escritorio y los botones visibles en móvil después de desplegar. Este paquete no se ha publicado automáticamente en Netlify.
