import re
src = open('iphone-teardown.html').read()
def R(a, b, n=1):
    global src
    assert src.count(a) == n, (src.count(a), a[:80]); src = src.replace(a, b)

info = r'''const INFO = {
  inner: { name: 'Inner display', role: 'A 7.6-inch screen that folds in half.',
    body: 'A flexible OLED panel built as a stack of about ten thin layers, topped with ultra-thin glass and a matte finish. The layers slide past each other every time you fold, which is why the crease is easier to feel than to see. The FaceTime camera sits underneath the display, so the big screen has no cutout.',
    specs: ['7.6-inch foldable OLED', 'About 10 layers, ultra-thin glass', 'Under-display FaceTime camera'] },
  frame: { name: 'Frame halves and buttons', role: 'Two metal halves joined by the hinge.',
    body: 'Each half of the phone has its own titanium frame and inner plate. Open, the phone is only 5.2 mm thick; folded, the halves stack to 11.3 mm. The side button has Touch ID built in, so you unlock it with your fingerprint.',
    specs: ['Titanium frame', '5.2 mm open, 11.3 mm closed', 'Touch ID in the side button'] },
  hinge: { name: 'Hinge', role: 'The part that makes it fold.',
    body: 'A 3D-printed titanium hinge links the halves with gears, springs and interlocking metal joints. It closes in a waterdrop shape, leaving a teardrop pocket for the screen to curl into so it never bends sharply. A central support bar holds the screen flat when the phone is open.',
    specs: ['3D-printed titanium', 'Waterdrop fold for a gentler crease', 'Gears, springs and a support bar'] },
  board: { name: 'Logic board', role: 'A single-layer board instead of a sandwich.',
    body: 'Recent iPhones stack two circuit boards, but the Duo spreads its main board out in one layer, the first iPhone to do that since iPhone 8. It carries the A20 Pro chip, Apple’s own C2 cellular modem and the N1 chip for Wi-Fi and Bluetooth.',
    specs: ['A20 Pro chip', 'C2 modem and N1 wireless chip', 'Single-layer layout'] },
  io: { name: 'I/O board and flex cable', role: 'Wires the two halves together.',
    body: 'Some functions move to a second single-layer board in the other half, next to the USB-C port and loudspeaker. A flexible printed cable runs through the hinge to join it to the logic board, and it has to survive being folded thousands of times.',
    specs: ['Single-layer I/O board', 'Flex cable through the hinge', 'USB-C port and speaker'] },
  batteries: { name: 'Two batteries', role: 'One cell in each half.',
    body: 'Teardowns found two cells: a larger 2,962 mAh battery in one half and a 1,921 mAh battery in the other, about 4,883 mAh in total. They are held with electrically released adhesive, so a technician frees them by passing a small current instead of prying.',
    specs: ['2,962 mAh + 1,921 mAh', 'About 4,883 mAh total', 'Electrically released adhesive'] },
  cameras: { name: 'Rear cameras', role: 'Two 48 MP cameras.',
    body: 'The Duo has a 48 MP Fusion main camera and a 48 MP Fusion ultra-wide camera on one bracket. To keep each half thin it leaves out the telephoto lens found on iPhone 18 Pro.',
    specs: ['48 MP Fusion main', '48 MP Fusion ultra-wide', 'No telephoto'] },
  outer: { name: 'Outer display', role: 'Use it like a normal phone when closed.',
    body: 'A 5.4-inch screen covers the outside of one half. With the Duo folded it gives about 90% of the screen area of an iPhone 18 Pro, and its own front camera handles selfies and calls while the phone is shut.',
    specs: ['5.4-inch OLED', 'About 90% of iPhone 18 Pro screen area', 'Front camera for closed use'] },
  back: { name: 'Back cover', role: 'Closes the camera half.',
    body: 'The back of the camera half is Ceramic Shield glass with a colored finish, a raised camera plateau and the Apple logo. Open the phone partway on a table and the plateau angles the cameras up like a small tripod. The whole phone weighs 254 g and is rated IP68.',
    specs: ['Ceramic Shield glass back', '254 g, IP68', 'Night Sky or Star White'] },
};
'''
src = re.sub(r"const INFO = \{.*?\n\};\n", lambda m: info, src, count=1, flags=re.S)

