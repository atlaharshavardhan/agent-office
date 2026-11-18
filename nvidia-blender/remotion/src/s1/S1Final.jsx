// S1 FINAL · cinematic motion-graphics hook (5.0 s · 150 f · 30 fps · 1080x1920).
// Shot 1 0-45  : existing Kling clip (2.33-3.83 s) split into plate + per-frame character matte, so the
//                stage screen / beams sit BEHIND him and our Blender GPU (RGBA pass A) floats IN FRONT.
// Shot 2 45-96 : Alice illustration as a 2.5D multiplane (neutral procedural skyline · glass reflection ·
//                interior · furniture · frame · character · hair edge), lateral track + living lights.
// Shot 3 96-150: connection line -> circuit traces -> Blender GPU macro (pass B) over a Three.js map
//                (US · Singapore · China, Natural Earth, accurate lon/lat), camera ends inside the die.
// Free/local assets only. No paid generation.
import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, random, interpolate, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { W, H, FONT, BODY, SAFE, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { V } from '../alicev4/brand';
import { CamRig, projector } from '../three/kit';
import WORLD from '../alice/world.json';
import VO from './s1f_vo.json';
import CITY from './s1f_city.json';

const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const eio = (x) => Easing.inOut(Easing.cubic)(clamp(x));
const span = (f, a, b) => ease((f - a) / Math.max(1, b - a));
const pad = (n) => String(n).padStart(4, '0');
const S1_END = 45, S2_END = 96;
const GREEN = V.green;

// ---------------------------------------------------------------- shared grade: vignette + grain
export const Grade = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(2,4,6,.62) 100%)', pointerEvents: 'none' }} />
      <AbsoluteFill style={{ mixBlendMode: 'soft-light', opacity: 0.22, background: 'linear-gradient(180deg, rgba(20,40,55,.9), rgba(60,45,30,.6))' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay' }}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /></filter>
        <rect width={W} height={H} filter="url(#gr)" />
      </svg>
    </>
  );
};

