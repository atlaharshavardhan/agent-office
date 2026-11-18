/* WHOOP explainer shots (1080x1920 stills for the Short). Injected into shots.html by build-shots.py.
   Reuses the teardown page's pod, arm and lights through window.__T. Open shots.html?render=1&shot=1 and call __tour.renderAt(i). */
(() => {
'use strict';
const Q = new URLSearchParams(location.search); if (!Q.has('shot')) return;
document.body.classList.add('shot');
const T = window.__T, W = 1080, H = 1920;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- overlay: title, illustrative mark, pills + leader lines, watermark ---------- */
const ui = document.createElement('div'); ui.id = 'shotUI';
ui.innerHTML = `<div id="sArt"></div><div id="sTitle"></div><div id="sIllus">Illustrative · not to scale</div><svg id="sLines" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"></svg><div id="sPills"></div>
  <div id="sWm2">@TheInvisiTech</div><div id="sWm"><img src="../airpods-ear/assets/invisitech-logo.png" alt=""><span>@TheInvisiTech</span></div>`;
document.body.appendChild(ui);
const css = document.createElement('style'); css.textContent = `
  body.shot .top, body.shot #parts, body.shot #controls, body.shot #hint, body.shot #card, body.shot #labels, body.shot #title-card { display: none !important; }
  #shotUI { position: fixed; left: 0; top: 0; width: ${W}px; height: ${H}px; pointer-events: none; font-family: "IBM Plex Sans", sans-serif; color: #f2f4f6; }
  #sTitle { position: absolute; left: 80px; right: 80px; top: 250px; text-align: center; font: 700 76px/1.08 Sora, sans-serif; letter-spacing: -0.02em; text-wrap: balance; }
  #sTitle em { font-style: normal; } #sTitle .g { color: #4be08a; } #sTitle .r { color: #ff4d5e; }
  #sIllus { position: absolute; left: 0; right: 0; top: 452px; text-align: center; font: 400 26px "IBM Plex Sans"; color: rgba(220,226,232,.55); }
  .sp { position: absolute; padding: 12px 24px; border-radius: 999px; font: 600 34px "IBM Plex Sans"; background: rgba(10,12,14,.84); border: 2px solid rgba(255,255,255,.2); white-space: nowrap; transform: translate(-50%, -50%); }
  .sp.g { border-color: rgba(75,224,138,.75); color: #d9ffe8; } .sp.r { border-color: rgba(255,77,94,.75); color: #ffe0e4; }
  #sArt { position: absolute; inset: 0; }
  #sWm { position: absolute; right: 18px; top: 960px; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 14px; opacity: .8; }
  #sWm img { width: 70px; height: 70px; border-radius: 50%; } #sWm span { writing-mode: vertical-rl; font: 600 27px "IBM Plex Sans"; color: rgba(255,255,255,.85); letter-spacing: .04em; }
  #sWm2 { position: absolute; left: 330px; top: 1010px; font: 600 40px "IBM Plex Sans"; color: rgba(255,255,255,.06); transform: rotate(-12deg); }`;
document.head.appendChild(css);
const $ = id => document.getElementById(id);
const proj = v => { const p = v.clone().project(T.camera); return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H]; };
function pills(list) {   // [{ text, cls, at: [x,y] screen, to: Vector3 (optional leader target) }]
  $('sPills').innerHTML = ''; let svg = '';
  list.forEach(p => { const d = document.createElement('div'); d.className = 'sp ' + (p.cls || ''); d.innerHTML = p.text; d.style.left = p.at[0] + 'px'; d.style.top = p.at[1] + 'px'; $('sPills').appendChild(d);
    if (p.to) { const [x, y] = Array.isArray(p.to) ? p.to : proj(p.to); const col = p.cls === 'r' ? 'rgba(255,77,94,.8)' : 'rgba(75,224,138,.8)';
      svg += `<line x1="${p.at[0]}" y1="${p.at[1] + (y > p.at[1] ? 30 : -30)}" x2="${x}" y2="${y}" stroke="${col}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="9" fill="${col}"/><circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${col}" stroke-opacity=".35" stroke-width="3"/>`; } });
  $('sLines').innerHTML = svg;
}

/* ---------- extra props ---------- */
const extras = [];
const add = (o, parent = T.scene) => { parent.add(o); extras.push(o); o.visible = false; return o; };
// sensor-window glow: rounded window with rings, light "rays" and the LED/photodiode dots (our own design)
const glowTex = canvasTex(520, 680, (x, w, h) => {
  x.clearRect(0, 0, w, h); const cx = w / 2, cy = h / 2;
  const rr = (s, a, lw) => { const ww = w * s, hh = h * s, r = 60 * s; x.beginPath(); x.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, r); x.strokeStyle = `rgba(90,255,150,${a})`; x.lineWidth = lw; x.stroke(); };
  const g = x.createRadialGradient(cx, cy, 10, cx, cy, w * .55); g.addColorStop(0, 'rgba(60,255,130,.75)'); g.addColorStop(.5, 'rgba(30,200,100,.25)'); g.addColorStop(1, 'rgba(0,80,40,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  [0.92, 0.76, 0.6, 0.44].forEach((s, i) => rr(s, 0.55 - i * 0.08, 3));
  const r = rng(3); for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, L = 40 + r() * 120 * (0.5 + 0.5 * Math.abs(Math.sin(a * 3))); x.strokeStyle = 'rgba(120,255,170,.55)'; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); x.lineTo(cx + Math.cos(a) * (70 + L), cy + Math.sin(a) * (70 + L)); x.stroke(); }
  [-170, -85, 0, 85, 170].forEach((dy, i) => { const c = i === 3 ? '255,80,80' : i === 4 ? '200,120,255' : '200,255,220'; const gg = x.createRadialGradient(cx, cy + dy, 2, cx, cy + dy, 34); gg.addColorStop(0, `rgba(${c},1)`); gg.addColorStop(1, `rgba(${c},0)`); x.fillStyle = gg; x.beginPath(); x.arc(cx, cy + dy, 34, 0, 7); x.fill(); });
  [[-130, -250], [130, -250], [-130, 250], [130, 250]].forEach(([dx, dy]) => { x.fillStyle = 'rgba(10,20,40,.9)'; x.fillRect(cx + dx - 40, cy + dy - 40, 80, 80); x.strokeStyle = 'rgba(90,255,150,.8)'; x.lineWidth = 3; x.strokeRect(cx + dx - 40, cy + dy - 40, 80, 80); });
});
const winGlow = add(new THREE.Mesh(new THREE.PlaneGeometry(13.2, 17.4), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })), T.BOTTOM.group);
winGlow.rotation.x = Math.PI / 2; winGlow.position.y = -0.45; winGlow.userData.ghost = true;
// straps running straight off both ends (for the off-the-wrist shots)
const straps = add(new THREE.Group(), T.BAND.group);
[-1, 1].forEach(s => { const m = new THREE.Mesh(T.pillow(T.POD.W - 0.2, 80, 3, 1.9, 0.7), T.knitMat()); m.material.map = m.material.map.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set(1 / 6, 1 / 6);
  m.position.set(0, T.POD.H - 0.2, s * (T.FRAME.L / 2 + 40)); m.userData.ghost = true; straps.add(m); });
