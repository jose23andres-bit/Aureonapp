import { createFileRoute } from '@tanstack/react-router'
import { Aureon } from '../components/aureon'
import { categories, vipCategory } from '../lib/content'
export const Route = createFileRoute('/$')({
 component:Aureon,
 head:({params})=>{
  const slug=params._splat?.split('/')[0]
  const title=[...categories,vipCategory].find(c=>c.slug===slug)?.title||({'recursos':'Recursos, IA y monetización','servidores-mcp':'Servidores MCP','sobre-aureon':'El proyecto · José Andrés Gómez','vender-coche':'Vende tu coche','admin':'Administración privada','ai-lab':'Aureon AI Lab · Habilidades y herramientas de IA','broly':'BROLY · Asistente personal privado','comprobar-coche':'Comprobar coche por bastidor (VIN) gratis','contrato':'Contrato · completar y firmar','privacidad':'Política de privacidad','cookies':'Política de cookies','aviso-legal':'Aviso legal'} as Record<string,string>)[slug||'']||'Colección'
  return {meta:[{title:`${title} | AUREON AI PROJECT`},...(slug==='ai-lab'?[{name:'description',content:'Explora habilidades de IA, recursos para agentes de programación y herramientas seleccionadas por Aureon AI Project.'}]:[]),...(slug==='comprobar-coche'?[{name:'description',content:'Comprueba gratis cualquier coche por su número de bastidor (VIN): ficha de fábrica, llamadas a revisión y acceso al historial completo.'},{property:'og:title',content:'Comprueba un coche antes de comprarlo · AUREON Vehicle Check'},{property:'og:description',content:'Introduce el bastidor (VIN) y obtén gratis su ficha de fábrica y las llamadas a revisión.'}]:[]),...(slug==='admin'||slug==='broly'||slug==='contrato'?[{name:'robots',content:'noindex, nofollow'}]:[])]}
 }
})
