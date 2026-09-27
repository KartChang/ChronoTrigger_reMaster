# Status — W已發布，唯一CI94執行中；CI93保持failure

Authority：本檔與 evidence/T05_ANIMATION_CHECKPOINT.json v29，另見TODO及handoff/IMMEDIATE_CONTINUATION。唯一 KartChang/ChronoTrigger_reMaster main、singleAI、non-force。Root **T05-early-visual-cohesion**；development terminal **T05-field-foe-action-animation**；execution terminal **T05-trial-repair-history-eviction**。只讀STATUS/checkpoint並確認main一次，依remainingWork接續，不重讀歷史。

## 唯一目前位置

**VQ03W／0.9.70 已一次發布並回讀**。Source **70f9888ea0bc9c7cfb4fc8c4eeadac8cc917809a**，root **bdac0b30a9bb53e37f12264327c607dcb9b140c5**，parent文件 **532c956e196e58889cb84dd808f57da63a4b1ecf**。20檔（12修改／8新增），remote src/scripts/tests與完整測試凍結版一致；source保留live docs及原workflow。沒有未發布candidate，不重送W。

唯一 matching **CI94／36307776528**，workflow360357259／.github/workflows/ci.yml，push/attempt1/main/exactW。最後provider觀察 **in_progress／conclusion null**；created2026-09-27T08:56:21Z、updated **2026-09-27T08:56:24Z（台灣2026-09-27 16:56:24）**。該source全event/state共1run。這是記錄觀察，不保證之後仍相同；詳CI94_CHECKPOINT，尚未accepted，不另dispatch或長輪詢。

## 本輪失敗定位與合批修正

CI93／36301106757 completed/failure，V沒有被接受，最新有界accepted仍U／CI92／Pages86。CI93原本「龍頭實際修復車體」遊玩斷言已通過，但後面的動畫報告失敗 **No actual head repair action**：tank-repair觀察tick699、headRepairs1、保留24筆／移除64筆、repair0筆。ExactV離線production renderer重現修復2/3/1實際畫格被後續idle擠出；不能用counter重建已遺失的native畫格。CI93原報告不改寫、不重跑，不回填accepted；後續CPU/fallback/ledger gates未執行，不冒稱通過。

W只修材質觀察的保留與生命週期，不改戰鬥或動畫。24筆總上限不變；依序移除idle、同角色同操作已由較新事件取代的紀錄、重複phase，最後才移除最舊唯一紀錄，並記錄各類eviction。留存row維持真實來源、原tick與實際材質，沒有補幀或造事件。新encounter owner與借用mesh釋放時清除自己的舊證據；victory仍可讀原戰鬥history。原head repair、outgoing與body正向斷言維持，原路線／按鍵／等待／截圖／門檻不變。

## 完整測試、封存與容器恢復

本輪完整 **2950Node／0fail／0skip、582Python／0fail**；新增37Node＋13Python已包含。Asset/typecheck/build通過。594frozeninputs＝590programinputs＋4rootdocs，另THIRD_PARTY共595檔，前後hash一致。三viewport與三draw cadence離線production CPU：state/pixels/resources與exactV相同，W保留真實已draw修復cells而V丟失。這不是native、原速、美術或真機證據。12file26hunk source-only inverse及負向檢查保留原斷言，絕不轉native資料。

工具容器在傳輸途中重置；從已下載回驗的W包恢復exact檔案，重新核整包hash後接上GitHub已有tree，不重做實作或重跑已完成測試。未提交script傳輸中的重複項已換回原已測bytes，最終完整程式樹匹配才一次發布；沒有把錯誤中間tree發布。詳VQ03W_TESTED_BATCH。

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Wfinal **Chrono-VQ03W-trial-history-tested.zip／1bbUqQj0BFZ6CTsGTDntQMb2ySU9KV_rS**，**1298160bytes**，SHA256 **03502f61fffcc06307f868026af30f6c4ca28aefbbdfbdcbe1194ade234d22c6**；43manifest／595snapshot／20changes已下載核parent,size,hash,CRC與逐檔。包內false/null、parent293d6d屬發布前歷史；snapshot位於review/program-snapshot.tar.gz，不是publishedGitarchive或當前docs。

CI93失敗原包 **Chrono-CI93-failed-evidence.zip／1pz9pcUPtzI694DDAOaHd64hlmMo81oPO**，50697084bytes，SHA256 **ec4ddf3c2c38e2c5ad7c5d07c55ddb093ae16d9cb2bcd4477a0eb18be6b5d360**；四未修改providerZIP＋獨立診斷／5manifest，已實際下載核外內CRC及manifest。此包是失敗證據，不是接受；無CI93playable或成功matchingPages宣稱。

## 直接接續與完整限制

只接CI94；完成後以exactW原checker核WebGL／CPU trial-motion原報告與六observations、真實head repair/outgoing與24筆保留策略／counter一致，核原Vbody/death及全N-U報告、main/nativechooser/CPU600/rescue/trial/ledgers，再核matchingPages selectedCI/source/artifact/HTML。未改原ZIP/reports/video/exactsource/manifest指定Drive下載回驗後才boundedacceptance。W原生仍false；CI93failure保持；CI92/Pages86與更早接受不重驗。

其後全角色／敵人方向sprites與move/attack/hurt/down/death、實際遊玩、尺度輪廓／原作構圖、山道法庭壓縮／樹列、完整合法音訊與聆聽、原速與真機舒適性仍開放。CPUwheel/Hench出手/完整Yakra死亡/Pdown/Qselector-change缺口保留。T03完整規則版本拓樸數值、T04完整成長報酬掉落經濟道具飾品學習換人雙三人技、T05全美術建模動畫音訊、T06全時代主支線結局、T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio、T08每批fulltests/onesource/matchingCI/原產物回讀不縮；2300非完整未來，releaseBLOCKED，無新score。

Mainonly/nonforce/no branchPRparallelcandidate/multiwriter。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。No localbrowser/native game-time-save-collision造數，不放寬原ticks/routes/keys/waits/captures/assertions/<.12/single30s/250ms-256/CPUquality-memory。Held prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**／母親家具不得提升或間接替換；ROM/media/fonts/credentials私人。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆舊source/config/bootstrapCI。Docs[skip ci]/cloudreadback，臨時容器非權威；CI77/75/93failure與CI71歷史false保留。
