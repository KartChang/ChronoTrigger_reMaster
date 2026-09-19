# Current status — VQ01D inventory comfort published; CI21 checkpoint

Updated 2026-09-19. Repository KartChang/ChronoTrigger_reMaster, main only, non-force updates. This is the dynamic execution authority. Read this and handoff/IMMEDIATE_CONTINUATION.md; do not audit old runs or recreate accepted chapters.

## Exact current source and validation

Runtime source: **69dc0524b593df6948c11397280bfcedc841236f**
Runtime tree: **f6c39685bd811e3903a0edfbaaac8235c54c5e33**
Parent: 714c48db1eaa11cf22653e102b778c9ae726c586.

VQ01D / 0.9.4 is a genuinely independent inventory-comfort batch. All nine tested file blobs matched the remote tree; compare confirmed exactly nine changed paths, one commit ahead and zero behind. Main was advanced without force and read back at the exact source. Subsequent [skip ci] documentation does not change this game source.

**CI21: 35440863455**, .github/workflows/ci.yml, workflow360357259, push / attempt1, created2026-09-19T11:42:55Z. Last observed **queued**, conclusion null. Exact-source all-event/all-state lookup returned one run. No manual dispatch, rerun, cancellation or long polling. Job results have not been accepted. Preserve this checkpoint and resume this run after the user reports E2E completion, rather than waiting in the conversation. See evidence/CI21_CHECKPOINT.json.

## Work actually implemented in this batch

The old whole-dialog scrolling/sticky-header/sticky-feedback arrangement is replaced by separate header, scrollable content and status regions. The return control and transaction feedback no longer sit on top of the scrolling rows. A scoped src/inventory.css is appended after the existing CSS; the old scene/HUD CSS and renderer are not rewritten.

Equipment heading, gold and character stats are compacted. Long provisional-balance notes remain available in an accessible, keyboard-operated disclosure. Its open state is presentation-only, survives panel repaint and resets on state replacement. No allowance, inventory, equipment rules or save schema changed.

PageUp/PageDown/Home/End operate the active bag content, clamp to real scroll bounds and preserve focus. Existing same-row focus/scroll restoration now follows the content scroll owner. Tab/Shift+Tab, modal isolation, native picker activation and keyboard world ownership remain intact. Fine-pointer menu buttons have a 36px minimum, coarse-pointer buttons 44px; safe-area insets are respected.

The existing equipment browser journey keeps its true native filechoosers, same-run v6 and own v8 exports, money/stock/equip/IndexedDB/combat/victory assertions. Added seven viewport cases (1200x900,650x900,390x700,844x390,360x640,320x568,568x320), actual scroll-key input, reversible-disclosure/state-preservation assertions, no-overlap/no-overflow geometry, minimum target sizes and top/bottom screenshots. The content region must occupy at least65% of the panel. These new browser assertions and screenshots are pending CI, not already passed visual evidence.

Fresh local results: **npm run check passed; 695 Node tests, zero failed/skipped; typecheck/assets/build passed. 20 Python unit tests passed; Python compile passed.** Synthetic DOM/geometry tests are explicitly not gameplay or device certification. No local browser retry: the prior administrative restriction was not retried. No new screenshots yet. Local preview HTML5584230bytes/SHA2564a164c7ad33a6a5a13e7aa606fa85e6c16f7165a1aa630d9ee53fae426eac951 is a build output, not an accepted deployment. Existing score30 remains stale, not a current rating. No90 or physical-device claim.

## Durable delivery

Folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**.
**Chrono-VQ01D-independent-menu-comfort.zip**, Drive **1p58xW20eSNKpXzv4MkK0HTaPg-TpVobN**,1329483bytes.
SHA256 **64a8377b2dd3aee4642e2511bad2910b9f6ae8c49e266aa6eb3f7ffd65d3b6fb**.
Correct parent, raw Drive download, full hash, ZIP CRC and all nine delta hashes verified. Contains source/test delta, prepublication local receipt, fresh check logs and labelled local preview; no new gameplay screenshots. The prepublication receipt is unchanged at evidence/VQ01D_LOCAL_VALIDATION.json; publication/run/Drive results are in evidence/CI21_CHECKPOINT.json. No original ROM/media/font files redistributed.

