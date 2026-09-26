// Tiradas, guías, productos y textos de la web.

// campo: qué parte del significado se lee en esa posición (derecho | amor | trabajo | consejo)
const TIRADAS = [
  { id: "carta-del-dia", nombre: "Carta del día", cat: "diarias", n: 1, diaria: true,
    desc: "Una carta para acompañarte hoy. Cambia cada día y es la misma todo el día.",
    pos: [{ t: "Tu carta de hoy", campo: "derecho" }] },
  { id: "si-o-no", nombre: "Tarot sí o no", cat: "generales", n: 1, sino: true,
    desc: "Piensa en una pregunta que se conteste con sí o no y elige una carta.",
    pos: [{ t: "La respuesta", campo: "derecho" }] },
  { id: "pasado-presente-futuro", nombre: "Pasado, presente y futuro", cat: "generales", n: 3,
    desc: "La más rápida y clásica: de dónde vienes, dónde estás y hacia dónde vas.",
    pos: [{ t: "Pasado", campo: "derecho" }, { t: "Presente", campo: "derecho" }, { t: "Futuro", campo: "derecho" }] },
  { id: "cruz-simple", nombre: "La cruz simple", cat: "generales", n: 5,
    desc: "Para un problema concreto: qué pasa, qué lo frena y cómo puede acabar.",
    pos: [{ t: "La situación", campo: "derecho" }, { t: "Lo que te frena", campo: "derecho" }, { t: "Lo que te ayuda", campo: "derecho" },
          { t: "Lo que viene", campo: "derecho" }, { t: "El desenlace", campo: "consejo" }] },
  { id: "mapa-de-tu-vida", nombre: "El mapa de tu vida", cat: "generales", n: 7,
    desc: "Una foto de todas las áreas a la vez: tú, amor, trabajo, dinero, salud, entorno y consejo.",
    pos: [{ t: "Tú ahora", campo: "derecho" }, { t: "Amor", campo: "amor" }, { t: "Trabajo", campo: "trabajo" }, { t: "Dinero", campo: "trabajo" },
          { t: "Salud y energía", campo: "derecho" }, { t: "Familia y amigos", campo: "amor" }, { t: "Consejo", campo: "consejo" }] },
  { id: "cruz-celta", nombre: "La cruz celta", cat: "generales", n: 10, cruz: true,
    desc: "La tirada más completa, para un tema importante que quieres ver a fondo.",
    pos: [{ t: "1 · La situación", campo: "derecho" }, { t: "2 · El cruce (lo que se opone)", campo: "derecho" }, { t: "3 · La raíz", campo: "derecho" },
          { t: "4 · El pasado reciente", campo: "derecho" }, { t: "5 · Lo que buscas", campo: "derecho" }, { t: "6 · El futuro cercano", campo: "derecho" },
          { t: "7 · Tú ante esto", campo: "consejo" }, { t: "8 · Tu entorno", campo: "derecho" }, { t: "9 · Esperanzas y miedos", campo: "derecho" },
          { t: "10 · El desenlace", campo: "derecho" }] },
  { id: "encontrare-pareja", nombre: "¿Voy a encontrar pareja?", cat: "amor", n: 5,
    desc: "Si te preguntas cuándo llegará el amor y qué puedes hacer tú para abrirle la puerta.",
    pos: [{ t: "Cómo estás tú en el amor", campo: "amor" }, { t: "Lo que te bloquea", campo: "amor" }, { t: "Lo que atraes", campo: "amor" },
          { t: "Lo que se acerca", campo: "amor" }, { t: "Consejo", campo: "consejo" }] },
  { id: "que-siente", nombre: "¿Qué siente por mí?", cat: "amor", n: 3,
    desc: "Tres cartas para mirar un vínculo: lo que siente, lo que no dice y hacia dónde va.",
    pos: [{ t: "Lo que siente", campo: "amor" }, { t: "Lo que no dice", campo: "amor" }, { t: "Hacia dónde va", campo: "amor" }] },
  { id: "problemas-amorosos", nombre: "Problemas en la pareja", cat: "amor", n: 6,
    desc: "Para cuando algo no va bien en la relación y quieres entender por qué.",
    pos: [{ t: "Tú en la relación", campo: "amor" }, { t: "La otra persona", campo: "amor" }, { t: "El problema de fondo", campo: "derecho" },
          { t: "Lo que os une", campo: "amor" }, { t: "Lo que puede pasar", campo: "amor" }, { t: "Consejo", campo: "consejo" }] },
  { id: "encontrare-trabajo", nombre: "¿Encontraré trabajo pronto?", cat: "trabajo", n: 5,
    desc: "Para quien busca empleo: dónde estás, qué te frena y qué oportunidades se abren.",
    pos: [{ t: "Tu situación laboral", campo: "trabajo" }, { t: "Lo que te frena", campo: "trabajo" }, { t: "Tus puntos fuertes", campo: "trabajo" },
          { t: "La oportunidad", campo: "trabajo" }, { t: "Consejo", campo: "consejo" }] },
  { id: "problemas-de-dinero", nombre: "Problemas de dinero", cat: "trabajo", n: 6,
    desc: "Cuando la economía aprieta: qué pasa, de dónde viene y cómo salir.",
    pos: [{ t: "Tu economía hoy", campo: "trabajo" }, { t: "El origen", campo: "derecho" }, { t: "Lo que no ves", campo: "derecho" },
          { t: "Lo que puedes hacer", campo: "consejo" }, { t: "Lo que viene", campo: "trabajo" }, { t: "Resultado", campo: "trabajo" }] },
  { id: "hoy-amor", nombre: "Tarot de hoy: amor", cat: "diarias", n: 1,
    desc: "Una carta para ver cómo se mueve hoy el terreno sentimental.", pos: [{ t: "Hoy en el amor", campo: "amor" }] },
  { id: "hoy-trabajo", nombre: "Tarot de hoy: trabajo", cat: "diarias", n: 1,
    desc: "Una carta para tu jornada laboral de hoy.", pos: [{ t: "Hoy en el trabajo", campo: "trabajo" }] },
  { id: "hoy-dinero", nombre: "Tarot de hoy: dinero", cat: "diarias", n: 1,
    desc: "Qué energía rodea hoy tus asuntos de dinero.", pos: [{ t: "Hoy con el dinero", campo: "trabajo" }] },
  { id: "hoy-salud", nombre: "Tarot de hoy: energía", cat: "diarias", n: 1,
    desc: "Cómo andan hoy tu ánimo y tu energía. (No sustituye a ningún consejo médico.)", pos: [{ t: "Tu energía hoy", campo: "consejo" }] },
];

