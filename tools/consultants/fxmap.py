# The picture map of the technical pages: one section through a mechanically fixed stone facade, eight parts to tap.
# Used by build.py (the consultants hub) and by `python3 fxmap.py` (writes it into /technical-specs/, EN and AR,
# between <!--fxmap--> marks). The drawing carries numbers only, so it is the same in both languages.
# Every sentence here repeats what the section's pages already state; no sizes or project values.
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

# key, number
ORDER = ["stone", "joint", "bracket", "cavity", "channel", "anchor", "structure", "infill"]

T = {
    "en": dict(
        e="The facade, part by part", h="Tap a Part of the Wall", lead="A section through a mechanically fixed stone facade. Choose a number to see what the part does and where to read more.",
        out="Outside", inn="Inside", path="Gold dashes: the load path, from the panel to the concrete.", aria="Parts of the facade",
        parts={
            "stone": ("Stone panel", "The face you see. Each panel hangs on its own fixings.", "Natural stone is typically 30 mm; marble and granite are often 20 mm.",
                      [("stone-materials", "Stone and finishes"), ("thickness-and-fixing", "Which thickness, which fixing")]),
            "joint": ("Open joint", "A gap around every panel.", "Each panel expands and contracts with the daily heat without pushing the next one.",
                      [("typical-details", "Typical details"), ("/technical-specs/#compare", "Mechanical or wet fixing")]),
            "bracket": ("Stone bracket", "The metal piece that carries the panel and holds it against the wind.", "Up-Down angle, pin (PEN) or kerf rail, in stainless or hot-dip galvanised steel according to the project specification.",
                        [("fixing-systems", "Fixing systems compared"), ("typical-details", "Five systems in section")]),
            "cavity": ("Cavity", "The air space behind the stone.", "There is no mortar behind the stone, so no mortar efflorescence (white salt stains) on the face.",
                       [("/technical-specs/#compare", "Mechanical or wet fixing"), ("maintenance", "Maintenance and handover")]),
            "channel": ("Vertical channel", "A steel rail from floor to floor that carries the stone brackets.", "Part of the steel substructure, installed to the engineer's design where the wall behind is hollow block or the stone stands off the wall.",
                        [("typical-details", "The steel substructure"), ("how-we-deliver", "How we deliver")]),
            "anchor": ("Anchor", "The bolt that goes into the concrete.", "Type and size follow the engineer's calculation and the consultant's specification. Pull-out tests are arranged on request.",
                       [("brand-systems", "Hilti, fischer and Rockany"), ("quality", "Quality and tests")]),
            "structure": ("Concrete structure", "Slab edges, beams and columns: where every load ends.", "The weight of the stone and the wind on it must reach the reinforced concrete.",
                          [("typical-details", "Where the load goes"), ("specification", "Guide specification 04 42 00")]),
            "infill": ("Infill wall", "The block wall between the slabs.", "Hollow block and other infill walls are not counted on to carry the cladding.",
                       [("typical-details", "Channel or frame"), ("send-drawings", "Send us your drawings")]),
        }),
    "ar": dict(
        e="الواجهة جزءاً جزءاً", h="اضغط على جزء من الجدار", lead="قطاع في واجهة حجر مثبتة ميكانيكياً. اختر رقماً لترى وظيفة الجزء وأين تقرأ عنه أكثر.",
        out="الخارج", inn="الداخل", path="الخط الذهبي المتقطع: مسار الحمل من اللوح إلى الخرسانة.", aria="أجزاء الواجهة",
        parts={
            "stone": ("لوح الحجر", "الوجه الذي تراه. كل لوح محمول على تثبيته الخاص.", "الحجر الطبيعي سماكته 30 مم غالباً، والرخام والجرانيت 20 مم غالباً.",
                      [("stone-materials", "الحجر والتشطيبات"), ("thickness-and-fixing", "أي سماكة وأي تثبيت")]),
            "joint": ("الفاصل المفتوح", "فراغ حول كل لوح.", "يتمدد كل لوح وينكمش مع حرارة النهار دون أن يدفع اللوح المجاور.",
                      [("typical-details", "التفاصيل النموذجية"), ("/technical-specs/#compare", "ميكانيكي أم إسمنتي")]),
            "bracket": ("زاوية الحجر", "القطعة المعدنية التي تحمل اللوح وتثبته أمام الرياح.", "زاوية Up-Down أو دبوس (PEN) أو مجرى Kerf، من الستانلس ستيل أو الحديد المجلفن على الساخن حسب مواصفة المشروع.",
                        [("fixing-systems", "مقارنة أنظمة التثبيت"), ("typical-details", "خمسة أنظمة في قطاع")]),
            "cavity": ("الفراغ الهوائي", "الفراغ خلف الحجر.", "لا مونة خلف الحجر، فلا يظهر تزهّر المونة (الأملاح البيضاء) على الوجه.",
                       [("/technical-specs/#compare", "ميكانيكي أم إسمنتي"), ("maintenance", "الصيانة والتسليم")]),
            "channel": ("المجرى الرأسي", "قطاع حديد من دور إلى دور يحمل زوايا الحجر.", "جزء من الهيكل المعدني، يُركَّب حسب تصميم المهندس حين يكون الجدار الخلفي من البلك المفرغ أو يبرز الحجر عن الجدار.",
                        [("typical-details", "الهيكل المعدني"), ("how-we-deliver", "كيف ننفّذ")]),
            "anchor": ("الانكر", "المسمار الذي يدخل في الخرسانة.", "النوع والمقاس حسب حساب المهندس ومواصفة الاستشاري. واختبارات السحب تُرتَّب عند الطلب.",
                       [("brand-systems", "هيلتي وفيشر وروكاني"), ("quality", "الجودة والاختبارات")]),
            "structure": ("الهيكل الخرساني", "حواف البلاطات والكمرات والأعمدة: حيث ينتهي كل حمل.", "وزن الحجر وضغط الرياح عليه يجب أن يصلا إلى الخرسانة المسلحة.",
                          [("typical-details", "أين يذهب الحمل"), ("specification", "المواصفة الإرشادية 04 42 00")]),
            "infill": ("جدار البلك", "جدار البلك بين البلاطات.", "البلك المفرغ وجدران الحشو الأخرى لا يُعتمد عليها في حمل الحجر.",
                       [("typical-details", "مجرى أم هيكل"), ("send-drawings", "أرسلوا مخططاتكم")]),
        }),
}


