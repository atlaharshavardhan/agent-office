const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const dir = __dirname, F = f => path.join(dir, '..', 'fonts', f, 'package/files');
const fontCss = [['Sora', 'fontsource-sora-5.0.18', 'sora', [500, 600, 700]], ['IBM Plex Sans', 'fontsource-ibm-plex-sans-5.0.20', 'ibm-plex-sans', [400, 500, 600, 700]]]
  .flatMap(([fam, pkg, base, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(https://fonts.gstatic.com/local/${pkg}/${base}-latin-${w}-normal.woff2) format("woff2")}`)).join('\n');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: fontCss, contentType: 'text/css' }));
  await p.route('https://fonts.gstatic.com/local/**', r => { const u = new URL(r.request().url()).pathname.split('/'); const f = path.join(F(u[2]), u[3]); fs.existsSync(f) ? r.fulfill({ path: f, contentType: 'font/woff2' }) : r.abort(); });
  await p.goto('file://' + path.join(dir, 'storyboard.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
  for (let i = 1; i <= 9; i++) { const el = await p.$('#s' + i); await el.screenshot({ path: path.join(dir, 'frames', `S${i}.jpg`), type: 'jpeg', quality: 88 }); }
  await b.close();
})();
