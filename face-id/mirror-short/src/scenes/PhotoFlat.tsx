import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, FONT, ramp } from '../theme';

// "A photo won't work": a printed photo of his face is held up to the phone. The dots land on it as a perfectly neat grid,
// because paper is flat, so there is nothing to bend them. t = frames from the cut.
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const PW = 560, PH = 700, IW = 480, IH = 520;                // print and the picture inside it
const DOTS: number[][] = [];
for (let y = 18; y < IH - 8; y += 21) for (let x = 16; x < IW - 8; x += 21) DOTS.push([x, y]);

export const PhotoFlat: React.FC<{ t: number }> = ({ t }) => {
  const a = ramp(t, 0, 10, 0, 1, out3), fire = ramp(t, 10, 16), no = ramp(t, 44, 50, 0, 1, out3);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(80% 50% at 50% 48%, #2a1f52 0%, #141026 55%, #0a0812 100%)', overflow: 'hidden' }}>
      {/* the phone, looking down at the photo */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M 360 380 V 600 a 46 46 0 0 0 46 46 H 674 a 46 46 0 0 0 46 -46 V 380`} fill="#17141f" stroke="#b9a8ff" strokeWidth={5} opacity={a} />
        <rect x={470} y={585} width={140} height={34} rx={17} fill="#05040a" opacity={a} /><circle cx={520} cy={602} r={8} fill={C.ir} opacity={a * (0.6 + 0.4 * fire)} />
        <path d="M 520 615 L 250 760 H 830 Z" fill={C.ir} opacity={0.13 * fire} />
      </svg>
      {/* the print */}
      <div style={{ position: 'absolute', left: 540 - PW / 2, top: 720, width: PW, height: PH, borderRadius: 10, background: 'linear-gradient(135deg, #f4f1ea, #cfcac0)', boxShadow: '0 30px 80px rgba(0,0,0,.6)', transform: `translateY(${60 * (1 - a)}px) rotate(${-4 + 1.2 * Math.sin(t / 16)}deg)`, opacity: a }}>
        <div style={{ position: 'absolute', left: (PW - IW) / 2, top: 40, width: IW, height: IH, overflow: 'hidden', background: '#2a2018' }}>
          <Img src={staticFile('face_front.png')} style={{ position: 'absolute', left: -150, top: -235, width: 780, height: 1394 }} />
          <svg width={IW} height={IH} style={{ position: 'absolute', inset: 0 }}>
            {DOTS.map(([x, y], i) => { const o = ramp(t, 12 + (y / IH) * 12, 16 + (y / IH) * 12); return o > 0 ? <circle key={i} cx={x} cy={y} r={4.4} fill={C.ir} opacity={0.85 * o} /> : null; })}
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', font: `800 34px/1 ${FONT}`, letterSpacing: '0.16em', color: '#5d574d' }}>PHOTO</div>
      </div>
      {/* read-out: no depth */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', opacity: ramp(t, 24, 30) }}>
        <div style={{ font: `800 44px/1 ${FONT}`, letterSpacing: '0.16em', color: '#e9e2ff' }}>DEPTH: FLAT</div>
        <div style={{ margin: '22px auto 0', width: 720 * ramp(t, 26, 40, 0, 1, out3), height: 6, borderRadius: 3, background: '#7fb6ff' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1590, textAlign: 'center', opacity: no, transform: `scale(${1.2 - 0.2 * no})`, font: `800 54px/1 ${FONT}`, color: '#ff2d46' }}>✕ NOT A REAL FACE</div>
    </AbsoluteFill>
  );
};
