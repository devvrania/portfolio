import { v3, phase } from '../helpers.js';
import { TIMING } from '../config.js';

const REST = { reach: 0, yawn: 0, neck: 0, settle: 0 };

/**
 * The stretch, a ~5.6 s sequence:
 * shrug → reach up and lean back with a yawn → lean side to side → neck roll → settle.
 */
export class Stretch {
  constructor(rig, curlAxis) {
    this.rig = rig;
    const X = v3(1, 0, 0), Z = v3(0, 0, 1);
    this.ax = {
      spineX: rig.localAxis('spine', X), spineZ: rig.localAxis('spine', Z),
      chestX: rig.localAxis(rig.chest, X), chestZ: rig.localAxis(rig.chest, Z),
      lShoulder: rig.localAxis('leftShoulder', Z), rShoulder: rig.localAxis('rightShoulder', Z),
      lUpperArm: rig.localAxis('leftUpperArm', X), rUpperArm: rig.localAxis('rightUpperArm', X),
      lLowerArm: rig.localAxis('leftLowerArm', X), rLowerArm: rig.localAxis('rightLowerArm', X),
      neckZ: rig.localAxis('neck', Z), headZ: rig.localAxis('head', Z),
    };
    for (const L of ['left', 'right']) {
      this.ax[`${L}Hand`] = rig.localAxis(`${L}Hand`, curlAxis[L]);
      for (const f of ['Index', 'Middle', 'Ring']) this.ax[`${L}${f}`] = rig.localAxis(`${L}${f}Proximal`, curlAxis[L]);
    }
  }

  /**
   * @param s seconds into the stretch, or a negative number when he isn't stretching
   * @returns how far along each part is (0–1; `neck` swings −1…1), used by the face too
   */
  apply(s) {
    if (s < 0) return REST;
    const { rig, ax } = this;
    const reach  = phase(s, 0.2, 3.9, 0.9, 0.9);
    const shrug  = phase(s, 0.3, 2.4, 0.6, 0.6);
    const yawn   = phase(s, 0.7, 2.3, 0.5, 0.6);
    const side   = phase(s, 2.1, 3.7, 0.35, 0.35) * Math.sin((s - 2.1) / 1.6 * Math.PI * 2);
    const neck   = phase(s, 3.7, 5.1, 0.3, 0.3) * Math.sin((s - 3.7) / 1.4 * Math.PI * 2);
    const settle = phase(s, 4.6, TIMING.stretch, 0.3, 0.5);

    rig.add('spine', ax.spineX, -0.14 * reach);          // lean back (~17° total)
    rig.add(rig.chest, ax.chestX, -0.16 * reach);
    rig.add('spine', ax.spineZ, 0.14 * side);            // side bend, left then right
    rig.add(rig.chest, ax.chestZ, 0.12 * side);
    rig.add('leftShoulder', ax.lShoulder, 0.14 * shrug); // shoulders up
    rig.add('rightShoulder', ax.rShoulder, -0.14 * shrug);
    rig.add('leftUpperArm', ax.lUpperArm, -1.15 * reach); // arms forward and up
    rig.add('rightUpperArm', ax.rUpperArm, -1.15 * reach);
    rig.add('leftLowerArm', ax.lLowerArm, -0.35 * reach);
    rig.add('rightLowerArm', ax.rLowerArm, -0.35 * reach);
    for (const L of ['left', 'right']) {
      rig.add(`${L}Hand`, ax[`${L}Hand`], -0.55 * reach); // wrists bend back
      for (const f of ['Index', 'Middle', 'Ring']) rig.add(`${L}${f}Proximal`, ax[`${L}${f}`], -0.45 * reach); // fingers spread
    }
    rig.add('neck', ax.neckZ, 0.18 * neck);               // neck roll
    rig.add('head', ax.headZ, 0.3 * neck);

    return { reach, yawn, neck, settle };
  }
}