const CATEGORIAS = { todas: "Todas", generales: "Generales", amor: "Amor y pareja", trabajo: "Trabajo y dinero", diarias: "Del día" };

const GUIAS = [
  { id: "como-leer-el-tarot", titulo: "Cómo leer el tarot paso a paso", icono: "☾",
    resumen: "Sin memorizar 78 significados: preparar la pregunta, barajar, colocar las cartas y contar la historia que forman.",
    html: `
<p>Leer el tarot no es adivinar: es mirar una situación desde otro ángulo con la ayuda de unas imágenes cargadas de símbolos. Cualquiera puede empezar hoy mismo. Estos son los pasos.</p>
<h2>1. Prepara la pregunta</h2>
<p>La pregunta marca la lectura. Mejor abierta que cerrada: en lugar de «¿volverá?», prueba «¿qué necesito entender de esta relación?». Escríbela: te ayuda a no cambiarla por el camino.</p>
<h2>2. Baraja con calma</h2>
<p>No hay una forma correcta. Mezcla hasta que te parezca suficiente, pensando en tu pregunta. Si quieres usar cartas invertidas, gira parte del mazo mientras barajas.</p>
<h2>3. Elige una tirada</h2>
<p>Empieza por la de <a href="#/tarot-gratis/pasado-presente-futuro">tres cartas</a>: pasado, presente y futuro. Cada posición tiene un sentido, y ese sentido cambia cómo lees la carta que cae ahí.</p>
<h2>4. Mira antes de leer</h2>
<p>Antes de buscar el significado, observa: colores, gestos, hacia dónde mira cada figura. Apunta la primera impresión. Muchas veces es la más útil.</p>
<h2>5. Lee cada carta en su posición</h2>
<p>Consulta el <a href="#/significados">significado</a> y adáptalo: El Carro en «pasado» habla de un avance que ya hiciste; en «futuro», de uno que está por llegar.</p>
<h2>6. Cuenta la historia</h2>
<p>El paso clave. Las cartas no son frases sueltas: juntas cuentan algo. ¿Hay muchos arcanos mayores? El momento es importante. ¿Predomina un palo? Ese es el terreno donde se juega todo.</p>
<h2>7. Quédate con un consejo</h2>
<p>Cierra con una sola idea práctica. Una buena lectura termina en algo que puedes hacer, no en una sentencia.</p>` },
  { id: "arcanos-mayores-y-menores", titulo: "Arcanos mayores y menores", icono: "✦",
    resumen: "Las dos partes del mazo: los 22 grandes temas de la vida y las 56 cartas del día a día.",
    html: `
<p>Una baraja de tarot tiene 78 cartas divididas en dos grupos muy distintos.</p>
<h2>Los 22 arcanos mayores</h2>
<p>Van del 0 (El Loco) al XXI (El Mundo) y se suelen leer como un viaje: el Loco sale sin nada y, carta a carta, se encuentra con la voluntad, la intuición, el amor, la crisis, la esperanza y la plenitud. Cuando aparecen en una tirada señalan temas de fondo, cambios importantes y lecciones grandes.</p>
<h2>Los 56 arcanos menores</h2>
<p>Se reparten en cuatro palos de catorce cartas: del As al Diez, y cuatro figuras (Sota, Caballo, Reina y Rey). Hablan de lo cotidiano: situaciones, personas y decisiones del día a día.</p>
<ul><li><strong>Los números</strong> cuentan una progresión: el As es la semilla, el Cinco la crisis, el Diez el ciclo cerrado.</li>
<li><strong>Las figuras</strong> suelen representar personas o actitudes: la Sota aprende, el Caballo actúa, la Reina domina por dentro y el Rey por fuera.</li></ul>
<p>Mira el <a href="#/significados">significado de las 78 cartas</a>.</p>` },
  { id: "los-cuatro-palos", titulo: "Los cuatro palos y sus elementos", icono: "🜃",
    resumen: "Bastos, Copas, Espadas y Oros: fuego, agua, aire y tierra. Qué terreno de la vida toca cada uno.",
    html: `
<p>Cada palo de los arcanos menores está ligado a un elemento y a un terreno de la vida. Saberlo ya te da media lectura.</p>
<h2>🜂 Bastos · Fuego</h2><p>Acción, energía, proyectos, ambición y creatividad. Muchos bastos: hay que moverse.</p>
<h2>🜄 Copas · Agua</h2><p>Emociones, amor, amistad e intuición. Muchas copas: la pregunta es del corazón aunque parezca otra cosa.</p>
<h2>🜁 Espadas · Aire</h2><p>Pensamientos, decisiones, conflictos y verdad. Son las cartas más duras del mazo porque muestran lo que duele pensar.</p>
<h2>⛤ Oros · Tierra</h2><p>Dinero, trabajo, cuerpo, casa y todo lo material. Muchos oros: asuntos prácticos y concretos.</p>` },
  { id: "tipos-de-tiradas", titulo: "Tipos de tiradas y cuándo usar cada una", icono: "⟡",
    resumen: "De una carta a la cruz celta: cómo elegir la tirada según lo que quieres saber.",
    html: `
<p>La tirada es el esquema en el que colocas las cartas. Cada posición tiene un significado propio.</p>
<h2>Una carta</h2><p>Para el día o para una pregunta de <a href="#/tarot-gratis/si-o-no">sí o no</a>. Rápida, pero no da contexto.</p>
<h2>Tres cartas</h2><p>La más versátil. Pasado-presente-futuro, situación-obstáculo-consejo o tú-la otra persona-la relación.</p>
<h2>Cinco a siete cartas</h2><p>Para un problema concreto con varios factores: lo que frena, lo que ayuda, el desenlace. Prueba <a href="#/tarot-gratis/cruz-simple">la cruz simple</a> o <a href="#/tarot-gratis/mapa-de-tu-vida">el mapa de tu vida</a>.</p>
<h2>La cruz celta (diez cartas)</h2><p>La clásica para temas importantes. Tiene una cruz central (la situación y lo que se le opone) y una columna a la derecha (tú, tu entorno, tus miedos y el desenlace). <a href="#/tarot-gratis/cruz-celta">Hazla gratis</a>.</p>` },
  { id: "cartas-invertidas", titulo: "Qué significan las cartas invertidas", icono: "⇅",
    resumen: "Una carta boca abajo no es siempre «lo contrario». Tres maneras de leerla.",
    html: `
<p>Cuando una carta sale del revés se dice que está invertida. No todos los tarotistas las usan, pero añaden matices.</p>
<h2>Tres formas de leerlas</h2>
<ol><li><strong>Energía bloqueada:</strong> la carta está, pero no fluye. La Estrella invertida es esperanza que no te permites.</li>
<li><strong>Energía hacia dentro:</strong> lo que la carta dice se vive por dentro y no se ve fuera.</li>
<li><strong>Exceso o defecto:</strong> la virtud de la carta se pasa de rosca o se queda corta. La Fuerza invertida puede ser inseguridad o impulsividad.</li></ol>
<p>Una carta «mala» invertida puede ser buena noticia: La Torre invertida a veces señala que la crisis se evita o que ya está pasando.</p>
<p>En nuestras tiradas gratis puedes activar o quitar las cartas invertidas.</p>` },
  { id: "combinaciones", titulo: "Cómo combinar cartas en una lectura", icono: "∞",
    resumen: "Las cartas se modifican unas a otras. Trucos para leerlas juntas y no como frases sueltas.",
    html: `
<p>Una carta sola dice poco; su vecina cambia el matiz. Algunas pistas para leerlas juntas:</p>
<ul><li><strong>Cuenta los mayores.</strong> Más de la mitad: el tema es de fondo y en parte escapa a tu control.</li>
<li><strong>Cuenta los palos.</strong> El que se repite marca el terreno: copas, emociones; oros, dinero.</li>
<li><strong>Busca números repetidos.</strong> Varios cincos: una etapa de pruebas. Varios ases: muchos comienzos a la vez.</li>
<li><strong>Mira las miradas.</strong> Si una figura mira a otra carta, hay relación entre ambas; si mira fuera, algo se va.</li>
<li><strong>Una carta suaviza a otra.</strong> La Torre junto a La Estrella: el golpe trae alivio después.</li></ul>` },
];

