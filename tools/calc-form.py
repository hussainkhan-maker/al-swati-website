#!/usr/bin/env python3
# Writes the cost calculator form (English and Arabic) into the pages that carry it, so the four copies stay identical.
# Run from the repository root:  python3 tools/calc-form.py
# The prices are not here: they live in assets/estimator.js. This file is only the form's markup and words.
import re, sys, os

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
PAGES = {"en": ["index.html", "stone-cladding-cost-calculator/index.html"],
         "ar": ["ar/index.html", "ar/stone-cladding-cost-calculator/index.html"]}
WA_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.9 2 7L3 29l6.5-2.1c2 1.1 4.2 1.7 6.5 1.7 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.9 1.3 1.3-3.8-.3-.4c-1.2-1.8-1.8-3.9-1.8-6 0-5.8 4.7-10.5 10.5-10.5S26.5 9.5 26.5 15.7 21.8 26.2 16 26.2zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>'

# line icons: project types (48 x 48) and fixing systems (64 x 48; wall on the left, stone on the right)
ICON = {
    "villa": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 40h38M9 40V22h16v18M25 40V14h14v26M13 27h8M13 33h8M29 20h6M29 27h6M29 34h6"/></svg>',
    "tower": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 42h34M14 42V8h14v34M28 42V18h8v24M18 14h6M18 20h6M18 26h6M18 32h6M31 24h2M31 30h2M31 36h2"/></svg>',
    "none": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 6v36M14 6v36M8 14h6M8 24h6M8 34h6M20 8h20v32H20zM20 24h20M30 8v16M25 24v16M35 24v16"/></svg>',
    "supply": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 6v36M12 6v36M6 14h6M6 24h6M6 34h6M18 6v36M28 6v36M38 6v36M12 14h30M12 34h30"/></svg>',
    "install": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M18 6v36M28 6v36M38 6v36M12 14h30M12 34h30M4 24h8M8 20v8"/><circle cx="18" cy="14" r="2.2"/><circle cx="28" cy="14" r="2.2"/><circle cx="38" cy="14" r="2.2"/><circle cx="18" cy="34" r="2.2"/><circle cx="28" cy="34" r="2.2"/><circle cx="38" cy="34" r="2.2"/></svg>',
    "building": '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 41h38M11 41V13h26v28M11 20h26M11 27h26M11 34h26M20 13v21M28 13v21M21 41v-5h6v5"/></svg>',
    "updown": '<svg viewBox="0 0 64 48" aria-hidden="true"><path class="w" d="M4 4h10v40H4z"/><path class="s" d="M41 4h10v19H41zM41 25h10v19H41z"/><path class="g" d="M14 12v12h32M46 18v12M8 17h11"/></svg>',
    "rail": '<svg viewBox="0 0 64 48" aria-hidden="true"><path class="w" d="M4 4h10v40H4z"/><path class="s" d="M41 4h10v19H41zM41 25h10v19H41z"/><path class="g" d="M14 13h10M14 35h10M24 6h6v36h-6zM30 24h16M46 19v10"/></svg>',
    "kerf": '<svg viewBox="0 0 64 48" aria-hidden="true"><path class="s" d="M9 5h46v17H9zM9 26h46v17H9z"/><path class="g" d="M3 24h58M3 21v6M61 21v6"/></svg>',
    "undercut": '<svg viewBox="0 0 64 48" aria-hidden="true"><path class="w" d="M4 4h10v40H4z"/><path class="s" d="M41 4h10v40H41z"/><path class="g" d="M14 10h8M14 38h8M22 6h5v36h-5zM27 15h7v5M27 31h7v5M34 18h10M34 34h10M44 16l3 2-3 2M44 32l3 2-3 2"/></svg>',
}
SIZE_ICON = {"3060": (22, 11), "4080": (27, 13.5), "60120": (36, 18)}
STONE_IMG = {"white": "stone-limestone-white", "limestone": "stone-limestone-beige", "granite": "stone-granite", "travertine": "stone-travertine", "porcelain": "stone-porcelain"}

