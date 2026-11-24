(function(){
  var h=document.querySelector('.hdr');
  function onS(){if(h)h.classList.toggle('scrolled',window.scrollY>40)}
  window.addEventListener('scroll',onS);onS();
  var b=document.querySelector('.burger'),n=document.querySelector('.nav');
  if(b)b.addEventListener('click',function(){n.classList.toggle('open');b.textContent=n.classList.contains('open')?'✕':'☰'});
  document.querySelectorAll('.nav .dd>a').forEach(function(a){
    a.addEventListener('click',function(e){if(window.innerWidth<=1100){e.preventDefault();a.parentNode.classList.toggle('open')}})
  });
  // Load WebGL only after an explicit request to view the model.
  var stage = document.querySelector('.stage3d'), loading3d = false;
  if (stage) {
    var view3d = stage.querySelector('.view3d');
    function load3d() {
      if (loading3d || stage.classList.contains('live')) return;
      loading3d = true; stage.classList.add('loading3d');
      view3d.setAttribute('aria-busy', 'true');
      var script = document.createElement('script');
      script.src = '/assets/stone3d.js';
      function reset() {
        stage.classList.remove('loading3d');
        view3d.removeAttribute('aria-busy');
        loading3d = false;
      }
      script.onerror = function () { reset(); script.remove(); };
      script.onload = function () {
        stage.classList.remove('loading3d');
        view3d.removeAttribute('aria-busy');
      };
      document.body.appendChild(script);
    }
    stage.addEventListener('click', load3d);
    stage.addEventListener('keydown', function (e) {
      if (e.target === stage && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); load3d();
      }
    });
  }
  // project filters
  document.querySelectorAll('.filters button').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.filters button').forEach(function(x){x.classList.remove('on')});
      btn.classList.add('on');var f=btn.dataset.f;
      document.querySelectorAll('.pgrid .pcard').forEach(function(c){c.style.display=(f==='all'||c.dataset.c===f)?'':'none'});
    });
  });
  var hs=location.hash.replace('#','');
  if(['residential','commercial','institutional'].indexOf(hs)>-1){var t=document.querySelector('.filters button[data-f="'+hs+'"]');if(t)t.click()}
  // quote form -> straight into the AL-Swati ERP (Queries), so no enquiry is lost; WhatsApp stays one tap away
  var ERP='https://keweaoogdnxietvyerhj.supabase.co/functions/v1/seo',KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtld2Vhb29nZG54aWV0dnllcmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTM5MjIsImV4cCI6MjEwOTYyOTkyMn0.KXMRTzdJVvtWSwaiRou6OQbU1AjJUtir_643diGPSBM';
  function erp(body){return fetch(ERP,{method:'POST',keepalive:true,headers:{'content-type':'application/json',apikey:KEY,Authorization:'Bearer '+KEY},body:JSON.stringify(body)})}
  var ar=document.documentElement.lang==='ar',utm=(location.search.match(/utm_[a-z]+=[^&]+/g)||[]).join('&');
  ['quote-form','contact-form'].forEach(function(id){
    var f=document.getElementById(id);if(!f)return;
    if(!f.querySelector('[name=hp]')){var hp=document.createElement('input');hp.name='hp';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.style.cssText='position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none';f.appendChild(hp)}
    f.addEventListener('submit',function(e){
      e.preventDefault();var d=new FormData(f),btn=f.querySelector('button[type=submit]'),note=f.querySelector('.note');
      var L=ar?['طلب عرض سعر','الاسم','الهاتف','البريد','نوع المشروع','التفاصيل']:['New quote request','Name','Phone','Email','Project type','Details'];
      var msg=L[0]+'\n'+L[1]+': '+d.get('name')+'\n'+L[2]+': '+d.get('phone')+'\n'+(d.get('email')?L[3]+': '+d.get('email')+'\n':'')+(d.get('projectType')?L[4]+': '+d.get('projectType')+'\n':'')+L[5]+': '+d.get('message');
      var wa='https://wa.me/966511826313?text='+encodeURIComponent(msg);
      if(btn)btn.disabled=true;if(note)note.textContent=ar?'جارٍ الإرسال…':'Sending…';
      erp({action:'lead',name:d.get('name'),phone:d.get('phone'),email:d.get('email'),projectType:d.get('projectType'),message:d.get('message'),hp:d.get('hp'),page:location.pathname,lang:ar?'ar':'en',ref:document.referrer,utm:utm})
        .then(function(r){return r.json().then(function(j){if(!r.ok||j.error)throw new Error(j.error||r.status);return j})})
        .then(function(){f.reset();if(note)note.innerHTML=(ar?'✓ وصلنا طلبك، وسنتواصل معك خلال يوم عمل. للتواصل الفوري: ':'✓ We have your request and will reply within one business day. For a faster reply: ')+'<a href="'+wa+'" target="_blank" rel="noopener">'+(ar?'أرسله على واتساب':'send it on WhatsApp')+'</a>'})
        .catch(function(){if(note)note.textContent=ar?'لم يصل الطلب، سيُفتح واتساب الآن.':'Could not send the form, opening WhatsApp instead.';window.open(wa,'_blank')})
        .then(function(){if(btn)btn.disabled=false});
    });
  });
  // calls, WhatsApp and email taps are counted (no personal data) so the ERP knows which pages bring work
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');
    var k=/wa\.me|whatsapp/.test(h)?'whatsapp':/^tel:/.test(h)?'call':/^mailto:/.test(h)?'email':null;
    if(k==='whatsapp'&&!a.target){a.target='_blank';a.rel='noopener'} // WhatsApp opens in a new tab: the page stays open and the count always gets through
    if(k)try{erp({action:'event',kind:k,page:location.pathname,lang:ar?'ar':'en',ref:document.referrer,utm:utm})}catch(x){}
  });
  // share
  document.querySelectorAll('[data-copy]').forEach(function(x){x.addEventListener('click',function(){
    try{navigator.clipboard.writeText(location.origin);x.textContent='✓ Copied'}catch(e){}
  })});
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
})();
