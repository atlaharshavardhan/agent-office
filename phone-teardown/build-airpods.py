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
  tip: { name: 'Foam-infused ear tip', role: 'The seal that makes noise cancelling work.',
    body: 'The tip is soft silicone with foam inside it. It squashes gently to fit the shape of your ear canal and seals it, so outside noise cannot leak in around the edge. That seal does a lot of the quiet before any electronics start working. It clicks onto the nozzle and comes in several sizes.',
    specs: ['Silicone with foam inside', 'Seals the ear canal', 'Swappable sizes'] },
  sensor: { name: 'Heart-rate sensor', role: 'Reads your pulse from inside your ear.',
    body: 'A tiny optical sensor sits behind a dark window on the part that touches your ear. It shines invisible infrared light into the skin and measures how much bounces back. Each heartbeat pushes more blood through, which changes that reflection, so the earbuds can count your heart rate during workouts. A skin-detect sensor also tells the bud when it is in your ear.',
    specs: ['Infrared optical window', 'Heart rate during workouts', 'Skin-detect for in-ear sensing'] },
  driver: { name: 'Driver and inward mic', role: 'Makes the sound, and listens to it.',
    body: 'An Apple-designed driver, powered by its own amplifier, pushes air through the nozzle into your ear. Right in front of it is a microphone that faces inward. It hears what actually reaches your ear, so the chip can fix the sound and cancel any noise that slipped past the tip.',
    specs: ['Apple-designed driver', 'Custom amplifier', 'Inward-facing microphone'] },
  shell: { name: 'Earbud housing', role: 'Everything has to fit in here.',
    body: 'The glossy white shell holds every part in a space smaller than a grape. The parts are glued in place, which keeps out sweat and water but also means the earbud cannot be opened without damage. iFixit gave it 0 out of 10 for repairability.',
    specs: ['30.9 × 19.2 × 27.0 mm, 5.55 g', 'IP57 sweat and water resistant', 'Glued, 0/10 repairability'] },
  board: { name: 'H2 chip', role: 'The brain doing the noise cancelling.',
    body: 'The H2 chip listens to all the microphones many thousands of times a second and creates an opposite sound wave that cancels the noise before you hear it. Apple says it removes up to twice as much noise as AirPods Pro 2. It also runs Transparency mode, Live Translation and the motion and speech-detecting accelerometers.',
    specs: ['Apple H2 chip', 'Up to 2× more noise cancelled than Pro 2', 'Motion and speech accelerometers'] },
  battery: { name: 'Earbud battery', role: 'A coin-sized cell that lasts a workday.',
    body: 'Each earbud runs on a small 0.221 watt-hour cell, about the energy of a thumbnail-sized coin cell. It gives up to eight hours of listening with noise cancelling on. The cell is glued in and joined by a tiny connector, so it cannot easily be replaced.',
    specs: ['0.221 Wh per earbud', 'Up to 8 h with noise cancelling', 'Glued in place'] },
  stem: { name: 'Stem: mics and touch', role: 'Your controls, and the microphones for calls.',
    body: 'The stem holds two beamforming microphones that point toward your mouth and ignore sounds from other directions, so your voice stays clear on calls. Its flat side is a touch control: press to play or pause, swipe to change the volume, and press and hold to switch noise modes. Metal contacts at the tip charge the bud in its case.',
    specs: ['Dual beamforming microphones', 'Touch control: press, swipe, hold', 'Charging contacts at the tip'] },
  case: { name: 'MagSafe charging case', role: 'A pocket charger that can call for help.',
    body: 'The case recharges the earbuds several times over. It charges with USB-C, MagSafe, Qi2 or an Apple Watch charger. It has a lanyard loop on the side and a speaker that can play a sound so you can find it.',
    specs: ['47.2 × 62.2 × 21.8 mm, 43.99 g', 'USB-C, MagSafe and Qi2', 'IP57, speaker and lanyard loop'] },
  caseInside: { name: 'Inside the case', role: 'One big cell and a radio for finding it.',
    body: 'A single 1.334 watt-hour cell fills most of the case. The previous Pro case used two cells. A second-generation Ultra Wideband chip lets your iPhone point straight to the case with Precision Finding. A ring of magnets on the back snaps it onto MagSafe and Qi2 chargers.',
    specs: ['One 1.334 Wh cell (Pro 2 had two)', 'Ultra Wideband chip (2nd gen)', 'Magnet ring for MagSafe and Qi2'] },
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
const WHITE = () => phys({ color: 0xf7f7f5, metalness: 0, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.95 });
const GRILLE = () => std(0x1a1b1f, 0.4, 0.55);
const GOLD = () => std(0xd2a94e, 1, 0.3);
const FLEX = () => std(0xd99a3a, 0.15, 0.45, { side: THREE.DoubleSide });
const SILVER = () => std(0xd5d9de, 1, 0.16);
const meshTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#121316'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3c42'; for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { x.beginPath(); x.arc(i * 8 + (j % 2) * 4 + 2, j * 8 + 2, 1.6, 0, Math.PI * 2); x.fill(); } });
meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping; meshTex.repeat.set(2, 2);
const MESH = () => std(0xffffff, 0.3, 0.6, { map: meshTex });

