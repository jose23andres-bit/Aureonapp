# Ajuste de Fourvenues, Instagram y revisión de administración

- El CTA de Joy Eslava/Madrid VIP usa el enlace personal de Fourvenues: https://www.fourvenues.com/madridvip
- Se eliminó el enlace oficial de Teatro Eslava como destino de ese CTA.
- Se añadió el enlace al perfil de Instagram: https://www.instagram.com/joseandresxxiii/
- El proyecto Supabase `picvzxqkacgiyqflhpys` está ACTIVE_HEALTHY.
- La lista `public.admin_allowlist` contiene el correo administrador configurado y `public.content_items` contiene fichas de coches, superdeportivos, villas y oportunidades.
- Existen los buckets `aureon-media` y `aureon-catalog` y las migraciones base de administración/catálogo están aplicadas.
- La migración `20261017100000_customer_accounts_crm.sql` existe en el proyecto fuente. No se pudo confirmar que esté aplicada en producción durante esta revisión; el CRM de clientes depende de que esas tablas estén creadas.
- Se ejecutó `node scripts/verify-aureon.mjs`: 35 comprobaciones estáticas superadas.
- No se completó `pnpm build` ni una prueba real de inicio de sesión, alta/edición/retirada de fichas o subida de imágenes desde navegador; no afirmar que esas pruebas estén certificadas.
