# T03 trial/prison + T04 item increment — 0.8.0 candidate

This batch extends accepted 0.7.0 / CI13 rather than rebuilding its home, fair, 600 AD, cathedral, party or save framework. Dynamic exact source/run status is only in STATUS.md. This document describes implemented source, not an accepted browser result or a >=90 score.

## Playable continuation

Load the existing returned checkpoint, walk to the fair's south exit and interact. Crono escorts autonomous Marle through the miniature regional map and confirmed Guardia forest destination, walks north to the castle and is arrested in the hall. Court questions record answers and use only witnessed prologue facts; legacy facts remain unknown. Following confinement, either knock three times and defeat cell guards alone, or explicitly rest through three prison days until Lucca interrupts the execution. Rest can be declined. Fritz can separately be freed, then both routes merge through a stair-tower battle and the supervisor room. Lucca retains P2 ownership after recruitment. Manual and one-time supply chest are independent interactions.

The narrow **horizontal bridge** holds a three-component Dragon Tank. The head blocks Lucca's fire and repairs surviving damaged parts, but does not resurrect destroyed components. P1/P2 retain independent targets, fixed-step ATB, actual MP costs and two-confirmation combos. Defeat returns to the same entrance without awarding victory or refunding spent stock. Victory opens the westward exit; castle reunion adds autonomous Marle without taking P2 from Lucca, then the forest Gate leads to a walkable broken-dome arrival in 2300 AD. The future world beyond that arrival is still T06, not a completed future chapter.

## Incremental systems

`trial-data.ts` defines stages, map connections/collision and authored balancing; `trial-rules.ts` owns rules, inventory and save validation. Core delegates without taking a renderer/DOM dependency. `trial-render.ts` caches scene sets; `trial-art.ts` feeds the existing PNG/JSON export. No alternate runtime, network service or ROM dependency is added.

The I / 背包 menu freezes simulation and clears held input. Tonic uses the same existing stock and restores up to 50 HP; ether restores up to 10 MP. Full/dead/inactive targets and empty stock do not consume an item. Battle use requires and consumes the selected actor's full ATB and cancels that actor's queued combo. Exploration use has no ATB cost. XP is recorded once per won encounter; this is **not** completed leveling, equipment, shops, currency, roster or tech learning.

v7 retains the genuine pre-trial v5/v6 serialized checkpoint as immutable history and validates only whitelisted current trial facts. It rejects nested v7 history, invented answers/verdicts/rewards, future before the tank/reunion, unreachable maps, premature supplies, invalid actors or stock, and a closed-cell escape position. Transient enemies, targets, ATB, dialog choices and fades are not loaded. v1–v6 behavior is retained when the trial has not started. This is ordinary save validation, not cryptographic anti-cheat.

## Verification

Final local `npm run check`: **375 tests passed, 0 failed**, asset hygiene, type checking, build and existing quality guard completed. The guard remains release-blocked; its old 30/100 score is stale, not this batch's score. Python browser script compiles. A collision-walked pure-core integration test reaches the entire new route and both escape branches using step/actions and a genuinely generated cell save, without assigning positions or flags.

New `tests/trial_browser.py` runs after all eight retained journeys. It imports only the **preceding same-run rescue export**, then uses real keys, dialogs, combat, inventory, IndexedDB and JSON export. The alternate route reloads only a cell export made by that same browser. It checks independent tank targets, blocked fire, actual head repair, menu pause, exact one-time stock/ATB use, portrait menu geometry, Lucca/Marle control ownership, and 2300 save reload. Failure reports retain lastObserved/view/ticks and failure.png. Unit fixture `tests/fixtures/returned-ci13-v5.json` is a separate, provenance-labeled genuine CI13 export and is not the browser's entry save.

**New browser validation and screenshots are pending. 375 local tests now pass, including the added executable art-profile and material regressions.** This local environment returned ERR_BLOCKED_BY_ADMINISTRATOR on the attempted browser navigation; no bypass, screenshot fabrication or assertion weakening was used. CI is the new runtime evidence source.

## Fidelity gaps — not waived

Original dialogue/event transcription: https://cot.drackir.com/script5.htm . Court/bridge original screenshot references and concrete observations are in assets/reference-index.json. The broad event order, alternate escape paths, Fritz, head manual and reunion/Gate are supported by the transcription; numerical balance, exact timing, invisible variables and full topology are not proven by it.

The current courtroom has two recorded questions and a transparent provisional seven-slot evidence display. Cat return, lunch theft, pendant sale/refusal and candy-stop testimony and the original seven-juror algorithm remain incomplete. Unknown votes are not fabricated. Under the currently implemented evidence subset there is no supported four-guilty-vote path; do not call both original verdict branches complete or use this limitation to close T03. Full witness integration must preserve v7 compatibility and real opening provenance. Three days use explicit rest transitions rather than the original event clock. The full jail layout, hidden treasures, complete boss statistics/moves, cutscene blocking, NPC animations, original OST and fine art fidelity remain open.

All terrain, room details and tank components are hand-authored approximations. They are not original asset bytes, complete reverse engineering or final approved art. T03 functional acceptance, T03 fidelity closure and whole-game >=90 acceptance are separate gates.

## Asset contract applied in this batch

See ART_PRODUCTION_CONTRACT.md. Five shared runtime/export material families, camera/scale constants, a miniature mountain symbol, bridge pixel/collision agreement and two-frame tick-bound tank animation are implemented. New browser evidence checks real frame changes and pause. Forty-two PNG/JSON sets remain unapproved pending actual CI screenshot review; no original asset bytes are bundled.
