# CI16 actual-screen review — 2026-09-18

Source `490218402b493cc69296c5de4afa278be7471223`; run `35328892846`. **Run failed; no whole-batch acceptance.** Evidence is the actual browser PNGs/reports, not exported atlas previews or material flags. Original screenshots remain in the four CI ZIPs listed in CI16_TERMINAL.json.

## Inspected actual scenes

- `keyboard/01-home-keyboard.png`: home interior, mother and player are visible; floor, furniture, control toolbar and interaction prompt appear. Keyboard report confirms title/solo arrow/stair/mother Enter/WASD/help flow and canvas focus `world`. This does not certify a physical keyboard.
- `keyboard/02-idle-first.png` and `03-idle-next.png`: actual fair scene, player and NPCs on screen. Report independently observes idle/NPC frame changes and pause freeze; the two stills alone do not prove complete animation quality.
- `keyboard/04-ready-battle.png`: actual Gato encounter; P1 ATB shows READY, P2 companion gauge and target controls are visible. Player and companion feet have dark grounding shapes. Battle panels remain readable at this captured 1200×800 viewport. This is not a whole-roster/full-camera review.
- `keyboard/05-after-import.png`: gameplay resumed with player/companion visible and UI import feedback. Corresponding report checks a real same-journey exported file, native chooser, `world` focus and subsequent movement. Victory Enter/return is a passed keyboard report check, not a separately supplied victory screenshot.
- Good and bad `05-hearing-0.png`: actual court platforms, judge, guards/witness positions, dialogue and confirm button are present. Good verdict text and bad contradictory testimony are distinct. Court camera is pulled back, so character facial detail is small. Full original geography/detail and all-stage animation remain open.
- Bad `06-guilty-cell.png`: actual cell, bed, guards, player and route prompt are visible; does not certify the skipped separate trial/prison/tank browser step.
- `rescue/failure.png` inspected at original resolution: chest, overlapping P1/P2 at its right edge, Frog to their right, and visible `E・木箱`. Positions in lastObserved agree with collision blockage. This is failure evidence, not successful arrival at the requested test coordinate.

## Limits retained

Readable captured screens and successful keyboard checks do not establish final art approval. Repeated floor patterns, sparse set dressing, mixed NPC detail and compressed map layouts remain visible. Static screenshots do not establish animation fluidity, audio, input latency on hardware, or whole-game >=90 quality. No numerical score is assigned. No ROM/image/audio/font extraction is used. The old 30-point review is stale; it is not a new assessment.

CI16 has no playable artifact because validate failed. No claim that 0.8.2 is deployed. Matching successful CI artifact/deployment.json/HTML hash closure remains pending after the repaired batch passes all three jobs.
