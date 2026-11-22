// BROLY Radar: what to look for and where. Only public pages already indexed by a search engine are
// read (title + snippet). No portal is scraped, no account is used, nothing is fetched from the portals.

export type LeadCategory = { id: string; label: string; sensitive?: boolean; anyZone?: boolean; queries: (city: string) => string[] }

export const LEAD_CATEGORIES: LeadCategory[] = [
  { id: 'djs', label: 'DJ y música en directo', queries: c => [`busco DJ ${c} boda`, `necesito DJ para fiesta ${c}`, `site:milanuncios.com "busco dj" ${c}`, `site:reddit.com DJ ${c} recomendación`] },
  { id: 'eventos', label: 'Eventos y fiestas privadas', queries: c => [`busco empresa organizar evento ${c}`, `necesito organizar fiesta privada ${c} recomendaciones`, `site:comunidad.bodas.net busco ${c}`] },
  { id: 'sonido', label: 'Equipos de sonido e iluminación', queries: c => [`busco alquiler equipo de sonido ${c}`, `necesito altavoces e iluminación para evento ${c}`] },
  { id: 'vip', label: 'Ocio VIP y reservados', queries: c => [`reservado discoteca ${c} recomendación grupo`, `mesa VIP ${c} cumpleaños busco`] },
  { id: 'alquiler-coches', label: 'Alquiler de coches de lujo', queries: c => [`alquilar coche de lujo para boda ${c} busco`, `alquiler Lamborghini Ferrari ${c} recomendación foro`] },
  { id: 'coches', label: 'Compra de coches de alta gama', queries: c => [`site:milanuncios.com compro coche alta gama ${c}`, `site:forocoches.com busco coche lujo ${c}`, 'site:es.wallapop.com busco coche', 'site:coches.net compro coche'] },
  { id: 'villas', label: 'Alquiler de villas y estancias', anyZone: true, queries: c => ['busco villa con piscina alquiler grupo Marbella Ibiza', `busco casa grande alquilar fin de semana despedida ${c}`] },
  { id: 'inmuebles', label: 'Compra de vivienda de lujo', queries: c => [`busco chalet de lujo comprar ${c} foro`, 'site:idealista.com busco vivienda'] },
  { id: 'relojes', label: 'Relojes y joyas', queries: c => [`compro Rolex ${c} busco`, `site:milanuncios.com compro reloj lujo ${c}`] },
  { id: 'estetica', label: 'Medicina estética', sensitive: true, queries: c => [`busco clínica botox ${c} recomendación`, `recomendación medicina estética ${c} foro`] },
]

export const categoryById = (id: string) => LEAD_CATEGORIES.find(c => c.id === id)

/** All queries in a stable order, interleaving categories so that any slice covers many of them. */
export function allQueries(city: string, enabled?: string[]) {
  const cats = LEAD_CATEGORIES.filter(c => !enabled?.length || enabled.includes(c.id))
  const lists = cats.map(c => c.queries(city).map(q => ({ q, category: c.id })))
  const out: Array<{ q: string; category: string }> = []
  for (let i = 0; lists.some(l => l[i]); i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}

/** Queries for one run: rotates through the whole list (one slot every 12 h) within the per-run budget. */
export function queriesForRun(city: string, budget: number, now = Date.now(), enabled?: string[]) {
  const all = allQueries(city, enabled)
  if (budget >= all.length) return all
  const slots = Math.ceil(all.length / budget)
  const slot = Math.floor(now / (12 * 3600 * 1000)) % slots
  return all.slice(slot * budget, slot * budget + budget)
}

const MADRID_AREA = ['madrid', 'alcobendas', 'pozuelo', 'majadahonda', 'las rozas', 'boadilla', 'la moraleja', 'aravaca', 'getafe', 'alcalá de henares', 'leganés', 'móstoles', 'fuenlabrada', 'torrejón', 'rivas', 'tres cantos', 'villaviciosa de odón', 'san sebastián de los reyes', 'sanse', 'chamberí', 'barrio de salamanca', 'retiro', 'chamartín', 'moncloa', 'galapagar', 'torrelodones', 'collado villalba', 'villanueva de la cañada', 'alcorcón', 'arganda']

/** Words that place a post in the target area. For a city other than Madrid only the city name is used. */
export function zoneTerms(city: string) {
  return city.trim().toLowerCase() === 'madrid' ? MADRID_AREA : [city.trim().toLowerCase()]
}

/** Holiday areas recognised for categories that accept any zone (villas). */
export const HOLIDAY_ZONES = ['marbella', 'puerto banús', 'benahavís', 'estepona', 'sotogrande', 'costa del sol', 'málaga', 'ibiza', 'formentera', 'mallorca', 'menorca', 'tenerife', 'gran canaria', 'lanzarote', 'costa brava', 'sitges', 'jávea', 'altea', 'cádiz', 'tarifa']