build = r'''/* ---------------- iPhone Duo dimensions (mm, open) ---------------- */
const HW = 82.3, H = 117.8, D = 5.2, R = 9.5, ZF = 3.05; // half width, height, depth, corner radius, fold axis height
const CAM = { x: -66, y: 34 };
function half(x0, x1, h, r, roundLeft, PathT = THREE.Shape) {
  const s = new PathT(), y0 = -h / 2, y1 = h / 2;
  if (roundLeft) { s.moveTo(x0 + r, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0 + r, y1); s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI); s.lineTo(x0, y0 + r); s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5); }
  else { s.moveTo(x0, y0); s.lineTo(x1 - r, y0); s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0); s.lineTo(x1, y1 - r); s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2); s.lineTo(x0, y1); s.lineTo(x0, y0); }
  return s;
}
const halfL = (inset, r = R) => half(-HW + inset, -0.3 - inset * 0.2, H - 2 * inset, Math.max(r - inset, 0.5), true);
const halfR = (inset, r = R) => half(0.3 + inset * 0.2, HW - inset, H - 2 * inset, Math.max(r - inset, 0.5), false);

const root = new THREE.Group(); scene.add(root);
const parts = [];
function addPart(id, offset, view, anchor, build, foldable = true) {
  const g = new THREE.Group(); build(g); root.add(g);
  const bb = new THREE.Box3().setFromObject(g);
  const center = bb.getCenter(new THREE.Vector3());
  const radius = bb.getBoundingSphere(new THREE.Sphere()).radius;
  // right-half meshes hang from a pivot on the fold axis
  const pivot = new THREE.Group(); pivot.position.set(0, 0, ZF); const rg = new THREE.Group(); rg.position.set(0, 0, -ZF); pivot.add(rg); g.add(pivot);
  if (foldable) [...g.children].forEach(o => { if (o === pivot) return; const b = new THREE.Box3().setFromObject(o); if (o.userData.right || (!o.isInstancedMesh && b.getCenter(new THREE.Vector3()).x > 1)) rg.attach(o); });
  const p = { id, index: parts.length, group: g, pivot, offset: new THREE.Vector3(...offset), center, radius, view, anchor: new THREE.Vector3(...anchor), dim: 0, info: INFO[id] };
  g.traverse(o => { if (o.isMesh) { o.userData.part = p; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { m.userData.baseOpacity = m.opacity; m.userData.baseTransparent = m.transparent; m.userData.baseDepthWrite = m.depthWrite; }); } });
  parts.push(p); return p;
}
function chipOn(g, z0, w, h, t, lines, x, y) {
  const side = std(0x16171a, 0.3, 0.45);
  const top = new THREE.MeshStandardMaterial({ map: labelTex(lines), metalness: 0.3, roughness: 0.4 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), [side, side, side, side, top, side]);
  m.position.set(x, y, z0 + t / 2); g.add(m); return m;
}
function passives(g, seed, n, z0, inside, blocked) {
  const r = rng(seed); const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff, 0.3, 0.5), n);
  const cols = [0x8a6a44, 0x2a2b2e, 0xb9a27a, 0x3b3d42]; const mtx = new THREE.Matrix4(); const col = new THREE.Color(); let k = 0, guard = 0;
  while (k < n && guard++ < 20000) {
    const [x, y] = inside(r); if (blocked.some(([a, b, c, d]) => x > a - 0.8 && x < b + 0.8 && y > c - 0.8 && y < d + 0.8)) continue;
    const sw = 0.6 + r() * 1.0, sh = 0.4 + r() * 0.6, t = 0.3 + r() * 0.4;
    mtx.makeScale(r() > 0.5 ? sw : sh, r() > 0.5 ? sh : sw, t); mtx.setPosition(x, y, z0 + t / 2); im.setMatrixAt(k, mtx); im.setColorAt(k, col.setHex(cols[(r() * cols.length) | 0])); k++;
  }
  im.count = k; im.userData.right = inside(rng(seed))[0] > 0; g.add(im);
}

/* ---------------- App icons (drawn, stylised) ---------------- */
if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };
const lg = (x, s, a, b) => { const g = x.createLinearGradient(0, 0, 0, s); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, s, s); };
const circ = (x, cx, cy, r, c) => { x.fillStyle = c; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
const line = (x, pts, w, c) => { x.strokeStyle = c; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); };
const ICONS = {
  phone: (x, s) => { lg(x, s, '#62f57c', '#10bd3f'); x.save(); x.translate(s * 0.5, s * 0.52); x.rotate(0.75); line(x, [[-s * 0.2, -s * 0.06], [-s * 0.2, s * 0.06]], s * 0.15, '#fff'); line(x, [[s * 0.2, -s * 0.06], [s * 0.2, s * 0.06]], s * 0.15, '#fff'); x.strokeStyle = '#fff'; x.lineWidth = s * 0.08; x.beginPath(); x.arc(0, s * 0.02, s * 0.2, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.restore(); },
  messages: (x, s) => { lg(x, s, '#6af27e', '#0fc13c'); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(s * 0.5, s * 0.47, s * 0.33, s * 0.27, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(s * 0.27, s * 0.62); x.quadraticCurveTo(s * 0.26, s * 0.76, s * 0.18, s * 0.8); x.quadraticCurveTo(s * 0.34, s * 0.78, s * 0.4, s * 0.7); x.fill(); },
  facetime: (x, s) => { lg(x, s, '#6af27e', '#0fc13c'); x.fillStyle = '#fff'; x.beginPath(); x.roundRect(s * 0.18, s * 0.33, s * 0.42, s * 0.34, s * 0.08); x.fill(); x.beginPath(); x.moveTo(s * 0.63, s * 0.47); x.lineTo(s * 0.82, s * 0.35); x.lineTo(s * 0.82, s * 0.65); x.lineTo(s * 0.63, s * 0.53); x.fill(); },
  safari: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); const g = x.createLinearGradient(0, s * 0.1, 0, s * 0.9); g.addColorStop(0, '#2ad0ff'); g.addColorStop(1, '#1366f0'); x.fillStyle = g; x.beginPath(); x.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = s * 0.012; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; x.beginPath(); x.moveTo(s / 2 + Math.cos(a) * s * 0.33, s / 2 + Math.sin(a) * s * 0.33); x.lineTo(s / 2 + Math.cos(a) * s * 0.37, s / 2 + Math.sin(a) * s * 0.37); x.stroke(); } x.save(); x.translate(s / 2, s / 2); x.rotate(Math.PI / 4); x.fillStyle = '#ff3b30'; x.beginPath(); x.moveTo(0, -s * 0.3); x.lineTo(s * 0.06, 0); x.lineTo(-s * 0.06, 0); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, s * 0.3); x.lineTo(s * 0.06, 0); x.lineTo(-s * 0.06, 0); x.fill(); x.restore(); },
  mail: (x, s) => { lg(x, s, '#3ec0ff', '#1a6ff0'); x.fillStyle = '#fff'; x.beginPath(); x.roundRect(s * 0.17, s * 0.3, s * 0.66, s * 0.42, s * 0.05); x.fill(); line(x, [[s * 0.2, s * 0.34], [s * 0.5, s * 0.55], [s * 0.8, s * 0.34]], s * 0.035, '#2a86f5'); },
  music: (x, s) => { lg(x, s, '#ff6b81', '#fa233b'); circ(x, s * 0.35, s * 0.68, s * 0.09, '#fff'); circ(x, s * 0.64, s * 0.62, s * 0.09, '#fff'); line(x, [[s * 0.43, s * 0.67], [s * 0.43, s * 0.27], [s * 0.72, s * 0.21], [s * 0.72, s * 0.61]], s * 0.05, '#fff'); },
  photos: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); ['#f9a51b', '#f7d13b', '#9cd23c', '#3fbf73', '#3aa5e8', '#7c6be0', '#c55bd6', '#f0505a'].forEach((c, i) => { x.save(); x.translate(s / 2, s / 2); x.rotate(i / 8 * Math.PI * 2); x.globalAlpha = 0.82; x.fillStyle = c; x.beginPath(); x.ellipse(0, -s * 0.17, s * 0.085, s * 0.19, 0, 0, Math.PI * 2); x.fill(); x.restore(); }); },
  camera: (x, s) => { lg(x, s, '#eeeeee', '#a3a3a3'); x.fillStyle = '#2a2a2c'; x.beginPath(); x.roundRect(s * 0.15, s * 0.3, s * 0.7, s * 0.45, s * 0.07); x.fill(); x.fillRect(s * 0.36, s * 0.24, s * 0.22, s * 0.08); circ(x, s * 0.5, s * 0.52, s * 0.15, '#9a9a9c'); circ(x, s * 0.5, s * 0.52, s * 0.1, '#1d2a44'); circ(x, s * 0.75, s * 0.37, s * 0.03, '#ffd23f'); },
  maps: (x, s) => { x.fillStyle = '#eef3e2'; x.fillRect(0, 0, s, s); x.fillStyle = '#9edb8a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(s * 0.5, 0); x.lineTo(0, s * 0.45); x.fill(); line(x, [[0, s * 0.75], [s, s * 0.35]], s * 0.11, '#fff'); line(x, [[s * 0.35, s], [s * 0.6, 0]], s * 0.09, '#ffd04a'); circ(x, s * 0.62, s * 0.62, s * 0.13, '#1f7cf2'); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(s * 0.62, s * 0.53); x.lineTo(s * 0.68, s * 0.68); x.lineTo(s * 0.62, s * 0.64); x.lineTo(s * 0.56, s * 0.68); x.fill(); },
  weather: (x, s) => { lg(x, s, '#4cb3ff', '#1d6fe0'); circ(x, s * 0.38, s * 0.38, s * 0.15, '#ffd23f'); x.fillStyle = '#fff'; [[0.45, 0.62, 0.13], [0.6, 0.55, 0.16], [0.74, 0.64, 0.11]].forEach(([a, b, r]) => { x.beginPath(); x.arc(s * a, s * b, s * r, 0, Math.PI * 2); x.fill(); }); x.fillRect(s * 0.42, s * 0.62, s * 0.36, s * 0.13); },
  clock: (x, s) => { x.fillStyle = '#000'; x.fillRect(0, 0, s, s); circ(x, s / 2, s / 2, s * 0.4, '#fff'); x.strokeStyle = '#000'; x.lineWidth = s * 0.015; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.moveTo(s / 2 + Math.cos(a) * s * 0.33, s / 2 + Math.sin(a) * s * 0.33); x.lineTo(s / 2 + Math.cos(a) * s * 0.37, s / 2 + Math.sin(a) * s * 0.37); x.stroke(); } line(x, [[s / 2, s / 2], [s * 0.5, s * 0.27]], s * 0.04, '#000'); line(x, [[s / 2, s / 2], [s * 0.66, s * 0.56]], s * 0.04, '#000'); line(x, [[s / 2, s / 2], [s * 0.36, s * 0.7]], s * 0.015, '#ff9500'); },
  calendar: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); x.fillStyle = '#ff3b30'; x.textAlign = 'center'; x.font = `600 ${s * 0.16}px sans-serif`; x.fillText('TUE', s / 2, s * 0.3); x.fillStyle = '#111'; x.font = `300 ${s * 0.5}px sans-serif`; x.fillText('10', s / 2, s * 0.78); },
  notes: (x, s) => { x.fillStyle = '#fdfdfb'; x.fillRect(0, 0, s, s); x.fillStyle = '#ffd23f'; x.fillRect(0, 0, s, s * 0.26); [0.45, 0.6, 0.75].forEach(y => line(x, [[s * 0.1, s * y], [s * 0.9, s * y]], s * 0.012, '#c9c9c9')); },
  reminders: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); [['#1f7cf2', 0.28], ['#ff3b30', 0.5], ['#ff9500', 0.72]].forEach(([c, y]) => { x.strokeStyle = c; x.lineWidth = s * 0.03; x.beginPath(); x.arc(s * 0.24, s * y, s * 0.07, 0, Math.PI * 2); x.stroke(); line(x, [[s * 0.4, s * y], [s * 0.82, s * y]], s * 0.03, '#d4d4d4'); }); },
  settings: (x, s) => { lg(x, s, '#b4b6ba', '#6d7075'); x.save(); x.translate(s / 2, s / 2); x.fillStyle = '#4a4d52'; for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); x.fillRect(-s * 0.05, -s * 0.38, s * 0.1, s * 0.12); } x.restore(); circ(x, s / 2, s / 2, s * 0.29, '#4a4d52'); circ(x, s / 2, s / 2, s * 0.2, '#c9cbcf'); circ(x, s / 2, s / 2, s * 0.08, '#4a4d52'); },
  appstore: (x, s) => { lg(x, s, '#1ec8fa', '#1572ee'); line(x, [[s * 0.3, s * 0.72], [s * 0.54, s * 0.28]], s * 0.075, '#fff'); line(x, [[s * 0.7, s * 0.72], [s * 0.46, s * 0.28]], s * 0.075, '#fff'); line(x, [[s * 0.26, s * 0.6], [s * 0.74, s * 0.6]], s * 0.075, '#fff'); },
  wallet: (x, s) => { x.fillStyle = '#000'; x.fillRect(0, 0, s, s); [['#ffb000', 0.22], ['#2fbf71', 0.32], ['#1f8cff', 0.42], ['#ff5a4f', 0.52]].forEach(([c, y]) => { x.fillStyle = c; x.beginPath(); x.roundRect(s * 0.16, s * y, s * 0.68, s * 0.24, s * 0.05); x.fill(); }); x.fillStyle = '#1c1c1e'; x.beginPath(); x.roundRect(s * 0.12, s * 0.58, s * 0.76, s * 0.24, s * 0.05); x.fill(); },
  health: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); x.fillStyle = '#ff2d55'; x.beginPath(); x.moveTo(s * 0.5, s * 0.78); x.bezierCurveTo(s * 0.1, s * 0.52, s * 0.18, s * 0.2, s * 0.5, s * 0.36); x.bezierCurveTo(s * 0.82, s * 0.2, s * 0.9, s * 0.52, s * 0.5, s * 0.78); x.fill(); },
  files: (x, s) => { x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); x.fillStyle = '#5fb2ff'; x.beginPath(); x.roundRect(s * 0.15, s * 0.28, s * 0.32, s * 0.16, s * 0.04); x.fill(); x.fillStyle = '#1a8cff'; x.beginPath(); x.roundRect(s * 0.15, s * 0.36, s * 0.7, s * 0.4, s * 0.05); x.fill(); },
  podcasts: (x, s) => { lg(x, s, '#d56df5', '#8b2ed6'); x.strokeStyle = '#fff'; x.lineWidth = s * 0.05; [0.3, 0.2].forEach(r => { x.beginPath(); x.arc(s / 2, s * 0.46, s * r, Math.PI * 0.8, Math.PI * 2.2); x.stroke(); }); circ(x, s / 2, s * 0.46, s * 0.07, '#fff'); line(x, [[s / 2, s * 0.56], [s / 2, s * 0.8]], s * 0.08, '#fff'); },
  tv: (x, s) => { x.fillStyle = '#000'; x.fillRect(0, 0, s, s); x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = `700 ${s * 0.42}px sans-serif`; x.fillText('tv', s / 2, s * 0.64); },
  books: (x, s) => { lg(x, s, '#ffa53d', '#ff7a00'); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(s * 0.5, s * 0.34); x.quadraticCurveTo(s * 0.35, s * 0.26, s * 0.17, s * 0.3); x.lineTo(s * 0.17, s * 0.72); x.quadraticCurveTo(s * 0.35, s * 0.68, s * 0.5, s * 0.76); x.quadraticCurveTo(s * 0.65, s * 0.68, s * 0.83, s * 0.72); x.lineTo(s * 0.83, s * 0.3); x.quadraticCurveTo(s * 0.65, s * 0.26, s * 0.5, s * 0.34); x.fill(); line(x, [[s * 0.5, s * 0.36], [s * 0.5, s * 0.74]], s * 0.02, '#ff8c1a'); },
  findmy: (x, s) => { lg(x, s, '#4fe06f', '#24b34a'); x.strokeStyle = '#fff'; x.lineWidth = s * 0.04; [0.32, 0.2].forEach(r => { x.beginPath(); x.arc(s / 2, s / 2, s * r, 0, Math.PI * 2); x.stroke(); }); circ(x, s / 2, s / 2, s * 0.08, '#fff'); },
  calculator: (x, s) => { x.fillStyle = '#1c1c1e'; x.fillRect(0, 0, s, s); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) circ(x, s * (0.22 + c * 0.187), s * (0.24 + r * 0.175), s * 0.07, c === 3 ? '#ff9f0a' : r === 0 ? '#a5a5a5' : '#505050'); },
  stocks: (x, s) => { x.fillStyle = '#000'; x.fillRect(0, 0, s, s); line(x, [[s * 0.14, s * 0.68], [s * 0.32, s * 0.5], [s * 0.46, s * 0.6], [s * 0.64, s * 0.34], [s * 0.86, s * 0.42]], s * 0.05, '#30d158'); },
  home: (x, s) => { lg(x, s, '#ffc04d', '#ff8a00'); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(s * 0.5, s * 0.22); x.lineTo(s * 0.82, s * 0.5); x.lineTo(s * 0.72, s * 0.5); x.lineTo(s * 0.72, s * 0.78); x.lineTo(s * 0.28, s * 0.78); x.lineTo(s * 0.28, s * 0.5); x.lineTo(s * 0.18, s * 0.5); x.fill(); },
};
const LABELS = { appstore: 'App Store', findmy: 'Find My', facetime: 'FaceTime', tv: 'TV' };
function appIcon(x, kind, cx, cy, s, label = true) {
  x.save(); x.shadowColor = 'rgba(0,0,0,0.25)'; x.shadowBlur = s * 0.12; x.shadowOffsetY = s * 0.04;
  x.fillStyle = '#000'; x.beginPath(); x.roundRect(cx - s / 2, cy - s / 2, s, s, s * 0.225); x.fill(); x.restore();
  x.save(); x.translate(cx - s / 2, cy - s / 2); x.beginPath(); x.roundRect(0, 0, s, s, s * 0.225); x.clip(); ICONS[kind](x, s);
  const sh = x.createLinearGradient(0, 0, 0, s); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(0, 0, s, s); x.restore();
  if (label) { x.fillStyle = 'rgba(255,255,255,0.96)'; x.textAlign = 'center'; x.font = `500 ${Math.round(s * 0.19)}px sans-serif`; x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 4; x.fillText(LABELS[kind] || kind[0].toUpperCase() + kind.slice(1), cx, cy + s / 2 + s * 0.26); x.shadowBlur = 0; }
}
function wallpaper(x, w, h) {
  const g = x.createLinearGradient(0, 0, w * 0.35, h); g.addColorStop(0, '#0d2a52'); g.addColorStop(0.5, '#3b3a86'); g.addColorStop(1, '#c76e58'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  [[0.2, 0.25, '#4fa3ff'], [0.75, 0.3, '#b56cff'], [0.55, 0.85, '#ff9a6b']].forEach(([a, b, c]) => { const rg = x.createRadialGradient(w * a, h * b, 0, w * a, h * b, Math.max(w, h) * 0.45); rg.addColorStop(0, c + '66'); rg.addColorStop(1, c + '00'); x.fillStyle = rg; x.fillRect(0, 0, w, h); });
}
function statusBar(x, w, y, s) { x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = `600 ${s}px sans-serif`; x.fillText('10:08', s * 2.2, y); x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.roundRect(w - s * 3.6, y - s * 0.75, s * 1.7, s * 0.85, 4); x.stroke(); x.fillRect(w - s * 3.45, y - s * 0.6, s * 1.4, s * 0.55); [0, 1, 2, 3].forEach(i => x.fillRect(w - s * 6.4 + i * s * 0.42, y - s * (0.25 + i * 0.17), s * 0.28, s * (0.25 + i * 0.17))); }
function frosted(x, a, b, c, d, r) { x.fillStyle = 'rgba(255,255,255,0.2)'; x.beginPath(); x.roundRect(a, b, c, d, r); x.fill(); }

/* 1. Inner display */
const innerScreens = [];
const innerCanvas = document.createElement('canvas'); innerCanvas.width = 1640; innerCanvas.height = 1100;
(function drawInner() {
  const x = innerCanvas.getContext('2d'), w = 1640, h = 1100, r = 70;
  x.beginPath(); x.roundRect(0, 0, w, h, r); x.clip();
  wallpaper(x, w, h); statusBar(x, w, 46, 30);
  // widgets
  x.fillStyle = 'rgba(255,255,255,0.92)'; x.beginPath(); x.roundRect(90, 100, 330, 300, 44); x.fill();
  x.fillStyle = '#ff3b30'; x.textAlign = 'left'; x.font = '600 30px sans-serif'; x.fillText('TUESDAY', 126, 158);
  x.fillStyle = '#111'; x.font = '300 120px sans-serif'; x.fillText('10', 120, 280);
  x.fillStyle = '#5b6cff'; x.fillRect(126, 310, 6, 56); x.fillStyle = '#333'; x.font = '500 26px sans-serif'; x.fillText('Design review', 146, 332); x.fillStyle = '#888'; x.font = '400 22px sans-serif'; x.fillText('11:00 – 12:00', 146, 362);
  const wg = x.createLinearGradient(0, 100, 0, 400); wg.addColorStop(0, '#3d9bff'); wg.addColorStop(1, '#1f5fd1'); x.fillStyle = wg; x.beginPath(); x.roundRect(450, 100, 330, 300, 44); x.fill();
  x.fillStyle = '#fff'; x.font = '600 30px sans-serif'; x.fillText('Cupertino', 484, 158); x.font = '200 110px sans-serif'; x.fillText('22°', 478, 278);
  circ(x, 720, 160, 28, '#ffd23f'); x.font = '500 26px sans-serif'; x.fillText('Mostly Sunny', 484, 332); x.font = '400 24px sans-serif'; x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillText('H:24°  L:14°', 484, 366);
  const S = 118, colsL = [158, 348, 538, 728], rows = [200, 420, 640];
  const grid = [[null, null, null, null], ['facetime', 'calendar', 'camera', 'clock'], ['maps', 'weather', 'notes', 'reminders']];
  const gridR = [['appstore', 'books', 'podcasts', 'tv'], ['health', 'wallet', 'files', 'findmy'], ['calculator', 'stocks', 'home', 'settings']];
  grid.forEach((row, ri) => row.forEach((k, ci) => k && appIcon(x, k, colsL[ci] - 18, rows[ri] + 40, S)));
  gridR.forEach((row, ri) => row.forEach((k, ci) => appIcon(x, k, colsL[ci] + 820 + 18, rows[ri], S)));
  frosted(x, 360, 900, 920, 168, 56);
  ['phone', 'safari', 'messages', 'mail', 'music', 'photos'].forEach((k, i) => appIcon(x, k, 445 + i * 150, 984, 112, false));
  [0, 1, 2].forEach(i => circ(x, w * 0.75 - 30 + i * 30, 840, 7, i === 0 ? '#fff' : 'rgba(255,255,255,0.45)'));
  circ(x, w * 0.75, 42, 13, 'rgba(0,0,0,0.25)'); // under-display camera, barely visible
})();
function innerTex(offset) { const t = new THREE.CanvasTexture(innerCanvas); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.repeat.set(0.5, 1); t.offset.set(offset, 0); return t; }
addPart('inner', [0, 0, 72], { az: 0.42, el: 0.4, k: 0.92 }, [-80, 56, 2.6], g => {
  const body = std(0x0a0a0c, 0.2, 0.5);
  mesh(extrude(halfL(1.0), 0.6, 0.1), body, 0, 0, 2.2, g);
  mesh(extrude(halfR(1.0), 0.6, 0.1), body, 0, 0, 2.2, g);
  const sw = 80.4, sh = 112;
  [[-1, 0], [1, 0.5]].forEach(([s, off]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshBasicMaterial({ map: innerTex(off), transparent: true, toneMapped: false })); m.position.set(s * sw / 2, 0, 2.6); g.add(m); innerScreens.push(m); });
  const crease = new THREE.Mesh(new THREE.PlaneGeometry(1.4, sh), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })); crease.position.set(-0.7, 0, 2.66); g.add(crease); innerScreens.push(crease);
  mesh(cyl(1.3, 1.0, 24), phys({ color: 0x0b1020, metalness: 0.3, roughness: 0.05, clearcoat: 1 }), 41, 52, 1.6, g); // under-display camera
  box(18, 8, 0.18, std(0xd99a3a, 0.1, 0.45), 30, -50, 1.85, g);
});

/* 2. Frame halves */
addPart('frame', [0, 0, 44], { az: 0.85, el: 0.35, k: 0.92 }, [82, 40, 2.6], g => {
  const metal = std(0xb7b2a9, 1, 0.4, { envMapIntensity: 1.1 });
  [[halfL(0), halfL(1.6, R)], [halfR(0), halfR(1.6, R)]].forEach(([o, i]) => { const s = o; const hole = i; const hp = new THREE.Path(hole.getPoints(24)); s.holes.push(hp); mesh(extrude(s, D, 0.4), metal, 0, 0, 0, g); });
  const plate = std(0x9aa0a6, 0.8, 0.45);
  const pl = halfL(1.4); pl.holes.push(new THREE.Path(rrShape(27, 43, 7, CAM.x, CAM.y).getPoints(16)));
  mesh(extrude(pl, 0.5, 0), plate, 0, 0, 1.6, g);
  mesh(extrude(halfR(1.4), 0.5, 0), plate, 0, 0, 1.6, g);
  const btn = std(0xb7b2a9, 1, 0.3);
  box(15, 1.4, 3, std(0xa9a49b, 1, 0.22), 64, H / 2 + 0.5, 0, g);               // side button with Touch ID
  const tid = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.3, 3.3), std(0x9b958b, 1, 0.2)); tid.position.set(64, H / 2 + 0.3, 0); g.add(tid);
  box(9, 1.4, 3, btn, 44, H / 2 + 0.5, 0, g); box(9, 1.4, 3, btn, 32, H / 2 + 0.5, 0, g);
  const ab = std(0x5c5f63, 0, 0.6);
  [[-HW + 0.6, 40], [-HW + 0.6, -40], [HW - 0.6, 40], [HW - 0.6, -40]].forEach(([x, y]) => box(1.8, 1.0, D - 0.4, ab, x, y, 0, g));
  box(9.2, 1.6, 3.2, std(0x050506, 0, 0.8), 41, -H / 2 + 0.4, 0, g);
  const hole = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 12);
  for (let i = 0; i < 5; i++) mesh(hole, std(0x050506, 0, 0.8), 52 + i * 2.6, -H / 2 + 0.4, 0, g);
});

/* 3. Hinge */
let spine;
addPart('hinge', [0, 0, 22], { az: 0.75, el: 0.45, k: 0.72, t: [0, 40, 0.5], dist: 85 }, [0, 58, 0.5], g => {
  const ti = std(0x9a958d, 0.85, 0.42);
  mesh(extrude(rrShape(8.5, 110, 3), 2.6, 0.3), ti, 0, 0, -0.6, g);
  const plate = std(0xc4c8cc, 0.9, 0.3);
  box(6.5, 44, 0.4, plate, 0, -2, 1.75, g); // central support bar
  const gearM = std(0xb8b2a8, 0.95, 0.3);
  [50, -50].forEach(y => [-2.4, 2.4].forEach(x => {
    const gr = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 3, 24), gearM); gr.position.set(x, y, 0.9); g.add(gr);
    for (let t = 0; t < 12; t++) { const a = t / 12 * Math.PI * 2; box(0.7, 3, 0.7, gearM, x + Math.cos(a) * 2.4, y, 0.9 + Math.sin(a) * 2.4, g); }
  }));
  const springM = std(0xd2d4d6, 1, 0.25);
  [42, 34, -34, -42].forEach(y => {
    const pts = []; for (let i = 0; i <= 160; i++) { const t = i / 160; const a = t * Math.PI * 2 * 9; pts.push(new THREE.Vector3(Math.cos(a) * 1.3, y - 3.5 + t * 7, 1.1 + Math.sin(a) * 1.3)); }
    const tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 320, 0.26, 6), springM); g.add(tb);
  });
  [46, -46, 20, -20].forEach(y => { const arc = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.45, 6, 24, Math.PI), ti); arc.rotation.x = Math.PI / 2; arc.position.set(0, y, 0.2); g.add(arc); });
}, false);
(function makeSpine() {
  const hp = parts[parts.length - 1];
  const mat = std(0xb7b2a9, 1, 0.4, { side: THREE.DoubleSide, envMapIntensity: 1.1 });
  const geo = new THREE.CylinderGeometry(5.65, 5.65, H - 0.2, 64, 1, true, Math.PI - Math.PI * 0.46, Math.PI * 0.92);
  spine = new THREE.Mesh(geo, mat); spine.position.set(0, 0, ZF); spine.visible = false; spine.userData.part = hp;
  mat.userData.baseOpacity = 1; mat.userData.baseTransparent = false; mat.userData.baseDepthWrite = true;
  hp.group.add(spine);
})();

/* 4. Logic board (left half) */
addPart('board', [0, 0, 2], { az: 0.4, el: 0.48, k: 1.05 }, [-79, 27, 1], g => {
  const sh = new THREE.Shape();
  [[-79, 16], [-12, 16], [-12, 54], [-53, 54], [-53, 27], [-79, 27]].forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y));
  mesh(extrude(sh, 0.8, 0.1, 4), std(0x173226, 0.15, 0.55), 0, 0, 0.6, g);
  const z0 = 1.0;
  chipOn(g, z0, 13, 13, 1.2, [['A20 Pro', 46], ['SoC + RAM', 28]], -35, 40);
  chipOn(g, z0, 9, 11, 0.9, [['NAND', 54], ['256 GB', 30]], -20, 44);
  chipOn(g, z0, 10, 8, 0.9, [['C2', 64], ['MODEM', 28]], -46, 21.5);
  chipOn(g, z0, 7, 7, 0.8, [['N1', 70]], -22, 24);
  chipOn(g, z0, 8, 7, 0.8, [['PMIC', 54]], -69, 21.5);
  const shield = std(0xb8bcc2, 0.95, 0.28);
  box(10, 12, 0.7, shield, -47, 45, z0 + 0.35, g); box(9, 6, 0.7, shield, -32, 22, z0 + 0.35, g);
  box(3, 8, 0.9, std(0xc9a347, 0.9, 0.3), -14.5, 32, z0 + 0.45, g);
  passives(g, 21, 170, z0, r => [-78 + r() * 65, 17 + r() * 36.5], [[-79, -53, 27, 60], [-41.5, -28.5, 33.5, 46.5], [-24.5, -15.5, 38.5, 49.5], [-51, -41, 17.5, 25.5], [-25.5, -18.5, 20.5, 27.5], [-73, -65, 18, 25], [-52, -42, 39, 51], [-36.5, -27.5, 19, 25], [-16, -12, 28, 36]]);
});

/* 5. I/O board and flex (right half, linked through the hinge) */
addPart('io', [0, 0, 2], { az: 0.5, el: 0.5, k: 1.0 }, [78, -42, 1], g => {
  mesh(extrude(rrShape(64, 15, 1.5, 46, -49.5), 0.8, 0.1, 4), std(0x173226, 0.15, 0.55), 0, 0, 0.6, g);
  const z0 = 1.0;
  chipOn(g, z0, 7, 6, 0.8, [['AUDIO', 44]], 26, -48);
  const usb = std(0xc4c8cd, 0.95, 0.25);
  const u = mesh(extrude(rrShape(9.4, 3.4, 1.6), 7, 0.2), usb, 41, -54, 0, g); u.rotation.x = Math.PI / 2;
  box(17, 10, 2.8, std(0x1c1e22, 0.1, 0.55), 64, -49, z0 + 1.4, g); // loudspeaker
  passives(g, 5, 50, z0, r => [16 + r() * 60, -56 + r() * 13], [[22.5, 29.5, -51, -45], [36, 46, -58, -50], [55.5, 72.5, -54, -44]]);
  const flex = std(0xd99a3a, 0.1, 0.45);
  box(14, 4, 0.2, flex, -7, 20, 0.9, g); box(17, 4, 0.2, flex, 8.5, 20, 0.9, g); // across the hinge
  box(4, 66, 0.2, flex, 16, -11, 0.9, g);     // down to the I/O board
});

/* 6. Two batteries */
function cellLabel(lines) { return canvasTex(640, 640, (x, w, h) => { x.fillStyle = '#1b1e23'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(240,166,64,0.55)'; x.lineWidth = 3; x.strokeRect(30, 30, w - 60, h - 60); x.fillStyle = '#d9dde2'; x.font = '600 54px monospace'; x.fillText(lines[0], 70, 140); x.font = '400 36px monospace'; lines.slice(1).forEach((t, i) => x.fillText(t, 70, 230 + i * 60)); x.fillStyle = 'rgba(217,221,226,0.5)'; for (let i = 0; i < 24; i++) x.fillRect(70 + i * 17, 520, i % 3 ? 6 : 10, 60); }); }
addPart('batteries', [0, 0, -18], { az: 0.55, el: 0.42, k: 0.95 }, [-77, -54, 1], g => {
  const wrap = std(0x15171b, 0.25, 0.5);
  [[-45, -21, 64, 66, ['Li-ion  Cell 1', '3.88 V', '2,962 mAh', '11.56 Wh']], [45, -9, 60, 50, ['Li-ion  Cell 2', '3.88 V', '1,921 mAh', '7.5 Wh']]].forEach(([cx, cy, w, h, lines]) => {
    mesh(extrude(rrShape(w, h, 3, cx, cy), 2.6, 0.5, 12), wrap, 0, 0, -0.4, g);
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 8, h - 8), new THREE.MeshStandardMaterial({ map: cellLabel(lines), metalness: 0.2, roughness: 0.6 })); lp.position.set(cx, cy, 0.92); g.add(lp);
    box(5, 4, 0.3, std(0xd99a3a, 0.1, 0.45), cx + (cx < 0 ? 20 : -20), cy + h / 2 + 1.5, 0.6, g);
  });
});

/* 7. Rear cameras (left half) */
addPart('cameras', [0, 0, -36], { az: 2.55, el: 0.35, k: 1.45 }, [-78, 54, -2], g => {
  box(24, 40, 3, std(0x2e3136, 0.8, 0.38), CAM.x, CAM.y, -0.4, g);
  const barrel = std(0x1a1c20, 0.6, 0.35), ring = std(0xd8d4cb, 0.95, 0.22);
  const lensG = phys({ color: 0x0a1424, metalness: 0.35, roughness: 0.04, clearcoat: 1, envMapIntensity: 2 });
  [[CAM.y + 9, 6.6], [CAM.y - 9, 6.0]].forEach(([y, r]) => {
    mesh(cyl(r, 4.2), barrel, CAM.x, y, -2.0, g);
    mesh(cyl(r * 0.92, 0.6), ring, CAM.x, y, -4.2, g);
    mesh(cyl(r * 0.62, 0.3), lensG, CAM.x, y, -4.45, g);
    box(r * 1.6, r * 1.6, 1.0, std(0x5a5148, 0.5, 0.5), CAM.x, y, 1.0, g);
  });
  mesh(cyl(1.7, 2, 24), std(0xf3e6c4, 0.1, 0.3, { emissive: 0x332a10 }), CAM.x + 8.5, CAM.y, -2.6, g);
  box(14, 3, 0.18, std(0xd99a3a, 0.1, 0.45), CAM.x + 12, CAM.y - 16, 0.4, g);
});

/* 8. Outer display (back of the right half) */
const outerTex = canvasTex(760, 1100, (x, w, h) => {
  x.clearRect(0, 0, w, h); x.beginPath(); x.roundRect(0, 0, w, h, 70); x.clip();
  wallpaper(x, w, h); statusBar(x, w, 62, 28);
  x.fillStyle = '#000'; x.beginPath(); x.arc(w / 2, 52, 20, 0, Math.PI * 2); x.fill();
  frosted(x, 60, 110, 640, 230, 44);
  x.fillStyle = '#fff'; x.textAlign = 'left'; x.font = '600 28px sans-serif'; x.fillText('TUESDAY, NOV 10', 96, 166); x.font = '200 120px sans-serif'; x.fillText('10:08', 92, 296);
  circ(x, 610, 210, 40, '#ffd23f'); x.font = '500 30px sans-serif'; x.textAlign = 'right'; x.fillText('22°', 660, 300);
  const cols = [130, 296, 462, 628];
  [['facetime', 'calendar', 'photos', 'camera'], ['maps', 'weather', 'clock', 'notes'], ['appstore', 'wallet', 'health', 'settings']].forEach((row, ri) => row.forEach((k, ci) => appIcon(x, k, cols[ci], 450 + ri * 180, 116)));
  frosted(x, 36, 940, 688, 150, 54);
  ['phone', 'safari', 'messages', 'music'].forEach((k, i) => appIcon(x, k, cols[i], 1015, 112, false));
});
addPart('outer', [0, 0, -52], { az: 2.95, el: 0.28, k: 1.0 }, [80, 56, -2.5], g => {
  mesh(extrude(halfR(0.9), 0.7, 0.15), std(0x0a0a0c, 0.2, 0.5), 0, 0, -2.32, g);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(76, 110), new THREE.MeshBasicMaterial({ map: outerTex, transparent: true, toneMapped: false }));
  scr.position.set(41.5, 0, -2.68); scr.rotation.y = Math.PI; g.add(scr);
  const gl = new THREE.Mesh(extrude(halfR(1.0), 0.15, 0.05), phys({ color: 0xdfefff, transparent: true, opacity: 0.12, roughness: 0.04, clearcoat: 1, envMapIntensity: 2, depthWrite: false })); gl.position.z = -2.82; g.add(gl);
  mesh(cyl(1.6, 1.6, 24), std(0x2e3136, 0.8, 0.38), 41.5, 52, -1.5, g); // outer front camera
  box(14, 3, 0.18, std(0xd99a3a, 0.1, 0.45), 52, 46, -1.2, g);
});

/* 9. Back cover (left half) */
addPart('back', [0, 0, -68], { az: 3.35, el: 0.25, k: 0.95 }, [-82, -50, -2.6], g => {
  const back = phys({ color: 0x15223c, metalness: 0.15, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.55 });
  mesh(extrude(halfL(0.9), 0.7, 0.15), back, 0, 0, -2.32, g);
  mesh(extrude(rrShape(24, 40, 8, CAM.x, CAM.y), 1.1, 0.35), phys({ color: 0x1a2a48, metalness: 0.15, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.7 }), 0, 0, -3.1, g);
  const ring = std(0xb7b2a9, 1, 0.18);
  const lensG = phys({ color: 0x050a14, metalness: 0.3, roughness: 0.03, clearcoat: 1, envMapIntensity: 2.4 });
  [[CAM.y + 9, 7.2], [CAM.y - 9, 6.6]].forEach(([y, r]) => { mesh(cyl(r, 1.0, 48), ring, CAM.x, y, -4.0, g); mesh(cyl(r * 0.8, 1.05, 48), lensG, CAM.x, y, -4.02, g); });
  mesh(cyl(1.8, 0.4, 24), std(0xf1ead8, 0.1, 0.3), CAM.x + 8.5, CAM.y, -3.75, g);
  logoDecal(19, phys({ color: 0x9fb0c8, metalness: 0.85, roughness: 0.1, clearcoat: 1 }), -41, -10, -2.68, g);
});

const shadowTex = canvasTex(256, 256, (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(0,0,0,0.85)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = -H / 2 - 0.6; scene.add(shadow);
let fold = 0;
function updateShadow() { shadow.position.x = -40 * fold; shadow.position.z = 3 * fold; shadow.scale.set(200 - 95 * fold, 34 + 6 * fold, 1); shadow.material.opacity = 0.7 * clamp01(1 - explode * 4); shadow.visible = shadow.material.opacity > 0.01; }
function applyFold(f) { parts.forEach(p => { p.pivot.rotation.y = -Math.PI * f; }); spine.rotation.y = -Math.PI / 2 * f; spine.visible = f > 0.02; innerScreens.forEach(m => { m.visible = f < 0.85; }); updateShadow(); }

'''
a = src.index('/* ---------------- Phone dimensions (mm) ---------------- */'); b = src.index('/* ---------------- View / state ---------------- */')
src = src[:a] + build + src[b:]

