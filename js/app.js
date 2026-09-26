// Luna Arcana: navegación, tiradas, guía de cartas y tienda.

const $app = document.getElementById("app");
const euros = n => n.toFixed(2).replace(".", ",") + " €";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// localStorage puede fallar (modo privado, bloqueos): nunca debe romper la página
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const leer = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("visible");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("visible"), 2600);
}

// ---------- Dibujo de una carta ----------
// Título manuscrito: «0. el Loco», «2 de Copas», «Reina de Copas»
function tituloManuscrito(c) {
  if (c.mayor) return `${c.n}. ${c.nombre.charAt(0).toLowerCase()}${c.nombre.slice(1)}`;
  return c.rango <= 10 ? `${c.rango === 1 ? "As" : c.rango} de ${PALOS[c.palo].nombre}` : c.nombre;
}

// Ilustraciones: tarot Rider-Waite-Smith (1909, dominio público) repintado con img/estilizar.py
function cartaHTML(c, { invertida = false, bocaAbajo = false, extra = "", grande = false } = {}) {
  return `<div class="carta ${invertida ? "invertida" : ""} ${bocaAbajo ? "boca-abajo" : ""} ${extra}">
    <div class="caras">
      <div class="cara"><img src="img/cartas/${grande ? "" : "min/"}${c.id}.jpg" alt="${c.nombre}"><span class="titulo-c">${tituloManuscrito(c)}</span></div>
      <div class="dorso"></div>
    </div></div>`;
}
const dorsoHTML = (extra = "", attrs = "") => `<div class="carta boca-abajo ${extra}" ${attrs}><div class="caras"><div class="cara"></div><div class="dorso"></div></div></div>`;

