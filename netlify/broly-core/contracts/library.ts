/// <reference types="node" />
// BROLY contract library: orientative Spanish-law templates (not legal advice).
// Placeholders {{key}} are filled from the operation data; missing data become fillable fields in the PDF.
// Party fields are generated automatically: <role>_nombre, <role>_doc, <role>_domicilio, <role>_contacto.

export type Field = { key: string; label: string; long?: boolean }
export type Party = { role: string; label: string }
export type Template = { id: string; title: string; category: string; summary: string; law: string; parties: Party[]; fields: Field[]; clauses: Array<[string, string]>; notice?: string }

const P = (role: string, label: string): Party => ({ role, label })
const F = (key: string, label: string, long = false): Field => ({ key, label, ...(long ? { long } : {}) })

export const CATEGORIES = ['Confidencialidad e intermediación', 'Inmobiliario', 'Alquiler de villas y estancias', 'Vehículos', 'Eventos y ocio', 'Lujo y joyería', 'Servicios y colaboración', 'Propiedad intelectual e imagen', 'Financiero', 'Sociedades y acuerdos', 'Protección de datos'] as const

export const TEMPLATES: Template[] = [
  // ---------------- Confidencialidad e intermediación ----------------
  { id: 'nda-unilateral', title: 'Acuerdo de confidencialidad (NDA) unilateral', category: 'Confidencialidad e intermediación', summary: 'Una parte revela información y la otra se obliga a guardarla en secreto.', law: 'Arts. 1091, 1101 y 1152 del Código Civil; Ley 1/2019 de Secretos Empresariales.',
    parties: [P('revelador', 'Parte reveladora'), P('receptor', 'Parte receptora')],
    fields: [F('finalidad', 'Finalidad para la que se comparte la información', true), F('duracion', 'Duración de la obligación de confidencialidad'), F('penalizacion', 'Cláusula penal por incumplimiento (€)'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'La Parte reveladora facilitará a la Parte receptora información confidencial con la exclusiva finalidad de: {{finalidad}} (en adelante, la «Finalidad»).'],
      ['Información confidencial', 'Tendrá la consideración de información confidencial toda información técnica, comercial, financiera, de clientes, propietarios, inmuebles, vehículos, precios, márgenes, contactos o de cualquier otra naturaleza, comunicada por cualquier medio, incluida la verbal, y con independencia de que se identifique o no como confidencial.'],
      ['Obligaciones', 'La Parte receptora se obliga a (i) no divulgar la información a terceros; (ii) utilizarla únicamente para la Finalidad; (iii) limitar su acceso a las personas que necesiten conocerla, a quienes trasladará estas mismas obligaciones; y (iv) adoptar medidas de seguridad razonables.'],
      ['Exclusiones', 'No será confidencial la información que (a) sea de dominio público sin incumplimiento de este acuerdo; (b) ya conociera legítimamente la Parte receptora; o (c) deba revelarse por mandato legal o judicial, en cuyo caso se comunicará previamente a la Parte reveladora si fuera posible.'],
      ['Duración', 'Las obligaciones de confidencialidad estarán vigentes durante {{duracion}} desde la firma y subsistirán tras la finalización de cualquier relación entre las partes.'],
      ['Devolución', 'A requerimiento de la Parte reveladora, la Parte receptora devolverá o destruirá la información recibida y sus copias, y lo confirmará por escrito.'],
      ['Cláusula penal', 'El incumplimiento facultará a la Parte reveladora para exigir, en concepto de cláusula penal (art. 1152 del Código Civil), la cantidad de {{penalizacion}} €, sin perjuicio de reclamar los daños y perjuicios que la excedan y de las acciones previstas en la Ley de Secretos Empresariales.'],
    ] },
  { id: 'nda-mutuo', title: 'Acuerdo de confidencialidad (NDA) mutuo', category: 'Confidencialidad e intermediación', summary: 'Ambas partes intercambian información y se obligan recíprocamente a la confidencialidad.', law: 'Arts. 1091, 1101 y 1152 del Código Civil; Ley 1/2019 de Secretos Empresariales.',
    parties: [P('parte_a', 'Primera parte'), P('parte_b', 'Segunda parte')],
    fields: [F('proyecto', 'Proyecto u operación', true), F('duracion', 'Duración de la confidencialidad'), F('penalizacion', 'Cláusula penal por incumplimiento (€)'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Las partes van a intercambiar información confidencial en relación con: {{proyecto}}. Cada parte actuará como reveladora respecto de su información y como receptora respecto de la información de la otra.'],
      ['Alcance', 'Es confidencial toda la información comercial, técnica, financiera, de clientes, proveedores, propietarios y contactos que una parte facilite a la otra por cualquier medio, así como la existencia y los términos de las conversaciones.'],
      ['Obligaciones recíprocas', 'Cada parte se obliga a no divulgar la información de la otra, a usarla solo para el proyecto indicado, a restringir su acceso a quienes lo necesiten y a responder de que estos respeten este acuerdo.'],
      ['Exclusiones', 'Se excluye la información pública sin culpa de la receptora, la que ya conociera legítimamente o la que deba revelarse por obligación legal o resolución judicial.'],
      ['Duración', 'Este acuerdo obliga durante {{duracion}} desde su firma, incluso si el proyecto no llega a materializarse.'],
      ['Cláusula penal', 'La parte que incumpla abonará a la otra {{penalizacion}} € como cláusula penal (art. 1152 CC), sin perjuicio de la indemnización por los daños que excedan de esa cantidad.'],
    ] },
  { id: 'ncnda', title: 'Acuerdo de no elusión, no competencia y confidencialidad (NCNDA)', category: 'Confidencialidad e intermediación', summary: 'Protege al intermediario: nadie puede saltárselo y contratar directamente con las partes que presenta.', law: 'Arts. 1255, 1091, 1101 y 1152 del Código Civil; Ley 1/2019 de Secretos Empresariales.',
    parties: [P('intermediario', 'Intermediario'), P('contraparte', 'Parte presentada')],
    fields: [F('operacion', 'Tipo de operación (venta, alquiler, compra...)', true), F('contactos', 'Personas, empresas o bienes presentados', true), F('comision', 'Honorarios del intermediario (% o importe)'), F('duracion', 'Duración de la protección (p. ej., 24 meses)'), F('penalizacion', 'Cláusula penal por elusión (€)'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Intermediario presenta a la Parte presentada las siguientes personas, entidades u oportunidades (en adelante, los «Contactos protegidos»): {{contactos}}, en relación con la operación: {{operacion}}.'],
      ['No elusión', 'La Parte presentada se obliga a no contactar, negociar ni contratar, directa o indirectamente, por sí o mediante personas o sociedades interpuestas, familiares o socios, con los Contactos protegidos para la operación indicada u otras similares, sin la participación y el consentimiento expreso y por escrito del Intermediario.'],
      ['Honorarios garantizados', 'Cualquier operación que se formalice con los Contactos protegidos durante la vigencia de este acuerdo devengará a favor del Intermediario los honorarios de {{comision}}, con independencia de quién la cierre y de la forma jurídica empleada.'],
      ['No competencia', 'La Parte presentada no ofrecerá a los Contactos protegidos servicios de intermediación que compitan con los del Intermediario respecto de la operación indicada.'],
      ['Confidencialidad', 'La identidad de los Contactos protegidos, los precios, condiciones y documentos facilitados son confidenciales y solo podrán usarse para la operación con participación del Intermediario.'],
      ['Duración', 'Las obligaciones de este acuerdo estarán vigentes durante {{duracion}} desde la firma o desde la última comunicación sobre la operación, si fuera posterior.'],
      ['Cláusula penal', 'La elusión del Intermediario obligará a la Parte presentada a abonarle, como cláusula penal, la mayor de estas cantidades: {{penalizacion}} € o los honorarios que habría devengado conforme a la cláusula de honorarios garantizados, sin perjuicio de reclamar daños adicionales.'],
      ['Prueba', 'Las partes aceptan como medio de prueba los correos electrónicos, mensajes de WhatsApp y demás comunicaciones electrónicas intercambiadas en relación con los Contactos protegidos.'],
    ] },
  { id: 'mandato-venta', title: 'Encargo de intermediación para venta (propietario)', category: 'Confidencialidad e intermediación', summary: 'El propietario encarga a AUREON buscar comprador para un bien a cambio de honorarios.', law: 'Contrato de mediación o corretaje (arts. 1255 y 1709 y ss. del Código Civil, por analogía).',
    parties: [P('mandante', 'Propietario (mandante)'), P('mediador', 'Mediador')],
    fields: [F('bien', 'Bien que se vende (descripción e identificación)', true), F('precio', 'Precio de venta solicitado (€)'), F('honorarios', 'Honorarios (% o importe) y cuándo se devengan'), F('exclusiva', 'Exclusiva (sí/no) y duración del encargo'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Encargo', 'El Propietario encarga al Mediador la búsqueda de comprador para el siguiente bien: {{bien}}, por un precio de {{precio}} €, o el que el Propietario acepte posteriormente.'],
      ['Garantías del propietario', 'El Propietario declara ser titular del bien o estar facultado para venderlo, y que la información facilitada sobre cargas, estado y documentación es veraz.'],
      ['Honorarios', 'El Propietario abonará al Mediador {{honorarios}}. Los honorarios se devengarán cuando se perfeccione la venta con un comprador presentado por el Mediador, aunque se formalice después de terminar este encargo.'],
      ['Exclusiva y duración', 'Condiciones de exclusiva y duración: {{exclusiva}}. Si el encargo es en exclusiva, el Propietario no encargará la venta a otros mediadores durante su vigencia.'],
      ['Protección del mediador', 'El Propietario no negociará directamente con los interesados presentados por el Mediador para eludir sus honorarios, durante el encargo y los 12 meses siguientes.'],
      ['Publicidad', 'El Propietario autoriza al Mediador a publicitar el bien, incluidas fotografías y descripción, en su web y redes, sin revelar datos que permitan identificarlo con exactitud salvo autorización.'],
    ] },
  { id: 'encargo-busqueda', title: 'Encargo de búsqueda (comprador o inquilino)', category: 'Confidencialidad e intermediación', summary: 'El cliente encarga a AUREON encontrarle un bien (villa, coche, inmueble) con honorarios por éxito.', law: 'Contrato de mediación o corretaje (arts. 1255 y 1709 y ss. del Código Civil, por analogía).',
    parties: [P('cliente', 'Cliente'), P('mediador', 'Mediador')],
    fields: [F('busqueda', 'Qué se busca (tipo, zona, características)', true), F('presupuesto', 'Presupuesto máximo (€)'), F('honorarios', 'Honorarios por éxito (% o importe)'), F('duracion', 'Duración del encargo'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Encargo', 'El Cliente encarga al Mediador la búsqueda de: {{busqueda}}, con un presupuesto máximo de {{presupuesto}} €.'],
      ['Honorarios por éxito', 'El Cliente abonará al Mediador {{honorarios}} si adquiere, alquila o contrata cualquiera de las opciones presentadas por el Mediador.'],
      ['No elusión', 'El Cliente no contratará directamente con los propietarios o vendedores presentados por el Mediador sin su participación durante el encargo y los 12 meses siguientes; en caso contrario, los honorarios serán igualmente exigibles.'],
      ['Duración', 'El encargo estará vigente durante {{duracion}}. Cualquiera de las partes podrá terminarlo con 15 días de preaviso, sin afectar a los honorarios por opciones ya presentadas.'],
    ] },
  { id: 'colaboracion-intermediarios', title: 'Acuerdo de colaboración y reparto de comisiones entre intermediarios', category: 'Confidencialidad e intermediación', summary: 'Dos agencias o intermediarios comparten una operación y se reparten los honorarios.', law: 'Arts. 1255 y 1091 del Código Civil.',
    parties: [P('agencia_a', 'Intermediario A'), P('agencia_b', 'Intermediario B')],
    fields: [F('operacion', 'Operación compartida (bien y cliente)', true), F('reparto', 'Reparto de honorarios (p. ej., 50 % / 50 %)'), F('cobro', 'Quién cobra al cliente y plazo para pagar a la otra parte'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Las partes colaboran en la siguiente operación: {{operacion}}.'],
      ['Reparto', 'Los honorarios efectivamente cobrados se repartirán así: {{reparto}}, después de impuestos indirectos que correspondan.'],
      ['Cobro y pago', 'Forma de cobro y liquidación: {{cobro}}. La parte que cobre transferirá a la otra su parte en el plazo pactado, con copia de la factura o justificante.'],
      ['Respeto de clientes', 'Ninguna de las partes contactará directamente con el cliente o el propietario aportado por la otra para operaciones futuras sin su consentimiento escrito, durante 24 meses.'],
      ['Confidencialidad', 'Los datos de clientes, propietarios y condiciones son confidenciales.'],
    ] },
  { id: 'carta-intenciones', title: 'Carta de intenciones (LOI)', category: 'Confidencialidad e intermediación', summary: 'Recoge el interés y las condiciones principales antes del contrato definitivo.', law: 'Arts. 1254, 1255 y 1262 del Código Civil (tratos preliminares).',
    parties: [P('oferente', 'Parte interesada'), P('destinatario', 'Destinatario')],
    fields: [F('operacion', 'Operación propuesta', true), F('condiciones', 'Condiciones principales (precio, plazos, requisitos)', true), F('validez', 'Validez de la carta'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Intención', 'La Parte interesada manifiesta su intención de llevar a cabo la siguiente operación: {{operacion}}.'],
      ['Condiciones principales', '{{condiciones}}'],
      ['Carácter no vinculante', 'Esta carta no obliga a celebrar el contrato definitivo, salvo en lo relativo a confidencialidad, exclusividad de negociación, si se pacta, y buena fe en los tratos.'],
      ['Validez', 'La presente carta tiene una validez de {{validez}}.'],
    ] },

  // ---------------- Inmobiliario ----------------
  { id: 'arras-penitenciales', title: 'Contrato de arras penitenciales (compraventa de inmueble)', category: 'Inmobiliario', summary: 'Reserva la compra de un inmueble con una señal; quien desista pierde o devuelve el doble.', law: 'Art. 1454 del Código Civil.',
    parties: [P('vendedor', 'Vendedor'), P('comprador', 'Comprador')],
    fields: [F('inmueble', 'Inmueble (dirección, referencia catastral, registro)', true), F('precio', 'Precio total de compraventa (€)'), F('arras', 'Importe entregado como arras (€)'), F('plazo_escritura', 'Fecha límite para otorgar la escritura'), F('notario', 'Notaría designada'), F('cargas', 'Cargas, arrendamientos o situación del inmueble', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Vendedor se compromete a vender y el Comprador a comprar el inmueble: {{inmueble}}, por el precio de {{precio}} €.'],
      ['Arras penitenciales', 'El Comprador entrega en este acto {{arras}} € en concepto de arras penitenciales del art. 1454 del Código Civil, a cuenta del precio. Si el Comprador desiste, perderá las arras; si desiste el Vendedor, las devolverá duplicadas.'],
      ['Escritura', 'La escritura pública de compraventa se otorgará ante {{notario}} como máximo el {{plazo_escritura}}, momento en que se abonará el resto del precio y se entregará la posesión.'],
      ['Estado y cargas', 'El inmueble se transmite como cuerpo cierto, en el estado actual que el Comprador conoce, con la siguiente situación de cargas y ocupación: {{cargas}}. El Vendedor responde de entregarlo libre de las cargas no declaradas.'],
      ['Gastos e impuestos', 'Los gastos e impuestos se abonarán conforme a la ley: plusvalía municipal a cargo del Vendedor y el impuesto de transmisión correspondiente a cargo del Comprador, salvo pacto distinto.'],
    ], notice: 'La compraventa de inmuebles se formaliza en escritura pública ante notario e inscripción registral. Este documento recoge únicamente las arras previas.' },
  { id: 'arras-confirmatorias', title: 'Contrato de arras confirmatorias (compraventa de inmueble)', category: 'Inmobiliario', summary: 'Señal que confirma el contrato: no permite desistir libremente; ante incumplimiento se exige cumplir o indemnizar.', law: 'Arts. 1124 y 1445 y ss. del Código Civil.',
    parties: [P('vendedor', 'Vendedor'), P('comprador', 'Comprador')],
    fields: [F('inmueble', 'Inmueble (dirección, referencia catastral, registro)', true), F('precio', 'Precio total (€)'), F('senal', 'Señal entregada a cuenta (€)'), F('plazo_escritura', 'Fecha límite para la escritura'), F('notario', 'Notaría designada'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Las partes celebran la compraventa del inmueble {{inmueble}} por {{precio}} €.'],
      ['Señal confirmatoria', 'El Comprador entrega {{senal}} € como señal y parte del precio, que confirma la perfección del contrato. No faculta para desistir: ante el incumplimiento, la parte cumplidora podrá exigir el cumplimiento o la resolución con indemnización (art. 1124 CC).'],
      ['Escritura', 'La escritura pública se otorgará ante {{notario}} antes del {{plazo_escritura}}, con pago del resto del precio y entrega de la posesión.'],
      ['Libre de cargas', 'El Vendedor garantiza que el inmueble se entregará libre de cargas, ocupantes y deudas de comunidad e IBI hasta la fecha de la escritura.'],
    ], notice: 'La compraventa de inmuebles se formaliza en escritura pública ante notario.' },
  { id: 'reserva-inmueble', title: 'Documento de reserva de inmueble con señal', category: 'Inmobiliario', summary: 'Reserva temporal de un inmueble mientras se prepara el contrato de arras.', law: 'Arts. 1255 y 1454 del Código Civil.',
    parties: [P('propietario', 'Propietario o mediador autorizado'), P('interesado', 'Interesado')],
    fields: [F('inmueble', 'Inmueble reservado', true), F('precio', 'Precio ofrecido (€)'), F('senal', 'Importe de la reserva (€)'), F('plazo', 'Plazo para firmar las arras'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Reserva', 'El Interesado reserva el inmueble {{inmueble}} por un precio de {{precio}} €, entregando {{senal}} € en concepto de reserva.'],
      ['Retirada de la oferta', 'Durante la reserva el inmueble se retira de la comercialización hasta {{plazo}}, fecha antes de la cual se firmará el contrato de arras.'],
      ['Efectos', 'Si se firman las arras, la reserva se imputará al precio. Si el Interesado no las firma por causa a él imputable, perderá la reserva; si es por causa del Propietario, se le devolverá duplicada.'],
    ] },
  { id: 'alquiler-vivienda-temporada', title: 'Arrendamiento de vivienda de temporada', category: 'Inmobiliario', summary: 'Alquiler por meses para un uso distinto de la vivienda habitual (trabajo, estudios, ocio).', law: 'Art. 3 de la Ley 29/1994 de Arrendamientos Urbanos (uso distinto de vivienda); Código Civil.',
    parties: [P('arrendador', 'Arrendador'), P('arrendatario', 'Arrendatario')],
    fields: [F('vivienda', 'Vivienda (dirección y descripción)', true), F('causa', 'Causa de la temporalidad (trabajo, estudios, etc.)'), F('fecha_inicio', 'Fecha de inicio'), F('fecha_fin', 'Fecha de fin'), F('renta', 'Renta mensual (€)'), F('fianza', 'Fianza (€)'), F('suministros', 'Suministros incluidos o a cargo del arrendatario'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto y temporalidad', 'El Arrendador arrienda la vivienda {{vivienda}} para uso temporal por la siguiente causa: {{causa}}. No constituye la vivienda habitual del Arrendatario.'],
      ['Duración', 'Desde el {{fecha_inicio}} hasta el {{fecha_fin}}, sin prórroga tácita. A su término el Arrendatario dejará la vivienda libre y en el estado recibido.'],
      ['Renta', 'Renta mensual de {{renta}} €, pagadera por anticipado en los cinco primeros días de cada mes mediante transferencia.'],
      ['Fianza', 'El Arrendatario entrega {{fianza}} € como fianza, que se devolverá al finalizar, descontados los daños o importes pendientes. El Arrendador la depositará en el organismo autonómico cuando proceda.'],
      ['Suministros', 'Régimen de suministros: {{suministros}}.'],
      ['Uso y conservación', 'El Arrendatario usará la vivienda con diligencia, no la subarrendará ni cederá y permitirá las visitas necesarias, previo aviso.'],
    ] },
  { id: 'alquiler-local', title: 'Arrendamiento de local comercial', category: 'Inmobiliario', summary: 'Alquiler de local o nave para actividad empresarial.', law: 'Arts. 3 y 29 y ss. de la Ley 29/1994 de Arrendamientos Urbanos.',
    parties: [P('arrendador', 'Arrendador'), P('arrendatario', 'Arrendatario')],
    fields: [F('local', 'Local (dirección, superficie)', true), F('actividad', 'Actividad que se desarrollará'), F('duracion', 'Duración'), F('renta', 'Renta mensual (€ + IVA)'), F('fianza', 'Fianza (dos mensualidades) y garantías adicionales'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Se arrienda el local {{local}} para destinarlo a: {{actividad}}. Las licencias de actividad serán por cuenta del Arrendatario.'],
      ['Duración', '{{duracion}}.'],
      ['Renta', '{{renta}} mensuales, actualizables anualmente según el índice que las partes acuerden, pagaderas por anticipado.'],
      ['Garantías', 'Fianza legal y garantías adicionales: {{fianza}}.'],
      ['Obras', 'El Arrendatario no realizará obras que modifiquen la configuración del local sin autorización escrita del Arrendador.'],
    ] },

  // ---------------- Alquiler de villas y estancias ----------------
  { id: 'alquiler-villa-vacacional', title: 'Contrato de alquiler vacacional de villa', category: 'Alquiler de villas y estancias', summary: 'Estancia de corta duración en villa con servicios, depósito y normas de la casa.', law: 'Art. 3 LAU (uso distinto de vivienda) y normativa autonómica de viviendas de uso turístico; Código Civil.',
    parties: [P('propietario', 'Propietario o gestor autorizado'), P('huesped', 'Huésped titular')],
    fields: [F('villa', 'Villa (nombre, ubicación y referencia)', true), F('registro_turistico', 'Número de registro turístico (si aplica)'), F('entrada', 'Fecha y hora de entrada'), F('salida', 'Fecha y hora de salida'), F('huespedes', 'Número máximo de huéspedes'), F('precio', 'Precio total de la estancia (€)'), F('pagos', 'Calendario de pagos (reserva y resto)'), F('deposito', 'Depósito de seguridad (€)'), F('servicios', 'Servicios incluidos (limpieza, chef, traslados...)', true), F('cancelacion', 'Política de cancelación', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Propietario cede al Huésped el uso temporal de la villa {{villa}} (registro: {{registro_turistico}}) para estancia vacacional, sin que constituya vivienda habitual.'],
      ['Estancia y aforo', 'Entrada: {{entrada}}. Salida: {{salida}}. Aforo máximo: {{huespedes}} personas, cuya identidad se comunicará antes de la llegada para el registro de viajeros legalmente obligatorio.'],
      ['Precio y pagos', 'Precio total: {{precio}} €. Calendario de pagos: {{pagos}}.'],
      ['Depósito', 'El Huésped entrega {{deposito}} € como depósito de seguridad, que se devolverá en el plazo de 14 días tras la salida, descontados los daños, faltas o servicios extra no abonados.'],
      ['Servicios', 'Servicios incluidos: {{servicios}}. Los servicios adicionales se presupuestarán aparte.'],
      ['Cancelación', '{{cancelacion}}'],
      ['Normas de la casa', 'Quedan prohibidas las fiestas y eventos no autorizados, superar el aforo y las conductas que perturben a los vecinos. Su incumplimiento podrá dar lugar a la finalización de la estancia sin reembolso y a la retención del depósito.'],
      ['Responsabilidad', 'El Huésped responde de los daños causados por él o sus acompañantes. El uso de piscina, gimnasio y demás instalaciones se hará bajo la responsabilidad de los usuarios, con especial vigilancia de los menores.'],
    ] },
  { id: 'reserva-villa', title: 'Confirmación de reserva de villa con señal', category: 'Alquiler de villas y estancias', summary: 'Bloquea las fechas de una villa a cambio de una señal antes del contrato completo.', law: 'Arts. 1255 y 1454 del Código Civil.',
    parties: [P('gestor', 'Propietario o gestor'), P('cliente', 'Cliente')],
    fields: [F('villa', 'Villa y referencia', true), F('fechas', 'Fechas reservadas'), F('precio', 'Precio total (€)'), F('senal', 'Señal entregada (€)'), F('resto', 'Fecha de pago del resto'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Reserva', 'Se reserva la villa {{villa}} para las fechas {{fechas}} por un precio total de {{precio}} €.'],
      ['Señal', 'El Cliente abona {{senal}} € como señal, que se descontará del precio. El resto se abonará como máximo el {{resto}}.'],
      ['Desistimiento', 'Si el Cliente desiste, perderá la señal. Si las fechas no pudieran cumplirse por causa del gestor, se devolverá la señal duplicada o se ofrecerá una alternativa de categoría equivalente, a elección del Cliente.'],
    ] },
  { id: 'gestion-villa', title: 'Contrato de gestión y comercialización de villa', category: 'Alquiler de villas y estancias', summary: 'El propietario encarga a AUREON comercializar su villa para alquileres a cambio de comisión.', law: 'Arts. 1255 y 1709 y ss. del Código Civil; normativa autonómica de viviendas turísticas.',
    parties: [P('propietario', 'Propietario'), P('gestor', 'Gestor')],
    fields: [F('villa', 'Villa (ubicación y características)', true), F('comision', 'Comisión del gestor sobre cada reserva'), F('servicios', 'Servicios del gestor (marketing, check-in, limpieza...)', true), F('duracion', 'Duración y preaviso'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Encargo', 'El Propietario encarga al Gestor la comercialización de la villa {{villa}} para estancias de corta duración.'],
      ['Licencias', 'El Propietario garantiza que dispone de las licencias, el registro turístico y el seguro de responsabilidad civil exigibles.'],
      ['Servicios', 'El Gestor prestará: {{servicios}}.'],
      ['Comisión', 'El Gestor percibirá {{comision}} sobre el importe neto de cada reserva cobrada.'],
      ['Liquidaciones', 'El Gestor liquidará mensualmente al Propietario las cantidades cobradas, descontada su comisión, con detalle de reservas.'],
      ['Duración', '{{duracion}}. Las reservas confirmadas antes de la terminación se respetarán.'],
    ] },

  // ---------------- Vehículos ----------------
  { id: 'compraventa-vehiculo', title: 'Compraventa de vehículo usado entre particulares', category: 'Vehículos', summary: 'Venta de coche usado con datos del vehículo, kilometraje, estado y cambio de titularidad.', law: 'Arts. 1445 y ss. y 1484 y ss. del Código Civil; Reglamento General de Vehículos (transferencia ante la DGT).',
    parties: [P('vendedor', 'Vendedor'), P('comprador', 'Comprador')],
    fields: [F('vehiculo', 'Marca, modelo y versión'), F('matricula', 'Matrícula'), F('bastidor', 'Número de bastidor (VIN)'), F('kilometros', 'Kilómetros'), F('precio', 'Precio (€)'), F('pago', 'Forma de pago'), F('estado', 'Estado, daños conocidos y extras', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Vendedor vende al Comprador el vehículo {{vehiculo}}, matrícula {{matricula}}, bastidor {{bastidor}}, con {{kilometros}} km, por {{precio}} €, que se abonan mediante {{pago}}.'],
      ['Titularidad', 'El Vendedor declara ser titular del vehículo y que está libre de cargas, embargos, reservas de dominio y multas pendientes, y entrega el permiso de circulación, la ficha técnica con la ITV vigente y las llaves.'],
      ['Estado', 'El Comprador conoce el estado del vehículo, que ha podido revisar: {{estado}}. El Vendedor responde de los vicios ocultos conforme a los arts. 1484 y ss. del Código Civil.'],
      ['Transferencia', 'El Comprador realizará el cambio de titularidad ante la DGT y abonará el impuesto de transmisiones en los plazos legales. Desde la fecha y hora de firma, el Comprador asume la responsabilidad por el uso del vehículo.'],
    ] },
  { id: 'alquiler-vehiculo', title: 'Alquiler de vehículo de lujo sin conductor', category: 'Vehículos', summary: 'Alquiler de superdeportivo por días con fianza, kilometraje, seguro y franquicia.', law: 'Arts. 1542 y ss. del Código Civil (arrendamiento de cosas).',
    parties: [P('arrendador', 'Arrendador'), P('conductor', 'Arrendatario y conductor principal')],
    fields: [F('vehiculo', 'Vehículo (modelo y matrícula)'), F('periodo', 'Periodo de alquiler (fechas y horas)'), F('precio', 'Precio total (€)'), F('fianza', 'Fianza (€)'), F('kilometraje', 'Kilómetros incluidos y precio por km adicional'), F('seguro', 'Seguro y franquicia'), F('carne', 'Carné de conducir del conductor y antigüedad'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Se alquila el vehículo {{vehiculo}} durante {{periodo}} por {{precio}} €.'],
      ['Conductor', 'Solo podrá conducir el Arrendatario, titular del permiso {{carne}}, salvo que se autoricen conductores adicionales por escrito.'],
      ['Fianza', 'Se constituye una fianza de {{fianza}} €, que se devolverá tras la revisión del vehículo, descontados daños, multas, combustible o kilómetros adicionales.'],
      ['Kilometraje', '{{kilometraje}}.'],
      ['Seguro', 'Cobertura y franquicia: {{seguro}}. Los daños por conducción temeraria, bajo los efectos del alcohol o las drogas, o en circuitos, serán íntegramente a cargo del Arrendatario.'],
      ['Uso', 'Queda prohibido subarrendar el vehículo, usarlo en competiciones o exhibiciones y salir del territorio autorizado. Las multas e infracciones del periodo serán a cargo del Arrendatario, que será identificado como conductor ante la autoridad.'],
    ] },
  { id: 'venta-deposito-vehiculo', title: 'Contrato de depósito para venta de vehículo', category: 'Vehículos', summary: 'El propietario deja el coche en depósito para que AUREON lo venda a cambio de comisión.', law: 'Arts. 1758 y ss. (depósito) y 1709 y ss. (mandato) del Código Civil.',
    parties: [P('propietario', 'Propietario'), P('depositario', 'Depositario y vendedor autorizado')],
    fields: [F('vehiculo', 'Vehículo (modelo, matrícula, bastidor, km)', true), F('precio_minimo', 'Precio mínimo de venta para el propietario (€)'), F('comision', 'Comisión o sobreprecio del depositario'), F('seguro', 'Seguro del vehículo durante el depósito'), F('duracion', 'Duración del depósito'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Depósito y mandato', 'El Propietario entrega en depósito el vehículo {{vehiculo}} y faculta al Depositario para venderlo por un precio que garantice al Propietario {{precio_minimo}} €.'],
      ['Comisión', 'El Depositario percibirá {{comision}}.'],
      ['Custodia', 'El Depositario custodiará el vehículo con la diligencia debida. Seguro durante el depósito: {{seguro}}. Las pruebas de conducción se harán con el Depositario presente.'],
      ['Duración', '{{duracion}}. Finalizado el plazo sin venta, el Propietario retirará el vehículo.'],
    ] },
  { id: 'reserva-vehiculo', title: 'Reserva de vehículo con señal', category: 'Vehículos', summary: 'Bloquea un coche para un comprador con una señal hasta la firma de la compraventa.', law: 'Arts. 1255 y 1454 del Código Civil.',
    parties: [P('vendedor', 'Vendedor'), P('comprador', 'Comprador')],
    fields: [F('vehiculo', 'Vehículo (modelo, matrícula o bastidor)'), F('precio', 'Precio total (€)'), F('senal', 'Señal (€)'), F('plazo', 'Fecha límite para completar la compra'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Reserva', 'El Comprador reserva el vehículo {{vehiculo}} por {{precio}} € y entrega {{senal}} € como señal a cuenta del precio.'],
      ['Plazo', 'La compraventa se completará antes del {{plazo}}. El Vendedor no ofrecerá el vehículo a terceros durante la reserva.'],
      ['Desistimiento', 'Si desiste el Comprador perderá la señal; si desiste el Vendedor la devolverá duplicada.'],
    ] },

  // ---------------- Eventos y ocio ----------------
  { id: 'contratacion-artista', title: 'Contratación de DJ o artista para evento', category: 'Eventos y ocio', summary: 'Actuación de DJ o artista con caché, horario, rider técnico y cancelación.', law: 'Arts. 1544 y 1588 y ss. del Código Civil (arrendamiento de servicios u obra).',
    parties: [P('promotor', 'Contratante o promotor'), P('artista', 'Artista o su representante')],
    fields: [F('evento', 'Evento, fecha y lugar', true), F('horario', 'Horario de la actuación'), F('cache', 'Caché (€ + IVA) y forma de pago'), F('rider', 'Rider técnico y hospitality', true), F('cancelacion', 'Condiciones de cancelación', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Artista actuará en el evento {{evento}} en el horario {{horario}}.'],
      ['Caché', '{{cache}}.'],
      ['Necesidades técnicas', 'El Contratante aportará: {{rider}}.'],
      ['Imagen y grabación', 'El Contratante podrá usar el nombre y la imagen del Artista para promocionar el evento. Las grabaciones con fines comerciales requieren autorización expresa.'],
      ['Cancelación', '{{cancelacion}}. Las cancelaciones por fuerza mayor debidamente acreditadas no generarán indemnización y se procurará reprogramar la actuación.'],
    ] },
  { id: 'alquiler-sala-eventos', title: 'Alquiler de sala o espacio para eventos', category: 'Eventos y ocio', summary: 'Uso de sala o espacio en una fecha, con aforo, servicios, fianza y responsabilidades.', law: 'Arts. 1542 y ss. del Código Civil; normativa de espectáculos públicos aplicable.',
    parties: [P('titular', 'Titular del espacio'), P('organizador', 'Organizador')],
    fields: [F('espacio', 'Espacio y dirección'), F('fecha_evento', 'Fecha y horario del evento'), F('aforo', 'Aforo máximo'), F('precio', 'Precio (€) y pagos'), F('fianza', 'Fianza (€)'), F('servicios', 'Servicios incluidos (barra, seguridad, sonido...)', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Se cede el uso del espacio {{espacio}} el {{fecha_evento}} para el evento del Organizador, con un aforo máximo de {{aforo}} personas.'],
      ['Precio', '{{precio}}.'],
      ['Servicios', '{{servicios}}.'],
      ['Fianza y daños', 'Fianza de {{fianza}} €, que responderá de daños y limpieza extraordinaria.'],
      ['Responsabilidad', 'El Organizador responderá del cumplimiento del aforo, del horario y de la normativa de ruido y seguridad, y dispondrá del seguro de responsabilidad civil que exija la normativa.'],
    ] },
  { id: 'alquiler-equipos', title: 'Alquiler de equipos para eventos', category: 'Eventos y ocio', summary: 'Sonido, iluminación o mobiliario por días, con fianza y responsabilidad por daños.', law: 'Arts. 1542 y ss. del Código Civil.',
    parties: [P('arrendador', 'Arrendador'), P('cliente', 'Cliente')],
    fields: [F('equipos', 'Equipos alquilados (listado)', true), F('periodo', 'Periodo de alquiler'), F('precio', 'Precio (€)'), F('fianza', 'Fianza (€)'), F('entrega', 'Entrega, montaje y recogida'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Se alquilan los siguientes equipos: {{equipos}} durante {{periodo}} por {{precio}} €.'],
      ['Entrega', '{{entrega}}. El Cliente revisará los equipos a la entrega; si no comunica incidencias, se presumirá que los recibe en buen estado.'],
      ['Fianza', '{{fianza}} €, devueltos tras comprobar los equipos.'],
      ['Daños', 'El Cliente responde de la pérdida, el robo o los daños causados por un uso indebido, al precio de reposición o reparación.'],
    ] },

  // ---------------- Lujo y joyería ----------------
  { id: 'compraventa-joyas', title: 'Compraventa de reloj o joya de lujo', category: 'Lujo y joyería', summary: 'Venta de pieza con referencia, número de serie, certificados y garantía de autenticidad.', law: 'Arts. 1445 y ss. y 1484 y ss. del Código Civil.',
    parties: [P('vendedor', 'Vendedor'), P('comprador', 'Comprador')],
    fields: [F('pieza', 'Pieza (marca, modelo, referencia)'), F('serie', 'Número de serie'), F('documentacion', 'Caja, papeles y certificados que se entregan', true), F('precio', 'Precio (€)'), F('pago', 'Forma de pago'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Vendedor vende la pieza {{pieza}}, número de serie {{serie}}, por {{precio}} €, que se abonan mediante {{pago}}.'],
      ['Autenticidad y origen', 'El Vendedor garantiza que la pieza es auténtica, de procedencia lícita y libre de cargas, y entrega: {{documentacion}}.'],
      ['Comprobación', 'El Comprador podrá verificar la pieza en un servicio técnico o tasador independiente en un plazo de 7 días. Si se demuestra que no es auténtica, el Vendedor devolverá íntegramente el precio.'],
      ['Prevención del blanqueo', 'Las partes se identifican conforme a la normativa de prevención del blanqueo de capitales y respetan los límites legales de pago en efectivo.'],
    ] },

  // ---------------- Servicios y colaboración ----------------
  { id: 'prestacion-servicios', title: 'Contrato de prestación de servicios profesionales', category: 'Servicios y colaboración', summary: 'Servicios por proyecto o por horas con honorarios, plazos y confidencialidad.', law: 'Art. 1544 del Código Civil (arrendamiento de servicios).',
    parties: [P('cliente', 'Cliente'), P('profesional', 'Profesional')],
    fields: [F('servicios', 'Servicios a prestar', true), F('honorarios', 'Honorarios (€ + IVA) y forma de pago'), F('plazo', 'Plazo o duración'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Profesional prestará los siguientes servicios: {{servicios}}, con autonomía y medios propios, sin relación laboral.'],
      ['Honorarios', '{{honorarios}}.'],
      ['Plazo', '{{plazo}}.'],
      ['Confidencialidad', 'El Profesional guardará secreto sobre la información del Cliente durante el contrato y después de él.'],
      ['Terminación', 'Cualquiera de las partes podrá terminar el contrato con 15 días de preaviso escrito, abonándose los trabajos realizados hasta esa fecha.'],
    ] },
  { id: 'agente-comercial', title: 'Contrato de agencia comercial', category: 'Servicios y colaboración', summary: 'Un agente promueve las operaciones de AUREON a cambio de comisión.', law: 'Ley 12/1992, de 27 de mayo, sobre Contrato de Agencia.',
    parties: [P('empresario', 'Empresario'), P('agente', 'Agente')],
    fields: [F('ambito', 'Productos o servicios y zona geográfica', true), F('comision', 'Comisión por operación'), F('exclusiva', 'Exclusiva (sí/no)'), F('duracion', 'Duración'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Agente promoverá, como intermediario independiente, operaciones por cuenta del Empresario en el siguiente ámbito: {{ambito}}. Exclusiva: {{exclusiva}}.'],
      ['Independencia', 'El Agente organiza su actividad con criterios propios y asume sus gastos, sin relación laboral (art. 2 de la Ley 12/1992).'],
      ['Comisión', '{{comision}}, devengada cuando la operación se haya pagado efectivamente por el cliente (arts. 12 y 14 de la Ley 12/1992).'],
      ['Duración y preaviso', '{{duracion}}. El contrato de duración indefinida podrá extinguirse con el preaviso del art. 25 de la Ley 12/1992.'],
      ['Indemnización por clientela', 'A la extinción, el Agente tendrá derecho a la indemnización por clientela en los términos del art. 28 de la Ley 12/1992, cuando proceda.'],
    ] },
  { id: 'afiliacion-marketing', title: 'Acuerdo de afiliación y marketing', category: 'Servicios y colaboración', summary: 'Un afiliado o influencer promociona AUREON con enlaces y cobra comisión por venta.', law: 'Art. 1255 del Código Civil; Ley 34/1988 General de Publicidad; LSSI.',
    parties: [P('anunciante', 'Anunciante'), P('afiliado', 'Afiliado')],
    fields: [F('promocion', 'Qué se promociona y en qué canales', true), F('comision', 'Comisión por venta o lead'), F('pago', 'Periodicidad y mínimo de pago'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Afiliado promocionará: {{promocion}}, usando el enlace o código asignado.'],
      ['Comisión', '{{comision}}, liquidada {{pago}}.'],
      ['Transparencia', 'El Afiliado identificará claramente el contenido publicitario (#publi o equivalente) y no hará afirmaciones falsas sobre precios, disponibilidad o resultados.'],
      ['Marca', 'El uso de la marca AUREON se limita a la promoción pactada y cesa al terminar el acuerdo.'],
    ] },
  { id: 'consultoria-mentoria', title: 'Contrato de consultoría o mentoría', category: 'Servicios y colaboración', summary: 'Sesiones de asesoramiento o formación con calendario, precio y política de cancelación.', law: 'Art. 1544 del Código Civil.',
    parties: [P('mentor', 'Consultor o mentor'), P('cliente', 'Cliente')],
    fields: [F('programa', 'Programa y número de sesiones', true), F('precio', 'Precio (€) y forma de pago'), F('cancelacion', 'Cambios y cancelación de sesiones'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Mentor impartirá el siguiente programa: {{programa}}.'],
      ['Precio', '{{precio}}.'],
      ['Sesiones', '{{cancelacion}}.'],
      ['Sin garantía de resultados', 'El Mentor se obliga a prestar el servicio con diligencia profesional, no a obtener un resultado económico concreto. El contenido no constituye asesoramiento financiero personalizado.'],
    ] },
  { id: 'desarrollo-web', title: 'Contrato de diseño web o desarrollo de software', category: 'Servicios y colaboración', summary: 'Encargo de web o app con entregables, plazos, pagos por hitos y propiedad del código.', law: 'Arts. 1544 y 1588 del Código Civil; Real Decreto Legislativo 1/1996 (Propiedad Intelectual).',
    parties: [P('cliente', 'Cliente'), P('desarrollador', 'Desarrollador')],
    fields: [F('proyecto', 'Proyecto y entregables', true), F('hitos', 'Hitos, plazos y pagos', true), F('propiedad', 'Propiedad del código (cesión total o licencia)'), F('soporte', 'Garantía y soporte posterior'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Desarrollador realizará: {{proyecto}}.'],
      ['Hitos y pagos', '{{hitos}}. Cada entrega se considerará aceptada si el Cliente no comunica defectos en 10 días.'],
      ['Propiedad intelectual', '{{propiedad}}. Los componentes de código abierto mantienen sus licencias de origen.'],
      ['Garantía', '{{soporte}}.'],
    ] },

  // ---------------- Propiedad intelectual e imagen ----------------
  { id: 'cesion-imagen', title: 'Autorización de uso de derechos de imagen', category: 'Propiedad intelectual e imagen', summary: 'Una persona autoriza a usar su imagen o su voz en fotos, vídeos y redes.', law: 'Ley Orgánica 1/1982 de protección del derecho al honor, a la intimidad y a la propia imagen; RGPD.',
    parties: [P('cedente', 'Persona que autoriza'), P('cesionario', 'Cesionario')],
    fields: [F('material', 'Material (sesión, vídeo, evento)', true), F('usos', 'Usos y canales autorizados', true), F('duracion', 'Duración y territorio'), F('contraprestacion', 'Contraprestación (si la hay)'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Autorización', 'El Cedente autoriza al Cesionario a captar y utilizar su imagen o su voz en: {{material}}.'],
      ['Usos', 'Usos autorizados: {{usos}}. Duración y territorio: {{duracion}}. Contraprestación: {{contraprestacion}}.'],
      ['Revocación', 'El Cedente puede revocar el consentimiento en cualquier momento conforme al art. 2.3 de la LO 1/1982, indemnizando, en su caso, los daños y perjuicios causados, incluidas las expectativas justificadas.'],
    ] },
  { id: 'cesion-contenidos', title: 'Cesión de derechos sobre fotografías y contenidos', category: 'Propiedad intelectual e imagen', summary: 'Un fotógrafo o creador cede derechos de explotación sobre fotos o vídeos.', law: 'Real Decreto Legislativo 1/1996, Ley de Propiedad Intelectual (arts. 43 y ss.).',
    parties: [P('autor', 'Autor'), P('cesionario', 'Cesionario')],
    fields: [F('obras', 'Obras (fotografías, vídeos, textos)', true), F('derechos', 'Derechos cedidos (reproducción, distribución, comunicación pública, transformación)'), F('ambito', 'Ámbito, duración y exclusiva'), F('precio', 'Precio (€)'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Autor cede al Cesionario los derechos de {{derechos}} sobre: {{obras}}.'],
      ['Ámbito', '{{ambito}}. Se reconoce el derecho moral de autoría del Autor.'],
      ['Precio', '{{precio}} €.'],
      ['Garantía', 'El Autor garantiza que es titular de los derechos y que dispone de las autorizaciones de las personas que aparecen en las obras.'],
    ] },

  // ---------------- Financiero ----------------
  { id: 'prestamo-particulares', title: 'Contrato de préstamo entre particulares', category: 'Financiero', summary: 'Préstamo de dinero con importe, interés, calendario de devolución y obligaciones fiscales.', law: 'Arts. 1740 y 1753 y ss. del Código Civil; Ley del Impuesto sobre Transmisiones Patrimoniales (modelo 600).',
    parties: [P('prestamista', 'Prestamista'), P('prestatario', 'Prestatario')],
    fields: [F('importe', 'Importe prestado (€)'), F('interes', 'Interés anual (0 % si es gratuito)'), F('devolucion', 'Calendario de devolución', true), F('entrega', 'Forma de entrega del dinero'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Préstamo', 'El Prestamista presta al Prestatario {{importe}} €, que se entregan mediante {{entrega}}.'],
      ['Interés', 'El préstamo devenga un interés anual del {{interes}}.'],
      ['Devolución', '{{devolucion}}. El retraso devengará el interés legal del dinero incrementado en dos puntos.'],
      ['Vencimiento anticipado', 'El impago de dos plazos permitirá reclamar la totalidad del importe pendiente.'],
      ['Fiscalidad', 'El Prestatario presentará la autoliquidación del Impuesto sobre Transmisiones Patrimoniales (exenta) en el plazo legal.'],
    ] },
  { id: 'reconocimiento-deuda', title: 'Reconocimiento de deuda y plan de pagos', category: 'Financiero', summary: 'El deudor reconoce lo que debe y se compromete a un calendario de pagos.', law: 'Arts. 1089, 1101 y 1108 del Código Civil.',
    parties: [P('acreedor', 'Acreedor'), P('deudor', 'Deudor')],
    fields: [F('importe', 'Importe adeudado (€)'), F('origen', 'Origen de la deuda', true), F('plan', 'Plan de pagos', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Reconocimiento', 'El Deudor reconoce deber al Acreedor {{importe}} €, por el siguiente concepto: {{origen}}.'],
      ['Plan de pagos', '{{plan}}.'],
      ['Incumplimiento', 'El impago de cualquier plazo hará exigible la totalidad de la deuda pendiente más los intereses legales.'],
    ] },

  // ---------------- Sociedades y acuerdos ----------------
  { id: 'joint-venture', title: 'Acuerdo de colaboración empresarial (joint venture)', category: 'Sociedades y acuerdos', summary: 'Dos partes colaboran en un proyecto, con aportaciones, gestión y reparto de beneficios.', law: 'Arts. 1255 y 1665 y ss. del Código Civil.',
    parties: [P('socio_a', 'Primera parte'), P('socio_b', 'Segunda parte')],
    fields: [F('proyecto', 'Proyecto común', true), F('aportaciones', 'Aportaciones de cada parte', true), F('reparto', 'Reparto de beneficios y pérdidas'), F('gestion', 'Gestión, decisiones y salida', true), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'Las partes colaboran en el siguiente proyecto: {{proyecto}}.'],
      ['Aportaciones', '{{aportaciones}}.'],
      ['Resultados', '{{reparto}}.'],
      ['Gobierno', '{{gestion}}.'],
      ['No competencia', 'Durante la colaboración, ninguna parte desarrollará por su cuenta un proyecto idéntico en competencia con el común.'],
    ] },

  // ---------------- Protección de datos ----------------
  { id: 'encargado-tratamiento', title: 'Contrato de encargado del tratamiento (RGPD art. 28)', category: 'Protección de datos', summary: 'Obligatorio cuando un proveedor trata datos personales de tus clientes por tu cuenta.', law: 'Art. 28 del Reglamento (UE) 2016/679 (RGPD); Ley Orgánica 3/2018 (LOPDGDD).',
    parties: [P('responsable', 'Responsable del tratamiento'), P('encargado', 'Encargado del tratamiento')],
    fields: [F('servicio', 'Servicio prestado', true), F('datos', 'Tipos de datos e interesados', true), F('duracion', 'Duración'), F('ciudad', 'Ciudad de firma y fuero')],
    clauses: [
      ['Objeto', 'El Encargado tratará datos personales por cuenta del Responsable para: {{servicio}}. Datos e interesados: {{datos}}.'],
      ['Instrucciones', 'El Encargado tratará los datos únicamente siguiendo instrucciones documentadas del Responsable y no los usará para fines propios.'],
      ['Confidencialidad y seguridad', 'Garantizará la confidencialidad de su personal y aplicará las medidas del art. 32 RGPD.'],
      ['Subencargados', 'No recurrirá a otro encargado sin autorización previa y por escrito del Responsable.'],
      ['Asistencia', 'Asistirá al Responsable en la atención de derechos, las brechas de seguridad, que notificará sin dilación indebida, y las evaluaciones de impacto.'],
      ['Fin del encargo', 'Al terminar, devolverá o suprimirá los datos, según elija el Responsable. Duración: {{duracion}}.'],
    ] },
]

/** Clauses appended to every contract. */
export const COMMON_CLAUSES: Array<[string, string]> = [
  ['Protección de datos', 'Cada parte tratará los datos personales de la otra con la única finalidad de gestionar este contrato, con base en su ejecución (art. 6.1.b RGPD), y los conservará durante los plazos legales. Pueden ejercerse los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad ante la otra parte y reclamar ante la Agencia Española de Protección de Datos.'],
  ['Notificaciones', 'Las comunicaciones se dirigirán a los domicilios y contactos indicados en el cuadro de datos, incluidos el correo electrónico y WhatsApp, que las partes aceptan como medios válidos.'],
  ['Integridad', 'Este contrato recoge la totalidad de lo pactado sobre su objeto y sustituye cualquier acuerdo anterior. La nulidad de una cláusula no afectará al resto.'],
  ['Firma', 'Las partes podrán firmar en papel o mediante firma electrónica conforme al Reglamento (UE) 910/2014 (eIDAS), con plena validez. Cada parte conservará un ejemplar.'],
  ['Ley y jurisdicción', 'Este contrato se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan legalmente y, cuando no exista fuero imperativo, a los de {{ciudad}}.'],
]

export const DISCLAIMER = 'Modelo orientativo elaborado por AUREON a partir de la normativa española de referencia. No constituye asesoramiento jurídico; revíselo con un abogado antes de usarlo en operaciones de importe relevante.'

export const partyFields = (p: Party): Field[] => [F(`${p.role}_nombre`, `${p.label}: nombre o razón social`), F(`${p.role}_doc`, `${p.label}: DNI, NIE o CIF`), F(`${p.role}_domicilio`, `${p.label}: domicilio`), F(`${p.role}_contacto`, `${p.label}: email y teléfono`)]
export const allFields = (t: Template): Field[] => [F('fecha', 'Fecha de firma'), ...t.parties.flatMap(partyFields), ...t.fields]
export const getTemplate = (id: string) => TEMPLATES.find(t => t.id === id)

/** Best template for a free-text request ("contrato de no elusión", "nda", "alquiler villa"...). */
export function findTemplate(query: string): Template | undefined {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const q = norm(query)
  const alias: Array<[RegExp, string]> = [[/no elusi|ncnda|saltar|circunv|me salte/, 'ncnda'], [/nda mutuo|confidencialidad mutu|reciproc/, 'nda-mutuo'], [/nda|confidencial/, 'nda-unilateral'], [/arras confirm/, 'arras-confirmatorias'], [/arras/, 'arras-penitenciales'], [/villa.*(vacacion|alquiler|estancia)|alquiler.*villa/, 'alquiler-villa-vacacional'], [/reserva.*villa/, 'reserva-villa'], [/(compra|venta).*(coche|vehiculo)|coche usado/, 'compraventa-vehiculo'], [/alquiler.*(coche|vehiculo|superdeportivo)/, 'alquiler-vehiculo'], [/\bdj\b|artista/, 'contratacion-artista'], [/reloj|joya/, 'compraventa-joyas'], [/prestamo/, 'prestamo-particulares'], [/deuda/, 'reconocimiento-deuda'], [/encargado|rgpd/, 'encargado-tratamiento'], [/comision.*(intermediar|agencia)|reparto/, 'colaboracion-intermediarios']]
  for (const [re, id] of alias) if (re.test(q)) return getTemplate(id)
  const words = q.split(/\W+/).filter(w => w.length > 3)
  let best: Template | undefined, score = 0
  for (const t of TEMPLATES) {
    const hay = norm(`${t.title} ${t.summary} ${t.category}`)
    const s = words.filter(w => hay.includes(w)).length
    if (s > score) { score = s; best = t }
  }
  return best
}
