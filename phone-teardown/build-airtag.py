import re
src = open('iphone-teardown.html').read()

info = r'''const INFO = {
  shell: { name: 'White enclosure', role: 'The face you see and the body that holds everything.',
    body: 'The glossy white shell is one piece of polycarbonate plastic. Every electronic part is mounted on its inside. It has no holes at all, and once the steel cap is twisted on the tag is sealed against dust and water.',
    specs: ['31.9 mm across, 8.0 mm thick', 'About 11 g with the battery', 'IP67 dust and water resistant'] },
  antenna: { name: 'Antennas', role: 'How it talks to nearby devices.',
    body: 'Thin antennas run around the rim, under the plastic and as far from the metal cap as possible. One serves Bluetooth, which announces the tag to passing iPhones. Another serves Ultra Wideband, which lets your own iPhone measure exact distance and direction during Precision Finding.',
    specs: ['Bluetooth Low Energy', 'Ultra Wideband (UWB)', 'Kept at the rim, away from metal'] },
  board: { name: 'Logic board', role: 'A tiny ring-shaped computer.',
    body: 'The board is a ring with the speaker in its middle. A Bluetooth chip broadcasts a rotating, encrypted identifier. An Ultra Wideband chip times radio pulses to billionths of a second to measure distance. An NFC chip lets any phone tap the tag to read a lost-mode message, and an accelerometer notices when it moves.',
    specs: ['Bluetooth LE system-on-chip', 'Ultra Wideband chip', 'NFC chip and accelerometer'] },
  speaker: { name: 'Speaker', role: 'The chirp that helps you find it.',
    body: 'A copper voice coil sits around a small magnet at the centre of the board. When current pulses through the coil it pushes against the magnet and vibrates the parts around it, so the whole tag acts as the speaker. It plays when you tap Play Sound, and as a warning when a tag travels with someone who is not its owner.',
    specs: ['Voice coil and magnet', 'No speaker holes needed', 'Alerts against unwanted tracking'] },
  tray: { name: 'Battery tray and contacts', role: 'Holds the cell and carries its power.',
    body: 'A plastic tray separates the electronics from the battery. Three springy metal contacts press on the cell so power keeps flowing even when the tag is dropped. Tabs around the rim lock the steel cap in place when you twist it.',
    specs: ['Three spring contacts', 'Bayonet tabs for the twist-lock cap', 'Insulates the board from the cell'] },
  battery: { name: 'CR2032 coin cell', role: 'A year of power from a coin.',
    body: 'A standard 3-volt lithium coin cell, the same kind used in watches and car keys. The tag sleeps most of the time and only sends brief Bluetooth beacons, so one cell lasts about a year. You replace it yourself, and your iPhone tells you when it is running low.',
    specs: ['3 V lithium, about 225 mAh', 'Roughly a year of use', 'User-replaceable'] },
  cap: { name: 'Stainless steel cap', role: 'The back cover you twist open.',
    body: 'A polished stainless-steel cover closes the back. Press down and turn it anticlockwise to reach the battery. The metal sits on the side away from the antennas, which stay under the plastic where radio signals pass through easily.',
    specs: ['Polished stainless steel', 'Press and twist to open', 'Sealed for IP67'] },
};
'''
src = re.sub(r"const INFO = \{.*?\n\};\n", lambda m: info, src, count=1, flags=re.S)