const PRODUCTOS = [
  { id: "tarot-luna-arcana", nombre: "Tarot Luna Arcana", precio: 34.90, cat: "Barajas", etiqueta: "Baraja propia",
    fondo: "linear-gradient(135deg,#2a8fa3,#e56fb0)", cartas: ["dos-de-copas", "el-loco", "la-estrella"],
    desc: "Nuestra baraja: las 78 escenas del tarot clásico de 1909 redibujadas a plumilla sobre acuarela luminosa, con rayos de luz y el nombre escrito a mano. Con librito en español con el significado de cada carta al derecho y del revés.",
    detalles: ["78 cartas + librito en español", "Cartulina de 350 g con canto dorado", "Caja rígida con imán"] },
  { id: "tarot-rider-waite", nombre: "Tarot Rider-Waite clásico", precio: 22.90, cat: "Barajas",
    fondo: "linear-gradient(135deg,#2a1d45,#5a3d8a)", cartas: [],
    desc: "La baraja de referencia para aprender: 78 cartas con las ilustraciones de 1909 y librito con los significados en español. Tamaño estándar 70 × 120 mm.",
    detalles: ["78 cartas + librito en español", "Cartulina de 300 g con acabado mate", "Caja rígida"] },
  { id: "tarot-marsella", nombre: "Tarot de Marsella", precio: 19.90, cat: "Barajas",
    fondo: "linear-gradient(135deg,#7d1f32,#c0563d)", cartas: [],
    desc: "El tarot tradicional europeo, con sus colores planos y su simbolismo austero. Para quien quiere ir a las raíces.",
    detalles: ["78 cartas", "Colores tradicionales", "Caja de cartón"] },
  { id: "tarot-thoth", nombre: "Tarot Thoth", precio: 29.90, cat: "Barajas",
    fondo: "linear-gradient(135deg,#1f4d7a,#2a8a7a)", cartas: [],
    desc: "Una baraja de imágenes intensas y cargadas de simbología esotérica, para lectores con experiencia.",
    detalles: ["78 cartas de gran formato", "Librito explicativo", "Caja rígida"] },
  { id: "mini-tarot", nombre: "Mini tarot de bolsillo", precio: 12.90, cat: "Barajas", etiqueta: "Nuevo",
    fondo: "linear-gradient(135deg,#7a5a1a,#d2a449)", cartas: [],
    desc: "Las 78 cartas en tamaño bolsillo para llevarlas contigo. Ideal para la carta del día.",
    detalles: ["78 cartas de 45 × 75 mm", "Estuche de lata"] },
  { id: "tapete-lectura", nombre: "Tapete de lectura bordado", precio: 14.90, cat: "Accesorios",
    fondo: "linear-gradient(135deg,#1c1330,#3b2862)", cartas: [],
    desc: "Tapete de terciopelo de 60 × 60 cm con luna y estrellas bordadas en dorado. Protege tus cartas y crea el ambiente.",
    detalles: ["Terciopelo", "60 × 60 cm", "Bordado dorado"] },
  { id: "bolsa-terciopelo", nombre: "Bolsa de terciopelo", precio: 7.90, cat: "Accesorios",
    fondo: "linear-gradient(135deg,#561426,#9c2a41)", cartas: [],
    desc: "Bolsa con cordón para guardar tu baraja. Cabe cualquier mazo de tamaño estándar.",
    detalles: ["Terciopelo", "15 × 20 cm", "Cordón dorado"] },
  { id: "diario-tarot", nombre: "Diario de tiradas", precio: 16.90, cat: "Libros",
    fondo: "linear-gradient(135deg,#33250a,#7a5a1a)", cartas: ["la-sacerdotisa"],
    desc: "Cuaderno guiado para apuntar tus tiradas, lo que viste y lo que pasó después. La mejor forma de aprender de verdad.",
    detalles: ["160 páginas", "Plantillas de 1, 3 y 10 cartas", "Tapa dura"] },
  { id: "pack-iniciacion", nombre: "Pack de iniciación", precio: 49.90, cat: "Packs", etiqueta: "Ahorra 7,80 €",
    fondo: "linear-gradient(135deg,#2a1d45,#7d1f32)", cartas: ["el-loco", "el-mago", "la-sacerdotisa"],
    desc: "Todo para empezar: nuestra baraja Luna Arcana, tapete bordado y bolsa de terciopelo.",
    detalles: ["Tarot Luna Arcana", "Tapete de lectura", "Bolsa de terciopelo"] },
];

