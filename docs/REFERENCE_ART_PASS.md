# Reference-art pass 0.5 — implementation contract

The user approved optimizing against original game images and continuing the whole remake. This pass improves the existing fair exploration/forest battle presentation instead of expanding another low-fidelity placeholder chapter. Whole-game scope and missing systems remain open.

## Evidence and source boundary

The preceding exact source `18a99497450b31342ed3f02cd107cf23d8153670` passed CI9, run `35223217588`. Evidence artifact `10498366299` (SHA256 a1d7460a60ef940705ce42fc800cf01bee48e56c44d978525a6ce9bf7d801574) contains 36 passed checkpoints across four browser journeys. Fair, forest battle and Guardia hall screenshots were actually inspected. The review found broad repetitive ground, block-shaped props, generic figure proportions and little actual animation.

The original Leene Square/600 AD Guardia Forest assembled SNES images and Crono/Marle/Lucca/Gato reference images were visually inspected. Exact references, attribution, cues and limits live in `assets/reference-index.json`. This is visual observation of published original-game imagery, not a verified ROM-data extraction. No source image or ROM bytes are in this repository/artifacts. The supplied ROM remains unopened.

## Implemented

- Three slimmer, shaded character redraws retain the existing project-native 24x32 cell and foot pivot. Red hair/headband/scarf, ponytail/pale clothes and glasses/violet hair/helmet are differentiated. These are hand-authored drawings, not original pixel copies.
- Each hero has four-direction attack/cast/hurt/down/victory pose records and explicit clip durations. Scene resets clear presentation clips; pause freezes the same presentation clock. Dead active actors show a fallen pose, but absent story companions remain hidden and inactive.
- Actual combat events trigger attack/cast/hit poses. Renderer observation exposes bounded, cloned pose history for tests; it cannot mutate game state. Combat timing here is newly authored, not measured original timing.
- Fair: smaller weathered cobbles, bell garden, pale stone arch, bronze bell, curved striped awnings, counter goods and red vertical banners. Gato becomes a red rounded pixel machine rather than a blocky box. Static opaque details are merged by material to avoid one draw call per decorative box.
- Forest: cooler dark ground, narrow earth track, rooted tree silhouettes, irregular rocks/ferns rather than luminous cube vegetation. Existing compact collision and event routes are retained. Buildings in the other kingdom scenes still need their own reference pass.
- Closer adventure framing follows the party. No free camera or battle-rule change. Actual browser frames, not the exported contact sheet, must establish camera/occlusion quality.
- Independent P1/P2 previous/next target selection: P1 Q/R, P2 left/right square-bracket keys `[` and `]`, Gamepad LB/RB and per-player HUD buttons. Selection does not consume ATB/MP; an invalidated enemy falls back to the nearest living one. Default targets preserve the existing nearest-target behavior.
- No change to damage, MP costs, ATB speed, story route or v1-v4 save formats. Target indices and presentation poses are transient, never imported as trusted save fields.

## Asset deliverables

`npm run assets:export` now produces **15 PNG sheets/textures and 297 frame records**: three walk sheets (48), three combat sheets (240), six static sprites (6), and three surface textures (3). Four timed walking frames use three distinct poses; some combat frames deliberately hold a pose. Do not equate record count with unique original animation drawings.

PNG/JSON exports use the exact runtime drawing functions. Tests compare exported frame pixels to those functions, validate timing and deterministic encoding. All sheets are independently decoded with Pillow. Exports remain review assets; no external PNG re-import workflow, complete portrait set, audio library or final art acceptance is claimed.

## Verification and remaining work

The 133 inherited unit tests and four existing browser scripts are unchanged. New unit tests cover explicit targeting, inactive companions, stale targets, resource invariants, new route traversal, combat frames, pause/reset clocks, map orientation and surface determinism. A fifth real-browser journey exercises independent selection and actual attack/cast/hurt/victory presentation. It uses UI/keyboard only and cloned observations, not teleports or synthetic saves.

Local Chromium was attempted with its ordinary executable and refused file navigation with ERR_BLOCKED_BY_ADMINISTRATOR; no policies were changed. New browser acceptance is CI-only until confirmed for the exact new source.

The numerical 30/100 whole-remake baseline remains a frozen assessment of an older source and is marked stale after this change. CI9 closes the earlier held-input/browser blockers, but neither CI9 nor newly authored assets justifies silently raising visual or whole-game scores. New actual images still need review.

Next: inspect this source's screenshots/motion; repair any visual or runtime regressions; improve technique choreography and usable asset import; produce portraits/audio; then continue cathedral/Frog/queen rescue and full initial opening, inventory/equipment/progression and remaining eras. No new chapter or full-game completion is claimed by this pass.
