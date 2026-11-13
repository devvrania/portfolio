import * as THREE from 'three';
import { mat, box, canvasTexture } from '../helpers.js';
import { buildDecor } from './decor.js';

/**
 * Walls, curtains, and a window onto a night city with a cherry tree just outside,
 * plus the decor around it (bookcase, neon sign, cat lamp, poster).
 * @returns the window's world position and an updater for the petals and decor
 */
export function buildRoom(scene, layout) {
  const wallMat = mat('#1d1419', 0.95);
  const wx = layout.hipX + 1.7;   // the wall behind him in the camera's view
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), wallMat);
  wall.position.set(wx, 1.6, layout.hipZ);
  wall.rotation.y = -Math.PI / 2;
  wall.receiveShadow = true;
  scene.add(wall);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), wallMat);
  back.position.set(layout.hipX, 1.6, layout.hipZ - 1.4);
  back.receiveShadow = true;
  scene.add(back);

  // window
  const view = createCityView();
  const winW = 1.5, winH = 0.94, wy = layout.deskTop + 0.75, wz = layout.hipZ + 0.25;
  const win = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: view.texture, toneMapped: false }));
  win.position.set(wx - 0.01, wy, wz);
  win.rotation.y = -Math.PI / 2;
  scene.add(win);

  const frame = mat('#1a1418', 0.6);
  for (const dz of [-winW / 2, 0, winW / 2]) box(scene, 0.04, winH + 0.1, 0.05, frame, wx - 0.02, wy, wz + dz);
  box(scene, 0.04, 0.05, winW + 0.1, frame, wx - 0.02, wy + winH / 2 + 0.02, wz);
  box(scene, 0.12, 0.04, winW + 0.16, frame, wx - 0.06, wy - winH / 2 - 0.02, wz);   // sill

  // heavy dark curtains, drawn back to either side
  const curtain = mat('#160f14', 0.95);
  for (const side of [-1, 1]) box(scene, 0.05, winH + 0.75, 0.12, curtain, wx - 0.09, wy + 0.05, wz + side * (winW / 2 + 0.1));

  const cityGlow = new THREE.PointLight('#d8a0d0', 0.8, 3);
  cityGlow.position.set(wx - 0.4, wy, wz);
  scene.add(cityGlow);

  const decor = buildDecor(scene, { wx, wy, wz, winW, winH, layout });

  return {
    windowCenter: win.position.clone(),
    update(dt, t) { view.update(dt, t); decor.update(dt, t); },
  };
}