## Prior acceptance stays closed

Last accepted game/Pages remain independentUI0.9.3 source **0e65066d2e1e54cfff9b9a7a4d5466a694a79484**, treeaaef95965728d2eb068eaf3be6cb08e3b0215af9. CI20 **35436087487** all3jobs and20journey/modal reports accepted. Pages14 **35437851648** matched exact source, CI20, playable10582547615 and staged/public HTTP verification. HTML5579064bytes/SHA2567f3246da5fae089320a4b6554971ffe726ada7c7a5249ffc7e4ee575369b45d2. No new Pages deployment in this batch yet.

Accepted evidence Drive **1vMhQbcd4wOBTdkFk28aDPutsyvIX-S1n**,23765122bytes/SHA256f7f6dac2d86cf4fff172eae5728dfa3f5afb48508f367d0414542dc19bdd7d48 remains closed. CI19 native-picker and prior chest/organ roots stay closed. CI20's exact-source archive was recovered only to restore this empty development environment, not to rerun its acceptance. Do not reopen CI20 or repeat Pages14 closure.

## Held full visual work — unchanged boundary

**src/prologue-render.ts remains baseline blob2711a74185aacf3c6bddf9db85ba99a2afbc507a.** No newscene write or previously blocked operation was retried, encoded differently or bypassed. The successful independent UI publication does not approve the blocked full scene. Scene/actor/core/input/save/assets/workflow bytes are unchanged by VQ01D except the listed UI/build/test files.

Held VQ01+B+C already implements room materials, segmented furniture/pottery/cloth, fair stalls/bell/telepod, mother/merchant/heroes, portrait framing, triangle foreground fades, foot contact shadows, fixed-tick camera easing and reduced motion. The old ledger counts43cumulative paths versus0.9.0 and31residual versus accepted0.9.3; these are not counts recomputed against0.9.4. Do not repaint or treat held files as unimplemented. Full scene still needs a normal allowed publication outcome and actual engine evidence.

Restore held work only as base **1md7mdOBVL0xLlIU6H10LyA8GuUCxXz1k** -> B **1vkPuPN8HN46d1uHaJY9__OPrf455k3QV** -> C **16iHw_Py_RGLr819nPAEG6d5h98JuyLNe** working-delta, with per-file ledger/hash checks. Current main documents and0.9.4 UI win; never reapply C independent-ui or promote incomplete old staging. During a future permitted integration merge overlapping UI/build/test edits instead of overwriting VQ01D. Exact archive hashes remain in DELIVERY_INDEX. Toolchain **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**, node_modules only, preserving esbuild hardlinks. PrivateROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM** needs no re-upload.

## Next execution and unchanged full scope

After the user reports E2E done, inspect exact CI21 once. Pending: keep source frozen and report. Failure: only the first actual same-run root using logs/report/lastObserved/focused/failurePNG. Success: require all3jobs, retain exact artifacts and review actual top/bottom menu images plus seven viewport measurements and all preserved journeys; only then match Pages to this accepted artifact. Do not weaken assertions, inject saves/progress, raise timeouts alone, duplicate dispatch or run CI for documents.

**T05 early visual/play comfort remains first, before later chapter expansion.** Real early-scene composition, actors/actions, scale, occlusion, camera, readable HUD and comfortable play must support90; build sizes/test counts/models do not. Truce/castle/court detail, full directions/actions, original geography, cleared audio and physical devices remain. Held art is not deployed by this menu batch.

Preserve home -> miniatureworld -> fair ->600AD -> rescue/homecoming ->trial/two verdicts/two escapes/Fritz ->three-parttank/reunion/Gate ->2300arrival, equipment/Melchior/v1-v8 saves.2300arrival is not the complete future campaign. Keep TypeScript/Babylon/esbuild, ATB/A*, InputBoundary, P1Crono/P2Lucca/autonomous third companion; noP3/ARPG/newframework. T03 original hidden rules/version differences/full geography; T04 growth/rewards/full shop/skills; T05 complete art/animation/music; T06 other eras/quests/endings; T07 full90/physical devices/performance; T08 verified cloud retention all remain in scope.
