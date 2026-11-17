// Runs the crowd physics (assets/fis.js) for every setup shown in the Short and saves the results into assets/runs.js,
// so the video plays exactly these runs (no re-simulation in the browser). Also runs 8 seeds of the
// "no pillar" and "best pillar" setups and stores the averages shown on the end card.
const fs = require('fs'), path = require('path');
const runFIS = new Function(fs.readFileSync(path.join(__dirname, '../assets/fis.js'), 'utf8') + ';return runFIS')();
const SEED = 6, FPS = 15;   // stored at 15 fps (the page interpolates to 30)
const SETUPS = { none: null, close: [0, -6.8, 0.3], centre: [0, -6.2, 0.3], best: [0.15, -6.45, 0.3] };
const KEEP = { none: 200, close: 70, centre: 70, best: 200 };   // simulated seconds kept per setup
const out = { seed: SEED, fps: FPS, runs: {}, avg: {} };
for (const [k, pil] of Object.entries(SETUPS)) {
  const R = runFIS({ v0: 5, seed: SEED, Tmax: KEEP[k] + 1, PIL: pil, fps: 30 });
  const nF = Math.floor(KEEP[k] * FPS) + 1, N = R.N, X = new Int16Array(N * nF), Z = new Int16Array(N * nF), P = new Uint8Array(N * nF);
  for (let i = 0; i < N; i++) for (let f = 0; f < nF; f++) { const src = Math.min(R.frames - 1, f * 2), b = i * R.nF + src;
    X[i * nF + f] = Math.round(R.X[b] * 1000); Z[i * nF + f] = Math.round(R.Z[b] * 1000); P[i * nF + f] = R.PR[b]; }
  const outF = [...R.out].map(o => o < 0 ? -1 : o / 30);   // exit time (s), -1 = still inside
  out.runs[k] = { pil, N, nF, keep: KEEP[k], r: [...R.r].map(v => +v.toFixed(3)), dl: [...R.dl].map(v => +v.toFixed(2)), exitT: R.exitedAt.map(v => +v.toFixed(3)), total: R.total,
    X: Buffer.from(X.buffer).toString('base64'), Z: Buffer.from(Z.buffer).toString('base64'), P: Buffer.from(P.buffer).toString('base64') };
  console.log(k, 'out in 60 s:', R.exitedAt.filter(t => t < 60).length, 'all out:', R.total && R.total.toFixed(1));
}
for (const k of ['none', 'best']) { const T = [], n60 = [];
  for (let s = 1; s <= 8; s++) { const R = runFIS({ v0: 5, seed: s, Tmax: 300, PIL: SETUPS[k] }); T.push(R.total); n60.push(R.exitedAt.filter(t => t < 60).length); }
  out.avg[k] = { totals: T.map(v => v && +v.toFixed(1)), meanTotal: T.reduce((a, b) => a + b, 0) / 8, meanN60: n60.reduce((a, b) => a + b, 0) / 8, n60 }; console.log(k, JSON.stringify(out.avg[k])); }
out.avg.faster = out.avg.best.totals.filter((t, i) => t < out.avg.none.totals[i]).length;
fs.writeFileSync(path.join(__dirname, '../assets/runs.js'), 'const RUNS = ' + JSON.stringify(out) + ';\n');
const meta = JSON.parse(JSON.stringify(out)); for (const r of Object.values(meta.runs)) { delete r.X; delete r.Z; delete r.P; }
fs.writeFileSync(path.join(__dirname, '../assets/runs-summary.json'), JSON.stringify(meta, null, 1));
console.log('faster in', out.avg.faster, 'of 8; size', (fs.statSync(path.join(__dirname, '../assets/runs.js')).size / 1e6).toFixed(1), 'MB');
