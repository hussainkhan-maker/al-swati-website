# Makes the website's square icon (Google shows it next to the site in search results; it needs a square, not the wide logo)
# and the 1200x630 JPG share picture (WhatsApp, Facebook, LinkedIn and X show it when someone sends a link).
# Both are made from the site's own logo and hero photo. Run once by .github/workflows/build.yml when they are missing.
import os, sys
from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1] if len(sys.argv) > 1 else "."
P = lambda *a: os.path.join(root, *a)
BG = (26, 26, 26, 255)  # the site's dark colour

logo = Image.open(P("images/logo/horizontal/dark.png")).convert("RGBA")  # white logo, for dark backgrounds
mark = logo.crop((0, 0, 174, logo.height))  # the stone-block mark at the left of the logo
mark = mark.crop(mark.getbbox())


def icon(size, pad=0.14, radius=0.18, round_corners=True):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0) if round_corners else BG)
    if round_corners:
        ImageDraw.Draw(im).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius), fill=BG)
    m = mark.copy()
    inner = int(size * (1 - 2 * pad))
    m.thumbnail((inner, inner), Image.LANCZOS)
    im.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return im


os.makedirs(P("images/icons"), exist_ok=True)
for s in (48, 96, 192, 512):
    icon(s).save(P(f"images/icons/icon-{s}.png"), optimize=True)
icon(180, pad=0.16, round_corners=False).convert("RGB").save(P("apple-touch-icon.png"), optimize=True)
icon(256).save(P("favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# share picture: the home page hero, darkened at the bottom, with the logo and one line
hero = Image.open(P("images/pages/home/hero.webp")).convert("RGB")
W, H = 1200, 630
k = max(W / hero.width, H / hero.height)
hero = hero.resize((int(hero.width * k) + 1, int(hero.height * k) + 1), Image.LANCZOS)
top, left = int((hero.height - H) * 0.35), (hero.width - W) // 2
card = hero.crop((left, top, left + W, top + H)).convert("RGBA")
fade = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(fade)
for y in range(H):
    d.line([(0, y), (W, y)], fill=int(max(0.0, (y - H * 0.25) / (H * 0.75)) * 240))
shade = Image.new("RGBA", (W, H), BG)
shade.putalpha(fade)
card.alpha_composite(shade)
L = logo.copy()
L.thumbnail((520, 140), Image.LANCZOS)
card.alpha_composite(L, (64, H - 64 - L.height - 58))
font = None
for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"):
    if os.path.exists(f):
        font = ImageFont.truetype(f, 28)
        break
ImageDraw.Draw(card).text((66, H - 80), "Stone cladding, marble & granite  |  Riyadh, Dammam, Al-Hassa", font=font or ImageFont.load_default(), fill=(245, 245, 245))
os.makedirs(P("images/share"), exist_ok=True)
card.convert("RGB").save(P("images/share/al-swati-contracting.jpg"), quality=84, optimize=True, progressive=True)
print("icons and share picture made")