// ---------------------------------------------------------------- Shot 1 pieces
export const Beam = ({ x, w, ang, f, speed, col, op, ph = 0 }) => {
  const a = ang + Math.sin((f + ph) / 30 * speed) * 7;
  return <div style={{ position: 'absolute', left: x, top: -260, width: w, height: 1700, transformOrigin: '50% 0%', transform: `rotate(${a}deg)`,
    background: `linear-gradient(180deg, ${col} 0%, rgba(0,0,0,0) 80%)`, opacity: op, mixBlendMode: 'screen', filter: 'blur(22px)',
    clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />;
};

export const StageScreen = ({ f }) => {
  // LED wall behind him: NVIDIA wordmark + living tech graphics (grid scroll, bars, scan line, die outline)
  const scroll = (f * 3) % 60;
  const bars = [...Array(14)].map((_, i) => 0.25 + 0.75 * Math.abs(Math.sin(f / 9 + i * 1.7)));
  return (
    <div style={{ position: 'absolute', left: -60, top: 110, width: 1200, height: 760, transform: 'perspective(1400px) rotateX(4deg)', transformOrigin: '50% 100%',
      WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 45%, transparent 78%)', maskImage: 'radial-gradient(ellipse at 50% 45%, #000 45%, transparent 78%)', mixBlendMode: 'screen' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,40,22,.85), rgba(6,16,12,.6))' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35, backgroundImage: 'linear-gradient(rgba(118,185,0,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(118,185,0,.35) 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: `0 ${scroll}px` }} />
      {/* NVIDIA eye + wordmark (editorial identification) */}
      <div style={{ position: 'absolute', left: 92, top: 120, display: 'flex', alignItems: 'center', gap: 22, opacity: 0.92 }}>
        <div style={{ width: 150, height: 120, background: GREEN, WebkitMask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat`, mask: `url(${staticFile('alice/logos/nvidia.svg')}) center/contain no-repeat`, filter: 'drop-shadow(0 0 18px rgba(118,185,0,.8))' }} />
      </div>
      <div style={{ position: 'absolute', right: 96, top: 70, font: `900 76px ${FONT}`, letterSpacing: 5, color: 'rgba(235,245,225,.9)', textShadow: '0 0 30px rgba(118,185,0,.7)' }}>NVIDIA</div>
      {/* animated bars (bottom-left) and a die outline (right) */}
      <div style={{ position: 'absolute', left: 90, bottom: 120, display: 'flex', alignItems: 'flex-end', gap: 10, height: 170 }}>
        {bars.map((b, i) => <div key={i} style={{ width: 16, height: 170 * b, background: `rgba(118,185,0,${0.35 + 0.4 * b})` }} />)}
      </div>
      <svg width={260} height={200} style={{ position: 'absolute', right: 110, bottom: 110, opacity: 0.8 }}>
        <rect x="10" y="10" width="240" height="180" rx="6" fill="none" stroke="rgba(118,185,0,.8)" strokeWidth="3" />
        <rect x="70" y="40" width="120" height="120" fill="rgba(118,185,0,.15)" stroke="rgba(160,220,90,.9)" strokeWidth="2" />
        {[...Array(6)].map((_, i) => <line key={i} x1={70} x2={190} y1={40 + i * 24} y2={40 + i * 24} stroke="rgba(118,185,0,.5)" strokeDasharray="6 6" strokeDashoffset={-f * 2} />)}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: (f * 22) % 760, height: 3, background: 'rgba(190,255,120,.55)', filter: 'blur(2px)' }} />
    </div>
  );
};

const Shot1 = ({ f }) => {
  const i = Math.min(44, f);
  const k = eio(f / 47);
  const cam = (depth) => `translate(${lerp(10, -26, k) * depth}px, ${lerp(0, -10, k) * depth}px) scale(${1 + lerp(0.035, 0.11, k) * depth})`;
  const fg = staticFile(`s1f/j/fg/${pad(i)}.png`);
  const gp = Math.sin(f / 30 * 1.0 * 2) ;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: V.bg }}>
      <AbsoluteFill style={{ transform: cam(0.75), transformOrigin: '50% 35%' }}>
        <Img src={staticFile(`s1f/j/plate/${pad(i + 1)}.jpg`)} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
        <StageScreen f={f} />
        <Beam x={20} w={260} ang={-16} f={f} speed={1.4} col="rgba(118,185,0,.75)" op={0.5} />
        <Beam x={430} w={200} ang={8} f={f} speed={1.0} col="rgba(225,238,255,.6)" op={0.42} ph={20} />
        <Beam x={820} w={260} ang={20} f={f} speed={1.7} col="rgba(118,185,0,.6)" op={0.48} ph={40} />
        <div style={{ position: 'absolute', left: -300, top: 260, width: 1700, height: 900, opacity: 0.28, mixBlendMode: 'screen', filter: 'blur(50px)',
          transform: `translateX(${Math.sin(f / 40) * 70 + f * 1.2}px)`,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(170,200,230,.45), transparent 60%), radial-gradient(ellipse at 72% 40%, rgba(118,185,0,.3), transparent 55%)' }} />
      </AbsoluteFill>
      {/* character on his own plane (slightly stronger push = depth separation) */}
      <AbsoluteFill style={{ transform: cam(1.0), transformOrigin: '50% 35%' }}>
        <Img src={fg} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
        {/* animated light mask: green stage rim sweeping across him, masked by his own matte */}
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${fg})`, maskImage: `url(${fg})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'screen',
          background: `linear-gradient(${100 + Math.sin(f / 14) * 8}deg, transparent ${lerp(10, 40, k)}%, rgba(118,185,0,.32) ${lerp(18, 48, k)}%, transparent ${lerp(30, 60, k)}%)` }} />
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${fg})`, maskImage: `url(${fg})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'soft-light',
          background: 'linear-gradient(90deg, rgba(255,226,190,.35), transparent 55%, rgba(170,210,255,.25))' }} />
      </AbsoluteFill>
      {/* foreground haze (in front of him, very light) */}
      <div style={{ position: 'absolute', left: -200, top: 1050, width: 1500, height: 800, opacity: 0.18, mixBlendMode: 'screen', filter: 'blur(60px)', transform: `translateX(${-f * 1.6}px)`,
        background: 'radial-gradient(ellipse at 40% 50%, rgba(190,210,230,.5), transparent 60%)' }} />
      {/* our Blender GPU floating in the foreground (strongest parallax), lit by the same sweeping spots */}
      <div style={{ position: 'absolute', left: 560, top: 1300 + gp * 6, width: 640, height: 640, transform: cam(1.45), transformOrigin: '50% 35%' }}>
        <div style={{ position: 'absolute', left: 90, top: 330, width: 420, height: 90, borderRadius: '50%', background: 'rgba(118,185,0,.22)', filter: 'blur(36px)', opacity: 0.6 + 0.3 * Math.sin(f / 6) }} />
        <Img src={staticFile(`s1f/gpuA/${pad(i)}.png`)} style={{ width: 640, height: 640, filter: `drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 ${14 + 8 * Math.sin(f / 7)}px rgba(118,185,0,.35))` }} />
      </div>
      {/* title */}
      <div style={{ position: 'absolute', left: SAFE.l, top: 1185, opacity: span(f, 2, 9), transform: `translateY(${(1 - span(f, 2, 12)) * 24}px)` }}>
        <div style={{ width: lerp(0, 120, span(f, 3, 14)), height: 4, background: GREEN, marginBottom: 16 }} />
        <div style={{ font: `800 80px/1 ${FONT}`, letterSpacing: lerp(10, -1.5, span(f, 2, 16)), color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.9)', whiteSpace: 'nowrap' }}>NVIDIA’S <span style={{ color: GREEN }}>CEO</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Shot 2 pieces
export const CityLife = ({ f }) => {
  // animation sits exactly on the generated city (scripts/s1_city.py -> s1f_city.json)
  const tw = useMemo(() => CITY.twinkle.filter((_, k) => k % 2 === 0).map((b, k) => ({ x: b[0] + random(`tx${k}`) * b[2], y: b[1] + random(`ty${k}`) * Math.min(b[3], 500), p: random(`tp${k}`) * 6, warm: random(`tw${k}`) < 0.7 })), []);
  const cars = useMemo(() => CITY.streets.filter((st) => st[1] < 3).flatMap(([y, li]) => [...Array(7)].map((_, k) => ({ o: random(`co${y}${k}`) * 1340, v: (1.5 + li * 1.6) * (0.7 + random(`cv${y}${k}`) * 0.6), d: k % 2 ? 1 : -1, y: y - 2 + (k % 2) * 3, s: 0.6 + li * 0.25 }))), []);
  return (
    <>
      {tw.map((s, k) => { const o = 0.5 + 0.5 * Math.sin(f / 7 + s.p); return o > 0.75 ? <div key={k} style={{ position: 'absolute', left: s.x, top: s.y, width: 4, height: 3, background: s.warm ? '#ffd6a0' : '#d4e8ff',
        opacity: (o - 0.75) * 3, mixBlendMode: 'screen', boxShadow: `0 0 6px ${s.warm ? '#ffc070' : '#9cc8ff'}`, filter: 'blur(1px)' }} /> : null; })}
      {cars.map((c, k) => { const x = ((c.o + c.d * f * c.v) % 1340 + 1340) % 1340; return <div key={`c${k}`} style={{ position: 'absolute', left: x, top: c.y, width: 14 * c.s, height: 3 * c.s, borderRadius: 3,
        background: c.d > 0 ? '#fff1d6' : '#ff5a45', boxShadow: `0 0 ${8 * c.s}px ${c.d > 0 ? '#ffe0a0' : '#ff3b30'}`, opacity: 0.9, filter: 'blur(0.8px)' }} />; })}
      {CITY.beacons.map(([x, y], k) => <div key={`b${k}`} style={{ position: 'absolute', left: x - 3, top: y - 3, width: 6, height: 6, borderRadius: 6, background: '#ff3b30', boxShadow: '0 0 12px #ff3b30', opacity: (Math.floor((f + k * 11) / 14) % 2) ? 0.95 : 0.1 }} />)}
    </>
  );
};

export const Shot2 = ({ f, horizon }) => {
  const k = eio(f / 60);
  const px = (d) => lerp(48, -48, k) * d;                       // lateral track, depth-weighted
  const z = lerp(1.04, 1.075, k);
  const layer = (d, extra = '') => ({ position: 'absolute', inset: 0, transform: `translateX(${px(d)}px) scale(${z}) ${extra}`, transformOrigin: '45% 40%' });
  const ch = staticFile('s1f/a/character.png');
  const breath = Math.sin(f / 30 * 2 * Math.PI / 3.6);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#07090c' }}>
      <div style={{ ...layer(0.25), left: -130, width: 1340 }}>
        <Img src={staticFile('s1f/a/skyline.jpg')} style={{ position: 'absolute', left: 0, top: 0, width: 1340, height: H }} />
        <CityLife f={f} />
      </div>
      {/* near towers on their own plane: more parallax than the far city */}
      <div style={{ ...layer(0.42), left: -130, width: 1340 }}><Img src={staticFile('s1f/a/skyline_near.png')} style={{ position: 'absolute', left: 0, top: 0, width: 1340, height: H }} /></div>
      {/* window reflection: moves against the track (different optical depth) + slow glass sweep */}
      <div style={{ ...layer(-0.35), opacity: 0.16, mixBlendMode: 'screen' }}><Img src={staticFile('s1f/a/reflection.png')} style={{ width: W, height: H }} /></div>
      <div style={{ position: 'absolute', left: lerp(-500, 1300, clamp(f / 60)), top: -300, width: 240, height: 2600, transform: 'rotate(16deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)', mixBlendMode: 'screen' }} />
      <div style={layer(0.6)}><Img src={staticFile('s1f/a/interior.png')} style={{ width: W, height: H }} /></div>
      <div style={layer(0.6)}><Img src={staticFile('s1f/a/window_frame.png')} style={{ width: W, height: H }} /></div>
      {/* interior light: lamp warmth breathing gently */}
      <div style={{ ...layer(0.85), mixBlendMode: 'screen', opacity: 0.32 + 0.12 * Math.sin(f / 11) }}>
        <div style={{ position: 'absolute', inset: 0, background: '#ffb565', WebkitMaskImage: `url(${staticFile('s1f/a/lamp_glow.png')})`, maskImage: `url(${staticFile('s1f/a/lamp_glow.png')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', WebkitMaskMode: 'luminance', maskMode: 'luminance' }} />
      </div>
      <div style={layer(0.85)}><Img src={staticFile('s1f/a/furniture.png')} style={{ width: W, height: H }} /></div>
      {/* character plane + restrained hair-edge motion + key-light sweep masked to her */}
      <div style={layer(1.0, `translateY(${breath * 1.2}px)`)}>
        <Img src={ch} style={{ position: 'absolute', inset: 0, width: W, height: H }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <filter id="hair" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="1" seed="3" result="n" />
            <feOffset in="n" dx={Math.sin(f / 13) * 40} dy={f * 0.6} result="m" />
            <feDisplacementMap in="SourceGraphic" in2="m" scale={3.2} xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <image href={staticFile('s1f/a/hair_edge.png')} width={W} height={H} filter="url(#hair)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: `url(${ch})`, maskImage: `url(${ch})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', mixBlendMode: 'soft-light',
          background: `linear-gradient(105deg, transparent ${lerp(-10, 40, k)}%, rgba(255,220,170,.55) ${lerp(5, 55, k)}%, transparent ${lerp(25, 75, k)}%)` }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 58%, rgba(4,6,9,.55) 84%)' }} />
    </AbsoluteFill>
  );
};

// Jensen inset card + connection line (two separate compositions joined by a thin graphic, no meeting depicted)
const Connection = ({ f }) => {
  const g = f - S1_END;                                    // shot-2 local frame
  const inA = span(g, 4, 16), draw = span(g, 12, 34);
  const L = 980, off = L * (1 - draw);
  const d = 'M 790 590 L 790 760 L 640 900 L 640 1170';    // card -> down-left -> to the name block
  const toCircuit = span(f, 86, 100);
  return (
    <>
      <div style={{ position: 'absolute', left: 660, top: 250, width: 260, height: 340, borderRadius: 14, overflow: 'hidden', opacity: inA * (1 - toCircuit),
        transform: `translateY(${(1 - inA) * 30}px)`, boxShadow: '0 20px 60px rgba(0,0,0,.7)', border: `2px solid rgba(118,185,0,.7)` }}>
        <Img src={staticFile('s1f/j/plate/0045.jpg')} style={{ width: 340, height: 604, marginLeft: -40, marginTop: -40, filter: 'saturate(.85) brightness(.9)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px', background: 'linear-gradient(0deg, rgba(0,0,0,.85), transparent)', font: `800 22px ${BODY}`, letterSpacing: 3, color: GREEN }}>NVIDIA</div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 1 - toCircuit }}>
        <path d={d} fill="none" stroke={GREEN} strokeWidth="3" strokeDasharray={L} strokeDashoffset={off} style={{ filter: 'drop-shadow(0 0 6px rgba(118,185,0,.9))' }} />
        {draw > 0.02 && draw < 1 && (() => { const t = draw; const pts = [[790, 590], [790, 760], [640, 900], [640, 1170]]; const seg = Math.min(2, Math.floor(t * 3)); const u = t * 3 - seg; const [a, b] = [pts[seg], pts[seg + 1]];
          return <circle cx={lerp(a[0], b[0], u)} cy={lerp(a[1], b[1], u)} r="7" fill="#d8ff9a" style={{ filter: 'drop-shadow(0 0 10px #b6ff5a)' }} />; })()}
      </svg>
    </>
  );
};

const AliceType = ({ f }) => {
  const g = f - S1_END;
  const a = span(g, 6, 18), b = span(g, 14, 26), out = span(f, 88, 96);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, top: 1180, opacity: 1 - out }}>
      <div style={{ font: `600 24px ${BODY}`, letterSpacing: 6, color: 'rgba(244,246,248,.7)', opacity: a, marginBottom: 10 }}>FORMER MEGASPEED EXECUTIVE</div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ font: `800 84px/1 ${FONT}`, letterSpacing: lerp(14, -1.5, a), color: V.text, textShadow: '0 6px 30px rgba(0,0,0,.9)', whiteSpace: 'nowrap', transform: `translateY(${(1 - a) * 90}px)` }}>ALICE HUANG</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, opacity: b }}>
        <div style={{ width: lerp(0, 70, b), height: 3, background: GREEN }} />
        <div style={{ font: `800 30px ${FONT}`, letterSpacing: 10, color: GREEN }}>THE CONNECTION</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- circuit transition (line -> traces)