/* earbud head = ellipsoid; helpers put things on its surface */
const HEAD = new THREE.Vector3(0, 8, 0), HR = new THREE.Vector3(9.3, 9.8, 8.7);
function onHead(dir, k = 1) { const d = new THREE.Vector3(...dir).normalize(); return { p: new THREE.Vector3(d.x * HR.x * k, d.y * HR.y * k, d.z * HR.z * k).add(HEAD), n: new THREE.Vector3(d.x / HR.x, d.y / HR.y, d.z / HR.z).normalize() }; }
function patch(parent, dir, sx, sy, mat, rot = 0) {
  const { p, n } = onHead(dir, 0.995); const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
  m.scale.set(sx, sy, 0.35); m.position.copy(p); m.lookAt(p.clone().add(n)); m.rotateZ(rot); parent.add(m); return m;
}
/* stem frame: top tucked into the head, leaning down and slightly forward */
function stemFrame(parent) { const f = new THREE.Group(); f.position.set(0.6, HEAD.y - 5.0, 0.6); f.rotation.set(-0.05, 0, 0.06); parent.add(f); return f; }
const STEM_L = 20.5;
function stemShell(f, mat) {
  const prof = [[0.01, 0], [2.2, 0.05], [2.75, 0.6], [2.9, 2], [3.0, 10], [3.3, 16], [3.9, 19.6], [4.4, STEM_L + 1.5], [0.01, STEM_L + 1.5]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 64); geo.translate(0, -STEM_L, 0);
  const m = mesh(geo, mat, 0, 0, 0, f); m.scale.set(1, 1, 0.84);
  const cap = yCyl(2.45, 0.5, SILVER(), 0, -STEM_L + 0.2, 0, f); cap.scale.set(1, 1, 0.84);
  ell(0.9, 0.3, 0.55, GRILLE(), 0, -STEM_L - 0.05, 0, f, 24);
  const fm = ell(0.75, 1.3, 0.3, MESH(), 0, -STEM_L + 3.2, 2.48, f, 24);  // bottom mic port on the front
  return m;
}
function budOuter(parent, withTip = true) {
  const w = WHITE();
  ell(HR.x, HR.y, HR.z, w, HEAD.x, HEAD.y, HEAD.z, parent, 96);
  const noz = mesh(cyl(3.4, 4.0, 64), w, HEAD.x - 0.6, HEAD.y - 1.4, 8.6, parent); noz.scale.set(1, 1.15, 1);
  const ring = mesh(cyl(3.55, 0.7, 64), SILVER(), HEAD.x - 0.6, HEAD.y - 1.4, 10.3, parent); ring.scale.set(1, 1.15, 1);
  patch(parent, [0.42, 0.66, 0.5], 2.0, 1.25, MESH(), 0.6);      // top mic grille, top-front
  patch(parent, [-0.1, 0.9, -0.42], 3.4, 1.7, MESH(), 0.15);      // rear grille
  patch(parent, [0.92, 0.2, -0.32], 1.3, 3.8, MESH(), 0.2);       // side vent
  patch(parent, [0.62, 0.05, 0.72], 0.9, 1.7, MESH(), -0.3);      // front vent by the nozzle
  stemShell(stemFrame(parent), w);
  if (withTip) tipMesh(parent);
}
function tipMesh(parent) {
  const sil = phys({ color: 0xeeeff1, roughness: 0.6, metalness: 0, clearcoat: 0.2, side: THREE.DoubleSide });
  const pts = [[3.0, 0], [3.3, 0.6], [4.8, 1.3], [6.0, 2.5], [6.5, 3.9], [6.3, 5.1], [5.4, 6.1], [3.9, 6.6], [2.6, 6.7], [2.4, 6.2], [3.1, 1.0]];
  const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 96); geo.rotateX(Math.PI / 2);
  const m = mesh(geo, sil, HEAD.x - 0.6, HEAD.y - 1.4, 10.4, parent); m.scale.set(1, 1.15, 1);
  const hole = mesh(cyl(2.3, 0.4, 32), new THREE.MeshBasicMaterial({ color: 0x24262b }), HEAD.x - 0.6, HEAD.y - 1.4, 17.2, parent); hole.scale.set(1, 1.15, 1);
  return m;
}

