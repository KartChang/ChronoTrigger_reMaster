# Current status — F PNG evidence repair published; matching CI76

## 唯一目前位置

Main only / single AI / non-force。Current root **T05-early-visual-cohesion**；唯一terminal **CI76-webgl-png-evidence**。直接讀 `evidence/CI76_CHECKPOINT.json`；不重送已發布C/D/E/F或PNG修復，不重查已接受CI73。

目前source **19697fc3758b7fd484826a61dc2a98b7ddd6837e**；root tree **eff9bafc7f4118b56b8901b782793ef726476706**。版本仍 **VQ03F/0.9.53**，這是既有F的四檔證據修復，不是另一套runtime。Publication parent53d2bc9e74e4c05cf9dfa5ac05930fd6fdd92250。已non-force發布並回讀commit，整棵tree與已測441程式檔加當時main文件一致。

Matching **CI76/36037654752**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source如上。發布後唯一一次觀察 **queued/conclusion=null**，provider updated2026-09-24T17:55:22Z。尚無CI76原生驗收或matching Pages；accepted=false。不是已通過，不長時間輪詢。

## 已完成修復及原失敗

中斷前F其實已發布於456446c3f2e3b6c38425800542c76ac4f92ae355，但舊STATUS/handoff仍說未發布，造成一次重疊的本機E-based實驗。提交前Git tree比對發現矛盾，該實驗未發布、已排除；不能拿其測試數或程式當本批成果。F既有祭典/審判NPC減少動態、生命週期及森林時門旋轉修正全部保留，不重做。

CI75/36025802235的validate及good成功，bad在新增fair witness PNG gate失敗。實際960x640 WebGL原圖誤用CPU307200像素解碼上限。四檔修復新增獨立WebGL證據解碼器，限定614400像素/1280邊長/4MiB壓縮檔；校驗PNG結構、CRC、RGB/RGBA8、五filter、解壓上限/stream結尾。分流WebGL而保留原CPUdecoder逐byte、CPU307200上限、原state/frame/尺寸/hash/精確還原斷言。

**Runtime/assets/workflow/native capture/路線/按鍵/時間/存檔均零變更。** 用未修改CI75原檔重現舊錯誤，再唯讀執行修復後bad5列/validate14列，278檔前後hash相同。這只是offline診斷，CI75仍failure，Pages69 skipped，不回填接受。見CI75_FAILURE。

最終 **2090Node全過/0fail/0skip、397Python全過、57針對測試包含於Node總數**；assets/typecheck/build/fullcheck/diff通過，441輸入指紋未變。品質工具仍是舊30/100過期scorecard及release BLOCKED；沒有新美術分數。無本機browser。完整log/hash見VQ03F_PNG_REPAIR。

## 雲端持久保存

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。`Chrono-VQ03F-witness-motion-batch.zip` file **1mfQYN5dk3BxM9syRQnJ_F_Dv4nY0h3o0**，**86370495bytes**，SHA256 **e369dde3b2b68c3affdda1788590f538e5daedd32f2500b47912e6590f264b65**。實際下載已驗parent/size/hash/CRC/47manifest/5未改原ZIP。

含CI75完整原始ZIP/source/movie/report、四檔修復、441檔已測快照/logs/reproduction；`investigation-only`是排除的重疊實驗，不能發布。`development/F-PNG-repair-program-snapshot.tar.gz`不是publishedGitarchive或最新docs。修復已發布，包內published=false/source=null僅為封裝前歷史，不得觸發重送。

## 已接受基準與接續

最後有界accepted為CI73/36008892936、Pages67/36013140375、E source344fa860b5c8153b007f75912e16926d966862fa；收據CI73_ACCEPTANCE。既有90CPU圖contact/7full-size、357個2fps畫格/2full-size sample，不是原速播放；不重驗。CI71歷史accepted=false及CI72/更早原收據保留。CI73原證據Drive1YiSgMeQG7zDqE3ZgiQEVlqMXk8glvdM6已保存。

先完成CI76 exact原始三job、原七ledger+E/F附加gate、圖/影片及matchingPages/雲端留存。未完成不得接受；失敗只修當前root原報告揭露問題，不改原斷言。通過後接既有T05人物植物道具尺度輪廓、完整動畫、合法音訊與原速移動/淡化/viewport舒適性，不重開舊章節或擴後段。

## 完整範圍與限制

T03規則/版本/完整拓樸/數值忠實；T04完整成長、報酬掉落、經濟道具飾品、學習及雙三人技；T05全部美術/完整動畫/合法音訊，前段品質優先；T06所有時代主支線與結局，2300抵達不是完整未來；T07整體>=90、各面向>=80%、required assets/five gates/zero critical及真機輸入/FPS/frame time/載入/記憶體/背景/存檔/音訊；T08每批實作測試、一次source、完整matchingCI與原始產物雲端回讀。分母不縮。

main only/single AI/non-force；無新branch、PR、平行candidate或多人防撞。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。不造game/time/save/collision state，不放寬<.12、原tick預算、單一30秒、250ms/256、CPU畫質或記憶體門檻。Held VQ01Z/母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules及esbuild hardlink，不覆舊source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM及原媒體/字型/憑證不公開。文件[skip ci]、雲端回讀；臨時容器不是權威。

motionComfort/art/physicalDevice/longSession/wholeGameAccepted均false；newScore=null。
