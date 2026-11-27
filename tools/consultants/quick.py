# The short layer of the consultants section: the "In 30 seconds" box at the top of each page, the hub's map in three
# stages, and the "I need" picker. Plain words for a first reader; engineering terms stay, with a few words in brackets
# the first time. Nothing here adds a fact that the page below does not already state.

T = {
    "en": dict(quick="In 30 seconds", need="I need", map_e="The map", map_h="Find It in Three Stages", open="Open or close this part", jump="On this page"),
    "ar": dict(quick="في 30 ثانية", need="أحتاج", map_e="الخريطة", map_h="كل شيء في ثلاث مراحل", open="فتح أو إغلاق هذا الجزء", jump="في هذه الصفحة"),
}

QUICK = {
    "en": {
        "": ["We supply and install stone, marble, granite and porcelain facades held by mechanical fixings (metal brackets and anchors, no mortar behind the stone).",
             "Design is by the project engineer or consultant. We install to approved shop drawings.",
             "Three ways in: search a word, pick what you need, or tap a part of the wall."],
        "how-we-deliver": ["Two engineering routes: the shop drawings are issued to us, or the project's facade engineer prepares them within our scope.",
                           "The order of work: submittals and samples, mock-up on request, steel substructure, stone, inspection, handover.",
                           "At handover you receive the records and the 5-year written workmanship warranty attested by the Chamber of Commerce, issued by the contracting company."],
        "fixing-systems": ["Six systems in one table: Up-Down angles, pin (PEN), C-Channel, kerf rail, undercut anchors and porcelain clips.",
                           "Edge fixings (the bracket grips the panel's edge) usually go with 30 mm stone. Undercut anchors (fixed in the back of the panel) suit thin, hard panels.",
                           "The stone, the backup wall (the wall behind the stone) and the height usually decide the system."],
        "typical-details": ["Eight reference drawings: the load path, five fixing systems in section, the steel substructure and the corners.",
                            "The load goes from the panel to the bracket, to the anchor, then into the slabs, beams and columns.",
                            "They are for discussion at design stage, not for construction."],
        "brand-systems": ["What Hilti, fischer and Rockany publish for stone and porcelain facades, side by side.",
                          "An ETA (European Technical Assessment) covers the anchor under its stated conditions. The project still needs its own design.",
                          "We can install these systems. We hold no manufacturer certification."],
        "stone-materials": ["The stones and panels we install: Riyadh limestone, travertine, marble, granite and porcelain.",
                            "Typical thickness: natural stone 30 mm; marble and granite often 20 mm.",
                            "Strength comes from tests on the actual source, so ask for samples and tests before approval."],
        "thickness-and-fixing": ["Natural stone on edge fixings (pin, kerf, Up-Down) is typically 30 mm.",
                                 "Exterior 20 mm marble or granite needs the engineer's check and stone tests, or an undercut system.",
                                 "The square law: bending strength goes with thickness squared, so a thinner panel is much weaker than it looks."],
        "quality": ["We build to the approved documents. No substitution without approval.",
                    "Hold points (stages where work stops until it is inspected) come before work is covered.",
                    "A mock-up and anchor pull-out tests are arranged when the project asks for them."],
        "maintenance": ["A mechanically fixed facade needs little maintenance, but not none.",
                        "Inspect it regularly and clean it gently. The page lists what not to do.",
                        "The guide is a PDF in English and Arabic, ready for the handover file."],
        "glossary": ["Site words used in Riyadh paired with the words used in specifications, in Arabic and English.",
                     "It covers fixing, testing and submittal terms.",
                     "Use it so drawings, submittals and site instructions mean the same thing to everyone."],
        "specification": ["A three-part guide specification, 04 42 00, as a Word file you can edit.",
                          "Three fixing options to choose from.",
                          "Every project value is left blank for you to fill in from the project's calculation."],
        "send-drawings": ["Send the elevations and the stone you have in mind.",
                          "We reply with the systems that fit, published thickness guidance and the tests to ask for.",
                          "It helps most at design stage, before the panel sizes are fixed."],
    },
    "ar": {
        "": ["نورّد ونركّب واجهات الحجر والرخام والجرانيت والبورسلان بالتثبيت الميكانيكي (زوايا وانكرات معدنية، بدون مونة خلف الحجر).",
             "التصميم من مهندس المشروع أو الاستشاري، ونحن نركّب حسب المخططات التنفيذية المعتمدة.",
             "ثلاث طرق للوصول: ابحث بكلمة، أو اختر ما تحتاجه، أو اضغط على جزء من الجدار."],
        "how-we-deliver": ["مساران للأعمال الهندسية: تُسلَّم لنا المخططات التنفيذية، أو يعدّها مهندس واجهات المشروع ضمن نطاقنا.",
                           "ترتيب العمل: طلبات الاعتماد والعينات، ثم النموذج التجريبي عند الطلب، ثم الهيكل المعدني، ثم الحجر، ثم الفحص والتسليم.",
                           "عند التسليم تستلمون السجلات والضمان المكتوب على التنفيذ لمدة 5 سنوات، المصدّق من الغرفة التجارية، الذي تصدره شركة المقاولات."],
        "fixing-systems": ["ستة أنظمة في جدول واحد: زوايا Up-Down، والدبابيس (PEN)، ومجاري C-Channel، ونظام Kerf، ومراسي Undercut، ومشابك البورسلان.",
                           "التثبيت من الحواف (الزاوية تمسك حافة اللوح) يناسب غالباً حجراً بسماكة 30 مم. ومراسي Undercut (تُثبَّت في ظهر اللوح) تناسب الألواح الرقيقة الصلبة.",
                           "الحجر والجدار الخلفي والارتفاع هي التي تحسم اختيار النظام غالباً."],
        "typical-details": ["ثمانية رسومات مرجعية: مسار الحمل، وخمسة أنظمة تثبيت في قطاع، والهيكل المعدني، والزوايا.",
                            "ينتقل الحمل من اللوح إلى الزاوية، ثم إلى الانكر، ثم إلى البلاطات والكمرات والأعمدة.",
                            "هي للنقاش في مرحلة التصميم، وليست للتنفيذ."],
        "brand-systems": ["ما تنشره هيلتي وفيشر وروكاني لواجهات الحجر والبورسلان، جنباً إلى جنب.",
                          "تقييم ETA (التقييم الفني الأوروبي) يخص المرساة ضمن شروطه المذكورة، ويبقى المشروع بحاجة إلى تصميمه الخاص.",
                          "نستطيع تركيب هذه الأنظمة، ولا نحمل شهادة من أي شركة مصنّعة."],
        "stone-materials": ["الأحجار والألواح التي نركّبها: حجر الرياض، والترافرتين، والرخام، والجرانيت، والبورسلان.",
                            "السماكة الغالبة: الحجر الطبيعي 30 مم، والرخام والجرانيت 20 مم غالباً.",
                            "المقاومة تأتي من اختبارات على المصدر الفعلي، فاطلبوا العينات والاختبارات قبل الاعتماد."],
        "thickness-and-fixing": ["الحجر الطبيعي المثبت من الحواف (دبابيس، Kerf، Up-Down) سماكته 30 مم غالباً.",
                                 "الرخام أو الجرانيت بسماكة 20 مم في الواجهات الخارجية يحتاج إلى تحقق المهندس واختبارات الحجر، أو إلى نظام Undercut.",
                                 "قانون التربيع: مقاومة الانحناء تتبع مربع السماكة، فاللوح الأرق أضعف كثيراً مما يبدو."],
        "quality": ["ننفّذ حسب المستندات المعتمدة، ولا استبدال بدون اعتماد.",
                    "نقاط التوقف (مراحل يتوقف فيها العمل حتى يُفحص) تسبق تغطية العمل.",
                    "النموذج التجريبي واختبارات سحب الانكرات تُرتَّب متى طلبها المشروع."],
        "maintenance": ["الواجهة المثبتة ميكانيكياً تحتاج إلى صيانة قليلة، لكنها لا تستغني عنها.",
                        "افحصوها دورياً ونظّفوها برفق، وفي الصفحة قائمة بما يجب تجنّبه.",
                        "الدليل ملف PDF بالعربية والإنجليزية، جاهز لملف التسليم."],
        "glossary": ["كلمات المواقع في الرياض مع ما يقابلها في المواصفات، بالعربية والإنجليزية.",
                     "يشمل مصطلحات التثبيت والاختبارات وطلبات الاعتماد.",
                     "استخدموه لتحمل المخططات وطلبات الاعتماد وتعليمات الموقع المعنى نفسه عند الجميع."],
        "specification": ["مواصفة إرشادية من ثلاثة أجزاء (04 42 00) في ملف Word قابل للتعديل.",
                          "ثلاثة خيارات للتثبيت تختارون منها.",
                          "كل قيمة تخص المشروع متروكة فراغاً لتملؤوها من حسابات المشروع."],
        "send-drawings": ["أرسلوا الواجهات ونوع الحجر المقترح.",
                          "نردّ بالأنظمة المناسبة، وما تقوله الإرشادات المنشورة عن السماكة، والاختبارات التي تُطلب.",
                          "أكثر ما يفيد ذلك في مرحلة التصميم، قبل تثبيت مقاسات الألواح."],
    },
}

