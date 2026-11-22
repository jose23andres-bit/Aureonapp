# AUREON AI Resource Studio — 18/10/2026

## Integrado
- Nueva ruta pública `/recursos/plantillas-ia`, accesible desde el apartado existente `/recursos`.
- Diseño editorial claro/blanco, mobile-first, independiente de la estética oscura/dorada del resto de AUREON.
- Catálogo de 20 dossiers conceptuales originales, con búsqueda, filtro por área, fichas modales y CTA de consulta.
- Aviso explícito de que los dossiers son informativos y no incluyen workflows JSON ejecutables, credenciales, integraciones activas ni instalación.
- Conservados los apartados y contenidos existentes de recursos, MCP, SEO y demás secciones.

## Límites que deben resolverse antes de vender
- El sitio de Exposure publica el rango de referencia USD 300–5.000 por cliente para sistemas implementados; ese rango no es un precio publicado por Exposure para descargar información. La web no expone en el contenido indexado la tabla completa de precios individuales de las fichas. Los rangos de las tarjetas de AUREON son propuestas editoriales propias y no deben anunciarse como precios exactos de Exposure.
- El botón de compra actual abre una solicitud de compra por WhatsApp. No procesa pagos ni concede una descarga protegida automáticamente.
- Antes de cobrar descargas hay que preparar los dossiers completos originales, configurar un checkout real (pasarela y enlaces de pago por producto), confirmar el pago en servidor y entregar archivos mediante URL protegida. No se debe dejar el PDF final accesible públicamente.
- La instalación de dependencias y la compilación no se pudieron ejecutar en este entorno por falta de acceso de red al registro de paquetes. Revisar `pnpm build` y `pnpm typecheck` en un entorno con dependencias disponibles antes del despliegue.
