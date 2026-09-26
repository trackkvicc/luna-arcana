"""Genera la versión inglesa de la web en en/ a partir de la española.

- en/js/cartas.js y en/js/contenido.js se escriben a mano (textos en inglés).
- index.html, js/app.js y js/extras.js se copian a en/ sustituyendo las frases
  del diccionario tools/diccionario-en.json (clave = texto español exacto).
- Las rutas a img/ y css/ pasan a ../img/ y ../css/. Los <script src="js/...">
  de en/index.html ya apuntan a en/js/ (la página vive en en/).
- Se ajustan canonical/og:url, lang, el enlace de idioma (EN → ES) y se crea en/manifest.json.

Uso: python3 tools/construir-en.py
  Avisa de las frases del diccionario que ya no aparecen y de las que parecen seguir en español.
"""
import json, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIC = json.load(open(os.path.join(RAIZ, "tools", "diccionario-en.json"), encoding="utf-8"))
# las frases largas primero, para que una corta no rompa una larga que la contiene
FRASES = sorted(DIC.items(), key=lambda kv: -len(kv[0]))
WEB = "https://trackkvicc.github.io/luna-arcana/"

ENLACE_ES = """<a href="en/" class="idioma" hreflang="en" lang="en" title="English version" style="font-size:.78rem;letter-spacing:.06em;opacity:.7" onclick="location.href='en/'+location.hash;return false">EN</a>"""
ENLACE_EN = """<a href="../" class="idioma" hreflang="es" lang="es" title="Versión en español" style="font-size:.78rem;letter-spacing:.06em;opacity:.7" onclick="location.href='../'+location.hash;return false">ES</a>"""


def traducir(texto):
    sin_uso = []
    for es, en in FRASES:
        if es in texto:
            texto = texto.replace(es, en)
        else:
            sin_uso.append(es)
    return texto, sin_uso


def rutas(texto):
    # recursos compartidos con la versión española
    texto = re.sub(r'(["`(])img/', r'\1../img/', texto)
    texto = re.sub(r'(["`(])css/', r'\1../css/', texto)
    return texto


def ajustar_index(texto):
    texto = texto.replace('<html lang="es">', '<html lang="en">')
    texto = texto.replace(f'<link rel="canonical" href="{WEB}">', f'<link rel="canonical" href="{WEB}en/">')
    texto = texto.replace(f'<meta property="og:url" content="{WEB}">', f'<meta property="og:url" content="{WEB}en/">')
    texto = texto.replace('<meta property="og:site_name" content="Luna Arcana">', '<meta property="og:site_name" content="Luna Arcana"><meta property="og:locale" content="en_GB">')
    if ENLACE_ES not in texto:
        print("Aviso: no encuentro el enlace EN de index.html; el selector de idioma no se ha cambiado")
    texto = texto.replace(ENLACE_ES, ENLACE_EN)
    return texto


def manifest():
    m = json.load(open(os.path.join(RAIZ, "manifest.json"), encoding="utf-8"))
    m.update({"name": "Luna Arcana · Tarot", "description": "Free tarot, card of the day and the meanings of all 78 cards.", "lang": "en", "start_url": "./"})
    for i in m.get("icons", []):
        if not i["src"].startswith("../"):
            i["src"] = "../" + i["src"]
    json.dump(m, open(os.path.join(RAIZ, "en", "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)


def main():
    todas_sin_uso = None
    os.makedirs(os.path.join(RAIZ, "en", "js"), exist_ok=True)
    for origen, destino in [("index.html", "en/index.html"), ("js/app.js", "en/js/app.js"), ("js/extras.js", "en/js/extras.js")]:
        texto = open(os.path.join(RAIZ, origen), encoding="utf-8").read()
        texto, sin_uso = traducir(texto)
        texto = rutas(texto)
        if origen == "index.html":
            texto = ajustar_index(texto)
        open(os.path.join(RAIZ, destino), "w", encoding="utf-8").write(texto)
        todas_sin_uso = set(sin_uso) if todas_sin_uso is None else todas_sin_uso & set(sin_uso)
    manifest()
    if todas_sin_uso:
        print(f"Aviso: {len(todas_sin_uso)} frases del diccionario ya no aparecen en ningún fichero:")
        for f in sorted(todas_sin_uso)[:20]:
            print("  ·", f[:80])

    # Frases que se han quedado sin traducir (heurística): palabras muy españolas o letras
    # españolas (¿ ¡ ñ tildes) en líneas de código, quitando comentarios y los códigos internos del sí/no.
    visibles = set()
    for f in ["en/index.html", "en/js/app.js", "en/js/extras.js"]:
        for linea in open(os.path.join(RAIZ, f), encoding="utf-8"):
            l = linea.strip()
            if l.startswith("//") or l.startswith("<!--"):
                continue
            l = re.sub(r"\s//\s.*$", "", l)
            l = re.sub(r'"(sí|quizás|no)"', "", l)
            pistas = re.findall(r"[>\"`'][^<>\"`'{}]*\b(?:tirada|carta|cartas|Añadir|Ver|tu|más|día|Elige|pregunta|envío|Gratis|de|la|el|y)\b[^<>\"`'{}]*", l)
            visibles |= {p[1:].strip() for p in pistas if len(p) > 6}
            for trozo in re.findall(r"[>\"`'][^<>\"`'{}]*[¿¡ñáéíóúÁÉÍÓÚ][^<>\"`'{}]*", l):
                visibles.add(trozo[1:].strip())
    # fuera lo que parece código o identificadores (rutas, clases, claves de localStorage)
    visibles = sorted(v for v in visibles if " " in v and not re.search(r"[=()\[\];$#]", v) and v != "Versión en español")
    print(f"Frases que parecen seguir en español: {len(visibles)}")
    for v in visibles[:80]:
        print("  ?", v[:110])


if __name__ == "__main__":
    main()
