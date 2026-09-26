// Luna Arcana: navegación, tiradas, guía de cartas y tienda.

const $app = document.getElementById("app");
const euros = n => "€" + n.toFixed(2);
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
  return c.rango <= 10 ? `${c.rango === 1 ? "Ace" : c.rango} of ${PALOS[c.palo].nombre}` : c.nombre;
}

// Ilustraciones: tarot Rider-Waite-Smith (1909, dominio público) repintado con img/estilizar.py
function cartaHTML(c, { invertida = false, bocaAbajo = false, extra = "", grande = false } = {}) {
  return `<div class="carta ${invertida ? "invertida" : ""} ${bocaAbajo ? "boca-abajo" : ""} ${extra}">
    <div class="caras">
      <div class="cara"><img src="../img/cartas/${grande ? "" : "min/"}${c.id}.jpg" alt="${c.nombre}"><span class="titulo-c">${tituloManuscrito(c)}</span></div>
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
      <span class="ante">Free tarot · meanings · shop</span>
      <h1>The cards don't decide for you. <em>They help you see.</em></h1>
      <p>Take your free reading at your own pace, learn what each of the 78 cards means and find your deck.</p>
      <div class="acciones">
        <a class="btn btn-oro" href="#/tarot-gratis">Get a free reading</a>
        <a class="btn btn-linea-claro" href="#/tarot-gratis/carta-del-dia">My card of the day</a>
      </div>
    </div>
    <div class="abanico">${destacadas.map((c, i) => cartaHTML(c, { extra: "" }).replace('class="carta', `style="transform:translateX(-50%) rotate(${angulos[i]}deg)" class="carta`)).join("")}</div>
  </div></section>

  <section class="bloque"><div class="contenedor">
    <div class="centro"><span class="ante">Start here</span><h2>Choose your path</h2><p class="suave">Three doors into the world of tarot.</p></div>
    <div class="rejilla r3" style="margin-top:30px">
      <div class="tarjeta"><div class="icono">✦</div><h3>Free tarot</h3><p>${TIRADAS.length} interactive spreads for love, work, money or everyday life. You pick the cards.</p><a class="mas" href="#/tarot-gratis">See the spreads →</a></div>
      <div class="tarjeta"><div class="icono">☾</div><h3>Meanings</h3><p>All 78 cards explained upright and reversed, with what they mean for love and work, plus a piece of advice.</p><a class="mas" href="#/significados">See the cards →</a></div>
      <div class="tarjeta"><div class="icono">⟡</div><h3>Learn to read</h3><p>Simple guides to reading the cards yourself: step by step, spreads, suits, reversals and combinations.</p><a class="mas" href="#/aprende">Start learning →</a></div>
    </div>
  </div></section>

  <section class="bloque oscuro"><div class="contenedor">
    <div class="centro"><span class="ante">Most popular</span><h2>Free readings for today</h2></div>
    <div class="rejilla r4" style="margin-top:30px">${["carta-del-dia", "si-o-no", "pasado-presente-futuro", "cruz-celta"].map(id => tarjetaTirada(TIRADAS.find(t => t.id === id))).join("")}</div>
    <div class="centro" style="margin-top:30px"><a class="btn btn-oro" href="#/tarot-gratis">See all ${TIRADAS.length} spreads</a></div>
  </div></section>

  <div id="extra-inicio"></div>

  <section class="bloque"><div class="contenedor">
    ${bloqueSuscripcion()}
  </div></section>

  <section class="bloque papel"><div class="contenedor">
    <div class="centro"><span class="ante">Guides</span><h2>Learn tarot the easy way</h2></div>
    <div class="rejilla r3" style="margin-top:30px">${GUIAS.slice(0, 6).map(tarjetaGuia).join("")}</div>
  </div></section>

  <section class="bloque"><div class="contenedor">
    <div class="centro"><span class="ante">Shop</span><h2>Your deck is waiting for you</h2><p class="suave">Classic, gold and holographic decks. Free shipping on orders over €${ENVIO.gratisDesde}.</p></div>
    <div class="rejilla r4 productos" style="margin-top:30px">${PRODUCTOS.slice(0, 4).map(tarjetaProducto).join("")}</div>
    <div class="centro" style="margin-top:30px"><a class="btn btn-vino" href="#/tienda">Browse the whole shop</a></div>
  </div></section>

  <section class="bloque oscuro"><div class="contenedor estrecho centro">
    <span class="ante">Personal reading</span>
    <h2>Would you rather someone read the cards for you?</h2>
    <p>Tell us about your situation and receive a detailed, honest written reading by email. Anonymous, and yours to reread whenever you like.</p>
    <a class="btn btn-oro" href="#/lectura-personalizada">Request my reading</a>
  </div></section>`;
}

function bloqueSuscripcion() {
  return `<div class="suscripcion">
    <div>
      <span class="ante">Free newsletter</span>
      <h2>Learn tarot with me every week</h2>
      <ul><li>🎁 A PDF guide to the 78 cards and their keywords</li><li>🔮 The card of the week, every Monday</li><li>🧩 Tips to read your spreads better</li></ul>
    </div>
    <form onsubmit="return suscribir(event)">
      <div class="campo"><label for="s-nombre">Your name</label><input id="s-nombre" type="text" required></div>
      <div class="campo"><label for="s-email">Your email</label><input id="s-email" type="email" required></div>
      <label class="check"><input type="checkbox" required><span>I accept the <a href="#/legal/privacidad">privacy policy</a> and agree to receive emails. I can unsubscribe at any time.</span></label>
      <button class="btn btn-oro" style="margin-top:14px;width:100%">Send me the free guide</button>
    </form>
  </div>`;
}
function suscribir(e) {
  e.preventDefault();
  // Pendiente: conectar con el servicio de correo (Brevo, Mailchimp…). De momento solo confirma.
  e.target.innerHTML = `<div class="ok">Thank you! The guide will land in your inbox in a few minutes.</div>`;
  return false;
}

// ---------- Tarot gratis ----------
function tarjetaTirada(t) {
  return `<a class="tarjeta tirada-item" href="#/tarot-gratis/${t.id}">
    <span class="num-cartas">${t.sino ? "Yes or no" : t.n + (t.n === 1 ? " card" : " cards")}</span>
    <h3>${t.nombre}</h3><p>${t.desc}</p><span class="mas" style="font-weight:600;color:var(--vino)">Start →</span></a>`;
}

function vistaTarotGratis() {
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto"><span class="ante">Free online tarot</span>
      <h1>Choose your spread</h1>
      <p class="suave">${TIRADAS.length} interactive spreads for love, work, money and your everyday questions. Shuffle, pick your cards calmly and read your interpretation.</p></div>
    <div class="filtros">${Object.entries(CATEGORIAS).map(([k, v]) => `<button class="chip ${k === "todas" ? "activo" : ""}" data-cat="${k}">${v}</button>`).join("")}</div>
    <div class="rejilla r3" id="lista-tiradas">${TIRADAS.map(t => `<div data-cat="${t.cat}">${tarjetaTirada(t).replace('class="tarjeta', 'style="height:100%" class="tarjeta')}</div>`).join("")}</div>
    <div class="estrecho" style="margin:60px auto 0"><h2 class="centro">Frequently asked questions</h2>
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
    <div class="miga"><a href="#/tarot-gratis">Free tarot</a> › ${t.nombre}</div>
    <div class="centro estrecho" style="margin:0 auto 26px"><h1>${t.nombre}</h1><p class="suave">${t.desc}</p></div>
    <div class="estrecho" style="margin:0 auto 22px" id="preparacion">
      ${t.n > 1 || t.sino ? `<div class="campo"><label for="pregunta">Your question (optional, it never leaves your browser)</label><input id="pregunta" type="text" placeholder="${t.sino ? "e.g. Is this a good time to change jobs?" : "e.g. What do I need to know about this situation?"}"></div>` : ""}
      <label class="check"><input type="checkbox" id="chk-inv" ${invertidas ? "checked" : ""}><span>Include reversed cards</span></label>
    </div>
    <div class="mesa mesa-morada" id="mesa">
      <div class="estado-tirada" id="estado">Take a deep breath, think of your question and press <strong>Shuffle</strong>.</div>
      <div class="centro" id="zona-barajar"><button class="btn btn-oro" onclick="empezarTirada()">Shuffle the cards</button></div>
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
  document.getElementById("zona-barajar").innerHTML = `<button class="btn btn-linea-claro" onclick="empezarTirada()">Shuffle again</button>`;
  document.getElementById("lectura").innerHTML = "";
  document.getElementById("zona-ver").innerHTML = "";
  T.t.pos.forEach((p, i) => document.getElementById(`hueco-${i}`).innerHTML = `<div class="vacio">${i + 1}</div><span class="etiqueta">${p.t}</span>`);
  // 36 cartas boca abajo para elegir (las de arriba del mazo barajado)
  document.getElementById("mazo").innerHTML = T.mazo.slice(0, 36).map((_, i) => dorsoHTML("", `data-i="${i}" onclick="elegir(${i}, this)" title="Pick this card"`)).join("");
  actualizarEstado();
}

function actualizarEstado() {
  const faltan = T.t.n - T.elegidas.length;
  document.getElementById("estado").innerHTML = faltan > 0
    ? `Pick <strong>${faltan} more ${faltan === 1 ? "card" : "cards"}</strong>. No rush: choose whichever calls to you.`
    : `You have your cards. Press <strong>See my reading</strong>.`;
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
    document.getElementById("zona-ver").innerHTML = `<button class="btn btn-oro" onclick="mostrarLectura()">See my reading</button>`;
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
    document.getElementById("estado").innerHTML = `This is your card for today. Tomorrow you'll get a new one.`;
  }
  document.getElementById("zona-ver").innerHTML = "";
  // Dar la vuelta a las cartas una a una
  document.querySelectorAll("#posiciones .carta").forEach((c, i) => setTimeout(() => c.classList.remove("boca-abajo"), 250 + i * 280));
  const pregunta = (document.getElementById("pregunta") || {}).value;
  const retraso = 400 + elegidas.length * 280;
  setTimeout(() => {
    let html = pregunta ? `<p class="centro suave">Your question: <em>“${esc(pregunta)}”</em></p>` : "";
    if (t.sino) html += bloqueSiNo(elegidas[0]);
    html += elegidas.map((e, i) => itemLectura(e, t.pos[i])).join("");
    if (elegidas.length >= 3) html += resumenTirada(elegidas);
    html += `<div class="centro" style="margin-top:26px">${t.diaria ? "" : `<button class="btn btn-vino" onclick="location.hash='#/tarot-gratis/${t.id}';router()">Do another reading</button> `}<a class="btn btn-linea" href="#/tarot-gratis">See other spreads</a></div>`;
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
      <h3>${c.nombre}${e.inv ? " <span class='suave' style='font-size:.8em'>(reversed)</span>" : ""}</h3>
      <div class="etiquetas ${e.inv ? "inv" : ""}">${(e.inv ? c.invertidas : c.claves).map(k => `<span>${k}</span>`).join("")}</div>
      <p>${texto}</p>
      ${!e.inv && pos.campo !== "consejo" ? `<p><strong>Advice:</strong> ${c.consejo}</p>` : ""}
      <a href="#/significados/${c.id}">Read all about ${c.nombre} →</a>
    </div></div>`;
}

function bloqueSiNo(e) {
  let r = e.carta.sino;
  if (e.inv) r = r === "sí" ? "quizás" : r === "no" ? "quizás" : "no";
  const frase = { "sí": "The cards lean in your favour. Go ahead, with your eyes open.", "no": "Right now the cards don't see it. Maybe it isn't the time, or it isn't the way.", "quizás": "The answer isn't written yet: it depends on what you do." }[r];
  return `<div class="resumen centro" style="margin:0 0 20px"><span class="ante">The answer</span><div class="veredicto">${({ "sí": "Yes", "no": "No", "quizás": "Maybe" })[r]}</div><p>${frase}</p></div>`;
}

function resumenTirada(elegidas) {
  const mayores = elegidas.filter(e => e.carta.mayor).length;
  const palos = {};
  elegidas.filter(e => !e.carta.mayor).forEach(e => palos[e.carta.palo] = (palos[e.carta.palo] || 0) + 1);
  const [paloTop, n] = Object.entries(palos).sort((a, b) => b[1] - a[1])[0] || [];
  const inv = elegidas.filter(e => e.inv).length;
  const partes = [];
  if (mayores >= Math.ceil(elegidas.length / 2)) partes.push(`${mayores} of your ${elegidas.length} cards are major arcana: this is an important moment, the kind that marks a new chapter.`);
  else if (mayores === 0) partes.push("No major arcana appear: the matter is in your hands and plays out in everyday life.");
  else partes.push(`You have ${mayores} ${mayores === 1 ? "major arcana card" : "major arcana cards"}: something deeper is stirring beneath everyday life.`);
  if (paloTop && n >= 2) partes.push(`${PALOS[paloTop].nombre} dominate (${PALOS[paloTop].elemento.toLowerCase()}): the matter revolves around ${PALOS[paloTop].ambito}.`);
  if (inv >= Math.ceil(elegidas.length / 2)) partes.push("Lots of reversed cards: there's energy that's blocked or that you're living on the inside. Give yourself time.");
  const ultima = elegidas[elegidas.length - 1].carta;
  partes.push(`To close, the advice of your last card: <strong>${ultima.consejo}</strong>`);
  return `<div class="resumen"><h3>The reading as a whole</h3><p>${partes.join(" ")}</p></div>`;
}

// ---------- Significados ----------
function vistaSignificados() {
  const grupo = (titulo, lista, intro) => `<h2 style="margin-top:44px">${titulo}</h2><p class="suave">${intro}</p>
    <div class="rejilla-cartas">${lista.map(c => `<a href="#/significados/${c.id}">${cartaHTML(c)}<span>${c.nombre}</span></a>`).join("")}</div>`;
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto"><span class="ante">The 78 cards</span><h1>Tarot card meanings</h1>
    <p class="suave">Every card explained upright and reversed, with its meaning for love and work plus a piece of advice. Tap a card to see it in full.</p></div>
    ${grupo("Major arcana", MAZO.filter(c => c.mayor), "The 22 great themes of life, from The Fool to The World.")}
    ${Object.entries(PALOS).map(([k, p]) => grupo(`${p.glifo} ${p.nombre}`, MAZO.filter(c => c.palo === k), `${p.elemento} element: ${p.ambito}.`)).join("")}
  </div></section>`;
}

function vistaCarta(id) {
  const c = cartaPorId(id);
  if (!c) return vistaNoEncontrada();
  const i = MAZO.indexOf(c);
  const ant = MAZO[(i + MAZO.length - 1) % MAZO.length], sig = MAZO[(i + 1) % MAZO.length];
  const tipo = c.mayor ? `Major arcana ${NUMERALES[c.n]} · ${c.astro}` : `Minor arcana · ${PALOS[c.palo].nombre} · ${c.astro}`;
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/significados">Meanings</a> › ${c.nombre}</div>
    <div class="ficha-carta">
      <div>${cartaHTML(c, { grande: true })}</div>
      <div>
        <span class="ante">${tipo}</span>
        <h1>${c.nombre}</h1>
        <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
        <div class="dos-col">
          <div class="caja"><h4>Upright</h4><p>${c.derecho}</p></div>
          <div class="caja"><h4>Reversed</h4><div class="etiquetas inv">${c.invertidas.map(k => `<span>${k}</span>`).join("")}</div><p>${c.invertido}</p></div>
          <div class="caja"><h4>In love</h4><p>${c.amor}</p></div>
          <div class="caja"><h4>Work and money</h4><p>${c.trabajo}</p></div>
        </div>
        <div class="caja"><h4>Advice</h4><p>${c.consejo}</p><p style="margin:0"><strong>In a yes or no reading:</strong> ${({ "sí": "Yes", "no": "No", "quizás": "Maybe" })[c.sino]}.</p></div>
        <p style="margin-top:14px"><a href="cards/${c.id}/">Full page on ${c.nombre}: past, present, future and FAQs →</a></p>
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
  return `<div class="tarjeta"><div class="icono">${g.icono}</div><h3>${g.titulo}</h3><p>${g.resumen}</p><a class="mas" href="#/aprende/${g.id}">Read the guide →</a></div>`;
}
function vistaAprende() {
  return `<section class="bloque"><div class="contenedor">
    <div class="centro estrecho" style="margin:0 auto 30px"><span class="ante">Guides</span><h1>Learn to read tarot</h1>
    <p class="suave">Short, clear guides in order. If you're starting from scratch, read the first one.</p></div>
    <div class="rejilla r3">${GUIAS.map(tarjetaGuia).join("")}
      <div class="tarjeta"><div class="icono">❖</div><h3>The 78 cards</h3><p>The meaning of every card, upright and reversed.</p><a class="mas" href="#/significados">See the meanings →</a></div>
    </div>
  </div></section>
  <section class="bloque" style="padding-top:0"><div class="contenedor">${bloqueSuscripcion()}</div></section>`;
}
function vistaGuia(id) {
  const g = GUIAS.find(x => x.id === id);
  if (!g) return vistaNoEncontrada();
  const otras = GUIAS.filter(x => x.id !== id).slice(0, 3);
  return `<section class="bloque"><div class="contenedor estrecho">
    <div class="miga"><a href="#/aprende">Learn</a> › ${g.titulo}</div>
    <article class="articulo"><span class="ante">Guide</span><h1>${g.titulo}</h1><p class="suave" style="font-size:1.1rem">${g.resumen}</p>${g.html}
      <div class="nota" style="margin-top:30px">Want to try it? <a href="#/tarot-gratis">Get a free reading</a> and put it into practice.</div>
    </article>
  </div></section>
  <section class="bloque papel"><div class="contenedor"><h2 class="centro">Keep learning</h2><div class="rejilla r3" style="margin-top:24px">${otras.map(tarjetaGuia).join("")}</div></div></section>`;
}

// ---------- Tienda ----------
function fotoProducto(p) {
  return `<div class="foto foto-real">${p.etiqueta ? `<span class="etiqueta-prod">${p.etiqueta}</span>` : ""}<img src="../img/tienda/${p.foto}.jpg" alt="${p.nombre}" loading="lazy"></div>`;
}
const precioHTML = p => `<span class="precio">${euros(p.precio)}</span>${p.antes ? ` <s class="suave" style="font-size:.9rem">${euros(p.antes)}</s>` : ""}`;
function tarjetaProducto(p) {
  return `<div><a class="producto" href="#/tienda/${p.id}">${fotoProducto(p)}
    <span class="suave" style="font-size:.8rem">${p.cat}</span><h3 style="font-size:1.25rem;margin:2px 0 4px">${p.nombre}</h3></a>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${precioHTML(p)}</span>
    <button class="btn btn-vino" style="padding:9px 16px;font-size:.85rem" onclick="anadir('${p.id}',1)">Add</button></div></div>`;
}
const GARANTIAS = [
  ["🔒", "Secure checkout", "Encrypted connection"],
  ["🚚", "Tracked shipping", () => `Free over €${ENVIO.gratisDesde}`],
  ["↩️", "14 days to return", "No questions asked"],
  ["💬", "Help choosing", "Reply within 24 h"],
];
function bandaGarantias() {
  return `<div class="garantias">${GARANTIAS.map(([i, t, d]) => `<div><span class="g-icono">${i}</span><div><strong>${t}</strong><small>${typeof d === "function" ? d() : d}</small></div></div>`).join("")}</div>`;
}

function vistaTienda() {
  const cats = ["All", ...new Set(PRODUCTOS.map(p => p.cat))];
  return `<section class="tienda-hero"><div class="contenedor">
      <div><span class="ante">The Luna Arcana shop</span>
      <h1>Decks chosen <em>one by one</em></h1>
      <p>We choose every deck for its card stock, its colours and its box. We only sell the ones we'd use ourselves.</p>
      <a class="btn btn-vino" href="#lista-productos" onclick="document.getElementById('lista-productos').scrollIntoView({behavior:'smooth'});return false">Browse decks</a>
      <a class="btn btn-linea" href="#/tienda-guia">Which one should I pick?</a></div>
      <div class="tienda-hero-foto"><img src="../img/tienda/${PRODUCTOS[0].foto}.jpg" alt=""><img src="../img/tienda/${PRODUCTOS[1].foto}.jpg" alt=""></div>
    </div></section>
    <section class="bloque" style="padding-top:34px"><div class="contenedor">
    ${bandaGarantias()}
    <div class="barra-tienda">
      <div class="filtros" style="margin:0">${cats.map((c, i) => `<button class="chip ${i === 0 ? "activo" : ""}" data-cat="${c}">${c}</button>`).join("")}</div>
      <select id="orden" aria-label="Sort by"><option value="dest">Featured</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select>
    </div>
    <div class="rejilla r4 productos" id="lista-productos">${PRODUCTOS.map((p, i) => `<div data-cat="${p.cat}" data-precio="${p.precio}" data-i="${i}">${tarjetaProducto(p)}</div>`).join("")}</div>
    <div class="nota-envio">All our decks are standard size (about 12 × 7 cm), have 78 cards and work with every spread on this site.</div>
  </div></section>`;
}
function montarFiltrosTienda() {
  document.querySelectorAll(".chip").forEach(ch => ch.onclick = () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.toggle("activo", x === ch));
    document.querySelectorAll("#lista-productos > div").forEach(d => d.style.display = ch.dataset.cat === "All" || d.dataset.cat === ch.dataset.cat ? "" : "none");
  });
  const orden = document.getElementById("orden");
  if (orden) orden.onchange = () => {
    const lista = document.getElementById("lista-productos");
    const hijos = [...lista.children];
    const v = orden.value;
    hijos.sort((x, y) => v === "dest" ? x.dataset.i - y.dataset.i : (v === "asc" ? 1 : -1) * (x.dataset.precio - y.dataset.precio));
    hijos.forEach(h => lista.appendChild(h));
  };
}

