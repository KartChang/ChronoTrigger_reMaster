# 王國篇 0.4 — scope, fidelity and acceptance

## Playable continuation

Canyon vista -> interact again to descend -> Truce town (resident/year and free prototype inn rest) -> Guardia Forest (two-imp encounter) -> castle hall (guard admission) -> eastern stairs -> queen chamber (Marle reunion/disappearance) -> return hall -> Lucca explicitly joins -> independently controlled P2 can backtrack with Crono -> west forest cathedral direction marks the next slice boundary.

New maps are compact authored interpretations, not original tiles or exact original geometry. Town connects directly to forest, without an overworld map. Inn is an exterior interaction rather than an interior/payment system. Castle combines admission and hall; the queen room is a separate scene. Original dialogue has not been copied; this is newly phrased, abbreviated Chinese narrative. No ROM or extracted art/music was read or distributed.

The plot outline (mistaken queen, stopped search, Marle disappearing, Lucca explaining the ancestor relationship) was cross-checked on 2026-09-17 against https://en.wikipedia.org/wiki/Chrono_Trigger and the indexed walkthrough summary for https://www.icybrian.com/ . These are secondary outline references, not authority for exact lines, timing, map placement, enemy values or translation. The prior official introduction reference remains in OPENING_SLICE.md.

## Party and battle

Marle is an NPC in the chamber, not an invisible controlled party member. Her disappearance uses simulated time and respects pause. Lucca becomes P2 only after a real protagonist interaction in the castle. Saved co-op preference is preserved. The new violet-haired/capped/glasses sprite and HUD identify Lucca, not Marle. P1 leads story/map changes; P2 can move and use ordinary interactions when present. Maps wait for co-op partners to gather before transition.

Forest battle has its own victory flag, retaining lab/fair/canyon flags. One encounter stays cleared when backtracking. ATB/damage/MP remain prototype values. Added slash/spin/shot/fire presentation metadata and short renderer-only lunges do not change hit calculations. These are basic effects, not original attack frames or full technique animation. After Lucca joins this route has no new repeatable combat; deeper Lucca combat content remains subsequent work.

## Saves and authoring

New persistent kingdom stages use v4: phase, heardYear and forestWon, plus validated inherited opening/party state. Cinematic erasing cannot be saved/imported. Existing v1/v2/v3 formats remain supported without automatically rewriting old exports. After town entry, backtracking to canyon retains v4. Adventure storage still shares the fair slot; laboratory slot remains separate. Export before moving standalone HTML or changing browser origin.

Kingdom map solids drive both scene construction and collision. Scene roots are constructed on first visit and retained (four finite maps); this is not an unbounded streaming/resource-eviction system. Ground, building and NPC textures are generated locally, without external requests. Existing sprite/UI paths remain, not a new engine.

## Validation

109 unit tests: all 79 inherited tests preserved byte-for-byte plus 30 kingdom tests. Tests cover complete normal-input route, era/phase dependencies, collision, actor absence/rejoin, v4 migration/negative imports and presentation metadata. Unit fixtures are clearly labeled and not exposed at runtime.

The new browser journey consumes the unmodified v3 export produced by the preceding opening journey in the same CI run, using the existing import input. It then uses keys/buttons through the new route and performs a real v4 save/reload. It does not synthesize a magic starting save, teleport actors or accelerate simulation. Seven screenshots are requested. Existing three browser journeys remain unchanged.

Local strict TypeScript/build/asset checks passed. The current container lacks the default Playwright browser; its installed /usr/bin/chromium was tried normally and rejects file navigation with ERR_BLOCKED_BY_ADMINISTRATOR. No bypass or policy changes. Thus new browser behavior and new artwork remain pending exact CI; 109 units passing is not browser or art certification.

## Still missing

Home/first meeting, original-scale overworld/map fidelity, final sprite frames, original music, inventory/XP/equipment, target menu, advanced companion pathfinding, cathedral interior/Frog/queen rescue, original formulas, physical controllers/devices and native packaging. Do not describe this slice as the finished remake or a completed queen-rescue chapter.