function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Portada ----------
function vistaInicio() {
  const destacadas = ["el-sol", "la-luna", "la-estrella", "el-mago", "los-enamorados"].map(cartaPorId);
  const angulos = [-24, -12, 0, 12, 24];
  return `
  <section class="hero"><div class="contenedor">
    <div>
      <span class="ante">Tarot gratis · significados · tienda</span>
      <h1>Las cartas no deciden por ti. <em>Te ayudan a ver.</em></h1>
      <p>Haz tu tirada gratis con calma, aprende qué significa cada una de las 78 cartas y encuentra tu baraja.</p>
      <div class="acciones">
        <a class="btn btn-oro" href="#/tarot-gratis">Hacer una tirada gratis</a>
        <a class="btn btn-linea-claro" href="#/tarot-gratis/carta-del-dia">Mi carta del día</a>
      </div>
    </div>
    <div class="abanico">${destacadas.map((c, i) => cartaHTML(c, { extra: "" }).replace('class="carta', `style="transform:translateX(-50%) rotate(${angulos[i]}deg)" class="carta`)).join("")}</div>
  </div></section>

  <section class="bloque"><div class="contenedor">
    <div class="centro"><span class="ante">Empieza aquí</span><h2>Elige tu camino</h2><p class="suave">Tres puertas para entrar en el tarot.</p></div>
    <div class="rejilla r3" style="margin-top:30px">
      <div class="tarjeta"><div class="icono">✦</div><h3>Tarot gratis</h3><p>Quince tiradas interactivas para el amor, el trabajo, el dinero o el día a día. Tú eliges las cartas.</p><a class="mas" href="#/tarot-gratis">Ver tiradas →</a></div>
      <div class="tarjeta"><div class="icono">☾</div><h3>Significados</h3><p>Las 78 cartas explicadas al derecho y del revés, con su lectura en el amor, en el trabajo y un consejo.</p><a class="mas" href="#/significados">Ver las cartas →</a></div>
      <div class="tarjeta"><div class="icono">⟡</div><h3>Aprende a leer</h3><p>Guías sencillas para echar las cartas tú mismo: paso a paso, tiradas, palos, invertidas y combinaciones.</p><a class="mas" href="#/aprende">Empezar a aprender →</a></div>
    </div>
  </div></section>

  <section class="bloque oscuro"><div class="contenedor">
    <div class="centro"><span class="ante">Las más consultadas</span><h2>Tiradas gratis para hoy</h2></div>
    <div class="rejilla r4" style="margin-top:30px">${["carta-del-dia", "si-o-no", "pasado-presente-futuro", "cruz-celta"].map(id => tarjetaTirada(TIRADAS.find(t => t.id === id))).join("")}</div>
    <div class="centro" style="margin-top:30px"><a class="btn btn-oro" href="#/tarot-gratis">Ver las ${TIRADAS.length} tiradas</a></div>
  </div></section>

  <section class="bloque"><div class="contenedor">
    ${bloqueSuscripcion()}
  </div></section>

  <section class="bloque papel"><div class="contenedor">
    <div class="centro"><span class="ante">Divulgación</span><h2>Aprende tarot sin complicarte</h2></div>
    <div class="rejilla r3" style="margin-top:30px">${GUIAS.slice(0, 6).map(tarjetaGuia).join("")}</div>
  </div></section>

  <section class="bloque"><div class="contenedor">
    <div class="centro"><span class="ante">Tienda</span><h2>Tu baraja te está esperando</h2><p class="suave">Barajas, tapetes y accesorios. Envío gratis desde ${ENVIO.gratisDesde} €.</p></div>
    <div class="rejilla r4 productos" style="margin-top:30px">${PRODUCTOS.slice(0, 4).map(tarjetaProducto).join("")}</div>
    <div class="centro" style="margin-top:30px"><a class="btn btn-vino" href="#/tienda">Ver toda la tienda</a></div>
  </div></section>

  <section class="bloque oscuro"><div class="contenedor estrecho centro">
    <span class="ante">Lectura personalizada</span>
    <h2>¿Prefieres que alguien lea tus cartas?</h2>
    <p>Cuéntanos tu situación y recibe por correo una lectura escrita, detallada y sincera. Anónima y para releer cuando quieras.</p>
    <a class="btn btn-oro" href="#/lectura-personalizada">Pedir mi lectura</a>
  </div></section>`;
}

function bloqueSuscripcion() {
  return `<div class="suscripcion">
    <div>
      <span class="ante">Newsletter gratis</span>
      <h2>Aprende tarot conmigo cada semana</h2>
      <ul><li>🎁 Guía en PDF con las 78 cartas y sus claves</li><li>🔮 La carta de la semana, cada lunes</li><li>🧩 Trucos para leer mejor tus tiradas</li></ul>
    </div>
    <form onsubmit="return suscribir(event)">
      <div class="campo"><label for="s-nombre">Tu nombre</label><input id="s-nombre" type="text" required></div>
      <div class="campo"><label for="s-email">Tu correo</label><input id="s-email" type="email" required></div>
      <label class="check"><input type="checkbox" required><span>Acepto la <a href="#/legal/privacidad">política de privacidad</a> y recibir correos. Puedo darme de baja cuando quiera.</span></label>
      <button class="btn btn-oro" style="margin-top:14px;width:100%">Quiero la guía gratis</button>
    </form>
  </div>`;
}
function suscribir(e) {
  e.preventDefault();
  // Pendiente: conectar con el servicio de correo (Brevo, Mailchimp…). De momento solo confirma.
  e.target.innerHTML = `<div class="ok">¡Gracias! Te llegará la guía a tu correo en unos minutos.</div>`;
  return false;
}

// ---------- Tarot gratis ----------
function tarjetaTirada(t) {
  return `<a class="tarjeta tirada-item" href="#/tarot-gratis/${t.id}">
    <span class="num-cartas">${t.sino ? "Sí o no" : t.n + (t.n === 1 ? " carta" : " cartas")}</span>
    <h3>${t.nombre}</h3><p>${t.desc}</p><span class="mas" style="font-weight:600;color:var(--vino)">Empezar →</span></a>`;
}

function vistaTarotGratis() {
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto"><span class="ante">Tarot gratis online</span>
      <h1>Elige tu tirada</h1>
      <p class="suave">${TIRADAS.length} tiradas interactivas para el amor, el trabajo, el dinero y tus preguntas del día a día. Baraja, elige las cartas con calma y lee tu interpretación.</p></div>
    <div class="filtros">${Object.entries(CATEGORIAS).map(([k, v]) => `<button class="chip ${k === "todas" ? "activo" : ""}" data-cat="${k}">${v}</button>`).join("")}</div>
    <div class="rejilla r3" id="lista-tiradas">${TIRADAS.map(t => `<div data-cat="${t.cat}">${tarjetaTirada(t).replace('class="tarjeta', 'style="height:100%" class="tarjeta')}</div>`).join("")}</div>
    <div class="estrecho" style="margin:60px auto 0"><h2 class="centro">Preguntas frecuentes</h2>
      ${PREGUNTAS.map(([p, r]) => `<details><summary>${p}</summary><p>${r}</p></details>`).join("")}</div>
  </div></section>`;
}
function montarFiltros() {
  document.querySelectorAll(".chip").forEach(ch => ch.onclick = () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.toggle("activo", x === ch));
    document.querySelectorAll("#lista-tiradas > div").forEach(d => d.style.display = ch.dataset.cat === "todas" || d.dataset.cat === ch.dataset.cat ? "" : "none");
  });
}

// Estado de la tirada en curso
let T = null;

