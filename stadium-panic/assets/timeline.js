/* Shared timing (page + audio script): which simulated second each room shows at video time t. */
const TL = (() => {
  const PW = (pts, t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return va + (vb - va) * (t - a) / (b - a); } return pts[pts.length - 1][1]; };
  const MAPA = [[10, 0], [14, 4], [17, 10], [19, 22]], MAPB = [[20, 0], [24, 4], [26.8, 10], [29, 22]], LAPSE = 27, SPLIT0 = 29.8, REV = 38;
  const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  function simTimes(t) {
    if (t < 29) return { A: PW(MAPA, t), B: PW(MAPB, t), rate: t < 19.6 ? (t < 14 ? 1 : t < 17 ? 2 : 6) : (t < 24 ? 1 : t < 26.8 ? 2 : 6) };
    if (t < SPLIT0) { const k = sm((t - 29) / (SPLIT0 - 29)); return { A: 22 * (1 - k), B: 22 * (1 - k), rate: -1 }; }   // rewind both rooms to the start
    if (t < REV) { const s = Math.min(240, (t - SPLIT0) * LAPSE); return { A: s, B: s, rate: LAPSE }; }
    return { A: 10 + (t - REV) * 0.6, B: 10 + (t - REV) * 0.6, rate: 0.6 };   // reveal: slow motion inside the jam
  }
  return { simTimes, PW, LAPSE, SPLIT0, REV };
})();
if (typeof module !== 'undefined') module.exports = TL;
