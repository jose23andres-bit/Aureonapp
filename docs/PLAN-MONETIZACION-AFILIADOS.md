# Plan de monetización por afiliación — AUREON AI PROJECT

## Objetivo

Construir una cartera de productos que el visitante pueda comprar directamente al proveedor, con atribución de afiliado válida para que AUREON reciba comisión. AUREON no debe cobrar ni almacenar productos de terceros ni gestionar envíos, devoluciones o garantías del vendedor.

**Regla de publicación:** no subir un producto hasta disponer de un enlace de afiliado propio aprobado, condiciones de comisión verificadas y permiso/feed/API para usar su imagen, precio y descripción. Una URL normal a una tienda no genera comisión por sí sola.

## Prioridad 1: relojes, joyas y accesorios

1. **Amazon Afiliados España** — buen punto de partida por la familiaridad del comprador y un catálogo amplio. La tabla pública consultada indica 6 % para relojes y 5 % para joyería en Amazon.es; las tarifas pueden cambiar y deben revisarse en el panel y en las condiciones actuales. Registro: https://afiliados.amazon.es/
2. **Awin** — red de afiliación con más de 30.000 marcas anunciantes. Permite buscar anunciantes de joyería, moda, relojes y accesorios, generar enlaces de tracking y, cuando el anunciante lo habilita, usar feeds de productos. No todos los programas aceptan todos los sitios ni todas las categorías tienen la misma comisión. Registro: https://www.awin.com/es/pricing/affiliate-partners
3. **AliExpress Portals** — opción natural para productos de precio asequible de fabricantes y vendedores chinos. Solicitar acceso al programa oficial, generar enlaces rastreables por producto y revisar la comisión, países admitidos, devoluciones y restricciones por anunciante. No publicar imitaciones como si fueran Rolex, Cartier, Patek Philippe u otras marcas auténticas. Portal: https://portals.aliexpress.com/
4. **CJ Affiliate** — alternativa para localizar marcas internacionales de relojes, accesorios y joyería. Hay que solicitar cada programa y comprobar si acepta tráfico desde España y si el producto se envía a España. Plataforma: https://www.cj.com/

### Estrategia de catálogo

- Separar **joyería de moda**, **plata/acero**, **relojes asequibles**, **regalos**, **piezas premium verificadas** y **accesorios**.
- Empezar con 15–30 productos con buenas fotos autorizadas, precio competitivo, envío claro y devoluciones razonables, no con cientos de fichas sin verificar.
- Dar prioridad a productos con enlace profundo al producto, stock/precio actualizable y comisión conocida.
- En productos de lujo, exigir evidencia de autenticidad y procedencia; no usar imágenes de marca como si el producto estuviera verificado si no lo está.
- Si la red ofrece feed/API autorizado, automatizar sincronización de precio, stock y enlace. Si no, revisar manualmente el catálogo para evitar productos agotados o enlaces rotos.

## Prioridad 2: cursos y mentorías

**Hotmart** es el punto de partida más práctico: permite solicitar afiliación a productos digitales de otros creadores, y el proveedor gestiona pago y entrega. La plataforma anuncia comisiones de hasta el 80 % en algunos productos, pero el porcentaje lo fija cada productor; no debe asumirse que todos pagan esa comisión. Marketplace y registro: https://hotmart.com/es/afiliados

### Temas que merece la pena probar

1. Inteligencia artificial aplicada, automatización y productividad.
2. Marketing digital, SEO, creación de contenido y ventas.
3. Comercio electrónico, afiliación y creación de negocios digitales.
4. Finanzas personales y educación financiera no especulativa.
5. Desarrollo personal y habilidades profesionales.
6. Belleza, estética y formación profesional, si la oferta es seria y está bien acreditada.

