# Runtime presentation and CPU density — VQ02F / 0.9.28

Current source38edba36ccd75a3ef8129aea62d21769d847f749; CI48 pending. Authority is STATUS / CI48_CHECKPOINT. This is the related completion of CPU load controls, actual interval diagnostics and version-label cleanup, not a new scene renderer or art pass.

## Effective CPU quality tiers

The previous policy could request a smaller buffer while CpuEngine's fixed640×480 cap still produced the same dimensions. CPU identification uses only the exact project-owned renderer label; arbitrary browser driver strings remain software/unverified hints. cpuRenderScale first establishes the existing baseline cap, then applies the tier multiplier. Auto tiers0–3 use1.0/1.25/1.5/1.75. Quality uses baseline tier0; compatibility uses tier2. Initial auto preserves the previous capped buffer. Width/height caps and32MiB texture budget remain; there is no new mesh/actor/camera/ATB simplification.

The existing30-frame warmup plus90 valid samples, mean>45ms and90th-percentile>55ms, still governs automatic degradation. Paused/hidden intervals and invalid/isolated>250ms observations do not trigger that policy. The control is bounded one-way degradation until mode changes, not a guaranteed FPS target. Lower buffer resolution trades crispness for load; native quality override remains available.

## Honest frame/backend/build observations

src/frame-window.ts retains at most120 actual active render-loop intervals. It excludes startup/resume boundary intervals, excludes paused periods, and resets the window on next active segment. Active long frames up to60000ms remain in statistics; nonfinite/nonpositive/out-of-range values are counted as rejected. Read-only copied mean/P95/max/FPS become ready after30samples. This is render-loop interval sampling, not GPU duration, display presentation timing or physical-device acceptance. Native CPU validation requires at least60samples, without injecting timings.

The footer explicitly names CPU/Canvas2D instead of WebGL0; unavailable/private WebGL driver data never becomes a hardware-certification claim. Startup/paused/insufficient-sample labels avoid a misleading FPS constant. A tooltip explains mean/P95/max and measurement boundaries. Labels update on the existing footer cadence, not a new timer.

scripts/build.mjs injects one version/batch/source object into the runtime and build-meta.json. Pause displays this identity. The stale static0.9.17 header badge and0.3/0.4/0.6 chapter-version prose are removed, not replaced with another hand-copied dynamic version. A local build has source=null; CI embeds its actual sourceSHA, so its final HTML hash differs from the local artifact and must be matched against its own run/Pages bytes.

## Preservation and verification

Six declared main diagnostics/text replacements reverse exactly to acceptedCI47 main; existing whole-file expectations and22-gameplay-function checks remain intact. World/core/inputs/saves/camera/CPU raster and scene owners are unchanged. No local browser, held Z, prologue-render retry, asset repaint or new dependency.

Fresh1161Node/220Python/assets/typecheck/build passed; native F observations remain pending. Unit tests exercise actual CpuEngine sizing over five viewport sizes, all tier transitions, baseline preservation, manual quality, bounded frame windows and labelled build injection. Synthetic validator fixtures are not native evidence.

Original CPU home→fair and co-op battle/own-save journeys retain all assertions/timeouts. Added observations read real active intervals, runtime source/version text and native quality-select buffer sizes while preserving the full paused state; cpu-quality.png and cpu-compatibility.png extend nine original CPU PNGs to11. Final CPU ledger includes14files. Existing13primary/9native plus CPU native, original audio/actor/WebGL/CPU evidence owners remain required. No full-chapter CPU, device smoothness, listening or art90 approval follows from this local batch.
