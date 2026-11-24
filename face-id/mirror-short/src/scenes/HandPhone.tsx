import { AbsoluteFill, Img, staticFile } from 'remotion';
import { ramp } from '../theme';

// The phone in his hand (public/hook_closeup.png), used for the end of the hook and all of scene 2.
// f = frames from the cut to this shot (1.5 s into the Short).
//   0– 30  end of the hook: quick push toward the phone he is holding
//  30– 50  one quick zoom to the top of that phone
//  80–135  Face ID animation on its own Dynamic Island: the island grows into a rounded square and
//          the green face glyph draws itself (no checkmark: the result is never shown here)
const K = 1080 / 752, TOP = -5;                        // still is 752 x 1344, shown full-bleed
const ISL = { x: 377 * K, y: 183 * K + TOP, w: 112 * K, h: 32 * K };   // its Dynamic Island on screen at scale 1
const TARGET = { x: 540, y: 490 };                     // where the island sits after the zoom
const GREEN = '#8ff58a';
const out3 = (x: number) => 1 - Math.pow(1 - x, 3), io = (x: number) => x * x * (3 - 2 * x);

export const HandPhone: React.FC<{ f: number }> = ({ f }) => {
  const z = ramp(f, 30, 50, 0, 1, io);
  const s = (1 + 0.1 * ramp(f, 0, 30, 0, 1, out3)) * (1 + 0.72 * z) * (1 + 0.05 * ramp(f, 50, 135));
  const tx = (TARGET.x - ISL.x) * z, ty = (TARGET.y - ISL.y) * z;
  // island on screen now
  const cx = ISL.x + tx, cy = ISL.y + ty, w0 = ISL.w * s, h0 = ISL.h * s, top = cy - h0 / 2;
  const grow = ramp(f, 80, 92, 0, 1, out3);
  const side = w0 * 1.42, w = w0 + (side - w0) * grow, h = h0 + (side - h0) * grow, r = h0 / 2 + (side * 0.27 - h0 / 2) * grow;
  const u = w0 / 45.2;                                  // one "island unit" in px
  const gy = top + h / 2 + 3 * u * grow, R = 17.5 * u, C2 = 2 * Math.PI * R;
  const ring = ramp(f, 90, 104, 0, 1, io), face = ramp(f, 98, 108);
  const pulse = 1 + 0.03 * Math.sin((f - 108) / 4) * ramp(f, 108, 112);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${ISL.x}px ${ISL.y}px`, transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile('hook_closeup.png')} style={{ position: 'absolute', left: 0, top: TOP, width: 1080, height: 1344 * K }} />
      </div>
      {f >= 78 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ramp(f, 78, 80) }}>
        <rect x={cx - w / 2} y={top} width={w} height={h} rx={r} fill="#000" />
        <circle cx={cx + w / 2 - 9.5 * u} cy={top + 6.6 * u} r={2.6 * u} fill="#141a2a" opacity={0.9 * grow} />
        <g transform={`translate(${cx} ${gy}) scale(${pulse})`} stroke={GREEN} strokeWidth={2.3 * u} strokeLinecap="round" fill="none">
          <circle r={R} strokeDasharray={`${C2 * ring} ${C2}`} transform="rotate(-90)" />
          <g opacity={face}>
            <path d={`M ${-6.6 * u} ${-6.2 * u} v ${3.6 * u}`} /><path d={`M ${6.6 * u} ${-6.2 * u} v ${3.6 * u}`} />
            <path d={`M ${0.8 * u} ${-6.2 * u} v ${6.4 * u} q 0 ${2.4 * u} ${-2.6 * u} ${2.4 * u}`} />
            <path d={`M ${-6.2 * u} ${6.4 * u} q ${6.2 * u} ${5.4 * u} ${12.4 * u} 0`} />
          </g>
        </g>
      </svg>}
    </AbsoluteFill>
  );
};
