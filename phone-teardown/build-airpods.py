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
  lid: { name: 'Lid and hinge', role: 'Opens with a flick, snaps shut.',
    body: 'The lid swings on a small metal hinge at the back of the case. Magnets pull it closed and hold it there, and opening it next to your iPhone is what wakes the case up to connect.',
    specs: ['Metal hinge', 'Magnetic close', 'Opening triggers pairing pop-up'] },
  wells: { name: 'Charging wells', role: 'Where the earbuds sleep and charge.',
    body: 'Two moulded wells hold each earbud in exactly the right spot. Magnets pull the buds in, and small spring-loaded pins at the bottom of each well press on the metal contacts at the tip of the stem to charge them.',
    specs: ['Holds both earbuds', 'Magnets seat each bud', 'Spring pins touch the stem contacts'] },
  caseBattery: { name: 'Case battery', role: 'One big cell that refills the buds.',
    body: 'A single 1.334 watt-hour cell fills the middle of the case. AirPods Pro 2 used two cells here; Pro 3 uses one. With the case, Apple quotes up to 24 hours of listening.',
    specs: ['One 1.334 Wh cell', 'Pro 2 had two cells', 'Up to 24 h listening with the case'] },
  caseBoard: { name: 'Charging board', role: 'Manages charging, and lets your iPhone find it.',
    body: 'This board controls charging for the case and both earbuds. It also carries a second-generation Ultra Wideband chip, so your iPhone can point you to the case with Precision Finding in the Find My app.',
    specs: ['Charging control', 'Ultra Wideband chip (2nd gen)', 'Precision Finding with Find My'] },
  coil: { name: 'MagSafe coil and magnets', role: 'Charges without a cable.',
    body: 'A flat copper coil picks up power from a wireless charger. A ring of magnets around it snaps the case onto MagSafe and Qi2 chargers. iFixit found the magnets were rearranged on Pro 3 to support both.',
    specs: ['Wireless charging coil', 'MagSafe and Qi2', 'Also charges on an Apple Watch charger'] },
  caseSpeaker: { name: 'Case speaker', role: 'Makes the case findable by sound.',
    body: 'A tiny speaker inside the case can play a sound through the holes on the bottom, so you can find it in Find My, and it chimes when charging starts or the battery is low.',
    specs: ['Plays Find My sounds', 'Charging and low-battery chimes', 'Speaker holes underneath'] },
  usbc: { name: 'USB-C port', role: 'The wired way in.',
    body: 'A USB-C port on the bottom charges the case with the same cable as an iPhone, iPad or Mac.',
    specs: ['USB-C', 'Same cable as iPhone 15 and later', 'On the bottom of the case'] },
  caseShell: { name: 'Case shell', role: 'The pebble that holds it all.',
    body: 'The outer shell is glossy white plastic with a status light on the front, a lanyard loop on the side and speaker holes underneath. The whole case is rated IP57 for sweat and water.',
    specs: ['47.2 × 62.2 × 21.8 mm, 43.99 g', 'IP57', 'Status light and lanyard loop'] },
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
  const side = std(0x0c0d10, 0.4, 0.4);
  const top = new THREE.MeshStandardMaterial({ map: labelTex(lines, '#0e0f12', '#d9dde3'), metalness: 0.35, roughness: 0.32 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), [side, side, side, side, top, side]);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0); g.add(m); return m;
}
const ell = (rx, ry, rz, mat, x, y, z, parent, seg = 64) => { const m = mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)), mat, x, y, z, parent); m.scale.set(rx, ry, rz); return m; };
const yCyl = (r, len, mat, x, y, z, parent, seg = 40) => mesh(new THREE.CylinderGeometry(r, r, len, seg), mat, x, y, z, parent);
const WHITE = () => phys({ color: 0xf5f5f3, metalness: 0, roughness: 0.38, clearcoat: 0.65, clearcoatRoughness: 0.14, sheen: new THREE.Color(0xffffff), envMapIntensity: 0.9 });
const GRILLE = () => std(0x1a1b1f, 0.4, 0.55);
const GOLD = () => std(0xd2a94e, 1, 0.3);
const FLEX = () => std(0xc98a34, 0.45, 0.35, { side: THREE.DoubleSide });
const SILVER = () => std(0xd5d9de, 1, 0.16);
const meshTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#26282d'; x.fillRect(0, 0, w, h); x.fillStyle = '#4d5058'; for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { x.beginPath(); x.arc(i * 8 + (j % 2) * 4 + 2, j * 8 + 2, 1.6, 0, Math.PI * 2); x.fill(); } });
meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(2, 2);
const MESH = () => std(0xd8dade, 0.25, 0.55, { map: meshTex });

