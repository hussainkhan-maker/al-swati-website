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
    // The model starts by itself once the page has loaded and the opening logo has gone, when it is on screen.
    // Not for visitors who asked their device for less motion or less data: they keep the picture and the button.
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, saver = navigator.connection && navigator.connection.saveData;
    if (!calm && !saver) {
      var auto3d = function () {
        var tries = 0, wait = setInterval(function () {
          if (document.querySelector('.intro:not(.out)') && ++tries < 25) return;
          clearInterval(wait);
          if (!('IntersectionObserver' in window)) return load3d();
          var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); load3d(); } }, { rootMargin: '150px' });
          io.observe(stage);
        }, 200);
      };
      var idle = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 500); })(auto3d, { timeout: 2000 }); };
      if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle);
    }
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
  // the picture map: a tap on a number, a chip or a part of the drawing shows that part
  document.querySelectorAll('.fx').forEach(function(fx){
    var pick=function(k){fx.querySelectorAll('[data-k]').forEach(function(x){x.classList.toggle('on',x.getAttribute('data-k')===k)});
      var c=fx.querySelector('.fx-chip.on'),w=c&&c.parentNode;if(w&&w.scrollWidth>w.clientWidth){var r=c.getBoundingClientRect(),wr=w.getBoundingClientRect();if(r.left<wr.left||r.right>wr.right)w.scrollLeft+=r.left-wr.left-16}};
    fx.classList.add('fx-js');
    fx.addEventListener('click',function(e){if(e.target.closest('a'))return;var t=e.target.closest('.fx-hot,.fx-chip');if(t)pick(t.getAttribute('data-k'))});
    fx.addEventListener('keydown',function(e){var t=e.target.closest&&e.target.closest('.fx-hot');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick(t.getAttribute('data-k'))}});
    if(window.matchMedia&&matchMedia('(hover:hover)').matches)fx.querySelectorAll('.fx-hot').forEach(function(g){g.addEventListener('mouseenter',function(){pick(g.getAttribute('data-k'))})});
    pick('stone');
  });
  // technical pages: one small box follows the mouse (or a tap) with a term's meaning or a system's drawing
  var techPage=document.body.classList.contains('fc-page')||document.body.classList.contains('tc-page'),arPage=document.documentElement.lang==='ar';
  var tipBox=null,tipFor=null,canHover=window.matchMedia&&matchMedia('(hover:hover)').matches;
  function tipShow(el,html,wide){
    if(!tipBox){tipBox=document.createElement('div');tipBox.className='tipbox';tipBox.setAttribute('role','tooltip');document.body.appendChild(tipBox)}
    tipBox.className='tipbox'+(wide?' tip-img':'');tipBox.innerHTML=html;tipBox.style.display='block';tipFor=el;
    var r=el.getBoundingClientRect(),w=tipBox.offsetWidth,h=tipBox.offsetHeight,x=Math.max(10,Math.min(r.left+r.width/2-w/2,innerWidth-w-10)),y=r.bottom+10;
    if(y+h>innerHeight-10&&r.top-h-10>10)y=r.top-h-10;
    tipBox.style.left=x+'px';tipBox.style.top=y+'px';
  }
  function tipHide(){if(tipBox)tipBox.style.display='none';tipFor=null}
  function tipBind(el,make,wide){
    if(canHover){el.addEventListener('mouseenter',function(){tipShow(el,make(),wide)});el.addEventListener('mouseleave',tipHide)}
    el.addEventListener('focus',function(){tipShow(el,make(),wide)});el.addEventListener('blur',tipHide);
    if(!wide)el.addEventListener('click',function(e){if(canHover)return;e.stopPropagation();if(tipFor===el)tipHide();else tipShow(el,make(),wide)});
  }
  window.addEventListener('scroll',tipHide,{passive:true});document.addEventListener('click',tipHide);
  var escH=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  // a fixing system's name shows its section drawing (laptops)
  var SYS=[[/up-?\s?down/i,'updown'],[/\bPEN\b|\bpin\b|دبابيس|دبوس/i,'pen'],[/c-?channel/i,'cchannel'],[/kerf/i,'kerfrail'],[/undercut/i,'undercut']];
  var sysOf=function(t){for(var i=0;i<SYS.length;i++)if(SYS[i][0].test(t))return SYS[i][1];return ''};
  var drawTip=function(el,code,label){if(!code)return;el.classList.add('has-draw');tipBind(el,function(){return '<img src="/images/details/'+code+'-'+(arPage?'ar':'en')+'.svg" alt="" width="300" height="300"><span>'+escH(label)+'</span>'},true)};
  if(canHover){
    if(techPage)document.querySelectorAll('.tc-wide tbody th,.fc-table tbody th').forEach(function(th){var t=th.textContent.trim();if(t.length<40)drawTip(th,sysOf(t),t)});
    var EC={updown:'updown',rail:'cchannel',kerf:'kerfrail',undercut:'undercut'};
    document.querySelectorAll('.ec-fx').forEach(function(c){var i=c.querySelector('input'),b=c.querySelector('b');if(i&&EC[i.value])drawTip(c,EC[i.value],b?b.textContent:'')});
  }
  // glossary terms in the text carry their meaning: the first time each one appears on the page
  if(techPage&&window.fetch&&!/\/glossary\/$/.test(location.pathname)){
    var lazy=function(fn){('requestIdleCallback' in window)?requestIdleCallback(fn,{timeout:2500}):setTimeout(fn,800)};
    lazy(function(){fetch('/assets/fc-terms-'+(arPage?'ar':'en')+'.json').then(function(r){return r.json()}).then(function(T){
      var keys=Object.keys(T).sort(function(a,b){return b.length-a.length}),low={},mk='[ً-ْـ]*';
      var src=keys.map(function(k){low[k.toLowerCase().replace(/[ً-ْـ]/g,'')]=T[k];var e=k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return arPage?e.replace(/[ً-ْـ]/g,'').split('').join(mk):e}).join('|');
      var re;try{re=new RegExp('(?<![\\p{L}\\p{N}])('+src+')(?![\\p{L}\\p{N}])','iu')}catch(e){return}
      var done={},nodes=[],w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode;
        return p.closest('.fc-prose p,.fc-prose li,.fc-card p,.fc-card li,.fc-steps p,.fx-fact,.fx-plain,.fc-quick li,.tc-spec td,.fc-table td,.tc-detail p,.lead')&&!p.closest('a,button,abbr,h1,h2,h3,.term')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
      while(w.nextNode())nodes.push(w.currentNode);
      nodes.forEach(function(n){var guard=0;while(n&&guard++<6){var m=re.exec(n.nodeValue);if(!m)break;var key=m[1].toLowerCase().replace(/[ً-ْـ]/g,''),tip=low[key];
        var rest=n.splitText(m.index),after=rest.splitText(m[1].length);
        if(tip&&!done[key]){done[key]=1;var s=document.createElement('span');s.className='term';s.tabIndex=0;s.textContent=rest.nodeValue;rest.parentNode.replaceChild(s,rest);(function(s,tip,word){tipBind(s,function(){return '<b>'+escH(word)+'</b>'+escH(tip)},false)})(s,tip,m[1])}
        n=after}});
    }).catch(function(){})});
  }
  // search inside the technical pages: every word must be in the part's heading or text
  document.querySelectorAll('.fc-search').forEach(function(box){
    var inp=box.querySelector('input'),hits=box.querySelector('.fc-hits'),data=null,loading=false;
    var norm=function(s){return String(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')};
    var load=function(){if(data||loading)return;loading=true;fetch(box.getAttribute('data-src')).then(function(r){return r.json()}).then(function(d){data=d.map(function(x){return{x:x,h:norm(x.h),t:norm(x.t),p:norm(x.p)}});run()}).catch(function(){loading=false})};
    var run=function(){
      var q=norm(inp.value).trim().split(/\s+/).filter(function(w){return w.length>1});
      if(!q.length||!data){hits.hidden=true;hits.innerHTML='';return}
      var res=[];data.forEach(function(d){var s=0;for(var i=0;i<q.length;i++){var inH=d.h.indexOf(q[i])>=0||d.p.indexOf(q[i])>=0,inT=d.t.indexOf(q[i])>=0;if(!inH&&!inT)return;s+=inH?5:1}res.push([s,d])});
      res.sort(function(a,b){return b[0]-a[0]});
      hits.innerHTML=res.length?res.slice(0,7).map(function(r){var d=r[1],i=d.t.indexOf(q[0]),from=Math.max(0,i-50),snip=(from>0?'…':'')+d.x.t.slice(from,from+150)+'…';
        return '<a href="'+escH(d.x.u)+'"><small>'+escH(d.x.p)+'</small><b>'+escH(d.x.h)+'</b><span>'+escH(snip)+'</span></a>'}).join(''):'<p>'+escH(box.getAttribute('data-none'))+'</p>';
      hits.hidden=false;
    };
    inp.addEventListener('focus',load);inp.addEventListener('input',function(){load();run()});
    inp.addEventListener('keydown',function(e){if(e.key==='Escape'){inp.value='';run()}else if(e.key==='Enter'){e.preventDefault();var a=hits.querySelector('a');if(a)location.href=a.href}});
    document.addEventListener('click',function(e){if(!box.contains(e.target))hits.hidden=true});
    inp.addEventListener('focus',function(){if(hits.innerHTML)hits.hidden=false});
  });
  // the bar under the header marks the part of the page on screen
  var jump=[].slice.call(document.querySelectorAll('.tc-jump a'));
  if(jump.length&&'IntersectionObserver' in window){
    var jio=new IntersectionObserver(function(en){en.forEach(function(e){if(!e.isIntersecting)return;jump.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);
      if(on){var w=a.parentNode,r=a.getBoundingClientRect(),wr=w.parentNode.getBoundingClientRect();if(r.left<wr.left+10||r.right>wr.right-10)w.parentNode.scrollLeft+=r.left-wr.left-16}})})},{rootMargin:'-35% 0px -60% 0px'});
    jump.forEach(function(a){var t=document.getElementById(a.getAttribute('href').slice(1));if(t)jio.observe(t)});
  }
  // consultants pages on phones: every part after the first is closed until its heading is tapped
  if(document.body.classList.contains('fc-page')&&window.matchMedia&&matchMedia('(max-width:760px)').matches){
    var parts=[].slice.call(document.querySelectorAll('main>.fc-sec[id]')).filter(function(s){return /^part-|^map$/.test(s.id)||s.querySelector(':scope>.wrap>.eyebrow')});
    var openPart=function(s){s.classList.remove('fc-closed');var h=s.querySelector('h2');if(h)h.setAttribute('aria-expanded','true')};
    parts.forEach(function(s,i){var h=s.querySelector(':scope>.wrap>h2');if(!h)return;s.classList.add('fc-fold');h.setAttribute('role','button');h.setAttribute('tabindex','0');
      if(i>0&&'#'+s.id!==location.hash){s.classList.add('fc-closed');h.setAttribute('aria-expanded','false')}else h.setAttribute('aria-expanded','true');
      var flip=function(){var c=s.classList.toggle('fc-closed');h.setAttribute('aria-expanded',c?'false':'true')};
      h.addEventListener('click',flip);h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}})});
    var toHash=function(){var id=location.hash.slice(1),el=id&&document.getElementById(id);if(!el)return;var s=el.closest('.fc-fold');if(s&&s.classList.contains('fc-closed')){openPart(s);el.scrollIntoView()}};
    window.addEventListener('hashchange',toHash);
    document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var el=document.getElementById(a.getAttribute('href').slice(1)),s=el&&el.closest('.fc-fold');if(s)openPart(s)},true);
  }
  // phones: card rows swipe sideways with dots under them, long text opens on demand, one bar for call, WhatsApp and the calculator
  if(window.matchMedia&&matchMedia('(max-width:640px)').matches){
    var isAr=document.documentElement.lang==='ar';
    document.querySelectorAll('.sgrid,.grid3,.grid4,.steps4,.sys,.area-gallery,.gal,.fc-cards,.fc-draws,.tc-links,body:not(.pf-page) .pgrid').forEach(function(g){
      if(g.closest('#portfolio')||g.children.length<3)return;
      g.classList.add('sw-row');var n=g.children.length,d=document.createElement('div');d.className='sw-dots';d.setAttribute('aria-hidden','true');
      for(var i=0;i<n;i++)d.appendChild(document.createElement('i'));d.firstChild.className='on';g.parentNode.insertBefore(d,g.nextSibling);
      var tick=0;g.addEventListener('scroll',function(){if(tick)return;tick=requestAnimationFrame(function(){tick=0;var w=g.children[0].getBoundingClientRect().width+12,k=Math.min(n-1,Math.round(Math.abs(g.scrollLeft)/w));
        [].forEach.call(d.children,function(x,i){x.className=i===k?'on':''})})},{passive:true});
    });
    document.querySelectorAll('main .body,.prose,.fc-fold .fc-prose').forEach(function(b){
      if(b.closest('.rm')||b.offsetHeight<760)return;
      b.classList.add('rm');var bg=b.closest('section');if(bg)b.style.setProperty('--rm-bg',getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)'?'#1a1a1a':getComputedStyle(bg).backgroundColor);
      var btn=document.createElement('button');btn.type='button';btn.className='rm-btn';btn.textContent=isAr?'اقرأ المزيد':'Read more';
      btn.addEventListener('click',function(){b.classList.add('rm-open');btn.remove()});b.parentNode.insertBefore(btn,b.nextSibling);
    });
    if(!document.querySelector('.mbar')){
      var here=document.getElementById('estimate-form'),calc=here?'#estimate-form':(isAr?'/ar':'')+'/stone-cladding-cost-calculator/',bar=document.createElement('nav');bar.className='mbar';bar.setAttribute('aria-label',isAr?'تواصل سريع':'Quick contact');
      bar.innerHTML='<a href="tel:+966511826313"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg><span>'+(isAr?'اتصال':'Call')+'</span></a>'+
        '<a class="w" href="https://wa.me/966511826313"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.5 8.5 0 1 1 8 19.200z"/><path d="M9 8.500c0 3 2.500 6 6 6.500l1.200-1.500-2-1-1 .800c-1-.500-1.800-1.300-2.300-2.300l.800-1-1-2z"/></svg><span>'+(isAr?'واتساب':'WhatsApp')+'</span></a>'+
        '<a href="'+calc+'"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="1.500"/><path d="M8 7h8M8 12h2M12 12h0M16 12h0M8 16h2M12 16h0M16 16h0"/></svg><span>'+(isAr?'احسب التكلفة':'Cost calculator')+'</span></a>';
      document.body.appendChild(bar);document.body.classList.add('has-mbar');
    }
  }
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
})();
