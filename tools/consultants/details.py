#!/usr/bin/env python3
# Typical fixing details as engineering-style line drawings (vertical sections), one SVG per system and language.
# The same geometry as the videos' drawn scenes (ERP repo, video/scene.html), in millimetres: wall face at x = 0, stone on
# the right, y = 0 at the top of the blade (the seat of the upper panel). Reference only: no anchor or bolt sizes.
#   python3 details.py            writes images/details/<system>-<lang>.svg and returns the markup through svg(system, lang)
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
D = dict(gap=40, stone=30, kerfW=4, kerfD=15, th=3, leg=55, tongue=12, joint=8, ay=-28, ain=70)
INK, STEEL = "#1a1a1a", "#3b424a"

T = {
 "en": dict(nfc="TYPICAL DETAIL · FOR REFERENCE ONLY · NOT FOR CONSTRUCTION", nts="Vertical section · not to scale · sizes per the project engineer", typ="30 TYP.", cav="CAVITY", jt="JOINT",
   wall="Structural wall (reinforced concrete)", beam="Slab edge or beam (reinforced concrete)", anchor="Wall anchor, type and size per the engineer's calculation", stone="Stone panel, typically 30 mm", cavity="Ventilated cavity, no mortar", joint="Joint per the shop drawings",
   updown=("UP-DOWN ANGLE FIXING", ["Up-Down angle, stainless or hot-dip galvanised steel per the specification; slotted hole for adjustment", "Up-tongue in the kerf of the upper panel; the panel bears on the blade", "Down-tongue in the kerf of the lower panel, clear under the blade"]),
   pen=("PEN (PIN) FIXING", ["Bracket, stainless or hot-dip galvanised steel per the specification", "Pin through the blade: half in the panel above, half in the panel below", "Hole drilled in the panel edge; hardware hidden in the joint"]),
   cchannel=("VERTICAL C-CHANNEL", ["Wall bracket, anchored into the concrete", "Vertical steel channel, spanning between the brackets", "Stone bracket (Up-Down angle shown) bolted to the channel", "Backup wall that does not carry the stone (e.g. hollow block)"]),
   kerfrail=("KERF RAIL SYSTEM", ["Horizontal rail, continuous along the row, fixed to the wall or to vertical profiles", "Rail blade in the continuous kerf of the upper panel; the panel bears on the rail", "Rail blade in the continuous kerf of the lower panel, clear under the rail"]),
   loadpath=("LOAD PATH: STONE ON VERTICAL CHANNELS", "Section through two floors · schematic", ["Slab edge or beam (reinforced concrete)", "Infill wall (e.g. hollow block): carries no cladding load", "Wall bracket at each slab edge or beam", "Vertical channel spanning from floor to floor", "Stone bracket at each horizontal joint", "Stone panel", "Dead load: panel → bracket → channel → wall bracket → slab", "Wind load: panel → brackets → channel → slabs above and below"]),
   frame=("STEEL SUBSTRUCTURE: ELEVATION", "Elevation, stone partly removed · schematic", ["Column (reinforced concrete)", "Beam or slab edge (reinforced concrete)", "Infill wall: not loaded by the cladding", "Vertical steel member, spacing per the engineer", "Fixed point: carries the member's dead load", "Sliding point: holds against wind, free for thermal movement", "Stone brackets at each joint level", "Stone panels"]),
   ucback=("UNDERCUT ANCHORS: BACK OF PANEL", "Elevation from the wall side · schematic", ["Stone or porcelain panel, back face", "Undercut anchor in the back of the panel; number per the engineer", "Hanger on each anchor, with level adjustment", "Horizontal rail; the hangers hook over it", "Rail fixing to the wall or to vertical profiles"]),
   kerfelev=("KERF RAIL: ELEVATION", "Elevation · schematic", ["Stone panel", "Continuous rail in the horizontal joint (hidden)", "Kerf sawn along the whole top and bottom edge of the panel", "Rail fixing to the wall or to vertical profiles", "Vertical joint"]),
   corners=("EXTERNAL CORNERS: FOUR WAYS", "Plan (horizontal section) · schematic", ["Structure at the corner", "Cavity", "Stone panel", "Fixings on each side of the corner: each leg is carried on its own"], ["A · BUTT JOINT", "B · MITRE", "C · QUIRK MITRE", "D · SOLID CORNER PIECE"]),
   undercut=("UNDERCUT ANCHOR ON RAIL", ["Horizontal rail on the wall (or on vertical profiles)", "Undercut anchor locked by shape in a hole in the BACK of the panel; the face stays whole", "Hanger on the anchor, hooked over the rail; each panel hangs on its own"])),
 "ar": dict(nfc="تفصيلة نموذجية · للاسترشاد فقط · ليست للتنفيذ", nts="قطاع رأسي · بدون مقياس رسم · المقاسات حسب مهندس المشروع", typ="30 غالباً", cav="فراغ", jt="فاصل",
   wall="جدار إنشائي (خرسانة مسلحة)", beam="حافة البلاطة أو الكمرة (خرسانة مسلحة)", anchor="انكر في الجدار، نوعه ومقاسه حسب حساب المهندس", stone="لوح حجر، 30 مم غالباً", cavity="فراغ مهوّى، بدون مونة", joint="فاصل حسب المخططات التنفيذية",
   updown=("التثبيت بزوايا Up-Down", ["زاوية Up-Down من الستانلس ستيل أو الحديد المجلفن على الساخن حسب المواصفة، بثقب طولي للضبط", "اللسان العلوي في شق اللوح العلوي، واللوح يرتكز على الزاوية", "اللسان السفلي في شق اللوح السفلي، مع خلوص تحت الزاوية"]),
   pen=("التثبيت بالدبابيس PEN", ["زاوية حاملة من الستانلس ستيل أو الحديد المجلفن على الساخن حسب المواصفة", "دبوس يمر في الزاوية: نصفه في اللوح العلوي ونصفه في اللوح السفلي", "ثقب في حافة اللوح، والمكونات مخفية في الفاصل"]),
   cchannel=("مجاري C-Channel الرأسية", ["زاوية جدارية مثبتة في الخرسانة", "مجرى حديد رأسي يمتد بين الزوايا الجدارية", "زاوية الحجر (زاوية Up-Down في الرسم) مثبتة على المجرى بالبراغي", "جدار خلفي لا يحمل الحجر (مثل البلك المفرغ)"]),
   kerfrail=("نظام مجرى Kerf", ["مجرى أفقي مستمر على طول الصف، مثبت على الجدار أو على قوائم رأسية", "شفرة المجرى في الشق المستمر للوح العلوي، واللوح يرتكز على المجرى", "شفرة المجرى في الشق المستمر للوح السفلي، مع خلوص تحت المجرى"]),
   loadpath=("مسار الحمل: الحجر على مجاري رأسية", "قطاع في دورين · رسم تخطيطي", ["حافة البلاطة أو الكمرة (خرسانة مسلحة)", "جدار حشو (مثل البلك المفرغ): لا يحمل أي حمل من الواجهة", "زاوية جدارية عند كل حافة بلاطة أو كمرة", "مجرى رأسي يمتد من دور إلى دور", "زاوية حجر عند كل فاصل أفقي", "لوح حجر", "الحمل الميت: اللوح ← الزاوية ← المجرى ← الزاوية الجدارية ← البلاطة", "حمل الرياح: اللوح ← الزوايا ← المجرى ← البلاطتان أعلى وأسفل"]),
   frame=("الهيكل المعدني خلف الحجر: واجهة", "واجهة مع إزالة جزء من الحجر · رسم تخطيطي", ["عمود (خرسانة مسلحة)", "كمرة أو حافة بلاطة (خرسانة مسلحة)", "جدار حشو: لا تحمّله الواجهة", "قائم حديد رأسي، والمسافات حسب المهندس", "نقطة ثابتة: تحمل الحمل الميت للقائم", "نقطة منزلقة: تقاوم الرياح وتسمح بالتمدد الحراري", "زوايا الحجر عند كل منسوب فاصل", "ألواح الحجر"]),
   ucback=("مراسي Undercut: ظهر اللوح", "واجهة من جهة الجدار · رسم تخطيطي", ["لوح حجر أو بورسلان، الوجه الخلفي", "مرساة Undercut في ظهر اللوح، والعدد حسب المهندس", "مشبك تعليق على كل مرساة مع ضبط للمنسوب", "مجرى أفقي تُعلّق عليه المشابك", "تثبيت المجرى في الجدار أو في قوائم رأسية"]),
   kerfelev=("مجرى Kerf: واجهة", "واجهة · رسم تخطيطي", ["لوح حجر", "مجرى مستمر في الفاصل الأفقي (مخفي)", "شق على طول الحافة العلوية والسفلية للوح", "تثبيت المجرى في الجدار أو في قوائم رأسية", "فاصل رأسي"]),
   corners=("الزوايا الخارجية: أربع طرق", "مسقط أفقي (قطاع أفقي) · رسم تخطيطي", ["الهيكل الإنشائي عند الزاوية", "الفراغ", "لوح الحجر", "تثبيت على كل جانب من الزاوية: كل ضلع محمول وحده"], ["A · وصلة تراكب", "B · قص 45°", "C · قص 45° مع أنف", "D · قطعة زاوية مصمتة"]),
   undercut=("مراسي Undercut على مجرى", ["مجرى أفقي على الجدار (أو على قوائم رأسية)", "مرساة Undercut تُقفل بشكلها داخل ثقب في ظهر اللوح، والوجه يبقى سليماً", "مشبك تعليق على المرساة يُعلّق على المجرى، وكل لوح معلّق وحده"])),
}
SYSTEMS = ["updown", "pen", "cchannel", "kerfrail", "undercut"]
EXTRA = ["loadpath", "frame", "kerfelev", "ucback", "corners"]


