import { useMemo, useState, useEffect, type FormEvent } from 'react'
import { ArrowUpRight, Bot, Check, Copy, ExternalLink, Gauge, Layers3, Palette, Search, ShieldCheck, Smartphone, Wrench, CreditCard, Workflow, FileText, PackageCheck, Download, Sparkles, MessageCircle } from 'lucide-react'

type Skill = {
  name: string
  title: string
  category: 'Desarrollo' | 'Diseño' | 'Vercel' | 'Recursos'
  description: string
  benefit: string
  source: string
  command?: string
  badge: string
}

const skills: Skill[] = [
  {
    name: 'vercel-react-best-practices',
    title: 'React Best Practices',
    category: 'Desarrollo',
    description: 'Reglas de ingeniería para mejorar el rendimiento de React y Next.js: carga de datos, tamaño del bundle, renderizado y patrones de implementación.',
    benefit: 'Ideal para revisar y optimizar componentes y rutas de Aureon.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices',
    command: 'npx skills add vercel-labs/agent-skills@react-best-practices -g',
    badge: 'Recomendada para Aureon',
  },
  {
    name: 'web-design-guidelines',
    title: 'Web Design Guidelines',
    category: 'Diseño',
    description: 'Auditoría de interfaz centrada en accesibilidad, formularios, navegación, estados de foco, imágenes, rendimiento y experiencia de usuario.',
    benefit: 'Útil para revisar la web en móvil y detectar fricciones antes de publicar.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines',
    command: 'npx skills add vercel-labs/agent-skills@web-design-guidelines -g',
    badge: 'Recomendada para Aureon',
  },
  {
    name: 'vercel-composition-patterns',
    title: 'Composition Patterns',
    category: 'Desarrollo',
    description: 'Patrones para construir componentes React reutilizables, organizar el estado y evitar componentes con demasiadas propiedades condicionales.',
    benefit: 'Ayuda a mantener el catálogo, los formularios y el panel de administración más fáciles de evolucionar.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns',
    command: 'npx skills add vercel-labs/agent-skills@composition-patterns -g',
    badge: 'Arquitectura',
  },
  {
    name: 'vercel-optimize',
    title: 'Vercel Optimize',
    category: 'Vercel',
    description: 'Analiza un proyecto desplegado en Vercel para investigar rendimiento, fiabilidad, caché, funciones y posibles oportunidades de coste.',
    benefit: 'Interesante si más adelante mueves un proyecto de Aureon a Vercel; no sustituye el diagnóstico de Netlify.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/vercel-optimize',
    command: 'npx skills add vercel-labs/agent-skills@vercel-optimize -g',
    badge: 'Para proyectos en Vercel',
  },
  {
    name: 'vercel-react-native-skills',
    title: 'React Native Skills',
    category: 'Desarrollo',
    description: 'Orientaciones para crear aplicaciones móviles con React Native y Expo, con atención a patrones de implementación y rendimiento.',
    benefit: 'Para una futura aplicación móvil de Aureon, no para la web actual directamente.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills',
    command: 'npx skills add vercel-labs/agent-skills@react-native-skills -g',
    badge: 'Futuro móvil',
  },
  {
    name: 'writing-guidelines',
    title: 'Writing Guidelines',
    category: 'Recursos',
    description: 'Pautas para revisar documentación y textos: estructura, tono, claridad, títulos, ejemplos y consistencia editorial.',
    benefit: 'Puede ayudar a mantener descripciones comerciales y recursos de Aureon claros y coherentes.',
    source: 'https://github.com/vercel-labs/agent-skills/tree/main/skills/writing-guidelines',
    command: 'npx skills add vercel-labs/agent-skills@writing-guidelines -g',
    badge: 'Contenido',
  },
  {
    name: 'find-skills',
    title: 'Find Skills · incluido en tu ZIP',
    category: 'Recursos',
    description: 'La habilidad de tu archivo adjunto que ayuda a descubrir skills instalables para un agente de programación.',
    benefit: 'Es la parte del ZIP más útil para localizar nuevas capacidades cuando surja una necesidad concreta.',
    source: 'https://github.com/vercel-labs/skills/tree/main/skills/find-skills',
    badge: 'De tu archivo',
  },
  {
    name: 'pr-labeling',
    title: 'PR Labeling · workflow del ZIP',
    category: 'Recursos',
    description: 'Workflow para clasificar cambios en pull requests del repositorio de Skills. No es una herramienta de instalación general para visitantes.',
    benefit: 'Solo tiene sentido si mantienes un repositorio de código y configuras el workflow compatible.',
    source: 'https://github.com/vercel-labs/skills',
    badge: 'Workflow relacionado',
  },
  {
    name: 'triage',
    title: 'Triage · workflow del ZIP',
    category: 'Recursos',
    description: 'Workflow especializado en evaluar propuestas de corrección de errores del CLI de Skills con evidencias y comprobaciones.',
    benefit: 'Es específico del flujo de mantenimiento de software; no hace diagnósticos automáticos dentro de la web pública.',
    source: 'https://github.com/vercel-labs/skills',
    badge: 'Workflow relacionado',
  },
]

