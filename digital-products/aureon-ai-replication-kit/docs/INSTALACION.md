# Integración

1. Copia `src/components/ai-lab.tsx` en el directorio de componentes de tu proyecto React.
2. Copia `src/ai-lab.css` en el proyecto y adapta los tokens globales: `--line`, `--gold`, `--muted`; el componente también usa clases base `.section`, `.inner`, `.button`, `.gold`, `.outline` y `.eyebrow`.
3. Instala `lucide-react` si aún no está disponible: `npm install lucide-react`.
4. Registra una ruta `/ai-lab` que renderice `<AILab />` según el enrutador de tu aplicación.
5. Revisa todos los enlaces y comandos antes de publicar. Las habilidades se instalan en el entorno del desarrollador, no en el navegador del visitante.
6. Ejecuta el typecheck, lint, pruebas y build propios del proyecto antes de desplegar.

## Personalización
- Cambia nombre, copy, colores y catálogo para tu negocio.
- Mantén atribución y licencias de cada recurso de terceros.
- No pongas secretos/API keys en el frontend.
- Si añades pagos y descargas privadas, verifica el pago en servidor (webhook/API); nunca desbloquees un producto por una simple URL de retorno.
