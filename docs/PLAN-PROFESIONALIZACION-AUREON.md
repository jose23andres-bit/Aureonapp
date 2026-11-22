# Plan de profesionalización — Aureon AI Project

**Objetivo:** convertir Aureon en una plataforma fiable que genere contactos comerciales y ventas, preservando los catálogos existentes de coches, villas, alquileres, oportunidades, afiliación y AI Lab.

**Regla de publicación:** no sustituir producción hasta que compile, pase pruebas, las rutas críticas se revisen en navegador y se valide un deploy de prueba.

## Fase 1 — Integridad y control de cambios

- [x] Mantener los recursos originales y las categorías comerciales.
- [x] Añadir un verificador estático ejecutable con Node (`node scripts/verify-aureon.mjs`).
- [x] Corregir el verificador para comprobar el checkout real de Revolut de 50 € y la entrega manual, en lugar de exigir un botón de Stripe que no corresponde a la interfaz actual.
- [x] Añadir prueba de componente para búsqueda, filtros y enlace de pago.
- [ ] Ejecutar Vitest, TypeScript, ESLint y compilación en un entorno con dependencias instaladas.
- [ ] Conservar el ZIP previo y revisar el diff antes de cada despliegue.

## Fase 2 — SEO técnico inicial

- [x] Añadir metadatos de título, descripción, Open Graph y canonical a la portada.
- [x] Añadir `public/sitemap.xml` con las rutas públicas conocidas.
- [x] Declarar el sitemap en `robots.txt`; mantener `/admin` y `/api/` fuera del rastreo.
- [ ] Verificar en navegador que cada URL del sitemap responde con el contenido correcto.
- [ ] Confirmar el dominio canónico definitivo. Si se usa dominio propio en vez de Netlify, actualizar canonical, sitemap y Open Graph.
- [ ] Añadir Search Console y enviar el sitemap.
- [ ] Revisar contenido duplicado, páginas vacías, imágenes alt, metadatos únicos y datos estructurados solo donde correspondan.

## Fase 3 — Conversión y confianza

- [ ] Comprobar en móvil y escritorio las fichas de vehículos, villas, alquileres y oportunidades.
- [ ] Verificar cada CTA: WhatsApp, formularios, correo, afiliación y enlaces externos.
- [ ] Mostrar datos concretos y actualizados en cada ficha: precio, disponibilidad, características, condiciones y procedencia de las imágenes.
- [ ] Publicar páginas legales completas (aviso legal, privacidad, cookies, condiciones de venta y política de reembolso) revisadas para la actividad real.
- [ ] Identificar de forma visible los enlaces de afiliación y cualquier contenido patrocinado.
- [ ] Revisar accesibilidad: navegación por teclado, contraste, foco visible, etiquetas de formularios y textos alternativos.

## Fase 4 — Producto digital AI Lab de 50 €

- [x] Mostrar el precio de 50 € y el enlace de pago Revolut configurado por el propietario.
- [x] Informar que la entrega es manual tras verificar el pago.
- [ ] Probar el enlace de pago real desde un dispositivo distinto sin completar compras accidentales.
- [ ] Preparar un procedimiento manual: comprobar pago en Revolut, registrar pedido, enviar el ZIP correcto y confirmar entrega.
- [ ] Definir exactamente el contenido entregado, compatibilidad, licencia, soporte, actualizaciones y reembolsos antes de promocionarlo.
- [ ] Automatizar la entrega solo después de disponer de confirmación de pago verificable desde una integración autorizada; nunca confiar únicamente en una redirección del navegador.
- [ ] Revisar licencias y avisos de terceros. No vender las skills de Vercel como propiedad exclusiva de Aureon.

## Fase 5 — Asistente, datos y seguridad

- [x] Documentar que el asistente existente requiere `OPENAI_API_KEY` como variable privada del servidor.
- [ ] Probar el asistente sin clave, con clave válida, con error de API y con límites de uso.
- [ ] Confirmar que no se expone ninguna clave en código cliente, repositorio o logs.
- [ ] Revisar autenticación, permisos y acceso al panel `/admin`; comprobar que todas las operaciones sensibles se validan en servidor.
- [ ] Verificar las políticas de Supabase/Netlify Database y los permisos de almacenamiento.
- [ ] Añadir límites de peticiones, validación de entradas, protección contra spam y mensajes de error no sensibles.
- [ ] No activar pagos con tarjeta o descargas automáticas hasta completar pruebas de extremo a extremo.

## Fase 6 — Analítica y monetización

- [ ] Configurar analítica respetuosa con la privacidad y consentimiento cuando sea necesario.
- [ ] Medir eventos: contacto por WhatsApp, envío de formulario, clic de afiliación, clic de checkout y venta confirmada.
- [ ] Crear un panel mensual con visitas, contactos cualificados, conversión, ventas y coste por contacto.
- [ ] Priorizar oportunidades comerciales reales antes de perseguir tráfico masivo o publicidad.
- [ ] Añadir AdSense solo cuando el sitio tenga contenido original suficiente, navegación estable y cumpla las políticas aplicables.

## Fase 7 — Validación y publicación

- [x] Ejecutar las 12 comprobaciones estáticas del script `scripts/verify-aureon.mjs`.
- [ ] Instalar dependencias con la versión compatible de Node y pnpm.
- [ ] Ejecutar `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` y `pnpm verify:aureon`.
- [ ] Corregir errores y repetir todas las comprobaciones.
- [ ] Crear un deploy de preview de Netlify.
- [ ] Revisar portada, catálogos, fichas, AI Lab, formularios, rutas 404, consola y versión móvil.
- [ ] Confirmar que las variables de entorno de producción están configuradas en Netlify.
- [ ] Publicar producción solo tras aprobar la lista anterior y conservar el deploy anterior como rollback.

## Estado de esta entrega

El script estático se ejecutó correctamente con 12 comprobaciones. Se actualizaron las pruebas de AI Lab para reflejar el checkout de Revolut, se añadieron metadatos de portada y sitemap. **No se ejecutaron Vitest, TypeScript, ESLint ni la compilación**, porque no hay `node_modules` y `pnpm` no está instalado en este entorno. Tampoco se hizo un despliegue de preview ni se modificó la web publicada.

## Comandos de validación

Desde la carpeta del proyecto:

```bash
pnpm verify:aureon
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Ejecutar `verify:aureon` no sustituye los tests, el build ni la revisión en navegador.
