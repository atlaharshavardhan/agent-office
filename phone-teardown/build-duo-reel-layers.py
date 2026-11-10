"""Build reel-layers.html: the 10-layer screen model as a 9:16 reel shot (?render=1&clean=1)."""
s = open('iphone-duo-screen-layers.html').read()
def R(a, b):
    global s
    assert s.count(a) == 1, a[:70]; s = s.replace(a, b)

# reel look: black with a faint glow, all page UI hidden
R('</style>', '''
body.reel { background: radial-gradient(ellipse 95% 62% at 50% 46%, #142a52 0%, #0b1833 42%, #060d1f 72%, #03060f 100%) !important; }
body.reel .top, body.reel #rail, body.reel #card, body.reel #controls, body.reel #hint, body.reel #labels { display: none !important; }
#rl { position: fixed; inset: 0; pointer-events: none; display: none; }
body.reel #rl { display: block; }
#rl svg { position: absolute; inset: 0; width: 100%; height: 100%; }
#rl .t { position: absolute; left: 64px; font-family: Sora, var(--font-display); font-weight: 600; font-size: 38px; color: #fff; white-space: nowrap; transform: translateY(-50%); text-shadow: 0 2px 12px rgba(0,0,0,.8); }
#rl .t em { font-style: normal; font-family: "IBM Plex Mono", var(--font-mono); font-weight: 500; font-size: 26px; color: #f0a640; margin-right: 14px; }
</style>''')
R('<div id="labels"></div>', '<div id="labels"></div><div id="rl"><svg id="rlsvg"></svg></div>')
R("const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });",
  "const RENDER = /[?&]render=1/.test(location.search); if (RENDER) document.body.classList.add('reel');\nconst renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: RENDER });")
R("const gapE = 7, gapC = 1.25,", "const gapE = RENDER ? 17 : 7, gapC = 1.25,")

