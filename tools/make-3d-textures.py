#!/usr/bin/env python3
# Makes the textures of the 3D models (assets/3d): stone and marble from the site's own stone pictures, a concrete block wall
# drawn here, and the normal maps that give them relief. Run from the repository root:  python3 tools/make-3d-textures.py
import numpy as np, cv2, os
rs = np.random.RandomState(3)

def seamless(path, size=1024, gain=1.0, sat=1.0):
    im = cv2.imread(path); h, w = im.shape[:2]; s = min(h, w)
    im = cv2.resize(im[(h - s) // 2:(h + s) // 2, (w - s) // 2:(w + s) // 2], (size, size), interpolation=cv2.INTER_AREA).astype(np.float32)
    low = cv2.GaussianBlur(im, (0, 0), size / 5); im = np.clip(im - low + low.mean((0, 1)), 0, 255)       # even lighting, no bright corner
    hsv = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32); hsv[:, :, 1] *= sat; hsv[:, :, 2] *= gain
    im = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    # repeats without seams and without a mirror pattern: near the edges the picture fades into itself shifted by half a tile
    t = np.abs(np.linspace(-1, 1, size, dtype=np.float32)); e = np.clip((t - 0.55) / 0.45, 0, 1); e = e * e * (3 - 2 * e)
    wx = np.maximum(e[None, :], e[:, None])[:, :, None]
    sh = np.roll(np.roll(im, size // 2, 0), size // 2, 1)
    return np.clip(im * (1 - wx) + sh * wx, 0, 255).astype(np.uint8)

def normal(height, strength):
    hgt = cv2.GaussianBlur(np.pad(height.astype(np.float32), 8, mode="wrap"), (0, 0), 1.0)
    dx = cv2.Sobel(hgt, cv2.CV_32F, 1, 0, ksize=3)[8:-8, 8:-8] * strength; dy = cv2.Sobel(hgt, cv2.CV_32F, 0, 1, ksize=3)[8:-8, 8:-8] * strength
    n = np.dstack([-dx, dy, np.ones_like(dx)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    return ((n * 0.5 + 0.5) * 255).astype(np.uint8)[:, :, ::-1]                                           # RGB normal map, BGR for OpenCV

def save(name, img, q=84):
    f = f"assets/3d/{name}.webp"; cv2.imwrite(f, img, [cv2.IMWRITE_WEBP_QUALITY, q]); print(name, img.shape[:2], os.path.getsize(f) // 1024, "KB")

st = seamless("images/stones/stone-limestone-beige.jpg", 1024, gain=1.12, sat=0.9)
save("stone", st, 80); save("stone_n", cv2.resize(normal(cv2.cvtColor(st, cv2.COLOR_BGR2GRAY), 0.007), (512, 512), interpolation=cv2.INTER_AREA), 82)
save("marble", seamless("images/stones/stone-marble.jpg", 1024, gain=1.05), 80)

# concrete block wall in running bond: 160 cm to the tile, blocks of 40 x 20 cm, 1 cm recessed joints
S = 1024; pc = S / 160.0; bw, bh, j = int(40 * pc), int(20 * pc), max(4, int(1.0 * pc))
def fbm(n, octs=6):
    out = np.zeros((n, n), np.float32); amp = 1.0
    for o in range(octs):
        k = 2 ** (o + 2); g = rs.rand(k, k).astype(np.float32); g = np.pad(g, ((0, 1), (0, 1)), mode="wrap")
        out += amp * cv2.resize(g, (n + n // k, n + n // k), interpolation=cv2.INTER_CUBIC)[:n, :n]; amp *= 0.5
    return (out - out.min()) / (out.max() - out.min())
grain = cv2.GaussianBlur(rs.rand(S, S).astype(np.float32), (0, 0), 0.9); grain = (grain - grain.min()) / (grain.max() - grain.min())
height = 0.5 + 0.35 * (fbm(S) - 0.5) + 0.9 * (grain - 0.5)
tone = np.zeros((S, S), np.float32); mort = np.zeros((S, S), bool)
for r in range(S // bh):
    off = (bw // 2) if r % 2 else 0; mort[r * bh:r * bh + j, :] = True
    for c in range(-1, S // bw + 1):
        xs = np.arange(c * bw + off, c * bw + off + bw) % S; tone[r * bh:(r + 1) * bh][:, xs] = 0.86 + 0.22 * rs.rand()
        mort[r * bh:(r + 1) * bh][:, np.arange(c * bw + off, c * bw + off + j) % S] = True
tex = tone[:, :, None] * np.array([96, 100, 104], np.float32) * (0.62 + 0.76 * height[:, :, None])
tex[mort] = np.array([58, 60, 62], np.float32) * (0.9 + 0.2 * height[mort][:, None]); height[mort] -= 0.5
save("wall", np.clip(tex, 0, 255).astype(np.uint8), 82); save("wall_n", cv2.resize(normal(height * 255, 0.0045), (512, 512), interpolation=cv2.INTER_AREA), 82)
