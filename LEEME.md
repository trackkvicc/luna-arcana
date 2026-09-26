# Luna Arcana — web de tarot

Web estática (HTML + CSS + JS, sin instalar nada). Para verla en el Mac:

    cd ~/Desktop/Tarot && python3 -m http.server 8765
    → http://localhost:8765

## Qué hay
- **Tarot gratis**: 15 tiradas (carta del día, sí o no, 3 cartas, cruz simple, mapa de tu vida, cruz celta, amor, trabajo, dinero, del día). Se baraja, se eligen las cartas boca abajo y sale la lectura. Cartas invertidas opcionales.
- **Significados**: las 78 cartas con derecho, invertida, amor, trabajo, consejo y sí/no.
- **Aprende**: 6 guías de divulgación.
- **Tienda**: 9 productos, carrito, envío gratis desde 35 €, formulario de pedido.
- **Lectura personalizada** por correo (formulario).
- **Baraja propia**: las 78 cartas del Rider-Waite-Smith de 1909 (Pamela Colman Smith, dominio público, bajadas de Wikimedia a `img/rws-1909/`) repintadas al estilo de The Light Seer's Tarot con `img/estilizar.py`: plumilla + acuarela luminosa + rayos + arcoíris. No usa ninguna ilustración de Chris-Anne (tiene derechos). Salida en `img/cartas/` (480 px) y `img/cartas/min/` (miniaturas). Para rehacerlas: `cd img && python3 estilizar.py`.

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
