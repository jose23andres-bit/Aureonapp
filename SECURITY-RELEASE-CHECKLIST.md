# Lista de publicación segura — Aureon AI Project

## Antes de publicar
- [ ] Ejecutar con Node compatible: `pnpm install --frozen-lockfile`
- [ ] `pnpm build`
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [x] `node scripts/verify-aureon.mjs` (23 comprobaciones estáticas en esta revisión)
- [ ] Configurar en Netlify solo como variables de entorno privadas las claves de IA, correo, pagos y proveedor cripto. No usar prefijo `VITE_` en secretos.
- [ ] Configurar MFA para el administrador y verificar la lista de autorización.
- [ ] En Supabase, probar RLS con sesión anónima, usuario no administrador y administrador. Confirmar que el público solo puede leer fichas publicadas.
- [ ] Revisar permisos del bucket `aureon-catalog` y comprobar que las cargas solo las realiza el administrador.
- [ ] Probar en deploy preview: login/logout, sesión caducada, acceso directo a `/admin`, CRUD, cargas de imágenes, consultas de IA/cripto y errores 429.
- [ ] Revisar las cabeceras HTTP y los informes de CSP Report-Only; solo después valorar una CSP aplicada.
- [ ] Probar recuperación de copias de seguridad.
- [ ] Hacer análisis de dependencias y una prueba de penetración autorizada antes de escalar.

## Productos de pago
- [x] El PDF Crypto & Trading no está en `public/` y no se enlaza como descarga directa.
- [ ] El proceso de 50 € y el de 499 € siguen siendo de entrega manual: verificar pago, identidad/contacto de entrega y registro de pedido antes de enviar.
- [ ] No anunciar descarga automática, DRM, imposibilidad de copia o seguridad certificada. La web pública puede ser capturada y los enlaces de pago externos no confirman automáticamente el pago en Aureon.

## Estado conocido de esta entrega
El ZIP se valida como archivo y el verificador estático pasa 23 comprobaciones. No se pudo descargar pnpm desde el registro de paquetes por falta de conectividad del entorno; build, typecheck, lint, Vitest, pruebas HTTP en producción y despliegue no están verificados.