def _mark(n, x, y, lx=None, ly=None):
    lead = f'<path class="fx-lead" d="M{x} {y}L{lx} {ly}"/>' if lx is not None else ""
    return lead + f'<circle cx="{x}" cy="{y}" r="30" fill="transparent"/><circle class="fx-dot" cx="{x}" cy="{y}" r="15"/><text class="fx-num" x="{x}" y="{y + 5}">{n}</text>'


def svg():
    o = ['<svg viewBox="110 0 580 600" role="img" aria-hidden="true" focusable="false">',
         '<defs><pattern id="fx-conc" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#3b3b3b"/><circle cx="4" cy="5" r="1.4" fill="#565656"/><circle cx="15" cy="11" r="1" fill="#505050"/><circle cx="8" cy="18" r="1.2" fill="#5a5a5a"/><path d="M17 3l3 2-3 1z" fill="#525252"/></pattern>',
         '<linearGradient id="fx-st" x1="0" x2="1"><stop offset="0" stop-color="#e9e1cd"/><stop offset="1" stop-color="#c9bea3"/></linearGradient></defs>']
    # infill wall (above and below the slab)
    g = ['<g class="fx-hot" data-k="infill" tabindex="0" role="button">', '<rect class="fx-block" x="392" y="0" width="84" height="270"/><rect class="fx-block" x="392" y="330" width="84" height="270"/>']
    for y0, n in ((0, 270), (330, 270)):
        for i, y in enumerate(range(y0 + 34, y0 + n, 34)):
            g.append(f'<path class="fx-course" d="M392 {y}h84"/>')
        for i, y in enumerate(range(y0, y0 + n, 34)):
            x = 420 if i % 2 else 448
            g.append(f'<path class="fx-course" d="M{x} {y}v{min(34, y0 + n - y)}"/>')
    g.append(_mark(8, 434, 118) + "</g>")
    o += g
    # structure: slab
    o.append('<g class="fx-hot" data-k="structure" tabindex="0" role="button"><rect class="fx-conc" x="350" y="270" width="410" height="60" fill="url(#fx-conc)"/>' + _mark(7, 610, 300) + "</g>")
    # cavity
    o.append('<g class="fx-hot" data-k="cavity" tabindex="0" role="button"><rect class="fx-air" x="240" y="0" width="60" height="600"/>' + _mark(4, 270, 452) + "</g>")
    # channel + wall bracket
    o.append('<g class="fx-hot" data-k="channel" tabindex="0" role="button"><rect class="fx-steel" x="300" y="0" width="22" height="600"/><path class="fx-steel-l" d="M307 0v600"/>'
             '<path class="fx-steel" d="M322 294h22v-16h6v44h-6v-22h-22z"/>' + "".join(f'<rect class="fx-slot" x="309" y="{y}" width="6" height="14" rx="3"/>' for y in (60, 120, 240, 420, 480, 540)) + _mark(5, 366, 478, 322, 478) + "</g>")
    # anchor
    o.append('<g class="fx-hot" data-k="anchor" tabindex="0" role="button"><rect class="fx-anchor" x="350" y="297" width="64" height="6"/><rect class="fx-anchor" x="338" y="293" width="6" height="14"/><path class="fx-anchor-t" d="M362 297v6M370 297v6M378 297v6M386 297v6M394 297v6M402 297v6"/>' + _mark(6, 466, 300, 414, 300) + "</g>")
    # stone panels
    g = ['<g class="fx-hot" data-k="stone" tabindex="0" role="button">']
    for y, h in ((-140, 162), (30, 160), (198, 160), (366, 160), (534, 160)):
        g.append(f'<rect class="fx-stone" x="210" y="{y}" width="30" height="{h}" fill="url(#fx-st)"/>')
    g.append(_mark(1, 148, 112, 210, 112) + "</g>")
    o += g
    # joints
    o.append('<g class="fx-hot" data-k="joint" tabindex="0" role="button">' + "".join(f'<rect class="fx-joint" x="204" y="{y - 3}" width="42" height="14"/>' for y in (22, 190, 358, 526)) + _mark(2, 148, 362, 204, 362) + "</g>")
    # stone brackets at the joints
    g = ['<g class="fx-hot" data-k="bracket" tabindex="0" role="button">']
    for y in (26, 194, 362, 530):
        g.append(f'<path class="fx-brk" d="M300 {y - 13}h-5v11h-67v-10h-5v24h5v-10h67v11h5z"/><circle class="fx-bolt" cx="311" cy="{y}" r="3.2"/>')
    g.append(_mark(3, 270, 248, 270, 200) + "</g>")
    o += g
    # the load path
    o.append('<path class="fx-path" d="M225 120V194H311V300H410"/>')
    o.append("</svg>")
    return "".join(o)


