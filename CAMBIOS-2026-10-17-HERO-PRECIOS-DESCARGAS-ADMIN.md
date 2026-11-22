# Cambios acumulados — Hero, precios y descargas de administrador

## Hero principal
- Sustituida la imagen de hero de portada por una fotografía diurna de villa mediterránea y coches deportivos basada en la nueva referencia visual.
- La imagen se ha recortado para no incluir texto ni botones incrustados; titulares, CTA, categorías y rutas siguen siendo componentes funcionales del sitio.
- No se han cambiado los destinos de los botones ni el catálogo de categorías.

## Precios de productos digitales
- Aureon Automation: 50 €, usando el enlace de checkout de Revolut configurado para productos de 50 €.
- Aureon AI Assistant: 50 €, usando el mismo checkout de Revolut.
- SEO, AdSense y nichos rentables: 50 €, usando el mismo checkout de Revolut.
- Crypto & Trading y Web Kits conservan su precio de 50 €.
- Aureon Web Completa conserva su precio de 499 € y su enlace de Revolut propio.
- Se ha mantenido la nota de que la entrega de productos es manual; el enlace de pago no se presenta como desbloqueo automático.

## Descargas de administración
- Se añadió una sección visible únicamente tras iniciar sesión con cuenta autorizada en el panel de administración.
- La guía Crypto & Trading se entrega desde una función de servidor que valida token de Supabase y la lista `admin_allowlist`; no se ha colocado el PDF en `public/`.
- Se añadieron accesos de revisión al prompt SEO y al dossier de villa, que ya son archivos disponibles en el sitio.
- La interfaz advierte que Web Kits, Automation y AI Assistant todavía no tienen un paquete de entrega independiente completo verificado en el proyecto. No se simulan archivos inexistentes.

## Verificación
- `node scripts/verify-aureon.mjs`: 28 comprobaciones estáticas correctas.
- Integridad del ZIP comprobada después de generarlo.
- No se ha ejecutado la compilación completa ni se ha probado la función de descarga contra el proyecto Supabase real; requiere validación tras desplegar en Netlify.