build = r'''/* ---------------- AirTag dimensions (mm) ---------------- */
const RAD = 15.95;
function lathe(pts, mat, z, parent) { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 128); g.rotateX(Math.PI / 2); return mesh(g, mat, 0, 0, z, parent); }
function annulus(rIn, rOut, depth, bevel = 0.05) { const s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2); const h = new THREE.Path(); h.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(h); return extrude(s, depth, bevel, 96); }
const polar = (r, deg) => [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)];

const root = new THREE.Group(); scene.add(root);
const parts = [];
function addPart(id, offset, view, anchor, build) {
  const g = new THREE.Group(); build(g); root.add(g);
  const bb = new THREE.Box3().setFromObject(g);
  const center = bb.getCenter(new THREE.Vector3());
  const radius = bb.getBoundingSphere(new THREE.Sphere()).radius;
  const p = { id, index: parts.length, group: g, offset: new THREE.Vector3(...offset), center, radius, view, anchor: new THREE.Vector3(...anchor), dim: 0, info: INFO[id] };
  g.traverse(o => { if (o.isMesh) { o.userData.part = p; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { m.userData.baseOpacity = m.opacity; m.userData.baseTransparent = m.transparent; m.userData.baseDepthWrite = m.depthWrite; }); } });
  parts.push(p); return p;
}
function chipOn(g, z0, w, h, t, lines, x, y, rot = 0) {
  const side = std(0x16171a, 0.3, 0.45);
  const top = new THREE.MeshStandardMaterial({ map: labelTex(lines), metalness: 0.3, roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), [side, side, side, side, top, side]);
  m.position.set(x, y, z0 + t / 2); m.rotation.z = rot; g.add(m); return m;
}

/* 1. White enclosure */
addPart('shell', [0, 0, 44], { az: 0.5, el: 0.42, k: 1.25 }, [-11, 11, 2.2], g => {
  const white = phys({ color: 0xf6f6f4, metalness: 0, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide, envMapIntensity: 0.9 });
  lathe([[0, 2.9], [5, 2.86], [9, 2.68], [12, 2.32], [14, 1.75], [15.15, 1.08], [15.7, 0.42], [15.78, 0.02], [15.3, 0.02], [15.2, -1.6], [14.4, -1.6], [14.3, 0.7], [12.2, 1.9], [8, 2.3], [0, 2.4]], white, 0, g);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(15.82, 0.07, 6, 160), std(0x3a3d42, 0.6, 0.4)); seam.position.z = 0.01; g.add(seam);
  // moulded ribs on the inside
  const rib = std(0xe4e4e0, 0, 0.5);
  for (let i = 0; i < 6; i++) { const [x, y] = polar(12.6, i * 60 + 30); const b = box(2.6, 0.7, 1.0, rib, x, y, 1.0, g); b.rotation.z = (i * 60 + 30) * Math.PI / 180 + Math.PI / 2; }
});

/* 2. Antennas */
addPart('antenna', [0, 0, 31], { az: 0.42, el: 0.5, k: 1.25 }, [8, -10, 1.3], g => {
  const flex = std(0xd99a3a, 0.15, 0.45, { side: THREE.DoubleSide });
  mesh(annulus(11.0, 13.4, 0.14, 0), flex, 0, 0, 1.25, g);
  const gold = std(0xd8b25a, 1, 0.28);
  const t1 = new THREE.Mesh(new THREE.TorusGeometry(12.9, 0.16, 4, 128, Math.PI * 1.35), gold); t1.position.z = 1.35; t1.rotation.z = 0.3; g.add(t1);
  const t2 = new THREE.Mesh(new THREE.TorusGeometry(11.7, 0.16, 4, 128, Math.PI * 0.9), gold); t2.position.z = 1.35; t2.rotation.z = 3.6; g.add(t2);
  [[20, 0], [140, 0], [260, 0]].forEach(([d]) => { const [x, y] = polar(12.2, d); const b = box(2.6, 1.6, 0.1, gold, x, y, 1.36, g); b.rotation.z = d * Math.PI / 180 + Math.PI / 2; });
  box(2.4, 4.5, 0.14, flex, 0, -9.6, 1.1, g);
});

/* 3. Logic board */
addPart('board', [0, 0, 18], { az: 0.35, el: 0.6, k: 1.15 }, [-10, 10, 0.8], g => {
  mesh(annulus(6.2, 13.9, 0.8, 0.08), std(0x10201a, 0.2, 0.42), 0, 0, 0.4, g);
  const gp = new THREE.Mesh(new THREE.TorusGeometry(13.55, 0.22, 4, 128), std(0xd2a94e, 1, 0.3)); gp.position.z = 0.81; g.add(gp);
  const gi = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.18, 4, 96), std(0xd2a94e, 1, 0.3)); gi.position.z = 0.81; g.add(gi);
  const z0 = 0.8;
  chipOn(g, z0, 3.8, 3.8, 0.7, [['UWB', 70], ['radio', 34]], 0, 10.2);
  chipOn(g, z0, 4.2, 4.2, 0.7, [['BLE', 72], ['SoC', 40]], -8.9, -5.1, 0.5);
  chipOn(g, z0, 2.6, 2.6, 0.5, [['NFC', 70]], 8.9, -5.1, -0.5);
  chipOn(g, z0, 2.2, 2.2, 0.5, [['ACC', 70]], -8.9, 5.1, -0.5);
  chipOn(g, z0, 3.0, 2.2, 0.5, [['FLASH', 54]], 8.9, 5.1, 0.5);
  const shield = std(0xb8bcc2, 0.95, 0.28);
  const s1 = box(3.6, 2.4, 0.5, shield, -3.6, -10.6, z0 + 0.25, g); s1.rotation.z = 0.33;
  [[0, -7.4], [7, -10.2]].forEach(([x, y]) => box(1.6, 1.2, 0.3, std(0xc9a347, 0.9, 0.3), x, y, z0 + 0.15, g));
  const r = rng(11); const NN = 120; const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff, 0.3, 0.5), NN);
  const chips = [[0, 10.2, 2.6], [-8.9, -5.1, 3.0], [8.9, -5.1, 2.0], [-8.9, 5.1, 1.8], [8.9, 5.1, 2.2], [-3.6, -10.6, 2.4], [0, -7.4, 1.2], [7, -10.2, 1.2]];
  const cols = [0x8a6a44, 0x2a2b2e, 0xb9a27a, 0x3b3d42]; const mtx = new THREE.Matrix4(); const col = new THREE.Color(); let n = 0;
  while (n < NN) {
    const a = r() * Math.PI * 2, rr = 7.2 + r() * 6.0, x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (chips.some(([cx, cy, cr]) => Math.hypot(x - cx, y - cy) < cr + 0.4)) continue;
    const sw = 0.4 + r() * 0.6, sh = 0.25 + r() * 0.35, t = 0.2 + r() * 0.25;
    mtx.makeScale(r() > 0.5 ? sw : sh, r() > 0.5 ? sh : sw, t); mtx.setPosition(x, y, z0 + t / 2); im.setMatrixAt(n, mtx);
    im.setColorAt(n, col.setHex(cols[(r() * cols.length) | 0])); n++;
  }
  g.add(im);
});

/* 4. Speaker */
addPart('speaker', [0, 0, 5], { az: 0.55, el: 0.55, k: 1.7 }, [3.5, -4.5, 0], g => {
  mesh(cyl(5.4, 1.6, 64), std(0x8d939a, 0.95, 0.3), 0, 0, -0.5, g);
  mesh(cyl(3.3, 0.5, 48), std(0x50555b, 0.9, 0.35), 0, 0, 0.45, g);
  mesh(cyl(1.0, 0.3, 24), std(0xb8bcc2, 1, 0.2), 0, 0, 0.75, g);
  const copper = std(0xc98552, 1, 0.3);
  for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(3.9 + i * 0.22, 0.13, 6, 72), copper); t.position.z = 0.35 + (i % 2) * 0.12; g.add(t); }
  box(1.4, 4.5, 0.12, std(0xd99a3a, 0.1, 0.45), 0, -5.8, 0.1, g);
});

/* 5. Battery tray and contacts */
addPart('tray', [0, 0, -10], { az: 2.35, el: 0.55, k: 1.25 }, [-11, 11, -1.2], g => {
  const plastic = phys({ color: 0xeeeeeb, metalness: 0, roughness: 0.45, clearcoat: 0.3 });
  mesh(extrude(rrShape(28.4, 28.4, 14.2), 0.6, 0.1, 96), plastic, 0, 0, -1.3, g);
  mesh(annulus(10.25, 11.0, 2.9, 0.1), plastic, 0, 0, -3.05, g);
  const gold = std(0xd8b25a, 1, 0.25);
  [90, 210, 330].forEach(d => { const [x, y] = polar(7, d); const b = box(1.8, 4.2, 0.25, gold, x, y, -1.75, g); b.rotation.z = d * Math.PI / 180 + Math.PI / 2; b.rotation.x = 0.35; });
  mesh(cyl(1.6, 0.3, 32), gold, 0, 0, -1.7, g);
  const tab = plastic;
  [0, 120, 240].forEach(d => { const [x, y] = polar(14.4, d); const b = box(5, 1.0, 0.8, tab, x, y, -1.3, g); b.rotation.z = d * Math.PI / 180 + Math.PI / 2; });
});

/* 6. CR2032 battery */
const cellTex = canvasTex(512, 512, (x, w, h) => {
  const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#d5d9de'); g.addColorStop(0.85, '#aeb4ba'); g.addColorStop(1, '#8c9399');
  x.fillStyle = g; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#3c4148'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 64px monospace'; x.fillText('+', w / 2, 120);
  x.font = '700 76px monospace'; x.fillText('CR2032', w / 2, 230);
  x.font = '500 46px monospace'; x.fillText('3V  LITHIUM', w / 2, 320);
  x.font = '400 30px monospace'; x.fillText('Keep away from children', w / 2, 400);
});
addPart('battery', [0, 0, -25], { az: 2.75, el: 0.5, k: 1.35 }, [7, -7.5, -3], g => {
  mesh(cyl(10, 3.2, 96), std(0xb6bcc2, 1, 0.25), 0, 0, -2.95, g);
  mesh(cyl(9.2, 3.3, 96), std(0xa3a9b0, 1, 0.3), 0, 0, -2.95, g);
  const face = new THREE.Mesh(new THREE.CircleGeometry(9.9, 96), new THREE.MeshStandardMaterial({ map: cellTex, metalness: 0.7, roughness: 0.35 }));
  face.position.z = -4.57; face.rotation.y = Math.PI; g.add(face);
  const neg = new THREE.Mesh(new THREE.CircleGeometry(8.6, 96), std(0xc3c8ce, 1, 0.22)); neg.position.z = -1.33; g.add(neg);
});

/* 7. Stainless steel cap */
addPart('cap', [0, 0, -42], { az: 2.6, el: 0.4, k: 1.2 }, [-11, 11, -4], g => {
  const steel = std(0xf1f3f5, 1, 0.07, { side: THREE.DoubleSide, envMapIntensity: 1.15 });
  lathe([[0, -5.1], [6, -5.08], [9.5, -5.0], [12.2, -4.75], [14, -4.25], [15.2, -3.4], [15.8, -2.2], [15.95, -1.0], [15.92, -0.02], [15.3, -0.02], [15.3, -1.9], [14.4, -3.4], [12.5, -4.25], [8, -4.65], [0, -4.7]], steel, 0, g);
  logoDecal(10.5, std(0xc4c9cf, 1, 0.34, { envMapIntensity: 1.3 }), 0, 0, -5.115, g);
  const liner = phys({ color: 0xe9e9e6, roughness: 0.5 }); const ln = new THREE.Mesh(new THREE.CircleGeometry(11.8, 96), liner); ln.position.z = -4.62; g.add(ln);
  const tab = std(0xc7ccd2, 1, 0.25);
  [60, 180, 300].forEach(d => { const [x, y] = polar(14.9, d); const b = box(4.5, 0.9, 0.7, tab, x, y, -0.8, g); b.rotation.z = d * Math.PI / 180 + Math.PI / 2; });
});

'''
a = src.index('/* ---------------- Phone dimensions (mm) ---------------- */')
b = src.index('/* ---------------- View / state ---------------- */')
src = src[:a] + build + src[b:]

