# Prototype 0.1 — current handoff

## Authoritative scope

- User selected HD-2D, fastest-to-play priority, optional two-player cooperation.
- Repository: KartChang/ChronoTrigger_reMaster. This is a new project, not GauAI; do not import GauAI governance or TODO history.
- Empty private repository was initialized on main with user authorization to start development.
- Main contains only this prototype. No public hosting or visibility change.
- Current implementation: browser-first TypeScript + Babylon.js; local cooperation; ATB preserved.
- Original ROM supplied in conversation was not read, extracted, committed or bundled. The runtime does not require it.

## Implemented

Original placeholder HD-2D village; two independent local control slots; shared camera; basic collision/following; simplified ATB; skills and atomic two-party combo; victory/defeat recovery; temporal flag demo; IndexedDB plus import/export; single-file build; unit and browser CI.

## Validation at source assembly

- Core tests: 32 passed locally.
- Strict TypeScript: passed locally.
- Build: passed locally; approximately 5.1 MiB, no externally loaded assets by design.
- Current conversation container's managed Chromium blocks local navigation and WebGL. A no-network inline render also reported WebGL unsupported. No browser policy was changed.
- Therefore actual file:// launch, screenshots, controller input simulation and IndexedDB/browser journeys are delegated to the repository CI's ordinary Chromium runtime. Do not describe these as passed until the exact run succeeds.
- Browser script never teleports or mutates game state; observation hooks expose snapshots only.

## Not complete / limits

The prototype is not a playable original chapter and is not final HD-2D art. No original characters, scene reconstruction, original story/script/audio extraction, complete ATB compatibility, real-time combat, networking, installer, physical-device certification or physical-gamepad certification.

The follower uses local steering, not A*; can stick behind scenery. Collision world and visual decoration are not yet unified authoring data. Enemy selection is automatic nearest-alive, not a target-selection menu. Combat rules are prototype values, not original ROM values. Future is one environment variant, not a full second chapter. No inventory or progression system. Single save slot plus export. Touch controls cover P1, not two users on one touchscreen. No promise of hardware FPS based on software CI.

## Next work, in order

1. Read the exact latest CI report. Fix first actual failing browser step, not rewrite architecture.
2. Verify art direction with a faithful small original-scene reconstruction using an explicit asset/provenance plan, not this placeholder village.
3. Decide co-op ATB versus real-time ARPG before deeper battle content. Do not silently change combat.
4. Improve companion pathfinding, interaction feedback, target selection, combat animations and third-character control ownership.
5. Make maps/events/skills authorable data; develop a short coherent chapter slice.
6. Physical keyboard/gamepad and Windows/browser performance checks; touch testing on real iOS/Android devices.
7. Only then evaluate desktop packaging and mobile distribution. Network co-op stays a separate scope.

Persist evidence and checkpoints in this repository; /mnt/data is temporary. Do not wait indefinitely on CI. When a run is still queued/in_progress, report its exact SHA/run and continue on the user's next message.
