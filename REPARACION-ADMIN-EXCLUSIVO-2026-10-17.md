# AUREON AI PROJECT — reparación del administrador (17/10/2026)

## Objetivo
Restaurar el uso del panel privado de Supabase y retirar el portal de cuentas de clientes de la web, manteniendo el catálogo, la promoción del Lamborghini Urus, las oportunidades, las villas, los coches, las fotos y las funciones de edición ya incluidas.

## Cambios realizados
- Retirado el enlace público «Mi cuenta» y el enlace de registro del pie de página.
- Retirada la ruta `/cuenta` y el componente de registro/inicio de sesión de clientes.
- Retirado el CRM de clientes/pedidos de la interfaz del administrador.
- Eliminadas del módulo frontend las funciones de registro de clientes, perfil, historial y pedidos que solo utilizaba esa área.
- Normalizado a minúsculas el correo introducido en el acceso al administrador y cambiado el filtro de la lista de autorización a comparación sin distinguir mayúsculas/minúsculas.
- El panel consulta las fichas de `content_items` usando el token autenticado del administrador, no una consulta pública anónima.
- El panel permanece accesible tras autorizar al administrador incluso si falla la carga del catálogo; muestra el error concreto en vez de abandonar el flujo silenciosamente.
- Se mantiene la política de Supabase/RLS y no se ha cambiado ni eliminado ninguna tabla ni dato de producción.

## Verificación
- `node scripts/verify-aureon.mjs`: 32 comprobaciones estáticas correctas.
- No se pudo ejecutar `pnpm build` ni `pnpm typecheck` en este entorno porque no hay dependencias instaladas y la descarga del gestor de paquetes falla por falta de conexión de red.
- El paquete no se ha desplegado en Netlify desde este entorno. Para que la web publicada cambie, hay que subir/desplegar este ZIP en el sitio correcto.

## Antes de desplegar
1. Conserva una copia del ZIP anterior y no elimines el proyecto Supabase.
2. Publica la carpeta del proyecto `aureon_ui_fix` desde este ZIP en el sitio Netlify correcto.
3. Después del despliegue, abre `/admin`, inicia sesión con el correo autorizado en `admin_allowlist` y comprueba que carga la lista de fichas.
4. Si el acceso autentica pero no autoriza, revisa que el correo de la cuenta de Supabase coincida con el que está autorizado por la política `private.is_aureon_admin()` y la tabla `admin_allowlist`.

## Importante
La desactivación del portal de clientes en el código no borra los perfiles ni las tablas antiguas de Supabase. Se conservan para evitar pérdida irreversible de datos; no aparecen ni se usan en la interfaz de esta versión.
