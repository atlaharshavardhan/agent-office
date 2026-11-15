import React from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
// @ts-ignore
import land50 from 'world-atlas/land-50m.json';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';

/* The Earth at night in the film's own colours: deep blue sea, purple land, warm city lights, cyan cables. Real coastlines (Natural Earth). */
export type LL = [number, number];   // [longitude, latitude]
const LAND: any = feature(land50 as any, (land50 as any).objects.land);
export const MUMBAI: LL = [72.85, 19.0], LONDON: LL = [-0.12, 51.5], HYD: LL = [78.48, 17.38];
/* the main cable, Mumbai to the UK, the way real cables go: Arabian Sea, Red Sea, Suez, Mediterranean, Atlantic coast */
export const MAIN: LL[] = [MUMBAI, [66, 16.5], [55, 13.2], [47, 12.2], [43.4, 12.5], [41, 16], [37.6, 22], [34.2, 27.2], [32.56, 29.9], [32.3, 31.5], [28, 33.2], [20, 35], [13, 36.6], [10.5, 37.6], [4, 38], [-2, 36.4], [-5.6, 35.95], [-9.5, 36.3], [-11, 40], [-10.5, 44.5], [-7.5, 48.3], [-4.55, 50.83]];
/* the long way round, used when the main one is cut: down the African coast and up the Atlantic */
export const ALT: LL[] = [MUMBAI, [66, 12], [56, 2], [47, -8], [42, -18], [37, -27], [29, -34.5], [18.4, -35.5], [11, -24], [6, -8], [-3, 2], [-14, 8], [-19.5, 16], [-18, 27], [-12.5, 35], [-11.5, 43], [-7.5, 48.3], [-4.55, 50.83]];
export const WEB: LL[][] = [
  [[-74, 40.5], [-55, 44], [-30, 49], [-10, 50.5], [-4.55, 50.83]], [[-74, 40.5], [-50, 40], [-25, 44], [-4.5, 48.4]], [[-70.5, 41.6], [-45, 47], [-20, 53], [-9.9, 53.3]],
  [[-80.2, 25.8], [-66, 18.4], [-52, 5], [-38.5, -3.7]], [[-38.5, -3.7], [-28, 8], [-20, 22], [-9.3, 38.7]], [[-38.5, -3.7], [-15, -6], [3.4, 6.4]], [[-43.2, -22.9], [-30, -25], [-5, -30], [18.4, -33.9]],
  [[-122.4, 37.8], [-150, 42], [-180, 42]], [[180, 42], [160, 40], [139.8, 35]], [[-118.2, 33.7], [-140, 26], [-157.8, 21.3]], [[-157.8, 21.3], [-172, 5], [-180, -4]], [[180, -4], [170, -16], [151.2, -33.9]],
  [[139.8, 35], [130, 28], [121.5, 25], [114.2, 22.3]], [[114.2, 22.3], [111, 12], [106, 4], [103.8, 1.3]], [[103.8, 1.3], [98, 6], [92, 6.5], [84, 8], [80.3, 13.1]], [[80.3, 13.1], [81.5, 6.5], [78, 6.5], [74, 12], MUMBAI],
  [[103.8, 1.3], [106, -5.5], [110, -12], [115.9, -31.9]], [[151.2, -33.9], [162, -36], [174.8, -36.8]], [[39.7, -4], [45, -12], [50, -20], [57.5, -20.2]], [[57.5, -20.2], [65, -5], [70, 8], MUMBAI],
  [[43.1, 11.6], [48, 3], [44, -3], [39.7, -4]], [[39.7, -4], [40.5, -15], [36, -25], [31, -29.9]], [[-9.9, 53.3], [-15, 58], [-21.9, 64.1]], [[-21.9, 64.1], [-35, 60], [-52.7, 47.6]], [[5.3, 43.3], [8, 40], [10.5, 37.6]], [[32.3, 31.5], [33, 33.5], [35.5, 33.9]],
  [[56.3, 25.3], [58.5, 23.5], [61, 20], [66, 16.5]], [[-9.3, 38.7], [-11, 43], [-7.5, 48.3]], [[139.8, 35], [150, 45], [165, 52], [-180, 53]], [[180, 53], [-165, 55], [-149.9, 61.2]], [[-70.6, -33], [-78, -15], [-79.5, 9]], [[-79.5, 9], [-78, 15], [-80.2, 25.8]],
];
const CITIES: LL[] = [MUMBAI, LONDON, HYD, [77.2, 28.6], [77.6, 13], [80.3, 13.1], [88.4, 22.6], [73.8, 18.5], [67, 24.9], [55.3, 25.3], [46.7, 24.7], [51.4, 35.7], [31.2, 30], [28.98, 41], [37.6, 55.75], [2.35, 48.86], [13.4, 52.5], [-3.7, 40.4], [12.5, 41.9], [4.9, 52.4], [18.07, 59.3], [-6.26, 53.35], [23.7, 38], [3.4, 6.4], [36.8, -1.3], [28, -26.2], [18.4, -33.9], [-74, 40.7], [-87.6, 41.9], [-118.2, 34], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6], [116.4, 39.9], [121.5, 31.2], [139.7, 35.7], [127, 37.5], [103.8, 1.3], [100.5, 13.75], [106.8, -6.2], [151.2, -33.9], [114.2, 22.3], [90.4, 23.8], [69.2, 41.3], [44.4, 33.3], [30.5, 50.45], [21, 52.2], [-9.1, 38.7], [9.2, 45.5], [-1.9, 52.5]];

