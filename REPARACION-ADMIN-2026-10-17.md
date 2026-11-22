# Aureon AI Project — reparación del administrador

## Verificado directamente en Supabase
- Proyecto `AUREON AI PROJECT` activo (ACTIVE_HEALTHY).
- `public.content_items`: 35 fichas existentes; 16 coches, 16 alquileres de superdeportivos, 2 inmuebles y 1 oportunidad de inversión. Todas aparecen publicadas.
- `public.admin_allowlist`: la cuenta de administrador sigue autorizada.
- `public.site_settings`: enlaces públicos conservados; Fourvenues apunta a https://www.fourvenues.com/madridvip.
- Buckets de almacenamiento `aureon-media` y `aureon-catalog` presentes.
- Se aplicó la migración `customer_accounts_crm_repair` y se verificó la existencia de `customer_profiles`, `customer_inquiries` y `customer_orders` con RLS habilitado.

## Funciones del panel preservadas en el código fuente
- Acceso privado por Supabase Auth + allowlist.
- Crear/editar fichas, precios, descripciones, disponibilidad, publicación y retirada no destructiva.
- Subida de múltiples fotos desde el móvil y vídeo por vehículo.
- Gestión de promociones y CRM de clientes/solicitudes/pedidos (los pagos externos requieren conciliación manual).

## Limitación importante
Este paquete no se ha podido compilar ni probar en un navegador real desde este entorno; tampoco se pudo acceder por red a Netlify para leer el error de producción ni publicar un deploy. Por tanto, no debe presentarse como una reparación ya desplegada. Despliega este paquete mediante el flujo normal del repositorio/Netlify y comprueba `/admin` después del build; no uses Netlify Drop para sustituir un proyecto TanStack Start sin verificar el artefacto.
