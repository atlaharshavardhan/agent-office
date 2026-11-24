import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ramp } from './theme';

// Camera layer for one scene, in the style of the reference: the picture never sits still.
//  - enter: the scene lands with a fast zoom-settle (1.45x -> 1x in 7 frames, with blur)
//  - exit:  the last 5 frames rush forward (1x -> 1.7x, with blur) into the next scene
//  - drift: a constant slow push for the whole scene
//  - punches: [from, to, scale, originX, originY]  quick push-in on a detail, held, then back
//  - snaps:   [frame, scale]  an instant zoom-settle on an internal cut
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);
export type Punch = [number, number, number, number, number];

export const Shot: React.FC<{ dur: number; enter?: boolean; exit?: boolean; drift?: number; punches?: Punch[]; snaps?: [number, number][]; children: React.ReactNode }> =
  ({ dur, enter = true, exit = true, drift = 0.05, punches = [], snaps = [], children }) => {
    const fr = useCurrentFrame();
    const e = enter ? 1 - ramp(fr, 0, 7, 0, 1, out3) : 0, x = exit ? ramp(fr, dur - 5, dur, 0, 1, (v) => v * v) : 0;
    let s = (1 + drift * (fr / dur)) * (1 + 0.45 * e) * (1 + 0.7 * x), blur = 10 * e + 12 * x;
    for (const [f, sc] of snaps) if (fr >= f) { const k = 1 - ramp(fr, f, f + 7, 0, 1, out3); s *= 1 + (sc - 1) * k; blur += 8 * k; }
    let inner: React.ReactNode = children;
    for (const [a, b, sc, ox, oy] of punches) {
      const k = ramp(fr, a, a + 6, 0, 1, out3) * (1 - ramp(fr, b - 6, b, 0, 1, io));
      inner = <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `scale(${1 + (sc - 1) * k})` }}>{inner}</AbsoluteFill>;
    }
    return (
      <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
        <AbsoluteFill style={{ transformOrigin: '540px 900px', transform: `scale(${s})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{inner}</AbsoluteFill>
      </AbsoluteFill>
    );
  };
