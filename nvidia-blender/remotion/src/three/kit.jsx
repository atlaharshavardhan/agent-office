// Three.js helpers for Remotion (@remotion/three): deterministic camera per frame, GPU model loader,
// and 3D -> screen projection so HTML labels sit exactly on 3D objects.
import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { W, H } from '../theme';

export const CamRig = ({ pos, look, fov = 35 }) => {
  const { camera } = useThree();
  camera.fov = fov;
  camera.aspect = W / H;
  camera.near = 0.05;
  camera.far = 500;
  camera.position.set(...pos);
  camera.lookAt(...look);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};

// Same math as CamRig, usable outside the canvas to place HTML labels.
export const projector = (pos, look, fov = 35) => {
  const cam = new THREE.PerspectiveCamera(fov, W / H, 0.05, 500);
  cam.position.set(...pos);
  cam.lookAt(...look);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return (p) => {
    const v = new THREE.Vector3(...p).project(cam);
    return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];
  };
};

// The hero package exported from Blender (scripts/build_shots.py glb) -> public/gpu.glb.
// Loaded once at module load and the render waits for it, so the model is ready before the first draw.
let GPU_CACHE = null;
const GPU_HANDLE = delayRender('load gpu.glb');
new GLTFLoader().load(staticFile('gpu.glb'), (g) => {
  // Blender's procedural shaders don't survive glTF; rebuild the look per material name.
  const LOOK = {
    Silicon_Die: { color: '#16181d', metalness: 0.85, roughness: 0.08 },
    HBM_Stack: { color: '#0c0d0f', metalness: 0.4, roughness: 0.25 },
    Interposer: { color: '#3a3f48', metalness: 0.9, roughness: 0.2 },
    Underfill: { color: '#0e0f10', metalness: 0, roughness: 0.4 },
    Brushed_Silver: { color: '#BFC5CC', metalness: 1, roughness: 0.28 },
    Substrate: { color: '#121614', metalness: 0.1, roughness: 0.45 },
    Laser_Etch: { color: '#23262a', metalness: 0.4, roughness: 0.65 },
  };
  g.scene.traverse((o) => {
    if (o.isMesh && o.material) {
      const m = o.material, L = LOOK[m.name.replace(/\.\d+$/, '')];
      m.emissive?.set('#000000');
      m.emissiveIntensity = 0;
      if (L) { m.color.set(L.color); m.metalness = L.metalness; m.roughness = L.roughness; }
      m.envMapIntensity = 1.3;
    }
  });
  GPU_CACHE = g.scene;
  continueRender(GPU_HANDLE);
}, undefined, (e) => { console.error('gpu.glb', e); continueRender(GPU_HANDLE); });
export const useGpu = () => GPU_CACHE;

// Clone so several scenes can each place their own copy.
export const GpuModel = ({ scale = 0.1, ...props }) => {
  const src = useGpu();
  const obj = useMemo(() => (src ? src.clone(true) : null), [src]);
  if (!obj) return null;
  return <primitive object={obj} scale={scale} {...props} />;
};

// Soft studio environment so the metals have something to reflect (no external HDRI).
export const StudioEnv = ({ tint = '#ffffff' }) => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: '#0d0f12', side: THREE.BackSide }));
    env.add(box);
    const panel = (x, y, z, w, h, c, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(0, 4.5, 0, 6, 4, tint, 2.2);       // overhead softbox
    panel(-4.5, 1, 2, 2, 5, '#76B900', 0.9); // green card
    panel(4.5, 1, 2, 2, 5, '#E5484D', 0.6);  // red card
    scene.environment = pm.fromScene(env, 0.04).texture;
  }, [gl, scene, tint]);
  return null;
};
