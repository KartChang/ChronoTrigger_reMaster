# Kingdom 0.4 — authoritative handoff

## Current batch

**KINGDOM 0.4 IMPLEMENTED — EXACT CI BROWSER ACCEPTANCE PENDING.**

Starting HEAD c7cbc76366a131b42df49280e065c67ef6b15f4b (docs), accepted source 4cf5842252b1ea5a44ae38be017ee3593a774567. This batch continues the accepted opening; it does not redo it.

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

## Next exact action

After publishing this source batch, query its exact SHA and record CI run. Never mark new browser or artwork accepted from unit tests alone. If queued/in_progress, preserve checkpoint and report rather than polling indefinitely. On failure inspect the first actual failing step and lastObserved; do not weaken existing assertions or keep guessing at waits.

After success: inspect kingdom screenshots and artifacts; fix any visual/navigation issue revealed. Then continue cathedral/Frog/queen-rescue story with party ownership rules, followed by inventory/progression and proper authored technique/audio pipeline. The currently playable route ends at the forest's westward cathedral marker, not inside a completed dungeon.

This is the only dynamic status file. Source and exact CI evidence live in GitHub; temporary container paths are not permanent state.
