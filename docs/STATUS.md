# Current status — CI84／Pages78 已有界接受，直接續作 T05 動作動畫

## 唯一目前位置

Repository **KartChang/ChronoTrigger_reMaster**；唯一 **main**，single AI／non-force。Root **T05-early-visual-cohesion**；唯一 development terminal **T05-field-foe-action-animation**。機器接續點 **docs/evidence/T05_ANIMATION_CHECKPOINT.json**。只讀本檔與接續點、main 確認一次；不要重讀歷史或重新驗收已結案工作。

目前已發布 source **32672b15a8df76ff243f7840ef95a9b8b817a052**，source tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，版本 **VQ03M／0.9.60**。M 與更早批次都已發布，不重送。本輪只有 CI84 剩餘證據驗收、雲端保存與交接文件，**沒有新遊戲 source、未發布 candidate、CI85 或 active validation**；未重跑 M 的完整開發測試，未啟動本機 browser。

## 本輪已完成，不重驗

**CI84／36179274810**，push／attempt1，completed／success，provider updated **2026-09-25T19:56:43Z（台灣2026-09-26 03:56:43）**。Validate **108217405616**、good **108217405321**、bad **108217405728** 都成功，CPU600／救援／審判確實執行；原 lane 条件 skip 保留。

由 CI84 exact source 的未修改 verifiers 唯讀重算十份 ledger，**173 列逐 byte 相同**；589 個原始解壓檔前後 hash 一致，原報告不改，source archive 重建 root 匹配。589 的分母是七原ZIP解壓的regular files，部署artifact.tar不再拆入此分母。

新增 M 原生姿態經原 Python checker 核真實 tick／mode／RGBA：CPU山道 tick1146 **[0,0,0]**；CPU森林 tick883 **[1,0]**；opening WebGL戰鬥 tick912 **[2,2,2]**。這證明觀察點的原靜止／抬臂／準備畫格，不證明完整連續動畫。全部被記錄的 hurtTick 都是 null，**受擊frame3正向原生發生仍未驗證**，不是宣告程式失敗。Opening JSON 在原05-canyon-battle.png之後，不當逐幀同步；舊opening report無source欄位，以同run artifact與原validate ledger綁定，不回填欄位。

**Pages78／36182739088** completed／success，selectedCI84／sourceM／artifact **10884945541**。Playable／staged／deployed HTML **5748112 bytes**、SHA256 **5e3a05697472e461a91cdcb4fb86c980e8fbf01549bd5133cee6ce7cd6f0504c** 一致；provider public exactHTTP step成功，沒有本機HTTP重播。

視覺範圍：99張CPU PNG＋原opening戰鬥PNG，共 **100張聯絡表檢視／4表**；僅山道field、森林field、opening05共 **3張全尺寸**，另外97只縮圖。原片 **181.76秒／19200790bytes／VP8 960×844** 全解碼exit0，檢視全部 **364個連續2fps樣本／6表**。沒有全尺寸影片畫格、原速播放、音軌聆聽、真機或長時間認證。原樣本呈現城鎮走位與招牌／建物淡化，但不能關閉原速舒適性TODO。

收據 **docs/evidence/CI84_ACCEPTANCE.json**，CI84_CHECKPOINT 已closed／accepted。CI84取代CI83為最新限定範圍技術基準；不重驗CI84／Pages78／十ledger或更早收據。CI77／75維持failure，CI71歷史accepted=false不回填。沒有新美術分數或完整遊戲核准。

## 直接接續工作

依 **T05_ANIMATION_CHECKPOINT.remainingWork**，先續既有角色／敵人完整動作動畫與原生受擊證據。M四姿態基礎、tick/cache/resource、C配色與K/L地形保留，不重做。

入口檔為 src/field-enemy-motion.ts、src/imp-motion.ts、src/render.ts；需要動作來源時只讀src/core.ts相關action／Effect／damageAlly。現有敵方hit只記錄受擊目標，**沒有可直接識別敵人攻擊者的欄位**；不得從目標猜攻擊者、造假事件或修改遊戲傷害／ATB／死亡時機來取得證據。把可完成的相關實作與回歸合批，再一次source與matchingCI。之後續更廣尺度輪廓／構圖、山道與法庭壓縮空間／樹木重疊、完整合法音訊／聆聽與原速舒適性；不因CI綠勾提前擴後段。

## 指定雲端與恢復

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

最新原始證據：**Chrono-CI84-reviewed-evidence.zip**，file **1k-EnihB3KS3k1791bR3rAZXVzhPVhucx**，**91590088bytes**，SHA256 **2ecd1b7a1f2696722106a36266a53fb42dd5bf24d7e180e36f9fdc2abddbd288**。七份未修改provider ZIP／原片／exactsource／reports，加48manifest及review。已實際下載核parent/size/hash/外內CRC/manifest。恢復source：originals/CI84-browser-evidence.zip內source-32672b15a8df76ff243f7840ef95a9b8b817a052.tar.gz；其中docs是source提交當時文件，不可覆蓋現在進度。

M已測包沿用既有回驗：**1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes，SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**。program-snapshot.tar.gz含504檔／500非文件inputs；原2333Node／424Python、新31Node＋8Python是前輪結果，本輪未重跑。包內prepublication false/null是歷史，不重送M。更早恢復點見DELIVERY_INDEX。臨時容器不是權威。

## 不變範圍與限制

完整T03規則版本拓樸數值；T04成長／掉落報酬／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊；T06全部時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets／fivegates／zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／雲端原產物回讀。舊30/100屬舊runtime，release仍BLOCKED。

Main only/non-force/no branch/PR/平行candidate/防撞；保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8，無P3/ARPG/框架重造。禁止本機browser或native game/time/save/collision造數，不放寬<.12、原tick、單一30秒、250ms/256、CPU畫質或記憶體。Held家具不得提升或間接替換；prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules並保留esbuild hardlink，不覆舊source/config／不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM／原媒體／字型／憑證不公開。文件[skip ci]、成果雲端回讀。
