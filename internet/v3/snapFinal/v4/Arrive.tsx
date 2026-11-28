import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, lerp, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Night } from '../dusk/Extras';
import { IPhone, Bubble } from '../dusk/Phone';

/* Step 8 of Part 2 (9:16 only): Arjun's phone. The packets land jumbled, sort themselves by number, and the photo appears. */
export const ARRIVE_FRAMES = 180;
const K = 2.2, LEFT = 280, TOP = 330;                      // phone scale and position (canvas px)
const PX = LEFT + 23 * K, PY = TOP + 165 * K, PS = 190 * K; // the photo frame on his screen
const G = 6, N = G * G, CELL = PS / G;
const NUMS = Array.from({ length: N }, (_, i) => 12 + Math.round(i * 55.3 + hash(i + 3) * 30)); // packet numbers, ascending with i
const JUMBLE = Array.from({ length: N }, (_, i) => i).sort((a, b) => hash(a + 50) - hash(b + 50)); // slot -> packet
const slotOf = (pk: number) => JUMBLE.indexOf(pk);
const cell = (s: number): [number, number] => [PX + (s % G) * CELL, PY + Math.floor(s / G) * CELL];

/* the photo she took: London at night, the big wheel by the river */
export const Photo: React.FC = () => (<g>
  <defs><linearGradient id="phSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a52" /><stop offset="1" stopColor="#5a4fb8" /></linearGradient></defs>
  <rect width={190} height={190} fill="url(#phSky)" /><circle cx={158} cy={36} r={13} fill="#fff3d6" />
  {[14, 40, 72, 110, 140, 176].map((x, i) => <circle key={i} cx={x} cy={10 + (i * 11) % 36} r={1.4} fill="#fff" opacity={0.8} />)}
  <g transform="translate(84 92)"><circle r={50} fill="none" stroke="#ffd88a" strokeWidth={2.4} /><circle r={36} fill="none" stroke="#e8b866" strokeWidth={1.2} opacity={0.7} />
    {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * 6.283; return <g key={i}><line x1={0} y1={0} x2={50 * Math.cos(a)} y2={50 * Math.sin(a)} stroke="#e8b866" strokeWidth={0.8} opacity={0.7} /><circle cx={50 * Math.cos(a)} cy={50 * Math.sin(a)} r={2.6} fill="#fff1d0" /></g>; })}
    <path d="M -2 0 L -22 62 M 2 0 L 22 62" stroke="#c9a15a" strokeWidth={2.4} /></g>
  <path d="M 0 140 L 36 132 L 36 124 L 50 124 L 50 134 L 120 134 L 120 120 L 150 120 L 150 136 L 190 130 L 190 190 L 0 190 Z" fill="#0d1240" />
  {[40, 62, 130, 142, 160].map((x, i) => <rect key={i} x={x} y={142 + (i % 2) * 6} width={4} height={5} fill="#ffd88a" />)}
  <rect y={156} width={190} height={34} fill="#1d2a78" /><path d="M 0 162 L 190 162 M 0 172 L 190 172" stroke="#8fa0ff" strokeWidth={1} opacity={0.35} />
</g>);

export const Arrive: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const pop = prog(f, 0, 0.5, easeOut), sort = prog(f, 2.7, 3.7, easeInOut), photo = prog(f, 4.0, 4.9, easeOut), glow = prog(f, 4.9, 5.4, easeOut);
  const stage = t < 2.7 ? 'packets arrive, jumbled' : t < 4.0 ? 'sorted by number' : 'photo complete';
  const zoom = 1 + 0.05 * easeInOut(Math.min(1, t / 6));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><Night id="ar" f={f} stars={90} /></svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '540px 760px' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 232, display: 'flex', justifyContent: 'center', opacity: pop }}>
          <div style={{ padding: '12px 30px', borderRadius: 30, background: 'rgba(10,14,36,.88)', border: `3px solid ${t > 4.0 ? '#7dffb0' : '#5fe3ff'}`, font: `800 36px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{stage}</div>
        </div>
        <IPhone v18 left={LEFT} top={TOP} o={pop} name="Meera" avatar="#e0705a" k={K}>
          <Bubble style={{ margin: '8px 10px 0' }}>Look at this!</Bubble>
          <div style={{ position: 'absolute', left: 14, top: 69, width: 190, height: 190, borderRadius: 14, background: '#14183c', border: '1px dashed #3a4190', boxSizing: 'border-box' }} />
        </IPhone>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={photo} transform={`translate(${PX} ${PY}) scale(${K})`}><clipPath id="phClip"><rect width={190} height={190} rx={6} /></clipPath><g clipPath="url(#phClip)"><Photo /></g></g>
          {glow > 0 && <rect x={PX - 8} y={PY - 8} width={PS + 16} height={PS + 16} rx={20} fill="none" stroke="#7dffb0" strokeWidth={5} opacity={glow * (0.55 + 0.25 * Math.sin(t * 8))} />}
          {Array.from({ length: N }).map((_, pk) => {
            const rank = pk, fromSlot = slotOf(pk), [jx, jy] = cell(fromSlot), [sx, sy] = cell(rank);
            const a0 = 0.25 + hash(pk + 9) * 1.9, land = prog(f, a0, a0 + 0.6, easeOut);                 // flies in, one after another
            const ang = hash(pk + 21) * 6.283, ox = 540 + Math.cos(ang) * 900, oy = 760 + Math.sin(ang) * 1100; // starts far off screen
            const sm = easeInOut(Math.min(1, Math.max(0, (sort * 1.35) - (rank / N) * 0.35)));
            const x = lerp(lerp(ox, jx, land), sx, sm), y = lerp(lerp(oy, jy, land), sy, sm);
            const fade = 1 - prog(f, 4.0 + (rank / N) * 0.5, 4.5 + (rank / N) * 0.5, easeOut);
            if (land <= 0 || fade <= 0) return null;
            return <g key={pk} opacity={Math.min(1, land * 1.6) * fade}>
              <rect x={x + 1.5} y={y + 1.5} width={CELL - 3} height={CELL - 3} rx={8} fill={sm > 0.95 ? '#9ff0c0' : '#bfeaff'} stroke="#12436a" strokeWidth={2} />
              <text x={x + CELL / 2} y={y + CELL / 2 + 7} textAnchor="middle" fill="#12436a" style={{ font: `800 ${CELL > 60 ? 20 : 16}px ${FONT.mono}` }}>#{String(NUMS[pk]).padStart(4, '0')}</text></g>;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
