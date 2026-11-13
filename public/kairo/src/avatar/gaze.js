import * as THREE from 'three';
import { v3 } from '../helpers.js';
import { GAZE } from '../config.js';

/**
 * Eyes and head follow a point in the world. The eyes get there fast,
 * the head and neck catch up more slowly.
 */
export class Gaze {
  constructor(rig, scene, camera) {
    this.rig = rig;
    this.target = new THREE.Object3D();
    scene.add(this.target);
    rig.vrm.lookAt.target = this.target;
    widenEyeRange(rig.vrm);

    this.headPos = rig.worldPos('head');
    this.eyeCur = camera.position.clone();
    this.headCur = camera.position.clone();
    this.yaw = 0;
    this.pitch = 0;

    const X = v3(1, 0, 0), Y = v3(0, 1, 0), Z = v3(0, 0, 1);
    this.ax = {
      neckY: rig.localAxis('neck', Y), neckX: rig.localAxis('neck', X),
      headY: rig.localAxis('head', Y), headX: rig.localAxis('head', X), headZ: rig.localAxis('head', Z),
    };
  }

  update(goal, dt) {
    const { rig, ax } = this;
    this.eyeCur.lerp(goal, 1 - Math.exp(-dt * GAZE.eyeSpeed));
    this.headCur.lerp(goal, 1 - Math.exp(-dt * GAZE.headSpeed));
    this.target.position.copy(this.eyeCur);

    const d = this.headCur.clone().sub(this.headPos);     // body faces +Z
    const yaw = THREE.MathUtils.clamp(Math.atan2(d.x, d.z), -GAZE.maxYaw, GAZE.maxYaw);
    const pitch = THREE.MathUtils.clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), GAZE.minPitch, GAZE.maxPitch);
    this.yaw = yaw; this.pitch = pitch;

    const n = GAZE.neckShare, h = 1 - n;
    rig.add('neck', ax.neckY, yaw * n); rig.add('neck', ax.neckX, -pitch * n);
    rig.add('head', ax.headY, yaw * h); rig.add('head', ax.headX, -pitch * h);
    rig.add('head', ax.headZ, -yaw * 0.12);               // slight curious tilt toward the gaze side
  }
}

/** The model ships 8–12° of eye travel over a 90° input, which barely moves. Widen it. */
function widenEyeRange(vrm) {
  const ap = vrm.lookAt?.applier;
  if (!ap?.rangeMapHorizontalInner) return;
  Object.assign(ap.rangeMapHorizontalInner, { inputMaxValue: 35, outputScale: 14 });
  Object.assign(ap.rangeMapHorizontalOuter, { inputMaxValue: 35, outputScale: 16 });
  Object.assign(ap.rangeMapVerticalDown, { inputMaxValue: 30, outputScale: 11 });
  Object.assign(ap.rangeMapVerticalUp, { inputMaxValue: 30, outputScale: 9 });
}
