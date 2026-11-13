import { FLAGS } from '../config.js';

/**
 * Hidden for visitors. Open with ?debug or the D key.
 * Lets you force gaze, expression and typing, switch to a free camera,
 * and trigger breaks with S (stretch) and W (window).
 */
export class DebugPanel {
  constructor({ controls, onBreak }) {
    this.gaze = 'cursor';     // 'cursor' | 'screen'
    this.expr = 'auto';       // 'auto' or a forced expression
    this.typingOn = true;

    this.hud = document.querySelector('.hud');
    this.readout = document.getElementById('read');
    this.hud.hidden = !FLAGS.debug;

    this.group('gaze', v => { this.gaze = v; });
    this.group('expr', v => { this.expr = v; });
    this.toggle('typing', on => { this.typingOn = on; }, true);
    this.toggle('orbit', on => { controls.enabled = on; }, false);

    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'd' || e.key === 'D') this.hud.hidden = !this.hud.hidden;
      if (this.visible && e.key === 's') onBreak('stretch');
      if (this.visible && e.key === 'w') onBreak('window');
    });
  }

  get visible() { return !this.hud.hidden; }
  /** He's running on his own: no forced gaze, expression or paused typing. */
  get auto() { return this.typingOn && this.expr === 'auto' && this.gaze === 'cursor'; }

  show(text) { if (this.visible) this.readout.textContent = text; }

  group(id, onPick) {
    const el = document.getElementById(id);
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      onPick(b.dataset.v);
    });
  }

  toggle(id, onChange, initial) {
    const b = document.getElementById(id);
    let on = initial;
    b.onclick = () => { on = !on; b.setAttribute('aria-pressed', String(on)); onChange(on); };
  }
}
