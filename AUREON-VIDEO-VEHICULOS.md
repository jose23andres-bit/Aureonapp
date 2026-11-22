# Vídeos por vehículo — Aureon AI Project

## Qué se ha añadido
- El editor de fichas del administrador incluye un campo «URL del vídeo de YouTube» para las secciones de coches de lujo en venta y alquiler de coches/superdeportivos.
- El editor valida que la URL sea de YouTube (URL estándar, youtu.be, embed o Shorts) y guarda la dirección en `features.videoUrl` de la ficha en Supabase.
- El enlace «Buscar vídeos de este modelo en YouTube» abre una búsqueda basada en marca, modelo y título para que el administrador pueda seleccionar material apropiado.
- La ficha pública presenta un reproductor adaptable que carga el vídeo de forma diferida. Las fichas sin vídeo siguen funcionando como antes.
- El vídeo no se copia ni se descarga; se inserta desde YouTube y se muestra una nota que recuerda comprobar la correspondencia exacta del modelo.
- Al editar/guardar, el vídeo se conserva como dato separado y no aparece como una característica técnica en la ficha.

## Cómo activarlo
1. Inicia sesión en `/admin` con una cuenta administradora autorizada.
2. Selecciona una ficha de «Coches en venta» o «Alquiler de coches».
3. Usa el enlace de búsqueda para comparar vídeos y abre el que corresponda a la versión adecuada.
4. Pega su URL en «URL del vídeo de YouTube» y pulsa «Guardar ficha».
5. Abre la ficha pública para comprobar el reproductor.

## Limitación de esta entrega
No se han asignado automáticamente vídeos a todas las fichas existentes: para evitar asociaciones incorrectas o vídeos que no correspondan al vehículo anunciado, la selección se realiza por ficha. La búsqueda está preparada en el administrador. Este cambio de código no actualiza el sitio ya publicado en Netlify por sí solo.
