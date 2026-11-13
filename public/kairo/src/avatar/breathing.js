import { v3 } from '../helpers.js';

/** Slow chest and shoulder rise. */
export class Breathing {
  constructor(rig) {
    this.rig = rig;
    const X = v3(1, 0, 0), Z = v3(0, 0, 1);
    this.ax = {
      spine: rig.localAxis('spine', X),
      chest: rig.localAxis(rig.chest, X),
      lShoulder: rig.localAxis('leftShoulder', Z),
      rShoulder: rig.localAxis('rightShoulder', Z),
    };
  }

  update(t) {
    const { rig, ax } = this;
    const br = Math.sin(t * 1.7);
    rig.add('spine', ax.spine, br * 0.012);
    rig.add(rig.chest, ax.chest, br * 0.015);
    rig.add('leftShoulder', ax.lShoulder, br * 0.02);
    rig.add('rightShoulder', ax.rShoulder, -br * 0.02);
  }
}