/** Skyline and cherry tree painted once, with petals drawn over them every frame. */
function createCityView() {
  const { ctx, texture } = canvasTexture(1024, 640);
  const backdrop = paintBackdrop();
  const petals = Array.from({ length: 70 }, () => ({
    x: Math.random() * 1024, y: Math.random() * 640, r: 3 + Math.random() * 4,
    s: 14 + Math.random() * 26, d: Math.random() * 6, a: Math.random() * 6, spin: (Math.random() - 0.5) * 3,
  }));

  return {
    texture,
    update(dt, t) {
      ctx.drawImage(backdrop, 0, 0);
      for (const p of petals) {
        p.y += p.s * dt;
        p.x += (14 + Math.sin(t * 0.9 + p.d) * 18) * dt;   // drifting on a light breeze
        p.a += p.spin * dt;
        if (p.y > 650 || p.x > 1034) { p.y = -10; p.x = Math.random() * 900 - 60; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.globalAlpha = 0.55 + p.r / 14;
        ctx.fillStyle = '#f6b3c8';
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 7); ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      texture.needsUpdate = true;
    },
  };
}

function paintBackdrop() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 640;
  const c = canvas.getContext('2d');
  const sky = c.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, '#140e1c'); sky.addColorStop(0.55, '#2a1b33'); sky.addColorStop(1, '#5a3050');
  c.fillStyle = sky; c.fillRect(0, 0, 1024, 640);

  let seed = 7;   // fixed seed: the same view every time
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // a few faint stars
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,220,235,${0.15 + rnd() * 0.35})`; c.fillRect(rnd() * 1024, rnd() * 260, 2, 2); }

  // two layers of towers with lit windows, far ones hazier
  for (const [color, minH, lit] of [['#2a1d33', 0.62, 0.5], ['#150f1d', 0.42, 0.85]]) {
    let x = -20;
    while (x < 1040) {
      const w = 45 + rnd() * 95, h = 640 * (minH * 0.5 + rnd() * minH * 0.75);
      c.fillStyle = color; c.fillRect(x, 640 - h, w, h);
      for (let wy = 640 - h + 12; wy < 632; wy += 14) for (let wx = x + 7; wx < x + w - 7; wx += 12) {
        if (rnd() < 0.3 * lit) { c.fillStyle = rnd() < 0.7 ? 'rgba(255,205,190,.7)' : 'rgba(255,120,170,.75)'; c.fillRect(wx, wy, 5, 7); }
      }
      if (rnd() < 0.25) { c.fillStyle = 'rgba(255,70,110,.9)'; c.fillRect(x + w / 2 - 2, 640 - h - 10, 4, 4); }   // aircraft light
      x += w + 5;
    }
  }
  // pink haze over the street glow
  const haze = c.createLinearGradient(0, 420, 0, 640);
  haze.addColorStop(0, 'rgba(255,120,170,0)'); haze.addColorStop(1, 'rgba(255,120,170,.28)');
  c.fillStyle = haze; c.fillRect(0, 420, 1024, 220);

  paintTree(c, rnd);
  return canvas;
}

/**
 * A cherry tree just outside: the trunk rises along the left edge of the window and
 * its branches spread across the top, heavy with clusters of small pink flowers.
 */
function paintTree(c, rnd) {
  const tips = [];   // where blossom clusters go

  const limb = (x, y, angle, len, width, depth) => {
    const bend = (rnd() - 0.5) * 0.5;
    const mx = x + Math.cos(angle + bend) * len * 0.5, my = y + Math.sin(angle + bend) * len * 0.5;
    const ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
    c.strokeStyle = '#1e1217'; c.lineWidth = width; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
    for (let k = 0.35; k <= 1; k += 0.22) tips.push([x + (ex - x) * k, y + (ey - y) * k, 0.5 + k * 0.5 + (depth === 0 ? 0.4 : 0)]);
    if (depth > 0) {
      const forks = 2 + (rnd() < 0.4 ? 1 : 0);
      for (let f = 0; f < forks; f++) {
        const spread = (f - (forks - 1) / 2) * (0.55 + rnd() * 0.3);
        limb(ex, ey, angle + spread + (rnd() - 0.5) * 0.3, len * (0.55 + rnd() * 0.2), width * 0.62, depth - 1);
      }
    }
  };

  // trunk up the left edge, leaning into the window
  c.strokeStyle = '#1a0f14'; c.lineCap = 'round';
  c.lineWidth = 34; c.beginPath(); c.moveTo(-8, 660); c.bezierCurveTo(40, 470, 10, 320, 60, 190); c.stroke();
  // main limbs reaching right across the top, and one drooping lower
  limb(60, 200, -0.32, 250, 18, 3);
  limb(50, 250, 0.08, 220, 14, 3);
  limb(40, 330, 0.42, 150, 10, 2);
  limb(62, 190, -1.2, 130, 12, 2);

  // soft pink haze behind the blossoms so the canopy reads as one mass
  for (const [x, y] of tips) {
    const g = c.createRadialGradient(x, y, 0, x, y, 46);
    g.addColorStop(0, 'rgba(240,150,185,.22)'); g.addColorStop(1, 'rgba(240,150,185,0)');
    c.fillStyle = g; c.fillRect(x - 46, y - 46, 92, 92);
  }
  // clusters of five-petal flowers
  const petal = ['#f9d3df', '#f4b4c8', '#eea0b9', '#fbe4ec'];
  for (const [x, y, weight] of tips) {
    const n = Math.round(10 + weight * 16);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (14 + weight * 16);
      const fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d * 0.8 + 4;
      const p = 2.6 + rnd() * 2.4, turn = rnd() * 6;
      c.fillStyle = petal[Math.floor(rnd() * petal.length)];
      c.globalAlpha = 0.75 + rnd() * 0.25;
      for (let k = 0; k < 5; k++) {
        const pa = turn + k * Math.PI * 2 / 5;
        c.beginPath(); c.arc(fx + Math.cos(pa) * p * 0.75, fy + Math.sin(pa) * p * 0.75, p * 0.62, 0, 7); c.fill();
      }
      c.fillStyle = '#c45a7c'; c.beginPath(); c.arc(fx, fy, p * 0.28, 0, 7); c.fill();
    }
  }
  c.globalAlpha = 1;
}
