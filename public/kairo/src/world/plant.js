import * as THREE from 'three';
import { addMesh } from '../helpers.js';

const leafShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.5, 0.45, 0, 1);
  s.quadraticCurveTo(-0.5, 0.45, 0, 0);
  return new THREE.ShapeGeometry(s, 6);
})();

const leafMats = ['#22311f', '#2c3d27', '#1b281a'].map(color =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, side: THREE.DoubleSide }));

/** One leaf of length `len`, attached at the origin of `parent`. */
export function leaf(parent, len, yaw, tilt, i = 0) {
  const pivot = new THREE.Group();
  pivot.rotation.set(0, yaw, 0);
  parent.add(pivot);
  const m = new THREE.Mesh(leafShape, leafMats[i % leafMats.length]);
  m.scale.set(len * 0.55, len, 1);
  m.rotation.x = -tilt;   // tip away from the stem
  m.castShadow = true;
  pivot.add(m);
  return pivot;
}

/** A potted leafy plant, `height` metres tall, at (x, y, z). */
export function buildPlant(scene, x, y, z, height, potColor = '#1c1418') {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  const potH = height * 0.28, potR = height * 0.16;
  addMesh(g, new THREE.CylinderGeometry(potR, potR * 0.78, potH, 28), new THREE.MeshStandardMaterial({ color: potColor, roughness: 0.6 }), 0, potH / 2, 0);
  addMesh(g, new THREE.CylinderGeometry(potR * 0.93, potR * 0.93, 0.01, 28), new THREE.MeshStandardMaterial({ color: '#140d0c', roughness: 1 }), 0, potH - 0.005, 0);

  let seed = Math.round(x * 1000 + z * 7) || 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = 18;
  for (let i = 0; i < n; i++) {
    const stem = new THREE.Group();
    stem.position.set((rnd() - 0.5) * potR, potH, (rnd() - 0.5) * potR);
    g.add(stem);
    const up = rnd();
    leaf(stem, height * (0.35 + up * 0.4), i / n * Math.PI * 2 + rnd(), 0.25 + (1 - up) * 0.9, i);
  }
  return g;
}