# the hub's picker: (words, slug); "/technical-specs/" is the spec sheet page outside the section folder
PICK = {
    "en": [("A drawing of a fixing", "typical-details"), ("Specification as a Word file", "specification"), ("The thickness rule", "thickness-and-fixing"),
           ("To compare systems", "fixing-systems"), ("A one-page spec sheet", "/technical-specs/"), ("To send my drawings", "send-drawings")],
    "ar": [("رسمة لتفصيلة تثبيت", "typical-details"), ("المواصفة في ملف Word", "specification"), ("قاعدة السماكة", "thickness-and-fixing"),
           ("مقارنة الأنظمة", "fixing-systems"), ("جدول مواصفات من صفحة", "/technical-specs/"), ("إرسال مخططاتي", "send-drawings")],
}

# the hub's map: (stage, title, one line, [(slug, name, a few words)])
MAP = {
    "en": [
        ("Design stage", "Choose", "The stone, the fixing system and the thickness that make the design buildable.", [
            ("stone-materials", "Stone and finishes", "What each stone is and what to check"),
            ("fixing-systems", "Fixing systems compared", "Six systems in one table"),
            ("thickness-and-fixing", "Thickness and fixing", "Why 30 mm, and what 20 mm needs"),
            ("typical-details", "Typical details", "Eight reference drawings")]),
        ("Tender and specification", "Specify", "The text, the makers' data and how the work will be delivered.", [
            ("specification", "Guide specification 04 42 00", "A Word file to edit"),
            ("/technical-specs/", "Spec sheet and document request", "One page, PDF or Excel"),
            ("brand-systems", "Hilti, fischer and Rockany", "What each maker publishes"),
            ("how-we-deliver", "How we deliver", "Routes, steps and warranty")]),
        ("Construction", "Build and approve", "Inspection, records and what the owner receives.", [
            ("quality", "Quality", "Hold points, tests and records"),
            ("maintenance", "Maintenance and handover", "A guide to download"),
            ("glossary", "Arabic–English glossary", "Site words and specification words"),
            ("send-drawings", "Send us your drawings", "A short answer from an installer")]),
    ],
    "ar": [
        ("مرحلة التصميم", "الاختيار", "الحجر ونظام التثبيت والسماكة التي تجعل التصميم قابلاً للتنفيذ.", [
            ("stone-materials", "الحجر والتشطيبات", "ما هو كل حجر وما يُراجع فيه"),
            ("fixing-systems", "مقارنة أنظمة التثبيت", "ستة أنظمة في جدول واحد"),
            ("thickness-and-fixing", "السماكة والتثبيت", "لماذا 30 مم، وماذا تحتاج 20 مم"),
            ("typical-details", "التفاصيل النموذجية", "ثمانية رسومات مرجعية")]),
        ("المناقصة والمواصفة", "المواصفة", "النص، وبيانات الشركات المصنّعة، وكيف سيُنفَّذ العمل.", [
            ("specification", "المواصفة الإرشادية 04 42 00", "ملف Word قابل للتعديل"),
            ("/technical-specs/", "جدول المواصفات وطلب المستندات", "صفحة واحدة، PDF أو Excel"),
            ("brand-systems", "هيلتي وفيشر وروكاني", "ما تنشره كل شركة"),
            ("how-we-deliver", "كيف ننفّذ", "المسارات والخطوات والضمان")]),
        ("التنفيذ", "التنفيذ والاعتماد", "الفحص والسجلات وما يستلمه المالك.", [
            ("quality", "الجودة", "نقاط التوقف والاختبارات والسجلات"),
            ("maintenance", "الصيانة والتسليم", "دليل للتنزيل"),
            ("glossary", "مسرد عربي – إنجليزي", "كلمات الموقع وكلمات المواصفة"),
            ("send-drawings", "أرسلوا مخططاتكم", "جواب قصير من جهة التركيب")]),
    ],
}