/* 1. Ear tip */
addPart('tip', [0, 0, 22], { az: 0.75, el: 0.25, k: 1.6 }, [5.6, 7.0, 14], g => tipMesh(g));

/* 2. Heart-rate sensor (on the surface that touches the ear) */
addPart('sensor', [-14, -4, 14], { az: 0.35, el: 0.2, k: 2.4 }, [-3.4, 1.8, 8.5], g => {
  const glass = phys({ color: 0x0a0b0e, metalness: 0.2, roughness: 0.08, clearcoat: 1 });
  const { p, n } = onHead([-0.3, -0.42, 0.85], 1.0);
  const win = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), glass); win.scale.set(2.6, 1.7, 0.45); win.position.copy(p); win.lookAt(p.clone().add(n)); g.add(win);
  const led = std(0x3a0a12, 0.1, 0.3, { emissive: 0x8a1022, emissiveIntensity: 0.6 });
  const l1 = ell(0.45, 0.45, 0.25, led, 0, 0, 0, win, 24); l1.position.set(-0.35, 0, 0.9); l1.scale.set(0.17, 0.26, 0.5);
  const l2 = ell(0.55, 0.55, 0.25, std(0x0f2030, 0.2, 0.2), 0, 0, 0, win, 24); l2.position.set(0.35, 0, 0.9); l2.scale.set(0.2, 0.3, 0.5);
  const fx = box(2.0, 4.5, 0.15, FLEX(), p.x, p.y + 2.4, p.z - 1.2, g); fx.rotation.x = -0.6;
});

/* 3. Driver + inward-facing mic */
addPart('driver', [0, 0, 11], { az: 0.85, el: 0.3, k: 1.9 }, [5.5, 8.2, 5.2], g => {
  const z = 5.0, y = HEAD.y - 1.2;
  mesh(cyl(5.4, 2.2, 64), std(0x2b2d32, 0.6, 0.4), -0.4, y, z, g);
  mesh(cyl(4.7, 0.3, 64), std(0x111216, 0.2, 0.6), -0.4, y, z + 1.2, g);
  const copper = std(0xc98552, 1, 0.3);
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(3.2 + i * 0.25, 0.12, 6, 64), copper); t.position.set(-0.4, y, z - 1.15); g.add(t); }
  mesh(cyl(1.3, 0.6, 24), std(0xb8bcc2, 1, 0.2), -0.4, y, z + 1.4, g);
  mesh(cyl(1.0, 1.0, 24), std(0x9aa0a8, 1, 0.3), 2.2, y + 2.6, z + 1.6, g);
  mesh(cyl(0.45, 0.2, 16), GRILLE(), 2.2, y + 2.6, z + 2.15, g);
  chipOn(g, 2.4, 2.0, 0.5, [['AMP', 70]], -4.0, y - 3.6, z - 0.8);
  box(2.0, 3.0, 0.12, FLEX(), -3.8, y - 4.6, z - 0.9, g);
});

