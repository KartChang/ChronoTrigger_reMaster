# Current status — VQ02P / CI58

唯一 current root：**T05-early-visual-cohesion**。唯一 execution terminal：**CI58-pending-full-validation**。先讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI58_CHECKPOINT.json。Main only、單一AI、non-force；不盤點歷史或重寫已發布批次。文件HEAD不是另一遊戲source。

## 已發布與唯一驗證

**VQ02P/0.9.38**，source **71f0cc05a6b0b3b09a314242405d2f7ba543b130**，root tree **f5866487151c269043b181b530199d7631b5a3c6**，parent **f1981836a41163f445d446c09d5ed5aa91f5c1c2**。十二檔一次non-force發布，main回讀，完整程式tree與已測版本一致，保留原remote docs。src tree **2e16dab74bbcc589987d30993361223dd6d5dcd0**，僅cpu-raster.ts與cpu-scene.ts改動。

唯一 **CI58 35722175327**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count=1。最後 **in_progress/null**，created2026-09-22T11:34:13Z，updated11:34:27Z（台灣19:34:27）。尚未讀jobs或驗收；不輪詢、重派、取消、重跑或再推source。

## CI57失敗已確認，不回填成功

CI57 **35712112661** / O source9425f58c423897be08fe1ca0d810ec9d6088f7b3 completed/failure，updated2026-09-22T10:09:47Z。Validate106694937164首敗step21；good106694937405/bad106694937359成功。第一CPU家中到祭典完成；第二旅程第一co-op z=-2，O keyboard.press已實際執行，但50/16/17ms均移動4ticks，放鍵後仍在-2.133333333333331/-1.8666666666666643反覆，169/165ticks。Root **CI57-driver-press-still-frame-quantized**。N救援/審判未執行，不宣稱其已驗或新失敗。

真實CPU末次draw67.1ms、48活動interval平均65.31875ms/P9570/max85/FPS15.30954；buffer678x452。main每render讀一次input供固定substeps共用，與粗粒度一致，但沒有事件timestamp層因果證明。原failure.png已看，祭典/鐘樓/棚位/雙人真實繪出。四份passed preCPU ledger35列bytes/hash及四原ZIP核對，未重新執行verifier。後續缺ledger、救援/trial skipped為次生結果；CI57無playable/Pages驗收。

## 本批是實際CPU繪圖優化，不是再調延遲

P保守掃描列範圍先跳過三角形外部候選像素，保留原逐像素edge/top-left/depth/UV/alpha判定與算術順序；固定形狀project物件、數值及row invariant外提、同RGBA buffer的packed clear。cpu-scene僅加唯讀boundingPixels/candidatePixels與policy。未改遊戲input/time/core、畫質tiers/尺寸、材質/UV/幾何、平滑預設、任何native driver或路線預算。

最終 **1350 Node/325 Python/assets/typecheck/build/full npm check/差異檢查通過**。新增11Node/5Python；保留CI57原raster作byte-exact oracle，22章節x2視窗x2sampling共88個純繪圖案例、4000三角形、邊界透明/深度/紋理更新均一致。只反向移除兩個明列render改動後比原hash，expected未換，負例仍拒絕。沒有本機browser。

五個Node kernel案例24組交替測量平均耗時下降14.34%至25.99%，像素/depth相同。這排除scene traversal、真正browser/event/render cadence，**不是FPS提升或原生精度修復驗收**。P為已測渲染成本緩解，是否足以解除卡點仍看CI58，不能先標root repaired。

## 雲端保存與接續

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。最新 **Chrono-CI57-terminal-VQ02P-tested-batch.zip /1qIQpqFbfG684IdOAH9Mi8JPblXmOkv0G**，52200466bytes，SHA256 **873f8e80be5774fc7fee10bcd6a153d0d059a8fc71634238c03751fbaedc7688**。下載hash/CRC/37manifest/四未改rawZIP/parent全一致，305檔assembled程式快照，非Gitarchive。包內source=null是發布前歷史；目前身份以GitHub收據為準，不重送P或覆蓋最新docs。

最後accepted仍K/source3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454。不重開。CI58依checkpoint驗原全套、完整CPU/600/救援/審判/本人v4-v7/67腿/4遇敵/2提示/17PNG/6窗口/第七ledger、P實際成本與圖片，再原始雲端與同CI Pages/source/HTML。之後接相容效能、長時間/裝置及前段材質尺度輪廓、地標、動畫音訊。

T03：隱含規則、版本差異、完整拓樸與數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色、學習技能與雙三人技。T05：完整美術、動畫與合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線及結局。T07：完整範圍整體>=90、每面向>=80%、required assets／five gates／zero critical，加實體裝置輸入、FPS/frame time、載入、記憶體、背景恢復、存檔與音訊。T08：每批實作測試、一次non-force source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來，舊30為stale，沒有新的美術90、真機或全遊戲認證。

保留TS/Babylon/esbuild、fixed ATB、A*、InputBoundary、P1/P2/自主第三與家中至2300及v1-v8裝備存檔。無新branch/PR/P3/ARPG或框架重造。Held Z/升級母親家具仍held，prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變，不間接替換或局部提升。禁止本機browser、可寫原生game/time/save/collision hook、假原生成功存檔、公開ROM/原始外部媒體/字型/憑證。工具鏈只恢復node_modules及esbuild hardlink。臨時容器不是authority。
