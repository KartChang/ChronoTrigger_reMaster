# Kingdom 0.4.1 — quality hardening handoff

## Current status

**DEVELOPMENT CANDIDATE — NOT 90-POINT ACCEPTED.**

Parent HEAD: c862cdc690e2603b9710d5946ac6993b7f3ad8bb. Active repository KartChang/ChronoTrigger_reMaster, main. Browser TypeScript/Babylon/esbuild, ATB, local co-op. No visibility changes, public hosting, paid services, ROM access/extraction or distribution in this batch. GitHub metadata currently reports public; never assume private.

## Latest observed browser authority

CI8 / 35216792204, source 4e9a3c8750c192e731ac7b9421c37f66f0bb9b93: **completed failure**. 109 units/build/typecheck passed; only the standalone-launch checkpoint passed before first lab movement failed. Kingdom browser steps were skipped, not accepted.

Downloaded evidence artifact 10495481982, SHA256 c4d6d8511f39b399bd71a32e3af3542177c41fa2b1f2d9f2d85914bd01a7c3c1. First terminal: P1 movement stopped at x=-0.6, ticks=79, not paused; simulated tick budget exceeded. Source is in artifact source-4e9a3c8750c192e731ac7b9421c37f66f0bb9b93.tar.gz.

Input root: lastPhase was updated after the first new-scene simulation frame and Controls.clear removed a legitimately held key. Not a slow-render timeout issue. Current fix rebases input boundary synchronously on replacement/dialogue; simulated changes clear once and discard remaining old-input substeps. No existing browser assertion/time budget removed or weakened.

CI7 artifact 10493917525 was read only for the latest accepted visual baseline, not rerun. Actually inspected opening/01-classic-fair.png and opening/05-canyon-battle.png: visuals remain simplified and far below the concept poster. No unseen 0.4 kingdom scene is called visually accepted.

## This batch

- InputBoundary fix with seven unit regressions (including old-failure reproduction).
- Three heroes now alternate left/right walking strides in a four-frame cycle.
- Export same runtime authoring functions into 8 PNG sheets / 53 frame records with metadata, pivots, durations, hashes and missing-clip annotations; these remain prototype assets, not final art.
- Asset register: 15 required whole-remake asset groups, all currently missing/prototype, none promoted to approved.
- Evidence-bound whole-remake scorecard baseline 30/100. Runtime digest marks it stale after modifications; do not silently inflate it.
- Release gate needs >=90, each category >=80%, current evidence, no critical blocker, five passed gates and approved required assets. Dev CI may produce candidates without claiming release approval.
- Added separate art-review CI artifact. No new dependency; old four browser journeys and inherited 109 tests unchanged.

## Local validation

133/133 units passed (109 inherited + 7 input-boundary + 7 asset-export + 10 quality-gate tests); TypeScript, asset-extension guard and standalone build passed (~5.15 MiB). All 8 exported PNGs independently decoded/verified with Pillow. Four-frame cycle has three unique poses, not four. Existing tests' byte-for-byte preservation checked against source archive.

npm network failed EAI_AGAIN; restored existing pinned toolchain artifact 10487690665 from bootstrap run 35199851415, SHA256 18457176e5279091e751685f0fca5517f59d85e8e88e610d7c3be830b951af90, without executing install lifecycle scripts or altering package versions.

`npm run release:check` intentionally exits 1 (30/100, missing gates/assets, stale review). This is a successfully tested denial, not a passing product release.

Ordinary installed Chromium could launch but file navigation returned ERR_BLOCKED_BY_ADMINISTRATOR. No policy bypass attempted; local browser acceptance remains unverified. New browser acceptance must use the exact matching CI after this source is committed. Do not dispatch duplicates or wait indefinitely.

## Next exact actions

1. Check the single matching run for this source commit. If in progress, preserve exact SHA/run and report rather than prolonged polling. If failed, inspect first terminal state and fix it, keeping all assertions.
2. Once browser passes, inspect fair, canyon and kingdom exploration/battle screenshots and input motion. Preserve new evidence; do not raise the old assessment merely because source changed.
3. Improve one coherent fair exploration / forest battle art kit before expanding more low-fidelity chapters: character attack/cast/hurt/down/victory; richer terrain/buildings; target selection/skill timing; audio production. No concept poster as runtime evidence.
4. Continue cathedral/Frog/queen rescue, full original opening, inventory/equipment/progression and remaining story after core quality issues are addressed. Keep whole-game gaps open; no denominator shrink to make a small demo appear 90% complete.
5. Actual device/gamepad and frame-time/loading/memory checks; confirm reference/version and asset-use boundaries. Mobile/native/networked scope remains separate.

Stable contracts: docs/QUALITY_AND_ASSETS.md, assets/manifest.json, quality/scorecard.json, AGENTS.md. Live progress only here. Source/evidence persist in GitHub; /mnt/data is temporary. No newly claimed 90-point acceptance.
