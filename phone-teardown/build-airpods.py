"""Build airpods-pro-3-teardown.html from the iPhone explorer template (same UI as the AirTag / iPhone Duo pages).

Sources for every number on the cards:
- Apple tech specs (AirPods Pro 3): earbud 30.9 x 19.2 x 27.0 mm, 5.55 g; case 47.2 x 62.2 x 21.8 mm, 43.99 g;
  IP57 (earbuds and case); H2 chip; case with 2nd-gen Ultra Wideband chip, speaker and lanyard loop;
  sensors: dual beamforming mics, inward-facing mic, skin-detect sensor, motion + speech-detecting accelerometers,
  heart-rate sensor; touch control (press, swipe, press and hold).
- iFixit / Cult of Mac / MacRumors (Oct 2025 teardown): 0.221 Wh cell per bud, single 1.334 Wh cell in the case
  (two cells in Pro 2), glued internals, 0/10 repairability, infrared window for heart-rate sensing, foam-infused tips,
  case magnets rearranged for MagSafe and Qi2.
- Lumafield CT scan: internal layout largely unchanged from earlier AirPods Pro; PPG sensor on the outer surface of the bud.
- MacRumors: up to 8 hours of listening with ANC on. Apple: up to 2x more noise cancelled than AirPods Pro 2.
"""
import re
src = open('iphone-teardown.html').read()

info = r'''const INFO = {
  tip: { name: 'Foam-infused ear tip', role: 'The seal that does half the noise cancelling.',
    body: 'Soft silicone with foam inside. It squashes to fit your ear canal and seals it, so outside noise cannot leak in around the edge before any electronics start working. Apple includes five sizes, from a new extra-extra-small to large, and the ear-tip fit test checks the seal for you.',
    specs: ['Silicone with foam inside', 'Five sizes: XXS, XS, S, M, L', 'Seals the ear canal'] },
  sensor: { name: 'Heart-rate sensor', role: 'Reads your pulse through your skin.',
    body: 'Behind a dark window on the surface that touches your ear sits a tiny infrared LED with a light detector below it. Apple says it pulses invisible infrared light 256 times a second and measures how much the blood in your skin absorbs. Each heartbeat changes that, so the earbud can count your heart rate during workouts. A skin-detect sensor tells it when the bud is in your ear.',
    specs: ['Infrared LED + photodetector', 'Pulses 256 times a second', 'Skin-detect sensor'] },
  inmic: { name: 'Inward-facing mic and mesh', role: 'Listens to what actually reaches your ear.',
    body: 'A microphone sits in front of the driver, facing into your ear canal behind a fine mesh. It hears the sound that really arrives at your eardrum, including any noise that slipped past the tip, so the chip can cancel it and tune the music to the shape of your ear in real time (Adaptive EQ).',
    specs: ['Faces into the ear canal', 'Feeds noise cancelling', 'Feeds Adaptive EQ'] },
  driver: { name: 'Driver and amplifier', role: 'The speaker that makes the sound.',
    body: 'Apple designs its own driver for AirPods Pro: a high-excursion speaker whose diaphragm can travel further, so bass stays clean without distorting. A custom high-dynamic-range amplifier powers it. iFixit found that pulling the driver out destroys it.',
    specs: ['Custom high-excursion Apple driver', 'Custom high-dynamic-range amplifier', 'Destroyed if removed (iFixit)'] },
  battery: { name: 'Earbud battery', role: 'A coin-sized cell that lasts a workday.',
    body: 'A small 0.221 watt-hour cell sits in the head. It gives up to eight hours of listening with noise cancelling on, or 7.5 hours with Spatial Audio and head tracking. iFixit found it now joins the board with a tiny press connector instead of solder, but it is still glued in.',
    specs: ['0.221 Wh', 'Up to 8 h with noise cancelling', 'Press connector, glued in'] },
  accel: { name: 'Motion and speech accelerometers', role: 'Feels your head move and your jaw talk.',
    body: 'Two tiny accelerometers sense movement. The motion one tracks your head for Spatial Audio and workouts. The speech one feels the vibration of your jaw when you talk, so the earbud knows the voice it hears is yours and not someone nearby.',
    specs: ['Motion-detecting accelerometer', 'Speech-detecting accelerometer', 'Head tracking and voice detection'] },
  topmic: { name: 'Outward mic and vent', role: 'Hears the world, and lets the ear breathe.',
    body: 'Under the top mesh, an outward-facing microphone listens to the noise around you. The chip flips that sound and plays it back to cancel it, or lets it through in Transparency mode. Behind the other mesh is a vent that balances air pressure, so a sealed ear never feels blocked. Apple calls the whole airflow design a multiport acoustic architecture.',
    specs: ['Outward beamforming microphone', 'Pressure-equalising vent', 'Multiport acoustic architecture'] },
  shell: { name: 'Earbud housing', role: 'Everything has to fit in here.',
    body: 'The glossy white shell holds every part in a space smaller than a grape. The parts are glued in place, which keeps out sweat and water but means the earbud cannot be opened without damage. iFixit gave it 0 out of 10 for repairability.',
    specs: ['30.9 × 19.2 × 27.0 mm, 5.55 g', 'IP57 sweat and water resistant', 'Glued, 0/10 repairability'] },
  h2: { name: 'H2 chip modules', role: 'The brain, spread down the stem.',
    body: 'The Apple H2 chip runs the noise cancelling, Transparency, Adaptive EQ, Live Translation and the wireless link. In AirPods Pro 2 it was one compact package; CT scans by Lumafield show AirPods Pro 3 spreads its functions across several small modules lined up along the stem. Apple says the result removes up to twice as much noise as AirPods Pro 2.',
    specs: ['Apple H2', 'Split into several modules along the stem', 'Up to 2× more noise cancelled than Pro 2'] },
  stembase: { name: 'Stem: mic, contacts and touch', role: 'Your controls, and the mic nearest your mouth.',
    body: 'The flat side of the stem is the touch control: press to play or pause, swipe to change volume, press and hold to switch noise modes. At the very bottom, a beamforming microphone sits between the two metal charging contacts, pointing down toward your mouth. Paired with the top mic it focuses on your voice during calls.',
    specs: ['Touch control: press, swipe, hold', 'Bottom beamforming mic', 'Two charging contacts'] },
};
'''
src = re.sub(r"const INFO = \{.*?\n\};\n", lambda m: info, src, count=1, flags=re.S)