function vistaTirada(id) {
  const t = TIRADAS.find(x => x.id === id);
  if (!t) return vistaNoEncontrada();
  const invertidas = leer("la-invertidas", true);
  T = { t, invertidas, mazo: [], elegidas: [] };
  const hoy = new Date().toISOString().slice(0, 10);
  const guardada = t.diaria ? leer("la-carta-dia", null) : null;
  if (guardada && guardada.fecha === hoy) {
    T.elegidas = [{ carta: cartaPorId(guardada.id), inv: guardada.inv }];
    setTimeout(() => mostrarLectura(true), 0);
  }
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/tarot-gratis">Tarot gratis</a> › ${t.nombre}</div>
    <div class="centro estrecho" style="margin:0 auto 26px"><h1>${t.nombre}</h1><p class="suave">${t.desc}</p></div>
    <div class="estrecho" style="margin:0 auto 22px" id="preparacion">
      ${t.n > 1 || t.sino ? `<div class="campo"><label for="pregunta">Tu pregunta (opcional, no sale de tu navegador)</label><input id="pregunta" type="text" placeholder="${t.sino ? "Ej.: ¿Es buen momento para cambiar de trabajo?" : "Ej.: ¿Qué necesito saber de esta situación?"}"></div>` : ""}
      <label class="check"><input type="checkbox" id="chk-inv" ${invertidas ? "checked" : ""}><span>Incluir cartas invertidas</span></label>
    </div>
    <div class="mesa mesa-morada" id="mesa">
      <div class="estado-tirada" id="estado">Respira hondo, piensa en tu pregunta y pulsa <strong>Barajar</strong>.</div>
      <div class="centro" id="zona-barajar"><button class="btn btn-oro" onclick="empezarTirada()">Barajar las cartas</button></div>
      <div class="mazo-elegir" id="mazo"></div>
      <div class="${t.cruz ? "cruz" : "posiciones"}" id="posiciones">${t.pos.map((p, i) => `<div class="hueco p${i + 1}" id="hueco-${i}"><div class="vacio">${i + 1}</div><span class="etiqueta">${p.t}</span></div>`).join("")}</div>
      <div class="centro" id="zona-ver" style="margin-top:24px"></div>
    </div>
    <div id="lectura" class="lectura"></div>
  </div></section>`;
}

function empezarTirada() {
  T.invertidas = document.getElementById("chk-inv").checked;
  guardar("la-invertidas", T.invertidas);
  T.mazo = barajar(MAZO).map(c => ({ carta: c, inv: T.invertidas && Math.random() < 0.3 }));
  T.elegidas = [];
  document.getElementById("zona-barajar").innerHTML = `<button class="btn btn-linea-claro" onclick="empezarTirada()">Volver a barajar</button>`;
  document.getElementById("lectura").innerHTML = "";
  document.getElementById("zona-ver").innerHTML = "";
  T.t.pos.forEach((p, i) => document.getElementById(`hueco-${i}`).innerHTML = `<div class="vacio">${i + 1}</div><span class="etiqueta">${p.t}</span>`);
  // 36 cartas boca abajo para elegir (las de arriba del mazo barajado)
  document.getElementById("mazo").innerHTML = T.mazo.slice(0, 36).map((_, i) => dorsoHTML("", `data-i="${i}" onclick="elegir(${i}, this)" title="Elegir esta carta"`)).join("");
  actualizarEstado();
}

function actualizarEstado() {
  const faltan = T.t.n - T.elegidas.length;
  document.getElementById("estado").innerHTML = faltan > 0
    ? `Elige <strong>${faltan} ${faltan === 1 ? "carta" : "cartas"}</strong> más, sin prisa, la que te llame.`
    : `Ya tienes tus cartas. Pulsa <strong>Ver mi lectura</strong>.`;
}

function elegir(i, el) {
  if (T.elegidas.length >= T.t.n || el.classList.contains("elegida")) return;
  el.classList.add("elegida");
  const pos = T.elegidas.length;
  T.elegidas.push(T.mazo[i]);
  const e = T.mazo[i];
  document.getElementById(`hueco-${pos}`).innerHTML = cartaHTML(e.carta, { invertida: e.inv, bocaAbajo: true }) + `<span class="etiqueta">${T.t.pos[pos].t}</span>`;
  actualizarEstado();
  if (T.elegidas.length === T.t.n) {
    document.getElementById("mazo").innerHTML = "";
    document.getElementById("zona-ver").innerHTML = `<button class="btn btn-oro" onclick="mostrarLectura()">Ver mi lectura</button>`;
  }
}

function mostrarLectura(yaGuardada = false) {
  const { t, elegidas } = T;
  if (t.diaria && !yaGuardada) {
    const e = elegidas[0];
    guardar("la-carta-dia", { fecha: new Date().toISOString().slice(0, 10), id: e.carta.id, inv: e.inv });
  }
  if (yaGuardada) {
    document.getElementById("preparacion").style.display = "none";
    document.getElementById("zona-barajar").innerHTML = "";
    document.getElementById("hueco-0").innerHTML = cartaHTML(elegidas[0].carta, { invertida: elegidas[0].inv, bocaAbajo: true }) + `<span class="etiqueta">${t.pos[0].t}</span>`;
    document.getElementById("estado").innerHTML = `Esta es tu carta de hoy. Mañana tendrás una nueva.`;
  }
  document.getElementById("zona-ver").innerHTML = "";
  // Dar la vuelta a las cartas una a una
  document.querySelectorAll("#posiciones .carta").forEach((c, i) => setTimeout(() => c.classList.remove("boca-abajo"), 250 + i * 280));
  const pregunta = (document.getElementById("pregunta") || {}).value;
  const retraso = 400 + elegidas.length * 280;
  setTimeout(() => {
    let html = pregunta ? `<p class="centro suave">Tu pregunta: <em>«${esc(pregunta)}»</em></p>` : "";
    if (t.sino) html += bloqueSiNo(elegidas[0]);
    html += elegidas.map((e, i) => itemLectura(e, t.pos[i])).join("");
    if (elegidas.length >= 3) html += resumenTirada(elegidas);
    html += `<div class="centro" style="margin-top:26px">${t.diaria ? "" : `<button class="btn btn-vino" onclick="location.hash='#/tarot-gratis/${t.id}';router()">Hacer otra tirada</button> `}<a class="btn btn-linea" href="#/tarot-gratis">Ver otras tiradas</a></div>`;
    const l = document.getElementById("lectura");
    l.innerHTML = html;
    l.scrollIntoView({ behavior: "smooth", block: "start" });
  }, retraso);
}

function itemLectura(e, pos) {
  const c = e.carta;
  const texto = e.inv ? c.invertido : (pos.campo === "derecho" ? c.derecho : c[pos.campo] + " " + c.derecho);
  return `<div class="lectura-item">
    ${cartaHTML(c, { invertida: e.inv, grande: true })}
    <div><span class="pos">${pos.t}</span>
      <h3>${c.nombre}${e.inv ? " <span class='suave' style='font-size:.8em'>(invertida)</span>" : ""}</h3>
      <div class="etiquetas ${e.inv ? "inv" : ""}">${(e.inv ? c.invertidas : c.claves).map(k => `<span>${k}</span>`).join("")}</div>
      <p>${texto}</p>
      ${!e.inv && pos.campo !== "consejo" ? `<p><strong>Consejo:</strong> ${c.consejo}</p>` : ""}
      <a href="#/significados/${c.id}">Leer todo sobre ${c.nombre} →</a>
    </div></div>`;
}

function bloqueSiNo(e) {
  let r = e.carta.sino;
  if (e.inv) r = r === "sí" ? "quizás" : r === "no" ? "quizás" : "no";
  const frase = { "sí": "Las cartas se inclinan a favor. Adelante, con los ojos abiertos.", "no": "Ahora mismo las cartas no lo ven. Quizá no es el momento o no es el camino.", "quizás": "La respuesta todavía no está escrita: depende de lo que hagas tú." }[r];
  return `<div class="resumen centro" style="margin:0 0 20px"><span class="ante">La respuesta</span><div class="veredicto">${r.charAt(0).toUpperCase() + r.slice(1)}</div><p>${frase}</p></div>`;
}

function resumenTirada(elegidas) {
  const mayores = elegidas.filter(e => e.carta.mayor).length;
  const palos = {};
  elegidas.filter(e => !e.carta.mayor).forEach(e => palos[e.carta.palo] = (palos[e.carta.palo] || 0) + 1);
  const [paloTop, n] = Object.entries(palos).sort((a, b) => b[1] - a[1])[0] || [];
  const inv = elegidas.filter(e => e.inv).length;
  const partes = [];
  if (mayores >= Math.ceil(elegidas.length / 2)) partes.push(`Salen ${mayores} arcanos mayores de ${elegidas.length}: es un momento importante, de los que marcan etapa.`);
  else if (mayores === 0) partes.push("No aparece ningún arcano mayor: el asunto está en tus manos y se juega en lo cotidiano.");
  else partes.push(`Hay ${mayores} ${mayores === 1 ? "arcano mayor" : "arcanos mayores"}: algo de fondo se mueve bajo lo cotidiano.`);
  if (paloTop && n >= 2) partes.push(`Predominan las ${PALOS[paloTop].nombre.toLowerCase()} (${PALOS[paloTop].elemento.toLowerCase()}): el tema gira en torno a ${PALOS[paloTop].ambito}.`);
  if (inv >= Math.ceil(elegidas.length / 2)) partes.push("Muchas cartas invertidas: hay energía bloqueada o que vives por dentro. Date tiempo.");
  const ultima = elegidas[elegidas.length - 1].carta;
  partes.push(`Para cerrar, el consejo de tu última carta: <strong>${ultima.consejo}</strong>`);
  return `<div class="resumen"><h3>La lectura en conjunto</h3><p>${partes.join(" ")}</p></div>`;
}

// ---------- Significados ----------
function vistaSignificados() {
  const grupo = (titulo, lista, intro) => `<h2 style="margin-top:44px">${titulo}</h2><p class="suave">${intro}</p>
    <div class="rejilla-cartas">${lista.map(c => `<a href="#/significados/${c.id}">${cartaHTML(c)}<span>${c.nombre}</span></a>`).join("")}</div>`;
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto"><span class="ante">Las 78 cartas</span><h1>Significado de las cartas del tarot</h1>
    <p class="suave">Cada carta explicada al derecho y del revés, con su lectura en el amor, en el trabajo y un consejo. Toca una carta para verla entera.</p></div>
    ${grupo("Arcanos mayores", MAZO.filter(c => c.mayor), "Los 22 grandes temas de la vida, del Loco al Mundo.")}
    ${Object.entries(PALOS).map(([k, p]) => grupo(`${p.glifo} ${p.nombre}`, MAZO.filter(c => c.palo === k), `Elemento ${p.elemento.toLowerCase()}: ${p.ambito}.`)).join("")}
  </div></section>`;
}