def f(x): return f"{x:.1f}".rstrip("0").rstrip(".")


class Draw:
    def __init__(self, lang, x0, x1, y0=-112, y1=92):
        self.t, self.ar, self.b, self.items, self.g = T[lang], lang == "ar", (x0, x1, y0, y1), [], []

    def add(self, s): self.g.append(s)
    def wall(self, x0=-200, hollow=False):
        _, _, y0, y1 = self.b
        self.add(f'<rect x="{x0}" y="{y0 - 20}" width="{-x0}" height="{y1 - y0 + 40}" fill="url(#h-{"block" if hollow else "conc"})"/><path d="M0 {y0 - 20} V{y1 + 20}" stroke="{INK}" stroke-width=".9"/>')
    def stone(self, top, bottom, dx=0, slot_top=None, slot_bottom=None, w=None, dp=None):
        x, kw, kd = D["gap"] + dx, w or D["kerfW"], dp or D["kerfD"]; kx = x + D["stone"] / 2 - kw / 2
        self.add(f'<rect x="{x}" y="{top}" width="{D["stone"]}" height="{bottom - top}" fill="url(#h-stone)" stroke="{INK}" stroke-width=".7"/>')
        if slot_top: self.add(f'<rect x="{f(kx)}" y="{top - .4}" width="{kw}" height="{kd + .4}" fill="#fff" stroke="{INK}" stroke-width=".4"/>')
        if slot_bottom: self.add(f'<rect x="{f(kx)}" y="{bottom - kd}" width="{kw}" height="{kd + .4}" fill="#fff" stroke="{INK}" stroke-width=".4"/>')
    def steel(self, d): self.add(f'<path d="{d}" fill="{STEEL}" stroke="{INK}" stroke-width=".35" stroke-linejoin="round"/>')
    def anchor(self, y, x_face=D["th"], depth=D["ain"]):
        self.add(f'<rect x="{-depth}" y="{y - 3.4}" width="{depth + x_face + 11}" height="6.8" fill="#fff" stroke="{INK}" stroke-width=".5"/>'
                 + "".join(f'<path d="M{-depth + 4 + i * 3.2} {y - 3.4} v6.8" stroke="{INK}" stroke-width=".3"/>' for i in range(9))
                 + f'<rect x="{x_face}" y="{y - 8.5}" width="1.6" height="17" fill="{STEEL}"/><rect x="{x_face + 1.6}" y="{y - 6.2}" width="6" height="12.4" fill="#fff" stroke="{INK}" stroke-width=".5"/>'
                 + f'<path d="M{-depth - 8} {y} H{x_face + 20}" stroke="{INK}" stroke-width=".25" stroke-dasharray="6 1.5 1 1.5"/>')
    def bolt(self, x, y, ln=16):
        self.add(f'<rect x="{x - ln}" y="{y - 2.8}" width="{ln + 3}" height="5.6" fill="#fff" stroke="{INK}" stroke-width=".45"/><rect x="{x + 3}" y="{y - 6}" width="5.5" height="12" fill="#fff" stroke="{INK}" stroke-width=".45"/>')
    def angle(self, dx=0):
        kx = D["gap"] + D["stone"] / 2; th, tg = D["th"], D["tongue"]
        self.steel(f'M{dx} {-D["leg"]} h{th} v{D["leg"]} h{f(kx - th - th / 2)} v{-tg} h{th} v{tg * 2 + th} h{-th} v{-tg} H{dx} Z')
    def brk(self):
        """break lines: the parts continue above and below"""
        x0, x1, y0, y1 = self.b
        for y in (y0, y1):
            self.add(f'<rect x="{x0 - 30}" y="{y - (40 if y < 0 else 0)}" width="{x1 - x0 + 60}" height="40" fill="#fff"/>'
                     f'<path d="M{x0 - 4} {y} H{f((x0 + x1) / 2 - 6)} l3 -5 l6 10 l3 -5 H{x1 + 4}" fill="none" stroke="{INK}" stroke-width=".35"/>')
    def dim(self, x1, x2, y, label):
        self.add(f'<path d="M{x1} {y} H{x2} M{x1} {y - 3} v6 M{x2} {y - 3} v6" stroke="{INK}" stroke-width=".3" fill="none"/><path d="M{x1} {y} l3 -1.1 v2.2 Z M{x2} {y} l-3 -1.1 v2.2 Z" fill="{INK}"/>'
                 f'<text x="{f((x1 + x2) / 2)}" y="{y - 2.2}" font-size="5" text-anchor="middle" class="{"ar" if self.ar else "en"}">{label}</text>')
    def item(self, x, y, bx, by, text):
        """a numbered balloon at (bx, by) with a leader to the point (x, y); the text goes to the legend"""
        n = len(self.items) + 1; self.items.append(text)
        self.add(f'<path d="M{f(bx)} {f(by)} L{f(x)} {f(y)}" stroke="{INK}" stroke-width=".3"/><circle cx="{f(x)}" cy="{f(y)}" r="1" fill="{INK}"/>'
                 f'<circle cx="{f(bx)}" cy="{f(by)}" r="5.2" fill="#fff" stroke="{INK}" stroke-width=".45"/><text x="{f(bx)}" y="{f(by + 2)}" font-size="5.6" font-weight="700" text-anchor="middle" class="en">{n}</text>')

    def svg(self, title, uid="d", sub=None):
        x0, x1, y0, y1 = self.b; t = self.t; w = 760; u = min(3.4, 700 / (x1 - x0))
        dw = (x1 - x0) * u; ox = (w - dw) / 2 - x0 * u; oy = 78 - (y0 - 4) * u; hd = (y1 - y0 + 8) * u
        ly = 78 + hd + 26; lh = 24 * len(self.items); h = ly + lh + 44; anc = "start"
        leg = ""
        for i, s in enumerate(self.items):
            y = ly + i * 24; bx = w - 44 if self.ar else 44; tx = w - 64 if self.ar else 64
            leg += f'<circle cx="{bx}" cy="{y}" r="9" fill="#fff" stroke="{INK}" stroke-width="1"/><text x="{bx}" y="{y + 4}" font-size="11" font-weight="700" text-anchor="middle" class="en">{i + 1}</text><text x="{tx}" y="{y + 4.5}" font-size="13.5" text-anchor="{anc}" class="{"ar" if self.ar else "en"}"{" direction=\"rtl\"" if self.ar else ""}>{s}</text>'
        hatch = (f'<pattern id="h-stone" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><path d="M0 0 V5" stroke="{INK}" stroke-width=".28"/></pattern>'
                 f'<pattern id="h-conc" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#f1f1ef"/><path d="M4 5 l3 1.6 l-2.8 1.4 Z M17 16 l3.2 -.6 l-1.4 2.8 Z M20 4 l1.8 2.6 l-3 .2 Z M8 19 l2.4 -1.8 l.6 3 Z" fill="none" stroke="{INK}" stroke-width=".3"/>'
                 f'<g fill="{INK}">{"".join(f"<circle cx=\"{a}\" cy=\"{b}\" r=\".35\"/>" for a, b in [(2, 14), (11, 3), (13, 11), (23, 12), (6, 24), (15, 22), (24, 21), (10, 8), (19, 9), (3, 20)])}</g></pattern>'
                 f'<pattern id="h-block" width="60" height="40" patternUnits="userSpaceOnUse"><rect width="60" height="40" fill="#f6f6f4"/><path d="M0 0 H60 M0 40 H60" stroke="{INK}" stroke-width=".4"/><rect x="6" y="6" width="20" height="28" fill="#fff" stroke="{INK}" stroke-width=".3"/><rect x="34" y="6" width="20" height="28" fill="#fff" stroke="{INK}" stroke-width=".3"/></pattern>')
        cls = '.en{font-family:Montserrat,Arial,sans-serif;fill:#1a1a1a}.ar{font-family:Tajawal,Arial,sans-serif;fill:#1a1a1a}'
        out = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {f(h)}" role="img" aria-label="{title}"><defs>{hatch}<clipPath id="cp"><rect x="{x0 - 2}" y="{y0 - 6}" width="{x1 - x0 + 4}" height="{y1 - y0 + 12}"/></clipPath><style>{cls}</style></defs>'
                f'<rect width="{w}" height="{f(h)}" fill="#fff"/><rect x="6" y="6" width="{w - 12}" height="{f(h - 12)}" fill="none" stroke="{INK}" stroke-width="1.2"/>'
                f'<g transform="translate({f(ox)} {f(oy)}) scale({u})"><g clip-path="url(#cp)">{"".join(self.clipped)}</g>{"".join(self.g)}</g><rect x="7" y="7" width="{w - 14}" height="62" fill="#fff"/>'
                f'<text x="{w / 2}" y="38" font-size="19" font-weight="700" text-anchor="middle" class="{"ar" if self.ar else "en"}">{title}</text>'
                f'<text x="{w / 2}" y="58" font-size="11.5" text-anchor="middle" class="{"ar" if self.ar else "en"}">{sub or t["nts"]}</text>{leg}'
                f'<path d="M6 {f(h - 32)} H{w - 6}" stroke="{INK}" stroke-width="1"/><text x="{w / 2}" y="{f(h - 14)}" font-size="11" font-weight="700" text-anchor="middle" class="{"ar" if self.ar else "en"}">{t["nfc"]} · AL-SWATI CONTRACTING</text></svg>')
        for k in ("h-stone", "h-conc", "h-block", "cp", "cc0", "cc1", "cc2", "cc3"): out = out.replace(f'id="{k}"', f'id="{k}-{uid}"').replace(f'url(#{k})', f'url(#{k}-{uid})')
        return out


