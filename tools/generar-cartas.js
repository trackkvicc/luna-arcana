// Genera una página HTML fija por carta (para que Google las encuentre), un índice,
// sitemap.xml y robots.txt.  Uso:  node tools/generar-cartas.js [es|en]
// Lee los datos de js/cartas.js (es) o en/js/cartas.js (en).
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const BASE = "https://trackkvicc.github.io/luna-arcana/";
const LANG = process.argv[2] || "es";

const T = {
  es: {
    datos: "js/cartas.js", carpeta: "cartas", prefijo: "", html: "es",
    titulo: c => `${c.nombre} en el tarot: significado, amor, trabajo y consejo`,
    desc: c => `Qué significa ${c.nombre} en el tarot, al derecho y invertida: amor, trabajo, dinero, consejo y si es sí o no. ${c.claves.slice(0, 3).join(", ")}.`,
    menu: [["tarot-gratis", "Tarot gratis"], ["significados", "Significados"], ["aprende", "Aprende"], ["tienda", "Tienda"], ["descubre", "Descubre ✨"]],
    miga: "Significados", mayor: "Arcano mayor", menor: "Arcano menor", palo: "Palo", elemento: "Elemento / astro", numero: "Número",
    claves: "Palabras clave", derecha: "Al derecho", invertida: "Invertida", amor: "En el amor", trabajo: "En el trabajo y el dinero",
    consejo: "Consejo", sino: "¿Sí o no?", tiempos: "En pasado, presente y futuro",
    pasado: "En el pasado", presente: "En el presente", futuro: "En el futuro",
    tpas: c => `Algo de ${c.claves[0]} ya ha marcado el camino. Mira qué aprendiste de ello.`,
    tpre: c => `Ahora mismo toca ${c.claves[0]}${c.claves[1] ? " y " + c.claves[1] : ""}. Es la energía del momento.`,
    tfut: c => `Se acerca una etapa de ${c.claves[c.claves.length - 1]}. Prepárate para recibirla.`,
    sinoTxt: { "sí": "Es una carta de «sí». Si sale invertida, la respuesta se suaviza a «quizás».", "no": "Es una carta de «no», al menos por ahora. Invertida, abre la puerta a un «quizás».", "quizás": "Es una carta de «quizás»: la respuesta depende de lo que hagas tú. Invertida, se inclina hacia el «no»." },
    faq: "Preguntas frecuentes",
    q1: c => `¿Qué significa ${c.nombre} en el tarot?`, q2: c => `¿${c.nombre} es sí o no?`, q3: c => `¿Qué significa ${c.nombre} invertida?`,
    tirada: "Haz una tirada gratis", tiradaTxt: "Baraja, elige tus cartas y descubre qué te dicen hoy.",
    todas: "Ver las 78 cartas", ant: "Anterior", sig: "Siguiente",
    idxTitulo: "Significado de las 78 cartas del tarot", idxDesc: "Guía completa de las 78 cartas del tarot: arcanos mayores y menores, al derecho e invertidas, en el amor, el trabajo y el dinero.",
    mayores: "Arcanos mayores", pie: "El tarot es una herramienta de reflexión y entretenimiento. No sustituye el consejo de profesionales.",
  },
  en: {
    datos: "en/js/cartas.js", carpeta: "en/cards", prefijo: "en/", html: "en",
    titulo: c => `${c.nombre} tarot card meaning: love, career and advice`,
    desc: c => `What ${c.nombre} means in tarot, upright and reversed: love, career, money, advice and whether it's a yes or no. ${c.claves.slice(0, 3).join(", ")}.`,
    menu: [["tarot-gratis", "Free readings"], ["significados", "Card meanings"], ["aprende", "Learn"], ["tienda", "Shop"], ["descubre", "Discover ✨"]],
    miga: "Card meanings", mayor: "Major Arcana", menor: "Minor Arcana", palo: "Suit", elemento: "Element / planet", numero: "Number",
    claves: "Keywords", derecha: "Upright", invertida: "Reversed", amor: "Love", trabajo: "Career and money",
    consejo: "Advice", sino: "Yes or no?", tiempos: "Past, present and future",
    pasado: "In the past", presente: "In the present", futuro: "In the future",
    tpas: c => `Some ${c.claves[0]} has already shaped your path. Look at what it taught you.`,
    tpre: c => `Right now it's about ${c.claves[0]}${c.claves[1] ? " and " + c.claves[1] : ""}. That's the energy of the moment.`,
    tfut: c => `A time of ${c.claves[c.claves.length - 1]} is coming. Get ready to welcome it.`,
    sinoTxt: { "sí": "It's a “yes” card. Reversed, the answer softens to “maybe”.", "no": "It's a “no” card, at least for now. Reversed, it opens the door to a “maybe”.", "quizás": "It's a “maybe” card: the answer depends on what you do. Reversed, it leans towards “no”." },
    faq: "Frequently asked questions",
    q1: c => `What does ${c.nombre} mean in tarot?`, q2: c => `Is ${c.nombre} a yes or no card?`, q3: c => `What does ${c.nombre} reversed mean?`,
    tirada: "Try a free reading", tiradaTxt: "Shuffle, pick your cards and see what they tell you today.",
    todas: "See all 78 cards", ant: "Previous", sig: "Next",
    idxTitulo: "Meaning of all 78 tarot cards", idxDesc: "Complete guide to the 78 tarot cards: Major and Minor Arcana, upright and reversed, for love, career and money.",
    mayores: "Major Arcana", pie: "Tarot is a tool for reflection and entertainment. It doesn't replace professional advice.",
  },
}[LANG];