# reference drawings shown on pages other than Typical details: {page: {section number from 0: [drawing codes]}}
DRAWS = {
    "fixing-systems": {0: ["updown", "pen", "cchannel", "kerfrail", "undercut"]},
    "thickness-and-fixing": {1: ["updown", "pen", "kerfrail"], 4: ["undercut", "ucback"]},
    "how-we-deliver": {3: ["loadpath", "frame"]},
    "brand-systems": {1: ["undercut", "ucback"]},
    "specification": {1: ["updown", "pen", "cchannel", "undercut"]},
}
DRAW_T = {
    "en": dict(h="Reference drawings", note="Typical details for discussion at design stage, not for construction.", more="Notes on these details", aria="Open the drawing",
               names=dict(updown="Up-Down angle fixing", pen="PEN (pin) fixing", cchannel="Vertical C-Channel", kerfrail="Kerf rail system", undercut="Undercut anchors on rails",
                          ucback="Undercut anchors: back of the panel", frame="Steel substructure", loadpath="Load path on vertical channels")),
    "ar": dict(h="رسومات مرجعية", note="تفاصيل نموذجية للنقاش في مرحلة التصميم، وليست للتنفيذ.", more="ملاحظات هذه التفاصيل", aria="فتح الرسمة",
               names=dict(updown="التثبيت بزوايا Up-Down", pen="التثبيت بالدبابيس PEN", cchannel="مجاري C-Channel الرأسية", kerfrail="نظام مجرى Kerf", undercut="مراسي Undercut على مجارٍ",
                          ucback="مراسي Undercut: ظهر اللوح", frame="الهيكل المعدني", loadpath="مسار الحمل على المجاري الرأسية")),
}