/* 4. Earbud housing (head + slanted stem + grilles), the reference part */
addPart('shell', [0, 0, 0], { az: 0.65, el: 0.2, k: 1.25 }, [-7.5, 11.5, 4], g => budOuter(g, false));

/* 5. H2 chip board (out the back) */
addPart('board', [0, 3, -18], { az: 2.5, el: 0.35, k: 1.8 }, [-6, 4.2, -2.6], g => {
  mesh(extrude(rrShape(12, 8.5, 3.2), 1.0, 0.15, 24), std(0x10201a, 0.2, 0.42), 0, HEAD.y + 1.0, -2.0, g);
  chipOn(g, 6.2, 5.2, 0.8, [['H2', 96], ['Apple', 36]], -0.6, HEAD.y + 1.0, -2.95, 0, Math.PI);
  const shield = std(0xb8bcc2, 0.95, 0.28);
  box(3.2, 2.4, 0.5, shield, 3.8, HEAD.y + 2.2, -2.8, g); box(2.0, 1.6, 0.4, shield, 3.9, HEAD.y - 1.0, -2.75, g);
  ['ACC', 'ACC'].forEach((l, i) => chipOn(g, 1.6, 1.6, 0.4, [[l, 64]], -4.6, HEAD.y + 2.6 - i * 3.1, -2.7, 0, Math.PI));
  box(2.4, 6, 0.12, FLEX(), 0, HEAD.y - 6.0, -1.6, g);
});

/* 6. Earbud battery */
const budCell = canvasTex(512, 512, (x, w, h) => {
  const gr = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  gr.addColorStop(0, '#d6dade'); gr.addColorStop(0.85, '#b0b6bc'); gr.addColorStop(1, '#8e959b');
  x.fillStyle = gr; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#3c4148'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 70px monospace'; x.fillText('0.221 Wh', w / 2, 220); x.font = '500 46px monospace'; x.fillText('Li-ion', w / 2, 310);
});
addPart('battery', [0, 4, -32], { az: 2.7, el: 0.35, k: 2.0 }, [0, 13.8, -5.6], g => {
  mesh(cyl(5.6, 3.8, 64), std(0xb6bcc2, 1, 0.25), 0, HEAD.y + 0.5, -5.2, g);
  const face = new THREE.Mesh(new THREE.CircleGeometry(5.5, 64), new THREE.MeshStandardMaterial({ map: budCell, metalness: 0.7, roughness: 0.35 }));
  face.position.set(0, HEAD.y + 0.5, -7.12); face.rotation.y = Math.PI; g.add(face);
  box(1.6, 3.0, 0.12, FLEX(), 3.6, HEAD.y + 3.4, -3.6, g);
});

/* 7. Stem board: mics, touch strip, charging contacts (slides out the bottom) */
addPart('stem', [3, -24, 0], { az: 0.6, el: 0.15, k: 1.5 }, [5.2, -10.5, 2.0], g => {
  const f = stemFrame(g);
  mesh(extrude(rrShape(3.0, 17, 1.2), 0.8, 0.1, 12), std(0x10201a, 0.2, 0.42), 0, -9.5, -0.3, f);
  const can = std(0x9aa0a8, 1, 0.3);
  mesh(cyl(0.9, 1.0, 24), can, 0, -16.6, 0.7, f); mesh(cyl(0.9, 1.0, 24), can, 0, -3.0, 0.7, f);
  box(2.4, 9, 0.15, FLEX(), 0, -9.5, 0.95, f);
    const mic = chipOn(f, 1.6, 1.6, 0.4, [['MIC', 60]], 0, -12.6, 0.45);
  const contact = yCyl(1.8, 0.8, std(0xd8dde2, 1, 0.18), 0, -19.4, -0.2, f); contact.scale.set(1, 1, 0.75);
  box(0.35, 15, 0.1, GOLD(), 1.15, -9.5, -0.75, f);
});

