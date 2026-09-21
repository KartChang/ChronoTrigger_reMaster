# CPU rendering — D functionality and E conservative work reduction

Current execution: STATUS / evidence/CI47_CHECKPOINT.json. AcceptedD source54d46a47ca23791ee5579eb7cd027ee189711dfb; candidateE sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4. No held Z or home renderer replacement.

## Ownership and scope

src/cpu-engine.ts selects existing WebGL when possible and falls back to a bounded CPU engine plus Canvas2D when default auto cannot create WebGL. CpuEngine retains scene graph/resource operations; src/cpu-scene.ts and cpu-raster.ts actually transform, shade, texture and rasterize triangles. NullEngine alone does not draw pixels. The existing World builds the same levels/actors and uses the same camera/rules/input/save paths. Canvas2D presents computed RGBA. CPU lighting omits shadow maps, glow/postprocess and specular highlights; it is a compatibility path, not visual parity with WebGL or HD-2D90.

Buffer limit640×480, texture memory32MiB/512entries remain unchanged. No original ROM/audio/fonts/new external dependency. The explicit renderer=webgl diagnostic opt-out can still display unavailable UI; default auto is the supported automatic fallback. All browser policies and security boundaries remain respected.

## E changes, no scene or pixel-quality reduction

cpu-visibility.ts computes homogeneous outcodes from CURRENT vertex data and transform matrices. It rejects a submesh only when all its vertices share an outside clip plane; invalid inputs conservatively do not reject. No cached world bounding box can hide deformed or moved geometry. Material/texture support accounting remains before rejection.

cpu-raster.ts skips polygon clipping for wholly inside triangles, rejects a shared outside plane, and retains the original crossing/near-zero-w path. Pixel filling, depth test, top-left edge rule, UV wrapping, alpha testing/blending remain unchanged. cpu-scene.ts normalizes each live directional vector once per frame after scene observers. Copied work counters expose considered/culled submeshes, shaded vertices and submitted/fast/rejected/clipped triangles. No inspector fabricates positive output or writes game state.

Pause paragraphs are valid siblings and explain the CPU fallback instead of asserting WebGL-only operation. Legacy diagnostic/build labels elsewhere remain separate polish work.

## Evidence levels

CI46 native Chromium with --disable-webgl and default auto verified home→fair, independent P1/P2, real ATB victory, own export/IndexedDB/native import; nine CPU PNGs and report/source ledger matched. This is genuine no-WebGL opening/fair gameplay, not full native chapter/device acceptance. Existing13primary/9native plus audio/actor/WebGL suites remain required.

E fresh1141Node/220Python/assets/typecheck/build passed.5000 seeded old/new raster triangles retain RGBA/depth and fragment counts.22 existing chapter scene graphs ×2 small unit viewports retain pixels and state; test canvas is rect-only and does not render text/curves. tests/baselines holds exact CI46 implementations under source-blob pins, test-only and not imported by runtime.

scripts/bench-cpu-work.mjs records5warmups and15interleaved samples per backend on the same640×480 unit scene. Local fair median93.6771→54.3625ms, bedroom48.4115→45.9998, overworld47.2071→46.8945. This is a local computational comparison, not browser FPS, power consumption, device latency or sustained smoothness. Raw samples retained in Drive and reproducible script. No timing threshold is used to mask functional failures.

CI47 preserves both existing native CPU journeys and original thresholds, adds live work accounting and help observations. Its final CPU report/ledger/ninePNG/own-save and all old reports must pass before accepting E. Full native CPU chapter coverage, real devices/performance, unsupported future material types and art quality remain open. No local browser run occurred.
