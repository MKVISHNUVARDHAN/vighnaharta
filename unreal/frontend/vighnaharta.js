// Route accessible buttons through Epic's document keyboard controller.
// The game remains entirely in Unreal; this page only sends player input.
(() => {
  const keys = {
    Enter: ['Enter', 13], Escape: ['Escape', 27], KeyA: ['a', 65],
    KeyD: ['d', 68], Space: [' ', 32], ShiftLeft: ['Shift', 16]
  };
  const held = new Map();
  const send = (code, down) => {
    const [key, keyCode] = keys[code];
    document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      code, key, keyCode, which: keyCode, bubbles: true, cancelable: true
    }));
  };
  const release = (pointerId) => {
    const entry = held.get(pointerId);
    if (!entry) return;
    held.delete(pointerId);
    if (![...held.values()].some(other => other.code === entry.code)) {
      send(entry.code, false);
      entry.button.classList.remove('held');
    }
  };
  document.querySelectorAll('[data-hold]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); event.stopPropagation();
      if (held.has(event.pointerId)) return;
      const code = button.dataset.hold;
      if (![...held.values()].some(entry => entry.code === code)) send(code, true);
      held.set(event.pointerId, {code, button});
      button.classList.add('held');
      button.setPointerCapture(event.pointerId);
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(name, event => { event.stopPropagation(); release(event.pointerId); });
    }
  });
  document.querySelectorAll('[data-tap]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation(); send(button.dataset.tap, true); send(button.dataset.tap, false);
      button.blur();
    });
  });
  const releaseAll = () => {
    for (const pointerId of [...held.keys()]) release(pointerId);
    // Also release physical movement keys when the browser loses focus.
    for (const code of ['KeyA', 'KeyD', 'Space', 'ShiftLeft']) send(code, false);
    for (const [code, key, keyCode] of [['KeyW', 'w', 87], ['KeyS', 's', 83]]) {
      document.dispatchEvent(new KeyboardEvent('keyup', {code, key, keyCode, bubbles:true}));
    }
  };
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
  document.getElementById('controls-toggle').addEventListener('click', event => {
    const help = document.getElementById('controls-help');
    help.hidden = !help.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!help.hidden));
  });
})();