function vistaCarta(id) {
  const c = cartaPorId(id);
  if (!c) return vistaNoEncontrada();
  const i = MAZO.indexOf(c);
  const ant = MAZO[(i + MAZO.length - 1) % MAZO.length], sig = MAZO[(i + 1) % MAZO.length];
  const tipo = c.mayor ? `Arcano mayor ${NUMERALES[c.n]} · ${c.astro}` : `Arcano menor · ${PALOS[c.palo].nombre} · ${c.astro}`;
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/significados">Significados</a> › ${c.nombre}</div>
    <div class="ficha-carta">
      <div>${cartaHTML(c, { grande: true })}</div>
      <div>
        <span class="ante">${tipo}</span>
        <h1>${c.nombre}</h1>
        <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
        <div class="dos-col">
          <div class="caja"><h4>Al derecho</h4><p>${c.derecho}</p></div>
          <div class="caja"><h4>Invertida</h4><div class="etiquetas inv">${c.invertidas.map(k => `<span>${k}</span>`).join("")}</div><p>${c.invertido}</p></div>
          <div class="caja"><h4>En el amor</h4><p>${c.amor}</p></div>
          <div class="caja"><h4>En el trabajo y el dinero</h4><p>${c.trabajo}</p></div>
        </div>
        <div class="caja"><h4>Consejo</h4><p>${c.consejo}</p><p style="margin:0"><strong>En una tirada de sí o no:</strong> ${c.sino}.</p></div>
        <div style="display:flex;justify-content:space-between;gap:10px;margin-top:26px;flex-wrap:wrap">
          <a class="btn btn-linea" href="#/significados/${ant.id}">← ${ant.nombre}</a>
          <a class="btn btn-linea" href="#/significados/${sig.id}">${sig.nombre} →</a>
        </div>
      </div>
    </div>
  </div></section>`;
}

// ---------- Aprende ----------
function tarjetaGuia(g) {
  return `<div class="tarjeta"><div class="icono">${g.icono}</div><h3>${g.titulo}</h3><p>${g.resumen}</p><a class="mas" href="#/aprende/${g.id}">Leer la guía →</a></div>`;
}
function vistaAprende() {
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto 30px"><span class="ante">Divulgación</span><h1>Aprende a leer el tarot</h1>
    <p class="suave">Guías cortas, claras y en orden. Si empiezas de cero, lee la primera.</p></div>
    <div class="rejilla r3">${GUIAS.map(tarjetaGuia).join("")}
      <div class="tarjeta"><div class="icono">❖</div><h3>Las 78 cartas</h3><p>El significado de cada carta al derecho y del revés.</p><a class="mas" href="#/significados">Ver los significados →</a></div>
    </div>
  </div></section>
  <section class="bloque" style="padding-top:0"><div class="contenedor">${bloqueSuscripcion()}</div></section>`;
}
function vistaGuia(id) {
  const g = GUIAS.find(x => x.id === id);
  if (!g) return vistaNoEncontrada();
  const otras = GUIAS.filter(x => x.id !== id).slice(0, 3);
  return `<section class="bloque"><div class="contenedor estrecho">
    <div class="miga"><a href="#/aprende">Aprende</a> › ${g.titulo}</div>
    <article class="articulo"><span class="ante">Guía</span><h1>${g.titulo}</h1><p class="suave" style="font-size:1.1rem">${g.resumen}</p>${g.html}
      <div class="nota" style="margin-top:30px">¿Lo pruebas? <a href="#/tarot-gratis">Haz una tirada gratis</a> y ponlo en práctica.</div>
    </article>
  </div></section>
  <section class="bloque papel"><div class="contenedor"><h2 class="centro">Sigue aprendiendo</h2><div class="rejilla r3" style="margin-top:24px">${otras.map(tarjetaGuia).join("")}</div></div></section>`;
}