/* points along a multi-leg route, up to fraction u of its length */
export const routeLen = (r: LL[]) => r.slice(1).map((p, i) => geoDistance(r[i], p));
export const routePts = (r: LL[], u = 1, step = 0.012): LL[] => {
  const L = routeLen(r), tot = L.reduce((a, b) => a + b, 0); let left = tot * Math.max(0, Math.min(1, u)); const out: LL[] = [r[0]];
  for (let i = 0; i < L.length && left > 1e-9; i++) { const take = Math.min(L[i], left), ip = geoInterpolate(r[i], r[i + 1]), n = Math.max(1, Math.ceil(take / step)); for (let k = 1; k <= n; k++) out.push(ip((take / L[i]) * (k / n)) as LL); left -= take; }
  return out;
};
export const routeAt = (r: LL[], u: number): LL => { const p = routePts(r, u, 0.05); return p[p.length - 1]; };

/* drop coastline points closer than `min` pixels to the last kept one: they are smaller than a pixel, so the picture is unchanged, but the browser has far less to draw */
const thin = (d: string, min = 0.6): string => { let out = '', lx = 1e9, ly = 1e9; const re = /([MLZ])([-\d.]+)?,?([-\d.]+)?/g; let m: RegExpExecArray | null;
  while ((m = re.exec(d))) { if (m[1] === 'Z') { out += 'Z'; continue; } const x = +m[2]!, y = +m[3]!; if (m[1] === 'M' || Math.abs(x - lx) + Math.abs(y - ly) >= min) { out += m[1] + x.toFixed(1) + ',' + y.toFixed(1); lx = x; ly = y; } }
  return out; };
