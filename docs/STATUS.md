# Opening 0.3 — authoritative handoff

## Current exact checkpoint

**OPENING 0.3 IMPLEMENTED — CI #7 BROWSER ACCEPTANCE IN PROGRESS.**

- Source commit: `4cf5842252b1ea5a44ae38be017ee3593a774567`.
- Source tree: `0b0093f47917213f35089f312a2b034ca5e04913`.
- Playable prototype CI #7: run `35213238793`, push event, exact source SHA matched, last observed `in_progress`.
- This checkpoint update is documentation-only; it does not replace the source candidate or authorize another parallel validation.
- Candidate delivered: `chrono-hd2d-opening-v0.3-candidate.zip`, SHA256 `b25c668d8b4de2c1aa697650c729e0fc9c7678d6cddb6ccbfb4ba47cd1b03f15`.
- Candidate build-meta records the exact source SHA and version 0.3.0. HTML is 5,377,675 bytes, self-contained. Candidate is not an accepted CI artifact.
- Read the exact CI #7 result next. If still queued/in_progress, report the checkpoint instead of polling indefinitely.

## Scope / repository

User: HD-2D, quick playable builds, local two-player control, original feeling. Current runtime TypeScript + Babylon.js + esbuild; ATB retained. Do not mix GauAI or IoT Colony governance. Main is the active development line.

Fresh GitHub metadata on 2026-09-17 reports repository visibility PUBLIC. Previous documents said private; that statement is stale. This batch did not change visibility, enable hosting or deploy Pages. No ROM, original soundtrack, extracted assets, credentials or raw conversation attachments were committed.

## Last accepted baseline

- Previous main checkpoint: f7c4018daca38ec822541ac43fce3c4d5d36bb3f (documentation).
- Accepted gameplay source: 8f02f652bbc756a46c48987220490ca2eb1f78f2.
- CI #6 / run 35209514589: completed SUCCESS.
- 53 unit tests, strict TypeScript/build, 13 original browser checks and 8 fair checks passed; no browser errors in reports.
- Evidence artifact 10491985106; SHA256 bb0cafcb6d91f21c456ad5c46f2b371762a9dfe3e78c69b67e248393d30243d3.
- Playable artifact 10491815785; SHA256 2963a57c54ac679bed2b12b5d034173ab8df8d4fd9014e80c6ed88977d90c649.
- Accepted package: chrono-hd2d-fair-v0.2-ci6.zip. It does not contain the new opening/canyon.
- Screenshots actually inspected. Accepted functionality does not mean final art: old fair has oversized dashboard UI, blocky figures and low-poly canopies.

## Current batch

Opening 0.3: classic blue bottom dialogue, reduced exploration HUD, new outlined hero/imp pixel drawings and leafy billboards, more legible fair palette; scripted Marle platform/pendant disappearance; ordered pendant pickup and pursuit; authored 600 AD canyon, lone Crono encounter, slice boundary and versioned v3 saves.

The main story route starts after the initial meeting, not at Crono's home. Fair/Gato co-op remains. Marle is genuinely inactive after disappearance; P2 spectates and has no phantom attacks/HP target. No later party reunion exists yet. Read docs/OPENING_SLICE.md for fidelity limits, references and implementation scope.

## Local verification

- 79/79 unit tests passed: inherited 53 unchanged + 26 new opening tests.
- Strict TypeScript, asset-extension guard and standalone build passed (~5.13 MiB).
- Existing core/fair unit and original/fair browser test files kept byte-for-byte. No dropped assertions or relaxed gameplay numbers.
- All 16 changed executable/style/test/CI blobs were read back from Git trees and matched local Git blob hashes before commit. Details: docs/evidence/opening-local-checks.json.
- New tests/opening_browser.py compiles; it is not locally browser-accepted.
- Local managed Chromium rejects file:// with ERR_BLOCKED_BY_ADMINISTRATOR. No policy workaround attempted. Real browser/visual acceptance belongs to CI's standard Chromium.
- CI keeps all old journeys and adds opening_browser.py. One source batch, no parallel candidate.

## Next work

1. Inspect exact CI #7 and test-results/opening/opening-report.json; fix only the first genuine failing step, without weakening assertions. Inspect actual new fair/canyon screenshots before calling the art accepted. On success retrieve the playable artifact and verify build source SHA.
2. Connect canyon to a coherent Truce/Guardia route and story continuation; preserve who is actually present. No fake remote town/castle completion. This slice ends at the canyon exit.
3. Improve remaining model silhouettes, camera framing, walking/attack animations, target selection and authored battle effects; art is not final.
4. Add inventory/progression and audio through explicit content/provenance work; no ROM distribution. No original soundtrack or precise original numerical compatibility yet.
5. Physical desktop/controller testing, then mobile/touch/packaging. Not certified by software GPU CI.

Dynamic checkpoints live here; stable module map in CODEBASE.md. Source and exact evidence pointers are in GitHub, not only /mnt/data. Do not create a second gameplay candidate while CI #7 is still active, and do not rerun already accepted CI #6.