/* 8. MagSafe charging case, lid open, with the left earbud resting above it */
const CASE = new THREE.Vector3(-11.6, -29.5, 0.8), BODY_H = 33, LID_H = 14.2, CW = 62.2, CD = 21.8;
function caseShape(w, h, rb, rt) {   // rounded rectangle with different bottom / top corner radii
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + rb, y); s.lineTo(x + w - rb, y); s.absarc(x + w - rb, y + rb, rb, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - rt); if (rt > 0) s.absarc(x + w - rt, y + h - rt, rt, 0, Math.PI / 2); else s.lineTo(x + w, y + h);
  s.lineTo(x + rt, y + h); if (rt > 0) s.absarc(x + rt, y + h - rt, rt, Math.PI / 2, Math.PI); else s.lineTo(x, y + h);
  s.lineTo(x, y + rb); s.absarc(x + rb, y + rb, rb, Math.PI, Math.PI * 1.5); return s;
}
addPart('case', [76, -4, -2], { az: -0.4, el: 0.3, k: 1.25 }, [CASE.x - 24, CASE.y + 4, CASE.z + 10.9], g => {
  const w = WHITE(), bv = 3.2, top = CASE.y + BODY_H / 2;
  mesh(extrude(caseShape(CW - 2 * bv, BODY_H - 2 * bv, 14, 1.5), CD, bv, 48), w, CASE.x, CASE.y, CASE.z, g);
  const inner = std(0xe9eaec, 0, 0.45);
  box(CW - 5, 0.3, CD - 5, inner, CASE.x, top + 0.05, CASE.z, g);
  for (const sx of [-1, 1]) {   // rounded-square cradles the buds sit in
    const well = mesh(extrude(rrShape(21, 15.5, 6.5), 1.2, 0.5, 24), std(0xd3d6db, 0, 0.5), CASE.x + sx * 13.2, top - 0.35, CASE.z + 0.5, g); well.rotation.x = -Math.PI / 2;
    const slot = ell(3.0, 0.4, 2.5, std(0x8f949b, 0, 0.6), CASE.x + sx * 13.2, top + 0.3, CASE.z + 0.5, g, 32);
  }
  box(16, 2.2, 3.2, SILVER(), CASE.x, top + 0.6, CASE.z - CD / 2 + 2.4, g);   // hinge
  // lid, hinged at the back top edge and swung open
  const hinge = new THREE.Group(); hinge.position.set(CASE.x, top, CASE.z - CD / 2 + 1.2); hinge.rotation.x = -1.92; g.add(hinge);
  mesh(extrude(caseShape(CW - 2 * bv, LID_H - 2 * bv, 1.5, 12), CD, bv, 48), w, 0, LID_H / 2, CD / 2 - 1.2, hinge);
  box(CW - 5, 0.3, CD - 5, inner, 0, 0.1, CD / 2 - 1.2, hinge);
  ell(0.6, 0.6, 0.2, std(0x1a1d22, 0.2, 0.3, { emissive: 0x2fbf5a, emissiveIntensity: 1.1 }), CASE.x, CASE.y + 5, CASE.z + CD / 2 + 0.02, g, 24);
  // lanyard loop on the right side
  const lp = mesh(extrude(rrShape(3.6, 8.4, 1.8), 1.0, 0.3, 16), SILVER(), CASE.x + CW / 2 + 0.2, CASE.y + 7, CASE.z + 3, g); lp.rotation.y = Math.PI / 2;
  for (const dy of [2, -2]) { const h = mesh(cyl(1.0, 1.2, 24), std(0x2a2c30, 0.5, 0.4), CASE.x + CW / 2 + 0.5, CASE.y + 7 + dy, CASE.z + 3, g); h.rotation.y = Math.PI / 2; }
  // USB-C and speaker holes underneath
  const port = mesh(extrude(rrShape(8.9, 3.0, 1.5), 1.0, 0.1, 16), std(0x2a2c30, 0.6, 0.35), CASE.x, CASE.y - BODY_H / 2 - 0.2, CASE.z, g); port.rotation.x = Math.PI / 2;
  for (const i of [-3, -2, 2, 3]) yCyl(0.5, 0.6, GRILLE(), CASE.x + i * 2.6, CASE.y - BODY_H / 2 - 0.15, CASE.z + 1, g, 16);
  // left earbud (mirror of the right one) floating above the open case
  const left = new THREE.Group(); budOuter(left, true);
  left.scale.set(-1, 1, 1); left.position.set(CASE.x * 2 - 0.0, 0, 0); left.rotation.set(0, 0, 0); g.add(left);
});