/* lid + bud controls */
const CTRL = { lid: 1, lidGoal: 1, out: 1, outGoal: 1 };
const POSE_OV = (() => { const q = new URLSearchParams(location.search).get('pose'); if (!q) return null; const [az, el, dist, tx, ty, tz] = q.split(',').map(Number); return { az, el, dist, target: new THREE.Vector3(tx, ty, tz), shift: 0 }; })();
{ const q = new URLSearchParams(location.search).get('state') || ''; if (q.includes('closed')) CTRL.lid = CTRL.lidGoal = 0; if (q.includes('in')) CTRL.out = CTRL.outGoal = 0; }
let LID_HINGE = null, LEFT_BUD = null, LEFT_X = 0, LEFT_Y = 0, LEFT_Z = 0, TIP_G = null, SHELL_G = null, CASE_G = null, SENSOR_WIN = null, MODEL = null, COIL_C = null; const LANYARD = [];
const BUD_IDS = new Set(['tip', 'sensor', 'inmic', 'driver', 'battery', 'accel', 'topmic', 'shell', 'h2', 'stembase']), CASE_INTERNAL = new Set(['caseBattery', 'caseBoard', 'coil', 'caseSpeaker', 'usbc']);
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
    parts.forEach(p => { if (BUD_IDS.has(p.id)) seat(p.group, MODEL.R, inn, p.group.position.clone()); });
    const asm = e < 0.04;
    parts.forEach(p => { const mine = (p.grp || 'bud') === MODE, internal = INTERNAL.has(p.id) || CASE_INTERNAL.has(p.id);
      p.group.visible = internal ? (!asm && mine) : (asm || mine); });
    seat(LEFT_BUD, MODEL.L, inL, new THREE.Vector3());
  } else {
    parts.forEach(p => { if (BUD_IDS.has(p.id)) { p.group.position.y += BUD_DROP * inn; p.group.position.z += BUD_BACK * inn; p.group.position.x += BUD_SPREAD * inn; rotAbout(p.group, HEAD, BUD_TILT * inn, -BUD_TURN * inn); } });
    if (LEFT_BUD) { LEFT_BUD.position.set(LEFT_X - BUD_SPREAD * inL, LEFT_Y + BUD_DROP * inL, LEFT_Z + BUD_BACK * inL); rotAbout(LEFT_BUD, HEAD, BUD_TILT * inL, BUD_TURN * inL); }
  }
  if (LID_HINGE) LID_HINGE.rotation.x = -1.92 * CTRL.lid;
  if (COIL_C) COIL_C.rotation.y = Math.PI * Math.min(1, Math.max(0, (e - 0.15) / 0.6)); // show the copper side once exploded
  if (LEFT_DECOR) LEFT_DECOR.visible = e < 0.04;
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
const PCB = () => std(0x111620, 0.35, 0.38);
let SENSOR_MOUNT = null;
function smd(parent, w, h, z, n, seed, keepOut = []) {   // tiny resistors / capacitors / ICs scattered on a board face
  const r = rng(seed), im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff, 0.45, 0.4), n), M4 = new THREE.Matrix4(), col = new THREE.Color();
  const cols = [0xb08d5f, 0x16171a, 0xc9ccd1, 0x8a6a44, 0x2a2c30]; let k = 0, guard = 0;
  while (k < n && guard++ < n * 20) {
    const x = (r() - 0.5) * (w - 0.6), y = (r() - 0.5) * (h - 0.6);
    if (keepOut.some(([cx, cy, cw, ch]) => Math.abs(x - cx) < cw / 2 + 0.25 && Math.abs(y - cy) < ch / 2 + 0.25)) continue;
    const big = r() > 0.85, sx = big ? 0.6 + r() * 0.5 : 0.25 + r() * 0.25, sy = big ? 0.5 + r() * 0.4 : 0.15 + r() * 0.15, t = big ? 0.25 : 0.15;
    M4.makeScale(r() > 0.5 ? sx : sy, r() > 0.5 ? sy : sx, t); M4.setPosition(x, y, z + t / 2); im.setMatrixAt(k, M4);
    im.setColorAt(k, col.setHex(big ? 0x16171a : cols[(r() * cols.length) | 0])); k++;
  }
  im.count = k; parent.add(im); return im;
}

