// Colección de villas de colaboradores (julio 2026), generada a partir de la carpeta compartida.
// Solo datos que constan en los dosieres; lo que falta se muestra como «bajo petición».
export type CollabVilla = { slug: string; ref: string; destination: string; name: string; location: string; facts: Record<string, string>; highlights: string[]; description: string; price: { label: string; from?: number } | null; images: string[]; video: boolean; status: 'completa' | 'fotos' | 'pendiente' }
export type CollabDestination = { id: string; name: string; region: string; count: number }
export const collabDestinations: CollabDestination[] = [
 {
  "id": "bali",
  "name": "Bali",
  "region": "Indonesia",
  "count": 2
 },
 {
  "id": "cannes",
  "name": "Cannes",
  "region": "Costa Azul · Francia",
  "count": 3
 },
 {
  "id": "mykonos",
  "name": "Mykonos",
  "region": "Islas griegas",
  "count": 4
 },
 {
  "id": "islas-privadas",
  "name": "Islas privadas",
  "region": "Ubicación bajo petición",
  "count": 5
 },
 {
  "id": "maldivas",
  "name": "Maldivas",
  "region": "Océano Índico",
  "count": 3
 },
 {
  "id": "marbella",
  "name": "Marbella",
  "region": "Costa del Sol · España",
  "count": 5
 },
 {
  "id": "riviera",
  "name": "Mónaco y Riviera",
  "region": "Costa Azul",
  "count": 2
 },
 {
  "id": "rep-dom",
  "name": "República Dominicana",
  "region": "Caribe",
  "count": 7
 },
 {
  "id": "seychelles",
  "name": "Seychelles",
  "region": "Océano Índico",
  "count": 1
 },
 {
  "id": "tulum",
  "name": "Tulum",
  "region": "Riviera Maya · México",
  "count": 7
 }
]
export const collabVillas: CollabVilla[] = [
 {
  "slug": "villa-0-bali",
  "ref": "AUR-BAL-01",
  "destination": "bali",
  "name": "Villa Bali I",
  "location": "Bali",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-bali-1.webp",
   "/img/villas-colaboradores/villa-0-bali-2.webp",
   "/img/villas-colaboradores/villa-0-bali-3.webp",
   "/img/villas-colaboradores/villa-0-bali-4.webp",
   "/img/villas-colaboradores/villa-0-bali-5.webp",
   "/img/villas-colaboradores/villa-0-bali-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-1-bali",
  "ref": "AUR-BAL-02",
  "destination": "bali",
  "name": "Villa Bali II · suite privada",
  "location": "Bali",
  "facts": {
   "Superficie": "100 m²",
   "Huéspedes": "2",
   "Dormitorios": "1"
  },
  "highlights": [
   "Piscina infinita privada",
   "Bañera de terrazo artesanal",
   "Cenador exterior y tumbonas",
   "Equipo de audio y vídeo"
  ],
  "description": "Suite para dos con piscina infinita privada, cama king size y cenador exterior.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-bali-2.webp",
   "/img/villas-colaboradores/villa-1-bali-3.webp",
   "/img/villas-colaboradores/villa-1-bali-4.webp",
   "/img/villas-colaboradores/villa-1-bali-5.webp",
   "/img/villas-colaboradores/villa-1-bali-6.webp"
  ],
  "video": false,
  "status": "completa"
 },
 {
  "slug": "villa-0-cannes",
  "ref": "AUR-CAN-01",
  "destination": "cannes",
  "name": "Villa Cannes I",
  "location": "Cannes",
  "facts": {},
  "highlights": [
   "Piscina infinita con vistas al mar"
  ],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-cannes-1.webp",
   "/img/villas-colaboradores/villa-0-cannes-2.webp",
   "/img/villas-colaboradores/villa-0-cannes-3.webp",
   "/img/villas-colaboradores/villa-0-cannes-4.webp",
   "/img/villas-colaboradores/villa-0-cannes-5.webp",
   "/img/villas-colaboradores/villa-0-cannes-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-1-cannes",
  "ref": "AUR-CAN-02",
  "destination": "cannes",
  "name": "Villa Cannes II",
  "location": "Cannes",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-cannes-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-2-cannes",
  "ref": "AUR-CAN-03",
  "destination": "cannes",
  "name": "Villa 2A",
  "location": "Cannes, Francia",
  "facts": {
   "Dormitorios": "9",
   "Personal": "Servicio completo"
  },
  "highlights": [
   "Vistas al mar",
   "Spa con piscina de inmersión, hammam y sauna",
   "Cine y biblioteca",
   "Piscina y gimnasio"
  ],
  "description": "Mansión de 9 dormitorios con vistas al mar y servicio completo, con spa, cine, biblioteca, piscina y gimnasio.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-2-cannes-1.webp",
   "/img/villas-colaboradores/villa-2-cannes-2.webp",
   "/img/villas-colaboradores/villa-2-cannes-3.webp",
   "/img/villas-colaboradores/villa-2-cannes-4.webp",
   "/img/villas-colaboradores/villa-2-cannes-5.webp",
   "/img/villas-colaboradores/villa-2-cannes-6.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-0-mykonos",
  "ref": "AUR-MYK-01",
  "destination": "mykonos",
  "name": "Villa Sculpture",
  "location": "Kanalia, Ornos · Mykonos",
  "facts": {
   "Dormitorios": "10",
   "Baños": "11",
   "Piscinas": "2"
  },
  "highlights": [
   "Gimnasio y cine",
   "Vistas al atardecer sobre el Egeo",
   "En uno de los puntos más panorámicos de la isla"
  ],
  "description": "Villa minimalista y escultórica en el punto más panorámico de Mykonos, en conexión absoluta con el mar Egeo.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-mykonos-5.webp",
   "/img/villas-colaboradores/villa-0-mykonos-2.webp",
   "/img/villas-colaboradores/villa-0-mykonos-3.webp",
   "/img/villas-colaboradores/villa-0-mykonos-4.webp",
   "/img/villas-colaboradores/villa-0-mykonos-6.webp",
   "/img/villas-colaboradores/villa-0-mykonos-1.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-1-mykonos",
  "ref": "AUR-MYK-02",
  "destination": "mykonos",
  "name": "Villa Sweet Dreams",
  "location": "Mykonos",
  "facts": {
   "Huéspedes": "18",
   "Dormitorios": "9 dobles",
   "Baños": "11 (8 en suite)"
  },
  "highlights": [
   "Piscina infinita privada (climatizada bajo petición)",
   "Vistas panorámicas al mar",
   "Complejo en dos edificios"
  ],
  "description": "Complejo de dos edificios en una colina con vistas al Egeo y a las islas de Naxos, Tinos y Paros.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-mykonos-1.webp",
   "/img/villas-colaboradores/villa-1-mykonos-2.webp",
   "/img/villas-colaboradores/villa-1-mykonos-3.webp",
   "/img/villas-colaboradores/villa-1-mykonos-4.webp",
   "/img/villas-colaboradores/villa-1-mykonos-5.webp",
   "/img/villas-colaboradores/villa-1-mykonos-6.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-3-mykonos",
  "ref": "AUR-MYK-03",
  "destination": "mykonos",
  "name": "Villa Hideaway Paradise",
  "location": "Bahía de Ornos · Mykonos",
  "facts": {},
  "highlights": [
   "Primera línea de mar",
   "Piscina infinita",
   "Embarcadero y playa privados",
   "Gimnasio exterior"
  ],
  "description": "Propiedad frente al mar sobre la bahía de Ornos, con muelle privado y acceso directo a la playa.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-3-mykonos-1.webp",
   "/img/villas-colaboradores/villa-3-mykonos-2.webp",
   "/img/villas-colaboradores/villa-3-mykonos-3.webp",
   "/img/villas-colaboradores/villa-3-mykonos-4.webp",
   "/img/villas-colaboradores/villa-3-mykonos-5.webp",
   "/img/villas-colaboradores/villa-3-mykonos-6.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-4-mykonos",
  "ref": "AUR-MYK-04",
  "destination": "mykonos",
  "name": "Elegant Villa Mykonos",
  "location": "Junto a Mykonos Town",
  "facts": {},
  "highlights": [
   "Piscina exterior y jacuzzi interior gigante",
   "Barbacoa junto a la piscina",
   "Traslado gratuito aeropuerto/puerto",
   "Chef privado bajo petición"
  ],
  "description": "A pocos pasos de Mykonos Town y de la plaza Manto Mavrogenous, en dos niveles con vistas panorámicas al Egeo.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-4-mykonos-2.webp",
   "/img/villas-colaboradores/villa-4-mykonos-4.webp",
   "/img/villas-colaboradores/villa-4-mykonos-5.webp",
   "/img/villas-colaboradores/villa-4-mykonos-6.webp",
   "/img/villas-colaboradores/villa-4-mykonos-3.webp"
  ],
  "video": false,
  "status": "completa"
 },
 {
  "slug": "isla-privada-1",
  "ref": "AUR-ISL-01",
  "destination": "islas-privadas",
  "name": "Isla privada I",
  "location": "Ubicación bajo petición",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/isla-privada-1-1.webp",
   "/img/villas-colaboradores/isla-privada-1-2.webp",
   "/img/villas-colaboradores/isla-privada-1-3.webp",
   "/img/villas-colaboradores/isla-privada-1-4.webp",
   "/img/villas-colaboradores/isla-privada-1-5.webp",
   "/img/villas-colaboradores/isla-privada-1-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "isla-privada-2",
  "ref": "AUR-ISL-02",
  "destination": "islas-privadas",
  "name": "Isla privada II",
  "location": "Ubicación bajo petición",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/isla-privada-2-2.webp",
   "/img/villas-colaboradores/isla-privada-2-3.webp",
   "/img/villas-colaboradores/isla-privada-2-4.webp",
   "/img/villas-colaboradores/isla-privada-2-5.webp",
   "/img/villas-colaboradores/isla-privada-2-6.webp",
   "/img/villas-colaboradores/isla-privada-2-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "isla-privada-3",
  "ref": "AUR-ISL-03",
  "destination": "islas-privadas",
  "name": "Isla privada III",
  "location": "Ubicación bajo petición",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/isla-privada-3-1.webp",
   "/img/villas-colaboradores/isla-privada-3-2.webp",
   "/img/villas-colaboradores/isla-privada-3-3.webp",
   "/img/villas-colaboradores/isla-privada-3-4.webp",
   "/img/villas-colaboradores/isla-privada-3-5.webp",
   "/img/villas-colaboradores/isla-privada-3-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "isla-privada-4",
  "ref": "AUR-ISL-04",
  "destination": "islas-privadas",
  "name": "Isla privada IV",
  "location": "Ubicación bajo petición",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/isla-privada-4-1.webp",
   "/img/villas-colaboradores/isla-privada-4-2.webp",
   "/img/villas-colaboradores/isla-privada-4-3.webp",
   "/img/villas-colaboradores/isla-privada-4-4.webp",
   "/img/villas-colaboradores/isla-privada-4-5.webp",
   "/img/villas-colaboradores/isla-privada-4-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "isla-privada-5",
  "ref": "AUR-ISL-05",
  "destination": "islas-privadas",
  "name": "Isla privada V",
  "location": "Ubicación bajo petición",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/isla-privada-5-1.webp",
   "/img/villas-colaboradores/isla-privada-5-2.webp",
   "/img/villas-colaboradores/isla-privada-5-3.webp",
   "/img/villas-colaboradores/isla-privada-5-4.webp",
   "/img/villas-colaboradores/isla-privada-5-5.webp",
   "/img/villas-colaboradores/isla-privada-5-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-0-maldivas",
  "ref": "AUR-MDV-01",
  "destination": "maldivas",
  "name": "Villa Maldivas I",
  "location": "Maldivas",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-maldivas-3.webp",
   "/img/villas-colaboradores/villa-0-maldivas-4.webp",
   "/img/villas-colaboradores/villa-0-maldivas-1.webp",
   "/img/villas-colaboradores/villa-0-maldivas-2.webp",
   "/img/villas-colaboradores/villa-0-maldivas-5.webp",
   "/img/villas-colaboradores/villa-0-maldivas-6.webp"
  ],
  "video": false,
  "status": "fotos"
 },
 {
  "slug": "villa-1-maldivas",
  "ref": "AUR-MDV-02",
  "destination": "maldivas",
  "name": "Villa Maldivas II",
  "location": "Maldivas",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-maldivas-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-maldivas-2",
  "ref": "AUR-MDV-03",
  "destination": "maldivas",
  "name": "Villa Maldivas III",
  "location": "Maldivas",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": true,
  "status": "pendiente"
 },
 {
  "slug": "villa-0-marbella",
  "ref": "AUR-MAR-01",
  "destination": "marbella",
  "name": "Villa Sweet",
  "location": "La Quinta · Marbella",
  "facts": {
   "Dormitorios": "10",
   "Baños": "8 + 2",
   "Parcela": "10.000 m²"
  },
  "highlights": [
   "Pista de pádel privada",
   "Gimnasio",
   "Piscina",
   "Estilo clásico francés, alma española"
  ],
  "description": "Finca de estilo francés en las colinas de La Quinta, con jardines, pádel privado, gimnasio y piscina.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-marbella-1.webp",
   "/img/villas-colaboradores/villa-0-marbella-2.webp",
   "/img/villas-colaboradores/villa-0-marbella-3.webp",
   "/img/villas-colaboradores/villa-0-marbella-4.webp",
   "/img/villas-colaboradores/villa-0-marbella-5.webp",
   "/img/villas-colaboradores/villa-0-marbella-6.webp"
  ],
  "video": false,
  "status": "completa"
 },
 {
  "slug": "villa-1-marbella",
  "ref": "AUR-MAR-02",
  "destination": "marbella",
  "name": "Villa Marbella I",
  "location": "Marbella",
  "facts": {},
  "highlights": [
   "Arquitectura contemporánea",
   "Piscina"
  ],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-marbella-1.webp",
   "/img/villas-colaboradores/villa-1-marbella-2.webp",
   "/img/villas-colaboradores/villa-1-marbella-3.webp",
   "/img/villas-colaboradores/villa-1-marbella-4.webp",
   "/img/villas-colaboradores/villa-1-marbella-5.webp",
   "/img/villas-colaboradores/villa-1-marbella-6.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-2-marbella",
  "ref": "AUR-MAR-03",
  "destination": "marbella",
  "name": "Villa Marbella 6 dormitorios",
  "location": "Cortijo Blanco, San Pedro de Alcántara",
  "facts": {
   "Dormitorios": "6",
   "Playa": "a 200 m"
  },
  "highlights": [
   "Piscina exterior climatizada y piscina cubierta",
   "Spa: inmersión fría, hidromasaje y baño de vapor",
   "Bar, cabaña y barbacoa",
   "Cerca de Puerto Banús"
  ],
  "description": "Villa independiente a 200 m de la playa, con spa en el sótano y piscina climatizada para nadar todo el año.",
  "price": {
   "label": "Extras indicados por el colaborador: piscina cubierta 300 €/semana · climatizar la exterior 400 €/semana"
  },
  "images": [
   "/img/villas-colaboradores/villa-2-marbella-3.webp",
   "/img/villas-colaboradores/villa-2-marbella-4.webp",
   "/img/villas-colaboradores/villa-2-marbella-5.webp",
   "/img/villas-colaboradores/villa-2-marbella-1.webp",
   "/img/villas-colaboradores/villa-2-marbella-2.webp",
   "/img/villas-colaboradores/villa-2-marbella-6.webp"
  ],
  "video": false,
  "status": "completa"
 },
 {
  "slug": "villa-3-marbella",
  "ref": "AUR-MAR-04",
  "destination": "marbella",
  "name": "Villa Sierra Blanca",
  "location": "Sierra Blanca · Milla de Oro, Marbella",
  "facts": {
   "Dormitorios": "6",
   "Seguridad": "24 h"
  },
  "highlights": [
   "Piscina en la azotea con vistas al mar",
   "Gimnasio, sauna y baño de vapor",
   "Cine, bodega y sala de juegos",
   "Garaje para 4 coches"
  ],
  "description": "Villa moderna con vistas al mar en tres plantas, en Sierra Blanca, a minutos de las playas de la Milla de Oro.",
  "price": {
   "label": "Tarifa semanal del colaborador: 30.000 € (baja) · 40.000 € (media) · 50.000 € (alta)",
   "from": 30000
  },
  "images": [
   "/img/villas-colaboradores/villa-3-marbella-2.webp",
   "/img/villas-colaboradores/villa-3-marbella-3.webp",
   "/img/villas-colaboradores/villa-3-marbella-1.webp",
   "/img/villas-colaboradores/villa-3-marbella-4.webp",
   "/img/villas-colaboradores/villa-3-marbella-5.webp",
   "/img/villas-colaboradores/villa-3-marbella-6.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-4-marbella",
  "ref": "AUR-MAR-05",
  "destination": "marbella",
  "name": "Villa Cascada de Camoján",
  "location": "Milla de Oro · Marbella",
  "facts": {
   "Dormitorios": "7",
   "Superficie": "4.200 m²"
  },
  "highlights": [
   "Piscina infinita climatizada con bar LED",
   "Cine para 12 personas",
   "Bodega y gimnasio",
   "Vistas a Gibraltar y África"
  ],
  "description": "Villa moderna orientada al sur en uno de los enclaves más exclusivos de Marbella, con terraza privada en todos los dormitorios.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-4-marbella-3.webp",
   "/img/villas-colaboradores/villa-4-marbella-2.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-0-monaco",
  "ref": "AUR-RIV-01",
  "destination": "riviera",
  "name": "Villa Cap Ferrat",
  "location": "Saint-Jean-Cap-Ferrat · Riviera francesa",
  "facts": {
   "Huéspedes": "14",
   "Dormitorios": "7 en suite",
   "Vivienda": "700 m²",
   "Parcela": "4.800 m²",
   "Personal": "8"
  },
  "highlights": [
   "Piscina exterior y piscina cubierta",
   "Gimnasio, hammam, sauna y sala de masajes",
   "Funicular y ascensor a todos los niveles",
   "Comedor con vistas al mar para 18"
  ],
  "description": "Villa ultracontemporánea en una de las direcciones más exclusivas de la Riviera, con terraza y vistas al mar en cada dormitorio.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-monaco-1.webp",
   "/img/villas-colaboradores/villa-0-monaco-2.webp",
   "/img/villas-colaboradores/villa-0-monaco-3.webp",
   "/img/villas-colaboradores/villa-0-monaco-4.webp",
   "/img/villas-colaboradores/villa-0-monaco-5.webp",
   "/img/villas-colaboradores/villa-0-monaco-6.webp"
  ],
  "video": false,
  "status": "completa"
 },
 {
  "slug": "villa-1-monaco",
  "ref": "AUR-RIV-02",
  "destination": "riviera",
  "name": "Villa Mónaco",
  "location": "Mónaco",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-monaco-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-0-rep-dom",
  "ref": "AUR-RDO-01",
  "destination": "rep-dom",
  "name": "Villa Caribe I",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-rep-dom-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-1-rep-dom",
  "ref": "AUR-RDO-02",
  "destination": "rep-dom",
  "name": "Villa Caribe II",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": true,
  "status": "pendiente"
 },
 {
  "slug": "villa-2-rep-dom",
  "ref": "AUR-RDO-03",
  "destination": "rep-dom",
  "name": "Villa Caribe III",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-2-rep-dom-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-3-rep-dom",
  "ref": "AUR-RDO-04",
  "destination": "rep-dom",
  "name": "Villa Caribe IV",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": true,
  "status": "pendiente"
 },
 {
  "slug": "villa-4-rep-dom",
  "ref": "AUR-RDO-05",
  "destination": "rep-dom",
  "name": "Villa Caribe V",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": true,
  "status": "pendiente"
 },
 {
  "slug": "villa-5-rep-dom",
  "ref": "AUR-RDO-06",
  "destination": "rep-dom",
  "name": "Villa Caribe VI",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-5-rep-dom-1.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-6-rep-dom",
  "ref": "AUR-RDO-07",
  "destination": "rep-dom",
  "name": "Villa Caribe VII",
  "location": "República Dominicana",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-6-rep-dom-2.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-0-seychelles",
  "ref": "AUR-SEY-01",
  "destination": "seychelles",
  "name": "Villa Seychelles",
  "location": "Seychelles",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": false,
  "status": "pendiente"
 },
 {
  "slug": "villa-0-tulum",
  "ref": "AUR-TUL-01",
  "destination": "tulum",
  "name": "Villa Tulum I",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-0-tulum-1.webp",
   "/img/villas-colaboradores/villa-0-tulum-2.webp",
   "/img/villas-colaboradores/villa-0-tulum-5.webp",
   "/img/villas-colaboradores/villa-0-tulum-6.webp",
   "/img/villas-colaboradores/villa-0-tulum-3.webp",
   "/img/villas-colaboradores/villa-0-tulum-4.webp"
  ],
  "video": false,
  "status": "fotos"
 },
 {
  "slug": "villa-1-tulum",
  "ref": "AUR-TUL-02",
  "destination": "tulum",
  "name": "Casa Tulum",
  "location": "Reserva de la Biosfera de Sian Ka’an · Tulum",
  "facts": {
   "Dormitorios": "5"
  },
  "highlights": [
   "Entre el mar Caribe y la laguna de Campechén",
   "Villa autosuficiente sobre pilotes",
   "Piscina y playa",
   "Cine con proyector de 120″, kayak y paddle surf"
  ],
  "description": "Villa sostenible dentro de la Reserva de Sian Ka’an (Patrimonio de la Humanidad de la UNESCO), con vistas al océano desde todos los dormitorios.",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-1-tulum-2.webp",
   "/img/villas-colaboradores/villa-1-tulum-4.webp",
   "/img/villas-colaboradores/villa-1-tulum-6.webp",
   "/img/villas-colaboradores/villa-1-tulum-3.webp",
   "/img/villas-colaboradores/villa-1-tulum-5.webp"
  ],
  "video": true,
  "status": "completa"
 },
 {
  "slug": "villa-2-tulum",
  "ref": "AUR-TUL-03",
  "destination": "tulum",
  "name": "Villa Tulum II",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-2-tulum-1.webp"
  ],
  "video": false,
  "status": "fotos"
 },
 {
  "slug": "villa-3-tulum",
  "ref": "AUR-TUL-04",
  "destination": "tulum",
  "name": "Villa Tulum III",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [],
  "video": false,
  "status": "pendiente"
 },
 {
  "slug": "villa-4-tulum",
  "ref": "AUR-TUL-05",
  "destination": "tulum",
  "name": "Villa Tulum IV",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-4-tulum-1.webp",
   "/img/villas-colaboradores/villa-4-tulum-2.webp",
   "/img/villas-colaboradores/villa-4-tulum-3.webp"
  ],
  "video": true,
  "status": "fotos"
 },
 {
  "slug": "villa-5-tulum",
  "ref": "AUR-TUL-06",
  "destination": "tulum",
  "name": "Villa Tulum V",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-5-tulum-1.webp",
   "/img/villas-colaboradores/villa-5-tulum-2.webp",
   "/img/villas-colaboradores/villa-5-tulum-3.webp",
   "/img/villas-colaboradores/villa-5-tulum-4.webp",
   "/img/villas-colaboradores/villa-5-tulum-5.webp",
   "/img/villas-colaboradores/villa-5-tulum-6.webp"
  ],
  "video": false,
  "status": "fotos"
 },
 {
  "slug": "villa-6-tulum",
  "ref": "AUR-TUL-07",
  "destination": "tulum",
  "name": "Villa Tulum VI",
  "location": "Tulum",
  "facts": {},
  "highlights": [],
  "description": "",
  "price": null,
  "images": [
   "/img/villas-colaboradores/villa-6-tulum-1.webp",
   "/img/villas-colaboradores/villa-6-tulum-2.webp",
   "/img/villas-colaboradores/villa-6-tulum-3.webp",
   "/img/villas-colaboradores/villa-6-tulum-4.webp",
   "/img/villas-colaboradores/villa-6-tulum-5.webp",
   "/img/villas-colaboradores/villa-6-tulum-6.webp"
  ],
  "video": true,
  "status": "fotos"
 }
]