build = r'''/* ---------------- AirPods Pro 3 dimensions (mm) ---------------- */
const root = new THREE.Group(); scene.add(root);
const parts = [];
function addPart(id, offset, view, anchor, build) {
  const g = new THREE.Group(); build(g); root.add(g);
  g.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(g);
  const center = bb.getCenter(new THREE.Vector3());
  const radius = bb.getBoundingSphere(new THREE.Sphere()).radius;
  const p = { id, index: parts.length, group: g, offset: new THREE.Vector3(...offset), center, radius, view, anchor: new THREE.Vector3(...anchor), dim: 0, info: INFO[id] };
  g.traverse(o => { if (o.isMesh) { o.userData.part = p; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { m.userData.baseOpacity = m.opacity; m.userData.baseTransparent = m.transparent; m.userData.baseDepthWrite = m.depthWrite; }); } });
  parts.push(p); return p;
}
function chipOn(g, w, h, t, lines, x, y, z, rx = 0, ry = 0) {
  const side = std(0x16171a, 0.3, 0.45);
  const top = new THREE.MeshStandardMaterial({ map: labelTex(lines), metalness: 0.3, roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), [side, side, side, side, top, side]);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); g.add(m); return m;
}
const ell = (rx, ry, rz, mat, x, y, z, parent, seg = 64) => { const m = mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), mat, x, y, z, parent); m.scale.set(rx, ry, rz); return m; };
const yCyl = (r, len, mat, x, y, z, parent, seg = 40) => mesh(new THREE.CylinderGeometry(r, r, len, seg), mat, x, y, z, parent);
const WHITE = () => phys({ color: 0xf5f5f3, metalness: 0, roughness: 0.38, clearcoat: 0.65, clearcoatRoughness: 0.14, sheen: new THREE.Color(0xffffff), envMapIntensity: 0.9 });
const GRILLE = () => std(0x1a1b1f, 0.4, 0.55);
const GOLD = () => std(0xd2a94e, 1, 0.3);
const FLEX = () => std(0xd99a3a, 0.15, 0.45, { side: THREE.DoubleSide });
const SILVER = () => std(0xd5d9de, 1, 0.16);
const meshTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#26282d'; x.fillRect(0, 0, w, h); x.fillStyle = '#4d5058'; for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { x.beginPath(); x.arc(i * 8 + (j % 2) * 4 + 2, j * 8 + 2, 1.6, 0, Math.PI * 2); x.fill(); } });
meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(2, 2);
const MESH = () => std(0xd8dade, 0.25, 0.55, { map: meshTex });

/* lid + bud controls */
const CTRL = { lid: 1, lidGoal: 1, out: 1, outGoal: 1 };
const POSE_OV = (() => { const q = new URLSearchParams(location.search).get('pose'); if (!q) return null; const [az, el, dist, tx, ty, tz] = q.split(',').map(Number); return { az, el, dist, target: new THREE.Vector3(tx, ty, tz), shift: 0 }; })();
{ const q = new URLSearchParams(location.search).get('state') || ''; if (q.includes('closed')) CTRL.lid = CTRL.lidGoal = 0; if (q.includes('in')) CTRL.out = CTRL.outGoal = 0; }
let LID_HINGE = null, LEFT_BUD = null, LEFT_X = 0, LEFT_Y = 0, LEFT_Z = 0, TIP_G = null, SHELL_G = null, CASE_G = null, SENSOR_WIN = null, MODEL = null; const LANYARD = [];
const BUD_IDS = new Set(['tip', 'sensor', 'inmic', 'driver', 'battery', 'accel', 'topmic', 'shell', 'h2', 'stembase']);
let [BUD_DROP, BUD_TURN, BUD_TILT, BUD_BACK, BUD_SPREAD] = (new URLSearchParams(location.search).get('bud') || '-21,1.0,0.3,-1.0,2.5').split(',').map(Number);
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _pv = new THREE.Vector3();
function rotAbout(obj, pivot, ex, ey) {   // rotate obj about a pivot given in its own (unrotated) frame
  _q.setFromEuler(_e.set(ex, ey, 0)); obj.quaternion.copy(_q);
  obj.position.add(_pv.copy(pivot).sub(pivot.clone().applyQuaternion(_q)));
}
window.__budCheck = () => {
  scene.updateMatrixWorld(true);
  const c0 = new THREE.Vector3(CASE.x, CASE.y + BODY_H / 2 - (PB - LID_H), CASE.z).add(CASE_G.position);
  let out = 0, n = 0, worst = 0; const v = new THREE.Vector3(), rep = {};
  const test = o => { if (!o.isMesh || !o.geometry.attributes.position) return; const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i += 3) { v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld).sub(c0);
      const F = Math.pow(Math.pow(Math.abs(v.x / PA), 2 / E2) + Math.pow(Math.abs(v.z / PC), 2 / E2), E2 / E1) + Math.pow(Math.abs(v.y / PB), 2 / E1); n++; if (F > 0.985) { out++; const k = (o.userData.part ? o.userData.part.id : 'leftbud'); const r = (rep[k] = rep[k] || { c: 0, x: 0, y: 0, z: 0 }); r.c++; r.x += v.x; r.y += v.y; r.z += v.z; } worst = Math.max(worst, F); } };
  parts.forEach(p => { if (BUD_IDS.has(p.id) && p.id !== 'tip' || p.id === 'tip') p.group.traverse(test); });
  if (LEFT_BUD) LEFT_BUD.traverse(test);
  Object.values(rep).forEach(r => { r.x = +(r.x / r.c).toFixed(1); r.y = +(r.y / r.c).toFixed(1); r.z = +(r.z / r.c).toFixed(1); }); return { out, worst: +worst.toFixed(3), rep };
};
const _qa = new THREE.Quaternion(), _hc = new THREE.Vector3(), INTERNAL = new Set(['sensor', 'inmic', 'driver', 'battery', 'accel', 'topmic', 'h2', 'stembase']);
function seat(obj, P, t, base) {   // t = 0 → out pose (as baked), 1 → seated in the case; rotate about the head centre
  _qa.identity().slerp(P.q, t); obj.quaternion.copy(_qa);
  _hc.copy(P.h).lerp(P.c, t);
  obj.position.copy(base).add(_hc).sub(P.h.clone().applyQuaternion(_qa));
}
function applyExtras(e) {
  const inn = (1 - CTRL.out) * (1 - e), inL = 1 - CTRL.out;
  if (MODEL) {
    parts.forEach(p => { if (BUD_IDS.has(p.id)) seat(p.group, MODEL.R, inn, p.group.position.clone()); if (INTERNAL.has(p.id)) p.group.visible = e > 0.02; });
    seat(LEFT_BUD, MODEL.L, inL, new THREE.Vector3());
  } else {
    parts.forEach(p => { if (BUD_IDS.has(p.id)) { p.group.position.y += BUD_DROP * inn; p.group.position.z += BUD_BACK * inn; p.group.position.x += BUD_SPREAD * inn; rotAbout(p.group, HEAD, BUD_TILT * inn, -BUD_TURN * inn); } });
    if (LEFT_BUD) { LEFT_BUD.position.set(LEFT_X - BUD_SPREAD * inL, LEFT_Y + BUD_DROP * inL, LEFT_Z + BUD_BACK * inL); rotAbout(LEFT_BUD, HEAD, BUD_TILT * inL, BUD_TURN * inL); }
  }
  if (LID_HINGE) LID_HINGE.rotation.x = -1.92 * CTRL.lid;
  if (CASE_G) CASE_G.visible = e < 0.04;
}
/* earbud head = ellipsoid; helpers put things on its surface */
const HEAD = new THREE.Vector3(0, 8, 0), HR = new THREE.Vector3(9.3, 9.8, 8.7);
function onHead(dir, k = 1) { const d = new THREE.Vector3(...dir).normalize(); return { p: new THREE.Vector3(d.x * HR.x * k, d.y * HR.y * k, d.z * HR.z * k).add(HEAD), n: new THREE.Vector3(d.x / HR.x, d.y / HR.y, d.z / HR.z).normalize() }; }
function headGeo() {   // egg / teardrop: narrower crown, flatter back, belly swelling toward the stem
  const g = new THREE.SphereGeometry(1, 128, 96), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let { x, y, z } = v;
    const crown = Math.max(0, y), belly = Math.max(0, -y);
    x *= 1 - 0.13 * crown; z *= 1 - 0.1 * crown;           // narrower toward the top
    if (z < 0) z *= 0.86;                                    // flatter back
    y = y * (1 + 0.1 * belly);                               // longer lower half, flows into the stem
    x += 0.12 * belly * belly;                               // belly leans toward the stem
    p.setXYZ(i, x * HR.x, y * HR.y, z * HR.z);
  }
  g.computeVertexNormals(); return g;
}
function patch(parent, dir, sx, sy, mat, rot = 0) {
  const { p, n } = onHead(dir, 0.995); const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
  m.scale.set(sx, sy, 0.35); m.position.copy(p); m.lookAt(p.clone().add(n)); m.rotateZ(rot); parent.add(m); return m;
}
/* stem frame: top tucked into the head, leaning down and slightly forward */
function stemFrame(parent) { const f = new THREE.Group(); f.position.set(0.6, HEAD.y - 5.0, 0.6); f.rotation.set(-0.05, 0, 0.06); parent.add(f); return f; }
const STEM_L = 17.0;   // total bud height ≈ 30.9 mm, per Apple's spec
function stemShell(f, mat) {
  const L = STEM_L, prof = [[0.01, 0], [2.2, 0.05], [2.75, 0.6], [2.9, 2], [3.0, 0.5 * L], [3.25, 0.78 * L], [3.9, L - 0.6], [4.4, L + 1.5], [0.01, L + 1.5]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 64); geo.translate(0, -STEM_L, 0);
  const m = mesh(geo, mat, 0, 0, 0, f); m.scale.set(1, 1, 0.84);
  const cap = yCyl(2.45, 0.5, SILVER(), 0, -STEM_L + 0.2, 0, f); cap.scale.set(1, 1, 0.84);
  ell(0.9, 0.3, 0.55, GRILLE(), 0, -STEM_L - 0.05, 0, f, 24);
  const fm = ell(0.55, 1.1, 0.3, MESH(), 0, -STEM_L + 2.6, 2.46, f, 24);  // bottom mic port on the front
  return m;
}
function budOuter(parent, withTip = true) {
  const w = WHITE();
  mesh(headGeo(), w, HEAD.x, HEAD.y, HEAD.z, parent);
  const noz = mesh(cyl(3.4, 4.0, 64), w, HEAD.x - 0.6, HEAD.y - 1.4, 8.6, parent); noz.scale.set(1, 1.15, 1);
  const ring = mesh(cyl(3.25, 0.35, 64), std(0xc9cdd2, 0.85, 0.32), HEAD.x - 0.6, HEAD.y - 1.4, 10.35, parent); ring.scale.set(1, 1.15, 1);
  patch(parent, [0.38, 0.72, 0.42], 3.1, 0.95, MESH(), 0.55);    // top mic grille, top-front
  patch(parent, [-0.1, 0.88, -0.45], 2.8, 1.0, MESH(), 0.1);      // rear grille
  patch(parent, [0.93, 0.12, -0.3], 0.75, 3.6, MESH(), 0.2);      // side vent, long thin pill
  patch(parent, [0.66, -0.12, 0.7], 0.5, 1.3, MESH(), -0.35);     // small front vent by the nozzle
  const sf = stemFrame(parent); stemShell(sf, w);
  ell(4.0, 4.4, 3.5, w, 0, -0.6, 0.1, sf, 48);   // smooth fillet where the stem grows out of the head
  if (withTip) tipMesh(parent);
}
function tipMesh(parent) {
  const sil = phys({ color: 0xeeeff1, roughness: 0.6, metalness: 0, clearcoat: 0.2, side: THREE.DoubleSide });
  const pts = [[3.3, 0], [3.9, 0.35], [4.8, 0.9], [5.4, 1.8], [5.65, 2.9], [5.55, 4.0], [5.1, 5.0], [4.3, 5.8], [3.3, 6.35], [2.3, 6.55], [2.1, 6.2], [2.9, 1.2]];
  const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 96); geo.rotateX(Math.PI / 2);
  const m = mesh(geo, sil, HEAD.x - 0.6, HEAD.y - 1.4, 10.4, parent); m.scale.set(1, 1.15, 1);
  const hole = mesh(cyl(2.0, 0.4, 32), new THREE.MeshBasicMaterial({ color: 0x24262b }), HEAD.x - 0.6, HEAD.y - 1.4, 17.0, parent); hole.scale.set(0.95, 1.1, 1);
  return m;
}

/* Earbud internals, placed inside the real AirPods Pro shell (out pose: tip faces +z, stem hangs from the back of the head).
   Measured on the model: head centre ≈ (0.2, 6.5, −1.5); stem axis from (−2.4, −1.5, −7.7) to (1.3, −14, −6.9). */
const BC = new THREE.Vector3(0.2, 6.5, -1.5), AX = new THREE.Vector3(-0.2, -3.4, 8.8).normalize();
const ST0 = new THREE.Vector3(-2.4, -1.5, -7.7), ST1 = new THREE.Vector3(1.3, -14.0, -6.9), SAX = ST1.clone().sub(ST0).normalize();
const at = (v, d, k) => v.clone().addScaledVector(d, k);
const ZV = new THREE.Vector3(0, 0, 1), YV = new THREE.Vector3(0, 1, 0);
function aim(obj, dir, from = ZV) { obj.quaternion.setFromUnitVectors(from, dir.clone().normalize()); return obj; }
function grp(parent, pos, dir, from) { const g = new THREE.Group(); g.position.copy(pos); if (dir) aim(g, dir, from); parent.add(g); return g; }
const meshMat = () => std(0x9ea3aa, 0.6, 0.45, { map: meshTex });
const PCB = () => std(0x14302a, 0.25, 0.45);
let SENSOR_MOUNT = null;

/* 1. Ear tip (the real model's tip) */
addPart('tip', [-0.5, -8.6, 22.4], { az: 0.75, el: 0.2, k: 1.7 }, [4.8, 3.0, 9.0], g => { TIP_G = g; tipMesh(g); });

/* 2. Heart-rate sensor: IR LED (wire-bonded die) above a photodetector, behind an IR window */
addPart('sensor', [-18, -5, 12], { az: 0.25, el: 0.15, k: 2.6 }, [-4.6, 2.2, 6.0], g => {
  const m = grp(g, new THREE.Vector3(-4.2, 2.4, 5.6), new THREE.Vector3(-0.55, -0.35, 0.76)); SENSOR_MOUNT = m;
  const glass = phys({ color: 0x07080b, metalness: 0.1, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.82 });
  ell(2.5, 1.6, 0.28, glass, 0, 0, 0.35, m, 40);                                   // IR window
  box(3.4, 2.6, 0.3, PCB(), 0, 0, -0.35, m);                                          // module board
  box(0.55, 0.55, 0.25, std(0x3b0c14, 0.2, 0.3), -0.7, 0.2, -0.08, m);              // IR LED die
  const wb = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 16, Math.PI), std(0xe8c46a, 1, 0.25)); wb.position.set(-0.35, 0.2, 0.05); g.add(wb); m.add(wb);   // wire bond
  box(1.2, 1.2, 0.2, std(0x0d1f3a, 0.3, 0.25), 0.7, -0.25, -0.12, m);              // photodetector
  box(0.5, 0.5, 0.2, std(0x2a2c30, 0.3, 0.4), 0.9, 0.85, -0.12, m);                // skin-detect sensor
  box(1.4, 3.6, 0.1, FLEX(), 0.2, -2.6, -0.45, m);
});

/* 3. Inward-facing mic + acoustic mesh in the nozzle, in front of the driver */
addPart('inmic', [5.6, -6.1, 15.9], { az: 0.6, el: 0.25, k: 3.0 }, [2.4, 4.0, 7.6], g => {
  const mesh1 = mesh(cyl(2.35, 0.12, 48), meshMat(), 0, 0, 0, grp(g, at(BC, AX, 9.3), AX)); 
  const mg = grp(g, at(BC, AX, 7.4), AX);
  box(1.7, 1.2, 0.85, std(0xb9bec4, 1, 0.25), 0.8, 0.6, 0, mg);                   // MEMS mic can
  mesh(cyl(0.22, 0.2, 12), GRILLE(), 0.8, 0.6, 0.5, mg);                            // acoustic port
  box(1.1, 3.0, 0.08, FLEX(), 0.8, -1.4, -0.3, mg);
});

/* 4. Driver + amplifier */
addPart('driver', [-6.2, -3.2, 8.4], { az: 0.85, el: 0.3, k: 1.9 }, [5.6, 6.0, 1.6], g => {
  const d = grp(g, at(BC, AX, 3.4), AX);
  mesh(cyl(5.2, 2.2, 64), std(0x2b2d32, 0.6, 0.4), 0, 0, 0, d);                     // basket
  mesh(cyl(4.6, 0.25, 64), std(0x1a1b1f, 0.15, 0.6), 0, 0, 1.15, d);              // diaphragm
  const dome = ell(1.6, 1.6, 0.5, std(0xc7ccd2, 0.9, 0.25), 0, 0, 1.25, d, 32);   // centre dome
  mesh(cyl(2.4, 1.4, 48), std(0x7a7f87, 0.9, 0.3), 0, 0, -1.5, d);                 // magnet
  const copper = std(0xc98552, 1, 0.3);
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(2.9 + i * 0.22, 0.11, 6, 64), copper); t.position.z = -0.6; d.add(t); }
  const amp = grp(g, at(at(BC, AX, 0.6), YV, -4.4), AX);
  box(2.6, 2.6, 0.5, std(0x111215, 0.3, 0.45), 0, 0, 0, amp); chipOn(amp, 2.2, 2.2, 0.15, [['AMP', 70]], 0, 0, 0.3);
  box(1.4, 3.2, 0.08, FLEX(), 0, 2.4, -0.3, amp);
});

/* 5. Battery: coin-style cell in the head, press connector */
const budCell = canvasTex(512, 512, (x, w, h) => {
  const gr = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  gr.addColorStop(0, '#d6dade'); gr.addColorStop(0.85, '#b0b6bc'); gr.addColorStop(1, '#8e959b');
  x.fillStyle = gr; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#3c4148'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 70px monospace'; x.fillText('0.221 Wh', w / 2, 220); x.font = '500 46px monospace'; x.fillText('Li-ion', w / 2, 310);
});
addPart('battery', [0, 6, -24], { az: 2.7, el: 0.35, k: 2.0 }, [0.2, 13.0, -5.6], g => {
  const b = grp(g, new THREE.Vector3(0.2, 7.4, -5.4), AX);
  mesh(cyl(5.4, 4.6, 64), std(0xb6bcc2, 1, 0.25), 0, 0, 0, b);
  const face = new THREE.Mesh(new THREE.CircleGeometry(5.3, 64), new THREE.MeshStandardMaterial({ map: budCell, metalness: 0.7, roughness: 0.35 }));
  face.position.z = -2.32; face.rotation.y = Math.PI; b.add(face);
  box(2.2, 1.2, 0.8, std(0x2a2c30, 0.4, 0.4), 3.2, 3.6, 1.2, b);                  // press connector
  box(1.6, 4.0, 0.1, FLEX(), 3.2, 1.6, 1.7, b);
});

/* 6. Motion + speech-detecting accelerometers on a small flex */
addPart('accel', [16, 8, -8], { az: 1.6, el: 0.35, k: 2.6 }, [3.2, 11.5, -3.0], g => {
  const a = grp(g, new THREE.Vector3(1.4, 11.0, -2.6), new THREE.Vector3(0.3, 0.9, -0.3));
  box(5.0, 3.0, 0.1, FLEX(), 0, 0, -0.1, a);
  chipOn(a, 1.6, 1.6, 0.6, [['MOTION', 34]], -1.2, 0, 0.3);
  chipOn(a, 1.6, 1.6, 0.6, [['SPEECH', 34]], 1.2, 0, 0.3);
});

/* 7. Outward beamforming mic under the top mesh + pressure-equalising vent */
addPart('topmic', [0, 20, 2], { az: 0.9, el: 0.6, k: 2.4 }, [4.6, 12.2, 1.0], g => {
  const tm = grp(g, new THREE.Vector3(2.4, 11.6, 0.4), new THREE.Vector3(0.3, 0.8, 0.4));
  box(1.7, 1.2, 0.85, std(0xb9bec4, 1, 0.25), 0, 0, -0.5, tm); mesh(cyl(0.22, 0.2, 12), GRILLE(), 0, 0, 0, tm);
  ell(2.2, 1.0, 0.12, meshMat(), 0, 0, 0.15, tm, 32);                                   // its mesh
  box(1.1, 3.0, 0.08, FLEX(), 0, -1.8, -0.8, tm);
  const vt = grp(g, new THREE.Vector3(4.6, 8.6, -6.2), new THREE.Vector3(0.65, 0.25, -0.7));
  ell(0.9, 2.6, 0.12, meshMat(), 0, 0, 0.1, vt, 32);                                   // vent mesh
  ell(0.75, 2.3, 0.08, std(0xe9e4d6, 0, 0.9), 0, 0, -0.15, vt, 32);                  // breathable membrane
  box(1.6, 3.4, 0.9, std(0xd8d8d4, 0, 0.6), 0, 0, -0.8, vt);                          // vent channel
});

/* 8. Earbud housing (the real model's shell) */
addPart('shell', [0, 0, 0], { az: 0.65, el: 0.2, k: 1.25 }, [-7.4, 11.0, 2.0], g => { SHELL_G = g; budOuter(g, false); });

/* 9. H2 functions split into several BGA modules along the stem (Lumafield CT) + antenna */
addPart('h2', [-14, -20, -4], { az: 0.55, el: 0.15, k: 1.6 }, [-3.4, -6.0, -7.0], g => {
  const sg = grp(g, ST0.clone().lerp(ST1, 0.45), SAX, new THREE.Vector3(0, -1, 0));
  box(3.0, 11.5, 0.45, PCB(), 0, 0, 0, sg);                                           // rigid-flex spine
  const mods = [['H2', 4.0], ['BGA', 0.4], ['BGA', -3.4]];
  mods.forEach(([l, y], i) => chipOn(sg, 2.6, i ? 2.4 : 3.0, 0.9, [[l, i ? 56 : 86]], 0, y, 0.68));
  box(0.3, 11, 0.1, GOLD(), -1.35, 0, -0.3, sg);                                      // antenna trace
  box(1.6, 3.4, 0.08, FLEX(), 0, 7.2, 0.2, sg);                                       // flex up into the head
});

/* 10. Stem base: bottom beamforming mic between the charging contacts + touch control strip */
addPart('stembase', [10, -30, 2], { az: 0.4, el: -0.2, k: 1.8 }, [3.4, -14.8, -5.0], g => {
  const bt = grp(g, new THREE.Vector3(1.45, -15.2, -6.85), SAX, new THREE.Vector3(0, -1, 0));
  for (const sx of [-1, 1]) { const c = mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.5, 24, 1, false, sx > 0 ? 0 : Math.PI, Math.PI), std(0xd8dde2, 1, 0.18), sx * 0.45, 0, 0, bt); }
  box(1.4, 0.9, 1.1, std(0xb9bec4, 1, 0.25), 0, 1.0, 0, bt);                          // bottom MEMS mic
  mesh(new THREE.CircleGeometry(0.3, 16), GRILLE(), 0, -0.27, 0, bt).rotation.x = Math.PI / 2;
  const ts = grp(g, ST0.clone().lerp(ST1, 0.5).add(new THREE.Vector3(0, 0, 2.3)), SAX, new THREE.Vector3(0, -1, 0));
  box(2.4, 9.5, 0.12, FLEX(), 0, 0, 0, ts);                                           // touch / force sensor strip
  for (let i = 0; i < 5; i++) box(1.8, 0.25, 0.05, GOLD(), 0, -3.6 + i * 1.8, 0.08, ts);
});

/* 8. MagSafe charging case, lid open, with the left earbud resting above it */
const CASE = new THREE.Vector3(-11.6, -26.5, 0.8), BODY_H = 33, LID_H = 14.2, CW = 62.2, CD = 21.8;
function caseShape(w, h, rb, rt) {   // rounded rectangle with different bottom / top corner radii
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + rb, y); s.lineTo(x + w - rb, y); s.absarc(x + w - rb, y + rb, rb, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - rt); if (rt > 0) s.absarc(x + w - rt, y + h - rt, rt, 0, Math.PI / 2); else s.lineTo(x + w, y + h);
  s.lineTo(x + rt, y + h); if (rt > 0) s.absarc(x + rt, y + h - rt, rt, Math.PI / 2, Math.PI); else s.lineTo(x, y + h);
  s.lineTo(x, y + rb); s.absarc(x + rb, y + rb, rb, Math.PI, Math.PI * 1.5); return s;
}
/* pebble = superellipsoid (squircle front, rounded depth); clampY flattens it at the lid line */
function pebble(a, b, c, e1, e2, clampLo, clampHi, U = 160, V = 120) {
  const sp = (w, e) => Math.sign(w) * Math.pow(Math.abs(w), e);
  const pos = [], idx = [];
  for (let j = 0; j <= V; j++) {
    const v = -Math.PI / 2 + Math.PI * j / V;
    for (let i = 0; i <= U; i++) {
      const u = -Math.PI + 2 * Math.PI * i / U;
      const x = a * sp(Math.cos(v), e1) * sp(Math.cos(u), e2);
      let y = b * sp(Math.sin(v), e1);
      const z = c * sp(Math.cos(v), e1) * sp(Math.sin(u), e2);
      y = Math.min(Math.max(y, clampLo), clampHi);
      pos.push(x, y, z);
    }
  }
  for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) {
    const p = j * (U + 1) + i, q = p + U + 1;
    idx.push(p, q, p + 1, p + 1, q, q + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const PA = CW / 2, PB = (BODY_H + LID_H) / 2, PC = CD / 2, SEAM = PB - LID_H, E1 = 0.42, E2 = 0.55;
const decor = build => { const g = new THREE.Group(); build(g); root.add(g); return g; };
decor(g => {
  CASE_G = g;
  const w = WHITE(), cy = CASE.y + BODY_H / 2 - SEAM, top = CASE.y + BODY_H / 2;   // pebble centre so the seam sits at the body top
  mesh(pebble(PA, PB, PC, E1, E2, -PB, SEAM), w, CASE.x, cy, CASE.z, g);
  const inner = std(0xeceef0, 0, 0.42);
  for (const sx of [-1, 1]) {   // rounded-square cradles the buds sit in
    const well = mesh(extrude(rrShape(20, 13.5, 6), 1.0, 0.45, 24), std(0xc6cad0, 0, 0.6), CASE.x + sx * 13.4, top - 0.62, CASE.z + 0.6, g); well.rotation.x = -Math.PI / 2;
    ell(2.9, 0.35, 2.4, std(0x9a9fa6, 0, 0.6), CASE.x + sx * 13.4, top + 0.1, CASE.z + 0.6, g, 32);
  }
  box(11, 0.9, 1.4, SILVER(), CASE.x, top + 0.25, CASE.z - PC + 2.2, g);   // hinge
  // lid: the top slice of the same pebble, hinged at the back and swung open
  const hinge = new THREE.Group(); hinge.position.set(CASE.x, top, CASE.z - PC + 2.0); hinge.rotation.x = -1.92; g.add(hinge);
  LID_HINGE = hinge;
  const seamLine = mesh(pebble(PA * 1.003, PB, PC * 1.006, E1, E2, SEAM - 0.26, SEAM - 0.04), std(0x9aa0a8, 0, 0.6), CASE.x, cy, CASE.z, g);
  const lidGeo = pebble(PA, PB, PC, E1, E2, SEAM, PB); lidGeo.translate(0, -SEAM, PC - 2.0);
  mesh(lidGeo, w, 0, 0.05, 0, hinge);
  ell(0.6, 0.6, 0.2, std(0x1a1d22, 0.2, 0.3, { emissive: 0x2fbf5a, emissiveIntensity: 1.1 }), CASE.x, CASE.y + 3, CASE.z + PC - 0.02, g, 24);
  // lanyard loop on the right side
  const lp = mesh(extrude(rrShape(2.6, 6.0, 1.3), 0.6, 0.2, 16), std(0xd9dce0, 0.8, 0.25), CASE.x + PA - 0.35, CASE.y + 1, CASE.z, g); lp.rotation.y = Math.PI / 2; lp.userData.keep = true; LANYARD.push(lp);
  for (const dy of [1.45, -1.45]) { const h = mesh(cyl(0.7, 0.9, 24), std(0x3a3d42, 0.4, 0.5), CASE.x + PA - 0.1, CASE.y + 1 + dy, CASE.z, g); h.rotation.y = Math.PI / 2; h.userData.keep = true; LANYARD.push(h); }
  // USB-C and speaker holes underneath
  const yBot = (x, z) => -PB * Math.pow(Math.max(0, 1 - Math.pow(Math.pow(Math.abs(x / PA), 2 / E2) + Math.pow(Math.abs(z / PC), 2 / E2), E2 / E1)), E1 / 2);
  const port = mesh(new THREE.ShapeGeometry(rrShape(8.9, 3.0, 1.5), 16), std(0x1d1f23, 0.5, 0.4), CASE.x, cy + yBot(0, 0) - 0.03, CASE.z, g); port.rotation.x = Math.PI / 2;
  const portIn = mesh(new THREE.ShapeGeometry(rrShape(6.6, 0.8, 0.4), 8), std(0x6b7078, 0.8, 0.3), CASE.x, cy + yBot(0, 0) - 0.06, CASE.z, g); portIn.rotation.x = Math.PI / 2;
  for (const i of [-3, -2, 2, 3]) { const hx = i * 2.6; const h = mesh(new THREE.CircleGeometry(0.45, 20), GRILLE(), CASE.x + hx, cy + yBot(hx, 0) - 0.02, CASE.z, g); h.rotation.x = Math.PI / 2; }
  // left earbud (mirror of the right one) floating above the open case
  const left = new THREE.Group(); budOuter(left, true);
  left.scale.set(-1, 1, 1); left.position.set(CASE.x * 2 - 0.0, 0, 0); left.rotation.set(0, 0, 0); g.add(left);
  LEFT_BUD = left; LEFT_X = left.position.x; LEFT_Y = left.position.y; LEFT_Z = left.position.z;
});

/* ---------------- Real AirPods Pro model ----------------
   "AirPods Pro" by Jed Falcone (sketchfab.com/jedlas012), CC-BY 4.0. Replaces the hand-built case, lid and bud shells;
   the exploded internals stay. Case scaled to Apple's 62.2 mm width; buds scaled to Apple's 30.9 mm height. */
let MODEL_READY = !window.AIRPODS_COMPACT; window.__tourReady = () => MODEL_READY;
function loadCompact(done, fail) {   // unpack the compact model (gzip + 16-bit positions) into a three.js scene
  const C = window.AIRPODS_COMPACT, bytes = Uint8Array.from(atob(C.bin), c => c.charCodeAt(0));
  if (!('DecompressionStream' in window)) { fail('no DecompressionStream'); return; }
  new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer().then(ab => {
    const root = new THREE.Group(), caseG = new THREE.Group(), lidG = new THREE.Group(), budsG = new THREE.Group();
    caseG.name = 'Case_1'; lidG.name = 'Lid'; budsG.name = 'Airpods'; caseG.add(lidG); root.add(caseG, budsG);
    const tex = new THREE.TextureLoader().load(C.tex); tex.encoding = THREE.sRGBEncoding; tex.flipY = false;
    C.meshes.forEach(m => {
      const q = new Uint16Array(ab, m.po, m.n * 3), pos = new Float32Array(m.n * 3);
      for (let i = 0; i < m.n; i++) for (let j = 0; j < 3; j++) pos[i * 3 + j] = m.min[j] + q[i * 3 + j] / 65535 * m.sc[j];
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setIndex(new THREE.BufferAttribute(m.i32 ? new Uint32Array(ab, m.io, m.ni) : new Uint16Array(ab, m.io, m.ni), 1));
      if (m.tex) { const uq = new Uint16Array(ab, m.uo, m.n * 2), uv = new Float32Array(m.n * 2); for (let i = 0; i < m.n * 2; i++) uv[i] = uq[i] / 65535; g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
      g.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ metalness: m.met, roughness: m.rou, map: m.tex ? tex : null }); mat.color.setRGB(m.col[0], m.col[1], m.col[2]); mat.name = m.mname;
      const mesh = new THREE.Mesh(g, mat); mesh.name = m.name; mesh.userData.side = m.side;
      (m.grp === 'lid' ? lidG : m.grp === 'buds' ? budsG : caseG).add(mesh);
    });
    root.updateMatrixWorld(true); done({ scene: root });
  }).catch(fail);
}

function splitGeo(geo, keep) {   // keep triangles whose centroid passes the test
  const g = geo.index ? geo.toNonIndexed() : geo, pa = g.attributes.position, out = {}, names = Object.keys(g.attributes), c = new THREE.Vector3(), v = new THREE.Vector3();
  names.forEach(n => out[n] = []);
  for (let t = 0; t < pa.count; t += 3) {
    c.set(0, 0, 0); for (let k = 0; k < 3; k++) c.add(v.fromBufferAttribute(pa, t + k)); c.multiplyScalar(1 / 3);
    if (!keep(c)) continue;
    names.forEach(n => { const a = g.attributes[n]; for (let k = 0; k < 3; k++) for (let j = 0; j < a.itemSize; j++) out[n].push(a.array[(t + k) * a.itemSize + j]); });
  }
  const r = new THREE.BufferGeometry(); names.forEach(n => r.setAttribute(n, new THREE.Float32BufferAttribute(out[n], g.attributes[n].itemSize))); return r;
}
if (window.AIRPODS_COMPACT) loadCompact(gltf => {
  const src = gltf.scene; src.updateMatrixWorld(true);
  const byName = n => src.getObjectByName(n);
  const caseNode = byName('Case_1'), lidNode = byName('Lid'), budsNode = byName('Airpods');
  const cb = new THREE.Box3().setFromObject(caseNode), lb = new THREE.Box3().setFromObject(lidNode);
  const k = CW / (cb.max.x - cb.min.x), seamM = lb.min.y;                       // model units → mm
  const Om = new THREE.Vector3((cb.min.x + cb.max.x) / 2, seamM, (cb.min.z + cb.max.z) / 2);
  const top = CASE.y + BODY_H / 2, Ow = new THREE.Vector3(CASE.x, top, CASE.z);
  const W = new THREE.Matrix4().makeTranslation(Ow.x, Ow.y, Ow.z).multiply(new THREE.Matrix4().makeScale(k, k, k)).multiply(new THREE.Matrix4().makeTranslation(-Om.x, -Om.y, -Om.z));
  const under = (o, anc) => { for (let a = o; a; a = a.parent) if (a === anc) return true; return false; };
  // materials: crisp white plastic for the white parts, keep the rest (grilles, metal, tips)
  const fixMat = m => { const c = m.color || new THREE.Color(1, 1, 1); const lum = c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
    if (!m.map && lum > 0.75) return WHITE(); m.envMapIntensity = 1; return m; };
  const meshesUnder = anc => { const l = []; anc.traverse(o => { if (o.isMesh) l.push(o); }); return l; };
  // hide the hand-built shells (keep the lanyard loop) and the hand-built left bud
  SHELL_G.children.forEach(o => o.visible = false); TIP_G.children.forEach(o => o.visible = false);
  CASE_G.children.slice().forEach(o => { if (!o.userData.keep) o.visible = false; });

  /* case body (no back pairing button: AirPods Pro 3 has none) + lid on its hinge */
  meshesUnder(caseNode).forEach(o => {
    if (under(o, lidNode)) return;
    const bb = new THREE.Box3().setFromObject(o);
    if (o.name.startsWith('Cylinder_2') || (bb.max.z < cb.min.z + 0.15 && bb.max.x - bb.min.x < 1)) return;   // back button
    const geo = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(W);
    const m = new THREE.Mesh(geo, fixMat(o.material)); CASE_G.add(m);
  });
  const pivot = new THREE.Vector3(Om.x, seamM, cb.min.z + 0.06).applyMatrix4(W);
  const hinge = new THREE.Group(); hinge.position.copy(pivot); CASE_G.add(hinge);
  meshesUnder(lidNode).forEach(o => { const geo = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(W); geo.translate(-pivot.x, -pivot.y, -pivot.z); hinge.add(new THREE.Mesh(geo, fixMat(o.material))); });
  LID_HINGE = hinge;

  /* buds: split left / right, find each head centre and tip direction */
  const budMeshes = meshesUnder(budsNode).map(o => ({ o, geo: o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(W), isTip: o.name.startsWith('Capsule') }));
  const sides = { R: c => c.x > Ow.x, L: c => c.x <= Ow.x };
  const pose = {};
  for (const side of ['R', 'L']) {
    const pieces = (budMeshes.some(b => b.o.userData.side) ? budMeshes.filter(b => b.o.userData.side === side).map(b => ({ ...b, geo: b.geo.clone() })) : budMeshes.map(b => ({ ...b, geo: splitGeo(b.geo, sides[side]) }))).filter(b => b.geo.attributes.position.count);
    const bb = new THREE.Box3(); pieces.forEach(b => { b.geo.computeBoundingBox(); bb.union(b.geo.boundingBox); });
    const hh = bb.max.y - bb.min.y, headBox = new THREE.Box3(), tipBox = new THREE.Box3(), v = new THREE.Vector3();
    pieces.forEach(b => { const pa = b.geo.attributes.position; for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); if (!b.isTip && v.y > bb.max.y - hh * 0.42) headBox.expandByPoint(v); if (b.isTip) tipBox.expandByPoint(v); } });
    const c = headBox.getCenter(new THREE.Vector3()), tipC = tipBox.getCenter(new THREE.Vector3());
    const s = 30.9 / hh;                                                                   // Apple's earbud height
    const d = tipC.clone().sub(c); d.y = 0; d.normalize();
    const R = new THREE.Quaternion().setFromUnitVectors(d, new THREE.Vector3(0, 0, 1));   // tip turned to face the viewer when out
    const H = side === 'R' ? HEAD.clone() : new THREE.Vector3(2 * CASE.x - HEAD.x, HEAD.y, HEAD.z);
    // bake the out pose: x_out = H + R·s·(x − c); seated pose = c + s·(x − c) = c' + R⁻¹(x_out − H)
    const A = new THREE.Matrix4().makeTranslation(H.x, H.y, H.z).multiply(new THREE.Matrix4().makeRotationFromQuaternion(R)).multiply(new THREE.Matrix4().makeScale(s, s, s)).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z));
    const grp = side === 'R' ? null : new THREE.Group();
    pieces.forEach(b => { b.geo.applyMatrix4(A); b.geo.computeVertexNormals(); const m = new THREE.Mesh(b.geo, fixMat(b.o.material));
      if (side === 'R') (b.isTip ? TIP_G : SHELL_G).add(m); else grp.add(m); });
    if (grp) { CASE_G.add(grp); LEFT_BUD = grp; }
    pose[side] = { h: H, c: c, q: R.clone().invert() };
  }
  MODEL = { R: pose.R, L: pose.L };
  window.__shellG = SHELL_G; window.__anchors = () => {   // measured on the real right earbud, in the out-pose frame
    const pts = []; const v = new THREE.Vector3();
    SHELL_G.children.forEach(o => { if (!o.visible || !o.geometry) return; const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i += 2) pts.push(v.fromBufferAttribute(pa, i).clone()); });
    const bb = new THREE.Box3().setFromPoints(pts); const out = { bb: [bb.min.toArray().map(x => +x.toFixed(2)), bb.max.toArray().map(x => +x.toFixed(2))], slices: [] };
    for (let y = Math.floor(bb.min.y); y <= bb.max.y; y += 2) { const s = pts.filter(p => Math.abs(p.y - y) < 0.6); if (!s.length) continue; const b2 = new THREE.Box3().setFromPoints(s);
      out.slices.push([y, +b2.min.x.toFixed(1), +b2.max.x.toFixed(1), +b2.min.z.toFixed(1), +b2.max.z.toFixed(1)]); }
    const tb = new THREE.Box3(); TIP_G.children.forEach(o => { if (o.visible && o.geometry) tb.expandByObject(o); }); out.tip = [tb.min.toArray().map(x => +x.toFixed(1)), tb.max.toArray().map(x => +x.toFixed(1))];
    return out;
  };
  // heart-rate module onto the real shell: cast from outside toward the head centre along its direction
  if (SENSOR_MOUNT) { SHELL_G.updateMatrixWorld(true); const dir = SENSOR_MOUNT.position.clone().sub(BC).normalize(); const rc = new THREE.Raycaster(BC.clone().addScaledVector(dir, 40), dir.clone().negate());
    const hit = rc.intersectObjects(SHELL_G.children.filter(o => o.visible), false)[0]; if (hit) { SENSOR_MOUNT.position.copy(hit.point).addScaledVector(hit.face.normal, -0.35); SENSOR_MOUNT.lookAt(hit.point.clone().add(hit.face.normal)); } }
  // speaker holes + USB-C on the real underside (cast up from below)
  CASE_G.updateMatrixWorld(true); const body = CASE_G.children.filter(o => o.isMesh && o.visible && !o.userData.keep);
  const under2 = (x, z) => { const h = new THREE.Raycaster(new THREE.Vector3(x, CASE.y - 60, z), new THREE.Vector3(0, 1, 0)).intersectObjects(body, false)[0]; return h ? h.point.y : null; };
  const yb = under2(CASE.x, CASE.z);
  if (yb !== null) {
    const port = mesh(new THREE.ShapeGeometry(rrShape(8.9, 3.0, 1.5), 16), std(0x1d1f23, 0.5, 0.4), CASE.x, yb - 0.05, CASE.z, CASE_G); port.rotation.x = Math.PI / 2;
    for (const i of [-3, -2, 2, 3]) { const y = under2(CASE.x + i * 2.6, CASE.z); if (y === null) continue; const h = mesh(new THREE.CircleGeometry(0.45, 20), GRILLE(), CASE.x + i * 2.6, y - 0.04, CASE.z, CASE_G); h.rotation.x = Math.PI / 2; }
  }
  parts.forEach(p => p.group.traverse(o => { if (o.isMesh) { o.userData.part = p; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.userData.baseOpacity === undefined) { m.userData.baseOpacity = m.opacity; m.userData.baseTransparent = m.transparent; m.userData.baseDepthWrite = m.depthWrite; } }); } }));
  MODEL_READY = true;
}, err => { console.error('model', err); MODEL_READY = true; });
'''
a = src.index('/* ---------------- Phone dimensions (mm) ---------------- */')
b = src.index('/* ---------------- View / state ---------------- */')
src = src[:a] + build + src[b:]