// ---------- Tienda ----------
function fotoProducto(p, grande = false) {
  const cartas = p.cartas.map(cartaPorId);
  const n = cartas.length;
  const giros = n === 1 ? [0] : n === 2 ? [-10, 10] : [-16, 0, 16];
  const dibujo = n
    ? cartas.map((c, i) => cartaHTML(c).replace('class="carta', `style="transform:rotate(${giros[i]}deg) translateX(${(i - (n - 1) / 2) * (grande ? 40 : 22)}px)" class="carta`)).join("")
    : `<span style="font-size:${grande ? "7rem" : "4rem"};color:var(--oro)">${p.cat === "Accesorios" ? "☾" : "✦"}</span>`;
  return `<div class="foto" style="background:${p.fondo}">${p.etiqueta ? `<span class="etiqueta-prod">${p.etiqueta}</span>` : ""}${dibujo}</div>`;
}
function tarjetaProducto(p) {
  return `<div><a class="producto" href="#/tienda/${p.id}">${fotoProducto(p)}
    <span class="suave" style="font-size:.8rem">${p.cat}</span><h3 style="font-size:1.25rem;margin:2px 0 4px">${p.nombre}</h3></a>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="precio">${euros(p.precio)}</span>
    <button class="btn btn-vino" style="padding:9px 16px;font-size:.85rem" onclick="anadir('${p.id}',1)">Añadir</button></div></div>`;
}
function vistaTienda() {
  const cats = ["Todas", ...new Set(PRODUCTOS.map(p => p.cat))];
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto"><span class="ante">Tienda</span><h1>Barajas y accesorios de tarot</h1>
    <p class="suave">Envío en 24–72 h · Gratis desde ${ENVIO.gratisDesde} € · 14 días para devolver</p></div>
    <div class="filtros">${cats.map((c, i) => `<button class="chip ${i === 0 ? "activo" : ""}" data-cat="${c}">${c}</button>`).join("")}</div>
    <div class="rejilla r4 productos" id="lista-productos">${PRODUCTOS.map(p => `<div data-cat="${p.cat}">${tarjetaProducto(p)}</div>`).join("")}</div>
  </div></section>`;
}
function montarFiltrosTienda() {
  document.querySelectorAll(".chip").forEach(ch => ch.onclick = () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.toggle("activo", x === ch));
    document.querySelectorAll("#lista-productos > div").forEach(d => d.style.display = ch.dataset.cat === "Todas" || d.dataset.cat === ch.dataset.cat ? "" : "none");
  });
}
let cantFicha = 1;
function vistaProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (!p) return vistaNoEncontrada();
  cantFicha = 1;
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/tienda">Tienda</a> › ${p.nombre}</div>
    <div class="ficha-prod">
      <div class="producto">${fotoProducto(p, true)}</div>
      <div>
        <span class="ante">${p.cat}</span><h1 style="font-size:2.6rem">${p.nombre}</h1>
        <div class="precio" style="font-size:2rem;margin-bottom:14px">${euros(p.precio)} <span class="suave" style="font-size:.9rem;font-family:var(--sans);font-weight:400">IVA incluido</span></div>
        <p>${p.desc}</p>
        <ul>${p.detalles.map(d => `<li>${d}</li>`).join("")}</ul>
        <div style="display:flex;gap:12px;align-items:center;margin:24px 0;flex-wrap:wrap">
          <div class="cantidad"><button onclick="cambiarCantFicha(-1)">−</button><span id="cant-ficha">1</span><button onclick="cambiarCantFicha(1)">+</button></div>
          <button class="btn btn-vino" onclick="anadir('${p.id}', cantFicha)">Añadir al carrito</button>
        </div>
        <p class="suave" style="font-size:.9rem">🚚 Envío en 24–72 h · gratis desde ${ENVIO.gratisDesde} €<br>↩️ 14 días para devolverlo</p>
      </div>
    </div>
  </div></section>`;
}
function cambiarCantFicha(d) { cantFicha = Math.max(1, cantFicha + d); document.getElementById("cant-ficha").textContent = cantFicha; }

