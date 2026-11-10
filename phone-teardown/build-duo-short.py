src = open('iphone-duo-teardown.html').read()
def R(a, b):
    global src
    assert src.count(a) == 1, (src.count(a), a[:90]); src = src.replace(a, b)

R('<title>iPhone Duo Teardown</title>', '<title>iPhone Duo Fold Short</title>')
R('</style>', r'''body.short { background: radial-gradient(ellipse 70% 45% at 50% 56%, #0e121a 0%, #05070a 45%, #000 75%) !important; }
body.short .top, body.short #card, body.short #labels, body.short #title-card, body.short #parts, body.short #controls, body.short #hint { display: none !important; }
body.clean #cap, body.clean #capbg { display: none !important; }
#glabels { position: absolute; inset: 0; pointer-events: none; }
#glabels .gl { position: absolute; left: 0; right: 0; top: 0; height: 0; }
#glabels .gl span { position: absolute; left: 64px; top: -26px; font-family: var(--font-display); font-weight: 600; font-size: 40px; color: #fff; text-shadow: 0 2px 14px rgba(0,0,0,.8); white-space: nowrap; }
#glabels .gl span em { font-style: normal; font-family: var(--font-mono); font-weight: 500; font-size: 28px; color: var(--accent); margin-right: 14px; }
#glabels .gl b { position: absolute; top: 0; height: 2px; background: rgba(240,166,64,.75); }
#glabels .gl i { position: absolute; top: -6px; width: 12px; height: 12px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 5px rgba(240,166,64,.25); }
#capbg { position: absolute; inset: 0 0 auto; height: 34%; background: linear-gradient(#000 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%); pointer-events: none; }
#cap { z-index: 2; position: absolute; left: 0; right: 0; top: 10.5%; padding: 0 72px; text-align: center; color: #fff; font-family: var(--font-display); pointer-events: none; will-change: opacity, transform; }
#cap .big { font-size: 150px; font-weight: 700; letter-spacing: -0.035em; line-height: 1; color: var(--accent); margin-bottom: 18px; }
#cap .line { font-size: 74px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance; text-shadow: 0 4px 30px rgba(0,0,0,.6); }
#cap .line em { font-style: normal; color: var(--accent); }
#cap .sub { font-family: var(--font-mono); font-size: 34px; letter-spacing: .14em; text-transform: uppercase; color: #9aa4ad; margin-top: 22px; }
</style>''')
R('<div id="labels"></div>', '<div id="labels"></div>\n  <div id="capbg"></div>\n  <div id="cap"></div>')
R("if (RENDER) document.body.classList.add('render');", "document.body.classList.add('short'); if (RENDER) document.body.classList.add('render'); if (new URLSearchParams(location.search).has('clean')) document.body.classList.add('clean');")
R("function dimTarget(p, s) { return s.focus >= 0 && p.index !== s.focus ? 1 : 0; }",
  "function dimTarget(p, s) { if (s.dimMap) return p.id in s.dimMap ? s.dimMap[p.id] : (s.dimDefault ?? 0); return s.focus >= 0 && p.index !== s.focus ? 1 : 0; }")
R("  const dimB = prev ? ease(clamp01(lt / 0.9)) : 1;", "  const dimB = prev ? ease(clamp01(lt / 0.35)) : 1;")
R("return { fold: s.fold ? s.fold(u) : 0, explode: s.explode(u), pose,",
  "return { gl: s.gl ? s.gl(u) : 0, glo: s.glo ? s.glo(u) : 1, wake: s.wake ? s.wake(u) : 1, time: t, keepOn: !!s.keepOn, stack: s.stack ? s.stack(lt) : [0, 0, 0], cap: capAt(s, lt), fold: s.fold ? s.fold(u) : 0, explode: s.explode(u), pose,")
