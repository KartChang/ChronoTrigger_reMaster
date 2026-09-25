# Current status — VQ03M 已發布；matching CI84 驗證中

接續只讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI84_CHECKPOINT.json，main 確認一次後直接 remainingReview；不盤點歷史或重做已接受批次。

## 唯一目前位置

Repository **KartChang/ChronoTrigger_reMaster**，唯一 **main**，single AI／non-force。Root **T05-early-visual-cohesion**，terminal **CI84-field-foe-motion-evidence**。目前 **VQ03M／0.9.60** source **32672b15a8df76ff243f7840ef95a9b8b817a052**，source tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，publication parent **86dbf83505a8da7f9b839f6d654a735c287124c2**。25 程式／測試檔已一次發布；commit/tree 已回讀，完整 root 等於已測程式加當時 main docs tree **67df40799bd6a34e2141a690b1ce52ecc35ec42c**。M/L/K/J 與更早批次不重送。

Matching **CI84／36179274810**，workflow360357259／.github/workflows/ci.yml，push／attempt1。發布後一次查到唯一 matching run，**in_progress／conclusion=null**；provider updated **2026-09-25T19:22:38Z（台灣2026-09-26 03:22:38）**。未讀 CI84 jobs/artifacts 或 matching Pages，M accepted=false。續作查 exact run 一次，仍 active 保存接續點，不輪詢到中斷、不額外 dispatch 或重送。

## 本輪合批實作

Runtime 僅修改 **src/render.ts**，新增 **src/imp-motion.ts、src/field-enemy-motion.ts**。山道／森林小怪新增四種手臂姿態：原靜止、待機抬臂、戰鬥準備、受擊張臂；不是完整方向移動／攻擊／死亡動畫。Frame0 逐 byte 保留 drawImp，原 24×32 cell、臉部、腳底、C 五項配色採樣與原調色盤不變。原 pixel-art.ts／field-enemy-palette.ts、幾何尺度位置、核心／輸入／鏡頭／音訊／K/L 地形均未修改。

播放只讀原 simulation tick 與 battle mode；待機錯開相位，受擊僅依既有已交付且能唯一對應活著敵人的 player/guest/combo hit，沒有虛構敵人攻擊來源。減少動態使用原 frame0，保留必要傷害文字等回饋。相同 tick 不重播；時間倒退、換 state 或離開戰鬥清除受擊時間，恢復依當前 tick。只在可見且姿態變更時更新原貼圖；同場景 state 替換保留實際貼圖畫格快取，隱藏不重畫，原章節進場 upload 不重複。新增唯讀 fieldEnemyMotion；uploads 明示僅計姿態變更，不包含原進場 upload。沒有新增 mesh/material/texture，dispose 清除引用。

既有 CPU 山道／森林 capture 在同一次 evaluate 追加實際姿態／RGBA 觀察，原 PNG 保存後才做附加 gate，C 斷言保留。既有 opening 的 05-canyon-battle.png 之後加一次唯讀觀察，先保存 **opening/field-enemy-battle-motion.json** 再斷言。沒有新增按鍵、走位、等待或截圖；此 JSON 不冒稱與前一張截圖逐幀同步。兩處原生 harness 是明示追加，不說成完全未改。受擊姿態的正向原生發生尚未證實。

## 最終回歸與界線

**2333 Node 全通過、0 fail／0 skip；424 Python 通過**。本輪新增31 Node＋8 Python，包含於上述總數；31 M 針對測試通過，舊 L 的兩個姿態像素斷言確實失敗。完整 check／assets／typecheck／build／diff 通過，**500 非文件程式輸入**前後及發布前指紋相同；504 檔 assembled 快照另含四 root 文件。

三 viewport、固定 tick／reduced 精確還原、原 state／camera／C palette／geometry／resources、hidden/dead/disposed/rebase 及相同原版 lab 往返流程均有離線回歸。原生 observer 程式以 Node CPU port 和獨立 Python checker 執行，只是明示離線驗證。四 PNG 匯出獨立 CRC／Pillow／runtime RGBA 相同，frame0 PNG 與原 imp.png 相同，仍未核准美術。13 檔36個精確 M 片段與原 full hash／missing/duplicate/unrelated 負測試由 Node/Python 保留，不轉換 native state/PNG/report。

