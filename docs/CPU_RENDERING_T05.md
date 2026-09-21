# CPU rendering — D/E preserved; F effective density and measurements

Authority STATUS / CI48_CHECKPOINT. AcceptedE sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4 (CI47/Pages41); currentF source38edba36ccd75a3ef8129aea62d21769d847f749 (CI48 pending). Previous full contract remains atde92955eb4946ff766f8e2b6080ea340bb1e81a3. No heldZ/home renderer replacement.

## Existing renderer remains the same

Default auto first uses existing WebGL2/1; when unavailable, cpu-engine/cpu-scene/cpu-raster transform, shade, texture and rasterize the existing Babylon scene graph into RGBA displayed by Canvas2D. NullEngine alone is not a renderer. No independent game rules, levels, saves or controls. CPU simplifies shadow maps, glow/postprocess and specular highlights; no visual parity/art90 claim. Explicit renderer=webgl remains a diagnostic opt-out, not the default.

Buffer ceiling640×480, maximum dimension1280, textures32MiB/512entries retained. E's live-vertex conservative submesh rejection, wholly-inside triangle fast path, original crossing clipping and per-frame light-vector reuse remain unchanged in F. Pixel filling/depth/alpha/UV algorithms are not altered. Original considered/culled/shaded/submitted/fast/rejected/clipped work counters remain real observations.

## F controls now affect actual CPU pixels

The prior CPU cap could absorb all density tiers on large canvases. render-capability now identifies the exact project-owned CPU label and applies tier multipliers after calculating the existing capped baseline. Initialauto preserves prior dimensions; subsequentauto tiers or explicitcompatibility reduce actual dimensions. Quality restores the baseline. All scene geometry, actors, camera and ATB remain unchanged; only drawing-buffer density trades sharpness for load. The original sustained-budget thresholds remain; no guaranteed FPS target.

FrameWindow reports bounded active render-loop mean/P95/max/FPS, excluding paused and first/resume boundary intervals. Valid active long frames remain visible; no averaging of pause duration or reliance on NullEngine's FPS constant. Backend label now saysCPU/Canvas2D, and runtime/build-meta use one source-aware version object. Detailed contract: RUNTIME_DIAGNOSTICS_T05.md. These are observational metrics, not GPU durations or device acceptance.

## Evidence scope

CI47 directly verified the original two native no-WebGL journeys: fresh home/stairs/mother/overworld/fair and independentP1/P2/Gato battle/ownv2export/IndexedDB/nativeimport, nineCPU PNGs plus work accounting. Thirteen originalprimary/nineoriginalnative plusCPU native, audio/actor/WebGL and all5ledgers passed; raw/source/Pages41HTML matched. Single recordedCPUframeMs is not a sustained benchmark.

E's historical1141Node/220Python,5000triangle differential and22scenegraphs×2rect-onlyunitviews remain archived. Its Node microbenchmark is not browser/deviceFPS; no new cross-run speedup claim is made here. F fresh1161Node/220Python/assets/typecheck/build passed with original tests retained. Five unit viewport sizes verify effective tier dimensions using CpuEngine ports; fakecanvas is not a nativeplaythrough.

CI48 extends the same CPU journeys with>=60actualintervalsamples, truthfulbackend/buildlabels and native quality/compatibility dimensions while full paused state stays identical. Two newPNG receipts extendCPU images to11 andCPUledger files to14. Originaltimeouts and allother evidence owners remain. No localbrowser operation, Fafterimages, fullCPUchapter/device/listening/art90 approval yet. Unsupported future material types, fullnativechaptercoverage and realdevice sustainedperformance remain open.
