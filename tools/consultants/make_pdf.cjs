// Writes the Maintenance and Handover Guide as two PDFs (English and Arabic) into downloads/.
// Run from the repository root:  node tools/consultants/make_pdf.cjs   (needs Playwright's Chromium; no network is used)
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..", "..");
const font = (f) => "data:font/ttf;base64," + fs.readFileSync(path.join(__dirname, "fonts", f)).toString("base64");

const C = {
  en: {
    file: "al-swati-stone-facade-maintenance-guide-en.pdf", dir: "ltr", lang: "en",
    co: "AL-SWATI CONTRACTING", sub: "Riyadh · Experience since 1994", title: "Stone Facade Maintenance and Handover Guide",
    kind: "For mechanically fixed natural stone, marble, granite and porcelain facades",
    note: "General guidance. Each project is designed by its engineer or consultant.", date: "November 2026 · Revision 0",
    intro: "A mechanically fixed facade needs little maintenance, but not none. This guide is for the owner and the facility team. The project engineer sets the inspection interval and any instruction specific to the building; where this guide and the project documents differ, the project documents govern.",
    dataH: "1. The facade (filled in at handover)",
    data: ["Project / building", "Location", "Stone or panel types and thickness", "Fixing system(s)", "Substructure", "Approved shop drawing references", "Handover date", "Warranty certificate reference", "Location of spare panels"],
    secs: [
      ["2. The handover file contains", ["A description of the facade: stone or panel types, fixing system, drawing references.", "The approved shop drawings and the project records agreed for handover.", "Test reports, where tests were done.", "The 5-year written workmanship warranty attested by the Chamber of Commerce, issued by the contracting company.", "This guide."]],
      ["3. Inspection: what to look for", ["Cracked, chipped, displaced or loose panels.", "Joints that have opened, closed or lost their sealant.", "Rust-coloured or white stains running from a joint.", "Blocked ventilation openings at the base and top of the cavity.", "Anything fixed to the facade since handover: signs, lights, cables, cameras."], "The project engineer sets the interval. As general guidance: a visual check once a year and after any storm or impact. Report findings to the building's engineer and to the installer before any repair."],
      ["4. Cleaning", ["Remove dust with clean water and a soft brush.", "Where a cleaner is needed, use a neutral one. No acids or salt-based cleaners on limestone or marble.", "Test any cleaner on a small hidden area first.", "No high-pressure washing at close range.", "Keep irrigation spray and water features off the facade."]],
      ["5. What not to do", ["Do not drill into panels or fix anything to them (signs, lights, cables) without engineering approval.", "Do not fill ventilation gaps or open joints.", "Do not replace a panel with a different stone, thickness or fixing without the engineer's approval.", "Do not lean ladders or scaffolding on unprotected panel edges."]],
      ["6. Replacing a panel", ["Undercut on rails: each panel hangs alone and can be taken off and replaced on its own.", "Pin, kerf and Up-Down: the fixings sit in the joints and are shared with neighbouring panels, so panels are released in sequence. This is work for the installer.", "Sealant joints, where present, have a limited life: replace them when they crack or lose adhesion."]],
    ],
    logH: "7. Inspection log", log: ["Date", "Inspected by", "Findings", "Action taken"],
    srcH: "Sources", src: ["Building Stone Institute, Recommended Best Practices (cleaning of limestone and marble).", "Natural Stone Institute, Dimension Stone Design Manual, Vertical Surfaces (venting of the cavity).", "Stone World, “Understanding and Avoiding Efflorescence” (test cleaners on a small area).", "Links: al-swaticontracting.com/for-consultants/maintenance/"],
    contactH: "Contact", contact: "AL-Swati Contracting, Riyadh · Phone and WhatsApp +966 51 182 6313 · info@al-swaticontracting.com · al-swaticontracting.com",
    page: "Page", foot: "AL-Swati Contracting · al-swaticontracting.com · November 2026",
  },
  ar: {
    file: "al-swati-stone-facade-maintenance-guide-ar.pdf", dir: "rtl", lang: "ar",
    co: "شركة السواتي للمقاولات", sub: "الرياض · خبرة منذ 1994", title: "دليل صيانة وتسليم واجهات الحجر",
    kind: "لواجهات الحجر الطبيعي والرخام والجرانيت والبورسلان المثبتة ميكانيكياً",
    note: "إرشادات عامة. يُصمَّم كل مشروع من قِبل مهندسه أو استشاريه.", date: "نوفمبر 2026 · الإصدار 0",
    intro: "الواجهة المثبتة ميكانيكياً تحتاج إلى صيانة قليلة، لكنها لا تستغني عنها. هذا الدليل للمالك ولفريق إدارة المبنى. يحدد مهندس المشروع مدة الفحص الدوري وأي تعليمات خاصة بالمبنى؛ وإذا اختلف هذا الدليل عن مستندات المشروع فمستندات المشروع هي المرجع.",
    dataH: "1. بيانات الواجهة (تُملأ عند التسليم)",
    data: ["المشروع / المبنى", "الموقع", "أنواع الحجر أو الألواح والسماكة", "نظام التثبيت", "الهيكل المعدني", "مراجع المخططات التنفيذية المعتمدة", "تاريخ التسليم", "مرجع شهادة الضمان", "مكان حفظ الألواح الاحتياطية"],
    secs: [
      ["2. محتويات ملف التسليم", ["وصف الواجهة: أنواع الحجر أو الألواح، ونظام التثبيت، ومراجع المخططات.", "المخططات التنفيذية المعتمدة وسجلات المشروع المتفق على تسليمها.", "تقارير الاختبارات عند إجرائها.", "ضمان مكتوب على التنفيذ لمدة 5 سنوات، مصدّق من الغرفة التجارية، تصدره شركة المقاولات.", "هذا الدليل."]],
      ["3. الفحص: ما الذي يُبحث عنه", ["ألواح مشروخة أو متضررة الحواف أو متحركة من موضعها أو غير ثابتة.", "فواصل اتسعت أو ضاقت أو فقدت مادة السيلانت.", "بقع بلون الصدأ أو بقع بيضاء تسيل من أحد الفواصل.", "فتحات تهوية مسدودة أسفل الفراغ الخلفي وأعلاه.", "أي شيء ثُبّت على الواجهة بعد التسليم: لوحات أو إنارة أو كابلات أو كاميرات."], "يحدد مهندس المشروع مدة الفحص. وعلى سبيل الإرشاد العام: فحص بالنظر مرة في السنة وبعد أي عاصفة أو صدمة. وتُبلَّغ الملاحظات إلى مهندس المبنى وإلى جهة التركيب قبل أي إصلاح."],
      ["4. التنظيف", ["يُزال الغبار بماء نظيف وفرشاة ناعمة.", "عند الحاجة إلى منظف يُستخدم منظف متعادل. ولا تُستخدم الأحماض ولا المنظفات الملحية على الحجر الجيري أو الرخام.", "يُجرَّب أي منظف أولاً على مساحة صغيرة غير ظاهرة.", "لا يُستخدم الغسل بالضغط العالي من مسافة قريبة.", "يُبعد رذاذ الري والنوافير عن الواجهة."]],
      ["5. ما يجب تجنّبه", ["لا تُثقب الألواح ولا يُثبَّت عليها شيء (لوحات، إنارة، كابلات) دون موافقة هندسية.", "لا تُسدّ فتحات التهوية ولا الفواصل المفتوحة.", "لا يُستبدل لوح بحجر أو سماكة أو تثبيت مختلف دون موافقة المهندس.", "لا تُسند السلالم أو السقالات على حواف الألواح دون حماية."]],
      ["6. استبدال لوح", ["Undercut على المجاري: كل لوح معلّق وحده ويمكن فكّه واستبداله منفرداً.", "الدبابيس وKerf وUp-Down: التثبيت داخل الفواصل ومشترك مع الألواح المجاورة، فتُحرَّر الألواح بالتتابع. وهذا عمل تقوم به جهة التركيب.", "فواصل المعجون المانع للتسرب (السيلانت)، إن وُجدت، عمرها محدود: تُستبدل عند تشققها أو فقدانها الالتصاق."]],
    ],
    logH: "7. سجل الفحص", log: ["التاريخ", "الفاحص", "الملاحظات", "الإجراء المتخذ"],
    srcH: "المصادر", src: ["Building Stone Institute, Recommended Best Practices (تنظيف الحجر الجيري والرخام).", "Natural Stone Institute, Dimension Stone Design Manual, Vertical Surfaces (تهوية الفراغ الخلفي).", "Stone World, “Understanding and Avoiding Efflorescence” (تجربة المنظف على مساحة صغيرة).", "الروابط: al-swaticontracting.com/ar/for-consultants/maintenance/"],
    contactH: "التواصل", contact: "شركة السواتي للمقاولات، الرياض · جوال وواتساب ‎+966 51 182 6313‎ · info@al-swaticontracting.com · al-swaticontracting.com",
    page: "صفحة", foot: "شركة السواتي للمقاولات · al-swaticontracting.com · نوفمبر 2026",
  },
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function html(c) {
  return `<!doctype html><html lang="${c.lang}" dir="${c.dir}"><head><meta charset="utf-8"><title>${esc(c.title)} | ${esc(c.co)}</title><style>
@font-face{font-family:T;src:url(${font("Tajawal-Regular.ttf")});font-weight:400}@font-face{font-family:T;src:url(${font("Tajawal-Bold.ttf")});font-weight:700}
@page{size:A4;margin:16mm 16mm 18mm}
*{box-sizing:border-box}body{font-family:T,sans-serif;font-size:${c.dir === "rtl" ? 11.2 : 10.4}pt;line-height:${c.dir === "rtl" ? 1.75 : 1.5};color:#1a1a1a;margin:0}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2.5pt solid #b8953a;padding-bottom:8pt}
.co{font-weight:700;font-size:13pt;letter-spacing:${c.dir === "rtl" ? 0 : ".8pt"}}.sub{color:#666;font-size:9pt}
h1{font-size:21pt;line-height:1.25;margin:16pt 0 2pt}.kind{color:#555;margin:0 0 10pt}
.note{border-inline-start:3pt solid #b8953a;background:#f6f1e3;padding:7pt 10pt;font-weight:700;margin:10pt 0}.note span{font-weight:400;color:#555;margin-inline-start:8pt}
h2{font-size:12.5pt;margin:15pt 0 5pt;color:#1a1a1a;border-bottom:.6pt solid #cfcfcf;padding-bottom:3pt;break-after:avoid}
p{margin:5pt 0}ul{margin:4pt 0;padding-inline-start:16pt}li{margin:2.5pt 0}li::marker{color:#b8953a}
table{width:100%;border-collapse:collapse;margin-top:4pt}td,th{border:.6pt solid #bdbdbd;padding:5pt 7pt;text-align:start;vertical-align:top}
th{background:#f3f3f3;font-weight:700}.data td:first-child{width:40%;background:#fafafa;font-weight:700}.data td:last-child{height:20pt}
.log td{height:24pt}.small{font-size:8.6pt;color:#555;line-height:1.5}.small li{margin:1pt 0}
section{break-inside:avoid}[dir=ltr]{unicode-bidi:isolate}
</style></head><body>
<div class="top"><div><div class="co">${esc(c.co)}</div><div class="sub">${esc(c.sub)}</div></div><div class="sub">${esc(c.date)}</div></div>
<h1>${esc(c.title)}</h1><p class="kind">${esc(c.kind)}</p>
<div class="note">${esc(c.note)}<span>${esc(c.date)}</span></div>
<p>${esc(c.intro)}</p>
<section><h2>${esc(c.dataH)}</h2><table class="data">${c.data.map((x) => `<tr><td>${esc(x)}</td><td></td></tr>`).join("")}</table></section>
${c.secs.map(([h, li, p]) => `<section><h2>${esc(h)}</h2>${p ? `<p>${esc(p)}</p>` : ""}<ul>${li.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}
<section><h2>${esc(c.logH)}</h2><table class="log"><tr>${c.log.map((x) => `<th>${esc(x)}</th>`).join("")}</tr>${"<tr><td></td><td></td><td></td><td></td></tr>".repeat(6)}</table></section>
<section><h2>${esc(c.contactH)}</h2><p>${esc(c.contact)}</p></section>
<section class="small"><h2>${esc(c.srcH)}</h2><ul>${c.src.map((x) => `<li><span dir="${/^[A-Za-z]/.test(x) ? "ltr" : c.dir}">${esc(x)}</span></li>`).join("")}</ul><p>${esc(c.note)}</p></section>
</body></html>`;
}
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext();
  await ctx.route("**/*", (r) => (r.request().url().startsWith("data:") || r.request().url() === "about:blank" ? r.continue() : r.abort()));
  fs.mkdirSync(path.join(ROOT, "downloads"), { recursive: true });
  for (const k of ["en", "ar"]) {
    const c = C[k], p = await ctx.newPage();
    await p.setContent(html(c), { waitUntil: "load" }); await p.evaluate(() => document.fonts.ready);
    const foot = `<div style="font-family:sans-serif;font-size:7pt;color:#777;width:100%;padding:0 16mm;display:flex;justify-content:space-between;direction:${c.dir}"><span>${c.foot}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
    await p.pdf({ path: path.join(ROOT, "downloads", c.file), format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: foot, margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" } });
    console.log("wrote downloads/" + c.file, fs.statSync(path.join(ROOT, "downloads", c.file)).size, "bytes");
    await p.close();
  }
  await b.close();
})();
