/* AL-Swati Contracting — real-time 3D stone facade (WebGL2, no libraries).
   Wall -> anchor bolts + wall brackets -> vertical C-Channels -> Up-Down angles -> stone panels.
   Mouse wheel over the model separates the layers (exploded view); drag rotates. */
(function () {
  'use strict';
  var host = document.querySelector('.stage3d');
  if (!host) return;
  var canvas = host.querySelector('canvas.gl3d');
  var gl = null;
  try { gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) {}
  if (!gl) { host.classList.add('nogl'); return; }

  var RTL = document.documentElement.dir === 'rtl', SIDE = RTL ? 1 : -1;
  var T = {}; try { T = JSON.parse(host.getAttribute('data-t')); } catch (e) {}
  var touchMode = !!(window.matchMedia && matchMedia('(hover: none)').matches);
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DEG = Math.PI / 180;

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
    ' if(uBr>.5){float c=uBr>1.5?vU.y:vU.x;float l=hash(floor(c*1400.))*.55+hash(floor(c*260.))*.45;base*=.9+.2*l;ro=clamp(ro+(l-.5)*.14,.05,1.);}\n' +
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

  var prog, floorProg, depthProg;
  try { prog = program(VS, FS); floorProg = program(VS, FLOOR_FS); depthProg = program(DEPTH_VS, DEPTH_FS); }
  catch (e) { host.classList.add('nogl'); if (window.console) console.warn('3D disabled:', e); return; }

  /* ---------------- shadow map ---------------- */
  var SH = touchMode ? 1024 : 2048;
  var shTex = gl.createTexture();
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

  /* ---------------- textures ---------------- */
  var aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  function solidTex(rgba) { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba)); return t; }
  var TEX = { white: solidTex([255, 255, 255, 255]), flat: solidTex([128, 128, 255, 255]) };
  function loadTex(name, srgb) {
    return new Promise(function (res) {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        TEX[name] = t; res();
      };
      im.onerror = function () { res(); };
      im.src = '/assets/3d/' + name + '.webp';
    });
  }

  /* ---------------- materials ---------------- */
  var MAT = {
    stone: { c: lin('#ffffff'), ro: .78, me: 0, map: 'stone', nrm: 'stone_n', ns: 1.15, br: 0, S: 120 },
    kerf: { c: lin('#2a251f'), ro: 1, me: 0, S: 10 },
    wall: { c: lin('#cfcfcf'), ro: .95, me: 0, map: 'wall', nrm: 'wall_n', ns: 1.3, S: 160 },
    galv: { c: lin('#8e949a'), ro: .52, me: .85, br: 0, S: 10 },
    alu: { c: lin('#dde1e4'), ro: .3, me: 1, br: 1, S: 10 },
    ss: { c: lin('#d2d5d7'), ro: .24, me: 1, br: 2, S: 10 },
    bolt: { c: lin('#bfc3c7'), ro: .36, me: 1, br: 0, S: 10 }
  };

  /* ---------------- the facade ---------------- */
  var GAP = 46;                                   // exploded spacing between layers (cm)
  var LAYER_D = [0, 1, 2, 3.1, 4.75];             // how far each layer travels out of the wall
  var CX = [-60.8, 0, 60.8], ROWY = [-61.2, -20.4, 20.4, 61.2];
  var JY = [-81.6, -40.8, 0, 40.8, 81.6], CHX = [-83.2, -30.4, 30.4, 83.2], BRY = [-62, -20.5, 20.5, 62];
  var parts = [], seq = 0;
  function part(layer, x, y, z, kind, t0, dur, build, extra) {
    var gs = {}; build(function (m) { return gs[m] || (gs[m] = new Geo()); });
    var meshes = []; for (var m in gs) { var u = upload(gs[m]); u.mat = MAT[m]; meshes.push(u); }
    var p = { layer: layer, x: x, y: y, z: z, kind: kind, t0: t0, dur: dur, meshes: meshes, uo: [0, 0], tint: 1, id: seq++ };
    if (extra) for (var k in extra) p[k] = extra[k];
    parts.push(p); return p;
  }
  var UV = { stone: planar(120), wall: planar(160), m: planar(10) };

  part(0, 0, -6, -10, 'wall', 0, 0, function (G) { cbox(G('wall'), 0, 0, 0, 236, 208, 20, .8, UV.wall); });

  var i = 0, c, k, r, LBL = {};
  // 1) anchor bolts + L wall brackets (galvanised steel)
  for (c = 0; c < 4; c++) for (k = 0; k < 4; k++) {
    var br = part(1, CHX[c], BRY[k], 0, 'pop', .45 + i * .06, .55, function (G) {
      cbox(G('galv'), -6.4, 0, .3, 8.4, 10, .6, .12, UV.m);              // plate on the wall
      cbox(G('galv'), -2.3, 0, 5, .6, 10, 9.4, .12, UV.m);               // arm reaching the channel
      cyl(G('bolt'), -8.0, 0, .75, 1.25, .3, 24, 'z', UV.m);             // washer
      cyl(G('bolt'), -8.0, 0, 1.3, .95, .8, 6, 'z', UV.m);               // hex nut
      cyl(G('bolt'), -8.0, 0, 2.0, .5, 1.1, 16, 'z', UV.m);              // anchor stud
      cyl(G('bolt'), -2.95, 2.6, 8, .8, .55, 6, 'x', UV.m);              // bolts into the channel
      cyl(G('bolt'), -2.95, -2.6, 8, .8, .55, 6, 'x', UV.m);
    });
    if (c === (RTL ? 3 : 0) && k === 3) LBL.bracket = { p: br, pt: [-6.4, 5, .6] };
    i++;
  }
  // 2) vertical C-channels (galvanised steel, slotted back): web + flanges + lips, open side facing the stone
  for (c = 0; c < 4; c++) {
    var ch = part(2, CHX[c], 0, 0, 'slide', 1.95 + c * .17, .85, function (G) {
      cbox(G('galv'), 0, 0, 6.15, 4, 186, .3, .06, UV.m);
      cbox(G('galv'), -1.85, 0, 8.1, .3, 186, 4.2, .06, UV.m);
      cbox(G('galv'), 1.85, 0, 8.1, .3, 186, 4.2, .06, UV.m);
      cbox(G('galv'), -1.35, 0, 10.05, .75, 186, .3, .05, UV.m);
      cbox(G('galv'), 1.35, 0, 10.05, .75, 186, .3, .05, UV.m);
      for (var sy = -87; sy <= 87; sy += 6) cbox(G('kerf'), 0, sy, 6.32, 1.1, 2.8, .04, 0, UV.m);   // slotted holes along the back of the channel
    });
    if (c === (RTL ? 3 : 0)) LBL.channel = { p: ch, pt: [0, 93, 10] };
  }
  // 3) Up-Down angles (stainless): back plate on the channel, shelf through the joint, tongues up & down into the kerfs
  i = 0;
  for (k = 0; k < 5; k++) for (c = 0; c < 4; c++) {
    (function (k) {
      var an = part(3, CHX[c], JY[k], 0, 'pop', 3.0 + i * .045, .45, function (G) {
        cbox(G('ss'), 0, 0, 10.4, 6, 8, .4, .07, UV.m);
        cyl(G('bolt'), 0, k === 4 ? -2.7 : 2.7, 10.95, .75, .7, 6, 'z', UV.m);
        cbox(G('ss'), 0, 0, 13.0, 6, .4, 5.2, .07, UV.m);
        if (k < 4) cbox(G('ss'), 0, 1.9, 15.5, 4, 3.4, .3, .05, UV.m);
        if (k > 0) cbox(G('ss'), 0, -1.9, 15.5, 4, 3.4, .3, .05, UV.m);
      });
      if (c === (RTL ? 3 : 0) && k === 4) LBL.angle = { p: an, pt: [0, 0, 13] };
    })(k);
    i++;
  }
  // 4) stone panels, bottom row first; top-right corner left open so the system stays visible
  i = 0;
  var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(11);
  for (r = 0; r < 4; r++) for (c = 0; c < 3; c++) {
    if (c === 2 && r >= 2) continue;
    (function (cx, ry) {
      var st = part(4, cx, ry, 15.5, 'fly', 4.05 + i * .3, .95, function (G) {
        cbox(G('stone'), 0, 0, 0, 60, 40, 3, .28, UV.stone);
        for (var q = 0; q < 4; q++) {                                   // kerf slots where the tongues engage
          var rel = CHX[q] - cx; if (Math.abs(rel) > 33) continue;
          var sc = clamp(rel, -26.5, 26.5);
          cbox(G('kerf'), sc, 20.02, 0, 7, .06, .38, 0, UV.m);
          cbox(G('kerf'), sc, -20.02, 0, 7, .06, .38, 0, UV.m);
        }
      }, { uo: [rnd(), rnd()], tint: .9 + rnd() * .14 });
      if (cx === (RTL ? 0 : CX[0]) && ry === ROWY[3]) LBL.stone = { p: st, pt: [RTL ? 22 : -22, 16, 1.5] };
    })(CX[c], ROWY[r]);
    i++;
  }
  LBL.wall = { p: parts[0], pt: [RTL ? 112 : -112, 104, 10] };
  var INTRO_END = 4.05 + (i - 1) * .3 + .95 + .25;
  var LORDER = ['stone', 'angle', 'channel', 'bracket', 'wall'];

  // floor (shadow catcher)
  var fg = new Geo(); fg.quad([-420, 0, -260], [420, 0, -260], [420, 0, 420], [-420, 0, 420], [0, 1, 0], UV.m);
  var floorMesh = upload(fg);

  /* ---------------- state ---------------- */
  var introT = reduce ? INTRO_END : 0, introSpeed = 1, started = false;
  var EX = 0, exT = 0, camZoom = 1, camOff = [0, 0, 0], noShift = false, maxLayer = 9;
  var dragYaw = 0, dragPitch = 0, vy = 0, vp = 0, parY = 0, parP = 0, parYT = 0, parPT = 0, drag = null;
  var visible = true, ready = false, dpr = 1, W = 1, H = 1, lastVP = null, interacted = false;

  function camera() {
    var asp = W / H, intro = easeIO(introT / INTRO_END);
    var fov = 26 * DEG;
    var yaw = (SIDE * (mix(6, 27, intro) + EX * 24) + dragYaw + parY) * DEG;
    var pitch = (mix(3, 9, intro) + dragPitch + parP + EX * 7) * DEG;
    var depth = LAYER_D[4] * GAP * EX;
    var tgt = [camOff[0], -4 + camOff[1], (depth + 17) * .5 - 6 + camOff[2]];
    var hx = 120, hy = 106, hz = (depth + 40) * .5;
    var R = Math.sqrt(hx * hx + hy * hy + hz * hz);
    var half = Math.min(fov / 2, Math.atan(Math.tan(fov / 2) * asp));
    var small = W / dpr < 560;
    var dist = R / Math.sin(half) * .8 * mix(1.1, 1, intro) * (1 + EX * (small ? .34 : .18)) * camZoom;
    var eye = [tgt[0] + dist * Math.sin(yaw) * Math.cos(pitch), tgt[1] + dist * Math.sin(pitch), tgt[2] + dist * Math.cos(yaw) * Math.cos(pitch)];
    var P = persp(fov, asp, dist * .2, dist * 3);
    P[9] = noShift ? 0 : EX * (small ? .34 : .2);              // lower the model a little to make room for the labels above it
    return { vp: mul(P, lookAt(eye, tgt, [0, 1, 0])), eye: eye, tgt: tgt };
  }

  function partState(p) {
    var dx = 0, dy = 0, dz = 0, s = 1, rx = 0, vis = true;
    if (p.layer > maxLayer) vis = false;
    if (p.kind !== 'wall') {
      var q = (introT - p.t0) / p.dur;
      if (q <= 0) vis = false;
      else if (q < 1) {
        if (p.kind === 'pop') { dz = (1 - ease3(q)) * 26; s = .3 + .7 * backOut(q); }
        else if (p.kind === 'slide') { dy = (1 - ease3(q)) * 250; }
        else if (p.kind === 'fly') { var a = clamp(q / .72, 0, 1), b = clamp((q - .72) / .28, 0, 1); dz = (1 - ease3(a)) * 160; dy = (1 - easeIO(b)) * 4.6 + (1 - ease3(a)) * 14; rx = -(1 - ease3(a)) * .32; s = .85 + .15 * ease3(a); }
      }
    }
    return { vis: vis, m: trs(p.x + dx, p.y + dy, p.z + dz + LAYER_D[p.layer] * EX * GAP, s, rx) };
  }

  var LD = norm([SIDE * 0.72, 0.74, 0.5]);   // raking key light from the upper front, on the camera side

  function render() {
    if (!visible || document.hidden || !ready) return;
    var cam = camera(); lastVP = cam.vp;
    var depth = LAYER_D[4] * GAP * EX;
    var lc = cam.tgt, le = [lc[0] + LD[0] * 420, lc[1] + LD[1] * 420, lc[2] + LD[2] * 420];
    var lvp = mul(ortho(-210, 210, -210, 210, 120, 760), lookAt(le, lc, [0, 1, 0]));
    var states = parts.map(partState);

    // shadow pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, shFbo); gl.viewport(0, 0, SH, SH);
    gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.6, 3);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(depthProg.p); gl.uniformMatrix4fv(depthProg.u.uLVP, false, lvp);
    parts.forEach(function (p, n) {
      var st = states[n]; if (!st.vis) return;
      gl.uniformMatrix4fv(depthProg.u.uM, false, st.m);
      p.meshes.forEach(function (me) { gl.bindVertexArray(me.vao); gl.drawArrays(gl.TRIANGLES, 0, me.count); });
    });
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // main pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    var u = prog.u; gl.useProgram(prog.p);
    gl.uniformMatrix4fv(u.uVP, false, cam.vp); gl.uniformMatrix4fv(u.uLVP, false, lvp);
    gl.uniform3fv(u.uCam, cam.eye); gl.uniform3fv(u.uLd, LD); gl.uniform3f(u.uLc, 3.2, 3.08, 2.88);
    gl.uniform2f(u.uShT, 1 / SH, 1 / SH); gl.uniform1f(u.uEnv, 1);
    gl.uniform1i(u.tMap, 0); gl.uniform1i(u.tNrm, 1); gl.uniform1i(u.tSh, 2);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, shTex);
    parts.forEach(function (p, n) {
      var st = states[n]; if (!st.vis) return;
      gl.uniformMatrix4fv(u.uM, false, st.m); gl.uniform2fv(u.uUo, p.uo);
      p.meshes.forEach(function (me) {
        var m = me.mat, t = p.tint;
        gl.uniform3f(u.uCol, m.c[0] * t, m.c[1] * t, m.c[2] * t);
        gl.uniform1f(u.uRo, m.ro); gl.uniform1f(u.uMe, m.me); gl.uniform1f(u.uBr, m.br || 0);
        gl.uniform1f(u.uMap, m.map && TEX[m.map] ? 1 : 0); gl.uniform1f(u.uNm, m.nrm && TEX[m.nrm] ? 1 : 0); gl.uniform1f(u.uNs, m.ns || 1);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, (m.map && TEX[m.map]) || TEX.white);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, (m.nrm && TEX[m.nrm]) || TEX.flat);
        gl.bindVertexArray(me.vao); gl.drawArrays(gl.TRIANGLES, 0, me.count);
      });
    });
    // floor shadow
    gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    var f = floorProg.u; gl.useProgram(floorProg.p);
    gl.uniformMatrix4fv(f.uVP, false, cam.vp); gl.uniformMatrix4fv(f.uLVP, false, lvp);
    gl.uniformMatrix4fv(f.uM, false, trs(0, -110.2, 0, 1, 0)); gl.uniform2f(f.uShT, 1 / SH, 1 / SH);
    gl.uniform1f(f.uA, 1); gl.uniform3f(f.uBox, 118, 10, depth); gl.uniform1i(f.tSh, 2);
    gl.bindVertexArray(floorMesh.vao); gl.drawArrays(gl.TRIANGLES, 0, floorMesh.count);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
    overlay(states);
  }

  /* ---------------- labels / captions ---------------- */
  var lblWrap = host.querySelector('.lbls'), svg = lblWrap && lblWrap.querySelector('svg');
  var lbls = lblWrap ? Array.prototype.slice.call(lblWrap.querySelectorAll('.lb')) : [];
  var lines = [], dots = [];
  if (svg) LORDER.forEach(function () {
    var l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); svg.appendChild(l); lines.push(l);
    var d = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); d.setAttribute('r', '3'); svg.appendChild(d); dots.push(d);
  });
  var cap = host.querySelector('.cap3d'), hint = host.querySelector('.hint3d');
  var STEP_T = [.25, 1.95, 3.0, 4.05], capShown = '';
  function overlay(states) {
    var cw = W / dpr, chh = H / dpr, op = clamp((EX - .42) / .33, 0, 1);
    lblWrap && (lblWrap.style.opacity = op);
    if (op > 0) {
      var items = [];
      LORDER.forEach(function (key, n) {
        var L = LBL[key], el = lbls[n]; if (!L || !el) return;
        var m = states[parts.indexOf(L.p)].m, pt = L.pt;
        var wp = [m[0] * pt[0] + m[4] * pt[1] + m[8] * pt[2] + m[12], m[1] * pt[0] + m[5] * pt[1] + m[9] * pt[2] + m[13], m[2] * pt[0] + m[6] * pt[1] + m[10] * pt[2] + m[14]];
        var s = proj(lastVP, wp);
        items.push({ n: n, el: el, ax: (s[0] * .5 + .5) * cw, ay: (1 - (s[1] * .5 + .5)) * chh, w: el.offsetWidth || 160, h: el.offsetHeight || 36 });
      });
      // labels sit above their layer in staggered tiers, with a short leader line down to the part
      items.sort(function (a, b) { return RTL ? b.ax - a.ax : a.ax - b.ax; });
      var minY = Math.min.apply(null, items.map(function (it) { return it.ay; }));
      var placed = [];
      items.forEach(function (it) {
        var lh = it.h, lx = RTL ? it.ax - it.w + 12 : it.ax - 12; lx = clamp(lx, 4, cw - it.w - 4);
        var ly = minY - 34 - lh;
        for (var tries = 0; tries < 6; tries++) {          // lift the label until it no longer overlaps another one
          var hit = false;
          for (var g = 0; g < placed.length; g++) { var o = placed[g]; if (lx < o[0] + o[2] + 6 && o[0] < lx + it.w + 6 && ly < o[1] + o[3] + 6 && o[1] < ly + lh + 6) { hit = true; ly = o[1] - lh - 8; } }
          if (!hit) break;
        }
        ly = clamp(ly, 4, chh - lh - 4); placed.push([lx, ly, it.w, lh]);
        it.el.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)';
        var bx = clamp(it.ax, lx + 2, lx + it.w - 2), by = ly + lh;
        var ln = lines[it.n], dt = dots[it.n];
        ln.setAttribute('x1', it.ax.toFixed(1)); ln.setAttribute('y1', it.ay.toFixed(1)); ln.setAttribute('x2', bx.toFixed(1)); ln.setAttribute('y2', by.toFixed(1));
        dt.setAttribute('cx', it.ax.toFixed(1)); dt.setAttribute('cy', it.ay.toFixed(1));
      });
    }
    // captions during the intro, then the hint
    if (cap && T.steps) {
      var txt = '';
      if (introT < INTRO_END && EX < .05) { var sI = 0; for (var q = 0; q < 4; q++) if (introT >= STEP_T[q]) sI = q; txt = '<i>0' + (sI + 1) + '</i>' + T.steps[sI]; }
      if (txt !== capShown) { cap.innerHTML = txt; capShown = txt; }
      cap.style.opacity = txt ? 1 : 0;
    }
    if (hint) hint.classList.toggle('on', introT >= INTRO_END && !interacted && EX < .05);
  }

  /* ---------------- loop ---------------- */
  var raf = 0, last = 0;
  function kick() { if (!raf && visible && !document.hidden && ready) raf = requestAnimationFrame(frame); }
  function frame(ts) {
    raf = 0;
    if (!visible || document.hidden || !ready) { last = 0; return; }
    var dt = last ? Math.min(.05, (ts - last) / 1000) : .016; last = ts; var busy = false;
    if (started && introSpeed > 0 && introT < INTRO_END) { introT = Math.min(INTRO_END, introT + dt * introSpeed); busy = true; }
    var k = 1 - Math.exp(-dt * 6.5);
    if (Math.abs(exT - EX) > 1e-4) { EX += (exT - EX) * k; busy = true; } else EX = exT;
    if (!drag && (Math.abs(vy) > .01 || Math.abs(vp) > .01)) {
      dragYaw = clamp(dragYaw + vy * dt, -55, 55); dragPitch = clamp(dragPitch + vp * dt, -14, 30);
      vy *= Math.pow(.02, dt); vp *= Math.pow(.02, dt); busy = true;
    }
    if (Math.abs(parYT - parY) > .01 || Math.abs(parPT - parP) > .01) { parY += (parYT - parY) * k; parP += (parPT - parP) * k; busy = true; }
    render();
    if (busy) kick(); else last = 0;
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, Math.round(host.clientWidth * dpr)); H = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    if (ready) kick();
  }
  function act() { if (!interacted) { interacted = true; } }

  /* ---------------- input ---------------- */
  host.addEventListener('wheel', function (e) {
    if (touchMode) return;
    var d = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    var nt = clamp(exT + d * .0017, 0, 1);
    if (nt === exT) return;                              // at the limit -> let the page scroll
    e.preventDefault(); exT = nt; if (introT < INTRO_END) introSpeed = 6; act(); kick();
  }, { passive: false });
  host.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now(), yaw: dragYaw, pitch: dragPitch, t: performance.now(), touch: e.pointerType === 'touch' };
    vy = vp = 0; host.classList.add('drag'); act();
    try { host.setPointerCapture(e.pointerId); } catch (_) {}
  });
  host.addEventListener('pointermove', function (e) {
    var rc = host.getBoundingClientRect();
    if (!drag) { if (e.pointerType !== 'touch') { parYT = ((e.clientX - rc.left) / rc.width - .5) * 9; parPT = ((e.clientY - rc.top) / rc.height - .5) * -5; kick(); } return; }
    var ny = clamp(drag.yaw - (e.clientX - drag.x) * .3, -55, 55);
    var np = drag.touch ? dragPitch : clamp(drag.pitch + (e.clientY - drag.y) * .22, -14, 30);
    var now = performance.now(), dtm = Math.max(1, now - drag.t) / 1000;
    vy = (ny - dragYaw) / dtm; vp = (np - dragPitch) / dtm; drag.t = now;
    dragYaw = ny; dragPitch = np; kick();
  });
  function endDrag(e) {
    if (!drag) return;
    // a quick tap on a phone toggles the exploded view
    if (drag.touch && e && e.type === 'pointerup' && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 10 && performance.now() - drag.t0 < 450) { exT = exT > .5 ? 0 : 1; vy = vp = 0; }
    drag = null; host.classList.remove('drag'); vy = clamp(vy, -160, 160); vp = clamp(vp, -100, 100); kick(); }
  host.addEventListener('pointerup', endDrag); host.addEventListener('pointercancel', endDrag);
  host.addEventListener('pointerleave', function () { parYT = 0; parPT = 0; kick(); });
  host.addEventListener('dblclick', function () { exT = exT > .5 ? 0 : 1; act(); kick(); });
  host.addEventListener('keydown', function (e) {
    var hit = true;
    if (e.key === 'ArrowDown' || e.key === '+') exT = clamp(exT + .25, 0, 1);
    else if (e.key === 'ArrowUp' || e.key === '-') exT = clamp(exT - .25, 0, 1);
    else if (e.key === 'ArrowLeft') dragYaw = clamp(dragYaw - 8, -55, 55);
    else if (e.key === 'ArrowRight') dragYaw = clamp(dragYaw + 8, -55, 55);
    else hit = false;
    if (hit) { e.preventDefault(); act(); kick(); }
  });

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
    var e = es[0]; visible = e.isIntersecting;
    if (!visible) stop();
    if (e.intersectionRatio > .35 && ready) started = true;
    kick();
  }, { threshold: [0, .35, .6] }).observe(host);
  else started = true;
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else kick();
  });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); stop(); ready = false; host.classList.remove('live'); host.classList.add('nogl'); });

  Promise.all([loadTex('stone', true), loadTex('stone_n', false), loadTex('wall', true), loadTex('wall_n', false)]).then(function () {
    ready = true; resize();
    var rc = host.getBoundingClientRect();
    if (rc.top < window.innerHeight * .8 && rc.bottom > 0) started = true;
    visible = rc.top < window.innerHeight && rc.bottom > 0;
    host.classList.remove('loading3d'); host.classList.add('live'); kick();
  });

  // hook used for automated checks and poster renders
  window.__stone3d = {
    set: function (o) {
      if (o.intro != null) { introT = o.intro === 'end' ? INTRO_END : o.intro; started = true; }
      if (o.freeze) introSpeed = 0;
      if (o.zoom != null) camZoom = o.zoom; if (o.tgt) camOff = o.tgt; if (o.noShift != null) noShift = o.noShift; if (o.maxLayer != null) maxLayer = o.maxLayer;
      if (o.ex != null) { EX = exT = o.ex; }
      if (o.yaw != null) dragYaw = o.yaw; if (o.pitch != null) dragPitch = o.pitch;
      parY = parYT = 0; parP = parPT = 0; interacted = !!o.hideHint; render();
    },
    snap: function () { render(); return canvas.toDataURL('image/png'); },
    info: function () { return { introT: introT, INTRO_END: INTRO_END, EX: EX, parts: parts.length, W: W, H: H }; }
  };
})();
