# Delivery index — VQ04B美術已测发布／CI98原始失敗保存

Authority：STATUS/TODO/checkpointv35；唯一main/singleAI/nonforce。唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。上版完整索引blob5ae77fd579a23070e97ac4fa56c35190625d99ee原封留在 **evidence/VQ04B_PREVIOUS_DELIVERY_INDEX.md**，舊鏈只用必要bytes恢復，不重驗歷史。

## 唯一本輪完整包

**Chrono-VQ04B-production-art-tested.zip**
File **1y1rv5lVly36x6abap1CBKLcyb8e5JGGr**
Bytes **34093917**
SHA256 **56b9d85ad8791f5dda3313e6ea1c7e395b5d1b001c714d8978b32dac74e40eb6**

實際下載回驗parent/size/hash/ZIPCRC、96manifest exact集合及逐檔內容、四innerCI98ZIP CRC、634programsnapshot逐byte一致；checked2026-09-27T18:48:57.284805+00:00。source **b5e92d92940e28344f4a9f5a618050d513f6253a**／tree **7499f0798c4111789f81153288901de0ccd897f9**和已測tree一致，21source/test檔一次non-force發布，matchingCI99/36342361270目前in_progress（2026-09-27T18:54:22Z）。

changes/：本輪21檔。review/program-snapshot.tar.gz：634檔最終程式快照，不含docs。runtime-art/production-vq04a/：13環境PNG，profile為B；runtime-art/production-vq04b/：8款配角×4格圖集＋森林地表共9PNG及manifest。logs/：full-check-final.log與python-full-final.log/exit0，及所有先前failure/typing/working attempts。review/：來源與preservationmap、測試收據、CI98真失敗診斷、標示OFFLINE的作者工作圖及driver。local-build-not-deployment/：sourceSha=null，不是部署證據。

original/：CI98-browser-evidence.zip（artifact10938680683）、CI98-art-review-kit.zip（10938745410）、CI98-witness-good-evidence.zip（10938223342）、CI98-witness-bad-evidence.zip（10937634883）。原始資料未改寫，hash/size見evidence/CI98_TERMINAL.json及包內review/CI98-originals-review.json。CI98仍failure，沒有playable接受，不rerun。

復原最終B優先用review/program-snapshot.tar.gz，必要時changes/；只恢復程式，不用舊docs覆蓋main。恢復原A可從original/CI98-browser-evidence.zip的source-4dc7449ff41a6b87e452c45184198b3c9a1929e2.tar.gz取必要bytes。不要因封裝sourcePublishedAtPackaging=false/cloudReadbackAtPackaging=false重送source或重跑完整tests；v2receipt/checkpoint已記錄真實後續發布與回驗。

## 早期checkpoint與前代

本輪early **Chrono-VQ04B-art-development-checkpoint.zip／1-aWddwHGVjlsTqu99V2lBUWTjIKEbMBc**，18113bytes／SHA31dc562d29f602f9aa941fdb90209ffbd98af1e2fa8bd23992d655e7d5d0a60f，已下載回驗，但只是未完實驗、現由final取代；不可覆蓋final或當成另一candidate。

A已測包 **1IkkI26IMQX83OWLIsUK_ETUsmI_MN_q-**（57499039bytes／SHA18d310dd0509c832031b40e606a5546f0e226974f67a805ca9eabbbb9dbcce6d），source4dc7449...、CI98failure；其原環境實作保留但裁切由B修。更早Z/Y/W完整包沿封存索引，保持既有有界接受與失敗狀態，不整包重審。

工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 僅node_modules/esbuildhardlink，不覆source/config，不bootstrapCI。main高於臨時container和歷史旗標；docs[skip ci]，ROM/media/fonts/credentials私有。

## 下一交付

只接CI99 exactB新native畫面/source/匹配Pages並保留新原始包；不長poll，不duplicatepush/dispatch，不rerunCI98。繼續實際美術與全角色／動作資產，不在對話生成展示圖。B仍未達concept等級，art/fullAnimation/wholegamefalse、score=null、releaseBLOCKED，T03-T08完整分母不縮。
