// usage: node shoot.js <outdir> <W>x<H>[@dsf] <name>:<js to run>[;;...]   — interactive-page screenshots (no ?render)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const dir = __dirname, [,, out, vp, ...shots] = process.argv;
const [wh, dsf = '1'] = vp.split('@'), [W, H] = wh.split('x').map(Number);
const src = path.join(dir, 'whoop-teardown.html'), wrapped = path.join(dir, '_local-shoot-' + process.pid + '.html');
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(src, 'utf8') + '</body></html>');
const F = f => path.join(dir, 'fonts', f, 'package/files');
const fontCss = [['Sora', 'fontsource-sora-5.0.18', 'sora', [500, 600, 700]], ['IBM Plex Sans', 'fontsource-ibm-plex-sans-5.0.20', 'ibm-plex-sans', [400, 500, 600]], ['IBM Plex Mono', 'fontsource-ibm-plex-mono-5.0.12', 'ibm-plex-mono', [400, 500]]]
  .flatMap(([fam, pkg, base, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(https://fonts.gstatic.com/local/${pkg}/${base}-latin-${w}-normal.woff2) format("woff2")}`)).join('\n');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: +dsf });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'log') console.log('console:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: path.join(dir, 'package/build/three.min.js'), contentType: 'application/javascript' }));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: fontCss, contentType: 'text/css' }));
  await page.route('https://fonts.gstatic.com/local/**', r => { const u = new URL(r.request().url()).pathname.split('/'); r.fulfill({ path: path.join(F(u[2]), u[3]), contentType: 'font/woff2' }); });
  await page.goto('file://' + wrapped + '?instant=1');
  await page.waitForFunction(() => window.__ui);
  await page.evaluate(() => document.fonts.ready);
  for (const s of shots) { const i = s.indexOf(':'), name = s.slice(0, i), js = s.slice(i + 1);
    const r = await page.evaluate(js); if (r !== undefined) console.log(name, JSON.stringify(r));
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${name}.jpg`, quality: 88 }); }
  await browser.close(); fs.unlinkSync(wrapped);
})();
