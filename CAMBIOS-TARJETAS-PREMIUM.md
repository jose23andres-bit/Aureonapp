# AUREON AI PROJECT — actualización de las seis tarjetas

## Cambios incluidos
- Sustituidas las imágenes de las seis tarjetas de la portada por las seis composiciones premium acordadas.
- Las nuevas imágenes están optimizadas en WebP dentro de `public/img/`.
- Eliminada la numeración superior derecha del marcado de las tarjetas.
- Las tarjetas siguen enlazando a sus rutas internas existentes.
- Se ha ajustado la proporción de las tarjetas para mantener el formato vertical de las nuevas composiciones.
- Se han conservado las demás imágenes, enlaces, categorías, promociones y funciones del proyecto.

## Archivos principales modificados
- `src/lib/content.ts`
- `src/components/aureon.tsx`
- `src/styles.css`
- `public/img/category-*.webp`

## Nota de validación
No se ha podido ejecutar una compilación local porque el entorno no ha podido acceder al registro de paquetes npm para instalar las dependencias. Antes de publicar, ejecutar `pnpm install --frozen-lockfile` y `pnpm build` en un entorno con acceso a paquetes y revisar el resultado en una vista previa de Netlify.
