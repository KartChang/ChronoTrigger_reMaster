# CPU rendering — F runtime retained; G native-route repair pending CI49

Authority: STATUS / CI49_CHECKPOINT. Current G source: 8c9f8a26ad1e7e8a5683936604165a799f8acbec, version 0.9.29. Last accepted E / CI47 / Pages41 remains unchanged. The full preceding F contract is retained at commit 526684e957436f05a95813750793ba2aa3035a6e; CI48 has resolved to failure, not acceptance.

## Runtime contract unchanged by G

Default auto mode first tries WebGL2/1. When unavailable, the project's CPU triangle/texture rasterizer computes RGBA for Canvas2D presentation. It reuses Babylon's scene graph, characters, camera, rules, inputs and saves. NullEngine alone does not render pixels. CPU omits shadow maps, glow, postprocessing and specular highlights; this is a compatibility path, not WebGL visual parity or universal device performance. Explicit renderer=webgl remains a diagnostic opt-out.

The baseline 640x480 pixel cap, maximum dimension 1280 and texture budget of 32 MiB / 512 entries remain. E's conservative current-vertex offscreen rejection, triangle shortcut and live light-vector reuse are retained. F applies tier multipliers after the baseline cap: auto tiers 0–3, quality tier 0 and compatibility tier 2. Initial auto preserves former dimensions. Lower tiers trade sharpness for load without shrinking actors or changing geometry/ATB. Original WebGL policy and automatic degradation thresholds remain. G changes none of src, index or workflow.

F's FrameWindow retains 120 actual active render-loop intervals. Mean/P95/max/FPS exclude paused periods and startup/resume boundary intervals while retaining valid active long frames. They are not GPU timing or device certification. The footer names CPU/Canvas2D; runtime and build metadata use one version/batch/source object. See RUNTIME_DIAGNOSTICS_T05.md.

## CI48 failure and G route ownership

CI48's first CPU home journey missed the stairs at x=-.9. The previous driver accepted crossing x=0 while a key was held, then failed to require post-release arrival. The stairs center (0,-4.1), radius .65 and 250-tick/30-second stair condition are unchanged. The actual CPU image and report were retained; this was not a backend startup failure. Later CPU quality/save observations were not completed, so CI48 cannot accept F in full. Successful good/bad and original WebGL/render checks do not change this boundary.

G's tests/cpu_native_route.py uses real native keyboard pulses, releases every attempted key, and then reads the snapshot. Ordinary opposite-direction input corrects overshoot within the original .12 tolerance. The original per-leg tick budget and a single 30-second deadline remain; unexpected pause, chapter change, rollback or budget exhaustion fail rather than skip. Bounded nativeRoutes diagnostics record before/afterRelease states. Nine other CPU driver functions, original route goals and all assertions/timeouts remain identical. No clock/state injection, manufactured positive save, collision edit or local browser execution is used.

Fresh 1161 Node / 232 Python tests, assets, typecheck and build passed. The 12 new Python port tests and 36 latency/axis/direction subcases are deterministic models, not native G evidence. CI49 must complete both original CPU routes, F's >=60 real samples, native quality dimensions and paused-state assertions, 11 PNGs / 14 CPU ledger files, own v2 export / IndexedDB / native import and released-position diagnostics, alongside the original primary/native/audio/actor reports and five source ledgers. Preserve raw artifacts in Drive, verify readback, then match Pages/source/HTML before acceptance.

The CPU fallback exists and E's opening/fair journeys remain accepted. Full native CPU chapter coverage, sustained physical-device performance, listening, refined HD-2D art and the complete game remain open. Held Z, prologue-render and local-browser restrictions remain. Recovery: Drive 1XIFKO-hLoFWrEPwC6oBE74hIuHikDKoi; always read current main documents separately.
