import { TIMING } from '../config.js';
import { rand } from '../helpers.js';

/** Idle breaks: now and then he stops typing to stretch or look out the window. */
export class Breaks {
  constructor() {
    this.kind = null;               // null | 'stretch' | 'window'
    this.startedAt = 0;
    this.duration = 0;
    this.nextAt = rand(...TIMING.firstBreak);
  }

  begin(kind, t) {
    this.kind = kind;
    this.startedAt = t;
    this.duration = kind === 'stretch' ? TIMING.stretch : TIMING.windowGaze;
  }

  end(t) {
    if (!this.kind) return;
    this.kind = null;
    this.nextAt = t + rand(...TIMING.breakGap);
  }

  /**
   * @param canStart  nothing else is going on (not talking, nobody moving the mouse, auto mode)
   * @param interrupt the visitor just moved the mouse: get back to them
   */
  update(t, canStart, interrupt) {
    if (!this.kind && t > this.nextAt && canStart) this.begin(Math.random() < 0.5 ? 'stretch' : 'window', t);
    if (this.kind && (t - this.startedAt > this.duration || interrupt)) this.end(t);
  }

  /** Seconds into the current stretch, or -1. */
  stretchTime(t) { return this.kind === 'stretch' ? t - this.startedAt : -1; }
}
