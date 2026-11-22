# AUREON AI PROJECT

Aplicación TanStack Start + React en español. Estética editorial negro cálido y dorado, Cormorant Garamond y Manrope. La navegación comercial contiene exactamente las seis categorías de `src/lib/content.ts`; IA y monetización pertenecen a recursos.

## Arquitectura

- `src/routes/index.tsx`: portada.
- `src/routes/$.tsx`: rutas de categorías, fichas, recursos, legal y administración; metadatos según sección.
- `src/components/aureon.tsx`: componentes de presentación, formularios, administración, galerías y filtros.
- `src/lib/content.ts`: categorías, enlaces originales centralizados y tipos públicos. Los registros persistidos con el mismo slug sustituyen a los enlaces iniciales.
- `src/styles.css`: identidad y adaptación móvil; respeta reduced motion.
- `netlify/functions/api.mts`: API pública del catálogo y recepción privada; autenticación y autorización admin para toda gestión y consulta privada.
- `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`: esquema Drizzle, adaptador nativo Netlify Database. Migraciones en `netlify/database/migrations`, aplicadas por la plataforma.
- `public/img`: recursos de los adjuntos, recortados para uso editorial. No son inventario.
- `public/recursos`: prompt SEO íntegro.

## Convenciones y decisiones

No inventar propiedades, vehículos, disponibilidad, precio, métricas o colaboraciones. Sin dossier no publicar la villa como un anuncio documentado. Los estados vacíos son intencionados. No importar fotografías de las webs de referencia.

Datos persistentes únicamente en Netlify Database; archivos en Netlify Blobs. Consultas con Drizzle, autorización de servidor con `getUser().roles`. Nunca confiar en roles del cliente. Solicitudes privadas siempre separadas de anuncios; publicación manual por administrador. No exponer las claves de almacén como imágenes públicas sin verificar que la ficha está publicada.

El panel compacto usa un editor JSON para los datos flexibles, con carga de imágenes WebP. Las solicitudes aceptan hasta seis JPG, PNG o WebP, 4,5 MB total. El endpoint de descarga privada exige admin. Los contenidos pueden modificar el hero y añadir banners. Los vídeos son enlaces manuales, no sincronizados.

No ejecutar compilaciones, servidores ni pruebas locales durante sesiones de construcción de la plataforma. No inspeccionar `.git`, imprimir secretos ni crear commits. Documentar límites reales. El pipeline valida la compilación. Para cambios de esquema generar siempre migración con drizzle-kit y nunca aplicarla manualmente.


## Aureon AI Lab y habilidades del agente

- La ruta pública `/ai-lab` se implementa en `src/components/ai-lab.tsx`; los estilos específicos están al final de `src/styles.css`.
- Mantener los enlaces de skills dirigidos a sus repositorios originales; no presentar recursos externos como productos propios ni como instalados en el navegador.
- Los comandos `npx skills add ...` son referencias copiables para el entorno del desarrollador. Nunca ejecutarlos desde el navegador público.
- El catálogo distingue la skill `find-skills` del ZIP aportado de los workflows `pr-labeling` y `triage`, que son específicos del mantenimiento de PRs del CLI.
- Las habilidades del repositorio se guardan en `.agents/skills/` para su descubrimiento por herramientas compatibles. No copiar secretos ni configurar credenciales de producción en el cliente.
- Para cambios de interfaz, comprobar móvil, teclado, estados vacíos, búsqueda/filtros, enlaces externos y texto de compatibilidad. La ruta no promete servicios de IA, pagos ni instalación automática que aún no existan.
