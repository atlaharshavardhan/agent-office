import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { headDots, turnDot } from './dotHead';
import { C, FONT, clamp, ramp } from '../theme';

// Scene 6 without real footage: the answer, shown on the match ring (an illustration, not test footage).
// result 'locked' -> red ring, shake, "DOES NOT MATCH", padlock stays closed.
// result 'open'   -> green ring, "MATCH", padlock opens.   Set it in src/script.ts (DEFAULT_TEST.result).
//   0–14  the ring from the mirror scene grows to the centre of the frame
//  14–62  comparing: a white arc circles the ring while his head turns LEFT, RIGHT, UP, then DOWN
//  62–    the result lands (viewers see it before the narration says it)
const TICKS = 96, GREEN = '#59d98a', HIT = 62;
// head turn while comparing: [frame, yaw, pitch]  (yaw -1 = left, +1 = right; pitch -1 = up, +1 = down)
const TURN = [[14, 0, 0], [24, -1, 0], [37, 1, 0], [44, 0, 0], [50, 0, -1], [58, 0, 1], [62, 0, 0]];
const turn = (l: number, c: 1 | 2) => interpolate(l, TURN.map((t) => t[0]), TURN.map((t) => t[c]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x) });
const DOTS = headDots(0.7);
const io = (x: number) => x * x * (3 - 2 * x);

export const Result: React.FC<{ result: 'locked' | 'open' }> = ({ result }) => {
  const l = useCurrentFrame();
  const bad = result === 'locked', col = bad ? '#ff2d46' : GREEN;
  const g = ramp(l, 0, 14, 0, 1, io), done = l >= HIT, hit = ramp(l, HIT, HIT + 4);
  const cx = interpolate(g, [0, 1], [270, 540], clamp), cy = interpolate(g, [0, 1], [1320, 800], clamp), k = interpolate(g, [0, 1], [190 / 300, 1], clamp), R = 300;
  const shake = bad ? Math.sin((l - HIT) * 1.7) * 26 * hit * (1 - ramp(l, HIT + 4, HIT + 22)) : 0;
  const spin = ((l - 14) / 22) % 1;
  // after the result the head settles into a small, slow roll
  const yaw = done ? 0.35 * Math.cos((l - HIT) / 14) * ramp(l, HIT, HIT + 20) : turn(l, 1), pitch = done ? 0.35 * Math.sin((l - HIT) / 14) * ramp(l, HIT, HIT + 20) : turn(l, 2);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070606', overflow: 'hidden' }}>
      <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: -200, top: -150, width: 1480, height: 2630, filter: 'blur(14px) brightness(0.22)' }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at 50% 42%, ${bad ? 'rgba(255,45,70,.16)' : 'rgba(89,217,138,.16)'}, rgba(0,0,0,0))`, opacity: hit }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${cx + shake} ${cy}) scale(${k})`}>
          <circle r={R + 34} fill="rgba(6,5,5,.86)" />
          {Array.from({ length: TICKS }, (_, i) => { const a = (i / TICKS) * 2 * Math.PI - Math.PI / 2, u = i / TICKS;
            const lit = done ? true : l >= 14 && ((u - spin + 1) % 1) < 0.22;
            const r0 = R - 24, r1 = R + (done ? 20 : 12);
            return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={done ? col : lit ? '#fff' : '#6f6a66'} strokeWidth={done ? 8 : 6} strokeLinecap="round" opacity={done || lit ? 1 : 0.55} />; })}
          {/* his face as a dot cloud: turns left, right, up, down while comparing */}
          <g>
            {DOTS.map((d, i) => { const [x, y] = turnDot(d, yaw * 24, pitch * 18); return <circle key={i} cx={x} cy={y} r={2.1} fill={done && bad ? '#ffd9de' : '#f4efe9'} opacity={0.25 + 0.75 * d[3]} />; })}
          </g>
          {/* result badge */}
          <g transform={`translate(${R * 0.72} ${R * 0.72}) scale(${hit * (1 + 0.25 * (1 - ramp(l, HIT + 4, HIT + 12)))})`}>
            <circle r={74} fill={col} stroke="#070606" strokeWidth={10} />
            {bad ? <path d="M -28 -28 L 28 28 M 28 -28 L -28 28" stroke="#fff" strokeWidth={16} strokeLinecap="round" />
              : <path d="M -32 2 L -8 26 L 34 -22" stroke="#fff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
          </g>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1200, textAlign: 'center', opacity: l < HIT ? ramp(l, 14, 18) : 0, font: `800 54px/1 ${FONT}`, color: '#fff' }}>Comparing…</div>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1190, textAlign: 'center', opacity: hit, transform: `translateX(${shake}px)` }}>
        <div style={{ font: `800 92px/1 ${FONT}`, letterSpacing: '0.01em', color: col }}>{bad ? 'DOES NOT MATCH' : 'MATCH'}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 30, padding: '16px 26px', borderRadius: 20, background: 'rgba(10,8,7,.8)', border: `3px solid ${col}`, opacity: ramp(l, HIT + 10, HIT + 16) }}>
          <svg width={46} height={60} viewBox="-36 -50 72 96">
            <path d={bad ? 'M -18 -6 v -14 a 18 18 0 0 1 36 0 v 14' : 'M -18 -6 v -18 a 18 18 0 0 1 36 0'} stroke="#fff" strokeWidth={9} strokeLinecap="round" fill="none" />
            <rect x={-30} y={-6} width={60} height={46} rx={11} fill="#fff" />
          </svg>
          <span style={{ font: `800 44px/1 ${FONT}`, color: '#fff' }}>{bad ? 'Face ID stays locked' : 'Face ID unlocks'}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * hit, font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration of the result</div>
    </AbsoluteFill>
  );
};