/* 9. Inside the case */
addPart('caseInside', [76, -48, -2], { az: -0.3, el: -0.3, k: 1.3 }, [CASE.x + 24, CASE.y - 9, CASE.z - 1], g => {
  const cell = std(0x8f99a6, 0.85, 0.32);
  mesh(extrude(rrShape(44, 14, 3), 5.2, 0.6, 16), cell, CASE.x, CASE.y - 9, CASE.z - 3.5, g);
  const lbl = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), new THREE.MeshStandardMaterial({ map: labelTex([['1.334 Wh', 70], ['Li-ion', 40]], '#aeb6c0', '#2c3036', 512, 160), metalness: 0.3, roughness: 0.5 }));
  lbl.position.set(CASE.x, CASE.y - 9, CASE.z - 0.85); g.add(lbl);
  mesh(extrude(rrShape(46, 10, 2), 1.0, 0.15, 12), std(0x10201a, 0.2, 0.42), CASE.x, CASE.y + 3, CASE.z - 4.0, g);
  chipOn(g, 5.2, 5.2, 0.7, [['U2', 92], ['UWB', 40]], CASE.x - 12, CASE.y + 4.3, CASE.z - 3.15);
  chipOn(g, 4.2, 3.4, 0.6, [['PMU', 60]], CASE.x + 2, CASE.y + 4.3, CASE.z - 3.2);
  mesh(cyl(4.0, 2.6, 48), std(0x2b2d32, 0.6, 0.4), CASE.x + 16, CASE.y + 3, CASE.z - 2.4, g);
  mesh(cyl(3.1, 0.3, 48), GRILLE(), CASE.x + 16, CASE.y + 3, CASE.z - 1.0, g);
  const copper = std(0xc98552, 1, 0.3);
  for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(8 + i * 0.35, 0.16, 6, 96), copper); t.position.set(CASE.x, CASE.y + 2, CASE.z - 9.8); g.add(t); }
  const mag = std(0x7e848c, 0.9, 0.35);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const b = box(2.4, 1.2, 0.8, mag, CASE.x + Math.cos(a) * 12.5, CASE.y + 2 + Math.sin(a) * 12.5, CASE.z - 9.9, g); b.rotation.z = a + Math.PI / 2; }
});