reps = [
 ('<title>iPhone Teardown Explorer</title>', '<title>AirPods Pro 3 Teardown Explorer</title>'),
 ('aria-label="3D exploded view of a smartphone.', 'aria-label="3D exploded view of an AirPods Pro 3 earbud.'),
 ('Teardown · 11 layers · 8.25 mm', 'Teardown · 10 parts · 5.55 g'),
 ('<h1>Inside a modern iPhone</h1>', '<h1>Inside AirPods Pro 3</h1>'),
 ('<h2 id="tc-title">Inside a modern iPhone</h2>', '<h2 id="tc-title">Inside AirPods Pro 3</h2>'),
 ('<p id="tc-sub">Eleven layers, front to back, explained.</p>', '<p id="tc-sub">One earbud, ten parts, explained.</p>'),
 ('Layers, front to back', 'Parts, tip to stem'),
 ('aria-label="Phone layers"', 'aria-label="AirPods parts"'),
 ("intro: ['Teardown', 'Inside a modern iPhone', 'Eleven layers, front to back, explained.'],", "intro: ['Teardown', 'Inside AirPods Pro 3', 'One earbud, ten parts, explained.'],"),
 ("outro: ['8.25 millimetres', 'Everything, stacked.', 'Glass, display, Face ID, frame, logic board, battery, haptics, audio, cameras, MagSafe and back glass.'],",
  "outro: ['5.55 grams', 'A computer in your ear.', 'Driver, amplifier, battery, three microphones, two accelerometers, a heart-rate sensor and the H2 chip, glued into a shell smaller than a grape.'],"),
 ("const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.92, el: 0.26, dist: 390, shift: 0 };", "const OVERVIEW = { target: new THREE.Vector3(-1, 0, 2), az: -0.6, el: 0.18, dist: 175, shift: 0 };"),
 ("const ASSEMBLED = { target: new THREE.Vector3(0, 0, 0), az: 0.45, el: 0.12, dist: 330, shift: 0 };", ""),
 ("const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 70);", "const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 28);"),
 ("pose: t => ({ target: new THREE.Vector3(0, 0, 0), az: -0.5 + 0.85 * t, el: 0.1, dist: 300, shift: 0.85 })", "pose: t => ({ target: new THREE.Vector3(-11.6, -12, 0), az: -0.2 + 0.4 * t, el: 0.46, dist: 205, shift: 0.85 })"),
 ("{ target: new THREE.Vector3(0, 0, 0), az: 0.35, el: 0.1, dist: 300, shift: 0.85 }, OVERVIEW", "{ target: new THREE.Vector3(-11.6, -12, 0), az: 0.2, el: 0.46, dist: 205, shift: 0.85 }, OVERVIEW"),
 ("az: 1.45 + 2.2 * ease(t), el: 0.14, dist: 330, shift: 0.85 * ease(t) })", "az: 1.45 + 2.0 * ease(t), el: 0.22, dist: 210, shift: 0.85 * ease(t) })"),
 ("{ dist: 450, shift: -0.4 } : { dist: 760, shift: 0.15 }", "{ dist: 300, shift: -0.4 } : { dist: 470, shift: 0.15 }"),
 ("goal.dist = Math.max(40, Math.min(900, dist0 * pinch0 / d))", "goal.dist = Math.max(18, Math.min(700, dist0 * pinch0 / d))"),
 ("goal.dist = Math.max(40, Math.min(900, goal.dist * Math.exp(e.deltaY * 0.0012)))", "goal.dist = Math.max(18, Math.min(700, goal.dist * Math.exp(e.deltaY * 0.0012)))"),
 ("new THREE.PerspectiveCamera(30, 1, 1, 4000)", "new THREE.PerspectiveCamera(30, 1, 0.5, 2000)"),
 ("'  ·  Layer'", "'  ·  Part'"),
 ("Illustrative model built from public teardown layouts. Proportions are approximate and specs vary by model.", "Illustrative model of AirPods Pro 3 built from Apple’s specs and the iFixit and Lumafield teardowns. Internal proportions are approximate. Case and earbud model: “AirPods Pro” by Jed Falcone (sketchfab.com/jedlas012), CC-BY 4.0. Not affiliated with Apple."),
]
for x, y in reps:
    assert src.count(x) == 1, x
    src = src.replace(x, y)
