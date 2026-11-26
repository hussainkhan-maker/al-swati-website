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
        .then(function(){f.reset();if(note)note.innerHTML=(ar?'✓ وصلنا طلبك، وسنرد عليكم في أقرب وقت. وللتواصل عبر واتساب: ':'✓ We have your request and will reply as soon as possible. You can also ')+'<a href="'+wa+'" target="_blank" rel="noopener">'+(ar?'أرسله على واتساب':'send it on WhatsApp')+'</a>'})
        .catch(function(){if(note)note.textContent=ar?'لم يصل الطلب، سيُفتح واتساب الآن.':'Could not send the form, opening WhatsApp instead.';window.open(wa,'_blank')})
        .then(function(){if(btn)btn.disabled=false});
    });
  });
  // "Send us your drawings" (/for-consultants/send-drawings/): the same road into the ERP (Queries) as the quote form.
  // The site has no file upload, so the form carries a link to the drawings; nothing here promises a reply time.
  (function(){
    var f=document.getElementById('drawings-form');if(!f)return;
    var M={};try{M=JSON.parse(f.getAttribute('data-msgs'))}catch(x){}
    var hp=document.createElement('input');hp.name='hp';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
    hp.style.cssText='position:absolute;top:0;left:0;width:1px;height:1px;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none';f.style.position='relative';f.appendChild(hp);
    var note=f.querySelector('.est-note'),btn=f.querySelector('button[type=submit]');
    function val(n){var x=f.querySelector('[name='+n+']');return x?x.value.trim():''}
    function bad(msg,name){note.textContent=msg;note.className='est-note tc-bad';var x=name&&f.querySelector('[name='+name+']');if(x){x.setAttribute('aria-invalid','true');x.focus()}}
    f.addEventListener('input',function(e){if(e.target.removeAttribute)e.target.removeAttribute('aria-invalid')});
    f.addEventListener('submit',function(e){
      e.preventDefault();if(btn.disabled)return;
      f.querySelectorAll('[aria-invalid]').forEach(function(x){x.removeAttribute('aria-invalid')});
      var west=function(x){return x.replace(/[\u0660-\u0669]/g,function(d){return d.charCodeAt(0)-0x660}).replace(/[\u06F0-\u06F9]/g,function(d){return d.charCodeAt(0)-0x6F0})};
      var name=val('name'),company=val('company'),phone=west(val('phone')),email=val('email'),link=val('link');
      if(name.length<2)return bad(M.name,'name');
      if(company.length<2)return bad(M.company,'company');
      if(!phone&&!email)return bad(M.contact,'email');
      if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return bad(M.email,'email');
      if(phone&&(!/^[+\d\s()\-]{7,22}$/.test(phone)||phone.replace(/\D/g,'').length<9))return bad(M.phone,'phone');
      if(link&&!/^https?:\/\/\S+\.\S+/i.test(link))return bad(M.link,'link');
      var role=val('role'),loc=val('location'),stage=val('stage'),mat=val('material'),area=west(val('area')).replace(/[^\d.,]/g,''),text=val('message');
      var msg='Drawings review request from the website (For Architects & Consultants, '+(ar?'Arabic':'English')+' page).\n'
        +'Company: '+company+(role?' ('+role+')':'')+'\n'
        +'Project location: '+(loc||'-')+'\n'
        +'Stage: '+(stage||'-')+'\n'
        +'Stone / material: '+(mat||'-')+'\n'
        +'Approximate area: '+(area?area+' m2':'-')+'\n'
        +'Link to drawings: '+(link||'none given (will email or WhatsApp)')+'\n'
        +'Message: '+(text||'-');
      btn.disabled=true;note.className='est-note';note.textContent=M.sending;
      erp({action:'lead',name:name,phone:phone,email:email,company:company,role:role,docs:['Drawings review'],system:mat,project:loc,
        projectType:('Drawings review: '+(stage||'stage not given')).slice(0,60),message:msg,hp:hp.value,page:location.pathname,lang:ar?'ar':'en',ref:document.referrer,utm:utm})
        .then(function(r){return r.json().then(function(j){if(!r.ok||j.error)throw new Error(j.error||r.status);return j})})
        .then(function(j){if(!j.ref){note.className='est-note tc-bad';note.textContent=M.dup;return} // the ERP keeps one website request per phone or email per day: say so instead of a false "received"
          note.className='est-note tc-ok';note.textContent=M.sent.replace('{ref}',M.ref.replace('{r}',j.ref));
          f.querySelectorAll('input:not([name=hp]),textarea').forEach(function(x){x.value=''})})
        .catch(function(){note.className='est-note tc-bad';note.textContent=M.failed})
        .then(function(){btn.disabled=false});
    });
  })();
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
