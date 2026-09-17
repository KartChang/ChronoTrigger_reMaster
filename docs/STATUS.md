# Kingdom 0.4.1 — quality hardening handoff

## Authoritative current checkpoint

**DEVELOPMENT CANDIDATE — NOT 90-POINT ACCEPTED.**

Published source: **18a99497450b31342ed3f02cd107cf23d8153670**.
Source tree: **715494da6cc99a2199b59e3ec9fd119809afd4d5**. Local git write-tree exactly matched the connector-created tree, including all retained source and the 21 changed paths. Non-force fast-forward from c862cdc690e2603b9710d5946ac6993b7f3ad8bb.

Matching CI **#9 / 35223217588**, push event, **in_progress** at last query. Exact-SHA total_count=1. This documentation-only handoff is not a new gameplay candidate. Check this run first; do not dispatch a duplicate or infer a pass from unit checks.

Repository KartChang/ChronoTrigger_reMaster, main active. Browser TypeScript/Babylon/esbuild, HD-2D, ATB, local co-op. Current GitHub metadata is public. No visibility change, public game hosting, paid service, ROM access/extraction or original-asset distribution performed in this batch.

## Inherited failure and actual fix

CI8 / 35216792204, source 4e9a3c8750c192e731ac7b9421c37f66f0bb9b93: completed failure. 109 units/typecheck/build passed; only standalone launch passed before the first lab movement failed. Fair/opening/kingdom steps were skipped.

Evidence artifact 10495481982, SHA256 c4d6d8511f39b399bd71a32e3af3542177c41fa2b1f2d9f2d85914bd01a7c3c1. P1 stopped at x=-0.6, ticks=79, not paused; tick budget exceeded. lastPhase changed after the first frame and Controls.clear erased a legitimately held key. This was a runtime regression, not a reason to enlarge waits.

InputBoundary now rebases synchronously at start/load/import/dialogue changes; simulated transitions clear once and discard remaining old-input substeps. Seven tests cover the old failure and the corrected behavior. Core game rules and all four existing browser journeys were retained byte-for-byte; no assertion or wait budget was weakened.

## Quality and asset work

The user requires >=90 before acceptance. Prior work had tests and selected screenshot review, not an evidence-bound numerical quality gate. Provisional whole-remake baseline is 30/100, not a player rating or completion percentage. CI7 artifact 10493917525 opening/01-classic-fair.png and opening/05-canyon-battle.png were actually inspected; current CI8 supplies the regression evidence. Unseen kingdom scenes are not called visually reviewed. The generated concept poster is not a runtime screenshot.

quality/scorecard.json is frozen to reviewed source/digest; source changes mark it stale and never automatically raise ratings. The release preflight requires >=90 total, >=80% in each category, no critical blockers, all five evidence gates and approved required asset groups. The check validates evidence records and arithmetic, not subjective visual quality automatically.

Three heroes alternate left/right strides over four timed frames (three distinct poses). Exporter produces 8 PNG sheets / 53 frame records plus pivots, timings, clip names, source hashes and missing-clip notes. This is export of existing hand-authored runtime art, not a newly finished high-fidelity art pack or ROM extraction. External edited PNG import is not implemented. 15 required asset groups remain missing/prototype; none approved. CI separately retains chrono-hd2d-art-review-kit.

## Validation and delivered candidates

133/133 local units passed: 109 retained + 7 input-boundary + 7 asset-export + 10 quality-gate. TypeScript, asset guard and standalone build passed; all 8 PNGs independently decoded/verified. Release preflight intentionally returns exit 1: denial works, product is not accepted.

npm network was unavailable (EAI_AGAIN). Restored the existing pinned toolchain artifact 10487690665 from bootstrap run 35199851415, SHA256 18457176e5279091e751685f0fca5517f59d85e8e88e610d7c3be830b951af90. No dependency versions or install lifecycle scripts changed. Ordinary local Chromium returned ERR_BLOCKED_BY_ADMINISTRATOR for file navigation; no policy bypass, no local browser pass.

Candidate HTML: 5,400,333 bytes, build metadata version 0.4.1 and exact source SHA 18a99497450b31342ed3f02cd107cf23d8153670.

- chrono-hd2d-quality-v0.4.1-candidate.zip: 1,220,217 bytes; SHA256 3e13c393bcb13100fafa680f5515fa99e502686bc3d65ae2614af4782c5aa3bf.
- chrono-hd2d-prototype-art-kit-v0.4.1.zip: 14,359 bytes; SHA256 ab35c09f64c861172a9a69de66e42f111e7a61772b9b27d950f256942785e790.

Both ZIPs passed integrity checks. Candidate includes operation instructions, QUALITY_STATUS, source metadata and third-party notices. They are local-built candidates/review assets, not new CI-success releases. Rebuild from source if temporary container files disappear.

## Next work

1. Read exact CI9 run and first failing state if any. If still running, preserve checkpoint and report instead of waiting indefinitely. On success inspect actual fair/canyon/kingdom captures and input motion; only then reassess applicable criteria.
2. Produce and integrate one coherent high-fidelity exploration/battle kit before more placeholder chapters: character attack/cast/hurt/down/victory, terrain/buildings/props, UI portraits and authored skill/audio timing. Use original-version references, not inferred details from the generated poster.
3. Continue cathedral/Frog/queen rescue, true initial opening, inventory/equipment/progression and remaining eras. Whole-game deficits remain open; do not shrink the denominator to label a small slice 90% complete.
4. Validate target desktop/gamepad frame-time, loading, memory and visual quality. Mobile/native/network scope stays separate. Confirm source version and asset-use boundary before any specific ROM data extraction; the provided ROM remains untouched.

Stable contracts: docs/QUALITY_AND_ASSETS.md, assets/manifest.json, quality/scorecard.json and AGENTS.md. Live progress is only here. Source and evidence persist in GitHub; /mnt/data is temporary.