/* 1. Ear tip (the real model's tip) */
addPart('tip', [-0.5, -8.6, 22.4], { az: 0.75, el: 0.2, k: 1.7 }, [4.8, 3.0, 9.0], g => { TIP_G = g; tipMesh(g); });

/* 2. Heart-rate sensor: IR LED (wire-bonded die) above a photodetector, behind an IR window */
addPart('sensor', [-18, -5, 12], { az: 0.25, el: 0.15, k: 2.6 }, [-4.6, 2.2, 6.0], g => {
  const m = grp(g, new THREE.Vector3(-4.2, 2.4, 5.6), new THREE.Vector3(-0.55, -0.35, 0.76)); SENSOR_MOUNT = m;
  const glass = phys({ color: 0x07080b, metalness: 0.1, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.82 });
  ell(2.5, 1.6, 0.28, glass, 0, 0, 0.35, m, 40);                                   // IR window
  box(3.4, 2.6, 0.3, PCB(), 0, 0, -0.35, m); smd(m, 3.2, 2.4, -0.2, 10, 21, [[-0.7, 0.2, 0.8, 0.8], [0.7, -0.25, 1.4, 1.4], [0.9, 0.85, 0.7, 0.7]]);   // module board
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
  box(5.0, 3.0, 0.1, FLEX(), 0, 0, -0.1, a); smd(a, 4.8, 2.8, -0.05, 12, 41, [[-1.2, 0, 1.8, 1.8], [1.2, 0, 1.8, 1.8]]);
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
  box(3.0, 11.5, 0.45, PCB(), 0, 0, 0, sg); smd(sg, 2.8, 11.3, 0.23, 40, 33, [[0, 4, 2.8, 3.2], [0, 0.4, 2.8, 2.6], [0, -3.4, 2.8, 2.6]]);   // rigid-flex spine
  const mods = [['H2', 4.0], ['BGA', 0.4], ['BGA', -3.4]];
  mods.forEach(([l, y], i) => chipOn(sg, 2.6, i ? 2.4 : 3.0, 0.9, [[l, i ? 56 : 86]], 0, y, 0.68));
  box(0.3, 11, 0.1, GOLD(), -1.35, 0, -0.3, sg);                                      // antenna trace
  box(2.4, 1.6, 0.5, std(0xc4c8ce, 0.95, 0.22), 0, -5.2, 0.48, sg);                  // RF shield can
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
const CTOP = CASE.y + BODY_H / 2, CCY = CASE.y + BODY_H / 2 - SEAM;
const CX = 76;   // case parts explode beside the earbud, stacked top to bottom like Apple's exploded photos
let LID_P = null, WELLS_P = null, LEFT_DECOR = null;

/* 11. Lid and hinge */
addPart('lid', [CX, 46, 0], { az: 0.35, el: 0.35, k: 1.3 }, [CASE.x - 26, CTOP + 12, CASE.z - 4], g => {
  LID_P = g; const hinge = new THREE.Group(); hinge.position.set(CASE.x, CTOP, CASE.z - PC + 2.0); hinge.rotation.x = -1.92; g.add(hinge); LID_HINGE = hinge;
  const lidGeo = pebble(PA, PB, PC, E1, E2, SEAM, PB); lidGeo.translate(0, -SEAM, PC - 2.0);
  mesh(lidGeo, WHITE(), 0, 0.05, 0, hinge).userData.proc = true;
});

/* 12. Charging wells (inner liner) with the charging pins */
addPart('wells', [CX, 26, 0], { az: 0.3, el: 0.75, k: 1.3 }, [CASE.x + 27, CTOP, CASE.z + 4], g => {
  WELLS_P = g;
  const liner = mesh(pebble(PA * 0.97, PB, PC * 0.93, E1, E2, SEAM - 9, SEAM), std(0xeceef0, 0, 0.42), CASE.x, CCY, CASE.z, g); liner.userData.proc = true;
  for (const sx of [-1, 1]) {
    const pin = std(0xd9b45c, 1, 0.22);
    for (const dx of [-0.9, 0.9]) mesh(cyl(0.45, 1.6, 16), pin, CASE.x + sx * 13.4 + dx, CTOP - 21, CASE.z + 0.6, g).rotation.x = Math.PI / 2;   // pogo pins at the bottom of each well
  }
  box(11, 0.9, 1.4, SILVER(), CASE.x, CTOP + 0.25, CASE.z - PC + 2.2, g).userData.proc = true;
});

/* 13. Case battery: one 1.334 Wh cell (Pro 2 used two) */
addPart('caseBattery', [CX, 10, 0], { az: 0.4, el: 0.3, k: 1.6 }, [CASE.x + 21, CASE.y - 4, CASE.z + 3], g => {
  const c = new THREE.Group(); c.position.set(CASE.x, CASE.y - 4, CASE.z - 1.5); g.add(c);
  mesh(extrude(rrShape(38, 9.5, 2.2), 6.0, 0.6, 16), std(0x0b0c0e, 0.0, 0.6, { envMapIntensity: 0.35 }), 0, 0, 0, c);
  box(1.4, 8.6, 6.2, std(0xc9a14e, 1, 0.25), -19.4, 0, 0, c); box(1.4, 8.6, 6.2, std(0xc9a14e, 1, 0.25), 19.4, 0, 0, c);   // gold end caps
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(22, 6), new THREE.MeshStandardMaterial({ map: labelTex([['1.334 Wh', 64], ['Li-ion', 34]], '#0b0c0e', '#cfd3d9', 512, 140), metalness: 0.0, roughness: 0.6, envMapIntensity: 0.35 }));
  lb.position.z = 3.05; c.add(lb);
  box(4.0, 2.2, 0.15, FLEX(), 21.6, 2.2, 1.5, c);
});

/* 14. Charging board with the 2nd-gen Ultra Wideband chip */
addPart('caseBoard', [CX, -4, 0], { az: 0.35, el: 0.55, k: 1.5 }, [CASE.x - 22, CASE.y - 12, CASE.z + 2], g => {
  const b = new THREE.Group(); b.position.set(CASE.x, CASE.y - 12, CASE.z - 1); b.rotation.x = -Math.PI / 2 + 0.2; g.add(b);
  box(46, 11, 1.0, PCB(), 0, 0, 0, b);
  chipOn(b, 5.0, 5.0, 0.8, [['U2', 92], ['UWB', 38]], -12, 0.5, 0.9);
  chipOn(b, 4.4, 3.6, 0.7, [['CHG', 64]], 1, 1.4, 0.85);
  chipOn(b, 3.4, 3.4, 0.7, [['BLE', 64]], 10, 0.8, 0.85);
  box(5.2, 3.6, 0.7, std(0xc4c8ce, 0.95, 0.22), -3.5, -2.6, 0.85, b);   // shield can
  smd(b, 45, 10.5, 0.5, 120, 77, [[-12, 0.5, 5.2, 5.2], [1, 1.4, 4.6, 3.8], [10, 0.8, 3.6, 3.6], [-3.5, -2.6, 5.4, 3.8]]);
  const edge = std(0xd9b45c, 1, 0.22); for (let i = 0; i < 18; i++) box(0.8, 0.5, 0.06, edge, -20 + i * 2.35, -5.1, 0.53, b);   // gold edge pads
});

/* 15. MagSafe / Qi2 coil and magnet ring */
addPart('coil', [CX, -18, -6], { az: 0.25, el: 0.2, k: 1.6 }, [CASE.x + 14, CASE.y + 4, CASE.z - 9], g => {
  const c = new THREE.Group(); c.position.set(CASE.x, CASE.y + 1, CASE.z - 8.4); g.add(c); COIL_C = c;
  const copper = std(0xd2864a, 1, 0.26, { envMapIntensity: 1.2 }), copperDk = std(0xa8612f, 1, 0.34);
  for (let i = 0; i < 18; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.36, 0.2, 8, 96), i % 2 ? copperDk : copper); t.position.z = -0.05; c.add(t); }
  mesh(cyl(1.4, 0.2, 32), std(0x15171b, 0.3, 0.6), 0, 0, -0.02, c);     // centre hub
  box(0.8, 5.0, 0.25, copper, 8.7, -4.6, -0.05, c);                                              // lead-out tabs
  box(0.8, 5.0, 0.25, copperDk, 9.6, -4.6, -0.05, c);
  mesh(cyl(9.2, 0.3, 64), std(0x15171b, 0.3, 0.6), 0, 0, 0.45, c);                     // ferrite backing (inside face)
  const mag = std(0x9aa0a8, 0.95, 0.25);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const m = box(2.4, 1.3, 0.9, mag, Math.cos(a) * 11.4, Math.sin(a) * 11.4, 0.2, c); m.rotation.z = a + Math.PI / 2; }
});

