import * as THREE from 'three';

const ray = new THREE.Raycaster();

/**
 * Decide where he looks this frame and write it into `out`.
 * Priority: break → talking to you → your cursor → his screen.
 */
export function chooseLookTarget(out, s) {
  const { breakKind, reach, headPos, places, talking, pointer, idle, mode, camera } = s;
  if (breakKind === 'window') {
    out.copy(places.window);
  } else if (breakKind === 'stretch') {
    // up while reaching, then back toward the screen for the neck roll and settle
    out.set(headPos.x - 0.1, headPos.y + 0.45 * reach + 0.05, headPos.z + 0.9).lerp(places.monitor, 1 - reach);
  } else if (talking && (!pointer.present || idle)) {
    out.copy(camera.position);                    // look at the visitor while talking
  } else if (mode === 'screen' || idle || !pointer.present) {
    out.copy(places.monitor);
  } else {
    ray.setFromCamera(pointer.ndc, camera);
    ray.ray.at(camera.position.distanceTo(headPos) * 0.55, out);
  }
  return out;
}