const underLight = add(new THREE.DirectionalLight(0xfff2e6, 0.55)); underLight.position.set(60, -200, 160);
const underRim = add(new THREE.DirectionalLight(0xcfe0ff, 0.7)); underRim.position.set(-220, -40, -120);
// warm blurred backdrop (seen when looking up from under the wrist)
const warmTex = canvasTex(512, 512, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2); g.addColorStop(0, '#5a3a2a'); g.addColorStop(.55, '#2a1a12'); g.addColorStop(1, '#070506'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const backdrop = add(new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ map: warmTex })));
// skin with veins (flat lay for the stethoscope comparison)
const veinTex = canvasTex(1024, 1024, (x, w, h) => {
  const g = x.createRadialGradient(w * .5, h * .5, 50, w * .5, h * .5, w * .62); g.addColorStop(0, '#6e4636'); g.addColorStop(.7, '#3a2219'); g.addColorStop(1, '#120a08'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const r = rng(9); for (let i = 0; i < 6000; i++) { x.fillStyle = `rgba(60,30,20,${(r() * .15).toFixed(3)})`; x.beginPath(); x.arc(r() * w, r() * h, .8 + r(), 0, 7); x.fill(); }
  const vein = (px, py, ang, len, wd, depth) => { if (depth > 5 || wd < .6) return; x.strokeStyle = `rgba(150,40,50,${.25 + wd * .04})`; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, py); let qx = px, qy = py;
    for (let k = 0; k < 10; k++) { ang += (r() - .5) * .5; qx += Math.cos(ang) * len / 10; qy += Math.sin(ang) * len / 10; x.lineTo(qx, qy); } x.stroke();
    vein(qx, qy, ang + .5 + r() * .4, len * .7, wd * .7, depth + 1); vein(qx, qy, ang - .5 - r() * .4, len * .65, wd * .65, depth + 1); };
  vein(80, 900, -1.1, 420, 9, 0); vein(560, 1000, -1.6, 380, 8, 0); vein(1000, 760, -2.4, 400, 7, 0);
});
const skinFlat = add(new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshStandardMaterial({ map: veinTex, roughness: 0.6 }))); skinFlat.rotation.x = -Math.PI / 2;
// stethoscope chest piece (generic, no brand)
const steth = add(new THREE.Group());
{ const chrome = new THREE.MeshStandardMaterial({ color: 0xf0f2f4, metalness: 1, roughness: 0.1, envMap: T.METAL_ENV });
  const ringM = new THREE.Mesh(new THREE.CylinderGeometry(14, 14.6, 4.5, 64), chrome); ringM.position.y = 2.25; steth.add(ringM);
  const dia = new THREE.Mesh(new THREE.CylinderGeometry(12.6, 12.6, 0.6, 64), new THREE.MeshPhysicalMaterial({ color: 0x0c0d10, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.4 })); dia.position.y = 4.6; steth.add(dia);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.3 })); dot.position.y = 4.9; steth.add(dot);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 14, 24), chrome); stem.rotation.z = Math.PI / 2; stem.rotation.y = -0.75; stem.position.set(-14.5, 2.5, 10.5); steth.add(stem);
  const curve = new THREE.CatmullRomCurve3([V3(-19, 2.5, 15), V3(-28, 2.4, 26), V3(-30, 2.2, 52), V3(-46, 2, 80), V3(-70, 2, 110)]);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 2.2, 16), new THREE.MeshPhysicalMaterial({ color: 0x0d0e10, roughness: 0.35, clearcoat: 0.6 })); steth.add(tube); }
