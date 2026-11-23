import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import { Easing, interpolate } from 'remotion';

export const FONT = 'Inter, system-ui, sans-serif';
export const C = {
  bg: '#120d0a',            // warm near-black, like the bathroom shadows
  amber: '#f0a85a',
  violet: '#a993e6',        // muted violet = infrared (explainer colour)
  violetDim: '#7d6bb8',
  ir: '#ff3d5e',             // infrared dots / beam: bright red so they read on skin
  irCore: '#fff1f3',
  text: '#f6f1ea',
  label: '#e9e2ff',
};
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = Easing.bezier(0.25, 0.1, 0.25, 1);
export const ramp = (fr: number, a: number, b: number, from = 0, to = 1, e = ease) =>
  interpolate(fr, [a, b], [from, to], { ...clamp, easing: e });

// Face stills are 752 x 1344; shown full-bleed at 1080 wide.
export const FACE = { w: 752, h: 1344, s: 1080 / 752 };

export const Label: React.FC<{ text: string; x: number; y: number; o: number; size?: number; align?: 'left' | 'center'; color?: string }> =
  ({ text, x, y, o, size = 34, align = 'left', color = C.violet }) => (
    <div style={{
      position: 'absolute', left: x, top: y, opacity: o, transform: align === 'center' ? 'translateX(-50%)' : undefined,
      font: `800 ${size}px/1 ${FONT}`, letterSpacing: '0.14em', color: C.label,
      padding: '12px 18px', borderRadius: 10, background: 'rgba(18,13,10,0.62)',
      border: `2px solid ${color}`, whiteSpace: 'nowrap',
    }}>{text}</div>
  );