const categories = ['Todas', 'Desarrollo', 'Diseño', 'Vercel', 'Recursos'] as const

const REVOLUT_KIT_URL = 'https://checkout.revolut.com/pay/05b79b03-6b72-4137-a578-690049bfeaee'
const REVOLUT_FULL_ZIP_URL = 'https://checkout.revolut.com/pay/a2b9fc8c-5bdd-4f0e-b257-190fc0180b66'
const AUREON_SUPPORT_URL = 'https://wa.me/message/HZA7ZUG4DJ7ZK1'

// Envía eventos solo a un sistema de analítica ya configurado; no inventa ventas ni guarda datos personales.
function trackAureonEvent(eventName: string, product: string) {
  const detail = { event: eventName, product, page: window.location.pathname }
  window.dispatchEvent(new CustomEvent('aureon:analytics', { detail }))
  const w = window as Window & { dataLayer?: Array<Record<string, unknown>>; gtag?: (...args: unknown[]) => void }
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event: eventName, product_name: product })
  if (typeof w.gtag === 'function') w.gtag('event', eventName, { item_name: product })
}

function WebKitsCheckout() {
  return <div className="ailab-checkout">
    <a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "Aureon Web Kits 50 EUR")}>
      <CreditCard size={15}/> Comprar el kit completo · 50 € <ExternalLink size={14}/>
    </a>
    <p className="ailab-delivery-note">Pago seguro en Revolut. La entrega del paquete digital se realiza manualmente después de verificar el pago. Conserva el justificante y contacta con Aureon para recibirlo.</p>
    <a className="ailab-support-link" href={AUREON_SUPPORT_URL} target="_blank" rel="noopener noreferrer">Contactar con Aureon para la entrega <ArrowUpRight size={13}/></a>
  </div>
}

