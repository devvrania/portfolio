// Everything you might want to tweak lives here.

export const MODEL_URL = './model/kairo.vrm';
export const PROFILE_URL = './kairo.json';

const params = new URLSearchParams(location.search);
export const FLAGS = {
  debug: params.has('debug'),     // show the debug panel on load
  capture: params.has('capture'), // keep frames readable so a recorder can copy the canvas
  embedded: window.self !== window.top, // shown inside another page (e.g. the portfolio's hero)
};

/**
 * Phones and tablets: draw a lighter scene so he (and the page around him) stay smooth. Caps the pixels drawn per
 * frame (on a phone the portfolio renders the room wider than the screen and crops it), uses simpler shadows and
 * runs at 30 fps.
 */
export const LITE = matchMedia('(pointer: coarse)').matches;
export const LITE_MAX_PIXELS = 1.5e6;
export const LITE_FPS = 30;


export const DEG = Math.PI / 180;

/**
 * Visitor camera on his own page. Zoom: how far in and out, as a multiple of the starting distance.
 * Turn: how far you can drag the view around him from where it starts, sideways and up/down.
 */
export const ZOOM = { min: 0.6, max: 1.4 };
export const TURN = { side: 28 * DEG, up: 10 * DEG, down: 14 * DEG };

/** Seconds. Ranges are [min, max] and picked at random. */
export const TIMING = {
  greetDelay: 1.2,        // first greeting after the model loads
  lineDuration: 5.5,      // how long a speech bubble stays up
  firstBreak: [12, 18],   // first idle break after load
  breakGap: [15, 25],     // gap between idle breaks
  stretch: 5.6,           // full stretch sequence
  windowGaze: 4.6,        // looking out the window
  visitorActive: 2.5,     // mouse moved this recently = someone is watching
  idleLook: 4,            // no mouse movement for this long = look back at the screen
  quickClick: 1.2,        // clicks closer than this count as one burst
};

export const GAZE = {
  maxYaw: 60 * DEG,
  minPitch: -30 * DEG,
  maxPitch: 25 * DEG,
  neckShare: 0.4,         // the rest of the turn goes to the head
  eyeSpeed: 14,           // eyes catch up fast...
  headSpeed: 3.2,         // ...the head follows more slowly
};

export const DEFAULT_REACTIONS = {
  surprised: "Whoa! Easy there, I'm in the middle of a commit.",
};