def draws(lang, codes, more_href):
    t = DRAW_T[lang]
    figs = "".join(f'<figure><a href="/images/details/{c}-{lang}.svg" target="_blank" rel="noopener" aria-label="{t["aria"]}: {t["names"][c]}"><img src="/images/details/{c}-{lang}.svg" alt="{t["names"][c]}" width="760" height="1030" loading="lazy" decoding="async"></a><figcaption>{t["names"][c]}</figcaption></figure>' for c in codes)
    more = f' <a href="{more_href}">{t["more"]}</a>' if more_href else ""
    return f'<div class="fc-drawbox"><h3>{t["h"]}</h3><div class="fc-draws">{figs}</div><p class="fc-drawnote">{t["note"]}{more}</p></div>'


# three explanatory figures drawn from the page's own text: {page: {section number: function(lang, section body) -> html}}
FIG_T = {
    "en": dict(q_h="The stages on one line", q_leg=[("h", "H", "Hold: work stops until released"), ("w", "W", "Witness"), ("r", "R", "Review")],
               t_h="The same panel in the same wind", t_axis="Bending stress, with 30 mm taken as 1", t_note="A simplification for explanation: real panels are analysed as plates.", mm="mm",
               m_h="Two ways a panel comes off", m_a="Undercut on rails", m_a2="The panel hangs alone and is replaced on its own.", m_b="Pin, kerf and Up-Down", m_b2="The fixings sit in the joints and are shared, so the neighbours are released in sequence.",
               m_leg=["Panel to replace", "Neighbours that share its fixings", "Fixing"]),
    "ar": dict(q_h="المراحل على خط واحد", q_leg=[("h", "H", "توقف: يتوقف العمل حتى الإفراج"), ("w", "W", "حضور"), ("r", "R", "مراجعة")],
               t_h="اللوح نفسه والرياح نفسها", t_axis="إجهاد الانحناء، باعتبار سماكة 30 مم تساوي 1", t_note="تبسيط للشرح: الألواح الحقيقية تُحلَّل كبلاطات.", mm="مم",
               m_h="طريقتان لفك اللوح", m_a="Undercut على المجاري", m_a2="اللوح معلّق وحده ويُستبدل منفرداً.", m_b="الدبابيس و Kerf و Up-Down", m_b2="التثبيت داخل الفواصل ومشترك، فتُحرَّر الألواح المجاورة بالتتابع.",
               m_leg=["اللوح المطلوب استبداله", "الألواح المجاورة المشتركة في التثبيت", "قطعة تثبيت"]),
}


