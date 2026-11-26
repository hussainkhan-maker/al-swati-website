// Builds the blog of al-swaticontracting.com from the posts published in the AL-Swati ERP, and keeps every page's icon and
// share picture right. Run by .github/workflows/build.yml (every 30 minutes, on demand, and when the ERP asks).
//  • every Published post gets a real page: English at /blog/<slug>/, Arabic at /ar/blog/<slug>/ (same look as the site's own posts)
//  • an English post and its Arabic twin point at each other (language switch + hreflang), so Google pairs them
//  • the blog lists, and sitemap.xml, show the ERP posts first; a post that is unpublished in the ERP disappears here too
//  • pages written by hand are never overwritten: only pages listed in tools/erp-pages.json are this tool's own -
//    except a "Boost to Top 3" upgrade the owner published for that address (blog_posts.target_path): it takes the page's
//    place, the original is kept in tools/originals/, and it comes back by itself when the upgrade is unpublished
//  • a published Riyadh district page (blog_posts.area) gets its own address, /stone-cladding-<district>-riyadh/ and
//    /ar/stone-cladding-<district>-riyadh/, with the owner's photos, and the "Stone cladding in Riyadh" pages link to it
//  • a published project case study (area.type "case") gets /projects/<slug>/ and /ar/projects/<slug>/, and a card on the
//    Projects page
// It needs no secret: it reads only published posts, with the app's public key (the same one the public ERP blog uses).
import { readFile, writeFile, mkdir, rm, readdir, access } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ROOT = process.argv[2] || ".";
const SITE = "https://al-swaticontracting.com";
const API = "https://keweaoogdnxietvyerhj.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtld2Vhb29nZG54aWV0dnllcmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTM5MjIsImV4cCI6MjEwOTYyOTkyMn0.KXMRTzdJVvtWSwaiRou6OQbU1AjJUtir_643diGPSBM";
const SHARE_JPG = "/images/share/al-swati-contracting.jpg";
const DEFAULT_IMG = "/images/pages/home/hero.webp";
const MANIFEST = "tools/erp-pages.json";
const ORIG = "tools/originals"; // hand-made pages that a published upgrade replaced (put back when it is unpublished)
const INDEXNOW_KEY = "a5f3c1e9d2b84f6e9c7a0b1d3e5f7a92"; // public by design: Bing and other IndexNow search engines check this file on the site
const CHANGED = process.env.CHANGED_URLS || join(tmpdir(), "changed-urls.txt"); // pages this run created or changed, for the IndexNow ping (kept out of the repo)

const p = (...a) => join(ROOT, ...a);
const exists = async (f) => access(p(f)).then(() => true, () => false);
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (u) => (/^https?:\/\//.test(u) ? u : SITE + u);

// ───────── the posts ─────────
async function posts(postsFile) {
  if (postsFile) return JSON.parse(await readFile(postsFile, "utf8")); // local test
  const q = "select=id,slug,lang,title,meta_description,keywords,body,published_at,updated_at,image_url,image_alt,twin_id,target_path,area&status=eq.Published&order=published_at.desc&limit=500";
  const r = await fetch(`${API}/rest/v1/blog_posts?${q}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`Reading the ERP posts failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// ───────── markdown from the ERP → the site's article HTML ─────────
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|tel:|mailto:)[^\s)]+)\)/g, (_, t, h) => `<a href="${h}"${/^https?:\/\/(?!al-swaticontracting\.com)/.test(h) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`);
}
const clean = (src) => String(src || "").replace(/\r/g, "").replace(/<\/?cite[^>]*>/gi, ""); // web-search citation tags the AI sometimes leaves in
export function md(src) {
  const out = [], lines = clean(src).split("\n");
  let para = [], list = null, table = null;
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const cells = (l) => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const flushT = () => {
    if (!table) return;
    const rows = table.filter((r) => !/^\|?\s*:?-{2,}/.test(r)).map(cells); table = null;
    if (!rows.length) return;
    const [head, ...body] = rows;
    out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
  };
  const flushL = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.tag}>`); list = null; } };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flushP(); flushL(); flushT(); continue; }
    if (/^\|.*\|$/.test(l)) { flushP(); flushL(); (table ??= []).push(l); continue; }
    flushT();
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.+)$/))) { flushP(); flushL(); if (m[1].length > 1) out.push(`<h${m[1].length === 2 ? 2 : 3}>${inline(m[2])}</h${m[1].length === 2 ? 2 : 3}>`); continue; }
    if ((m = l.match(/^[-*•]\s+(.+)$/)) || (m = l.match(/^\d+[.)]\s+(.+)$/))) {
      flushP(); const tag = /^\d/.test(l) ? "ol" : "ul";
      if (!list || list.tag !== tag) { flushL(); list = { tag, items: [] }; }
      list.items.push(m[1]); continue;
    }
    if (/^(---|\*\*\*)$/.test(l)) { flushP(); flushL(); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL(); flushT();
  return out.join("\n");
}

// ───────── the post's own FAQ section → FAQPage data for Google ─────────
// Only questions that are really on the page: the section under a "## Frequently asked questions" / "## الأسئلة الشائعة"
// heading, each question a "### …" heading (or a **bold** line ending in ?) with its answer below it.
const FAQ_HEAD = /^#{2,3}\s+.*(faq|frequently asked|common questions|questions and answers|الأسئلة الشائعة|أسئلة شائعة|الأسئلة المتكررة|أسئلة متكررة)/i;
const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*?([^*]+)\*\*?/g, "$1").replace(/\s+/g, " ").trim();
export function faqs(src) {
  const lines = clean(src).split("\n"), start = lines.findIndex((l) => FAQ_HEAD.test(l.trim()));
  if (start < 0) return [];
  const out = []; let q = null, a = [];
  const push = () => { if (q && a.length) out.push({ q: plain(q), a: plain(a.join(" ")) }); q = null; a = []; };
  for (const raw of lines.slice(start + 1)) {
    const l = raw.trim(); let m;
    if (/^##\s/.test(l)) break; // the next main heading ends the FAQ section
    if ((m = l.match(/^#{3,4}\s+(.+)$/)) || (m = l.match(/^\*\*(.+?[?؟])\*\*$/))) { push(); q = m[1]; continue; }
    if (q && l && !/^(---|\*\*\*)$/.test(l)) a.push(l.replace(/^([-*•]|\d+[.)])\s+/, ""));
  }
  push();
  return out.filter((x) => x.q.length > 5 && x.a.length > 10);
}

// ───────── one post page, in the site's own look ─────────
const dateText = (d, ar) => new Intl.DateTimeFormat(ar ? "ar-EG" : "en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(d));
const norm = (t) => { let s = String(t || "").trim().replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0]; if (!s.startsWith("/")) s = "/" + s; if (!/\.[a-z0-9]+$/i.test(s) && !s.endsWith("/")) s += "/"; return s; };
const pathOf = (post) => (post.target_path ? norm(post.target_path) : post.lang === "ar" ? `/ar/blog/${post.slug.replace(/-ar$/, "")}/` : `/blog/${post.slug}/`);
const imgOf = (post) => post.image_url || DEFAULT_IMG;
let HAS_SHARE = false; // the JPG share picture exists (made by tools/make-icons.py)
const shareImg = (post) => (post.image_url && !/\.webp(\?|$)/i.test(post.image_url) ? post.image_url : HAS_SHARE ? SHARE_JPG : imgOf(post));

function headBlock(post, twin, url, upgrade) {
  const ar = post.lang === "ar", brand = ar ? "شركة السواتي" : "AL-Swati";
  const title = `${post.title} | ${brand}`, desc = post.meta_description || "";
  const img = abs(shareImg(post)), jpg = img.endsWith(SHARE_JPG);
  const alt = (lang, u) => `<link rel="alternate" hreflang="${lang}" href="${abs(u)}">`;
  const pair = twin ? [alt(post.lang, url), alt(twin.lang, pathOf(twin)), alt("x-default", post.lang === "en" ? url : pathOf(twin))] : [];
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: desc, image: [abs(imgOf(post))],
    datePublished: post.published_at, dateModified: post.updated_at || post.published_at, inLanguage: ar ? "ar" : "en", mainEntityOfPage: abs(url),
    author: { "@type": "Organization", name: ar ? "شركة السواتي للمقاولات" : "AL-Swati Contracting", url: SITE + "/" },
    publisher: { "@id": SITE + "/#business" }, keywords: (post.keywords || []).join(", ") };
  const qa = faqs(post.body);
  const faq = qa.length >= 2 ? { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: ar ? "ar" : "en",
    mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) } : null;
  const script = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u" + "003c")}</script>`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${abs(url)}">`,
    ...pair,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${abs(url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${ar ? "شركة السواتي للمقاولات" : "AL-Swati Contracting"}">`,
    `<meta property="og:locale" content="${ar ? "ar_SA" : "en_US"}">`,
    `<meta property="og:locale:alternate" content="${ar ? "en_US" : "ar_SA"}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    ...(jpg ? [`<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`, `<meta property="og:image:type" content="image/jpeg">`] : []),
    `<meta property="og:image:alt" content="${esc(post.image_alt || post.title)}">`,
    `<meta property="article:published_time" content="${esc(post.published_at)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    `<link rel="icon" href="/images/logo/horizontal/dark.png">`, // swapped for the square icon by fixHead() once it exists
    script(ld),
    ...(faq ? [script(faq)] : []),
    script({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: SITE + (ar ? "/ar/" : "/") },
      ...(upgrade ? [] : [{ "@type": "ListItem", position: 2, name: ar ? "المدونة" : "Blog", item: SITE + (ar ? "/ar/blog/" : "/blog/") }]),
      { "@type": "ListItem", position: upgrade ? 2 : 3, name: post.title, item: abs(url) }] }),
  ].join("\n");
}

