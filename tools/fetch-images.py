#!/usr/bin/env python3
# Pictures made outside the repository (for example with Higgsfield) and listed in tools/fetch-images.txt are downloaded once
# and saved as JPEG at their path, 1000 px wide. One line per picture:  <path in the site> <link>
# The build workflow runs this; a picture that already exists is left alone. Links expire, the saved file stays.
import io, os, sys, urllib.request
from PIL import Image
root = sys.argv[1] if len(sys.argv) > 1 else "."
for line in open(os.path.join(root, "tools", "fetch-images.txt"), encoding="utf8"):
    line = line.strip()
    if not line or line.startswith("#"): continue
    path, url = line.split(None, 1); out = os.path.join(root, path)
    if os.path.exists(out) or not path.startswith("images/") or ".." in path or not url.startswith("https://"): continue
    try:
        req = urllib.request.Request(url, headers={"user-agent": "Mozilla/5.0 al-swati-site"})
        im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=120).read())).convert("RGB")
        if im.width > 1000: im = im.resize((1000, round(im.height * 1000 / im.width)), Image.LANCZOS)
        os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out, "JPEG", quality=84, optimize=True, progressive=True)
        print("saved", path, im.size)
    except Exception as e:
        print("could not fetch", path, type(e).__name__, e)
