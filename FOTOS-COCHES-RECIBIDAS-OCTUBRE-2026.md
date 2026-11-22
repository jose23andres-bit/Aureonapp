# Fotografías de vehículos aportadas para el catálogo Aureon

Se han incorporado fotografías recortadas y optimizadas en `public/img/coches-venta/` y preparado una migración SQL para actualizar el catálogo de venta.

- BMW M3 Competition Touring Restyling: 95.000 €, año 2025, 30.000 km, 530 CV.
- BMW 320d E46 Coupé Pack M3: 6.500 €, año 2004, 390.000 km, 150 CV.
- Mercedes-Benz Clase G 500 STW Largo: 49.500 € negociables, año 2010, 247.754 km.
- McLaren 650S Spider: 132.000 €, año 2014, 99.900 km, 650 CV.

**Importante:** los datos proceden de los anuncios aportados y deben verificarse antes de publicar como oferta vigente. Para el McLaren solo se recibió el cartel promocional, no fotografías originales independientes.

La migración SQL está en `netlify/database/migrations/20261016140000_actualizar_catalogo_coches_fotos/migration.sql`. El ZIP fuente no se ha desplegado automáticamente y la migración debe aplicarse en la base de datos correspondiente para que el catálogo público refleje los cambios.
