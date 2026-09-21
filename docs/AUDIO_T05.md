# Early audio — VQ02A implementation contract

Status and exact validation live in STATUS / evidence/CI43_CHECKPOINT.json. This is an independent T05 audio batch based on accepted VQ01Y, not an alternative implementation of blocked VQ01Z visual/camera code.

## Ownership and content

src/music-score.ts owns seven short authored arrangements and read-only cue selection: hearth, fair, road, tension, battle, victory, defeat. Notes and accompaniment were authored in this project; no original-game soundtrack was extracted, transcribed or supplied. Multiple maps reuse road/tension. This is neither the full OST nor a claim of original musical fidelity. No sample files, external media, CDN or new dependency.

src/scene-audio.ts owns one optional Web Audio graph, score transport and oscillator lifetimes. Native triangle/sine voices and gain envelopes produce lead, bass and harmony. Max16 active oscillator nodes. Master .55; no loudness/listening/device certification follows from that parameter.

src/main.ts owns user opt-in and forwards existing fixed ticks and halted state. Existing game movement/ATB/save/input functions remain their own authorities; music never changes their state. The existing sound button changes labels/aria-pressed, not menu geometry. The test-only audio() inspector exposes copied live node/analyser observations, not a play/seek/write interface.

## Lifecycle

Default muted creates no AudioContext. Only real pointer/keyboard activation resumes an opted-in context; update does not call resume. Pause, dialog, inventory, background and native picker holds immediately remove voices and zero master gain. Menu effects are also suppressed. Resume waits for the next valid musical step without replaying stale notes. Late frames skip missed score steps. State identity/cue/tick rollback resets old phrases. Victory/defeat stop after their short nonlooping arrangement.

Each note has finite attack/decay/release and scheduled stop; ended callbacks disconnect oscillator and gain, while expired-note reaping bounds retention if host callbacks are delayed. Mute/reset/dispose release all current nodes. Async resume after mute/hold/dispose cannot bypass current state. Optional-audio failures fail closed and report UI state without mutating gameplay. No timers, network, original media or save-schema additions.

## Verification layers

Fresh local987Node/208Python plus asset/typecheck/build passed. Fake WebAudio ports test scheduling, opt-in allocation, one graph, upper voice bound, resume races, cue/reset/rollback/pauses, cleanup, optional failures and read-only observations. They do NOT prove emitted sound. A22-function accepted-source fingerprint comparison allows only enumerated audio calls; historical full-main pins explicitly advance to this source, not deleted assertions.

Existing equipment_browser.py performs actual keyboard opt-in and reads analyser RMS, pauses through existing Escape/I/H UI, checks zero voices/gain/output and unchanged frozen snapshots, resumes, then uses its original same-run prologue v6 native import. It observes immediate chooser silence and a new fair cue/epoch, then mutes. No extra import or fabricated save. The report is embedded as equipment-report.json.audio and retained as scene-audio-report.json. scripts/audio-evidence.mjs validates those actual observations through the existing lane ledger. All13 primary and9 native report owners remain unchanged.

New source is awaiting CI43; no local browser or listening run occurred. Passing Chromium/analyser evidence later would establish a software graph/control result, NOT physical speakers/headphones, listening quality, mobile user-activation compatibility, final arrangement quality or complete T05. Those remain open. Existing device/performance/art gates and original timeout assertions are not loosened.

## Recovery and boundaries

Source b54ff3079c8d087bb1396229bc3adf718f2e8cd4 / tree e9fce47b7454f0a30bb389f3b96628b94c491cbb. Cloud originals and local logs in1_JwcNmG7FmSnNKcAQ-dYhtv7x4jN_DLu; latest receipts in VQ02A_LOCAL_VALIDATION and VQ02A_CLOUD_RETENTION. Stored local build has nullsource and is unaccepted. No Z files were applied: held prologue-render/localbrowser and Z source-tree boundaries stay intact. Audio is not a replacement for the unresolved visual quality work.
