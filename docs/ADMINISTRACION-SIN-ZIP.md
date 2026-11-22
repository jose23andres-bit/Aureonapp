# Administración del catálogo sin volver a generar el ZIP

La administración usa Supabase para guardar fichas y Supabase Storage para guardar las fotografías que subas desde el teléfono.

1. Abre `https://aureonaiproject.netlify.app/admin`.
2. Inicia sesión con la cuenta autorizada de Supabase.
3. Pulsa **Añadir ficha** o elige una ficha de la lista.
4. Selecciona la sección: coches, alquiler de coches, villas, oportunidades, relojes/joyas, cursos, ofertas u otra.
5. Para las villas, elige el destino público en el campo correspondiente.
6. Para fotos, selecciona varias imágenes de la galería del móvil (JPG, PNG o WebP, máximo 5 MB por archivo). Puedes quitar una foto con el botón **Quitar**.
7. Para afiliación, pega el enlace de afiliado real de tu cuenta. No basta con pegar la URL normal de la tienda.
8. Guarda como borrador, comprueba la ficha y marca **Publicar en el catálogo público** cuando esté lista.
9. Para retirar una ficha, desmarca publicación o elimínala. La eliminación de una ficha no elimina los productos de la tienda del proveedor.

Los cambios de ficha se guardan en Supabase y no necesitan cambiar el ZIP. El código de la web sí necesita un nuevo despliegue cuando se añaden funciones o se cambia el diseño.
