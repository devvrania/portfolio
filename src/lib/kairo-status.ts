/**
 * Kairo's loading state, shared between the hero (which loads him) and the splash screen (which waits for him).
 *
 * phase: "loading" while the scene downloads, "ready" once he's at his desk, "failed" if the model didn't load,
 * "off" when this visitor gets the banner art instead (phones, data saver).
 */
export type KairoPhase = "loading" | "ready" | "failed" | "off";
export type KairoStatus = { phase: KairoPhase; progress: number };

const initial: KairoStatus = { phase: "loading", progress: 0 };
let state = initial;
const listeners = new Set<() => void>();

export const kairoStatus = {
  get: () => state,
  getServer: () => initial,
  set(next: Partial<KairoStatus>) {
    state = { ...state, ...next };
    listeners.forEach(l => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

/** What the splash says, one line per third of the progress: few enough that each stays up long enough to read. */
const STEPS = [
  "compiling Rania's portfolio",
  "warming up her stack",
  "ready to show you around",
];
export const loadingLine = (pct: number) =>
  STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))];