const Circuit = ({ f }) => {
  const a = span(f, 86, 100), out = 1 - span(f, 99, 106);
  const paths = useMemo(() => [...Array(22)].map((_, k) => {
    let x = 640 + (random(`px${k}`) - 0.5) * 120, y = 1170; let d = `M ${x} ${y}`; let len = 0;
    for (let s = 0; s < 5; s++) { const horiz = s % 2 === 0; const step = (random(`ps${k}${s}`) - 0.5) * (horiz ? 900 : 700);
      if (horiz) x += step; else y += step - 120; d += ` L ${x} ${y}`; len += Math.abs(step) + 120; }
    return { d, len };
  }), []);
  if (a <= 0 || out <= 0) return null;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: out, mixBlendMode: 'screen' }}>
      {paths.map((p, k) => <path key={k} d={p.d} fill="none" stroke={k % 4 ? 'rgba(118,185,0,.85)' : '#d8ff9a'} strokeWidth={k % 4 ? 2 : 3} strokeDasharray={p.len} strokeDashoffset={p.len * (1 - a)} style={{ filter: 'drop-shadow(0 0 6px rgba(118,185,0,.9))' }} />)}
    </svg>
  );
};

// ---------------------------------------------------------------- Shot 3: Three.js map + Blender GPU
const K = 0.0125;
// map lives on a plane tilted back (cinematic perspective); ll() = local plane coords, toW() = world coords
const MAP_POS = new THREE.Vector3(0, -0.32, -3), MAP_ROT = new THREE.Euler(-0.62, 0, 0);
const MAP_M = new THREE.Matrix4().compose(MAP_POS, new THREE.Quaternion().setFromEuler(MAP_ROT), new THREE.Vector3(1, 1, 1));
const ll = (lon, lat) => new THREE.Vector3((lon - 171) * K, (lat - 20) * K, 0);
const toW = (v) => v.clone().applyMatrix4(MAP_M);
const US = ll(238.03, 37.35), SG = ll(103.82, 1.35), CN = ll(116.4, 39.9);    // Santa Clara · Singapore · Beijing

