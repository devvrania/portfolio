const MOODS = ['relaxed', 'happy', 'Surprised'];

/** Blends expressions toward the current mood, moves his lips, and blinks. */
export class Face {
  constructor(vrm) {
    this.em = vrm.expressionManager;
    this.weights = { relaxed: 0, happy: 0, Surprised: 0 };
    this.nextBlink = 2;
    this.blinkT = -1;
  }

  /**
   * @param goal   target weight for each mood expression
   * @param mouth  0–1 mouth opening (talking)
   * @param yawn   0–1 yawn strength (stretch)
   * @param drowsy true during the neck roll: eyes half closed
   */
  update(dt, t, goal, { mouth = 0, yawn = 0, drowsy = false } = {}) {
    if (!this.em) return;
    for (const n of MOODS) {
      this.weights[n] += ((goal[n] || 0) - this.weights[n]) * (1 - Math.exp(-dt * 8));
      this.em.setValue(n, this.weights[n]);
    }
    this.em.setValue('aa', mouth + yawn * 0.65);

    if (t > this.nextBlink && this.blinkT < 0) this.blinkT = 0;
    let blink = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      blink = Math.sin(Math.min(this.blinkT / 0.16, 1) * Math.PI);
      if (this.blinkT > 0.16) { this.blinkT = -1; this.nextBlink = t + 2 + Math.random() * 4; }
    }
    // the "happy" expression already closes his eyes, so don't blink on top of it
    this.em.setValue('blink', this.weights.happy > 0.4 ? 0 : Math.max(blink, yawn * 0.85, drowsy ? 0.35 : 0));
  }
}