/* 16. Case speaker (Find My sounds) */
addPart('caseSpeaker', [CX + 30, -30, 16], { az: 0.6, el: 0.3, k: 2.4 }, [CASE.x + 22, CASE.y - 10, CASE.z + 4], g => {
  const c = new THREE.Group(); c.position.set(CASE.x + 18, CASE.y - 11, CASE.z + 0.5); g.add(c);
  box(7.2, 4.4, 5.6, std(0x0b0c0e, 0.0, 0.6, { envMapIntensity: 0.35 }), 0, 0, 0, c);
  mesh(cyl(1.9, 0.3, 32), std(0x0d0e10, 0.2, 0.6), 0, -2.3, 0, c).rotation.x = Math.PI / 2;
  ell(1.6, 0.2, 1.6, std(0xc4c8ce, 0.9, 0.25), 0, -2.45, 0, c, 24);
  box(2.0, 0.4, 3.6, std(0xd9b45c, 1, 0.22), 4.2, 1.0, 0, c);
});

/* 17. USB-C port */
addPart('usbc', [CX - 30, -30, 16], { az: 0.3, el: -0.35, k: 2.6 }, [CASE.x - 6, CASE.y - 14, CASE.z + 4], g => {
  const c = new THREE.Group(); c.position.set(CASE.x, CASE.y - 12.4, CASE.z); g.add(c);
  const shell = mesh(extrude(rrShape(8.9, 3.2, 1.6), 7.0, 0.2, 24), std(0xd5d9de, 1, 0.18), 0, 0, 0, c); shell.rotation.x = Math.PI / 2;
  const tongue = box(6.6, 5.8, 0.7, std(0x15171b, 0.3, 0.5), 0, 0.2, 0, c);
  for (let i = 0; i < 12; i++) box(0.25, 2.6, 0.75, std(0xd9b45c, 1, 0.22), -2.75 + i * 0.5, -1.4, 0, c);
  box(12, 1.0, 6, PCB(), 0, 4.2, 0, c);
});

