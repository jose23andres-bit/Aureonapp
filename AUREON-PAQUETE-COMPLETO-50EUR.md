# Aureon AI Project — paquete integrado de entrega

## Contenido incluido
- Proyecto web original con catálogos, coches, villas, oportunidades, imágenes, configuración y recursos preservados desde el ZIP de entrada.
- Sección React `src/components/ai-lab.tsx` y estilos asociados.
- Ruta de compra del kit mediante el enlace de Revolut facilitado por el propietario, con precio indicado de 50 € y entrega manual tras verificar el pago.
- Habilidades y documentación relacionadas con Vercel/Skills.
- Kit de replicación empaquetado en `digital-products/aureon-ai-replication-kit/`.
- ZIPs de origen del usuario en `docs/source-packages/` para trazabilidad.

## Venta y entrega
El botón abre el enlace de Revolut. Este proyecto NO valida automáticamente el pago ni desbloquea descargas. Verificar el pago en Revolut y entregar el kit manualmente. No mover el kit a `public/` ni a una carpeta servida estáticamente antes de implementar un mecanismo de acceso tras pago.

## Estado de validación
- Se ha comprobado la integridad estructural del ZIP y la presencia de los archivos clave.
- Se han comprobado estáticamente el enlace de pago, el precio de 50 €, la nota de entrega manual y la ruta AI Lab.
- No se afirma que `pnpm install`, typecheck, tests, build, navegador real o despliegue Netlify hayan pasado; requieren dependencias y acceso autenticado a Netlify.
- La web publicada no ha sido modificada por la creación de este paquete.

## Seguridad y licencias
- Las skills de terceros mantienen sus licencias y atribuciones originales.
- No introducir claves privadas en el frontend ni en este ZIP.
