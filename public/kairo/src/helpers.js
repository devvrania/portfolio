import * as THREE from 'three';

export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const worldQ = o => o.getWorldQuaternion(new THREE.Quaternion());
export const worldP = o => o.getWorldPosition(new THREE.Vector3());
export const rand = (min, max) => min + Math.random() * (max - min);

/** Smoothstep from 0 to 1. */
export const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

/** 0→1 between `a` and `b` seconds, easing in over `fadeIn` and out over `fadeOut`. */
export const phase = (s, a, b, fadeIn, fadeOut) =>
  smooth((s - a) / fadeIn) * (1 - smooth((s - (b - fadeOut)) / fadeOut));

export const mat = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });

/** Add a shadow-casting mesh to `parent` at (x, y, z). */
export function addMesh(parent, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export const box = (parent, w, h, d, material, x, y, z) =>
  addMesh(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);

/** A 2D canvas wrapped in a texture, for things drawn by hand (screen, keys, window). */
export function canvasTexture(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, texture };
}