const MapScene = ({ g }) => {
  const lines = useMemo(() => WORLD.map((c) => {
    const pts = []; c.p.forEach((r) => r.forEach(([x, y], i) => { const [x2, y2] = r[(i + 1) % r.length]; if (Math.abs(x - x2) > 60) return; pts.push(ll(x, y), ll(x2, y2)); }));
    return { iso: c.iso, g: new THREE.BufferGeometry().setFromPoints(pts) };
  }), []);
  const hl = span(g, 4, 18);
  const arcA = useMemo(() => new THREE.QuadraticBezierCurve3(US, US.clone().lerp(SG, 0.5).add(new THREE.Vector3(0, 0.6, 0.15)), SG).getPoints(46), []);
  const arcB = useMemo(() => new THREE.QuadraticBezierCurve3(SG, SG.clone().lerp(CN, 0.5).add(new THREE.Vector3(0.14, 0.06, 0.05)), CN).getPoints(20), []);
  const nA = Math.floor(arcA.length * span(g, 8, 26)), nB = Math.floor(arcB.length * 0.6 * span(g, 22, 34));
  const pulse = (s) => 1 + 0.35 * Math.sin(g / 4 + s);
  const fills = useMemo(() => WORLD.filter((c) => c.iso === 'USA' || c.iso === 'CHN').flatMap((c) => c.p.map((r) => {
    const sh = new THREE.Shape(r.map(([x, y]) => new THREE.Vector2((x - 171) * K, (y - 20) * K))); return { iso: c.iso, g: new THREE.ShapeGeometry(sh) }; })), []);
  const grat = useMemo(() => { const pts = [];
    for (let lon = 60; lon <= 300; lon += 15) pts.push(ll(lon, -40), ll(lon, 75));
    for (let lat = -30; lat <= 75; lat += 15) pts.push(ll(60, lat), ll(300, lat));
    return new THREE.BufferGeometry().setFromPoints(pts); }, []);
  return (
    <group position={MAP_POS} rotation={MAP_ROT}>
      <lineSegments geometry={grat}><lineBasicMaterial color="#1d2a36" transparent opacity={0.55} /></lineSegments>
      {fills.map(({ iso, g: geo }, k) => <mesh key={`f${k}`} geometry={geo} position={[0, 0, -0.001]}><meshBasicMaterial color={iso === 'CHN' ? '#ff8a7a' : '#8fd14f'} transparent opacity={0.10 * hl} depthWrite={false} /></mesh>)}
      {lines.map(({ iso, g: geo }, k) => { const on = iso === 'USA' || iso === 'CHN';
        return <lineSegments key={k} geometry={geo}><lineBasicMaterial color={on ? (iso === 'CHN' ? '#ff9a8a' : '#a6dc6c') : '#40525f'} transparent opacity={on ? 0.35 + 0.6 * hl : 0.7} /></lineSegments>; })}
      {[[US, '#a6dc6c', 0], [SG, '#a6dc6c', 2], [CN, '#ff9a8a', 4]].map(([p, c, s], k) => (
        <group key={k} position={p}>
          <mesh><circleGeometry args={[0.012, 20]} /><meshBasicMaterial color={c} /></mesh>
          <mesh scale={pulse(s) * hl}><ringGeometry args={[0.03, 0.036, 40]} /><meshBasicMaterial color={c} transparent opacity={0.7} /></mesh>
        </group>))}
      {arcA.slice(0, nA).map((p, k) => k % 2 === 0 && <mesh key={`a${k}`} position={p}><sphereGeometry args={[0.0065, 6, 6]} /><meshBasicMaterial color="#eef3f6" transparent opacity={0.85} /></mesh>)}
      {arcB.slice(0, nB).map((p, k) => k % 2 === 0 && <mesh key={`b${k}`} position={p}><sphereGeometry args={[0.0065, 6, 6]} /><meshBasicMaterial color="#eef3f6" transparent opacity={0.6} /></mesh>)}
    </group>
  );
};

