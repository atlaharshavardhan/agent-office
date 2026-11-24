import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp, ramp } from '../theme';
import { ISLAND_Y, P3, Phone3D, usePhoneModel } from './Phone3D';

// Scene 2 (2.5–6 s, 105 frames): product-film style opening for the iPhone.
//   0–34  the phone turns in out of the dark, a highlight sweeping across the titanium
//  26–38  the display wakes to the lock screen (the padlock stays closed)
//  42–60  one quick zoom to the top of the phone
//  60–105 Face ID animation in the Dynamic Island: the island grows into a rounded square and the
//         face glyph draws itself (no checkmark: the result is never shown here)
const FOV = 30;
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);
const io = (x: number) => x * x * (3 - 2 * x);
// camera for a frame: looks straight at the phone; target height and distance (scene units)
const camFor = (fr: number) => {
  const z = ramp(fr, 42, 60, 0, 1, io);
  return { ty: 52 + (124 - 52) * z, dist: (930 - 40 * ramp(fr, 34, 42)) * (1 - z) + 450 * z - 12 * ramp(fr, 60, 105) };
};

const Inner: React.FC<{ fr: number; phone: THREE.Object3D }> = ({ fr, phone }) => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    return () => pm.dispose();
  }, [gl, scene]);
  const turn = ramp(fr, 0, 34, 0, 1, out3);
  const wake = ramp(fr, 26, 38);
  (phone.userData.screen as THREE.MeshBasicMaterial).color.setScalar(0.04 + 0.96 * wake);
  scene.environmentIntensity = 0.15 + 0.5 * ramp(fr, 0, 30);
  useLayoutEffect(() => {
    // framing: phone centred a little low (captions sit at the top); the zoom ends on the island
    const { ty, dist } = camFor(fr);
    camera.position.set(0, ty, dist); camera.lookAt(0, ty, 0);
    camera.fov = FOV; camera.near = 5; camera.far = 5000; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  });
  useEffect(() => { advance(performance.now()); });
  const sweep = interpolate(fr, [0, 48], [-900, 900], clamp);
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[sweep, 500, 900]} intensity={3.2 * ramp(fr, 0, 10)} />
      <pointLight position={[-500, 300, -400]} intensity={2.5} color="#ffb070" decay={0} />
      <group rotation={[0.22 * (1 - turn), -2.7 * (1 - turn), 0.12 * (1 - turn)]} scale={0.8 + 0.2 * turn} position={[0, -40 * (1 - turn), 0]}>
        <Phone3D model={phone} />
        <mesh position={[0, 0, P3.d / 2 + 0.2]} visible={false}><planeGeometry args={[1, 1]} /></mesh>
      </group>
    </>
  );
};

// Face ID glyph + growing island, drawn over the 3D phone (the phone is square-on by then, so the
// overlay is placed by projecting the island's position with the same camera).
const GREEN = '#8ff58a';
const FaceIdIsland: React.FC<{ fr: number }> = ({ fr }) => {
  const { ty, dist } = camFor(fr);
  const ppu = 1920 / (2 * (dist - P3.d / 2) * Math.tan((FOV * Math.PI) / 360));     // px per scene unit on the glass
  const cx = 540, top = 960 - (ISLAND_Y + 6.6 - ty) * ppu;                          // top edge of the island
  const grow = ramp(fr, 60, 72, 0, 1, out3);
  const w = (45.2 + (64 - 45.2) * grow) * ppu, h = (13.1 + (64 - 13.1) * grow) * ppu, r = (6.55 + (17 - 6.55) * grow) * ppu;
  const gy = top + h / 2 + 3 * ppu * grow, R = 17.5 * ppu;                           // glyph centre, ring radius
  const ring = ramp(fr, 70, 84, 0, 1, io), face = ramp(fr, 78, 88), C2 = 2 * Math.PI * R;
  const pulse = 1 + 0.03 * Math.sin((fr - 88) / 4) * ramp(fr, 88, 92);
  const u = ppu;
  if (fr < 58) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ramp(fr, 58, 60) }}>
      <rect x={cx - w / 2} y={top} width={w} height={h} rx={r} fill="#000" />
      <circle cx={cx + w / 2 - 9.5 * u} cy={top + 6.6 * u} r={2.6 * u} fill="#141a2a" opacity={0.9} />
      <g transform={`translate(${cx} ${gy}) scale(${pulse})`} stroke={GREEN} strokeWidth={2.3 * u} strokeLinecap="round" fill="none">
        <circle r={R} strokeDasharray={`${C2 * ring} ${C2}`} transform="rotate(-90)" />
        <g opacity={face}>
          <path d={`M ${-6.6 * u} ${-6.2 * u} v ${3.6 * u}`} /><path d={`M ${6.6 * u} ${-6.2 * u} v ${3.6 * u}`} />
          <path d={`M ${0.8 * u} ${-6.2 * u} v ${6.4 * u} q 0 ${2.4 * u} ${-2.6 * u} ${2.4 * u}`} />
          <path d={`M ${-6.2 * u} ${6.4 * u} q ${6.2 * u} ${5.4 * u} ${12.4 * u} 0`} />
        </g>
      </g>
    </svg>
  );
};

export const PhoneReveal: React.FC = () => {
  const fr = useCurrentFrame();
  const phone = usePhoneModel(true);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(60% 42% at 50% 56%, #1d1410 0%, #080605 72%)' }}>
      <ThreeCanvas width={1080} height={1920} flat gl={{ antialias: true }} camera={{ fov: FOV, near: 5, far: 5000 }}>
        {phone && <Inner fr={fr} phone={phone} />}
      </ThreeCanvas>
      <FaceIdIsland fr={fr} />
    </AbsoluteFill>
  );
};
