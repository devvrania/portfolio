import * as THREE from 'three';
import { MODEL_URL, PROFILE_URL, TIMING, DEG } from './config.js';
import { createStage } from './stage.js';

import { loadAvatar } from './avatar/loader.js';
import { Rig } from './avatar/rig.js';
import { seatPose, measureLayout } from './avatar/pose.js';
import { Breathing } from './avatar/breathing.js';
import { Typing } from './avatar/typing.js';
import { Stretch } from './avatar/stretch.js';
import { Gaze } from './avatar/gaze.js';
import { Face } from './avatar/face.js';
import { addChairColliders } from './avatar/colliders.js';

import { Breaks } from './behavior/breaks.js';
import { Conversation } from './behavior/conversation.js';
import { pickMood } from './behavior/mood.js';
import { chooseLookTarget } from './behavior/attention.js';

import { buildRoom } from './world/room.js';
import { buildDesk } from './world/desk.js';
import { buildChair } from './world/chair.js';
import { buildCoffee } from './world/coffee.js';
import { createKeycaps } from './world/keyboard.js';
import { createCodeScreen } from './world/screen.js';

import { Overlay } from './ui/overlay.js';
import { Pointer } from './ui/pointer.js';
import { DebugPanel } from './ui/debug.js';

/* ---------- setup ---------- */
const status = document.getElementById('status');
const profile = await fetch(PROFILE_URL).then(r => r.json());
const { renderer, scene, camera, controls } = createStage();
const clock = new THREE.Clock();

const vrm = await loadAvatar(MODEL_URL, scene, p => {
  if (p.total) status.textContent = `Loading Kairo… ${Math.round(p.loaded / p.total * 100)}%`;
}).catch(err => {
  status.textContent = 'Could not load the model. Run "npm start" and open the page it prints.';
  throw err;
});

// pose him, then build the room around his proportions
const rig = new Rig(vrm);
const curlAxis = seatPose(rig);
const layout = measureLayout(rig);

const keycaps = createKeycaps();
const screen = createCodeScreen();
const monitorCenter = buildDesk(scene, layout, { keycaps, screen });
const coffee = buildCoffee(scene, layout.centerX - 0.5, layout.deskTop, layout.deskFront + 0.25);
const room = buildRoom(scene, layout);
buildChair(scene, layout);
addChairColliders(scene, vrm, layout);

// camera in front of his right side, with headroom for the name tag
const hips = rig.worldPos('hips'), head = rig.worldPos('head');
camera.position.set(hips.x - 1.85, head.y + 0.2, hips.z + 1.0);
controls.target.set(hips.x + 0.15, head.y - 0.16, hips.z + 0.3);
camera.lookAt(controls.target);
controls.update();

// animation layers on top of the seated pose
rig.saveBase();
const breathing = new Breathing(rig);
const stretch = new Stretch(rig, curlAxis);
const typing = new Typing(rig, curlAxis, () => { keycaps.flash(); screen.typeChar(); });
const gaze = new Gaze(rig, scene, camera);
const face = new Face(vrm);

// behavior and UI
const pointer = new Pointer(clock);
const overlay = new Overlay();
const breaks = new Breaks();
const talk = new Conversation(overlay, profile, t => breaks.end(t));
const debug = new DebugPanel({
  controls,
  onBreak: kind => { breaks.begin(kind, clock.elapsedTime); pointer.forget(); },
});

const clickRay = new THREE.Raycaster();
renderer.domElement.addEventListener('click', e => {
  if (controls.enabled) return;
  clickRay.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (clickRay.intersectObject(vrm.scene, true).length) talk.poke(clock.elapsedTime);
});

status.remove();
renderer.setAnimationLoop(tick);
setTimeout(() => talk.greet(clock.elapsedTime, 0), TIMING.greetDelay * 1000);

/* ---------- every frame ---------- */
const places = { monitor: monitorCenter, window: room.windowCenter };
const lookGoal = new THREE.Vector3();

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  controls.update();

  // decide what he's doing
  const visitorActive = pointer.active(t);
  breaks.update(t, !talk.talking && !visitorActive && debug.auto, visitorActive);

  // body: seated pose + breathing + stretch + typing + gaze, layered in that order
  rig.resetToBase();
  breathing.update(t);
  const s = stretch.apply(breaks.stretchTime(t));
  typing.update(dt, t, debug.typingOn && !breaks.kind && !talk.talking);
  chooseLookTarget(lookGoal, {
    breakKind: breaks.kind, reach: s.reach, headPos: gaze.headPos, places,
    talking: talk.talking, pointer, idle: pointer.idle(t), mode: debug.gaze, camera,
  });
  gaze.update(lookGoal, dt);

  // face
  const { mood, weights } = pickMood({ t, manual: debug.expr, talk, breakKind: breaks.kind, settle: s.settle, visitorActive });
  face.update(dt, t, weights, { mouth: talk.mouth(t), yawn: s.yawn, drowsy: s.neck !== 0 });
  vrm.update(dt);

  // world
  if (Math.floor(t * 10) % 2 === 0) screen.draw();
  keycaps.update(dt);
  coffee.update(dt, t);
  room.update(dt, t);

  // UI
  talk.update(t);
  overlay.place(rig.worldPos('head'), camera);
  const st = breaks.stretchTime(t);
  debug.show(`mood: ${mood}${st >= 0 ? ' ' + st.toFixed(1) + 's' : ''} · head yaw ${(gaze.yaw / DEG).toFixed(0)}° · next break ${breaks.kind ? 'now' : Math.max(0, breaks.nextAt - t).toFixed(0) + 's'}`);

  renderer.render(scene, camera);
}
