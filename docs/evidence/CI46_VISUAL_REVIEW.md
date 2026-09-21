# CI46 actual-image review — VQ02D / 0.9.26

Read-only original artifacts, not a local browser run. Inspected nine CPU images, nine WebGL scenery images, four actor-playback images and five renderer/context/recovery images. Labelled/resized JPG sheets are derivatives; original PNGs remain untouched in raw ZIPs.

Default no-WebGL CPU output visibly renders the bedroom, downstairs, scaled overworld and fair. Original stair/mother/map interactions, native separate P1/P2, fair battle victory and own export/import are corroborated by the final report. It is not a mere error screen. The explicit renderer=webgl preference still produces the recovery UI when WebGL is unavailable.

CPU preserves pixel actors and scene geometry but omits shadow maps/postprocess. CPU frameMs samples in the fair range approximately 62.6–101.8 ms for the captured observations, not an FPS distribution or physical-device result. The playable fallback now exists; performance and full-story CPU browser coverage remain open. Pause wording repeats a WebGL-only explanation even under CPU and the HTML has nested paragraphs; clean up that bounded UI issue next.

Original WebGL screenshots retain contact shadows, paving, canopy occlusion and actor frames. Portrait clips the bell and large flat timber planes remain; no new art score. Audio controls/zero-output observations and touch load remain software evidence, not listening or device acceptance.

Next related batch: reduce CPU clipping/offscreen shading work with byte-exact raster comparisons, preserve every existing native journey, and correct CPU pause explanation. Do not touch held Z materials/composition, scene owners, prologue renderer, game rules, input ownership or save schemas.
