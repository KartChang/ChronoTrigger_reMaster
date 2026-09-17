# Prototype 0.2 — fair slice / current handoff

## Scope and governance

KartChang/ChronoTrigger_reMaster, private, development on main. User selected HD-2D, fastest-to-play priority and two-player control. Current implementation: browser TypeScript + Babylon.js, local shared-screen cooperation, ATB. Real-time ARPG conversion, network play, public hosting and native distribution are not approved changes. Do not import GauAI or IoT Colony workflows.

ROM and uploaded reference archives have not been read for extraction, committed or bundled. The game has no ROM or server dependency. No public deployment or visibility change.

## Accepted baseline — CI #5

Source `f46cd72abf23757f76d48ea2b54efc06f69b3561`; docs checkpoint `b1af7a6707e160ba7872e21143ae6b747ed53744`.
Run `35205557064`, completed **success** on 2026-09-17. Core tests 32/32, strict TypeScript/build and 13 Chromium checkpoints passed. Report contains no runtime errors. This closes the inherited ATB wall-clock timeout root; do not rerun historical CI #4.

- Playable artifact `10489832940`, chrono-hd2d-playable, SHA-256 `fddf1f8bb53c327224ccf7caf375981378d766b83b2cfb9203ceaeb4afcfc05d`.
- Evidence artifact `10490261174`, SHA-256 `8272b9b7742ede2bc4c7ef930e3d3d40d14300e8e317d6cc790ba23e7181cc4b`.
- Actual screenshots inspected. Village is an original placeholder, not Chrono Trigger scenery. Actor bloom/readability needs improvement. Software GPU FPS is not real hardware performance certification.
- Accepted 0.1 standalone package has been delivered to the user. It does not contain the new fair slice.

## New source batch — prototype 0.2

**FAIR SLICE IMPLEMENTED — NEW BROWSER ACCEPTANCE PENDING.**

- Added an authored Millennial Fair blockout, bell arch, striped stalls, Gato robot, Lucca and two telepod platforms. Map layout is compressed/rearranged, not an extracted or exact original map. Pixel character proxies and scene geometry are hand-authored code, not ROM assets.
- New title-screen solo/co-op fair entries; preserved original lab entries and regression tests.
- Walk-up bell/candy/Lucca dialogue, optional Gato challenge, conditional short-range telepod. The scene starts after Crono/Marle have met. Pendant accident, time gate, 600 AD and full opening chapter are NOT implemented.
- Reused ATB and atomic two-player combo. Gato is one opponent with prototype HP 120; all combat numbers and the generic combo remain prototype values.
- Fair stalls share rendering and collision data. Other scenery and companion steering are still simplified; no full navigation mesh or A*.
- Fair save v2 validates chapter, era, event prerequisites and coordinates; lab v1 still loads unchanged. Separate IndexedDB keys prevent cross-chapter overwrite. JSON import/export remains available.
- Reduced excess ambient lighting and limited glow to selected light objects; actual visual acceptance awaits the new screenshots.
- CI preserves exact tracked source in the evidence artifact, then runs the unchanged lab browser journey and new fair journey. No downloaded fonts, ROM or user archives are included.

## Validation performed for this batch

- Local core tests **53/53 passed**: all 32 original tests byte-preserved, plus 21 fair tests including a full walking route under six-tick observation intervals.
- Exact repository strict tsconfig restored; TypeScript/build passed. Standalone HTML about 5.11 MiB.
- Python syntax compilation of fair browser harness passed. New browser journey is not counted as passed yet.
- Existing pinned dependencies retained. Local network package install was unavailable; recovered the existing authorized bootstrap artifact instead. No dependency/lockfile changes.
- Local managed Chromium did not establish a successful navigation/render. No policy bypass attempted; GitHub-hosted Chromium is the browser acceptance environment.

## Next action

After publishing this source batch, query the exact push SHA's Playable prototype CI. Save the exact run in this file as a documentation-only checkpoint. If queued/in_progress, report that checkpoint rather than polling indefinitely. Do not claim the new fair playable artifact exists until both browser journeys succeed.

On failure: read the first failed step and its report/screenshots; keep gameplay assertions and fix the actual root. On success: inspect fair screenshots, deliver the 0.2 artifact and preserve exact artifact IDs/digests. The source tar.gz inside evidence provides the complete checkout for future sessions.

After acceptance: improve scene proportions/readability and movement animations, then implement the missing opening-event chain and a connected next map. Add target selection, proper companion pathfinding, original-rule/source verification and inventory/progression in coherent playable increments. Do not stop at a generic village or call this short blockout a complete remake.

## Remaining limitations

No full original story, original music, verified original numerical rules, original asset extraction, final art, equipment/inventory, third party member, online multiplayer, native apps or physical mobile/gamepad certification. Two-player control is local; shared touch input is P1-only. UI viewport tests do not certify physical devices. Runtime step caps still make simulation slower at extremely low rendered FPS; CI is not performance acceptance.

Dynamic progress only here; stable map in CODEBASE.md. Changes to material scope require user confirmation; ordinary reversible implementation within this scope can continue directly. Never rely on /mnt/data as permanent project memory.