// every article points readers (and Google) to the service pages that bring the work
const related = (ar) => ar
  ? `<h2>خدماتنا</h2><ul><li><a href="/ar/stone-cladding-riyadh/">تركيب الحجر في الرياض</a></li><li><a href="/ar/mechanical-stone-installation/">تركيب حجر ميكانيكي</a></li><li><a href="/ar/villa-stone-facades-riyadh/">واجهات حجر للفلل في الرياض</a></li><li><a href="/ar/marble-installation-riyadh/">تركيب رخام في الرياض</a></li></ul>`
  : `<h2>Our services</h2><ul><li><a href="/stone-cladding-riyadh/">Stone cladding in Riyadh</a></li><li><a href="/marble-installation-riyadh/">Marble installation in Riyadh</a></li><li><a href="/services/">Stone, marble and porcelain facade services</a></li><li><a href="/projects/">Our projects</a></li></ul>`;

function mainBlock(post, twin, upgrade) {
  const ar = post.lang === "ar", list = ar ? "/ar/blog/" : "/blog/";
  const tags = (post.keywords || []).slice(0, 6).map((k) => `<span>#${esc(k)}</span>`).join("");
  const twinLink = twin ? `<p class="twin"><a class="link-gold" href="${pathOf(twin)}" hreflang="${twin.lang}" lang="${twin.lang}">${twin.lang === "ar" ? "اقرأ هذا المقال بالعربية" : "Read this article in English"}</a></p>` : "";
  return `<main>
<div class="post-hero"><img src="${esc(imgOf(post))}" alt="${esc(post.image_alt || post.title)}" fetchpriority="high" width="1280" height="720" decoding="async"></div>
<article class="post"${ar ? ' dir="rtl"' : ""}>${upgrade ? "" : `<a class="back" href="${list}">${ar ? "→ العودة إلى المدونة" : "← Back to Blog"}</a>`}
<div class="bmeta"><span class="cat">${ar ? "دليل عملي" : "Guide"}</span><span>▣ ${upgrade ? (ar ? "آخر تحديث " : "Updated ") : ""}${dateText(upgrade ? post.updated_at || post.published_at : post.published_at, ar)}</span><span>👤 ${ar ? "فريق شركة السواتي للمقاولات" : "AL-Swati Contracting Team"}</span></div>
<h1>${esc(post.title)}</h1>${post.meta_description ? `<p class="lead">${esc(post.meta_description)}</p>` : ""}
${twinLink}
<div class="body">${md(post.body)}${related(ar)}</div>${tags ? `<div class="ptags">${tags}</div>` : ""}
<p style="margin-top:40px"><a class="link-gold" href="${ar ? "/ar/contact/" : "/contact/"}">${ar ? "→ اطلب زيارة موقع مجانية وعرض سعر" : "Request a free site visit and quote →"}</a></p></article>
</main>`;
}

