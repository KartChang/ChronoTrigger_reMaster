# Status — Z 已發布／CI97 驗證中；CI96／Pages90 有界接受

Authority：本檔、TODO、evidence/T05_ANIMATION_CHECKPOINT.json **v33**、handoff/IMMEDIATE_CONTINUATION。唯一 KartChang/ChronoTrigger_reMaster **main**；single AI／non-force，沒有其他使用者，不建立 branch、PR、parallel candidate 或 multiwriter。

## 唯一目前位置

**VQ03Z／0.9.73 source fa109ffa446f69881745b2b2c09b78c494f4e2fc**；source tree **e1724fc3c1ff13979aef7ae62c86331d6fb5f6ad**，parent **cbcdb5601dc3afef89c97268a2883a56c3d29a5c**。16個程式／測試檔合批，完整測試後一次 non-force source push。GitHub src/scripts/tests tree 與已測 tree 完全一致；其他 root 保留 current main，未把 source tar 的舊 docs 覆蓋回 main。

唯一 matching **CI97／36330900305**，push／attempt1／exact Z，最後 **in_progress**，provider updated **2026-09-27T15:48:28Z（台灣23:48:28）**。沒有 manual dispatch、未發布 candidate、Z 原生接受或 matching Z Pages。本次後續文件提交只有 docs／[skip ci]，不可拿文件 HEAD 當遊戲 source。

## 本輪完成

**CI96／Pages90**：Y source8024dc43a4e91d0a5f9a319a5ba8c6afdadc1485 的 CI96/36324453650 completed/success，Pages90/36326834462 completed/success。已讀當輪原始報告、來源與 staged deployment ledger；Pages 選擇 CI96 及 playable artifact10933304554，play/index.html 與 CI96 index.html 逐 byte 一致（5804622bytes／SHA2560afdc0161d7ce73947ce005963eb79095c8138c20f867b905548400daf441d0c）。六原ZIP＋review已保存並下載回驗。只接受有界 technical/source-cell-transform/部署連續性，不代表完整動畫或90分。收據 evidence/CI96_ACCEPTANCE.json。

**Z敵人生命週期修正**：FieldEnemyMotion 將 attack/hurt 來源綁定實際 Enemy owner，替換、移除、已觀察死亡後復活及 state/chapter/rewind 清掉失效來源，不影響其他 slot 與實體 texture cache。FieldEnemyBody 換 owner 時還原位移、取消舊 live witness/pending/death copy；field與rescue的同 owner 恢復存活時立即釋放死亡殘影，明確記 cancelled，不偽稱完成 expiry。不完整 origin/target 直接拒絕而不拋出 renderer 例外。

**驗證**：同一組38項 production World 離線回歸套回原Y為9pass/29fail，修後38pass；完整 **3068Node/597Python**，fail0/skip0，asset/typecheck/build通過。新增49Node（38行為＋11來源保護）與3Python。595未改程式輸入保留 canonical aggregate＋完整逐檔map，原expected hashes透過明示 Z→Y→X 來源逆轉保留；不接受 native資料。16檔傳輸後GitHub三程式子樹與已測完全一致。所有成功、失敗與timeout紀錄都保存，沒有以fixture當native證據。

## 持久成果

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

**Chrono-VQ03Z-enemy-lifecycle-tested.zip／1hGbOPVJPe9QnQPraMf0N83TLOZqMufk9**：3030737bytes／SHA256 **61f348063f0ba7e5c0d00179c769c8f8fceb80eba1ede8bdf68efbe55ace7c8e**；187manifest／611program snapshot。實際下載驗parent/size/hash/ZIPCRC/exactmanifest/changes及snapshot逐byte一致，checked2026-09-27T15:47:51.449409+00:00。snapshot不含docs，需從main讀最新docs；local-build-not-deployment不是部署。包內sourcePublishedAtPackaging=false/cloudReadbackAtPackaging=false是歷史，最新GitHub收據優先。

**Chrono-CI96-Pages90-reviewed-evidence.zip／1gQQduODqLkfxmfyjMgXiSAGB_67EMJn7**：88515875bytes／SHA256 **388c5293e822918d69592f3a3153196118b6e70aef624733e6c9a03660e3c595**；六原ZIP／7manifest，實際下載驗parent/size/hash/外內ZIPCRC/逐檔，checked2026-09-27T15:21:42.158885+00:00。不是僅上傳成功。

## 直接接續與邊界

Root **T05-early-visual-cohesion**；development/execution terminal **T05-field-foe-action-animation**；next **T05-trial-rescue-death-and-action-coverage**。先讀CI97當輪exact Z的新原生原檔/ledger/匹配Pages；pending保存checkpoint，不長輪詢、不重送Z/dispatch；failure只定位實際terminal。不再重跑CI96/94或同批離線完整tests，除非真正再改程式。

**Tank/Yakra完整死亡、Hench outgoing、P down、Q受擊中selector-change仍open**。Y亦未補齊；WebGL最後致死仍排隊，CPU Tank age9/Yakra age12未滿24tick。raw報告中victory可能凍結時間的推測未獲證實，原文未改；不得加等待/改capture/注入狀態湊樣本。

W/CI94/Pages88有界接受、repair-history、CPUwheel event1529、Vbody與守衛完整death樣本保持closed；CI93/95自身仍failure，不rerun、不回填。Y有界接受不代表X失敗run轉成功，也不替Z驗收。本輪實際看了CI96山道與法庭兩張原PNG，仍屬prototype品質，無新分數；未播影片、聆聽或测真機。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8；原24tick/singlecopy、native路線/ticks/keys/waits/captures/斷言/<.12/單一30秒/250ms-256/CPUquality-memory不變。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a/母親家具不得提升。No localbrowser/native game-time-save-collision造數；ROM/media/fonts/credentials私有。T03-T08完整分母不縮，2300抵達非完整未來；全部party/enemy方向與動作、美術建模構圖、合法完整音訊/原速/真機長時段仍待完成。fullAnimation/art/originalspeed/listening/device/longsession/wholegame皆false，newScore=null，releaseBLOCKED。
