// Spreads, guides, products and site texts — English version.
// Same keys and structure as js/contenido.js (ids and routes stay the same).

// campo: which part of the meaning is read in that position (derecho | amor | trabajo | consejo)
const TIRADAS = [
  { id: "carta-del-dia", nombre: "Card of the day", cat: "diarias", n: 1, diaria: true,
    desc: "One card to keep you company today. It changes every day and stays the same all day long.",
    pos: [{ t: "Your card for today", campo: "derecho" }] },
  { id: "si-o-no", nombre: "Yes or no tarot", cat: "generales", n: 1, sino: true,
    desc: "Think of a question that can be answered with yes or no, then pick a card.",
    pos: [{ t: "The answer", campo: "derecho" }] },
  { id: "pasado-presente-futuro", nombre: "Past, present and future", cat: "generales", n: 3,
    desc: "The quickest classic: where you come from, where you are and where you're heading.",
    pos: [{ t: "Past", campo: "derecho" }, { t: "Present", campo: "derecho" }, { t: "Future", campo: "derecho" }] },
  { id: "cruz-simple", nombre: "The simple cross", cat: "generales", n: 5,
    desc: "For a specific problem: what's going on, what's holding it back and how it might end.",
    pos: [{ t: "The situation", campo: "derecho" }, { t: "What holds you back", campo: "derecho" }, { t: "What helps you", campo: "derecho" },
          { t: "What's coming", campo: "derecho" }, { t: "The outcome", campo: "consejo" }] },
  { id: "mapa-de-tu-vida", nombre: "The map of your life", cat: "generales", n: 7,
    desc: "A snapshot of every area at once: you, love, work, money, health, the people around you and advice.",
    pos: [{ t: "You right now", campo: "derecho" }, { t: "Love", campo: "amor" }, { t: "Work", campo: "trabajo" }, { t: "Money", campo: "trabajo" },
          { t: "Health and energy", campo: "derecho" }, { t: "Family and friends", campo: "amor" }, { t: "Advice", campo: "consejo" }] },
  { id: "cruz-celta", nombre: "The Celtic Cross", cat: "generales", n: 10, cruz: true,
    desc: "The most complete spread, for an important matter you want to explore in depth.",
    pos: [{ t: "1 · The situation", campo: "derecho" }, { t: "2 · The crossing (what opposes it)", campo: "derecho" }, { t: "3 · The root", campo: "derecho" },
          { t: "4 · The recent past", campo: "derecho" }, { t: "5 · What you're aiming for", campo: "derecho" }, { t: "6 · The near future", campo: "derecho" },
          { t: "7 · You in all this", campo: "consejo" }, { t: "8 · Your surroundings", campo: "derecho" }, { t: "9 · Hopes and fears", campo: "derecho" },
          { t: "10 · The outcome", campo: "derecho" }] },
  { id: "encontrare-pareja", nombre: "Will I find love?", cat: "amor", n: 5,
    desc: "If you're wondering when love will arrive and what you can do to open the door to it.",
    pos: [{ t: "Where you are in love", campo: "amor" }, { t: "What blocks you", campo: "amor" }, { t: "What you attract", campo: "amor" },
          { t: "What's on its way", campo: "amor" }, { t: "Advice", campo: "consejo" }] },
  { id: "que-siente", nombre: "How do they feel about me?", cat: "amor", n: 3,
    desc: "Three cards to look at a bond: what they feel, what they don't say and where it's going.",
    pos: [{ t: "What they feel", campo: "amor" }, { t: "What they don't say", campo: "amor" }, { t: "Where it's going", campo: "amor" }] },
  { id: "problemas-amorosos", nombre: "Relationship troubles", cat: "amor", n: 6,
    desc: "For when something isn't right in your relationship and you want to understand why.",
    pos: [{ t: "You in the relationship", campo: "amor" }, { t: "The other person", campo: "amor" }, { t: "The underlying problem", campo: "derecho" },
          { t: "What binds you together", campo: "amor" }, { t: "What may happen", campo: "amor" }, { t: "Advice", campo: "consejo" }] },
  { id: "encontrare-trabajo", nombre: "Will I find a job soon?", cat: "trabajo", n: 5,
    desc: "For job seekers: where you stand, what's holding you back and which opportunities are opening up.",
    pos: [{ t: "Your work situation", campo: "trabajo" }, { t: "What holds you back", campo: "trabajo" }, { t: "Your strengths", campo: "trabajo" },
          { t: "The opportunity", campo: "trabajo" }, { t: "Advice", campo: "consejo" }] },
  { id: "problemas-de-dinero", nombre: "Money worries", cat: "trabajo", n: 6,
    desc: "When money is tight: what's happening, where it comes from and how to get out of it.",
    pos: [{ t: "Your finances today", campo: "trabajo" }, { t: "The origin", campo: "derecho" }, { t: "What you can't see", campo: "derecho" },
          { t: "What you can do", campo: "consejo" }, { t: "What's coming", campo: "trabajo" }, { t: "Result", campo: "trabajo" }] },
  { id: "hoy-amor", nombre: "Today's tarot: love", cat: "diarias", n: 1,
    desc: "One card to see how things are moving in your love life today.", pos: [{ t: "Love today", campo: "amor" }] },
  { id: "hoy-trabajo", nombre: "Today's tarot: work", cat: "diarias", n: 1,
    desc: "One card for your working day.", pos: [{ t: "Work today", campo: "trabajo" }] },
  { id: "hoy-dinero", nombre: "Today's tarot: money", cat: "diarias", n: 1,
    desc: "The energy surrounding your money matters today.", pos: [{ t: "Money today", campo: "trabajo" }] },
  { id: "hoy-salud", nombre: "Today's tarot: energy", cat: "diarias", n: 1,
    desc: "How your mood and energy are doing today. (Not a substitute for medical advice.)", pos: [{ t: "Your energy today", campo: "consejo" }] },
  // Spreads by moon phase (the #/luna page says which one fits today)
  { id: "luna-nueva", nombre: "New moon intentions", cat: "lunar", n: 5,
    desc: "The new moon starts a cycle: get clear on what you want to plant and which intention will guide you this month.",
    pos: [{ t: "Where you are now", campo: "derecho" }, { t: "What you want to plant", campo: "derecho" }, { t: "What it needs to grow", campo: "consejo" },
          { t: "What might hold you back", campo: "derecho" }, { t: "Your intention for this cycle", campo: "consejo" }] },
  { id: "luna-creciente", nombre: "Waxing moon momentum", cat: "lunar", n: 3,
    desc: "While the moon grows: what has been set in motion, how to give it a push and what your next step is.",
    pos: [{ t: "What is growing", campo: "derecho" }, { t: "How to give it momentum", campo: "trabajo" }, { t: "Your next step", campo: "consejo" }] },
  { id: "luna-llena", nombre: "Full moon ritual", cat: "lunar", n: 5,
    desc: "Under the full moon everything looks clearer: what's reaching its peak, what to celebrate and what it's time to let go.",
    pos: [{ t: "What is culminating", campo: "derecho" }, { t: "What you now see clearly", campo: "derecho" }, { t: "What you can celebrate", campo: "amor" },
          { t: "What it's time to let go", campo: "derecho" }, { t: "The moon's advice", campo: "consejo" }] },
  { id: "luna-menguante", nombre: "Letting go with the waning moon", cat: "lunar", n: 3,
    desc: "When the moon wanes it's time to lighten the load: what to release, how to rest and what you take from this cycle.",
    pos: [{ t: "What you can release", campo: "derecho" }, { t: "How to rest and recharge", campo: "consejo" }, { t: "What you take from this cycle", campo: "derecho" }] },
];

