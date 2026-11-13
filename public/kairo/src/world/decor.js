import * as THREE from 'three';
import { mat, box, addMesh, canvasTexture } from '../helpers.js';
import { leaf } from './plant.js';

const BOOK_COLORS = ['#2a1f26', '#d9d0d5', '#4a1e26', '#3a2a33', '#7a2834', '#1f171c', '#c9bfc5', '#5a2a33'];

/**
 * The cosy clutter from Kairo's banner: shelves of books with trailing ivy, a dresser, a cat night-light
 * on the side wall, a neon </> sign, and a "Build · Explore · Create" poster beside the window.
 * @returns an updater (neon hum, swaying ivy)
 */
export function buildDecor(scene, { wx, wy, wz, winW, layout }) {
  const top = layout.deskTop;
  const sideZ = layout.hipZ - 1.4 + 0.005;   // the side wall on the left of the camera's view
  const x0 = layout.hipX;
  const wood = mat('#2a1c20', 0.7);

  // two floating shelves on the side wall
  const ivy = [];
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const [sy, from, to, room] of [[top + 0.78, 0.0, 0.75, 0.18], [top + 0.44, 0.0, 0.7, 0.32]]) {   // room: space left free at the end
    const len = to - from, depth = 0.2;
    box(scene, len, 0.025, depth, wood, x0 + from + len / 2, sy, sideZ + depth / 2);
    let x = x0 + from + 0.04;
    while (x < x0 + to - room) {
      const w = 0.025 + rnd() * 0.02, h = 0.15 + rnd() * 0.07;
      box(scene, w, h, 0.14 + rnd() * 0.03, mat(BOOK_COLORS[Math.floor(rnd() * BOOK_COLORS.length)], 0.8), x + w / 2, sy + 0.0125 + h / 2, sideZ + 0.09);
      x += w + 0.004;
    }
    // trailing ivy from a little pot at the end of each shelf
    const px = x0 + to - 0.09;
    addMesh(scene, new THREE.CylinderGeometry(0.05, 0.04, 0.08, 20), mat('#1b1216', 0.6), px, sy + 0.0525, sideZ + 0.1);
    for (let k = 0; k < 3; k++) {
      const vine = new THREE.Group();
      vine.position.set(px + (k - 1) * 0.035, sy + 0.08, sideZ + 0.12 + (k % 2) * 0.04);
      scene.add(vine);
      const n = 7 + Math.floor(rnd() * 6);
      for (let i = 0; i < n; i++) {
        const node = new THREE.Group();
        node.position.y = -i * 0.05;
        vine.add(node);
        leaf(node, 0.05 + rnd() * 0.02, rnd() * Math.PI * 2, 1.2 + rnd() * 0.6, i + k);
      }
      ivy.push({ vine, phase: rnd() * 6 });
    }
  }

  // the dresser under the lower shelf, standing on the floor behind his chair
  buildDresser(scene, x0, x0 + 0.7, top + 0.44 - 0.0125, sideZ);

  // cat night-light on the lower shelf, between the books and the ivy
  const cat = buildCatLamp(scene, x0 + 0.49, top + 0.4525, sideZ + 0.11);

  // neon </> sign on the side wall, to the right of the shelves
  const neon = neonSign('</>', '#ff3b6b');
  neon.mesh.position.set(x0 + 1.12, top + 0.7, sideZ + 0.01);
  scene.add(neon.mesh);
  const neonLight = new THREE.PointLight('#ff3b6b', 0.7, 1.6);
  neonLight.position.set(x0 + 1.12, top + 0.7, sideZ + 0.25);
  scene.add(neonLight);

  // framed "Build · Explore · Create" print on the window wall, right of the window
  buildFramedPrint(scene, wx, wy - 0.03, wz + winW / 2 + 0.31);

  return {
    update(dt, t) {
      for (const v of ivy) v.vine.rotation.x = Math.sin(t * 0.7 + v.phase) * 0.04;
      const hum = 0.92 + 0.08 * Math.sin(t * 31) * Math.sin(t * 7.3) + (Math.sin(t * 0.37) > 0.995 ? -0.5 : 0);   // a rare flicker
      neon.mesh.material.opacity = hum;
      neonLight.intensity = 0.7 * hum;
      cat.light.intensity = 0.45 + 0.05 * Math.sin(t * 1.4);
    },
  };
}

/**
 * Low dark-wood dresser against the side wall, from x `from` to `to`, its top at `height`:
 * two small drawers over two wide ones, slim metal pulls, and a recessed plinth.
 */
