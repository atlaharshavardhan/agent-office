import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp, ramp } from '../theme';
import { ISLAND_Y, P3, Phone3D, usePhoneModel } from './Phone3D';

// Scene 2 (2.5–6 s, 105 frames): product-film style opening for the iPhone.
//   0–46  the phone turns in out of the dark, a highlight sweeping across the titanium
//  36–50  the display wakes to the lock screen (the padlock stays closed)
//  50–84  it hangs there with a slow drift
//  84–101 one quick zoom into the Dynamic Island / TrueDepth sensor area
const FOV = 30;
const out3 = (x: number) => 1 - Math.pow(1 - x, 3);

const Inner: React.FC<{ fr: number; phone: THREE.Object3D }> = ({ fr, phone }) => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    return () => pm.dispose();
  }, [gl, scene]);
  const turn = ramp(fr, 0, 46, 0, 1, out3);
  const zoom = ramp(fr, 84, 101, 0, 1, (x) => x * x);
  const wake = ramp(fr, 36, 50);
  (phone.userData.screen as THREE.MeshBasicMaterial).color.setScalar(0.04 + 0.96 * wake);
  scene.environmentIntensity = 0.15 + 0.5 * ramp(fr, 0, 30);
  useLayoutEffect(() => {
    // framing: phone centred a little low (captions sit at the top); the zoom ends on the island
    const ty = interpolate(zoom, [0, 1], [52, ISLAND_Y], clamp), dist = interpolate(zoom, [0, 1], [930 - 50 * ramp(fr, 46, 84), 150], clamp);
    camera.position.set(0, ty, dist); camera.lookAt(0, ty, 0);
    camera.fov = FOV; camera.near = 5; camera.far = 5000; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  });
  useEffect(() => { advance(performance.now()); });
  const sweep = interpolate(fr, [0, 60], [-900, 900], clamp);
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

export const PhoneReveal: React.FC = () => {
  const fr = useCurrentFrame();
  const phone = usePhoneModel(true);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(60% 42% at 50% 56%, #1d1410 0%, #080605 72%)' }}>
      <ThreeCanvas width={1080} height={1920} flat gl={{ antialias: true }} camera={{ fov: FOV, near: 5, far: 5000 }}>
        {phone && <Inner fr={fr} phone={phone} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
