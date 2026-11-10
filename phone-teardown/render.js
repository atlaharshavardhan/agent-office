// usage: node render.js <html> <mode: stills|video> [out] [fps]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const [,, src, mode = 'stills', out = 'out', fpsArg = '30'] = process.argv;
const dir = __dirname;
const wrapped = path.join(dir, '_local.html');
fs.writeFileSync(wrapped, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + fs.readFileSync(src, 'utf8') + '</body></html>');
const F = f => path.join(dir, 'fonts', f, 'package/files');
const fontCss = [
  ['Sora', 'fontsource-sora-5.0.18', 'sora', [500, 600, 700]],
  ['IBM Plex Sans', 'fontsource-ibm-plex-sans-5.0.20', 'ibm-plex-sans', [400, 500, 600]],
  ['IBM Plex Mono', 'fontsource-ibm-plex-mono-5.0.12', 'ibm-plex-mono', [400, 500]],
].flatMap(([fam, pkg, base, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};font-style:normal;src:url(https://fonts.gstatic.com/local/${pkg}/${base}-latin-${w}-normal.woff2) format("woff2")}`)).join('\n');
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +process.env.VW || 1920, height: +process.env.VH || 1080 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ path: path.join(dir, 'package/build/three.min.js'), contentType: 'application/javascript' }));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: fontCss, contentType: 'text/css' }));
  await page.route('https://fonts.gstatic.com/local/**', r => { const u = new URL(r.request().url()).pathname.split('/'); r.fulfill({ path: path.join(F(u[2]), u[3]), contentType: 'font/woff2' }); });
  await page.goto('file://' + wrapped + '?render=1' + (process.env.Q || ''));
  await page.waitForFunction(() => window.__tour);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.__tour.total);
  console.log('total seconds', total);
  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of process.argv.slice(6).map(Number)) {
      await page.evaluate(t => window.__tour.renderAt(t), t);
      await page.screenshot({ path: `${out}/t${String(t).padStart(5, '0')}.jpg`, quality: 85 });
    }
  } else {
    const fps = +fpsArg, n = Math.ceil(total * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.__tour.renderAt(t), i / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
