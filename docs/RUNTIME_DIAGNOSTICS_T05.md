# Runtime diagnostics — F contract preserved; G / CI49 pending

Authority: STATUS / CI49_CHECKPOINT. G source 8c9f8a26ad1e7e8a5683936604165a799f8acbec, version 0.9.29. G keeps all src from F unchanged, advancing only build version/batch and the native CPU test's walking controller. The preceding full F contract remains at commit 526684e957436f05a95813750793ba2aa3035a6e.

## Implemented observations, unchanged

CPU-specific tiers follow the original 640x480 baseline cap: auto tiers 0–3 use multipliers 1/1.25/1.5/1.75; quality uses tier 0 and compatibility tier 2. Initial auto preserves prior dimensions. The existing 30-frame warmup, 90 valid samples, mean >45 ms and P90 >55 ms govern adaptation. Paused, invalid and isolated >250 ms intervals do not trigger that policy. It does not guarantee FPS. Scene, actor, camera and ATB behavior are unchanged.

FrameWindow retains 120 actual active render-loop intervals. Startup/resume boundary intervals and paused periods are excluded. Valid active long frames up to 60000 ms remain; invalid values are counted. Statistics become ready after 30 samples; native validation requires >=60. This measures loop intervals, not GPU duration, display presentation or physical-device acceptance. The CPU/Canvas2D label replaces WebGL0, with sampling/paused states rather than a misleading FPS constant. Shared injected version/batch/source information populates runtime/build metadata and pause identity; the old static 0.9.17 badge is gone. CI embeds its actual source SHA, so null-source local HTML is not an exact CI byte baseline.

## Verification status and route repair

CI48's first native CPU home case failed before stairs completion. Its lastView contains 120 real samples, but later quality/compatibility and own-save assertions did not complete. Do not treat that partial capture as full F acceptance or a new device/FPS/art score. CI48_FAILURE_ROOT records the actual route miss: x=-.9 versus the unchanged stairs radius .65. Original WebGL/render and good/bad checks passed without making the entire CI successful.

G's native route observes positions after releasing all keys and converges within the original .12 tolerance, fixed per-leg tick budget and single 30-second ceiling. It retains before/afterRelease diagnostics and every old route assertion. All src/F diagnostic hashes remain identical. Local 1161 Node / 232 Python tests, assets, typecheck and build passed, but native closure awaits CI49.

CI49 must complete both original CPU journeys, >=60 real active samples, matching build/backend/source labels, native quality dimensions and full frozen-state equality, 11 original CPU PNGs / 14 ledger files and all other original reports. No synthetic timings, writable game hook or local browser execution. Last accepted E / CI47 / Pages41 remains closed.
