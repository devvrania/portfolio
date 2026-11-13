import { VRMSpringBoneCollider, VRMSpringBoneColliderShapePlane } from '@pixiv/three-vrm';
import { v3 } from '../helpers.js';

/** Hair and sleeves rest on the seat and in front of the backrest instead of passing through. */
export function addChairColliders(scene, vrm, layout) {
  const planes = [
    { offset: v3(layout.hipX, layout.seatY + 0.015, layout.hipZ), normal: v3(0, 1, 0) },
    { offset: v3(layout.hipX, layout.seatY + 0.36, layout.hipZ - 0.285), normal: v3(0, 0, 1) },
  ];
  const colliders = planes.map(p => {
    const c = new VRMSpringBoneCollider(new VRMSpringBoneColliderShapePlane(p));
    scene.add(c);
    c.updateMatrixWorld(true);
    return c;
  });

  const group = { colliders };
  const seen = new Set();   // joints of one spring share a collider-group list; add once per list
  for (const joint of vrm.springBoneManager?.joints ?? []) {
    if (seen.has(joint.colliderGroups)) continue;
    seen.add(joint.colliderGroups);
    joint.colliderGroups.push(group);
  }
}
