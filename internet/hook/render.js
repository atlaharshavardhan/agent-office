// Render frames of hook.html: node render.js <url> <outDir> <seconds> [fps]
// Needs playwright (preinstalled in the cloud box). 540x960 at DPR 2 = 1080x1920 frames.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [url, out, secs, fpsArg] = process.argv.slice(2);
  const fps = parseInt(fpsArg || '30'), n = Math.round(parseFloat(secs) * fps);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.READY, null, { timeout: 120000 });
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.renderAt(t), i / fps);
    await p.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 94 });
    if (i % 30 === 0) console.log('frame', i, '/', n);
  }
  await b.close();
})();
