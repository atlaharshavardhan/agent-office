// Export the WHOOP pod (assembled, true size, parts as named nodes) to whoop-pod.glb for Blender.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const dir = __dirname, wrapped = path.join(dir, '_local-export.html');
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.join(dir, 'shots.html'), 'utf8') + '</body></html>');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: path.join(dir, 'package/build/three.min.js'), contentType: 'application/javascript' }));
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await p.goto('file://' + wrapped + '?render=1&shot=1');
  await p.waitForFunction(() => window.__T);
  await p.addScriptTag({ path: path.join(dir, 'package/examples/js/exporters/GLTFExporter.js') });
  const b64 = await p.evaluate(() => new Promise(res => {
    const T = window.__T; T.setExplode(0); T.applyExplode(0); T.root.scale.set(1, 1, 1);
    T.BAND_LOOP.visible = false; T.BAND_ENDS.visible = false;
    const out = new THREE.Group(); out.name = 'WHOOP_pod';
    T.parts.forEach(pt => { const g = pt.group; g.name = 'part_' + pt.id; g.position.set(0, 0, 0); g.quaternion.identity(); g.visible = true;
      const kill = []; g.traverse(o => { if (o.userData.ghost || (o.isMesh && o.material && o.material.isShaderMaterial) || o.isSprite || o.isLight) kill.push(o); });
      if (pt.id === 'band') kill.push(T.BAND_LOOP, T.BAND_ENDS);
      kill.forEach(o => o.parent && o.parent.remove(o));
      g.traverse(o => { o.userData = {}; o.visible = true; if (o.isMesh) [].concat(o.material).forEach(m => { m.userData = {}; m.transparent = false; m.opacity = 1; m.depthWrite = true; }); });
      out.add(g); });
    out.scale.setScalar(0.001);   // mm -> metres for Blender
    new THREE.GLTFExporter().parse(out, glb => { const u = new Uint8Array(glb); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); res(btoa(s)); }, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
  }));
  fs.writeFileSync(path.join(dir, 'whoop-pod.glb'), Buffer.from(b64, 'base64')); fs.unlinkSync(wrapped);
  console.log('whoop-pod.glb', (fs.statSync(path.join(dir, 'whoop-pod.glb')).size / 1024 / 1024).toFixed(2), 'MB');
  await b.close();
})();