// Cargar los datos (el fichero declara constantes globales)
const src = fs.readFileSync(path.join(RAIZ, T.datos), "utf8");
const { MAZO, PALOS, NUMERALES } = new Function(src + "; return { MAZO, PALOS, NUMERALES };")();

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nivel = T.carpeta.split("/").length + 1; // cartas/<id>/ → 2 ; en/cards/<id>/ → 3
const up = n => "../".repeat(n);

function plantilla({ titulo, desc, url, imagen, cuerpo, profundidad, jsonld = "" }) {
  const r = up(profundidad);
  const app = r + T.prefijo; // la web interactiva del idioma
  return `<!doctype html>
<html lang="${T.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} | Luna Arcana</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Luna Arcana">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${imagen}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}img/favicon-32.png"><link rel="apple-touch-icon" href="${r}img/apple-touch-icon.png">
<meta name="theme-color" content="#fbf7f1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}css/estilo.css">
<style>
.ficha-seo { display: grid; grid-template-columns: 300px 1fr; gap: 44px; align-items: start; }
.ficha-seo .imgcarta { width: 100%; height: auto; aspect-ratio: 720 / 1230; object-fit: cover; border-radius: 14px; box-shadow: 0 16px 40px rgba(43,35,64,.25); display: block; }
.ficha-seo .invertida-img { transform: rotate(180deg); }
.datos { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: .95rem; }
.datos th, .datos td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--linea); vertical-align: top; }
.datos th { color: var(--gris); font-weight: 600; width: 40%; }
.rejilla-idx { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px 14px; }
.rejilla-idx a { text-decoration: none; color: var(--tinta); font-size: .88rem; text-align: center; font-weight: 500; }
.rejilla-idx img { width: 100%; height: auto; border-radius: 10px; box-shadow: 0 8px 20px rgba(43,35,64,.2); display: block; margin-bottom: 6px; }
@media (max-width: 800px) { .ficha-seo { grid-template-columns: 1fr; } .ficha-seo > div:first-child { max-width: 260px; margin: 0 auto; } }
</style>
${jsonld}
</head>
<body>
<header class="cab"><div class="contenedor">
  <a class="marca" href="${app}"><img class="simbolo" src="${r}img/simbolo.svg" alt="" width="23" height="30"> Luna Arcana</a>
  <nav class="menu" style="display:flex">${T.menu.map(([h, t]) => `<a href="${app}#/${h}">${t}</a>`).join("")}</nav>
</div></header>
<main>${cuerpo}</main>
<footer class="pie"><div class="contenedor"><p>${T.pie}</p><p><a href="${app}" style="display:inline">Luna Arcana</a></p></div></footer>
</body>
</html>`;
}