Son **hipótesis de demanda para probar**, no una clasificación independiente de los cursos más vendidos. Antes de promocionar una oferta, revisar dentro de Hotmart: temperatura/indicadores de ventas disponibles, página de ventas, comisión neta, idioma, soporte, tasa de reembolso si está disponible, reputación del productor, política de afiliación y material creativo.

### Filtro de selección de cada curso

- Encaje con la audiencia de Aureon: IA, negocio, ventas y monetización.
- Página de venta clara, sin promesas de ingresos garantizados.
- Contenido, profesor, temario, precio, soporte y reembolsos transparentes.
- Comisión real y condiciones de atribución visibles en el panel.
- Enlace de afiliado aprobado y probado en incógnito.
- Preferencia por cursos que resuelvan una necesidad concreta y permitan al usuario entender qué compra.

Los enlaces Hotmart ya incluidos en el proyecto (`hotmart-librito` y `hotmart-transformacion`) se muestran en Cursos y mentorías como primeras ofertas de afiliación. Revisa desde tu cuenta que siguen activos, que son tus enlaces de afiliado y que la comisión está habilitada.

## Cómo dejar la venta automatizada

1. El usuario pulsa **Ver en la tienda** y sale a la web del proveedor con el enlace rastreable.
2. El proveedor procesa pago, acceso/entrega, envío, devoluciones y atención al comprador.
3. El programa registra la venta atribuida, aplica su periodo de atribución y descuenta cancelaciones/devoluciones según sus condiciones.
4. AUREON revisa el panel del programa y los pagos/comisiones. El enlace no garantiza que todas las compras se atribuyan si el usuario cambia de dispositivo, cookies, navegador o entra por otro afiliado.

## Transparencia y cumplimiento

- Mostrar una nota clara junto a los enlaces: “Enlace de afiliación: AUREON puede recibir una comisión si compras desde este enlace, sin coste adicional necesariamente para ti”.
- No copiar catálogos completos, fotos, marcas, textos o precios de una tienda sin permiso, feed o licencia que lo permita.
- Mantener datos de contacto y aviso legal del responsable completos antes de escalar publicidad.
- Revisar RGPD/cookies si se incorporan analítica, píxeles o herramientas de atribución propias.
- No comprar tráfico de marca ni usar cupones, logos o palabras clave prohibidos por los términos de cada anunciante.

## Fases

### Fase A — lista inicial
- [ ] Alta en Amazon Afiliados España.
- [ ] Alta en Awin y solicitud de anunciantes adecuados para relojes/joyas.
- [ ] Alta en AliExpress Portals y verificación de condiciones para España.
- [ ] Revisión de los dos enlaces Hotmart existentes y selección de 3–5 cursos por métricas.

### Fase B — publicación
- [ ] Cargar en `/admin` título, descripción, precio informativo, imágenes autorizadas y enlace de afiliado.
- [ ] Seleccionar `Relojes y joyas (afiliación)` o `Cursos y mentorías (afiliación)`.
- [ ] Dejar la ficha en borrador hasta validar el enlace, y después marcarla publicada.
- [ ] Probar el enlace en móvil y verificar el seguimiento desde el panel de la red.

### Fase C — optimización mensual
- [ ] Retirar enlaces rotos y productos sin stock.
- [ ] Comparar clics, ventas, comisión por clic y devoluciones.
- [ ] Reemplazar productos con muchos clics y pocas ventas.
- [ ] Priorizar páginas útiles con comparativas originales, guías de compra y preguntas frecuentes, no páginas copiadas del proveedor.

## Fuentes oficiales consultadas

- Hotmart Afiliados: https://hotmart.com/es/afiliados
- Amazon Afiliados España: https://afiliados.amazon.es/
- Tabla de comisiones Amazon España: https://afiliados.amazon.es/help/node/topic/GRXPHT8U84RAYDXZ
- Awin afiliados: https://www.awin.com/es/pricing/affiliate-partners
- AliExpress Affiliate Program: https://portals.aliexpress.com/
- CJ Affiliate: https://www.cj.com/
