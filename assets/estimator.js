/* AL-Swati instant stone cladding cost estimator (English and Arabic pages).
   AL-Swati's own rates (owner, 24 Nov 2026), SAR per m² without VAT: stone + installation + fixing accessories + scaffolding,
   then 5% engineer and supervisor, then 15% overhead and profit. The price tables on the pages show the same results. */
(function () {
  var PRICE = {
    stone: { white: [70, 100, 2], limestone: [120, 180, 2], granite: [100, 150, 4], travertine: [300, 450, 4], porcelain: [100, 150, 4] }, // stone only: low, high, weeks of delivery
    fixing: { updown: [100, 10, 20], rail: [150, 60, 80], kerf: [200, 120, 140], undercut: [200, 160, 180] }, // installation, accessories low, high
    type: { villa: [10, 10, 0], tower: [25, 30, 1], interior: [10, 10, 0] },  // scaffolding low, high (normal 10, safety 25–30), weeks to put it up
    supervision: 0.05, overhead: 0.15,                                         // engineer and supervisor; overhead and profit
    teamM2: [6, 8], maxTeams: 4, m2PerTeam: 100, daysPerWeek: 6               // a mason and a helper install 6–8 m² a day; one more team per 100 m², up to 4
  };
  PRICE.stone.riyadh = PRICE.stone.white; PRICE.stone.marble = PRICE.stone.travertine; // option names on pages saved before 24 Nov 2026
  var MIN = 50, MAX = 5000, WA = '966511826313';
  // the ERP gets the choices in English, whichever language the visitor used
  var EN = { villa: 'Luxury Villa Facade', tower: 'Commercial Tower', interior: 'Interior Feature Wall', white: 'Riyadh White Stone', limestone: 'Riyadh Limestone (Beige/Yellow)',
    granite: 'Granite', travertine: 'Travertine Marble', riyadh: 'Riyadh White Stone', marble: 'Travertine Marble', porcelain: 'Large-Format Porcelain', updown: 'Up-Down brackets', rail: 'Vertical C-Channel Rail', kerf: 'Kerf Rail System', undercut: 'Undercut System' };
  // the same public address and key as assets/main.js: estimates go into the ERP (Queries) like the quote form
  var ERP = 'https://keweaoogdnxietvyerhj.supabase.co/functions/v1/seo',
    KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtld2Vhb29nZG54aWV0dnllcmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTM5MjIsImV4cCI6MjEwOTYyOTkyMn0.KXMRTzdJVvtWSwaiRou6OQbU1AjJUtir_643diGPSBM';
  function erp(body) { return fetch(ERP, { method: 'POST', keepalive: true, headers: { 'content-type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY }, body: JSON.stringify(body) }); }
  var utm = (location.search.match(/utm_[a-z]+=[^&]+/g) || []).join('&'), counted = false;

  // area slider: 50 to 5,000 m² on an even ratio scale, so villa sizes are as easy to pick as towers
  function toArea(v) { var a = MIN * Math.pow(MAX / MIN, v / 1000); return snap(a); }
  function toSlider(a) { return Math.round(1000 * Math.log(a / MIN) / Math.log(MAX / MIN)); }
  function snap(a) { var s = a < 200 ? 10 : a < 1000 ? 25 : 50; return Math.min(MAX, Math.max(MIN, Math.round(a / s) * s)); }
  function n0(x) { return Math.round(x).toLocaleString('en-US'); }
  function round(x) { var s = x < 50000 ? 500 : 1000; return Math.round(x / s) * s; }

  function calc(type, material, fixing, area) {
    var s = PRICE.stone[material], f = PRICE.fixing[fixing], t = PRICE.type[type], k = (1 + PRICE.supervision) * (1 + PRICE.overhead);
    var perLo = Math.round((s[0] + f[0] + f[1] + t[0]) * k / 5) * 5, perHi = Math.round((s[1] + f[0] + f[2] + t[1]) * k / 5) * 5;
    var teams = Math.min(PRICE.maxTeams, Math.max(1, Math.ceil(area / PRICE.m2PerTeam)));
    var dLo = Math.max(1, Math.ceil(area / (PRICE.teamM2[1] * teams))), dHi = Math.max(dLo, Math.ceil(area / (PRICE.teamM2[0] * teams)));
    var before = s[2] + t[2], wLo = Math.max(1, Math.round(before + dLo / PRICE.daysPerWeek)), wHi = Math.max(wLo + 1, Math.ceil(before + dHi / PRICE.daysPerWeek));
    return { perLo: perLo, perHi: perHi, lo: round(area * perLo), hi: round(area * perHi), teams: teams, dLo: dLo, dHi: dHi, lead: s[2], setup: t[2], wLo: wLo, wHi: wHi };
  }

  var T = {
    en: {
      weeks: function (a, b) { return a + '–' + b + ' weeks'; },
      wk: function (n) { return n + (n === 1 ? ' week' : ' weeks'); },
      days: function (a, b, c) { return 'about ' + (a === b ? a : a + '–' + b) + ' working days, ' + c + (c === 1 ? ' team' : ' teams'); },
      msg: ['Hello AL-Swati, I used the cost calculator on your website:', 'Project', 'Material', 'Fixing system', 'Area', 'Estimate (excl. VAT)', 'Timeline', 'Name', 'Mobile', 'Please send me an exact quote.'],
      sent: function (ref) { return '✓ Sent to our quotes team' + (ref ? ' (ref. ' + ref + ')' : '') + '. WhatsApp is open with your estimate. We will reply as soon as possible.'; },
      failed: 'WhatsApp is open with your estimate. Press send there so it reaches us.',
      bad: ['Please write your name.', 'Please check your mobile number.'],
      sar: 'SAR', m2: 'm²'
    },
    ar: {
      weeks: function (a, b) { return '\u2066' + a + '–' + b + '\u2069' + (b <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      wk: function (n) { return n === 1 ? 'أسبوع واحد' : n === 2 ? 'أسبوعان' : n + (n <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      days: function (a, b, c) { return 'حوالي ' + (a === b ? a : '\u2066' + a + '–' + b + '\u2069') + ' يوم عمل، ' + (c === 1 ? 'فريق واحد' : c === 2 ? 'فريقان' : c + ' فرق'); },
      msg: ['السلام عليكم، استخدمت حاسبة التكلفة في موقعكم:', 'المشروع', 'المادة', 'نظام التثبيت', 'المساحة', 'التقدير (بدون الضريبة)', 'المدة', 'الاسم', 'الجوال', 'أرجو إرسال عرض سعر دقيق.'],
      sent: function (ref) { return '✓ وصل تقديرك إلى فريق التسعير' + (ref ? ' (رقم ' + ref + ')' : '') + '. فتحنا لك واتساب برسالة التقدير، وسنرد عليكم في أقرب وقت.'; },
      failed: 'فتحنا لك واتساب برسالة التقدير، اضغط إرسال هناك ليصلنا.',
      bad: ['اكتب اسمك من فضلك.', 'تحقق من رقم الجوال من فضلك.'],
      sar: 'ريال', m2: 'م²'
    }
  };

  document.querySelectorAll('form.est').forEach(function (f) {
    var ar = (f.closest('[lang]') || document.documentElement).getAttribute('lang') === 'ar', L = T[ar ? 'ar' : 'en'];
    var range = f.querySelector('input[type=range]'), num = f.querySelector('input[name=area]');
    var out = function (k) { return f.querySelector('[data-o=' + k + ']'); };
    var hp = document.createElement('input'); hp.name = 'hp'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none'; f.appendChild(hp);
    var last = null;

    function pick(name) { var x = f.querySelector('input[name=' + name + ']:checked'); return x ? x.value : ''; }
    function label(name) { var x = f.querySelector('input[name=' + name + ']:checked'); return x ? x.parentNode.querySelector('b').textContent : ''; }
    function area() { var a = parseInt(String(num.value).replace(/[^\d]/g, ''), 10); return isNaN(a) ? 500 : Math.min(MAX, Math.max(MIN, a)); }

    function show() {
      var a = area(), r = calc(pick('type'), pick('material'), pick('fixing'), a);
      out('lo').textContent = n0(r.lo); out('hi').textContent = n0(r.hi);
      out('per').textContent = n0(r.perLo) + '–' + n0(r.perHi);
      out('weeks').textContent = L.weeks(r.wLo, r.wHi);
      out('lead').textContent = L.wk(r.lead);
      out('install').textContent = L.days(r.dLo, r.dHi, r.teams);
      var setup = f.querySelector('.est-setup'); setup.hidden = !r.setup;
      var inst = (r.dLo + r.dHi) / 2 / PRICE.daysPerWeek, total = r.lead + r.setup + inst;
      f.querySelector('.est-bar .d').style.flexGrow = r.lead / total;
      f.querySelector('.est-bar .s').style.flexGrow = r.setup / total;
      f.querySelector('.est-bar .i').style.flexGrow = inst / total;
      out('summary').textContent = [label('type'), label('material'), label('fixing'), n0(a) + ' ' + L.m2].join(' · ');
      last = { r: r, a: a };
      f.querySelector('.est-chat').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text('', ''));
    }
    function text(name, phone) {
      var r = last.r, M = L.msg;
      return M[0] + '\n' + M[1] + ': ' + label('type') + '\n' + M[2] + ': ' + label('material') + '\n' + M[3] + ': ' + label('fixing') + '\n' +
        M[4] + ': ' + n0(last.a) + ' ' + L.m2 + '\n' + M[5] + ': ' + (ar ? '\u2066' + n0(r.lo) + ' – ' + n0(r.hi) + '\u2069 ' + L.sar + ' (\u2066' + n0(r.perLo) + '–' + n0(r.perHi) + '\u2069 ' + L.sar + '/' + L.m2 + ')'
          : L.sar + ' ' + n0(r.lo) + ' – ' + n0(r.hi) + ' (' + n0(r.perLo) + '–' + n0(r.perHi) + ' ' + L.sar + '/' + L.m2 + ')') + '\n' +
        M[6] + ': ' + L.weeks(r.wLo, r.wHi) + (name ? '\n' + M[7] + ': ' + name : '') + (phone ? '\n' + M[8] + ': ' + phone : '') + '\n' + M[9];
    }
    function used() { // one "calculator used" count per page view, after the visitor changes something
      if (counted) return; counted = true;
      try { erp({ action: 'event', kind: 'estimate', page: location.pathname, lang: ar ? 'ar' : 'en', ref: document.referrer, utm: utm }); } catch (e) {}
    }

    range.addEventListener('input', function () { num.value = toArea(+range.value); show(); used(); });
    num.addEventListener('input', function () { if (num.value) { range.value = toSlider(area()); show(); } });
    num.addEventListener('change', function () { num.value = area(); range.value = toSlider(area()); show(); used(); });
    f.querySelectorAll('input[type=radio]').forEach(function (x) { x.addEventListener('change', function () { show(); used(); }); });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.querySelector('[name=name]').value.trim(), phone = f.querySelector('[name=phone]').value.trim(), note = f.querySelector('.est-note');
      if (name.length < 2) { note.textContent = L.bad[0]; f.querySelector('[name=name]').focus(); return; }
      if (!/^[+\d\s()\-]{7,22}$/.test(phone) || phone.replace(/\D/g, '').length < 9) { note.textContent = L.bad[1]; f.querySelector('[name=phone]').focus(); return; }
      var r = last.r, msg = text(name, phone), wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), btn = f.querySelector('.est-send');
      var est = { type: EN[pick('type')], material: EN[pick('material')], fixing: EN[pick('fixing')], area: last.a, lo: r.lo, hi: r.hi, weeks: r.wLo + '-' + r.wHi };
      btn.disabled = true; note.textContent = ar ? 'جارٍ الإرسال…' : 'Sending…';
      var req = erp({ action: 'lead', name: name, phone: phone, projectType: 'Cost calculator: ' + est.type, message: msg, estimate: est, hp: hp.value,
        page: location.pathname, lang: ar ? 'ar' : 'en', ref: document.referrer, utm: utm });
      var w = window.open(wa, '_blank'); // opened straight from the tap, so phones do not block it
      if (w) try { w.opener = null; } catch (x) {}
      req.then(function (res) { return res.json().then(function (j) { if (!res.ok || j.error) throw new Error(j.error || res.status); return j; }); })
        .then(function (j) { note.textContent = L.sent(j.ref); })
        .catch(function () { note.textContent = L.failed; })
        .then(function () { btn.disabled = false; if (!w) location.href = wa; });
    });

    num.value = area(); range.value = toSlider(area()); show();
  });
})();
