export type Entry = { id: string; kind: string; title: string; slug: string; status: string; data: Record<string, any> }
export const categories = [
 {slug:'coches-en-venta',title:'Coches de lujo',short:'Coches de lujo',label:'ESCAPARATE AUTOMÓVIL',image:'category-coches.webp',description:'Un escaparate de automoción extraordinaria. Descubre modelos, fotografías y vídeos; no se venden vehículos directamente desde Aureon.'},
 {slug:'villas-en-venta',title:'Villas exclusivas',short:'Villas exclusivas',label:'ESCAPARATE INMOBILIARIO',image:'category-villas-venta.webp',description:'Arquitectura, privacidad y lugares que inspiran. Catálogo visual informativo; no se venden inmuebles directamente desde Aureon.'},
 {slug:'alquiler-villas',title:'Villas y estancias',short:'Villas y estancias',label:'ESCAPARATE DE ESTANCIAS',image:'category-villas-alquiler.webp',description:'Descubre espacios y estancias singulares. Aureon muestra información y no procesa pagos ni reservas de inmuebles.'},
 {slug:'relojes-diamantes-joyas',title:'Relojes, diamantes y joyas',short:'Relojes y joyas',label:'ALTA JOYERÍA · PIEZAS EXCLUSIVAS',image:'category-joyas.webp',description:'Una selección privada de relojería, diamantes y joyería. Solicita disponibilidad, autenticidad y documentación de cada pieza.'},
 {slug:'alquiler-coches',title:'Superdeportivos',short:'Superdeportivos',hero:'Superdeportivos',label:'ESCAPARATE AUTOMÓVIL',image:'category-superdeportivos-new.jpeg',description:'El placer de descubrir automóviles extraordinarios. Consulta información; Aureon no cobra ni confirma alquileres de vehículos desde la web.'},
 {slug:'ofertas',title:'Ofertas y afiliación',short:'Ofertas y afiliación',label:'OFERTAS Y ENLACES ÚTILES',image:'category-ofertas.webp',description:'Marcas, servicios y ventajas en un mismo lugar.'},
]
// Sección propia fuera de la navegación comercial de seis categorías.
export const vipCategory: (typeof categories)[number] = {slug:'ocio-vip',title:'Ocio VIP y eventos',short:'Ocio VIP',label:'OCIO VIP · DJS · EVENTOS',image:'category-ocio-vip-new.jpeg',description:'Joy Eslava, sala HEAT, contratación de DJs y próximamente alquiler de equipos para eventos. Todo sujeto a confirmación.'}
export const WA='https://wa.me/message/HZA7ZUG4DJ7ZK1'
export const links: Entry[] = [
 ['revolut','Revolut Personal','https://revolut.com/referral/?referral-code=joseqckq2!OCT1-26-VR-ES&geo-redirect','Finanzas personales · Enlace promocional'],
 ['business','Revolut Business','https://business.revolut.com/signup?promo=C2B-OCT1-26-AR&ext=joseqckq2&context=C2B_REF','Para tu negocio · Enlace promocional'],
 ['phantom','Phantom','https://phantom.com/r/tupuria','Wallet digital · Enlace de referido. Los criptoactivos implican riesgo.'],
 ['vitastrong','VitaStrong','https://vitastrong.es/es/','Suplementación y bienestar'],
 ['gomfer','VitaStrong · GOMFER','https://vitastrong.es/?coupon=GOMFER','Código promocional GOMFER · Condiciones en destino'],
 ['reseller','VitaStrong Reseller','https://vitastrong.es/es/content/27-vitastrong-reseller','Información para distribuidores'],
 ['hotmart-librito','Mi Primer Librito Armable','https://go.hotmart.com/F108040553B','Producto digital · Enlace de afiliación'],
 ['hotmart-transformacion','Te vas a transformar','https://go.hotmart.com/N108040547Q','Desarrollo personal · Enlace de afiliación'],
 ['eslava','Joy Eslava · Reservas de José Andrés','https://www.fourvenues.com/madridvip','Reservados y listas VIP · Enlace personal de Fourvenues'],
 ['madridvip','Madrid VIP · Fourvenues','https://www.fourvenues.com/madridvip','Reservados y ocio · Enlace personal de Fourvenues'],
 ['instagram','Instagram · @joseandresxxiii','https://www.instagram.com/joseandresxxiii/','Perfil oficial de Instagram de José Andrés'],
 ['youtube','AUREON en YouTube','https://www.youtube.com/@aureonaiproject','Canal oficial de AUREON AI PROJECT'],
 ['radio','Ibiza Global Radio','https://ibizaglobalradio.com/','Música y cultura electrónica'],
 ['contacto','Contacto comercial',WA,'Atención privada por WhatsApp'],
].map(([id,title,url,description])=>({id,slug:id,title,kind:'link',status:'published',data:{url,description}}))
export const img=(name:string,w=1000)=>`/.netlify/images?url=/img/${name}&w=${w}&fm=webp`
export const external=(url:string)=>url.startsWith('/')&&!url.startsWith('//')?url:/^https:\/\//.test(url)?url:'#'
