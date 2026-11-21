// InvisiTech Short · "How You'd Invent Air Conditioning" · 1080x1920 · 30 fps · 1350 frames (45 s).
// 0-18 s: 3/4 living room (window, fan, ice). 18-40 s: flat 2D side cutaway. 40-43 s: exact opening composition
// (thermometer payoff). Frame 1290: InvisiTech end card (1290-1349).
// Safe zones: top 0-220 empty · subject 450-1500 · captions 1250-1450 · nothing important 1500-1920 or right of
// x 940 below y 1100.
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { World, Defs } from './Room';
import { Cutaway2D } from './Cutaway2D';
import { W, H, STORY_END, CAPTIONS, camera, camera2d, cutMix, clamp, lerp, ramp, eout } from './timeline';

// ---- Voice-over slot: put the narration at public/audio/vo.wav (music: public/audio/music.wav) and set to true.
// Captions are timed to VO_LINES in timeline.js.
const HAS_VO = false;
const HAS_MUSIC = false;

const NAVY = '#0B1E3F', ORANGE = '#F26B21';
const FONT = 'InterDisplay, Inter, system-ui, sans-serif';

const FontFace = () => (
  <style>{`@font-face { font-family: 'InterDisplay'; src: url('${staticFile('fonts/InterDisplay-Bold.otf')}') format('opentype'); font-weight: 100 900; }`}</style>
);

const tf = ({ cx, cy, z }) => `translate(540 960) scale(${z}) translate(${-cx} ${-cy})`;

/** both views in one SVG: 3/4 room (with parallax) and the flat 2D cutaway, cross-faded on the AC anchor */
export const Scene = ({ f }) => {
  const m = cutMix(f);
  const c = camera(f);
  const par = { x: (540 - c.cx) * 0.12, y: (960 - c.cy) * 0.12 };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      <rect width={W} height={H} fill="#F2E3CC" />
      {m < 1 && <g transform={tf(c)}><World f={f} par={par} /></g>}
      {m > 0 && <g opacity={m} transform={tf(camera2d(f))}><Cutaway2D f={f} /></g>}
    </svg>
  );
};

// ---- opening title (title zone 220-450), first 2.6 s only (no scene badges)
const Title = ({ f }) => {
  const a = 1 - ramp(f, 66, 80);
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 90, right: 140, top: 236, opacity: a }}>
      <div style={{ font: `800 30px ${FONT}`, letterSpacing: 6, color: ORANGE }}>HOW YOU’D INVENT</div>
      <div style={{ font: `900 76px/1 ${FONT}`, letterSpacing: -1.5, color: NAVY }}>AIR CONDITIONING</div>
    </div>
  );
};

// ---- "Later" cue while the thermometer falls (payoff)
const Later = ({ f }) => {
  const a = ramp(f, 1218, 1228, eout) * (1 - ramp(f, 1276, 1288));
  if (a <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 90, top: 470, opacity: a, transform: `translateY(${(1 - a) * 10}px)`,
      padding: '10px 22px', borderRadius: 999, background: 'rgba(11,30,63,.88)', color: '#fff', font: `800 34px ${FONT}`, letterSpacing: 1 }}>
      Later…
    </div>
  );
};

// ---- captions (1290-1440, x 90-900)
const Captions = ({ f }) => {
  const t = f / 30;
  const c = CAPTIONS.find((k) => t >= k.from && t < k.to);
  if (!c || f >= STORY_END) return null;
  const a = clamp((t - c.from) / 0.08);
  const words = c.text.split(' ');
  const key = /(hotter|hot|fan|ice|puddle|heat|indoor|outdoor|coil\.?|cycle|moisture|hose\.?|drop\.?|roasting\.?)/i;
  return (
    <div style={{ position: 'absolute', left: 90, width: 810, top: 1290, display: 'flex', justifyContent: 'center', opacity: a }}>
      <div style={{ maxWidth: 810, padding: '12px 26px', borderRadius: 22, background: 'rgba(11,30,63,.86)', textAlign: 'center',
        font: `800 52px/1.18 ${FONT}`, color: '#fff', transform: `scale(${lerp(0.94, 1, a)})`, boxShadow: '0 10px 30px rgba(11,30,63,.25)' }}>
        {words.map((w, i) => <span key={i} style={{ color: key.test(w) ? '#FFB37D' : '#fff' }}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
      </div>
    </div>
  );
};

const Disclaimer = ({ f }) => {
  const a = ramp(f, 640, 660) * (1 - ramp(f, 1190, 1200));
  return a > 0 ? <div style={{ position: 'absolute', left: 90, top: 1462, font: `700 22px ${FONT}`, color: 'rgba(11,30,63,.75)', opacity: a }}>Illustrative · not to scale</div> : null;
};

// ---- end card: centred logo + wordmark on a clean background
const EndCard = ({ f }) => {
  const g = f - STORY_END;
  if (g < 0) return null;
  const a = ramp(g, 0, 8, eout), b = ramp(g, 4, 16, eout);
  return (
    <AbsoluteFill style={{ background: '#F7F1E8', opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, transform: `translateY(-40px) scale(${lerp(0.92, 1, b)})`, opacity: b }}>
        <Img src={staticFile('brand/invisitech-logo.png')} style={{ width: 190, height: 190, borderRadius: 999, boxShadow: '0 14px 40px rgba(11,30,63,.25)' }} />
        <div style={{ font: `900 104px ${FONT}`, letterSpacing: -3, color: NAVY }}>Invisi<span style={{ color: ORANGE }}>Tech</span></div>
      </div>
    </AbsoluteFill>
  );
};

export const AirConditioning = () => {
  const f = useCurrentFrame();
  const sf = Math.min(f, STORY_END - 1);
  return (
    <AbsoluteFill style={{ background: '#F2E3CC' }}>
      <FontFace />
      <Scene f={sf} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 40% 45%, transparent 62%, rgba(70,40,15,.16) 100%)', pointerEvents: 'none' }} />
      <Title f={f} />
      <Later f={f} />
      <Disclaimer f={f} />
      <Captions f={f} />
      <EndCard f={f} />
      {HAS_VO && <Audio src={staticFile('audio/vo.wav')} />}
      {HAS_MUSIC && <Audio src={staticFile('audio/music.wav')} volume={0.12} />}
    </AbsoluteFill>
  );
};
