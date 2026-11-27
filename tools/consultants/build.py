#!/usr/bin/env python3
"""Builds the hand-made "For Architects & Consultants" section: /for-consultants/ (English) and /ar/for-consultants/
(Arabic), nine pages each, from content_en.py and content_ar.py. The header and footer are copied from the
Technical Specs pages, so the section always carries the site's current navigation.
Run from the repository root:  python3 tools/consultants/build.py
The pages are ordinary files: build-site.mjs does not overwrite them (they are not in tools/erp-pages.json).
Downloads: python3 tools/consultants/make_docx.py  and  node tools/consultants/make_pdf.cjs"""
import html, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
SITE = "https://al-swaticontracting.com"
BASE = "for-consultants"
DATE_ISO = "2026-11-26"
ORDER = ["", "how-we-deliver", "fixing-systems", "typical-details", "brand-systems", "stone-materials", "thickness-and-fixing", "quality", "maintenance", "glossary", "specification", "send-drawings"]

# Public sources (from the research files). key: (label, url)
SOURCES = {
 "nsi_vert": ("Natural Stone Institute, Dimension Stone Design Manual: Vertical Surfaces (exterior stone veneer), excerpt", "https://nsrstone.com/wp-content/uploads/2025/07/Vertical-Surfaces-With.pdf"),
 "bsi_bp": ("Building Stone Institute, Recommended Best Practices", "https://www.indystone.com/publications/BSI_Recommended_Practices.pdf"),
 "hg": ("Harrison Goldman, “The Design of Fixings for Natural Stone Cladding” (reports BS 8298:2020, EN 1469 and EN 13364)", "https://www.harrisongoldman.com/the-design-of-fixings-for-natural-stone-cladding/"),
 "c1242": ("ASTM C1242, Standard Guide for Selection, Design and Installation of Dimension Stone Attachment Systems (scope page)", "https://store.astm.org/standards/c1242"),
 "c1242p": ("ASTM C1242-16, free preview with the table of generally accepted safety factors (older edition)", "https://cdn.standards.iteh.ai/samples/95675/8749af1eb3484e779ae1019080cb3f36/ASTM-C1242-16.pdf"),
 "astm_list": ("Natural Stone Institute, list of ASTM stone standards", "https://www.naturalstoneinstitute.org/stoneprofessionals/astm/"),
 "din": ("DIN 18516-3, text of an older edition (not the 2018 edition), hosted by umwelt-online", "https://umwelt-online.de/recht/bau/din/18516_3a.htm"),
 "hilti_hsu": ("Hilti, HSU-R stone undercut anchor, technical data", "https://files-ask.hilti.com/original/ge/gezssgdtae.pdf"),
 "eta_hilti": ("DIBt, ETA-16/0784, Hilti HSU-R", "https://www.dibt.de/pdf_storage/2019/ETA-16!0784(8.06.01-807!18)e.pdf"),
 "fischer_fzp": ("fischer, Zykon panel anchor FZP II, product page", "https://fischer.co.uk/en-gb/products/facade-systems/zykon-panel-anchors/zykon-panel-anchors-fzp-ii/zykon-panel-anchors-fzp-ii-r"),
 "eta_fischer": ("DIBt, ETA-11/0145, fischer FZP II", "https://dibt.de/pdf_storage/2024/ETA-11!0145(8.06.01-109!24)e.pdf"),
 "keil": ("DIBt, ETA-03/0055, undercut anchor for stoneware facade panels", "https://dibt.de/pdf_storage/2024/ETA-03!0055(8.06.01-282!24)e.pdf"),
 "laminam": ("Laminam, Technical guide for external facades, edition 07/2025", "https://www.laminam.com/usa/wp-content/uploads/sites/12/2025/10/Guida-tecnica-per-facciate-esterne_ENG_2025-07.pdf"),
 "iso17870": ("ISO/TS 17870-3:2023, mechanical installation of large-format porcelain tiles and panels (catalogue page)", "https://www.iso.org/standard/80653.html"),
 "mirage": ("Mirage Engineering, concealed anchoring system for ventilated facades", "https://engineering.mirage.it/en/facades/ventilated-facades/walltech-invisible-open-joint"),
 "hilti_design": ("Hilti UK, ventilated facade design centre", "https://www.hilti.co.uk/content/hilti/E1/GB/en/engineering/design-center/ventilated-facade"),
 "fischer_range": ("fischer, facade systems range overview", "https://www.fischer-international.com/en/products/facade-systems"),
 "rockany_uni": ("Rockany, Universal System", "https://rockany.com/rockany-universal-system/"),
 "rockany_y": ("Rockany, Y-Profile System", "https://rockany.com/rockany-y-profile-system/"),
 "rockany_tl": ("Rockany, T and L Profiles System", "https://rockany.com/rockanyt-and-l-profiles-system/"),
 "rockany_srv": ("Rockany, services", "https://rockany.com/services/"),
 "nsi_granite": ("Natural Stone Institute, Dimension Stone Design Manual: Granite chapter (2022)", "https://transparencycatalog.com/assets/uploads/greener-images/05-GRANITE-2022.pdf"),
 "c568": ("ASTM C568/C568M-22, Standard Specification for Limestone Dimension Stone (free preview)", "https://cdn.standards.iteh.ai/samples/113164/2fc452d051704fc5a8e654c540741900/ASTM-C568-C568M-22.pdf"),
 "c503": ("ASTM C503/C503M-22, Standard Specification for Marble Dimension Stone (free preview)", "https://cdn.standards.iteh.ai/samples/113163/f55e640d65104631bd4873e5ca8a8999/ASTM-C503-C503M-22.pdf"),
 "riyadh_rock": ("Abd El-Aal and Masoud (2017), engineering properties of limestone foundation bed, Ar Riyadh, Arabian Journal of Geosciences 10:347", "https://link.springer.com/article/10.1007/s12517-017-3089-7"),
 "arabnews": ("Arab News, “Saudi stone gains ground against Italian marble in construction market”, 24 March 2026", "https://www.arabnews.com/node/2637470/amp"),
 "rockany": ("Rockany, Undercut Railing System", "https://rockany.com/rockany-undercut-railing-system/"),
 "hilti_mft": ("Hilti, MFT ventilated facade Technical Manual", "https://www.hilti.it/content/dam/documents/pdf/e4/engineering/manuals/MFT_Technical%20Manual%20PRINTING%20V1.0%20low_RIGHT_CUT.pdf"),
 "yates": ("Stone Specialist, “Technical: The thickness of stone cladding” (T. Yates, BRE, 2009)", "https://stonespecialist.com/news/technical-thickness-stone-cladding"),
 "nsi_lime": ("Natural Stone Institute, Dimension Stone Design Manual: Limestone chapter (2022)", "https://transparencycatalog.com/assets/uploads/greener-images/06-LIMESTONE-2022.pdf"),
 "iibec": ("Farmer, “Dimension Stone Testing and Evaluation”, IIBEC Interface, October 2024", "https://iibec.org/wp-content/uploads/2024/10/2024-10-dimension-stone.pdf"),
 "nsi_test": ("Natural Stone Institute course, “The Importance of Testing When Specifying Natural Stone”", "https://continuingeducation.bnpmedia.com/courses/natural-stone-institute/the-importance-of-testing-when-specifying-natural-stone/4/"),
 "bre_ce": ("BRE, “CE Marking of Stone” (list of EN test methods)", "https://files.bregroup.com/bre-co-uk-file-library-copy/filelibrary//CE%20Marking/KN5317_-_CE_Marking_of_Stone.pdf"),
 "stonefed": ("Stone Federation Great Britain, “Selecting the correct stone”", "https://www.stonefed.org.uk/app/uploads/prev/companydirectory/Selecting%20the%20correct%20stone.pdf"),
 "thin_marble": ("Hester, Newlin, Jimenez, McIntosh Blank, “Thin Marble Facades: History, Evaluation, and Maintenance” (2009)", "https://iibec.org/wp-content/uploads/2009-BES-heister-newlin-jimenez-mcintosh-blank.pdf"),
 "en16306": ("EGU 2015 abstract on the EN 16306 marble bowing test", "https://meetingorganizer.copernicus.org/EGU2015/EGU2015-15467.pdf?pdf"),
 "nsi_anchor": ("Natural Stone Institute course, “Understanding Anchorage Systems for Natural Stone Cladding”", "https://continuingeducation.bnpmedia.com/article_print.php?C=1627"),
 "epoxy": ("Naggatz, “Stone attachments: The challenges with epoxy-set anchors”, The Construction Specifier, August 2019", "https://www.constructionspecifier.com/stone-attachments-the-challenges-with-epoxy-set-anchors/4/"),
 "wje": ("Itle, “The dark side of the moon: Dangers of concealed spalls”, The Construction Specifier, July 2026", "https://www.constructionspecifier.com/the-dark-side-of-the-moon-dangers-of-concealed-spalls"),
 "structure": ("STRUCTURE magazine, “Anchoring Rocks”", "https://www.structuremag.org/article/anchoring-rocks/"),
 "cfa": ("Construction Fixings Association, Procedure for Site Testing Construction Fixings (to BS 8539); copy hosted on slideshare", "https://www.slideshare.net/Mirosek/gn-site-testingfinal071212"),
 "fischer_site": ("fischer UK, Site Testing", "https://www.fischer.co.uk/en-gb/service/our-support/site-testing"),
 "euroinox": ("Euro Inox, “Stainless Steel in Contact with Other Metallic Materials”", "https://www.edelstahl-rostfrei.de/fileadmin/user_upload/ISER/downloads/Contact_with_Other_EN.pdf"),
 "aga_ss": ("American Galvanizers Association, “Stainless Steel in Contact with Galvanized Steel”", "https://www.galvanizeit.org/education-and-resources/resources/technical-faq-dr-galv/stainless-steel-in-contact-with-galvanized-steel"),
 "ancon": ("Ancon, “The Use of Stainless Steel in the Construction Industry”", "https://www.ancon.co.uk/es/downloads/1057/The_Use_of_Stainless_Steel_in_Construction.pdf"),
 "sbc": ("Saudi Building Code National Committee, Saudi Building Code portal (SBC 301 and the other codes)", "https://sbc.gov.sa/En/BC/Pages/BuildingCode/BCSelect.aspx"),
 "ga_vent": ("Galvanizers Association (UK), “Filling, venting and drainage”", "https://galvanizing.org.uk/design-for-galvanizing/filling-venting-and-drainage/"),
 "aga_repair": ("American Galvanizers Association, repairing damaged or uncoated areas of hot-dip galvanized coatings (ASTM A780 methods)", "https://galvanizeit.org/knowledgebase/article/repairing-damaged-or-uncoated-areas-of-hot-dip-galvanized-coatings"),
 "wedge": ("Wedge Group Galvanizing, hot-dip galvanizing to EN ISO 1461, data sheet", "https://www.wedge-galv.co.uk/wp-content/uploads/2024/10/4b-HDG-to-EN-1461-2024.pdf"),
 "hilti_block": ("Hilti engineering Q&A, post-installed anchors in hollow-core masonry walls", "https://www.hilti.com/engineering/question/post-installed-anchors-in-hollow-core-cmu-walls/h81jto"),
 "hilti_hy270": ("Hilti, HIT-HY 270 injection mortar for masonry, technical data", "https://www.hilti.co.za/content/dam/documents/pdf/india/ftm-anchors/FTM_HY%20270_Anchor_Masonry.pdf"),
 "idea": ("IDEA StatiCa, “Limitations to checks of anchors”", "https://ideastatica.com/support-center/limitations-to-checks-of-anchors"),
 "nrc": ("National Research Council Canada, Canadian Building Digest 56 (thermal movements)", "https://web.mit.edu/parmstr/Public/NRCan/CanBldgDigests/cbd056_e.html"),
 "polycor": ("Polycor, Guide Specification Section 04 4200 Exterior Stone Cladding", "https://www.polycor.com/wp-content/uploads/2023/09/04-4200-Exterior-Stone-Cladding_Polycor-Guide-Spec-11032122.pdf"),
 "transbay": ("Example project specification, Section 04 42 00 Exterior Stone Cladding (United States, 2014)", "https://asc67.org/ASC_Previous_Problems/Open/IP/2018/Specifications/VOLUME%201/04%2042%2000%20-%20Exterior%20Stone%20Cladding.pdf"),
 "stoneworld": ("Stone World, “Understanding and Avoiding Efflorescence”", "https://www.stoneworld.com/articles/84367-understanding-and-avoiding-efflorescence"),
 "sce": ("Saudi Council of Engineers, Law of Practising Engineering Professions (English text)", "https://www.saudieng.sa/Admin/NPSCERules/PracticeSystemNEW-en.pdf"),
 "aisc303": ("AISC 303-16, Code of Standard Practice for Steel Buildings and Bridges", "https://www.aisc.org/globalassets/aisc/publications/standards/a303-16w_0517.pdf"),
 "bs8298": ("BSI, BS 8298-4:2020, stone cladding on rainscreen support systems (catalogue page)", "https://knowledge.bsigroup.com/products/design-and-installation-of-natural-stone-cladding-and-lining-stone-cladding-on-rainscreen-support-systems-code-of-practice"),
 "en1469": ("EN 1469:2015, natural stone slabs for cladding (catalogue entry)", "https://standards.iteh.ai/catalog/standards/cen/a7298b5e-5aa5-457f-a317-0f0f7f0562f8/en-1469-2015"),
}