function page(tpl, post, twin, upgrade = false) {
  const url = pathOf(post);
  const hs = tpl.indexOf("<head>"), he = tpl.indexOf("</head>"), ms = tpl.indexOf("<main>"), me = tpl.indexOf("</main>");
  if (hs < 0 || he < 0 || ms < 0 || me < 0) throw new Error("The post template has changed: <head> or <main> not found");
  // keep the template's charset, viewport, fonts, styles and business data; everything about the post itself is new
  const own = upgrade ? /^<(title|meta name="(description|twitter:)|link rel="(canonical|icon|apple-touch-icon)"|meta property="(og|article):)/ // an upgrade keeps the page's own hreflang pair
    : /^<(title|meta name="(description|twitter:)|link rel="(canonical|icon|alternate|apple-touch-icon)"|meta property="(og|article):)/;
  const keep = tpl.slice(hs + 6, he).split("\n").filter((l) => l.trim() && !own.test(l.trim()) && !/^<script type="application\/ld\+json">\{"@context": ?"https:\/\/schema\.org", ?"@type": ?"(BlogPosting|Article|NewsArticle|BreadcrumbList|FAQPage|HowTo)"/.test(l.trim()));
  const vp = keep.findIndex((l) => l.includes('name="viewport"'));
  keep.splice(vp + 1, 0, headBlock(post, twin, url, upgrade));
  let html = tpl.slice(0, hs + 6) + "\n" + keep.join("\n") + "\n" + tpl.slice(he, ms) + mainBlock(post, twin, upgrade) + tpl.slice(me + 7);
  // the language switch in the header goes to this article's twin when there is one
  if (twin) html = html.replace(/<a class="lang" href="[^"]*">/g, `<a class="lang" href="${pathOf(twin)}">`);
  return fixHtml(html);
}

// ───────── Riyadh district pages (Growth → District pages in the ERP) ─────────
// A published post with blog_posts.area is a district page at its own address (/stone-cladding-<district>-riyadh/ and
// /ar/stone-cladding-<district>-riyadh/), in the look of the "Stone cladding in Riyadh" page: hero with the owner's photo,
// the text, his photos, links to the other districts, LocalBusiness (GeneralContractor) + Service schema with the district's
// centre point, hreflang between the two languages, and a place in sitemap.xml. The photos are copied onto the site.
const AREA_TPL = { en: "stone-cladding-riyadh/index.html", ar: "ar/stone-cladding-riyadh/index.html" };
const AREA_IMG = "images/areas";
const hash8 = (s) => createHash("sha1").update(String(s)).digest("hex").slice(0, 10);
function jpegSize(b) { // width and height from a JPEG's frame header (so the browser keeps the space and the page does not jump)
  for (let i = 2; i + 9 < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}
// Photos get searchable names (mechanical-stone-cladding-al-malqa-riyadh-01-3f9a2c.jpg; the last part keeps a name with its
// photo when the owner reorders them) and the district's centre as GPS, marked approximate (about 1.5 km). Whatever the
// file had in it is dropped, so a phone's exact location of a client's house is never published.
// Puts a small EXIF block into a JPEG: GPS (WGS-84, with a horizontal error so readers know it is approximate),
// Artist, Copyright and a short English description. Any EXIF the file had is dropped first, so a phone's exact
// location of a client's house is never published. Works on Uint8Array (browser) and Buffer (Node).
function withGps(jpg, lat, lng, { errorM = 1500, artist = "AL-Swati Contracting", copyright = "AL-Swati Contracting", description = "" } = {}) {
  const src = jpg instanceof Uint8Array ? jpg : new Uint8Array(jpg);
  if (src[0] !== 0xff || src[1] !== 0xd8) return src;
  // no district centre: the old EXIF is still dropped, and no GPS is written
  const hasGps = Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
  const ascii = (s) => String(s || "").replace(/[^\x20-\x7e]/g, "").slice(0, 200);
  // keep every segment except existing Exif APP1 blocks; stop copying segments at the start of the image data
  const parts = [], keep = [];
  let i = 2;
  while (i + 4 <= src.length && src[i] === 0xff) {
    const m = src[i + 1];
    if (m === 0xda || m === 0xd9) break; // start of scan: the rest is image data
    const len = (src[i + 2] << 8) | src[i + 3];
    const seg = src.subarray(i, i + 2 + len);
    const isExif = m === 0xe1 && seg[4] === 0x45 && seg[5] === 0x78 && seg[6] === 0x69 && seg[7] === 0x66; // "Exif"
    if (!isExif) keep.push(seg);
    i += 2 + len;
  }
  const rest = src.subarray(i);
  // ---- the TIFF block (big-endian) ----
  const dms = (v) => { const a = Math.abs(v), d = Math.floor(a), mf = (a - d) * 60, mi = Math.floor(mf), s = Math.round((mf - mi) * 60 * 100); return [[d, 1], [mi, 1], [s, 100]]; };
  const strs = { desc: ascii(description), artist: ascii(artist), copy: ascii(copyright) };
  const ifd0 = [];
  if (strs.desc) ifd0.push({ tag: 0x010e, type: 2, str: strs.desc });
  if (strs.artist) ifd0.push({ tag: 0x013b, type: 2, str: strs.artist });
  if (strs.copy) ifd0.push({ tag: 0x8298, type: 2, str: strs.copy });
  if (hasGps) ifd0.push({ tag: 0x8825, type: 4, gps: true });
  const gps = !hasGps ? [] : [
    { tag: 0x0000, type: 1, bytes: [2, 3, 0, 0] },
    { tag: 0x0001, type: 2, str: lat >= 0 ? "N" : "S" },
    { tag: 0x0002, type: 5, rats: dms(lat) },
    { tag: 0x0003, type: 2, str: lng >= 0 ? "E" : "W" },
    { tag: 0x0004, type: 5, rats: dms(lng) },
    { tag: 0x0012, type: 2, str: "WGS-84" },
    { tag: 0x001f, type: 5, rats: [[Math.round(errorM), 1]] },
  ];
  const size = (e) => (e.str !== undefined ? e.str.length + 1 : e.rats ? e.rats.length * 8 : e.bytes ? e.bytes.length : 4);
  const count = (e) => (e.str !== undefined ? e.str.length + 1 : e.rats ? e.rats.length : e.bytes ? e.bytes.length : 1);
  const ifdLen = (n) => 2 + n * 12 + 4;
  const ifd0At = 8, gpsAt = ifd0At + ifdLen(ifd0.length);
  let dataAt = gpsAt + (gps.length ? ifdLen(gps.length) : 0);
  const extra = (list) => list.filter((e) => size(e) > 4).reduce((n, e) => n + size(e) + (size(e) & 1), 0);
  const total = dataAt + extra(ifd0) + extra(gps);
  const t = new Uint8Array(total), v = new DataView(t.buffer);
  t.set([0x4d, 0x4d, 0, 42, 0, 0, 0, ifd0At]);
  const writeIfd = (at, list) => {
    v.setUint16(at, list.length); let p = at + 2;
    for (const e of list) {
      v.setUint16(p, e.tag); v.setUint16(p + 2, e.type); v.setUint32(p + 4, count(e));
      const put = (o) => {
        if (e.str !== undefined) { for (let k = 0; k < e.str.length; k++) t[o + k] = e.str.charCodeAt(k); t[o + e.str.length] = 0; }
        else if (e.rats) e.rats.forEach(([a, b], k) => { v.setUint32(o + k * 8, a); v.setUint32(o + k * 8 + 4, b); });
        else if (e.bytes) t.set(e.bytes, o);
      };
      if (e.gps) v.setUint32(p + 8, gpsAt);
      else if (size(e) <= 4) put(p + 8);
      else { v.setUint32(p + 8, dataAt); put(dataAt); dataAt += size(e) + (size(e) & 1); }
      p += 12;
    }
    v.setUint32(p, 0); // no next IFD
  };
  writeIfd(ifd0At, ifd0); if (gps.length) writeIfd(gpsAt, gps);
  const app1Len = 2 + 6 + t.length;
  const app1 = new Uint8Array(2 + app1Len);
  app1.set([0xff, 0xe1, app1Len >> 8, app1Len & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0]); app1.set(t, 10);
  // SOI, the JFIF block if there is one, then Exif, then the other blocks and the image data
  const jfif = keep.filter((s) => s[1] === 0xe0), others = keep.filter((s) => s[1] !== 0xe0);
  const out = [new Uint8Array([0xff, 0xd8]), ...jfif, app1, ...others, rest];
  const res = new Uint8Array(out.reduce((n, a) => n + a.length, 0));
  let o = 0; for (const a of out) { res.set(a, o); o += a.length; }
  return res;
}
/** The material word for photo names: stone, marble, granite or porcelain. */
const matOf = (area) => { const s = String(area?.stone || ""); return /marble|travertine|رخام/i.test(s) ? "marble" : /granite|جرانيت/i.test(s) ? "granite" : /porcelain|بورسلان/i.test(s) ? "porcelain" : "stone"; };
/** SEO file name for a district page or case study photo: mechanical-stone-cladding-al-malqa-riyadh-01 */
function photoName(area, i) {
  const mat = matOf(area);
  const place = String(area?.district || area?.slug || "riyadh").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `mechanical-${mat}-cladding-${place && place !== "riyadh" ? place + "-" : ""}riyadh-${String(i + 1).padStart(2, "0")}`;
}
const photoFile = (post, ph, i) => `${isCase(post) ? CASE_IMG : AREA_IMG}/${post.area.slug}/${photoName(post.area, i)}-${hash8(ph.url).slice(0, 6)}.jpg`;
const photoDesc = (a) => `Mechanical ${matOf(a)} cladding${a?.district ? ", " + a.district : ""}, Riyadh - AL-Swati Contracting`;
// A big photo (a Higgsfield retouch, a phone original) is made at most 1600 px on its long side, as a JPEG, so the page stays fast.
let pillow = false;
function shrink(buf) {
  const size = buf[0] === 0xff && buf[1] === 0xd8 ? jpegSize(buf) : null;
  if (size && Math.max(size.w, size.h) <= 1600 && buf.length <= 700 * 1024) return buf;
  try {
    if (!pillow) { try { execFileSync("python3", ["-c", "import PIL"], { stdio: "ignore" }); } catch { execFileSync("python3", ["-m", "pip", "install", "--quiet", "pillow"], { stdio: "ignore" }); } pillow = true; }
    const py = "import sys,io\nfrom PIL import Image, ImageOps\nim = ImageOps.exif_transpose(Image.open(io.BytesIO(sys.stdin.buffer.read()))).convert('RGB')\nim.thumbnail((1600, 1600), Image.LANCZOS)\nb = io.BytesIO(); im.save(b, 'JPEG', quality=82, optimize=True, progressive=True); sys.stdout.buffer.write(b.getvalue())";
    return Buffer.from(execFileSync("python3", ["-c", py], { input: buf, maxBuffer: 64 << 20 }));
  } catch (e) { console.log("photo kept at full size:", e.message); return buf; }
}
// A photo keeps its file name when it is improved (straightened, retouched), and browsers keep a file by name. The short mark
// after the name changes with the picture itself, so every visitor gets the new one at once.
const photoVer = (buf) => "?v=" + createHash("sha1").update(buf).digest("hex").slice(0, 6);
async function areaPhotos(post) { // the owner's photos, copied once onto the site (both languages share them)
  const out = [];
  for (const [i, ph] of (post.area?.photos || []).entries()) {
    const f = photoFile(post, ph, i);
    let buf = await readFile(p(f)).catch(() => null);
    if (!buf) {
      const r = await fetch(ph.url).catch(() => null);
      if (!r?.ok) { console.log("photo not reachable:", ph.url, r?.status); continue; }
      buf = Buffer.from(withGps(new Uint8Array(shrink(Buffer.from(await r.arrayBuffer()))), Number(post.area.lat), Number(post.area.lng), { description: photoDesc(post.area) }));
      await mkdir(dirname(p(f)), { recursive: true }); await writeFile(p(f), buf);
    }
    out.push({ src: "/" + f + photoVer(buf), alt: ph.alt || "", size: jpegSize(buf) });
  }
  return out;
}
const placeName = (a, ar) => (ar ? a.district_ar || a.district : a.district);
const STONE_AR = { "Riyadh Limestone": "حجر الرياض", Limestone: "الحجر الجيري", Granite: "الجرانيت", Marble: "الرخام", Porcelain: "البورسلان" };
const tagLink = (href, text) => `<a href="${href}" style="border:1px solid rgba(201,167,74,.6);color:var(--gold);font-size:13px;padding:8px 14px">${esc(text)}</a>`;
function areaLinks(areas, lang, except) { // "Areas we serve": every published district page in this language
  return areas.filter((x) => x.lang === lang && pathOf(x) !== except)
    .map((x) => tagLink(pathOf(x), lang === "ar" ? (x.area.kind === "road" ? `تركيب الحجر على ${placeName(x.area, true)}` : `تركيب الحجر في ${placeName(x.area, true)}`) : `Stone cladding ${x.area.kind === "road" ? "on" : "in"} ${x.area.district}`)).join("");
}
function areasBlock(areas, lang) { // the section on the "Stone cladding in Riyadh" page that links to every district page
  const links = areaLinks(areas, lang, "");
  if (!links) return "";
  const ar = lang === "ar";
  return `<section class="bt"><div class="wrap"><div class="eyebrow">${ar ? "مناطق نخدمها" : "Areas We Serve"}</div><h2>${ar ? "تركيب الحجر في أحياء الرياض" : "Stone Cladding Across Riyadh"}</h2><div class="tags">${links}</div></div></section>`;
}
function withAreas(html, areas, lang) { // put the block between <!--erp-areas--> markers, just before </main>
  const open = "<!--erp-areas-->", close = "<!--/erp-areas-->", inner = areasBlock(areas, lang);
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a >= 0 && b > a) return inner ? html.slice(0, a + open.length) + inner + html.slice(b) : html.slice(0, a) + html.slice(b + close.length);
  if (!inner) return html;
  const m = html.lastIndexOf("</main>");
  return m < 0 ? html : html.slice(0, m) + open + inner + close + "\n" + html.slice(m);
}

function areaHead(post, twin, url, photos, business) {
  const ar = post.lang === "ar", a = post.area, brand = ar ? "شركة السواتي" : "AL-Swati";
  const title = `${post.title} | ${brand}`, desc = post.meta_description || "";
  const hero = photos[0]?.src, img = hero ? abs(hero) : abs(HAS_SHARE ? SHARE_JPG : DEFAULT_IMG);
  const alt = (lang, u) => `<link rel="alternate" hreflang="${lang}" href="${abs(u)}">`;
  const pair = twin ? [alt(post.lang, url), alt(twin.lang, pathOf(twin)), alt("x-default", post.lang === "en" ? url : pathOf(twin))] : [];
  const geo = { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng };
  const place = { "@type": "Place", name: ar ? `${placeName(a, true)}، الرياض` : `${a.district}, Riyadh`, geo, containedInPlace: { "@type": "City", name: ar ? "الرياض" : "Riyadh" } };
  const script = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u" + "003c")}</script>`;
  // the company (GeneralContractor is schema.org's LocalBusiness type for contractors), serving this district too
  const biz = business ? { ...business, areaServed: [place, ...[].concat(business.areaServed || []).filter((x) => x?.name !== place.name)] } : null;
  const service = { "@context": "https://schema.org", "@type": "Service", "@id": abs(url) + "#service", name: a.h1 || post.title,
    serviceType: ar ? "تركيب واجهات الحجر بالتثبيت الميكانيكي" : "Stone facade cladding with mechanical fixing", description: desc, url: abs(url), inLanguage: ar ? "ar" : "en",
    image: photos.length ? photos.map((x) => abs(x.src)) : [img], provider: { "@id": SITE + "/#business" }, areaServed: place,
    category: ar ? (STONE_AR[a.stone] || a.stone) : a.stone };
  const qa = faqs(post.body);
  const faq = qa.length >= 2 ? { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: ar ? "ar" : "en",
    mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) } : null;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${abs(url)}">`,
    ...pair,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${abs(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${ar ? "شركة السواتي للمقاولات" : "AL-Swati Contracting"}">`,
    `<meta property="og:locale" content="${ar ? "ar_SA" : "en_US"}">`,
    `<meta property="og:locale:alternate" content="${ar ? "en_US" : "ar_SA"}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:alt" content="${esc(photos[0]?.alt || a.h1 || post.title)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    `<link rel="icon" href="/images/logo/horizontal/dark.png">`,
    ...(hero ? [`<link rel="preload" as="image" href="${esc(hero)}" fetchpriority="high">`] : []),
    ...(biz ? [script(biz)] : []),
    script(service),
    ...(faq ? [script(faq)] : []),
    script({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: SITE + (ar ? "/ar/" : "/") },
      { "@type": "ListItem", position: 2, name: ar ? "تركيب الحجر في الرياض" : "Stone Cladding in Riyadh", item: SITE + (ar ? "/ar/stone-cladding-riyadh/" : "/stone-cladding-riyadh/") },
      { "@type": "ListItem", position: 3, name: a.h1 || post.title, item: abs(url) }] }),
  ].join("\n");
}

function areaMain(post, twin, photos, tplMain, areas, cases = []) {
  const ar = post.lang === "ar", a = post.area, url = pathOf(post), place = placeName(a, ar);
  const btns = (tplMain.match(/<div class="btns">[\s\S]*?<\/a><\/div>/) || [""])[0];
  const stats = (tplMain.match(/<div class="stats">[\s\S]*?<\/div><\/div><\/div>/) || [""])[0];
  const hero = photos[0] || { src: DEFAULT_IMG, alt: a.h1 || post.title, size: { w: 1920, h: 1248 } };
  const wh = (x) => (x.size ? ` width="${x.size.w}" height="${x.size.h}"` : "");
  const stone = ar ? STONE_AR[a.stone] || a.stone : a.stone;
  const twinLink = twin ? `<p class="twin"><a class="link-gold" href="${pathOf(twin)}" hreflang="${twin.lang}" lang="${twin.lang}">${twin.lang === "ar" ? "اقرأ هذه الصفحة بالعربية" : "Read this page in English"}</a></p>` : "";
  const gallery = photos.length ? `<section class="alt bt"><div class="wrap"><div class="eyebrow">${ar ? "من أعمالنا" : "Our Work"}</div><h2>${ar ? (a.kind === "road" ? `من أعمالنا على ${esc(place)}` : `من أعمالنا في ${esc(place)}`) : `Our Facade Work ${a.kind === "road" ? "on" : "in"} ${esc(place)}`}</h2>
<div class="area-gallery">${photos.map((x, i) => `<figure><img src="${esc(x.src)}" alt="${esc(x.alt)}"${wh(x)} loading="${i ? "lazy" : "eager"}" decoding="async"><figcaption>${esc(x.alt)}</figcaption></figure>`).join("")}</div></div></section>` : "";
  const others = cases.filter((x) => x.lang === post.lang && x.area.district === a.district).map((x) => tagLink(pathOf(x), (ar ? "مشروع: " : "Project: ") + x.title)).join("")
    + areaLinks(areas, post.lang, url) + tagLink(ar ? "/ar/stone-cladding-riyadh/" : "/stone-cladding-riyadh/", ar ? "تركيب الحجر في الرياض" : "Stone cladding in Riyadh")
    + tagLink(ar ? "/ar/marble-installation-riyadh/" : "/marble-installation-riyadh/", ar ? "تركيب الرخام في الرياض" : "Marble installation in Riyadh");
  return `<main>
<section class="hero short"><img src="${esc(hero.src)}" alt="${esc(hero.alt)}"${wh(hero)} fetchpriority="high" decoding="async">
<div class="wrap"><div class="inner"><div class="eyebrow">${esc(stone)} · ${esc(place)}${ar ? "، الرياض" : ", Riyadh"}</div><h1>${esc(a.h1 || post.title)}</h1><div class="rule"></div>${post.meta_description ? `<p>${esc(post.meta_description)}</p>` : ""}${btns}</div></div></section>${stats}
<section class="bt"><div class="wrap"><article class="post area-text"${ar ? ' dir="rtl"' : ""}>${twinLink}<div class="body">${md(post.body)}</div></article></div></section>
${gallery}
<section class="bt"><div class="wrap"><div class="eyebrow">${ar ? "مناطق نخدمها" : "Areas We Serve"}</div><h2>${ar ? "تركيب الحجر في أحياء الرياض" : "Stone Cladding Across Riyadh"}</h2><div class="tags">${others}</div></div></section>
</main>`;
}

function areaPage(tpl, post, twin, photos, areas, cases = []) { // a district page, or a case study (isCase)
  const url = pathOf(post);
  const hs = tpl.indexOf("<head>"), he = tpl.indexOf("</head>"), ms = tpl.indexOf("<main>"), me = tpl.indexOf("</main>");
  if (hs < 0 || he < 0 || ms < 0 || me < 0) throw new Error("The district page template has changed: <head> or <main> not found");
  const own = /^<(title|meta name="(description|twitter:)|link rel="(canonical|icon|alternate|apple-touch-icon|preload)"|meta property="(og|article):)/;
  let business = null;
  const keep = tpl.slice(hs + 6, he).split("\n").filter((l) => {
    const t = l.trim();
    if (!t || own.test(t)) return false;
    const ld = t.match(/^<script type="application\/ld\+json">(\{[\s\S]*\})<\/script>$/);
    if (!ld) return true;
    try { const o = JSON.parse(ld[1]); if (o["@id"] === SITE + "/#business") { business = o; return false; } } catch {}
    return false; // the stone cladding page's own FAQ, breadcrumb and service data are not this page's
  });
  const vp = keep.findIndex((l) => l.includes('name="viewport"'));
  keep.splice(vp + 1, 0, isCase(post) ? caseHead(post, twin, url, photos, business) : areaHead(post, twin, url, photos, business));
  const main = isCase(post) ? caseMain(post, twin, photos, areas, cases) : areaMain(post, twin, photos, tpl.slice(ms, me), areas, cases);
  let html = tpl.slice(0, hs + 6) + "\n" + keep.join("\n") + "\n" + tpl.slice(he, ms) + main + tpl.slice(me + 7);
  if (twin) html = html.replace(/<a class="lang" href="[^"]*">/g, `<a class="lang" href="${pathOf(twin)}">`);
  return fixHtml(html);
}


// ───────── project case studies (Projects → "Publish as SEO Case Study" in the ERP) ─────────
// A published post with area.type "case" is a case study at /projects/<slug>/ (and /ar/projects/<slug>/), in the look of the
// Projects page: hero with a site photo, a facts box (district, building, stone, scope, m², fixing system, year - or "in progress"
// when area.ongoing is set), the text and the photos. Article schema with the district as contentLocation (GeoCoordinates), a card in the Projects page grid, sitemap.xml.
const CASE_TPL = { en: "projects/index.html", ar: "ar/projects/index.html" };
const CASE_IMG = "images/cases";
const isCase = (x) => x?.area?.type === "case";
const BUILD_NAME = { villa: ["Villa", "فيلا"], compound: ["Residential compound", "مجمع سكني"], commercial: ["Commercial building", "مبنى تجاري"], tower: ["Tower", "برج"], villas: ["Villas", "فلل"], government: ["Government building", "مبنى حكومي"] };
const n0 = (v) => Number(v || 0).toLocaleString("en-US");
const casePhoto = (x) => {
  if (!x.area?.photos?.[0]) return "/images/pages/projects/hero.webp";
  const f = photoFile(x, x.area.photos[0], 0);
  try { return "/" + f + photoVer(readFileSync(p(f))); } catch { return "/" + f; }
};

function caseCards(cases, lang) { // cards in the Projects page grid (the page's own filters work on them)
  const ar = lang === "ar";
  return cases.filter((x) => x.lang === lang).map((x) => {
    const a = x.area, stone = ar ? STONE_AR[a.stone] || a.stone : a.stone;
    return `<a class="pcard" data-c="${esc(a.cat || "residential")}" href="${pathOf(x)}"><img src="${casePhoto(x)}" alt="${esc(a.photos?.[0]?.alt || x.title)}" loading="lazy" decoding="async"><span class="tag">${ar ? "دراسة حالة" : "Case Study"}</span><div class="info"><h3>${esc(x.title)}</h3><div class="meta"><span>⌖ ${esc(placeName(a, ar))}${ar ? "، الرياض" : ", Riyadh"}</span><span>▣ ${esc(a.ongoing ? (ar ? `قيد التنفيذ ${a.year}` : `In progress ${a.year}`) : a.year)}</span></div><div class="work">${esc(stone)}${a.m2 ? ` · ${n0(a.m2)} ${ar ? "م²" : "m²"}` : ""}</div></div></a>`;
  }).join("");
}
function withCases(html, cases, lang) { // the cards go first in the grid, between <!--erp-cases--> markers
  const open = "<!--erp-cases-->", close = "<!--/erp-cases-->", inner = caseCards(cases, lang);
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a >= 0 && b > a) return html.slice(0, a + open.length) + inner + html.slice(b);
  if (!inner) return html;
  const g = html.indexOf('<div class="pgrid">');
  if (g < 0) return html;
  const at = g + '<div class="pgrid">'.length;
  return html.slice(0, at) + open + inner + close + html.slice(at);
}

function caseHead(post, twin, url, photos, business) {
  const ar = post.lang === "ar", a = post.area, brand = ar ? "شركة السواتي" : "AL-Swati";
  const title = `${post.title} | ${brand}`, desc = post.meta_description || "";
  const hero = photos[0]?.src, img = hero ? abs(hero) : abs(HAS_SHARE ? SHARE_JPG : DEFAULT_IMG);
  const alt = (lang, u) => `<link rel="alternate" hreflang="${lang}" href="${abs(u)}">`;
  const pair = twin ? [alt(post.lang, url), alt(twin.lang, pathOf(twin)), alt("x-default", post.lang === "en" ? url : pathOf(twin))] : [];
  const place = { "@type": "Place", name: ar ? `${placeName(a, true)}، الرياض` : `${a.district}, Riyadh`, geo: { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng }, containedInPlace: { "@type": "City", name: ar ? "الرياض" : "Riyadh" } };
  const script = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u" + "003c")}</script>`;
  const article = { "@context": "https://schema.org", "@type": "Article", "@id": abs(url) + "#article", headline: a.h1 || post.title, description: desc, inLanguage: ar ? "ar" : "en",
    image: photos.length ? photos.map((x) => abs(x.src)) : [img], datePublished: post.published_at, dateModified: post.updated_at || post.published_at,
    author: { "@type": "Organization", name: ar ? "شركة السواتي للمقاولات" : "AL-Swati Contracting", url: SITE + "/" }, publisher: { "@id": SITE + "/#business" }, mainEntityOfPage: abs(url),
    about: { "@type": "Service", name: ar ? "تركيب واجهات الحجر بالتثبيت الميكانيكي" : "Stone facade cladding with mechanical fixing", provider: { "@id": SITE + "/#business" } },
    contentLocation: place, keywords: (post.keywords || []).join(", ") };
  const qa = faqs(post.body);
  const faq = qa.length >= 2 ? { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: ar ? "ar" : "en",
    mainEntity: qa.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) } : null;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${abs(url)}">`,
    ...pair,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${abs(url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${ar ? "شركة السواتي للمقاولات" : "AL-Swati Contracting"}">`,
    `<meta property="og:locale" content="${ar ? "ar_SA" : "en_US"}">`,
    `<meta property="og:locale:alternate" content="${ar ? "en_US" : "ar_SA"}">`,
    `<meta property="og:image" content="${esc(img)}">`,
    `<meta property="og:image:alt" content="${esc(photos[0]?.alt || a.h1 || post.title)}">`,
    `<meta property="article:published_time" content="${post.published_at}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(img)}">`,
    `<link rel="icon" href="/images/logo/horizontal/dark.png">`,
    ...(hero ? [`<link rel="preload" as="image" href="${esc(hero)}" fetchpriority="high">`] : []),
    ...(business ? [script(business)] : []),
    script(article),
    ...(faq ? [script(faq)] : []),
    script({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: ar ? "الرئيسية" : "Home", item: SITE + (ar ? "/ar/" : "/") },
      { "@type": "ListItem", position: 2, name: ar ? "مشاريعنا" : "Projects", item: SITE + (ar ? "/ar/projects/" : "/projects/") },
      { "@type": "ListItem", position: 3, name: a.h1 || post.title, item: abs(url) }] }),
  ].join("\n");
}

