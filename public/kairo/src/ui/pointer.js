import * as THREE from 'three';
import { TIMING } from '../config.js';

/** Tracks the visitor's mouse: where it is, and how recently it moved. */
export class Pointer {
  constructor(clock) {
    this.ndc = new THREE.Vector2();   // -1…1 screen coordinates
    this.present = false;
    this.lastMove = -10;
    addEventListener('pointermove', e => {
      this.ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      this.present = true;
      this.lastMove = clock.elapsedTime;
    });
    document.addEventListener('pointerleave', () => { this.present = false; });
  }

  /** Someone is moving the mouse right now. */
  active(t) { return this.present && t - this.lastMove < TIMING.visitorActive; }

  /** The mouse has been still long enough that he goes back to his screen. */
  idle(t) { return t - this.lastMove > TIMING.idleLook; }

  /** Pretend the mouse has been still for a while (used by debug shortcuts). */
  forget() { this.lastMove = -10; }
}
