import { AbsoluteFill } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { HeadApi, Orbit3D } from './Orbit3D';

// The rotating 3D map of his face, built on the 3D head (the same one as the red-dots clip): a web over his face,
// coloured far (blue) to near (orange), turning so the nose is seen sitting forward of the cheek. t = frames from its start.
// Static, straight-on explainers use the photo (Scan.tsx); anything that turns in 3D uses this head.
const io = (x: number) => x * x * (3 - 2 * x);
const HEAT = [[59, 91, 219], [79, 195, 247], [255, 209, 102], [255, 122, 61]];
const heat = (d: number) => { const t = Math.min(0.999, Math.max(0, d)) * 3, i = Math.floor(t), f = t - i, a = HEAT[i], b = HEAT[i + 1]; return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`; };
const Tag: React.FC<{ x: number; y: number; text: string; lx: number; o: number }> = ({ x, y, text, lx, o }) => {
  const w = text.length * 37 + 56;
  return (<>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={`M ${lx + w / 2} 1250 L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" /><circle cx={x} cy={y} r={17} fill="none" stroke={C.amber} strokeWidth={4.5} /><circle cx={x} cy={y} r={6} fill="#fff" />
    </svg>
    <div style={{ position: 'absolute', left: lx, top: 1250, width: w, boxSizing: 'border-box', textAlign: 'center', opacity: o, padding: '18px 0', borderRadius: 12, background: 'rgba(10,8,7,.82)', border: `3px solid ${C.amber}`, font: `800 46px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
  </>);
};

export const Map3D: React.FC<{ t: number }> = ({ t }) => {
  const az = -26 * ramp(t, 0, 26, 0, 1, io) - 6 * ramp(t, 26, 80);
  const overlay = ({ S, head }: HeadApi) => {
    const { nose, cheek, centre, lattice } = head, mirX = 2 * centre[0] - cheek.x;
    const dn = (z: number) => Math.min(1, Math.max(0, (z - (nose.z - 150)) / 150));
    const L = lattice.pts.map(([x, y, z]) => [...S(x, y, z), dn(z)]);
    const [nx, ny] = S(nose.x, nose.y, nose.z), [cx, cy] = S(mirX, cheek.y, cheek.z), o = ramp(t, 8, 14);
    return (
      <>
        <AbsoluteFill style={{ background: 'radial-gradient(80% 50% at 50% 46%, #1c1740 0%, #0d0b1c 60%, #08070f 100%)' }} />
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          {lattice.runs.map((run, i) => <g key={i}>{run.slice(0, -1).map((a, k) => { const b = run[k + 1]; return <line key={k} x1={L[a][0]} y1={L[a][1]} x2={L[b][0]} y2={L[b][1]} stroke={heat((L[a][2] + L[b][2]) / 2)} strokeWidth={2.4} strokeLinecap="round" />; })}</g>)}
          {L.map(([x, y, d], i) => <circle key={i} cx={x} cy={y} r={2 + 2 * d} fill={heat(d)} />)}
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, font: `800 30px/1 ${FONT}`, letterSpacing: '0.14em', color: '#e9e2ff' }}>
          FAR<div style={{ width: 520, height: 16, borderRadius: 8, background: 'linear-gradient(90deg, rgb(59,91,219), rgb(79,195,247), rgb(255,209,102), rgb(255,122,61))' }} />NEAR
        </div>
        <Label text="3D MAP OF HIS FACE" x={505} y={1580} o={1} size={28} align="center" color={C.label} />
        <Tag x={cx} y={cy} text="FARTHER" lx={100} o={o} /><Tag x={nx} y={ny} text="CLOSER" lx={660} o={o} />
      </>
    );
  };
  return <Orbit3D g={150} ex={{ view: { az, dist: 2250 }, tone: 'ir', dotO: 0, bg: '#08080b', overlay }} />;
};