function vistaGuiaTienda() {
  const f = id => PRODUCTOS.find(p => p.id === id);
  const perfiles = [
    ["If you're just starting", "Choose a deck with the classic scenes: they're the ones every book and every guide on this site explains.", ["tarot-con-significados", "tarot-luna-dorada", "tarot-rosa"]],
    ["If you're looking for a gift", "The gold decks and the metal tin make a real impression when opened, and they last for years.", ["tarot-ojo-dorado", "tarot-vintage-lata", "tarot-dorado-clasico"]],
    ["If you already read", "Designs with personality to give your readings a fresh feel.", ["tarot-vidriera", "tarot-de-los-gatos", "tarot-holografico"]],
  ];
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/tienda">Shop</a> › Which deck should I choose?</div>
    <div class="centro estrecho" style="margin:0 auto 30px"><span class="ante">Buying guide</span><h1>Which deck should I choose?</h1>
    <p class="suave">There's no “right” deck: the best one is the one you love looking at. Still, these tips help.</p></div>
    ${perfiles.map(([t, d, ids]) => `<div class="perfil-compra"><div><h2>${t}</h2><p class="suave">${d}</p></div>
      <div class="rejilla r3 productos">${ids.map(f).filter(Boolean).map(tarjetaProducto).join("")}</div></div>`).join("")}
  </div></section>`;
}

let cantFicha = 1;
function vistaProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id);
  if (!p) return vistaNoEncontrada();
  cantFicha = 1;
  const otros = PRODUCTOS.filter(x => x.id !== p.id && x.cat === p.cat).concat(PRODUCTOS.filter(x => x.id !== p.id && x.cat !== p.cat)).slice(0, 4);
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/tienda">Shop</a> › <a href="#/tienda">${p.cat}</a> › ${p.nombre}</div>
    <div class="ficha-prod">
      <div class="producto">${fotoProducto(p)}</div>
      <div>
        <span class="ante">${p.cat}</span><h1 style="font-size:2.6rem;margin-bottom:.2em">${p.nombre}</h1>
        <div class="precio" style="font-size:2rem;margin-bottom:6px">${euros(p.precio)} <span class="suave" style="font-size:.9rem;font-family:var(--sans);font-weight:400">VAT included</span></div>
        <p class="stock">● In stock · ships in 1–3 days</p>
        <p>${p.desc}</p>
        <div style="display:flex;gap:12px;align-items:center;margin:22px 0;flex-wrap:wrap">
          <div class="cantidad"><button onclick="cambiarCantFicha(-1)" aria-label="Remove one">−</button><span id="cant-ficha">1</span><button onclick="cambiarCantFicha(1)" aria-label="Add one">+</button></div>
          <button class="btn btn-vino" style="flex:1;min-width:200px" onclick="anadir('${p.id}', cantFicha)">Add to cart · ${euros(p.precio)}</button>
        </div>
        <div class="mini-garantias"><span>🚚 Free shipping over €${ENVIO.gratisDesde}</span><span>↩️ 14 days to return</span><span>🔒 Secure payment</span></div>
        <details open><summary>What's included</summary><ul>${p.detalles.map(d => `<li>${d}</li>`).join("")}</ul></details>
        <details><summary>Shipping and delivery</summary><p>Ships within 1–3 business days and arrives in ${ENVIO.plazo} anywhere in mainland Spain, with a tracking number we'll email you. Free shipping on orders over €${ENVIO.gratisDesde}; otherwise ${euros(ENVIO.coste)}.</p></details>
        <details><summary>Returns</summary><p>You have 14 days from delivery to return it, no questions asked, as long as it's unused and in its box. If it arrives damaged, we'll send you a new one free of charge. <a href="#/legal/envios">More information</a>.</p></details>
        <details><summary>Is it good for beginners?</summary><p>All our decks follow the classic 78-card tarot, so they work with the <a href="#/tarot-gratis">spreads</a> and the <a href="#/significados">meanings</a> on this site. If you're just starting out, have a look at our <a href="#/tienda-guia">guide to choosing</a>.</p></details>
      </div>
    </div>
    <div style="margin-top:60px"><h2>You might also like</h2><div class="rejilla r4 productos" style="margin-top:20px">${otros.map(tarjetaProducto).join("")}</div></div>
  </div></section>`;
}
function cambiarCantFicha(d) { cantFicha = Math.max(1, cantFicha + d); document.getElementById("cant-ficha").textContent = cantFicha; }

