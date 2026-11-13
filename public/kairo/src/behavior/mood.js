const MANUAL = { happy: 0.8, relaxed: 0.45, Surprised: 0.7 };

/**
 * Pick his expression for this frame.
 * @returns the mood name (shown in the debug panel) and target expression weights
 */
export function pickMood({ t, manual, talk, breakKind, settle, visitorActive }) {
  const w = { relaxed: 0, happy: 0, Surprised: 0 };
  if (manual !== 'auto') {
    if (manual in MANUAL) w[manual] = MANUAL[manual];
    return { mood: manual, weights: w };
  }
  let mood;
  if (t < talk.surpriseUntil)                  { mood = 'surprised';         w.Surprised = 0.85; }
  else if (t < talk.laughUntil)                { mood = 'laughing';          w.happy = 0.75; }
  else if (t < talk.happyUntil)                { mood = 'happy';             w.happy = 0.55; }
  else if (talk.talking)                       { mood = 'talking';           w.relaxed = 0.8; }
  else if (breakKind === 'stretch' && settle > 0.3) { mood = 'stretch: settling'; w.relaxed = 0.85; }
  else if (breakKind)                          { mood = breakKind;           w.relaxed = 0.35; }
  else if (visitorActive)                      { mood = 'watching';          w.relaxed = 0.4; }
  else                                         { mood = 'focused';           w.relaxed = 0.1; }
  return { mood, weights: w };
}