/* 18. Case shell (with status light, lanyard loop, speaker holes) */
addPart('caseShell', [CX, -52, 0], { az: -0.4, el: 0.3, k: 1.25 }, [CASE.x - 26, CASE.y - 6, CASE.z + PC], g => {
  CASE_G = g;
  mesh(pebble(PA, PB, PC, E1, E2, -PB, SEAM), WHITE(), CASE.x, CCY, CASE.z, g).userData.proc = true;
  const sl = mesh(pebble(PA * 1.003, PB, PC * 1.006, E1, E2, SEAM - 0.26, SEAM - 0.04), std(0x9aa0a8, 0, 0.6), CASE.x, CCY, CASE.z, g); sl.userData.proc = true;
  ell(0.6, 0.6, 0.2, std(0x1a1d22, 0.2, 0.3, { emissive: 0x2fbf5a, emissiveIntensity: 1.1 }), CASE.x, CASE.y + 3, CASE.z + PC - 0.02, g, 24).userData.proc = true;
  const lp = mesh(extrude(rrShape(2.6, 6.0, 1.3), 0.6, 0.2, 16), std(0xd9dce0, 0.8, 0.25), CASE.x + PA - 0.35, CASE.y + 1, CASE.z, g); lp.rotation.y = Math.PI / 2; lp.userData.keep = true; LANYARD.push(lp);
  for (const dy of [1.45, -1.45]) { const h = mesh(cyl(0.7, 0.9, 24), std(0x3a3d42, 0.4, 0.5), CASE.x + PA - 0.1, CASE.y + 1 + dy, CASE.z, g); h.rotation.y = Math.PI / 2; h.userData.keep = true; LANYARD.push(h); }
});

