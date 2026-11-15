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
  // quote form -> WhatsApp
  var f=document.getElementById('quote-form');
  if(f)f.addEventListener('submit',function(e){
    e.preventDefault();var d=new FormData(f),ar=document.documentElement.lang==='ar';
    var L=ar?['طلب عرض سعر','الاسم','الهاتف','البريد','نوع المشروع','التفاصيل']:['New quote request','Name','Phone','Email','Project type','Details'];
    var msg=L[0]+'\n'+L[1]+': '+d.get('name')+'\n'+L[2]+': '+d.get('phone')+'\n'+(d.get('email')?L[3]+': '+d.get('email')+'\n':'')+(d.get('projectType')?L[4]+': '+d.get('projectType')+'\n':'')+L[5]+': '+d.get('message');
    window.open('https://wa.me/966511826313?text='+encodeURIComponent(msg),'_blank');
  });
  // share
  document.querySelectorAll('[data-copy]').forEach(function(x){x.addEventListener('click',function(){
    try{navigator.clipboard.writeText(location.origin);x.textContent='✓ Copied'}catch(e){}
  })});
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
})();
