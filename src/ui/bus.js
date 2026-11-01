const LISTENERS = {};
function listen(ev, f) {
  (LISTENERS[ev] = LISTENERS[ev] || []).push(f);
}
function emit(ev, ...a) {
  if (Session.replaying) return;
  (LISTENERS[ev] || []).forEach(f => {
    try {
      f(...a);
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
    }
  });
}
