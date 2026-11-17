// Alice Short · Scene 4: "the line". NVIDIA -> Megaspeed -> U.S. export line -> China.
// Renting computing power passes the line (not banned); shipping chips is stopped (banned);
// then "Did chips cross?" -> "NO CHARGES". Original animated diagram.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { NvLogo, FlagUS, FlagCN, MegaspeedLogo } from './Logos';

const CX = 495;                                        // centre of the safe area (90..900)
const Node = ({ y, a, col, children, w = 700 }) => (
  <div style={{ position: 'absolute', left: CX - w / 2, width: w, top: y, opacity: a, transform: `translateY(${(1 - a) * 20}px)`,
    background: 'rgba(10,11,13,.9)', border: `3px solid ${col}`, borderRadius: 22, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
    boxShadow: `0 0 40px ${col}33, 0 14px 40px rgba(0,0,0,.7)` }}>{children}</div>
);
const Chip = ({ x, y, s = 1, col = C.green, o = 1 }) => (
  <div style={{ position: 'absolute', left: x - 22 * s, top: y - 16 * s, width: 44 * s, height: 32 * s, borderRadius: 6 * s, opacity: o,
    background: '#1c2026', border: `${3 * s}px solid ${col}`, boxShadow: `0 0 ${14 * s}px ${col}` }}>
    <div style={{ position: 'absolute', inset: 6 * s, border: `${2 * s}px solid ${col}88`, borderRadius: 3 * s }} />
  </div>
);