src = src.replace("target: new THREE.Vector3(0, 0, 0), az: 1.45", "target: new THREE.Vector3(-11.6, -10, 0), az: 1.45")

src = src.replace("function applyExplode(e) { parts.forEach(p => p.group.position.copy(p.offset).multiplyScalar(e)); }",
                  "function applyExplode(e) { parts.forEach(p => p.group.position.copy(p.offset).multiplyScalar(e)); applyExtras(e); }")
src = src.replace("explode += (goalExplode - explode) * k; applyExplode(explode);",
                  "CTRL.lid += (CTRL.lidGoal - CTRL.lid) * k; CTRL.out += (CTRL.outGoal - CTRL.out) * k; explode += (goalExplode - explode) * k; applyExplode(explode);")
src = src.replace('<input type="range" id="explode" min="0" max="1" step="0.01" value="1">',
                  '<input type="range" id="explode" min="0" max="1" step="0.01" value="1">\n    <button class="btn" id="lidBtn" type="button">Close lid</button>\n    <button class="btn" id="budBtn" type="button">Buds in</button>')
src = src.replace("slider.addEventListener('input', () => { stopTour(); goalExplode = +slider.value; });",
  """slider.addEventListener('input', () => { stopTour(); goalExplode = +slider.value; });
const lidBtn = document.getElementById('lidBtn'), budBtn = document.getElementById('budBtn');
function showOnCase() { select(-1); goalExplode = 0; slider.value = 0; goal = { target: new THREE.Vector3(-11.6, -12, 0), az: 0.25, el: 0.42, dist: 205, shift: 0 }; }
let seqTimer = 0;
function labels() { lidBtn.textContent = CTRL.lidGoal ? 'Close lid' : 'Open lid'; budBtn.textContent = CTRL.outGoal ? 'Buds in' : 'Buds out'; }
lidBtn.addEventListener('click', () => {
  showOnCase(); clearTimeout(seqTimer);
  if (CTRL.lidGoal) { const wait = CTRL.out > 0.05 ? 700 : 0; CTRL.outGoal = 0; seqTimer = setTimeout(() => { CTRL.lidGoal = 0; labels(); }, wait); }   // buds drop in, then the lid shuts
  else CTRL.lidGoal = 1;
  labels();
});
budBtn.addEventListener('click', () => {
  showOnCase(); clearTimeout(seqTimer);
  if (CTRL.outGoal) CTRL.outGoal = 0;
  else { const wait = CTRL.lid < 0.95 ? 650 : 0; CTRL.lidGoal = 1; seqTimer = setTimeout(() => { CTRL.outGoal = 1; labels(); }, wait); }   // open first, then lift the buds out
  labels();
});""")
for need in ["applyExtras(e); }", "CTRL.lid += (CTRL.lidGoal", 'id="lidBtn"', "budBtn.addEventListener"]:
    assert need in src, need
src = src.replace("function applyState(st) {", "function applyState(st) { if (POSE_OV) st.pose = Object.assign({}, st.pose, POSE_OV);")
assert "if (POSE_OV)" in src

model_data = open('assets/airpods-pro-model.compact.js').read()
src = src.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>' + model_data + '</script>', 1)
assert 'window.AIRPODS_COMPACT=' in src
# brighter studio environment, same as the AirTag page
env = open('build-airtag.py').read()
env = env[env.index('env = r"""') + 10: env.index('"""', env.index('env = r"""') + 10)]
i = src.index('(function makeEnv() {'); j = src.index('})();', i) + 5
src = src[:i] + env + src[j:]
for a, b in [("new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.55)", "new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.35)"),
             ("new THREE.DirectionalLight(0xffffff, 1.5); key.position", "new THREE.DirectionalLight(0xffffff, 1.0); key.position")]:
    assert src.count(a) == 1, a; src = src.replace(a, b)
open('airpods-pro-3-teardown.html', 'w').write(src)
print('ok')
