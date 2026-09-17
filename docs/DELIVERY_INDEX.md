# Cloud delivery index — 2026-09-18

## Authority and destinations

Source/progress: GitHub KartChang/ChronoTrigger_reMaster main. Current verified gameplay `2eec00c4a9e74c7873724217bd14f5087c42acf0`; a later [skip ci] documentation HEAD is not another game candidate.

Google Drive project folder: [ChronoTrigger_reMaster](https://drive.google.com/drive/folders/1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb), ID `1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`. All files below are in that folder, not root; sharing was not expanded.

## CI12 / Pages5 — verified 0.6.0

Full receipts, source/tree, byte sizes, SHA256, actual screenshot review and limitations: [CI12_ACCEPTANCE.md](evidence/CI12_ACCEPTANCE.md).

| Delivery | Exact run / artifact | Drive file |
|---|---|---|
| Browser evidence, reports, real saves, screenshots and exact source archive | CI12 35243837438 / 10507651284 | [1SGL7JePxbnD9kmwKgh22iCJthXtHg9Du](https://drive.google.com/file/d/1SGL7JePxbnD9kmwKgh22iCJthXtHg9Du/view?usp=drivesdk) |
| Verified self-contained playable | CI12 35243837438 / 10507601714 | [1Quphzuk1OV8Z2-dmvouAOXqPPWK2B-py](https://drive.google.com/file/d/1Quphzuk1OV8Z2-dmvouAOXqPPWK2B-py/view?usp=drivesdk) |
| Art review kit, 26 PNG/JSON pairs and manifests | CI12 35243837438 / 10508215058 | [197NQy705C-URQ1K8IlnZ1dnXVelQIb-8](https://drive.google.com/file/d/197NQy705C-URQ1K8IlnZ1dnXVelQIb-8/view?usp=drivesdk) |
| Pages staged package and deployment.json | Pages5 35246072981 / 10507646387 | [1jgYbYx5jWuSaXXLntCac3-XQCHo9p_bl](https://drive.google.com/file/d/1jgYbYx5jWuSaXXLntCac3-XQCHo9p_bl/view?usp=drivesdk) |

The three CI12 files have complete raw Drive download/readback equality, not just upload acknowledgements. Pages staged file has parent/size metadata readback; its downloaded GitHub ZIP hash and HTML equality were checked. Public 0.6.0: https://kartchang.github.io/ChronoTrigger_reMaster/ . See receipt for the actual deploy-job live verification and the continuation container's network limitation. This is a development preview, not 90-point/final-game acceptance.

## Historical 17-file delivery archive — unchanged

[ChronoTrigger-delivery-archive-2026-09-18.zip](https://drive.google.com/file/d/15XAmLxm597Lplx4XQPTk9madKmu0iFrI/view)
File ID `15XAmLxm597Lplx4XQPTk9madKmu0iFrI`, 16,705,596 bytes, SHA256 `86942783045635b306557c37a4d0e8fbb6559527625935b8f56a7696899dfb48`.
Previously uploaded, metadata checked, downloaded raw, full ZIP SHA256/CRC and all 17 member SHA256 matched. MANIFEST.json remains in the archive. Original filenames and bytes retained:

1. a_single_composite_promotional_gameplay_mockup_ima.png (concept, not engine screenshot)
2. chrono-ci10-playable.zip
3. chrono-existing-browser-evidence.zip
4. chrono-hd2d-fair-v0.2-candidate.zip
5. chrono-hd2d-fair-v0.2-ci6.zip
6. chrono-hd2d-kingdom-v0.4-candidate.zip
7. chrono-hd2d-opening-v0.3-candidate.zip
8. chrono-hd2d-pages-navigation-v0.5.1-candidate.zip
9. chrono-hd2d-playable-v0.1-ci5.zip
10. chrono-hd2d-prototype-art-kit-v0.4.1.zip
11. chrono-hd2d-quality-v0.4.1-candidate.zip
12. chrono-hd2d-reference-art-v0.5.zip
13. chrono-hd2d-reference-v0.5-candidate.zip
14. chrono-hd2d-rescue-v0.6-art-review.zip
15. chrono-hd2d-rescue-v0.6-candidate.zip
16. chrono-hd2d-rescue-v0.6-source.zip
17. chrono_hd2d_ai_guidelines_v1.zip

This is the 17 generated historical deliveries available at the prior checkpoint, not a whole-account backup. Old candidates, blocked notes and scores do not override current main/STATUS. Do not restore old source ZIPs over main. User ROM and original template ZIP are excluded; ROM was not read/extracted. The absence of ROM/SPC/font extensions was a delivery hygiene check, not complete rights clearance.

## Ongoing rule

Every source batch: publish source/tests/progress to main, retain playable/source snapshot/art/reports/screenshots in GitHub artifacts and project Drive, record exact source/run/artifact ID/Drive ID/bytes/SHA256 and readback status here. Never use expiring Actions artifacts or sandbox/chat attachments as the sole permanent delivery. STATUS/TODO/whitepaper/feature snapshot/handoff remain GitHub entrypoints.