T = {
 "en": dict(
    steps=["Project", "Stone", "Panel size", "Fixing system", "Facade area", "Extras"],
    hints=["", "Price per m² installed, for your choices", "Larger panels cost more per m²", "", "", "Only if your project needs them"],
    frame=("Steel frame behind the stone", [("none", "No frame", "Most villas"), ("supply", "We supply and install", "+250 SAR per m²"), ("install", "Installation only", "+125 SAR per m²")],
           "Needed only where the stone stands far off the wall or the wall cannot carry the fixings. We confirm it on the site visit."),
    types=[("villa", "Villa facade", "Normal scaffolding"), ("building", "Building", "Residential or commercial"), ("tower", "Commercial tower", "Safety scaffolding")],
    nav=("Back", "Next", "Step", "Change my choices", "Share this estimate"),
    stones=[("white", "Riyadh White Stone"), ("limestone", "Riyadh Limestone", ), ("granite", "Granite"), ("travertine", "Travertine Marble"), ("porcelain", "Large-Format Porcelain")],
    stone_sub={"limestone": "Beige / yellow"},
    sizes=[("3060", "30 × 60 cm", "Standard"), ("4080", "40 × 80 cm", "Medium"), ("60120", "60 × 120 cm", "Large")],
    fix=[("updown", "Up-Down brackets", "The standard system, straight on the wall"), ("rail", "C-Channel", "Vertical channels carry the load to the concrete"), ("kerf", "Kerf rail", "A hidden rail along the panel edge"), ("undercut", "Undercut anchors", "Hidden anchors in the back of the panel")],
    area_aria="Facade area", area_num="Area in square metres", m2="m²", quick="Quick sizes",
    eng=("Add shop drawings and engineer's site visits", "For projects with a consultant: drawings, calculation and approval, and a weekly visit."),
    wall_cap="Your wall, seen from the front. Fixings shown in gold.",
    budget="Estimated budget", cur="SAR", per="SAR per m², supply and installation, excl. VAT",
    split="Where the money goes", parts=["Stone", "Fixing and installation", "Scaffolding", "Drawings and engineer", "Steel frame"],
    vat="With 15% VAT", timeline="Estimated timeline", plan=["Material delivery", "Safety scaffolding", "Installation"], one_week="1 week",
    ask="Request your exact quote", name="Your name", phone="Mobile", send="Send This Estimate to WhatsApp",
    fine='An estimate for Riyadh, not a quote. Prices exclude 15% VAT. Your name and number go only to our quotes team. <a class="est-chat" href="https://wa.me/966511826313" target="_blank" rel="noopener">Chat on WhatsApp without the form</a>',
    dock="See estimate"),
 "ar": dict(
    steps=["المشروع", "الحجر", "مقاس اللوح", "نظام التثبيت", "مساحة الواجهة", "إضافات"],
    hints=["", "السعر للمتر المربع مركّباً حسب اختياراتك", "الألواح الأكبر أغلى للمتر المربع", "", "", "فقط إذا احتاجها مشروعك"],
    frame=("هيكل حديد خلف الحجر", [("none", "بدون هيكل", "أغلب الفلل"), ("supply", "توريد وتركيب", "⁦+250⁩ ريال للمتر المربع"), ("install", "تركيب فقط", "⁦+125⁩ ريال للمتر المربع")],
           "يلزم فقط إذا كان الحجر بارزاً كثيراً عن الجدار أو كان الجدار لا يتحمل التثبيت. ونؤكد ذلك عند زيارة الموقع."),
    types=[("villa", "واجهة فيلا", "سقالات عادية"), ("building", "عمارة", "سكنية أو تجارية"), ("tower", "برج تجاري", "سقالات سلامة")],
    nav=("السابق", "التالي", "الخطوة", "تعديل اختياراتي", "شارك هذا التقدير"),
    stones=[("white", "حجر رياض أبيض"), ("limestone", "حجر رياض بيج"), ("granite", "الجرانيت"), ("travertine", "رخام ترافرتين"), ("porcelain", "بورسلان بمقاسات كبيرة")],
    stone_sub={"limestone": "بيج / أصفر"},
    sizes=[("3060", "30 × 60 سم", "قياسي"), ("4080", "40 × 80 سم", "متوسط"), ("60120", "60 × 120 سم", "كبير")],
    fix=[("updown", "زوايا Up-Down", "النظام المعتاد، مباشرة على الجدار"), ("rail", "مجاري C-Channel", "مجارٍ رأسية تنقل الحمل إلى الخرسانة"), ("kerf", "مجرى Kerf", "مجرى مخفي على طول حافة اللوح"), ("undercut", "انكرات Undercut", "انكرات مخفية في ظهر اللوح")],
    area_aria="مساحة الواجهة", area_num="المساحة بالمتر المربع", m2="م²", quick="مساحات سريعة",
    eng=("أضف المخططات التنفيذية وزيارات المهندس", "للمشاريع التي لها استشاري: المخططات والحسابات والاعتماد، وزيارة أسبوعية."),
    wall_cap="جدارك كما يُرى من الأمام، والتثبيت ظاهر بالذهبي.",
    budget="الميزانية التقديرية", cur="ريال", per="ريال للمتر المربع، توريد وتركيب، بدون ضريبة القيمة المضافة",
    split="أين تذهب التكلفة", parts=["الحجر", "التثبيت والتركيب", "السقالات", "المخططات والمهندس", "هيكل الحديد"],
    vat="مع ضريبة القيمة المضافة 15%", timeline="المدة التقديرية", plan=["توريد المواد", "تركيب سقالات السلامة", "التركيب"], one_week="أسبوع واحد",
    ask="اطلب عرض سعر دقيق", name="الاسم", phone="رقم الجوال", send="أرسل هذا التقدير على واتساب",
    fine='هذا تقدير لمشاريع الرياض وليس عرض سعر. الأسعار بدون ضريبة القيمة المضافة 15%. يصل اسمك ورقمك إلى فريق التسعير لدينا فقط. <a class="est-chat" href="https://wa.me/966511826313" target="_blank" rel="noopener">تواصل على واتساب بدون تعبئة النموذج</a>',
    dock="عرض التقدير"),
}

