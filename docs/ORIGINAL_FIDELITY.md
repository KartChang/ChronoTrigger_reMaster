# Original-game fidelity contract — T02 / 2026-09-18

Goal: a complete, browser-first HD-2D reconstruction, evidence-backed quality >=90, with local two-player support as an explicit adaptation. This is not an ARPG conversion. The full game is not accepted or scored by this document. No ROM was read or extracted.

## What was actually researched

Baseline: 1995 SNES presentation and controls, not a mix of modern-port UI screenshots. Primary material reviewed for this batch:

* SNES instruction booklet U/SNS-ACTE-USA, public transcription: https://www.world-of-nintendo.com/manuals/super_nes/chrono_trigger.shtml . Pages 16–17 distinguish full-scale Field from miniature Map: approaching a destination displays its name; A confirms entry. Pages 64–69 establish mother waking Crono, visiting houses, the fair encounter and telepod. This is a third-party transcription of the manual, not a verified ROM event dump. Its incidental captions are not treated as exact event data.
* Original bedroom image reproduced at https://pbs.twimg.com/media/Ez1TVFhVUAMJq6W.png (CRT Pixels, https://x.com/CRTpixels/status/1386355893542039558), viewed in image search: wooden boards, bright curtained north window, books/workspace left and right-side bed. The photographed/emulated comparison is not a pixel-color calibration standard.
* Displayed 1000 AD map image https://i0.wp.com/www.kaoticsilence.com/chronotrigger/map1000AD.jpg : landscape/destination scale, sea separation and compact settlements. Labels are an external annotation, not runtime HUD evidence.
* Developer interviews, translated at https://shmuplations.com/chronotrigger/ : same-scene battle presentation and deliberate setting-specific art. The 1994 pre-release interview is not proof every proposed system shipped. No claim of having watched every original traversal or reverse-engineered the original engine.

Only reference URLs and observations are stored. Original reference PNGs, music, ROM and font bytes are not bundled. Existing `assets/reference-index.json` remains the shared visual-reference index.

## Rules translated into this batch

| Original distinction | Implementation | Verification / remaining gap |
|---|---|---|
| Map versus field | `overworld1000` has miniature characters/buildings, a separate camera span and land/building collision; home and fair use field scale. | Pure rules and real browser route required. This is a regional map, not the complete original 1000 AD geography. |
| Confirm destination | Name appears near home/fair; E is A's interaction equivalent. Walking past does not enter automatically. | Prologue browser journey checks name, unchanged map before E, and destination afterward. |
| Interior connectors | Bedroom stairs and lower-floor stairs are walking triggers; exterior door uses E. Fade and input boundaries prevent held input leaking into the destination. | Rule test simulates the production InputBoundary; browser uses actual held keys. |
| Waking and first meeting | Mother/window opening, separate bedroom/lower floor, collision, dropped pendant, return choice, invitation choice. | No preassigned second companion. Two real paths record helping Marle first versus taking the pendant first. |
| Optional fair activity | Solo Gato remains possible before Marle. | Unit journey wins through normal ATB commands; not a newly invented compulsory encounter. Reward economy remains a T04 gap. |
| Battle presentation | Reuse existing in-place ATB, targeting and co-op confirmations. | No new battle renderer, ARPG clock, fabricated win flag or weakened old assertions. |
| Persistent consequences | v6 records only witnessed opening facts, retains them across existing v3–v5 chapter logic; legacy v1–v5 remains unknown. | These facts are not a manufactured trial verdict. Exact juror rules and other fair choices belong to researched T03 work. |

Fresh entry: `#start-story` / `#start-story-coop`. Existing `#start-fair`, `#start-fair-coop`, lab and old save entry points are retained. Early P2 setting means waiting for a companion, not an invisible playable Lucca before her story introduction. Established fair-checkpoint Marle and later Lucca ownership are unchanged.

## Fidelity gaps that remain open

Current fair and 600 AD routes are compressed reconstructions, not the original multi-screen topology. The existing Truce hub is not proof that original towns work like a generic hub. Full overworld adjacency, all houses/shops, camera framing at every resolution, dialogue staging, original enemy movement/range, complete tech progression and authentic encounter numbers remain unaccepted. Home props/NPC art are authored approximations, not final character art. The bedroom's exact dimensions, event timing and portrait/naming interface are not fully reproduced. Sound remains limited prototype effects; no original soundtrack is present.

The wider story must preserve era-specific geography, people and consequences; existing `era` and event flags are foundations, not a claim all eras, quests or endings exist. T03–T07 remain open. Do not convert this reference pass into an overall quality score.

## Quality gate

The previous 30-point score is bound to an older runtime. It is neither this batch's score nor a completion percentage. Keep the existing release gate blocked until matched-source screenshots, actual playthroughs, original-reference comparisons, content completeness and physical-device findings support the required score. Do not gain points by hiding the above gaps, excluding remaining chapters or treating a concept poster as gameplay.
