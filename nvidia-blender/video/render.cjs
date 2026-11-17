// Render video/video.html frame by frame (30 fps) to PNGs.
// Usage: node video/render.cjs [scale=1] [from=0] [to=end] [--frames 12,45,...]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const scale = +(process.argv[2] || 1), FPS = 30;
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json')));
  const n = Math.round(tl.end * FPS);
  const only = process.argv.includes('--frames') ? process.argv[process.argv.indexOf('--frames') + 1].split(',').map(Number) : null;
  const out = path.join(__dirname, only ? 'checks' : (scale > 1 ? 'frames4k' : 'frames'));
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
  await p.goto('file://' + path.join(__dirname, 'video.html'));
  await p.evaluate((t) => window.setup(t), tl);
  // preload every background (CSS backgrounds load async otherwise)
  await p.evaluate(async () => {
    const urls = [...Array(90).keys()].map((i) => `../renders/preview_frames/f_${String(i + 1).padStart(4, '0')}.png`)
      .concat(['../renders/stills/scene03_datacenter.png', '../storyboard/bg/logo.png']);
    window.__keep = await Promise.all(urls.map((u) => new Promise((r) => { const im = new Image(); im.onload = () => im.decode().then(() => r(im)); im.onerror = () => r(null); im.src = u; })));
  });
  const list = only || [...Array(n).keys()];
  for (const f of list) {
    const file = path.join(out, `f_${String(f).padStart(5, '0')}.png`);
    if (!only && fs.existsSync(file)) continue;
    await p.evaluate((t) => window.renderAt(t), f / FPS);
    await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {})).concat(document.fonts.ready)));
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.screenshot({ path: file });
    if (f % 150 === 0) console.log('frame', f, '/', n);
  }
  await b.close();
  console.log('done', n);
})();
