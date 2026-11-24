import front from '../front.json';

// His face as a cloud of dots that can be turned as a real 3D shape (used by the match ring and the result ring).
// Each dot is [x, y, z, depth]: x is mirrored (it is a reflection), z comes from the depth map with the nose
// brought back to real proportions (it sticks out about 14% of the face width), so turning the head left / right /
// up / down keeps the nose in shape instead of swinging it across the face.
const shape = (d: number) => (d > 0.6 ? 0.6 + (d - 0.6) * 0.5 : d);
export const headDots = (scale: number, every = 1) =>
  (front.dots as number[][]).filter((_, i) => i % every === 0).map((d) => [-(d[0] - 389) * scale, (d[1] - 655) * scale, (shape(d[2]) - 0.45) * 230 * scale, d[2]]);

// yaw: + turns his face to our right; pitch: + tilts it down. Degrees. Returns screen x, y.
export const turnDot = (p: number[], yawDeg: number, pitchDeg: number): [number, number] => {
  const a = (yawDeg * Math.PI) / 180, b = (pitchDeg * Math.PI) / 180;
  const x1 = p[0] * Math.cos(a) + p[2] * Math.sin(a), z1 = -p[0] * Math.sin(a) + p[2] * Math.cos(a);
  return [x1, p[1] * Math.cos(b) + z1 * Math.sin(b)];
};
