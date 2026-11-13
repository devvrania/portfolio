import * as THREE from 'three';
import { mat, box, addMesh } from '../helpers.js';
import { buildPlant } from './plant.js';

const MONITOR_TURN = 0.6;   // ~35° toward the camera, so visitors can see the code he types

/**
 * Desk, keyboard, mouse, monitor, moon lamp and a plant, placed around his hands.
 * @returns the monitor's world position (he looks there while working)
 */
export function buildDesk(scene, layout, { keycaps, screen }) {
  const wood = mat('#211619', 0.6), soft = mat('#211a1f', 0.85), dark = mat('#0f0b0e', 0.45);
  const top = layout.deskTop, front = layout.deskFront, cx = layout.centerX, depth = 1.0, w = 1.5;

  // desk
  box(scene, w, 0.035, depth, wood, cx, top - 0.0175, front + depth / 2);
  for (const sx of [-1, 1]) box(scene, 0.04, top - 0.035, depth - 0.06, wood, cx + sx * (w / 2 - 0.04), (top - 0.035) / 2, front + depth / 2);
  box(scene, w - 0.1, 0.25, 0.02, wood, cx, top - 0.16, front + depth - 0.04);

  // keyboard with lit keycaps, mouse, desk mat
  const kb = mat('#1a1216', 0.45);
  box(scene, 0.44, 0.02, 0.15, kb, layout.kbX, top + 0.01, layout.kbZ);
  const caps = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.13),
    new THREE.MeshStandardMaterial({ map: keycaps.texture, emissiveMap: keycaps.texture, emissive: '#ffffff', emissiveIntensity: 0.55, roughness: 0.6 }));
  caps.rotation.x = -Math.PI / 2;
  caps.position.set(layout.kbX, top + 0.0205, layout.kbZ);
  scene.add(caps);
  const underglow = new THREE.PointLight('#ff4d7a', 0.45, 0.4);    // soft pink glow on his fingers
  underglow.position.set(layout.kbX, top + 0.06, layout.kbZ);
  scene.add(underglow);
  box(scene, 0.06, 0.02, 0.1, kb, layout.kbX + 0.33, top + 0.01, layout.kbZ + 0.02);
  const deskMat = new THREE.MeshStandardMaterial({ color: '#ff3b5c', emissive: '#ff3b5c', emissiveIntensity: 0.35, roughness: 0.6 });
  box(scene, 0.82, 0.002, 0.46, deskMat, layout.kbX + 0.1, top + 0.001, layout.kbZ + 0.04);   // glowing edge of the desk mat
  box(scene, 0.8, 0.003, 0.44, mat('#130d11', 0.95), layout.kbX + 0.1, top + 0.0025, layout.kbZ + 0.04);

  // at the far end of the desk: crescent moon lamp on a stack of books, and a plant
  buildMoonLamp(scene, cx - 0.02, top, front + 0.85);
  buildPlant(scene, cx + 0.62, top, front + 0.78, 0.36);

  // monitor, angled toward the camera
  const mz = front + 0.52, my = top + 0.33;
  const mon = new THREE.Group();
  mon.position.set(cx, top, mz + 0.03);
  mon.rotation.y = MONITOR_TURN;
  scene.add(mon);
  box(mon, 0.06, 0.2, 0.04, soft, 0, 0.1, 0);
  box(mon, 0.24, 0.01, 0.16, soft, 0, 0.005, 0);
  box(mon, 0.74, 0.44, 0.03, dark, 0, my - top, -0.03);
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.394), new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }));
  display.position.set(0, my - top, -0.0455);
  display.rotation.y = Math.PI;
  mon.add(display);
  mon.updateMatrixWorld(true);
  const monitorCenter = display.getWorldPosition(new THREE.Vector3());

  const glow = new THREE.PointLight('#cdbfff', 1.2, 1.8);   // monitor light on his face
  glow.position.copy(monitorCenter).add(new THREE.Vector3(0, 0, -0.3).applyAxisAngle(new THREE.Vector3(0, 1, 0), MONITOR_TURN));
  scene.add(glow);

  return monitorCenter;
}

/**
 * A thin glowing crescent moon standing upright on a round base, on top of two books.
 * The horns point left in the camera's view, as in the banner.
 */
function buildMoonLamp(scene, x, top, z) {
  const g = new THREE.Group();
  g.position.set(x, top, z);
  g.rotation.y = -1.27;   // local +z faces the camera
  scene.add(g);
  box(g, 0.24, 0.032, 0.17, mat('#3a1c24', 0.8), 0, 0.016, 0);
  box(g, 0.22, 0.028, 0.155, mat('#2a1a20', 0.8), 0.006, 0.046, -0.004).rotation.y = -0.06;
  const baseTop = 0.06 + 0.014;
  addMesh(g, new THREE.CylinderGeometry(0.05, 0.054, 0.014, 32), mat('#3b2a2a', 0.5), 0, 0.06 + 0.007, 0);
  addMesh(g, new THREE.CylinderGeometry(0.044, 0.044, 0.002, 32),
    new THREE.MeshStandardMaterial({ color: '#ffcfae', emissive: '#ff9d6e', emissiveIntensity: 0.8 }), 0, baseTop + 0.001, 0);   // lit rim of the base

  // crescent: the outer circle with an overlapping circle bitten out of it
  const d = 0.45, a = Math.acos(d / 2);
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1, a, Math.PI * 2 - a, false);
  shape.absarc(d, 0, 1, Math.PI + a, Math.PI - a, true);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3, curveSegments: 48 });
  geo.translate(0, 0, -0.07);
  const R = 0.085;
  const moon = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#ffe2cc', emissive: '#ffa06e', emissiveIntensity: 1.7, roughness: 0.4 }));
  moon.scale.setScalar(R);
  moon.rotation.z = Math.PI;   // bite on the left: horns point left
  moon.position.set(-0.02, baseTop + R * 0.97, 0);
  g.add(moon);

  const light = new THREE.PointLight('#ffa77a', 1.1, 1.8);
  light.position.set(-0.04, baseTop + R, 0.06);
  g.add(light);
}