/* left earbud: scenery above / in the case, hidden once things are exploded */
LEFT_DECOR = decor(g => {
  const left = new THREE.Group(); budOuter(left, true);
  left.scale.set(-1, 1, 1); left.position.set(CASE.x * 2 - 0.0, 0, 0); g.add(left);
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
  [CASE_G, LID_P, WELLS_P].forEach(g => g.traverse(o => { if (o.userData.proc) o.visible = false; }));
  LEFT_BUD.children.forEach(o => o.visible = false);

  /* case body (no back pairing button: AirPods Pro 3 has none) + lid on its hinge */
  meshesUnder(caseNode).forEach(o => {
    if (under(o, lidNode)) return;
    const bb = new THREE.Box3().setFromObject(o);
    if (o.name.startsWith('Cylinder_2') || (bb.max.z < cb.min.z + 0.15 && bb.max.x - bb.min.x < 1)) return;   // back button
    const geo = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(W);
    const m = new THREE.Mesh(geo, fixMat(o.material)); m.userData.model = true;
    (o.name.startsWith('Boole_1_3') || o.name.startsWith('Subdivision_Surface_4') ? WELLS_P : CASE_G).add(m);
  });
  const pivot = new THREE.Vector3(Om.x, seamM, cb.min.z + 0.06).applyMatrix4(W);
  const hinge = LID_HINGE; hinge.position.copy(pivot);
  meshesUnder(lidNode).forEach(o => { const geo = o.geometry.clone().applyMatrix4(o.matrixWorld).applyMatrix4(W); geo.translate(-pivot.x, -pivot.y, -pivot.z); hinge.add(new THREE.Mesh(geo, fixMat(o.material))); });

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
    if (grp) { LEFT_DECOR.add(grp); LEFT_BUD = grp; }
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
  CASE_G.updateMatrixWorld(true); const body = CASE_G.children.filter(o => o.isMesh && o.userData.model);
  const under2 = (x, z) => { const h = new THREE.Raycaster(new THREE.Vector3(x, CASE.y - 60, z), new THREE.Vector3(0, 1, 0)).intersectObjects(body, false)[0]; return h ? h.point.y : null; };
  const yb = under2(CASE.x, CASE.z);
  if (yb !== null) {
    const port = mesh(new THREE.ShapeGeometry(rrShape(8.9, 3.0, 1.5), 16), std(0x1d1f23, 0.5, 0.4), CASE.x, yb - 0.05, CASE.z, CASE_G); port.rotation.x = Math.PI / 2;
    for (const i of [-3, -2, 2, 3]) { const y = under2(CASE.x + i * 2.6, CASE.z); if (y === null) continue; const h = mesh(new THREE.CircleGeometry(0.45, 20), GRILLE(), CASE.x + i * 2.6, y - 0.04, CASE.z, CASE_G); h.rotation.x = Math.PI / 2; }
  }
  parts.forEach(p => p.group.traverse(o => { if (o.isMesh) { o.userData.part = p; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.userData.baseOpacity === undefined) { m.userData.baseOpacity = m.opacity; m.userData.baseTransparent = m.transparent; m.userData.baseDepthWrite = m.depthWrite; } }); } }));
  MODEL_READY = true;
}, err => { console.error('model', err); MODEL_READY = true; });

