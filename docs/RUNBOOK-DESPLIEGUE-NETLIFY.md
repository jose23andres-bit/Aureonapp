# Runbook de despliegue seguro en Netlify

1. Crear un deploy de preview; no publicar directamente en producción.
2. Confirmar el comando de build `pnpm build` y el directorio `dist/client`.
3. Configurar únicamente en el entorno privado de Netlify las variables necesarias. No pegar secretos en archivos ni en el chat.
4. En el preview probar `/`, todas las categorías, `/ai-lab`, `/recursos`, `/vender-coche`, formularios y `/admin`.
5. Comprobar en consola que no hay errores JavaScript y que no hay peticiones fallidas inesperadas.
6. Probar el catálogo AI Lab: búsqueda, cada filtro, estado sin resultados, copiar comandos y enlace Revolut de 50 €.
7. Confirmar que los formularios y el asistente muestran errores seguros cuando faltan claves o falla el proveedor.
8. Revisar móvil, escritorio, teclado, foco y contraste.
9. Confirmar que el sitemap usa el dominio canónico correcto y que `/admin` y `/api/` no están en el sitemap.
10. Si todo pasa, publicar el deploy. Si falla, mantener la producción anterior y volver a ella; no borrar el deploy estable.

## Variables sensibles mencionadas por el proyecto
- `OPENAI_API_KEY` para el asistente.
- Las variables de correo/WhatsApp solo si se activan esas integraciones.
- Las variables de Stripe existentes solo si se usa ese flujo; el CTA de AI Lab que se muestra actualmente abre el enlace de Revolut y la entrega es manual.

La disponibilidad de variables no garantiza por sí sola que la integración esté correctamente configurada. Validar cada función con pruebas de extremo a extremo.
