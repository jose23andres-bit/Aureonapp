# Aureon Crypto Intelligence — integración incluida

Se ha añadido un buscador de criptoactivos dentro de AI Lab y una ruta de servidor `/api/crypto` para consultar fuentes de mercado sin exponer claves privadas al navegador.

## Qué incluye
- Búsqueda por nombre o ticker, selección del activo exacto y ficha de mercado.
- Precio, capitalización, volumen, variación 24 h/7 días, máximo histórico, oferta y descripción cuando la fuente devuelve esos campos.
- Consulta de contratos mediante búsqueda DEX de CoinMarketCap cuando esa ruta pública devuelve resultados.
- Selector USD/EUR.
- Botón «Explicar con Aureon AI», que envía los datos de la ficha al endpoint de IA existente y usa un perfil educativo especializado en criptoactivos.
- Mensajes claros cuando la fuente no devuelve datos; no se fabrican precios ni estadísticas.

## Variables de entorno de Netlify
- `OPENAI_API_KEY`: necesaria para que el botón de análisis de IA responda; se usa la misma configuración del asistente existente.
- `COINGECKO_API_KEY`: opcional pero recomendable para una integración más fiable y mejores límites. Guardarla únicamente como variable de entorno de Netlify, nunca en el frontend ni en Git.
- `OPENAI_MODEL`: opcional; si no se define, se conserva el modelo configurado por el endpoint existente.

CoinMarketCap tiene rutas públicas sin clave para determinados datos y búsquedas DEX, pero no cubren todo el catálogo ni garantizan disponibilidad. La cobertura depende de la fuente, su plan, sus límites y de si el activo está indexado. Para datos profesionales o uso comercial sostenido, revisar los términos y límites de las APIs oficiales.

## Límites y seguridad
- No es un terminal de trading ni una conexión a una cartera.
- Una coincidencia por símbolo no demuestra que sea el token correcto: comprobar nombre, red y contrato.
- No se promete que todos los tokens, especialmente los recién creados o de baja liquidez, aparezcan.
- Los datos pueden retrasarse o estar ausentes. El producto no da recomendaciones personalizadas de compra/venta.
- La función se incorpora al código del ZIP, pero no queda desplegada automáticamente en Netlify. Después de publicar, probar búsquedas y configurar las variables de entorno.