reps = [
 ('<title>iPhone Teardown Explorer</title>', '<title>AirTag Teardown Explorer</title>'),
 ('aria-label="3D exploded view of a smartphone.', 'aria-label="3D exploded view of an AirTag.'),
 ('Teardown · 11 layers · 8.25 mm', 'Teardown · 7 parts · 31.9 mm'),
 ('<h1>Inside a modern iPhone</h1>', '<h1>Inside an AirTag</h1>'),
 ('<h2 id="tc-title">Inside a modern iPhone</h2>', '<h2 id="tc-title">Inside an AirTag</h2>'),
 ('<p id="tc-sub">Eleven layers, front to back, explained.</p>', '<p id="tc-sub">Seven parts in a 31.9 mm disc, explained.</p>'),
 ('Layers, front to back', 'Parts, front to back'),
 ('aria-label="Phone layers"', 'aria-label="AirTag parts"'),
 ("intro: ['Teardown', 'Inside a modern iPhone', 'Eleven layers, front to back, explained.'],", "intro: ['Teardown', 'Inside an AirTag', 'Seven parts in a 31.9 mm disc, explained.'],"),
 ("outro: ['8.25 millimetres', 'Everything, stacked.', 'Glass, display, Face ID, frame, logic board, battery, haptics, audio, cameras, MagSafe and back glass.'],",
  "outro: ['No GPS. No cellular.', 'It borrows your neighbours’ phones.', 'Nearby Apple devices hear its Bluetooth beacon and send its location, end-to-end encrypted, to the Find My network.'],"),
 ("const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.92, el: 0.26, dist: 390, shift: 0 };", "const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.95, el: 0.3, dist: 150, shift: 0 };"),
 ("const ASSEMBLED = { target: new THREE.Vector3(0, 0, 0), az: 0.45, el: 0.12, dist: 330, shift: 0 };", ""),
 ("const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 70);", "const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 24);"),
 ("az: -0.5 + 0.85 * t, el: 0.1, dist: 300, shift: 0.85 })", "az: -1.35 + 1.1 * t, el: 0.3, dist: 95, shift: 0.85 })"),
 ("{ target: new THREE.Vector3(0, 0, 0), az: 0.35, el: 0.1, dist: 300, shift: 0.85 }, OVERVIEW", "{ target: new THREE.Vector3(0, 0, 0), az: -0.25, el: 0.3, dist: 95, shift: 0.85 }, OVERVIEW"),
 ("az: 1.45 + 2.2 * ease(t), el: 0.14, dist: 330, shift: 0.85 * ease(t) })", "az: 1.45 + 2.0 * ease(t), el: 0.3, dist: 95, shift: 0.85 * ease(t) })"),
 ("{ dist: 450, shift: -0.4 } : { dist: 760, shift: 0.15 }", "{ dist: 190, shift: -0.4 } : { dist: 330, shift: 0.15 }"),
 ("goal.dist = Math.max(40, Math.min(900, dist0 * pinch0 / d))", "goal.dist = Math.max(15, Math.min(600, dist0 * pinch0 / d))"),
 ("goal.dist = Math.max(40, Math.min(900, goal.dist * Math.exp(e.deltaY * 0.0012)))", "goal.dist = Math.max(15, Math.min(600, goal.dist * Math.exp(e.deltaY * 0.0012)))"),
 ("new THREE.PerspectiveCamera(30, 1, 1, 4000)", "new THREE.PerspectiveCamera(30, 1, 0.5, 2000)"),
 ("'  ·  Layer'", "'  ·  Part'"),
 ("Illustrative model built from public teardown layouts. Proportions are approximate and specs vary by model.", "Illustrative model built from public teardown layouts. Proportions are approximate."),
]
for x, y in reps:
    assert src.count(x) == 1, x
    src = src.replace(x, y)
