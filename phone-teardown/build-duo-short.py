src = open('iphone-duo-teardown.html').read()
def R(a, b):
    global src
    assert src.count(a) == 1, (src.count(a), a[:90]); src = src.replace(a, b)

R('<title>iPhone Duo Teardown</title>', '<title>iPhone Duo Fold Short</title>')
R('</style>', r'''body.short { background: #000 !important; }
body.short .top, body.short #card, body.short #labels, body.short #title-card, body.short #parts, body.short #controls, body.short #hint { display: none !important; }
#capbg { position: absolute; inset: 0 0 auto; height: 34%; background: linear-gradient(#000 0%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0) 100%); pointer-events: none; }
#cap { z-index: 2; position: absolute; left: 0; right: 0; top: 10.5%; padding: 0 72px; text-align: center; color: #fff; font-family: var(--font-display); pointer-events: none; will-change: opacity, transform; }
#cap .big { font-size: 150px; font-weight: 700; letter-spacing: -0.035em; line-height: 1; color: var(--accent); margin-bottom: 18px; }
#cap .line { font-size: 74px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance; text-shadow: 0 4px 30px rgba(0,0,0,.6); }
#cap .line em { font-style: normal; color: var(--accent); }
#cap .sub { font-family: var(--font-mono); font-size: 34px; letter-spacing: .14em; text-transform: uppercase; color: #9aa4ad; margin-top: 22px; }
</style>''')
R('<div id="labels"></div>', '<div id="labels"></div>\n  <div id="capbg"></div>\n  <div id="cap"></div>')
R("if (RENDER) document.body.classList.add('render');", "document.body.classList.add('short'); if (RENDER) document.body.classList.add('render');")
R("function dimTarget(p, s) { return s.focus >= 0 && p.index !== s.focus ? 1 : 0; }",
  "function dimTarget(p, s) { if (s.dimMap) return p.id in s.dimMap ? s.dimMap[p.id] : (s.dimDefault ?? 0); return s.focus >= 0 && p.index !== s.focus ? 1 : 0; }")
R("return { fold: s.fold ? s.fold(u) : 0, explode: s.explode(u), pose,",
  "return { keepOn: !!s.keepOn, stack: s.stack ? s.stack(lt) : [0, 0, 0], cap: capAt(s, lt), fold: s.fold ? s.fold(u) : 0, explode: s.explode(u), pose,")
R("  setTitle(st.title[0], st.title[1]);", "  setTitle(st.title[0], st.title[1]); applyStack(st.stack); setCap(st.cap);")
R("  explode = st.explode; applyExplode(explode);", "  KEEP_ON = st.keepOn; explode = st.explode; applyExplode(explode);")

a = src.index("const CLOSED_T = new THREE.Vector3(-38, 0, 3);"); b = src.index("const TOTAL = tAcc;")
tour = r'''/* ---------- Short: "How does a ₹3 lakh iPhone fold?" (9:16, 40 s) ---------- */
const P = (tx, ty, tz, az, el, dist) => ({ target: new THREE.Vector3(tx, ty, tz), az, el, dist, shift: 0 });
const STACK_C = new THREE.Vector3(0, 0, 84);

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
const sseg = o => seg(Object.assign({ focus: -1, labels: () => 0, explode: () => 0 }, o));
const L = (h) => `<div class="line">${h}</div>`;

const S1A = P(-36, 0, 3, 2.75, 0.16, 400), S1B = P(-30, 0, 3, -0.5, 0.18, 400);
const OPEN = P(0, 0, 1, -0.38, 0.2, 760), OVER = P(0, 0, 0, 0.6, 0.55, 640);
sseg({ dur: 2.2, fold: t => 1 - 0.3 * ease(clamp01((t - 0.62) / 0.38)), pose: t => lerpPose(S1A, S1B, t),
  caps: [[0, 2.2, '<div class="big">₹2,99,900</div>' + L('This iPhone <em>folds in half</em>')]] });
sseg({ dur: 2.8, fold: t => 0.7 * (1 - ease(clamp01(t / 0.78))), pose: t => lerpPose(S1B, OPEN, Math.min(1, ease(t) * 1.4)),
  caps: [[0.05, 1.6, L('But glass <em>cracks</em> when you bend it')], [1.6, 2.8, '<div class="big">So how?</div>']] });
sseg({ dur: 4, explode: t => ease(clamp01((t - 0.2) / 0.7)), pose: t => lerpPose(OPEN, OVER, ease(t)),
  caps: [[0.05, 1.7, L('Just <em>5.2 mm</em> thin')], [1.7, 4, L('Let’s open it up')]] });
sseg({ dur: 10, explode: () => 1, dimMap: { inner: 0.8 }, dimDefault: 0.93,
  stack: lt => [ease(clamp01((lt - 0.5) / 1.6)) * (1 - ease(clamp01((lt - 9.2) / 0.8))), ease(clamp01((lt - 4.4) / 0.8)), lt],
  pose: t => P(STACK_C.x, STACK_C.y + 2, STACK_C.z, 0.42 + 0.12 * t, 0.2, 400),
  caps: [[0.3, 4.4, L('Trick 1: the screen is <em>~10 thin layers</em>')], [4.4, 10, L('They <em>slide</em> like paper, so nothing snaps')]] });
sseg({ dur: 5.5, explode: () => 1, dimMap: { hinge: 0 }, dimDefault: 0.97, pose: t => P(0, 34, 22.5, 0.38 + 0.25 * t, 0.32, 200),
  caps: [[0.25, 5.5, L('Trick 2: a <em>3D-printed titanium</em> hinge') + '<div class="sub">gears · springs</div>']] });
sseg({ dur: 5.5, explode: t => 1 - ease(clamp01(t * 5.5 / 1.4)), fold: t => 0.74 * ease(clamp01((t * 5.5 - 1.5) / 2.6)),
  keepOn: true, dimMap: { inner: 0, hinge: 0 }, dimDefault: 0.85, pose: t => P(-14, 30, 10, 0.2 + 0.1 * t, 0.95, 330),
  caps: [[0.25, 5.5, L('Closing, it <em>curls into a teardrop</em> instead of folding flat')]] });
sseg({ dur: 6, keepOn: true, fold: t => 0.74 * (1 - ease(clamp01(t * 6 / 1.4))), pose: t => P(0, 30 - 60 * t, 2.6, 1.3, 0.17, 240),
  caps: [[0.3, 3.1, L('Bend the same spot <em>again and again</em>')], [3.1, 6, L('…and you get <em>the crease</em> you can feel')]] });
sseg({ dur: 4, fold: t => ease(clamp01(t * 4 / 2.6)), pose: t => lerpPose(P(0, -30, 2.6, 1.3, 0.17, 240), S1A, ease(t)),
  caps: [[0.2, 4, L('It doesn’t fold like paper.<br>It <em>rolls like a poster.</em>')]] });
'''
src = src[:a] + tour + src[b:]
for a_, b_ in [("if (Math.abs(sx) + Math.abs(sy) > 0.5) camera.setViewOffset(w, h, sx, sy, w, h); else camera.clearViewOffset();", "camera.setViewOffset(w, h, sx, sy - 0.085 * h, w, h);")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
open('iphone-duo-short.html', 'w').write(src)
print('ok')
