# VQ04I — pixel-exact CPU hot-loop optimization

Version 0.9.82. This batch addresses the rendering cost observed alongside the still-open native CPU rescue route failure. It does not claim to have established the failure's sole cause or to have repaired the native route before matching CI evidence.

## Observed terminal

CI105 / 36463822283 / exact H fb57de8eb15fc3e46e078a946766ed42e59611e4 failed. The original CPU rescue report's reunited Truce paired route to z=7.6 took 313 ticks against the unchanged 309-tick budget. Both actors ended inside the unchanged <.12 spatial tolerance; that does not make the timing assertion pass. The failure snapshot reports about 16 FPS at 543×362. Rendering, browser scheduling and transport overhead are not isolated by that trace. Pages99 was skipped, not deployed. Original reports remain unmodified.

## Runtime changes

Only src/cpu-raster.ts and src/cpu-scene.ts change runtime behavior. The three conservative half-plane row bounds are unrolled in their original order with the same floating expressions, rounding, epsilon and coverage predicates. The renderer resolves opacity and cutoff before RGB interpolation so discarded transparent fragments avoid color work; accepted samples retain the original RGB arithmetic and blending. Three frame-local Babylon Vector3 scratch objects replace per-vertex coordinate/normal/point-light temporary allocations. Vertices store copied scalar values, not aliases to the mutable scratch objects. Live scene observers, transforms, lights, geometry and material sampling remain authoritative each draw; no stale scene cache is introduced.

No resolution, raster quality, mip policy, memory limit, geometry, collision, actor pixel, simulation tick, input, save, native diagnostic, original route, capture, assertion or golden is changed. Counters retain their old truthful meanings. This is neither an art redraw nor an animation activation. The H building/court geometry and G NPC attention remain intact. Held prologue blob 2711a74185aacf3c6bddf9db85ba99a2afbc507a and mother/furniture are unchanged.

## Differential and regression evidence

37 I-specific Node tests cover 4,000 deterministic random triangles, exact RGBA/Float32 depth/work counters, opacity/RGB opacity/alpha cutoff, horizontal edges/slivers/clipping, mip/wrap/invertY, invalid vertices/buffer limits, transformed meshes and point/directional/hemispheric lighting. Seventeen actual ArtDirectedWorld scenes and two immutable CI105 route-position fixtures compare whole CPU frames in both existing sampling modes. The native-sized fixture draws resolve to 543×362. The fixture is read-only offline data, never injected into a browser or replayed as native evidence.

The I→H inverse is source-only and only accepts nine declared source/test/build paths. H→G and earlier preservation layers retain their original pins and assertions. All 703 scanned untouched H inputs and 708 untouched program files remain byte-exact. Native images/reports/game State are not accepted inverse inputs; no old pixels are substituted at runtime.

Full npm run check: 3,590 Node tests, 0 failures/skips/cancellations; assets, quality-schema check, TypeScript and build exit 0. Full Python: 633 tests, passed. The old 30/100 quality review is stale and release remains BLOCKED; it is not a new I score. The first full-run hash set was captured during execution, not before invocation; that historical receipt is retained. A source-transfer mismatch stopped publication before any commit/ref update. The new I envelope was changed from whole-file hunks to smaller exact contextual hunks, retaining the same nine H SHA-256 pins and source-only strict inverse. Two incorrect unreferenced Git objects were excluded. After that packaging-format edit, 37 dedicated Node tests, all 3,590 Node tests, 633 Python tests, assets, TypeScript, quality schema and build were rerun successfully. All 727 program hashes were recorded before this final full check and matched after completion. No source bytes changed during that final run.

## Offline measurement and limits

The benchmark alternates H/I draws, uses 20 warmups and 30 measured draws per version per case, and checks identical whole-frame pixels/work/state after each pair. It uses the existing rect-only offline canvas port and the original CI105 before/after positions at 543×362. Current measured median draw reductions across the four cases were about 9.4%–20.6%. Raw samples, hashes and work counters are in final-benchmark.json. These are this container's offline measurements, not browser FPS, device approval, native route acceptance or proof of the sole cause. The earlier smaller-raster exploratory comparison is explicitly retained as exploratory, not presented as the final native-sized study.

## Publication and continuation

The validated source snapshot, 19 deltas, full logs, benchmark and verification receipts must be saved to the designated Drive folder and truly downloaded/verified before one non-force main source update. Then bind the unique matching push CI and preserve its actual result; no rerun, dispatch, parallel candidate or historical source resend. CI104/105 remain failures and Pages98/99 remain skipped. The next native evidence must prove the unchanged CPU route budget and other gates; a local speedup is not sufficient.

The complete T03–T08 game, all party/enemy/NPC directions/actions/deaths, 112 staged NPC walk slots, 256 staged party combat slots, early-scene composition/overworld transitions, lawful full audio/listening, original speed, physical devices and long sessions remain in scope. All complete art/animation/game/listening/device approvals remain false, newScore=null, releaseBLOCKED. No local browser was used.
