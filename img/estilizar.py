"""Repinta las cartas del tarot Rider-Waite-Smith (1909, dominio público) con el estilo
de Luna Arcana: trazo de tinta rayado sobre acuarela luminosa, halos de luz y destellos.

Uso: python3 estilizar.py [id-carta ...]   (sin argumentos, las 78)
Entrada: rws-1909-hd/<id>.jpg (o rws-1909/ si falta)   Salida: cartas/<id>.jpg y cartas/min/<id>.jpg
"""
import sys, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
ANCHO, ALTO = 720, 1230  # proporción 7:12 aprox.
K = ANCHO / 480  # escala de trazos y desenfoques respecto a la versión de 480 px
impar = lambda n: 2 * round(n * K / 2) + 1

MAYORES = ["el-loco", "el-mago", "la-sacerdotisa", "la-emperatriz", "el-emperador", "el-hierofante", "los-enamorados",
           "el-carro", "la-fuerza", "el-ermitano", "la-rueda-de-la-fortuna", "la-justicia", "el-colgado", "la-muerte",
           "la-templanza", "el-diablo", "la-torre", "la-estrella", "la-luna", "el-sol", "el-juicio", "el-mundo"]
# [cielo, centro, suelo] — misma paleta que js/baraja.js
PALETA_MAYORES = [
    ["#fbe3a1", "#7fd6cf", "#2a8fa3"], ["#ffe7a3", "#f6b26b", "#3d8d6e"], ["#2fb3b3", "#e56fb0", "#241a5c"],
    ["#fff0b3", "#f59ab5", "#6fbf73"], ["#ffd08a", "#e0663f", "#6b2a3a"], ["#f7e1b5", "#c79bd6", "#4c3a8a"],
    ["#ffe0ec", "#f7a1c4", "#6ec6e6"], ["#bfe7ff", "#5aa4e0", "#27366e"], ["#ffe39a", "#f59f45", "#b53e5a"],
    ["#b8d9ff", "#6d6fc2", "#1c1a45"], ["#fff3a8", "#9fe0c8", "#4b58b8"], ["#e8f1ff", "#9bc3e8", "#3b4f8c"],
    ["#c2f0ea", "#58c4c4", "#1d5c7a"], ["#e9d2ff", "#8a5bc2", "#1f1238"], ["#fff4d6", "#ffb4a8", "#79c7e3"],
    ["#ff9b7a", "#9c2a5a", "#1a0f2a"], ["#ffd27a", "#e0503f", "#241640"], ["#d8f7ff", "#79b8f0", "#3a2f8f"],
    ["#e6e3ff", "#7a8ae0", "#16244f"], ["#fff6a0", "#ffc24d", "#ff7a59"], ["#ffe1c7", "#f08a8a", "#5a3a8a"],
    ["#bff7e6", "#8ad0ff", "#b28bff"]]
PALETA_PALOS = {"bastos": ["#ffe9a3", "#f7a04b", "#c2456a"], "copas": ["#d4fbf4", "#6fd3d6", "#3a6fbf"],
                "espadas": ["#eef0ff", "#9ea8e8", "#3b2f7a"], "oros": ["#fff4c2", "#d8c46a", "#3f8a5c"]}
FIGURAS = ("as", "sota", "caballo", "reina", "rey")  # cartas con banda de nombre abajo


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255


def paleta(cid):
    if cid in MAYORES:
        return PALETA_MAYORES[MAYORES.index(cid)]
    return PALETA_PALOS[cid.split("-de-")[1]]