L = {
 "en": dict(home="Home", homeurl="/", pre="", crumb="For Architects & Consultants", note="General guidance. Each project is designed by its engineer or consultant.", date="November 2026",
   updated="Updated", src_h="Sources", src_p="Public sources used for the technical statements on this page. Standards are summarised in our own words; where a standard was read through a secondary report, the entry says so. The project engineer should check the current edition before using any value.",
   spec="Spec sheet and document request", nav_e="In this section", nav_h="For Architects & Consultants", reach_e="Technical contact", reach_h="Reach the Technical Contact",
   reach_p="Call, send a WhatsApp message or email, and ask for the technical contact. Or send your drawings through the form.", wa="WhatsApp", form="Send your drawings", aria="Breadcrumb", name="AL-Swati Contracting"),
 "ar": dict(home="الرئيسية", homeurl="/ar/", pre="/ar", crumb="للمعماريين والاستشاريين", note="إرشادات عامة. يُصمَّم كل مشروع من قِبل مهندسه أو استشاريه.", date="نوفمبر 2026",
   updated="تحديث", src_h="المصادر", src_p="مصادر منشورة استندنا إليها في المعلومات الفنية في هذه الصفحة. لخّصنا المواصفات القياسية بعباراتنا، وحيث قُرئت المواصفة من مصدر ثانوي ذُكر ذلك في المصدر. على مهندس المشروع الرجوع إلى الإصدار الساري قبل استخدام أي قيمة.",
   spec="جدول المواصفات وطلب المستندات", nav_e="في هذا القسم", nav_h="للمعماريين والاستشاريين", reach_e="جهة الاتصال الفنية", reach_h="تواصل مع جهة الاتصال الفنية",
   reach_p="اتصل أو أرسل رسالة واتساب أو بريداً إلكترونياً واطلب جهة الاتصال الفنية، أو أرسل مخططاتك عبر النموذج.", wa="واتساب", form="أرسلوا مخططاتكم", aria="مسار التنقل", name="شركة السواتي للمقاولات"),
}
esc = lambda s: html.escape(str(s), quote=True)

