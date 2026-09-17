# Kingdom 0.4 — authoritative handoff

## Current batch

**KINGDOM 0.4 IMPLEMENTED — EXACT CI BROWSER ACCEPTANCE PENDING.**

Published source: **4e9a3c8750c192e731ac7b9421c37f66f0bb9b93**.
Source tree: **03ea9440edbee54ebe92a97e7e3bc366a58c561e**. Locally staged git tree exactly matches the connector-created tree for all 18 changed paths and retained source. Non-force fast-forward from c7cbc76366a131b42df49280e065c67ef6b15f4b.

Matching CI #8 / run **35216792204**, push event, **in_progress** at last query. Only one exact-SHA run was returned. Do not claim new browser acceptance until this run completes successfully. This documentation-only handoff is not another gameplay candidate.

Starting accepted source was 4cf5842252b1ea5a44ae38be017ee3593a774567. This batch continues the opening; it does not redo it.

Repository KartChang/ChronoTrigger_reMaster, main active. Browser TypeScript/Babylon/esbuild, HD-2D, ATB, local co-op, fast playable delivery. Current GitHub run metadata reports public; no visibility change, deployment, Pages, paid services or ROM distribution performed. Do not import other-project governance.

## Accepted prior checkpoint

CI #7 / run 35213238793: completed SUCCESS, exact source 4cf5842252b1ea5a44ae38be017ee3593a774567. Evidence 10493917525, SHA256 851d9b30196f6ccf18643c5b22ef9d9b0b2639c8edea5db2be26bf1cf686303f; playable 10493942481, SHA256 3f582b00a78454684ab5183124223d7a5e13bb23ae1e9945f9c649ba9e92885c.

Downloaded evidence source archive for local development; no git/network credentials used. Reports passed: 13 lab, 8 fair, 7 opening checks, no reported browser errors. New opening fair/canyon screenshots actually inspected: better scene-visible blue dialogue and pixel silhouettes, still very simplified ground/architecture and not final art. Do not rerun CI7 as a separate historical verification.

## New work

Four lazily constructed scenes: Truce town, Guardia Forest, castle hall and queen chamber. Town resident/year, exterior inn rest, separate forest encounter/victory, guard admission, physical room transition, Marle NPC disappearance, explicit Lucca join, restored P2 control and backtracking to cathedral direction. Cathedral interior remains absent.

v4 saves with phase/era/map/flag/actor validation; v1-v3 retained. Shared adventure slot unchanged. Basic attack lunge and slash/spin visual effects added without changing damage/MP/ATB numbers. No original ROM/music/assets read or extracted.

## Local evidence

- 109/109 units passed (79 inherited unchanged + 30 new kingdom).
- Strict TypeScript, asset-extension guard, standalone build passed (~5.15 MiB).
- New kingdom_browser.py syntax check passed; old three browser scripts unchanged.
- New browser test uses the real same-run opening v3 export, then real keys/buttons/import/save/reload. No fabricated start state.
- Local default Playwright executable absent; normally launched /usr/bin/chromium rejects file:// with ERR_BLOCKED_BY_ADMINISTRATOR. Not a local browser pass. No policy workaround.
- Details and fidelity limits: docs/KINGDOM_SLICE.md. Local command evidence: docs/evidence/kingdom-local-checks.json.

## Delivered local candidate

Filename: chrono-hd2d-kingdom-v0.4-candidate.zip, 1,218,565 bytes.
ZIP SHA256: 77b16050aeebf5f6dec391260f647cca3e142a95fae73683d08f86b3d7fc979e.
HTML SHA256: 267f09edfe7e4e91777fd7cd8b942a0d984872d720439447cbd93eaccb8ed823.
Build metadata records the exact published source SHA and version 0.4.0. Package contains standalone HTML, third-party notices/license, validation status, checksums and Chinese route/control/save-import instructions. ZIP integrity checked. It is a candidate, not a successful CI artifact. Container copy is temporary; rebuild from exact source if unavailable.

## Next exact action

Read CI #8 / 35216792204 for source 4e9a3c8750c192e731ac7b9421c37f66f0bb9b93. Do not dispatch a duplicate run or use this docs-only commit as a source candidate. Never mark new browser or artwork accepted from unit tests alone. If queued/in_progress, preserve checkpoint and report rather than polling indefinitely. On failure inspect the first actual failing step and lastObserved; do not weaken existing assertions or keep guessing at waits.

After success: inspect kingdom screenshots and artifacts; fix any visual/navigation issue revealed. Then continue cathedral/Frog/queen-rescue story with party ownership rules, followed by inventory/progression and proper authored technique/audio pipeline. The currently playable route ends at the forest's westward cathedral marker, not inside a completed dungeon.

This is the only dynamic status file. Source and exact CI evidence live in GitHub; temporary container paths are not permanent state.
