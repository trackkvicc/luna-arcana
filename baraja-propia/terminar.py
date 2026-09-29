"""Pone el nombre manuscrito y la marca del arco en la franja vacía de cada carta
y junta las cartas en un PDF.  Uso: python3 terminar.py"""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__))
CARTAS = [("00-el-loco-v2", "0. El Loco"), ("01-el-mago", "I. El Mago"), ("02-la-sacerdotisa", "II. La Sacerdotisa")]
simbolo = Image.open(os.path.join(D, "fuentes/simbolo.png")).convert("RGBA")

def franja(img):
    """Localiza la franja crema de abajo: el hueco entre las dos líneas oscuras que la encierran."""
    a = np.asarray(img.convert("L"), dtype=np.float32)
    h, w = a.shape
    fila = a[:, int(w * .3):int(w * .7)].mean(1)
    oscura = fila < 150
    y = h - 1
    while y > h * .6 and not oscura[y]: y -= 1      # borde inferior de la franja
    while y > h * .6 and oscura[y]: y -= 1
    fin = y
    while y > h * .6 and not oscura[y]: y -= 1      # borde superior de la franja
    ini = y + 1
    return ini + 4, fin - 4

paginas = []
for archivo, nombre in CARTAS:
    img = Image.open(os.path.join(D, "mayores", archivo + ".jpg")).convert("RGB")
    esc = 1536 / img.height                                      # trabajar a doble tamaño para texto nítido
    img = img.resize((round(img.width * esc), 1536), Image.LANCZOS)
    w, h = img.size
    y0, y1 = franja(img)
    alto = y1 - y0
    d = ImageDraw.Draw(img)
    fuente = ImageFont.truetype(os.path.join(D, "fuentes/Caveat.ttf"), int(alto * .62))
    try: fuente.set_variation_by_axes([700])
    except Exception: pass
    tw = d.textlength(nombre, font=fuente)
    d.text(((w - tw) / 2, y0 + alto * .47), nombre, font=fuente, fill=(43, 35, 64), anchor="lm")
    s = simbolo.resize((int(alto * .42 * 120 / 156), int(alto * .42)), Image.LANCZOS)
    img.paste(s, (int(w * .905) - s.width // 2, y0 + (alto - s.height) // 2), s)
    img.save(os.path.join(D, "terminadas", archivo.replace("-v2", "") + ".jpg"), quality=92)
    paginas.append(img)

pdf = os.path.join(D, "Luna-Arcana-muestra.pdf")
paginas[0].save(pdf, save_all=True, append_images=paginas[1:], resolution=200)
print("PDF:", pdf, len(paginas), "cartas; franjas detectadas OK")
