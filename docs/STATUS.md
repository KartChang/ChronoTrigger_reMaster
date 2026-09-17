# Pages + companion navigation 0.5.1 — current handoff

**DEVELOPMENT PREVIEW — WHOLE GAME NOT COMPLETE OR 90-POINT ACCEPTED.**

## Authority entering this batch

Parent main HEAD 827ff432a071b370d0a82a349e1e45e98925afe8. CI10 35228818759 at source b2bd930e1a552b6f20ee8cfd5c49c3b60e4ecd8c completed **success**. Its five real browser journeys passed 42 checkpoints: 13 lab, 8 fair, 7 opening, 8 kingdom, 6 reference art/targeting. 163 inherited unit tests were passing.

Evidence artifact 10501165019 SHA256 c6572296834cb9f96a24f0369900bf825a50773b4d2df7d41b41d865cabdcaa9 downloaded; source restored from its exact tar.gz. Actually inspected reference/02-reference-fair.png and kingdom/02-forest-battle.png: still simplified art and repetitive surface texture, no final art approval. Previously missing reference/kingdom acceptance is now closed for b2bd930 only.

Validated playable artifact 10501060260 SHA256 07c331b3773cb6c73bebcc0fdb12756cd5e61417e7a3388807d7193cc8f672cd. Exact HTML SHA256 bcd838064d3eacfc946d5a70ebd8a132609da571d8fd6b6fa6af04f96819c7c2, 5,408,589 bytes, version 0.5.0. This is the eligible initial Pages demo, not the new runtime before its CI completes.

## User-approved Pages showcase

User explicitly requested Pages exhibition. Added a separate public launcher, stable play/ path, save-transfer instructions, version/CI/source disclosure and a validated-artifact-only deploy workflow. No public game deployment existed on inspection (`has_pages:false`). Existing connector does not expose a Pages-admin write action. GitHub's configure-pages documentation explicitly excludes GITHUB_TOKEN from first-time enablement; do not request/extract user credentials or keep retrying creation with unsupported permissions.

The user needs to choose Settings > Pages > Source = GitHub Actions once, then Actions > GitHub Pages preview > Run workflow. The workflow detects enablement, stages a verified package, reports the exact missing setting and skips deployment while disabled. A green prepare job is NOT a live site. On enablement it uploads/deploys and verifies public HTTP HTML bytes. Future successful main CI updates the preview automatically; failed candidates cannot replace it. No changes to repo visibility or custom domain.

No ROM read/extraction, copied original image bytes, soundtrack or new third-party font is included. Public demo remains nonofficial, unfinished and distinct from 90-point product release. Current content is still the opening/kingdom slice, not the complete game.

## Gameplay change

Replaced direct-line solo following with deterministic bounded grid A* using the exact existing collision function. Routes avoid diagonal corner cutting, replan on map/goal changes, cache failed routes briefly, and never teleport. Joined P2 remains manually controlled. Absent story companions stay absent. Transient follow data is reset at join/battle/state reload and excluded from all v1-v4 save formats. No change to story, battle damage, MP/ATB or player speed. This addresses a known full-game movement foundation gap; no new cathedral chapter is claimed.

Added a sixth browser journey: real key movement puts P1 and P2 on opposite sides of the lab house, P2 drops out, the follower must walk around the solid house without teleporting/moving P1, then manual P2 ownership is restored. Five inherited browser scripts remain unchanged.

## Local validation

195/195 unit tests passed: 163 preserved + 15 navigation + 17 Pages package tests. TypeScript, asset guard, build (~5.16 MiB), Python compile and workflow YAML parsing passed. Actual CI10 artifact was staged successfully with byte-identical play/index.html and deployment proof. Old five browser scripts and original test files preserved byte-for-byte.

The local Playwright package has no matching Chromium executable; navigation browser launch failed before any page opened. No local browser pass, policy bypass or hardware performance claim. Existing pinned toolchain artifact 10487690665 was reused for build dependencies only, without modifying package versions/lockfile or executing install lifecycle scripts. New runtime must pass its matching CI before becoming the hosted build.

Quality score remains a dated 30/100 baseline, stale after changes. No numeric increase based on tests; release gate continues to reject. Complete story, final assets, audio, hardware and full-game systems remain open.

## Next exact actions

1. Read the matching new CI and Pages runs after publication. Do not dispatch duplicate full CI or poll indefinitely. Pages disabled is an explicit setup blocker, not a game test failure. Preserve final SHA/run and actual URL separately.
2. If new navigation browser fails, inspect its report/positions first and fix the actual root without weakening old tests. On success verify motion/collision screenshots; deployed preview must identify that exact source.
3. Continue reference-based art/asset import, authored skill choreography and audio; cathedral/Frog/queen rescue, true initial opening, inventory/equipment/progression, remaining eras and endings stay in scope. No claim the game's complete because the demo is online.
4. Keep testing true save reload, physical input and target device performance. Live progress only here; contracts in docs/PAGES.md, AGENTS.md and CODEBASE.md. All source/checkpoints in GitHub; /mnt/data is temporary.
