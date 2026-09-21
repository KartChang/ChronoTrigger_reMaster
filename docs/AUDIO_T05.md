# Early audio — retained VQ02A content, VQ02B repair

Current source7b1537382467935ea37fe4cc6a2dc88d96a8d46c, version0.9.24; CI44 pending. Exact state: STATUS / CI44_CHECKPOINT. Original A contract remains at88f3ee4aa7cb63bcc172bbeaf790ee477ba10760. No held Z visual work is applied.

## Content and ownership retained

src/music-score.ts owns seven short project-authored hearth/fair/road/tension/battle/victory/defeat arrangements and read-only cue selection. No original OST extraction/transcription, samples, external media/CDN or new dependency. Multiple maps share short cues; this is not full soundtrack production or original musical fidelity.

src/scene-audio.ts owns one optional WebAudio graph, transport and finite oscillator lifetimes. Native triangle/sine lead/bass/harmony, at most16 active voices, master.55; this is a code setting, not loudness/listening/device certification. main only forwards fixed ticks/halted state and real opt-in input, not game-rule mutation. Default off creates no context; real activation resumes, never a frame-loop resume timer.

Pause/dialog/inventory/background/native chooser/context loss silence voices. Cue/state change and tick rollback clear prior phrases. Late frames skip stale steps, victory/defeat are bounded one-shots, resume does not replay effects. Menu effects are intentionally suppressed. Ended/reap cleanup and async-resume races remain tested; failures do not modify gameplay/save state.

## CI43 actual root and B repair

CI43 35576672389 completed/failure: good equipment pause wait_silent did not observe activeVoices0/masterGain0/RMS<0.000001 within10000ms. Original audio report was null, and the last parameter/analyser sample was not retained. This establishes the failing observation, not the exact conjunct or a proven audio-driver cause. Validate/bad succeeded but do not accept the whole source. See CI43_FAILURE_ROOT and untouched originals.

B clears all scheduled master automation using cancelScheduledValues(0), then sets intrinsic gain.value. The master is an immediate gate; note gain envelopes remain separately scheduled. Silence still releases oscillator/gain connections. This addresses a source-visible automation hazard; browser repair acceptance is pending CI44, not inferred from unit fakes. Inspect returns true analyser RMS even when blocked, with contextTime/analyserSize; it never substitutes zero for a leak. On timeout, the existing equipment observation writes lastAudio/state/focus when available, then rethrows the original failure. Original10s/.000001 thresholds and all old assertions remain.

## Verification and limitations

Fresh B1046Node/214Python/assets/typecheck/build passed, including delayed-AudioParam and true-inspector model tests; models are not emitted-sound evidence. All22 retained game functions fingerprinted. Original equipment journey still uses real keyboard opt-in, analyser energy, pause/inventory/dialog silence/frozenstate, its same native v6 import/epoch reset and final mute. No extra positive save or writable hook. Final equipment.audio and scene-audio-report.json must be checked by the original source lane ledger in CI44.

No local browser, listening review or speaker/device validation was performed. Software Chromium energy, even when passed later, does not prove physical sound, arrangement quality, mobile activation behavior or full T05. Rendering-context hold is separately tested through actual native WebGL fault in CI44. New failure and current source logs are retained in Drive17SEnE-8kzSYX2zRcHmbYf_yGKUSHaNFD; the archive predates publication, and latest GitHub receipts supply the identity. No new soundtrack-complete/art90 claim.