// red blood cell macro (its own little scene)
const macro = new THREE.Scene(); macro.background = new THREE.Color(0x120405);
const macroCam = new THREE.PerspectiveCamera(30, W / H, 1, 2000);
{ macro.environment = T.scene.environment;
  const k = new THREE.SpotLight(0xffe6dc, 0.55, 0, 0.6, 0.8, 0); k.position.set(-80, 160, 140); macro.add(k);
  const rimL = new THREE.DirectionalLight(0xff8a80, 1.2); rimL.position.set(160, 40, -120); macro.add(rimL);
  const prof = []; for (let i = 0; i <= 24; i++) { const r = i / 24; prof.push(new THREE.Vector2(r, Math.sqrt(Math.max(0, 1 - r * r)) * (0.2 + 0.9 * r * r - 0.6 * r ** 4) * 0.55)); }
  for (let i = 24; i >= 0; i--) { const r = i / 24; prof.push(new THREE.Vector2(r, -Math.sqrt(Math.max(0, 1 - r * r)) * (0.2 + 0.9 * r * r - 0.6 * r ** 4) * 0.55)); }
  const geo = new THREE.LatheGeometry(prof, 96); geo.computeVertexNormals();
  const cellMat = new THREE.MeshPhysicalMaterial({ color: 0xa80f1c, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.35, emissive: 0x220205, envMapIntensity: 0.25 });
  const cell = new THREE.Mesh(geo, cellMat); cell.scale.setScalar(26); cell.rotation.set(0.62, 0, 0.3); macro.add(cell); T.__cell = cell;
  const blurTex = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(200,30,40,.9)'); g.addColorStop(.6, 'rgba(150,20,30,.5)'); g.addColorStop(1, 'rgba(100,10,20,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const r = rng(12); for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blurTex, transparent: true, opacity: 0.18 + r() * 0.3, depthWrite: false })); const sc = 12 + r() * 26; s.scale.set(sc, sc * (0.5 + r() * .5), 1);
    s.position.set((r() - .5) * 200, (r() - .5) * 320, -60 - r() * 160); macro.add(s); }
  const beam = (from, to, w0, w1, c0, c1, a = 1) => { const dir = to.clone().sub(from), len = dir.length();
    const tex = canvasTex(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g; x.fillRect(0, 0, w, h); const e = x.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(.3, 'rgba(0,0,0,0)'); e.addColorStop(.7, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = e; x.fillRect(0, 0, w, h); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-w0 / 2, 0, 0, w0 / 2, 0, 0, w1 / 2, len, 0, -w1 / 2, len, 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.copy(from); m.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.normalize()); macro.add(m); return m; };
  const hit = V3(-8, 10, 12);
  beam(V3(-120, 210, 30), hit, 3, 4, 'rgba(70,255,140,1)', 'rgba(70,255,140,.9)');            // green light comes in...
  beam(hit, V3(4, -4, 4), 4, 0.5, 'rgba(70,255,140,.9)', 'rgba(70,255,140,0)', 0.9);          // ...and is soaked up inside the cell
  [[150, 120, 3, 14], [160, 70, 3, 16], [140, 165, 2.5, 12]].forEach(([x2, y2, w0, w1]) => beam(hit.clone().add(V3(2, 1, 1)), V3(x2, y2, 20), w0, w1, 'rgba(255,70,60,.95)', 'rgba(255,90,60,0)'));   // red bounces off
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: blurTex, color: 0xaaffcc, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flare.scale.set(9, 9, 1); flare.position.copy(hit); macro.add(flare);
}

