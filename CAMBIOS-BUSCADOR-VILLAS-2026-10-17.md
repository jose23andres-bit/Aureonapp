# Buscador funcional en el póster de alquiler de villas

- El campo de búsqueda superior del póster ahora es un formulario real.
- Al introducir una ubicación o modelo y pulsar la flecha, se filtra el catálogo usando el parámetro `q`.
- Se elimina el segundo campo duplicado “Modelo o ubicación” del bloque de filtros inferior solo en `alquiler-villas`.
- Se conserva el resto de filtros existentes y no se modifican rutas de CRM ni configuración de Supabase.

Validación realizada: archivo TSX y CSS modificados y empaquetados. La compilación de producción debe probarse en el entorno Netlify del proyecto antes de publicar.
