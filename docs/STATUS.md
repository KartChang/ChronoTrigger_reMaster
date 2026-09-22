# Current status — VQ02O / CI57

唯一 current root：**T05-early-visual-cohesion**。唯一 execution terminal：**CI57-pending-full-validation**。先讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI57_CHECKPOINT.json。Main only、單一AI、non-force；不盤點歷史、不重寫已完成批次。文件HEAD不同不代表另一遊戲source。

## 已發布與唯一驗證

**VQ02O/0.9.37**，source **9425f58c423897be08fe1ca0d810ec9d6088f7b3**，root tree **8e9b4f10329ddfe3b482670efac1b4229039ce07**，publication parent **e5174d5c760b683137311b80ad71725d134a28e5**。九檔一次non-force發布、main回讀，完整程式tree與已測版本一致並保留當時最新docs；src全保持 **18c602e8c79e292ced059da37a4ee39a5e2075bb**。

唯一 **CI57 35712112661**，Playable prototype CI/360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count=1。最後 **in_progress/null**，created2026-09-22T09:44:44Z、updated09:44:48Z（台灣17:44:48）。尚未查jobs或驗收。Pending保存回報，不長等、輪詢、rerun、dispatch、cancel或另推source。

## CI56真正失敗與O修正

CI56 **35706073669** / N source3f65ae23b2b09be1bb4c23ed559003ae541fe1d3 completed/failure，updated2026-09-22T09:05:32Z。validate106675203969首敗step21；good106675204230、bad106675204345成功。原CPU家中到祭典已走完，第二條旅程第一段co-op z=-2失敗。P1放鍵後反覆在-2.133333333333331與-1.8666666666666643；0/17ms兩種短hold均移動4ticks、每脈衝總耗20ticks。兩側誤差約.133333均未達<.12，最後185/165ticks。Root **CI56-native-short-pulse-quantized-reversal**。N的救援/trial未執行，不能宣稱N失敗或通過。

已看原CPU failure.png，祭典鐘樓/棚位/兩角色正常繪出。四份原passed pre-CPU ledger共35列bytes/hash核對；本輪未重跑verifier，不宣稱重建ledger。後续CPU/era/adventure ledger缺失與救援/trial skipped為次生結果；CI56無playable或Pages驗收。

O保留正常與長距離原split down/wait/up，只在實際觀察到兩次短脈衝反向越界且兩端均未到位後，改用公開Playwright keyboard.press執行最內層按鍵的down/delay/up，減少Python往返期間持續按住的成本。同樣接入N的獨立近距修正。保持原按鍵順序、實際afterRelease、原一次tick預算/30秒/.12/250ms/256上限；只重估傳輸成本、不重設時間。任何部分dispatch失敗都釋放已嘗試按鍵並保留首個例外。這不保證sub-frame精度，真正效果仍等CI57。

最終 **1339 Node/320 Python/assets/typecheck/build/完整npm check/diff check通過**；新增15 Python（12方向軸成本、8雙owner近距、3既有core成本案例）。原0/17ms負例重現；延伸66ms plateau及compact成本是明示模型假設，不冒稱原生測量；不可達精度仍按原budget失敗。原I helper只反向移除明示O接線後核對舊hash，未改expected；數值/語意變更仍fail。全部src/index/workflow/原browser旅程本體/路線斷言、N雙owner規則與verifier保留；沒有本機browser。

## 雲端保存與下一步

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新 **Chrono-CI56-terminal-VQ02O-tested-batch.zip /1zRzBn2uz9QOsg0kQ84LWllgEialwf7mL**，51889991bytes，SHA256 **4b99193b4b6a6d6c108586de77ccf90d569812ffee3e08c9ed8c59a7a6a11a8e**。下載回讀hash/CRC/28manifest/四原ZIP/parent全部一致；298檔assembled程式恢復快照，非published Gitarchive。包內source=null是發布前歷史，最終身分以本次GitHub收據為準，不重送O。

最後accepted仍為 **K/3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**，不重開。成功時依CI57_CHECKPOINT驗原三jobs全報告與CPU兩旅程/600/救援/審判/本人存檔鏈、67腿雙人放鍵、4遇敵/2提示/17PNG/6窗口/第七ledger及O真實按鍵診斷，再Drive原始產物及同CI Pages/source/HTML；不能只看綠勾。之後依TODO推進實際相容/效能、長時間/裝置、前段材質尺度輪廓、地標、動畫音訊品質。

T03–T08完整範圍不縮：規則版本拓樸、成長報酬經濟技能、全美術動畫音訊、其餘時代主支線結局、整體>=90/每面向>=80%與實體裝置、每批雲端。2300抵達非完整未來；舊30stale，無新分數。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三，無P3/ARPG/framework重造。Held Z/母親家具不提升；prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser、可寫game/time/save/collision hook、假原生成功存檔、公開ROM/原媒體/字型/憑證。工具鏈只恢復node_modules/esbuild hardlink。臨時容器非authority。
