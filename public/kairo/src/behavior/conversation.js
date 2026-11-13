import { TIMING, DEFAULT_REACTIONS } from '../config.js';

/**
 * What he says and when: the greeting on load, one line per click,
 * and a startled reaction to three quick clicks.
 */
export class Conversation {
  /** @param onSpeak called whenever he starts a line (ends any idle break) */
  constructor(overlay, profile, onSpeak) {
    this.overlay = overlay;
    this.lines = profile.greetings;
    this.reactions = { ...DEFAULT_REACTIONS, ...(profile.reactions || {}) };
    this.onSpeak = onSpeak;

    this.lineIdx = 0;
    this.speakingUntil = -1;   // speech bubble is up
    this.lipsUntil = -1;       // lips move for about as long as the line takes to say
    this.happyUntil = -1;
    this.surpriseUntil = -1;
    this.laughUntil = -1;

    this.lastClick = -10;
    this.burst = 0;
    this.reactingUntil = -1;
  }

  get talking() { return this.speakingUntil > 0; }

  say(text, t, secs = TIMING.lineDuration) {
    this.overlay.show(text);
    this.speakingUntil = t + secs;
    this.lipsUntil = t + Math.min(secs - 0.5, 0.6 + text.length * 0.045);
    this.onSpeak(t);
  }

  greet(t, i = this.lineIdx) {
    this.say(this.lines[i], t);
    this.lineIdx = (i + 1) % this.lines.length;
  }

  /** The visitor clicked him. */
  poke(t) {
    if (t < this.reactingUntil) return;                        // mid-surprise: ignore until he's done
    this.burst = t - this.lastClick < TIMING.quickClick ? this.burst + 1 : 1;
    this.lastClick = t;
    if (this.burst === 1) {                                     // a normal click: one line
      this.happyUntil = t + 1.6;
      this.greet(t);
    } else if (this.burst >= 3) {                               // third quick click: startled, then laughs
      this.burst = 0;
      this.surpriseUntil = t + 1.1;
      this.laughUntil = t + 3.4;
      this.say(this.reactions.surprised, t, 3.8);
      this.reactingUntil = t + 3.8;
    }
    // a second quick click does nothing: he keeps saying the current line
  }

  /** 0–1 mouth opening while he talks. */
  mouth(t) {
    return t < this.lipsUntil ? Math.max(0, 0.25 + 0.25 * Math.sin(t * 17) + 0.15 * Math.sin(t * 29)) : 0;
  }

  update(t) {
    if (this.talking && t > this.speakingUntil) {
      this.overlay.hide();
      this.speakingUntil = -1;
    }
  }
}