const CATEGORIAS = { todas: "All", generales: "General", amor: "Love & relationships", trabajo: "Work & money", diarias: "Daily", lunar: "By the moon" };

const GUIAS = [
  { id: "como-leer-el-tarot", titulo: "How to read tarot, step by step", icono: "☾",
    resumen: "No need to memorise 78 meanings: set your question, shuffle, lay out the cards and tell the story they form.",
    html: `
<p>Reading tarot isn't fortune-telling: it's looking at a situation from a different angle with the help of images full of symbols. Anyone can start today. Here are the steps.</p>
<h2>1. Prepare your question</h2>
<p>The question shapes the reading. Open is better than closed: instead of “will they come back?”, try “what do I need to understand about this relationship?”. Write it down: it helps you not to change it halfway through.</p>
<h2>2. Shuffle calmly</h2>
<p>There's no right way. Shuffle until it feels like enough, with your question in mind. If you want to use reversed cards, turn part of the deck around as you shuffle.</p>
<h2>3. Choose a spread</h2>
<p>Start with the <a href="#/tarot-gratis/pasado-presente-futuro">three-card spread</a>: past, present and future. Each position has its own meaning, and that meaning changes how you read the card that lands there.</p>
<h2>4. Look before you read</h2>
<p>Before you look up the meaning, observe: colours, gestures, where each figure is looking. Note your first impression. It's often the most useful one.</p>
<h2>5. Read each card in its position</h2>
<p>Check the <a href="#/significados">meaning</a> and adapt it: The Chariot in “past” speaks of progress you've already made; in “future”, of progress still to come.</p>
<h2>6. Tell the story</h2>
<p>This is the key step. The cards aren't isolated sentences: together they tell something. Lots of major arcana? This is an important moment. One suit dominates? That's the ground where everything is being played out.</p>
<h2>7. Keep one piece of advice</h2>
<p>Close with a single practical idea. A good reading ends with something you can do, not with a verdict.</p>` },
  { id: "arcanos-mayores-y-menores", titulo: "Major and minor arcana", icono: "✦",
    resumen: "The two halves of the deck: the 22 great themes of life and the 56 cards of everyday life.",
    html: `
<p>A tarot deck has 78 cards split into two very different groups.</p>
<h2>The 22 major arcana</h2>
<p>They run from 0 (The Fool) to XXI (The World) and are often read as a journey: the Fool sets out with nothing and, card by card, meets willpower, intuition, love, crisis, hope and fulfilment. When they appear in a spread they point to deep themes, major changes and big lessons.</p>
<h2>The 56 minor arcana</h2>
<p>They're split into four suits of fourteen cards: Ace to Ten, plus four court cards (Page, Knight, Queen and King). They speak of everyday life: situations, people and day-to-day decisions.</p>
<ul><li><strong>The numbers</strong> tell a progression: the Ace is the seed, the Five the crisis, the Ten the completed cycle.</li>
<li><strong>The court cards</strong> usually stand for people or attitudes: the Page learns, the Knight acts, the Queen masters the inner world and the King the outer one.</li></ul>
<p>See the <a href="#/significados">meanings of all 78 cards</a>.</p>` },
  { id: "los-cuatro-palos", titulo: "The four suits and their elements", icono: "🜃",
    resumen: "Wands, Cups, Swords and Pentacles: fire, water, air and earth. Which area of life each one touches.",
    html: `
<p>Each suit of the minor arcana is linked to an element and an area of life. Knowing this already gives you half the reading.</p>
<h2>🜂 Wands · Fire</h2><p>Action, energy, projects, ambition and creativity. Lots of wands: it's time to get moving.</p>
<h2>🜄 Cups · Water</h2><p>Emotions, love, friendship and intuition. Lots of cups: it's a matter of the heart, even if it looks like something else.</p>
<h2>🜁 Swords · Air</h2><p>Thoughts, decisions, conflict and truth. They're the toughest cards in the deck because they show what hurts to think about.</p>
<h2>⛤ Pentacles · Earth</h2><p>Money, work, body, home and everything material. Lots of pentacles: practical, down-to-earth matters.</p>` },
  { id: "tipos-de-tiradas", titulo: "Types of spreads and when to use each one", icono: "⟡",
    resumen: "From one card to the Celtic Cross: how to pick a spread based on what you want to know.",
    html: `
<p>A spread is the layout you place the cards in. Each position has its own meaning.</p>
<h2>One card</h2><p>For the day or for a <a href="#/tarot-gratis/si-o-no">yes or no</a> question. Quick, but it doesn't give context.</p>
<h2>Three cards</h2><p>The most versatile. Past-present-future, situation-obstacle-advice or you-the other person-the relationship.</p>
<h2>Five to seven cards</h2><p>For a specific problem with several factors: what holds you back, what helps, the outcome. Try <a href="#/tarot-gratis/cruz-simple">the simple cross</a> or <a href="#/tarot-gratis/mapa-de-tu-vida">the map of your life</a>.</p>
<h2>The Celtic Cross (ten cards)</h2><p>The classic for important matters. It has a central cross (the situation and what opposes it) and a column on the right (you, your surroundings, your fears and the outcome). <a href="#/tarot-gratis/cruz-celta">Try it for free</a>.</p>` },
  { id: "cartas-invertidas", titulo: "What reversed cards mean", icono: "⇅",
    resumen: "An upside-down card isn't always “the opposite”. Three ways to read it.",
    html: `
<p>When a card comes out upside down it's called reversed. Not every reader uses them, but they add nuance.</p>
<h2>Three ways to read them</h2>
<ol><li><strong>Blocked energy:</strong> the card is there, but it doesn't flow. The Star reversed is hope you won't allow yourself.</li>
<li><strong>Energy turned inward:</strong> what the card says is lived on the inside and doesn't show on the outside.</li>
<li><strong>Too much or too little:</strong> the card's virtue goes overboard or falls short. Strength reversed can be insecurity or impulsiveness.</li></ol>
<p>A “bad” card reversed can be good news: The Tower reversed sometimes means the crisis is avoided or is already passing.</p>
<p>In our free spreads you can switch reversed cards on or off.</p>` },
  { id: "combinaciones", titulo: "How to combine cards in a reading", icono: "∞",
    resumen: "Cards change each other. Tips for reading them together rather than as separate sentences.",
    html: `
<p>A single card says little; the one next to it shifts the nuance. A few tips for reading them together:</p>
<ul><li><strong>Count the majors.</strong> More than half: it's a deep theme and partly beyond your control.</li>
<li><strong>Count the suits.</strong> The one that repeats marks the ground: cups, emotions; pentacles, money.</li>
<li><strong>Look for repeated numbers.</strong> Several fives: a testing phase. Several aces: lots of beginnings at once.</li>
<li><strong>Follow the gazes.</strong> If a figure looks towards another card, the two are connected; if it looks away, something is leaving.</li>
<li><strong>One card softens another.</strong> The Tower next to The Star: the blow brings relief afterwards.</li></ul>` },
];