def html(lang, link, heading=True):
    """link(slug_or_path) -> href. Returns the section's inner block (eyebrow and h2 are added by the caller when heading is False)."""
    t = T[lang]; P = t["parts"]
    chips = "".join(f'<button type="button" class="fx-chip" data-k="{k}"><i>{i + 1}</i><span>{P[k][0]}</span></button>' for i, k in enumerate(ORDER))
    items = "".join(
        f'<div class="fx-item" data-k="{k}"><i class="fx-n">{i + 1}</i><h3>{P[k][0]}</h3><p class="fx-plain">{P[k][1]}</p><p class="fx-fact">{P[k][2]}</p><ul>' +
        "".join(f'<li><a href="{link(s)}">{n}</a></li>' for s, n in P[k][3]) + "</ul></div>" for i, k in enumerate(ORDER))
    head = f'<div class="eyebrow">{t["e"]}</div><h2>{t["h"]}</h2>' if heading else ""
    return (f'{head}<p class="lead fx-lead-p">{t["lead"]}</p><div class="fx">'
            f'<figure class="fx-fig"><div class="fx-sides" aria-hidden="true"><span>{t["out"]}</span><span>{t["inn"]}</span></div>{svg()}<figcaption>{t["path"]}</figcaption></figure>'
            f'<div class="fx-side"><div class="fx-chips" role="group" aria-label="{t["aria"]}">{chips}</div><div class="fx-items">{items}</div></div></div>')


if __name__ == "__main__":  # the spec sheet pages
    BASE = "for-consultants"
    for lang, pre in (("en", ""), ("ar", "/ar")):
        link = lambda s, pre=pre: (pre + s if s.startswith("/technical-specs/") else f"{pre}/{BASE}/{s}/").replace(pre + "/technical-specs/#", "#")
        f = os.path.join(ROOT, pre.strip("/"), "technical-specs", "index.html"); s = open(f, encoding="utf8").read()
        s = re.sub(r"<!--fxmap-->[\s\S]*?<!--/fxmap-->\n?", "", s)
        block = f'<!--fxmap--><section class="bt fx-sec" id="parts"><div class="wrap">{html(lang, link)}</div></section><!--/fxmap-->\n'
        mark = '<nav class="subnav tc-jump"'
        assert s.count(mark) == 1, f
        i = s.index(mark); j = s.index("</nav>", i) + 6
        s = s[:j] + "\n" + block + s[j:].lstrip("\n")
        if 'href="#parts"' not in s:
            s = s.replace('<a href="#specs">', f'<a href="#parts">{T[lang]["e"]}</a><a href="#specs">', 1)
        open(f, "w", encoding="utf8").write(s)
        print("map written into", f)
