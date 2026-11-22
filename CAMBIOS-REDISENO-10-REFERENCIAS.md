# Cambios de diseño — 10 referencias visuales

Se han aplicado las referencias facilitadas por el usuario a sus ubicaciones equivalentes, manteniendo textos comerciales, precios, destinos de enlaces, rutas, formularios y comportamiento existente.

1. **Crypto & Trading · Guía práctica 2026**: imagen editorial nueva en la tarjeta de producto del AI Lab; conserva el checkout Revolut de 50 € y las condiciones de entrega manual.
2. **SEO, AdSense y nichos rentables**: nueva imagen editorial en la tarjeta de producto del AI Lab y en el bloque de recursos/prompt SEO; se conservan descarga, copia y lectura del prompt.
3. **Asistente comercial con IA**: nueva imagen de cabecera en la tarjeta Aureon AI Assistant; conserva descripción, avisos y enlace de consulta.
4. **Automatización de procesos**: nueva imagen en la tarjeta Aureon Automation; conserva el contenido y el contacto.
5. **Web Kits**: nueva imagen editorial en la tarjeta Web Kits y en la tarjeta del ZIP completo; se mantienen precios, enlaces Revolut y notas de entrega.
6. **Te vas a transformar**: imagen editorial asociada a la ficha afiliada existente `hotmart-transformacion`; conserva el enlace original.
7. **Mi Primer Librito Armable**: imagen editorial asociada a la ficha afiliada existente `hotmart-librito`; conserva el enlace original.
8. **Conversación privada / atención personalizada**: imagen de fondo aplicada a los bloques existentes de atención personalizada y CTA privado; se conserva el formulario y su endpoint.
9. **Un universo para ir más allá**: imagen de fondo editorial añadida a la cabecera existente de la sección `#universo`; se mantienen las categorías y sus enlaces.
10. **Servidores MCP**: imagen editorial añadida a la sección de Recursos y a la página de detalle MCP; se mantienen las ocho fichas, fuentes oficiales y advertencias de permisos.

## Límites de verificación

- Se ha ejecutado `node scripts/verify-aureon.mjs`: 25 comprobaciones estáticas correctas.
- Se ha comprobado la integridad del ZIP generado.
- No se ha ejecutado la compilación completa, el typecheck ni pruebas de navegador porque este paquete no incluye `node_modules` y no se ha instalado el árbol de dependencias.
- No se ha desplegado la web en Netlify.
