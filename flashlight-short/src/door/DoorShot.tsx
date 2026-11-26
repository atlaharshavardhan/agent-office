// Opening door shot, built from the supplied flattened art (public/art/door-shot.png), pixels untouched.
// Layers: door-base (the art, outline band repaired) · door-upper (hoodie, head, both arms: moves) · door-hand (fixed, on the handle).
// Legs and both shoes stay in the base and never move. The door stays shut. One short tug, then the light cuts to dim blue.
import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const DOOR_FPS = 30;
export const DOOR_FRAMES = 120;
const K = 1080 / 941;                         // art px -> frame px
const PIVOT = { x: 400 * K, y: 892 * K };      // the hem: the upper body rocks about here
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// lean (degrees, + = away from the door): quick pull, a held strain with a tremor, then a slower release
export const leanAt = (t: number, tugAt: number, peak = 2.0) => {
  const u = t - tugAt;
  if (u < 0) return 0;
  if (u < 0.2) return peak * (1 - Math.pow(1 - u / 0.2, 2.2));
  if (u < 0.34) return peak + 0.12 * Math.sin((u - 0.2) * 2 * Math.PI * 34);
  if (u < 0.9) { const k = ease((u - 0.34) / 0.56); return peak * (1 - k) - 0.28 * Math.sin(Math.PI * k) * (1 - k); }
  return 0;
};
// room light: 1 = warm, 0 = dim blue. A hard cut with a quick stutter, as the power goes.
export const lightAt = (t: number, cutAt: number) => {
  const u = (t - cutAt) * DOOR_FPS;
  if (u < 0) return 1;
  if (u < 2) return 0.05;           // out
  if (u < 3.5) return 0.65;         // flicker back
  return 0;
};

export const DoorShot: React.FC<{ tugAt?: number; cutAt?: number; sound?: boolean; push?: boolean }> = ({ tugAt = 0.9, cutAt = 3.0, sound = true, push = true }) => {
  const fr = useCurrentFrame(), t = fr / DOOR_FPS;
  const lean = leanAt(t, tugAt);
  const warm = lightAt(t, cutAt), dim = 1 - warm;
  const zoom = push ? interpolate(t, [0, 4], [1, 1.025], { extrapolateRight: 'clamp' }) : 1;
  const layer: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 };
  return (
    <AbsoluteFill style={{ background: '#2a170c' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${130 * K}px ${590 * K}px`, filter: `saturate(${1 - 0.25 * dim}) brightness(${1 - 0.12 * dim})` }}>
        <Img src={staticFile('art/door-base.png')} style={layer} />
        <div style={{ ...layer, transform: `rotate(${lean}deg)`, transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}>
          <Img src={staticFile('art/door-upper.png')} style={layer} />
        </div>
        <Img src={staticFile('art/door-hand.png')} style={layer} />
        {/* the power cut: warm light to dim blue */}
        <div style={{ ...layer, background: '#4a63c8', mixBlendMode: 'multiply', opacity: 0.92 * dim }} />
        <div style={{ ...layer, background: '#3552d8', mixBlendMode: 'color', opacity: 0.62 * dim }} />
        <div style={{ ...layer, background: 'radial-gradient(circle at 12% 34%, rgba(110,150,255,0.22), rgba(110,150,255,0) 55%)', mixBlendMode: 'screen', opacity: dim }} />
      </AbsoluteFill>
      {sound && <>
        <Sequence from={Math.round(tugAt * DOOR_FPS) - 2}><Audio src={staticFile('sfx/rattle.wav')} volume={0.55} /></Sequence>
        <Sequence from={Math.round(cutAt * DOOR_FPS) - 8}><Audio src={staticFile('sfx/powercut.wav')} volume={0.5} /></Sequence>
      </>}
    </AbsoluteFill>
  );
};