tour_a = src.index("seg({ kind: 'intro'"); tour_b = src.index("const TOTAL = tAcc;")
tour = r'''const CLOSED_T = new THREE.Vector3(-38, 0, 3);
seg({ kind: 'intro', dur: 4.5, focus: -1, explode: () => 0, fold: () => 1,
  pose: t => ({ target: CLOSED_T.clone(), az: -0.7 + 1.0 * t, el: 0.42, dist: 310, shift: 0.85 }), labels: () => 0, title: t => ['intro', clamp01(Math.min(t * 4.5 / 0.8, (1 - t) * 4.5 / 0.8))] });
seg({ kind: 'unfold', dur: 4.5, focus: -1, explode: () => 0, fold: t => 1 - ease(clamp01(t * 1.1)),
  pose: t => lerpPose({ target: CLOSED_T.clone(), az: 0.3, el: 0.42, dist: 310, shift: 0.85 }, { target: new THREE.Vector3(0, 0, 0), az: 0.4, el: 0.45, dist: 420, shift: 0 }, ease(t)), labels: () => 0 });
seg({ kind: 'explode', dur: 4.5, focus: -1, explode: t => ease(clamp01(t * 1.15)),
  pose: t => lerpPose({ target: new THREE.Vector3(0, 0, 0), az: 0.4, el: 0.45, dist: 420, shift: 0 }, OVERVIEW, ease(t)), labels: t => clamp01((t - 0.75) / 0.25) });
seg({ kind: 'overview', dur: 3.5, focus: -1, explode: () => 1,
  pose: t => Object.assign(clonePose(OVERVIEW), { az: OVERVIEW.az + 0.12 * t }), labels: () => 1 });
parts.forEach((p, i) => seg({ kind: 'part', dur: PART_DUR, focus: i, explode: () => 1, pose: t => partPose(p, 0.16 * t - 0.08), labels: () => 0, card: true }));
seg({ kind: 'overview2', dur: 3.5, focus: -1, explode: () => 1,
  pose: t => Object.assign(clonePose(OVERVIEW), { az: 1.1 + 0.25 * t }), labels: () => 1 });
seg({ kind: 'collapse', dur: 7.5, focus: -1, explode: t => 1 - ease(clamp01(t / 0.38)), fold: t => ease(clamp01((t - 0.42) / 0.38)),
  pose: t => { const u = ease(t); return { target: new THREE.Vector3(0, 0, 0).lerp(CLOSED_T, ease(clamp01((t - 0.4) / 0.5))), az: 1.35 + 1.75 * u, el: 0.3, dist: 420 - 110 * u, shift: 0.85 * u }; }, labels: () => 0,
  title: t => ['outro', clamp01((t - 0.72) / 0.12)] });
'''
src = src[:tour_a] + tour + src[tour_b:]

