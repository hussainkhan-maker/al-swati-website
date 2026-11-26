# al-swati-website
al-swaticontracting.com website (GitHub Pages). Blogposts published from the AL-Swati ERP.

## For Architects & Consultants section (draft)
`/for-consultants/` and `/ar/for-consultants/` (nine pages each) are hand-made pages built from `tools/consultants/content_en.py` and
`content_ar.py` by `python3 tools/consultants/build.py` (header and footer are copied from the Technical Specs pages; the sitemap block
between `<!--consultants-->` markers is rewritten). Downloads in `/downloads/`: `python3 tools/consultants/make_docx.py` (guide
specification) and `node tools/consultants/make_pdf.cjs` (maintenance guide, English and Arabic). The "Send us your drawings" form posts
through `assets/main.js` to the same ERP lead endpoint as the quote form. `build-site.mjs` adds the section's menu and footer link to every page.