// Carrito: { idProducto: cantidad }
const carrito = () => leer("la-carrito", {});
function anadir(id, n) {
  const c = carrito(); c[id] = (c[id] || 0) + n; guardar("la-carrito", c);
  pintarContador(); toast(`Añadido al carrito: ${PRODUCTOS.find(p => p.id === id).nombre}`);
}
function cambiarCant(id, d) {
  const c = carrito(); c[id] = (c[id] || 0) + d; if (c[id] <= 0) delete c[id];
  guardar("la-carrito", c); pintarContador(); router();
}
function pintarContador() {
  document.getElementById("contador").textContent = Object.values(carrito()).reduce((a, b) => a + b, 0);
}
function calcular() {
  const lineas = Object.entries(carrito()).map(([id, n]) => ({ p: PRODUCTOS.find(x => x.id === id), n })).filter(l => l.p);
  const sub = lineas.reduce((a, l) => a + l.p.precio * l.n, 0);
  const envio = sub === 0 || sub >= ENVIO.gratisDesde ? 0 : ENVIO.coste;
  return { lineas, sub, envio, total: sub + envio };
}
function vistaCarrito() {
  const { lineas, sub, envio, total } = calcular();
  if (!lineas.length) return `<section class="bloque"><div class="contenedor estrecho centro"><h1>Tu carrito está vacío</h1><p class="suave">Echa un vistazo a nuestras barajas.</p><a class="btn btn-vino" href="#/tienda">Ir a la tienda</a></div></section>`;
  const falta = ENVIO.gratisDesde - sub;
  return `<section class="bloque"><div class="contenedor">
    <h1>Tu carrito</h1>
    <div class="ficha-prod" style="grid-template-columns:1.5fr 1fr">
      <div>${lineas.map(({ p, n }) => `<div class="linea-carrito">
          <div class="miniatura" style="background:${p.fondo}"></div>
          <div><strong>${p.nombre}</strong><br><span class="suave">${euros(p.precio)}</span></div>
          <div class="cantidad"><button onclick="cambiarCant('${p.id}',-1)">−</button><span>${n}</span><button onclick="cambiarCant('${p.id}',1)">+</button></div>
          <div style="text-align:right"><strong>${euros(p.precio * n)}</strong><br><button class="quitar" onclick="cambiarCant('${p.id}',-${n})">Quitar</button></div>
        </div>`).join("")}
        ${falta > 0 ? `<div class="nota">Te faltan <strong>${euros(falta)}</strong> para el envío gratis.</div>` : `<div class="ok">🎉 Tu envío es gratis.</div>`}
      </div>
      <div>
        <div class="totales">
          <div class="fila"><span>Subtotal</span><span>${euros(sub)}</span></div>
          <div class="fila"><span>Envío</span><span>${envio ? euros(envio) : "Gratis"}</span></div>
          <div class="fila total"><span>Total</span><span>${euros(total)}</span></div>
          <p class="suave" style="font-size:.82rem">IVA incluido</p>
          <a class="btn btn-vino" style="width:100%;text-align:center" href="#/pedido">Tramitar pedido</a>
        </div>
      </div>
    </div>
  </div></section>`;
}
function vistaPedido() {
  const { lineas, sub, envio, total } = calcular();
  if (!lineas.length) return vistaCarrito();
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/carrito">Carrito</a> › Datos de envío</div>
    <h1>Finalizar pedido</h1>
    <div class="ficha-prod" style="grid-template-columns:1.4fr 1fr">
      <form id="form-pedido" onsubmit="return enviarPedido(event)">
        <div class="dos-col" style="margin:0">
          <div class="campo"><label>Nombre y apellidos</label><input name="nombre" type="text" required></div>
          <div class="campo"><label>Teléfono</label><input name="telefono" type="tel" required></div>
        </div>
        <div class="campo"><label>Correo electrónico</label><input name="email" type="email" required></div>
        <div class="campo"><label>Dirección</label><input name="direccion" type="text" required></div>
        <div class="dos-col" style="margin:0">
          <div class="campo"><label>Código postal</label><input name="cp" type="text" required pattern="[0-9]{5}" title="5 cifras"></div>
          <div class="campo"><label>Población</label><input name="poblacion" type="text" required></div>
        </div>
        <div class="campo"><label>Notas (opcional)</label><textarea name="notas" rows="3"></textarea></div>
        <label class="check"><input type="checkbox" required><span>He leído y acepto las <a href="#/legal/condiciones">condiciones de venta</a> y la <a href="#/legal/privacidad">política de privacidad</a>.</span></label>
        <button class="btn btn-vino" style="margin-top:18px">Confirmar pedido · ${euros(total)}</button>
      </form>
      <div class="totales">
        <h3>Resumen</h3>
        ${lineas.map(({ p, n }) => `<div class="fila"><span>${n} × ${p.nombre}</span><span>${euros(p.precio * n)}</span></div>`).join("")}
        <div class="fila"><span>Envío</span><span>${envio ? euros(envio) : "Gratis"}</span></div>
        <div class="fila total"><span>Total</span><span>${euros(total)}</span></div>
      </div>
    </div>
  </div></section>`;
}
function enviarPedido(e) {
  e.preventDefault();
  // Pendiente: conectar la pasarela de pago (Stripe, Redsys o Shopify). De momento el pedido queda registrado en este navegador.
  const datos = Object.fromEntries(new FormData(e.target));
  const { lineas, total } = calcular();
  const num = "LA-" + Date.now().toString().slice(-6);
  const pedidos = leer("la-pedidos", []);
  pedidos.push({ num, fecha: new Date().toISOString(), datos, lineas: lineas.map(l => ({ id: l.p.id, n: l.n })), total });
  guardar("la-pedidos", pedidos);
  guardar("la-carrito", {});
  pintarContador();
  $app.innerHTML = `<section class="bloque"><div class="contenedor estrecho centro">
    <div style="font-size:3rem;color:var(--oro)">☾</div><h1>¡Gracias, ${esc(datos.nombre.split(" ")[0])}!</h1>
    <p>Hemos recibido tu pedido <strong>${num}</strong> por <strong>${euros(total)}</strong>.</p>
    <p class="suave">Te escribiremos a ${esc(datos.email)} con las instrucciones de pago y el seguimiento del envío.</p>
    <a class="btn btn-vino" href="#/">Volver al inicio</a></div></section>`;
  window.scrollTo(0, 0);
  return false;
}

// ---------- Lectura personalizada y contacto ----------
function vistaLecturaPersonal() {
  return `<section class="bloque"><div class="contenedor estrecho">
    <div class="centro"><span class="ante">Lectura personalizada</span><h1>Tu lectura, escrita y por correo</h1>
    <p class="suave">Cuéntanos tu situación. Recibirás una lectura detallada con la tirada, las cartas y su interpretación, para releerla cuando quieras. Anónima y sincera: si las cartas no dicen lo que esperas, también te lo diremos.</p></div>
    <div class="rejilla r3" style="margin:30px 0">
      <div class="tarjeta centro"><div class="icono">✉</div><h3>Por escrito</h3><p>Una lectura que puedes guardar y releer.</p></div>
      <div class="tarjeta centro"><div class="icono">⏱</div><h3>En 48–72 h</h3><p>La recibes en tu correo.</p></div>
      <div class="tarjeta centro"><div class="icono">☾</div><h3>Desde 25 €</h3><p>3 preguntas · 35 € la cruz celta completa.</p></div>
    </div>
    <form class="articulo" onsubmit="return enviarConsulta(event)">
      <div class="campo"><label>Tipo de lectura</label><select name="tipo"><option>Tres preguntas · 25 €</option><option>Cruz celta completa · 35 €</option><option>Lectura de amor · 30 €</option></select></div>
      <div class="dos-col" style="margin:0"><div class="campo"><label>Nombre (o alias)</label><input name="nombre" type="text" required></div>
      <div class="campo"><label>Correo</label><input name="email" type="email" required></div></div>
      <div class="campo"><label>Tu situación y tus preguntas</label><textarea name="consulta" rows="6" required placeholder="Cuéntanos lo que quieras, con el detalle que te apetezca."></textarea></div>
      <label class="check"><input type="checkbox" required><span>Soy mayor de edad y acepto la <a href="#/legal/privacidad">política de privacidad</a>. Entiendo que el tarot no sustituye el consejo médico, psicológico, legal ni financiero.</span></label>
      <button class="btn btn-vino" style="margin-top:18px">Enviar mi consulta</button>
    </form>
  </div></section>`;
}
function enviarConsulta(e) {
  e.preventDefault();
  // Pendiente: enviar a un correo real y cobrar (enlace de pago). De momento confirma en pantalla.
  e.target.innerHTML = `<div class="ok">¡Recibido! Te escribiremos en menos de 24 h con las instrucciones de pago. Tu lectura llegará en 48–72 h después del pago.</div>`;
  return false;
}
function vistaContacto() {
  return `<section class="bloque"><div class="contenedor estrecho"><div class="articulo">
    <h1>Contacto</h1><p>¿Dudas con un pedido o una lectura? Escríbenos y te contestamos en menos de 24 h laborables.</p>
    <p>✉️ <strong>[pendiente: correo de contacto]</strong><br>📱 <strong>[pendiente: WhatsApp]</strong></p>
  </div></div></section>`;
}
function vistaLegal(id) {
  const l = LEGAL[id];
  if (!l) return vistaNoEncontrada();
  return `<section class="bloque"><div class="contenedor estrecho"><div class="articulo"><h1>${l[0]}</h1>${l[1]}</div></div></section>`;
}
function vistaNoEncontrada() {
  return `<section class="bloque"><div class="contenedor estrecho centro"><h1>Esta página no existe</h1><p class="suave">Quizá las cartas te traían por otro camino.</p><a class="btn btn-vino" href="#/">Volver al inicio</a></div></section>`;
}

// ---------- Navegación ----------
function router() {
  const partes = (location.hash.replace(/^#\/?/, "") || "").split("/");
  const [sec, sub] = partes;
  let html, despues;
  switch (sec) {
    case "": html = vistaInicio(); break;
    case "tarot-gratis": if (sub) html = vistaTirada(sub); else { html = vistaTarotGratis(); despues = montarFiltros; } break;
    case "significados": html = sub ? vistaCarta(sub) : vistaSignificados(); break;
    case "aprende": html = sub ? vistaGuia(sub) : vistaAprende(); break;
    case "tienda": if (sub) html = vistaProducto(sub); else { html = vistaTienda(); despues = montarFiltrosTienda; } break;
    case "carrito": html = vistaCarrito(); break;
    case "pedido": html = vistaPedido(); break;
    case "lectura-personalizada": html = vistaLecturaPersonal(); break;
    case "contacto": html = vistaContacto(); break;
    case "legal": html = vistaLegal(sub); break;
    default: html = vistaNoEncontrada();
  }
  $app.innerHTML = html;
  if (despues) despues();
  document.querySelectorAll("nav.menu a").forEach(a => a.classList.toggle("activo", a.dataset.sec === sec));
  document.querySelector("nav.menu").classList.remove("abierto");
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
document.getElementById("anio").textContent = new Date().getFullYear();
pintarContador();
router();