function paginaCarta(c, i) {
  const ant = MAZO[(i + MAZO.length - 1) % MAZO.length], sig = MAZO[(i + 1) % MAZO.length];
  const url = `${BASE}${T.carpeta}/${c.id}/`;
  const img = `${up(nivel)}img/cartas/${c.id}.jpg`;
  const app = up(nivel) + T.prefijo;
  const tipo = c.mayor ? `${T.mayor} ${NUMERALES[c.n]}` : `${T.menor} · ${PALOS[c.palo].nombre}`;
  const sino = T.sinoTxt[c.sino] || "";
  const respuestas = [
    [T.q1(c), `${c.derecho} ${c.consejo}`],
    [T.q2(c), sino],
    [T.q3(c), c.invertido],
  ];
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: respuestas.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  })}</script>`;
  const cuerpo = `<section class="bloque"><div class="contenedor">
  <div class="miga"><a href="${up(1)}">${T.miga}</a> › ${esc(c.nombre)}</div>
  <div class="ficha-seo">
    <div><img class="imgcarta" src="${img}" alt="${esc(c.nombre)}" width="720" height="1230">
      <table class="datos">
        <tr><th>${T.numero}</th><td>${c.mayor ? NUMERALES[c.n] : c.rango}</td></tr>
        ${c.mayor ? "" : `<tr><th>${T.palo}</th><td>${PALOS[c.palo].nombre}</td></tr>`}
        <tr><th>${T.elemento}</th><td>${esc(c.astro)}</td></tr>
      </table>
    </div>
    <div>
      <span class="ante">${tipo}</span>
      <h1>${esc(T.titulo(c))}</h1>
      <table class="datos"><tr><th>${T.claves} · ${T.derecha}</th><td>${c.claves.map(esc).join(", ")}</td></tr>
        <tr><th>${T.claves} · ${T.invertida}</th><td>${c.invertidas.map(esc).join(", ")}</td></tr></table>
      <h2>${T.derecha}</h2><p>${esc(c.derecho)}</p>
      <h2>${T.invertida}</h2><p>${esc(c.invertido)}</p>
      <h2>${T.amor}</h2><p>${esc(c.amor)}</p>
      <h2>${T.trabajo}</h2><p>${esc(c.trabajo)}</p>
      <h2>${T.consejo}</h2><p>${esc(c.consejo)}</p>
      <h2>${T.sino}</h2><p>${esc(sino)}</p>
      <h2>${T.tiempos}</h2>
      <p><strong>${T.pasado}:</strong> ${esc(T.tpas(c))}<br><strong>${T.presente}:</strong> ${esc(T.tpre(c))}<br><strong>${T.futuro}:</strong> ${esc(T.tfut(c))}</p>
      <div class="nota"><strong>${T.tirada}.</strong> ${T.tiradaTxt} <a href="${app}#/tarot-gratis">→</a></div>
      <h2>${T.faq}</h2>
      ${respuestas.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
      <div style="display:flex;justify-content:space-between;gap:10px;margin-top:26px;flex-wrap:wrap">
        <a class="btn btn-linea" href="../${ant.id}/">← ${esc(ant.nombre)}</a>
        <a class="btn btn-linea" href="${up(1)}">${T.todas}</a>
        <a class="btn btn-linea" href="../${sig.id}/">${esc(sig.nombre)} →</a>
      </div>
    </div>
  </div></div></section>`;
  return plantilla({ titulo: T.titulo(c), desc: T.desc(c), url, imagen: `${BASE}img/cartas/${c.id}.jpg`, cuerpo, profundidad: nivel, jsonld });
}

function indice() {
  const grupo = (tit, lista) => `<h2 style="margin-top:40px">${esc(tit)}</h2><div class="rejilla-idx">${lista.map(c =>
    `<a href="${c.id}/"><img src="${up(nivel - 1)}img/cartas/min/${c.id}.jpg" alt="${esc(c.nombre)}" loading="lazy" width="240" height="410">${esc(c.nombre)}</a>`).join("")}</div>`;
  const cuerpo = `<section class="bloque"><div class="contenedor"><h1>${T.idxTitulo}</h1><p class="suave">${T.idxDesc}</p>
    ${grupo(T.mayores, MAZO.filter(c => c.mayor))}
    ${Object.entries(PALOS).map(([k, p]) => grupo(p.nombre, MAZO.filter(c => c.palo === k))).join("")}
  </div></section>`;
  return plantilla({ titulo: T.idxTitulo, desc: T.idxDesc, url: `${BASE}${T.carpeta}/`, imagen: `${BASE}img/og.jpg`, cuerpo, profundidad: nivel - 1 });
}

const destino = path.join(RAIZ, T.carpeta);
fs.mkdirSync(destino, { recursive: true });
fs.writeFileSync(path.join(destino, "index.html"), indice());
MAZO.forEach((c, i) => {
  fs.mkdirSync(path.join(destino, c.id), { recursive: true });
  fs.writeFileSync(path.join(destino, c.id, "index.html"), paginaCarta(c, i));
});

// sitemap.xml con todas las páginas fijas que existan (es y en)
const urls = [BASE, `${BASE}en/`];
for (const carpeta of ["cartas", "en/cards"]) {
  const d = path.join(RAIZ, carpeta);
  if (!fs.existsSync(d)) continue;
  urls.push(`${BASE}${carpeta}/`);
  for (const id of fs.readdirSync(d)) if (fs.existsSync(path.join(d, id, "index.html"))) urls.push(`${BASE}${carpeta}/${id}/`);
}
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(RAIZ, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n`);
console.log(`${LANG}: ${MAZO.length} cartas + índice en ${T.carpeta}/ · sitemap con ${urls.length} direcciones`);
