# Prototype 0.1 — current handoff

## Authoritative scope

- User selected HD-2D, fastest-to-play priority and requested optional two-player cooperation.
- Repository: KartChang/ChronoTrigger_reMaster; private, current development on main. Not GauAI or IoT Colony: do not import their governance, standing authorizations or TODO history.
- Browser-first TypeScript + Babylon.js + esbuild; local cooperation; ATB preserved. A full real-time ARPG conversion has not been approved.
- Original ROM supplied in conversation was not read, extracted, committed or bundled. Runtime does not require it.
- No public hosting, Pages, visibility change, paid service or native installer.

## Implemented before this rules review

Original placeholder HD-2D village; two independent local control slots; shared camera; basic collision/following; simplified ATB; skills and atomic two-party combo; victory/defeat recovery; temporal flag demo; IndexedDB plus import/export; single-file build; unit and browser CI.

These are prototype systems, not a faithful original chapter or final art.

## Verified inherited checkpoint

- Source: `dbe7517a39a6b165cc80681351f7617f0dc1a0bc`.
- CI: Playable prototype CI #4, run `35203279913`, job `105142892804`, completed **failure**.
- Core tests 32/32, strict TypeScript, asset extension check and standalone build passed. HTML approximately 5.09 MiB.
- Six real Chromium checkpoints passed: file:// WebGL launch; independent keyboard slots; pause; gamepad disconnect ownership; held Start edge; IndexedDB save/load.
- First failure: `tests/browser_smoke.py` waiting 20 wall-clock seconds for both ATB gauges to fill. No console errors in browser-report.json.
- Evidence artifact `10488792571`, chrono-hd2d-browser-evidence. It contains title/exploration screenshots and the failed report. It is not the successful playable artifact.
- Screenshot shows about 1 FPS on software GPU. Production caps each frame delta at 0.1s; ATB fills in about 2.38 simulated seconds. Likely wall-time budget mismatch; old report lacks tick snapshots to prove the full failure state.

## This batch: rules adaptation and bounded simulation waits

- Added game-specific `AGENTS.md`, thin `CLAUDE.md`, actual `CODEBASE.md` and `docs/AI_RULES_REVIEW.md` instead of copying the full 336-file SME template.
- Modified only the browser harness, not gameplay source, packages or CI workflow.
- Read-only waits now distinguish simulated tick budgets from a finite 90-second wall-clock guard. ATB budget 180 ticks; axis movement uses path distance at the existing 4 units/sec plus margin. North-to-gate joint movement has 240 ticks.
- Unexpected pause, mode, lost co-op ownership, reset or exceeded simulation budget fail with diagnostics. No teleport, fast-forward, skipped assertion or relaxed MP/damage checks.
- Local verification: Python compile/AST passed; 13 synthetic predicate assertions passed; all 22 existing browser assertions unchanged.
- Local browser not run in this batch. Do not claim a new E2E pass before checking the CI run for this source commit. The previous temporary environment reported managed-browser/WebGL restrictions; no policy workaround was attempted.

## Current acceptance state

**PROTOTYPE IMPLEMENTED — BROWSER ACCEPTANCE PENDING.**

After this batch is published, query runs by its exact source SHA. If queued/in_progress, report that checkpoint and stop waiting rather than polling indefinitely. A newer documentation-only commit must not be mistaken for a new gameplay candidate.

## Not complete / limits

Not a playable original chapter or final HD-2D art. No original characters, scene reconstruction, original story/script/audio extraction, complete ATB compatibility, real-time combat, networking, installer, physical-device or physical-gamepad certification.

Follower uses local steering, not A*, and can stick behind scenery. Collision world and visual decoration are not unified authoring data. Target selection is nearest-alive, not a selection menu. Numbers are prototype values, not original ROM values. Future is an environment variant, not a second chapter. No inventory/progression or third party member. Single save slot plus export. Touch covers P1, not two people on one touchscreen. Software CI FPS is not a hardware benchmark, and 1 FPS screenshots are not performance acceptance.

## Next work, in order

1. Read exact matching CI browser report, including wait-evidence.json. Fix first actual failure; do not keep enlarging limits without state evidence. On success, inspect screenshots and retrieve the playable artifact for user testing.
2. Define explicit reference/version/provenance and create a small faithful scene/art slice; do not call this placeholder village a Chrono Trigger chapter.
3. Preserve ATB co-op until the user explicitly chooses any ARPG conversion. Extend input ownership design before adding third-character control.
4. Improve companion pathfinding, target selection, combat animations and interaction feedback; unify map collision/visual authoring data.
5. Add data-driven events, dialogue, maps and a coherent short chapter, with save/reload checkpoints.
6. Validate real desktop browser/gamepad performance, then real iOS/Android touch layouts. Decide packaging only after the playable core is stable.

Dynamic progress lives here; stable code map in CODEBASE.md. Persist source/evidence/checkpoints in GitHub; /mnt/data is temporary. Avoid simultaneous candidates and long CI polling.
