// Exports per-frame simulation stats from the built page (window.__simStats) to audio/simstats.json, for the sound effects.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 540, height: 960 } });
  await p.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: path.join(__dirname, '../../phone-teardown/package/build/three.min.js'), contentType: 'application/javascript' }));
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  const f = path.join(__dirname, '../_stats.html'); fs.writeFileSync(f, '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.join(__dirname, '../pillar.html'), 'utf8') + '</body></html>');
  await p.goto('file://' + f, { timeout: 0 }); await p.waitForFunction(() => window.__simStats, null, { timeout: 0 });
  fs.writeFileSync(path.join(__dirname, '../audio/simstats.json'), JSON.stringify(await p.evaluate(() => window.__simStats()))); fs.unlinkSync(f); await b.close(); console.log('ok'); })();
