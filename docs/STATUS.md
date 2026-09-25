# Current status — VQ03H 已發布；matching CI79 驗證中

## 唯一目前位置

Repository **KartChang/ChronoTrigger_reMaster**；main only、single AI、non-force。Root **T05-early-visual-cohesion**；唯一 terminal **CI79-trial-scenery-evidence**。最短接續只讀本檔、handoff/IMMEDIATE_CONTINUATION.md 與 evidence/CI79_CHECKPOINT.json。不是歷史盤點、重規劃或重做已接受工作。

Source **1dd4686f30c2fb7b6e67524131468dca90e6730a**；完整 source tree **59f9f7474dab2850dd80aac330efafeb7b21e9ae**；publication parent **49d9c9d4c8959e0f00c9c3b21efa5ce9b9adb5bc**。版本 **VQ03H／0.9.55**，16 個程式／測試檔一次發布。完整 remote tree 等於已測程式加發布當時 main docs tree 0d0fb850ff66c7ee1a9666bbe2aa95f2300f5b2d，commit/tree 已回讀。不得因封裝前 sourcePublished=false 重送 H。

Matching **CI79／36109184360**，workflow360357259／.github/workflows/ci.yml，push／attempt1；最後實際觀察 **in_progress／conclusion=null**，provider updated **2026-09-25T07:44:28Z（台灣2026-09-25 15:44:28）**。發布最初查詢尚未列出 run，之後才識別到唯一 matching run；沒有額外 dispatch／rerun。H 尚未原生驗收，也沒有 matching Pages 接受。續作只查 exact run 一次，仍 active 保存接續點，不持續等到中斷。

## 本輪已完成的實作

H runtime 僅改 **src/trial-render.ts** 並新增 **src/trial-scenery-art.ts**。既有 guardia1000 森林時門地面改為較大塊、低對比苔地與中央土徑，分支朝原時門座標；稀疏葉片避開步行視覺區。Courtroom 地面改為低對比石板、細邊地毯，七座陪審台與原法官講台／被告席新增 **31 個薄飾面**，不是新增碰撞家具或重建法庭。

原地面 **384×352 texture／16×14 world／y=.02／nearest** 保留；樹木、時門位置、角色位置與動畫政策、原平台／窗簾／彩窗、鏡頭、碰撞、劇情、音訊及 native routes/captures/assertions/workflow 不改。固定 root 快取不逐幀增生 mesh/texture，隱藏場景停用，dispose 釋放資源。資產匯出另新增兩張使用相同 painter 的場景地圖，仍是未核准的 review exports。

最終 **2229 Node 全通過，0 fail／0 skip；404 Python 通過**；本輪新增 **24 Node＋3 Python**。assets/typecheck/build/check/diff 通過，**458 程式輸入指紋**在完整檢查前後及發布前一致；462 檔 assembled 快照另含四份 root 文件。原生 CI78 full checkpoints 僅用作明示 Node offline fixture，不在瀏覽器注入遊戲 state。三種 viewport 驗證新地面、原幾何／state 與精確偏好還原；另外八張 fair/trial 地圖保持原有離線 pixels。

五檔十三個精確片段的 H test-only inverse 保留原 CI78 完整雜湊與 missing/duplicate/unrelated 負測試；Node／Python 對齊。歷史 F/E 比較明示使用 pre-H port，當前 H 有獨立 renderer 測試，不把新素材假裝成舊 pixels，也不改原生證據。四個 pre-H 針對斷言確實失敗；修後24 targeted通過。最初 typecheck、inverse 失敗與 Buffer diff 過大被終止的 log 均保留，終止的 run 不當回歸證明。詳 **evidence/VQ03H_TESTED_BATCH.json**。

## CI78 已有界接受，不重驗

**CI78／36054333321、Pages72／36058079290** 已完成／success；source c65fa91afd407d69976a4ca8e58855d3fff9cc34。三 jobs、原生 chooser、CPU600／救援／審判及十 ledger173列核對完成；555 原檔未改。原 fair-vendors before/restored PNG 現在逐 byte 相同。Play­able／staged／deployed HTML **5734168bytes**，SHA256 **0bce7e85f5ae89ca8e496dd8565ec4fec328804c383a4e1d084d3af13ca087f5**；selectedCI/source/artifact10833415468 正確，public exact HTTP provider step 通過。

102 原圖皆看 contact sheet，僅森林時門與法庭 reduced 兩張看全尺寸；其餘100僅縮圖。175.88秒原片全解碼、352連續2fps樣本／六張表已看，沒有全尺寸影片樣本、原速播放或音軌聆聽。CI78_ACCEPTANCE 在49d9c9d提交並已回讀；取代CI76作為最新有界技術基準，不代表全美術／真機／長時間／全遊戲接受。CI77、CI75仍failure，CI71歷史accepted=false不回填。

## 持久交付

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

H：**Chrono-VQ03H-trial-scenery-tested.zip**，file **1HHFaTQ0bkUEk3qvd7WaMpTzKJjPTlaUL**；**1116344bytes**，SHA256 **0a8110419032cbea0fa1871404e0e85c647b3ced6236c88bd27562fabc77c209**。16變更檔／462快照／logs／離線圖／兩張新增匯出／50manifest，已實際下載核 parent/size/hash/CRC/manifest。這是已測封裝，不是新CI原生證據或最新Git archive；發布前false不得觸發重送。

CI78：**Chrono-CI78-reviewed-evidence.zip**，file **1c7wxq1v7elzKMrRfWKpgUkwEc2rdph_M**；**91355191bytes**，SHA256 **b8d989542822d3f54cfe931b1022217555103a5ab689b68e8ce99f63089c20cc**。七份未改原ZIP及審查紀錄／28manifest，下載parent/size/hash/外內CRC/manifest已核。舊恢復點見DELIVERY_INDEX，不重驗。臨時容器不是權威，進度只讀最新GitHubmain。

## 後續與完整範圍

先完成CI79同source/run/HTML原生原圖、完整旅程／十ledger／G音訊回歸、matchingPages與原ZIP的Drive保存回讀；失敗只修真實缺口，不放寬原斷言。通過後繼續T05人物／植物／道具尺度輪廓與構圖、仍有雜訊的樹冠、法庭平台／角色尺度、完整動畫、合法完整音訊與實際聆聽、原速移動淡化與viewport舒適性。H尚不能標示森林與法庭最終美術完成。

保留完整T03規則版本拓樸數值；T04成長報酬掉落經濟道具飾品學習換人雙三人技；T05所有美術建模動畫合法音訊；T06所有時代主支線結局，2300抵達不是完整未來篇；T07整體>=90／各面向>=80%、required assets／five gates／zero critical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／雲端原始產物回讀。原30/100scorecard屬舊runtime，release仍BLOCKED，無新score。

固定限制：main only/non-force、不建branch/PR/平行candidate；TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8保留，無P3/ARPG/重造框架。禁止native game/time/save/collision造數、改原走位／tick／單一30秒／<.12／250ms-256／CPU品質記憶體門檻。Held家具不提升或間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules且保留esbuild hardlink，不覆舊source/config或另開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM／原媒體／字型／憑證不公開；文件[skip ci]並回讀。
