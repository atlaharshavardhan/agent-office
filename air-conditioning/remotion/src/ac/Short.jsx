// InvisiTech Short · "How You'd Invent Air Conditioning" · 1080x1920 · 30 fps · 1350 frames (45 s).
// Story 0-43 s (frames 0-1289), InvisiTech end card 43-45 s (1290-1349).
// Safe zones (InvisiTech rule 16): top 0-220 empty · titles 220-450 · subject 450-1500 · captions 1250-1450 ·
// nothing 1500-1920 · nothing important right of x 940 below y 1100.
import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { World, Defs } from './Room';
import { W, H, STORY_END, SCENES, CAPTIONS, camera, clamp, lerp, ramp, eout } from './timeline';

// ---- Voice-over slot: drop the narration at public/audio/vo.wav (and optional music at public/audio/music.wav),
// then set these to true. Captions are already timed to VO_LINES in timeline.js.
const HAS_VO = false;
const HAS_MUSIC = false;

const NAVY = '#0B1E3F', ORANGE = '#F26B21', CYAN = '#3EC7E8';
const FONT = 'InterDisplay, Inter, system-ui, sans-serif';

const FontFace = () => (
  <style>{`@font-face { font-family: 'InterDisplay'; src: url('${staticFile('fonts/InterDisplay-Bold.otf')}') format('opentype'); font-weight: 100 900; }`}</style>
);

/** the room through the camera; parallax = offset relative to the opening composition, so 0 at the opening/ending */
export const Scene = ({ f, cam }) => {
  const { cx, cy, z } = cam;
  const par = { x: (540 - cx) * 0.12, y: (960 - cy) * 0.12 };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
      <Defs />
      <rect width={W} height={H} fill="#F2E3CC" />
      <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}>
        <World f={f} par={par} />
      </g>
    </svg>
  );
};

// ---- title / step tag (title zone 220-450)
const TitleZone = ({ f }) => {
  if (f >= STORY_END) return null;
  const hook = 1 - ramp(f, 78, 96);
  const sc = SCENES.find((s) => f >= s.from && f < s.to) || SCENES[0];
  const tIn = ramp(f, sc.from + (sc.from === 0 ? 70 : 0), sc.from + (sc.from === 0 ? 84 : 10)), tOut = ramp(f, sc.to - 8, sc.to);
  return (
    <>
      {hook > 0 && (
        <div style={{ position: 'absolute', left: 90, right: 140, top: 236, opacity: hook }}>
          <div style={{ font: `800 30px ${FONT}`, letterSpacing: 6, color: ORANGE }}>HOW YOU’D INVENT</div>
          <div style={{ font: `900 76px/1 ${FONT}`, letterSpacing: -1.5, color: NAVY }}>AIR CONDITIONING</div>
        </div>
      )}
      {(sc.from > 0 || f >= 80) && (
        <div style={{ position: 'absolute', left: 90, top: 250, opacity: tIn * (1 - tOut), transform: `translateX(${(1 - tIn) * -24}px)`, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: '10px 20px', borderRadius: 999, background: sc.id === 'heat' || sc.id === 'payoff' ? ORANGE : NAVY, color: '#fff', font: `800 26px ${FONT}`, letterSpacing: 3 }}>{sc.tag}</div>
          {sc.name && <div style={{ font: `800 40px ${FONT}`, color: NAVY, letterSpacing: -0.5, textShadow: '0 2px 0 rgba(255,255,255,.6)' }}>{sc.name}</div>}
        </div>
      )}
    </>
  );
};

// ---- captions (1250-1450, x 90-900)
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

// ---- watermark: right edge, vertical centre (hidden on the end card) + faint drifting one through the middle
const Watermark = ({ f }) => {
  if (f >= STORY_END) return null;
  return (
    <>
      <div style={{ position: 'absolute', right: 18, top: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.9 }}>
        <Img src={staticFile('brand/invisitech-logo.png')} style={{ width: 62, height: 62 }} />
        <div style={{ writingMode: 'vertical-rl', font: `800 20px ${FONT}`, color: NAVY, letterSpacing: 1, textShadow: '0 1px 0 rgba(255,255,255,.7)' }}>@TheInvisiTech</div>
      </div>
      <div style={{ position: 'absolute', left: 200 + Math.sin(f / 90) * 140, top: 760 + Math.cos(f / 120) * 160, font: `800 34px ${FONT}`, color: NAVY, opacity: 0.06, transform: 'rotate(-12deg)' }}>@TheInvisiTech</div>
    </>
  );
};