def build(system, lang):
    t = T[lang]; title, own = t[system]; g, st, j = D["gap"], D["stone"], D["joint"]
    off = 90 if system == "cchannel" else 0
    d = Draw(lang, -95, off + g + st + 50)
    x0, x1, y0, y1 = d.b
    # everything that runs off the top and bottom is clipped to the drawing's window
    if system == "cchannel":
        d.wall(hollow=True)   # block infill above, the concrete slab edge or beam below: the wall bracket goes into the concrete
        d.add(f'<rect x="-200" y="12" width="200" height="{y1 + 20 - 12}" fill="url(#h-conc)"/><path d="M-200 12 H0 M0 12 V{y1 + 20}" stroke="{INK}" stroke-width=".7" fill="none"/>')
        d.steel("M0 15 h4 v28 h54 v4 h-54 v28 h-4 Z"); d.anchor(60, 4)
        d.add(f'<rect x="50" y="{y0 - 20}" width="40" height="{y1 - y0 + 40}" fill="#fff" stroke="{INK}" stroke-width=".7"/><rect x="54" y="{y0 - 20}" width="32" height="{y1 - y0 + 40}" fill="none" stroke="{INK}" stroke-width=".3" stroke-dasharray="3 2"/>')
        d.bolt(54, 45, 10); d.stone(j, y1 + 20, off, slot_top=True); d.stone(y0 - 20, 0, off, slot_bottom=True); d.angle(off); d.bolt(off + D["th"], D["ay"], 16)
    elif system == "undercut":
        d.wall(); yR = -12
        d.steel(f"M0 {yR - 18} h4 v26 h18 v-20 h-3 v17 h-15 v25 h-4 Z"); d.anchor(yR + 21, 4)
        d.stone(j + 4, y1 + 20); d.stone(y0 - 20, 0)
        d.add(f'<path d="M{g - .3} {-12.5} H{g + 11} L{g + 16} {-15.1} V{-2.9} L{g + 11} {-5.5} H{g - .3} Z" fill="#fff" stroke="{INK}" stroke-width=".4"/>')
        d.add(f'<path d="M{g + 11} -12.2 L{g + 16} -14.6 V-3.4 L{g + 11} -5.8 Z" fill="{STEEL}"/><rect x="{g - 12}" y="-11.4" width="24" height="4.8" fill="#fff" stroke="{INK}" stroke-width=".45"/>')
        d.steel(f"M{g} -18 h-4 v-7 h-22 v14 h3 v-10 h15 v20 h8 Z")
    else:
        d.wall(); d.stone(j, y1 + 20, slot_top=True, **(dict(w=6.5, dp=30) if system == "pen" else {})); d.stone(y0 - 20, 0, slot_bottom=True, **(dict(w=6.5, dp=30) if system == "pen" else {}))
        if system == "pen":
            e = g + st / 2 + 9; d.steel(f'M0 {-D["leg"]} h{D["th"]} v{D["leg"]} H{e} v{D["th"]} H0 Z')
            d.add(f'<rect x="{g + st / 2 - 2.5}" y="-25" width="5" height="50" rx="2" fill="{STEEL}" stroke="{INK}" stroke-width=".35"/>')
        else: d.angle()
        d.anchor(D["ay"])
    d.clipped, d.g = d.g, []; d.brk()
    R, L = off + g + st + 34, -78   # balloon columns right and left of the drawing
    kx = off + g + st / 2
    if system == "cchannel": d.item(-40, -55, L, -55, own[3]); d.item(-45, 80, L, 82, t["beam"])
    else: d.item(-45, 62, L, 62, t["wall"])
    if system == "cchannel":
        d.item(-30, 60, L, 30, t["anchor"]); d.item(30, 45, L, -2, own[0]); d.item(70, -70, L, -70, own[1]); d.item(off + 22, 1.5, R, -22, own[2])
    elif system == "undercut":
        d.item(-30, 9, L, 30, t["anchor"]); d.item(12, -22, L, -40, own[0]); d.item(g + 13, -9, R, -40, own[1]); d.item(g - 16, -22, L + 40, -92, own[2])
    else:
        d.item(-30, D["ay"], L, D["ay"], t["anchor"]); d.item(18, 1.5, L, -70, own[0]); d.item(kx + 1.5, -8, R, -22, own[1]); d.item(kx + 1.5, 14, R, 26, own[2])
    d.item(off + g + st - 5, -80, R, -80, t["stone"]); d.item(off + g / 2 + (0 if system != "cchannel" else 0), 50, R, 58, t["cavity"])
    d.item(off + g + st - 3, j / 2 + (2 if system == "undercut" else 0), R, 2, t["joint"])
    d.dim(off + g, off + g + st, -98, t["typ"])
    return d.svg(title, f"{system}-{lang}")


