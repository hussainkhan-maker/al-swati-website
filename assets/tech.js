/* AL-Swati Technical Hub (/technical-specs/ and /ar/technical-specs/): spec sheet as PDF (print) or CSV,
   the mechanical vs wet fixing chart, and the CAD (.DWG) / method statement request, which goes into the ERP (Queries). */
(function () {
  var ar = document.documentElement.lang === 'ar';
  // the same public address and key as assets/main.js
  var ERP = 'https://keweaoogdnxietvyerhj.supabase.co/functions/v1/seo',
    KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtld2Vhb29nZG54aWV0dnllcmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTM5MjIsImV4cCI6MjEwOTYyOTkyMn0.KXMRTzdJVvtWSwaiRou6OQbU1AjJUtir_643diGPSBM';
  function erp(body) { return fetch(ERP, { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify(body) }); }
  var utm = (location.search.match(/utm_[a-z]+=[^&]+/g) || []).join('&');
  var txt = function (el) { return el.textContent.replace(/[⁦-⁩]/g, '').replace(/\s+/g, ' ').trim(); };

  // spec sheet: Save as PDF prints only the sheet (with a company header); CSV opens in Excel (UTF-8 with BOM, so Arabic shows)
  var sheet = document.getElementById('spec-sheet');
  if (sheet) {
    var day = sheet.querySelector('.tc-date');
    var pdf = document.querySelector('.tc-pdf'), csv = document.querySelector('.tc-csv');
    if (pdf) pdf.addEventListener('click', function () {
      if (day) day.textContent = new Date().toLocaleDateString(ar ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      window.print();
    });
    if (csv) csv.addEventListener('click', function () {
      var q = function (s) { return '"' + s.replace(/"/g, '""') + '"'; }, lines = [];
      lines.push(q(txt(sheet.querySelector('.tc-print-head b'))));
      lines.push(q('https://al-swaticontracting.com' + location.pathname));
      sheet.querySelectorAll('table').forEach(function (t) {
        lines.push('');
        lines.push(q(txt(t.querySelector('caption'))));
        t.querySelectorAll('tr').forEach(function (tr) {
          lines.push([].map.call(tr.children, function (c) { return q(txt(c)); }).join(','));
        });
      });
      var blob = new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = ar ? 'al-swati-stone-facade-specs-ar.csv' : 'al-swati-stone-facade-specs.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
  }

  // comparison chart: each row opens to say why
  document.querySelectorAll('.tc-row').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true', d = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (d) d.hidden = !open;
    });
  });

  // request form: name, company and a mobile or email, into Queries as "Technical request: …"
  var f = document.getElementById('tech-form');
  if (!f) return;
  var M = {}; try { M = JSON.parse(f.getAttribute('data-msgs')); } catch (e) {}
  var hp = document.createElement('input'); hp.name = 'hp'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
  hp.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none'; f.style.position = 'relative'; f.appendChild(hp);
  var note = f.querySelector('.est-note'), btn = f.querySelector('.tc-send');
  var val = function (n) { var x = f.querySelector('[name=' + n + ']'); return x ? x.value.trim() : ''; };
  function bad(msg, name) {
    note.textContent = msg; note.className = 'est-note tc-bad';
    var x = name && f.querySelector('[name=' + name + ']'); if (x) { x.setAttribute('aria-invalid', 'true'); x.focus(); }
  }
  f.addEventListener('input', function (e) { if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    f.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
    var name = val('name'), company = val('company'), phone = val('phone'), email = val('email');
    var docs = [].map.call(f.querySelectorAll('input[name=docs]:checked'), function (x) { return x.value; });
    if (name.length < 2) return bad(M.name, 'name');
    if (company.length < 2) return bad(M.company, 'company');
    if (!phone && !email) return bad(M.contact, 'phone');
    if (phone && (!/^[+\d\s()\-]{7,22}$/.test(phone) || phone.replace(/\D/g, '').length < 9)) return bad(M.phone, 'phone');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(M.email, 'email');
    if (!docs.length) return bad(M.docs, '');
    var role = val('role'), system = val('system'), project = val('project');
    var msg = 'Technical request from the website Technical Hub (' + (ar ? 'Arabic' : 'English') + ' page).\n'
      + 'Needs: ' + docs.join(', ') + '\n'
      + 'Company: ' + company + (role ? ' (' + role + ')' : '') + '\n'
      + 'Fixing system: ' + (system || 'not decided yet') + '\n'
      + 'Project: ' + (project || '-');
    btn.disabled = true; note.className = 'est-note'; note.textContent = M.sending;
    erp({ action: 'lead', name: name, phone: phone, email: email, company: company, role: role, docs: docs, system: system, project: project,
      projectType: ('Technical: ' + docs.join(' + ')).slice(0, 60), message: msg, hp: hp.value,
      page: location.pathname, lang: ar ? 'ar' : 'en', ref: document.referrer, utm: utm })
      .then(function (res) { return res.json().then(function (j) { if (!res.ok || j.error) throw new Error(j.error || res.status); return j; }); })
      .then(function (j) {
        note.className = 'est-note tc-ok';
        note.textContent = M.sent.replace('{ref}', j.ref ? M.ref.replace('{r}', j.ref) : '');
        f.querySelectorAll('input:not([type=checkbox]):not([name=hp])').forEach(function (x) { x.value = ''; });
      })
      .catch(function () { note.className = 'est-note tc-bad'; note.textContent = M.failed; })
      .then(function () { btn.disabled = false; });
  });
})();