const Disclaimer = ({ f }) => {
  const a = ramp(f, 610, 630) * (1 - ramp(f, 1195, 1210));
  return a > 0 ? <div style={{ position: 'absolute', left: 90, top: 1462, font: `700 22px ${FONT}`, color: 'rgba(11,30,63,.7)', opacity: a }}>Illustrative · not to scale</div> : null;
};

// ---- end card (rule 21): the video's own scene in a rounded panel over a blurred copy, logo, wordmark, handle,
// Like / Comment / Follow, red Subscribe, two-tone topic pill. Voice: "Follow InvisiTech for more."
const EndCard = ({ f }) => {
  const g = f - STORY_END;
  if (g < 0) return null;
  const a = ramp(g, 0, 10, eout), b = ramp(g, 6, 18, eout), c = ramp(g, 12, 24, eout);
  const still = 1289;                                         // payoff state: AC on, window closed, 24°C
  const cam0 = { cx: 540, cy: 960, z: 1 };
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ filter: 'blur(22px) brightness(.72)', transform: 'scale(1.08)' }}><Scene f={still} cam={cam0} /></AbsoluteFill>
      <AbsoluteFill style={{ background: 'rgba(11,30,63,.35)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 236, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, transform: `translateY(${(1 - a) * -20}px)` }}>
        <Img src={staticFile('brand/invisitech-logo.png')} style={{ width: 104, height: 104, borderRadius: 999, boxShadow: '0 8px 30px rgba(0,0,0,.35)' }} />
        <div style={{ font: `900 84px ${FONT}`, letterSpacing: -2, color: '#fff' }}>Invisi<span style={{ color: ORANGE }}>Tech</span></div>
      </div>
      <div style={{ position: 'absolute', left: 140, top: 400, width: 800, height: 640, borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.45)',
        border: '4px solid rgba(255,255,255,.85)', transform: `scale(${lerp(0.92, 1, a)})` }}>
        <div style={{ position: 'absolute', left: -230, top: -420, width: W, height: H, transform: 'scale(1)', transformOrigin: '0 0' }}><Scene f={still} cam={cam0} /></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1070, textAlign: 'center', opacity: b }}>
        <div style={{ font: `800 38px ${FONT}`, color: '#fff' }}>@TheInvisiTech</div>
        <div style={{ font: `700 30px ${FONT}`, color: 'rgba(255,255,255,.85)', marginTop: 10, letterSpacing: 1 }}>Like · Comment · Follow</div>
      </div>
      <div style={{ position: 'absolute', left: 330, width: 420, top: 1196, height: 84, borderRadius: 999, background: '#E5251B', display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: `900 40px ${FONT}`, color: '#fff', letterSpacing: 1, opacity: c, transform: `scale(${lerp(0.8, 1, c) * (1 + 0.03 * Math.sin(g / 4) * c)})`, boxShadow: '0 12px 30px rgba(229,37,27,.45)' }}>SUBSCRIBE</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1310, display: 'flex', justifyContent: 'center', opacity: c }}>
        <div style={{ display: 'flex', borderRadius: 999, overflow: 'hidden', font: `900 40px ${FONT}` }}>
          <span style={{ background: ORANGE, color: '#fff', padding: '12px 22px' }}>Heat</span>
          <span style={{ background: '#fff', color: NAVY, padding: '12px 22px' }}>moves out.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const AirConditioning = () => {
  const f = useCurrentFrame();
  const cam = camera(Math.min(f, STORY_END - 1));
  return (
    <AbsoluteFill style={{ background: '#F2E3CC' }}>
      <FontFace />
      <Scene f={Math.min(f, STORY_END - 1)} cam={cam} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 40% 45%, transparent 60%, rgba(70,40,15,.18) 100%)', pointerEvents: 'none' }} />
      <TitleZone f={f} />
      <Disclaimer f={f} />
      <Captions f={f} />
      <Watermark f={f} />
      <EndCard f={f} />
      {HAS_VO && <Audio src={staticFile('audio/vo.wav')} />}
      {HAS_MUSIC && <Audio src={staticFile('audio/music.wav')} volume={0.12} />}
    </AbsoluteFill>
  );
};
