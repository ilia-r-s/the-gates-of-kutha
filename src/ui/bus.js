// ===================== EVENTS: the game says what happened; sound and pictures listen =====================
// The rules never call the sound or the pictures. They emit what happened, and ui/cues.js decides what follows.
const LISTENERS = {};
function listen(ev, f) {
  (LISTENERS[ev] = LISTENERS[ev] || []).push(f);
}
// a sound or picture that fails must not stop the rule that emitted it: each listener runs on its own
function emit(ev, ...a) {
  (LISTENERS[ev] || []).forEach(f => {
    try {
      f(...a);
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
    }
  });
}