const Shot3 = ({ f }) => {
  const g = f - S2_END;                                       // 0..53
  const k = eio(g / 53);
  const cam = [lerp(0.2, -0.06, k), lerp(0.62, 0.45, k), lerp(2.45, 2.05, k)], look = [lerp(-0.04, 0.04, k), -0.42, -3];
  const P0 = projector(cam, look, 40); const P = (a) => P0(toW(new THREE.Vector3(...a)).toArray());
  const mapOut = 1 - span(g, 36, 50);
  const lab = (v, txt, col, dx = 0, dy = -40) => { const [x, y] = P(v.toArray()); return <div style={{ position: 'absolute', left: x + dx, top: y + dy, transform: 'translateX(-50%)', font: `800 24px ${BODY}`, letterSpacing: 2, color: col, textShadow: '0 2px 10px #000', whiteSpace: 'nowrap', opacity: span(g, 8, 16) * mapOut }}>{txt}</div>; };
  const [qx, qy] = P(SG.clone().lerp(CN, 0.72).add(new THREE.Vector3(0.12, 0.05, 0)).toArray());
  const gi = Math.min(53, Math.max(0, g));
  const bloom = span(g, 38, 53);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #0e1b28, ${V.bg} 70%)`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: mapOut }}>
        <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
          <CamRig pos={cam} look={look} fov={40} />
          <MapScene g={g} />
        </ThreeCanvas>
        {lab(US, 'UNITED STATES', '#a6dc6c')}{lab(SG, 'SINGAPORE', '#a6dc6c', 0, 22)}{lab(CN, 'CHINA', '#ff9a8a')}
        <div style={{ position: 'absolute', left: qx, top: qy - 44, font: `900 64px ${FONT}`, color: V.text, textShadow: '0 0 18px #000', opacity: span(g, 30, 36) }}>?</div>
      </AbsoluteFill>
      {/* Blender GPU macro (pass B, transparent) — rises over the map, camera ends inside the die */}
      <AbsoluteFill style={{ transform: `translateY(${(1 - span(g, 0, 14)) * 60 - 400 * (1 - eio((g - 14) / 32))}px) scale(${lerp(0.82, 1, eio((g - 10) / 30))})` }}>
        <Img src={staticFile(`s1f/gpuB/${pad(gi)}.png`)} style={{ width: W, height: H, filter: `drop-shadow(0 40px 60px rgba(0,0,0,.75))` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 45% 50%, rgba(118,185,0,.28), transparent 60%)', opacity: bloom, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.l, top: 228, textAlign: 'center', opacity: span(g, 6, 14) * (1 - span(g, 44, 50)), transform: `translateY(${(1 - span(g, 6, 16)) * 20}px)` }}>
        <div style={{ font: `800 80px/1.04 ${FONT}`, letterSpacing: -1.5, color: V.text, textShadow: '0 6px 30px #000' }}>WHAT DID</div>
        <div style={{ font: `800 80px/1.04 ${FONT}`, letterSpacing: -1.5, color: GREEN, textShadow: '0 6px 30px #000' }}>NVIDIA KNOW?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1530, font: `600 21px ${BODY}`, color: 'rgba(244,246,248,.7)', opacity: span(g, 10, 16) * mapOut, textShadow: '0 1px 6px #000' }}>
        Dotted line = open question, not a confirmed route · map: Natural Earth
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- captions (word-timed from the VO script)
const Captions = ({ f }) => {
  const t = f / 30;
  const line = t < 2.2 ? VO.q1 : VO.q2;
  const s = line[0].s - 0.05, e = line[line.length - 1].e + 0.35;
  if (t < s || t > e) return null;
  const op = clamp((t - s) / 0.12) * clamp((e - t) / 0.15);
  return (
    <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.l, top: 1420, textAlign: 'center', opacity: op }}>
      <span style={{ font: `700 44px/1.2 ${BODY}`, padding: '6px 16px', borderRadius: 10, background: 'rgba(4,7,10,.55)', color: V.text }}>
        {line.map((w, k) => <span key={k} style={{ color: t >= w.s && t < w.e + 0.08 ? GREEN : V.text }}>{w.w}{k < line.length - 1 ? ' ' : ''}</span>)}
      </span>
    </div>
  );
};

