import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, ramp } from '../theme';

// Scene 6 when the real mirror-test clip has not been added: a "guess the result" ending.
// It shows NO result — both outcomes stay open — so nothing here pretends to be the real test.
const SCREEN = [700, 545];   // reflected phone screen in bathroom_rear.png (941 x 1672)
const K = 1080 / 941;

const Chip: React.FC<{ text: string; on: boolean; x: number; o: number }> = ({ text, on, x, o }) => (
  <div style={{ position: 'absolute', left: x, top: 1330, width: 400, textAlign: 'center', opacity: o, padding: '26px 0', borderRadius: 24,
    font: `800 44px/1 ${FONT}`, letterSpacing: '0.04em', color: on ? '#141010' : C.text,
    background: on ? C.amber : 'rgba(18,13,10,.72)', border: `3px solid ${C.amber}`, transform: `scale(${on ? 1.05 : 1})` }}>{text}</div>
);

export const Guess: React.FC = () => {
  const l = useCurrentFrame();
  const s = 1 + 0.55 * ramp(l, 0, 12) + 0.06 * (l / 210);      // one quick push toward the mirror, then a slow drift
  const ox = SCREEN[0] * K, oy = SCREEN[1] * K;
  const left = Math.floor(l / 14) % 2 === 0;
  const show = ramp(l, 14, 18);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <Img src={staticFile('bathroom_rear.png')} style={{ position: 'absolute', width: 1080, height: 1672 * K, top: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${(540 - ox) * ramp(l, 0, 12) * 0.5}px, ${(760 - oy) * ramp(l, 0, 12)}px) scale(${s})`, filter: 'brightness(0.8)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,.75) 78%)' }} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1140, textAlign: 'center', opacity: show, font: `800 64px/1.1 ${FONT}`, color: C.text, textShadow: '0 4px 16px #000' }}>What's your guess?</div>
      <Chip text="UNLOCKS" on={left} x={70} o={show} />
      <Chip text="STAYS LOCKED" on={!left} x={540} o={show} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1470, textAlign: 'center', opacity: ramp(l, 60, 64), font: `600 34px/1 ${FONT}`, color: '#d8cfc4' }}>Comment before the real test ↓</div>
    </AbsoluteFill>
  );
};