const ENVIO = { gratisDesde: 35, coste: 4.90 };

const PREGUNTAS = [
  ["¿Las tiradas son gratis de verdad?", "Sí. Todas las tiradas de la web son gratuitas, sin registro y sin límite."],
  ["¿Cómo se eligen las cartas?", "El mazo se baraja al azar cada vez y eres tú quien escoge las cartas boca abajo, igual que en una mesa."],
  ["¿Qué tirada hago si es mi primera vez?", "Empieza por la carta del día o por la de pasado, presente y futuro. Son sencillas y enseñan mucho."],
  ["¿Puedo repetir la misma tirada?", "Puedes, pero te recomendamos no repetir la misma pregunta en el mismo día: la primera respuesta suele ser la más honesta."],
  ["¿El tarot predice el futuro?", "Lo entendemos como una herramienta de reflexión: ayuda a mirar una situación desde otro ángulo. Las decisiones siempre son tuyas."],
];

const LEGAL = {
  "aviso-legal": ["Aviso legal", `<p>Titular del sitio web: <strong>[pendiente: nombre o razón social]</strong>, con NIF <strong>[pendiente]</strong> y domicilio en <strong>[pendiente]</strong>. Correo de contacto: <strong>[pendiente]</strong>.</p><p>Los contenidos de esta web tienen carácter divulgativo y de entretenimiento. Las lecturas de tarot no constituyen asesoramiento médico, psicológico, legal ni financiero.</p><p>Los textos de la web son propiedad de su titular. Las ilustraciones de las cartas parten del tarot Rider-Waite-Smith (1909, ilustrado por Pamela Colman Smith), de dominio público, repintado por Luna Arcana.</p>`],
  "privacidad": ["Política de privacidad", `<p>Responsable del tratamiento: <strong>[pendiente]</strong>.</p><p>Tratamos los datos que nos envías (nombre, correo, dirección de envío) solo para gestionar tus pedidos, responder a tus consultas y, si lo aceptas, enviarte la newsletter. No los cedemos a terceros salvo obligación legal o para completar el envío (empresa de transporte y pasarela de pago).</p><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <strong>[pendiente: correo]</strong>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p><p>Las tiradas no guardan tus preguntas: se quedan solo en tu navegador.</p>`],
  "cookies": ["Política de cookies", `<p>Esta web no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador el contenido de tu carrito y tu carta del día, para que no se pierdan al recargar la página.</p>`],
  "condiciones": ["Condiciones de venta", `<p>Los precios incluyen IVA. El pedido se confirma al recibir el pago.</p><p><strong>Desistimiento:</strong> tienes 14 días naturales desde la recepción para devolver el producto sin dar explicaciones, siempre que esté sin usar y en su embalaje original. Te devolvemos el importe en un máximo de 14 días.</p><p>Garantía legal de 3 años frente a defectos de conformidad.</p><p>[pendiente: revisar con un asesor antes de vender]</p>`],
  "envios": ["Envíos y devoluciones", `<p>Envío a península en 24–72 h laborables. Gastos de envío: ${ENVIO.coste.toFixed(2).replace(".", ",")} €; <strong>gratis a partir de ${ENVIO.gratisDesde} €</strong>.</p><p>Baleares, Canarias, Ceuta y Melilla: [pendiente].</p><p>Para devolver un pedido, escríbenos indicando el número de pedido en un plazo de 14 días desde que lo recibas.</p>`],
};
