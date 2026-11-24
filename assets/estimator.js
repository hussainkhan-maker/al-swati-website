/* AL-Swati instant stone cladding cost estimator (English and Arabic pages).
   The prices are AL-Swati's own price table: SAR per m², supply and installation with mechanical fixing in Riyadh.
   Change a price here and nowhere else (the page text under each option shows the same numbers). */
(function () {
  var PRICE = {
    material: { riyadh: [250, 350, 2], limestone: [350, 550, 4], granite: [300, 500, 4], marble: [500, 700, 4], porcelain: [250, 400, 4] }, // low, high, weeks of material delivery
    fixing: { updown: 0, rail: 50, undercut: 100 },                 // SAR per m² on top of the material
    type: { villa: [1, 0], tower: [1.1, 1], interior: [1.15, 0] },   // price factor, extra weeks (gondola or scaffolding)
    crewM2: 25, maxCrews: 4, m2PerCrew: 250, daysPerWeek: 6          // one crew installs 25 m² a day; one more crew per 250 m², up to 4
  };
  var MIN = 50, MAX = 5000, WA = '966511826313';
  // the ERP gets the choices in English, whichever language the visitor used
  var EN = { villa: 'Luxury Villa Facade', tower: 'Commercial Tower', interior: 'Interior Feature Wall', riyadh: 'Riyadh Natural Stone', limestone: 'Limestone', granite: 'Granite',
    marble: 'Polished Marble', porcelain: 'Large-Format Porcelain', updown: 'Hilti/Fischer Up-Down', rail: 'Vertical C-Channel Rail', undercut: 'Undercut System' };
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
    var m = PRICE.material[material], t = PRICE.type[type], add = PRICE.fixing[fixing];
    var perLo = Math.round((m[0] + add) * t[0] / 5) * 5, perHi = Math.round((m[1] + add) * t[0] / 5) * 5;
    var crews = Math.min(PRICE.maxCrews, Math.max(1, Math.ceil(area / PRICE.m2PerCrew)));
    var days = Math.max(1, Math.ceil(area / (PRICE.crewM2 * crews)));
    var weeks = m[2] + t[1] + days / PRICE.daysPerWeek;
    var wLo = Math.max(1, Math.ceil(weeks)), wHi = Math.max(wLo + 1, Math.ceil(weeks * 1.25));
    return { perLo: perLo, perHi: perHi, lo: round(area * perLo), hi: round(area * perHi), crews: crews, days: days, lead: m[2], setup: t[1], wLo: wLo, wHi: wHi };
  }

  var T = {
    en: {
      weeks: function (a, b) { return a + '–' + b + ' weeks'; },
      wk: function (n) { return n + (n === 1 ? ' week' : ' weeks'); },
      days: function (d, c) { return 'about ' + d + ' working ' + (d === 1 ? 'day' : 'days') + ', ' + c + (c === 1 ? ' crew' : ' crews'); },
      msg: ['Hello AL-Swati, I used the cost calculator on your website:', 'Project', 'Material', 'Fixing system', 'Area', 'Estimate', 'Timeline', 'Name', 'Mobile', 'Please send me an exact quote.'],
      sent: function (ref) { return '✓ Sent to our quotes team' + (ref ? ' (ref. ' + ref + ')' : '') + '. WhatsApp is open with your estimate; we reply within one business day.'; },
      failed: 'WhatsApp is open with your estimate. Press send there so it reaches us.',
      bad: ['Please write your name.', 'Please check your mobile number.'],
      sar: 'SAR', m2: 'm²'
    },
    ar: {
      weeks: function (a, b) { return '\u2066' + a + '–' + b + '\u2069' + (b <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      wk: function (n) { return n === 1 ? 'أسبوع واحد' : n === 2 ? 'أسبوعان' : n + (n <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      days: function (d, c) { return 'حوالي ' + d + (d >= 3 && d <= 10 ? ' أيام عمل' : ' يوم عمل') + '، ' + (c === 1 ? 'فريق واحد' : c === 2 ? 'فريقان' : c + ' فرق'); },
      msg: ['السلام عليكم، استخدمت حاسبة التكلفة في موقعكم:', 'المشروع', 'المادة', 'نظام التثبيت', 'المساحة', 'التقدير', 'المدة', 'الاسم', 'الجوال', 'أرجو إرسال عرض سعر دقيق.'],
      sent: function (ref) { return '✓ وصل تقديرك إلى فريق التسعير' + (ref ? ' (رقم ' + ref + ')' : '') + '. فتحنا لك واتساب برسالة التقدير، وسنرد خلال يوم عمل.'; },
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
      out('install').textContent = L.days(r.days, r.crews);
      var setup = f.querySelector('.est-setup'); setup.hidden = !r.setup;
      var total = r.lead + r.setup + r.days / PRICE.daysPerWeek;
      f.querySelector('.est-bar .d').style.flexGrow = r.lead / total;
      f.querySelector('.est-bar .s').style.flexGrow = r.setup / total;
      f.querySelector('.est-bar .i').style.flexGrow = (r.days / PRICE.daysPerWeek) / total;
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
