# Rendering compatibility — VQ02B / 0.9.24

Exact source 7b1537382467935ea37fe4cc6a2dc88d96a8d46c; full validation is pending CI44 35583275426. This implements browser-managed WebGL detection, adaptive drawing-buffer density and recovery UI. It does NOT implement a browser-independent CPU/Canvas2D game renderer or let the web page force a browser-disabled software backend.

## Capability contract

Lack of a discrete GPU is not the same as lack of hardware rendering; an integrated graphics driver can expose WebGL. Babylon keeps its existing WebGL2-to-WebGL1 initialization. failIfMajorPerformanceCaveat=false avoids deliberately rejecting a slow context; it cannot override browser security/enterprise policy. The browser chooses hardware or software. No unsafe browser option, driver installation, browser relaunch or external dependency is requested by the production page.

An available renderer string matching SwiftShader, llvmpipe, softpipe, Software Rasterizer or Microsoft Basic Render Driver is only a software hint. Other or private strings remain unverified, never a claim of hardware acceleration. No renderer string is saved or transmitted. A sustained frame-budget miss also enables adaptation when the driver information is unavailable.

src/render-capability.ts owns auto/quality/compatibility policy. Original quality retains max(1,DPR/1.5). Auto software and manual compatibility use a 960x720 pixel budget with at least1.25 hardware-scaling level. After30 active warmup frames and90 valid samples, mean>45ms and90th-percentile>55ms permit one of at most3 further reductions. Paused/hidden/context-lost intervals are excluded; nonfinite/large isolated stalls do not establish a backend. This is one-way bounded degradation until the user changes mode; it is not a performance guarantee or full adaptive scene-LOD system.

Only the drawing buffer changes. Original17 World scene/actor/camera/contact/effect methods are fingerprinted; no shadow filters, materials, scene composition, actor scale, collisions, input ownership, saves or ATB rules are replaced. Changing density can reduce crispness; the pause menu includes original-quality override. Browser resolution rounding can introduce subpixel differences, so the actual CI view checks still matter.

## Startup and context lifecycle

A caught WebGL initialization failure opens an accessible text-only alert with native Reload and safely escaped diagnostic text. Start remains disabled. This is recovery UI, NOT a playable fallback or evidence the user lacks a GPU. A native WebGL context loss freezes simulation and audio, clears controls and accumulated time, and shows status. Restoration resizes and rebases time without replaying hidden inputs or writing a save. Graphics events do not auto-save or claim unsaved-progress persistence across reload.

src/render-status.ts/CSS owns recovery presentation; src/main.ts wires native context lifecycle, input boundary and the pause select. These are independent from held Z material/portrait changes and the held home renderer. No local browser operation was performed.

## Evidence and open work

CI-only tests add controlled software WebGL2 and WebGL1, original canvas pixel observations, P1 ownership, native quality-select actions, native WEBGL_lose_context loss/restoration, and disabled-WebGL recovery/reload. Browser command-line selection in the test runner is not automatic fallback by a normal user's browser. Canvas2D is used only to sample the real WebGL canvas, not to implement a game backend. Original13 primary/9 native/3 provenance ledgers remain, with a separate render report/source ledger and exact PNG hashes.

1046Node/214Python/typecheck/assets/build passed locally. All real new browser observations remain pending. No GPU/device/FPS/art90/listening approval. Fully playable operation with no WebGL at all remains an explicit unimplemented requirement; no fake no-WebGL success or NullEngine rendering claim. Completing that backend must preserve all existing scenes, rules, input and saves without bypassing held renderer boundaries.

## Primary references checked 2026-09-21

Chromium, Using SwiftShader: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/gpu/swiftshader.md . Documents software rendering configurations, deprecation of automatic WebGL fallback, and the need to handle failed context creation.

MDN, WEBGL_debug_renderer_info: https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info . Driver strings can be restricted by privacy settings; missing information is not hardware proof.

Runtime behavior above is the tested project policy, not a promise that every browser/driver/enterprise environment exposes software WebGL. Latest checkpoint and final evidence, not these design descriptions, determine acceptance.
