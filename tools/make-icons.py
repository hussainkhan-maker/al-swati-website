# Makes the website's square icon (Google shows it next to the site in search results; it needs a square, not the wide logo)
# and the 1200x630 JPG share picture (WhatsApp, Facebook, LinkedIn and X show it when someone sends a link).
# Both are made from the site's own logo and hero photo. Run by .github/workflows/build.yml when they are missing or this file changes.
import os, sys
from PIL import Image, ImageDraw, ImageFont

root = sys.argv[1] if len(sys.argv) > 1 else "."
P = lambda *a: os.path.join(root, *a)
BG = (26, 26, 26, 255)  # the site's dark colour

logo = Image.open(P("images/logo/horizontal/dark.png")).convert("RGBA")  # white logo, for dark backgrounds
mark = logo.crop((0, 0, 174, logo.height))  # the stone-block mark at the left of the logo
mark = mark.crop(mark.getbbox())


# The mark is not symmetric (a tall block on top, a thin diagonal block at the lower left), so centring its outline box
# makes it look pushed to the right and down. It is placed on its "optical" centre instead: halfway between the
# centre of its box and the centre of its visible mass.
_alpha = mark.getchannel("A")
_mass = [(x, y, v) for y in range(mark.height) for x in range(mark.width) if (v := _alpha.getpixel((x, y))) > 40]
_cx = sum(x * v for x, y, v in _mass) / sum(v for *_, v in _mass)
_cy = sum(y * v for x, y, v in _mass) / sum(v for *_, v in _mass)
OPT = ((mark.width / 2 + _cx) / 2, (mark.height / 2 + _cy) / 2)  # optical centre, in mark pixels
HALF_DIAG = max(((x - OPT[0]) ** 2 + (y - OPT[1]) ** 2) ** 0.5 for x, y in ((0, 0), (mark.width, 0), (0, mark.height), (mark.width, mark.height)))


def icon(size, safe=0.37):
    """A solid dark square with the mark in the middle. Google shows the icon inside a circle, so the whole mark is kept
    inside a circle of radius safe*size around the centre, which also keeps it clear of rounded corners on phones."""
    im = Image.new("RGBA", (size, size), BG)
    k = safe * size / HALF_DIAG
    w, h = max(1, round(mark.width * k)), max(1, round(mark.height * k))
    m = mark.resize((w, h), Image.LANCZOS)
    x, y = round(size / 2 - OPT[0] * k), round(size / 2 - OPT[1] * k)
    im.alpha_composite(m, (x, y))
    return im


os.makedirs(P("images/icons"), exist_ok=True)
for s in (48, 96, 192, 512):
    icon(s).convert("RGB").save(P(f"images/icons/icon-{s}.png"), optimize=True)
icon(180, safe=0.34).convert("RGB").save(P("apple-touch-icon.png"), optimize=True)
icon(256).save(P("favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# share picture: a real project facade (the stone fins building, Irqa), darkened at the bottom, with the logo and one line
hero = Image.open(P("images/cases/commercial-riyadh-stone-irqa-2025/mechanical-stone-cladding-irqa-riyadh-01-86bff2.jpg")).convert("RGB")
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
ImageDraw.Draw(card).text((66, H - 80), "Stone, marble and porcelain facades  |  Riyadh", font=font or ImageFont.load_default(), fill=(245, 245, 245))
os.makedirs(P("images/share"), exist_ok=True)
card.convert("RGB").save(P("images/share/al-swati-stone-facades.jpg"), quality=84, optimize=True, progressive=True)
print("icons and share picture made")
