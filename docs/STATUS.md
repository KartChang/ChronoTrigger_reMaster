# Status — Y 已發布，CI96 原生驗證中

Authority：本檔、TODO、evidence/T05_ANIMATION_CHECKPOINT.json **v32**、handoff/IMMEDIATE_CONTINUATION。唯一 KartChang/ChronoTrigger_reMaster main；single AI／non-force，沒有其他使用者，不建立新分支、PR、平行 candidate 或多人防撞。

## 唯一目前位置

**VQ03Y／0.9.72** source **8024dc43a4e91d0a5f9a319a5ba8c6afdadc1485**，source tree **257d953bca5d60c240646d9fa639c3a22384dc53**；parent main **60ebfe7bf70a906cbf67d187800f0921d96c5f68**。21 個 source/test 變更合批完成完整測試，GitHub 組成的 tree 與已測 tree 完全一致，僅一次 non-force source push，沒有 manual dispatch 或未發布 candidate。

唯一 matching **CI96／36324453650**，push／attempt1／exact Y source，最後觀察 **in_progress**，provider updated **2026-09-27T14:01:58Z（台灣22:01:58）**。目前沒有已接受的 Y 原生證據或 matching Y Pages。這次文件提交以 Y source 為 parent，只有 docs／[skip ci]，不得拿文件 HEAD 當遊戲來源。

## 本輪已完成

1. CI95／36320908543 已 completed/failure。X producer 為0.9.71/VQ03X，但原生入口仍傳 W 的 expected_build；原 checker 在 metadata identity 拒絕後，序列驗證停止，後續 suffix/report 缺少。原失敗報告已有六項通過紀錄及實際出手觀察，未改寫、未回填 accepted，也沒有推定為動畫門檻失敗。收據 evidence/CI95_TERMINAL.json。
2. Y 修正三條當前原生入口共九個 expected_build 綁定，從 checked-out scripts/build.mjs 的唯一標準 producer 宣告取得，**不是從 report 讀 expected 值**。缺少、格式錯誤、重複或模糊宣告一律拒絕。原 checker、路線、ticks、keys、waits、captures 與行為斷言未變；離線 AST 與 exact-source inverse 有測試。
3. 同批修正 src/field-enemy-body.ts 的 paused lethal-source loss。山道三個、森林兩個敵人位置在 production World/core 離線測試修前五項失敗；修後五個正例及十四個取消／隱藏／換 owner／首次已死／reduced／模糊目標反例共19項通過。只保留已畫出的存活來源，仍須正常交付真實致死事件才建立原單次 copy；24tick、HP0立即停用原敵人、釋放與資源上限不變。沒有證明此缺陷曾在既存 native run 發生。
4. 完整 **3019 Node／594 Python**，fail0／skip0，asset/typecheck/build 通過；新增31 Node／7 Python。77項保護輸入是573項未改程式輸入的子集合，不能加總。保留全部原 expected hashes，Y→X→W exact source inverse 不接受 native data，失敗／中止與最後成功 logs 一併保存。
5. 下列兩個包均已真正下載回驗 parent、size、SHA256、CRC及逐檔manifest；Y594檔程式snapshot亦逐byte吻合。不是只上傳成功。

## 已持久保存

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

**Chrono-VQ03Y-field-and-build-tested.zip／11OO9WpRzU6aNbsIXF7jwFxDMJkGWXTOb**：2744621bytes，SHA256 **677ac8646dfcc8b86d397c670886177434699adfbd5c7f06d17b69f8374d68b0**；69manifest／594snapshot。changes/21檔，review/診斷與來源，test-results/成功失敗logs，local-build-not-deployment/不是部署。

**Chrono-CI95-failed-evidence.zip／1K-0GVsXj2tkG7GPvCocofOPM-wQ__rfM**：40517351bytes，SHA256 **f31219ec7c52d1a665d3ca923f0a3b8f405e4391a60a804368655415cb86aa95**；四份provider原ZIP＋兩份review＝6manifest，外內CRC及內容已驗。CI95没有playable accepted宣稱。

封裝時 sourcePublishedAtPackaging=false／cloudReadbackAtPackaging=false 是歷史；最新 GitHub 收據與 checkpoint 優先。不得因此重送 Y、重跑完整測試或 bootstrap CI。臨時容器不是權威。

## 直接接續

Root **T05-early-visual-cohesion**；development/execution terminal **T05-field-foe-action-animation**；next **T05-trial-rescue-death-and-action-coverage**。使用者通知 CI96 完成後，只讀該 exact run 的新原生結果及 matching Pages；保存原ZIP、ledger與review到指定Drive並真正下載回驗。不長輪詢，不 duplicate push／dispatch。

**Tank／Yakra 完整死亡、Hench outgoing、P down、Q受擊中selector-change仍open**。已知 W capture：WebGL致死事件尚排隊；CPU Tank age9、Yakra age12，未滿原24tick；勝利本身不停止simulation。不可增加等待／改capture／注入狀態湊樣本。只根據當輪真實證據關閉缺口。

再續全party/enemy方向與move/attack/hurt/down/death／實際遊玩，前段尺度輪廓／原作構圖／山道法庭樹列、合法完整音訊與聆聽、原速及真機長時段品質，依TODO合批測試再一次source/CI。

W／CI94／Pages88 有界接受保持closed，repair-history、CPUwheel event1529、Vbody與守衛完整death樣本不重驗。CI93及CI95自身仍failure，不能借新收據回填。X/Y尚未原生接受。本輪未看圖、播影片、聆聽或測真機，fullAnimationComplete/artApproved/wholeGameAccepted=false，newScore=null，releaseBLOCKED。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。Held prologue blob2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不提升。No localbrowser/native game-time-save-collision造數；原<.12/單一30秒/250ms-256/CPUquality-memory不放寬。ROM/media/fonts/credentials私有；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink。T03-T08完整分母不縮，2300抵達非完整未來；全部成果GitHub/正確Drive/readback，docs[skip ci]。
