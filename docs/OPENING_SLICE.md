# Opening 0.3 — fidelity and scope

## Direction

User requested the original feeling, not just another generic demonstration scene. This slice keeps the same TypeScript/Babylon runtime and ATB rules, but replaces the adventure dashboard presentation with a restrained blue bordered dialogue window. Exploration hides combat meters and actions; no full-screen blur hides the scene behind dialogue.

Hand-drawn pixel helpers distinguish Crono's red hair, band, scarf and boots, Marle's ponytail and pale clothes, small blue-green imps and layered leaf clusters. Fair grass/stone colors and the bell surround are refined. The new canyon uses shared rock footprints for collision and rendering. These remain authored reconstruction assets, not final art or original sprite sheets.

## Actual implemented route

Fair post-meeting checkpoint -> talk to Lucca -> normal short-range demonstration -> return to Lucca -> Marle volunteers and walks to platform -> pendant resonance -> Marle disappears -> Crono picks up pendant -> separately chooses to enter -> 600 AD canyon -> three-imp prototype encounter -> walk south to the current slice boundary.

The canonical event outline is supported by Square Enix's official game description: https://www.square-enix-games.com/en_EU/games/chrono-trigger (checked 2026-09-17; search-index text exposes the story while the fetched regional page can return only its shell). This is a plot-outline reference, not proof of exact original map layout, timing, dialogue or damage formulas. Earlier fair visual sources remain in docs/FAIR_SLICE.md if present.

All dialogue is newly phrased, shortened reconstruction. No original ROM, script, soundtrack or downloaded sprite sheet was read, extracted or included. A supplied ROM is not a source project for the 3D scene.

## Co-op and story consistency

Fair/Gato still support two independent players. During a scripted sequence the story owns movement. After Marle disappears she is inactive: hidden, untargetable, no ATB, actions or combo. The co-op preference remains saved; P2 is explicitly shown as spectating until an actual party reunion is implemented. The canyon is not populated with an invented Marle/Lucca replacement merely to keep two controls active. That reunion is not implemented in 0.3.

## Saves

Unstarted fair story continues to export v2; lab remains v1. Persistent opening checkpoints use v3 with chapter, era and whitelisted opening progress. Transient approach/resonance/crossing cannot be saved or imported. Canyon and fair share the adventure storage slot; the lab slot remains independent. Old v1/v2 exports can be imported. Export before replacing a downloaded HTML or changing its file path/origin.

## Verification limits

Local: all 53 inherited tests retained byte-for-byte; 26 new opening tests, total 79 pass. Strict TypeScript and standalone build pass. New browser harness uses only actual keys/buttons and read-only snapshots: pause, ordered pendant interactions, absent P2, three-imp fight, v3 export/reload and invalid-import rejection. It does not teleport, mutate state or accelerate time. CI retains source and screenshots for exact commit verification.

The local managed browser rejects file navigation with ERR_BLOCKED_BY_ADMINISTRATOR. No policies changed or bypass attempted. Local tests do not establish new rendering/browser acceptance; use the exact CI run and its screenshots. Do not call a 0.3 candidate a verified release while that run is pending.

## Not implemented

Waking at home, first collision/necklace meeting, all fair minigames/NPCs, exact original geometry or movement frames, true map elevation/navigation, original enemy values and technique effects, original soundtrack, inventory/equipment/experience, Truce town, Guardia overworld/castle, later reunion, physical controller/mobile certification and native packaging.

Next: complete the browser/visual review; connect a coherent town/castle route and event continuity before adding unrelated systems. Replace remaining primitive models and implement authored action/attack poses. Music and detailed battle feel still need a separate asset/provenance and implementation pass.