R("return { explode: s.explode(u), pose,", "return { fold: s.fold ? s.fold(u) : 0, explode: s.explode(u), pose,")
R("  explode = st.explode; applyExplode(explode);", "  explode = st.explode; applyExplode(explode); fold = st.fold; applyFold(fold);")

# interactive fold control
R('<button class="btn" id="overview" type="button">Overview</button>', '<button class="btn" id="fold" type="button">Fold</button>\n    <button class="btn" id="overview" type="button">Overview</button>')
R("slider.addEventListener('input', () => { stopTour(); goalExplode = +slider.value; });",
  """slider.addEventListener('input', () => { stopTour(); goalFold = 0; foldBtn.textContent = 'Fold'; goalExplode = +slider.value; });
let goalFold = 0; const foldBtn = document.getElementById('fold');
const CLOSED_VIEW = () => ({ target: new THREE.Vector3(-38, 0, 3), az: 0.55, el: 0.42, dist: innerWidth > 820 ? 330 : 560, shift: innerWidth > 820 ? -0.3 : 0.15 });
foldBtn.addEventListener('click', () => { stopTour(); if (goalFold > 0.5) { goalFold = 0; foldBtn.textContent = 'Fold'; goal = ovI(); goalExplode = 0; slider.value = 0; } else { select(-1); goalFold = 1; goalExplode = 0; slider.value = 0; goal = CLOSED_VIEW(); foldBtn.textContent = 'Unfold'; } });""")
R("  if (i >= 0) { if (goalExplode < 0.6) goalExplode = 1;", "  if (i >= 0) { goalFold = 0; foldBtn.textContent = 'Fold'; if (goalExplode < 0.6) goalExplode = 1;")
R("    explode += (goalExplode - explode) * k; applyExplode(explode);",
  """    if (goalFold > 0.5) { explode += (0 - explode) * k; if (explode < 0.03) fold += (1 - fold) * k * 0.8; }
    else { fold += (0 - fold) * k; if (fold < 0.03) explode += (goalExplode - explode) * k; }
    if (fold < 1e-3) fold = 0; applyExplode(explode); applyFold(fold);""")