// Catalogue (dropshipping). Each product's supplier is in proveedores.md (kept out of the public repo).
const PRODUCTOS = [
  { id: "tarot-ojo-dorado", nombre: "Golden Eye Tarot", precio: 34.90, cat: "Premium", etiqueta: "Bestseller", foto: "ojo-dorado",
    desc: "A 78-card deck in gold foil with shiny gilded edges and the all-seeing eye on the back. Waterproof, with a shimmer you'll notice in every reading. A little treasure to give… or to keep for yourself.",
    detalles: ["78 waterproof gold-foil cards", "Gilded edges", "Presentation box", "Classic tarot artwork"] },
  { id: "tarot-dorado-clasico", nombre: "Classic Gold Tarot", precio: 32.90, cat: "Premium", foto: "dorado-clasico",
    desc: "The timeless tarot scenes, bathed in gold. Metallic foil cards that are flexible and wipe-clean, so they won't crease or stain.",
    detalles: ["78 gold-foil cards", "Water-resistant", "Standard size 12 × 7 cm"] },
  { id: "tarot-vintage-lata", nombre: "Vintage Tarot in a Tin", precio: 22.90, cat: "Premium", etiqueta: "New", foto: "vintage-lata",
    desc: "An antique look, gilded edges and a metal tin that keeps your cards safe for good. Perfect for slipping into your bag.",
    detalles: ["78 cards with gilded edges", "Tin box with lid", "Quick guide included"] },
  { id: "tarot-holografico", nombre: "Holographic Tarot", precio: 19.90, cat: "Decks", foto: "holografico",
    desc: "The classic cards with a holographic finish that changes colour in the light. They'll turn heads on any table.",
    detalles: ["78 cards with holographic shine", "Iridescent box", "Classic tarot artwork"] },
  { id: "tarot-luna-dorada", nombre: "Golden Moon Tarot", precio: 17.90, cat: "Beginners", foto: "luna-dorada",
    desc: "An ivory box with a golden moon and the 78 classic cards in soft colours. The perfect deck to start with.",
    detalles: ["78 cards", "Box with golden moon", "Standard size"] },
  { id: "tarot-rosa", nombre: "Pink Tarot for Beginners", precio: 16.90, cat: "Beginners", foto: "rosa",
    desc: "The classic tarot in pastel pink tones, in a beautiful box. A favourite for anyone starting to read the cards.",
    detalles: ["78 cards in pink tones", "Rigid box", "Standard size"] },
  { id: "tarot-con-significados", nombre: "Tarot with Meanings", precio: 18.90, cat: "Beginners", etiqueta: "Great for learning", foto: "significados",
    desc: "Every card has its keywords printed on it, upright and reversed, plus its zodiac sign. You learn as you read, no guidebook needed.",
    detalles: ["78 cards with keywords", "Reversed meaning on every card", "Astrological correspondences"] },
  { id: "tarot-de-los-gatos", nombre: "Cat Tarot", precio: 17.90, cat: "Decks", foto: "gatos",
    desc: "All 78 arcana starring cats in black and white, with clean, detail-packed drawings. For cat lovers everywhere.",
    detalles: ["78 black-and-white illustrated cards", "Black box", "Standard size"] },
  { id: "tarot-vidriera", nombre: "Stained Glass Tarot", precio: 18.90, cat: "Decks", foto: "vidriera",
    desc: "Every card looks like a cathedral window: vivid colours, light and plenty of atmosphere.",
    detalles: ["78 stained-glass style cards", "Illustrated box", "Standard size"] },
];