type CryptoResult = {id:string;name:string;symbol:string;image?:string;rank?:number|null;provider?:string;price?:number|null;marketCap?:number|null;change24h?:number|null;change7d?:number|null;change30d?:number|null;volume24h?:number|null;description?:string;website?:string;contract?:string;ath?:number|null;atl?:number|null;circulatingSupply?:number|null;totalSupply?:number|null;maxSupply?:number|null;updatedAt?:string;marketUrl?:string}
function cryptoMoney(value:number|null|undefined,currency:string){if(value==null||!Number.isFinite(Number(value)))return 'No disponible';return new Intl.NumberFormat('es-ES',{style:'currency',currency:currency.toUpperCase(),maximumSignificantDigits:7}).format(Number(value))}
function CryptoIntelligence(){
 const [query,setQuery]=useState('');const [currency,setCurrency]=useState<'usd'|'eur'>('usd');const [results,setResults]=useState<CryptoResult[]>([]);const [asset,setAsset]=useState<CryptoResult|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [aiBusy,setAiBusy]=useState(false);const [aiReply,setAiReply]=useState('')
 async function search(e?:FormEvent){e?.preventDefault();if(!query.trim()||busy)return;setBusy(true);setError('');setAiReply('');setAsset(null);setResults([]);try{const r=await fetch(`/api/crypto?query=${encodeURIComponent(query.trim())}&currency=${currency}`);const d=await r.json();if(!r.ok)throw Error(d.error||'No se ha podido consultar el activo.');if(d.asset){setAsset(d.asset);setResults([])}else{setResults(d.results||[]);if(!d.results?.length)throw Error('No se encontraron activos. Prueba otro nombre o símbolo.')}}catch(err){setError(err instanceof Error?err.message:'Error consultando el mercado.')}finally{setBusy(false)}}
 async function selectAsset(item:CryptoResult){if(!item.id||item.provider==='CoinMarketCap DEX'||item.provider==='CoinMarketCap'){setAsset(item);setResults([]);return}setBusy(true);setError('');try{const r=await fetch(`/api/crypto?id=${encodeURIComponent(item.id)}&currency=${currency}`);const d=await r.json();if(!r.ok)throw Error(d.error||'No se ha podido abrir la ficha.');setAsset(d.asset);setResults([])}catch(err){setError(err instanceof Error?err.message:'Error consultando el activo.')}finally{setBusy(false)}}
 async function askAI(){if(!asset||aiBusy)return;setAiBusy(true);setAiReply('');try{const facts=`Ficha consultada en ${asset.provider||'fuente de mercado'}: ${asset.name} (${asset.symbol}). Precio ${cryptoMoney(asset.price,currency)}; capitalización ${cryptoMoney(asset.marketCap,currency)}; volumen 24h ${cryptoMoney(asset.volume24h,currency)}; cambio 24h ${asset.change24h??'no disponible'}%; cambio 7d ${asset.change7d??'no disponible'}%; ranking ${asset.rank??'no disponible'}; oferta circulante ${asset.circulatingSupply??'no disponible'}; descripción ${asset.description||'no disponible'}. Última actualización declarada por la fuente: ${asset.updatedAt||'no disponible'}. Trata estos datos como una instantánea y no como garantía de cotización actual.`;const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({page:'/crypto',messages:[{role:'user',content:`Analiza educativamente este activo usando únicamente los datos adjuntos. Explica qué indican, qué falta por investigar, riesgos y preguntas de diligencia debida. No me digas simplemente comprar o vender.\n\n${facts}`} ]})});const d=await r.json();if(!r.ok)throw Error(d.error||'El asistente no está disponible.');setAiReply(d.reply||'No se ha recibido análisis.')}catch(err){setAiReply(err instanceof Error?err.message:'No se pudo contactar con el asistente.')}finally{setAiBusy(false)}}
 return <section className="crypto-intel" id="crypto-intelligence"><div className="crypto-intel-heading"><div><span className="eyebrow">AUREON · CRYPTO INTELLIGENCE</span><h2>Investiga el mercado <em>con criterio.</em></h2><p>Busca monedas y tokens, revisa métricas de mercado y pide a la IA una explicación educativa de la ficha consultada.</p></div><div className="crypto-mark">₿<span>LIVE DATA</span></div></div><form className="crypto-search" onSubmit={search}><label className="crypto-query"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Bitcoin, Ethereum, SOL, nombre del token…" aria-label="Buscar criptoactivo"/></label><select value={currency} onChange={e=>setCurrency(e.target.value as 'usd'|'eur')} aria-label="Moneda de cotización"><option value="usd">USD $</option><option value="eur">EUR €</option></select><button className="button gold" disabled={busy||!query.trim()}>{busy?'Consultando…':'Buscar activo'} <ArrowUpRight size={15}/></button></form><div className="crypto-source-note"><ShieldCheck size={15}/> Fuente consultada por servidor · CoinGecko cuando está disponible, con alternativa de precio CoinMarketCap. Las claves privadas nunca deben ponerse en el navegador.</div>{error&&<p className="crypto-error" role="alert">{error}</p>}{results.length>0&&<div className="crypto-results"><p>Selecciona el activo correcto. Los tickers pueden repetirse.</p>{results.map((item,i)=><button key={`${item.id}-${i}`} onClick={()=>void selectAsset(item)} className="crypto-result">{item.image&&<img src={item.image} alt=""/>}<span><strong>{item.name}</strong><small>{item.symbol} · {item.provider||'CoinGecko'}{item.rank?` · Ranking #${item.rank}`:''}</small></span><ArrowUpRight size={16}/></button>)}</div>}{asset&&<article className="crypto-asset-card"><div className="crypto-asset-title">{asset.image&&<img src={asset.image} alt=""/>}<div><span className="eyebrow">FICHA DEL ACTIVO · {asset.provider||'MERCADO'}</span><h3>{asset.name} <small>{asset.symbol}</small></h3><p>{asset.rank?`Ranking por capitalización #${asset.rank}`:'Activo identificado; datos disponibles según fuente'}</p></div></div><div className="crypto-metrics">{[['Precio',cryptoMoney(asset.price,currency)],['Capitalización',cryptoMoney(asset.marketCap,currency)],['Volumen 24 h',cryptoMoney(asset.volume24h,currency)],['Cambio 24 h',asset.change24h==null?'No disponible':`${asset.change24h.toFixed(2)}%`],['Cambio 7 días',asset.change7d==null?'No disponible':`${asset.change7d.toFixed(2)}%`],['Máximo histórico',cryptoMoney(asset.ath,currency)]].map(([label,value])=><div key={label}><span>{label}</span><strong className={label.startsWith('Cambio')&&String(value).startsWith('-')?'negative':label.startsWith('Cambio')&&value!=='No disponible'?'positive':''}>{value}</strong></div>)}</div>{asset.description&&<p className="crypto-description">{asset.description}</p>}<div className="crypto-asset-foot"><span>Oferta circulante: {asset.circulatingSupply?.toLocaleString('es-ES')||'N/D'} · Total: {asset.totalSupply?.toLocaleString('es-ES')||'N/D'} · Máxima: {asset.maxSupply?.toLocaleString('es-ES')||'N/D'}</span>{asset.marketUrl&&<a href={asset.marketUrl} target="_blank" rel="noopener noreferrer">Abrir ficha original <ExternalLink size={13}/></a>}{asset.website&&<a href={asset.website} target="_blank" rel="noopener noreferrer">Web oficial <ArrowUpRight size={13}/></a>}</div><div className="crypto-actions"><button className="button gold" onClick={()=>void askAI()} disabled={aiBusy}>{aiBusy?'Analizando…':'Explicar con Aureon AI'} <Bot size={16}/></button><span>Datos orientativos; comprueba la hora de actualización antes de decidir.</span></div>{aiReply&&<div className="crypto-ai-answer"><span className="eyebrow">AUREON AI · ANÁLISIS EDUCATIVO</span><p>{aiReply}</p></div>}</article>}<div className="crypto-disclaimer">La cobertura no es universal: un token nuevo, una dirección de contrato o un activo de una red concreta puede no estar indexado. Para verificar contratos, liquidez, holders y seguridad on-chain, confirma siempre la red y usa un explorador oficial. Esto no es asesoramiento financiero.</div></section>
}