function buildDresser(scene, from, to, height, wallZ) {
  const W = to - from, D = 0.34, cx = from + W / 2, front = wallZ + D;
  const body = mat('#271b20', 0.6);
  const face = new THREE.MeshStandardMaterial({ color: '#3a2830', roughness: 0.45 });
  const pull = new THREE.MeshStandardMaterial({ color: '#9a8890', roughness: 0.3, metalness: 0.8 });

  const plinth = 0.05;
  box(scene, W - 0.03, plinth, D - 0.03, mat('#120c0f', 0.8), cx, plinth / 2, wallZ + D / 2 - 0.015);   // recessed kick plinth
  box(scene, W, height - plinth, D, body, cx, plinth + (height - plinth) / 2, wallZ + D / 2);            // carcass
  box(scene, W + 0.02, 0.022, D + 0.015, body, cx, height - 0.011, wallZ + (D + 0.015) / 2);              // overhanging top

  // drawer fronts, slightly proud of the carcass with dark reveals between them
  const gap = 0.008, inset = 0.018;
  const usable = height - 0.022 - plinth - inset * 2;
  const rows = [0.28, 0.36, 0.36];   // share of the height: small top row, two deep drawers
  let y = height - 0.022 - inset;
  rows.forEach((share, r) => {
    const h = usable * share - gap;
    const cols = r === 0 ? 2 : 1;
    const w = (W - inset * 2 - gap * (cols - 1)) / cols;
    for (let c = 0; c < cols; c++) {
      const x = from + inset + w / 2 + c * (w + gap);
      box(scene, w, h, 0.018, face, x, y - h / 2, front + 0.009);
      box(scene, cols === 2 ? 0.07 : 0.12, 0.01, 0.012, pull, x, y - h * 0.32, front + 0.024);   // pull near the top edge
    }
    y -= h + gap;
  });
}

/** A round little cat that glows like a night-light. */
function buildCatLamp(scene, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  const glow = new THREE.MeshStandardMaterial({ color: '#fff1ea', emissive: '#ffcdb8', emissiveIntensity: 1.1, roughness: 0.5 });
  const body = addMesh(g, new THREE.SphereGeometry(0.055, 28, 20), glow, 0, 0.045, 0);
  body.scale.set(1, 0.85, 0.9);
  for (const s of [-1, 1]) {
    const ear = addMesh(g, new THREE.ConeGeometry(0.016, 0.03, 12), glow, s * 0.03, 0.093, 0);
    ear.rotation.z = -s * 0.35;
  }
  const ink = new THREE.MeshBasicMaterial({ color: '#3a2228' });
  for (const s of [-1, 1]) addMesh(g, new THREE.SphereGeometry(0.0045, 10, 8), ink, s * 0.018, 0.055, 0.048);
  const mouth = addMesh(g, new THREE.TorusGeometry(0.006, 0.0015, 6, 12, Math.PI), ink, 0, 0.045, 0.0495);
  mouth.rotation.z = Math.PI;
  const light = new THREE.PointLight('#ffc2a8', 0.45, 1.2);
  light.position.set(0, 0.06, 0.12);
  g.add(light);
  return { light };
}

function neonSign(text, color) {
  const { canvas, ctx, texture } = canvasTexture(512, 256);
  ctx.font = 'bold 150px Menlo, ui-monospace, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  for (const [blur, width, stroke] of [[40, 10, color], [18, 7, color], [0, 3, '#ffd6df']]) {
    ctx.shadowBlur = blur; ctx.lineWidth = width; ctx.strokeStyle = stroke;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2 + 6);
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  return { mesh };
}

/**
 * Portrait print in a dark wooden frame with a thin light inner lip, hung on the wall at x
 * and facing into the room: charcoal paper, three soft-grey words and a short red rule.
 */
function buildFramedPrint(scene, x, y, z) {
  const W = 0.36, H = 0.48, bar = 0.028, depth = 0.03;
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = -Math.PI / 2;   // local +z faces into the room
  scene.add(g);

  const wood = new THREE.MeshStandardMaterial({ color: '#16101a', roughness: 0.45, metalness: 0.2 });
  const lip = new THREE.MeshStandardMaterial({ color: '#6e5a66', roughness: 0.35, metalness: 0.6 });
  for (const s of [-1, 1]) {
    box(g, W + bar * 2, bar, depth, wood, 0, s * (H / 2 + bar / 2), depth / 2);   // top and bottom rails
    box(g, bar, H, depth, wood, s * (W / 2 + bar / 2), 0, depth / 2);             // stiles
    box(g, W, 0.004, 0.004, lip, 0, s * (H / 2 - 0.002), depth - 0.008);          // inner lip
    box(g, 0.004, H, 0.004, lip, s * (W / 2 - 0.002), 0, depth - 0.008);
  }
  box(g, W, H, 0.006, wood, 0, 0, 0.003);   // backing

  const { ctx, texture } = canvasTexture(420, 560);
  ctx.fillStyle = '#1e181c'; ctx.fillRect(0, 0, 420, 560);
  const grain = ctx.createRadialGradient(210, 230, 40, 210, 280, 380);   // faint vignette, like light on paper
  grain.addColorStop(0, 'rgba(255,255,255,.035)'); grain.addColorStop(1, 'rgba(0,0,0,.25)');
  ctx.fillStyle = grain; ctx.fillRect(0, 0, 420, 560);
  ctx.fillStyle = '#bcb0b7';
  ctx.font = '400 54px Inter, "Helvetica Neue", system-ui, sans-serif';
  ['Build', 'Explore', 'Create'].forEach((w, i) => ctx.fillText(w, 96, 196 + i * 74));
  ctx.fillStyle = '#d6324d'; ctx.fillRect(98, 376, 86, 4);

  const print = new THREE.Mesh(new THREE.PlaneGeometry(W, H),
    new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: '#ffffff', emissiveIntensity: 0.12, roughness: 0.85 }));
  print.position.z = 0.0065;
  g.add(print);
}