export type GlobeApi = { xy: (p: LL) => [number, number]; vis: (p: LL) => number; line: (pts: LL[]) => string; R: number };
export const Globe: React.FC<{ id: string; rot: LL; R: number; cx?: number; cy?: number; f: number; lights?: number; children?: (g: GlobeApi) => React.ReactNode }> = ({ id, rot, R, cx = 540, cy = 900, f, lights = 1, children }) => {
  const proj = geoOrthographic().rotate([-rot[0], -rot[1]]).scale(R).translate([cx, cy]).clipAngle(90).precision(0.3);
  const path = geoPath(proj);
  const xy = (p: LL) => proj(p) as [number, number];
  const vis = (p: LL) => { const d = geoDistance(p, rot); return Math.max(0, Math.min(1, (Math.PI / 2 - d) / 0.12)); };
  const line = (pts: LL[]) => path({ type: 'LineString', coordinates: pts } as any) || '';
  const landD = thin(path(LAND) || ''), grat = path(geoGraticule10()) || '';
  return (
    <g>
      <defs>
        <radialGradient id={id + 'O'} cx=".36" cy=".3" r=".8"><stop offset="0" stopColor="#2a3fa8" /><stop offset=".45" stopColor="#17226e" /><stop offset="1" stopColor="#070a26" /></radialGradient>
        <radialGradient id={id + 'A'} cx=".5" cy=".5" r=".5"><stop offset=".82" stopColor="#5fe3ff" stopOpacity="0" /><stop offset=".9" stopColor="#5fe3ff" stopOpacity=".45" /><stop offset=".94" stopColor="#8fb0ff" stopOpacity=".22" /><stop offset="1" stopColor="#8fb0ff" stopOpacity="0" /></radialGradient>
        <radialGradient id={id + 'T'} cx=".3" cy=".25" r=".95"><stop offset="0" stopColor="#fff" stopOpacity=".1" /><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#02030c" stopOpacity=".72" /></radialGradient>
        <linearGradient id={id + 'L'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7a6be0" /><stop offset=".5" stopColor="#5546b8" /><stop offset="1" stopColor="#3a2f8a" /></linearGradient>
        <radialGradient id={id + 'W'}><stop offset="0" stopColor="#fff6dc" stopOpacity=".95" /><stop offset=".35" stopColor="#ffd98a" stopOpacity=".5" /><stop offset="1" stopColor="#ffc864" stopOpacity="0" /></radialGradient>
        <clipPath id={id + 'C'}><circle cx={cx} cy={cy} r={R} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={R * 1.22} fill={`url(#${id}A)`} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${id}O)`} />
      <g clipPath={`url(#${id}C)`}>
        <path d={grat} fill="none" stroke="#9fb0ff" strokeWidth={1.2} opacity={0.12} />
        {/* land, lifted a little off the sea like a paper cut-out */}
        <path d={landD} fill="#0a0c2a" opacity={0.55} transform={`translate(${R * 0.008} ${R * 0.014})`} />
        <path d={landD} fill={`url(#${id}L)`} stroke="#a898f0" strokeWidth={Math.max(1.2, R / 380)} strokeLinejoin="round" />
        <path d={landD} fill="none" stroke="#d6ccff" strokeWidth={Math.max(0.6, R / 900)} opacity={0.35} transform={`translate(${-R * 0.003} ${-R * 0.004})`} />
        {/* city lights */}
        {CITIES.map((c, i) => { const v = vis(c) * lights; if (v <= 0) return null; const [x, y] = xy(c), tw = 0.7 + 0.3 * Math.sin(f / 7 + i * 1.9), s = R / 520;
          return <g key={i} opacity={v * tw}><circle cx={x} cy={y} r={11 * s} fill={`url(#${id}W)`} /><circle cx={x} cy={y} r={2.4 * s} fill="#fff3d6" />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={x + (hash(i * 9 + k) - 0.5) * 26 * s} cy={y + (hash(i * 5 + k + 3) - 0.5) * 20 * s} r={1.3 * s} fill="#ffd98a" opacity={0.8} />)}</g>; })}
        {children && children({ xy, vis, line, R })}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${id}T)`} />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#9fd8ff" strokeWidth={2} opacity={0.35} />
    </g>
  );
};

/* a labelled place marker on the globe */
export const Pin: React.FC<{ g: GlobeApi; at: LL; name: string; col?: string; o?: number; up?: boolean }> = ({ g, at, name, col = '#ffe08a', o = 1, up = true }) => {
  const v = g.vis(at) * o; if (v <= 0) return null; const [x, y] = g.xy(at), w = name.length * 21 + 44;
  return <g opacity={v}><circle cx={x} cy={y} r={20} fill={col} opacity={0.25} /><circle cx={x} cy={y} r={8} fill={col} stroke="#0a0e24" strokeWidth={3} />
    <line x1={x} y1={y} x2={x} y2={y + (up ? -44 : 44)} stroke={col} strokeWidth={3} />
    <g transform={`translate(${x} ${y + (up ? -70 : 70)})`}><rect x={-w / 2} y={-26} width={w} height={52} rx={14} fill="#0e1430" stroke={col} strokeWidth={3} /><text y={11} textAnchor="middle" style={{ font: `700 30px ${FONT.ui}`, letterSpacing: '0.08em' }} fill="#fff">{name}</text></g></g>;
};
