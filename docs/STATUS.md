# Current status — CI20 / Pages14 closed; early visuals remain the next priority

Updated 2026-09-19. **Independent input/menu/equipment version 0.9.3 has passed CI20 and matching Pages14. Full retained scene/model/camera work is NOT published or visually accepted. No early-90, hardware or whole-game approval.**

## Exact accepted source; no active validation

Game source: `0e65066d2e1e54cfff9b9a7a4d5466a694a79484`; source tree: `aaef95965728d2eb068eaf3be6cb08e3b0215af9`. Main observed before this documentation-only handoff: `820f871de97933ca0f4e41b4ca5112079872f660`, document tree `8f2ac0ca3edfb8ab355a6ce182b0f4343faf5c3d`. This handoff uses [skip ci], changes no runtime, and does not create another candidate.

**CI20 `35436087487`, push/attempt1, completed success.** Validate `105878862672`, bad `105878862731`, good `105878862753`: all success. Validate steps10–21 all succeeded, including keyboard, new-game, equipment/native import/v8/combat and every retained journey. Twenty actual journey/modal JSON reports passed; the stale quality report is not counted. Do not rerun CI19/20 or reopen the native-picker/chest/organ failures just because old records contain them.

**Pages14 `35437851648`, workflow_run, success.** Prepare `105883462806`, deploy `105883495029` succeeded. Its workflow HEAD is the documentation SHA820f871, but deployment.json selects source0e65066, CI20 and playable artifact10582547615. Downloaded staged play/index.html is byte-identical to the playable HTML: SHA256 `7f3246da5fae089320a4b6554971ffe726ada7c7a5249ffc7e4ee575369b45d2`,5579064bytes. Deploy step3 independently verified public HTTP metadata, game bytes and launcher at deployment time. This is not a new manual play session.

No active CI, no new candidate, no CI21 dispatch, no Pages restart. Exact receipt: `evidence/CI20_ACCEPTANCE.json`; review: `evidence/CI20_VISUAL_REVIEW.md`. CI20_CHECKPOINT now points to the completed result, superseding its prior in_progress snapshot.

## Accepted functionality and limits

Native Tab/Enter file selection succeeded three times with real same-run v6 and own v8 exports; picker open/closed, pause and final canvas focus were observed. Equipment purchase/equip/spare sale, wallet/stock rules, real IndexedDB reload, ordinary attack36/received damage9 in the authored test setup, battle equipment locks and victory Enter continuation passed. Keyboard six-check journey and seven modal reports passed, including desktop/650/390/short landscape. This closes the CI19 picker root in the tested software-browser scope, not a physical-input or accessibility audit.

Inspected actual home, fair idle, battle-ready, victory, trade, final import and good/bad court PNGs; also full-resolution390x700 and844x390 inventory frames. Existing repeated wood/paving, simple mother/furniture and compressed court remain visible. Sticky inventory header/footer still consume substantial short-screen height. These are remaining visual-comfort issues, not grounds to repeat successful functional tests unchanged. No numerical art score. The old30 in quality metadata has stale=true and is not current task authority.

## Durable acceptance delivery

Project folder `1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb` only.
New `Chrono-CI20-Pages14-accepted-evidence.zip`, Drive **`1vMhQbcd4wOBTdkFk28aDPutsyvIX-S1n`**, **23765122bytes**, SHA256 **`f7f6dac2d86cf4fff172eae5728dfa3f5afb48508f367d0414542dc19bdd7d48`**. Contains all five original CI20 ZIPs plus the original Pages14 staged ZIP, acceptance/report index/actual-screen review and screenshot contact sheet. All six provider digests and CRC verified; upload, correct parent, raw Drive download, whole hash/CRC and all10 manifest entries verified. The browser ZIP also contains the exact published source tarball; current documentation remains on main. No private ROM/original media/font files added.

## Retained full visual work — not the deployed 0.9.3 scene

VQ01+B+C full work remains retained: early room/furniture/cloth/materials; curved stalls/bell/telepods; mother/vendors/hero refinements; portrait camera, real-triangle foreground fades, foot/shadow fixes, fixed-tick camera easing and reduced-motion behavior. Its prior full-working checks were763Node/16Python; the independently published UI checks were681Node/16Python. These are distinct scopes and were not rerun during this handoff.

The full working chain differs in43 paths from old0.9.0 and **31 paths from current accepted UI**. Restore only when needed from VQ01 base `1md7mdOBVL0xLlIU6H10LyA8GuUCxXz1k`, B delta `1vkPuPN8HN46d1uHaJY9__OPrf455k3QV`, then C working-delta `16iHw_Py_RGLr819nPAEG6d5h98JuyLNe`, using per-file base/target hashes. Do not overwrite current documents with old package docs, reapply independent-ui over main, or promote old incomplete staging. Full recovery hashes are in DELIVERY_INDEX.md and C's evidence/VQ01C_LOCAL_VALIDATION.json. Dependencies: earlier `1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE`, node_modules only.

The prior platform safety block on the new src/prologue-render.ts has no new permission outcome. The accepted UI keeps the baseline scene blob2711a74185aacf3c6bddf9db85ba99a2afbc507a. Do not repeat/bypass the blocked write, change encoding/routes, or infer permission from unrelated successful writes. No blocked source was submitted in this handoff. The prior local browser administrative block was not retried. These are specific operation boundaries, not connector unavailability.

## Next work; do not restart history

Read STATUS and IMMEDIATE_CONTINUATION, sanity-check main once, then directly resume T05 early visual/play comfort from the accepted UI and retained work. CI20/Pages14 artifact retention and provenance are DONE; do not repeat them or download all historical evidence. Continue permissible independent early refinements without recreating stored models/actors; normal full scene publication needs its actual permission outcome. After a coherent permitted source batch, commit/non-force main/readback and one existing full CI; stop polling when pending.

Early90 still needs genuine same-source scenes/animation/compositing/occlusion/UI/performance and user feedback. Truce/castle/court details, fuller actions, original geography and cleared audio/physical devices remain. Later story/system expansion stays behind early-comfort acceptance. Full T03–T08 and whole-game>=90 scope remain;2300 is arrival only, not completed future campaign. Whitepaper, FEATURE_PROGRESS, TODO and delivery index were updated with this handoff. No multi-writer branches/PRs/audit: only this AI workflow uses the repository.
