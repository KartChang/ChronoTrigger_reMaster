# CI20 actual-screen review — 2026-09-19

Source `0e65066d2e1e54cfff9b9a7a4d5466a694a79484`, CI20 `35436087487`, independent UI0.9.3. PNGs are genuine same-run browser screenshots. The retained contact sheet only arranges them, not generated concept art or newly rendered gameplay. This review does not approve held VQ01+B+C scenes.

## Inspected frames and corresponding evidence

Home `browser/prologue/01-home.png`: existing high-frequency timber, simple furniture and mother remain visible; compact toolbar/control hints leave the room visible. It is the old renderer, not the retained new furniture/material/mother kit.
Fair `browser/keyboard/02-idle-first.png`: actors, NPCs, bell and stalls visible; repeated paving is still prominent. Keyboard report separately observes actual idle/NPC frame change and pause, which a single still cannot establish.
Battle `browser/keyboard/04-ready-battle.png`: real Gato, characters and both ATB panels visible; P1 READY shown. Bottom panels still take substantial space; not a full camera/roster review.
Victory `browser/equipment/05-victory-before-enter.png`: result dialog and focused continuation control visible. Equipment and keyboard reports confirm Enter returns to exploration; not inferred solely from the PNG.
Trade `browser/equipment/02-keyboard-trade-and-equipped.png`: same item-row focus and sale feedback visible. Real Tab/Shift+Tab and modal reports pass; not an accessibility certification.
Import `browser/equipment/06-final-import-focus.png`: gameplay resumed with import feedback. Equipment importAttempts records three actual chooser events: beforeEnter focus=import, open/paused, afterImport picker=closed/focus=world; same-run v6 then own merchant-v8 and battle-v8. CI19 root is closed in this tested scope.
Court `good/test-results/witness-good/04-court-framing.png` and `bad/test-results/witness-bad/05-hearing-0.png`: existing platforms, judge/guards/witnesses and testimony visible; corresponding reports use the same source/HTML. On-screen NPC detail is small and geography remains compressed.
Full-resolution `browser/equipment/03-menu-390x700.png` and `03-menu-844x390.png`: return button/feedback stay within viewport and long content scrolls. Sticky header/footer take substantial short-landscape height; portrait footer covers the visible scroller edge. Passing geometry/focus tests does not prove comfortable information density. Keep as a visual refinement, not a newly failed functional test.

## Acceptance limits

Accept CI20's independently published keyboard/menu/native-import/trading/v8/equipped-combat behavior. All20 journey/modal reports passed, including seven modal reports. No new scene renderer, furniture kit, actor painter, camera easing or foreground fading was included. No final-art score, usercomfort confirmation, soundtrack approval, physical keyboard/gamepad/FPS or fullgame approval. QUALITY_STATUS score30 is explicitly stale, not a new evaluation or authorization to reopen old features.

Pages14's downloaded staging HTML exactly equals CI20 playable bytes. deployment.json binds source/run/artifact/digest. Deployjob105883495029step3 additionally verified publicHTTP metadata/game/launcher at deployment time; not a fresh manual browser session. Six originalZIPs, full report index and contact sheet are permanently stored in Drive1vMhQbcd4wOBTdkFk28aDPutsyvIX-S1n. Continue early visual comfort before laterplot; do not use this UI acceptance to approve held scenes or90points.
