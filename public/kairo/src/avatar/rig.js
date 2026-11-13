import * as THREE from 'three';
import { worldQ, worldP } from '../helpers.js';

const _dq = new THREE.Quaternion();

/**
 * Bone math on the VRM's normalized skeleton.
 * World frame after rotateVRM0: he faces +Z and his left is +X.
 *
 * Posing works in two layers:
 *  1. a static "base" pose (seated, hands on keyboard), built once with aim()/rotWorld()
 *  2. small per-frame deltas on top of it (breathing, typing, looking around), added with add()
 */
export class Rig {
  constructor(vrm) {
    this.vrm = vrm;
    this.restWorld = new Map();   // T-pose world rotation of each bone
    this.baseLocal = new Map();   // seated pose, restored at the start of every frame
  }

  bone(name) { return this.vrm.humanoid.getNormalizedBoneNode(name); }
  get chest() { return this.bone('upperChest') ? 'upperChest' : 'chest'; }
  worldPos(name) { return worldP(this.bone(name)); }

  /** Reset to T-pose and remember each bone's world rotation. */
  captureRest() {
    this.vrm.humanoid.resetNormalizedPose();
    this.vrm.scene.updateMatrixWorld(true);
    for (const name of Object.keys(this.vrm.humanoid.humanBones)) {
      const b = this.bone(name);
      if (b) this.restWorld.set(name, worldQ(b));
    }
  }

  setWorldQ(bone, desired) {
    this.vrm.scene.updateMatrixWorld(true);
    bone.quaternion.copy(worldQ(bone.parent).invert().multiply(desired));
    bone.updateMatrixWorld(true);
  }

  /** Point a bone (given its T-pose direction in world space) along a world direction. */
  aim(name, restDir, target) {
    const b = this.bone(name);
    if (!b) return null;
    const arc = new THREE.Quaternion().setFromUnitVectors(restDir.clone().normalize(), target.clone().normalize());
    this.setWorldQ(b, arc.clone().multiply(this.restWorld.get(name)));
    return arc;
  }

  /** Rotate a bone around a world axis, on top of its current pose. */
  rotWorld(name, axis, angle) {
    const b = this.bone(name);
    if (!b) return;
    this.vrm.scene.updateMatrixWorld(true);
    this.setWorldQ(b, new THREE.Quaternion().setFromAxisAngle(axis, angle).multiply(worldQ(b)));
  }

  /** A world axis expressed in the bone's base local frame, for cheap per-frame deltas. */
  localAxis(name, axisWorld) {
    const b = this.bone(name);
    if (!b) return null;
    this.vrm.scene.updateMatrixWorld(true);
    return axisWorld.clone().applyQuaternion(worldQ(b).invert()).normalize();
  }

  saveBase() {
    for (const name of Object.keys(this.vrm.humanoid.humanBones)) {
      const b = this.bone(name);
      if (b) this.baseLocal.set(b, b.quaternion.clone());
    }
  }

  resetToBase() {
    for (const [b, q] of this.baseLocal) b.quaternion.copy(q);
  }

  /** Per-frame delta: rotate a bone by `angle` around a precomputed local axis. */
  add(name, axisLocal, angle) {
    const b = this.bone(name);
    if (!b || !axisLocal) return;
    b.quaternion.multiply(_dq.setFromAxisAngle(axisLocal, angle));
  }
}