早期 partial unit port、原 G hash、capture 假資料與歷史 L/F 輸入問題的失敗 logs 保留。Lab 首入和返回差61 pixels 在原 L 同樣存在；測試改比相同原版順序，新舊差0，沒有加容差。去掉隱藏重畫與重複進場 upload 後重新跑最終全套，不以先前綠勾代替。本輪沒有本機 browser；已看姿態聯絡表及 canyon-after 離線圖，非原生或原速遊玩。詳細 **evidence/VQ03M_TESTED_BATCH.json**。

## 最新有界接受 — CI83／Pages77，不重驗

CI83 **36169357410**／Pages77 **36171776438** 已按 **CI83_ACCEPTANCE.json** 有界接受，收據在 parent86dbf835 提交並回讀。原 L source897823dbb73401e453913497f08b96a56cef4109；三 jobs、原 chooser、完整 CPU600／救援／審判、十 ledger173列同 source 唯讀重算逐 byte 相同，580 原檔不改，source archive root 匹配。Fair-vendors 原 PNG 精確還原。

Pages77 selectedCI83／sourceL／artifact10881020674，playable/staged/deployed HTML **5744867 bytes**／SHA256 **4fed5cc782a623338f9dd30b3675363ce8d08b9e2572d466b9058c4bbae00cd2** 相同，public exactHTTP provider step 成功。102 張原圖以4表全看，僅山道／法庭／森林時門3張全尺寸；另外99僅縮圖。169.28秒原片全解碼、339連續2fps樣本／6表已看，沒有全尺寸影片樣本、原速播放、音軌聆聽、真機或長時間接受。CI83取代CI82為有界基準，CI77／75 failure、CI71歷史accepted=false不回填。

## 雲端保存

唯一 folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。M包 **Chrono-VQ03M-field-foe-motion-tested.zip／1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes／SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**；25差異／504快照／全部logs／observer離線資料／四匯出／90manifest，已實際下載核parent/size/hash/CRC/manifest/tar。program-snapshot.tar.gz非publishedGitarchive或最新docs；封裝前false/null僅歷史，M已發布。

CI83原始包 **Chrono-CI83-reviewed-evidence.zip／1hjxKhDgg7P4bcU-WxH8SRsfyG4ykMJee**，90790903bytes／SHA256 **eb8e1029f9b9be4641f0ddc7357518c732f012527a0e1046a1cc349a35383b2d**；7未改原ZIP／exactsource/movie/reports/review／39manifest，已實際下載核parent/hash/外內CRC/manifest。歷史恢復點見 DELIVERY_INDEX，不重驗。最新進度以GitHub main為準。

## 下一步與固定完整範圍

先完成CI84原三jobs／全部主報告／chooser／CPU600救援審判／十ledger、兩處M實際觀察、G音訊及原生畫面／同run影片；matchingPages和原產物指定Drive下載回讀後才有界接受。失敗只修同root真實缺口，不改原路線／時間／畫質／斷言。成功後續更廣角色植物道具尺度輪廓／構圖、山道與法庭壓縮空間／樹木重疊、完整動畫、完整合法音訊／實際聆聽、原速走位淡化viewport舒適性。四手臂姿態不關閉全動畫TODO。

完整T03隱含規則／版本／全拓樸數值；T04成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全美術建模動畫合法音訊；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／原始產物雲端回讀。無新score；舊30/100非M分數，release仍BLOCKED。

Main only/non-force/no branch/PR/平行candidate／防撞機制。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8；無P3/ARPG/框架重造。禁止本機browser與native game/time/save/collision造數，不放寬<.12／原tick／單一30秒／250ms-256／CPU畫質記憶體。Held家具不提升或間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules／保留esbuildhardlink，不覆舊source/config、不開bootstrapCI。私人ROM／原媒體／字型／憑證不公開；文件[skip ci]並回讀。