// Carrito: { idProducto: cantidad }
const carrito = () => leer("la-carrito", {});
function anadir(id, n) {
  const c = carrito(); c[id] = (c[id] || 0) + n; guardar("la-carrito", c);
  pintarContador(); toast(`Added to cart: ${PRODUCTOS.find(p => p.id === id).nombre}`);
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
  if (!lineas.length) return `<section class="bloque"><div class="contenedor estrecho centro"><h1>Your cart is empty</h1><p class="suave">Take a look at our decks.</p><a class="btn btn-vino" href="#/tienda">Go to the shop</a></div></section>`;
  const falta = ENVIO.gratisDesde - sub;
  return `<section class="bloque"><div class="contenedor">
    <h1>Your cart</h1>
    <div class="ficha-prod" style="grid-template-columns:1.5fr 1fr">
      <div>${lineas.map(({ p, n }) => `<div class="linea-carrito">
          <img class="miniatura" src="../img/tienda/${p.foto}.jpg" alt="" style="object-fit:cover">
          <div><strong>${p.nombre}</strong><br><span class="suave">${euros(p.precio)}</span></div>
          <div class="cantidad"><button onclick="cambiarCant('${p.id}',-1)">−</button><span>${n}</span><button onclick="cambiarCant('${p.id}',1)">+</button></div>
          <div style="text-align:right"><strong>${euros(p.precio * n)}</strong><br><button class="quitar" onclick="cambiarCant('${p.id}',-${n})">Remove</button></div>
        </div>`).join("")}
        ${falta > 0 ? `<div class="nota">You're just <strong>${euros(falta)}</strong> away from free shipping.</div>` : `<div class="ok">🎉 Your shipping is free.</div>`}
      </div>
      <div>
        <div class="totales">
          <div class="fila"><span>Subtotal</span><span>${euros(sub)}</span></div>
          <div class="fila"><span>Shipping</span><span>${envio ? euros(envio) : "Free"}</span></div>
          <div class="fila total"><span>Total</span><span>${euros(total)}</span></div>
          <p class="suave" style="font-size:.82rem">VAT included</p>
          <a class="btn btn-vino" style="width:100%;text-align:center" href="#/pedido">Checkout</a>
        </div>
      </div>
    </div>
  </div></section>`;
}
function vistaPedido() {
  const { lineas, sub, envio, total } = calcular();
  if (!lineas.length) return vistaCarrito();
  return `<section class="bloque"><div class="contenedor">
    <div class="miga"><a href="#/carrito">Cart</a> › Shipping details</div>
    <h1>Complete your order</h1>
    <div class="ficha-prod" style="grid-template-columns:1.4fr 1fr">
      <form id="form-pedido" onsubmit="return enviarPedido(event)">
        <div class="dos-col" style="margin:0">
          <div class="campo"><label>Full name</label><input name="nombre" type="text" required></div>
          <div class="campo"><label>Phone</label><input name="telefono" type="tel" required></div>
        </div>
        <div class="campo"><label>Email</label><input name="email" type="email" required></div>
        <div class="campo"><label>Address</label><input name="direccion" type="text" required></div>
        <div class="dos-col" style="margin:0">
          <div class="campo"><label>Postcode</label><input name="cp" type="text" required pattern="[0-9]{5}" title="5 digits"></div>
          <div class="campo"><label>Town or city</label><input name="poblacion" type="text" required></div>
        </div>
        <div class="campo"><label>Notes (optional)</label><textarea name="notas" rows="3"></textarea></div>
        <label class="check"><input type="checkbox" required><span>I have read and accept the <a href="#/legal/condiciones">terms of sale</a> and the <a href="#/legal/privacidad">privacy policy</a>.</span></label>
        <button class="btn btn-vino" style="margin-top:18px">Confirm order · ${euros(total)}</button>
      </form>
      <div class="totales">
        <h3>Summary</h3>
        ${lineas.map(({ p, n }) => `<div class="fila"><span>${n} × ${p.nombre}</span><span>${euros(p.precio * n)}</span></div>`).join("")}
        <div class="fila"><span>Shipping</span><span>${envio ? euros(envio) : "Free"}</span></div>
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
    <div style="font-size:3rem;color:var(--oro)">☾</div><h1>Thank you, ${esc(datos.nombre.split(" ")[0])}!</h1>
    <p>We've received your order <strong>${num}</strong> for <strong>${euros(total)}</strong>.</p>
    <p class="suave">We'll write to ${esc(datos.email)} with payment instructions and shipment tracking.</p>
    <a class="btn btn-vino" href="#/">Back to home</a></div></section>`;
  window.scrollTo(0, 0);
  return false;
}

// ---------- Lectura personalizada y contacto ----------
function vistaLecturaPersonal() {
  return `<section class="bloque"><div class="contenedor estrecho">
    <div class="centro"><span class="ante">Personal reading</span><h1>Your reading, written and sent by email</h1>
    <p class="suave">Tell us about your situation. You'll receive a detailed reading with the spread, the cards and their interpretation, to reread whenever you like. Anonymous and honest: if the cards don't say what you're hoping for, we'll tell you that too.</p></div>
    <div class="rejilla r3" style="margin:30px 0">
      <div class="tarjeta centro"><div class="icono">✉</div><h3>In writing</h3><p>A reading you can keep and come back to.</p></div>
      <div class="tarjeta centro"><div class="icono">⏱</div><h3>Within 48–72 h</h3><p>Delivered straight to your inbox.</p></div>
      <div class="tarjeta centro"><div class="icono">☾</div><h3>From €25</h3><p>3 questions · €35 for the full Celtic Cross.</p></div>
    </div>
    <form class="articulo" onsubmit="return enviarConsulta(event)">
      <div class="campo"><label>Type of reading</label><select name="tipo"><option>Three questions · €25</option><option>Full Celtic Cross · €35</option><option>Love reading · €30</option></select></div>
      <div class="dos-col" style="margin:0"><div class="campo"><label>Name (or nickname)</label><input name="nombre" type="text" required></div>
      <div class="campo"><label>Email</label><input name="email" type="email" required></div></div>
      <div class="campo"><label>Your situation and your questions</label><textarea name="consulta" rows="6" required placeholder="Tell us whatever you like, in as much detail as you want."></textarea></div>
      <label class="check"><input type="checkbox" required><span>I'm over 18 and I accept the <a href="#/legal/privacidad">privacy policy</a>. I understand that tarot is not a substitute for medical, psychological, legal or financial advice.</span></label>
      <button class="btn btn-vino" style="margin-top:18px">Send my request</button>
    </form>
  </div></section>`;
}
function enviarConsulta(e) {
  e.preventDefault();
  // Pendiente: enviar a un correo real y cobrar (enlace de pago). De momento confirma en pantalla.
  e.target.innerHTML = `<div class="ok">Received! We'll write to you within 24 h with payment instructions. Your reading will arrive 48–72 h after payment.</div>`;
  return false;
}
function vistaContacto() {
  return `<section class="bloque"><div class="contenedor estrecho"><div class="articulo">
    <h1>Contact</h1><p>Questions about an order or a reading? Write to us and we'll reply within 24 working hours.</p>
    <p>✉️ <strong>[pending: contact email]</strong><br>📱 <strong>[pending: WhatsApp]</strong></p>
  </div></div></section>`;
}
function vistaLegal(id) {
  const l = LEGAL[id];
  if (!l) return vistaNoEncontrada();
  return `<section class="bloque"><div class="contenedor estrecho"><div class="articulo"><h1>${l[0]}</h1>${l[1]}</div></div></section>`;
}
function vistaNoEncontrada() {
  return `<section class="bloque"><div class="contenedor estrecho centro"><h1>This page doesn't exist</h1><p class="suave">Perhaps the cards had another path in mind for you.</p><a class="btn btn-vino" href="#/">Back to home</a></div></section>`;
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
    case "tienda-guia": html = vistaGuiaTienda(); break;
    case "carrito": html = vistaCarrito(); break;
    case "pedido": html = vistaPedido(); break;
    case "lectura-personalizada": html = vistaLecturaPersonal(); break;
    case "contacto": html = vistaContacto(); break;
    case "legal": html = vistaLegal(sub); break;
    // Secciones añadidas desde js/extras.js: window.RUTAS_EXTRA = { "seccion": sub => html, ... }
    default: html = (window.RUTAS_EXTRA && RUTAS_EXTRA[sec]) ? RUTAS_EXTRA[sec](sub) : vistaNoEncontrada();
  }
  $app.innerHTML = html;
  if (despues) despues();
  if (window.alPintar) window.alPintar(sec, sub);  // gancho para js/extras.js
  document.querySelectorAll("nav.menu a").forEach(a => a.classList.toggle("activo", a.dataset.sec === sec || (sec === "tienda-guia" && a.dataset.sec === "tienda")));
  document.querySelector("nav.menu").classList.remove("abierto");
  // Título de la pestaña: el de la página, o el general en la portada
  const h1 = $app.querySelector("h1");
  document.title = sec && h1 ? `${h1.textContent.trim()} · Luna Arcana` : "Luna Arcana · Free tarot readings, card meanings and shop";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
document.getElementById("anio").textContent = new Date().getFullYear();
pintarContador();
router();
