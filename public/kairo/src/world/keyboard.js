import { canvasTexture } from '../helpers.js';

/** Backlit keycaps drawn on a canvas, glowing soft pink. A pressed key flashes bright and fades. */
export function createKeycaps() {
  const { ctx, texture } = canvasTexture(840, 260);
  const keys = [];
  const kw = 56, kh = 46, gap = 4, x0 = 12, y0 = 12;
  [14, 14, 13, 12].forEach((count, row) => {
    for (let i = 0; i < count; i++) keys.push({ x: x0 + row * 10 + i * (kw + gap), y: y0 + row * (kh + gap), w: kw, h: kh, glow: 0 });
  });
  keys.push({ x: x0 + 3.5 * (kw + gap), y: y0 + 4 * (kh + gap), w: 6.5 * (kw + gap) - gap, h: kh, glow: 0 }); // space bar

  function draw() {
    ctx.fillStyle = '#140e12'; ctx.fillRect(0, 0, 840, 260);
    for (const k of keys) {
      const g = k.glow;
      ctx.fillStyle = `rgb(${Math.round(150 + 105 * g)},${Math.round(98 + 120 * g)},${Math.round(118 + 112 * g)})`;
      ctx.beginPath(); ctx.roundRect(k.x, k.y, k.w, k.h, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,238,0.22)'; ctx.fillRect(k.x + 5, k.y + 4, k.w - 10, 3);  // keycap highlight
    }
    texture.needsUpdate = true;
  }
  draw();

  return {
    texture,
    flash() { keys[Math.floor(Math.random() * keys.length)].glow = 1; },
    update(dt) {
      let lit = false;
      for (const k of keys) if (k.glow > 0) { k.glow = Math.max(0, k.glow - dt * 4); lit = true; }
      if (lit) draw();
    },
  };
}
