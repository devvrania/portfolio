import * as THREE from 'three';
import { v3 } from '../helpers.js';

const FINGERS = ['Index', 'Middle', 'Ring', 'Little'];
const SEGMENTS = ['Proximal', 'Intermediate', 'Distal'];

/**
 * Build the seated typing pose from the model's own bones.
 * Returns each hand's finger-curl axis (world space), which typing and stretching reuse.
 */
export function seatPose(rig) {
  rig.captureRest();
  rig.aim('spine', v3(0, 1, 0), v3(0, 1, 0.06));
  rig.aim('chest', v3(0, 1, 0), v3(0, 1, 0.1));

  const curlAxis = {};
  for (const s of [1, -1]) {
    const L = s === 1 ? 'left' : 'right';
    rig.aim(`${L}UpperLeg`, v3(0, -1, 0), v3(0.07 * s, -0.08, 1));
    rig.aim(`${L}LowerLeg`, v3(0, -1, 0), v3(0.02 * s, -1, 0.06));
    rig.aim(`${L}Foot`, v3(0, -0.3, 1), v3(0, -0.25, 1));

    rig.aim(`${L}Shoulder`, v3(s, 0, 0), v3(s, -0.08, 0.05));
    rig.aim(`${L}UpperArm`, v3(s, 0, 0), v3(0.2 * s, -0.78, 0.5));
    rig.aim(`${L}LowerArm`, v3(s, 0, 0), v3(-0.3 * s, 0.02, 1));
    const handDir = v3(-0.14 * s, -0.22, 1);
    const handArc = rig.aim(`${L}Hand`, v3(s, 0, 0), handDir);

    // fingers curl toward the palm, a little more toward the little finger
    const palm = v3(0, -1, 0).applyQuaternion(handArc);
    const axis = new THREE.Vector3().crossVectors(handDir.normalize(), palm).normalize();
    curlAxis[L] = axis;
    FINGERS.forEach((f, i) => SEGMENTS.forEach((seg, j) => rig.rotWorld(`${L}${f}${seg}`, axis, [0.22, 0.3, 0.2][j] + i * 0.05)));
    rig.rotWorld(`${L}ThumbProximal`, axis, 0.15);
    rig.rotWorld(`${L}ThumbIntermediate`, axis, 0.25);
  }
  rig.vrm.update(0);
  rig.vrm.scene.updateMatrixWorld(true);
  return curlAxis;
}

/**
 * Drop him so his feet rest on the floor, then measure where the desk, keyboard and chair go.
 * Everything is derived from his own proportions, so any humanoid VRM fits.
 */
export function measureLayout(rig) {
  const footY = Math.min(rig.worldPos('leftFoot').y, rig.worldPos('rightFoot').y);
  rig.vrm.scene.position.y += 0.075 - footY;
  rig.vrm.scene.updateMatrixWorld(true);

  const hips = rig.worldPos('hips');
  const lh = rig.worldPos('leftMiddleIntermediate'), rh = rig.worldPos('rightMiddleIntermediate');
  const knee = rig.worldPos('leftLowerLeg');
  const hand = lh.clone().add(rh).multiplyScalar(0.5);

  const thighTop = knee.y + 0.08;
  const deskTop = Math.max(hand.y - 0.035, thighTop + 0.05);   // never through his thighs

  return {
    deskTop,
    deskFront: hand.z - 0.12,
    centerX: hand.x,
    kbX: hand.x,
    kbZ: hand.z + 0.01,
    seatY: hips.y - 0.06,
    hipX: hips.x,
    hipZ: hips.z,
  };
}