R("  setTitle(st.title[0], st.title[1]);", "  setTitle(st.title[0], st.title[1]); applyStack(st.stack); setCap(st.cap); if (window.spinGears) spinGears(st.time); GL_ALPHA = st.gl; GL_OUT = st.glo; WAKE = st.wake;")
R("const camera = new THREE.PerspectiveCamera(30, 1, 5, 3000);", "const camera = new THREE.PerspectiveCamera(33, 1, 5, 3000);  // ~10% wider so tall shots fit the 450-1500 band")
R("function composeInner(bl) {\n  const x = innerCanvas.getContext('2d'); x.clearRect(0, 0, 1640, 1100); x.drawImage(innerSharp, 0, 0);",
  "function composeInner(bl) {\n  const x = innerCanvas.getContext('2d'); x.clearRect(0, 0, 1640, 1100);\n  const z = 1 + 0.05 * bl; x.save(); x.beginPath(); x.roundRect(0, 0, 1640, 1100, 86); x.clip(); x.translate(1230, 550); x.scale(z, z); x.translate(-1230, -550); x.drawImage(innerSharp, 0, 0); x.restore();")
R("var KEEP_ON = false, lastInnerP = 0, lastOuterP = 1;", "var KEEP_ON = false, WAKE = 1, lastInnerP = 0, lastOuterP = 1;")
R("  if (bl > 0.003) { x.globalAlpha = bl; x.drawImage(innerBlur, 0, 0); x.globalAlpha = 1; }", "  if (bl > 0.003) { x.globalAlpha = bl; x.drawImage(innerBlur, 0, 0); x.globalAlpha = 1; }\n  if (bl > 0.003) { const g = x.createLinearGradient(0, 0, 860, 0); g.addColorStop(0, `rgba(8,10,16,${(0.62 * bl).toFixed(3)})`); g.addColorStop(0.8, `rgba(8,10,16,${(0.45 * bl).toFixed(3)})`); g.addColorStop(1, 'rgba(8,10,16,0)'); x.save(); x.beginPath(); x.roundRect(0, 0, 1640, 1100, 86); x.clip(); x.fillStyle = g; x.fillRect(0, 0, 860, 1100); x.restore(); }")
R("  innerScr.material.color.setScalar(ease(on));", "  innerScr.material.color.setScalar(ease(on) * WAKE);")
R("  explode = st.explode; applyExplode(explode);", "  KEEP_ON = st.keepOn; explode = st.explode; applyExplode(explode);")