function caseMain(post, twin, photos, areas, cases) {
  const ar = post.lang === "ar", a = post.area, url = pathOf(post), place = placeName(a, ar), pre = ar ? "/ar" : "";
  const hero = photos[0] || { src: "/images/pages/projects/hero.webp", alt: a.h1 || post.title, size: { w: 1920, h: 900 } };
  const wh = (x) => (x.size ? ` width="${x.size.w}" height="${x.size.h}"` : "");
  const stone = ar ? STONE_AR[a.stone] || a.stone : a.stone, bn = (BUILD_NAME[a.building] || [a.building, a.building])[ar ? 1 : 0];
  const facts = [[ar ? "الموقع" : "Location", `${place}${ar ? "، الرياض" : ", Riyadh"}`], [ar ? "نوع المبنى" : "Building", bn], [ar ? "المادة" : "Stone", stone], ...(a.scope ? [[ar ? "نطاق العمل" : "Scope", a.scope]] : []),
    ...(a.m2 ? [[ar ? "مساحة الواجهات" : "Facade area", `${n0(a.m2)} ${ar ? "م²" : "m²"}`]] : []), [ar ? "نظام التثبيت" : "Fixing system", (a.fixing || []).join(ar ? "، " : ", ") || (ar ? "تثبيت ميكانيكي" : "Mechanical fixing")],
    a.ongoing ? [ar ? "الحالة" : "Status", ar ? `قيد التنفيذ (${a.year})` : `In progress (${a.year})`] : [ar ? "سنة الإنجاز" : "Completed", String(a.year)], ...(a.client ? [[ar ? "العميل" : "Client", a.client]] : [])];
  const twinLink = twin ? `<p class="twin"><a class="link-gold" href="${pathOf(twin)}" hreflang="${twin.lang}" lang="${twin.lang}">${twin.lang === "ar" ? "اقرأ هذه الصفحة بالعربية" : "Read this page in English"}</a></p>` : "";
  const gallery = photos.length ? `<section class="alt bt"><div class="wrap"><div class="eyebrow">${ar ? "صور المشروع" : "Project Photos"}</div><h2>${esc(a.h1 || post.title)}</h2>
<div class="area-gallery">${photos.map((x, i) => `<figure><img src="${esc(x.src)}" alt="${esc(x.alt)}"${wh(x)} loading="${i ? "lazy" : "eager"}" decoding="async"><figcaption>${esc(x.alt)}</figcaption></figure>`).join("")}</div></div></section>` : "";
  const district = areas.find((x) => x.lang === post.lang && x.area.district === a.district);
  const links = (district ? tagLink(pathOf(district), ar ? `تركيب الحجر في ${place}` : `Stone cladding in ${a.district}`) : "")
    + cases.filter((x) => x.lang === post.lang && pathOf(x) !== url).slice(0, 6).map((x) => tagLink(pathOf(x), x.title)).join("")
    + tagLink(pre + "/stone-cladding-riyadh/", ar ? "تركيب الحجر في الرياض" : "Stone cladding in Riyadh") + tagLink(pre + "/projects/", ar ? "جميع المشاريع" : "All projects");
  return `<main>
<section class="hero short"><img src="${esc(hero.src)}" alt="${esc(hero.alt)}"${wh(hero)} fetchpriority="high" decoding="async">
<div class="wrap"><div class="inner"><div class="eyebrow">${ar ? "دراسة حالة" : "Case Study"} · ${esc(place)}${ar ? "، الرياض" : ", Riyadh"}</div><h1>${esc(a.h1 || post.title)}</h1><div class="rule"></div>${post.meta_description ? `<p>${esc(post.meta_description)}</p>` : ""}<div class="btns"><a class="btn btn-gold" href="${pre}/contact/"><span>${ar ? "اطلب مشروعًا مماثلًا" : "Start a Similar Project"}</span><span class="arrow"></span></a><a class="btn btn-line" href="${pre}/projects/"><span>${ar ? "جميع المشاريع" : "All Projects"}</span><span class="chev"></span></a></div></div></div></section>
<section class="bt"><div class="wrap"><dl class="case-facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div></section>
<section class="bt"><div class="wrap"><article class="post area-text"${ar ? ' dir="rtl"' : ""}>${twinLink}<div class="body">${md(post.body)}</div></article></div></section>
${gallery}
<section class="bt"><div class="wrap"><div class="eyebrow">${ar ? "اقرأ أيضًا" : "More"}</div><h2>${ar ? "مشاريع وخدمات في الرياض" : "More Projects and Services in Riyadh"}</h2><div class="tags">${links}</div></div></section>
</main>`;
}

