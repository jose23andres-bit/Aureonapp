# Aureon AI Project — reparación preventiva

## Cambios incluidos
- Se conserva el proyecto completo de la versión recibida, incluidas las rutas de administración `/admin` y clientes `/cuenta`, el catálogo, las imágenes locales, el CRM, las migraciones y las funciones de promoción.
- Se añade el fragmento oficial de Google AdSense (cliente `ca-pub-8930598875852616`) al `<head>` del documento raíz, en vez de insertarlo en el cuerpo de la aplicación.
- No se eliminan ni se sobrescriben tablas ni datos remotos.

## Importante antes de publicar
Este ZIP contiene el código fuente de una aplicación TanStack Start, no una carpeta estática `dist/client` compilada. Para desplegarlo se debe usar el proyecto Git/Netlify con el comando `pnpm build` y la configuración de Netlify incluida; no se debe publicar el código fuente directamente como si fuera un sitio estático.

## Verificaciones
- ZIP íntegro.
- Verificador estático de Aureon: 35 comprobaciones aprobadas.
- No se pudo completar la compilación en el entorno de reparación porque `pnpm` no está instalado y `npm install` no terminó dentro del tiempo disponible. Por tanto, no se afirma que la aplicación haya sido compilada ni probada en producción.

## Supabase
Las tablas y políticas de las migraciones incluidas deben existir en el proyecto Supabase. Las migraciones no se ejecutan automáticamente al publicar Netlify. No borrar ni reinicializar datos remotos para intentar solucionar un error de despliegue.