export const AliceS4F = ({ d = 7.04 }) => {
  const f = useCurrentFrame(), t = f / 30;
  const nA = ramp(f, 0, 0.3), mA = ramp(f, 0.15, 0.3), line = ramp(f, 0.35, 0.4), cn = ramp(f, 0.5, 0.3);
  const rentA = ramp(f, 0.4, 0.3), shipA = ramp(f, 1.8, 0.3);
  const phaseB = ramp(f, d * 0.56, 0.3), noCh = ramp(f, d * 0.84, 0.3);
  const yN = 330, yM = 560, yL = 900, yC = 1090;            // node rows and the export line
  const LX = CX - 150, RX = CX + 150;                       // rent path (left) / ship path (right)
  // rent: pulses flow straight through the line
  const pulses = [...Array(7)].map((_, k) => { const u = (t * 0.9 + k / 7) % 1; return { y: lerp(yM + 110, yC - 10, u), o: rentA * (1 - phaseB * 0.6) }; });
  // ship: a chip travels down and stops at the line; in phase B a "?" chip edges toward it
  const sp = clamp((t - 1.9) / 0.8), shipY = lerp(yM + 120, yL - 28, sp * sp * (3 - 2 * sp));
  const shake = sp >= 1 && phaseB < 0.5 ? Math.sin(t * 50) * 3 : 0;
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #12161b, #040506 75%)' }}>
      <FontFace />
      {/* connectors */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <line x1={CX} y1={yN + 100} x2={CX} y2={yM} stroke={C.green} strokeWidth="5" opacity={mA} />
        <path d={`M${CX} ${yM + 110} C ${CX} ${yM + 150}, ${LX} ${yM + 140}, ${LX} ${yM + 190} L ${LX} ${yC}`} stroke="#9BE22E" strokeWidth="4" strokeDasharray="10 10" fill="none" opacity={rentA} />
        <path d={`M${CX} ${yM + 110} C ${CX} ${yM + 150}, ${RX} ${yM + 140}, ${RX} ${yM + 190} L ${RX} ${yC}`} stroke="#E5484D" strokeWidth="4" fill="none" opacity={shipA} />
      </svg>
      {/* the export line */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: yL, height: 0, borderTop: '5px dashed #E5484D', opacity: line, boxShadow: '0 0 18px rgba(229,72,77,.6)' }} />
      <div style={{ position: 'absolute', left: 100, top: yL + 18, opacity: line, display: 'flex', alignItems: 'center', gap: 10, font: `800 30px ${BODY}`, color: '#E5484D', letterSpacing: 2 }}><FlagUS h={28} />U.S. EXPORT LINE</div>
      {/* nodes */}
      <Node y={yN} a={nA} col={C.green}><NvLogo h={66} /><FlagUS h={46} /></Node>
      <Node y={yM} a={mA} col={C.green}><MegaspeedLogo h={58} sub={false} /><span style={{ font: `700 30px ${BODY}`, color: '#ccc' }}>SE Asia</span></Node>
      <Node y={yC} a={cn} col={'#FF7A1A'}><FlagCN h={50} /><span style={{ font: `900 60px ${FONT}`, color: '#fff' }}>CHINA</span><span style={{ font: `800 40px ${FONT}`, color: '#FF7A1A' }}>· Alibaba</span></Node>
      {/* chips into Megaspeed */}
      {[0, 1, 2].map((k) => { const u = (t * 0.8 + k / 3) % 1; return <Chip key={k} x={CX} y={lerp(yN + 110, yM - 10, u)} s={0.7} o={mA * (1 - phaseB)} />; })}
      {/* rent path */}
      {pulses.map((p, k) => <div key={k} style={{ position: 'absolute', left: LX - 9, top: p.y - 9, width: 18, height: 18, borderRadius: 9, background: '#C6FF6A', boxShadow: '0 0 16px #C6FF6A', opacity: p.o }} />)}
      <div style={{ position: 'absolute', left: LX - 270, width: 250, top: yL - 190, textAlign: 'right', opacity: rentA * (1 - phaseB) }}>
        <div style={{ font: `900 60px/1 ${FONT}`, color: '#C6FF6A' }}>RENT ✓</div>
        <div style={{ font: `700 30px ${BODY}`, color: '#ddd', marginTop: 6 }}>computing power<br />not banned</div>
      </div>
      {/* ship path */}
      <Chip x={RX + shake} y={shipY} s={1.2} col={C.red} o={shipA * (1 - phaseB)} />
      <div style={{ position: 'absolute', left: RX + 46, width: 260, top: yL - 190, opacity: shipA * (1 - phaseB) }}>
        <div style={{ font: `900 60px/1 ${FONT}`, color: '#E5484D' }}>SHIP ✗</div>
        <div style={{ font: `700 30px ${BODY}`, color: '#ddd', marginTop: 6 }}>chips into China<br />banned</div>
      </div>
      {/* phase B: the question */}
      <Chip x={RX} y={lerp(yM + 140, yL + 4, ease2(clamp((t - d * 0.58) / 1.0)))} s={1.3} col={C.red} o={phaseB * (1 - noCh * 0.5)} />
      <div style={{ position: 'absolute', left: RX + 50, top: yL - 70, opacity: phaseB, font: `900 110px/1 ${FONT}`, color: C.red, textShadow: '0 0 30px rgba(229,72,77,.6)' }}>?</div>
      {/* headline */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 190, textAlign: 'center', opacity: 1 - phaseB }}>
        <div style={{ font: `800 96px/1.05 ${FONT}`, letterSpacing: -2, color: '#fff', textShadow: '0 6px 30px #000' }}>THE LINE</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 190, textAlign: 'center', opacity: phaseB * (1 - noCh) }}>
        <div style={{ font: `800 84px/1.02 ${FONT}`, letterSpacing: -2, color: '#fff', textShadow: '0 6px 30px #000' }}>DID CHIPS CROSS?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 185, textAlign: 'center', opacity: noCh, transform: `scale(${0.9 + 0.1 * noCh}) rotate(-3deg)` }}>
        <span style={{ font: `900 78px ${FONT}`, color: '#E5484D', border: '8px solid #E5484D', padding: '4px 30px', borderRadius: 14, background: 'rgba(10,11,13,.85)' }}>NO CHARGES</span>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>Simplified · U.S. rules as of 2025 · not affiliated with NVIDIA</div>
    </AbsoluteFill>
  );
};
const ease2 = (x) => x * x * (3 - 2 * x);
