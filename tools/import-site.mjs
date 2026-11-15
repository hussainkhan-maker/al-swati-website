// One-time copy of the live website (al-swaticontracting.com, until now on Netlify) into this repository, so GitHub Pages
// can serve the very same files at the very same addresses. Reads the sitemap and every page, then every file the pages use
// (styles, scripts, images, icons). Netlify's own injected scripts are left out. Run by .github/workflows/import.yml.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE = "https://al-swaticontracting.com";
const OUT = process.argv[2] || ".";
const EXTRA = ["/", "/ar/", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/favicon.svg", "/site.webmanifest", "/manifest.json", "/manifest.webmanifest",
  "/apple-touch-icon.png", "/404.html", "/BingSiteAuth.xml", "/llms.txt", "/humans.txt", "/ads.txt", "/security.txt", "/.well-known/security.txt"];

const seen = new Set(), queue = [], saved = [], missing = [];
const add = (u) => {
  try {
    const url = new URL(u, SITE);
    if (url.origin !== SITE || url.pathname.startsWith("/.netlify/")) return;
    url.hash = ""; url.search = "";
    const k = url.pathname;
    if (!seen.has(k)) { seen.add(k); queue.push(k); }
  } catch { /* not a link */ }
};
const fileFor = (p) => {
  if (p.endsWith("/")) return p + "index.html";
  const last = p.split("/").pop();
  return last.includes(".") ? p : p + "/index.html"; // pretty URL without slash: a folder page
};

const sm = await (await fetch(SITE + "/sitemap.xml")).text();
for (const m of sm.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) add(m[1]);
EXTRA.forEach(add);

while (queue.length) {
  const p = queue.shift();
  const r = await fetch(SITE + p, { redirect: "follow" });
  if (!r.ok) { missing.push(`${r.status} ${p}`); continue; }
  const type = r.headers.get("content-type") || "";
  const buf = Buffer.from(await r.arrayBuffer());
  let file = fileFor(p);
  if (type.includes("text/html") && !file.endsWith(".html")) file = p.replace(/\/?$/, "/") + "index.html";
  let body = buf;
  if (type.includes("text/html")) {
    let html = buf.toString("utf8");
    // Netlify adds its own scripts while serving; they do not exist on any other host.
    html = html.replace(/<script\b[^>]*\/\.netlify\/[^>]*>\s*<\/script>\s*/gi, "");
    for (const m of html.matchAll(/\b(?:href|src|content|data-src|poster)\s*=\s*["']([^"']+)["']/gi)) if (/^(\/|https:\/\/al-swaticontracting\.com)/.test(m[1])) add(m[1]);
    for (const m of html.matchAll(/\b(?:srcset|imagesrcset)\s*=\s*["']([^"']+)["']/gi)) m[1].split(",").forEach((x) => add(x.trim().split(/\s+/)[0]));
    for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(m[1]);
    body = Buffer.from(html, "utf8");
  } else if (type.includes("css")) {
    const css = buf.toString("utf8");
    for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(new URL(m[1], SITE + p).href);
  } else if (type.includes("javascript")) {
    const js = buf.toString("utf8");
    for (const m of js.matchAll(/["'](\/(?:images|assets|img|fonts|media)\/[^"']+)["']/g)) add(m[1]);
  } else if (/xml|json|manifest/.test(type)) {
    for (const m of buf.toString("utf8").matchAll(/["'>](\/[^"'<\s]+\.(?:png|svg|webp|jpg|ico))["'<]/g)) add(m[1]);
  }
  const dest = join(OUT, file);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body);
  saved.push(file);
}

await writeFile(join(OUT, "CNAME"), "al-swaticontracting.com\n");
await writeFile(join(OUT, ".nojekyll"), "");
console.log(`saved ${saved.length} files`);
console.log(saved.sort().join("\n"));
if (missing.length) console.log("\nnot found (skipped):\n" + missing.join("\n"));
