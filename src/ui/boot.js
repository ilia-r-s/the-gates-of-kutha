// ===================== STARTING UP =====================
// When the page is ready: the language button, the screen's wiring and the title screen, the casebook's notebook,
// the sound buttons.
document.addEventListener('DOMContentLoaded', () => {
  langInit();
  initUI();
  bookInit();
  audioInit();
});
