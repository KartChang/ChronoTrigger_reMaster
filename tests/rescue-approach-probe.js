// Read-only browser predicate, also executed against explicit unit-test doubles.
// Never writes state, advances the clock, focuses the canvas or dispatches events.
({chapter, point, startTick, budget, joined, wait = false}) => {
  const t = window.__CHRONO_TEST__, s = t.snapshot();
  const hint = document.querySelector('#interact-hint');
  const dialog = document.querySelector('#dialog');
  const ui = {
    focused: document.activeElement?.id || null,
    hint: hint?.textContent || '', hintHidden: hint?.hidden ?? true,
    dialogOpen: !dialog || !dialog.hidden, paused: t.paused()
  };
  const distance = Math.hypot(s.players[0].x - point.x, s.players[0].z - point.z);
  let reason = null;
  if (s.chapter !== chapter) reason = 'chapter-changed';
  else if (s.mode !== 'explore') reason = 'mode-changed';
  else if (s.joined !== joined) reason = 'ownership-changed';
  else if (ui.paused || ui.dialogOpen) reason = 'modal-or-pause';
  else if (ui.focused !== 'world') reason = 'focus-lost';
  else if (!Number.isFinite(distance)) reason = 'invalid-position';
  else if (!Number.isFinite(s.ticks) || s.ticks < startTick) reason = 'clock-reset';
  else if (s.ticks - startTick > budget) reason = 'tick-budget';
  const ready = !reason && distance < point.radius && !ui.hintHidden &&
    ui.hint.split('·').at(-1).trim() === point.label;
  const observation = {ok: !reason, ready, reason, distance, state: s, ui};
  return wait && !reason && !ready ? false : observation;
}