def arrow(x1, y1, x2, y2, w=1.1):
    import math
    a = math.atan2(y2 - y1, x2 - x1); hx, hy = x2 - 5 * math.cos(a), y2 - 5 * math.sin(a); px, py = 2.2 * math.sin(a), -2.2 * math.cos(a)
    return f'<path d="M{f(x1)} {f(y1)} L{f(hx)} {f(hy)}" stroke="{INK}" stroke-width="{w}"/><path d="M{f(x2)} {f(y2)} L{f(hx + px)} {f(hy + py)} L{f(hx - px)} {f(hy - py)} Z" fill="{INK}"/>'


def extra(kind, lang):
    """the schematic drawings: units are free (about 3.4 px each), not millimetres"""
    t = T[lang]; title, subt, it = t[kind][:3]; R = lambda x, y, w, h, fill, sw=.5, ex="": f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" fill="{fill}" stroke="{INK}" stroke-width="{sw}" {ex}/>'
    if kind == "loadpath":
        d = Draw(lang, 0, 206, 0, 176); g = []
        g.append(R(74, -5, 18, 186, "url(#h-block)", .5))
        for y in (30, 128): g.append(R(-10, y, 102, 12, "url(#h-conc)", .7))
        g.append(R(100, -5, 8, 186, "#fff", .7))
        for y in (34, 132): g.append(R(92, y, 8, 4, STEEL, .3))
        ys = [8 + i * 32.5 for i in range(6)]
        for y in ys: g.append(R(122, y + 1.25, 8, 30, "url(#h-stone)", .6)); g.append(R(108, y - .3, 17, 1.6, STEEL, .2))
        g += [arrow(104, 52, 104, 120, 1.4), arrow(99, 141, 80, 141, 1.4)] + [arrow(160, y, 133, y) for y in (62, 78, 94)]
        d.g = g; d.clipped, d.g = d.g, []
        d.item(40, 36, 22, 14, it[0]); d.item(83, 85, 40, 85, it[1]); d.item(96, 134, 62, 162, it[2]); d.item(104, 12, 150, 12, it[3]); d.item(115, 73.5, 150, 34, it[4]); d.item(126, 150, 166, 150, it[5]); d.item(104, 105, 60, 110, it[6]); d.item(146, 94, 176, 112, it[7])
    elif kind == "frame":
        d = Draw(lang, 0, 206, 0, 170); g = [R(22, 26, 162, 118, "url(#h-block)", .4)]
        for x in (6, 184): g.append(R(x, -5, 16, 180, "url(#h-conc)", .7))
        for y in (14, 144): g.append(R(22, y, 162, 12, "url(#h-conc)", .7))
        for x in (44, 74, 104, 134, 164):
            g.append(R(x - 2, 17, 4, 136, "#fff", .6)); g.append(R(x - 5, 17, 10, 5, STEEL, .3)); g.append(R(x - 5, 148, 10, 5, "#fff", .5) + f'<path d="M{x - 3} 150.5 H{x + 3}" stroke="{INK}" stroke-width=".8"/>')
            for y in (40, 64, 88, 112, 136): g.append(R(x - 4, y - 1, 8, 2, STEEL, .2))
        for r in range(2):
            for c in range(3): g.append(R(91 + c * 31, 89.5 + r * 24, 30, 23, "#fff", .6))
        g.append(f'<path d="M89 88 l4 -3 l5 6 l4 -3" fill="none" stroke="{INK}" stroke-width=".35"/>')
        d.g = g; d.clipped, d.g = d.g, []
        d.item(14, 60, 14, 100, it[0]); d.item(60, 20, 60, 6, it[1]); d.item(30, 76, 30, 120, it[2]); d.item(74, 52, 89, 52, it[3]); d.item(104, 19.5, 119, 6, it[4]); d.item(134, 150.5, 119, 164, it[5]); d.item(164, 64, 176, 76, it[6]); d.item(136, 125, 150, 164, it[7])
    elif kind == "corners":
        d = Draw(lang, 0, 206, 0, 172); g = []; caps = t[kind][3]
        P = lambda pts, fill, sw=.6: f'<path d="M' + " L".join(f"{f(a)} {f(b)}" for a, b in pts) + f' Z" fill="{fill}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round"/>'
        shapes = {
            0: [[(0, 15), (60, 15), (60, 22), (0, 22)], [(53, 23.2), (60, 23.2), (60, 80), (53, 80)]],
            1: [[(0, 15), (59.2, 15), (52.2, 22), (0, 22)], [(60, 15.8), (60, 80), (53, 80), (53, 22.8)]],
            2: [[(0, 15), (58, 15), (58, 16.8), (52.8, 22), (0, 22)], [(60, 17), (60, 80), (53, 80), (53, 23), (58.2, 17)]],
            3: [[(0, 15), (38.8, 15), (38.8, 22), (0, 22)], [(40, 15), (60, 15), (60, 35), (53, 35), (53, 22), (40, 22)], [(53, 36.2), (60, 36.2), (60, 80), (53, 80)]],
        }
        for i in range(4):
            ox, oy = 14 + (i % 2) * 98, 4 + (i // 2) * 84
            c = f'<rect x="-2" y="30" width="47" height="52" fill="url(#h-conc)"/><path d="M-2 30 H45 V82" fill="none" stroke="{INK}" stroke-width=".8"/>'
            c += "".join(P(pts, "url(#h-stone)") for pts in shapes[i])
            c += R(28, 22, 2.2, 8, STEEL, .2) + R(45, 48, 8, 2.2, STEEL, .2) + (R(45, 26, 8, 2.2, STEEL, .2) if i == 3 else "")
            cap = f'<text x="30" y="8" font-size="5.2" font-weight="700" text-anchor="middle" class="{"ar" if d.ar else "en"}">{caps[i]}</text>'
            g.append(f'<g transform="translate({ox} {oy})"><clipPath id="cc{i}"><rect x="-2" y="10" width="74" height="68"/></clipPath><g clip-path="url(#cc{i})">{c}</g>{cap}</g>')
        d.g = g; d.clipped, d.g = d.g, []
        d.item(14 + 20, 4 + 55, 14 + 20, 4 + 70, it[0]); d.item(14 + 49, 4 + 60, 14 + 76, 4 + 66, it[1]); d.item(14 + 12, 4 + 18.5, 14 + 76, 4 + 30, it[2]); d.item(14 + 49, 4 + 49, 14 + 76, 4 + 48, it[3])
    elif kind == "ucback":
        d = Draw(lang, 0, 206, 0, 150); g = [R(58, 30, 90, 90, "#fafaf8", .8)]
        for y in (52, 98):
            g.append(R(20, y - 2, 166, 4, "#fff", .5))
            for x in (30, 176): g.append(R(x - 4, y - 4, 8, 8, "#fff", .5) + f'<path d="M{x - 2.5} {y - 2.5} l5 5 M{x + 2.5} {y - 2.5} l-5 5" stroke="{INK}" stroke-width=".35"/>')
            for x in (74, 132): g.append(R(x - 4, y - 3, 8, 11, STEEL, .3) + f'<circle cx="{x}" cy="{y + 4.5}" r="1.6" fill="#fff" stroke="{INK}" stroke-width=".35"/>')
        d.g = g; d.clipped, d.g = d.g, []
        d.item(103, 75, 103, 134, it[0]); d.item(74, 56.5, 44, 22, it[1]); d.item(132, 50, 162, 22, it[2]); d.item(160, 98, 190, 80, it[3]); d.item(30, 98, 14, 124, it[4])
    else:
        d = Draw(lang, 0, 206, 0, 150); g = []
        for r in range(3):
            for c in range(3): g.append(R(28 + c * 51, 22 + r * 37, 48, 34, "#fafaf8", .7))
        for y in (57.5, 94.5):
            g.append(f'<path d="M20 {y - 1.6} H186 M20 {y + 1.6} H186" stroke="{INK}" stroke-width=".4" stroke-dasharray="3 1.6" fill="none"/>')
            for x in (40, 78, 116, 154): g.append(f'<circle cx="{x}" cy="{y}" r="1.5" fill="#fff" stroke="{INK}" stroke-width=".4"/>')
        g.append(f'<path d="M30 25 H74 M30 53 H74" stroke="{INK}" stroke-width=".3" stroke-dasharray="1.2 1.2"/>')
        d.g = g; d.clipped, d.g = d.g, []
        d.item(103, 76, 103, 140, it[0]); d.item(182, 57.5, 196, 40, it[1]); d.item(52, 25, 40, 8, it[2]); d.item(154, 94.5, 196, 110, it[3]); d.item(77.5, 112, 60, 140, it[4])
    return d.svg(title, f"{kind}-{lang}", subt)


def svg(system, lang): return extra(system, lang) if system in EXTRA else build(system, lang)


if __name__ == "__main__":
    out = os.path.join(ROOT, "images", "details"); os.makedirs(out, exist_ok=True)
    for s in SYSTEMS + EXTRA:
        for lang in ("en", "ar"):
            open(os.path.join(out, f"{s}-{lang}.svg"), "w", encoding="utf8").write(svg(s, lang))
    print("details written:", len(SYSTEMS + EXTRA) * 2)
