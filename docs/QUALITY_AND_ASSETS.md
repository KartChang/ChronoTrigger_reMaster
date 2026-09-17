# Quality 90 gate and asset-production contract

## Honest baseline, 2026-09-17

Before this batch the project had unit/browser checks and some screenshot inspection, but no numerical, evidence-bound 90-point release gate. Those checks did not establish high-fidelity art or a finished remake.

The provisional developer assessment of source `4e9a3c8750c192e731ac7b9421c37f66f0bb9b93` is **30/100**, not a player rating or percentage of game completed. The actual visual baseline inspected is CI7 artifact 10493917525 (`opening/01-classic-fair.png`, `opening/05-canyon-battle.png`); the current CI8 artifact 10495481982 exposes an input failure before the kingdom journey. Unseen kingdom screenshots are not rated as seen.

| Dimension | Weight | Baseline | Deficit |
|---|---:|---:|---|
| Original visual identity / HD-2D scene quality | 25 | 8 | Simplified pixel figures; repetitive ground; box-shaped architecture; no approved art kit |
| Battle, motion and techniques | 20 | 7 | Simplified ATB, nearest-target attacks, generic values/effects; no complete techniques or three-character party |
| Story and world | 20 | 5 | Partial compressed opening; no complete original opening, cathedral rescue or subsequent eras |
| Music and audio | 10 | 0 | Oscillator cues only; no approved soundtrack or sound library |
| Controls and cooperation | 10 | 4 | Existing co-op but confirmed held-input regression; physical controllers unverified |
| Save, correctness and reliability | 10 | 6 | 109 baseline unit tests; exact 0.4 browser journey failed before kingdom |
| Performance and target devices | 5 | 0 | No target-hardware frame-time, loading and memory evidence |
| Total | 100 | 30 | Not accepted |

`quality/scorecard.json` is a dated assessment bound to source and runtime digest. It is not a second live TODO. Dynamic progress stays in STATUS.md. Code changes do not automatically raise scores: the old review becomes stale and must be followed by fresh source-matched evidence.

Release requires at least 90 overall, at least 80% of each dimension, no unresolved critical blocker, all five gates (browser, visual, hardware, content, rights/use clearance), and all required asset groups approved with evidence. Missing/untested is not a pass. A high average cannot conceal absent music, broken saves or unfinished story. The scope remains the whole remake; a separately reviewed small scene is not the whole game.

Commands: `npm run check:quality` validates/report the review while allowing development; `npm run release:check` exits nonzero while any release condition fails. This is an explicit release-preflight guard, not proof of quality or an already deployed release service. CI success artifacts remain development playables, not a 90-point endorsement.

## First real regression fixed in this batch

CI8 `35216792204` failed at first held-key movement: P1 x=-0.6, 79 simulation ticks, not paused. The previous render callback compared `lastPhase` after simulation and cleared Controls; starting in lab from the default fair changed that key. A new key could move for one frame, then be erased despite remaining physically held. Increasing timeout cannot fix this.

InputBoundary is rebased synchronously on start, load/import and dialogue-triggered state changes. Simulated transitions invalidate input once and end the old-input substeps. Existing browser movement/ATB assertions and all four browser journeys are unchanged. Seven regression tests include reproduction without rebase and continued held movement with it.

## Asset production: one polished kit before more placeholder chapters

Do not make every asset for the entire game up front. First establish one exploration scene and one battle using the same art direction and runtime, then approve and reuse that kit. Priorities are character scale/silhouettes and full animation sheets, terrain/architecture/props, HUD and portraits, technique timing, then audio loops and mixing. Scene/animation/audio validation must use actual gameplay captures, not promotional images.

The previously generated concept poster is not an engine screenshot or source of original story facts. In particular, 600 AD is earlier than 1000 AD; labels suggesting “600 years later” must not enter game requirements. Its composition is aspirational, not evidence that present graphics already match it.

Deliverable contracts:
- Characters: transparent PNG atlas + JSON frame rectangles, direction, duration, foot pivot and named clips. Current native prototype cells are 24x32, foot pivot (12,31); this is a project convention, not a verified original ROM specification. Attack/cast/hurt/down/victory remain required.
- Scenes: authored 3D modules/materials with consistent texel scale, coordinate origin, collision and occlusion data; glTF is the planned interchange, not an implemented generic importer.
- UI: independent scalable frames, portraits, icons and fonts with a known usable license. Do not export a screenshot with baked-in UI and call it a playable scene.
- Audio: approved source, loop boundaries, transition/mix rules and file-level provenance. Original music has not been extracted or cleared.
- Every group has stage (missing/prototype/review/approved), source, evidence and unresolved gap in assets/manifest.json. Generated does not mean approved.

## The export pipeline now implemented

`npm run assets:export` bundles the same hand-authored pixel functions used at runtime and exports **8 PNG sheets / 53 frame records** to `dist/art`, with JSON metadata, hashes and source provenance. Crono, Marle and Lucca each have 4 directions x 4 timed walking frames; the cycle has three distinct poses, with phases 0 and 2 repeating. Imp, tree, resident, guard and king supply the other five images. The runtime walking cycle now alternates both strides.

The exporter uses a restricted integer rectangle surface and a small lossless PNG encoder, not a fake full Canvas implementation. Tests validate color/alpha, rejected inputs, PNG decoded scanlines, exact exported frame pixel parity and deterministic bytes. No new package dependency, external image request or ROM is required. CI retains a separate `chrono-hd2d-art-review-kit` even if later browser acceptance fails.

These are editable **prototype exports**, not newly completed high-fidelity art. The runtime still uses the shared authoring functions; external Aseprite PNG import and 3D source-asset editing are not yet implemented. The next visual iteration must replace the underlying art deliberately, not advertise this repackaging as final quality.

Official format references consulted:
- Aseprite sprite sheets: https://www.aseprite.org/docs/sprite-sheet/
- Aseprite CLI: https://www.aseprite.org/docs/cli/ (PNG + JSON, tags, durations and padding workflow)

## ROM boundary and optimal use

A ROM is not necessary to run the remake or build HD-2D assets. For faithful reconstruction, explicitly identified original-version screenshots, recordings, manuals and optionally locally inspected data are better references than inventing details. A ROM does not supply new HD-2D 3D architecture, lighting, model materials or modern camera design.

The supplied ROM was **not opened, extracted or bundled in this batch**. Its exact revision/translation layout and extraction compatibility are unverified. Do not promise an automated extractor or assume a named tool supports this file. A future extraction task must first establish version/hash, the exact data sought and its use boundary; reference-only results stay outside public source/artifacts. No need to extract the whole ROM before continuing gameplay or original production assets.

Generated concepts can help establish direction, but consistent animation, transparent edges, pivots, tile continuity and engine integration still need production and review. The preferred route is reference alignment → small asset kit → engine integration → actual stills/motion review → correct gaps → expand. Full-game gaps remain open until actually implemented and evidenced.
