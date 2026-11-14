// ===================================================================================
// CINEMATIC LAYER: perspective camera rig, new sets, secondary motion, 3D info graphics
// (spliced into cine.html inside the module, after all scene objects exist)
// ===================================================================================
const UP = new THREE.Vector3(0, 1, 0);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = x => Math.min(1, Math.max(0, x));
const smoother = u => u * u * u * (u * (u * 6 - 15) + 10);
const lerp = (a, b, k) => a + (b - a) * k;
scene.fog = null;

// ---------- helpers: text as a 3D plane (canvas texture) ----------
function textPlane(lines, { w = 2, h = 0.6, bg = 'rgba(14,16,30,.86)', border = 'rgba(255,255,255,.25)', color = '#fff', accent = '#ffc94a', font = 'Sora', px = 64, glow = false } = {}) {
  const c = document.createElement('canvas'); const S = 512; c.width = S; c.height = Math.round(S * h / w);
  const g = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const draw = (L = lines) => {
    g.clearRect(0, 0, c.width, c.height);
    if (bg) { g.fillStyle = bg; const r = c.height * 0.22; g.beginPath(); g.roundRect(4, 4, c.width - 8, c.height - 8, r); g.fill(); g.strokeStyle = border; g.lineWidth = 4; g.stroke(); }
    const n = L.length; L.forEach((ln, k) => {
      const big = k === 0; g.font = `${big ? 800 : 600} ${big ? px : px * 0.5}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = big ? (ln.startsWith('!') ? accent : color) : 'rgba(255,255,255,.75)';
      if (glow) { g.shadowColor = accent; g.shadowBlur = 24; } else g.shadowBlur = 0;
      g.fillText(ln.replace(/^!/, ''), c.width / 2, c.height * (n === 1 ? 0.52 : (0.38 + k * 0.36)));
    }); tex.needsUpdate = true; };
  draw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  m.userData.draw = draw; return m;
}
const billboard = (m) => m.quaternion.copy(cam.quaternion);

// ---------- street life: a passing car with headlights, drifting dust, clouds ----------
const car = new THREE.Group(); scene.add(car);
{ const body = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.6, 1.1, 3, 0.2), std(0x2f6fd0, { roughness: .35, metalness: .3 })); body.position.y = 0.55; car.add(body);
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.2, 0.45, 0.95, 3, 0.18), new THREE.MeshPhysicalMaterial({ color: 0x9fc4ff, roughness: .1, metalness: .2, transparent: true, opacity: .8 })); top.position.set(-0.1, 1.0, 0); car.add(top);
  for (const sx of [-0.7, 0.7]) for (const sz of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 16), std(0x111111)); w.rotation.x = Math.PI / 2; w.position.set(sx, 0.25, sz); car.add(w); }
  for (const sz of [-0.35, 0.35]) { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff2cc })); hl.position.set(-1.1, 0.6, sz); car.add(hl); }
  const beamL = new THREE.SpotLight(0xffe6b0, 40, 14, 0.5, 0.6, 1.5); beamL.position.set(-1.1, 0.6, 0); beamL.target.position.set(-6, 0, 0); car.add(beamL); car.add(beamL.target);
  car.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const dust = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffe3a0, size: 0.06, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending }));
{ const n = 500, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([(rnd() - .5) * 34, rnd() * 16, (rnd() - .5) * 34], i * 3); dust.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(dust); }

// ---------- 3D info graphics in the street ----------
const plate3 = textPlane(['FLAT 7'], { w: 1.1, h: 0.42, bg: '#efe7d4', border: '#8a7a5a', color: '#10142a', px: 150 });
plate3.position.copy(tieA).add(V(-2.15, 1.05, -0.74)); scene.add(plate3); plate3.visible = false;
const girlPhone = new THREE.Group(); scene.add(girlPhone);
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.38, 0.03, 2, 0.03), std(0x15151a, { metalness: .6, roughness: .25 })); girlPhone.add(b);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.34), new THREE.MeshBasicMaterial({ color: 0x4fc3f7, toneMapped: false })); sc.position.z = 0.017; girlPhone.add(sc); }
girlPhone.position.copy(wp(girl.userData.head)).add(V(0.12, -0.55, 0.32)); girlPhone.rotation.set(-0.5, 0.6, 0); girlPhone.visible = false;
const ipHolo = textPlane(['!192.168.1.7', 'IP address'], { w: 1.5, h: 0.62, bg: 'rgba(8,30,20,.78)', border: '#2fd36b', accent: '#2fd36b', font: 'IBM Plex Mono', px: 76, glow: true });
ipHolo.position.copy(girlPhone.position).add(V(0, 0.55, 0.1)); scene.add(ipHolo); ipHolo.visible = false;
const letters = 'HELLO'.split('').map(ch => { const m = textPlane(['!' + ch], { w: 0.9, h: 0.9, bg: null, accent: '#ffc94a', px: 300, glow: true }); scene.add(m); m.visible = false; return m; });

// ---------- the video as a 3D object, split into 8 packets ----------
const vidCanvas = document.createElement('canvas'); vidCanvas.width = 512; vidCanvas.height = 288;
function drawCricket(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#2b6fd6'); sky.addColorStop(.45, '#7fc4ff'); sky.addColorStop(.46, '#2e9e4f'); sky.addColorStop(1, '#1f7a3a'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8c48a'; g.beginPath(); g.moveTo(w * .44, h * .48); g.lineTo(w * .56, h * .48); g.lineTo(w * .64, h); g.lineTo(w * .36, h); g.fill();
  g.fillStyle = '#fff'; for (const x of [.47, .5, .53]) g.fillRect(w * x, h * .5, 3, h * .1);
  g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(w * .5, h * .74, h * .07, 0, 7); g.fill(); g.fillRect(w * .48, h * .78, w * .04, h * .16);
  g.fillStyle = '#c8102e'; g.beginPath(); g.arc(w * .7, h * .62, h * .03, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, h - 26, w, 26); g.fillStyle = '#fff'; g.font = '700 18px Sora'; g.fillText('cricket.mp4', 12, h - 8);
}
drawCricket(vidCanvas.getContext('2d'), 512, 288);
const vidTex = new THREE.CanvasTexture(vidCanvas); vidTex.colorSpace = THREE.SRGBColorSpace;
const VID_C = tieB.clone().add(V(1.8, 1.4, -1.4));
const vtiles = [];
for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
  const geo = new RoundedBoxGeometry(0.6, 0.675, 0.12, 2, 0.03);
  const mats = [0, 1, 2, 3, 5].map(() => new THREE.MeshStandardMaterial({ color: 0xffc94a, emissive: 0xffa020, emissiveIntensity: .9, roughness: .3 }));
  const front = new THREE.MeshBasicMaterial({ map: vidTex.clone(), toneMapped: false }); front.map.repeat.set(0.25, 0.5); front.map.offset.set(c * 0.25, (1 - r) * 0.5); front.map.needsUpdate = true;
  const m = new THREE.Mesh(geo, [mats[0], mats[1], mats[2], mats[3], front, mats[4]]); m.castShadow = true;
  const lab = textPlane(['→ .1.7'], { w: 0.6, h: 0.22, bg: '#ffc94a', border: '#b07a10', color: '#10142a', font: 'IBM Plex Mono', px: 110 }); lab.position.set(0, 0.5, 0); m.add(lab);
  m.userData = { r, c, lab }; scene.add(m); m.visible = false; vtiles.push(m);
}
const pathPts = [VID_C.clone(), FLATS[1].p.clone(), RTOP.clone(), FLATS[0].p.clone()];
const pkCurve = new THREE.CatmullRomCurve3([pathPts[0], pathPts[0].clone().lerp(pathPts[1], .5).add(V(0, -0.4, 0)), pathPts[1], pathPts[1].clone().lerp(pathPts[2], .5), pathPts[2], pathPts[2].clone().lerp(pathPts[3], .5), pathPts[3]], false, 'centripetal');

// ---------- inside the copper wire (electrical pulses) ----------
const WIRE0 = V(0, -300, 0);
const wireSet = new THREE.Group(); wireSet.position.copy(WIRE0); scene.add(wireSet); wireSet.visible = false;
{ const L = 140;
  const ins = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, L, 48, 1, true).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: .9, side: THREE.BackSide })); wireSet.add(ins);
  const strands = []; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, rr = k ? 1.1 : 0; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, L, 28).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc97a3a, metalness: 1, roughness: .28, emissive: 0x3a1a08, emissiveIntensity: .3 })); st.position.set(0, Math.sin(a) * rr, Math.cos(a) * rr); wireSet.add(st); strands.push(st); }
  const pl = new THREE.PointLight(0xffb070, 80, 30, 1.5); pl.position.set(0, 2.4, 0); wireSet.add(pl); wireSet.userData.light = pl;
  const el = []; for (let k = 0; k < 90; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0x8fd0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.setScalar(0.5); wireSet.add(sp); el.push({ sp, a: rnd() * Math.PI * 2, r: 0.4 + rnd() * 1.4, x: rnd() }); }
  wireSet.userData.el = el;
  const lab = textPlane(['!Copper wire', 'electrical pulses'], { w: 3.4, h: 1.3, accent: '#ffb070', px: 96 }); lab.position.set(-4, 2.0, 0); wireSet.add(lab); wireSet.userData.lab = lab; }

// ---------- Earth with the real Mumbai -> London cable route ----------
const G0 = V(0, 1200, 0), GR = 20;
const globe = new THREE.Group(); globe.position.copy(G0); scene.add(globe); globe.visible = false;
const gCanvas = document.createElement('canvas'); gCanvas.width = 2048; gCanvas.height = 1024;
const gTex = new THREE.CanvasTexture(gCanvas); gTex.colorSpace = THREE.SRGBColorSpace; gTex.anisotropy = 8;
const earth = new THREE.Mesh(new THREE.SphereGeometry(GR, 96, 64), new THREE.MeshStandardMaterial({ map: gTex, roughness: .75, metalness: 0, emissive: 0xffffff, emissiveMap: gTex, emissiveIntensity: 0.18 }));
globe.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(GR * 1.06, 64, 48), new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
  vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vP = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1. - abs(dot(vN, vP)), 2.5); gl_FragColor = vec4(vec3(0.3,0.6,1.0)*f*1.6, f); }' }));
globe.add(atmo);
const sun = new THREE.DirectionalLight(0xffffff, 0); sun.position.copy(G0).add(V(60, 30, 80)); sun.target.position.copy(G0); scene.add(sun); scene.add(sun.target);
const ll = (lat, lon, r = GR) => { const phi = (lon + 180) / 360 * Math.PI * 2, th = (90 - lat) / 180 * Math.PI; return V(-r * Math.cos(phi) * Math.sin(th), r * Math.cos(th), r * Math.sin(phi) * Math.sin(th)); };
// route like the SEA-ME-WE family: Arabian Sea, Gulf of Aden, Red Sea, Suez, Mediterranean, Gibraltar, Biscay, Channel
const ROUTE = [[19.0, 72.8], [16, 62], [12.5, 48], [13, 43], [20, 38.5], [27.5, 34], [30.5, 32.4], [31.5, 31], [34.5, 22], [37, 11], [36.5, 0], [36, -6], [40, -10.5], [46, -8], [49.5, -4], [50.8, -1], [51.5, -0.1]];
const routeCurve = new THREE.CatmullRomCurve3(ROUTE.map(([a, b]) => ll(a, b, GR * 1.004)), false, 'centripetal');
const routeMesh = new THREE.Mesh(new THREE.TubeGeometry(routeCurve, 400, 0.09, 8, false), new THREE.MeshBasicMaterial({ color: 0xffd36a, toneMapped: false })); globe.add(routeMesh);
const ROUTE_N = routeMesh.geometry.index.count;
const pin = (lat, lon, name) => { const g = new THREE.Group(); const p = ll(lat, lon, GR); g.position.copy(p);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); g.add(dot);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xffc94a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(2.4); g.add(halo);
  const lab = textPlane([name], { w: 4.2, h: 1.1, px: 120 }); lab.position.copy(p.clone().normalize().multiplyScalar(2.4)); g.add(lab); g.userData.lab = lab; globe.add(g); return g; };
const pinM = pin(19.08, 72.88, 'Mumbai'), pinL = pin(51.5, -0.13, 'London');
const starsG = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .8 }));
{ const n = 1500, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = V(rnd() - .5, rnd() - .5, rnd() - .5).normalize().multiplyScalar(400 + rnd() * 200); p.set([v.x, v.y, v.z], i * 3); } starsG.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); globe.add(starsG); }
window.GLOBE_READY = fetch('../node_modules/world-atlas/countries-110m.json').then(r => r.json()).then(topo => {
  const land = topojson.feature(topo, topo.objects.land), g = gCanvas.getContext('2d'), Wd = 2048, Hd = 1024;
  const oc = g.createLinearGradient(0, 0, 0, Hd); oc.addColorStop(0, '#0b2a5a'); oc.addColorStop(.5, '#0f3f86'); oc.addColorStop(1, '#0b2a5a'); g.fillStyle = oc; g.fillRect(0, 0, Wd, Hd);
  g.fillStyle = '#2f6b4f'; g.strokeStyle = '#5fae84'; g.lineWidth = 1.5;
  const X = lon => (lon + 180) / 360 * Wd, Y = lat => (90 - lat) / 180 * Hd;
  for (const f of land.features) { const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) { g.beginPath(); for (const ring of poly) { ring.forEach(([lo, la], k) => { const x = X(lo), y = Y(la); k ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); } g.fill('evenodd'); g.stroke(); } }
  gTex.needsUpdate = true;
}).catch(e => console.log('globe', e));

// ---------- underwater world ----------
const U0 = V(0, -600, 0);
const sea = new THREE.Group(); sea.position.copy(U0); scene.add(sea); sea.visible = false;
const seaFog = new THREE.FogExp2(0x0a3a5c, 0.028), seaBg = new THREE.Color(0x0a3a5c);
const seabedGeo = new THREE.PlaneGeometry(160, 160, 160, 160); seabedGeo.rotateX(-Math.PI / 2);
{ const p = seabedGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i);
    p.setY(i, Math.sin(x * 0.18) * 0.5 + Math.cos(z * 0.23 + x * 0.07) * 0.6 + Math.sin(x * 0.9 + z * 0.7) * 0.12 + (Math.abs(z) > 14 ? (Math.abs(z) - 14) * 0.25 : 0)); } seabedGeo.computeVertexNormals(); }
const seabed = new THREE.Mesh(seabedGeo, new THREE.MeshStandardMaterial({ color: 0xb59a6a, roughness: 1 })); seabed.receiveShadow = true; sea.add(seabed);
const seaLight = new THREE.DirectionalLight(0x9fd8ff, 0); seaLight.position.copy(U0).add(V(10, 40, 6)); seaLight.target.position.copy(U0); scene.add(seaLight); scene.add(seaLight.target);
const seaAmb = new THREE.HemisphereLight(0x5fb0e0, 0x1a2a20, 0); scene.add(seaAmb);
for (let k = 0; k < 60; k++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3 + rnd() * 1.1, 0), std(0x5a5a52, { roughness: 1 })); r.position.set((rnd() - .5) * 120, 0.3, (rnd() - .5) * 60); r.rotation.set(rnd() * 3, rnd() * 3, 0); r.castShadow = true; sea.add(r); }
const weeds = []; for (let k = 0; k < 90; k++) { const h = 1 + rnd() * 2.5; const w = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, h, 3, 6), std(0x2f8a5a, { roughness: .8 })); w.position.set((rnd() - .5) * 110, h / 2, (rnd() - .5) * 50); sea.add(w); weeds.push(w); }
const rays = []; for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 4.5, 60, 24, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { o: { value: 0.12 } }, vertexShader: 'varying float vY; void main(){ vY = uv.y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform float o; varying float vY; void main(){ gl_FragColor = vec4(vec3(0.6,0.85,1.0)*o*vY*vY, 1.); }' }));
  m.position.set(-40 + k * 11 + rnd() * 4, 28, -8 + rnd() * 16); m.rotation.z = 0.25; sea.add(m); rays.push(m); }
const snow = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xdff4ff, size: 0.08, transparent: true, opacity: .7, depthWrite: false }));
{ const n = 2500, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([(rnd() - .5) * 120, rnd() * 26, (rnd() - .5) * 50], i * 3); snow.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); sea.add(snow); }
const surfaceU = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false })); surfaceU.rotation.x = Math.PI / 2; surfaceU.position.y = 30; sea.add(surfaceU);
// cables on the seabed (black polyethylene) carrying light pulses; cable 0 is ours
const SZ = [-1.5, 3, -6, 7.5, -10.5, 11.5];
const sCables = SZ.map((z, j) => { const pts = []; for (let k = 0; k <= 12; k++) { const x = -70 + k * 140 / 12; pts.push(V(x, 0.55 + Math.sin(x * 0.18) * 0.5 + Math.cos(z * 0.23 + x * 0.07) * 0.6, z + Math.sin(k * 1.3 + j) * 0.8)); }
  const c = new THREE.CatmullRomCurve3(pts); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 300, 0.32, 14, false), std(0x15161a, { roughness: .45, metalness: .2 })); m.castShadow = true; sea.add(m);
  const ps = []; for (let k = 0; k < 16; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: j === 0 ? 0xfff2c4 : 0x8fe8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.setScalar(1.1); sea.add(sp); ps.push(sp); }
  return { c, m, ps }; });
// cut-away cross-section of cable 0 (technical illustration: layers stepped back)
const XS = new THREE.Group(); sea.add(XS);
const XS_X = -14, XS_P = sCables[0].c.getPoint((XS_X + 70) / 140);
XS.position.copy(XS_P); XS.position.y += 0.25;
{ const layers = [[0.34, 0x15161a, 0], [0.27, 0x8a8f99, 1.2], [0.2, 0xc97a3a, 2.4], [0.14, 0xd6e8ff, 3.6]];
  layers.forEach(([r, col, off], k) => { const len = 4 - off * 0.85; const mat = k === 3 ? new THREE.MeshPhysicalMaterial({ color: col, transparent: true, opacity: .35, roughness: .05 }) : std(col, { metalness: k ? .9 : .1, roughness: k ? .3 : .5 });
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 2.2, r * 2.2, len, 40).rotateZ(Math.PI / 2), mat); m.position.x = off * 0.85 / 2 + 2; m.castShadow = true; XS.add(m); });
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; const w = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8).rotateZ(Math.PI / 2), std(0xb8bec8, { metalness: 1, roughness: .25 })); w.position.set(2.5, Math.sin(a) * 0.55, Math.cos(a) * 0.55); XS.add(w); }
  const cols = [0x4fc3f7, 0xffc94a, 0x2fd36b, 0xff6b8a, 0xb388ff, 0xffffff, 0xff9a40, 0x7ce0ff];
  cols.forEach((col, k) => { const a = k / 8 * Math.PI * 2; const f = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 5.4, 8).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6 })); f.position.set(3.3, Math.sin(a) * 0.13, Math.cos(a) * 0.13); XS.add(f); });
  const labs = [['Plastic jacket', 0.6, 1.4], ['Steel armour', 1.6, 1.8], ['Copper (powers repeaters)', 2.6, 1.4], ['!Glass fibres', 4.6, 1.0]];
  XS.userData.labs = labs.map(([t, x, y]) => { const m = textPlane([t], { w: 2.6, h: 0.5, px: t.length > 18 ? 46 : 60 }); m.position.set(x, y, 0.6); XS.add(m); return m; }); }
// inside one glass fibre (light by total internal reflection)
const fibSet = new THREE.Group(); fibSet.position.copy(U0).add(V(0, -200, 0)); scene.add(fibSet); fibSet.visible = false;
{ const L = 160; const tube = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, L, 48, 1, true).rotateZ(Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x8fd8ff, emissive: 0x0d3a66, emissiveIntensity: .8, transparent: true, opacity: .5, side: THREE.BackSide, roughness: .05 })); fibSet.add(tube);
  const clad = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, L, 48, 1, true).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x06142a, side: THREE.BackSide })); fibSet.add(clad);
  const zz = []; for (let k = 0; k <= 40; k++) zz.push(V(-L / 2 + k * L / 40, (k % 2 ? 1 : -1) * 2.6, (k % 4 < 2 ? 0.6 : -0.6)));
  const zc = new THREE.CurvePath(); for (let k = 0; k < 40; k++) zc.add(new THREE.LineCurve3(zz[k], zz[k + 1]));
  const zm = new THREE.Mesh(new THREE.TubeGeometry(zc, 800, 0.07, 6, false), new THREE.MeshBasicMaterial({ color: 0xfff2c4, transparent: true, opacity: .5, toneMapped: false })); fibSet.add(zm);
  const ph = []; for (let k = 0; k < 10; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: 0xffe6a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.setScalar(2.2); fibSet.add(sp); ph.push(sp); }
  fibSet.userData = { zc, ph, L };
  const lab = textPlane(['!Glass fibre', 'light pulses bounce inside'], { w: 4.2, h: 1.5, px: 100 }); lab.position.set(0, 1.0, 0); fibSet.add(lab); fibSet.userData.lab = lab; }
// 3D info panels in the sea
const p99 = textPlane(['!99%+', 'of data between continents goes by sea cable'], { w: 9, h: 3.0, px: 150, glow: true }); sea.add(p99); p99.visible = false;
const pFaults = textPlane(['!150–200', 'cable faults a year, mostly anchors & fishing'], { w: 9, h: 3.0, px: 150, accent: '#ff7a5a', glow: true }); sea.add(pFaults); pFaults.visible = false;
// ship (seen from below) and anchor
const sship = new THREE.Group(); sea.add(sship);
{ const hull = new THREE.Mesh(new RoundedBoxGeometry(16, 3, 4.5, 3, 1.2), std(0x1a1414, { roughness: .8 })); sship.add(hull);
  const keel = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 0.6), std(0x3a2a20)); keel.position.y = -1.7; sship.add(keel); }
sship.position.set(XS_X + 22, 30.5, -1.5);
const sAnchor = new THREE.Group(); sea.add(sAnchor);
{ const am = std(0x9aa0aa, { metalness: .8, roughness: .35 });
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.2, 12), am); shank.position.y = 1.6; sAnchor.add(shank);
  const arms = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.2, 10, 24, Math.PI), am); arms.rotation.z = Math.PI; arms.position.y = 0.3; sAnchor.add(arms);
  for (const s of [-1, 1]) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 4), am); fl.position.set(s * 1.3, 0.6, 0); sAnchor.add(fl); }
  sAnchor.traverse(o => o.castShadow = true); }
const sChain = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 8), std(0x8a8f99, { metalness: .8, roughness: .4 })); sea.add(sChain);
const silt = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xcdb88a, size: 0.25, transparent: true, opacity: .0, depthWrite: false }));
{ const n = 400, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([(rnd() - .5) * 6, rnd() * 3, (rnd() - .5) * 6], i * 3); silt.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); sea.add(silt); }
const CUT_U = 0.5, CUT_P = sCables[0].c.getPoint(CUT_U);

// ---------- London: the phone that rebuilds the video ----------
const PH0 = V(0, -1100, 0);
const phoneSet = new THREE.Group(); phoneSet.position.copy(PH0); scene.add(phoneSet); phoneSet.visible = false;
const phCanvas = document.createElement('canvas'); phCanvas.width = 540; phCanvas.height = 1100; const phG = phCanvas.getContext('2d');
const phTex = new THREE.CanvasTexture(phCanvas); phTex.colorSpace = THREE.SRGBColorSpace;
const logoImg = new Image(); logoImg.src = '../../airpods-ear/assets/invisitech-logo.png';
{ const body = new THREE.Mesh(new RoundedBoxGeometry(5.4, 11, 0.5, 6, 0.7), new THREE.MeshPhysicalMaterial({ color: 0x1c1c22, metalness: .8, roughness: .2, clearcoat: 1 })); phoneSet.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 10.4), new THREE.MeshBasicMaterial({ map: phTex, toneMapped: false })); scr.position.z = 0.26; phoneSet.add(scr);
  const cam1 = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), new THREE.MeshBasicMaterial({ color: 0x050505 })); cam1.position.set(0, 4.85, 0.27); phoneSet.add(cam1);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 10.4), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .06, roughness: 0, metalness: 0, clearcoat: 1 })); glass.position.z = 0.28; phoneSet.add(glass); }
const phLights = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xffc070, size: 0.5, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending }));
{ const n = 220, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([(rnd() - .5) * 70, (rnd() - .5) * 60, -10 - rnd() * 40], i * 3); phLights.geometry.setAttribute('position', new THREE.BufferAttribute(p, 3)); phoneSet.add(phLights); }
const phPk = []; for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new RoundedBoxGeometry(1.25, 1.3, 0.25, 2, 0.06), [0, 1, 2, 3, 4, 5].map(i => i === 4 ? (() => { const mm = new THREE.MeshBasicMaterial({ map: vidTex.clone(), toneMapped: false }); mm.map.repeat.set(.25, .5); mm.map.offset.set((k % 4) * .25, (1 - Math.floor(k / 4)) * .5); mm.map.needsUpdate = true; return mm; })() : new THREE.MeshStandardMaterial({ color: 0xffc94a, emissive: 0xffa020, emissiveIntensity: 1 })));
  phoneSet.add(m); phPk.push(m); }
const phLight = new THREE.PointLight(0xffffff, 60, 40, 1.5); phLight.position.set(6, 6, 10); phoneSet.add(phLight);
function drawPhone(k) {   // k: 0 = blank, 1 = video rebuilt, 2 = InvisiTech
  const g = phG, w = 540, h = 1100; g.fillStyle = '#0b1230'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = '700 26px Sora'; g.fillText('9:41', 40, 50);
  if (k > 0) { g.save(); g.globalAlpha = clamp01(k); g.translate(0, 330); const tmp = vidCanvas; g.drawImage(tmp, 0, 0, 540, 304); g.restore();
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(30, 650, 480, 8); g.fillStyle = '#e53935'; g.fillRect(30, 650, 480 * clamp01(k), 8);
    g.fillStyle = '#fff'; g.font = '700 34px Sora'; g.fillText('From Mumbai, with love', 30, 720); g.font = '500 24px Sora'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText('8 packets · rebuilt in order', 30, 760); }
  if (k > 1) { g.fillStyle = `rgba(11,18,48,${clamp01(k - 1)})`; g.fillRect(0, 0, w, h); g.globalAlpha = clamp01(k - 1);
    if (logoImg.complete) g.drawImage(logoImg, 170, 330, 200, 200); g.fillStyle = '#fff'; g.font = '800 64px Sora'; g.textAlign = 'center'; g.fillText('Invisi', 230, 620); g.fillStyle = '#4fc3f7'; g.fillText('Tech', 380, 620); g.textAlign = 'left'; g.globalAlpha = 1; }
  phTex.needsUpdate = true; }

// ===================================================================================
// SHOT LIST (time-locked to the narration; every shot eases in and out)
// ===================================================================================
const dG = fA.clone().sub(fB).setY(0).normalize(), RG = new THREE.Vector3().crossVectors(dG, UP).normalize();
const girlFace = V(Math.sin(0.6), 0, Math.cos(0.6));
const SH = [];
function shot(t0, t1, P, T, fov = [30, 30], o = {}) { SH.push({ t0, t1, P: P.length > 1 ? new THREE.CatmullRomCurve3(P, false, 'centripetal') : null, P0: P[0], T: T.length > 1 ? new THREE.CatmullRomCurve3(T, false, 'centripetal') : null, T0: T[0], fov, ...o }); }
const front = fB.clone().addScaledVector(dG, 3.0).addScaledVector(RG, 1.6).add(V(0, 0.5, 0));
const ots = bHead.clone().addScaledVector(dG, -1.25).addScaledVector(RG, 0.55).add(V(0, 0.35, 0));
const nearGirl = gHead.clone().addScaledVector(girlFace, 2.8).add(V(0, 0.15, 0));
// 0-3.4  street-level fly between the buildings, crane up to the boy
shot(0, 3.4, [V(17, 1.1, -1.6), V(8, 1.3, -1.4), V(0.5, 1.8, -0.6), V(-1.6, 4.6, 2.2), front],
  [V(4, 1.6, -1.8), V(-1.5, 2.2, -0.5), V(-4, 5.2, 4), bHead.clone(), bHead.clone().add(V(0, -0.2, 0))], [42, 34]);
// 3.4-7.9  orbit to his shoulder, then ride the beam across to her
shot(3.4, 7.9, [front, bHead.clone().addScaledVector(RG, 1.8).add(V(0, 0.4, 0)), ots, fB.clone().lerp(fA, 0.5).addScaledVector(RG, 0.9).add(V(0, 0.6, 0)), nearGirl],
  [bHead.clone().add(V(0, -0.2, 0)), fB.clone(), fA.clone(), fA.clone(), gHead.clone().add(V(0, -0.1, 0))], [34, 28], { focus: 'tgt' });
// 8.4-10.4  macro on the torch: one, zero (match cut on the beam)
const macro = fB.clone().addScaledVector(RG, 0.62).addScaledVector(dG, 0.3).add(V(0, 0.12, 0));
shot(8.4, 10.4, [macro.clone().addScaledVector(RG, 0.25), macro], [fB.clone().addScaledVector(dG, 0.05), fB.clone().addScaledVector(dG, 0.2)], [22, 20], { ap: 0.006 });
// 10.45-12.4  track the bits flying across
shot(10.45, 12.4, [fB.clone().addScaledVector(RG, 3.2).add(V(0, 0.8, 0)), fB.clone().lerp(fA, 0.8).addScaledVector(RG, 3.4).add(V(0, 0.9, 0))],
  [fB.clone().lerp(fA, 0.15).add(V(0, 0.5, 0)), fA.clone().add(V(0, 0.6, 0))], [32, 32]);
// 12.45-14.2  HELLO forms between them
const hMid = fB.clone().lerp(fA, 0.5).add(V(0, 1.4, 0));
shot(12.45, 14.2, [hMid.clone().addScaledVector(RG, 8.5).add(V(0, 0.4, 0)), hMid.clone().addScaledVector(RG, 7.2).add(V(0, 0.9, 0))], [hMid.clone(), hMid.clone().add(V(0, 0.1, 0))], [30, 28]);
// 14.3-15.4  too slow: she dozes off
shot(14.3, 15.4, [gHead.clone().addScaledVector(girlFace, 3.2).add(V(0, 0.5, 0)), gHead.clone().addScaledVector(girlFace, 2.4).add(V(0, 0.2, 0))], [gHead.clone().add(V(0, -0.2, 0))], [30, 28]);
// 15.45-17.3  the copper wire stretches across, push into it
const wMid = tieA.clone().lerp(tieB, 0.5);
shot(15.45, 17.3, [wMid.clone().addScaledVector(RG, 7).add(V(0, 1.5, 0)), wMid.clone().addScaledVector(RG, 3).add(V(0, 0.6, 0)), wMid.clone().addScaledVector(RG, 0.8).add(V(0, 0.15, 0))],
  [wMid.clone(), wMid.clone(), wMid.clone()], [34, 20]);
// 17.35-19.8  inside the copper wire, accelerating with the electrical pulses
shot(17.35, 19.8, [WIRE0.clone().add(V(-60, 1.2, 0.9)), WIRE0.clone().add(V(30, 0.6, 0.5))], [WIRE0.clone().add(V(-40, 0.2, 0)), WIRE0.clone().add(V(60, 0, 0))], [55, 70], { ease: 'in' });
// 19.8-22.3  match cut out of the wire: crane up to reveal the whole network
shot(19.8, 22.3, [wMid.clone().addScaledVector(RG, 1.5).add(V(0, 0.3, 0)), V(10, 9, 14), V(20, 15, 20)], [wMid.clone(), V(1, 4, 1), V(0, 4.5, 0)], [30, 36]);
// 22.3-25.0  orbit the router while every flat connects to it
const RC = RPOS.clone().add(V(0, 1.7, 0)); const orb = a => RC.clone().add(V(Math.cos(a) * 7.5, 2.4 + Math.sin(a * 0.7), Math.sin(a) * 7.5));
shot(22.3, 25.0, [orb(0.9), orb(0.4), orb(-0.1), orb(-0.6)], [RC.clone(), RC.clone()], [34, 30]);
// 25.1-29.5  rack focus: FLAT 7 plate (foreground) -> her phone's IP address (background)
const rackPos = plate3.position.clone().add(V(-0.9, 0.12, 1.25)), rackTgt = girlPhone.position.clone().lerp(plate3.position, 0.35);
shot(25.1, 29.5, [rackPos.clone().add(V(-0.4, 0.2, 0.5)), rackPos], [rackTgt.clone(), rackTgt.clone().add(V(0.1, 0.05, 0))], [30, 26],
  { ap: 0.012, focus: t => { const a = cam.position.distanceTo(plate3.position), b = cam.position.distanceTo(girlPhone.position); return lerp(a, b, smoother(clamp01((t - 27.75) / 0.6))); } });
// 29.65-31.3  the video becomes an object and splits into 8 packets: orbit it
const vorb = a => VID_C.clone().add(V(Math.cos(a) * 4.2, 0.6, Math.sin(a) * 4.2));
shot(29.65, 31.3, [vorb(1.2), vorb(0.7), vorb(0.2)], [VID_C.clone(), VID_C.clone()], [32, 30]);
// 31.3-33.9  follow one packet through the router to her flat (dynamic)
shot(31.3, 33.9, [vorb(0.2)], [VID_C.clone()], [32, 34], { follow: true });
// 33.9-34.95  crane up: the street becomes a miniature
shot(33.9, 34.95, [FLATS[0].p.clone().add(V(4, 3, 6)), V(14, 30, 16), V(10, 80, 12)], [FLATS[0].p.clone(), V(2, 3, 0), V(1, 0, 0)], [34, 30]);
// 35.0-36.95  Earth: Mumbai, the route to London, then dive into the Arabian Sea
const mumbaiW = G0.clone().add(ll(19.08, 72.88)), londonW = G0.clone().add(ll(51.5, -0.13)), arabian = G0.clone().add(ll(15.5, 63));
const outDir = mumbaiW.clone().sub(G0).normalize(), midRoute = G0.clone().add(routeCurve.getPoint(0.45).normalize().multiplyScalar(GR));
shot(35.0, 36.95, [mumbaiW.clone().addScaledVector(outDir, 9), midRoute.clone().sub(G0).normalize().multiplyScalar(GR + 52).add(G0), arabian.clone().sub(G0).normalize().multiplyScalar(GR + 8).add(G0), arabian.clone().sub(G0).normalize().multiplyScalar(GR + 0.6).add(G0)],
  [mumbaiW.clone(), midRoute.clone(), arabian.clone(), arabian.clone()], [40, 34]);
// 36.95-37.7  underwater: glide over the seabed to the cable
const cab = u => U0.clone().add(sCables[0].c.getPoint(u));
shot(36.95, 37.7, [cab(0.18).add(V(-2, 7, 9)), cab(0.24).add(V(0, 2.4, 4.5))], [cab(0.22), cab(0.27)], [38, 34]);
// 37.7-38.25  pass the cut-away cross-section
const xsW = U0.clone().add(XS.position).add(V(2.6, 0, 0));
shot(37.7, 38.25, [xsW.clone().add(V(-2.5, 1.6, 4.2)), xsW.clone().add(V(1.5, 0.9, 3.0))], [xsW.clone().add(V(0, 0.4, 0)), xsW.clone().add(V(1.5, 0.2, 0))], [34, 30], { ap: 0.004 });
// 38.25-39.25  inside one glass fibre with the light pulses, accelerating
const F0 = fibSet.position;
shot(38.25, 39.25, [F0.clone().add(V(-75, 0.3, 0)), F0.clone().add(V(20, -0.2, 0))], [F0.clone().add(V(-55, 0, 0)), F0.clone().add(V(60, 0, 0))], [60, 75], { ease: 'in' });
// 39.3-42.5  out on the seabed: every cable lit, 99%
shot(39.3, 42.5, [U0.clone().add(V(-30, 9, 22)), U0.clone().add(V(-12, 12, 26))], [U0.clone().add(V(-10, 2, 0)), U0.clone().add(V(2, 3, 0))], [40, 38]);
// 42.6-44.3  low angle: the anchor comes down and drags into the cable
const cutW = U0.clone().add(CUT_P);
shot(42.6, 44.3, [cutW.clone().add(V(-9, 1.2, 9)), cutW.clone().add(V(-6, 1.0, 7))], [cutW.clone().add(V(2, 9, 0)), cutW.clone().add(V(0, 0.8, 0))], [40, 32]);
// 44.3-45.9  pull up: alternative routes light up
shot(44.3, 45.9, [cutW.clone().add(V(-6, 1.0, 7)), cutW.clone().add(V(-16, 14, 20))], [cutW.clone().add(V(0, 0.8, 0)), cutW.clone().add(V(4, 1, -1))], [32, 40]);
// 45.95-50  London phone: packets fly in, the video rebuilds, InvisiTech
shot(45.95, 50, [PH0.clone().add(V(-9, 5, 16)), PH0.clone().add(V(-3, 1.5, 15)), PH0.clone().add(V(-1.5, 0.5, 14.5))], [PH0.clone().add(V(0, 1, 0)), PH0.clone(), PH0.clone()], [36, 34]);

const pkFollowIdx = 5;
function packetPos(j, t) {   // 8 tiles: 29.9 separate, 30.6 become packets, 31.2+ travel in turns
  const m = vtiles[j], r = m.userData.r, c = m.userData.c;
  const grid = VID_C.clone().add(V((c - 1.5) * 0.62, (0.5 - r) * 0.7, 0));
  const spread = smoother(clamp01((t - 29.95) / 0.6));
  const exploded = VID_C.clone().add(V((c - 1.5) * 1.15, (0.5 - r) * 1.2, (r - 0.5) * 0.6 + (c % 2 - 0.5) * 0.5));
  const base = grid.lerp(exploded, spread);
  const start = 31.2 + j * 0.24, u = clamp01((t - start) / 2.3);
  if (u <= 0) return { p: base, u: 0 };
  return { p: base.clone().lerp(pkCurve.getPoint(smoother(u)), Math.min(1, u * 6)), u };
}
let lastSea = false;
function cineCam(t) {
  let s = SH[0]; for (const x of SH) if (t >= x.t0) s = x;
  const u = clamp01((t - s.t0) / (s.t1 - s.t0)), k = s.ease === 'in' ? u * u * (1.5 - 0.5 * u) : smoother(u);
  let pos = s.P ? s.P.getPoint(k) : s.P0.clone(), tgt = s.T ? s.T.getPoint(k) : s.T0.clone();
  if (s.follow) {   // tracking shot behind one packet
    const { p, u: pu } = packetPos(pkFollowIdx, t); const ahead = pkCurve.getPoint(Math.min(1, smoother(pu) + 0.05)), dir = ahead.clone().sub(p).normalize();
    const side = new THREE.Vector3().crossVectors(dir, UP).normalize();
    const want = p.clone().addScaledVector(dir, -2.4).addScaledVector(side, 1.1).add(V(0, 0.9, 0));
    const blend = smoother(clamp01((t - 31.3) / 0.6)); pos = s.P0.clone().lerp(want, blend); tgt = s.T0.clone().lerp(p.clone().add(V(0, 0.15, 0)), blend);
  }
  cam.fov = lerp(s.fov[0], s.fov[1], k); cam.position.copy(pos); cam.lookAt(tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const f = typeof s.focus === 'function' ? s.focus(t) : pos.distanceTo(tgt);
  bokeh.uniforms.focus.value = f; bokeh.uniforms.aperture.value = (s.ap ?? 0.0018); bokeh.uniforms.maxblur.value = 0.006;
  // sets visibility and fog by where the camera is
  const inWire = t >= 17.35 && t < 19.8, inGlobe = t >= 35.0 && t < 36.95, inSea = t >= 36.95 && t < 45.95 && !(t >= 38.25 && t < 39.25), inFib = t >= 38.25 && t < 39.25, inPhone = t >= 45.95;
  wireSet.visible = inWire; globe.visible = inGlobe; sea.visible = inSea; fibSet.visible = inFib; phoneSet.visible = inPhone;
  scene.fog = inSea ? seaFog : null; scene.background = inSea ? seaBg : (inWire || inFib || inPhone ? new THREE.Color(0x05060c) : scene.userData.sky || scene.background);
  if (!scene.userData.sky && !inSea && !inWire && !inFib && !inPhone) scene.userData.sky = scene.background;
  sun.intensity = inGlobe ? 2.4 : 0; seaLight.intensity = inSea ? 2.2 : 0; seaAmb.intensity = inSea ? 1.2 : 0;
  if (inSea) { seaLight.target.updateMatrixWorld(); }
}
function cineUpdate(t) {
  // ---- characters breathe and sway (secondary motion) ----
  for (const [p, ph] of [[girl, 0], [boy, 1.7]]) { p.children.forEach(o => {}); p.userData.head.rotation.y = Math.sin(t * 1.1 + ph) * 0.08; p.position.y += 0; }
  girl.scale.set(1.15, 1.15 * (1 + 0.012 * Math.sin(t * 2.4)), 1.15); boy.scale.set(1.15, 1.15 * (1 + 0.012 * Math.sin(t * 2.4 + 1.3)), 1.15);
  boy.userData.ra.rotation.x = -0.25 + Math.sin(t * 1.7) * 0.03;
  // the girl waves when the light reaches her
  const wave = t > 5.2 && t < 7.6 ? Math.sin((t - 5.2) * 9) : 0;
  girl.userData.ra.rotation.set(t > 5.0 && t < 7.8 ? 1.48 - 2.6 * smoother(clamp01((t - 5.0) / 0.3)) * smoother(clamp01((7.8 - t) / 0.3)) : 1.48, 0, -0.15 + wave * 0.35 * (t > 5.0 && t < 7.8 ? 1 : 0));
  // ---- the passing car (parallax in the opening) ----
  const cx = 26 - t * 6.5; car.visible = t < 6; car.position.set(cx, 0.15, 0.2); car.rotation.y = 0;
  // ---- drifting dust ----
  dust.position.y = Math.sin(t * 0.4) * 0.3; dust.rotation.y = t * 0.01;
  // ---- girl's phone + 3D flat plate + IP hologram (rack focus scene) ----
  girlPhone.visible = t > 24.9 && t < 34; plate3.visible = t > 25.0 && t < 30;
  ipHolo.visible = t > 27.9 && t < 30; if (ipHolo.visible) { const a = smoother(clamp01((t - 27.9) / 0.35)); ipHolo.scale.setScalar(0.4 + 0.6 * a); ipHolo.material.opacity = a; billboard(ipHolo); }
  // ---- HELLO letters form between them ----
  letters.forEach((m, j) => { const a = smoother(clamp01((t - 12.55 - j * 0.18) / 0.4)); m.visible = t > 12.5 && t < 14.4; m.position.copy(hMid).addScaledVector(RG.clone().cross(UP).normalize(), 0).add(dG.clone().multiplyScalar((j - 2) * 0.95)).add(V(0, Math.sin(t * 3 + j) * 0.05, 0));
    m.scale.setScalar(0.2 + 0.8 * a); m.material.opacity = a * clamp01((14.4 - t) / 0.2); billboard(m); });
  // ---- video object -> 8 packets ----
  vtiles.forEach((m, j) => { m.visible = t > 29.7 && t < 34.2; if (!m.visible) return;
    const { p, u } = packetPos(j, t); m.position.copy(p);
    const cube = smoother(clamp01((t - 30.6 - j * 0.03) / 0.5)); m.scale.set(1 - 0.35 * cube, 1 - 0.4 * cube, 1 + 2.4 * cube);
    m.quaternion.copy(cam.quaternion); if (u > 0) m.rotation.set(t * 2 + j, t * 2.6, 0);
    m.userData.lab.visible = cube > 0.6; m.userData.lab.quaternion.copy(cam.quaternion).premultiply(m.quaternion.clone().invert());
    m.visible = u < 0.995; });
  // ---- copper wire interior ----
  if (wireSet.visible) { wireSet.userData.el.forEach((e, j) => { const x = ((e.x + (t - 17.35) * (0.35 + 0.9 * (t - 17.35) / 2.4)) % 1) * 140 - 70; e.sp.position.set(x, Math.sin(e.a) * e.r + 0.2, Math.cos(e.a) * e.r); });
    const lab = wireSet.userData.lab; lab.position.set(cam.position.x - WIRE0.x + 6, 2.1, 0.4); lab.lookAt(cam.position.clone().sub(WIRE0)); }
  // ---- globe ----
  if (globe.visible) { globe.rotation.y = 0; routeMesh.geometry.setDrawRange(0, Math.floor(ROUTE_N * smoother(clamp01((t - 35.4) / 1.0)) / 3) * 3);
    pinL.visible = t > 35.9; [pinM, pinL].forEach(pn => { pn.userData.lab.quaternion.copy(cam.quaternion); }); }
}
function cinePost(t) {
  // old HTML overlays that now live in 3D (or are replaced) stay hidden
  if (typeof plate !== 'undefined') plate.style.opacity = 0;
  if (typeof ipEls !== 'undefined') ipEls.forEach(e => e.style.opacity = 0);
  if (typeof pkts !== 'undefined') pkts.forEach(p => { p.m.visible = false; p.l.style.opacity = 0; });
  const card = document.getElementById('card');
  if (t > 29.6 && t < 34.5) card.style.opacity = 0;
  if (t > 12.4 && t < 14.4) card.style.opacity = 0;   // HELLO is in 3D now
  document.getElementById('hletter').style.opacity = t > 12.0 && t < 12.6 ? document.getElementById('hletter').style.opacity : 0;
}

// ===================================================================================
// PART 4 replacement: globe -> under the sea -> cut -> London phone -> end card
// ===================================================================================
function renderSea(t) {
  hideP3(); hideP4(); world.visible = false;
  beamA.set(0); beamB.set(0); wire.visible = wireCore.visible = false; clips.forEach(c => c.visible = false); pulses.forEach(p => p.material.opacity = 0);
  ['bitf', 'zzz', 'hletter', 'card'].forEach(id => document.getElementById(id).style.opacity = 0);
  document.querySelectorAll('#bits .bit').forEach(d => d.style.opacity = 0);
  if (t < 35.0) { router.visible = true; cables.forEach(c => { c.m.visible = true; c.m.geometry.setDrawRange(0, c.n); c.m.material.opacity = 1; }); }
  applyCam(t);
  document.getElementById('fade').style.opacity = Math.max(0, 1 - Math.abs(t - 34.98) / 0.2, 1 - Math.abs(t - 36.95) / 0.16, 1 - Math.abs(t - 38.25) / 0.1, 1 - Math.abs(t - 39.28) / 0.12, 1 - Math.abs(t - 45.95) / 0.16);
  // ---- sea animation ----
  if (sea.visible) {
    weeds.forEach((w, j) => { w.rotation.z = Math.sin(t * 1.3 + j) * 0.18; w.rotation.x = Math.cos(t * 1.1 + j * 0.7) * 0.12; });
    rays.forEach((r, j) => r.material.uniforms.o.value = 0.08 + 0.05 * Math.sin(t * 0.9 + j * 1.7));
    snow.position.y = -((t * 0.4) % 4); snow.position.x = Math.sin(t * 0.3) * 0.6;
    const cut = t > 43.75, reroute = t > 44.25;
    sCables.forEach((sc, j) => { const speed = j === 0 ? 0.16 : 0.12, lit = j === 0 ? 1 : (t > 39.6 ? 1 : 0.15) * (reroute && j === 1 ? 1.6 : 1);
      sc.ps.forEach((sp, k) => { let u = ((t * speed + k / sc.ps.length) % 1); sp.position.copy(sc.c.getPoint(u)).add(V(0, 0.38, 0));
        let o = lit; if (j === 0 && cut && u > CUT_U - 0.01) o = 0; sp.material.opacity = Math.min(1, o); sp.scale.setScalar(j === 1 && reroute ? 1.6 : 1.1); }); });
    sCables[0].m.material.color.set(cut ? 0x3a1210 : 0x15161a); sCables[0].m.material.emissive = new THREE.Color(cut ? 0xff3020 : 0x000000); sCables[0].m.material.emissiveIntensity = cut ? 0.4 + 0.3 * Math.sin(t * 18) : 0;
    sCables[1].m.material.emissive = new THREE.Color(reroute ? 0x2fd36b : 0x000000); sCables[1].m.material.emissiveIntensity = reroute ? 0.35 : 0;
    // anchor: drops 42.7-43.5, drags 43.5-44.0 through the cable
    const drop = smoother(clamp01((t - 42.7) / 0.8)), drag = smoother(clamp01((t - 43.45) / 0.6));
    sAnchor.visible = sChain.visible = sship.visible = t > 42.0;
    sAnchor.position.copy(CUT_P).add(V(0, lerp(26, 0.9, drop), lerp(-4.5, 1.8, drag))); sAnchor.rotation.set(drag * 0.9, 0.3, 0);
    { const a = sship.position.clone().add(V(-4, -1.8, 0)), b = sAnchor.position.clone().add(V(0, 3.2, 0)); sChain.position.copy(a).lerp(b, 0.5); sChain.scale.set(1, a.distanceTo(b), 1); sChain.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize()); }
    silt.position.copy(CUT_P); silt.material.opacity = 0.7 * clamp01((t - 43.5) / 0.3) * clamp01((45.5 - t) / 1.2); silt.scale.setScalar(1 + clamp01((t - 43.5) / 1.5) * 1.5);
    // 3D info panels
    p99.visible = t > 39.4 && t < 42.6; p99.position.copy(U0.clone().add(V(-3, 9.5, -3))).sub(U0); p99.material.opacity = smoother(clamp01((t - 39.4) / 0.4)); p99.quaternion.copy(cam.quaternion);
    pFaults.visible = t > 44.4; pFaults.position.copy(CUT_P).add(V(4, 9.0, -4)); pFaults.material.opacity = smoother(clamp01((t - 44.4) / 0.4)); pFaults.quaternion.copy(cam.quaternion);
    XS.userData.labs.forEach(l => { l.visible = t > 37.65 && t < 38.3; l.quaternion.copy(cam.quaternion); });
  }
  if (fibSet.visible) { const { zc, ph, L } = fibSet.userData; ph.forEach((sp, k) => { const u = ((t - 38.25) * 0.55 + k / ph.length) % 1; sp.position.copy(zc.getPoint(u)); });
    fibSet.userData.lab.position.set(cam.position.x - fibSet.position.x + 9, 1.2, 0); fibSet.userData.lab.lookAt(cam.position.clone().sub(fibSet.position)); }
  // ---- phone: packets fly in, video rebuilds, then InvisiTech ----
  if (phoneSet.visible) {
    phPk.forEach((m, k) => { const a = clamp01((t - 46.0 - k * 0.09) / 0.65), e = smoother(a);
      const from = V(-14 + (k % 4) * 1.2, 10 - Math.floor(k / 4) * 1.2, 10), to = V(-1.875 + (k % 4) * 1.25, 3.4 - Math.floor(k / 4) * 1.32 - 2.8, 0.45);
      m.position.copy(from.lerp(to, e)); m.rotation.set((1 - e) * 3, (1 - e) * 4, 0); m.visible = a > 0 && t < 46.95; });
    drawPhone(t < 46.95 ? 0 : t < 47.3 ? 1 : 1 + clamp01((t - 47.3) / 0.25));
    phLights.rotation.z = t * 0.02;
  }
  const card = document.getElementById('card'); card.style.opacity = 0;
  document.getElementById('note4').style.opacity = (t > 35.0 && t < 36.95) || (t > 39.3 && t < 45.9) ? 1 : 0; document.getElementById('note4').style.top = '12.8%';
  let line = ''; for (const [a, txt] of VO4) if (t >= a) line = txt;
  subIn.innerHTML = line; subEl.style.opacity = line && t < P4.card + 0.05 ? 1 : 0; titleEl.style.opacity = 0;
  cinePost(t); composer.render();
  // ---- end card (unchanged design): the phone scene in a rounded panel over a blurred background ----
  const ecA = ease((t - P4.card) / 0.5), ec = document.getElementById('endcard'), pill = document.getElementById('ecPill');
  if (ecA > 0) {
    ec.style.opacity = ecA; ec.style.transform = `scale(${0.9 + 0.1 * ecA})`;
    renderer.domElement.style.filter = `blur(${10 * ecA}px) brightness(${1 - 0.4 * ecA})`;
    const cv = document.getElementById('ecScene'), r = ec.getBoundingClientRect(), dpr = renderer.getPixelRatio();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    const src = renderer.domElement, sw = src.width, sh = src.height, scale = Math.max(cv.width / sw, cv.height / sh) * 1.1;
    cv.getContext('2d').drawImage(src, (cv.width - sw * scale) / 2, (cv.height - sh * scale) / 2, sw * scale, sh * scale);
    const b = ease((t - P4.card - 0.5) / 0.5);
    document.getElementById('ecShade').style.opacity = b; document.getElementById('ecBrand').style.opacity = b;
    pill.style.opacity = ease((t - P4.card - 0.9) / 0.4);
    document.getElementById('wm').style.opacity = Math.max(0, 0.8 * (1 - ecA * 2));
    document.getElementById('note4').style.opacity = 0;
  } else { ec.style.opacity = 0; pill.style.opacity = 0; renderer.domElement.style.filter = ''; document.getElementById('wm').style.opacity = .8; }
}
