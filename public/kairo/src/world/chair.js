import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { addMesh } from '../helpers.js';

/** Racing-style developer chair: high reclined back, headrest and lumbar pillows, red piping, armrests, 5-star base. */
export function buildChair(scene, layout) {
  const sy = layout.seatY;
  const g = new THREE.Group();
  g.position.set(layout.hipX, 0, layout.hipZ);
  scene.add(g);

  const leather = new THREE.MeshStandardMaterial({ color: '#17191f', roughness: 0.55 });
  const red = new THREE.MeshStandardMaterial({ color: '#c8373e', roughness: 0.5, emissive: '#3a0a0c', emissiveIntensity: 0.6 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#9aa1ad', metalness: 0.85, roughness: 0.3 });
  const plastic = new THREE.MeshStandardMaterial({ color: '#0f1116', roughness: 0.7 });
  const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 4, r);

  // seat with red side piping
  addMesh(g, rbox(0.52, 0.085, 0.5, 0.035), leather, 0, sy - 0.045, -0.04);
  for (const sx of [-1, 1]) addMesh(g, rbox(0.03, 0.09, 0.46, 0.012), red, sx * 0.25, sy - 0.043, -0.04);

  // reclined backrest
  const back = new THREE.Group();
  back.position.set(0, sy + 0.02, -0.3);
  back.rotation.x = -0.14;
  g.add(back);
  addMesh(back, rbox(0.5, 0.8, 0.09, 0.04), leather, 0, 0.42, -0.045);
  for (const sx of [-1, 1]) addMesh(back, rbox(0.032, 0.62, 0.012, 0.006), red, sx * 0.165, 0.42, 0.002);  // racing stripes
  for (const sx of [-1, 1]) addMesh(back, rbox(0.07, 0.62, 0.11, 0.03), leather, sx * 0.235, 0.36, -0.03);  // side bolsters
  addMesh(back, rbox(0.26, 0.12, 0.06, 0.03), leather, 0, 0.74, 0.03);   // headrest pillow
  addMesh(back, rbox(0.12, 0.012, 0.004, 0.002), red, 0, 0.74, 0.061);   // stripe on the headrest
  addMesh(back, rbox(0.3, 0.11, 0.055, 0.03), leather, 0, 0.18, 0.028);  // lumbar pillow

  // armrests
  for (const sx of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.035, 0.2, 0.05), plastic, sx * 0.29, sy + 0.06, -0.12);
    addMesh(g, rbox(0.075, 0.03, 0.26, 0.012), plastic, sx * 0.29, sy + 0.17, -0.08);
  }

  // gas lift, base and casters
  addMesh(g, new THREE.CylinderGeometry(0.035, 0.035, 0.05, 20), plastic, 0, sy - 0.11, -0.04);
  addMesh(g, new THREE.CylinderGeometry(0.022, 0.022, sy - 0.2, 20), chrome, 0, (sy - 0.2) / 2 + 0.07, -0.04);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    addMesh(g, new THREE.BoxGeometry(0.3, 0.03, 0.045), plastic, Math.cos(a) * 0.15, 0.075, -0.04 - Math.sin(a) * 0.15).rotation.y = a;
    const wheel = addMesh(g, new THREE.CylinderGeometry(0.026, 0.026, 0.024, 18), plastic, Math.cos(a) * 0.29, 0.027, -0.04 - Math.sin(a) * 0.29);
    wheel.rotation.x = Math.PI / 2;
    wheel.rotation.z = a;
  }
}
