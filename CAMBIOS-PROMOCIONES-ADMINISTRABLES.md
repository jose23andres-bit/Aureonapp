# Promociones emergentes administrables

- Se añadió al panel privado una sección para gestionar la promoción destacada de la página principal.
- Campos editables: título, frase superior, texto de oferta, precio, imagen, duración visible, vídeo de YouTube, enlace de contacto y condiciones.
- Permite subir la imagen del banner desde móvil (JPG, PNG o WebP, máximo 5 MB) usando el almacenamiento del catálogo.
- Las campañas se guardan como registros `content_items` en Supabase, en `section=banners`, con `features.promotionPopup=true`.
- Solo la campaña publicada más reciente se muestra en el pop-up. Al activar otra, las anteriores se conservan como archivadas (no se borran) y pueden recuperarse desde el selector del administrador.
- Duración permitida de 3 a 30 segundos; por defecto 10 segundos. El visitante puede cerrar la promoción manualmente.
- La landing `/promocion-urus` utiliza título, precio, vídeo, contacto y condiciones de la promoción activa.
- Si todavía no se ha guardado ninguna campaña desde el panel, se conserva una promoción inicial de Lamborghini Urus como fallback.

## Persistencia
La configuración de la promoción se almacena en la tabla existente `content_items` de Supabase. No se requiere una tabla nueva, pero la tabla y sus políticas RLS deben existir y permitir a la cuenta de administración autorizada escribir. Las imágenes subidas usan el bucket `aureon-catalog` y sus políticas de almacenamiento existentes.

## Verificación
`node scripts/verify-aureon.mjs` ejecuta las comprobaciones estáticas del proyecto. No equivale a una compilación completa, prueba de navegador ni despliegue de producción.
