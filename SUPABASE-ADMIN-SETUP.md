# AUREON AI — panel de administración

## Funciones
- Enlace **Administrador** en la navegación pública que lleva a `/admin`.
- Login de Supabase restringido al correo que está en `public.admin_allowlist`.
- Crear, editar, publicar, retirar y eliminar fichas de coches, alquileres, propiedades, ofertas y otros contenidos.
- Filtrar la lista por sección y eliminar fichas desde la lista.
- Elegir varias imágenes desde la galería/archivos del móvil; se suben a Supabase Storage y se guardan en la ficha al pulsar **Guardar ficha**.

## Requisitos de despliegue
1. Publicar el código con Node 22 y `pnpm build`, salida `dist/client` (ver `netlify.toml`).
2. En Supabase, ejecutar una vez el SQL del archivo `SUPABASE-STORAGE-POLICIES.sql` desde SQL Editor. La migración crea el bucket `aureon-catalog` y sus políticas seguras. Si el SQL ya se ejecutó, las políticas no deben duplicarse; elimina las políticas homónimas antes de repetirlo.
3. Confirmar en Supabase Auth que el usuario administrador está confirmado y que su email figura en `public.admin_allowlist`.
4. Añadir `https://aureonaiproject.netlify.app/**` como URL permitida de redirección en Supabase Auth si se usa esa URL para la web.
5. Probar `/admin`, login, subida de foto, guardar ficha, publicación y visualización pública antes de darlo por operativo.

## Seguridad
- No incluir service-role key en el navegador. El código solo usa la clave pública/publishable.
- RLS en `content_items` y `admin_allowlist` limita cambios al administrador autorizado.
- El bucket permite lectura pública de imágenes de catálogo, pero requiere `private.is_aureon_admin()` para escribir.
