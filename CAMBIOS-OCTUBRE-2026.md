# Cambios integrados — AUREON AI PROJECT

## Portada y oportunidades
- Se incorpora una página `/oportunidades` y un enlace en la navegación principal y el pie de página.
- La oportunidad de Dolores, Alicante (36 m²; 60.000 € sin reformar) aparece en portada, en Oportunidades y en la categoría de villas en venta.
- Los 75.000 € reformado y 700 €/mes se mantienen como cifras orientativas que requieren verificación.

## Revolut
- La portada incluye los enlaces de referido personales y de empresa en dos botones separados.
- El vídeo explicativo queda inmediatamente debajo.
- Se conservan la sección de ofertas y los enlaces existentes.

## Catálogos editables
- Los 16 vehículos de venta se migran a fichas persistentes, con imágenes del catálogo existente, características y precio mostrado.
- Los 16 modelos que aparecen en el buscador público de Beyond Cars se incorporan al alquiler de vehículos. Las tarifas se etiquetan como referencias externas, no como tarifas propias confirmadas de AUREON. Las imágenes de alquiler son ilustrativas y deben sustituirse por fotografías autorizadas antes de presentar cada vehículo como disponible.
- La villa de La Moraleja y la villa de Estremera se convierten en fichas gestionables desde el administrador, conservando sus fotografías locales.
- La administración incorpora campos sencillos para título, URL, categoría, estado, descripción, marca, modelo, ubicación, precio, tarifa de referencia, imágenes, características y notas. El JSON avanzado queda plegado.
- Se conserva la base de datos de Netlify y la autenticación Netlify Identity.
- El backend exige el rol `admin` y el correo autorizado `joseandresautomatiza@gmail.com`.

## Validación
- Comprobación sintáctica de TypeScript/TSX: sin errores de análisis.
- No se pudo ejecutar `pnpm install`, compilación ni pruebas completas en esta sesión: no hay `node_modules` y el registro de paquetes no estaba accesible.
- El ZIP contiene una nueva migración de Netlify Database; debe ejecutarse mediante el pipeline de Netlify al desplegar.
- Los cambios no están publicados en Netlify desde esta sesión.
