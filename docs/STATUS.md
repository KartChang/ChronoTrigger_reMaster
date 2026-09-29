# STATUS — v48，VQ04N 已發布，matching CI 待續

Authority：本檔／TODO／evidence/T05_ANIMATION_CHECKPOINT.json v48。只用 main，single AI／non-force。Root T05-early-visual-cohesion；execution T05-early-production-art；item T05-early-production-art-canyon-court。

## 唯一目前位置

N／0.9.87 source 9f6b6c66a51fb0856618d36318470fefa58e74a3；source tree 7d4e43fb4ce50cfe5e7458171ac2662033bac2a0；parent 32cf722e73d8a4b9589e41b749547f43462f08cf。23 source/test/config 變更合併一次發布，沒有新分支、PR、rerun或dispatch。CI111／36609405380／push／attempt1／exact N：in_progress，conclusion=null；provider updated 2026-09-29T18:04:15Z。

最後完成限定審查的部署仍為 M0.9.86／e2018f2a3752f14dc52a55517839797cac67e0c7／CI11036538709652／Pages10436542208681；不是 N 已驗收。M／CI110不再重跑、重送或等待通知。N pending 時保存本 checkpoint，不長poll。

## 本批實作與測試

N屋顶外輪廓48件（含煙囪）在原H高度及M瓦列／UV之後，以parent-space y=2.18為錨、.72比例壓低；XZ footprint不變。法庭10件舊面板／頂緣／直條／鑲板對齊H已壓低的法官桌及被告席，修掉懸空飾面。山道／1000年森林四種真實canopy atlas樹冠縮窄且不規則化，原葉片細節、108列以下樹根／分叉及gutter不變。K招牌、L苔根、M作者配方不重做。

完整 Node 3887／Python653／assets／typecheck／quality schema／build 通過，780程式檔在最後完整測試前後逐byte相同。78專屬Node（含13項source roundtrip）／4 Python；58模型與實際application arrays一致，獨立匯出與build匯出相同。四組offline比較及14個非目標／held完整frame保護；不是新native、motion、WebGL或真機證據。首輪完整Node的舊A constructor字串斷言失敗；原斷言保留，僅明示N source-only還原其前代輸入，已完整重跑；所有失敗logs留存。

## 持久恢復

指定folder 1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。N完整包 1OlTMP27yhci9bgPVUn4tU0szRlU2dnzy／Chrono-VQ04N-production-batch.zip，5365405bytes，SHA256 7a1598a6ce12315e8c1cb94a15df9e733f4b3f2dca98ad0e3e01958a8789c8e6；118manifest／780snapshot／23delta。最後完整logs及素材已上雲並真正下載核parent／size／SHA／CRC／manifest／snapshot／delta後才push。早期同ID WIP已替換；WIP收據及pre-push unpublished僅歷史，不是第二candidate。恢復program-vq04n.tar.gz，不覆蓋main最新docs；node_modules只取既有工具鏈包。

## 接续與品質界線

CI完成後只處理 exact N 的原始產物與必要場景審查；若failure只修真實terminal，不回填failure。N法庭default offline人物不在被告位置，尚不能宣布native上身遮擋修正驗收。屋頂仍大、樹列仍重複，完整原作構圖／門口接縫／遮擋／縮尺大地圖與城鎮室內切換續作。G224 ambient/greet沿用；112NPCwalk、256combat仍staged且combatRuntimeApplied=false。

全T03–T08、合法完整音訊與聆聽、全方向動作death／原速／真機／長時段仍open。全部完整批准false、newScore=null、releaseBLOCKED。No local browser/native State-time-save-collision注入；所有原native/golden/門檻與held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a不變；ROM/media/fonts/credentials私有。
