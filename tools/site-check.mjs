// Site check for the Website Doctor agent: reads the built website in this repository (no network) and lists what is
// wrong, page by page. Run: node tools/site-check.mjs [repo folder] > report.json
// Checks every page in sitemap.xml: the file exists; title, description, one H1, canonical, hreflang twin; images have
// alt text and exist; every internal link and asset points to a real file; JSON-LD parses; Arabic spelling of the company.
import { readFile, access, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.argv[2] || ".";
const SITE = "https://al-swaticontracting.com";
const p = (...a) => join(ROOT, ...a);
const exists = (f) => access(p(f)).then(() => true, () => false);
const fileOf = (path) => { const s = decodeURIComponent(path.split(/[?#]/)[0]).replace(/^\/+/, ""); return !s || s.endsWith("/") ? s + "index.html" : /\.[a-z0-9]+$/i.test(s) ? s : s + "/index.html"; };
const text = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

const sm = await readFile(p("sitemap.xml"), "utf8");
const urls = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()))];
const pages = [], known = new Map();
let problems = 0;
for (const url of urls) {
  const path = url.replace(SITE, "") || "/", file = fileOf(path), issues = [];
  const add = (level, what) => { issues.push({ level, what }); problems++; };
  if (!(await exists(file))) { add("bad", "page file missing"); pages.push({ url, issues }); continue; }
  const h = await readFile(p(file), "utf8"), ar = path.startsWith("/ar/") || path === "/ar";
  const title = (h.match(/<title>([^<]*)<\/title>/i) || [])[1] || "";
  const desc = (h.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1] || "";
  const h1s = (h.match(/<h1[\s>]/gi) || []).length;
  if (!title) add("bad", "no <title>"); else if (title.length > 70) add("warn", `title is ${title.length} characters (Google shows about 60)`);
  if (!desc) add("bad", "no meta description"); else if (desc.length < 70 || desc.length > 170) add("warn", `meta description is ${desc.length} characters (best 120-160)`);
  if (h1s !== 1) add(h1s ? "warn" : "bad", `${h1s} H1 headings (should be 1)`);
  if (!/<link\s+rel="canonical"/i.test(h)) add("warn", "no canonical link");
  const alts = [...h.matchAll(/<link\s+rel="alternate"\s+hreflang="(ar|en)"\s+href="([^"]+)"/gi)];
  for (const [, , href] of alts) if (href.startsWith(SITE) && !(await exists(fileOf(href.replace(SITE, ""))))) add("bad", `hreflang page missing: ${href}`);
  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0], src = (tag.match(/\ssrc="([^"]+)"/) || [])[1] || "", alt = (tag.match(/\salt="([^"]*)"/) || [null, null])[1];
    if (alt === null || !alt.trim()) add("warn", `image without alt text: ${src}`);
    if (src.startsWith("/") && !(await exists(fileOf(src)))) add("bad", `image missing: ${src}`);
  }
  for (const m of h.matchAll(/\s(?:href|src)="(\/[^"#?]*)[^"]*"/gi)) {
    const link = m[1];
    if (link.startsWith("//")) continue;
    if (!known.has(link)) known.set(link, await exists(fileOf(link)));
    if (!known.get(link)) add("bad", `broken internal link: ${link}`);
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) { try { JSON.parse(m[1]); } catch { add("bad", "JSON-LD (Google data) does not parse"); } }
  if (ar && /السواطي/.test(h)) add("bad", "Arabic company name spelled السواطي (must be السواتي)");
  if (ar && /تكسية|تكسيات/.test(text(h))) add("warn", "Arabic text says تكسية (Saudi clients search تركيب)");
  const words = text(h).split(" ").length;
  if (words < 300) add("warn", `only ${words} words on the page`);
  const kb = Math.round((await stat(p(file))).size / 1024);
  pages.push({ url, title, words, kb, issues });
}
const orphans = [];
for (const f of ["blog/index.html", "projects/index.html", "ar/blog/index.html", "ar/projects/index.html"]) if (!(await exists(f))) orphans.push(f);
console.log(JSON.stringify({ checked_at: new Date().toISOString(), page_count: pages.length, problems, missing_main_pages: orphans,
  bad: pages.flatMap((x) => x.issues.filter((i) => i.level === "bad").map((i) => ({ url: x.url, ...i }))),
  warn: pages.flatMap((x) => x.issues.filter((i) => i.level === "warn").map((i) => ({ url: x.url, ...i }))),
  pages: pages.map(({ url, title, words, kb, issues }) => ({ url, title, words, kb, issues: issues.length })) }, null, 1));
