# Rendering compatibility — CPU fallback exists; CI47 optimization pending

Execution authority: STATUS / CI47_CHECKPOINT. CI46/Pages40 accepted D0.9.26; E0.9.27 pending. Earlier statements that the project has no playable no-WebGL backend are superseded by the actual D source and CI46 evidence, not silently applied to older releases.

## Backend selection

Existing WebGL2→WebGL1 selection and browser-managed hardware/software behavior remain. Driver names are only hints, unavailable driver metadata is not proof of hardware. Auto quality reduction affects drawing-buffer density, not game speed or character size. Browser software availability cannot be forced by the page.

Default auto now attempts the project's CPU Canvas2D backend when WebGL creation fails. It uses the existing Babylon scene graph and CPU triangle/texture rasterization, without requesting unsafe browser flags or installing drivers. Explicit renderer=webgl is a diagnostic opt-out; it still shows recovery UI when WebGL is unavailable. No guarantee that every device meets performance/memory limits or even permits Canvas2D. See CPU_RENDERING_T05.md.

## Preserved behavior and quality limits

WebGL context loss freezes rules/audio, clears input and timing; restoration rebases without catch-up or automatic save. Existing pause quality select and no-context failure UI retained. CPU keeps scene geometry, actor/clip assets, camera, fixed ATB and save/input ownership but simplifies shadow maps, postprocess/glow and specular lighting. CPU buffer640×480 and textures32MiB/512entries remain bounded. E does not lower those limits or remove scene objects to claim speed.

E improves conservative offscreen work rejection, unclipped-triangle fast path and per-frame light direction reuse. Current vertex data prevents stale bounds from hiding moved objects. Real counters and corrected CPU pause explanation are additional observations, not performance approval. Full native CPU chapter journeys and device testing remain outstanding.

## Verified and unverified

CI46 actual native disabled-WebGL browser completed bedroom/home/mother conversation/overworld/fair, P1/P2 separate movement, real Gato victory, same-run own v2 export, IndexedDB and native import. Nine CPU PNGs, extra native record and CPU ledger verified alongside13existingprimary/9native/three lane ledgers, audio, actor playback and softwareWebGL1/2/context recovery. All raw/source/Pages40 HTML matched; receipts in CI46_ACCEPTANCE/PAGES40_PROVENANCE.

CPU all-chapter browser acceptance, physical devices/FPS/thermal behavior, listening, fullgame and art90 are NOT established. E's local1141Node/220Python and differential/benchmark evidence are unit-only; no local browser run. Five original ledgers plus new CPU work fields and real images are required in CI47.

## Primary references retained

Chromium SwiftShader configuration/fallback boundaries: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/gpu/swiftshader.md
MDN driver information/privacy: https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info
These were checked in the prior B batch; no new external verification is claimed by this documentation-only update. The project CPU rasterizer is distinct from browser software WebGL. Current source and exact native evidence, not prior design text, determine what is implemented.