def legend(n, title, hint):
    return f'<legend><span class="est-n">{n}</span><span class="ec-t">{title}</span>' + (f'<small class="ec-hint">{hint}</small>' if hint else "") + "</legend>"

def form(lang):
    t = T[lang]; nv = t["nav"]
    o = [f'<form class="est est2" id="estimate-form" novalidate data-next="{nv[1]}" data-see="{t["dock"]}">',
         f'<div class="ec-nav" hidden><button type="button" class="ec-back">{nv[0]}</button><span class="ec-prog">{nv[2]} <b dir="ltr"><span data-o="sn">1</span> / <span data-o="st">6</span></b></span><button type="button" class="ec-edit">{nv[3]}</button><i class="ec-bar" aria-hidden="true"><i></i></i></div>',
         '<div class="est-in">']
    # 1 project
    o.append('<fieldset class="est-step">' + legend(1, t["steps"][0], t["hints"][0]) + '<div class="ec-cards ec-3">' + "".join(
        f'<label class="ec-card"><input type="radio" name="type" value="{v}"{" checked" if i == 0 else ""}><span class="ec-c">{ICON[v]}<b>{b}</b><small>{s}</small></span></label>'
        for i, (v, b, s) in enumerate(t["types"])) + "</div></fieldset>")
    # 2 stone: swatches with the stone itself
    sw = []
    for i, st in enumerate(t["stones"]):
        v, b = st[0], st[1]; sub = t["stone_sub"].get(v, "")
        sw.append(f'<label class="ec-sw"><input type="radio" name="material" value="{v}"{" checked" if i == 0 else ""}><span class="ec-s"><img src="/images/stones/{STONE_IMG[v]}.jpg" alt="{b}" aria-hidden="true" loading="lazy" width="1000" height="750" decoding="async">'
                  f'<i class="ec-price" data-p="{v}"></i><b>{b}' + (f'<em>{sub}</em>' if sub else "") + "</b></span></label>")
    o.append('<fieldset class="est-step">' + legend(2, t["steps"][1], t["hints"][1]) + '<div class="ec-swatches">' + "".join(sw) + "</div></fieldset>")
    # 3 panel size
    ch = []
    for i, (v, b, s) in enumerate(t["sizes"]):
        w, h = SIZE_ICON[v]
        ch.append(f'<label class="ec-chip"><input type="radio" name="size" value="{v}"{" checked" if i == 0 else ""}><span><svg viewBox="0 0 40 22" aria-hidden="true"><rect x="{(40 - w) / 2}" y="{(22 - h) / 2}" width="{w}" height="{h}"/></svg><b dir="ltr">{b}</b><small>{s}</small></span></label>')
    o.append('<fieldset class="est-step" data-step="size">' + legend(3, t["steps"][2], t["hints"][2]) + '<div class="ec-chips">' + "".join(ch) + "</div></fieldset>")
    # 4 fixing
    o.append('<fieldset class="est-step">' + legend(4, t["steps"][3], t["hints"][3]) + '<div class="ec-cards ec-4">' + "".join(
        f'<label class="ec-card ec-fx"><input type="radio" name="fixing" value="{v}"{" checked" if i == 0 else ""}><span class="ec-c">{ICON[v]}<b>{b}</b><small>{s}</small></span></label>'
        for i, (v, b, s) in enumerate(t["fix"])) + "</div></fieldset>")
    # 5 area and the one option
    quick = "".join(f'<button type="button" data-a="{a}">{a:,}</button>' for a in (100, 250, 500, 1000, 2500))
    o.append('<fieldset class="est-step">' + legend(5, t["steps"][4], t["hints"][4]) +
             f'<div class="est-area"><div class="est-slide"><input type="range" min="0" max="1000" step="1" value="500" aria-label="{t["area_aria"]}"><div class="est-ticks" aria-hidden="true"><span>50 {t["m2"]}</span><span>500</span><span>5,000</span></div></div>'
             f'<label class="est-num"><input name="area" type="number" inputmode="numeric" min="50" max="5000" step="1" value="500" aria-label="{t["area_num"]}"><span>{t["m2"]}</span></label></div>'
             f'<div class="ec-quick" role="group" aria-label="{t["quick"]}" dir="ltr">{quick}</div>'
             "</fieldset>")
    fr = t["frame"]
    o.append('<fieldset class="est-step">' + legend(6, t["steps"][5], t["hints"][5]) +
             f'<div class="ec-lab">{fr[0]}</div><div class="ec-cards ec-3">' + "".join(
                 f'<label class="ec-card"><input type="radio" name="frame" value="{v}"{" checked" if i == 0 else ""}><span class="ec-c">{ICON[v]}<b>{b}</b><small>{sm}</small></span></label>' for i, (v, b, sm) in enumerate(fr[1])) +
             f'</div><p class="ec-sub">{fr[2]}</p>'
             f'<label class="ec-toggle"><input type="checkbox" name="eng"><span class="ec-track" aria-hidden="true"></span><span class="ec-tx"><b>{t["eng"][0]}</b><small>{t["eng"][1]}</small></span></label>'
             "</fieldset>")
    o.append("</div>")
    # result
    p = t["parts"]
    o.append('<div class="est-out"><div class="est-stick" aria-live="polite">'
             f'<figure class="ec-wall"><div class="ec-wall-v" data-o="wall" aria-hidden="true"></div><figcaption><b data-o="summary"></b><span>{t["wall_cap"]}</span></figcaption></figure>'
             f'<div class="est-k">{t["budget"]}</div>'
             f'<div class="est-total"><span class="cur">{t["cur"]}</span><span class="num"><span data-o="lo">115,000</span><span class="dash">–</span><span data-o="hi">140,000</span></span></div>'
             f'<div class="est-per"><span data-o="per">230–280</span> {t["per"]}</div>'
             f'<div class="est-k">{t["split"]}</div>'
             '<div class="ec-split" aria-hidden="true"><i class="a"></i><i class="b"></i><i class="c"></i><i class="f"></i><i class="e"></i></div>'
             f'<dl class="est-plan ec-parts"><div><dt><i class="a"></i>{p[0]}</dt><dd data-o="pa"></dd></div><div><dt><i class="b"></i>{p[1]}</dt><dd data-o="pb"></dd></div><div><dt><i class="c"></i>{p[2]}</dt><dd data-o="pc"></dd></div><div class="ec-frm" hidden><dt><i class="f"></i>{p[4]}</dt><dd data-o="pf"></dd></div><div class="ec-eng" hidden><dt><i class="e"></i>{p[3]}</dt><dd data-o="pe"></dd></div><div class="ec-vat"><dt>{t["vat"]}</dt><dd data-o="vat"></dd></div></dl>'
             f'<div class="est-k">{t["timeline"]}</div><div class="est-weeks" data-o="weeks"></div>'
             '<div class="est-bar" aria-hidden="true"><i class="d"></i><i class="s"></i><i class="i"></i></div>'
             f'<dl class="est-plan"><div><dt><i class="d"></i>{t["plan"][0]}</dt><dd data-o="lead"></dd></div><div class="est-setup" hidden><dt><i class="s"></i>{t["plan"][1]}</dt><dd>{t["one_week"]}</dd></div><div><dt><i class="i"></i>{t["plan"][2]}</dt><dd data-o="install"></dd></div></dl>'
             f'<div class="est-ask"><h3>{t["ask"]}</h3>'
             f'<div class="est-fields"><label>{t["name"]}<input name="name" autocomplete="name" required maxlength="80"></label><label>{t["phone"]}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="22" placeholder="05x xxx xxxx" dir="ltr"></label></div>'
             f'<button type="submit" class="btn btn-gold est-send">{WA_ICON}<span>{t["send"]}</span></button>'
             f'<button type="button" class="ec-share">{nv[4]}</button>'
             '<p class="est-note" role="status"></p>'
             f'<p class="est-fine">{t["fine"]}</p>'
             "</div></div></div>")
    o.append(f'<div class="ec-dock" hidden><div><small>{t["budget"]}</small><b><span class="cur">{t["cur"]}</span> <span dir="ltr"><span data-o="dlo"></span>–<span data-o="dhi"></span></span></b></div><button type="button">{t["dock"]}</button></div>')
    o.append("</form>")
    return "\n".join(o)

n = 0
for lang, pages in PAGES.items():
    html = form(lang)
    for page in pages:
        f = os.path.join(ROOT, page); s = open(f, encoding="utf8").read()
        m = re.search(r'<form class="est[^"]*" id="estimate-form"[\s\S]*?</form>', s)
        assert m, page
        s = s[:m.start()] + html + s[m.end():]
        s = re.sub(r'/assets/estimator\.js(\?v=[\w.]+)?', "/assets/estimator.js?v=7", s)
        s = re.sub(r'/assets/style\.css(\?v=[\w.]+)?', "/assets/style.css?v=c7", s)
        open(f, "w", encoding="utf8").write(s); n += 1
print("calculator form written into", n, "pages")