/* ---------- 2D illustration: walking to work (our own character, faceless) ---------- */
function walkSVG(zoom) {
  const r = rng(5);
  const windows = (x0, y0, cols, rows, dx, dy, w, h) => { let o = ''; for (let jj = 0; jj < rows; jj++) for (let ii = 0; ii < cols; ii++) { const lit = r() < .5; o += `<rect x="${x0 + ii * dx}" y="${y0 + jj * dy}" width="${w}" height="${h}" rx="4" fill="${lit ? '#e8b46a' : '#1c2230'}" opacity="${lit ? .5 + r() * .45 : .9}"/>`; } return o; };
  const balcony = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="10" fill="#0e121a"/>` + [...Array(Math.floor(w / 16))].map((_, k) => `<rect x="${x + 4 + k * 16}" y="${y - 34}" width="4" height="34" fill="#0e121a"/>`).join('') + `<rect x="${x}" y="${y - 38}" width="${w}" height="6" fill="#0e121a"/>`;
  const person = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="0" cy="-200" r="30"/><path d="M-40 -165 q40 -16 80 0 l8 150 h-96 z"/><rect x="-34" y="-20" width="28" height="200" rx="12"/><rect x="6" y="-20" width="28" height="200" rx="12"/></g>`;
  const sh = '#0c0f15';
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;inset:0">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070b"/><stop offset=".45" stop-color="#121a2a"/><stop offset=".72" stop-color="#2a2a33"/><stop offset="1" stop-color="#0b0c0f"/></linearGradient>
    <radialGradient id="lamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf87" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf87" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx=".5" cy=".55" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    <linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset=".78" stop-color="#05070b"/><stop offset="1" stop-color="#05070b" stop-opacity="0"/></linearGradient>
    <radialGradient id="ledg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5cff9a" stop-opacity=".95"/><stop offset="1" stop-color="#5cff9a" stop-opacity="0"/></radialGradient>
    <linearGradient id="teeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16393b"/><stop offset=".55" stop-color="#28605f"/><stop offset="1" stop-color="#1b4646"/></linearGradient>
    <linearGradient id="skinG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b07a56"/><stop offset="1" stop-color="#7c4f36"/></linearGradient>
    <linearGradient id="denimG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a3244"/><stop offset=".6" stop-color="#3b4660"/><stop offset="1" stop-color="#262d3e"/></linearGradient>
    <pattern id="knit" width="9" height="7" patternUnits="userSpaceOnUse"><rect width="9" height="7" fill="#09090a"/><ellipse cx="4.5" cy="3.5" rx="3" ry="2.3" fill="#2e2e33"/></pattern>
    <pattern id="tiles" width="120" height="40" patternUnits="userSpaceOnUse"><rect width="120" height="40" fill="#15171c"/><path d="M0 0 H120 M0 0 V40" stroke="#22252c" stroke-width="3"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <!-- far buildings -->
  <rect x="-10" y="700" width="260" height="760" fill="#111723"/>${windows(20, 740, 3, 6, 76, 110, 46, 60)}${balcony(10, 960, 230)}${balcony(10, 1180, 230)}
  <rect x="250" y="620" width="230" height="840" fill="#0e131d"/>${windows(275, 660, 3, 7, 66, 104, 40, 58)}
  <rect x="760" y="660" width="330" height="800" fill="#111723"/>${windows(790, 700, 4, 6, 72, 112, 44, 62)}${balcony(780, 920, 300)}${balcony(780, 1144, 300)}
  <!-- chai stall with a warm sign (generic) -->
  <rect x="780" y="1250" width="300" height="210" fill="#1a1712"/><rect x="780" y="1250" width="300" height="70" fill="#3a2a16"/>
  <text x="930" y="1298" text-anchor="middle" font-family="Sora" font-weight="700" font-size="40" fill="#ffc46b" opacity=".9">CHAI</text>
  <rect x="800" y="1330" width="260" height="120" fill="#e8b46a" opacity=".22"/>
  <!-- street lamp -->
  <rect x="210" y="900" width="10" height="560" fill="${sh}"/><path d="M215 900 q60 -20 90 10" stroke="${sh}" stroke-width="10" fill="none"/><circle cx="305" cy="922" r="140" fill="url(#lamp)"/><rect x="290" y="910" width="32" height="14" rx="5" fill="#ffd79a"/>
  <!-- auto-rickshaw silhouette -->
  <g transform="translate(560 1300)" fill="${sh}"><path d="M0 100 h250 q20 0 20 -20 v-60 q0 -70 -80 -90 h-120 q-60 0 -70 60 z"/><rect x="140" y="-60" width="70" height="80" rx="10" fill="#1a2030"/><circle cx="40" cy="105" r="30"/><circle cx="220" cy="105" r="30"/></g>
  ${person(120, 1460, .9, '#0d1018')}${person(430, 1440, .7, '#0f131c')}${person(1010, 1470, .85, '#0d1018')}
  <!-- footpath -->
  <rect x="0" y="1460" width="${W}" height="460" fill="url(#tiles)"/><rect x="0" y="1460" width="${W}" height="8" fill="#2a2d35"/>
  <ellipse cx="560" cy="1660" rx="300" ry="26" fill="#000" opacity=".55"/>
  <!-- character walking right: faceless (head in shadow), Indian skin tone, WHOOP band on the near wrist -->
  <defs>
    <linearGradient id="tee2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#143536"/><stop offset=".55" stop-color="#2a6866"/><stop offset=".85" stop-color="#245a59"/><stop offset="1" stop-color="#163e3e"/></linearGradient>
    <linearGradient id="sleeve2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f706e"/><stop offset="1" stop-color="#1d4b4a"/></linearGradient>
    <linearGradient id="arm2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4b33"/><stop offset=".45" stop-color="#b37c58"/><stop offset="1" stop-color="#8a5a3e"/></linearGradient>
    <linearGradient id="jean2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#222a3b"/><stop offset=".5" stop-color="#3a4762"/><stop offset="1" stop-color="#252d40"/></linearGradient>
    <linearGradient id="jeanFar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#171c28"/><stop offset="1" stop-color="#242b3c"/></linearGradient>
  </defs>
  <g stroke-linejoin="round">
    <!-- far arm (behind the body, swinging back) -->
    <path d="M470 662 C 446 740 428 820 414 892 L 452 904 C 466 836 486 760 504 690 Z" fill="#163a3a"/>
    <path d="M414 888 C 400 950 388 1000 378 1040 L 410 1052 C 422 1010 438 958 452 900 Z" fill="#6a412c"/>
    <path d="M376 1036 c -14 26 -10 52 10 58 c 16 4 28 -14 30 -40 z" fill="#5e3a27"/>
    <!-- far leg (back) -->
    <path d="M462 1186 L 548 1190 C 536 1270 512 1340 480 1404 C 452 1460 410 1520 372 1574 L 312 1548 C 350 1490 388 1432 414 1378 C 436 1320 452 1258 462 1186 Z" fill="url(#jeanFar)"/>
    <path d="M300 1546 c -26 6 -34 34 -18 50 l 112 18 c 14 -4 16 -20 6 -32 l -38 -30 z" fill="#c9c6bf"/><path d="M282 1596 l 114 18 l -2 10 l -116 -18 z" fill="#8f8c86"/>
    <!-- head in shadow (no face) and neck -->
    <path d="M492 548 L 498 640 L 552 640 L 556 548 Z" fill="#1a1e27"/>
    <path d="M520 382 c -58 0 -96 40 -98 96 c -2 50 28 90 74 100 c 36 8 72 -2 92 -30 c 14 -20 18 -48 14 -74 c -8 -58 -38 -92 -82 -92 z" fill="#10131a"/>
    <path d="M436 452 c 8 -52 46 -80 90 -80 c 48 0 80 30 88 72 c -30 -24 -60 -32 -96 -30 c -34 2 -60 14 -82 38 z" fill="#07080b"/>
    <path d="M604 452 c 10 28 10 58 -4 84" stroke="#3a4a5e" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
    <!-- torso: t-shirt -->
    <path d="M452 628 C 428 660 424 770 428 900 C 430 1000 432 1100 438 1180 L 616 1180 C 620 1090 626 990 622 890 C 618 790 606 700 582 654 C 562 626 500 614 452 628 Z" fill="url(#tee2)"/>
    <path d="M478 622 q 46 22 92 2" stroke="#0e2627" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M470 760 q 40 30 70 120 M 452 980 q 60 20 140 4 M 560 700 q 30 60 30 140" stroke="#0f2a2b" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>
    <!-- belt + hips -->
    <path d="M436 1166 L 618 1166 L 620 1200 L 434 1200 Z" fill="#0d0d0e"/><rect x="582" y="1168" width="22" height="30" rx="3" fill="#6f6f6f"/>
    <path d="M440 1200 L 618 1200 L 614 1262 L 444 1262 Z" fill="url(#jean2)"/>
    <!-- near leg (forward) -->
    <path d="M520 1196 L 616 1200 C 632 1266 650 1330 664 1396 C 676 1456 694 1526 712 1592 L 646 1610 C 628 1546 610 1478 596 1416 C 580 1350 552 1280 520 1196 Z" fill="url(#jean2)"/>
    <path d="M574 1250 C 600 1330 622 1420 676 1596" stroke="#55627f" stroke-width="2.5" stroke-dasharray="10 8" fill="none" opacity=".7"/>
    <path d="M600 1380 q 30 8 54 0" stroke="#1c2232" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M640 1600 c -8 26 2 50 30 54 l 140 -2 c 20 -4 24 -24 8 -38 c -24 -20 -60 -28 -96 -32 z" fill="#efece6"/>
    <path d="M668 1652 l 144 -2 c 4 6 2 14 -4 16 l -142 4 c -8 -4 -8 -12 2 -18 z" fill="#9a968f"/>
    <path d="M690 1604 l 16 22 M 708 1600 l 16 22 M 726 1602 l 14 20" stroke="#3a3a3e" stroke-width="4" stroke-linecap="round"/>
    <!-- near arm: sleeve, upper arm, forearm swinging forward -->
    <path d="M540 642 C 590 650 626 700 640 780 L 652 846 L 584 866 C 576 820 562 770 534 734 Z" fill="url(#sleeve2)"/>
    <path d="M592 862 L 650 844 C 660 880 672 912 682 940 L 624 964 C 612 930 600 896 592 862 Z" fill="url(#arm2)"/>
    <path d="M624 960 L 682 936 C 704 976 726 1016 748 1054 L 698 1082 C 676 1044 650 1002 624 960 Z" fill="url(#arm2)"/>
    <path d="M698 1080 C 688 1110 694 1150 726 1164 C 752 1174 776 1154 776 1124 C 776 1100 766 1074 750 1052 Z" fill="#a06e4e"/>
    <path d="M748 1080 c 18 10 24 28 18 44" stroke="#7a4f37" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- WHOOP band on the wrist: knit strap, chrome frame, clasp plate (face toward the viewer) -->
    <g transform="translate(718 1050) rotate(-30)">
      <rect x="-40" y="-20" width="80" height="40" rx="8" fill="url(#knit)"/>
      <rect x="-30" y="-27" width="60" height="54" rx="12" fill="#2b2c30" stroke="#e3e6ea" stroke-width="4.5"/>
      <rect x="-24" y="-21" width="48" height="34" rx="8" fill="url(#knit)"/>
      <rect x="-26" y="12" width="52" height="12" rx="4" fill="#dfe3e8"/>
      <text x="0" y="21.5" text-anchor="middle" font-family="Sora" font-weight="700" font-size="7.5" letter-spacing="1.6" fill="#4a4f57">WHOOP</text>
    </g>
    <circle cx="716" cy="1052" r="54" fill="url(#ledg)" opacity=".45"/>
  </g>
  <!-- zoom bubble: the real 3D band from our model -->
  ${zoom ? `<defs><clipPath id="zc"><circle cx="790" cy="730" r="148"/></clipPath></defs>
  <line x1="728" y1="1030" x2="760" y2="878" stroke="rgba(75,224,138,.7)" stroke-width="3"/>
  <circle cx="790" cy="730" r="154" fill="#000"/>
  <image href="${zoom}" x="${790 - 540 * 0.62}" y="${730 - 960 * 0.62}" width="${1080 * 0.62}" height="${1920 * 0.62}" clip-path="url(#zc)"/>
  <circle cx="790" cy="730" r="150" fill="none" stroke="#e3e6ea" stroke-width="6"/><circle cx="790" cy="730" r="160" fill="none" stroke="rgba(75,224,138,.55)" stroke-width="3"/>` : ''}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
  <rect x="0" y="0" width="${W}" height="600" fill="url(#topfade)"/>
  </svg>`;
}

/* ---------- shot list ---------- */
function reset() {
  extras.forEach(o => o.visible = false);
  T.ARM.visible = true; T.table.visible = true; T.BAND_LOOP.visible = true; T.BAND_ENDS.visible = true;
  T.root.rotation.set(0, 0, 0); T.root.position.set(0, 0, 0);
  [T.key, T.rim, T.rim2, T.kick].forEach(l => l.visible = true);
  T.scene.background = new THREE.Color(0x050607); T.scene.fog = null;
  T.camera.up.set(0, 1, 0); T.camera.clearViewOffset();
  T.renderer.domElement.style.opacity = 1; $('sArt').innerHTML = ''; $('sIllus').style.display = '';
  T.setGlass(0); T.SENSOR.flip = 0; T.parts.forEach(p => p.dim = 0);
}
function pod(e, glass = 0, t = 0.2) { T.setExplode(e); T.applyExplode(e); T.setGlass(glass); T.applyMaterials(); T.applyLed(t, 1); }
function cam(pos, target, up, oy = 0) { T.camera.position.copy(pos); if (up) T.camera.up.copy(up); T.camera.lookAt(target); if (oy) T.camera.setViewOffset(W, H, 0, oy, W, H); T.camera.updateProjectionMatrix(); }
function draw3D() { T.scene.updateMatrixWorld(true); T.renderer.render(T.scene, T.camera); }
const offWrist = () => { T.ARM.visible = false; T.table.visible = false; T.BAND_LOOP.visible = false; T.BAND_ENDS.visible = false; };

const SHOTS = [
  // 1. underside: the green glow on the skin side
  () => { offWrist(); straps.visible = true; winGlow.visible = true; underLight.visible = true; underRim.visible = true; backdrop.visible = true;
    backdrop.position.set(0, 120, 0); backdrop.rotation.x = Math.PI / 2;
    pod(0, 0); cam(V3(0, -205, 0), V3(0, 3, 0), V3(0, 0, -1), -60); draw3D();
    $('sTitle').innerHTML = 'So what is <em class="g">that green glow</em> underneath?';
    pills([{ text: 'Sensor window', cls: 'g', at: [290, 1250], to: V3(-4, -0.5, 6.5) }]); },
  // 2. stethoscope comparison: it listens to your heart, with light
  () => { offWrist(); straps.visible = true; winGlow.visible = true; skinFlat.visible = true; steth.visible = true;
    T.root.rotation.z = Math.PI; T.root.position.set(24, 0, 0); skinFlat.position.set(0, -7.7, 0); steth.position.set(-32, -7.7, -4);
    pod(0, 0); cam(V3(-6, 330, 0.01), V3(-6, 0, 0), V3(0, 0, -1), -60); draw3D();
    $('sTitle').innerHTML = 'Like a stethoscope, it listens <em class="r">to your heart</em>';
    pills([{ text: 'Listens with sound', cls: 'r', at: [270, 1250], to: V3(-32, -3, -4) }, { text: 'Listens with light', cls: 'g', at: [770, 1250], to: V3(24, -2, 0) }]); },
  // 3. walking to work (2D illustration)
  () => { pod(0, 0); cam(V3(8, 430, 80), V3(0, 3, 0), null, 0); draw3D(); const zoom = T.renderer.domElement.toDataURL('image/jpeg', 0.92);
    T.renderer.domElement.style.opacity = 0; $('sArt').innerHTML = walkSVG(zoom); $('sIllus').style.display = 'none';
    $('sTitle').innerHTML = 'Walking to work, <em class="g">it never stops reading</em>';
    pills([{ text: '♥ 74 bpm', cls: 'r', at: [790, 885] }]); },
  // 4. on the wrist, from above: no screen at all
  () => { pod(0, 0); cam(V3(6, 215, 40), V3(0, 2, 0), null, -40); draw3D();
    $('sTitle').innerHTML = 'No screen. It just <em class="g">keeps reading</em>';
    pills([{ text: '♥ Heart rate', cls: 'r', at: [240, 1250], to: V3(-6, 8, 6) }, { text: 'Skin temperature', cls: 'g', at: [770, 1250], to: V3(6, 8, 10) }]); },
  // 5. tilted exploded stack from below: the green LEDs
  () => { offWrist(); underLight.visible = true; underRim.visible = true; winGlow.visible = true;
    pod(1, 0, 0.3); cam(V3(200, -80, 320), V3(0, 50, 0), null, -120); draw3D();
    $('sTitle').innerHTML = 'Underneath, there are <em class="g">green LEDs</em>';
    const sb = T.SENSOR.group.position.y + 1.7;
    pills([{ text: 'Green LEDs', cls: 'g', at: [800, 1060], to: V3(0, sb, 0) }, { text: 'Sensor window', cls: 'g', at: [300, 1250], to: V3(-3, -0.4, 4) }]); },
  // 6. red blood cell macro: blood soaks up green light, red bounces off
  () => { macroCam.position.set(10, 10, 250); macroCam.lookAt(10, 6, 0); macroCam.setViewOffset(W, H, 0, -60, W, H); macroCam.updateProjectionMatrix();
    T.renderer.render(macro, macroCam);
    $('sTitle').innerHTML = 'Blood <em class="r">soaks up</em> <em class="g">green light</em>';
    const p = v => { const q = v.clone().project(macroCam); return [(q.x * .5 + .5) * W, (-q.y * .5 + .5) * H]; };
    pills([{ text: 'Red blood cell', cls: 'r', at: [760, 1250], to: [560, 1150] }, { text: 'Green light in', cls: 'g', at: [250, 620], to: [150, 770] }, { text: 'Red bounces off', cls: 'r', at: [800, 640], to: [640, 760] }]); },
];
window.__tour = { total: SHOTS.length, renderAt(i) { reset(); $('sPills').innerHTML = ''; $('sLines').innerHTML = ''; SHOTS[Math.round(i)](); return true; } };
window.__tourReady = () => true;
})();
