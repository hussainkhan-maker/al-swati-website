// Builds the blog of al-swaticontracting.com from the posts published in the AL-Swati ERP, and keeps every page's icon and
// share picture right. Run by .github/workflows/build.yml (every 30 minutes, on demand, and when the ERP asks).
//  • every Published post gets a real page: English at /blog/<slug>/, Arabic at /ar/blog/<slug>/ (same look as the site's own posts)
//  • an English post and its Arabic twin point at each other (language switch + hreflang), so Google pairs them
//  • the blog lists, and sitemap.xml, show the ERP posts first; a post that is unpublished in the ERP disappears here too
//  • pages written by hand are never overwritten: only pages listed in tools/erp-pages.json are this tool's own -
//    except a "Boost to Top 3" upgrade the owner published for that address (blog_posts.target_path): it takes the page's
//    place, the original is kept in tools/originals/, and it comes back by itself when the upgrade is unpublished
// It needs no secret: it reads only published posts, with the app's public key (the same one the public ERP blog uses).
import { readFile, writeFile, mkdir, rm, readdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

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
  const q = "select=id,slug,lang,title,meta_description,keywords,body,published_at,updated_at,image_url,image_alt,twin_id,target_path&status=eq.Published&order=published_at.desc&limit=500";
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
  const ar = post.lang === "ar", brand = ar ? "شركة السواطي" : "AL-Swati";
  const title = `${post.title} | ${brand}`, desc = post.meta_description || "";
  const img = abs(shareImg(post)), jpg = img.endsWith(SHARE_JPG);
  const alt = (lang, u) => `<link rel="alternate" hreflang="${lang}" href="${abs(u)}">`;
  const pair = twin ? [alt(post.lang, url), alt(twin.lang, pathOf(twin)), alt("x-default", post.lang === "en" ? url : pathOf(twin))] : [];
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: desc, image: [abs(imgOf(post))],
    datePublished: post.published_at, dateModified: post.updated_at || post.published_at, inLanguage: ar ? "ar" : "en", mainEntityOfPage: abs(url),
    author: { "@type": "Organization", name: ar ? "شركة السواطي للمقاولات" : "AL-Swati Contracting", url: SITE + "/" },
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
    `<meta property="og:site_name" content="${ar ? "شركة السواطي للمقاولات" : "AL-Swati Contracting"}">`,
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
<div class="bmeta"><span class="cat">${ar ? "دليل عملي" : "Guide"}</span><span>▣ ${upgrade ? (ar ? "آخر تحديث " : "Updated ") : ""}${dateText(upgrade ? post.updated_at || post.published_at : post.published_at, ar)}</span><span>👤 ${ar ? "فريق شركة السواطي للمقاولات" : "AL-Swati Contracting Team"}</span></div>
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
async function lists(all) {
  for (const [file, lang] of [["blog/index.html", "en"], ["ar/blog/index.html", "ar"]]) {
    if (!(await exists(file))) continue;
    const html = await readFile(p(file), "utf8");
    const cards = all.filter((x) => x.lang === lang).map(card).join("");
    await writeFile(p(file), between(html, "<!--erp-posts-->", "<!--/erp-posts-->", cards, '<div class="bgrid">'));
  }
  if (await exists("sitemap.xml")) {
    const sm = await readFile(p("sitemap.xml"), "utf8");
    const urls = all.map((post) => {
      const twin = all.find((x) => x.id === post.twin_id);
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
/** Square icon for Google, JPG share picture for WhatsApp: the same fix for every page, made or hand-written. */
function fixHtml(h) {
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
for (const post of all) {
  const file = pathOf(post).slice(1) + "index.html", upgrade = !!post.target_path;
  if (made.includes(file)) { console.log("skip (another post already has this address):", file); continue; }
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
await writeFile(p(MANIFEST), JSON.stringify(made.sort(), null, 1) + "\n");
await writeFile(p(INDEXNOW_KEY + ".txt"), INDEXNOW_KEY);
if (changed.length) changed.push(SITE + "/blog/", SITE + "/ar/blog/", SITE + "/sitemap.xml");
await writeFile(CHANGED, [...new Set(changed)].join("\n") + (changed.length ? "\n" : ""));
await lists(all.filter((x) => !x.target_path && made.includes(pathOf(x).slice(1) + "index.html"))); // upgrades keep their page's own place in the sitemap
console.log(`ERP posts on the website: ${made.length}; pages with a fixed head: ${await fixHead()}`);
