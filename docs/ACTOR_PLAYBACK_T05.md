# Actor playback — VQ02C / 0.9.25

Source9b9a5721f47638ac25a272db6bd9491a5a9ba2d0/tree045d553322ce68895a729d8b2f673b56611b22e4. CI45 pending. Independent presentation work, not the held Z material/composition implementation.

## Ownership

src/actor-timeline.ts wraps unchanged PosePlayer clips. Events use state ticks/60 rather than accumulated display time; existing clip durations remain. Gait uses observed x/z travel, cycle1.85*actorScale, four frames. Stationary walking input adds no travel. Stops, map-scale changes, relocation>4*scale, state reset and rollback clear stale distance. Observation is render-sampled travel, not a new authoritative physics path; unobserved curved travel is not reconstructed. Copied history is bounded to24 records. No movement/ATB/save writes.

Idle and ready sample existing frame helpers with slot phase offsets. Reduced motion chooses rest frames for decorative idle/ready/victory; required walking, attack/cast/hurt still convey actions. State/scene replacement uses existing transient reset. Sprite dimensions, pivots, grounding, lunge and camera remain their existing authorities.

src/hero-frame-cache.ts lazily compiles unchanged drawHDHero opaque rectangles into final horizontal pixel spans. True LRU96 entries, no startup all-frame allocation, additional GPU texture, retained canvas or DOM. Replays into the current DynamicTexture and clears on scene disposal. spanBytes counts typed span buffers only, not complete JavaScript memory. Fewer rectangle calls in unit replay do not prove real device FPS gains. Cold misses still run the original painter.

## Evidence

Fresh1073Node/214Python,assets/typecheck/build passed. All4heroes×128frames=512 source-painter RGBA outputs match both cold and warm cache byte-for-byte. These are source-level parity, not GPU screenshots. Native48x64 art, all clips and palettes unchanged. Source reverse normalization enumerates16 wiring substitutions; it preserves original CI44 hashes and method assertions. main/core/camera/input/save/held render files unchanged.

Original reference_browser.py retains its three movement segments and genuine battle, hit, pause and victory. Added read-only actorPlayback includes distance-driven histories/cache counts; pause observations must stay equal, reduced victory must settle toframe0. Four actual PNGs are additionally hashed in the existing validate lane ledger. No fabricated positive save, writable state hook, forceclick, retry or timeout change. Unit fixtures are explicitly synthetic and never acceptance evidence.

CI45 success still requires all original13final/9native/3lane ledgers, previous audio/render compatibility reports plus reference.playback and actual images. No local browser, after-image, device/animation-quality or art90 approval has occurred for C. Full character/enemy/NPC animation production remains open; this batch does not redraw missing art or replace held scenes.

Recovery: Drive14tfPggGAsfpJrZPv44yGDyX87RcLidji; VQ02C_LOCAL_VALIDATION/CLOUD_RETENTION. Archive is a tested assembled244-file snapshot, not a published Git archive. Its nullsource predates publication; latest main receipts supply verified identity. Only main/non-force; held Z/home/localbrowser restrictions remain.
