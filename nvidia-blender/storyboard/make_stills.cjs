// Screenshot each storyboard scene at 1080x1920 (and a safe-zone check version).
// Usage: node storyboard/make_stills.cjs [zones]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const zones = process.argv[2] === 'zones';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const file = 'file://' + path.resolve(__dirname, 'storyboard.html');
  for (let s = 1; s <= 11; s++) {
    await p.goto(`${file}?s=${s}${zones ? '&zones=1' : ''}`);
    await p.waitForTimeout(400);
    const out = path.resolve(__dirname, zones ? `zones/scene${String(s).padStart(2, '0')}.png` : `scene${String(s).padStart(2, '0')}.png`);
    await p.screenshot({ path: out });
    console.log(out);
  }
  await b.close();
})();