const ENVIO = { gratisDesde: 30, coste: 3.90, plazo: "7–12 business days" };

const PREGUNTAS = [
  ["Are the readings really free?", "Yes. Every spread on the site is free, with no sign-up and no limit."],
  ["How are the cards chosen?", "The deck is shuffled at random every time and you pick the cards face down yourself, just like at a real table."],
  ["Which spread should I try first?", "Start with the card of the day or with past, present and future. They're simple and teach you a lot."],
  ["Can I repeat the same spread?", "You can, but we suggest not asking the same question twice on the same day: the first answer tends to be the most honest one."],
  ["Does tarot predict the future?", "We see it as a tool for reflection: it helps you look at a situation from another angle. The decisions are always yours."],
];

const LEGAL = {
  "aviso-legal": ["Legal notice", `<p>Website owner: <strong>[pending: name or company name]</strong>, tax ID (NIF) <strong>[pending]</strong>, registered address <strong>[pending]</strong>. Contact email: <strong>[pending]</strong>.</p><p>The content on this website is for general information and entertainment. Tarot readings are not medical, psychological, legal or financial advice.</p><p>The texts on this website belong to its owner. The card illustrations are based on the Rider-Waite-Smith tarot (1909, illustrated by Pamela Colman Smith), which is in the public domain, repainted by Luna Arcana.</p>`],
  "privacidad": ["Privacy policy", `<p>Data controller: <strong>[pending]</strong>.</p><p>We only use the data you send us (name, email, shipping address) to process your orders, answer your questions and, if you agree, send you our newsletter. We don't share it with third parties except where required by law or to complete delivery (courier and payment provider).</p><p>You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to <strong>[pending: email]</strong>. You can also file a complaint with the Spanish Data Protection Agency (aepd.es).</p><p>The spreads don't store your questions: they stay only in your browser.</p>`],
  "cookies": ["Cookie policy", `<p>This website doesn't use advertising or tracking cookies. It only stores your cart and your card of the day in your browser, so they aren't lost when you reload the page.</p>`],
  "condiciones": ["Terms of sale", `<p>Prices include VAT. Your order is confirmed once payment is received.</p><p><strong>Right of withdrawal:</strong> you have 14 calendar days from delivery to return the product without giving a reason, as long as it's unused and in its original packaging. We'll refund you within 14 days at the latest.</p><p>3-year legal guarantee against lack of conformity.</p><p>[pending: review with an advisor before selling]</p>`],
  "envios": ["Shipping and returns", `<p>We ship across mainland Spain. Delivery time: <strong>${ENVIO.plazo}</strong> from payment confirmation; we'll email you the tracking number. Shipping: €${ENVIO.coste.toFixed(2)}; <strong>free on orders over €${ENVIO.gratisDesde}</strong>.</p><p>Balearic Islands, Canary Islands, Ceuta, Melilla and the rest of the EU: [pending].</p><p>To return an order, write to us with your order number within 14 days of receiving it.</p>`],
};