/* ---------------- Exploded layout: earbud in one row (tip → housing), case in one column (lid → shell) ---------------- */
let MODE = 'bud';
const BUD_ROW = ['tip', 'inmic', 'driver', 'sensor', 'topmic', 'accel', 'battery', 'h2', 'stembase', 'shell'];
const CASE_COL = ['lid', 'wells', 'caseBattery', 'caseBoard', 'coil', ['usbc', 'caseSpeaker'], 'caseShell'];
const byId = id => parts.find(p => p.id === id);
parts.forEach(p => { p.grp = BUD_IDS.has(p.id) ? 'bud' : 'case'; const b = new THREE.Box3().setFromObject(p.group); p.size = b.getSize(new THREE.Vector3()); p.bc = b.getCenter(new THREE.Vector3()); });
const OV_BUD = { target: new THREE.Vector3(), az: 0.18, el: 0.1, dist: 260, shift: 0 }, OV_CASE = { target: new THREE.Vector3(), az: 0.32, el: 0.14, dist: 300, shift: 0 };
let BUD_VERT = null;
function layoutBud(vert) { // earbud parts in assembly order: a column on tall screens, a 2 x 5 grid on wide ones
  if (vert === BUD_VERT) return; BUD_VERT = vert;
  const H = byId('shell').bc, place = (p, x, y) => p.offset.set(x - p.bc.x, y - p.bc.y, -p.bc.z);
  if (vert) {
    const MIN = 14, GAP = 5, pos = {}; let c = 0, prev = null;
    for (let i = BUD_ROW.length - 1; i >= 0; i--) { const p = byId(BUD_ROW[i]), half = q => q.size.y / 2;
      c = prev ? c - Math.max(half(prev) + half(p) + GAP, MIN) : 0; pos[p.id] = c; prev = p; }
    BUD_ROW.forEach((id, k) => place(byId(id), H.x + (id === 'shell' ? 0 : (k % 2 ? 4 : -4)), H.y - pos[id]));
    const span = -pos[BUD_ROW[0]];
    OV_BUD.target.set(H.x, H.y + span / 2 - 5, 0); OV_BUD.dist = (span + 32) * 1.3 + 30; OV_BUD.az = 0.2; OV_BUD.el = 0.08;
  } else {
    const SX = 34, SY = 40, COLS = 5;
    BUD_ROW.forEach((id, k) => { const col = k % COLS, row = Math.floor(k / COLS);
      place(byId(id), H.x - (COLS - 1 - col) * SX, H.y + (row ? -SY / 2 : SY / 2) + (id === 'shell' ? -2 : 0)); });
    OV_BUD.target.set(H.x - (COLS - 1) * SX / 2 - 4, H.y - 2, 0); OV_BUD.dist = (COLS - 1) * SX * 1.95 + 70; OV_BUD.az = 0.1; OV_BUD.el = 0.12;
  }
}
layoutBud(innerWidth < innerHeight);
addEventListener('resize', () => { const was = BUD_VERT; layoutBud(innerWidth < innerHeight); if (was !== BUD_VERT && MODE === 'bud') { setMode('bud'); if (selected < 0 && !touring) goal = ovI(); } });
{ // case column, top to bottom
  const GAP = 7; let y = CTOP + 46, prevH = 0; let first = true;
  CASE_COL.forEach(entry => {
    const ids = Array.isArray(entry) ? entry : [entry], ps = ids.map(byId), h = Math.max(...ps.map(p => p.size.y));
    y = first ? y : y - (prevH / 2 + h / 2 + GAP); first = false;
    ps.forEach((p, k) => { const xx = ids.length > 1 ? CASE.x + (k ? 1 : -1) * 15 : CASE.x; p.offset.set(xx - p.center.x, y - p.center.y, CASE.z - p.center.z); });
    prevH = h;
  });
  const top = CTOP + 46 + byId('lid').size.y / 2, bot = y - prevH / 2;
  OV_CASE.target.set(CASE.x, (top + bot) / 2 - (top - bot) * 0.06, 0); OV_CASE.dist = (top - bot) * 2.0 + 40;
}
const HERO = { target: new THREE.Vector3(-11.6, -12, 0), az: 0.2, el: 0.24, dist: 205, shift: 0.85 };
function setMode(m) { MODE = m; Object.assign(OVERVIEW, clonePose(m === 'bud' ? OV_BUD : OV_CASE)); const b1 = document.getElementById('budMode'), b2 = document.getElementById('caseMode'); if (b1) { b1.classList.toggle('primary', m === 'bud'); b2.classList.toggle('primary', m === 'case'); } }
'''
a = src.index('/* ---------------- Phone dimensions (mm) ---------------- */')
b = src.index('/* ---------------- View / state ---------------- */')
src = src[:a] + build + src[b:]

reps = [
 ('<title>iPhone Teardown Explorer</title>', '<title>AirPods Pro 3 Teardown Explorer</title>'),
 ('aria-label="3D exploded view of a smartphone.', 'aria-label="3D exploded view of an AirPods Pro 3 earbud and its case.'),
 ('Teardown · 11 layers · 8.25 mm', 'Teardown · 18 parts · earbud + case'),
 ('<h1>Inside a modern iPhone</h1>', '<h1>Inside AirPods Pro 3</h1>'),
 ('<h2 id="tc-title">Inside a modern iPhone</h2>', '<h2 id="tc-title">Inside AirPods Pro 3</h2>'),
 ('<p id="tc-sub">Eleven layers, front to back, explained.</p>', '<p id="tc-sub">Earbud and case, part by part.</p>'),
 ('Layers, front to back', 'Parts, earbud then case'),
 ('aria-label="Phone layers"', 'aria-label="AirPods parts"'),
 ("intro: ['Teardown', 'Inside a modern iPhone', 'Eleven layers, front to back, explained.'],", "intro: ['Teardown', 'Inside AirPods Pro 3', 'Earbud and case, part by part.'],"),
 ("outro: ['8.25 millimetres', 'Everything, stacked.', 'Glass, display, Face ID, frame, logic board, battery, haptics, audio, cameras, MagSafe and back glass.'],",
  "outro: ['5.55 grams', 'A computer in your ear.', 'Driver, amplifier, battery, three microphones, two accelerometers, a heart-rate sensor and the H2 chip, glued into a shell smaller than a grape.'],"),
 ("const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.92, el: 0.26, dist: 390, shift: 0 };", "const OVERVIEW = { target: new THREE.Vector3(30, -16, 0), az: -0.5, el: 0.15, dist: 330, shift: 0 };"),
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

src = src.replace('"const OVERVIEW = { target: new THREE.Vector3(30, -16, 0), az: -0.5, el: 0.15, dist: 330, shift: 0 };"', '')
import re as _re
src = _re.sub(r"const OVERVIEW = \{[^\n]*\};", "const OVERVIEW = clonePose(OV_BUD);", src, count=1)
src = _re.sub(r"const ovI = \(\) => [^\n]*;", "const ovI = () => Object.assign(clonePose(OVERVIEW), { dist: OVERVIEW.dist * (innerWidth > 820 ? 1 : (MODE === 'case' ? 1.4 : 1.6)), shift: innerWidth > 820 ? -0.4 : 0.15 });", src, count=1)
a = src.index("parts.forEach((p, i) => seg({ kind: 'part'")
b = src.index("const TOTAL = tAcc;")
src = src[:a] + """parts.forEach((p, i) => { if (p.grp === 'bud') seg({ kind: 'part', mode: 'bud', dur: PART_DUR, focus: i, explode: () => 1, pose: t => partPose(p, 0.16 * t - 0.08), labels: () => 0, card: true }); });
seg({ kind: 'budClose', mode: 'bud', dur: 3.2, focus: -1, explode: t => 1 - ease(clamp01(t * 1.25)), pose: t => lerpPose(OV_BUD, HERO, ease(t)), labels: () => 0 });
seg({ kind: 'caseExplode', mode: 'case', dur: 4.2, focus: -1, explode: t => ease(clamp01(t * 1.15)), pose: t => lerpPose(HERO, OV_CASE, ease(t)), labels: t => clamp01((t - 0.75) / 0.25) });
seg({ kind: 'caseOverview', mode: 'case', dur: 3.2, focus: -1, explode: () => 1, pose: t => Object.assign(clonePose(OV_CASE), { az: OV_CASE.az + 0.12 * t }), labels: () => 1 });
parts.forEach((p, i) => { if (p.grp === 'case') seg({ kind: 'part', mode: 'case', dur: PART_DUR, focus: i, explode: () => 1, pose: t => partPose(p, 0.16 * t - 0.08), labels: () => 0, card: true }); });
seg({ kind: 'collapse', mode: 'case', dur: 5.5, focus: -1, explode: t => 1 - ease(clamp01(t * 1.4)),
  pose: t => lerpPose(OV_CASE, Object.assign(clonePose(HERO), { az: HERO.az + 6.283 }), ease(t)), labels: () => 0,
  title: t => ['outro', clamp01((t - 0.45) / 0.15)] });
""" + src[b:]
src = src.replace("return { explode: s.explode(u), pose, dims, labels, card: s.card ? s.focus : -1, cardA, title, focus: s.focus };",
                  "return { explode: s.explode(u), pose, dims, labels, card: s.card ? s.focus : -1, cardA, title, focus: s.focus, mode: s.mode || 'bud' };")
src = src.replace("function applyState(st) {", "function applyState(st) { if (st.mode !== MODE) setMode(st.mode);")
src = src.replace("  selected = i;\n", "  selected = i; if (i >= 0 && parts[i].grp !== MODE) setMode(parts[i].grp);\n")
src = src.replace("p.tag.style.visibility = tmpV.z < 1 ? 'visible' : 'hidden';", "p.tag.style.visibility = tmpV.z < 1 && p.group.visible ? 'visible' : 'hidden';")
src = src.replace('<button class="btn" id="lidBtn" type="button">Close lid</button>', '<button class="btn primary" id="budMode" type="button">Earbud</button>\n    <button class="btn" id="caseMode" type="button">Case</button>\n    <button class="btn" id="lidBtn" type="button">Close lid</button>')
src = src.replace("const lidBtn = document.getElementById('lidBtn'), budBtn = document.getElementById('budBtn');",
  "const lidBtn = document.getElementById('lidBtn'), budBtn = document.getElementById('budBtn');\nfor (const [id, m] of [['budMode', 'bud'], ['caseMode', 'case']]) document.getElementById(id).addEventListener('click', () => { select(-1); setMode(m); goalExplode = 1; slider.value = 1; goal = ovI(); });")
for need in ["mode: s.mode || 'bud'", "if (st.mode !== MODE)", "parts[i].grp !== MODE", "p.group.visible ? 'visible'", 'id="budMode"', "['caseMode', 'case']", "kind: 'caseExplode'", "OVERVIEW = clonePose(OV_BUD)", "OVERVIEW.dist * (innerWidth"]:
    assert need in src, need

src = src.replace("</style>", "@media (max-width: 820px) { #controls { flex-wrap: wrap; justify-content: center; gap: 8px; border-radius: 22px; width: calc(100% - 24px); } #controls label { display: none; } #controls .btn { padding: 8px 12px; } }\n</style>", 1)
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
