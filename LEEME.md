# Luna Arcana — web de tarot

Web estática (HTML + CSS + JS, sin instalar nada). Para verla en el Mac:

    cd ~/Desktop/Tarot && python3 -m http.server 8765
    → http://localhost:8765

## Qué hay
- **Tarot gratis**: 15 tiradas (carta del día, sí o no, 3 cartas, cruz simple, mapa de tu vida, cruz celta, amor, trabajo, dinero, del día). Se baraja, se eligen las cartas boca abajo y sale la lectura. Cartas invertidas opcionales.
- **Significados**: las 78 cartas con derecho, invertida, amor, trabajo, consejo y sí/no.
- **Aprende**: 6 guías de divulgación.
- **Tienda (dropshipping)**: 9 barajas de AliExpress elegidas por ventas y valoración (proveedores y costes en `proveedores.md`, que NO se sube). Fotos recortadas y puestas sobre un fondo de estudio común (originales en `img/tienda/original/`, tampoco se suben). Cabecera, garantías, orden por precio, guía «¿Qué baraja elijo?» (#/tienda-guia), ficha con desplegables y «También te puede gustar». Envío gratis desde 30 €, entrega 7–12 días.
- **Enganche** (js/extras.js + css/extras.css): carta del día con racha, horóscopo semanal del tarot, arcano personal, compatibilidad, test «¿Qué carta eres?», diario de tiradas y botones de compartir (#/descubre).
- **Lectura personalizada** por correo (formulario).
- **Baraja propia**: las 78 cartas del Rider-Waite-Smith de 1909 (Pamela Colman Smith, dominio público, bajadas de Wikimedia a `img/rws-1909/`) repintadas al estilo de The Light Seer's Tarot con `img/estilizar.py`: plumilla + acuarela luminosa + rayos + arcoíris. No usa ninguna ilustración de Chris-Anne (tiene derechos). Salida en `img/cartas/` (720 px) y `img/cartas/min/` (miniaturas). Se recorta en todas la franja de arriba con el número romano (el título manuscrito ya lo lleva). Para rehacerlas: `cd img && python3 estilizar.py`.

Estructura inspirada en tarotdetiziana.com (catálogo de tiradas por temas, significados, guías, lectura por email); textos propios.

## Pendiente antes de publicar
1. Nombre y dominio definitivos («Luna Arcana» es provisional).
2. Datos del titular en Aviso legal / Privacidad / Contacto (buscar «[pendiente»).
3. Pasarela de pago (Stripe o Shopify). Hoy el pedido solo se guarda en el navegador.
4. Newsletter y formularios → conectar a un servicio de correo (Brevo).
5. Fotos reales de los productos y precios reales. Revender Rider-Waite/Marsella/Thoth exige proveedor.
6. Para IMPRIMIR la baraja hace falta resolución de imprenta: rehacer con escaneos grandes del 1909 (Wikimedia los tiene a más de 1.000 px) y subir ANCHO/ALTO en estilizar.py.
7. Condiciones de venta revisadas por un asesor.
8. Hosting: GitHub Pages / Netlify gratis sirve tal cual.

## Versión en inglés
Vive en `en/` y se publica en …/luna-arcana/en/. Las imágenes y el CSS son los de la raíz (no se duplican). En la cabecera hay un enlace discreto «EN» / «ES» que cambia de idioma sin perder la página en la que estás.
- A mano (en inglés): `en/js/cartas.js` (las 78 cartas) y `en/js/contenido.js` (tiradas, guías, productos, envío, preguntas y textos legales). Si cambias los españoles, cambia también estos.
- Automático: `en/index.html`, `en/js/app.js`, `en/js/extras.js` y `en/manifest.json` salen de los españoles con el diccionario `tools/diccionario-en.json` (frase española exacta → inglés).

Tras cambiar la web española:
1. `python3 tools/construir-en.py`
2. Si avisa de «frases que parecen seguir en español», añade esas frases al diccionario (la clave tiene que ser el texto EXACTO del código, sin tocar lo que va entre `${…}`) y vuelve a ejecutarlo.
3. Si cambian las cartas: `node tools/generar-cartas.js es` y `node tools/generar-cartas.js en`.
