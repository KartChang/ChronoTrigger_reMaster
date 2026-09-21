# Rendering compatibility — CI44 accepted software evidence, no-WebGL gameplay still open

B0.9.24 source7b1537382467935ea37fe4cc6a2dc88d96a8d46c / CI44 35583275426 / Pages38 35585552575 completed software compatibility/source deployment acceptance. C actor source9b9a5721f47638ac25a272db6bd9491a5a9ba2d0 is separately awaitingCI45 and leaves compatibility policy unchanged. STATUS/CI45_CHECKPOINT owns current execution. Full previous B contract is retained at a2492d881d6119e1737bc5ba734bafba35762782.

## Capability policy retained

Babylon attempts WebGL2 then1. failIfMajorPerformanceCaveat=false avoids deliberately rejecting slow contexts; the page does not force browser backend selection or override browser/security/enterprise policy. No production unsafe flags, driver installation or browser relaunch. An integrated GPU can expose hardware WebGL; no discrete GPU is not automatically noWebGL.

Known renderer strings SwiftShader/llvmpipe/softpipe/Software Rasterizer/Microsoft Basic Render Driver are hints only. Private/other strings remain unverified, never hardware proof; driver strings are not saved or transmitted. Auto also observes sustained frame times.

RenderPolicy keeps original quality max(1,DPR/1.5), software/manual compatibility960x720 pixel budget and minimumscaling1.25. After30 active warmup frames and90 valid samples, mean>45ms andp90>55ms allow at most3 further reductions. Hidden/paused/context-lost intervals and invalid/isolated large stalls are excluded. Bounded one-way reduction resets when user changes mode; not a performance guarantee. Only drawing-buffer density changes, not scene composition/actor scale/ATB. Native pause select can restore original quality; subpixel rounding can affect crispness.

Context loss freezes simulation/audio, clears input and accumulation. Restoration resizes/rebases without catch-up or auto-save. TotalWebGL failure shows accessible escaped-text error and native Reload with Start disabled, not a playable replacement. Reload does not promise unsaved-state preservation.

## Verified CI44 observations

Controlled software Chromium rendered real WebGL2 andWebGL1 canvas content, responded toP1, and used the native quality select. Observed auto1.3331705629813464 with1023x675buffer, quality1 with1365x900, then compatibility restoration. Native WEBGL_lose_context produced frozenstate/inputclear and successful scene restoration. DisabledWebGL produced actionable failure/reloadUI. The extra source-ledger and all5originalPNG bytes/hashes were reproduced/verified read-only, alongside the existing13primary/9native/3lane ledgers and all prior journeys. Actual5render and9scenery images reviewed; pause selector fits3views.

This is controlled runner software rendering, NOT proof that every production browser automatically permits software WebGL. Canvas2D was used only for original-canvas pixel sampling. **Fully playable CPU/Canvas2D operation with every WebGL context unavailable remains NOT implemented.** ErrorUI/adaptive resolution/NullEngine do not close that requirement. No physicalGPU/device/FPS/listening/art90 approval. No local browser replay. C preserves this policy and keeps the same real compatibility suite required.

Originals: Drive1g_tlqBUKwknUzdTQPrNbj_18xHFzkOvl; CI44_ACCEPTANCE/CLOUD_RETENTION/PAGES38_PROVENANCE. Actual publicHTTP evidence comes from the successful deploy step at09:55:35.6538271Z, not a new local live-byte check. Held Z/home/localbrowser boundaries stay unchanged; complete future backend must not bypass them or shrink existing game coverage.

## Retained primary references from B research

Chromium Using SwiftShader: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/gpu/swiftshader.md . Software configurations, deprecation of automatic WebGL fallback and handling context-creation failure.

MDN WEBGL_debug_renderer_info: https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_debug_renderer_info . Privacy may hide driver information. These references do not replace current exact-run project evidence.
