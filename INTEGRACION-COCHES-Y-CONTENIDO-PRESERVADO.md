AUREON AI PROJECT — ZIP INTEGRADO

Base: versión completa con cursos y mentorías. Se han conservado los recursos, apartados, enlaces y catálogos existentes y se han incorporado los recursos de los vehículos enviados.

Vehículos añadidos al catálogo de venta con fallback local (no dependen exclusivamente de que Supabase/Netlify devuelva filas):
- BMW M3 Competition Touring Restyling — 95.000 €
- BMW 320d E46 Coupé Pack M3 — 6.500 €
- Mercedes-Benz Clase G G 500 STW Largo V8 — 49.500 € negociables
- McLaren 650S Spider — 132.000 €

Las fichas usan las imágenes locales incluidas en public/img/coches-venta. Los datos y precios proceden de los anuncios/imágenes facilitados y deben confirmarse antes de publicarse como oferta definitiva. La disponibilidad está marcada para confirmar.

La actualización del código fuente no publica automáticamente el sitio en Netlify ni modifica por sí sola Supabase. Para que el catálogo online cambie, hay que desplegar esta versión; los datos que ya existan en API/Supabase tienen prioridad sobre las fichas de respaldo con el mismo slug.