'''
a = src.index('/* ---------------- Phone dimensions (mm) ---------------- */')
b = src.index('/* ---------------- View / state ---------------- */')
src = src[:a] + build + src[b:]

reps = [
 ('<title>iPhone Teardown Explorer</title>', '<title>AirPods Pro 3 Teardown Explorer</title>'),
 ('aria-label="3D exploded view of a smartphone.', 'aria-label="3D exploded view of an AirPods Pro 3 earbud and its case.'),
 ('Teardown · 11 layers · 8.25 mm', 'Teardown · 9 parts · 5.55 g'),
 ('<h1>Inside a modern iPhone</h1>', '<h1>Inside AirPods Pro 3</h1>'),
 ('<h2 id="tc-title">Inside a modern iPhone</h2>', '<h2 id="tc-title">Inside AirPods Pro 3</h2>'),
 ('<p id="tc-sub">Eleven layers, front to back, explained.</p>', '<p id="tc-sub">One earbud and its case, part by part.</p>'),
 ('Layers, front to back', 'Parts, earbud then case'),
 ('aria-label="Phone layers"', 'aria-label="AirPods parts"'),
 ("intro: ['Teardown', 'Inside a modern iPhone', 'Eleven layers, front to back, explained.'],", "intro: ['Teardown', 'Inside AirPods Pro 3', 'One earbud and its case, part by part.'],"),
 ("outro: ['8.25 millimetres', 'Everything, stacked.', 'Glass, display, Face ID, frame, logic board, battery, haptics, audio, cameras, MagSafe and back glass.'],",
  "outro: ['5.55 grams', 'A computer in your ear.', 'Driver, H2 chip, battery, heart-rate sensor and five microphones’ worth of listening, glued into a shell smaller than a grape.'],"),
 ("const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.92, el: 0.26, dist: 390, shift: 0 };", "const OVERVIEW = { target: new THREE.Vector3(28, -26, 0), az: -0.55, el: 0.2, dist: 340, shift: 0 };"),
 ("const ASSEMBLED = { target: new THREE.Vector3(0, 0, 0), az: 0.45, el: 0.12, dist: 330, shift: 0 };", ""),
 ("const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 70);", "const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 28);"),
 ("pose: t => ({ target: new THREE.Vector3(0, 0, 0), az: -0.5 + 0.85 * t, el: 0.1, dist: 300, shift: 0.85 })", "pose: t => ({ target: new THREE.Vector3(-11.6, -14, 0), az: -0.2 + 0.4 * t, el: 0.46, dist: 205, shift: 0.85 })"),
 ("{ target: new THREE.Vector3(0, 0, 0), az: 0.35, el: 0.1, dist: 300, shift: 0.85 }, OVERVIEW", "{ target: new THREE.Vector3(-11.6, -14, 0), az: 0.2, el: 0.46, dist: 205, shift: 0.85 }, OVERVIEW"),
 ("az: 1.45 + 2.2 * ease(t), el: 0.14, dist: 330, shift: 0.85 * ease(t) })", "az: 1.45 + 2.0 * ease(t), el: 0.22, dist: 210, shift: 0.85 * ease(t) })"),
 ("{ dist: 450, shift: -0.4 } : { dist: 760, shift: 0.15 }", "{ dist: 300, shift: -0.4 } : { dist: 470, shift: 0.15 }"),
 ("goal.dist = Math.max(40, Math.min(900, dist0 * pinch0 / d))", "goal.dist = Math.max(18, Math.min(700, dist0 * pinch0 / d))"),
 ("goal.dist = Math.max(40, Math.min(900, goal.dist * Math.exp(e.deltaY * 0.0012)))", "goal.dist = Math.max(18, Math.min(700, goal.dist * Math.exp(e.deltaY * 0.0012)))"),
 ("new THREE.PerspectiveCamera(30, 1, 1, 4000)", "new THREE.PerspectiveCamera(30, 1, 0.5, 2000)"),
 ("'  ·  Layer'", "'  ·  Part'"),
 ("Illustrative model built from public teardown layouts. Proportions are approximate and specs vary by model.", "Illustrative model of AirPods Pro 3 built from Apple’s specs and the iFixit and Lumafield teardowns. Internal proportions are approximate. Not affiliated with Apple."),
]
for x, y in reps:
    assert src.count(x) == 1, x
    src = src.replace(x, y)
src = src.replace("target: new THREE.Vector3(0, 0, 0), az: 1.45", "target: new THREE.Vector3(-11.6, -10, 0), az: 1.45")
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
