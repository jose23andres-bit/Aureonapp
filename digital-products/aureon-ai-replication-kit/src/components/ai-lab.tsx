import { useMemo, useState } from 'react'
import { ArrowUpRight, Bot, Check, Copy, ExternalLink, Gauge, Layers3, Palette, Search, ShieldCheck, Smartphone, Wrench, CreditCard } from 'lucide-react'

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
const AUREON_SUPPORT_URL = 'https://wa.me/message/HZA7ZUG4DJ7ZK1'

function WebKitsCheckout() {
  return <div className="ailab-checkout">
    <a className="button gold" href={REVOLUT_KIT_URL} target="_blank" rel="noopener noreferrer">
      <CreditCard size={15}/> Comprar el kit completo · 50 € <ExternalLink size={14}/>
    </a>
    <p className="ailab-delivery-note">Pago seguro en Revolut. La entrega del paquete digital se realiza manualmente después de verificar el pago. Conserva el justificante y contacta con Aureon para recibirlo.</p>
    <a className="ailab-support-link" href={AUREON_SUPPORT_URL} target="_blank" rel="noopener noreferrer">Contactar con Aureon para la entrega <ArrowUpRight size={13}/></a>
  </div>
}

export function AILab() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('Todas')
  const [copied, setCopied] = useState('')
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
      <div className="ailab-orbit-card" aria-label="Aureon AI Lab">
        <div className="ailab-orbit-label"><span>AI LAB / 001</span><span>OPEN ECOSYSTEM</span></div>
        <div className="ailab-orbit-art"><div className="ailab-orbit-ring ring-one"/><div className="ailab-orbit-ring ring-two"/><div className="ailab-orbit-core">A<span>✦</span></div></div>
        <div className="ailab-orbit-foot"><span><b>01</b> · Tu ZIP original</span><span><b>09</b> · Recursos seleccionados</span></div>
      </div>
    </div>

    <section className="ailab-priority">
      <div className="ailab-priority-icon"><Gauge size={22}/></div>
      <div><span className="eyebrow">MI SELECCIÓN PARA AUREON</span><h2>Primero, velocidad. Después, conversión.</h2><p>Para tu web empezaría auditando rendimiento y experiencia móvil, revisaría los componentes React y después optimizaría las páginas de catálogo y los formularios. Las skills guían a un agente de programación: no se ejecutan por sí solas en la página pública.</p></div>
      <a className="textlink" href="https://github.com/vercel-labs/agent-skills" target="_blank" rel="noopener noreferrer">Ver colección oficial <ArrowUpRight size={15}/></a>
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

    <section className="ailab-next">
      <div className="ailab-next-head"><span className="eyebrow">EL SIGUIENTE NIVEL</span><h2>De recursos gratuitos a <em>productos propios.</em></h2><p>El kit de 50 € reúne una implementación de referencia de Aureon AI Lab y documentación práctica para adaptarla a tu proyecto. Las habilidades de terceros siguen sujetas a sus licencias originales.</p></div>
      <div className="ailab-product-grid">
        <article><span>01 / BUILD</span><Layers3 size={22}/><h3>Aureon Web Kits</h3><p>Paquete de replicación para montar una experiencia tipo AI Lab: componente de catálogo, filtros, enlaces a skills, guía de instalación y checklist de publicación.</p><small>Incluye archivos fuente del kit Aureon, guía de integración, ejemplos y checklist. Las skills originales conservan sus licencias y autorías.</small><WebKitsCheckout/></article>
        <article><span>02 / AUTOMATE</span><Wrench size={22}/><h3>Aureon Automation</h3><p>Recetas de automatización para captación de clientes, seguimiento y tareas repetitivas.</p><small>Fase propuesta · requiere desarrollo</small></article>
        <article><span>03 / MOBILE</span><Smartphone size={22}/><h3>Aureon AI Assistant</h3><p>Asistente de ayuda para orientar a los usuarios y derivar consultas comerciales con consentimiento.</p><small>Fase propuesta · requiere API y controles</small></article>
      </div>
    </section>
    <section className="ailab-bottom-cta"><div><span className="eyebrow">AUREON AI PROJECT</span><h2>Construir con criterio. <em>Crecer con intención.</em></h2><p>Empieza por las herramientas adecuadas y convierte cada mejora en una experiencia mejor para tus clientes.</p></div><a className="button gold" href="https://github.com/vercel-labs/agent-skills" target="_blank" rel="noopener noreferrer">Abrir repositorio oficial <ArrowUpRight size={16}/></a></section>
  </main>
}
