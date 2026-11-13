import { v3 } from '../helpers.js';

const FINGERS = ['Index', 'Middle', 'Ring'];

/** Random key taps with index, middle and ring fingers, plus a little hand drift. */
export class Typing {
  /** @param onKey called on every key press (lights the key, advances the code on screen) */
  constructor(rig, curlAxis, onKey) {
    this.rig = rig;
    this.onKey = onKey;
    this.timer = 0;
    this.presses = {};
    this.ax = {};
    for (const L of ['left', 'right']) {
      for (const f of FINGERS) {
        this.presses[`${L}${f}`] = 0;
        this.ax[`${L}${f}`] = rig.localAxis(`${L}${f}Proximal`, curlAxis[L]);
      }
      this.ax[`${L}Hand`] = rig.localAxis(`${L}Hand`, curlAxis[L]);
      this.ax[`${L}HandYaw`] = rig.localAxis(`${L}Hand`, v3(0, 1, 0));
    }
  }

  update(dt, t, active) {
    const { rig, ax, presses } = this;
    if (active) {
      this.timer -= dt;
      if (this.timer <= 0) {
        const keys = Object.keys(presses);
        presses[keys[Math.floor(Math.random() * keys.length)]] = 1;
        this.onKey();
        this.timer = 0.07 + Math.random() * 0.14;
      }
    }
    for (const k in presses) {
      presses[k] = Math.max(0, presses[k] - dt * 9);
      const L = k.startsWith('left') ? 'left' : 'right', f = k.slice(L.length);
      rig.add(`${L}${f}Proximal`, ax[k], presses[k] * 0.55);
      rig.add(`${L}${f}Intermediate`, ax[k], presses[k] * 0.25);
    }
    for (const L of ['left', 'right']) {
      const s = L === 'left' ? 1 : -1;
      rig.add(`${L}Hand`, ax[`${L}Hand`], active ? Math.sin(t * 6.3 + s) * 0.03 : 0);
      rig.add(`${L}Hand`, ax[`${L}HandYaw`], active ? Math.sin(t * 0.9 + s * 2) * 0.05 : 0);
    }
  }
}