class H:
    """Small helpers the content files use."""
    def __init__(self, lang): self.lang = lang; self.pre = L[lang]["pre"]
    def u(self, slug=""): return f"{self.pre}/{BASE}/" + (slug + "/" if slug else "")
    def p(self, *paras): return "".join(f"<p>{x}</p>" for x in paras)
    def ul(self, *items): return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>"
    def ol(self, *items): return "<ol>" + "".join(f"<li>{x}</li>" for x in items) + "</ol>"
    def h3(self, t): return f"<h3>{t}</h3>"
    def prose(self, *parts): return '<div class="fc-prose">' + "".join(parts) + "</div>"
    def table(self, heads, rows, wide=False, caption=""):
        o = [f'<div class="fc-tw"><table class="fc-table{" fc-wide" if wide else ""}">']
        if caption: o.append(f"<caption>{caption}</caption>")
        o.append("<thead><tr>" + "".join(f'<th scope="col">{x}</th>' for x in heads) + "</tr></thead><tbody>")
        for r in rows:
            o.append("<tr>" + f'<th scope="row">{r[0]}</th>' + "".join(f'<td data-l="{esc(re.sub("<[^>]+>", "", heads[i + 1]))}">{c}</td>' for i, c in enumerate(r[1:])) + "</tr>")
        o.append("</tbody></table></div>")
        return "".join(o)
    def cards(self, items):  # (small, title, text-or-list, href, link text)
        o = ['<div class="fc-cards">']
        for small, title, body, href, more in items:
            inner = (f"<small>{small}</small>" if small else "") + f"<b>{title}</b>" + (body if body.startswith("<ul") else f"<p>{body}</p>") + (f'<span class="link-gold arrow">{more} </span>' if more else "")
            o.append(f'<a class="fc-card" href="{href}">{inner}</a>' if href else f'<div class="fc-card">{inner}</div>')
        return "".join(o) + "</div>"
    def steps(self, items):  # (title, text, tag)
        return '<ol class="fc-steps">' + "".join(f"<li><b>{t}{f' <em>{tag}</em>' if tag else ''}</b><p>{x}</p></li>" for t, x, tag in items) + "</ol>"
    def dl(self, title, small, buttons):  # buttons: (label, href)
        return f'<div class="fc-dl"><div><b>{title}</b><small>{small}</small></div><div class="btns">' + "".join(f'<a class="btn {"btn-gold" if i == 0 else "btn-line"}" href="{h}" download><span>{l}</span></a>' for i, (l, h) in enumerate(buttons)) + "</div></div>"
    def det(self, code, tag, title, rows, open_label):  # a reference drawing (details.py) beside its notes; rows: (label, text)
        fig = "".join(f'<figure class="fc-sheet">%%SVG:{c}%%<figcaption><a href="/images/details/{c}-{self.lang}.svg" target="_blank" rel="noopener">{open_label}</a></figcaption></figure>' for c in code.split("+"))
        return f'<article class="fc-det" id="{code.split("+")[0]}"><div class="fc-figs">{fig}</div><div class="fc-det-t"><small>{tag}</small><h3>{title}</h3><dl>' + "".join(f"<dt>{a}</dt><dd>{b}</dd>" for a, b in rows) + "</dl></div></article>"
    def gallery(self, items):  # (picture path, alt, name, note, link or "")
        o = ['<div class="fc-gal">']
        for src, alt, name, note, href in items:
            cap = f"<b>{name}</b><span>{note}</span>"
            o.append(f'<figure><img src="{src}" alt="{esc(alt)}" width="1000" height="750" loading="lazy" decoding="async"><figcaption>' + (f'<a href="{href}">{cap}</a>' if href else cap) + "</figcaption></figure>")
        return "".join(o) + "</div>"
    def math(self, s): return f'<div class="fc-math">{s}</div>'

