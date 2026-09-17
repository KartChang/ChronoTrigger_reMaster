# Prototype 0.2 — fair slice / current handoff

## Current exact checkpoint

**FAIR SLICE IMPLEMENTED — CI #6 BROWSER ACCEPTANCE IN PROGRESS.**

- Source commit: `8f02f652bbc756a46c48987220490ca2eb1f78f2`.
- Source tree: `59a5d23eb348fba7c90001e62aa9497b78d1dfe1`.
- Playable prototype CI #6: run `35209514589`, push event, exact source SHA matched, last observed `in_progress`.
- Do not create another gameplay candidate or rerun historical CI #4. Read CI #6's first terminal result and its artifacts next.
- This checkpoint commit changes documentation/evidence only and does not replace the source SHA under validation.
- Local candidate package was assembled, but is not an accepted CI artifact: `chrono-hd2d-fair-v0.2-candidate.zip`, SHA-256 `21ca0a1075e43e7f711ea8b8c834130b1ead2b0692c442d5e609895101ee6fc6`.
- Local verification details and all 12 source blob comparisons: `docs/evidence/fair-local-checks.json`.

## Scope and governance

KartChang/ChronoTrigger_reMaster, private, development on main. User selected HD-2D, fastest-to-play priority and two-player control. Browser TypeScript + Babylon.js, local shared-screen cooperation, ATB. Real-time ARPG conversion, network play, public hosting and native distribution are not approved changes. Do not import GauAI or IoT Colony workflows.

ROM and uploaded reference archives have not been extracted, committed or bundled. The game has no ROM or server dependency. No public deployment or visibility change.

## Accepted baseline — CI #5

Source `f46cd72abf23757f76d48ea2b54efc06f69b3561`; previous docs `b1af7a6707e160ba7872e21143ae6b747ed53744`.
Run `35205557064`, completed **success** on 2026-09-17. Core tests 32/32, strict TypeScript/build and 13 Chromium checkpoints passed. Report contains no runtime errors. This closes the inherited ATB wall-clock timeout root.

- Playable artifact `10489832940`, chrono-hd2d-playable, SHA-256 `fddf1f8bb53c327224ccf7caf375981378d766b83b2cfb9203ceaeb4afcfc05d`.
- Evidence artifact `10490261174`, SHA-256 `8272b9b7742ede2bc4c7ef930e3d3d40d14300e8e317d6cc790ba23e7181cc4b`.
- Actual screenshots inspected. Village is an original placeholder, not Chrono Trigger scenery. Actor bloom/readability needed improvement. Software GPU FPS is not hardware certification.
- Accepted 0.1 standalone package delivered to the user. It does not contain the new fair slice.

## New source batch — prototype 0.2

- Added an authored Millennial Fair blockout, bell arch, striped stalls, Gato robot, Lucca and two telepod platforms. Layout is compressed/rearranged, not extracted or an exact original map. Pixel character proxies and geometry are hand-authored code, not ROM assets.
- New title-screen solo/co-op fair entries; preserved original lab entries and regression tests.
- Walk-up bell/candy/Lucca dialogue, optional Gato challenge, conditional short-range telepod. Starts after Crono/Marle have met. Pendant accident, time gate, 600 AD and full opening chapter are NOT implemented.
- Reused ATB and atomic two-player combo. Gato is one opponent with prototype HP 120; all combat numbers and generic combo remain prototype values.
- Fair stalls share rendering/collision data. Other scenery and companion steering remain simplified; no full navigation mesh or A*.
- Fair save v2 validates chapter, era, event prerequisites and coordinates; lab v1 loads unchanged. Separate IndexedDB keys prevent cross-chapter overwrite. JSON import/export remains available.
- Reduced excess ambient lighting and limited glow to selected lights; actual visual acceptance awaits new screenshots.
- CI preserves exact tracked source in evidence, then runs unchanged lab browser journey and new fair journey. No downloaded fonts, ROM or user archives included.

## Validation performed for this batch

- Local core tests **53/53 passed**: all 32 original tests byte-preserved, plus 21 fair tests including a full walking route under six-tick observation intervals.
- Exact repository strict tsconfig restored; TypeScript/build passed. Standalone HTML about 5.11 MiB.
- Python syntax compilation of fair browser harness passed. New browser journey is not counted as passed yet.
- All 12 published executable/style source blobs matched the tested local files exactly before commit.
- Existing pinned dependencies retained. Local registry lookup was unavailable; recovered the authorized existing bootstrap artifact instead. No dependency/lockfile changes.
- Local Chromium did not establish a successful navigation/render. No policy bypass attempted; GitHub-hosted Chromium is the browser acceptance environment.

## Next action

Read exact CI #6 `35209514589`. If queued/in_progress, preserve this checkpoint and report instead of polling indefinitely. If failure, inspect first failed step and report/screenshots; retain gameplay assertions and fix the actual root. If success, inspect fair screenshots, retrieve the 0.2 playable artifact, verify build source SHA and persist artifact IDs/digests. Exact tracked source tar.gz inside evidence provides the complete checkout for future sessions.

Then improve scene proportions/readability and movement animations, implement the missing opening-event chain and a connected next map, and add target selection, companion pathfinding, original-rule/source verification and inventory/progression in coherent playable increments. Do not call this short blockout a complete remake.

## Remaining limitations

No full original story/music, verified original numerical rules, original asset extraction, final art, equipment/inventory, third party member, online multiplayer, native apps or physical mobile/gamepad certification. Two-player control is local; shared touch input is P1-only. Viewport tests do not certify physical devices. Runtime step caps make simulation slower at extremely low rendered FPS; CI is not performance acceptance.

Dynamic progress only here; stable map in CODEBASE.md. Persist source/evidence/checkpoints in GitHub; /mnt/data is temporary. Material scope changes require user confirmation; ordinary reversible implementation within this scope can continue directly.