export const S1Final = () => {
  const f = useCurrentFrame();
  const horizon = 1152;
  // 1 -> 2: soft lateral match-cut with motion blur + light flare; 2 -> 3: line becomes circuit, push into it
  const x12 = eio((f - 40) / 10), x23 = eio((f - 90) / 10);
  const blur12 = Math.sin(Math.PI * clamp((f - 40) / 10)) * 10;
  const blur23 = Math.sin(Math.PI * clamp((f - 90) / 10)) * 8;
  return (
    <AbsoluteFill style={{ background: V.bg }}>
      <FontFace />
      {f < 51 && <AbsoluteFill style={{ transform: `translateX(${-x12 * 420}px)`, filter: `blur(${blur12}px)`, opacity: 1 - span(f, 44, 50) }}><Shot1 f={f} /></AbsoluteFill>}
      {f >= 40 && f < 101 && (
        <AbsoluteFill style={{ transform: `translateX(${(1 - x12) * 420}px) scale(${1 + x23 * 0.25})`, transformOrigin: '59% 61%', filter: `blur(${f < 60 ? blur12 : blur23}px)`, opacity: span(f, 40, 46) * (1 - span(f, 94, 100)) }}>
          <Shot2 f={f - S1_END} horizon={horizon} />
          <AliceType f={f} />
          <Connection f={f} />
        </AbsoluteFill>
      )}
      {f >= 94 && <AbsoluteFill style={{ opacity: span(f, 94, 100), transform: `scale(${lerp(1.08, 1, x23)})` }}><Shot3 f={f} /></AbsoluteFill>}
      <Circuit f={f} />
      {/* light flare across the 1->2 cut */}
      <AbsoluteFill style={{ background: `linear-gradient(100deg, transparent ${lerp(-30, 110, clamp((f - 39) / 12))}%, rgba(200,255,150,.35) ${lerp(-20, 120, clamp((f - 39) / 12))}%, transparent ${lerp(-10, 130, clamp((f - 39) / 12))}%)`, mixBlendMode: 'screen', opacity: f >= 38 && f <= 52 ? 1 : 0 }} />
      <Grade />
      <Captions f={f} />
      {f < 96 && <div style={{ position: 'absolute', left: SAFE.l, top: 1530, font: `600 21px ${BODY}`, color: 'rgba(244,246,248,.72)', textShadow: '0 1px 6px #000' }}>
        AI-generated illustration{f >= 45 ? ' · not a photo of Alice Huang' : ''}</div>}
      <Audio src={staticFile('s1f/s1f_mix.wav')} />
    </AbsoluteFill>
  );
};