def shell(lang):
    tpl = open(os.path.join(ROOT, ("ar/" if lang == "ar" else "") + "technical-specs/index.html"), encoding="utf8").read()
    head = tpl[tpl.index("<header"):tpl.index("</header>") + 9]
    foot = tpl[tpl.index("<footer"):tpl.index("</footer>") + 9]
    wa = tpl[tpl.index('<a class="wa"'):tpl.index("</a>", tpl.index('<a class="wa"')) + 4]
    biz = re.search(r'<script type="application/ld\+json">(\{"@context": "https://schema.org", "@type": "GeneralContractor".*?)</script>', tpl, re.S).group(1)
    assert "foundingDate" not in biz
    head = head.replace(' class="active"', "")
    return head, foot, wa, biz

def cite(body, used):
    def sub(m):
        out = []
        for k in m.group(1).split(","):
            k = k.strip(); assert k in SOURCES, k
            if k not in used: used.append(k)
            n = used.index(k) + 1
            out.append(f'<a href="#src-{n}">[{n}]</a>')
        return "<sup>" + "".join(out) + "</sup>"
    return re.sub(r"\{\{([a-z0-9_, ]+)\}\}", sub, body)

def nb(h):
    """System names must not break at the hyphen (C-Channel, Up-Down): wrap them, in text only, never inside a tag."""
    return re.sub(r"(<[^>]*>)|\b(C-Channel|Up-Down)\b", lambda m: m.group(1) or f'<span class="fc-nb">{m.group(2)}</span>', h)