R("goal = clonePose(view); goalExplode = explode; slider.value = explode; setTitle(null, 0); }\n    else applyState",
  "goal = clonePose(view); goalExplode = explode; slider.value = explode; goalFold = fold > 0.5 ? 1 : 0; foldBtn.textContent = goalFold ? 'Unfold' : 'Fold'; setTitle(null, 0); }\n    else applyState")
R("goal = clonePose(view); goal.shift = selected >= 0 ? 1 : 0; goalExplode = explode; slider.value = explode; setTitle(null, 0);",
  "goal = clonePose(view); goal.shift = selected >= 0 ? 1 : 0; goalExplode = explode; slider.value = explode; goalFold = fold > 0.5 ? 1 : 0; foldBtn.textContent = goalFold ? 'Unfold' : 'Fold'; setTitle(null, 0);")

for a_, b_ in [
 ('<title>iPhone Teardown Explorer</title>', '<title>iPhone Duo Teardown</title>'),
 ('aria-label="3D exploded view of a smartphone.', 'aria-label="3D exploded view of the iPhone Duo foldable.'),
 ('Teardown · 11 layers · 8.25 mm', 'Teardown · 9 parts · 5.2 mm open'),
 ('<h1>Inside a modern iPhone</h1>', '<h1>Inside the iPhone Duo</h1>'),
 ('<h2 id="tc-title">Inside a modern iPhone</h2>', '<h2 id="tc-title">Inside the iPhone Duo</h2>'),
 ('<p id="tc-sub">Eleven layers, front to back, explained.</p>', '<p id="tc-sub">Apple’s first foldable, opened up.</p>'),
 ('Layers, front to back', 'Parts, front to back'),
 ("intro: ['Teardown', 'Inside a modern iPhone', 'Eleven layers, front to back, explained.'],", "intro: ['Teardown', 'Inside the iPhone Duo', 'Apple’s first foldable, opened up.'],"),
 ("outro: ['8.25 millimetres', 'Everything, stacked.', 'Glass, display, Face ID, frame, logic board, battery, haptics, audio, cameras, MagSafe and back glass.'],",
  "outro: ['5.2 mm open · 11.3 mm closed', 'One phone, folded in two.', 'Two screens, two batteries, two boards and a titanium hinge holding it all together.'],"),
 ("const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.92, el: 0.26, dist: 390, shift: 0 };", "const OVERVIEW = { target: new THREE.Vector3(0, 0, 0), az: 0.78, el: 0.32, dist: 430, shift: 0 };"),
 ("{ dist: 450, shift: -0.4 } : { dist: 760, shift: 0.15 }", "{ dist: 560, shift: -0.4 } : { dist: 980, shift: 0.15 }"),
 ("'  ·  Layer'", "'  ·  Part'"),
 ("Illustrative model built from public teardown layouts. Proportions are approximate and specs vary by model.", "Illustrative model based on Apple’s published specs and teardown reports. Proportions are approximate. Not affiliated with Apple."),
 ("Math.min(900, dist0", "Math.min(1400, dist0"), ("Math.min(900, goal.dist", "Math.min(1400, goal.dist"),
]: R(a_, b_)
R("const c = p.center.clone().add(p.offset);\n  const dist = Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 70);",
  "const c = (p.view.t ? new THREE.Vector3(...p.view.t) : p.center.clone()).add(p.offset);\n  const dist = p.view.dist || Math.max(p.radius / Math.sin(FOV / 2) * p.view.k, 70);")
