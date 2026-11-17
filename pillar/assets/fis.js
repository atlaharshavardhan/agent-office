/* Faster-is-slower crowd simulation: social force model (Helbing, Farkas & Vicsek, Nature 2000).
   Physics only — nothing about the result is scripted. Both runs use the same people, the same start
   positions, the same reaction delays and the same room; only the desired speed v0 differs.
   Room: x in [X0,X1], z in [Z0,Z1] (metres); one exit of width DW in the wall at z = Z0, centred at x = 0. */
function runFIS(o) {
  o = Object.assign({ N: 200, v0: 2, seed: 5, DW: 1.0, X0: -4.5, X1: 4.5, Z0: -7.5, Z1: 7.5, fps: 30, Tmax: 240, dt: 0.002, PIL: null, NOISE: 0 }, o);
  const PIL = o.PIL;   // optional round pillar [x, z, radius] in front of the exit
  const { N, v0, DW, X0, X1, Z0, Z1, fps, Tmax } = o; const spf = Math.round(1 / fps / o.dt), dt = 1 / fps / spf;   // whole number of physics steps per video frame
  let s = o.seed; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const m = 80, tau = 0.5, A = 2000, B = 0.08, k = 1.2e5, kap = 2.4e5;
  // walls as segments (the exit is a gap in the z = Z0 wall), plus short door jambs so the doorway has depth
  const hw = DW / 2, J = 0.6;
  const W = [[X0, Z0, -hw, Z0], [hw, Z0, X1, Z0], [X1, Z0, X1, Z1], [X1, Z1, X0, Z1], [X0, Z1, X0, Z0], [-hw, Z0, -hw, Z0 - J], [hw, Z0, hw, Z0 - J]];
  // people: radius 0.25–0.35 m (as in the paper), random non-overlapping start positions, reaction delay 0.2–2.4 s
  const x = new Float64Array(N), z = new Float64Array(N), vx = new Float64Array(N), vz = new Float64Array(N), r = new Float64Array(N), dl = new Float64Array(N);
  // start positions: a jittered grid over the room (never overlapping), shuffled so radius and delay are random per spot
  const sx = X1 - X0 - 1, sz = Z1 - Z0 - 2.1, cols = Math.ceil(Math.sqrt(N * sx / sz)), rows = Math.ceil(N / cols), cw = sx / cols, ch = sz / rows, spots = [];
  for (let a = 0; a < cols; a++) for (let b = 0; b < rows; b++) spots.push([X0 + 0.5 + (a + 0.5) * cw, Z0 + 1.6 + (b + 0.5) * ch]);
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
  for (let i = 0; i < N; i++) { r[i] = 0.25 + R() * 0.1; dl[i] = 0.2 + R() * 2.2; const jx = Math.max(0, cw / 2 - r[i] - 0.03), jz = Math.max(0, ch / 2 - r[i] - 0.03);
    x[i] = spots[i][0] + (R() * 2 - 1) * jx; z[i] = spots[i][1] + (R() * 2 - 1) * jz; }
  const nzx = new Float64Array(N), nzz = new Float64Array(N), fx = new Float64Array(N), fz = new Float64Array(N), P = new Float64Array(N), out = new Int32Array(N).fill(-1);
  const nF = Math.ceil(Tmax * fps) + 1, X = new Float32Array(N * nF), Z = new Float32Array(N * nF), PR = new Uint8Array(N * nF), SP = new Uint8Array(N * nF);
  const exitedAt = []; const CS = 1.0, gx = Math.ceil((X1 - X0) / CS) + 2, gz = Math.ceil((Z1 - Z0 + 4) / CS) + 2; const head = new Int32Array(gx * gz), nxt = new Int32Array(N);
  let f = 0, left = N, endFrame = nF - 1;
  for (let step = 0; ; step++) {
    const t = step * dt;
    if (step % spf === 0) { for (let i = 0; i < N; i++) { const b = i * nF + f; X[b] = x[i]; Z[b] = z[i]; PR[b] = Math.min(255, P[i] / 40); SP[b] = Math.min(255, Math.hypot(vx[i], vz[i]) * 40); }
      f++; if (left === 0 || f >= nF) { endFrame = f - 1; break; } }
    head.fill(-1); for (let i = 0; i < N; i++) { if (out[i] >= 0) continue; const cx = Math.floor((x[i] - X0) / CS) + 1, cz = Math.floor((z[i] - Z0 + 3) / CS) + 1; const c = cx * gz + cz; nxt[i] = head[c]; head[c] = i; }
    for (let i = 0; i < N; i++) { fx[i] = 0; fz[i] = 0; P[i] = 0; }
    for (let i = 0; i < N; i++) { if (out[i] >= 0) continue;
      // driving force toward the doorway (aim at the closest point of the opening, then straight out)
      if (t >= dl[i]) { let tx = Math.max(-hw + r[i], Math.min(hw - r[i], x[i])), tz = (Math.abs(x[i]) > hw && z[i] > Z0 + 0.1) ? Z0 + 0.35 : Z0 - 1; if (z[i] < Z0 + 0.05) tx = x[i] * 0.9;   // off to the side: head for the mouth of the door, not through the wall
        if (PIL) { // pillar in the way? head for the nearer side of it instead (people steer around obstacles)
          const ux = tx - x[i], uz = tz - z[i], uL = Math.hypot(ux, uz) || 1, px = PIL[0] - x[i], pz = PIL[1] - z[i], u = (px * ux + pz * uz) / uL;
          const side = (ux * pz - uz * px) / uL, clr = PIL[2] + r[i] + 0.15;
          if (u > 0 && u < uL && Math.abs(side) < clr) { const sg = side > 0 ? -1 : 1, nX = -uz / uL * sg, nZ = ux / uL * sg; tx = PIL[0] + nX * (clr + 0.1); tz = PIL[1] + nZ * (clr + 0.1); } }
        const dx = tx - x[i], dz = tz - z[i], L = Math.hypot(dx, dz) || 1;
        fx[i] += m * (v0 * dx / L - vx[i]) / tau; fz[i] += m * (v0 * dz / L - vz[i]) / tau; }
      else { fx[i] += -m * vx[i] / tau; fz[i] += -m * vz[i] / tau; }
      if (o.NOISE) { if (step % 50 === 0) { nzx[i] = (R() * 2 - 1) * o.NOISE; nzz[i] = (R() * 2 - 1) * o.NOISE; } fx[i] += nzx[i]; fz[i] += nzz[i]; }   // small random jostle, renewed every 0.1 s (fluctuation term of the model)
      const cx = Math.floor((x[i] - X0) / CS) + 1, cz = Math.floor((z[i] - Z0 + 3) / CS) + 1;
      for (let a = cx - 1; a <= cx + 1; a++) for (let b2 = cz - 1; b2 <= cz + 1; b2++) { if (a < 0 || b2 < 0 || a >= gx || b2 >= gz) continue;
        for (let j = head[a * gz + b2]; j >= 0; j = nxt[j]) { if (j <= i) continue;
          const dx = x[i] - x[j], dz = z[i] - z[j], d = Math.hypot(dx, dz) || 1e-6, nx = dx / d, nz = dz / d, rij = r[i] + r[j], ov = rij - d;
          let fn = A * Math.exp(ov / B), ft = 0;
          if (ov > 0) { fn += k * ov; const tX = -nz, tZ = nx, dvt = (vx[j] - vx[i]) * tX + (vz[j] - vz[i]) * tZ; ft = kap * ov * dvt; P[i] += k * ov; P[j] += k * ov; }
          const Fx = fn * nx + ft * -nz, Fz = fn * nz + ft * nx; fx[i] += Fx; fz[i] += Fz; fx[j] -= Fx; fz[j] -= Fz; } } 
      for (const [ax, az, bx, bz] of W) { const ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez, u = Math.max(0, Math.min(1, ((x[i] - ax) * ex + (z[i] - az) * ez) / L2)), qx = ax + u * ex, qz = az + u * ez;
        const dx = x[i] - qx, dz = z[i] - qz, d = Math.hypot(dx, dz) || 1e-6; if (d > 2) continue; const nx = dx / d, nz = dz / d, ov = r[i] - d;
        let fn = A * Math.exp(ov / B), ft = 0; if (ov > 0) { fn += k * ov; ft = -kap * ov * (vx[i] * -nz + vz[i] * nx); P[i] += k * ov; }
        fx[i] += fn * nx + ft * -nz; fz[i] += fn * nz + ft * nx; }
      if (PIL) { const dx = x[i] - PIL[0], dz = z[i] - PIL[1], dc = Math.hypot(dx, dz) || 1e-6, d = dc - PIL[2];
        if (d < 2) { const nx = dx / dc, nz = dz / dc, ov = r[i] - d; let fn = A * Math.exp(ov / B), ft = 0;
          if (ov > 0) { fn += k * ov; ft = -kap * ov * (vx[i] * -nz + vz[i] * nx); P[i] += k * ov; }
          fx[i] += fn * nx + ft * -nz; fz[i] += fn * nz + ft * nx; } } }
    for (let i = 0; i < N; i++) { if (out[i] >= 0) continue; vx[i] += fx[i] / m * dt; vz[i] += fz[i] / m * dt; const sp = Math.hypot(vx[i], vz[i]), cap = Math.max(v0 * 1.3, 1.5); if (sp > cap) { vx[i] *= cap / sp; vz[i] *= cap / sp; }
      x[i] += vx[i] * dt; z[i] += vz[i] * dt; if (z[i] < Z0 - J - 0.3) { out[i] = f; left--; exitedAt.push(t); } }
  }
  return { o, N, nF, frames: endFrame + 1, fps, X, Z, PR, SP, out, r, dl, exitedAt, total: exitedAt.length === N ? exitedAt[N - 1] : null };
}
if (typeof module !== 'undefined') module.exports = { runFIS };