a = src.index("const CLOSED_T = new THREE.Vector3(38, 0, 3);"); b = src.index("const TOTAL = tAcc;")
tour = r'''/* ---------- Short: "How does a ₹3 lakh iPhone fold?" (9:16, 40 s) ---------- */
const P = (tx, ty, tz, az, el, dist, ax = [0, 1, 0]) => ({ target: new THREE.Vector3(tx, ty, tz), az, el, dist, shift: 0, axis: new THREE.Vector3(...ax) });
const UP_OPEN = [-1, 0, 0], UP_STACK = [0, 0, 1];  // open phone stands tall (hinge left-right); exploded stack spreads up/down
const EX = 1.3; // exploded spacing for the reel (spreads the stack down the frame)
const STACK_C = new THREE.Vector3(0, 0, 72 * EX + 12);

// display stack: ~10 thin layers (illustrative, unlabeled)
const stackG = new THREE.Group(); stackG.position.copy(STACK_C); scene.add(stackG);
const gridT = (bg, ln, step, w = 2) => canvasTex(256, 256, (x) => { x.fillStyle = bg; x.fillRect(0, 0, 256, 256); x.strokeStyle = ln; x.lineWidth = w; for (let i = 0; i <= 256; i += step) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); } });
const oledT = canvasTex(256, 256, (x) => { x.fillStyle = '#05060a'; x.fillRect(0, 0, 256, 256); const c = ['#ff3b4a', '#33e06a', '#3b7bff']; for (let y = 0; y < 256; y += 10) for (let xx = 0; xx < 256; xx += 12) c.forEach((k, i) => { x.fillStyle = k; x.fillRect(xx + i * 4, y + 1, 3, 7); }); });
const LAYERS = [
  phys({ color: 0xe8f4ff, transparent: true, opacity: 0.35, roughness: 0.03, clearcoat: 1, envMapIntensity: 2 }),
  phys({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.2 }),
  std(0x23262c, 0.2, 0.35, { transparent: true, opacity: 0.92 }),
  new THREE.MeshStandardMaterial({ map: gridT('#3a2a1a', '#e2b35a', 16, 2), metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.95 }),
  phys({ color: 0xbfd9ff, transparent: true, opacity: 0.3, roughness: 0.1 }),
  new THREE.MeshBasicMaterial({ map: oledT, transparent: true, opacity: 1, toneMapped: false }),
  new THREE.MeshStandardMaterial({ map: gridT('#183326', '#5fcf96', 21, 1.5), metalness: 0.3, roughness: 0.5, transparent: true, opacity: 0.95 }),
  std(0xd99a3a, 0.1, 0.45, { transparent: true, opacity: 0.95 }),
  std(0x15171b, 0.2, 0.5, { transparent: true, opacity: 0.95 }),
  std(0xc4c8cd, 1, 0.3, { transparent: true, opacity: 1 }),
];
const layerGeo = extrude(rrShape(64, 64, 8), 0.4, 0.06, 16);
LAYERS.forEach(m => { m.userData.baseOpacity = m.opacity; const ms = new THREE.Mesh(layerGeo, m); stackG.add(ms); });
function applyStack([spread, slide, ph]) {
  stackG.visible = spread > 0.01;
  stackG.children.forEach((m, i) => {
    const k = 4.5 - i;
    m.position.set(Math.sin(ph * 2.4 + i * 0.55) * 3 * slide, k * 8.5 * spread, k * (0.45 + 2.8 * spread));
    m.material.opacity = m.material.userData.baseOpacity * clamp01(spread * 2.5);
  });
}
const capEl = document.getElementById('cap'); let capHtml = null;
function setCap([html, a]) { if (html !== capHtml) { capHtml = html; capEl.innerHTML = html; } capEl.style.opacity = a.toFixed(3); capEl.style.transform = `translateY(${((1 - a) * 24).toFixed(1)}px)`; }
function capAt(s, lt) { const c = (s.caps || []).find(([a, b]) => lt >= a && lt < b); if (!c) return ['', 0]; return [c[2], clamp01(Math.min((lt - c[0]) / 0.22, (c[1] - lt) / 0.18))]; }
(function portraitInner() {
  return;  // open phone is shown wide (hinge vertical, like the real Duo), so keep the original wide home screen
  const P = document.createElement('canvas'); P.width = 1100; P.height = 1640; const x = P.getContext('2d');
  dunes(x, 1100, 1640, 0.4);
  const cg = x.createLinearGradient(0, 800, 0, 840); cg.addColorStop(0, 'rgba(0,0,0,0)'); cg.addColorStop(0.5, 'rgba(0,0,0,0.04)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = cg; x.fillRect(0, 800, 1100, 40);
  x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = '600 34px sans-serif'; x.fillText('10:08', 80, 70); wifiGlyph(x, 1000, 60, 40);
  const wg = x.createLinearGradient(0, 120, 0, 400); wg.addColorStop(0, '#3e9cf5'); wg.addColorStop(1, '#2a6fd8'); x.fillStyle = wg; x.beginPath(); x.roundRect(80, 120, 450, 280, 50); x.fill();
  x.fillStyle = '#fff'; x.font = '600 32px sans-serif'; x.fillText('Bengaluru ➤', 116, 178); x.font = '300 112px sans-serif'; x.fillText('27°', 110, 290); circ(x, 132, 350, 12, '#ffd23f'); x.font = '500 28px sans-serif'; x.fillText('Partly Cloudy', 156, 360);
  x.save(); x.beginPath(); x.roundRect(570, 120, 450, 280, 50); x.clip(); const pg = x.createLinearGradient(0, 120, 0, 400); pg.addColorStop(0, '#ff9a5a'); pg.addColorStop(0.55, '#ffcf8a'); pg.addColorStop(0.56, '#2f7fa8'); pg.addColorStop(1, '#1d4f73'); x.fillStyle = pg; x.fillRect(570, 120, 450, 280);
  circ(x, 800, 250, 44, '#fff3c9'); x.fillStyle = '#fff'; x.font = '700 38px sans-serif'; x.fillText('Goa', 600, 350); x.font = '600 22px sans-serif'; x.fillText('DEC 2025', 600, 380); x.restore();
  const cols = [175, 405, 635, 865], S = 128;
  [['facetime', 'calendar', 'photos', 'camera'], ['mail', 'notes', 'clock', 'maps']].forEach((r, ri) => r.forEach((k, ci) => appIcon(x, k, cols[ci], 510 + ri * 190, S)));
  [['weather', 'stocks', 'findmy', 'podcasts'], ['books', 'fitness', 'files', 'preview'], ['news', 'utilities', 'translate', 'freeform']].forEach((r, ri) => r.forEach((k, ci) => appIcon(x, k, cols[ci], 930 + ri * 190, S)));
  x.fillStyle = 'rgba(255,255,255,0.26)'; x.beginPath(); x.roundRect(90, 1440, 920, 160, 56); x.fill();
  ['phone', 'safari', 'messages', 'music'].forEach((k, i) => appIcon(x, k, cols[i], 1520, 116, false));
  circ(x, 536, 1410, 8, '#fff'); circ(x, 564, 1410, 8, 'rgba(255,255,255,0.5)');
  // rotate the upright layout into the screen texture (open phone stands with its swinging half on top)
  const sx = innerSharp.getContext('2d'); sx.save(); sx.clearRect(0, 0, 1640, 1100); sx.beginPath(); sx.roundRect(0, 0, 1640, 1100, 86); sx.clip();
  sx.translate(0, 1100); sx.rotate(-Math.PI / 2); sx.drawImage(P, 0, 0); sx.restore();
  circ(sx, INNER_HOLE[0], INNER_HOLE[1], 13, 'rgba(0,0,0,0.16)');
  const b = innerBlur.getContext('2d'); b.clearRect(0, 0, 1640, 1100);
  const tiny = document.createElement('canvas'); tiny.width = 82; tiny.height = 55; tiny.getContext('2d').drawImage(innerSharp, 0, 0, 82, 55);
  const mid = document.createElement('canvas'); mid.width = 205; mid.height = 138; mid.getContext('2d').drawImage(tiny, 0, 0, 205, 138);
  b.drawImage(mid, 0, 0, 1640, 1100); b.fillStyle = 'rgba(235,240,255,0.14)'; b.fillRect(0, 0, 1640, 1100);
  b.globalCompositeOperation = 'destination-in'; const m = b.createLinearGradient(870, 0, 760, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)'); b.fillStyle = m; b.fillRect(0, 0, 1640, 1100);
  b.beginPath(); b.roundRect(0, 0, 1640, 1100, 86); b.fill(); b.globalCompositeOperation = 'source-over';
  lastInnerP = -1; composeInner(0); innerTexFull.needsUpdate = true;
})();
const GL = [['inner', 'Display', 1], ['frame', 'Frame + buttons', 2], ['hinge', 'Hinge', 3], ['board', 'Logic board', 4], ['batteries', '2 batteries', 5], ['cameras', 'Rear cameras', 7], ['outer', 'Cover screen', 6], ['back', 'Back glass', 8]];
const glWrap = document.createElement('div'); glWrap.id = 'glabels'; document.getElementById('app').appendChild(glWrap);
parts.forEach(p => { const b = new THREE.Box3().setFromObject(p.group); p.lb = new THREE.Vector3(b.min.x, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2).sub(p.group.position); });
const glItems = GL.map(([id, name, n]) => { const el = document.createElement('div'); el.className = 'gl'; el.innerHTML = '<span><em>0' + n + '</em></span><b></b><i></i>'; el.querySelector('span').append(name); glWrap.appendChild(el); return { p: parts.find(q => q.id === id), el, n }; });
let GL_OUT = 1;
let GL_ALPHA = 0; const glV = new THREE.Vector3();
window.groupLabels = (w, h) => {
  glWrap.style.opacity = (GL_ALPHA > 0 ? GL_OUT : 0).toFixed(3); if (GL_ALPHA < 0.01 || GL_OUT < 0.01) return;
  const pts = glItems.map(it => { glV.copy(it.p.lb).add(it.p.group.position).project(camera); return { it, x: (glV.x * 0.5 + 0.5) * w, y: (-glV.y * 0.5 + 0.5) * h }; });
  pts.sort((a, b) => a.y - b.y); for (let i = 1; i < pts.length; i++) pts[i].ly = Math.max(pts[i].y, (pts[i - 1].ly ?? pts[i - 1].y) + 62); pts[0].ly = pts[0].y;
  pts.forEach(({ it, x, ly }) => {
    const el = it.el, span = el.querySelector('span'), line = el.querySelector('b'), dot = el.querySelector('i');
    const tx = 64 + span.offsetWidth + 18;
    const k = it.n - 1, a = clamp01((GL_ALPHA * 10 - k) / 2), pop = Math.sin(Math.PI * a);  // one by one, top to bottom
    el.style.opacity = a.toFixed(3); dot.style.transform = `scale(${1 + 0.9 * pop})`;
    el.style.transform = `translateY(${ly}px)`; line.style.left = tx + 'px'; line.style.width = Math.max(0, x - tx - 6) + 'px'; dot.style.left = (x - 6) + 'px';
  });
};
const sseg = o => seg(Object.assign({ focus: -1, labels: () => 0, explode: () => 0 }, o));
const L = (h) => `<div class="line">${h}</div>`;

/* --- product-shot look: glossy mirror floor with a fading reflection + cool rim light behind the phone --- */
const FLOOR_Y = shadow.position.y - 0.15;
const mirRT = new THREE.WebGLRenderTarget(720, 1280);
const mirCam = new THREE.PerspectiveCamera(46, 1080 / 1920, 5, 3000);
const mirTexM = new THREE.Matrix4();
const floorMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
  uniforms: { map: { value: mirRT.texture }, texM: { value: mirTexM }, op: { value: 0 }, c: { value: new THREE.Vector2() } },
  vertexShader: 'uniform mat4 texM; varying vec4 vUv; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vUv = texM * w; gl_Position = projectionMatrix * viewMatrix * w; }',
  fragmentShader: 'uniform sampler2D map; uniform float op; uniform vec2 c; varying vec4 vUv; varying vec3 vW; void main(){ vec4 r = texture2DProj(map, vUv); float d = length(vW.xz - c); float f = op * exp(-d / 95.0); gl_FragColor = vec4(pow(max(r.rgb, 0.0), vec3(1.0 / 2.2)) * 0.9, r.a * f); }' });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y; floor.renderOrder = -1; scene.add(floor);
const rimL = new THREE.DirectionalLight(0xb9d6ff, 1.5); scene.add(rimL); scene.add(rimL.target);
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _u = new THREE.Vector3();
window.mirrorPass = () => {
  // rim light sits behind the phone, opposite the camera, a little above
  _d.copy(view.target).sub(camera.position).normalize();
  rimL.position.copy(view.target).addScaledVector(_d, 300).add(_u.set(0, 90, 0)); rimL.target.position.copy(view.target);
  const op = 0.16 * Math.pow(Math.max(0, view.axis ? view.axis.y : 1), 6) * clamp01(1 - explode * 4) * clamp01((0.75 - view.el) / 0.35);
  floorMat.uniforms.op.value = op; floor.visible = op > 0.004;
  if (!floor.visible) return;
  floorMat.uniforms.c.value.set(shadow.position.x, shadow.position.z);
  camera.updateMatrixWorld();
  _v.copy(camera.position); _v.y = 2 * FLOOR_Y - _v.y;
  camera.getWorldDirection(_d); _d.y = -_d.y;
  _u.set(0, 1, 0).applyQuaternion(camera.quaternion); _u.y = -_u.y;
  mirCam.position.copy(_v); mirCam.up.copy(_u); mirCam.lookAt(_v.clone().add(_d)); mirCam.updateMatrixWorld(); mirCam.updateProjectionMatrix();
  mirTexM.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(mirCam.projectionMatrix).multiply(mirCam.matrixWorldInverse);
  const sv = shadow.visible; floor.visible = false; shadow.visible = false;
  renderer.setRenderTarget(mirRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, mirCam); renderer.setRenderTarget(null);
  floor.visible = true; shadow.visible = sv;
};

/* --- soft blue halo hugging the phone's outline: built from the WebGL canvas alpha, drawn BEHIND the 3D canvas,
       so it can only ever show around the edges, never on the phone or its screen --- */
const haloC = document.createElement('canvas'); haloC.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
canvas.parentNode.insertBefore(haloC, canvas);
const hS = [14, 30, 60, 110].map(k => { const c = document.createElement('canvas'); return { k, c, x: c.getContext('2d') }; });
window.haloPass = () => {
  const W = canvas.width, H = canvas.height; if (haloC.width !== W) { haloC.width = W; haloC.height = H; }
  const hx = haloC.getContext('2d'); hx.clearRect(0, 0, W, H); hx.imageSmoothingEnabled = true; hx.imageSmoothingQuality = 'high';
  hx.globalCompositeOperation = 'lighter';
  hS.forEach(({ k, c, x }, i) => {
    const w = Math.max(2, Math.round(W / k)), h = Math.max(2, Math.round(H / k)); if (c.width !== w) { c.width = w; c.height = h; }
    x.globalCompositeOperation = 'copy'; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(canvas, 0, 0, w, h);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = ['rgba(150,190,255,0.16)', 'rgba(110,160,255,0.22)', 'rgba(85,135,245,0.22)', 'rgba(70,110,230,0.18)'][i]; x.fillRect(0, 0, w, h);
    hx.drawImage(c, -k, -k, W + 2 * k, H + 2 * k);
  });
  hx.globalCompositeOperation = 'source-over';
};

const S1A = P(36, 0, 3, 2.75, 0.16, 380);  // closed, back three-quarter (end of the tour)
// Apple-style reveal: slow turntable close-up of the closed phone, swing to face the viewer, open towards the camera
const MACRO = P(56, 40, -4, 2.95, 0.06, 205), BACK0 = P(36, 0, 3, 2.75, 0.1, 500), BACK1 = P(36, 0, 3, 3.3, 0.14, 455);
const FRONT_C = P(36, 0, 3, 0.12, 0.16, 470);                 // closed, cover screen facing us
const OPEN = P(0, 0, 1, 0.1, 0.2, 690), OVER = P(36, 0, 2, 0.12, 0.85, 1080, UP_STACK);
sseg({ dur: 2.2, fold: () => 1, pose: t => { const T = t * 2.2; return T < 1.2 ? lerpPose(MACRO, BACK0, ease(T / 1.2) * 0.999) : lerpPose(BACK0, BACK1, ease((T - 1.2) / 1.0)); },
  caps: [[0, 2.2, '<div class="big">₹2,99,900</div>' + L('This iPhone <em>folds in half</em>')]] });
sseg({ dur: 2.8, keepOn: true, fold: t => 1 - ease(clamp01((t * 2.8 - 0.75) / 1.55)),
  wake: t => 1 + 0.22 * Math.sin(Math.PI * clamp01((t * 2.8 - 2.0) / 0.8)),       // little Apple-style glow as the screen lands flat
  pose: t => { const T = t * 2.8; return T < 0.8 ? lerpPose(BACK1, FRONT_C, ease(T / 0.8)) : lerpPose(FRONT_C, OPEN, ease(clamp01((T - 0.75) / 1.75))); },
  caps: [[0.05, 1.6, L('But glass <em>cracks</em> when you bend it')], [1.6, 2.8, '<div class="big">So how?</div>']] });
sseg({ dur: 4, gl: t => clamp01((t * 4 - 2.25) / 1.0), glo: t => clamp01((4 - t * 4) / 0.25), explode: t => 2.1 * ease(clamp01((t - 0.12) / 0.5)), pose: t => lerpPose(OPEN, OVER, ease(Math.min(1, t / 0.7))),
  caps: [[0.05, 1.7, L('Just <em>5.2 mm</em> thin')], [1.7, 4, L('Let’s open it up')]] });
sseg({ dur: 10, explode: t => EX + (2.1 - EX) * (1 - ease(clamp01(t * 10 / 1.2))), dimMap: { inner: 0.8 }, dimDefault: 0.93,
  stack: lt => [ease(clamp01((lt - 0.5) / 1.6)) * (1 - ease(clamp01((lt - 9.2) / 0.8))), ease(clamp01((lt - 4.4) / 0.8)), lt],
  pose: t => P(STACK_C.x, STACK_C.y + 2, STACK_C.z, 0.42 + 0.12 * t, 0.2, 430),
  caps: [[0.3, 4.4, L('Trick 1: the screen is <em>~10 thin layers</em>')], [4.4, 10, L('They <em>slide</em> like paper, so nothing snaps')]] });
sseg({ dur: 5.5, explode: () => EX, dimMap: { hinge: 0 }, dimDefault: 0.97, pose: t => P(0, 43 - 5 * t, 22 * EX + 1, 0.05 + 0.85 * t, 0.48 - 0.12 * t, 125 - 25 * t),
  caps: [[0.25, 5.5, L('Trick 2: a hinge of <em>100+ parts</em>') + '<div class="sub">gears · springs · 3D-printed titanium cover</div>']] });
sseg({ dur: 5.5, explode: t => EX * (1 - ease(clamp01(t * 5.5 / 1.4))), fold: t => 0.74 * ease(clamp01((t * 5.5 - 1.5) / 2.6)),
  keepOn: true, dimMap: { inner: 0, hinge: 0 }, dimDefault: 0.85, pose: t => P(34, 0, 24, 0.08 + 0.06 * t, 1.3, 430, UP_STACK),  // look down onto the V
  caps: [[0.25, 5.5, L('Closing, it <em>curls into a teardrop</em> instead of folding flat')]] });
sseg({ dur: 6, keepOn: true, fold: t => 0.74 * (1 - ease(clamp01(t * 6 / 1.4))), pose: t => P(0, 30 - 60 * t, 2.6, 1.3, 0.17, 330),
  caps: [[0.3, 3.1, L('Bend the same spot <em>again and again</em>')], [3.1, 6, L('…and you get <em>the crease</em> you can feel')]] });
// Apple-style close: face the viewer, fold shut towards the camera (soft ease-in, firm landing at 38.9 s), then turn to the back
const CREASE_END = P(0, -30, 2.6, 1.3, 0.17, 330), BACK_HERO = P(36, -48, 3, -1.25, 0.12, 790);
sseg({ dur: 4, fold: t => { const T = t * 4; const u = clamp01((T - 0.9) / 1.6); return u * u * (1.6 - 0.6 * u); },
  pose: t => { const T = t * 4; return T < 0.95 ? lerpPose(CREASE_END, OPEN, ease(T / 0.95)) : T < 2.5 ? lerpPose(OPEN, FRONT_C, ease((T - 0.95) / 1.55)) : lerpPose(FRONT_C, BACK_HERO, ease((T - 2.5) / 1.5)); },
  caps: [[0.2, 4, L('It doesn’t fold like paper.<br>It <em>rolls like a poster.</em>')]] });
// end card backdrop: slow hero turn of the closed phone, high in the frame (the channel card sits underneath)
sseg({ dur: 5, fold: () => 1, pose: t => lerpPose(BACK_HERO, P(36, -48, 3, -2.25, 0.12, 790), ease(t)), caps: [] });
'''
src = src[:a] + tour + src[b:]
for a_, b_ in [("if (Math.abs(sx) + Math.abs(sy) > 0.5) camera.setViewOffset(w, h, sx, sy, w, h); else camera.clearViewOffset();", "camera.setViewOffset(w, h, sx, sy - 0.085 * h, w, h);")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
for a_, b_ in [("g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');", "g.addColorStop(0, 'rgba(150,170,215,0.17)'); g.addColorStop(0.55, 'rgba(120,140,190,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');"),
               ("m.position.set(x, y, z); m.rotation.y = Math.PI; parent.add(m); return m; // faces the back (-z)", "m.position.set(x, y, z); m.rotation.y = Math.PI; m.userData.logo = true; parent.add(m); return m; // faces the back (-z)"),
               ("const P = (tx, ty, tz, az, el, dist, ax", "// Apple logo stays on the back (owner asked for it), with a soft sheen so it reads at every angle\nroot.traverse(o => { if (o.userData.logo && o.material.emissive) { o.material = o.material.clone(); o.material.emissive.setHex(0x39445c); o.material.envMapIntensity = 1.8; } });\nconst P = (tx, ty, tz, az, el, dist, ax")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)

# --- camera orientation: each pose names the world axis that should point UP on screen (lets the open phone stand tall) ---
for a_, b_ in [
  ("function clonePose(p) { return { target: p.target.clone(), az: p.az, el: p.el, dist: p.dist, shift: p.shift }; }",
   "function clonePose(p) { return { target: p.target.clone(), az: p.az, el: p.el, dist: p.dist, shift: p.shift, axis: p.axis ? p.axis.clone() : new THREE.Vector3(0, 1, 0) }; }"),
  ("function lerpPose(a, b, t) { return { target: a.target.clone().lerp(b.target, t),",
   "function lerpPose(a, b, t) { return { axis: (a.axis || new THREE.Vector3(0, 1, 0)).clone().lerp(b.axis || new THREE.Vector3(0, 1, 0), t), target: a.target.clone().lerp(b.target, t),"),
  ("  camera.up.set(0, 1, 0); camera.lookAt(view.target);",
   "  camera.up.set(0, 1, 0); camera.lookAt(view.target);\n  if (view.axis && view.axis.lengthSq() > 1e-6) { camera.updateMatrixWorld(); const v = view.axis.clone().transformDirection(camera.matrixWorldInverse); if (Math.hypot(v.x, v.y) > 1e-3) camera.rotateZ(Math.atan2(v.y, v.x) - Math.PI / 2); }\n  if (window.shadow) shadow.material.opacity *= Math.max(0, view.axis ? view.axis.y : 1);"),
  ("camera.setViewOffset(w, h, sx, sy - 0.085 * h, w, h);", "camera.setViewOffset(w, h, sx, sy - 0.008 * h, w, h); // main object centred in the Reels 'main object' band (y 450-1500)"),
]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
for a_, b_ in [("function updateLabels(w, h) {", "function updateLabels(w, h) {\n  if (window.groupLabels) groupLabels(w, h);"),
               ("  camera.updateProjectionMatrix();\n  renderer.render(scene, camera);\n  updateLabels(w, h);", "  camera.updateProjectionMatrix();\n  if (window.mirrorPass) mirrorPass();\n  renderer.render(scene, camera);\n  if (window.haloPass) haloPass();\n  updateLabels(w, h);")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
open('iphone-duo-short.html', 'w').write(src)
print('ok')
