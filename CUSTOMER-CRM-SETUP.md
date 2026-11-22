# Área de clientes desactivada en la versión de administración exclusiva

La versión de AUREON incluida en el paquete de reparación ya no expone el registro, el inicio de sesión ni el panel de clientes. La única cuenta de acceso al panel de control es la cuenta administradora autorizada en Supabase (`admin_allowlist`).

Por seguridad y para preservar cualquier dato existente, esta reparación **no elimina** las tablas históricas `customer_profiles`, `customer_inquiries` y `customer_orders` ni borra perfiles de Supabase Auth. Esas tablas no se consultan desde la interfaz pública ni desde el panel de administración de esta versión.

Los archivos de migración históricos se conservan en el repositorio como referencia de lo que se aplicó anteriormente. No hace falta volver a ejecutar esas migraciones para desplegar la reparación.
