// ui/bus.js: recovered build 28.5.1. See tools/show.js for individual declarations.
const LISTENERS = {};
function listen(ev, f) {
  (LISTENERS[ev] = LISTENERS[ev] || []).push(f);
}
function emit(ev, ...a) {
  (LISTENERS[ev] || []).forEach(f => {
    try {
      f(...a);
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
    }
  });
}