def fig_quality(lang, body):
    import re
    t = FIG_T[lang]; rows = []
    for r in re.findall(r"<tr>([\s\S]*?)</tr>", body):
        c = [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<t[hd][^>]*>([\s\S]*?)</t[hd]>", r)]
        if len(c) >= 4 and re.search(r"\b[HWR]\b", c[-1]): rows.append((c[0], c[-1]))
    items = "".join(f'<li class="{"h" if "H" in code else "w" if "W" in code else "r"}"><i>{code}</i><span>{name}</span></li>' for name, code in rows)
    leg = "".join(f'<span class="{k}"><i>{a}</i>{b}</span>' for k, a, b in t["q_leg"])
    return f'<div class="fc-fig"><h3>{t["q_h"]}</h3><ol class="fc-stages">{items}</ol><p class="fc-legend">{leg}</p></div>'


def fig_square(lang, body):
    t = FIG_T[lang]
    bars = "".join(f'<div class="fc-bar"><b>⁦{mm} {t["mm"]}⁩</b><i style="width:{round(v / 2.25 * 100)}%"></i><span>⁦{v:.2f} ×⁩</span></div>' for mm, v in ((30, 1.0), (25, 1.44), (20, 2.25)))
    return f'<div class="fc-fig"><h3>{t["t_h"]}</h3><div class="fc-bars">{bars}</div><p class="fc-drawnote">{t["t_axis"]}. {t["t_note"]}</p></div>'


def _grid(mode):
    o = ['<svg viewBox="0 0 300 250" aria-hidden="true" focusable="false">']
    for r in range(3):
        for c in range(3):
            x, y = 20 + c * 88, 14 + r * 76; cls = "p"
            if (r, c) == (1, 1): cls = "p t"
            elif mode == "b" and c == 1: cls = "p n"
            dx, dy = (16, -12) if (mode == "a" and (r, c) == (1, 1)) else (0, 0)
            if not (mode == "a" and (r, c) == (1, 1)): o.append(f'<rect class="{cls}" x="{x + dx}" y="{y + dy}" width="82" height="70"/>')
    if mode == "a":
        o.append('<rect class="hole" x="108" y="90" width="82" height="70"/><rect class="p t lift" x="126" y="72" width="82" height="70"/><path class="arr" d="M222 62l20-16M242 46l-9 1M242 46l-1 9"/>')
    else:
        for y in (87, 163):
            for x in (128, 170): o.append(f'<circle class="fxd" cx="{x}" cy="{y}" r="4.5"/>')
        for y in (11, 239):
            for x in (128, 170): o.append(f'<circle class="fxd dim" cx="{x}" cy="{y}" r="4.5"/>')
    o.append("</svg>")
    return "".join(o)


def fig_replace(lang, body):
    t = FIG_T[lang]
    leg = f'<span><i class="k1"></i>{t["m_leg"][0]}</span><span><i class="k2"></i>{t["m_leg"][1]}</span><span><i class="k3"></i>{t["m_leg"][2]}</span>'
    return (f'<div class="fc-fig"><h3>{t["m_h"]}</h3><div class="fc-two-fig"><figure>{_grid("a")}<figcaption><b>{t["m_a"]}</b>{t["m_a2"]}</figcaption></figure>'
            f'<figure>{_grid("b")}<figcaption><b>{t["m_b"]}</b>{t["m_b2"]}</figcaption></figure></div><p class="fc-legend fc-leg2">{leg}</p></div>')


FIGS = {"quality": {1: fig_quality}, "thickness-and-fixing": {2: fig_square}, "maintenance": {5: fig_replace}}
