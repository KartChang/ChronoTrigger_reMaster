# Rendering compatibility — CI49 route repair; accepted CPU fallback retained

Authority: STATUS / CI49_CHECKPOINT. Current G0.9.29 source 8c9f8a26ad1e7e8a5683936604165a799f8acbec awaits CI49. Last accepted E0.9.27 remains CI47 / Pages41. CI48 completed with a CPU-native test-route failure, not absence of the backend or full acceptance of F.

## Existing production selection and limits

WebGL2-to-WebGL1 and browser-selected hardware/software behavior remain. Driver names are hints; unavailable metadata is not hardware proof. The page does not force browser policy. Default auto falls back to the project's CPU vertex/texture/pixel rasterizer and Canvas2D when WebGL cannot be created. Explicit renderer=webgl is a diagnostic opt-out with recovery UI. Not every possible browser/device is guaranteed to permit Canvas2D or meet performance targets.

Native WebGL context loss still freezes rules/audio, clears input/timing, and restores without catch-up or automatic saves. CPU reuses existing geometry, actors, camera, fixed ATB, inputs and saves, but simplifies shadow maps/glow/specular. Baseline 640x480 and the 32 MiB texture budget remain bounded. F's tiers apply after that cap: quality 0, compatibility 2 and auto 0–3 affect only drawing-buffer density. FrameWindow reports bounded active intervals and correct CPU/build identity, not GPU or device certification.

## What this batch changes

G has zero src, index or workflow changes. Only CPU test movement, its new native-pulse helper/unit tests and build version changed. CI48 recorded x=-.9 outside the original .65 stairs radius after target crossing was accepted prematurely. G requires released-input arrival within the original .12 tolerance and unchanged per-leg tick/30-second budgets. No collision/state/save mutation, synthetic input, clock injection or local browser run is used. Full failure originals are retained in Drive 1XIFKO-hLoFWrEPwC6oBE74hIuHikDKoi.

Fresh 1161 Node / 232 Python tests, assets, typecheck and build passed locally. Actual G route and F presentation closure await CI49. All three jobs, final reports, five ledgers, F's >=60 active samples, native quality dimensions, complete paused-state equality, 11 CPU images and own native import remain mandatory. CI embeds its actual source SHA; compare its own metadata/HTML/Pages, not the null-source local artifact.

E's real no-WebGL opening/fair/co-op/ATB/own-save evidence remains accepted. Full CPU chapter walkthroughs, physical-device FPS/thermal behavior, listening, full-game and art90 acceptance are not established. Reuse saved assets; do not bypass held Z/prologue-render/local-browser boundaries. The complete prior contract and Chromium SwiftShader / MDN driver-privacy references remain at commit 526684e957436f05a95813750793ba2aa3035a6e. No new external verification is claimed by this progress update.
