import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

/** Load the VRM, turn it to face +Z, and add it to the scene. */
export async function loadAvatar(url, scene, onProgress) {
  const loader = new GLTFLoader();
  loader.register(parser => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(url, onProgress);

  const vrm = gltf.userData.vrm;
  VRMUtils.removeUnnecessaryVertices?.(gltf.scene);
  VRMUtils.rotateVRM0(vrm);
  vrm.scene.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = true; } });
  scene.add(vrm.scene);
  return vrm;
}
