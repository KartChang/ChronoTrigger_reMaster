# CI12 / Pages5 acceptance receipt — 2026-09-18 Asia/Taipei

## Exact authority

Repository KartChang/ChronoTrigger_reMaster, main. Gameplay source `2eec00c4a9e74c7873724217bd14f5087c42acf0`, tree `5f93fb2d04bfdfbef3511b0473ef7927d31ded24`.
CI12 run `35243837438`, job `105278814517`, push, attempt 1: **completed / success**, completed 2026-09-17T16:21:27Z. This is the original run, not a rerun of a documentation HEAD.

Downloaded all three exact-run artifacts. ZIP CRC and computed SHA256 match GitHub digests. Uploaded to project folder `1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`, downloaded all three through Drive again and compared the complete bytes, SHA256 and sizes: equal. No original ROM/image/audio added.

| Artifact | GitHub ID | Bytes | SHA256 | Drive ID |
|---|---|---:|---|---|
| chrono-hd2d-browser-evidence | 10507651284 | 8572129 | 8230e984b7575dc6864ffe2356e557df1e5c64b2c602e17b1634ccbb5ccd6ea9 | 1SGL7JePxbnD9kmwKgh22iCJthXtHg9Du |
| chrono-hd2d-playable | 10507601714 | 1239711 | 37743d0549689299cc3a01d4dd5c5bde216d5f19251db7bd32b3dd533cd03be5 | 1Quphzuk1OV8Z2-dmvouAOXqPPWK2B-py |
| chrono-hd2d-art-review-kit | 10508215058 | 139176 | 80fc89bd11541476c1835b819715391b9ef268c15ffe02fdb808e4967fd06289 | 197NQy705C-URQ1K8IlnZ1dnXVelQIb-8 |

## Actual rescue review

Read `rescue/rescue-report.json`: passed, errors empty. Eight positive checks cover genuine same-run v4 entry, Naga ambush/Frog appearance, organ/chest/v5 reload, autonomous Frog ATB damage/pause, Yakra HP and tonic resource behavior, separate battle/chancellor/queen actions, Frog departure/Marle reunion without stealing P2, actual return-gate travel and returned v5 reload. The source v4 save SHA256 is `f53327449cca6c2509f0035239a0a01ab1a5b4c434cee5c48221a3ed1f4b1ef7`. The original report and all screenshots remain inside the retained evidence ZIP.

Individually viewed these actual CI screenshots, not concept art:
- `rescue/01-cathedral.png`: aisle, pews, nuns, actor positions, exit and crest prompts are visible.
- `rescue/06-three-actor-battle.png`: three actors, independent enemy markers, Frog ATB and a guest attack effect visible. Runtime report supplies the action/pause evidence that a still image alone cannot prove.
- `rescue/07-yakra-battle.png`: boss HP, three actors and healing effect visible. **Minor UI defect:** the bottom recovery message is partially occluded by the battle panels; fix locally in the next source batch and add geometry coverage. Do not remove messages or hide the evidence.
- `rescue/09-reunion.png`: Marle is a visible third companion; Lucca remains P2; return instructions visible.

No critical traversal blocker found in this reviewed slice. This is NOT final art acceptance or a new numerical score. Repetitive floors, simplified architecture, compressed original dungeon and missing full soundtrack remain T05/T07 gaps. Software GPU evidence is not physical-device certification.

## Pages5 exact package

Existing Pages workflow run `35246072981` (#5), prepare job `105286490042`, deploy job `105286569465`: completed / success. Workflow HEAD `8a2e00a94571b516360126500b40f29c04a18326` is documentation/packaging lineage, not a different gameplay build.
Staged artifact `10507646387` (`chrono-pages-staged-preview`), bytes 1244875, SHA256 `29f300ea876338901fe9852ba150b3cec2d78a4f0219444b96f5dd4d1ac6c07f`; Drive ID `1jgYbYx5jWuSaXXLntCac3-XQCHo9p_bl`, correct parent and size read back. Staged ZIP CRC/hash checked locally. The deployed Pages artifact ID was `10507800993`.

Downloaded and inspected staged `deployment.json`: version 0.6.0, source SHA above, CI run 35243837438, playable artifact 10507601714 and digest above. `play/index.html` is byte-for-byte equal to CI12 playable `index.html`: 5,444,781 bytes; SHA256 `ed6c879daca44ac74f047426a7659ba1f668b5d2ffe383f34068b680acc81edb`.

Read the original deploy job log: the public HTTP verification step fetched deployment.json, asserted SOURCE_SHA, recomputed play/index.html SHA256 and checked the launcher link; it completed successfully at 2026-09-17T16:21:59Z. Site: https://kartchang.github.io/ChronoTrigger_reMaster/
The continuation container could not resolve the public host and web fetch was unavailable, so it did NOT independently repeat that live HTTP fetch. Acceptance uses the actual successful deploy-job HTTP evidence plus independently downloaded identical staged/game bytes, not an invented new live test. No redeploy, duplicate dispatch, cancel or source rebuild was performed for CI12.

## Continuation

T00 accepted. T01 actual-screen inspection and verified Pages deployment completed; carry the observed toast overlap into the next local source batch, with its regression evidence still pending. Continue T02 on current main using existing event/input/save/render mechanisms. T03–T07 remain open; T08 remains a per-batch obligation. The full game and 90-point gates are not accepted.
