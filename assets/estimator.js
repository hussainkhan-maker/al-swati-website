/* AL-Swati instant stone cladding cost estimator (English and Arabic pages).
   AL-Swati's own rates (owner, 24 Nov 2026), SAR per m² without VAT: stone + installation + fixing accessories + scaffolding,
   then 5% engineer and supervisor, then 15% overhead and profit. The price tables on the pages show the same results. */
(function () {
  var PRICE = {
    stone: { white: [70, 100, 2], limestone: [120, 180, 2], granite: [100, 150, 4], travertine: [300, 450, 4], porcelain: [100, 150, 4] }, // stone only: low, high, weeks of delivery
    fixing: { updown: [100, 10, 20], rail: [150, 60, 80], kerf: [200, 120, 140], undercut: [200, 160, 180] }, // installation, accessories low, high
    type: { villa: [10, 10, 0], building: [10, 10, 0], tower: [25, 30, 1] },  // scaffolding low, high (normal 10, safety 25–30), weeks to put it up
    supervision: 0.05, overhead: 0.15,                                         // engineer and supervisor; overhead and profit
    teamM2: [6, 8], maxTeams: 4, m2PerTeam: 100, daysPerWeek: 6               // a mason and a helper install 6–8 m² a day; one more team per 100 m², up to 4
  };
  PRICE.stone.riyadh = PRICE.stone.white; PRICE.stone.marble = PRICE.stone.travertine; // option names on pages saved before 24 Nov 2026
  var MIN = 50, MAX = 5000, WA = '966511826313';
  // the ERP gets the choices in English, whichever language the visitor used
  var EN = { villa: 'Luxury Villa Facade', tower: 'Commercial Tower', building: 'Building', white: 'Riyadh White Stone', limestone: 'Riyadh Limestone (Beige/Yellow)',
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

  // panel size: larger stones cost more per m² (owner, 27 Nov 2026: 30×60 is the base, 40×80 +10–15, 60×120 +20–25 SAR per m²).
  // Porcelain comes large-format as standard, so the size step is hidden for it.
  var SIZE = { '3060': [0, 0, 30, 60], '4080': [10, 15, 40, 80], '60120': [20, 25, 60, 120] };
  // shop drawings with calculation and approval: 3,000 SAR a set; the engineer's site visit: 500 SAR a week of installation
  // (owner, 27 Nov 2026); sold at cost + 15%, then the sponsor's 5% of the bill.
  var ENG = { set: 3000, visit: 500, k: 1.15 / 0.95 };
  // steel frame behind the stone, the owner's own selling rates per m² (27 Nov 2026): supply and installation in 2 mm sections, or
  // installation only when the client supplies the steel. Branded anchors (Hilti, Fischer) are quoted with the project.
  var FRAME = { none: 0, supply: 250, install: 125 };
  EN.none = 'None'; EN.supply = 'Steel frame: supply and installation'; EN.install = 'Steel frame: installation only';
  var IMG = { white: 'stone-limestone-white', limestone: 'stone-limestone-beige', granite: 'stone-granite', travertine: 'stone-travertine', porcelain: 'stone-porcelain', riyadh: 'stone-limestone-white', marble: 'stone-travertine' };
  EN['3060'] = '30 x 60 cm'; EN['4080'] = '40 x 80 cm'; EN['60120'] = '60 x 120 cm';

  function calc(type, material, fixing, size, area, eng, frame) {
    var s = PRICE.stone[material], f = PRICE.fixing[fixing], t = PRICE.type[type], k = (1 + PRICE.supervision) * (1 + PRICE.overhead);
    var up = material === 'porcelain' ? SIZE['3060'] : (SIZE[size] || SIZE['3060']);
    var sLo = s[0] + up[0], sHi = s[1] + up[1], fLo = f[0] + f[1], fHi = f[0] + f[2];
    var fr = FRAME[frame] || 0;
    var perLo = Math.round((sLo + fLo + t[0]) * k / 5) * 5 + fr, perHi = Math.round((sHi + fHi + t[1]) * k / 5) * 5 + fr;
    var teams = Math.min(PRICE.maxTeams, Math.max(1, Math.ceil(area / PRICE.m2PerTeam)));
    var dLo = Math.max(1, Math.ceil(area / (PRICE.teamM2[1] * teams))), dHi = Math.max(dLo, Math.ceil(area / (PRICE.teamM2[0] * teams)));
    var before = s[2] + t[2], wLo = Math.max(1, Math.round(before + dLo / PRICE.daysPerWeek)), wHi = Math.max(wLo + 1, Math.ceil(before + dHi / PRICE.daysPerWeek));
    var eLo = 0, eHi = 0;
    if (eng) {
      eLo = Math.round((ENG.set + ENG.visit * Math.max(1, Math.ceil(dLo / PRICE.daysPerWeek))) * ENG.k / 100) * 100;
      eHi = Math.round((ENG.set + ENG.visit * Math.max(1, Math.ceil(dHi / PRICE.daysPerWeek))) * ENG.k / 100) * 100;
    }
    var lo = round(area * perLo), hi = round(area * perHi), all = sLo + sHi + fLo + fHi + t[0] + t[1], mid = (lo + hi) / 2 - area * fr;
    return { perLo: perLo, perHi: perHi, lo: round(lo + eLo), hi: round(hi + eHi), teams: teams, dLo: dLo, dHi: dHi, lead: s[2], setup: t[2], wLo: wLo, wHi: wHi,
      a: mid * (sLo + sHi) / all, b: mid * (fLo + fHi) / all, c: mid * (t[0] + t[1]) / all, f: area * fr, e: (eLo + eHi) / 2, eLo: eLo, eHi: eHi };
  }

  // the wall as it will look from the front, 3.6 m wide: the stone, the joints of the chosen panel size, and the fixings in gold
  function wall(material, size, fixing, m) {
    var W = 360, H = 170, d = material === 'porcelain' ? SIZE['60120'] : (SIZE[size] || SIZE['3060']), ph = d[2], pw = d[3], stack = material === 'porcelain';
    var tint = '', joints = '', marks = '', row = 0, y, x, c, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (y = 0; y < H; y += ph, row++) {
      var off = !stack && row % 2 ? -pw / 2 : 0;
      joints += 'M0 ' + y + 'H' + W;
      if (fixing === 'kerf') marks += 'M0 ' + y + 'H' + W;
      for (x = off, c = 0; x < W; x += pw, c++) {
        var v = rnd();
        tint += '<rect x="' + x + '" y="' + y + '" width="' + pw + '" height="' + ph + '" fill="' + (v > .5 ? '#fff' : '#000') + '" opacity="' + (Math.abs(v - .5) * .16).toFixed(3) + '"/>';
        joints += 'M' + x + ' ' + y + 'V' + (y + ph);
        if (fixing === 'updown' || fixing === 'rail') marks += 'M' + (x + pw * .25) + ' ' + (y - 2.8) + 'v5.6M' + (x + pw * .75) + ' ' + (y - 2.8) + 'v5.6';
        if (fixing === 'undercut') [[.2, .25], [.8, .25], [.2, .75], [.8, .75]].forEach(function (p) { marks += 'M' + (x + pw * p[0] - 1.6) + ' ' + (y + ph * p[1]) + 'a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0'; });
      }
    }
    var rails = '';
    if (fixing === 'rail') for (x = pw / 4; x < W; x += pw / 2) rails += 'M' + x + ' 0V' + H;
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">' +
      '<image href="/images/stones/' + IMG[material] + '.jpg" width="' + W + '" height="' + H + '" preserveAspectRatio="xMidYMid slice"/>' + tint +
      '<path d="' + joints + '" fill="none" stroke="#2a2118" stroke-opacity=".62" stroke-width=".9"/>' +
      (rails ? '<path d="' + rails + '" fill="none" stroke="#2c230c" stroke-opacity=".55" stroke-width="3.2"/><path d="' + rails + '" fill="none" stroke="#e6c35c" stroke-width="1.5" stroke-dasharray="7 5"/>' : '') +
      (marks ? '<path d="' + marks + '" fill="none" stroke="#2c230c" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/><path d="' + marks + '" fill="none" stroke="#f0cf6a" stroke-width="1.5" stroke-linecap="round"/>' : '') +
      '<g transform="translate(10 ' + (H - 12) + ')"><rect x="-5" y="-11" width="134" height="18" fill="#141414" opacity=".72"/><path d="M0 0h100M0-3v6M100-3v6" stroke="#f5f5f5" stroke-width="1" fill="none"/><text x="106" y="3.5" fill="#f5f5f5" font-size="9" font-family="Montserrat,Arial,sans-serif" style="direction:ltr;unicode-bidi:isolate" text-anchor="start">' + m + '</text></g></svg>';
  }

  var T = {
    en: {
      weeks: function (a, b) { return a + '–' + b + ' weeks'; },
      wk: function (n) { return n + (n === 1 ? ' week' : ' weeks'); },
      days: function (a, b, c) { return 'about ' + (a === b ? a : a + '–' + b) + ' working days, ' + c + (c === 1 ? ' team' : ' teams'); },
      share: 'Stone facade cost estimate, from the AL-Swati Contracting calculator:',
      msg: { hi: 'Hello AL-Swati, I used the cost calculator on your website:', type: 'Project', material: 'Material', size: 'Panel size', fixing: 'Fixing system', frame: 'Steel frame', area: 'Area', est: 'Estimate (excl. VAT)',
        eng: 'Shop drawings and engineer visits: included', time: 'Timeline', name: 'Name', phone: 'Mobile', bye: 'Please send me an exact quote.' },
      sent: function (ref) { return '✓ Sent to our quotes team' + (ref ? ' (ref. ' + ref + ')' : '') + '. WhatsApp is open with your estimate. We will reply as soon as possible.'; },
      failed: 'WhatsApp is open with your estimate. Press send there so it reaches us.',
      bad: ['Please write your name.', 'Please check your mobile number.'],
      sar: 'SAR', m2: 'm²', metre: '1 m', about: '≈ ', sending: 'Sending…'
    },
    ar: {
      weeks: function (a, b) { return '⁦' + a + '–' + b + '⁩' + (b <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      wk: function (n) { return n === 1 ? 'أسبوع واحد' : n === 2 ? 'أسبوعان' : n + (n <= 10 ? ' أسابيع' : ' أسبوعًا'); },
      days: function (a, b, c) { return 'حوالي ' + (a === b ? a : '⁦' + a + '–' + b + '⁩') + ' يوم عمل، ' + (c === 1 ? 'فريق واحد' : c === 2 ? 'فريقان' : c + ' فرق'); },
      share: 'تقدير تكلفة واجهة الحجر من حاسبة السواتي للمقاولات:',
      msg: { hi: 'السلام عليكم، استخدمت حاسبة التكلفة في موقعكم:', type: 'المشروع', material: 'المادة', size: 'مقاس اللوح', fixing: 'نظام التثبيت', frame: 'هيكل الحديد', area: 'المساحة', est: 'التقدير (بدون الضريبة)',
        eng: 'المخططات التنفيذية وزيارات المهندس: مشمولة', time: 'المدة', name: 'الاسم', phone: 'الجوال', bye: 'أرجو إرسال عرض سعر دقيق.' },
      sent: function (ref) { return '✓ وصل تقديرك إلى فريق التسعير' + (ref ? ' (رقم ' + ref + ')' : '') + '. فتحنا لك واتساب برسالة التقدير، وسنرد عليكم في أقرب وقت.'; },
      failed: 'فتحنا لك واتساب برسالة التقدير، اضغط إرسال هناك ليصلنا.',
      bad: ['اكتب اسمك من فضلك.', 'تحقق من رقم الجوال من فضلك.'],
      sar: 'ريال', m2: 'م²', metre: '1 م', about: '≈ ', sending: 'جارٍ الإرسال…'
    }
  };
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('form.est').forEach(function (f) {
    var ar = (f.closest('[lang]') || document.documentElement).getAttribute('lang') === 'ar', L = T[ar ? 'ar' : 'en'];
    var range = f.querySelector('input[type=range]'), num = f.querySelector('input[name=area]'), engBox = f.querySelector('input[name=eng]');
    var out = function (k) { return f.querySelector('[data-o=' + k + ']'); };
    var hp = document.createElement('input'); hp.name = 'hp'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none'; f.appendChild(hp);
    var last = null, shown = { lo: null, hi: null }, wallKey = '';

    function pick(name) { var x = f.querySelector('input[name=' + name + ']:checked'); return x ? x.value : ''; }
    function label(name) { var x = f.querySelector('input[name=' + name + ']:checked'); if (!x) return ''; var b = x.parentNode.querySelector('b'); return b ? (b.firstChild ? b.firstChild.textContent : b.textContent).trim() : ''; }
    function area() { var a = parseInt(String(num.value).replace(/[^\d]/g, ''), 10); return isNaN(a) ? 500 : Math.min(MAX, Math.max(MIN, a)); }
    function size() { return pick('size') || '3060'; }
    function eng() { return !!(engBox && engBox.checked); }
    function frame() { return pick('frame') || 'none'; }
    function ltr(s) { return ar ? '⁦' + s + '⁩' : s; }
    function set(k, v) { var x = out(k); if (x) x.textContent = v; }

    // the two big numbers count to their new value
    function count(k, to) {
      var els = [out(k), out('d' + k)].filter(Boolean), from = shown[k]; shown[k] = to;
      if (calm || from === null || from === to) { els.forEach(function (x) { x.textContent = n0(to); }); return; }
      var t0 = null;
      function step(ts) {
        if (shown[k] !== to) return;
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 320), e = 1 - Math.pow(1 - p, 3), v = Math.round((from + (to - from) * e) / 500) * 500;
        els.forEach(function (x) { x.textContent = n0(p < 1 ? v : to); });
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function show() {
      var a = area(), ty = pick('type'), ma = pick('material'), fx = pick('fixing'), sz = size(), r = calc(ty, ma, fx, sz, a, eng(), frame());
      count('lo', r.lo); count('hi', r.hi);
      set('per', n0(r.perLo) + '–' + n0(r.perHi));
      set('weeks', L.weeks(r.wLo, r.wHi)); set('lead', L.wk(r.lead)); set('install', L.days(r.dLo, r.dHi, r.teams));
      var setup = f.querySelector('.est-setup'); if (setup) setup.hidden = !r.setup;
      var inst = (r.dLo + r.dHi) / 2 / PRICE.daysPerWeek, total = r.lead + r.setup + inst, bar = f.querySelector('.est-bar');
      if (bar) { bar.querySelector('.d').style.flexGrow = r.lead / total; bar.querySelector('.s').style.flexGrow = r.setup / total; bar.querySelector('.i').style.flexGrow = inst / total; }
      // where the money goes
      var sp = f.querySelector('.ec-split');
      if (sp) {
        var sum = r.a + r.b + r.c + r.f + r.e;
        [['a', r.a], ['b', r.b], ['c', r.c], ['f', r.f], ['e', r.e]].forEach(function (p) { sp.querySelector('.' + p[0]).style.flexGrow = p[1] / sum; });
        var near = function (x) { return ltr(L.about + n0(Math.round(x / 500) * 500)) + ' ' + L.sar; };
        set('pa', near(r.a)); set('pb', near(r.b)); set('pc', near(r.c));
        var fr = f.querySelector('.ec-frm'); if (fr) { fr.hidden = !r.f; set('pf', ltr(n0(r.f)) + ' ' + L.sar); }
        var er = f.querySelector('.ec-eng'); if (er) { er.hidden = !r.e; set('pe', ltr(n0(r.eLo) + (r.eHi !== r.eLo ? '–' + n0(r.eHi) : '')) + ' ' + L.sar); }
        set('vat', ltr(n0(round(r.lo * 1.15)) + '–' + n0(round(r.hi * 1.15))) + ' ' + L.sar);
      }
      // the price on every stone, for the project, size and fixing chosen
      f.querySelectorAll('[data-p]').forEach(function (x) {
        var q = calc(ty, x.getAttribute('data-p'), fx, sz, a, false, frame()); x.textContent = ltr(n0(q.perLo) + '–' + n0(q.perHi));
      });
      var st = f.querySelector('[data-step=size]'); if (st) st.classList.toggle('ec-off', ma === 'porcelain');
      var wv = out('wall'), key = ma + sz + fx;
      if (wv && key !== wallKey) { wallKey = key; wv.innerHTML = wall(ma, sz, fx, L.metre); }
      var parts = [label('type'), label('material')]; if (ma !== 'porcelain') parts.push(ltr(label('size'))); parts.push(label('fixing'), ltr(n0(a)) + ' ' + L.m2);
      set('summary', parts.join(' · '));
      range.style.setProperty('--p', (100 * toSlider(a) / 1000) + '%');
      f.querySelectorAll('.ec-quick button').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-a') === a); });
      last = { r: r, a: a };
      var chat = f.querySelector('.est-chat'); if (chat) chat.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text('', ''));
    }
    function text(name, phone) {
      var r = last.r, M = L.msg, por = pick('material') === 'porcelain';
      return M.hi + '\n' + M.type + ': ' + label('type') + '\n' + M.material + ': ' + label('material') + (por ? '' : '\n' + M.size + ': ' + ltr(label('size'))) + '\n' + M.fixing + ': ' + label('fixing') + (frame() !== 'none' ? '\n' + M.frame + ': ' + label('frame') : '') + '\n' +
        M.area + ': ' + n0(last.a) + ' ' + L.m2 + '\n' + M.est + ': ' + (ar ? '⁦' + n0(r.lo) + ' – ' + n0(r.hi) + '⁩ ' + L.sar + ' (⁦' + n0(r.perLo) + '–' + n0(r.perHi) + '⁩ ' + L.sar + '/' + L.m2 + ')'
          : L.sar + ' ' + n0(r.lo) + ' – ' + n0(r.hi) + ' (' + n0(r.perLo) + '–' + n0(r.perHi) + ' ' + L.sar + '/' + L.m2 + ')') + (eng() ? '\n' + M.eng : '') + '\n' +
        M.time + ': ' + L.weeks(r.wLo, r.wHi) + (name ? '\n' + M.name + ': ' + name : '') + (phone ? '\n' + M.phone + ': ' + phone : '') + '\n' + M.bye;
    }
    function used() { // one "calculator used" count per page view, after the visitor changes something
      if (counted) return; counted = true;
      try { erp({ action: 'event', kind: 'estimate', page: location.pathname, lang: ar ? 'ar' : 'en', ref: document.referrer, utm: utm }).catch(function () {}); } catch (e) {}
    }

    range.addEventListener('input', function () { num.value = toArea(+range.value); show(); used(); });
    num.addEventListener('input', function () { if (num.value) { range.value = toSlider(area()); show(); } });
    num.addEventListener('change', function () { num.value = area(); range.value = toSlider(area()); show(); used(); });
    f.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(function (x) { x.addEventListener('change', function () { show(); used(); }); });
    f.querySelectorAll('.ec-quick button').forEach(function (b) { b.addEventListener('click', function () { num.value = +b.getAttribute('data-a'); range.value = toSlider(area()); show(); used(); }); });

    // phones: one question on screen at a time, and a slim bar with the total and the next step always in reach
    var dock = f.querySelector('.ec-dock'), panel = f.querySelector('.est-out'), nav = f.querySelector('.ec-nav'), dbtn = dock && dock.querySelector('button');
    var wiz = false, cur = 0, seenForm = false, seenPanel = false, hop = 0;
    function steps() { return [].slice.call(f.querySelectorAll('.est-step:not(.ec-off)')); }
    function dockUpd() { if (!dock) return; dock.hidden = wiz ? !(seenForm && !f.classList.contains('ec-end')) : !(seenForm && !seenPanel && window.innerWidth <= 1000); document.body.classList.toggle('ec-docked', !dock.hidden); }
    function go(n, move) {
      var st = steps(), end = n >= st.length; cur = Math.max(0, Math.min(n, st.length));
      f.querySelectorAll('.est-step').forEach(function (x) { x.classList.remove('ec-cur'); });
      if (!end) st[cur].classList.add('ec-cur');
      f.classList.toggle('ec-end', end);
      set('sn', Math.min(cur + 1, st.length)); set('st', st.length);
      var bar = nav.querySelector('.ec-bar i'); if (bar) bar.style.width = (100 * (end ? 1 : (cur + 1) / (st.length + 1))) + '%';
      nav.querySelector('.ec-back').hidden = end || cur === 0; nav.querySelector('.ec-prog').hidden = end; nav.querySelector('.ec-edit').hidden = !end;
      if (dbtn) dbtn.textContent = cur >= st.length - 1 ? f.getAttribute('data-see') : f.getAttribute('data-next');
      dockUpd();
      if (move) { var y = f.getBoundingClientRect().top + window.pageYOffset - 74; window.scrollTo({ top: y, behavior: calm ? 'auto' : 'smooth' }); }
    }
    function mode() {
      var on = !!nav && window.innerWidth <= 640; if (on === wiz) return; wiz = on;
      f.classList.toggle('ec-wiz', on); if (nav) nav.hidden = !on;
      if (on) go(0, false); else { f.classList.remove('ec-end'); if (dbtn) dbtn.textContent = f.getAttribute('data-see'); dockUpd(); }
    }
    if (dock && panel && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { seenForm = en[0].isIntersecting; dockUpd(); }).observe(f);
      new IntersectionObserver(function (en) { seenPanel = en[0].isIntersecting; dockUpd(); }, { threshold: 0.12 }).observe(panel);
      dbtn.addEventListener('click', function () { if (wiz) go(cur + 1, true); else panel.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' }); });
      if (nav) {
        nav.querySelector('.ec-back').addEventListener('click', function () { go(cur - 1, true); });
        nav.querySelector('.ec-edit').addEventListener('click', function () { go(0, true); });
        // a tap on a choice in the first four steps moves on by itself
        f.querySelectorAll('input[name=type],input[name=material],input[name=size],input[name=fixing]').forEach(function (x) {
          // 'click', not 'change': a tap on the choice that is already selected must move on too
          x.addEventListener('click', function () { if (!wiz) return; var at = steps().indexOf(x.closest('.est-step')); if (at !== cur) return; clearTimeout(hop); hop = setTimeout(function () { show(); if (cur === at) go(at + 1, true); }, 300); });
        });
        mode(); window.addEventListener('resize', mode);
      }
    }
    var share = f.querySelector('.ec-share');
    if (share) share.addEventListener('click', function () {
      var r = last.r, url = location.origin + location.pathname, t = L.share + '\n' + (out('summary') ? out('summary').textContent : '') + '\n' +
        (ar ? '⁦' + n0(r.lo) + ' – ' + n0(r.hi) + '⁩ ' + L.sar : L.sar + ' ' + n0(r.lo) + ' – ' + n0(r.hi)) + '\n' + url;
      if (navigator.share) navigator.share({ text: t }).catch(function () {}); else window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener');
      try { erp({ action: 'event', kind: 'estimate_share', page: location.pathname, lang: ar ? 'ar' : 'en' }).catch(function () {}); } catch (e) {}
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.querySelector('[name=name]').value.trim(), phone = f.querySelector('[name=phone]').value.trim(), note = f.querySelector('.est-note');
      if (name.length < 2) { note.textContent = L.bad[0]; f.querySelector('[name=name]').focus(); return; }
      if (!/^[+\d\s()\-]{7,22}$/.test(phone) || phone.replace(/\D/g, '').length < 9) { note.textContent = L.bad[1]; f.querySelector('[name=phone]').focus(); return; }
      var r = last.r, msg = text(name, phone), wa = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), btn = f.querySelector('.est-send');
      var est = { type: EN[pick('type')], material: EN[pick('material')], fixing: EN[pick('fixing')], area: last.a, lo: r.lo, hi: r.hi, weeks: r.wLo + '-' + r.wHi,
        size: pick('material') === 'porcelain' ? '' : EN[size()], engineering: eng(), frame: frame() === 'none' ? '' : EN[frame()] };
      btn.disabled = true; note.textContent = L.sending;
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