// ───────── lists and sitemap ─────────
const card = (post) => {
  const ar = post.lang === "ar", url = pathOf(post);
  return `<article class="bcard"><a href="${url}"><img src="${esc(imgOf(post))}" alt="${esc(post.image_alt || post.title)}" loading="lazy" width="1280" height="720" decoding="async"></a><div class="tx"${ar ? ' dir="rtl"' : ""}>
<div class="bmeta"><span class="cat">${ar ? "دليل عملي" : "Guide"}</span><span>▣ ${dateText(post.published_at, ar)}</span></div><h3><a href="${url}">${esc(post.title)}</a></h3><p>${esc(post.meta_description || "")}</p>
<a class="link-gold arrow" href="${url}">${ar ? "اقرأ المقال" : "Read More"} </a></div></article>`;
};
function between(html, open, close, inner, where) {
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a >= 0 && b > a) return html.slice(0, a + open.length) + inner + html.slice(b);
  const i = html.indexOf(where);
  if (i < 0) throw new Error("Place for the ERP posts not found: " + where);
  return html.slice(0, i + where.length) + open + inner + close + html.slice(i + where.length);
}
async function lists(all, areas = []) {
  for (const [file, lang] of [["blog/index.html", "en"], ["ar/blog/index.html", "ar"]]) {
    if (!(await exists(file))) continue;
    const html = await readFile(p(file), "utf8");
    const cards = all.filter((x) => x.lang === lang).map(card).join("");
    await writeFile(p(file), between(html, "<!--erp-posts-->", "<!--/erp-posts-->", cards, '<div class="bgrid">'));
  }
  if (await exists("sitemap.xml")) {
    const sm = await readFile(p("sitemap.xml"), "utf8");
    const urls = [...all, ...areas].map((post) => {
      const twin = [...all, ...areas].find((x) => x.id === post.twin_id);
      const alts = twin ? [[post.lang, pathOf(post)], [twin.lang, pathOf(twin)], ["x-default", post.lang === "en" ? pathOf(post) : pathOf(twin)]]
        .map(([l, u]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(u)}"/>`).join("") : "";
      return `<url><loc>${abs(pathOf(post))}</loc>${alts}<lastmod>${String(post.updated_at || post.published_at).slice(0, 10)}</lastmod></url>`;
    }).join("\n");
    const block = `<!--erp-posts-->\n${urls ? urls + "\n" : ""}<!--/erp-posts-->\n`;
    const a = sm.indexOf("<!--erp-posts-->"), b = sm.indexOf("<!--/erp-posts-->\n");
    const next = a >= 0 && b > a ? sm.slice(0, a) + block + sm.slice(b + "<!--/erp-posts-->\n".length) : sm.replace("</urlset>", block + "</urlset>");
    await writeFile(p("sitemap.xml"), next);
  }
}

// ───────── every page: square icon for Google, JPG share picture for WhatsApp ─────────
async function htmlFiles(dir = "") {
  const out = [];
  for (const e of await readdir(p(dir), { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "tools" || e.name === "node_modules") continue;
    const f = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await htmlFiles(f))); else if (e.name.endsWith(".html")) out.push(f);
  }
  return out;
}
let ICONS = false;
// the instant cost calculator (/stone-cladding-cost-calculator/): first in every page's Contact menu, and in the footer's quick links
const CALC = [
  ['<div class="menu"><a href="/contact/#contact-form">', '<a href="/stone-cladding-cost-calculator/"><b>Cost Calculator</b><small>Instant price &amp; timeline in SAR</small></a>',
    '<li><a href="/contact/">', '<li><a href="/stone-cladding-cost-calculator/">Cost Calculator</a></li>'],
  ['<div class="menu"><a href="/ar/contact/#contact-form">', '<a href="/ar/stone-cladding-cost-calculator/"><b>حاسبة تكلفة الحجر</b><small>تقدير فوري للسعر والمدة بالريال</small></a>',
    '<li><a href="/ar/contact/">', '<li><a href="/ar/stone-cladding-cost-calculator/">حاسبة التكلفة</a></li>'],
];
// a slim band above the footer of every page that has no calculator on it: one line and one button to the calculator
const BAND = {
  en: '<aside class="calc-band"><div class="wrap"><div><b>What will your stone facade cost?</b><span>Pick the stone, the fixing system and the area. A price range in SAR in one minute.</span></div><a class="btn btn-gold" href="/stone-cladding-cost-calculator/"><span>Open the cost calculator</span></a></div></aside>\n',
  ar: '<aside class="calc-band"><div class="wrap"><div><b>كم تكلفة واجهتك الحجرية؟</b><span>اختر الحجر ونظام التثبيت والمساحة، واحصل على نطاق السعر بالريال في دقيقة.</span></div><a class="btn btn-gold" href="/ar/stone-cladding-cost-calculator/"><span>افتح حاسبة التكلفة</span></a></div></aside>\n',
};
function withBand(h) {
  if (h.includes('class="calc-band"') || h.includes('id="estimate-form"') || !h.includes('<footer class="ftr">')) return h;
  return h.replace('<footer class="ftr">', (/<html[^>]*lang="ar/.test(h) ? BAND.ar : BAND.en) + '<footer class="ftr">');
}
function withCalc(h) {
  h = withBand(h);
  for (const [menu, link, foot, li] of CALC) {
    if (h.includes(menu) && !h.includes(link)) h = h.replace(menu, '<div class="menu">' + link + menu.slice('<div class="menu">'.length));
    if (h.includes(foot) && !h.includes(li)) h = h.replace(foot, li + foot);
  }
  return h;
}
// The spec sheet page (/technical-specs/) is part of the "For Architects & Consultants" section since 26 Nov 2026 (one menu
// entry for both): its old links are taken out of every page's Services menu and footer.
const TECH = [
  '<a href="/technical-specs/"><b>Technical Specs</b><small>For architects &amp; consultants</small></a>', '<li><a href="/technical-specs/">Technical Specs</a></li>',
  '<a href="/ar/technical-specs/"><b>المواصفات الفنية</b><small>للمهندسين والاستشاريين</small></a>', '<li><a href="/ar/technical-specs/">المواصفات الفنية</a></li>',
];
function withTech(h) {
  for (const link of TECH) h = h.split(link).join("");
  return h;
}
// the "For Architects & Consultants" section (/for-consultants/): last in every page's Services menu and the footer's Services list
const CONSULT = [
  ['<div class="dd"><a href="/services/"', '<a href="/for-consultants/"><b>For Architects &amp; Consultants</b><small>Process, fixing systems &amp; guide specification</small></a>',
    '<h4>Services</h4><ul>', '<li><a href="/for-consultants/">For Consultants</a></li>'],
  ['<div class="dd"><a href="/ar/services/"', '<a href="/ar/for-consultants/"><b>للمعماريين والاستشاريين</b><small>طريقة العمل وأنظمة التثبيت والمواصفة الإرشادية</small></a>',
    '<h4>خدماتنا</h4><ul>', '<li><a href="/ar/for-consultants/">للاستشاريين</a></li>'],
];
function withConsult(h) {
  for (const [menu, link, foot, li] of CONSULT) {
    let i = h.indexOf(menu), j;
    if (i >= 0 && !h.includes(link) && (j = h.indexOf('</div></div>', i)) > 0) h = h.slice(0, j) + link + h.slice(j);
    i = h.indexOf(foot);
    if (i >= 0 && !h.includes(li) && (j = h.indexOf('</ul>', i)) > 0) h = h.slice(0, j) + li + h.slice(j);
  }
  return h;
}
// The website's own visit counter (no cookies; see the Privacy page): every page sends one small note to the ERP's "visit"
// function when it opens, and one when the visitor presses WhatsApp, call, email or the quote form. Notes say the page,
// where the visit started (kept by the browser for this tab only), our link tag (?src=tt-…), and phone or computer -
// never the address typed, the number or the WhatsApp message. Put before </body> on every page, replaced when it changes.
const VISITS = `<!--visits--><script>(function(){try{if(navigator.webdriver)return;var E="${API}/functions/v1/visit",L=location,D=document,S=null;try{S=sessionStorage}catch(e){}
function g(k){try{return S?S.getItem(k):null}catch(e){return null}}function s(k,v){try{S&&S.setItem(k,v)}catch(e){}}
var q=new URLSearchParams(L.search),t=(q.get("src")||q.get("utm_source")||"").slice(0,60),r=D.referrer||"",h="";try{h=r?new URL(r).hostname.replace(/^www\\./,""):""}catch(e){}
var own=h==="al-swaticontracting.com";if(!g("v_l")||(h&&!own)||t){s("v_f",own?"":h);s("v_g",t);s("v_l",L.pathname)}
var m=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
function send(k){try{var b=JSON.stringify({k:k,p:L.pathname,r:h&&!own?"https://"+h:"",s:t,f:S?(g("v_f")||""):(own?"":h),g:S?(g("v_g")||""):t,l:(S&&g("v_l"))||L.pathname,m:m});if(navigator.sendBeacon&&navigator.sendBeacon(E,b))return;fetch(E,{method:"POST",body:b,keepalive:true,mode:"no-cors"})}catch(e){}}
D.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;var x=a.getAttribute("href")||"";
if(/^(https?:)?\\/\\/(wa\\.me|api\\.whatsapp\\.com|web\\.whatsapp\\.com)|^whatsapp:/i.test(x))send("whatsapp");else if(/^tel:/i.test(x))send("call");else if(/^mailto:/i.test(x))send("email")},true);
D.addEventListener("submit",function(){send("form")},true);send("view")}catch(e){}})();</script><!--/visits-->`;
function withVisits(h) {
  h = h.replace(/<!--visits-->[\s\S]*?<!--\/visits-->/g, "");
  const i = h.lastIndexOf("</body>");
  return i < 0 ? h : h.slice(0, i) + VISITS + h.slice(i);
}
/** Square icon for Google, JPG share picture for WhatsApp, the cost calculator, Technical Hub and consultants-section links, the visit counter: the same fix for every page, made or hand-written. */
function fixHtml(h) {
  h = withVisits(withConsult(withTech(withCalc(h))));
  if (ICONS) h = h.replace(/<link rel="icon" href="\/images\/logo\/horizontal\/dark\.png">/g,
    '<link rel="icon" href="/favicon.ico" sizes="48x48">\n<link rel="icon" type="image/png" sizes="192x192" href="/images/icons/icon-192.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<meta name="theme-color" content="#1a1a1a">');
  if (HAS_SHARE && /<meta property="og:image" content="[^"]+\.webp">/.test(h)) {
    h = h.replace(/<meta property="og:image" content="[^"]+\.webp">/, `<meta property="og:image" content="${SITE}${SHARE_JPG}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:type" content="image/jpeg">`);
    if (!/name="twitter:image"/.test(h)) h = h.replace(/(<meta name="twitter:card"[^>]*>)/, `$1\n<meta name="twitter:image" content="${SITE}${SHARE_JPG}">`);
  }
  return h;
}
async function fixHead() {
  let changed = 0;
  for (const f of await htmlFiles()) {
    const before = await readFile(p(f), "utf8"), h = fixHtml(before);
    if (h !== before) { await writeFile(p(f), h); changed++; }
  }
  return changed;
}

// ───────── run ─────────
HAS_SHARE = await exists(SHARE_JPG.slice(1));
ICONS = (await exists("favicon.ico")) && (await exists("images/icons/icon-192.png")) && (await exists("apple-touch-icon.png"));
const all = (await posts(process.argv[3])).filter((x) => x.slug && x.title && x.body && x.published_at);
const src = async (file) => readFile(p((await exists(`${ORIG}/${file}`)) ? `${ORIG}/${file}` : file), "utf8"); // the hand-made version, even when an upgrade replaced it
const tplEn = await src("blog/stone-cladding-vs-porcelain-riyadh/index.html");
const tplAr = await src("ar/blog/stone-installation-price-riyadh/index.html");
const mine = new Set(await readFile(p(MANIFEST), "utf8").then(JSON.parse, () => []));
const made = [], changed = [];
const areas = all.filter((x) => x.area?.slug && x.target_path && !isCase(x)); // published district pages (for the links between them)
const cases = all.filter((x) => x.area?.slug && x.target_path && isCase(x)); // published project case studies
for (const post of all) {
  const file = pathOf(post).slice(1) + "index.html", upgrade = !!post.target_path;
  if (made.includes(file)) { console.log("skip (another post already has this address):", file); continue; }
  if (post.area?.slug) { // a Riyadh district page: its own address, in the look of the stone cladding page
    if ((await exists(file)) && !mine.has(file)) { console.log("skip (a hand-made page has this address):", file); continue; }
    const lang = post.lang === "ar" ? "ar" : "en";
    let next;
    try { next = areaPage(await src((isCase(post) ? CASE_TPL : AREA_TPL)[lang]), post, [...areas, ...cases].find((x) => x.id === post.twin_id) || null, await areaPhotos(post), areas, cases); }
    catch (e) { console.log("skip:", file, e.message); continue; }
    await mkdir(dirname(p(file)), { recursive: true });
    if ((await readFile(p(file), "utf8").catch(() => "")) !== next) { await writeFile(p(file), next); changed.push(abs(pathOf(post))); }
    made.push(file); continue;
  }
  let tpl = post.lang === "ar" ? tplAr : tplEn;
  if (upgrade) { // replaces a hand-made page: keep the original once, and build on it (same header, footer, language pair)
    const orig = `${ORIG}/${file}`;
    if (!(await exists(orig))) {
      if (!(await exists(file)) || mine.has(file)) { console.log("skip (no hand-made page to upgrade at this address):", file); continue; }
      await mkdir(dirname(p(orig)), { recursive: true });
      await writeFile(p(orig), await readFile(p(file), "utf8"));
    }
    tpl = await readFile(p(orig), "utf8");
  } else if ((await exists(file)) && !mine.has(file)) { console.log("skip (a hand-made page has this address):", file); continue; }
  const twin = upgrade ? null : all.find((x) => x.id === post.twin_id) || null;
  await mkdir(dirname(p(file)), { recursive: true });
  let next;
  try { next = page(tpl, post, twin, upgrade); } catch (e) { console.log("skip:", file, e.message); continue; }
  for (const [lang, f] of Object.entries(AREA_TPL)) if (f === file) next = withAreas(next, areas, lang); // an upgraded stone cladding page keeps its district links
  for (const [lang, f] of Object.entries(CASE_TPL)) if (f === file) next = withCases(next, cases, lang); // and an upgraded projects page its case studies
  if ((await readFile(p(file), "utf8").catch(() => "")) !== next) { await writeFile(p(file), next); changed.push(abs(pathOf(post))); }
  made.push(file);
}
// pages of posts that are no longer published (unpublished or deleted in the ERP)
for (const file of mine) if (!made.includes(file)) {
  const orig = `${ORIG}/${file}`;
  if (await exists(orig)) { await writeFile(p(file), await readFile(p(orig), "utf8")); await rm(p(orig)); console.log("original page put back:", file); } // an unpublished upgrade
  else { await rm(p(dirname(file)), { recursive: true, force: true }); console.log("removed:", file); }
  changed.push(abs("/" + file.replace(/index\.html$/, "")));
}
// the "Stone cladding in Riyadh" pages link to every district page (a hand-made page: only the part between the markers changes)
for (const [lang, file] of Object.entries(AREA_TPL)) {
  if (made.includes(file) || !(await exists(file))) continue;
  const before = await readFile(p(file), "utf8"), next = withAreas(before, areas.filter((x) => made.includes(pathOf(x).slice(1) + "index.html")), lang);
  if (next !== before) { await writeFile(p(file), next); changed.push(abs("/" + file.replace(/index\.html$/, ""))); }
}
// the Projects pages show a card for every published case study (only the part between the markers changes)
for (const [lang, file] of Object.entries(CASE_TPL)) {
  if (made.includes(file) || !(await exists(file))) continue;
  const before = await readFile(p(file), "utf8"), next = withCases(before, cases.filter((x) => made.includes(pathOf(x).slice(1) + "index.html")), lang);
  if (next !== before) { await writeFile(p(file), next); changed.push(abs("/" + file.replace(/index\.html$/, ""))); }
}
// photos of district pages and case studies that are no longer published
const usedImgs = new Set([...areas, ...cases].flatMap((x) => (x.area.photos || []).map((ph, i) => photoFile(x, ph, i))));
for (const root of [AREA_IMG, CASE_IMG]) for (const dir of await readdir(p(root)).catch(() => [])) {
  const files = await readdir(p(root, dir)).catch(() => []);
  for (const f of files) if (!usedImgs.has(`${root}/${dir}/${f}`)) await rm(p(root, dir, f), { force: true });
  if (!(await readdir(p(root, dir)).catch(() => [])).length) await rm(p(root, dir), { recursive: true, force: true });
}
await writeFile(p(MANIFEST), JSON.stringify(made.sort(), null, 1) + "\n");
await writeFile(p(INDEXNOW_KEY + ".txt"), INDEXNOW_KEY);
if (changed.length) changed.push(SITE + "/blog/", SITE + "/ar/blog/", SITE + "/sitemap.xml");
await writeFile(CHANGED, [...new Set(changed)].join("\n") + (changed.length ? "\n" : ""));
const built = (x) => made.includes(pathOf(x).slice(1) + "index.html");
await lists(all.filter((x) => !x.target_path && built(x)), [...areas, ...cases].filter(built)); // upgrades keep their page's own place in the sitemap; district pages and case studies get theirs
console.log(`ERP posts on the website: ${made.length}; pages with a fixed head: ${await fixHead()}`);
// ───────── the company's Arabic name ─────────
// It is السواتي (the family is from Swat). One pass over every file of the site, the hand-made pages too, so no page keeps
// the old spelling; the pages it changes are added to the IndexNow list so the search engines read them again.
const OLD_NAME = "السواطي", NEW_NAME = "السواتي", renamed = [];
async function rename(dir) {
  for (const e of await readdir(p(dir), { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const f = dir ? dir + "/" + e.name : e.name;
    if (e.isDirectory()) await rename(f);
    else if (/\.(html|txt|xml|json|webmanifest)$/.test(e.name)) {
      const s = await readFile(p(f), "utf8");
      if (s.includes(OLD_NAME)) { await writeFile(p(f), s.split(OLD_NAME).join(NEW_NAME)); renamed.push(f); }
    }
  }
}
await rename("");
if (renamed.length) {
  const urls = renamed.filter((f) => f.endsWith("index.html") && !f.startsWith("tools/")).map((f) => abs("/" + f.replace(/index\.html$/, "")));
  const before = (await readFile(CHANGED, "utf8").catch(() => "")).split("\n").filter(Boolean);
  await writeFile(CHANGED, [...new Set([...before, ...urls])].join("\n") + "\n");
  console.log(`Arabic name updated in ${renamed.length} files`);
}
