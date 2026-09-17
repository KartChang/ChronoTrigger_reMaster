# Opening 0.3 — authoritative handoff

## Scope / repository

User: HD-2D, quick playable builds, local two-player control, original feeling. Current runtime TypeScript + Babylon.js + esbuild; ATB retained. Do not mix GauAI or IoT Colony governance. Main is the active development line.

Fresh GitHub metadata on 2026-09-17 reports repository visibility PUBLIC. Previous documents said private; that statement is stale. This batch did not change visibility, enable hosting or deploy Pages. No ROM, original soundtrack, extracted assets, credentials or raw conversation attachments were committed.

## Last accepted baseline

- Main at handoff: f7c4018daca38ec822541ac43fce3c4d5d36bb3f (documentation).
- Accepted source: 8f02f652bbc756a46c48987220490ca2eb1f78f2.
- CI #6 / run 35209514589: completed SUCCESS.
- 53 unit tests, strict TypeScript/build, 13 original browser checks and 8 fair checks passed; no browser errors in reports.
- Evidence artifact 10491985106; SHA256 bb0cafcb6d91f21c456ad5c46f2b371762a9dfe3e78c69b67e248393d30243d3.
- Playable artifact 10491815785; SHA256 2963a57c54ac679bed2b12b5d034173ab8df8d4fd9014e80c6ed88977d90c649.
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

## State

OPENING 0.3 IMPLEMENTED — NEW BROWSER ACCEPTANCE PENDING.

Once this batch is committed, query its exact source SHA/run. If still queued/in_progress, record checkpoint and return rather than waiting until conversation interruption. A local candidate ZIP is not the successful CI artifact. Update this file with the actual source and run after publication.

## Next work

1. Inspect exact CI result and opening-report.json; fix only the first genuine failing step. Review actual new fair/canyon screenshots before calling art accepted.
2. Connect canyon to a coherent Truce/Guardia route and story continuation; preserve who is actually present. No fake remote town/castle completion.
3. Improve remaining model silhouettes, camera framing, walking/attack animations, target selection and authored battle effects; art is not final.
4. Add inventory/progression and audio through explicit content/provenance work; no ROM distribution.
5. Physical desktop/controller testing, then mobile/touch/packaging. Not certified by software GPU CI.

Current work and checkpoints live here. Stable module map in CODEBASE.md. Source is in GitHub, not only /mnt/data.