def page(lang, slug, pg, titles):
    t = L[lang]; other = "en" if lang == "ar" else "ar"
    path = f"{t['pre']}/{BASE}/" + (slug + "/" if slug else ""); twin = f"{L[other]['pre']}/{BASE}/" + (slug + "/" if slug else "")
    en_path = f"/{BASE}/" + (slug + "/" if slug else ""); ar_path = "/ar" + en_path
    url = SITE + path
    assert len(pg["title"]) <= 60, (lang, slug, "title", len(pg["title"]))
    assert 120 <= len(pg["desc"]) <= 160, (lang, slug, "desc", len(pg["desc"]))
    header, footer, wa, biz = shell(lang)
    header = header.replace(f'href="{L[other]["pre"]}/technical-specs/"', f'href="{twin}"')
    used = []
    secs = []
    import quick
    q = quick.T[lang]; uq = lambda x: x if x.startswith("/") and lang == "en" else (f"/ar{x}" if x.startswith("/") else f"{t['pre']}/{BASE}/{x}/")
    sections = list(pg["sections"])
    if not slug:  # the hub: a map in three stages replaces the two long card lists (when to call us, what you will find here)
        import fxmap
        ft = fxmap.T[lang]
        sections = [(ft["e"], ft["h"], fxmap.html(lang, uq, heading=False), "parts"), sections[0], sections[3]]
    jump = []
    for i, s in enumerate(sections):
        eyebrow, h2, body = s[:3]
        if i in quick.FIGS.get(slug, {}): body = quick.FIGS[slug][i](lang, body) + body if slug == "quality" else body + quick.FIGS[slug][i](lang, body)
        if i in quick.DRAWS.get(slug, {}): body += quick.draws(lang, quick.DRAWS[slug][i], uq("typical-details"))
        sid = s[3] if len(s) > 3 and s[3] else f"part-{i + 1}"
        cls = "fc-sec bt" + (" alt" if i % 2 == 0 else "")
        if eyebrow: jump.append((sid, eyebrow))
        secs.append(f'<section class="{cls}" id="{sid}"><div class="wrap">' + (f'<div class="eyebrow">{eyebrow}</div>' if eyebrow else "") + f"<h2>{h2}</h2>{cite(body, used)}</div></section>")
    jumpbar = f'<nav class="subnav tc-jump" aria-label="{q["jump"]}"><div class="wrap">' + "".join(f'<a href="#{i}">{e}</a>' for i, e in jump) + "</div></nav>" if len(jump) >= 3 else ""
    quickbox = f'<aside class="fc-quick"><b>{q["quick"]}</b><ul>' + "".join(f"<li>{x}</li>" for x in quick.QUICK[lang][slug]) + "</ul></aside>"
    import fxmap as _fx
    ways = f'<div class="fc-ways">{_fx.search(lang)}{"" if slug else _fx.need(lang, uq)}</div>'
    secs = [nb(x) for x in secs]
    lead = cite(pg["lead"], used)
    n = len(sections)
    src = ""
    if used:
        items = "".join(f'<li id="src-{i + 1}">{esc(SOURCES[k][0])}. <a href="{esc(SOURCES[k][1])}" rel="noopener nofollow" target="_blank">{esc(re.sub(r"^https?://(www\.)?", "", SOURCES[k][1]).split("/")[0])}</a></li>' for i, k in enumerate(used))
        src = f'<section class="fc-src bt{" alt" if n % 2 == 0 else ""}" id="sources"><div class="wrap"><h2>{t["src_h"]}</h2><p>{t["src_p"]}</p><ol dir="ltr" lang="en">{items}</ol></div></section>'
        n += 1
    navitems = "".join(f'<li><a href="{t["pre"]}/{BASE}/{(s + "/") if s else ""}"{" aria-current=" + chr(34) + "page" + chr(34) if s == slug else ""}>{esc(titles[s])}</a></li>' for s in ORDER)
    navitems += f'<li><a href="{t["pre"]}/technical-specs/">{t["spec"]}</a></li>'  # the spec sheet page keeps its old address
    nav = f'<section class="fc-sec bt{" alt" if n % 2 == 0 else ""}"><div class="wrap"><div class="eyebrow">{t["nav_e"]}</div><h2>{esc(t["nav_h"])}</h2><ul class="fc-nav">{navitems}</ul>'
    nav += f'<div class="fc-prose"><h3>{t["reach_h"]}</h3><p>{t["reach_p"]}</p></div><div class="fc-reach"><a class="btn btn-gold" href="tel:+966511826313"><span>✆ <bdi dir="ltr">+966 51 182 6313</bdi></span></a><a class="btn btn-line" href="https://wa.me/966511826313" target="_blank" rel="noopener"><span>{t["wa"]}</span></a><a class="btn btn-line" href="mailto:info@al-swaticontracting.com"><span>info@al-swaticontracting.com</span></a>'
    if slug != "send-drawings": nav += f'<a class="btn btn-line" href="{t["pre"]}/{BASE}/send-drawings/"><span>{t["form"]}</span><span class="arrow"></span></a>'
    nav += "</div></div></section>"
    crumbs = f'<nav class="est-crumbs" aria-label="{t["aria"]}"><a href="{t["homeurl"]}">{t["home"]}</a><span aria-hidden="true">/</span>'
    bl = [{"@type": "ListItem", "position": 1, "name": t["home"], "item": SITE + t["homeurl"]}, {"@type": "ListItem", "position": 2, "name": t["crumb"], "item": SITE + f"{t['pre']}/{BASE}/"}]
    if slug:
        crumbs += f'<a href="{t["pre"]}/{BASE}/">{esc(t["crumb"])}</a><span aria-hidden="true">/</span><span>{esc(pg["crumb"])}</span></nav>'
        bl.append({"@type": "ListItem", "position": 3, "name": pg["crumb"], "item": url})
    else:
        crumbs += f'<span>{esc(t["crumb"])}</span></nav>'
    art = {"@context": "https://schema.org", "@type": "TechArticle", "@id": url + "#article", "headline": html.unescape(re.sub("<[^>]+>", "", pg["h1"])), "description": pg["desc"], "inLanguage": lang, "url": url,
           "author": {"@id": SITE + "/#business"}, "publisher": {"@id": SITE + "/#business"}, "mainEntityOfPage": url, "image": SITE + "/images/share/al-swati-stone-facades.jpg",
           "datePublished": DATE_ISO, "dateModified": DATE_ISO, "audience": {"@type": "Audience", "audienceType": "Architects, consultants and contractors"}}
    js = lambda o: json.dumps(o, ensure_ascii=False)
    T, D = esc(pg["title"]), esc(pg["desc"])
    loc = ("ar_SA", "en_US") if lang == "ar" else ("en_US", "ar_SA")
    out = f'''<!doctype html>
<html lang="{lang}" dir="{"rtl" if lang == "ar" else "ltr"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{T}</title>
<meta name="description" content="{D}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{T}">
<meta property="og:description" content="{D}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AL-Swati Contracting">
<meta property="og:locale" content="{loc[0]}">
<meta property="og:locale:alternate" content="{loc[1]}">
<meta property="og:image" content="{SITE}/images/share/al-swati-stone-facades.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}/images/share/al-swati-stone-facades.jpg">
<meta name="twitter:title" content="{T}">
<meta name="twitter:description" content="{D}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#1a1a1a">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><noscript><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/assets/style.css?v=f7">
<script type="application/ld+json">{biz}</script>
<script type="application/ld+json">{js(art)}</script>
<script type="application/ld+json">{js({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": bl})}</script>
<link rel="alternate" hreflang="en" href="{SITE}{en_path}">
<link rel="alternate" hreflang="ar" href="{SITE}{ar_path}">
<link rel="alternate" hreflang="x-default" href="{SITE}{en_path}">
</head>
<body class="fc-page">
{header}

<main>
<section class="est-top tc-top fc-top"><div class="wrap">
{crumbs}
<div class="eyebrow">{pg["eyebrow"]}</div><h1>{pg["h1"]}</h1><div class="rule"></div><p class="lead">{lead}</p>
{ways}
{pg.get("btns", "") if slug else ""}
<p class="fc-note"><b>{t["note"]}</b> <span>{t["updated"]}: {t["date"]}</span></p>
{quickbox}
</div></section>
{jumpbar}
{"".join(secs)}
{src}
{nav}
</main>
{footer}
{wa}

<script src="/assets/main.js?v=f4"></script>
</body>
</html>
'''
    import details
    out = re.sub(r"%%SVG:(\w+)%%", lambda m: details.svg(m.group(1), lang), out)
    f = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(f), exist_ok=True)
    open(f, "w", encoding="utf8").write(out)
    words = len(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", " ", out, flags=re.S)).split())
    return path, words

def index():
    """Search index and glossary terms of the technical pages, read back from the pages just written: /assets/fc-search-<lang>.json, /assets/fc-terms-<lang>.json."""
    txt = lambda x: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(svg|script|style)[\s\S]*?</\1>", " ", x)))).strip()
    for lang in ("en", "ar"):
        pre = L[lang]["pre"]; rows = []
        files = [(f"{pre}/{BASE}/" + (s + "/" if s else ""), os.path.join(ROOT, pre.strip("/"), BASE, s, "index.html")) for s in ORDER]
        files.append((f"{pre}/technical-specs/", os.path.join(ROOT, pre.strip("/"), "technical-specs", "index.html")))
        for url, f in files:
            h = open(f, encoding="utf8").read(); name = txt(re.search(r"<h1[^>]*>([\s\S]*?)</h1>", h).group(1))
            for m in re.finditer(r'<section class="[^"]*"(?: id="([^"]+)")?[^>]*><div class="wrap">([\s\S]*?)</div></section>', h):
                sid, body = m.group(1), m.group(2); h2 = re.search(r"<h2[^>]*>([\s\S]*?)</h2>", body)
                if not sid or not h2 or sid in ("sources", "parts", "map"): continue
                rows.append({"u": f"{url}#{sid}", "p": name, "h": txt(h2.group(1)), "t": txt(body.replace(h2.group(0), ""))[:6000]})
        json.dump(rows, open(os.path.join(ROOT, "assets", f"fc-search-{lang}.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
        g = open(os.path.join(ROOT, pre.strip("/"), BASE, "glossary", "index.html"), encoding="utf8").read(); terms = {}
        plain = {"mechanical fixing", "stone cladding", "riyadh limestone", "panel", "thickness", "bracket / angle", "pin / dowel", "stainless steel", "wall anchor", "workmanship warranty", "up-down angle", "c-channel"}  # everyday words: no box
        for m in re.finditer(r'<tr><th scope="row">([\s\S]*?)</th><td[^>]*><span lang="(?:ar|en)"[^>]*>([\s\S]*?)</span></td><td[^>]*>([\s\S]*?)</td></tr>', g):
            a, b, mean = txt(m.group(1)), txt(m.group(2)), txt(m.group(3))
            en, ar = (b, a) if lang == "ar" else (a, b)
            if en.lower() in plain: continue
            for k in re.split(r"\s*/\s*", ar if lang == "ar" else en):
                short = re.search(r"\(([^)]+)\)", k); k = re.sub(r"\s*\([^)]*\)", "", k).strip()
                tip = mean + (f" ({en})" if lang == "ar" else "")
                if len(k) >= 4: terms[k] = tip
                if short and lang == "en" and len(short.group(1)) >= 3 and short.group(1).isupper(): terms[short.group(1)] = tip
        for k in ("Stone cladding", "تركيب الحجر"): terms.pop(k, None)
        json.dump(terms, open(os.path.join(ROOT, "assets", f"fc-terms-{lang}.json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
        print(lang, len(rows), "search rows,", len(terms), "terms")

def sitemap():
    f = os.path.join(ROOT, "sitemap.xml"); sm = open(f, encoding="utf8").read()
    sm = re.sub(r"<!--consultants-->.*?<!--/consultants-->\n", "", sm, flags=re.S)
    rows = []
    for s in ORDER:
        en = f"{SITE}/{BASE}/" + (s + "/" if s else ""); ar = f"{SITE}/ar/{BASE}/" + (s + "/" if s else "")
        alt = f'<xhtml:link rel="alternate" hreflang="en" href="{en}"/><xhtml:link rel="alternate" hreflang="ar" href="{ar}"/><xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>'
        for u in (en, ar): rows.append(f"<url><loc>{u}</loc>{alt}<lastmod>{DATE_ISO}</lastmod></url>")
    block = "<!--consultants-->\n" + "\n".join(rows) + "\n<!--/consultants-->\n"
    i = sm.index("<!--erp-posts-->")
    open(f, "w", encoding="utf8").write(sm[:i] + block + sm[i:])

if __name__ == "__main__":
    import content_en, content_ar
    for lang, mod in (("en", content_en), ("ar", content_ar)):
        pages = mod.pages(H(lang))
        assert list(pages) == ORDER, list(pages)
        titles = {s: pages[s]["crumb"] for s in ORDER}
        for s in ORDER:
            path, words = page(lang, s, pages[s], titles)
            print(f"{path:55} {words:5} words  title {len(pages[s]['title'])}  desc {len(pages[s]['desc'])}")
    index()
    sitemap()
