import { AbsoluteFill } from 'remotion';

// Scales a whole graphic scene down about a point so its labels land inside the safe zone (see Guides.tsx);
// the scene's own background colour fills the frame edge to edge behind it.
export const Fit: React.FC<{ s: number; ox?: number; oy: number; dy?: number; bg: string; children: React.ReactNode }> = ({ s, ox = 540, oy, dy = 0, bg, children }) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `translateY(${dy}px) scale(${s})` }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