env = r"""(function makeEnv() {
  // Photo-studio room: dark walls with bright softboxes, so chrome and gloss pick up crisp highlights.
  const es = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(120, 70, 120), new THREE.MeshBasicMaterial({ color: 0x24282d, side: THREE.BackSide }));
  es.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ color: 0x0c0d0f })); floor.rotation.x = -Math.PI / 2; floor.position.y = -34; es.add(floor);
  const panel = (w, h, k, x, y, z, ry = 0, rx = 0, tint = 0xffffff) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); es.add(m); };
  panel(70, 40, 3.2, 0, 34, 0, 0, Math.PI / 2);          // overhead softbox
  panel(10, 50, 7, -58, 6, -10, Math.PI / 2);             // left strip
  panel(10, 50, 6, 58, 6, 15, Math.PI / 2);               // right strip
  panel(46, 26, 2.4, 10, 8, 58, 0, 0, 0xfff1e2);          // front key, warm
  panel(30, 16, 1.6, -15, -4, -58, 0, 0, 0xdfe8ff);       // back fill, cool
  panel(120, 3, 3.5, 0, -18, -59);                        // horizon line
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(es, 0.015).texture;
  pm.dispose();
})();"""
i = src.index('(function makeEnv() {'); j = src.index('})();', i) + 5
src = src[:i] + env + src[j:]
for a, b in [("new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.55)", "new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.3)"),
             ("new THREE.DirectionalLight(0xffffff, 1.5); key.position", "new THREE.DirectionalLight(0xffffff, 1.0); key.position")]:
    assert src.count(a) == 1, a; src = src.replace(a, b)
open('airtag-teardown.html', 'w').write(src)
print('ok')
