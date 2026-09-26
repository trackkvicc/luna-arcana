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
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
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
  function botonesCompartir(texto, ruta, etiqueta = "Compartir") {
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
    toast(await copiar(texto + " " + url) ? "Copiado. Pégalo donde quieras 💌" : "No se ha podido copiar. Copia la dirección de arriba.");
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
      extra = `<div class="ex-racha-grande"><span class="ex-llama">🔥</span><div><strong>${r.dias} ${r.dias === 1 ? "día" : "días seguidos"}</strong> sacando tu carta del día${r.dias > 1 ? ". ¡Sigue así!" : ". Vuelve mañana y empieza tu racha."}<br><span class="suave">Tu mejor racha: ${r.max} ${r.max === 1 ? "día" : "días"}</span></div></div>`;
    }
    const nombres = elegidas.map(e => e.carta.nombre + (e.inv ? " (invertida)" : "")).join(", ");
    const texto = t.diaria ? `Mi carta del día en Luna Arcana es ${nombres}. ¿Y la tuya?` : `He hecho la tirada «${t.nombre}» en Luna Arcana y me han salido: ${nombres}. ¿Qué te sale a ti?`;
    const div = document.createElement("div");
    div.className = "ex-tras-lectura";
    div.innerHTML = `${extra}
      <p class="ex-guardado">✓ Guardada en <a href="#/mi-diario">tu diario de tiradas</a>, solo en este móvil u ordenador.</p>
      ${botonesCompartir(texto, "#/tarot-gratis/" + t.id, t.diaria ? "Compartir mi carta" : "Compartir mi tirada")}
      <p class="suave" style="margin-top:18px">¿Te quedas un rato más? <a href="#/horoscopo">Tu carta de la semana</a> · <a href="#/que-carta-eres">¿Qué carta eres?</a> · <a href="#/arcano-personal">Tu arcano personal</a></p>`;
    l.appendChild(div);
  }

  // ---------- Los 22 arcanos como personalidad ----------
  // elem: elemento tradicional de cada arcano (para la compatibilidad)
  const PERFILES = [
    { apodo: "El espíritu libre", elem: "aire", texto: "Vives con los ojos abiertos y la maleta a medio hacer. Te atrae lo nuevo, te aburre lo previsible y confías en que el camino se aclara andando.", don: "Te atreves donde otros dudan.", reto: "Mirar un poco dónde pisas antes de saltar." },
    { apodo: "Quien hace que las cosas pasen", elem: "aire", texto: "Tienes ideas y, sobre todo, manos para llevarlas a cabo. Sabes sacar partido de lo que tienes y convencer a los demás de que se puede.", don: "Iniciativa y talento para resolver.", reto: "No dispersarte en mil cosas a la vez." },
    { apodo: "La intuición", elem: "agua", texto: "Observas más de lo que hablas y casi siempre notas lo que los demás callan. Tu mundo interior es rico y necesitas tus ratos de silencio.", don: "Una intuición que rara vez falla.", reto: "Decir en voz alta lo que sientes." },
    { apodo: "Quien hace florecer", elem: "tierra", texto: "Cuidas, creas y haces que todo a tu alrededor crezca: personas, plantas, proyectos. Disfrutas de la belleza y de los placeres sencillos.", don: "Generosidad y creatividad.", reto: "Cuidarte a ti tanto como cuidas a los demás." },
    { apodo: "Quien pone orden", elem: "fuego", texto: "Cuando hay lío, tú organizas. Te gustan las cosas claras, los compromisos que se cumplen y construir sobre bases firmes.", don: "Responsabilidad y capacidad de liderar.", reto: "Soltar el control de vez en cuando." },
    { apodo: "El consejo de confianza", elem: "tierra", texto: "Eres la persona a la que se le pide consejo. Valoras la experiencia, las tradiciones que tienen sentido y aprender de quien sabe más.", don: "Buen criterio y lealtad.", reto: "Abrirte a formas de hacer distintas a la tuya." },
    { apodo: "El corazón que elige", elem: "aire", texto: "Vives las relaciones con intensidad y te importa mucho estar en paz con tus valores. Para ti, elegir bien es elegir con el corazón.", don: "Capacidad de amar y de conectar.", reto: "Decidir sin miedo a equivocarte." },
    { apodo: "Quien no se rinde", elem: "agua", texto: "Cuando te marcas una meta, vas a por ella. Tienes empuje, fuerza de voluntad y una forma de avanzar que arrastra a los demás.", don: "Determinación y constancia.", reto: "Disfrutar del viaje, no solo de llegar." },
    { apodo: "La valentía tranquila", elem: "fuego", texto: "Tu fuerza no hace ruido: es paciencia, temple y un corazón valiente. Sabes calmar las tormentas, las tuyas y las ajenas.", don: "Coraje y dulzura a la vez.", reto: "Pedir ayuda cuando te hace falta." },
    { apodo: "El buscador", elem: "tierra", texto: "Necesitas entender el porqué de las cosas. Disfrutas de tu propia compañía y tus reflexiones iluminan a quien se acerca a ti.", don: "Profundidad y sabiduría.", reto: "No aislarte más de la cuenta." },
    { apodo: "Quien fluye con los cambios", elem: "fuego", texto: "Tu vida tiene curvas y tú sabes subirte a ellas. Te adaptas rápido, aprovechas las oportunidades y rara vez te quedas mucho tiempo en el mismo sitio.", don: "Adaptabilidad y buena estrella.", reto: "Echar raíces donde merece la pena." },
    { apodo: "La balanza", elem: "aire", texto: "Tienes muy claro lo que es justo. Piensas antes de actuar, dices las cosas como son y no soportas las injusticias.", don: "Honestidad y equilibrio.", reto: "Perdonarte tus propios errores." },
    { apodo: "La mirada distinta", elem: "agua", texto: "Ves lo que otros no ven porque miras desde otro ángulo. Sabes esperar, soltar y encontrar sentido incluso en las pausas.", don: "Paciencia y creatividad.", reto: "No quedarte en pausa para siempre." },
    { apodo: "Quien se transforma", elem: "agua", texto: "Tu vida está hecha de etapas, y sabes cerrar una para abrir otra. Donde los demás ven un final, tú ves un principio.", don: "Capacidad de renacer.", reto: "Soltar con suavidad, sin cortar de golpe." },
    { apodo: "La calma que equilibra", elem: "fuego", texto: "Eres paz para quien está cerca. Unes lo que parece incompatible, mides tus pasos y encuentras el punto justo de las cosas.", don: "Paciencia y armonía.", reto: "No tragarte tus emociones por mantener la paz." },
    { apodo: "El magnetismo", elem: "tierra", texto: "Tienes una fuerza que atrae: pasión, deseo y ganas de vivir a fondo. Conoces tu lado oscuro y eso te da autenticidad.", don: "Intensidad y poder de atracción.", reto: "Que nada ni nadie te ate más de la cuenta." },
    { apodo: "Quien rompe moldes", elem: "fuego", texto: "No te conformas con lo que no funciona. Dices verdades que remueven y provocas cambios que, al final, lo mejoran todo.", don: "Valentía para romper lo que no sirve.", reto: "Construir después de derribar." },
    { apodo: "La esperanza", elem: "aire", texto: "Transmites luz y confianza incluso en los días grises. Crees en los sueños, en las personas y en que siempre hay una salida.", don: "Optimismo e inspiración.", reto: "Bajar los sueños a tierra." },
    { apodo: "La imaginación", elem: "agua", texto: "Sientes muchísimo y tu imaginación no tiene límites. Captas lo que se mueve por debajo de las cosas y tienes un mundo de sueños propio.", don: "Sensibilidad y creatividad.", reto: "No dejar que los miedos decidan por ti." },
    { apodo: "La alegría", elem: "fuego", texto: "Donde entras, se ilumina la habitación. Tu energía se contagia, das sin esperar nada a cambio y sabes disfrutar de la vida.", don: "Vitalidad y buen humor.", reto: "Permitirte también los días nublados." },
    { apodo: "La llamada", elem: "fuego", texto: "Sientes que has venido a hacer algo que importa. Sabes aprender de tu pasado y levantarte con más fuerza cada vez.", don: "Vocación y capacidad de renovarte.", reto: "No juzgarte con tanta dureza." },
    { apodo: "La plenitud", elem: "tierra", texto: "Te gustan los ciclos completos: empezar, terminar y celebrarlo. Tienes una mirada amplia, abierta al mundo y a la gente.", don: "Visión de conjunto y capacidad de logro.", reto: "No esperar a que todo sea perfecto para disfrutar." },
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
          <div class="caja"><h4>Tu don</h4><p style="margin:0">${p.don}</p></div>
          <div class="caja"><h4>Tu reto</h4><p style="margin:0">${p.reto}</p></div>
        </div>
        <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
        <p><strong>Su consejo para ti:</strong> ${c.consejo}</p>
        ${extraHTML}
        ${botonesCompartir(texto, ruta)}
        <p style="margin-top:14px"><a href="#/significados/${c.id}">Leer todo sobre ${c.nombre} →</a></p>
      </div>
    </div>`;
  }

  // ---------- Fecha con tres desplegables (va bien en móvil y con años antiguos) ----------
  function selectorFecha(id, titulo) {
    const anioHoy = new Date().getFullYear();
    let anios = ""; for (let a = anioHoy; a >= 1920; a--) anios += `<option>${a}</option>`;
    let dias = ""; for (let d = 1; d <= 31; d++) dias += `<option>${d}</option>`;
    return `<div class="campo"><label>${titulo}</label><div class="ex-fecha" id="${id}">
      <select aria-label="Día"><option value="">Día</option>${dias}</select>
      <select aria-label="Mes"><option value="">Mes</option>${MESES.map((m, i) => `<option value="${i + 1}">${m}</option>`).join("")}</select>
      <select aria-label="Año"><option value="">Año</option>${anios}</select>
    </div></div>`;
  }
  function leerFecha(id) {
    const [d, m, a] = [...document.querySelectorAll(`#${id} select`)].map(s => Number(s.value));
    if (!d || !m || !a) { toast("Elige el día, el mes y el año."); return null; }
    const f = new Date(a, m - 1, d);
    if (f.getMonth() !== m - 1) { toast(`Esa fecha no existe: ${d} de ${MESES[m - 1]}.`); return null; }
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
        anioHTML = `<div class="caja ex-caja-anio"><h4>Tu carta del año ${mio.anio.a}</h4><p style="margin:0">Este año te acompaña <a href="#/significados/${ca.id}"><strong>${ca.nombre}</strong></a>: ${ca.derecho}</p></div>`;
      }
      resultado = `<section class="bloque"><div class="contenedor">
        <div class="miga"><a href="#/descubre">Descubre</a> › <a href="#/arcano-personal">Arcano personal</a> › ${mayor(n).nombre}</div>
        ${fichaPerfil(n, {
          ante: esMio ? "Tu arcano personal" : `Arcano personal · ${NUMERALES[n]}`,
          intro: esMio ? "Sale de sumar las cifras de tu fecha de nacimiento. Es la carta que te acompaña toda la vida." : `Las personas con ${mayor(n).nombre} como arcano personal suelen ser así. ¿Te reconoces? Calcula el tuyo abajo.`,
          texto: `Mi arcano personal del tarot es ${mayor(n).nombre}: «${PERFILES[n].apodo}». ¿Cuál es el tuyo?`,
          ruta: "#/arcano-personal/" + n, extraHTML: anioHTML })}
      </div></section>`;
    }
    return `${resultado}
    <section class="bloque ${n !== null ? "oscuro" : ""}"><div class="contenedor">
      <div class="ex-dos">
        <div>
          ${n === null ? `<div class="miga"><a href="#/descubre">Descubre</a> › Arcano personal</div>` : ""}
          <span class="ante">Numerología del tarot</span>
          ${n === null ? "<h1>Descubre tu arcano personal</h1>" : "<h2>Calcula otro arcano personal</h2>"}
          <p class="suave">Cada fecha de nacimiento esconde un arcano mayor: la carta que habla de tu forma de ser, de tus dones y de lo que has venido a aprender. Pon tu fecha y lo verás al momento, junto con tu carta del año.</p>
          <form class="tarjeta" onsubmit="return LA.calcularArcano(event)">
            ${selectorFecha("f-arcano", "Tu fecha de nacimiento")}
            <button class="btn btn-oro" style="width:100%">Descubrir mi arcano</button>
            <p class="suave" style="font-size:.82rem;margin:10px 0 0">Tu fecha no sale de tu navegador: no la guardamos ni la enviamos.</p>
          </form>
        </div>
        <div class="caja ex-como">
          <h3>¿Cómo se calcula?</h3>
          <p>Se suman todas las cifras de la fecha. Por ejemplo, el 15 de marzo de 1990:</p>
          <p class="ex-cuenta">1 + 5 + 0 + 3 + 1 + 9 + 9 + 0 = <strong>28</strong></p>
          <p>Si pasa de 22, se vuelven a sumar sus cifras: 2 + 8 = <strong>10</strong>, la Rueda de la Fortuna. Si sale 22, es el Loco.</p>
          <p style="margin:0">Tu <strong>carta del año</strong> se saca igual, pero con tu día, tu mes y el año en curso.</p>
        </div>
      </div>
    </div></section>
    ${n === null ? `<section class="bloque papel"><div class="contenedor"><div class="centro"><span class="ante">Los 22 arcanos mayores</span><h2>¿Cuál será el tuyo?</h2></div>
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
    "fuego-fuego": [86, "Dos hogueras juntas: pasión, planes y chispas. Os entendéis a la primera, aunque cuando chocáis, se nota. Turnaos para ceder."],
    "agua-agua": [88, "Os entendéis sin palabras. Sois una pareja muy emocional y empática; cuidad que no os arrastre la misma ola a la vez."],
    "aire-aire": [83, "Conversaciones infinitas, ideas y risas. Mucha complicidad mental; acordaos también de bajar a los gestos y al cariño del día a día."],
    "tierra-tierra": [85, "Solidez, confianza y proyectos a largo plazo. Construís despacio y bien; meted de vez en cuando una sorpresa en la rutina."],
    "aire-fuego": [92, "El aire aviva el fuego: os motiváis, os reís y os lanzáis juntos a por todo. Una pareja con muchísima energía."],
    "agua-tierra": [91, "La tierra da forma al agua y el agua hace florecer la tierra. Estabilidad y ternura: de las combinaciones más fértiles."],
    "agua-fuego": [68, "Vapor: atracción intensa y alguna que otra tormenta. Si aprendéis a templar, cada uno aporta al otro justo lo que le falta."],
    "aire-tierra": [70, "Uno sueña y el otro aterriza. Os complementáis si respetáis vuestros ritmos: ideas nuevas con los pies en el suelo."],
    "agua-aire": [74, "Cabeza y corazón. Uno siente y el otro piensa: juntos lo veis todo, siempre que no dejéis de hablar de lo que sentís."],
    "fuego-tierra": [72, "El fuego empuja y la tierra sostiene. Os cuesta ir al mismo paso, pero juntos lográis cosas que duran."],
  };
  const NOMBRE_ELEM = { fuego: "🔥 Fuego", agua: "💧 Agua", aire: "🌬️ Aire", tierra: "🌿 Tierra" };
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
        <div class="miga"><a href="#/descubre">Descubre</a> › <a href="#/compatibilidad">Compatibilidad</a> › Resultado</div>
        <div class="centro"><span class="ante">Vuestra compatibilidad</span><h1>${mayor(a).nombre} <span class="ex-y">&</span> ${mayor(b).nombre}</h1></div>
        <div class="ex-pareja">
          <div class="ex-pareja-carta">${cartaHTML(mayor(a), { grande: true, bocaAbajo: true, extra: "ex-voltear" })}<strong>${PERFILES[a].apodo}</strong><span class="suave">${NOMBRE_ELEM[ea]}</span></div>
          <div class="ex-medidor"><div class="ex-corazon" style="--p:${nota}"><span>${nota}%</span></div><span class="ante" style="margin-top:8px">de sintonía</span></div>
          <div class="ex-pareja-carta">${cartaHTML(mayor(b), { grande: true, bocaAbajo: true, extra: "ex-voltear" })}<strong>${PERFILES[b].apodo}</strong><span class="suave">${NOMBRE_ELEM[eb]}</span></div>
        </div>
        <div class="estrecho" style="margin:30px auto 0">
          <div class="resumen"><h3>${NOMBRE_ELEM[ea].split(" ")[1]} ${ea === eb ? "con" : "y"} ${NOMBRE_ELEM[eb].split(" ")[1].toLowerCase()}</h3><p style="margin:0">${a === b ? "Tenéis el mismo arcano: os miráis en un espejo. Os entendéis de maravilla… y también os veis los defectos. " : ""}${texto}</p></div>
          <div class="lectura-item" style="margin-top:20px">${cartaHTML(cp, { grande: true })}
            <div><span class="pos">El arcano de la pareja</span><h3>${cp.nombre}</h3>
              <p>Sumando vuestros dos arcanos sale ${cp.nombre}, la carta que describe lo que construís juntos. ${cp.amor}</p>
              <p><strong>Su consejo para vosotros:</strong> ${cp.consejo}</p></div></div>
          <div class="dos-col">
            <div class="caja"><h4>${mayor(a).nombre} aporta</h4><p style="margin:0">${PERFILES[a].don}</p></div>
            <div class="caja"><h4>${mayor(b).nombre} aporta</h4><p style="margin:0">${PERFILES[b].don}</p></div>
          </div>
          <div class="centro">${botonesCompartir(`Según el tarot, ${mayor(a).nombre} y ${mayor(b).nombre} tenemos un ${nota}% de sintonía 💞 ¿Y vosotros?`, `#/compatibilidad/${a}-${b}`)}</div>
          <p class="suave centro" style="font-size:.85rem;margin-top:18px">Para pasarlo bien y hablar de vosotros: ninguna carta decide a quién quieres.</p>
        </div>
      </div></section>`;
    }
    return `${res}
    <section class="bloque ${res ? "oscuro" : ""}"><div class="contenedor">
      ${res ? "" : `<div class="miga"><a href="#/descubre">Descubre</a> › Compatibilidad</div>`}
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">Tarot y amor</span>
        ${res ? "<h2>Prueba con otra pareja</h2>" : "<h1>Compatibilidad de pareja</h1>"}
        <p class="suave">Pon las dos fechas de nacimiento. Cada una esconde un arcano mayor; juntos dicen cómo os complementáis y cuál es la carta de vuestra pareja.</p></div>
      <form class="tarjeta ex-form-pareja" onsubmit="return LA.calcularPareja(event)">
        <div class="rejilla r2">${selectorFecha("f-p1", "💗 Tu fecha de nacimiento")}${selectorFecha("f-p2", "💙 La de tu pareja (o tu crush)")}</div>
        <button class="btn btn-vino" style="width:100%">Ver nuestra compatibilidad</button>
        <p class="suave" style="font-size:.82rem;margin:10px 0 0">Las fechas no salen de tu navegador. Si lo compartes, solo se ven los arcanos, nunca las fechas.</p>
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
    ["Un sábado libre y sin planes. ¿Qué haces?", [
      ["Cojo la mochila y me voy donde me lleve el día", 0, 7], ["Me quedo en casa con un libro, una manta y silencio", 9, 2],
      ["Organizo una comida con los míos y cocino para todos", 3, 19], ["Aprovecho para avanzar ese proyecto que tengo entre manos", 1, 4]]],
    ["Tus amigos te buscan cuando…", [
      ["necesitan un consejo sensato", 5, 11], ["quieren reírse y pasarlo bien", 19, 0],
      ["algo va mal y alguien tiene que tirar del carro", 8, 7], ["necesitan que alguien les escuche sin juzgar", 14, 12]]],
    ["Ante un cambio grande e inesperado…", [
      ["Me lanzo: lo que tenga que venir, que venga", 16, 0], ["Lo acepto: si algo se acaba, es que toca otra cosa", 13, 10],
      ["Me paro, lo miro desde otro ángulo y espero", 12, 2], ["Pido consejo a alguien con experiencia", 5, 4]]],
    ["¿Qué te mueve de verdad?", [
      ["El amor y las personas que elijo", 6, 3], ["La pasión: vivir las cosas con intensidad", 15, 16],
      ["Dejar las cosas mejor de lo que me las encontré", 20, 11], ["Llegar a mis metas y verlas cumplidas", 7, 21]]],
    ["Elige un momento del día", [
      ["El amanecer", 17, 20], ["El mediodía, con todo el sol", 19, 1], ["El atardecer", 13, 14], ["La noche cerrada", 18, 2]]],
    ["Tu mayor defecto (con sinceridad)…", [
      ["Me cuesta decidirme", 12, 6], ["Me gusta llevar el mando… a veces demasiado", 4, 8],
      ["Le doy demasiadas vueltas a las cosas", 18, 9], ["Me aburro enseguida de la rutina", 10, 0]]],
    ["Si pudieras tener un superpoder…", [
      ["Leer la mente de los demás", 2, 18], ["Que se cumpla todo lo que digo", 1, 15],
      ["Viajar a cualquier lugar al instante", 21, 0], ["Hacer justicia donde falta", 11, 20]]],
    ["¿Qué dicen los demás que transmites?", [
      ["Calidez", 3, 14], ["Fuerza", 8, 4], ["Magnetismo", 15, 6], ["Esperanza", 17, 19]]],
  ];
  let respuestas = [];
  function vistaTest(sub) {
    const n = /^\d{1,2}$/.test(sub || "") && Number(sub) <= 21 ? Number(sub) : null;
    if (n !== null) {
      const mia = leer("la-test", null) === n;
      return `<section class="bloque"><div class="contenedor">
        <div class="miga"><a href="#/descubre">Descubre</a> › <a href="#/que-carta-eres">¿Qué carta eres?</a> › ${mayor(n).nombre}</div>
        ${fichaPerfil(n, {
          ante: mia ? "Tu resultado: eres…" : "Resultado del test",
          intro: mia ? "Por tus respuestas, esta es la carta del tarot que más se parece a ti." : "Alguien ha hecho el test y le ha salido esta carta. ¿Qué carta serás tú?",
          texto: `He hecho el test «¿Qué carta del tarot eres?» y soy ${mayor(n).nombre}: «${PERFILES[n].apodo}». ¿Y tú?`,
          ruta: "#/que-carta-eres/" + n,
          extraHTML: `<p><a class="btn btn-linea" href="#/que-carta-eres" style="margin-bottom:6px">${mia ? "Repetir el test" : "Hacer el test"}</a></p>` })}
      </div></section>`;
    }
    respuestas = [];
    return `<section class="bloque oscuro ex-test-fondo"><div class="contenedor estrecho">
      <div class="miga"><a href="#/descubre">Descubre</a> › ¿Qué carta eres?</div>
      <div class="centro"><span class="ante">Test del tarot · 1 minuto</span><h1>¿Qué carta del tarot eres?</h1>
      <p class="suave">${TEST.length} preguntas rápidas. Contesta lo primero que te salga, sin pensarlo mucho.</p></div>
      <div id="ex-test" class="ex-test"></div>
    </div></section>`;
  }
  function pintarPregunta() {
    const caja = document.getElementById("ex-test"); if (!caja) return;
    const i = respuestas.length;
    if (i === TEST.length) return terminarTest();
    const [preg, ops] = TEST[i];
    caja.innerHTML = `<div class="ex-progreso"><div style="width:${(i / TEST.length) * 100}%"></div></div>
      <p class="ex-num">Pregunta ${i + 1} de ${TEST.length}</p>
      <h2>${preg}</h2>
      <div class="ex-opciones">${ops.map((o, k) => `<button type="button" onclick="LA.responder(${k})"><span>${"ABCD"[k]}</span>${o[0]}</button>`).join("")}</div>
      ${i ? `<button type="button" class="ex-atras" onclick="LA.atras()">← Pregunta anterior</button>` : ""}`;
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
    ["aries", "Aries", "♈", "21 mar – 19 abr", 4], ["tauro", "Tauro", "♉", "20 abr – 20 may", 5], ["geminis", "Géminis", "♊", "21 may – 20 jun", 6],
    ["cancer", "Cáncer", "♋", "21 jun – 22 jul", 7], ["leo", "Leo", "♌", "23 jul – 22 ago", 8], ["virgo", "Virgo", "♍", "23 ago – 22 sep", 9],
    ["libra", "Libra", "♎", "23 sep – 22 oct", 11], ["escorpio", "Escorpio", "♏", "23 oct – 21 nov", 13], ["sagitario", "Sagitario", "♐", "22 nov – 21 dic", 14],
    ["capricornio", "Capricornio", "♑", "22 dic – 19 ene", 15], ["acuario", "Acuario", "♒", "20 ene – 18 feb", 17], ["piscis", "Piscis", "♓", "19 feb – 20 mar", 18],
  ].map(([id, nombre, glifo, fechas, regente]) => ({ id, nombre, glifo, fechas, regente }));

  function semana(d = new Date()) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dia = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dia);
    const anio = t.getUTCFullYear();
    const num = Math.ceil(((t - Date.UTC(anio, 0, 1)) / 864e5 + 1) / 7);
    const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (dia - 1));
    const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
    const f = x => `${x.getDate()} de ${MESES[x.getMonth()]}`;
    const desde = lunes.getMonth() === domingo.getMonth() ? lunes.getDate() : f(lunes);
    return { anio, num, texto: `del ${desde} al ${f(domingo)}` };
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
      <div class="miga"><a href="#/descubre">Descubre</a> › Horóscopo del tarot</div>
      <div class="centro estrecho" style="margin:0 auto 26px"><span class="ante">Semana ${s.texto}</span><h1>Horóscopo del tarot</h1>
      <p class="suave">Cada lunes, una carta nueva para cada signo del zodiaco: cómo viene tu semana en el amor, en el trabajo y el consejo de las cartas. Elige tu signo.</p></div>
      ${rejillaSignos(leer("la-mi-signo", null))}
    </div></section>`;
    if (!leer("la-mi-signo", null)) guardar("la-mi-signo", sg.id);
    const esMio = leer("la-mi-signo", null) === sg.id;
    const { c, suerte, numero } = cartaSemana(sg.id);
    const reg = mayor(sg.regente);
    return `<section class="bloque"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Descubre</a> › <a href="#/horoscopo">Horóscopo del tarot</a> › ${sg.nombre}</div>
      <div class="ex-resultado">
        <div class="ex-resultado-carta">${cartaHTML(c, { grande: true, bocaAbajo: true, extra: "ex-voltear" })}</div>
        <div>
          <span class="ante">${glifo(sg.glifo)} ${sg.nombre} · semana ${s.texto}</span>
          <h1>Tu carta de la semana: ${c.nombre}</h1>
          <div class="etiquetas">${c.claves.map(k => `<span>${k}</span>`).join("")}</div>
          <p style="font-size:1.08rem">${c.derecho}</p>
          <div class="dos-col">
            <div class="caja"><h4>💞 Amor</h4><p style="margin:0">${c.amor}</p></div>
            <div class="caja"><h4>💼 Trabajo y dinero</h4><p style="margin:0">${c.trabajo}</p></div>
          </div>
          <div class="caja"><h4>✨ Consejo de la semana</h4><p style="margin:0">${c.consejo}</p></div>
          <div class="ex-datos">
            <div><span>Día de suerte</span><strong>${suerte}</strong></div>
            <div><span>Número</span><strong>${numero}</strong></div>
            <div><span>Tu arcano regente</span><strong><a href="#/significados/${reg.id}">${reg.nombre}</a></strong></div>
          </div>
          ${botonesCompartir(`Mi carta de la semana (${sg.nombre}) en el horóscopo del tarot es ${c.nombre}. Mira la tuya:`, "#/horoscopo/" + sg.id)}
          ${esMio ? `<p class="suave" style="margin-top:14px">★ Es tu signo: lo verás en la portada. Vuelve el lunes, que cambia la carta.</p>` : `<p style="margin-top:14px"><button type="button" class="btn btn-linea" onclick="LA.miSigno('${sg.id}')">★ Es mi signo, recuérdalo</button></p>`}
        </div>
      </div>
    </div></section>
    <section class="bloque oscuro"><div class="contenedor"><div class="centro"><span class="ante">Los doce signos</span><h2>¿Y los demás esta semana?</h2></div>${rejillaSignos(sg.id)}</div></section>`;
  }

  // ---------- Mi diario ----------
  function vistaDiario() {
    const lista = diario(), r = racha(), actual = rachaActual();
    const diarias = lista.filter(e => e.tirada === "carta-del-dia").slice(0, 14);
    const cuenta = {};
    lista.forEach(e => e.cartas.forEach(([id]) => cuenta[id] = (cuenta[id] || 0) + 1));
    const top = Object.entries(cuenta).filter(([id]) => cartaPorId(id)).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const fechaBonita = e => { const d = new Date(e.hora); return `${d.getDate()} de ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? " de " + d.getFullYear() : ""}`; };
    const cabecera = `<div class="miga"><a href="#/descubre">Descubre</a> › Mi diario</div>
      <div class="centro estrecho" style="margin:0 auto 26px"><span class="ante">Solo para ti</span><h1>Mi diario de tiradas</h1>
      <p class="suave">Aquí se guardan solas tus tiradas y tus cartas del día, para que veas cómo cambian las cosas. Todo se queda en este móvil u ordenador: nadie más lo ve.</p></div>
      <div class="ex-stats">
        <div><span class="ex-llama">🔥</span><strong>${actual}</strong><span>${actual === 1 ? "día" : "días"} de racha</span></div>
        <div><span class="ex-llama">🏆</span><strong>${r.max || 0}</strong><span>tu mejor racha</span></div>
        <div><span class="ex-llama">☾</span><strong>${r.total || 0}</strong><span>cartas del día</span></div>
        <div><span class="ex-llama">✦</span><strong>${lista.length}</strong><span>tiradas guardadas</span></div>
      </div>`;
    if (!lista.length) return `<section class="bloque"><div class="contenedor">${cabecera}
      <div class="tarjeta centro estrecho" style="margin:30px auto 0"><div class="icono">📖</div><h3>Tu diario está vacío</h3>
      <p>Saca tu carta del día o haz cualquier tirada: se apuntará aquí sola. Si sacas la carta cada día, harás crecer tu racha 🔥</p>
      <div class="ex-compartir" style="justify-content:center"><a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Sacar mi carta del día</a><a class="btn btn-linea" href="#/tarot-gratis">Ver tiradas</a></div></div>
    </div></section>`;
    return `<section class="bloque"><div class="contenedor">${cabecera}
      ${actual === 0 || r.ultimo !== hoy() ? `<div class="nota centro">${actual ? `🔥 Llevas ${actual} ${actual === 1 ? "día" : "días"} seguidos. Saca hoy tu carta para no romper la racha.` : "Hoy aún no has sacado tu carta del día."} <a href="#/tarot-gratis/carta-del-dia"><strong>Sacarla ahora →</strong></a></div>` : ""}
      ${diarias.length ? `<h2 style="margin-top:34px">Tus últimas cartas del día</h2><div class="ex-tira">${diarias.map(e => {
        const [id, inv] = e.cartas[0]; const c = cartaPorId(id); if (!c) return "";
        return `<a href="#/significados/${c.id}">${cartaHTML(c, { invertida: !!inv })}<span>${fechaBonita(e)}</span></a>`; }).join("")}</div>` : ""}
      ${top.length ? `<h2 style="margin-top:34px">Las cartas que más te salen</h2><div class="rejilla r3">${top.map(([id, n]) => { const c = cartaPorId(id);
        return `<a class="tarjeta ex-top" href="#/significados/${c.id}">${cartaHTML(c)}<div><h3>${c.nombre}</h3><p style="margin:0">${n} ${n === 1 ? "vez" : "veces"} · ${c.claves.slice(0, 2).join(", ")}</p></div></a>`; }).join("")}</div>` : ""}
      <h2 style="margin-top:34px">Todas tus tiradas</h2>
      <div class="ex-lista">${lista.map(e => `<details>
        <summary><span class="ex-fecha-d">${fechaBonita(e)}</span> <strong>${esc(e.nombre)}</strong>${e.pregunta ? ` <em class="suave">· «${esc(e.pregunta)}»</em>` : ""}
          <span class="ex-mini">${e.cartas.slice(0, 5).map(([id, inv]) => { const c = cartaPorId(id); return c ? cartaHTML(c, { invertida: !!inv }) : ""; }).join("")}</span></summary>
        <div class="ex-lista-cartas">${e.cartas.map(([id, inv, pos]) => { const c = cartaPorId(id); if (!c) return "";
          return `<a href="#/significados/${c.id}">${cartaHTML(c, { invertida: !!inv })}<span><em>${esc(pos)}</em><br>${c.nombre}${inv ? " (invertida)" : ""}</span></a>`; }).join("")}</div>
        <p style="margin:12px 0 0"><a href="#/tarot-gratis/${e.tirada}">Volver a hacer esta tirada →</a></p>
      </details>`).join("")}</div>
      <p class="centro" style="margin-top:30px"><button type="button" class="ex-borrar" onclick="LA.borrarDiario()">Borrar mi diario</button></p>
    </div></section>`;
  }
  function borrarDiario() {
    if (!confirm("¿Seguro que quieres borrar todas tus tiradas guardadas? La racha se mantiene.")) return;
    guardar("la-diario", []); router(); toast("Diario borrado");
  }

  // ---------- Página «Descubre» (todas las novedades juntas) ----------
  const NOVEDADES = [
    ["#/arcano-personal", "✦", "Tu arcano personal", "Tu fecha de nacimiento esconde un arcano mayor. Descubre el tuyo y tu carta del año.", "Descubrir mi arcano"],
    ["#/compatibilidad", "💞", "Compatibilidad de pareja", "Dos fechas, dos arcanos y una carta para la pareja. ¿Cuánta sintonía tenéis?", "Probar con mi pareja"],
    ["#/que-carta-eres", "🃏", "¿Qué carta del tarot eres?", "Ocho preguntas rápidas y te decimos qué arcano se parece más a ti.", "Hacer el test"],
    ["#/horoscopo", "♈&#xFE0E;", "Horóscopo del tarot", "Cada lunes, una carta nueva para tu signo: amor, trabajo y consejo.", "Ver mi semana"],
    ["#/mi-diario", "📖", "Mi diario de tiradas", "Tus tiradas y tu racha de cartas del día, guardadas solo para ti.", "Abrir mi diario"],
    ["#/luna", "☽", "La luna y el tarot", "La fase de la luna de hoy, su calendario y la tirada que le toca.", "Ver la luna de hoy"],
    ["#/practica", "🎯", "Modo práctica", "Aprende las 78 cartas jugando: adivina cuál es y qué significa.", "Empezar a practicar"],
  ];
  const tarjetaNovedad = ([href, icono, titulo, texto, boton]) => `<a class="tarjeta ex-novedad" href="${href}"><div class="icono">${icono}</div><h3>${titulo}</h3><p>${texto}</p><span class="mas">${boton} →</span></a>`;
  function vistaDescubre() {
    return `<section class="bloque"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 30px"><span class="ante">Para ti, gratis</span><h1>Descubre más con el tarot</h1>
      <p class="suave">Juegos, tests y lecturas para conocerte un poco mejor, compartir con quien quieras y volver cada día.</p></div>
      <div class="rejilla r4">${NOVEDADES.map(tarjetaNovedad).join("")}
        <a class="tarjeta ex-novedad" href="#/tarot-gratis/carta-del-dia"><div class="icono">☀</div><h3>Tu carta del día</h3><p>Una carta cada día. Sácala a diario y haz crecer tu racha.</p><span class="mas">Sacar mi carta →</span></a>
      </div>
    </div></section>`;
  }

  // ---------- Portada: bloque personal ----------
  function bloquePortada() {
    const g = cartaDeHoy(), act = rachaActual();
    const cartaDia = g
      ? `<div class="ex-hoy">${cartaHTML(cartaPorId(g.id), { invertida: g.inv })}
          <div><span class="ante">Tu carta de hoy</span><h3>${cartaPorId(g.id).nombre}${g.inv ? " <span class='suave' style='font-size:.75em'>(invertida)</span>" : ""}</h3>
          <p>${cartaPorId(g.id).consejo}</p>
          <a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Leer mi carta</a></div></div>
          <p class="ex-racha">🔥 <strong>${act} ${act === 1 ? "día" : "días seguidos"}</strong> · Mañana, carta nueva. ¡Vuelve!</p>`
      : `<div class="ex-hoy">${dorsoHTML("ex-latido")}
          <div><span class="ante">Tu carta del día</span><h3>Hoy tienes una carta esperándote</h3>
          <p>Tarda un minuto: respira, baraja y elige.</p>
          <a class="btn btn-oro" href="#/tarot-gratis/carta-del-dia">Sacar mi carta</a></div></div>
          <p class="ex-racha">${act ? `🔥 Llevas <strong>${act} ${act === 1 ? "día" : "días"} seguidos</strong>. ¡No rompas la racha!` : "🔥 Sácala cada día y empieza tu racha."}</p>`;
    const miSigno = SIGNOS.find(s => s.id === leer("la-mi-signo", null));
    let sem;
    if (miSigno) {
      const { c, s } = cartaSemana(miSigno.id);
      sem = `<div class="ex-hoy">${cartaHTML(c)}
        <div><span class="ante">${glifo(miSigno.glifo)} ${miSigno.nombre} · esta semana</span><h3>${c.nombre}</h3>
        <p>${c.consejo}</p>
        <a class="btn btn-vino" href="#/horoscopo/${miSigno.id}">Leer mi semana</a></div></div>
        <p class="ex-racha">Semana ${s.texto} · <a href="#/horoscopo">cambiar de signo</a></p>`;
    } else {
      sem = `<span class="ante">Horóscopo del tarot</span><h3>¿Cómo viene tu semana?</h3><p class="suave">Elige tu signo y mira tu carta de la semana.</p>
        <div class="ex-signos ex-signos-mini">${SIGNOS.map(s => `<a href="#/horoscopo/${s.id}" title="${s.nombre}">${glifo(s.glifo)}<span>${s.nombre}</span></a>`).join("")}</div>`;
    }
    return `<section class="bloque ex-portada"><div class="contenedor">
      <div class="centro"><span class="ante">Vuelve cada día</span><h2>Tu rincón en Luna Arcana</h2></div>
      <div class="rejilla r2" style="margin-top:28px">
        <div class="tarjeta ex-panel">${cartaDia}</div>
        <div class="tarjeta ex-panel">${sem}</div>
      </div>
    </div></section>`;
  }
  function bloqueNovedades() {
    const mio = leer("la-mi-arcano", null);
    return `<section class="bloque papel"><div class="contenedor">
      <div class="centro"><span class="ante">Nuevo</span><h2>Descubre más con el tarot</h2><p class="suave">Para conocerte, para compartir y para reírte un rato.</p></div>
      <div class="rejilla r4" style="margin-top:28px">${[
        mio && mio.n >= 0 ? ["#/arcano-personal/" + mio.n, "✦", "Tu arcano: " + mayor(mio.n).nombre, PERFILES[mio.n].apodo + ". Vuelve a leerlo o calcula el de alguien más.", "Ver mi arcano"] : NOVEDADES[0],
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
    { nombre: "Luna nueva", corto: "Nueva", frase: "La luna está a oscuras y todo empieza de cero: buen momento para pensar qué quieres sembrar." },
    { nombre: "Creciente", corto: "Creciente", frase: "La luz va ganando terreno: toca dar los primeros pasos y cuidar lo que acabas de empezar." },
    { nombre: "Cuarto creciente", corto: "Cuarto crec.", frase: "Media luna que empuja: aparecen los primeros obstáculos y también las ganas de superarlos." },
    { nombre: "Gibosa creciente", corto: "Gibosa crec.", frase: "Casi llena: es momento de ajustar, pulir detalles y tener un poco de paciencia." },
    { nombre: "Luna llena", corto: "Llena", frase: "Todo se ilumina: lo que sembraste se ve claro, se celebra lo logrado y se suelta lo que pesa." },
    { nombre: "Gibosa menguante", corto: "Gibosa meng.", frase: "Pasado el momento álgido, toca agradecer, compartir lo aprendido y ordenar." },
    { nombre: "Cuarto menguante", corto: "Cuarto meng.", frase: "Media luna que se apaga: buen momento para revisar, perdonar y hacer limpieza." },
    { nombre: "Menguante", corto: "Menguante", frase: "La luz se retira: descansa, suelta lo que sobra y prepárate para empezar de nuevo." },
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
  const fechaCorta = d => `${d.getDate()} de ${MESES[d.getMonth()]}`;
  const enDias = n => n === 0 ? "hoy" : n === 1 ? "mañana" : `en ${n} días`;

  // Dibujo de la luna: disco en sombra + parte iluminada (a la derecha cuando crece, a la izquierda cuando mengua)
  let nLuna = 0;
  function svgLuna(f, tam = 120) {
    const id = "exl" + (++nLuna), r = 48, c = 50;
    const cos = Math.cos(2 * Math.PI * f), rx = Math.abs(cos) * r, gibosa = cos < 0, crece = f < 0.5;
    const exterior = crece ? 1 : 0, interior = crece ? (gibosa ? 1 : 0) : (gibosa ? 0 : 1);
    const luz = `M${c} ${c - r} A${r} ${r} 0 0 ${exterior} ${c} ${c + r} A${rx.toFixed(2)} ${r} 0 0 ${interior} ${c} ${c - r}Z`;
    return `<svg class="ex-luna-svg" viewBox="0 0 100 100" width="${tam}" height="${tam}" role="img" aria-label="Dibujo de la luna de hoy">
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
    const proximas = l.fase === 4 ? `🌕 ¡Hoy es luna llena! La próxima luna nueva, ${enDias(l.diasNueva)} (${fechaCorta(l.nueva)}).`
      : l.fase === 0 ? `🌑 ¡Hoy es luna nueva! La próxima luna llena, ${enDias(l.diasLlena)} (${fechaCorta(l.llena)}).`
      : l.diasLlena < l.diasNueva ? `🌕 Luna llena ${enDias(l.diasLlena)} (${fechaCorta(l.llena)}) · 🌑 Luna nueva ${enDias(l.diasNueva)}.`
      : `🌑 Luna nueva ${enDias(l.diasNueva)} (${fechaCorta(l.nueva)}) · 🌕 Luna llena ${enDias(l.diasLlena)}.`;
    return `<div class="ex-luna-hoy ${grande ? "ex-luna-grande" : ""}">
      <div class="ex-luna-dibujo">${svgLuna(l.f, grande ? 210 : 120)}</div>
      <div>
        <span class="ante">La luna de hoy</span>
        ${grande ? "<h1>" : "<h3>"}Hoy: ${l.nombre} <span class="ex-luna-pct">(${l.ilum} % iluminada)</span>${grande ? "</h1>" : "</h3>"}
        <p>${l.frase}</p>
        <p class="ex-luna-prox">${proximas}</p>
        <div class="ex-compartir">
          <a class="btn btn-oro" href="#/tarot-gratis/${t.id}">Hacer la tirada de ${t.id.replace("-", " ")}</a>
          ${grande ? "" : `<a class="btn btn-linea" href="#/luna">Calendario lunar</a>`}
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
      celdas += `<div class="ex-cal-dia ${i === 0 ? "hoy" : ""} ${principal ? "principal" : ""}" title="${x.nombre} · ${x.ilum} %">
        <span class="ex-cal-fecha">${i === 0 ? "Hoy" : DIAS[(d.getDay() + 6) % 7].slice(0, 3)} <strong>${d.getDate()}</strong>${i === 0 || d.getDate() === 1 ? ` <small>${MESES[d.getMonth()].slice(0, 3)}</small>` : ""}</span>
        ${svgLuna(x.f, 38)}
        <span class="ex-cal-nombre">${principal ? x.corto : x.ilum + " %"}</span>
      </div>`;
    }
    const lunares = TIRADAS.filter(t => t.cat === "lunar");
    return `<section class="bloque oscuro"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Descubre</a> › La luna y el tarot</div>
      ${bloqueLunaHoy(l, true)}
    </div></section>
    <section class="bloque"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">Los próximos 30 días</span><h2>Calendario lunar</h2>
      <p class="suave">Así va a ir cambiando la luna, día a día. Los días de luna nueva, cuartos y luna llena van marcados.</p></div>
      <div class="ex-cal">${celdas}</div>
    </div></section>
    <section class="bloque papel"><div class="contenedor">
      <div class="centro estrecho" style="margin:0 auto 24px"><span class="ante">Tarot y luna</span><h2>Las cuatro tiradas de la luna</h2>
      <p class="suave">Cada momento de la luna invita a algo distinto: empezar, empujar, celebrar o soltar. Puedes hacerlas cuando quieras, pero su momento ideal es el suyo.</p></div>
      <div class="rejilla r4">${lunares.map(tarjetaTirada).join("")}</div>
    </div></section>
    <section class="bloque"><div class="contenedor">
      <div class="centro"><span class="ante">Para entenderla</span><h2>Las ocho fases de la luna</h2></div>
      <div class="ex-fases">${FASES.map((x, i) => `<div class="${i === l.fase ? "activa" : ""}">${svgLuna(i / 8, 56)}<div><strong>${x.nombre}</strong><p>${x.frase}</p></div></div>`).join("")}</div>
      <p class="suave centro" style="font-size:.85rem;margin-top:22px">Las fases se calculan en tu navegador para la hora de tu móvil u ordenador. Pueden variar unas horas respecto a un calendario astronómico oficial.</p>
    </div></section>`;
  }

  // Aviso en las propias tiradas lunares
  function avisoTiradaLunar(id) {
    const hueco = document.querySelector("#app .centro.estrecho");
    if (!hueco || hueco.querySelector(".ex-luna-aviso")) return;
    const l = lunaDe(), t = tiradaLunar(l);
    hueco.insertAdjacentHTML("beforeend", `<div class="ex-luna-aviso">${svgLuna(l.f, 44)}<span>Hoy: <strong>${l.nombre}</strong> (${l.ilum} %). ${t.id === id ? "¡Es su momento ideal!" : `Hoy le toca más la <a href="#/tarot-gratis/${t.id}">${t.nombre.toLowerCase()}</a>, pero puedes hacer esta igual.`} <a href="#/luna">Ver calendario lunar</a></span></div>`);
  }

  // ---------- Modo práctica: aprender las 78 cartas ----------
  const GRUPOS = { todas: "Todas", mayores: "Arcanos mayores", bastos: "Bastos", copas: "Copas", espadas: "Espadas", oros: "Oros" };
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
      <div class="ex-pr-carta ${adivinar && !hecha ? "ex-pr-oculto" : ""}">${adivinar && !hecha ? cartaHTML(c, { grande: true }).replace(/alt="[^"]*"/, 'alt="¿Qué carta es?"') : cartaHTML(c, { grande: true })}</div>
      <div>
        <p class="ex-num">${GRUPOS[P.grupo]} · ${adivinar ? "Adivina la carta" : "¿Qué significa?"}</p>
        <h2>${adivinar ? "¿Qué carta es esta?" : `¿Qué palabra encaja con <em>${c.nombre}</em>?`}</h2>
        <div class="ex-opciones ex-pr-opciones">${opciones.map((o, k) => `<button type="button" class="${clase(o)}" ${hecha ? "disabled" : ""} onclick="LA.prResponder(${k})"><span>${hecha && o === correcta ? "✓" : hecha && o === elegida ? "✗" : "ABCD"[k]}</span>${esc(o)}</button>`).join("")}</div>
        ${hecha ? `<div class="ex-pr-respuesta ${bien ? "bien" : "fallo"}">
          ${bien ? `<strong>¡Muy bien! 🌟</strong> ` : `<strong>Casi.</strong> ${adivinar ? `Es <strong>${c.nombre}</strong>.` : `Con ${c.nombre} va <strong>${esc(correcta)}</strong>.`} `}
          Sus palabras clave: ${c.claves.join(", ")}.
          <a href="#/significados/${c.id}">Ver su significado →</a>
        </div>
        <button type="button" class="btn btn-vino ex-pr-sig" onclick="LA.prSiguiente()">Siguiente carta →</button>` : ""}
      </div>
    </div>`;
    pintarProgreso();
  }

  function pintarProgreso() {
    const p = progreso(), total = p.aciertos + p.fallos;
    const marcador = document.getElementById("ex-pr-marcador");
    if (marcador) marcador.innerHTML = `
      <div><span class="ex-llama">✓</span><strong>${p.aciertos}</strong><span>aciertos${total ? ` (${Math.round(100 * p.aciertos / total)} %)` : ""}</span></div>
      <div><span class="ex-llama">🔥</span><strong>${p.racha}</strong><span>racha actual</span></div>
      <div><span class="ex-llama">🏆</span><strong>${p.mejor}</strong><span>tu mejor racha</span></div>
      <div><span class="ex-llama">☾</span><strong>${dominadas(p)}</strong><span>cartas que dominas</span></div>`;
    const caja = document.getElementById("ex-pr-progreso"); if (!caja) return;
    const d = dominadas(p);
    caja.innerHTML = `<div class="centro"><span class="ante">Tu progreso</span><h2>Dominas ${d} de las 78 cartas</h2>
      <p class="suave">Una carta cuenta como dominada cuando la aciertas <strong>3 veces seguidas</strong>. Si fallas, vuelve a empezar su cuenta.</p></div>
      <div class="ex-barra ex-barra-grande"><div style="width:${(100 * d / 78).toFixed(1)}%"></div></div>
      <div class="ex-pr-grupos">${Object.keys(GRUPOS).filter(g => g !== "todas").map(g => {
        const n = MAZO.filter(c => enGrupo(c, g)).length, x = dominadas(p, g);
        return `<div><div class="ex-pr-grupo-t"><strong>${GRUPOS[g]}</strong><span>${x} / ${n}</span></div><div class="ex-barra"><div style="width:${(100 * x / n).toFixed(1)}%"></div></div></div>`;
      }).join("")}</div>
      ${d === 78 ? `<p class="nota centro">🎉 ¡Dominas las 78 cartas! Ya puedes leer el tarot sin mirar la chuleta.</p>` : ""}
      ${total ? `<p class="centro" style="margin-top:22px"><button type="button" class="ex-borrar" onclick="LA.prBorrar()">Empezar de cero</button></p>` : ""}`;
  }

  function vistaPractica() {
    P.preg = null;
    return `<section class="bloque oscuro"><div class="contenedor">
      <div class="miga"><a href="#/descubre">Descubre</a> › Modo práctica</div>
      <div class="centro estrecho" style="margin:0 auto 22px"><span class="ante">Aprende jugando</span><h1>Practica las 78 cartas</h1>
      <p class="suave">Unos minutos al día y en unas semanas reconocerás cada carta y lo que significa. Tus aciertos se guardan solo en este móvil u ordenador.</p></div>
      <div class="ex-pr-modos">
        <button type="button" class="${P.modo === "nombre" ? "activo" : ""}" onclick="LA.prModo('nombre')"><strong>🃏 Adivina la carta</strong><span>Ves el dibujo y eliges su nombre</span></button>
        <button type="button" class="${P.modo === "claves" ? "activo" : ""}" onclick="LA.prModo('claves')"><strong>✨ ¿Qué significa?</strong><span>Ves la carta y eliges su palabra clave</span></button>
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
    if (bien && p.cartas[q.c.id] === 3) toast(`¡Ya dominas ${q.c.nombre}! ☾`);
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
    if (!confirm("¿Seguro que quieres borrar tus aciertos y empezar de cero?")) return;
    guardar("la-practica", { aciertos: 0, fallos: 0, racha: 0, mejor: 0, cartas: {} }); pintarProgreso(); toast("Progreso borrado");
  }

  // ---------- Portada: la luna de hoy y el modo práctica ----------
  function bloqueLunaPortada() {
    const p = progreso(), d = dominadas(p);
    return `<section class="bloque"><div class="contenedor">
      <div class="rejilla ex-luna-portada">
        <div class="tarjeta ex-panel ex-panel-luna">${bloqueLunaHoy(lunaDe())}</div>
        <div class="tarjeta ex-panel">
          <span class="ante">Modo práctica</span><h3>Aprende las 78 cartas jugando</h3>
          <p>Adivina la carta por su dibujo o acierta lo que significa. Unos minutos al día y las tendrás dominadas.</p>
          <div class="ex-pr-mini"><div class="ex-barra"><div style="width:${(100 * d / 78).toFixed(1)}%"></div></div><span>${d ? `Dominas <strong>${d} de 78</strong>${p.mejor ? ` · mejor racha: ${p.mejor}` : ""}` : "Aún no has empezado: ¿cuántas reconoces?"}</span></div>
          <div class="ex-compartir"><a class="btn btn-vino" href="#/practica">${d || p.aciertos ? "Seguir practicando" : "Empezar a practicar"}</a></div>
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
          div.innerHTML = (c.mayor ? `<p class="nota" style="margin-top:22px">¿Será ${c.nombre} tu arcano personal? <a href="#/arcano-personal"><strong>Calcúlalo con tu fecha de nacimiento →</strong></a></p>` : "")
            + botonesCompartir(`${c.nombre} en el tarot: ${c.claves.join(", ")}. Mira lo que significa:`, "#/significados/" + c.id, "Compartir esta carta");
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
    miSigno(id) { guardar("la-mi-signo", id); toast("Hecho: lo verás en la portada ★"); router(); },
  };
})();
