/* AL-Swati Contracting — 3D fixing-system cards (WebGL2, no libraries).
   Each card first shows the fixing part alone (close-up), then — on hover or after a moment —
   the wall, anchor bolt, the part and the stone panels are installed in sequence. */
(function () {
  'use strict';
  var hosts = document.querySelectorAll('.sys3d');
  if (!hosts.length) return;
  var RTL = document.documentElement.dir === 'rtl';
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DEG = Math.PI / 180;
  var IMG = {};
  function getImg(name) {
    return IMG[name] || (IMG[name] = new Promise(function (res) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { res(im); }; im.onerror = function () { res(null); };
      im.src = '/assets/3d/' + name + '.webp';
    }));
  }
  var LABELS = {
    en: {
      updown: { part: 'Up-Down angle · stainless or hot-dip galvanised steel', steps: ['Wall & anchor bolt', 'Up-Down angles fixed', 'Lower stone onto the tongue', 'Upper stone onto the tongue'], done: 'Installed · Up-Down system' },
      pen: { part: 'PEN pin bracket · stainless or hot-dip galvanised steel', steps: ['Wall & anchor bolt', 'PEN brackets fixed', 'Lower stone onto the pin', 'Upper stone onto the pin'], done: 'Installed · PEN system' },
      cchannel: { part: 'C-Channel · vertical channel', steps: ['Wall brackets & anchor bolts', 'C-Channels on the brackets', 'Up-Down clips in the channel', 'Stone panels on the clips'], done: 'Installed · C-Channel system' },
      undercut: { part: 'Undercut bracket + anchor · stainless steel', steps: ['Wall & anchor bolts', 'Wall brackets fixed', 'Vertical aluminium supports', 'Horizontal aluminium rails', 'Stone hung on its undercut brackets'], done: 'Installed · Undercut system' },
      kerf: { part: 'Horizontal kerf rail · aluminium & stainless', steps: ['Wall & anchor bolts', 'Wall brackets fixed', 'Vertical aluminium supports', 'Horizontal kerf rails', 'Stone panels onto the rail blades'], done: 'Installed · Rail system' }
    },
    ar: {
      updown: { part: 'زاوية Up-Down · ستانلس أو مجلفن على الساخن', steps: ['الجدار ومسمار الانكر', 'تثبيت زوايا Up-Down', 'اللوح السفلي على اللسان', 'اللوح العلوي على اللسان'], done: 'تم التركيب · نظام Up-Down' },
      pen: { part: 'زاوية PEN بالدبوس · ستانلس أو مجلفن على الساخن', steps: ['الجدار ومسمار الانكر', 'تثبيت زوايا PEN', 'اللوح السفلي على الدبوس', 'اللوح العلوي على الدبوس'], done: 'تم التركيب · نظام PEN' },
      cchannel: { part: 'مجرى C-Channel رأسي', steps: ['زوايا الجدار ومسامير الانكر', 'تثبيت المجاري على الزوايا', 'زوايا Up-Down داخل المجرى', 'تعليق ألواح الحجر'], done: 'تم التركيب · نظام C-Channel' },
      undercut: { part: 'زاوية Undercut مع الانكر · ستانلس ستيل', steps: ['الجدار ومسامير الانكر', 'تثبيت زوايا الجدار', 'القوائم الألومنيوم العمودية', 'المجاري الألومنيوم الأفقية', 'تعليق الحجر بزوايا Undercut'], done: 'تم التركيب · نظام Undercut' },
      kerf: { part: 'مجرى أفقي بشفرة Kerf · ألومنيوم وستانلس', steps: ['الجدار ومسامير الانكر', 'تثبيت زوايا الجدار', 'القوائم الألومنيوم العمودية', 'المجاري الأفقية بالشفرة', 'تركيب الحجر على الشفرات'], done: 'تم التركيب · نظام المجاري' }
    }
  };
  Array.prototype.forEach.call(hosts, function (h) {
    try { Viewer(h); } catch (err) { h.classList.add('nogl'); if (window.console) console.warn('3D card disabled:', err); }
  });

  function Viewer(host) {
    var SYS = host.getAttribute('data-sys');
    var LBL = LABELS[RTL ? 'ar' : 'en'][SYS];
    var canvas = host.querySelector('canvas');
    var gl = null;
    try { gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true }); } catch (e) {}
    if (!gl || !LBL) { host.classList.add('nogl'); return; }
  /* ---------------- math ---------------- */
  function m4() { var m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }
  function mul(a, b) { var o = new Float32Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
  function persp(fy, asp, n, f) { var t = 1 / Math.tan(fy / 2), m = new Float32Array(16); m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m; }
  function ortho(l, r, b, t, n, f) { var m = m4(); m[0] = 2 / (r - l); m[5] = 2 / (t - b); m[10] = -2 / (f - n); m[12] = -(r + l) / (r - l); m[13] = -(t + b) / (t - b); m[14] = -(f + n) / (f - n); return m; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lookAt(e, c, u) {
    var z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x), m = m4();
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
    m[12] = -dot(x, e); m[13] = -dot(y, e); m[14] = -dot(z, e); return m;
  }
  function trs(x, y, z, s, rx) {
    var m = m4(), c = Math.cos(rx || 0), si = Math.sin(rx || 0);
    m[0] = s; m[5] = s * c; m[6] = s * si; m[9] = -s * si; m[10] = s * c; m[12] = x; m[13] = y; m[14] = z; return m;
  }
  function proj(m, p) {
    var x = p[0], y = p[1], z = p[2], w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w];
  }
  function lin(h) { return [1, 3, 5].map(function (i) { return Math.pow(parseInt(h.substr(i, 2), 16) / 255, 2.2); }); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function ease3(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeIO(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function backOut(t) { t = clamp(t, 0, 1); var c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  /* ---------------- geometry ---------------- */
  function Geo() { this.p = []; this.n = []; this.u = []; }
  Geo.prototype.tri = function (a, b, c, n, uv) {
    if (dot(cross(sub(b, a), sub(c, a)), n) < 0) { var t = b; b = c; c = t; }
    var q = [a, b, c];
    for (var i = 0; i < 3; i++) { var v = q[i], w = uv(v, n); this.p.push(v[0], v[1], v[2]); this.n.push(n[0], n[1], n[2]); this.u.push(w[0], w[1]); }
  };
  Geo.prototype.quad = function (a, b, c, d, n, uv) { this.tri(a, b, c, n, uv); this.tri(a, c, d, n, uv); };
  function planar(S) {
    return function (q, n) {
      var ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
      if (az >= ax && az >= ay) return [q[0] / S, q[1] / S];
      if (ax >= ay) return [q[2] / S, q[1] / S];
      return [q[0] / S, q[2] / S];
    };
  }
  // box with chamfered edges (catches light like real cut stone / folded metal)
  function cbox(g, cx, cy, cz, w, h, d, r, uv) {
    var X = w / 2, Y = h / 2, Z = d / 2; r = Math.min(r, X * .45, Y * .45, Z * .45);
    var x = X - r, y = Y - r, z = Z - r;
    function P(a, b, c) { return [cx + a, cy + b, cz + c]; }
    g.quad(P(X, -y, -z), P(X, y, -z), P(X, y, z), P(X, -y, z), [1, 0, 0], uv);
    g.quad(P(-X, -y, -z), P(-X, y, -z), P(-X, y, z), P(-X, -y, z), [-1, 0, 0], uv);
    g.quad(P(-x, Y, -z), P(x, Y, -z), P(x, Y, z), P(-x, Y, z), [0, 1, 0], uv);
    g.quad(P(-x, -Y, -z), P(x, -Y, -z), P(x, -Y, z), P(-x, -Y, z), [0, -1, 0], uv);
    g.quad(P(-x, -y, Z), P(x, -y, Z), P(x, y, Z), P(-x, y, Z), [0, 0, 1], uv);
    g.quad(P(-x, -y, -Z), P(x, -y, -Z), P(x, y, -Z), P(-x, y, -Z), [0, 0, -1], uv);
    if (r <= 0) return;
    var s = [-1, 1], i, j, k;
    for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) {
      var a = s[i], b = s[j];
      g.quad(P(a * X, b * y, -z), P(a * X, b * y, z), P(a * x, b * Y, z), P(a * x, b * Y, -z), norm([a, b, 0]), uv);
      g.quad(P(-x, a * Y, b * z), P(x, a * Y, b * z), P(x, a * y, b * Z), P(-x, a * y, b * Z), norm([0, a, b]), uv);
      g.quad(P(a * X, -y, b * z), P(a * X, y, b * z), P(a * x, y, b * Z), P(a * x, -y, b * Z), norm([a, 0, b]), uv);
    }
    for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) {
      var A = s[i], B = s[j], C = s[k];
      g.tri(P(A * X, B * y, C * z), P(A * x, B * Y, C * z), P(A * x, B * y, C * Z), norm([A, B, C]), uv);
    }
  }
  function cyl(g, cx, cy, cz, r, len, seg, axis, uv) {
    function P(u, v, w) { return axis === 'x' ? [cx + w, cy + u, cz + v] : axis === 'y' ? [cx + u, cy + w, cz + v] : [cx + u, cy + v, cz + w]; }
    function N(u, v, w) { return axis === 'x' ? [w, u, v] : axis === 'y' ? [u, w, v] : [u, v, w]; }
    var h = len / 2;
    for (var i = 0; i < seg; i++) {
      var a0 = i / seg * 6.2832, a1 = (i + 1) / seg * 6.2832, am = (a0 + a1) / 2;
      var c0 = Math.cos(a0) * r, s0 = Math.sin(a0) * r, c1 = Math.cos(a1) * r, s1 = Math.sin(a1) * r;
      g.quad(P(c0, s0, -h), P(c1, s1, -h), P(c1, s1, h), P(c0, s0, h), N(Math.cos(am), Math.sin(am), 0), uv);
      g.tri(P(0, 0, h), P(c0, s0, h), P(c1, s1, h), N(0, 0, 1), uv);
      g.tri(P(0, 0, -h), P(c0, s0, -h), P(c1, s1, -h), N(0, 0, -1), uv);
    }
  }

  /* ---------------- GL helpers ---------------- */
  function program(vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aNor'); gl.bindAttribLocation(p, 2, 'aUv');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }
  function upload(g) {
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    [[g.p, 3], [g.n, 3], [g.u, 2]].forEach(function (a, i) {
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a[0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, a[1], gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    return { vao: vao, count: g.p.length / 3 };
  }

  var VS = '#version 300 es\nlayout(location=0) in vec3 aPos;layout(location=1) in vec3 aNor;layout(location=2) in vec2 aUv;\n' +
    'uniform mat4 uM,uVP,uLVP;out vec3 vP;out vec3 vN;out vec2 vU;out vec4 vL;\n' +
    'void main(){vec4 w=uM*vec4(aPos,1.);vP=w.xyz;vN=mat3(uM)*aNor;vU=aUv;vL=uLVP*w;gl_Position=uVP*w;}';
  var SHADOW_FN =
    'float shadowAt(vec4 lp){vec3 s=lp.xyz/lp.w*.5+.5;if(s.z>1.||s.x<0.||s.x>1.||s.y<0.||s.y>1.)return 1.;float acc=0.;\n' +
    'for(int i=-2;i<=2;i++)for(int j=-2;j<=2;j++){acc+=texture(tSh,vec3(s.xy+vec2(float(i),float(j))*uShT*1.15,s.z-.0006));}return acc/25.;}\n';
  var FS = '#version 300 es\nprecision highp float;precision highp sampler2DShadow;\n' +
    'in vec3 vP;in vec3 vN;in vec2 vU;in vec4 vL;\n' +
    'uniform vec3 uCam,uLd,uLc,uCol;uniform float uRo,uMe,uMap,uNm,uNs,uBr,uEnv;uniform vec2 uUo,uShT;\n' +
    'uniform sampler2D tMap,tNrm;uniform sampler2DShadow tSh;out vec4 o;\n' +
    'float hash(float n){return fract(sin(n)*43758.5453);}\n' +
    'vec3 env(vec3 d,float r){float y=d.y;vec3 top=vec3(.98,.96,.93),hor=vec3(.34,.32,.30),gnd=vec3(.045,.04,.035);\n' +
    ' vec3 c=y>0.?mix(hor,top,pow(y,.55)):mix(hor,gnd,pow(-y,.45));\n' +
    ' c+=vec3(3.4,3.3,3.1)*smoothstep(.84-r*.5,.97-r*.25,dot(d,normalize(vec3(-.45,.55,.7))))*(1.-r*.6);\n' +
    ' c+=vec3(1.9,1.45,.85)*smoothstep(.86-r*.5,.98-r*.3,dot(d,normalize(vec3(.8,.22,.45))))*(1.-r*.6);\n' +
    ' c+=vec3(1.5)*smoothstep(.9-r*.4,.99,dot(d,normalize(vec3(0.,.97,.15))))*(1.-r*.7);return c;}\n' +
    'vec3 perturb(vec3 N,vec3 p,vec2 uv,vec3 m){vec3 q1=dFdx(p),q2=dFdy(p);vec2 s1=dFdx(uv),s2=dFdy(uv);\n' +
    ' vec3 a=cross(q2,N),b=cross(N,q1);vec3 T=a*s1.x+b*s2.x;vec3 B=a*s1.y+b*s2.y;float im=inversesqrt(max(dot(T,T),dot(B,B))+1e-20);\n' +
    ' return normalize(mat3(T*im,B*im,N)*m);}\n' + SHADOW_FN +
    'vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}\n' +
    'void main(){vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec2 uv=vU+uUo;vec3 base=uCol;float ro=uRo;\n' +
    ' if(uMap>.5)base*=texture(tMap,uv).rgb;\n' +
    ' if(uNm>.5){vec3 m=texture(tNrm,uv).xyz*2.-1.;m.xy*=uNs;N=perturb(N,vP,uv,normalize(m));}\n' +
    ' if(uBr>.5){float c=uBr>1.5?vU.y:vU.x;float l=hash(floor(c*1400.))*.55+hash(floor(c*260.))*.45;base*=.95+.1*l;ro=clamp(ro+(l-.5)*.08,.05,1.);}\n' +
    ' vec3 V=normalize(uCam-vP),L=normalize(uLd),H=normalize(V+L);\n' +
    ' float NL=max(dot(N,L),0.),NV=max(dot(N,V),1e-3),NH=max(dot(N,H),0.),VH=max(dot(V,H),0.);\n' +
    ' float a=ro*ro,a2=a*a,dd=NH*NH*(a2-1.)+1.,D=a2/(3.14159*dd*dd),k=(ro+1.)*(ro+1.)/8.;\n' +
    ' float G=(NL/(NL*(1.-k)+k))*(NV/(NV*(1.-k)+k));vec3 F0=mix(vec3(.04),base,uMe);vec3 F=F0+(1.-F0)*pow(1.-VH,5.);\n' +
    ' vec3 spec=D*G*F/max(4.*NL*NV,1e-3);vec3 kd=(1.-F)*(1.-uMe);float sh=shadowAt(vL);\n' +
    ' vec3 col=(kd*base/3.14159+spec)*uLc*NL*sh;\n' +
    ' vec3 amb=mix(vec3(.05,.045,.04),vec3(.34,.33,.31),N.y*.5+.5)*uEnv;col+=kd*base*amb*mix(.7,1.,sh);\n' +
    ' vec3 R=reflect(-V,N);vec3 Fe=F0+(max(vec3(1.-ro),F0)-F0)*pow(1.-NV,5.);\n' +
    ' col+=env(R,ro)*Fe*uEnv*(uMe>.5?1.:.3)*mix(.45,1.,sh);\n' +
    ' col=aces(col);o=vec4(pow(col,vec3(1./2.2)),1.);}';
  var FLOOR_FS = '#version 300 es\nprecision highp float;precision highp sampler2DShadow;\n' +
    'in vec3 vP;in vec3 vN;in vec2 vU;in vec4 vL;uniform vec2 uShT;uniform float uA;uniform vec3 uBox;uniform sampler2DShadow tSh;out vec4 o;\n' + SHADOW_FN +
    'void main(){float s=shadowAt(vL);float f=1.-smoothstep(.25,1.,length((vP.xz-vec2(0.,uBox.z*.5))/vec2(260.,170.+uBox.z*.6)));\n' +
    ' vec2 q=abs(vP.xz-vec2(0.,uBox.z*.5))-vec2(uBox.x,uBox.y+uBox.z*.5);float dd=length(max(q,0.));float ao=(1.-smoothstep(0.,26.,dd))*.55;\n' +
    ' float a=clamp((1.-s)*.62+ao,0.,.85)*f*uA;o=vec4(0.,0.,0.,a);}';
  var DEPTH_VS = '#version 300 es\nlayout(location=0) in vec3 aPos;uniform mat4 uM,uLVP;void main(){gl_Position=uLVP*uM*vec4(aPos,1.);}';
  var DEPTH_FS = '#version 300 es\nprecision mediump float;void main(){}';

    /* ---------------- per-viewer GL setup ---------------- */
    var prog = program(VS, FS), depthProg = program(DEPTH_VS, DEPTH_FS);
    var SH = 1024, shTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shTex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, SH, SH);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
    var shFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shTex, 0);
    gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var aniso = gl.getExtension('EXT_texture_filter_anisotropic');
    function solidTex(rgba) { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba)); return t; }
    var TEX = { white: solidTex([255, 255, 255, 255]), flat: solidTex([128, 128, 255, 255]) };
    function texFrom(name, srgb) {
      return getImg(name).then(function (im) {
        if (!im) return;
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        TEX[name] = t;
      });
    }

    var STONE = host.getAttribute('data-stone') === 'marble' ? 'marble' : 'stone';
    var MAT = {
      stone: STONE === 'marble' ? { c: lin('#ffffff'), ro: .26, me: 0, map: 'marble' }      // polished white marble (marble pages)
                                : { c: lin('#ffffff'), ro: .78, me: 0, map: 'stone', nrm: 'stone_n', ns: 1.15 },
      kerf: { c: lin('#2a251f'), ro: 1, me: 0 },
      wall: { c: lin('#cfcfcf'), ro: .95, me: 0, map: 'wall', nrm: 'wall_n', ns: 1.3 },
      galv: { c: lin('#8e949a'), ro: .5, me: .85 },
      alu: { c: lin('#dde1e4'), ro: .3, me: 1, br: 1 },
      ss: { c: lin('#d2d5d7'), ro: .22, me: 1, br: 2 },
      bolt: { c: lin('#bfc3c7'), ro: .34, me: 1 }
    };
    var UV = { stone: planar(120), wall: planar(160), m: planar(10) };

    /* ---------------- scene ---------------- */
    var parts = [];
    function part(o, build) {
      var gs = {}; build(function (m) { return gs[m] || (gs[m] = new Geo()); });
      var meshes = []; for (var m in gs) { var u = upload(gs[m]); u.mat = MAT[m]; meshes.push(u); }
      var p = { x: o.x || 0, y: o.y || 0, z: o.z || 0, kind: o.kind || 'pop', t0: o.t0 || 0, dur: o.dur || .6, hero: !!o.hero, reenter: !!o.reenter, uo: o.uo || [0, 0], tint: o.tint || 1, meshes: meshes };
      parts.push(p); return p;
    }
    // L-shaped angle fixed to the wall; tip = 'updown' (tongue plate) or 'pen' (pin); stone mid-plane at zs
    function angle(G, tip, zs) {
      cbox(G('ss'), 0, -5.2, .3, 7, 10.4, .6, .12, UV.m);                       // plate on the wall (below the joint)
      cbox(G('ss'), 0, 0, (zs + .6) / 2 + .3, 7, .6, zs - .6, .12, UV.m);        // arm through the joint
      cbox(G('ss'), 0, -2.2, (zs + .6) / 2 + .3, .5, 4, zs - 1.6, .08, UV.m);    // stiffening rib under the arm
      cyl(G('bolt'), 0, -6.4, .75, 1.3, .3, 24, 'z', UV.m);                      // washer
      cyl(G('bolt'), 0, -6.4, 1.35, 1, .9, 6, 'z', UV.m);                        // hex nut
      cyl(G('bolt'), 0, -6.4, 2.1, .52, 1.2, 16, 'z', UV.m);                     // anchor stud
      if (tip === 'pen') { cyl(G('ss'), 0, 0, zs, .32, 6.4, 16, 'y', UV.m); cyl(G('bolt'), 0, .55, zs, .7, .5, 6, 'y', UV.m); }
      else cbox(G('ss'), 0, 0, zs, 5, 6.4, .3, .05, UV.m);                       // tongue: up into the upper stone, down into the lower
    }
    function stone(G, w, edgeMarks, zs, kind) {
      cbox(G('stone'), 0, 0, 0, w, 40, 3, .28, UV.stone);
      edgeMarks.forEach(function (x) {
        [20.02, -20.02].forEach(function (y) {
          if (kind === 'pen') cyl(G('kerf'), x, y, 0, .4, .06, 16, 'y', UV.m);
          else cbox(G('kerf'), x, y, 0, 7, .06, .38, 0, UV.m);
        });
      });
    }
    var BUILD = 5.4, STEPS = [0, 1.3, 2.4, 3.6], PROD, BUILT, SIDE;
    if (SYS === 'updown' || SYS === 'pen') {
      var ZS = 11.5, AX = [17, -17];
      part({ kind: 'wall', t0: 0, dur: 1.1, z: -10 }, function (G) { cbox(G('wall'), 0, -2, 0, 104, 104, 20, .6, UV.wall); });
      part({ hero: true, x: AX[0] }, function (G) { angle(G, SYS, ZS); });
      part({ kind: 'pop', t0: 1.25, dur: .55, x: AX[1] }, function (G) { angle(G, SYS, ZS); });
      part({ kind: 'stoneUp', t0: 2.3, dur: 1.25, y: -20.4, z: ZS, uo: [.13, .4] }, function (G) { stone(G, 48, AX, ZS, SYS); });
      part({ kind: 'stoneDown', t0: 3.55, dur: 1.3, y: 20.4, z: ZS, uo: [.61, .07], tint: .97 }, function (G) { stone(G, 48, AX, ZS, SYS); });
      PROD = { tgt: [AX[0], -2.4, 5.6], dist: 40, yaw: -44, pitch: 16 };
      BUILT = { tgt: [0, -3, 4], dist: 190, yaw: -30, pitch: 13 };
      SIDE = { tgt: [-12, 0, 6], dist: 112, yaw: -66, pitch: 9 };
    } else if (SYS === 'undercut' || SYS === 'kerf') {
      // wall -> wall brackets -> vertical aluminium supports -> horizontal aluminium rails -> stone
      BUILD = 6.5;
      var VX = [22, -22];
      part({ kind: 'wall', t0: 0, dur: 1.1, z: -10 }, function (G) { cbox(G('wall'), 0, -2, 0, 104, 104, 20, .6, UV.wall); });
      [30, -30].forEach(function (by, i) {
        VX.forEach(function (vx, j) {
          part({ kind: 'pop', t0: .95 + (i * 2 + j) * .12, dur: .5, x: vx, y: by }, function (G) {
            cbox(G('galv'), -6.4, 0, .3, 8.4, 10, .6, .12, UV.m);
            cbox(G('galv'), -2.3, 0, 5, .6, 10, 9.4, .12, UV.m);
            cyl(G('bolt'), -8, 0, .75, 1.25, .3, 24, 'z', UV.m); cyl(G('bolt'), -8, 0, 1.3, .95, .8, 6, 'z', UV.m); cyl(G('bolt'), -8, 0, 2, .5, 1.1, 16, 'z', UV.m);
            cyl(G('bolt'), -2.95, 2.6, 8, .8, .55, 6, 'x', UV.m); cyl(G('bolt'), -2.95, -2.6, 8, .8, .55, 6, 'x', UV.m);
          });
        });
      });
      VX.forEach(function (vx, j) {                                            // vertical supports (aluminium C profile)
        part({ kind: 'slide', t0: 1.75 + j * .2, dur: .8, x: vx }, function (G) {
          cbox(G('alu'), 0, 0, 6.15, 4, 100, .3, .06, UV.m);
          cbox(G('alu'), -1.85, 0, 8.1, .3, 100, 4.2, .06, UV.m); cbox(G('alu'), 1.85, 0, 8.1, .3, 100, 4.2, .06, UV.m);
          cbox(G('alu'), -1.35, 0, 10.05, .75, 100, .3, .05, UV.m); cbox(G('alu'), 1.35, 0, 10.05, .75, 100, .3, .05, UV.m);
        });
      });
      function railBolts(G, ry) { VX.forEach(function (vx) { cyl(G('bolt'), vx, ry - 4.5, 10.75, .7, .5, 6, 'z', UV.m); }); }
      if (SYS === 'undercut') {
        var RYS = [10, -16], ZST = 15;
        function hookRail(G, ry) {
          cbox(G('alu'), 0, ry - 2.5, 10.35, 78, 7, .3, .05, UV.m);           // web on the vertical supports
          cbox(G('alu'), 0, ry + .85, 11.35, 78, .3, 1.7, .05, UV.m);         // shelf
          cbox(G('alu'), 0, ry + 1.8, 12.05, 78, 1.6, .3, .05, UV.m);         // upturned lip
          railBolts(G, ry);
        }
        RYS.forEach(function (ry, i) { part({ kind: 'slideX', t0: 2.7 + i * .3, dur: .8 }, function (G) { hookRail(G, ry); }); });
        function hanger(G, hx, ry, oz) {                                       // undercut bracket + anchor
          var Z = -oz;
          cbox(G('ss'), hx, ry + .9, Z + 13.25, 5, 4.6, .3, .05, UV.m);
          cbox(G('ss'), hx, ry + 3, Z + 12.2, 5, .3, 2.4, .05, UV.m);
          cbox(G('ss'), hx, ry + 2, Z + 11.15, 5, 1.8, .3, .05, UV.m);
          cyl(G('bolt'), hx, ry + .3, Z + 12.85, .55, .5, 6, 'z', UV.m);
          cyl(G('bolt'), hx, ry + .3, Z + 13.03, .85, .15, 24, 'z', UV.m);
          cyl(G('bolt'), hx, ry + .3, Z + 14.3, .48, 1.7, 16, 'z', UV.m);
          cyl(G('bolt'), hx, ry + .3, Z + 15, .7, .45, 16, 'z', UV.m);
        }
        part({ hero: true, reenter: true, kind: 'stoneDown', t0: 3.95, dur: 2, z: ZST }, function (G) { hanger(G, 18, RYS[0], ZST); });
        part({ kind: 'stoneDown', t0: 3.95, dur: 2, y: 0, z: ZST, uo: [.3, .55] }, function (G) {
          cbox(G('stone'), 0, 0, 0, 56, 40, 3, .28, UV.stone);
          [[-18, RYS[0]], [18, RYS[1]], [-18, RYS[1]]].forEach(function (h) { hanger(G, h[0], h[1], ZST); });
        });
        STEPS = [0, .95, 1.75, 2.7, 3.95];
        PROD = { tgt: [18, RYS[0] + 1.2, 13], dist: 21, yaw: -38, pitch: 16 };
        SIDE = { tgt: [-14, 0, 10], dist: 108, yaw: -72, pitch: 14 };
      } else {
        var ZK = 15.5, KR = [-40.8, 0, 40.8];
        function kerfRail(G, ry, up, down) {
          cbox(G('alu'), 0, ry - 2, 10.35, 78, 8, .3, .05, UV.m);              // web on the vertical supports
          cbox(G('alu'), 0, ry, 13.07, 78, .4, 5.15, .05, UV.m);               // shelf through the joint
          if (up && down) cbox(G('ss'), 0, ry, ZK, 54, 5.6, .3, .05, UV.m);    // blade up & down
          else if (up) cbox(G('ss'), 0, ry + 1.55, ZK, 54, 2.7, .3, .05, UV.m);
          else cbox(G('ss'), 0, ry - 1.55, ZK, 54, 2.7, .3, .05, UV.m);
          railBolts(G, ry);
        }
        part({ hero: true, reenter: true, kind: 'slideX', t0: 2.85, dur: .8 }, function (G) { kerfRail(G, KR[1], true, true); });
        part({ kind: 'slideX', t0: 2.7, dur: .8 }, function (G) { kerfRail(G, KR[0], true, false); });
        part({ kind: 'slideX', t0: 3.0, dur: .8 }, function (G) { kerfRail(G, KR[2], false, true); });
        function kstone(G) { cbox(G('stone'), 0, 0, 0, 56, 40, 3, .28, UV.stone); cbox(G('kerf'), 0, 20.02, 0, 54, .06, .38, 0, UV.m); cbox(G('kerf'), 0, -20.02, 0, 54, .06, .38, 0, UV.m); }
        part({ kind: 'stoneUp', t0: 3.9, dur: 1.2, y: -20.4, z: ZK, uo: [.13, .4] }, kstone);
        part({ kind: 'stoneDown', t0: 5.15, dur: 1.25, y: 20.4, z: ZK, uo: [.61, .07], tint: .97 }, kstone);
        STEPS = [0, .95, 1.75, 2.7, 3.9];
        PROD = { tgt: [26, -1, 13], dist: 46, yaw: -64, pitch: 24 };
        SIDE = { tgt: [-14, 0, 10], dist: 112, yaw: -68, pitch: 10 };
      }
      BUILT = { tgt: [0, -3, 6], dist: 190, yaw: -30, pitch: 13 };
    } else {
      var CXs = [17, -17], ZC = 15.5;
      part({ kind: 'wall', t0: 0, dur: 1.1, z: -10 }, function (G) { cbox(G('wall'), 0, -2, 0, 104, 104, 20, .6, UV.wall); });
      [-30, 30].forEach(function (by, i) {
        CXs.forEach(function (cx, j) {
          part({ kind: 'pop', t0: .95 + (i * 2 + j) * .12, dur: .5, x: cx, y: by }, function (G) {
            cbox(G('galv'), -6.4, 0, .3, 8.4, 10, .6, .12, UV.m);
            cbox(G('galv'), -2.3, 0, 5, .6, 10, 9.4, .12, UV.m);
            cyl(G('bolt'), -8, 0, .75, 1.25, .3, 24, 'z', UV.m); cyl(G('bolt'), -8, 0, 1.3, .95, .8, 6, 'z', UV.m); cyl(G('bolt'), -8, 0, 2, .5, 1.1, 16, 'z', UV.m);
            cyl(G('bolt'), -2.95, 2.6, 8, .8, .55, 6, 'x', UV.m); cyl(G('bolt'), -2.95, -2.6, 8, .8, .55, 6, 'x', UV.m);
          });
        });
      });
      function channel(G) {
        cbox(G('galv'), 0, 0, 6.15, 4, 96, .3, .06, UV.m);
        cbox(G('galv'), -1.85, 0, 8.1, .3, 96, 4.2, .06, UV.m); cbox(G('galv'), 1.85, 0, 8.1, .3, 96, 4.2, .06, UV.m);
        cbox(G('galv'), -1.35, 0, 10.05, .75, 96, .3, .05, UV.m); cbox(G('galv'), 1.35, 0, 10.05, .75, 96, .3, .05, UV.m);
        for (var sy = -42; sy <= 42; sy += 6) cbox(G('kerf'), 0, sy, 6.32, 1.1, 2.8, .04, 0, UV.m);     // slotted holes along the back of the channel
      }
      part({ hero: true, x: CXs[0] }, channel);
      part({ kind: 'slide', t0: 1.45, dur: .8, x: CXs[1] }, channel);
      var JY = [-40.8, 0, 40.8];
      JY.forEach(function (jy, k) {
        CXs.forEach(function (cx, j) {
          part({ kind: 'clip', t0: 2.35 + (k * 2 + j) * .11, dur: .55, x: cx, y: jy }, function (G) {
            cbox(G('ss'), 0, 0, 10.4, 6, 8, .4, .07, UV.m);
            cyl(G('bolt'), 0, k === 2 ? -2.7 : 2.7, 10.95, .75, .7, 6, 'z', UV.m);
            cbox(G('ss'), 0, 0, 13, 6, .4, 5.2, .07, UV.m);
            if (k < 2) cbox(G('ss'), 0, 1.9, ZC, 4, 3.4, .3, .05, UV.m);
            if (k > 0) cbox(G('ss'), 0, -1.9, ZC, 4, 3.4, .3, .05, UV.m);
          });
        });
      });
      part({ kind: 'stoneUp', t0: 3.3, dur: 1.05, y: -20.4, z: ZC, uo: [.13, .4] }, function (G) { stone(G, 48, CXs, ZC, 'kerf'); });
      part({ kind: 'stoneDown', t0: 4.2, dur: 1.15, y: 20.4, z: ZC, uo: [.61, .07], tint: .97 }, function (G) { stone(G, 48, CXs, ZC, 'kerf'); });
      STEPS = [0, 1.45, 2.35, 3.3];
      PROD = { tgt: [CXs[0], 40, 8], dist: 44, yaw: -40, pitch: 34 };
      BUILT = { tgt: [0, -3, 5], dist: 190, yaw: -30, pitch: 13 };
      SIDE = { tgt: [-10, 4, 8], dist: 132, yaw: -64, pitch: 11 };
    }

    function partState(p, tb) {
      var dx = 0, dy = 0, dz = 0, s = 1, rx = 0, vis = true;
      if (p.reenter && tb > 0 && tb < p.t0) {
        // the close-up part leaves while the camera pulls back, and comes back at its own step
        var qe = tb / .55;
        if (qe >= 1) return { vis: false, m: null };
        return { vis: true, m: trs(p.x, p.y, p.z + ease3(qe) * 45, 1 - ease3(qe) * .7, 0) };
      }
      if (!p.hero || (p.reenter && tb > 0)) {
        var q = (tb - p.t0) / p.dur;
        if (q <= 0) vis = false;
        else if (q < 1) {
          if (p.kind === 'wall') { dz = -(1 - ease3(q)) * 120; }
          else if (p.kind === 'pop') { dz = (1 - ease3(q)) * 18; s = .3 + .7 * backOut(q); }
          else if (p.kind === 'slide') { dy = (1 - ease3(q)) * 130; }
          else if (p.kind === 'slideX') { dx = (RTL ? 1 : -1) * (1 - ease3(q)) * 120; }
          else if (p.kind === 'clip') { dy = (1 - ease3(q)) * 34; dz = (1 - ease3(q)) * 6; }
          else if (p.kind === 'stoneUp' || p.kind === 'stoneDown') {
            var a = clamp(q / .7, 0, 1), b = clamp((q - .7) / .3, 0, 1), sg = p.kind === 'stoneUp' ? -1 : 1;
            dz = (1 - ease3(a)) * 70; dy = sg * (1 - easeIO(b)) * 6 + sg * (1 - ease3(a)) * 10; rx = -(1 - ease3(a)) * .25;
          }
        }
      }
      return { vis: vis, m: trs(p.x + dx, p.y + dy, p.z + dz, s, rx) };
    }

    /* ---------------- state machine: product shot -> build -> hold -> back ---------------- */
    var mode = reduce ? 'hold' : 'product', tb = reduce ? BUILD : 0, modeT = 0, hover = false, visible = false, W = 1, H = 1, dpr = 1;
    var spin = 0, parY = 0, parYT = 0, last = 0, raf = 0, ready = false;
    var capEl = host.querySelector('.s3cap'), capTxt = '';
    var hb = 0;                                                // 0 = front view, 1 = side view that reveals the fixing behind the stone
    function camLerp() {
      var k = easeIO(clamp(tb / 2.1, 0, 1)), h = easeIO(hb);
      var c = {}; ['dist', 'yaw', 'pitch'].forEach(function (n) { c[n] = mix(mix(PROD[n], BUILT[n], k), SIDE[n], h); });
      c.tgt = [0, 1, 2].map(function (i) { return mix(mix(PROD.tgt[i], BUILT.tgt[i], k), SIDE.tgt[i], h); });
      var turn = (1 - k) * Math.sin(spin) * 30;                // product turntable
      c.yaw = (c.yaw + turn + parY) * (RTL ? -1 : 1);
      return c;
    }
    function render() {
      var c = camLerp(), yaw = c.yaw * DEG, pitch = c.pitch * DEG, t = c.tgt;
      var eye = [t[0] + c.dist * Math.sin(yaw) * Math.cos(pitch), t[1] + c.dist * Math.sin(pitch), t[2] + c.dist * Math.cos(yaw) * Math.cos(pitch)];
      var vp = mul(persp(30 * DEG, W / H, c.dist * .1, c.dist * 6), lookAt(eye, t, [0, 1, 0]));
      var L = norm([(RTL ? .7 : -.7), .75, .55]), le = [t[0] + L[0] * 300, t[1] + L[1] * 300, t[2] + L[2] * 300];
      var R = c.dist * .62 + 14;
      var lvp = mul(ortho(-R, R, -R, R, 300 - R * 1.6, 300 + R * 1.6), lookAt(le, t, [0, 1, 0]));
      var st = parts.map(function (p) { return partState(p, tb); });
      gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo); gl.viewport(0, 0, SH, SH); gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.6, 3);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null);
      gl.useProgram(depthProg.p); gl.uniformMatrix4fv(depthProg.u.uLVP, false, lvp);
      parts.forEach(function (p, n) { if (!st[n].vis) return; gl.uniformMatrix4fv(depthProg.u.uM, false, st[n].m); p.meshes.forEach(function (me) { gl.bindVertexArray(me.vao); gl.drawArrays(gl.TRIANGLES, 0, me.count); }); });
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
      var u = prog.u; gl.useProgram(prog.p);
      gl.uniformMatrix4fv(u.uVP, false, vp); gl.uniformMatrix4fv(u.uLVP, false, lvp); gl.uniform3fv(u.uCam, eye); gl.uniform3fv(u.uLd, L);
      gl.uniform3f(u.uLc, 3.2, 3.08, 2.88); gl.uniform2f(u.uShT, 1 / SH, 1 / SH); gl.uniform1f(u.uEnv, 1);
      gl.uniform1i(u.tMap, 0); gl.uniform1i(u.tNrm, 1); gl.uniform1i(u.tSh, 2);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, shTex);
      parts.forEach(function (p, n) {
        if (!st[n].vis) return;
        gl.uniformMatrix4fv(u.uM, false, st[n].m); gl.uniform2fv(u.uUo, p.uo);
        p.meshes.forEach(function (me) {
          var m = me.mat, tt = p.tint;
          gl.uniform3f(u.uCol, m.c[0] * tt, m.c[1] * tt, m.c[2] * tt);
          gl.uniform1f(u.uRo, m.ro); gl.uniform1f(u.uMe, m.me); gl.uniform1f(u.uBr, m.br || 0);
          gl.uniform1f(u.uMap, m.map && TEX[m.map] ? 1 : 0); gl.uniform1f(u.uNm, m.nrm && TEX[m.nrm] ? 1 : 0); gl.uniform1f(u.uNs, m.ns || 1);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, (m.map && TEX[m.map]) || TEX.white);
          gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, (m.nrm && TEX[m.nrm]) || TEX.flat);
          gl.bindVertexArray(me.vao); gl.drawArrays(gl.TRIANGLES, 0, me.count);
        });
      });
      gl.bindVertexArray(null);
      // caption
      var txt;
      if (mode === 'product' || (mode === 'back' && tb < .6)) txt = '<i>●</i>' + LBL.part;
      else if (tb >= BUILD - .05) txt = '<i>✓</i>' + LBL.done;
      else { var sI = 0; for (var q = 0; q < STEPS.length; q++) if (tb >= STEPS[q]) sI = q; txt = '<i>0' + (sI + 1) + '</i>' + LBL.steps[sI]; }
      if (txt !== capTxt && capEl) { capEl.innerHTML = txt; capTxt = txt; }
    }
    function step(dt) {
      modeT += dt; spin += dt * .55;
      if (mode === 'product') { if (hover || modeT > 2.8) { mode = 'build'; modeT = 0; } }
      else if (mode === 'build') { tb = Math.min(BUILD, tb + dt); if (tb >= BUILD) { mode = 'hold'; modeT = 0; } }
      else if (mode === 'hold') { if (modeT > .5) hb = Math.min(1, hb + dt / 1.9); if (!hover && modeT > 5.6 && !reduce) { mode = 'back'; modeT = 0; } }
      else if (mode === 'back') {
        if (hover) { mode = 'hold'; modeT = 1; }
        else if (hb > 0) hb = Math.max(0, hb - dt / 1.1);
        else { tb = Math.max(0, tb - dt * 3.2); if (tb <= 0) { mode = 'product'; modeT = 0; spin = 0; } }
      }
      parY += (parYT - parY) * (1 - Math.exp(-dt * 6));
    }
    function frame(ts) {
      raf = 0; var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts;
      if (!visible || document.hidden) { last = 0; return; }
      if (!reduce) step(dt);
      render();
      if (!reduce || Math.abs(parYT - parY) > .01) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf && visible && ready) raf = requestAnimationFrame(frame); }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(canvas.clientWidth * dpr)); H = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      if (ready) render();
    }
    host.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { hover = true; kick(); } });
    host.addEventListener('pointerleave', function () { hover = false; parYT = 0; kick(); });
    host.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var r = host.getBoundingClientRect(); parYT = ((e.clientX - r.left) / r.width - .5) * 16; kick(); });
    host.addEventListener('click', function () { if (mode === 'product' || mode === 'back') { mode = 'build'; modeT = 0; kick(); } });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; kick(); }, { threshold: .35 }).observe(host);
    else visible = true;
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); host.classList.remove('live'); host.classList.add('nogl'); });
    Promise.all([texFrom(STONE, true), texFrom('stone_n', false), texFrom('wall', true), texFrom('wall_n', false)]).then(function () {
      ready = true; resize(); render(); host.classList.add('live'); kick();
    });
    host.__sys3d = {
      set: function (o) { if (o.mode) mode = o.mode; if (o.tb != null) tb = o.tb; if (o.spin != null) spin = o.spin; if (o.hb != null) hb = o.hb; modeT = 0; parY = parYT = 0; render(); },
      snap: function () { render(); return canvas.toDataURL('image/png'); }
    };
  }
})();
