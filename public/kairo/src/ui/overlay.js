import * as THREE from 'three';

const _p = new THREE.Vector3();

/** The "Kairo" name tag and his speech bubble, pinned above his head on screen. */
export class Overlay {
  constructor() {
    this.tag = document.getElementById('tag');
    this.bubble = document.getElementById('bubble');
  }

  show(text) {
    this.bubble.textContent = text;
    this.bubble.classList.add('show');
  }

  hide() { this.bubble.classList.remove('show'); }

  /** Move both to follow his head (world position) through the camera. */
  place(head, camera) {
    _p.copy(head); _p.y += 0.22; _p.project(camera);
    this.tag.style.left = (_p.x + 1) / 2 * innerWidth + 'px';
    this.tag.style.top = (1 - _p.y) / 2 * innerHeight + 'px';
    this.tag.style.opacity = _p.z < 1 ? '1' : '0';

    _p.copy(head); _p.y += 0.06; _p.project(camera);
    this.bubble.style.left = (_p.x + 1) / 2 * innerWidth + 40 + 'px';
    this.bubble.style.top = (1 - _p.y) / 2 * innerHeight + 'px';
  }
}
