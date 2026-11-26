// Render storyboard stills: node tools/stills.mjs [filter]   (outputs out/storyboard/<id>.png)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const filter = process.argv[2] ?? 'sb-';
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const { getCompositions } = await import('@remotion/renderer');
const comps = (await getCompositions(serveUrl, { browserExecutable: process.env.REMOTION_CHROME })).filter((c) => c.id.startsWith('sb-') && c.id.includes(filter));
for (const c of comps) {
  const output = path.join(root, 'out/storyboard', `${c.id.slice(3)}.png`);
  await renderStill({ composition: c, serveUrl, output, browserExecutable: process.env.REMOTION_CHROME, chromiumOptions: { gl: 'swangle' } });
  console.log('rendered', output);
}
