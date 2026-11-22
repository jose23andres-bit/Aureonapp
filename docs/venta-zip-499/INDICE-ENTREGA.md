# Aureon Web Completa — índice de entrega (oferta de 499 €)

## Qué es
Paquete de código fuente del proyecto Aureon AI Project y documentación incluida en el ZIP. Es una base para revisar y adaptar, no una instalación alojada transferida ni un servicio de despliegue automático.

## Contenido comprobable en este paquete
- `src/`: aplicación React/TanStack, páginas, catálogo, navegación, AI Lab y panel de administración.
- `public/`: recursos estáticos, imágenes y documentos públicos que forman parte del sitio.
- `netlify.toml`, `vite.config.ts`, `package.json`, `tsconfig.json`: configuración del proyecto.
- `supabase/` y `db/`: esquema, migraciones/semillas presentes y acceso a datos; las credenciales no se incluyen.
- `docs/`: guías de despliegue, administración y monetización disponibles en el paquete.
- `scripts/`: comprobaciones estáticas del proyecto.

## No está incluido ni se promete
- Claves API, contraseñas, sesiones, cuentas, datos privados o credenciales de terceros.
- Transferencia de propiedad de dominios, Netlify, Supabase u otras cuentas.
- Licencias de terceros más allá de las que permitan sus términos originales.
- Despliegue en nombre del comprador, integración de sus claves ni mantenimiento ilimitado.
- Descarga automática posterior al pago: el pago se verifica manualmente y la entrega se acuerda por contacto.

## Antes de entregar a un comprador
1. Confirmar el pago en Revolut mediante el justificante y el estado de la operación.
2. Entregar una copia exacta del ZIP vendido y este índice.
3. Enviar la guía paso a paso y advertir que las variables de entorno deben configurarse en sus propias cuentas.
4. No enviar secretos, contraseñas ni datos de otros clientes.
5. Registrar la fecha, versión entregada y canal de soporte acordado.

## Guía de puesta en marcha
1. Descomprimir el paquete y entrar en la carpeta del proyecto que contiene `package.json`.
2. Instalar la versión de Node compatible indicada por `package.json` y activar pnpm.
3. Instalar dependencias con `pnpm install`.
4. Revisar el archivo de ejemplo de variables de entorno (si existe) y configurar únicamente las claves propias en un entorno local seguro.
5. Configurar el proyecto Supabase propio: ejecutar las migraciones incluidas tras revisarlas y verificar las políticas de seguridad antes de importar datos.
6. Ejecutar `pnpm typecheck`, `pnpm test`, `pnpm verify:aureon` y `pnpm build`; resolver los errores antes de publicar.
7. Probar catálogo y panel con datos de prueba; confirmar edición, imágenes, publicación y retirada no destructiva.
8. Crear un sitio de prueba en Netlify, configurar variables de entorno, desplegar y probar rutas, móvil, formularios y descargas.
9. Solo después de aprobar las pruebas, publicar en el dominio propio.

Esta guía describe el procedimiento; no afirma que todas las integraciones estén preconfiguradas ni que el despliegue se haya realizado.