for a_, b_ in [("new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: RENDER })", "new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: RENDER, logarithmicDepthBuffer: true })"),
               ("new THREE.PerspectiveCamera(30, 1, 1, 4000)", "new THREE.PerspectiveCamera(30, 1, 5, 3000)")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
open('iphone-duo-teardown.html', 'w').write(src)

env = open('build-airtag.py').read()
k0 = env.index('env = r"""') + len('env = r"""'); env = env[k0: env.index('"""', k0)]
i = src.index('(function makeEnv() {'); j = src.index('})();', i) + 5
src = src[:i] + env + src[j:]
for a_, b_ in [("new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.55)", "new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.3)"),
               ("new THREE.DirectionalLight(0xffffff, 1.5); key.position", "new THREE.DirectionalLight(0xffffff, 1.0); key.position"),
               ("explode = st.explode; applyExplode(explode); fold = st.fold; applyFold(fold);", "explode = st.explode; applyExplode(explode); fold = st.fold; applyFold(fold); updateShadow();"),
               ("if (fold < 1e-3) fold = 0; applyExplode(explode); applyFold(fold);", "if (fold < 1e-3) fold = 0; applyExplode(explode); applyFold(fold); updateShadow();")]:
    assert src.count(a_) == 1, a_; src = src.replace(a_, b_)
open('iphone-duo-teardown.html', 'w').write(src)
print('ok')
