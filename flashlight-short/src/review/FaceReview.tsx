// Face review: a large neutral three-quarter portrait beside the reference (same crop and scale),
// with three expression studies at the same three-quarter angle below.
import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { StudentDefs, C } from './student';
import { Face, FaceDefs, Head3Q, Hood3Q, NEUTRAL } from './face';
import { MiniBulb } from '../kit';

export const FACE_REVIEW = { w: 1920, h: 1720 };
const REF = { x: 370, y: 20, size: 320 };            // crop of the reference image (px in the original)
// my portrait uses the same framing: hair top at 3 %, chin at 72 %, nose at 31 % from the left
const frame = (size: number) => { const s = (0.69 * size) / 342; return { s, tx: 0.31 * size + 28 * s, ty: 0.03 * size + 204 * s }; };

const PUZZLED: Face = { look: [-0.8, 0.8], lidFar: 0.3, lidNear: 0.3, browFar: { inY: 8, outY: -2, inX: 8 }, browNear: { inY: 9, outY: -3, inX: 9 }, mouth: { left: 4, right: -1, open: 0, press: 3 } };
const FOCUS: Face = { look: [-0.6, 1.1], lidFar: 0.72, lidNear: 0.72, browFar: { inY: 4, outY: 2, inX: 3 }, browNear: { inY: 4, outY: 2, inX: 3 }, mouth: { left: 2, right: 2, open: 0, press: 6 } };
const IDEA: Face = { look: [0.8, 0.8], lidFar: 0, lidNear: -0.35, browFar: { inY: -1, outY: 0, inX: 0 }, browNear: { inY: -10, outY: -14, inX: -2 }, mouth: { left: -2, right: -12, open: 0, press: 0 } };

const Portrait: React.FC<{ size: number; f: Face; children?: React.ReactNode }> = ({ size, f, children }) => {
  const k = frame(size);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <StudentDefs /><FaceDefs />
      <rect width={size} height={size} fill="#3a4869" />
      <g transform={`translate(${k.tx} ${k.ty}) scale(${k.s})`}>
        <Hood3Q />
        <Head3Q f={f} />
      </g>
      {children}
    </svg>
  );
};
const Card: React.FC<{ x: number; y: number; size: number; label: string; children: React.ReactNode }> = ({ x, y, size, label, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size }}>
    <div style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 0 #cfc8ba' }}>{children}</div>
    <div style={{ font: '800 24px Inter, sans-serif', letterSpacing: '0.12em', color: '#5d564c', marginTop: 14, textAlign: 'center' }}>{label}</div>
  </div>
);

export const FaceReview: React.FC = () => {
  const big = 860, small = 560, sc = REF.size / big;
  return (
    <AbsoluteFill style={{ background: '#e7e2d8' }}>
      <div style={{ position: 'absolute', left: 60, top: 36, font: '800 38px Inter, sans-serif', color: '#2a2622' }}>Student face · three-quarter review</div>
      <div style={{ position: 'absolute', left: 60, top: 84, font: '500 22px Inter, sans-serif', color: '#6d665b' }}>Same crop and scale as the reference · no pencil, no accessories · pupils, lids, brows and mouth are separate editable layers</div>
      <Card x={60} y={130} size={big} label="REFERENCE">
        <div style={{ width: big, height: big, position: 'relative', overflow: 'hidden' }}>
          <Img src={staticFile('ref/InvisiTech Student with an Unlit Bulb.png')} style={{ position: 'absolute', left: -REF.x / sc, top: -REF.y / sc, width: 1024 / sc }} />
        </div>
      </Card>
      <Card x={1000} y={130} size={big} label="NEW FACE · NEUTRAL THREE-QUARTER"><Portrait size={big} f={NEUTRAL} /></Card>
      {/* expression studies */}
      <Card x={60} y={1080} size={small} label="1 · PUZZLED">
        <Portrait size={small} f={PUZZLED}>
          {/* the failed bulb he is studying */}
          <g transform="translate(70 520) rotate(-20) scale(0.9)"><MiniBulb state="burnt" id="fr-b" /></g>
        </Portrait>
      </Card>
      <Card x={680} y={1080} size={small} label="2 · CONCENTRATING">
        <Portrait size={small} f={FOCUS}>
          {/* his fingertips pinching the foil edge, just below */}
          <g transform="translate(30 500)">
            <path d="M 0 30 L 80 10 L 96 60 L 10 70 Z" fill="#c9d1dc" stroke={C.line} strokeWidth={2} />
            <path d="M 60 -6 C 80 -16 104 -8 110 8 C 104 20 88 22 76 14 Z" fill={C.skin} stroke={C.lineSkin} strokeWidth={2} />
            <path d="M 70 40 C 86 34 108 40 112 56 C 104 64 86 62 76 52 Z" fill={C.skin} stroke={C.lineSkin} strokeWidth={2} />
          </g>
        </Portrait>
      </Card>
      <Card x={1300} y={1080} size={small} label="3 · REALIZING">
        <Portrait size={small} f={IDEA}>
          {/* the curved sketch he has just looked away from, and the foil carton he looks to */}
          <g opacity={0.8}><path d="M 50 70 C 24 100 24 150 50 180" fill="none" stroke="#eef0e8" strokeWidth={4} strokeLinecap="round" />{[95, 125, 155].map((y) => <path key={y} d={`M 44 ${y} L 110 ${y}`} stroke="#eef0e8" strokeWidth={3} strokeLinecap="round" />)}</g>
          <g transform="translate(390 492) rotate(-6)">
            <path d="M 0 20 L 150 34 L 152 70 L 2 56 Z" fill="#2f6db3" stroke={C.line} strokeWidth={2.4} />
            <path d="M 0 20 L 150 34 L 156 4 L 6 -10 Z" fill="#3a7cc4" stroke={C.line} strokeWidth={2.4} />
            <path d="M 4 18 L 150 32 L 150 26 L 4 12 Z" fill="#c9d1dc" />
          </g>
        </Portrait>
      </Card>
    </AbsoluteFill>
  );
};
