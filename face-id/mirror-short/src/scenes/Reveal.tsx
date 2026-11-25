import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { UNLOCK_AT } from '../script';
import { FONT, ramp } from '../theme';

// The reveal, on the same phone in his hand as the hook (public/hook_last.png): Face ID scans in the Dynamic Island, a green
// tick lands, and the lock screen gives way to the home screen with its apps (public/hook_home.png, tools/make_home.py).
// A recreation of Harsh's own result (it unlocked for him), not test footage. Then the question goes to the viewer.
const ISL = { x: 537.6, y: 282, w: 181, h: 53 };
const io = (x: number) => x * x * (3 - 2 * x), out3 = (x: number) => 1 - Math.pow(1 - x, 3);

export const Reveal: React.FC = () => {
  const fr = useCurrentFrame(), U = UNLOCK_AT;
  const s = 1.02 + 0.05 * (fr / 150) + 0.05 * ramp(fr, U, U + 8, 0, 1, out3);
  const e = ramp(fr, 4, 14, 0, 1, io) * (1 - ramp(fr, U + 4, U + 14, 0, 1, io)), bh = ISL.h + (ISL.w * 0.94 - ISL.h) * e, top = ISL.y - ISL.h / 2;
  const open = ramp(fr, U, U + 6, 0, 1, out3), home = ramp(fr, U + 8, U + 20, 0, 1, io), ask = ramp(fr, U + 34, U + 42, 0, 1, out3);
  return (
    <AbsoluteFill style={{ backgroundColor: '#261912', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 860px', transform: `scale(${s})` }}>
        <Img src={staticFile('hook_last.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920 }} />
        {/* the home screen arrives: it fades in while growing slightly, like apps flying into place */}
        <Img src={staticFile('hook_home.png')} style={{ position: 'absolute', inset: 0, width: 1080, height: 1920, opacity: home }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {/* Face ID in the island: scanning, then a green tick */}
          <rect x={ISL.x - ISL.w / 2} y={top} width={ISL.w} height={bh} rx={ISL.h / 2 + (ISL.w * 0.24 - ISL.h / 2) * e} fill="#04050a" />
          <g transform={`translate(${ISL.x} ${top + bh / 2}) scale(${(ISL.w / 215) * e})`} fill="none" strokeLinecap="round" opacity={e}>
            <g stroke={open > 0.5 ? '#3ddc84' : '#fff'} strokeWidth={7}>
              <path d="M -46 -22 V -34 a 12 12 0 0 1 12 -12 H -22 M 22 -46 H 34 a 12 12 0 0 1 12 12 V -22 M 46 22 V 34 a 12 12 0 0 1 -12 12 H 22 M -22 46 H -34 a 12 12 0 0 1 -12 -12 V 22" />
              {open > 0.5 ? <path d="M -22 2 L -6 18 L 24 -16" strokeWidth={10} strokeLinejoin="round" /> : <path d="M -18 -16 V -6 M 18 -16 V -6 M 2 -16 V 6 H -5 M -16 20 Q 0 32 16 20" />}
            </g>
            {open < 0.5 && <path d="M 0 -76 A 76 76 0 0 1 76 0" stroke="#fff" strokeWidth={6} transform={`rotate(${(fr * 14) % 360})`} />}
          </g>
        </svg>
      </div>
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.22 * ramp(fr, U, U + 2) * (1 - ramp(fr, U + 2, U + 10)) }} />
      {/* the result, then the question for the viewer */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', opacity: ramp(fr, U + 10, U + 16), transform: `scale(${1.2 - 0.2 * ramp(fr, U + 10, U + 18, 0, 1, out3)})` }}>
        <span style={{ display: 'inline-block', padding: '16px 30px', borderRadius: 16, background: 'rgba(8,10,8,.82)', border: '3px solid #3ddc84', font: `800 48px/1 ${FONT}`, letterSpacing: '0.06em', color: '#3ddc84' }}>UNLOCKED</span>
      </div>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1640, textAlign: 'center', opacity: ask, transform: `translateY(${20 * (1 - ask)}px)` }}>
        <span style={{ display: 'inline-block', padding: '20px 30px', borderRadius: 18, background: 'rgba(8,6,12,.88)', border: '3px solid #fff', font: `800 46px/1.2 ${FONT}`, color: '#fff' }}>Did yours unlock?<br /><span style={{ color: '#ffd60a' }}>Comment YES or NO</span></span>
      </div>
    </AbsoluteFill>
  );
};