export function AILab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('Todas')
  const [copied, setCopied] = useState('')
  useEffect(() => { trackAureonEvent('view_item_list', 'Aureon AI Lab digital products') }, [])
  const filtered = useMemo(() => skills.filter(skill => {
    const matchesCategory = category === 'Todas' || skill.category === category
    const search = `${skill.title} ${skill.description} ${skill.benefit} ${skill.name}`.toLowerCase()
    return matchesCategory && search.includes(query.toLowerCase().trim())
  }), [query, category])

  async function copyCommand(skill: Skill) {
    if (!skill.command) return
    try {
      await navigator.clipboard.writeText(skill.command)
      setCopied(skill.name)
      window.setTimeout(() => setCopied(current => current === skill.name ? '' : current), 2200)
    } catch {
      setCopied('')
    }
  }

  return <main className="section inner ailab-page">
    <section className="broly-lab-entry"><div><span className="eyebrow">NUEVO · OFICINA INTELIGENTE</span><h2>BROLY <em>Executive AI</em></h2><p>Tu espacio privado para tareas, Gmail, Google Calendar y registro de actividad.</p></div><a className="button gold" href="/broly">Abrir BROLY <ArrowUpRight size={16}/></a></section>
    <div className="ailab-hero">
      <div className="ailab-hero-copy">
        <span className="eyebrow"><i/> AUREON AI PROJECT · LABORATORIO DIGITAL</span>
        <h1>La inteligencia se convierte en <em>acción.</em></h1>
        <p className="ailab-lead">Un laboratorio de herramientas, habilidades y patrones para construir mejores productos digitales. Seleccionamos recursos reales, explicamos para qué sirven y te acercamos a su fuente original.</p>
        <div className="ailab-hero-actions">
          <a className="button gold" href="#ailab-catalogo">Explorar biblioteca <ArrowUpRight size={16}/></a>
          <a className="button outline" href="https://skills.sh/" target="_blank" rel="noopener noreferrer">Explorar skills.sh <ExternalLink size={15}/></a>
        </div>
        <div className="ailab-trust"><ShieldCheck size={16}/> Recursos enlazados a sus fuentes · Sin instalaciones ocultas ni promesas falsas</div>
      </div>
    </div>

    <section className="ailab-next ailab-products" id="productos-digitales">
      <div className="ailab-next-head"><span className="eyebrow">AUREON DIGITAL STORE · PRODUCTOS Y GUÍAS</span><h2>De una idea a un proyecto <em>listo para construir.</em></h2><p>Elige exactamente lo que necesitas. Antes de comprar puedes ver una muestra; los archivos completos y materiales de pago se entregan después de confirmar el pago. Los recursos de terceros mantienen sus licencias originales.</p></div>
      <div className="ailab-product-grid">
        <article className="ailab-product-card"><img className="ailab-product-image" src="/img/redesign-web-kits.webp" alt="Kit web Aureon sobre escritorio premium" loading="lazy"/><span>01 / BUILD · KIT DIGITAL</span><Layers3 size={22}/><h3>Aureon Web Kits</h3><p>Kit de inicio para montar una experiencia web tipo AI Lab, con archivos fuente, componentes de catálogo, filtros y guía de instalación.</p><ul><li>Archivos fuente incluidos en el kit</li><li>Guía de integración paso a paso</li><li>Ejemplos y checklist de publicación</li><li>Licencias de terceros respetadas</li></ul><small>Entrega manual tras confirmar el pago en Revolut. Consulta el contenido exacto antes de comprar.</small><WebKitsCheckout/></article>
        <article className="ailab-product-card"><img className="ailab-product-image" src="/img/redesign-automation.webp" alt="Panel de automatización de procesos" loading="lazy"/><span>02 / AUTOMATE · GUÍAS</span><Workflow size={22}/><h3>Aureon Automation</h3><p>Guías y plantillas para diseñar flujos de captación de clientes, seguimiento y tareas repetitivas.</p><ul><li>Mapa visual de procesos</li><li>Plantillas editables de referencia</li><li>Pasos de configuración</li><li>Casos de uso explicados</li></ul><small>Se vende como material de guía y plantillas; no como una plataforma de automatización ya conectada.</small><a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "Aureon Automation 50 EUR")}><CreditCard size={15}/> Comprar guía y plantillas · 50 € <ExternalLink size={14}/></a></article>
        <article className="ailab-product-card"><img className="ailab-product-image" src="/img/redesign-ai-assistant.webp" alt="Asistente comercial con inteligencia artificial" loading="lazy"/><span>03 / ASSISTANT · IA</span><Bot size={22}/><h3>Aureon AI Assistant</h3><p>Material de referencia para diseñar un asistente comercial: instrucciones, ejemplos de conversación y criterios de derivación.</p><ul><li>Prompts de referencia</li><li>Ejemplos de preguntas frecuentes</li><li>Guía de integración conceptual</li><li>Buenas prácticas de consentimiento</li></ul><small>La activación de un asistente real puede requerir API, configuración y costes externos.</small><a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "Aureon AI Assistant 50 EUR")}><CreditCard size={15}/> Comprar guía IA · 50 € <ExternalLink size={14}/></a></article>
        <article className="ailab-product-card"><img className="ailab-product-image" src="/img/redesign-seo-adsense.webp" alt="Panel de analítica SEO y monetización" loading="lazy"/><span>04 / SEO · ADSENSE</span><FileText size={22}/><h3>SEO, AdSense y nichos rentables</h3><p>Guía para investigar una temática, ordenar la estrategia de contenidos y preparar un plan de monetización realista.</p><ul><li>Plantilla de análisis de nicho</li><li>Estructura para 50–100 ideas de artículos</li><li>Plan SEO y calendario editorial</li><li>Prompt maestro para investigación</li></ul><small>Los ingresos no están garantizados; CPC, RPM y competencia deben validarse con datos actuales.</small><a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "SEO AdSense Nichos 50 EUR")}><CreditCard size={15}/> Comprar guía SEO · 50 € <ExternalLink size={14}/></a></article>
        <article className="ailab-product-card"><img className="ailab-product-image" src="/img/redesign-crypto-trading.webp" alt="Guía Crypto & Trading 2026 sobre escritorio con gráficos de mercado" loading="lazy"/><span>05 / FORMACIÓN · PDF DIGITAL</span><FileText size={22}/><h3>Aureon Crypto &amp; Trading · Guía práctica 2026</h3><p>Guía educativa en PDF para empezar desde cero: estructura del mercado, investigación de proyectos, análisis técnico y fundamental, seguridad, gestión del riesgo y diario de trading.</p><ul><li>Fundamentos y glosario para principiantes</li><li>Plantillas de investigación y plan de operación</li><li>Ejercicios y ruta de estudio de 30 días</li><li>Fuentes oficiales y advertencias de riesgo</li></ul><small>PDF descargable. No garantiza beneficios ni convierte automáticamente al lector en profesional. Pago mediante Revolut; entrega manual tras verificar el pago.</small><a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "Aureon Crypto Trading PDF 50 EUR")}><CreditCard size={15}/> Comprar guía PDF · 50 € <ExternalLink size={14}/></a><a className="ailab-support-link" href={AUREON_SUPPORT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("delivery_info_click", "Aureon Crypto Trading PDF delivery info")}>Consultar muestra y condiciones de entrega <ArrowUpRight size={13}/></a></article>
        <article className="ailab-product-card ailab-product-featured"><img className="ailab-product-image" src="/img/redesign-web-kits.webp" alt="Recursos y archivos del proyecto web Aureon" loading="lazy"/><span>012 / ZIP OPEN ECOSYSTEM · PROYECTO COMPLETO</span><PackageCheck size={22}/><h3>Aureon Web Completa · ZIP + guía paso a paso</h3><p>La opción para quien quiere estudiar y adaptar el proyecto Aureon completo: archivos de la web, recursos visuales y documentación de configuración incluida en el paquete.</p><ul><li>ZIP del proyecto incluido en la oferta</li><li>Guía paso a paso para revisar estructura y archivos</li><li>Instrucciones de configuración y publicación según la documentación incluida</li><li>Secciones de catálogo, oportunidades y AI Lab presentes en el paquete</li><li>Lista de comprobación antes de desplegar</li></ul><small>Es un paquete de código para adaptar, no un servicio de despliegue automático. Supabase, claves, servicios externos, licencias y datos privados deben configurarse por separado. Revisa el alcance y los requisitos antes de pagar.</small><a className="button gold ailab-full-zip-buy" href={REVOLUT_FULL_ZIP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackAureonEvent("begin_checkout_click", "Aureon Web Completa ZIP 499 EUR")}><CreditCard size={16}/> Comprar ZIP completo · 499 € <ExternalLink size={15}/></a><p className="ailab-delivery-note">Pago mediante Revolut. La compra no desbloquea una descarga automática: confirma el pago y contacta con Aureon para acordar la entrega y las instrucciones.</p><a className="ailab-support-link" href={AUREON_SUPPORT_URL} target="_blank" rel="noopener noreferrer">Consultar contenido y entrega <ArrowUpRight size={13}/></a></article>
      </div>
      <div className="ailab-delivery-strip"><span><ShieldCheck/> Alcance explicado</span><span><Download/> Entrega tras confirmar el pago</span><span><Sparkles/> Guías y recursos visuales</span><span><Bot/> Ayuda para la configuración</span></div>
      <section className="ailab-reviews" aria-labelledby="ailab-reviews-title"><span className="eyebrow">OPINIONES · COMPRA CON CONFIANZA</span><h2 id="ailab-reviews-title">La confianza se demuestra con <em>experiencias reales.</em></h2><p>Estamos preparando este espacio para publicar opiniones auténticas de clientes que hayan comprado productos Aureon y autorizado su publicación. No inventamos reseñas ni presentamos puntuaciones ficticias como reales.</p><div className="ailab-review-empty"><div className="ailab-review-stars" aria-label="Reseñas verificadas pendientes">★★★★★</div><strong>Reseñas verificadas próximamente</strong><span>Tras las primeras compras añadiremos comentarios reales y el producto adquirido, con permiso del comprador.</span></div></section>
    </section>

    <section id="ailab-catalogo" className="ailab-library">
      <div className="section-heading"><div><span className="eyebrow">BIBLIOTECA CURADA</span><h2>Encuentra la skill <em>adecuada.</em></h2><p>Busca por tarea, filtra por categoría y abre la documentación original. Los comandos se ofrecen como referencia para tu entorno de desarrollo.</p></div></div>
      <label className="ailab-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar rendimiento, diseño, React…" aria-label="Buscar habilidades"/></label>
      <div className="ailab-filters" aria-label="Filtrar habilidades">{categories.map(item => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="ailab-skill-grid">
        {filtered.map((skill, index) => <article className="ailab-skill-card" key={skill.name}>
          <div className="ailab-skill-top"><span className="ailab-skill-icon">{skill.category === 'Diseño' ? <Palette size={19}/> : skill.category === 'Vercel' ? <Wrench size={19}/> : skill.category === 'Desarrollo' ? <Layers3 size={19}/> : <Bot size={19}/>}</span><span className="ailab-index">{String(index + 1).padStart(2, '0')} / AUREON</span></div>
          <span className="ailab-skill-badge">{skill.badge}</span>
          <h3>{skill.title}</h3><p>{skill.description}</p>
          <div className="ailab-benefit"><span>POR QUÉ IMPORTA</span>{skill.benefit}</div>
          <div className="ailab-card-actions"><a href={skill.source} target="_blank" rel="noopener noreferrer">Documentación <ArrowUpRight size={14}/></a>{skill.command && <button onClick={() => void copyCommand(skill)}>{copied === skill.name ? <Check size={14}/> : <Copy size={14}/>} {copied === skill.name ? 'Copiado' : 'Copiar comando'}</button>}</div>
          {skill.command && <code className="ailab-command">{skill.command}</code>}
        </article>)}
        {!filtered.length && <div className="ailab-empty">No hay resultados. Prueba otra búsqueda o categoría.</div>}
      </div>
      <p className="ailab-disclaimer">Compatibilidad y disponibilidad pueden variar según el agente y su versión. La instalación se realiza en el entorno de desarrollo; este catálogo no instala software ni ejecuta comandos desde el navegador.</p>
    </section>



    <CryptoIntelligence/>
  </main>
}
