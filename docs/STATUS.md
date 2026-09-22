# Current status — CI49 failed; VQ02H / CI50 is the only active validation

Updated 2026-09-22 Asia/Taipei. Read this, handoff/IMMEDIATE_CONTINUATION.md and evidence/CI50_CHECKPOINT.json. Main only, single AI, non-force. No repository/history audit, branches/PRs, closed-acceptance replay, held-path retry or local browser operations. Later [skip ci] document HEADs are not new game sources.

## Published current source

**VQ02H / 0.9.30**, source **840ffe01882c8248f11603ee1c4da246f5aa2ccc**, root tree **205bc73a075b92a5efd5ac072f45f6857b037b4a**, parent **3c3c1909f03df9a839c7569860e0506d6c05ac2c**. Three files, one non-force source commit, main readback and complete tested src/tests/scripts/.github subtree equality. Current main docs were retained; no archived progress overwrite.

Only validation **CI50 35669876213**, push/attempt1, source above. Last observed **in_progress/null**, created **2026-09-21T23:57:33Z**, updated **2026-09-21T23:57:35Z** (Taipei **2026-09-22 07:57:35**). Exact-SHA all-event/all-state count=1. Jobs not inspected. No dispatch/rerun/cancel/wait loop. Machine terminal **CI50-pending-full-validation**; not accepted.

## CI49 first actual root

CI49 **35641527652**, Gsource **8c9f8a26ad1e7e8a5683936604165a799f8acbec**, completed/failure updated **2026-09-21T19:15:06Z**. Validate **106471733017** failed at CPU step21; good **106471733186** and bad **106471733213** succeeded. Step22 missing successful CPU final report is secondary.

Root **CI49-cpu-native-observation-overhead-budget**. G actually passed bedroom stairs, home and overworld; do not return to CI48's stairs failure. Fifth move went from overworld z=-2.7 toward5.1, using29 native100ms holds and repeated released-position reads. Original315tick leg reached323elapsedticks, afterRelease tick1059 at x=.039999999999998766,z=4.980000000000005. Catch snapshot1061 is later. Derived192movement-equivalent/131otherelapsedticks explain the short-pulse duty-cycle cost. Position is numerically just within.12, but exhausted budget must still fail BEFORE arrival.

Actual failure PNG reviewed: CPU visibly rendered the overworld/player/tent, not blank or failed WebGL. Four untouched ZIPs, digest/size/CRC and six render-ledger listed file hashes checked. No verifier was reexecuted and no exact-ledger-regeneration or full lane revalidation claim. No playable artifact or new Pages. CI49_FAILURE_ROOT.json records the boundary. CI49 and CI48 remain failed, not rerun or accepted.

## H incremental repair completed — do not redo

Only scripts/build.mjs, tests/cpu_native_route.py and new tests/cpu_native_route_cost_test.py changed. Long-leg native holds now scale with distance up to250ms, shortening near the target and accounting for observed release drift. This amortizes unheld readback cost; it does not enlarge timeout or tick budgets. Release-before-snapshot, strict<.12, original per-leg formula, single30s deadline, budget-before-arrival and attempted-key cleanup are unchanged. Every readback tick remains charged.

All src/index/.github/package/config, entire CPU browser driver, original G port tests and36 subcases unchanged. F density tiers/FrameWindow/backend/build identity remain intact. No game/save/time/collision mutation, teleport, new art or new renderer.

Fresh **1161Node / 240Python / assets / typecheck / build**, final full **npm run check exit0**. Eight new Python tests include24 long-leg subcases and negative budget/deadline/blocked/co-op cases. An observed-cost unit model reproduces old323/315; H model finishes255/315 in13pulses atz5.06. These are deterministic port results, NOT native browser acceptance. Initial red regression and two interrupted checks are retained separately from final successful logs. Local browser was not operated.

## Durable recovery

Only Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**. New **Chrono-CI49-terminal-VQ02H-tested-batch.zip**, ID **1w5T1edXd0vXOhciA23SRC3CWNqKEMPyb**, **52245774bytes**, SHA256 **428c22ed7f6522f8eb83bd324b3306da22e07f8206afc4f82152e4a305366c40**. Downloaded raw readback matched hash/CRC/all36manifest entries/four untouched rawZIPs/correctparent. Includes original CI49 exact Gsource tar in browser ZIP and **recovery/VQ02H-tested-program-snapshot.tar.gz**,272programfiles, assembled not publishedGitarchive. Only THIRD_PARTY.md from docs; always read current main docs separately. Archived nullsource predates publication; final H GitHub receipts bind the published source without rewriting logs.

## Next and fixed scope

Read only same CI50 once. Pending -> preserve/report, no long wait. Failure -> first actual same-run root, no weakened constraints. Success -> all3jobs/13primary/9originalnative+CPU native/fiveledgers/all listed bytes-hashes; original audio/actor/HUD/scenes/ATB/equipmentv8/fulltrial/touch; both CPU native journeys/ownv2/IndexedDB/nativeimport; >=60real active samples and coherent statistics/labels; actual quality buffer changes/full paused equality;11CPU PNG/14CPUledgerfiles; released arrivals<.12 within original budgets; actual images/rawDrive/readback, then Pages/source/HTML. CI's source-embedded HTML must not be compared against local nullsource HTML.

Last accepted stays **E0.9.27**, source **f07a42bfa7357e1a9ddcebfa8a790855927051b4**, **CI47 35615882220 / Pages41 35618506663**. Closed baselines are not replayed. CPU fallback already exists with opening/fair evidence. Full native CPU chapters/devices, refined materials/scale/silhouette/narrow landmarks, complete animation/music and overall90 remain unaccepted; old30stale, no new score. Full T03-T08 retained;2300arrival is not fullfuture.

Preserve TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1Crono/P2Lucca/autonomous third/home-to2300/equipmentv1-v8. NoP3/ARPG/framework restart. HeldZ stays unpublished; prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a** and localbrowser restrictions unchanged: no retry/bypass/indirect replacement/partial promotion. Toolchain **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** onlynode_modules/esbuildhardlinks; no bootstrapCI. PrivateROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM** need not be resent; never publish ROM/originalmedia/fonts/credentials. Temporary containers are not authority.
