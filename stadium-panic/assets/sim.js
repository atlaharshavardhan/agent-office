/* Crowd simulation for the explanation part (video 3–43 s). Deterministic: every render part computes the same result.
   A concourse behind a stand with four exits. B is the gate everyone came in through.
   Rules (simplified from crowd research):
     - a few people react to the alarm at once; the rest wait and watch
     - a waiting person starts moving once enough people near them are moving (social influence)
     - unsure and stressed, most head for the exit they know (B), so B jams while A, C and D stay almost empty
     - after the announcement (and stewards at every exit) people pick the nearest exit that is not crowded */
function runSim(opt) {
  const o = Object.assign({ N: 650, fps: 30, T: 40, infoAt: 33.6, barAt: 27.5, seed: 11 }, opt || {});
  let sd = o.seed; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const X0 = -17, X1 = 17, Z0 = -11, Z1 = 11, rad = 0.23, GW = 2.6;   // room (m); agent radius; exit gap width
  const EX = [   // exits: gap centre, outward normal
    { id: 'A', x: -9, z: Z0, nx: 0, nz: -1 }, { id: 'B', x: 9, z: Z0, nx: 0, nz: -1 },
    { id: 'C', x: X0, z: 1, nx: -1, nz: 0 }, { id: 'D', x: X1, z: 1, nx: 1, nz: 0 }];
  const PIL = [[-7, -4], [3, -4], [-3, 5], [7, 5]], PR = 0.55;   // round columns
  // wall segments with the exit gaps cut out
  const seg = []; const wall = (ax, az, bx, bz, gaps) => { // gaps along the wall as [centre, width] (coordinate along it)
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L; let s = 0;
    gaps.sort((a, b) => a[0] - b[0]).forEach(([c, w]) => { seg.push([ax + ux * s, az + uz * s, ax + ux * (c - w / 2), az + uz * (c - w / 2)]); s = c + w / 2; });
    seg.push([ax + ux * s, az + uz * s, bx, bz]); };
  wall(X0, Z0, X1, Z0, EX.filter(e => e.nz < 0).map(e => [e.x - X0, GW])); wall(X0, Z0, X0, Z1, EX.filter(e => e.nx < 0).map(e => [e.z - Z0, GW])); wall(X1, Z0, X1, Z1, EX.filter(e => e.nx > 0).map(e => [e.z - Z0, GW])); wall(X0, Z1, X1, Z1, []);
  // people: loose groups around the concourse
  const P = []; const free = (x, z) => x > X0 + 0.8 && x < X1 - 0.8 && z > Z0 + 1.2 && z < Z1 - 0.8 && PIL.every(([px, pz]) => Math.hypot(x - px, z - pz) > PR + 0.5) && P.every(q => Math.hypot(q.x - x, q.z - z) > 2 * rad + 0.08);
  const groups = []; for (let g = 0; g < 60; g++) groups.push([X0 + 1.5 + R() * (X1 - X0 - 3), Z0 + 2.5 + R() * (Z1 - Z0 - 4)]);
  let tries = 0; while (P.length < o.N && tries < 200000) { tries++; const g = groups[(R() * groups.length) | 0], a = R() * 6.283, d = Math.sqrt(R()) * (1.5 + R() * 3.2), x = g[0] + Math.cos(a) * d, z = g[1] + Math.sin(a) * d;
    if (free(x, z)) P.push({ x, z, vx: 0, vz: 0, yaw: R() * 6.283, quick: R() < 0.07, th: 0.3 + R() * 0.45, dl: 1.2 + R() * 3.2, prim: -1, st: -1, ex: -1, red: 0, spd: 0, done: -1, look: 0, hear: o.infoAt + R() * 2.8, fam: R() < 0.88, v0: 1.7 + R() * 0.5 }); }
  const N = P.length, F = Math.round(o.T * o.fps) + 1, dt = 1 / o.fps;
  const near = (p) => EX.reduce((b, e, i) => Math.hypot(p.x - e.x, p.z - e.z) < Math.hypot(p.x - EX[b].x, p.z - EX[b].z) ? i : b, 0);
  P.forEach(p => { p.ex = p.fam ? 1 : near(p); p.quickT = 0.2 + R() * 1.6; });
  const BAR = [7.6, -8.9, 10.4, -9.8], barAt = o.barAt;   // slanted barrier in front of exit B (the obstacle effect), placed at barAt
  const out = { N, F, fps: o.fps, EX, PIL, PR, seg, X0, X1, Z0, Z1, GW, BAR, barAt,
    x: new Float32Array(N * F), z: new Float32Array(N * F), yaw: new Float32Array(N * F), st: new Uint8Array(N * F), red: new Uint8Array(N * F), look: new Float32Array(N * F),
    stats: [] };   // st: 0 waiting, 1 moving, 2 outside/leaving, 3 gone
  const CS = 1.0, grid = new Map(), key = (i, j) => i * 1000 + j;
  const build = () => { grid.clear(); P.forEach((p, i) => { if (p.done >= 0) return; const k = key(Math.floor(p.x / CS), Math.floor(p.z / CS)); let c = grid.get(k); if (!c) grid.set(k, c = []); c.push(i); }); };
  const each = (p, r, fn) => { const i0 = Math.floor((p.x - r) / CS), i1 = Math.floor((p.x + r) / CS), j0 = Math.floor((p.z - r) / CS), j1 = Math.floor((p.z + r) / CS);
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const c = grid.get(key(i, j)); if (c) for (const k of c) fn(k); } };
  const XF = [];   // frames at which someone went through a door
  for (let f = 0; f < F; f++) { const t = f * dt;
    build();
    // after the announcement: re-choose the exit (nearest, avoiding crowded ones); each person hears it at a slightly different time
    if (t >= o.infoAt) {   // after the announcement: each person (once they hear it, at slightly different times) picks the nearest exit that is not crowded, and checks again every 2 s
      const q = EX.map(e => { let n = 0; each({ x: e.x, z: e.z }, 5, k => { const r = P[k]; if (r.st === 1 && Math.hypot(r.x - e.x, r.z - e.z) < 5) n++; }); return n; });
      P.forEach((p, i) => { if (p.done >= 0 || t < p.hear || p.st === 2) return; if (p.reroute && (f + i) % 60) return;
        const cost = j => Math.hypot(p.x - EX[j].x, p.z - EX[j].z) + 0.03 * q[j];
        let best = p.reroute ? p.ex : 0; EX.forEach((e, j) => { if (cost(j) < cost(best) - (p.reroute ? 3 : 0)) best = j; });
        p.ex = best; p.reroute = true; if (p.st === 0) p.st = 1; }); }
    // each door lets about 3 people a second through; a crushed, pushing crowd at the door clogs it ("faster is slower", Helbing et al. 2000)
    EX.forEach(e => { let n = 0, r = 0; each({ x: e.x, z: e.z }, 3, k => { const q = P[k]; if (q.done < 0 && Math.hypot(q.x - e.x, q.z - e.z) < 3) { n++; r += q.red; } });
      const clog = e.id === 'B' && t >= barAt ? 0.1 : 0.7;   // the barrier takes the crowd's push off the doorway, so the door stops clogging
      e.tok = Math.min(2, (e.tok || 0) + dt * 4.5 * (1 - clog * (n ? r / n : 0))); });
    // decide who moves
    P.forEach((p, i) => { if (p.done >= 0) return;
      if (p.st < 0) p.st = 0;
      if (p.st === 0) { if (p.quick && t >= p.quickT) p.st = 1;
        else { let n = 0, m = 0, lx = 0, lz = 0; each(p, 4, k => { if (k === i) return; const q = P[k]; if (q.done >= 0) return; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d > 4) return; n++; if (q.st >= 1) { m++; lx += q.x - p.x; lz += q.z - p.z; } });
          if (m) p.look = Math.atan2(lx, lz);   // waiting people turn to watch the ones who move
          if (p.prim < 0 && m >= 2 && (m / Math.max(1, n) >= p.th || m >= 6)) p.prim = t;
          if (p.prim >= 0 && t >= p.prim + p.dl) p.st = 1; } } });
    // stress (video 20–30 s) makes people hurry; information calms them again
    const hurry = t < 17 ? 1 : t < 27 ? 1 + 0.35 * Math.min(1, (t - 17) / 4) : 1.15;
    P.forEach(p => { if (p.done >= 0) return; let dx = 0, dz = 0;
      if (p.st >= 1) { const e = EX[p.ex], s = (p.x - e.x) * e.nx + (p.z - e.z) * e.nz;
        if (s > 0.05 && p.st === 1) { if (e.tok >= 1) { e.tok--; p.st = 2; XF.push(f); } else { p.x -= e.nx * (s - 0.05); p.z -= e.nz * (s - 0.05); } }   // door capacity: people pass one by one
        let tx, tz; if (p.st === 2) { tx = e.x + e.nx * 12; tz = e.z + e.nz * 12; if (s > 6) { p.done = t; p.st = 3; return; } }
        else { tx = e.x + e.nx; tz = e.z + e.nz; }
        let c = 0; const hx = tx - p.x, hz = tz - p.z; each(p, 1, k => { const q = P[k]; if (q !== p && q.done < 0 && Math.hypot(q.x - p.x, q.z - p.z) < 1 && (q.x - p.x) * hx + (q.z - p.z) * hz > 0) c += 2; });   // only people ahead slow you down
        const dv = Math.max(0.08, 1 - c / 3.14 / 5.4);   // packed crowds slow down (speed falls as density rises)
        const L = Math.hypot(tx - p.x, tz - p.z) || 1; dx = (tx - p.x) / L * p.v0 * hurry * dv; dz = (tz - p.z) / L * p.v0 * hurry * dv; }
      if (p.st >= 1) { dx += (R() - 0.5) * 0.5; dz += (R() - 0.5) * 0.5; }   // small jostle: stops perfectly stable arches at the doors
      p.vx += (dx - p.vx) * Math.min(1, dt / 0.45); p.vz += (dz - p.vz) * Math.min(1, dt / 0.45);
      p.px = p.x; p.pz = p.z; p.x += p.vx * dt; p.z += p.vz * dt; });
    // keep people apart, out of the walls and columns
    for (let it = 0; it < 3; it++) { build();
      P.forEach((p, i) => { if (p.done >= 0) return; each(p, 2 * rad, k => { if (k <= i) return; const q = P[k]; if (q.done >= 0) return; let dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
          if (d < 2 * rad && d > 1e-6) { const s = (2 * rad - d) / 2 / d; p.x -= dx * s; p.z -= dz * s; q.x += dx * s; q.z += dz * s; } });
        for (const [ax, az, bx, bz] of seg) { const ux = bx - ax, uz = bz - az, L2 = ux * ux + uz * uz, u = Math.max(0, Math.min(1, ((p.x - ax) * ux + (p.z - az) * uz) / L2)), cx = ax + ux * u, cz = az + uz * u;
          const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = rad + 0.12; if (d < m && d > 1e-6) { p.x = cx + dx / d * m; p.z = cz + dz / d * m; } }
        if (t >= barAt) { const [ax, az, bx, bz] = BAR, ux = bx - ax, uz = bz - az, L2 = ux * ux + uz * uz, u = Math.max(0, Math.min(1, ((p.x - ax) * ux + (p.z - az) * uz) / L2)), cx = ax + ux * u, cz = az + uz * u;
          const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = rad + 0.15; if (d < m && d > 1e-6) { p.x = cx + dx / d * m; p.z = cz + dz / d * m; } }
        for (const [cx, cz] of PIL) { const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = rad + PR; if (d < m && d > 1e-6) { p.x = cx + dx / d * m; p.z = cz + dz / d * m; } } }); }
    // jammed = moving, packed and nearly stopped
    build(); let w = 0, jam = 0, gone = 0, mov = 0;
    P.forEach((p, i) => { const b = i * F + f; if (p.done >= 0) { out.st[b] = 3; out.x[b] = p.x; out.z[b] = p.z; gone++; return; }
      const sp = Math.hypot(p.x - p.px, p.z - p.pz) / dt; p.spd += (sp - p.spd) * 0.12;
      let dens = 0; each(p, 0.75, k => { if (k !== i && P[k].done < 0 && Math.hypot(P[k].x - p.x, P[k].z - p.z) < 0.75) dens++; });
      const jm = p.st === 1 && dens >= 3 && p.spd < 0.3 ? 1 : 0; p.red += (jm - p.red) * 0.08;
      if (sp > 0.15) { const ty = Math.atan2(p.x - p.px, p.z - p.pz); let d = ty - p.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); p.yaw += d * 0.18; }
      else if (p.st === 0 && p.look) { let d = p.look - p.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); p.yaw += d * 0.03; }
      out.x[b] = p.x; out.z[b] = p.z; out.yaw[b] = p.yaw; out.st[b] = p.st; out.red[b] = Math.round(p.red * 255);
      if (p.st === 0) w++; else mov++; if (p.red > 0.5) jam++; });
    let rc = 0; for (let k = XF.length - 1; k >= 0 && XF[k] > f - 90; k--) rc++;
    out.stats.push([w, mov, jam, gone, rc * 20]); }   // last value: people leaving per minute (last 3 s)
  return out;
}
if (typeof module !== 'undefined') module.exports = { runSim };
