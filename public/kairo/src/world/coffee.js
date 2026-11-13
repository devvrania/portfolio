import * as THREE from 'three';
import { addMesh } from '../helpers.js';

/** Black mug with Kairo's triangle mark, latte art and rising steam. Returns an updater for the steam. */
export function buildCoffee(scene, x, top, z) {
  const g = new THREE.Group();
  g.position.set(x, top, z);
  scene.add(g);

  const ceramic = new THREE.MeshStandardMaterial({ color: '#141015', roughness: 0.35, side: THREE.DoubleSide });
  addMesh(g, new THREE.CylinderGeometry(0.075, 0.075, 0.006, 40), new THREE.MeshStandardMaterial({ color: '#3a2c24', roughness: 0.9 }), 0, 0.003, 0); // coaster
  const printed = ceramic.clone();
  printed.color.set('#ffffff');   // the map carries the colour
  printed.map = triangleMark();
  const wall = addMesh(g, new THREE.CylinderGeometry(0.042, 0.038, 0.1, 40, 1, true), printed, 0, 0.056, 0);
  wall.rotation.y = 1.87;   // turns the mark toward the camera
  addMesh(g, new THREE.CylinderGeometry(0.038, 0.038, 0.004, 40), ceramic, 0, 0.008, 0);         // bottom
  addMesh(g, new THREE.TorusGeometry(0.042, 0.0025, 8, 40), ceramic, 0, 0.106, 0).rotation.x = Math.PI / 2;    // rim

  const handle = addMesh(g, new THREE.TorusGeometry(0.024, 0.007, 12, 24, Math.PI), ceramic);
  handle.rotation.set(0, 1.98, -Math.PI / 2);
  handle.position.set(-0.017, 0.058, -0.0385);  // on his side, to the left in the camera's view

  const surface = addMesh(g, new THREE.CircleGeometry(0.0405, 40),
    new THREE.MeshStandardMaterial({ map: latteArt(), roughness: 0.25 }), 0, 0.096, 0);
  surface.rotation.set(-Math.PI / 2, 0, 0.5);

  const puff = softDot(64);
  const steam = [];
  for (let i = 0; i < 7; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, transparent: true, depthWrite: false, opacity: 0 }));
    sp.userData = { phase: i / 7, sway: Math.random() * 6 };
    g.add(sp);
    steam.push(sp);
  }

  return {
    update(dt, t) {
      for (const sp of steam) {
        const u = sp.userData;
        u.phase = (u.phase + dt * 0.28) % 1;
        const p = u.phase;
        sp.position.set(Math.sin(t * 1.3 + u.sway + p * 5) * 0.012 * (1 + p * 2), 0.11 + p * 0.2, Math.cos(t * 0.9 + u.sway) * 0.006);
        sp.scale.setScalar(0.025 + p * 0.07);
        sp.material.opacity = 0.32 * Math.sin(p * Math.PI);
      }
    },
  };
}

function latteArt() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const k = c.getContext('2d');
  k.fillStyle = '#5b3a22'; k.fillRect(0, 0, 256, 256);
  const crema = k.createRadialGradient(128, 128, 30, 128, 128, 128);
  crema.addColorStop(0, 'rgba(0,0,0,0)'); crema.addColorStop(1, 'rgba(40,22,10,.55)');
  k.fillStyle = crema; k.fillRect(0, 0, 256, 256);
  k.fillStyle = '#f1e2cb';
  k.beginPath(); k.moveTo(128, 190);
  k.bezierCurveTo(60, 140, 70, 70, 128, 100); k.bezierCurveTo(186, 70, 196, 140, 128, 190); k.fill();   // heart
  k.strokeStyle = '#f1e2cb'; k.lineWidth = 6;
  k.beginPath(); k.moveTo(128, 196); k.lineTo(128, 226); k.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Thin white triangle on black, centred on the side of the mug that faces the camera. */
function triangleMark() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const k = c.getContext('2d');
  k.fillStyle = '#141015'; k.fillRect(0, 0, 512, 128);
  k.strokeStyle = '#e8e2e6'; k.lineWidth = 3; k.lineJoin = 'round';
  k.beginPath(); k.moveTo(256, 44); k.lineTo(274, 80); k.lineTo(238, 80); k.closePath(); k.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function softDot(size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
