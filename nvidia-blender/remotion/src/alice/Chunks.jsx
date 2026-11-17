// Short caption chunks (2-4 words) that swap with the voice. Replaces full-sentence captions.
// chunks: [[text, color?], ...] spread evenly over t0..t1 (seconds, scene-local).
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, BODY, SAFE, ramp } from '../theme';

export const Chunks = ({ chunks, t0, t1, top = 1290 }) => {
  const f = useCurrentFrame(), t = f / 30;
  if (t < t0 || t > t1 + 0.4) return null;
  const n = chunks.length, span = (t1 - t0) / n;
  const i = Math.min(n - 1, Math.floor((t - t0) / span));
  const [txt, col] = chunks[i];
  const a = ramp(f, t0 + i * span, 0.08);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center' }}>
      <span style={{ font: `800 64px/1.1 ${BODY}`, color: col || C.white, opacity: a, display: 'inline-block',
        transform: `scale(${0.92 + 0.08 * a})`, textShadow: '0 0 10px #000, 0 4px 18px #000, 0 0 3px #000' }}>{txt}</span>
    </div>
  );
};
