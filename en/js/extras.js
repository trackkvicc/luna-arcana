// Funciones de la web que enganchan: se cargan antes que app.js.
// Todo va dentro de una función para no chocar con los nombres de app.js.
// Solo se exponen window.RUTAS_EXTRA, window.alPintar y window.LA (para los botones).
// También: la luna de hoy (#/luna) y el modo práctica para aprender las cartas (#/practica).
// Datos del usuario: solo en su navegador (localStorage), nunca salen de ahí.
window.RUTAS_EXTRA = {};

(function () {
  "use strict";

  // ---------- Utilidades ----------
  const hoy = () => new Date().toISOString().slice(0, 10);          // mismo criterio que la carta del día de app.js
  const diaAnterior = f => new Date(Date.parse(f + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);
  const MESES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DIAS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const mayor = n => MAZO[n];                                       // los 22 primeros del MAZO son los mayores, en orden
  const urlDe = ruta => location.origin + location.pathname + ruta;
  const miniCartas = (lista, clase = "") => lista.map(x => cartaHTML(x.c, { invertida: x.inv, extra: clase })).join("");

  // Reduce un número sumando sus cifras hasta que quede entre 1 y 22 (22 = el Loco)
  function reducir(n) {
    while (n > 22) n = String(n).split("").reduce((a, d) => a + Number(d), 0);
    return n === 22 ? 0 : n;
  }
  const sumaCifras = s => String(s).replace(/\D/g, "").split("").reduce((a, d) => a + Number(d), 0);

  // Generador pseudoaleatorio con semilla (misma semilla → mismo resultado)
  function azarFijo(semilla) {
    let a = semilla >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // Botones para compartir (el texto va en un atributo y lo recoge un único escuchador)
  function botonesCompartir(texto, ruta, etiqueta = "Share") {
    const wa = "https://wa.me/?text=" + encodeURIComponent(texto + " " + urlDe(ruta));
    return `<div class="ex-compartir">
      <button type="button" class="btn btn-vino" data-compartir="${esc(texto)}" data-ruta="${esc(ruta)}">↗ ${etiqueta}</button>
      <a class="btn btn-linea" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
    </div>`;
  }
  async function copiar(txt) {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
    try {
      const t = document.createElement("textarea"); t.value = txt; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
    } catch (e) { return false; }
  }
  async function compartir(texto, ruta) {
    const url = urlDe(ruta);
    if (navigator.share) {
      try { await navigator.share({ title: "Luna Arcana", text: texto, url }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    toast(await copiar(texto + " " + url) ? "Copied. Paste it wherever you like 💌" : "Couldn't copy it. Copy the address from your browser bar.");
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-compartir]");
    if (b) { e.preventDefault(); compartir(b.dataset.compartir, b.dataset.ruta || "#/"); }
  });

  // ---------- Racha y diario ----------
  function racha() { return leer("la-racha", { ultimo: null, dias: 0, max: 0, total: 0 }); }
  function apuntarDia(fecha) {
    const r = racha();
    if (r.ultimo === fecha) return r;
    r.dias = r.ultimo === diaAnterior(fecha) ? r.dias + 1 : 1;
    r.max = Math.max(r.max || 0, r.dias);
    r.total = (r.total || 0) + 1;
    r.ultimo = fecha;
    guardar("la-racha", r);
    return r;
  }
  function rachaActual() {
    const r = racha(), h = hoy();
    return r.ultimo === h || r.ultimo === diaAnterior(h) ? r.dias : 0;
  }
  const cartaDeHoy = () => { const g = leer("la-carta-dia", null); return g && g.fecha === hoy() && cartaPorId(g.id) ? g : null; };
  // Quien ya sacó la carta de hoy antes de existir la racha, que no pierda el día
  function sincronizar() { const g = cartaDeHoy(); if (g) apuntarDia(g.fecha); }

  const diario = () => leer("la-diario", []);
  const yaGuardadas = new WeakSet();

  function alMostrarLectura(l) {
    if (typeof T === "undefined" || !T || !T.t || !l.children.length || l.querySelector(".ex-tras-lectura")) return;
    const { t, elegidas } = T;
    if (!elegidas || elegidas.length !== t.n) return;
    let entradas = diario();
    const fecha = hoy();
    const repetida = t.diaria && entradas.some(e => e.tirada === t.id && e.fecha === fecha);
    if (!yaGuardadas.has(elegidas) && !repetida) {
      yaGuardadas.add(elegidas);
      const pregunta = ((document.getElementById("pregunta") || {}).value || "").trim().slice(0, 200);
      entradas.unshift({ fecha, hora: Date.now(), tirada: t.id, nombre: t.nombre, pregunta,
        cartas: elegidas.map((e, i) => [e.carta.id, e.inv ? 1 : 0, t.pos[i].t]) });
      guardar("la-diario", entradas.slice(0, 200));
    }
    yaGuardadas.add(elegidas);
    let extra = "";
    if (t.diaria) {
      const r = apuntarDia(fecha);
      extra = `<div class="ex-racha-grande"><span class="ex-llama">🔥</span><div><strong>${r.dias} ${r.dias === 1 ? "day" : "days in a row"}</strong> drawing your card of the day${r.dias > 1 ? ". Keep it up!" : ". Come back tomorrow to start your streak."}<br><span class="suave">Your best streak: ${r.max} ${r.max === 1 ? "day" : "days"}</span></div></div>`;
    }
    const nombres = elegidas.map(e => e.carta.nombre + (e.inv ? " (reversed)" : "")).join(", ");
    const texto = t.diaria ? `My card of the day on Luna Arcana is ${nombres}. What's yours?` : `I did the “${t.nombre}” spread on Luna Arcana and got: ${nombres}. What do you get?`;
    const div = document.createElement("div");
    div.className = "ex-tras-lectura";
    div.innerHTML = `${extra}
      <p class="ex-guardado">✓ Saved in <a href="#/mi-diario">your reading journal</a>, only on this phone or computer.</p>
      ${botonesCompartir(texto, "#/tarot-gratis/" + t.id, t.diaria ? "Share my card" : "Share my reading")}
      <p class="suave" style="margin-top:18px">Staying a little longer? <a href="#/horoscopo">Your card of the week</a> · <a href="#/que-carta-eres">Which card are you?</a> · <a href="#/arcano-personal">Your birth card</a></p>`;
    l.appendChild(div);
  }

  // ---------- Los 22 arcanos como personalidad ----------
  // elem: elemento tradicional de cada arcano (para la compatibilidad)
  const PERFILES = [
    { apodo: "The free spirit", elem: "aire", texto: "You live with your eyes open and your suitcase half packed. New things draw you in, predictable things bore you, and you trust that the path becomes clear as you walk it.", don: "You dare where others hesitate.", reto: "Looking where you step before you leap." },
    { apodo: "The one who makes things happen", elem: "aire", texto: "You have ideas and, above all, the hands to carry them out. You know how to make the most of what you have and convince others that it can be done.", don: "Initiative and a talent for solving problems.", reto: "Not scattering yourself across a thousand things at once." },
    { apodo: "Intuition", elem: "agua", texto: "You observe more than you speak and almost always sense what others leave unsaid. Your inner world is rich and you need your moments of silence.", don: "An intuition that rarely fails.", reto: "Saying out loud what you feel." },
    { apodo: "The one who makes things bloom", elem: "tierra", texto: "You nurture, create and help everything around you grow: people, plants, projects. You enjoy beauty and simple pleasures.", don: "Generosity and creativity.", reto: "Caring for yourself as much as you care for others." },
    { apodo: "The one who brings order", elem: "fuego", texto: "When there's chaos, you organise. You like things clear, promises kept and building on solid ground.", don: "Responsibility and a gift for leadership.", reto: "Letting go of control every now and then." },
    { apodo: "The trusted adviser", elem: "tierra", texto: "You're the person people come to for advice. You value experience, traditions that make sense and learning from those who know more.", don: "Good judgement and loyalty.", reto: "Opening up to ways of doing things that differ from yours." },
    { apodo: "The heart that chooses", elem: "aire", texto: "You live your relationships intensely and being at peace with your values matters a lot to you. For you, choosing well means choosing with your heart.", don: "The capacity to love and to connect.", reto: "Deciding without being afraid of getting it wrong." },
    { apodo: "The one who never gives up", elem: "agua", texto: "When you set yourself a goal, you go for it. You have drive, willpower and a way of moving forward that carries others along with you.", don: "Determination and perseverance.", reto: "Enjoying the journey, not just the arrival." },
    { apodo: "Quiet courage", elem: "fuego", texto: "Your strength makes no noise: it's patience, composure and a brave heart. You know how to calm storms, your own and other people's.", don: "Courage and gentleness at the same time.", reto: "Asking for help when you need it." },
    { apodo: "The seeker", elem: "tierra", texto: "You need to understand the why of things. You enjoy your own company and your reflections light the way for anyone who comes close.", don: "Depth and wisdom.", reto: "Not shutting yourself away more than you should." },
    { apodo: "The one who flows with change", elem: "fuego", texto: "Your life has twists and turns and you know how to ride them. You adapt quickly, seize opportunities and rarely stay in the same place for long.", don: "Adaptability and a lucky star.", reto: "Putting down roots where it's worth it." },
    { apodo: "The scales", elem: "aire", texto: "You know exactly what's fair. You think before you act, you tell it like it is and you can't stand injustice.", don: "Honesty and balance.", reto: "Forgiving yourself for your own mistakes." },
    { apodo: "A different way of seeing", elem: "agua", texto: "You see what others miss because you look from another angle. You know how to wait, let go and find meaning even in the pauses.", don: "Patience and creativity.", reto: "Not staying on pause forever." },
    { apodo: "The one who transforms", elem: "agua", texto: "Your life is made of chapters, and you know how to close one to open the next. Where others see an ending, you see a beginning.", don: "The ability to be reborn.", reto: "Letting go gently, without cutting things off abruptly." },
    { apodo: "The calm that balances", elem: "fuego", texto: "You bring peace to the people around you. You unite what seems incompatible, you measure your steps and you find the right balance in things.", don: "Patience and harmony.", reto: "Not swallowing your emotions just to keep the peace." },
    { apodo: "Magnetism", elem: "tierra", texto: "You have a pull that draws people in: passion, desire and a hunger to live life to the full. You know your dark side and that makes you authentic.", don: "Intensity and the power to attract.", reto: "Not letting anything or anyone tie you down too much." },
    { apodo: "The rule breaker", elem: "fuego", texto: "You don't settle for what doesn't work. You speak truths that shake things up and spark changes that, in the end, make everything better.", don: "The courage to break what no longer serves.", reto: "Building something new after tearing down." },
    { apodo: "Hope", elem: "aire", texto: "You radiate light and trust even on grey days. You believe in dreams, in people and in the idea that there's always a way out.", don: "Optimism and inspiration.", reto: "Bringing your dreams down to earth." },
    { apodo: "Imagination", elem: "agua", texto: "You feel things deeply and your imagination knows no limits. You pick up on what moves beneath the surface and you have a dream world all your own.", don: "Sensitivity and creativity.", reto: "Not letting your fears decide for you." },
    { apodo: "Joy", elem: "fuego", texto: "When you walk into a room, it lights up. Your energy is contagious, you give without expecting anything back and you know how to enjoy life.", don: "Vitality and good humour.", reto: "Allowing yourself cloudy days too." },
    { apodo: "The calling", elem: "fuego", texto: "You feel you're here to do something that matters. You learn from your past and get back up stronger every time.", don: "A sense of vocation and the ability to renew yourself.", reto: "Not judging yourself so harshly." },
    { apodo: "Wholeness", elem: "tierra", texto: "You love complete cycles: starting, finishing and celebrating. You have a broad outlook, open to the world and to people.", don: "Seeing the big picture and making things happen.", reto: "Not waiting for everything to be perfect before you enjoy it." },
  ];

  // Ficha grande de un arcano como personalidad (arcano personal y test)
  function fichaPerfil(n, { ante, intro, texto, ruta, extraHTML = "" }) {
    const c = mayor(n), p = PERFILES[n];
    return `<div class="ex-resultado">
      <div class="ex-resultado-carta">${cartaHTML(c, { grande: true, bocaAbajo: true, extra: "ex-voltear" })}</div>
      <div>
        <span class="ante">${ante}</span>
        <h1>${c.nombre}</h1>
        <p class="ex-apodo">${p.apodo}</p>
        ${intro ? `<p class="suave">${intro}</p>` : ""}
        <p style="font-size:1.08rem">${p.texto}</p>
        <div class="dos-col">
          <div class="caja"><h4>Your gift</h4><p style="margin:0">${p.don}</p></div>
          <div class="caja"><h4>Your challenge</h4><p style="margin:0">${p.reto}</p></div>
        </div>
        <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
        <p><strong>Its advice for you:</strong> ${c.consejo}</p>
        ${extraHTML}
        ${botonesCompartir(texto, ruta)}
        <p style="margin-top:14px"><a href="#/significados/${c.id}">Read all about ${c.nombre} →</a></p>
      </div>
    </div>`;
  }

  // ---------- Fecha con tres desplegables (va bien en móvil y con años antiguos) ----------
  function selectorFecha(id, titulo) {
    const anioHoy = new Date().getFullYear();
    let anios = ""; for (let a = anioHoy; a >= 1920; a--) anios += `<option>${a}</option>`;
    let dias = ""; for (let d = 1; d <= 31; d++) dias += `<option>${d}</option>`;
    return `<div class="campo"><label>${titulo}</label><div class="ex-fecha" id="${id}">
      <select aria-label="Day"><option value="">Day</option>${dias}</select>
      <select aria-label="Month"><option value="">Month</option>${MESES.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("")}</select>
      <select aria-label="Year"><option value="">Year</option>${anios}</select>
    </div></div>`;
  }
  function leerFecha(id) {
    const [d, m, a] = [...document.querySelectorAll(`#${id} select`)].map(s => Number(s.value));
    if (!d || !m || !a) { toast("Choose the day, the month and the year."); return null; }
    const f = new Date(a, m - 1, d);
    if (f.getMonth() !== m - 1) { toast(`That date doesn't exist: ${MESES[m - 1]} ${d}.`); return null; }
    return { d, m, a };
  }
  const arcanoDeFecha = f => reducir(sumaCifras(`${f.d}${f.m}${f.a}`));

  // ---------- Tu arcano personal ----------
  function vistaArcano(sub) {
    const n = sub !== undefined && /^\d{1,2}$/.test(sub) && Number(sub) <= 21 ? Number(sub) : null;
    const mio = leer("la-mi-arcano", null);
    const esMio = n !== null && mio && mio.n === n;
    let resultado = "";
    if (n !== null) {
      let anioHTML = "";
      if (esMio && mio.anio && mio.anio.a === new Date().getFullYear()) {
        const ca = mayor(mio.anio.n);
        anioHTML = `<div class="caja ex-caja-anio"><h4>Your year card for ${mio.anio.a}</h4><p style="margin:0">This year you walk alongside <a href="#/significados/${ca.id}"><strong>${ca.nombre}</strong></a>: ${ca.derecho}</p></div>`;
      }
      resultado = `<section class="bloque"><div class="contenedor">
        <div class="miga"><a href="#/descubre">Discover</a> › <a href="#/arcano-personal">Birth card</a> › ${mayor(n).nombre}</div>
        ${fichaPerfil(n, {
          ante: esMio ? "Your birth card" : `Birth card · ${NUMERALES[n]}`,
          intro: esMio ? "It comes from adding up the digits of your date of birth. It's the card that stays with you all your life." : `People with ${mayor(n).nombre} as their birth card tend to be like this. Sound like you? Work out yours below.`,
          texto: `My tarot birth card is ${mayor(n).nombre}: “${PERFILES[n].apodo}”. What's yours?`,
          ruta: "#/arcano-personal/" + n, extraHTML: anioHTML })}
      </div></section>`;
    }
    return `${resultado}
    <section class="bloque ${n !== null ? "oscuro" : ""}"><div class="contenedor">
      <div class="ex-dos">
        <div>
          ${n === null ? `<div class="miga"><a href="#/descubre">Discover</a> › Birth card</div>` : ""}
          <span class="ante">Tarot numerology</span>
          ${n === null ? "<h1>Discover your birth card</h1>" : "<h2>Work out another birth card</h2>"}
          <p class="suave">Every date of birth hides a major arcana card: the card that speaks of who you are, your gifts and what you're here to learn. Enter your date and you'll see it straight away, along with your year card.</p>
          <form class="tarjeta" onsubmit="return LA.calcularArcano(event)">
            ${selectorFecha("f-arcano", "Your date of birth")}
            <button class="btn btn-oro" style="width:100%">Reveal my birth card</button>
            <p class="suave" style="font-size:.82rem;margin:10px 0 0">Your date never leaves your browser: we don't store it or send it anywhere.</p>
          </form>
        </div>
        <div class="caja ex-como">
          <h3>How is it worked out?</h3>
          <p>Add up all the digits of the date. For example, 15 March 1990:</p>
          <p class="ex-cuenta">1 + 5 + 0 + 3 + 1 + 9 + 9 + 0 = <strong>28</strong></p>
          <p>If it's over 22, add up its digits again: 2 + 8 = <strong>10</strong>, the Wheel of Fortune. If you get 22, it's The Fool.</p>
          <p style="margin:0">Your <strong>year card</strong> is worked out the same way, but using your day, your month and the current year.</p>
        </div>
      </div>
    </div></section>
    ${n === null ? `<section class="bloque papel"><div class="contenedor"><div class="centro"><span class="ante">The 22 major arcana</span><h2>Which one will be yours?</h2></div>
      <div class="rejilla-cartas" style="margin-top:26px">${PERFILES.map((p, i) => `<a href="#/arcano-personal/${i}">${cartaHTML(mayor(i))}<span>${p.apodo}</span></a>`).join("")}</div></div></section>` : ""}`;
  }
  function calcularArcano(e) {
    e.preventDefault();
    const f = leerFecha("f-arcano"); if (!f) return false;
    const n = arcanoDeFecha(f);
    const a = new Date().getFullYear();
    guardar("la-mi-arcano", { n, anio: { a, n: reducir(sumaCifras(`${f.d}${f.m}${a}`)) } });
    location.hash = "#/arcano-personal/" + n;
    return false;
  }

  // ---------- Compatibilidad de pareja ----------
  const PAREJAS = {
    "fuego-fuego": [86, "Two bonfires together: passion, plans and sparks. You understand each other straight away, though when you clash, everyone notices. Take turns giving way."],
    "agua-agua": [88, "You understand each other without words. You're a very emotional, empathetic couple; just make sure the same wave doesn't sweep you both away at once."],
    "aire-aire": [83, "Endless conversations, ideas and laughter. Lots of mental connection; remember to come down to everyday gestures and affection too."],
    "tierra-tierra": [85, "Solidity, trust and long-term plans. You build slowly and well; slip a surprise into the routine every now and then."],
    "aire-fuego": [92, "Air fans the fire: you motivate each other, laugh together and go for everything side by side. A couple with bags of energy."],
    "agua-tierra": [91, "Earth gives water its shape and water makes the earth bloom. Stability and tenderness: one of the most fertile combinations."],
    "agua-fuego": [68, "Steam: intense attraction and the odd storm. If you learn to temper things, each of you brings the other exactly what they're missing."],
    "aire-tierra": [70, "One dreams and the other lands the plane. You complement each other if you respect each other's pace: new ideas with your feet on the ground."],
    "agua-aire": [74, "Head and heart. One feels and the other thinks: together you see the whole picture, as long as you keep talking about how you feel."],
    "fuego-tierra": [72, "Fire pushes and earth holds steady. It's hard for you to keep the same pace, but together you achieve things that last."],
  };
  const NOMBRE_ELEM = { fuego: "🔥 Fire", agua: "💧 Water", aire: "🌬️ Air", tierra: "🌿 Earth" };
  function vistaCompatibilidad(sub) {
    const m = /^(\d{1,2})-(\d{1,2})$/.exec(sub || "");
    const a = m ? Number(m[1]) : null, b = m ? Number(m[2]) : null;
    let res = "";
    if (m && a <= 21 && b <= 21) {
      const [x, y] = [a, b].sort((p, q) => p - q);
      const ea = PERFILES[a].elem, eb = PERFILES[b].elem;
      const [base, texto] = PAREJAS[[ea, eb].sort().join("-")];
      const nota = Math.min(99, base + ((x * 7 + y * 3) % 7) - 3);
      const np = reducir((x === 0 ? 22 : x) + (y === 0 ? 22 : y));
      const cp = mayor(np);
      res = `<section class="bloque"><div class="contenedor">
        <div class="miga"><a href="#/descubre">Discover</a> › <a href="#/compatibilidad">Compatibility</a> › Result</div>
        <div class="centro"><span class="ante">Your compatibility</span><h1>${mayor(a).nombre} <span class="ex-y">&</span> ${mayor(b).nombre}</h1></div>
        <div class="ex-pareja">
          <div class="ex-pareja-carta">${cartaHTML(mayor(a), { grande: true, bocaAbajo: true, extra: "ex-voltear" })}<strong>${PERFILES[a].apodo}</strong><span class="suave">${NOMBRE_ELEM[ea]}</span></div>
          <div class="ex-medidor"><div class="ex-corazon" style="--p:${nota}"><span>${nota}%</span></div><span class="ante" style="margin-top:8px">in tune</span></div>
          <div class="ex-pareja-carta">${cartaHTML(mayor(b), { grande: true, bocaAbajo: true, extra: "ex-voltear" })}<strong>${PERFILES[b].apodo}</strong><span class="suave">${NOMBRE_ELEM[eb]}</span></div>
        </div>
        <div class="estrecho" style="margin:30px auto 0">
          <div class="resumen"><h3>${NOMBRE_ELEM[ea].split(" ")[1]} ${ea === eb ? "with" : "and"} ${NOMBRE_ELEM[eb].split(" ")[1].toLowerCase()}</h3><p style="margin:0">${a === b ? "You share the same card: it's like looking in a mirror. You understand each other wonderfully… and you also see each other's flaws. " : ""}${texto}</p></div>
          <div class="lectura-item" style="margin-top:20px">${cartaHTML(cp, { grande: true })}
            <div><span class="pos">Your couple card</span><h3>${cp.nombre}</h3>
              <p>Adding your two cards together gives ${cp.nombre}, the card that describes what you build together. ${cp.amor}</p>
              <p><strong>Its advice for you both:</strong> ${cp.consejo}</p></div></div>
          <div class="dos-col">
            <div class="caja"><h4>${mayor(a).nombre} brings</h4><p style="margin:0">${PERFILES[a].don}</p></div>
            <div class="caja"><h4>${mayor(b).nombre} brings</h4><p style="margin:0">${PERFILES[b].don}</p></div>
          </div>
          <div class="centro">${botonesCompartir(`According to the tarot, ${mayor(a).nombre} and ${mayor(b).nombre} are ${nota}% in tune 💞 How about you two?`, `#/compatibilidad/${a}-${b}`)}</div>
          <p class="suave centro" style="font-size:.85rem;margin-top:18px">Just for fun and to talk about the two of you: no card decides who you love.</p>
        </div>
      </div></section>`;
    }
    return `${res}
    <section class="bloque ${res ? "oscuro" : ""}"><div class="contenedor">
      ${res ? "" : `<div class="miga"><a href="#/descubre">Discover</a> › Compatibility</div>`}
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">Tarot and love</span>
        ${res ? "<h2>Try another couple</h2>" : "<h1>Love compatibility</h1>"}
        <p class="suave">Enter both dates of birth. Each one hides a major arcana card; together they show how you complement each other and which card belongs to you as a couple.</p></div>
      <form class="tarjeta ex-form-pareja" onsubmit="return LA.calcularPareja(event)">
        <div class="rejilla r2">${selectorFecha("f-p1", "💗 Your date of birth")}${selectorFecha("f-p2", "💙 Your partner's (or your crush's)")}</div>
        <button class="btn btn-vino" style="width:100%">See our compatibility</button>
        <p class="suave" style="font-size:.82rem;margin:10px 0 0">The dates never leave your browser. If you share the result, only the cards are shown, never the dates.</p>
      </form>
    </div></section>`;
  }
  function calcularPareja(e) {
    e.preventDefault();
    const f1 = leerFecha("f-p1"); if (!f1) return false;
    const f2 = leerFecha("f-p2"); if (!f2) return false;
    location.hash = `#/compatibilidad/${arcanoDeFecha(f1)}-${arcanoDeFecha(f2)}`;
    return false;
  }

  // ---------- Test: ¿qué carta del tarot eres? ----------
  // Cada respuesta da 2 puntos a un arcano y 1 a otro
  const TEST = [
    ["A free Saturday with no plans. What do you do?", [
      ["I grab my backpack and go wherever the day takes me", 0, 7], ["I stay home with a book, a blanket and some silence", 9, 2],
      ["I organise a meal with my people and cook for everyone", 3, 19], ["I use it to push on with that project I've got going", 1, 4]]],
    ["Your friends come to you when…", [
      ["they need sensible advice", 5, 11], ["they want to laugh and have a good time", 19, 0],
      ["something's wrong and someone has to take charge", 8, 7], ["they need someone to listen without judging", 14, 12]]],
    ["Faced with a big, unexpected change…", [
      ["I dive in: whatever's coming, let it come", 16, 0], ["I accept it: if something ends, it's time for something else", 13, 10],
      ["I stop, look at it from another angle and wait", 12, 2], ["I ask someone with experience for advice", 5, 4]]],
    ["What really drives you?", [
      ["Love and the people I choose", 6, 3], ["Passion: living things intensely", 15, 16],
      ["Leaving things better than I found them", 20, 11], ["Reaching my goals and seeing them through", 7, 21]]],
    ["Pick a time of day", [
      ["Dawn", 17, 20], ["Midday, in full sun", 19, 1], ["Sunset", 13, 14], ["The dead of night", 18, 2]]],
    ["Your biggest flaw (be honest)…", [
      ["I find it hard to make up my mind", 12, 6], ["I like being in charge… sometimes too much", 4, 8],
      ["I overthink things", 18, 9], ["Routine bores me very quickly", 10, 0]]],
    ["If you could have one superpower…", [
      ["Reading other people's minds", 2, 18], ["Making everything I say come true", 1, 15],
      ["Travelling anywhere in an instant", 21, 0], ["Bringing justice wherever it's missing", 11, 20]]],
    ["What do people say you give off?", [
      ["Warmth", 3, 14], ["Strength", 8, 4], ["Magnetism", 15, 6], ["Hope", 17, 19]]],
  ];
  let respuestas = [];
  function vistaTest(sub) {
    const n = /^\d{1,2}$/.test(sub || "") && Number(sub) <= 21 ? Number(sub) : null;
    if (n !== null) {
      const mia = leer("la-test", null) === n;
      return `<section class="bloque"><div class="contenedor">
        <div class="miga"><a href="#/descubre">Discover</a> › <a href="#/que-carta-eres">Which card are you?</a> › ${mayor(n).nombre}</div>
        ${fichaPerfil(n, {
          ante: mia ? "Your result: you are…" : "Test result",
          intro: mia ? "Based on your answers, this is the tarot card most like you." : "Someone took the quiz and got this card. Which card will you be?",
          texto: `I took the “Which tarot card are you?” quiz and I'm ${mayor(n).nombre}: “${PERFILES[n].apodo}”. How about you?`,
          ruta: "#/que-carta-eres/" + n,
          extraHTML: `<p><a class="btn btn-linea" href="#/que-carta-eres" style="margin-bottom:6px">${mia ? "Take the quiz again" : "Take the quiz"}</a></p>` })}
      </div></section>`;
    }
    respuestas = [];
    return `<section class="bloque oscuro ex-test-fondo"><div class="contenedor estrecho">
      <div class="miga"><a href="#/descubre">Discover</a> › Which card are you?</div>
      <div class="centro"><span class="ante">Tarot quiz · 1 minute</span><h1>Which tarot card are you?</h1>
      <p class="suave">${TEST.length} quick questions. Answer with the first thing that comes to mind, without overthinking it.</p></div>
      <div id="ex-test" class="ex-test"></div>
    </div></section>`;
  }
  function pintarPregunta() {
    const caja = document.getElementById("ex-test"); if (!caja) return;
    const i = respuestas.length;
    if (i === TEST.length) return terminarTest();
    const [preg, ops] = TEST[i];
    caja.innerHTML = `<div class="ex-progreso"><div style="width:${(i / TEST.length) * 100}%"></div></div>
      <p class="ex-num">Question ${i + 1} of ${TEST.length}</p>
      <h2>${preg}</h2>
      <div class="ex-opciones">${ops.map((o, k) => `<button type="button" onclick="LA.responder(${k})"><span>${"ABCD"[k]}</span>${o[0]}</button>`).join("")}</div>
      ${i ? `<button type="button" class="ex-atras" onclick="LA.atras()">← Previous question</button>` : ""}`;
  }
  function terminarTest() {
    const puntos = Array(22).fill(0), ultima = Array(22).fill(-1);
    respuestas.forEach((k, i) => { const [, a, b] = TEST[i][1][k]; puntos[a] += 2; puntos[b] += 1; ultima[a] = i; });
    let mejor = 0;
    for (let n = 1; n < 22; n++) if (puntos[n] > puntos[mejor] || (puntos[n] === puntos[mejor] && ultima[n] > ultima[mejor])) mejor = n;
    guardar("la-test", mejor);
    location.hash = "#/que-carta-eres/" + mejor;
  }

  // ---------- Horóscopo del tarot semanal ----------
  const SIGNOS = [
    ["aries", "Aries", "♈", "Mar 21 – Apr 19", 4], ["tauro", "Taurus", "♉", "Apr 20 – May 20", 5], ["geminis", "Gemini", "♊", "May 21 – Jun 20", 6],
    ["cancer", "Cancer", "♋", "Jun 21 – Jul 22", 7], ["leo", "Leo", "♌", "Jul 23 – Aug 22", 8], ["virgo", "Virgo", "♍", "Aug 23 – Sep 22", 9],
    ["libra", "Libra", "♎", "Sep 23 – Oct 22", 11], ["escorpio", "Scorpio", "♏", "Oct 23 – Nov 21", 13], ["sagitario", "Sagittarius", "♐", "Nov 22 – Dec 21", 14],
    ["capricornio", "Capricorn", "♑", "Dec 22 – Jan 19", 15], ["acuario", "Aquarius", "♒", "Jan 20 – Feb 18", 17], ["piscis", "Pisces", "♓", "Feb 19 – Mar 20", 18],
  ].map(([id, nombre, glifo, fechas, regente]) => ({ id, nombre, glifo, fechas, regente }));

  function semana(d = new Date()) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dia = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dia);
    const anio = t.getUTCFullYear();
    const num = Math.ceil(((t - Date.UTC(anio, 0, 1)) / 864e5 + 1) / 7);
    const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dia - 1));
    const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
    const f = x => `${MESES[x.getMonth()]} ${x.getDate()}`;
    const hasta = lunes.getMonth() === domingo.getMonth() ? domingo.getDate() : f(domingo);
    return { anio, num, texto: `${f(lunes)} – ${hasta}` };
  }
  // Las 78 cartas se barajan con la semana como semilla: cada signo recibe una distinta, igual para todo el mundo
  function cartaSemana(signoId) {
    const s = semana();
    const i = SIGNOS.findIndex(x => x.id === signoId);
    const mezcla = [...MAZO];
    const r = azarFijo(s.anio * 100 + s.num);
    for (let k = mezcla.length - 1; k > 0; k--) { const j = Math.floor(r() * (k + 1)); [mezcla[k], mezcla[j]] = [mezcla[j], mezcla[k]]; }
    const r2 = azarFijo((s.anio * 100 + s.num) * 31 + i);
    return { c: mezcla[i], suerte: DIAS[Math.floor(r2() * 7)], numero: 1 + Math.floor(r2() * 9), s };
  }
  const glifo = g => `<span class="ex-glifo">${g}&#xFE0E;</span>`;
  const rejillaSignos = actual => `<div class="ex-signos">${SIGNOS.map(s => `<a href="#/horoscopo/${s.id}" class="${s.id === actual ? "activo" : ""}">${glifo(s.glifo)}<strong>${s.nombre}</strong><span>${s.fechas}</span></a>`).join("")}</div>`;

  function vistaHoroscopo(sub) {
    const sg = SIGNOS.find(x => x.id === sub);
    const s = semana();
    if (!sg) return `<section class="bloque"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Discover</a> › Tarot horoscope</div>
      <div class="centro estrecho" style="margin:0 auto 26px"><span class="ante">Week of ${s.texto}</span><h1>Tarot horoscope</h1>
      <p class="suave">Every Monday, a new card for each zodiac sign: how your week looks for love and work, plus the cards' advice. Choose your sign.</p></div>
      ${rejillaSignos(leer("la-mi-signo", null))}
    </div></section>`;
    if (!leer("la-mi-signo", null)) guardar("la-mi-signo", sg.id);
    const esMio = leer("la-mi-signo", null) === sg.id;
    const { c, suerte, numero } = cartaSemana(sg.id);
    const reg = mayor(sg.regente);
    return `<section class="bloque"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Discover</a> › <a href="#/horoscopo">Tarot horoscope</a> › ${sg.nombre}</div>
      <div class="ex-resultado">
        <div class="ex-resultado-carta">${cartaHTML(c, { grande: true, bocaAbajo: true, extra: "ex-voltear" })}</div>
        <div>
          <span class="ante">${glifo(sg.glifo)} ${sg.nombre} · week of ${s.texto}</span>
          <h1>Your card of the week: ${c.nombre}</h1>
          <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
          <p style="font-size:1.08rem">${c.derecho}</p>
          <div class="dos-col">
            <div class="caja"><h4>💞 Love</h4><p style="margin:0">${c.amor}</p></div>
            <div class="caja"><h4>💼 Work and money</h4><p style="margin:0">${c.trabajo}</p></div>
          </div>
          <div class="caja"><h4>✨ Advice for the week</h4><p style="margin:0">${c.consejo}</p></div>
          <div class="ex-datos">
            <div><span>Lucky day</span><strong>${suerte}</strong></div>
            <div><span>Lucky number</span><strong>${numero}</strong></div>
            <div><span>Your ruling card</span><strong><a href="#/significados/${reg.id}">${reg.nombre}</a></strong></div>
          </div>
          ${botonesCompartir(`My card of the week (${sg.nombre}) in the tarot horoscope is ${c.nombre}. Check yours:`, "#/horoscopo/" + sg.id)}
          ${esMio ? `<p class="suave" style="margin-top:14px">★ It's your sign: you'll see it on the home page. Come back on Monday for a new card.</p>` : `<p style="margin-top:14px"><button type="button" class="btn btn-linea" onclick="LA.miSigno('${sg.id}')">★ This is my sign, remember it</button></p>`}
        </div>
      </div>
    </div></section>
    <section class="bloque oscuro"><div class="contenedor"><div class="centro"><span class="ante">The twelve signs</span><h2>And the other signs this week?</h2></div>${rejillaSignos(sg.id)}</div></section>`;
  }

  // ---------- Mi diario ----------
  function vistaDiario() {
    const lista = diario(), r = racha(), actual = rachaActual();
    const diarias = lista.filter(e => e.tirada === "carta-del-dia").slice(0, 14);
    const cuenta = {};
    lista.forEach(e => e.cartas.forEach(([id]) => cuenta[id] = (cuenta[id] || 0) + 1));
    const top = Object.entries(cuenta).filter(([id]) => cartaPorId(id)).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const fechaBonita = e => { const d = new Date(e.hora); return `${MESES[d.getMonth()]} ${d.getDate()}${d.getFullYear() !== new Date().getFullYear() ? ", " + d.getFullYear() : ""}`; };
    const cabecera = `<div class="miga"><a href="#/descubre">Discover</a> › My journal</div>
      <div class="centro estrecho" style="margin:0 auto 26px"><span class="ante">Just for you</span><h1>My reading journal</h1>
      <p class="suave">Your readings and cards of the day are saved here automatically, so you can see how things change. Everything stays on this phone or computer: nobody else can see it.</p></div>
      <div class="ex-stats">
        <div><span class="ex-llama">🔥</span><strong>${actual}</strong><span>${actual === 1 ? "day" : "days"} in a row</span></div>
        <div><span class="ex-llama">🏆</span><strong>${r.max || 0}</strong><span>your best streak</span></div>
        <div><span class="ex-llama">☾</span><strong>${r.total || 0}</strong><span>cards of the day</span></div>
        <div><span class="ex-llama">✦</span><strong>${lista.length}</strong><span>saved readings</span></div>
      </div>`;
    if (!lista.length) return `<section class="bloque"><div class="contenedor">${cabecera}
      <div class="tarjeta centro estrecho" style="margin:30px auto 0"><div class="icono">📖</div><h3>Your journal is empty</h3>
      <p>Draw your card of the day or do any reading: it'll be saved here automatically. Draw a card every day and watch your streak grow 🔥</p>
      <div class="ex-compartir" style="justify-content:center"><a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Draw my card of the day</a><a class="btn btn-linea" href="#/tarot-gratis">See the spreads</a></div></div>
    </div></section>`;
    return `<section class="bloque"><div class="contenedor">${cabecera}
      ${actual === 0 || r.ultimo !== hoy() ? `<div class="nota centro">${actual ? `🔥 You're on a ${actual}-day streak. Draw today's card so you don't break it.` : "You haven't drawn your card of the day yet."} <a href="#/tarot-gratis/carta-del-dia"><strong>Draw it now →</strong></a></div>` : ""}
      ${diarias.length ? `<h2 style="margin-top:34px">Your latest cards of the day</h2><div class="ex-tira">${diarias.map(e => {
        const [id, inv] = e.cartas[0]; const c = cartaPorId(id); if (!c) return "";
        return `<a href="#/significados/${c.id}">${cartaHTML(c, { invertida: !!inv })}<span>${fechaBonita(e)}</span></a>`; }).join("")}</div>` : ""}
      ${top.length ? `<h2 style="margin-top:34px">The cards you draw most often</h2><div class="rejilla r3">${top.map(([id, n]) => { const c = cartaPorId(id);
        return `<a class="tarjeta ex-top" href="#/significados/${c.id}">${cartaHTML(c)}<div><h3>${c.nombre}</h3><p style="margin:0">${n} ${n === 1 ? "time" : "times"} · ${c.claves.slice(0, 2).join(", ")}</p></div></a>`; }).join("")}</div>` : ""}
      <h2 style="margin-top:34px">All your readings</h2>
      <div class="ex-lista">${lista.map(e => `<details>
        <summary><span class="ex-fecha-d">${fechaBonita(e)}</span> <strong>${esc((TIRADAS.find(x => x.id === e.tirada) || e).nombre)}</strong>${e.pregunta ? ` <em class="suave">· “${esc(e.pregunta)}”</em>` : ""}
          <span class="ex-mini">${e.cartas.slice(0, 5).map(([id, inv]) => { const c = cartaPorId(id); return c ? cartaHTML(c, { invertida: !!inv }) : ""; }).join("")}</span></summary>
        <div class="ex-lista-cartas">${e.cartas.map(([id, inv, pos], i) => { const c = cartaPorId(id); if (!c) return ""; const tt = TIRADAS.find(x => x.id === e.tirada); if (tt && tt.pos[i]) pos = tt.pos[i].t;
          return `<a href="#/significados/${c.id}">${cartaHTML(c, { invertida: !!inv })}<span><em>${esc(pos)}</em><br>${c.nombre}${inv ? " (reversed)" : ""}</span></a>`; }).join("")}</div>
        <p style="margin:12px 0 0"><a href="#/tarot-gratis/${e.tirada}">Do this reading again →</a></p>
      </details>`).join("")}</div>
      <p class="centro" style="margin-top:30px"><button type="button" class="ex-borrar" onclick="LA.borrarDiario()">Clear my journal</button></p>
    </div></section>`;
  }
  function borrarDiario() {
    if (!confirm("Are you sure you want to delete all your saved readings? Your streak will be kept.")) return;
    guardar("la-diario", []); router(); toast("Journal cleared");
  }

  // ---------- Página «Descubre» (todas las novedades juntas) ----------
  const NOVEDADES = [
    ["#/arcano-personal", "✦", "Your birth card", "Your date of birth hides a major arcana card. Discover yours and your year card.", "Reveal my birth card"],
    ["#/compatibilidad", "💞", "Love compatibility", "Two dates, two cards and one card for the couple. How in tune are you?", "Try it with my partner"],
    ["#/que-carta-eres", "🃏", "Which tarot card are you?", "Eight quick questions and we'll tell you which major arcana card is most like you.", "Take the quiz"],
    ["#/horoscopo", "♈&#xFE0E;", "Tarot horoscope", "Every Monday, a new card for your sign: love, work and advice.", "See my week"],
    ["#/mi-diario", "📖", "My reading journal", "Your readings and your card-of-the-day streak, saved just for you.", "Open my journal"],
    ["#/luna", "☽", "The moon and tarot", "Today's moon phase, its calendar and the spread that goes with it.", "See today's moon"],
    ["#/practica", "🎯", "Practice mode", "Learn the 78 cards by playing: guess which one it is and what it means.", "Start practising"],
  ];
  const tarjetaNovedad = ([href, icono, titulo, texto, boton]) => `<a class="tarjeta ex-novedad" href="${href}"><div class="icono">${icono}</div><h3>${titulo}</h3><p>${texto}</p><span class="mas">${boton} →</span></a>`;
  function vistaDescubre() {
    return `<section class="bloque"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 30px"><span class="ante">Just for you, free</span><h1>Discover more with tarot</h1>
      <p class="suave">Games, quizzes and readings to get to know yourself a little better, share with whoever you like and come back to every day.</p></div>
      <div class="rejilla r4">${NOVEDADES.map(tarjetaNovedad).join("")}
        <a class="tarjeta ex-novedad" href="#/tarot-gratis/carta-del-dia"><div class="icono">☀</div><h3>Your card of the day</h3><p>One card every day. Draw it daily and watch your streak grow.</p><span class="mas">Draw my card →</span></a>
      </div>
    </div></section>`;
  }

  // ---------- Portada: bloque personal ----------
  function bloquePortada() {
    const g = cartaDeHoy(), act = rachaActual();
    const cartaDia = g
      ? `<div class="ex-hoy">${cartaHTML(cartaPorId(g.id), { invertida: g.inv })}
          <div><span class="ante">Your card for today</span><h3>${cartaPorId(g.id).nombre}${g.inv ? " <span class='suave' style='font-size:.75em'>(reversed)</span>" : ""}</h3>
          <p>${cartaPorId(g.id).consejo}</p>
          <a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Read my card</a></div></div>
          <p class="ex-racha">🔥 <strong>${act} ${act === 1 ? "day" : "days in a row"}</strong> · New card tomorrow. Come back!</p>`
      : `<div class="ex-hoy">${dorsoHTML("ex-latido")}
          <div><span class="ante">Your card of the day</span><h3>There's a card waiting for you today</h3>
          <p>It takes a minute: breathe, shuffle and choose.</p>
          <a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Draw my card</a></div></div>
          <p class="ex-racha">${act ? `🔥 You're on a <strong>${act}-day streak</strong>. Don't break it!` : "🔥 Draw it every day and start a streak."}</p>`;
    const miSigno = SIGNOS.find(s => s.id === leer("la-mi-signo", null));
    let sem;
    if (miSigno) {
      const { c, s } = cartaSemana(miSigno.id);
      sem = `<div class="ex-hoy">${cartaHTML(c)}
        <div><span class="ante">${glifo(miSigno.glifo)} ${miSigno.nombre} · this week</span><h3>${c.nombre}</h3>
        <p>${c.consejo}</p>
        <a class="btn btn-vino" href="#/horoscopo/${miSigno.id}">Read my week</a></div></div>
        <p class="ex-racha">Week of ${s.texto} · <a href="#/horoscopo">change sign</a></p>`;
    } else {
      sem = `<span class="ante">Tarot horoscope</span><h3>How's your week looking?</h3><p class="suave">Pick your sign and see your card of the week.</p>
        <div class="ex-signos ex-signos-mini">${SIGNOS.map(s => `<a href="#/horoscopo/${s.id}" title="${s.nombre}">${glifo(s.glifo)}<span>${s.nombre}</span></a>`).join("")}</div>`;
    }
    return `<section class="bloque ex-portada"><div class="contenedor">
      <div class="centro"><span class="ante">Come back every day</span><h2>Your corner of Luna Arcana</h2></div>
      <div class="rejilla r2" style="margin-top:28px">
        <div class="tarjeta ex-panel">${cartaDia}</div>
        <div class="tarjeta ex-panel">${sem}</div>
      </div>
    </div></section>`;
  }
  function bloqueNovedades() {
    const mio = leer("la-mi-arcano", null);
    return `<section class="bloque papel"><div class="contenedor">
      <div class="centro"><span class="ante">New</span><h2>Discover more with tarot</h2><p class="suave">To get to know yourself, to share and to have a laugh.</p></div>
      <div class="rejilla r4" style="margin-top:28px">${[
        mio && mio.n >= 0 ? ["#/arcano-personal/" + mio.n, "✦", "Your birth card: " + mayor(mio.n).nombre, PERFILES[mio.n].apodo + ". Read it again or work out someone else's.", "See my birth card"] : NOVEDADES[0],
        NOVEDADES[1], NOVEDADES[2], NOVEDADES[4]].map(tarjetaNovedad).join("")}</div>
    </div></section>`;
  }

  // ---------- La luna ----------
  // Se parte de una luna nueva conocida (6 de enero de 2000, 18:14 UTC) y se suman lunaciones
  // de 29,530588853 días. A esa cuenta media se le aplican las correcciones principales
  // (Jean Meeus, «Astronomical Algorithms», cap. 49), que ajustan cada fase a pocos minutos.
  const SINODICO = 29.530588853;
  const RAD = Math.PI / 180;
  // tipo: 0 nueva, 0.25 cuarto creciente, 0.5 llena, 0.75 cuarto menguante → fecha (Date)
  function momentoFase(k) {
    const tipo = ((k % 1) + 1) % 1;
    const T = k / 1236.85;
    let jde = 2451550.09766 + SINODICO * k + 0.00015437 * T * T;
    const E = 1 - 0.002516 * T - 0.0000074 * T * T;
    const M = (2.5534 + 29.1053567 * k) * RAD;          // anomalía del Sol
    const Mp = (201.5643 + 385.81693528 * k) * RAD;     // anomalía de la Luna
    const F = (160.7108 + 390.67050284 * k) * RAD;      // argumento de latitud
    const s = Math.sin;
    if (tipo === 0 || tipo === 0.5) {
      const a = tipo === 0 ? [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208] : [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209];
      jde += a[0] * s(Mp) + a[1] * E * s(M) + a[2] * s(2 * Mp) + a[3] * s(2 * F) + a[4] * E * s(Mp - M) + a[5] * E * s(Mp + M) + a[6] * E * E * s(2 * M)
        - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M) - 0.00042 * s(3 * Mp);
    } else {
      jde += -0.62801 * s(Mp) + 0.17172 * E * s(M) - 0.01183 * E * s(Mp + M) + 0.00862 * s(2 * Mp) + 0.00804 * s(2 * F) + 0.00454 * E * s(Mp - M)
        + 0.00204 * E * E * s(2 * M) - 0.0018 * s(Mp - 2 * F) - 0.0007 * s(Mp + 2 * F) - 0.0004 * s(3 * Mp) - 0.00034 * E * s(2 * Mp - M);
      const W = 0.00306 - 0.00038 * E * Math.cos(M) + 0.00026 * Math.cos(Mp) - 0.00002 * Math.cos(Mp - M) + 0.00002 * Math.cos(Mp + M) + 0.00002 * Math.cos(2 * F);
      jde += tipo === 0.25 ? W : -W;
    }
    return new Date((jde - 2440587.5) * 864e5);           // día juliano → fecha
  }
  // Las fases principales alrededor de una fecha (desde el cuarto anterior hasta ~40 días después)
  function fasesCerca(fecha) {
    const k0 = Math.floor(((fecha - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) / SINODICO) - 1;
    const lista = [];
    for (let k = k0; k < k0 + 4; k++) for (const q of [0, 0.25, 0.5, 0.75]) lista.push({ q, k: k + q, f: momentoFase(k + q) });
    return lista;
  }
  const FASES = [
    { nombre: "New moon", corto: "New", frase: "The moon is dark and everything starts from scratch: a good time to think about what you want to plant." },
    { nombre: "Waxing crescent", corto: "Crescent", frase: "The light is gaining ground: time to take the first steps and look after what you've just started." },
    { nombre: "First quarter", corto: "1st quarter", frase: "A half moon that pushes: the first obstacles appear, and so does the drive to overcome them." },
    { nombre: "Waxing gibbous", corto: "Gibbous", frase: "Almost full: time to adjust, polish the details and be a little patient." },
    { nombre: "Full moon", corto: "Full", frase: "Everything lights up: what you planted is clear to see, achievements are celebrated and whatever weighs on you is released." },
    { nombre: "Waning gibbous", corto: "Gibbous", frase: "Past its peak: time to give thanks, share what you've learned and tidy up." },
    { nombre: "Last quarter", corto: "Last quarter", frase: "A half moon fading out: a good time to review, forgive and clear things out." },
    { nombre: "Waning crescent", corto: "Waning", frase: "The light is withdrawing: rest, let go of what you don't need and get ready to begin again." },
  ];
  const inicioDia = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Estado de la luna en un momento y nombre de la fase para ese día (hora local)
  function lunaDe(fecha = new Date()) {
    const t = fecha.getTime(), lista = fasesCerca(fecha);
    let i = 0; while (i < lista.length - 1 && lista[i + 1].f.getTime() <= t) i++;
    const a = lista[i], b = lista[i + 1];
    const f = (a.q + 0.25 * (t - a.f) / (b.f - a.f)) % 1;   // 0 nueva · 0,25 cuarto · 0,5 llena · 0,75 cuarto menguante
    const ilum = Math.round(100 * (1 - Math.cos(2 * Math.PI * f)) / 2);
    // Si una fase principal cae hoy, el día se llama así; si no, la fase intermedia
    const d0 = inicioDia(fecha).getTime(), d1 = d0 + 864e5;
    const hoyPrincipal = lista.find(x => x.f.getTime() >= d0 && x.f.getTime() < d1);
    const fase = hoyPrincipal ? hoyPrincipal.q * 8 : [1, 3, 5, 7][Math.floor(f * 4)];
    const proxima = q => lista.find(x => x.q === q && x.f.getTime() >= d0).f;
    const dias = x => Math.round((inicioDia(x) - inicioDia(fecha)) / 864e5);
    const llena = proxima(0.5), nueva = proxima(0);
    return { f, ilum, fase, ...FASES[fase], llena, nueva, diasLlena: dias(llena), diasNueva: dias(nueva) };
  }
  // Tirada lunar que toca: la de luna nueva o llena unos días alrededor; entre medias, creciente o menguante
  function tiradaLunar(l) {
    const id = l.fase === 0 || l.f < 0.05 || l.f > 0.95 ? "luna-nueva" : l.fase === 4 || Math.abs(l.f - 0.5) < 0.05 ? "luna-llena" : l.f < 0.5 ? "luna-creciente" : "luna-menguante";
    return TIRADAS.find(t => t.id === id);
  }
  const fechaCorta = d => `${MESES[d.getMonth()]} ${d.getDate()}`;
  const enDias = n => n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;

  // Dibujo de la luna: disco en sombra + parte iluminada (a la derecha cuando crece, a la izquierda cuando mengua)
  let nLuna = 0;
  function svgLuna(f, tam = 120) {
    const id = "exl" + (++nLuna), r = 48, c = 50;
    const cos = Math.cos(2 * Math.PI * f), rx = Math.abs(cos) * r, gibosa = cos < 0, crece = f < 0.5;
    const exterior = crece ? 1 : 0, interior = crece ? (gibosa ? 1 : 0) : (gibosa ? 0 : 1);
    const luz = `M${c} ${c - r} A${r} ${r} 0 0 ${exterior} ${c} ${c + r} A${rx.toFixed(2)} ${r} 0 0 ${interior} ${c} ${c - r}Z`;
    return `<svg class="ex-luna-svg" viewBox="0 0 100 100" width="${tam}" height="${tam}" role="img" aria-label="Drawing of today's moon">
      <defs>
        <radialGradient id="${id}l" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#fffdf6"/><stop offset=".65" stop-color="#fbeec9"/><stop offset="1" stop-color="#efd79a"/></radialGradient>
        <radialGradient id="${id}s" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#6d6390"/><stop offset="1" stop-color="#3d3358"/></radialGradient>
      </defs>
      <circle cx="${c}" cy="${c}" r="${r}" fill="url(#${id}s)" opacity=".55"/>
      <path d="${luz}" fill="url(#${id}l)"/>
      <g fill="#2b2340" opacity=".07"><circle cx="38" cy="36" r="8"/><circle cx="62" cy="58" r="11"/><circle cx="44" cy="70" r="5"/><circle cx="68" cy="30" r="4"/><circle cx="28" cy="56" r="5"/></g>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>
    </svg>`;
  }

  // Bloque «Hoy: …» (portada y página de la luna)
  function bloqueLunaHoy(l, grande = false) {
    const t = tiradaLunar(l);
    const proximas = l.fase === 4 ? `🌕 It's a full moon today! The next new moon is ${enDias(l.diasNueva)} (${fechaCorta(l.nueva)}).`
      : l.fase === 0 ? `🌑 It's a new moon today! The next full moon is ${enDias(l.diasLlena)} (${fechaCorta(l.llena)}).`
      : l.diasLlena < l.diasNueva ? `🌕 Full moon ${enDias(l.diasLlena)} (${fechaCorta(l.llena)}) · 🌑 New moon ${enDias(l.diasNueva)}.`
      : `🌑 New moon ${enDias(l.diasNueva)} (${fechaCorta(l.nueva)}) · 🌕 Full moon ${enDias(l.diasLlena)}.`;
    return `<div class="ex-luna-hoy ${grande ? "ex-luna-grande" : ""}">
      <div class="ex-luna-dibujo">${svgLuna(l.f, grande ? 210 : 120)}</div>
      <div>
        <span class="ante">Today's moon</span>
        ${grande ? "<h1>" : "<h3>"}Today: ${l.nombre} <span class="ex-luna-pct">(${l.ilum}% illuminated)</span>${grande ? "</h1>" : "</h3>"}
        <p>${l.frase}</p>
        <p class="ex-luna-prox">${proximas}</p>
        <div class="ex-compartir">
          <a class="btn btn-oro" href="#/tarot-gratis/${t.id}">Try the ${t.nombre.toLowerCase()} spread</a>
          ${grande ? "" : `<a class="btn btn-linea" href="#/luna">Moon calendar</a>`}
        </div>
      </div>
    </div>`;
  }

  // ---------- Página de la luna ----------
  function vistaLuna() {
    const ahora = new Date(), l = lunaDe(ahora);
    const hoy0 = inicioDia(ahora);
    let celdas = "";
    for (let i = 0; i < 30; i++) {
      const d = new Date(hoy0.getFullYear(), hoy0.getMonth(), hoy0.getDate() + i, 12);
      const x = lunaDe(d), principal = x.fase % 2 === 0;
      celdas += `<div class="ex-cal-dia ${i === 0 ? "hoy" : ""} ${principal ? "principal" : ""}" title="${x.nombre} · ${x.ilum}%">
        <span class="ex-cal-fecha">${i === 0 ? "Today" : DIAS[(d.getDay() + 6) % 7].slice(0, 3)} <strong>${d.getDate()}</strong>${i === 0 || d.getDate() === 1 ? ` <small>${MESES[d.getMonth()].slice(0, 3)}</small>` : ""}</span>
        ${svgLuna(x.f, 38)}
        <span class="ex-cal-nombre">${principal ? x.corto : x.ilum + "%"}</span>
      </div>`;
    }
    const lunares = TIRADAS.filter(t => t.cat === "lunar");
    return `<section class="bloque oscuro"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Discover</a> › The moon and tarot</div>
      ${bloqueLunaHoy(l, true)}
    </div></section>
    <section class="bloque"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">The next 30 days</span><h2>Moon calendar</h2>
      <p class="suave">Here's how the moon will change, day by day. New moon, quarter moon and full moon days are highlighted.</p></div>
      <div class="ex-cal">${celdas}</div>
    </div></section>
    <section class="bloque papel"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">Tarot and the moon</span><h2>The four moon spreads</h2>
      <p class="suave">Each moment of the moon invites something different: beginning, pushing forward, celebrating or letting go. You can do them whenever you like, but each one has its ideal moment.</p></div>
      <div class="rejilla r4">${lunares.map(tarjetaTirada).join("")}</div>
    </div></section>
    <section class="bloque"><div class="contenedor">
      <div class="centro"><span class="ante">Understanding the moon</span><h2>The eight phases of the moon</h2></div>
      <div class="ex-fases">${FASES.map((x, i) => `<div class="${i === l.fase ? "activa" : ""}">${svgLuna(i / 8, 56)}<div><strong>${x.nombre}</strong><p>${x.frase}</p></div></div>`).join("")}</div>
      <p class="suave centro" style="font-size:.85rem;margin-top:22px">The phases are calculated in your browser using your phone's or computer's clock. They may differ by a few hours from an official astronomical calendar.</p>
    </div></section>`;
  }

  // Aviso en las propias tiradas lunares
  function avisoTiradaLunar(id) {
    const hueco = document.querySelector("#app .centro.estrecho");
    if (!hueco || hueco.querySelector(".ex-luna-aviso")) return;
    const l = lunaDe(), t = tiradaLunar(l);
    hueco.insertAdjacentHTML("beforeend", `<div class="ex-luna-aviso">${svgLuna(l.f, 44)}<span>Today: <strong>${l.nombre}</strong> (${l.ilum}%). ${t.id === id ? "It's the perfect moment for it!" : `Today is better suited to <a href="#/tarot-gratis/${t.id}">${t.nombre.toLowerCase()}</a>, but you can still do this one.`} <a href="#/luna">See the moon calendar</a></span></div>`);
  }

  // ---------- Modo práctica: aprender las 78 cartas ----------
  const GRUPOS = { todas: "All", mayores: "Major arcana", bastos: "Wands", copas: "Cups", espadas: "Swords", oros: "Pentacles" };
  const enGrupo = (c, g) => g === "todas" || (g === "mayores" ? c.mayor : c.palo === g);
  const progreso = () => leer("la-practica", { aciertos: 0, fallos: 0, racha: 0, mejor: 0, cartas: {} });
  const dominadas = (p, g = "todas") => MAZO.filter(c => enGrupo(c, g) && (p.cartas[c.id] || 0) >= 3).length;
  const P = { modo: "nombre", grupo: "todas", preg: null, ultima: null };

  function nuevaPregunta() {
    const p = progreso();
    const monton = MAZO.filter(c => enGrupo(c, P.grupo));
    // Las que aún no dominas salen el triple de veces
    const bolsa = [];
    monton.forEach(c => { if (c.id !== P.ultima) for (let i = (p.cartas[c.id] || 0) >= 3 ? 1 : 3; i > 0; i--) bolsa.push(c); });
    const c = bolsa[Math.floor(Math.random() * bolsa.length)];
    P.ultima = c.id;
    let correcta, falsas;
    if (P.modo === "nombre") {
      correcta = c.nombre;
      falsas = barajar(monton.filter(x => x.id !== c.id)).slice(0, 3).map(x => x.nombre);
    } else {
      correcta = c.claves[Math.floor(Math.random() * c.claves.length)];
      const vistas = new Set(c.claves);
      falsas = [];
      for (const x of barajar(MAZO.filter(x => x.id !== c.id && enGrupo(x, P.grupo)))) {
        const k = x.claves[Math.floor(Math.random() * x.claves.length)];
        if (!vistas.has(k)) { vistas.add(k); falsas.push(k); }
        if (falsas.length === 3) break;
      }
    }
    P.preg = { c, correcta, opciones: barajar([correcta, ...falsas]), elegida: null };
  }

  function pintarPractica() {
    const caja = document.getElementById("ex-pr"); if (!caja) return;
    if (!P.preg) nuevaPregunta();
    const { c, correcta, opciones, elegida } = P.preg, hecha = elegida !== null, bien = elegida === correcta;
    const adivinar = P.modo === "nombre";
    const clase = o => !hecha ? "" : o === correcta ? "ok" : o === elegida ? "mal" : "apagada";
    caja.innerHTML = `<div class="ex-pr-juego">
      <div class="ex-pr-carta ${adivinar && !hecha ? "ex-pr-oculto" : ""}">${adivinar && !hecha ? cartaHTML(c, { grande: true }).replace(/alt="[^"]*"/, 'alt="Which card is it?"') : cartaHTML(c, { grande: true })}</div>
      <div>
        <p class="ex-num">${GRUPOS[P.grupo]} · ${adivinar ? "Guess the card" : "What does it mean?"}</p>
        <h2>${adivinar ? "Which card is this?" : `Which word goes with <em>${c.nombre}</em>?`}</h2>
        <div class="ex-opciones ex-pr-opciones">${opciones.map((o, k) => `<button type="button" class="${clase(o)}" ${hecha ? "disabled" : ""} onclick="LA.prResponder(${k})"><span>${hecha && o === correcta ? "✓" : hecha && o === elegida ? "✗" : "ABCD"[k]}</span>${esc(o)}</button>`).join("")}</div>
        ${hecha ? `<div class="ex-pr-respuesta ${bien ? "bien" : "fallo"}">
          ${bien ? `<strong>Well done! 🌟</strong> ` : `<strong>Almost.</strong> ${adivinar ? `It's <strong>${c.nombre}</strong>.` : `${c.nombre} goes with <strong>${esc(correcta)}</strong>.`} `}
          Its keywords: ${c.claves.join(", ")}.
          <a href="#/significados/${c.id}">See its meaning →</a>
        </div>
        <button type="button" class="btn btn-vino ex-pr-sig" onclick="LA.prSiguiente()">Next card →</button>` : ""}
      </div>
    </div>`;
    pintarProgreso();
  }

  function pintarProgreso() {
    const p = progreso(), total = p.aciertos + p.fallos;
    const marcador = document.getElementById("ex-pr-marcador");
    if (marcador) marcador.innerHTML = `
      <div><span class="ex-llama">✓</span><strong>${p.aciertos}</strong><span>correct${total ? ` (${Math.round(100 * p.aciertos / total)} %)` : ""}</span></div>
      <div><span class="ex-llama">🔥</span><strong>${p.racha}</strong><span>current streak</span></div>
      <div><span class="ex-llama">🏆</span><strong>${p.mejor}</strong><span>your best streak</span></div>
      <div><span class="ex-llama">☾</span><strong>${dominadas(p)}</strong><span>cards mastered</span></div>`;
    const caja = document.getElementById("ex-pr-progreso"); if (!caja) return;
    const d = dominadas(p);
    caja.innerHTML = `<div class="centro"><span class="ante">Your progress</span><h2>You've mastered ${d} of the 78 cards</h2>
      <p class="suave">A card counts as mastered when you get it right <strong>3 times in a row</strong>. If you miss, its count starts over.</p></div>
      <div class="ex-barra ex-barra-grande"><div style="width:${(100 * d / 78).toFixed(1)}%"></div></div>
      <div class="ex-pr-grupos">${Object.keys(GRUPOS).filter(g => g !== "todas").map(g => {
        const n = MAZO.filter(c => enGrupo(c, g)).length, x = dominadas(p, g);
        return `<div><div class="ex-pr-grupo-t"><strong>${GRUPOS[g]}</strong><span>${x} / ${n}</span></div><div class="ex-barra"><div style="width:${(100 * x / n).toFixed(1)}%"></div></div></div>`;
      }).join("")}</div>
      ${d === 78 ? `<p class="nota centro">🎉 You've mastered all 78 cards! Now you can read tarot without a cheat sheet.</p>` : ""}
      ${total ? `<p class="centro" style="margin-top:22px"><button type="button" class="ex-borrar" onclick="LA.prBorrar()">Start over</button></p>` : ""}`;
  }

  function vistaPractica() {
    P.preg = null;
    return `<section class="bloque oscuro"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Discover</a> › Practice mode</div>
      <div class="centro estrecho" style="margin:0 auto 22px"><span class="ante">Learn by playing</span><h1>Practise the 78 cards</h1>
      <p class="suave">A few minutes a day and within a few weeks you'll recognise every card and what it means. Your scores are saved only on this phone or computer.</p></div>
      <div class="ex-pr-modos">
        <button type="button" class="${P.modo === "nombre" ? "activo" : ""}" onclick="LA.prModo('nombre')"><strong>🃏 Guess the card</strong><span>See the picture and pick its name</span></button>
        <button type="button" class="${P.modo === "claves" ? "activo" : ""}" onclick="LA.prModo('claves')"><strong>✨ What does it mean?</strong><span>See the card and pick its keyword</span></button>
      </div>
      <div class="filtros" style="margin:18px 0 22px">${Object.entries(GRUPOS).map(([k, v]) => `<button type="button" class="chip ${k === P.grupo ? "activo" : ""}" onclick="LA.prGrupo('${k}')">${v}</button>`).join("")}</div>
      <div class="ex-stats ex-pr-marcador" id="ex-pr-marcador"></div>
      <div class="ex-test ex-pr" id="ex-pr"></div>
    </div></section>
    <section class="bloque"><div class="contenedor estrecho" id="ex-pr-progreso"></div></section>`;
  }

  function prResponder(k) {
    const q = P.preg; if (!q || q.elegida !== null) return;
    q.elegida = q.opciones[k];
    const p = progreso(), bien = q.elegida === q.correcta;
    if (bien) { p.aciertos++; p.racha++; p.mejor = Math.max(p.mejor, p.racha); p.cartas[q.c.id] = (p.cartas[q.c.id] || 0) + 1; }
    else { p.fallos++; p.racha = 0; p.cartas[q.c.id] = 0; }
    guardar("la-practica", p);
    if (bien && p.cartas[q.c.id] === 3) toast(`You've mastered ${q.c.nombre}! ☾`);
    pintarPractica();
    const sig = document.querySelector(".ex-pr-sig"); if (sig) sig.focus({ preventScroll: true });
  }
  function prCambiar(clave, valor) {
    P[clave] = valor; P.preg = null; P.ultima = null;
    document.querySelectorAll(".ex-pr-modos button").forEach(b => b.classList.toggle("activo", b.getAttribute("onclick").includes(`'${P.modo}'`)));
    document.querySelectorAll(".filtros .chip").forEach(b => b.classList.toggle("activo", b.getAttribute("onclick").includes(`'${P.grupo}'`)));
    pintarPractica();
  }
  function prBorrar() {
    if (!confirm("Are you sure you want to delete your scores and start over?")) return;
    guardar("la-practica", { aciertos: 0, fallos: 0, racha: 0, mejor: 0, cartas: {} }); pintarProgreso(); toast("Progress cleared");
  }

  // ---------- Portada: la luna de hoy y el modo práctica ----------
  function bloqueLunaPortada() {
    const p = progreso(), d = dominadas(p);
    return `<section class="bloque"><div class="contenedor">
      <div class="rejilla ex-luna-portada">
        <div class="tarjeta ex-panel ex-panel-luna">${bloqueLunaHoy(lunaDe())}</div>
        <div class="tarjeta ex-panel">
          <span class="ante">Practice mode</span><h3>Learn the 78 cards by playing</h3>
          <p>Guess the card from its picture or work out what it means. A few minutes a day and you'll have them mastered.</p>
          <div class="ex-pr-mini"><div class="ex-barra"><div style="width:${(100 * d / 78).toFixed(1)}%"></div></div><span>${d ? `Mastered: <strong>${d} of 78</strong>${p.mejor ? ` · best streak: ${p.mejor}` : ""}` : "You haven't started yet: how many can you recognise?"}</span></div>
          <div class="ex-compartir"><a class="btn btn-vino" href="#/practica">${d || p.aciertos ? "Keep practising" : "Start practising"}</a></div>
        </div>
      </div>
    </div></section>`;
  }

  // ---------- Rutas y enchufe tras pintar ----------
  const VISTAS = {
    "descubre": vistaDescubre,
    "arcano-personal": vistaArcano,
    "compatibilidad": vistaCompatibilidad,
    "que-carta-eres": vistaTest,
    "horoscopo": vistaHoroscopo,
    "mi-diario": vistaDiario,
    "luna": vistaLuna,
    "practica": vistaPractica,
  };
  Object.entries(VISTAS).forEach(([k, f]) => window.RUTAS_EXTRA[k] = sub => { sincronizar(); return f(sub); });
  const MIAS = Object.keys(VISTAS);

  window.alPintar = function (sec, sub) {
    try {
      sincronizar();
      if (sec === "") {
        // «Tu rincón» (carta del día + semana) justo debajo de la cabecera, para que se vea nada más entrar
        const hero = document.querySelector("#app section.hero");
        if (hero) hero.insertAdjacentHTML("afterend", bloquePortada());
        const hueco = document.getElementById("extra-inicio");
        if (hueco) hueco.innerHTML = bloqueLunaPortada() + bloqueNovedades();
      }
      if (sec === "tarot-gratis" && sub) {
        const l = document.getElementById("lectura");
        if (l) new MutationObserver(() => alMostrarLectura(l)).observe(l, { childList: true });
      }
      if (sec === "significados" && sub) {
        const c = cartaPorId(sub), hueco = document.querySelector(".ficha-carta > div:last-child");
        if (c && hueco) {
          const div = document.createElement("div");
          div.className = "ex-tras-lectura";
          div.innerHTML = (c.mayor ? `<p class="nota" style="margin-top:22px">Could ${c.nombre} be your birth card? <a href="#/arcano-personal"><strong>Work it out from your date of birth →</strong></a></p>` : "")
            + botonesCompartir(`${c.nombre} in tarot: ${c.claves.join(", ")}. See what it means:`, "#/significados/" + c.id, "Share this card");
          hueco.appendChild(div);
        }
      }
      if (sec === "que-carta-eres" && !sub) pintarPregunta();
      if (sec === "practica") pintarPractica();
      if (sec === "tarot-gratis" && sub && /^luna-/.test(sub) && TIRADAS.some(t => t.id === sub && t.cat === "lunar")) avisoTiradaLunar(sub);
      // Dar la vuelta a las cartas de resultado
      document.querySelectorAll(".ex-voltear.boca-abajo").forEach((c, i) => setTimeout(() => c.classList.remove("boca-abajo"), 350 + i * 250));
      // (el router marca el menú justo después, por eso se espera un instante)
      if (MIAS.includes(sec)) setTimeout(() => { const a = document.querySelector('nav.menu a[data-sec="descubre"]'); if (a) a.classList.add("activo"); }, 0);
    } catch (e) { console.error("extras.js", e); }
  };

  // Lo que llaman los botones de la página
  window.LA = {
    calcularArcano, calcularPareja, borrarDiario, prResponder, prBorrar,
    prSiguiente() { nuevaPregunta(); pintarPractica(); },
    prModo(m) { prCambiar("modo", m); },
    prGrupo(g) { prCambiar("grupo", g); },
    responder(k) { respuestas.push(k); pintarPregunta(); },
    atras() { respuestas.pop(); pintarPregunta(); },
    miSigno(id) { guardar("la-mi-signo", id); toast("Done: you'll see it on the home page ★"); router(); },
  };
})();