# deterministic shot, driven by window.__tour.renderAt(t)
R("requestAnimationFrame(loop);\n})();", r'''
const SHORT = ['Cover', 'Clear glue', 'Polarizer', 'Touch sensor', 'Seal', 'OLED pixels', 'Transistors', 'Bendable base', 'Cushion', 'Steel plate'];
const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, cl = x => Math.max(0, Math.min(1, x));
const lerp = (a, b, u) => a + (b - a) * u;
// poses: [tx, ty, tz, az, el, dist]
// [tx, ty, tz, az, el, dist, offX (share of width, + moves the model right), offY (+ moves it up)]
const A = [0, 10, 0, 0.62, 0.45, 760, 0.0, 0.02], B = [0, 76, 0, 0.5, 0.26, 1250, 0.175, 0.0], C = [-22, 34, 0, 0.02, 0.06, 640, 0.0, 0.02];
function reelState(t) {
  const e1 = ease(cl((t - 0.3) / 1.9));               // single sheet -> 10 layers (counter ticks with it)
  const e2 = ease(cl((t - 3.6) / 0.9));               // squeeze a bit so the bend reads
  const explode = e1 * (1 - 0.6 * e2);
  const fold = 0.95 * ease(cl((t - 4.2) / 2.0)) * (1 - ease(cl((t - 7.6) / 1.6)));   // bend, then flatten again
  const u1 = ease(cl(t / 2.4)), u2 = ease(cl((t - 3.4) / 1.4));
  const p = A.map((a, k) => lerp(lerp(a, B[k], u1), C[k], u2));
  const la = cl((t - 0.9) / 0.4) * (1 - cl((t - 3.4) / 0.35));
  return { explode, fold, p, la, t };
}
const rlsvg = document.getElementById('rlsvg'), rl = document.getElementById('rl');
const tags = SHORT.map((n, i) => { const d = document.createElement('div'); d.className = 't'; d.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em>`; d.append(n); rl.appendChild(d); return d; });
function draw(st) {
  place(st.explode, st.fold);
  const [tx, ty, tz, az, el, dist, ox, oy] = st.p, c = Math.cos(el);
  camera.setViewOffset(innerWidth, innerHeight, -ox * innerWidth, oy * innerHeight, innerWidth, innerHeight); camera.updateProjectionMatrix();
  camera.position.set(tx + dist * c * Math.sin(az), ty + dist * Math.sin(el), tz + dist * c * Math.cos(az));
  camera.lookAt(tx, ty, tz); camera.updateMatrixWorld(); renderer.render(scene, camera);
  // labels: left column, leader line to the layer's left edge; each one appears as its layer separates
  const w = innerWidth, h = innerHeight; let svg = '', prevY = -1e9;
  const pts = layers.map((L, i) => { tmp.set(-W / 2 + 2, L.anchor.y, H / 2 - 14).project(camera); return { x: (tmp.x * .5 + .5) * w, y: (-tmp.y * .5 + .5) * h, i }; });
  pts.forEach(q => { const y = Math.max(q.y, prevY + 54); prevY = y;
    const a = st.la * cl((st.t - 0.9 - q.i * 0.13) / 0.25);
    const tg = tags[q.i]; tg.style.top = y + 'px'; tg.style.opacity = a;
    const x0 = 64 + tg.offsetWidth + 14;
    svg += `<g opacity="${a}"><polyline points="${x0},${y} ${q.x - 18},${y} ${q.x},${q.y}" fill="none" stroke="rgba(240,166,64,.75)" stroke-width="2"/><circle cx="${q.x}" cy="${q.y}" r="6" fill="#f0a640"/></g>`; });
  rlsvg.innerHTML = svg;
}
if (RENDER) {
  layers.forEach(L => { L.mesh.material.opacity = L.mesh.material.userData.base; });
  window.__tour = { total: 10, renderAt(t) { draw(reelState(t)); return true; } };
} else requestAnimationFrame(loop);
})();''')
import base64 as _b64
HOME = 'data:image/jpeg;base64,' + _b64.b64encode(open('duo-home-screen.jpg', 'rb').read()).decode()
# the OLED layer shows the real Duo home screen, so the stack first reads as "the screen", then splits apart
R("if (RENDER) {\n  layers.forEach(L => { L.mesh.material.opacity = L.mesh.material.userData.base; });",
  "if (RENDER) {\n  const homeImg = new Image(); homeImg.onload = () => { const cv = MAPS.oled.image, x = cv.getContext('2d'), w = cv.width, h = cv.height, r = w * R / W;\n"
  "    x.save(); x.clearRect(0, 0, w, h); x.beginPath(); x.roundRect(0, 0, w, h, r); x.clip(); x.drawImage(homeImg, 0, 0, w, h);\n"
  "    x.globalAlpha = 0.12; const c = ['#ff3b4a', '#33e06a', '#3b7bff']; for (let y = 0; y < h; y += 7) for (let xx = (y / 7) % 2 ? 4 : 0; xx < w; xx += 9) c.forEach((k, i) => { x.fillStyle = k; x.fillRect(xx + i * 3, y + 1, 2, 5); }); x.restore(); MAPS.oled.needsUpdate = true; window.__homeReady = true; };\n"
  "  homeImg.src = '" + HOME + "';\n"
  "  layers.forEach(L => { L.mesh.material.opacity = L.mesh.material.userData.base; });")
# layers above the pixels are see-through while stacked, so the screen reads through them
R("function draw(st) {\n  place(st.explode, st.fold);",
  "function draw(st) {\n  place(st.explode, st.fold);\n  layers.forEach((L, i) => { if (i < 5) L.mesh.material.opacity = L.mesh.material.userData.base * (0.18 + 0.5 * Math.min(1, st.explode * 1.4)); });")
R("const SHORT = ['Cover', 'Clear glue', 'Polarizer', 'Touch sensor', 'Seal', 'OLED pixels',", "const SHORT = ['Cover', 'Clear glue', 'Polarizer', 'Touch sensor', 'Seal', 'OLED pixels (picture)',")
R("window.__tour = { total: 10, renderAt(t) { draw(reelState(t)); return true; } };", "window.__tour = { total: 10, renderAt(t) { draw(reelState(t)); return true; } };\n  window.__tourReady = () => !!window.__homeReady;")
open('iphone-duo-reel-layers.html', 'w').write(s)
print('ok')