def caja_recorte(img, cid):
    """Caja sin el marco blanco ni, si la carta la tiene, la banda del título en inglés."""
    a = np.asarray(img.convert("L"), dtype=np.float32)
    h, w = a.shape
    # La línea negra del marco: primera fila/columna muy oscura desde cada borde
    def primera_oscura(perfil):
        for i, v in enumerate(perfil):
            if v < 90:
                return i
        return 0
    filas = [int(h * f) for f in (.3, .4, .5, .6, .7)]
    cols = [int(w * f) for f in (.3, .4, .5, .6, .7)]
    izq = int(np.median([primera_oscura(a[y, :w // 4]) for y in filas]))
    der = w - int(np.median([primera_oscura(a[y, ::-1][:w // 4]) for y in filas]))
    arr = int(np.median([primera_oscura(a[:h // 4, x]) for x in cols]))
    aba = h - int(np.median([primera_oscura(a[::-1, x][:h // 4]) for x in cols]))
    m = 9  # margen para no dejar la línea del marco
    caja = [izq + m, arr + m + 5, der - m, aba - m]
    con_titulo = cid in MAYORES or cid.split("-de-")[0] in FIGURAS
    if con_titulo:
        caja[3] = arr + int((aba - arr) * 0.885)  # por encima de la banda del nombre
    return caja


def degradado(pal, w, h):
    c1, c2, c3 = (hexrgb(x) for x in pal)
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    arriba = c1 * (1 - np.clip(t / .55, 0, 1)) + c2 * np.clip(t / .55, 0, 1)
    abajo = c2 * (1 - np.clip((t - .55) / .45, 0, 1)) + c3 * np.clip((t - .55) / .45, 0, 1)
    g = np.where(t < .55, arriba, abajo)
    return np.broadcast_to(g, (h, w, 3)).copy()


def manchas(w, h, rnd, n=6):
    """Manchas de acuarela / nebulosa: capa RGB para mezclar en modo 'trama' (screen)."""
    capa = Image.new("RGB", (w, h), (0, 0, 0))
    d = ImageDraw.Draw(capa)
    colores = [(255, 255, 255), (255, 150, 210), (255, 240, 160), (140, 240, 255), (200, 160, 255)]
    for _ in range(n):
        r = rnd.randint(w // 6, w // 3)
        x, y = rnd.randint(0, w), rnd.randint(0, int(h * .8))
        c = rnd.choice(colores)
        k = rnd.uniform(.35, .7)
        d.ellipse([x - r, y - r, x + r, y + r], fill=tuple(int(v * k) for v in c))
    # haz de luz vertical
    x = rnd.randint(int(w * .3), int(w * .7))
    d.rectangle([x - w // 14, 0, x + w // 14, h], fill=(90, 90, 90))
    return np.asarray(capa.filter(ImageFilter.GaussianBlur(w / 9)), dtype=np.float32) / 255



def rayado(w, h, rnd, angulo, paso=5):
    paso = max(3, round(paso * K))
    """Textura de líneas paralelas finas (sombreado a plumilla)."""
    capa = Image.new("L", (w * 2, h * 2), 0)
    d = ImageDraw.Draw(capa)
    for i in range(-h * 2, w * 4, paso):
        jit = rnd.uniform(-1, 1)
        d.line([(i + jit, 0), (i - h * 2 * math.tan(math.radians(angulo)) + jit, h * 2)], fill=255, width=1)
    return np.asarray(capa.resize((w, h), Image.LANCZOS), dtype=np.float32) / 255


def garabatos_borde(w, h, rnd):
    """Trazos nerviosos de tinta que entran desde los bordes, como en la carta de ejemplo."""
    capa = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(capa)
    for _ in range(90):
        lado = rnd.randrange(4)
        x, y = [(rnd.uniform(0, w), 0), (w, rnd.uniform(0, h)), (rnd.uniform(0, w), h), (0, rnd.uniform(0, h))][lado]
        ang = math.atan2(h * .5 - y, w * .5 - x) + rnd.uniform(-.8, .8)
        largo = rnd.uniform(w * .05, w * .2)
        pts = [(x, y)]
        for k in range(1, 5):
            pts.append((x + math.cos(ang) * largo * k / 4 + rnd.uniform(-3, 3), y + math.sin(ang) * largo * k / 4 + rnd.uniform(-3, 3)))
        d.line(pts, fill=int(rnd.uniform(120, 230)), width=max(1, round(K)))
    return np.asarray(capa.filter(ImageFilter.GaussianBlur(.4)), dtype=np.float32) / 255


def destellos(img, rnd, n=45):
    d = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    for _ in range(n):
        x, y, r = rnd.uniform(0, w), rnd.uniform(0, h * .75), rnd.uniform(.6, 2.2) * K
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(150, 255)))
    for _ in range(5):  # estrellas de cuatro puntas
        x, y, t = rnd.uniform(w * .05, w * .95), rnd.uniform(h * .03, h * .6), rnd.uniform(6, 13) * K
        d.polygon([(x, y - t), (x + t * .22, y - t * .22), (x + t, y), (x + t * .22, y + t * .22),
                   (x, y + t), (x - t * .22, y + t * .22), (x - t, y), (x - t * .22, y - t * .22)], fill=(255, 255, 255, 235))
    return img


def recortar_hd(img, cid):
    """Recorta la imagen grande con la caja calculada sobre una copia de 500 px."""
    f = img.width / 500
    peque = img.resize((500, round(img.height / f)), Image.LANCZOS)
    x0, y0, x1, y1 = caja_recorte(peque, cid)
    # Franja superior con el número romano: se quita en TODAS las cartas (baraja uniforme),
    # y lo mismo en proporción por los lados para mantener la forma de la carta.
    alto = y1 - y0
    quita = alto * .068
    lado = quita * (x1 - x0) / alto / 2
    caja = (x0 + lado, y0 + quita, x1 - lado, y1)
    return img.crop(tuple(round(v * f) for v in caja))


def estilizar(cid):
    rnd = random.Random(cid)
    hd = os.path.join(AQUI, "rws-1909-hd", cid + ".jpg")
    fuente = hd if os.path.exists(hd) else os.path.join(AQUI, "rws-1909", cid + ".jpg")
    img = Image.open(fuente).convert("RGB")
    img = recortar_hd(Image.open(fuente).convert("RGB"), cid)
    img = img.resize((ANCHO, ALTO), Image.LANCZOS)
    o = np.asarray(img, dtype=np.float32) / 255
    lum = o @ np.array([.299, .587, .114], dtype=np.float32)

    # 1. Tinta: las líneas negras del original. Las manchas negras macizas se convierten en rayado.
    negro_orig = np.clip((.30 - lum) / .18, 0, 1)
    ni = Image.fromarray((negro_orig * 255).astype(np.uint8))
    macizo = np.asarray(ni.filter(ImageFilter.MinFilter(impar(7))).filter(ImageFilter.MaxFilter(impar(7))).filter(ImageFilter.GaussianBlur(1.5 * K)), dtype=np.float32) / 255
    lineas = np.clip(negro_orig - macizo, 0, 1)
    ti = Image.fromarray((lineas * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.45 * K))
    tinta = np.asarray(ti, dtype=np.float32) / 255
    # contorno de las manchas macizas (para que no pierdan la forma)
    borde_macizo = np.asarray(Image.fromarray((macizo * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES), dtype=np.float32) / 255
    tinta = np.maximum(tinta, np.clip(borde_macizo * 2.2, 0, 1))

    # 2. Color base: los colores planos de 1909, más vivos, fundidos con el degradado luminoso
    gris = lum[..., None]
    viva = np.clip(gris + (o - gris) * 2.1, 0, 1)
    fondo = degradado(paleta(cid), ANCHO, ALTO)
    # luz suave: la ilustración toma el tono del degradado sin perder sus formas
    base = np.where(viva < .5, 2 * viva * fondo, 1 - 2 * (1 - viva) * (1 - fondo))
    claro = np.clip((lum - .45) / .35, 0, 1)[..., None]  # cielos y fondos planos de 1909
    color = base * (1 - claro * .55) + (fondo * .8 + .2) * claro * .55
    # las manchas macizas pasan a un tono profundo del degradado, no a negro
    profundo = fondo * .55 + hexrgb("#2a1d45") * .45
    color = color * (1 - macizo[..., None]) + profundo * macizo[..., None]
    # sangrado de acuarela
    col = Image.fromarray((np.clip(color, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6 * K))
    color = np.asarray(col, dtype=np.float32) / 255

    # 3. Luz: manchas de nebulosa y haz de luz (trama)
    luz = manchas(ANCHO, ALTO, rnd)
    color = 1 - (1 - color) * (1 - luz * .9)
    # halo cálido arriba (el «sol» de la carta de ejemplo)
    yy, xx = np.mgrid[0:ALTO, 0:ANCHO].astype(np.float32)
    sx, sy = rnd.uniform(.2, .8) * ANCHO, rnd.uniform(.05, .3) * ALTO
    halo = np.exp(-(((xx - sx) ** 2 + (yy - sy) ** 2) / (2 * (ANCHO * .28) ** 2)))[..., None]
    color = 1 - (1 - color) * (1 - halo * np.array([1, .95, .8], dtype=np.float32) * .45)

    # rayos de luz que salen del halo y un velo de arcoíris
    ang = np.arctan2(yy - sy, xx - sx)
    dist = np.hypot(xx - sx, yy - sy)
    rayos = (np.clip(np.sin(ang * rnd.choice([18, 22, 26]) + rnd.uniform(0, 6)), 0, 1) ** 8) * np.exp(-dist / (ANCHO * .9))
    color = 1 - (1 - color) * (1 - rayos[..., None] * .5)
    tono = (xx / ANCHO * 1.4 + yy / ALTO * .6 + rnd.uniform(0, 1)) * 2 * np.pi
    arcoiris = np.stack([np.sin(tono) * .5 + .5, np.sin(tono + 2.1) * .5 + .5, np.sin(tono + 4.2) * .5 + .5], -1)
    velo = np.exp(-(((xx - rnd.uniform(.2, .8) * ANCHO) ** 2) / (2 * (ANCHO * .18) ** 2) + ((yy - rnd.uniform(.35, .7) * ALTO) ** 2) / (2 * (ALTO * .2) ** 2)))[..., None]
    color = 1 - (1 - color) * (1 - arcoiris * velo * .38)

    # 4. Sombreado a plumilla en las zonas medias-oscuras
    sombra = np.clip(np.clip((.62 - lum) / .3, 0, 1) * .6 + macizo, 0, 1) * (1 - tinta)
    r1, r2 = rayado(ANCHO, ALTO, rnd, 28), rayado(ANCHO, ALTO, rnd, -35, 7)
    plumilla = np.clip(r1 * sombra * .7 + r2 * np.clip(sombra - .45, 0, 1) * .8, 0, 1)
    plumilla = np.maximum(plumilla, garabatos_borde(ANCHO, ALTO, rnd) * .55)

    # 5. Textura de papel
    ruido = np.asarray(Image.effect_noise((ANCHO, ALTO), 40).filter(ImageFilter.GaussianBlur(.8 * K)), dtype=np.float32) / 255
    color = color * (.94 + ruido[..., None] * .1)

    # 6. Tinta encima
    negro = hexrgb("#1d1530")
    capa_tinta = np.clip(tinta * .95 + plumilla * .7, 0, 1)[..., None]
    final = color * (1 - capa_tinta) + negro * capa_tinta

    # 7. Brillo: las zonas de luz irradian un poco (bloom) y el conjunto gana contraste
    lf = final @ np.array([.299, .587, .114], dtype=np.float32)
    brillo = Image.fromarray((np.clip((lf - .8) / .2, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14 * K))
    brillo = np.asarray(brillo, dtype=np.float32)[..., None] / 255
    final = 1 - (1 - final) * (1 - brillo * .3)
    gf = (final @ np.array([.299, .587, .114], dtype=np.float32))[..., None]
    final = np.clip(gf + (final - gf) * 1.22, 0, 1)  # más saturación
    final = np.clip((final - .5) * 1.1 + .49, 0, 1)  # más contraste

    out = Image.fromarray((np.clip(final, 0, 1) * 255).astype(np.uint8))
    out = destellos(out, rnd)
    out.save(os.path.join(AQUI, "cartas", cid + ".jpg"), quality=82, optimize=True, progressive=True)
    out.resize((240, 410), Image.LANCZOS).save(os.path.join(AQUI, "cartas", "min", cid + ".jpg"), quality=80, optimize=True, progressive=True)


if __name__ == "__main__":
    os.makedirs(os.path.join(AQUI, "cartas", "min"), exist_ok=True)
    ids = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(os.path.join(AQUI, "rws-1909")) if f.endswith(".jpg"))
    for cid in ids:
        estilizar(cid)
        print("✓", cid)
