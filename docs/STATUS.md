# Current status — VQ03I 已發布；matching CI80 待驗收

## 唯一目前位置

Repository **KartChang/ChronoTrigger_reMaster**；唯一 branch **main**，single AI／non-force。Root **T05-early-visual-cohesion**；唯一 terminal **CI80-court-canopy-evidence**。只讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI80_CHECKPOINT.json，確認 main 一次；不是歷史盤點、重規劃或重做已完成批次。

目前 **VQ03I／0.9.56** source **b0f4b3f4bfbb233fcdc6cee5b06cd1fd29e0786b**，完整 source tree **6479f59e11849e807664ee8e2d1099bddfe7b7cc**；publication parent **876cea59ec4a4832406aec1b14554d84cef2380a**。14 個程式／測試檔已一次 non-force 發布，commit/tree 已回讀，完整 root 等於已測程式加當時 main docs tree **720126e88660c47049997a895b4d3b93358cdd88**。I、H、G 及 camera 修復都已發布，不重送。

Matching **CI80／36117413556**，workflow360357259／.github/workflows/ci.yml，push／attempt1。發布後一次觀察 **queued／conclusion=null**，provider created/updated **2026-09-25T09:15:24Z（台灣17:15:24）**；exact source 全 event／全 state run count=1，沒有額外 dispatch/rerun。I accepted=false，尚未讀 CI80 原生 jobs/artifacts 或 matching Pages。續作只查 exact run 一次；仍 active 保存接續点，不久等或重送。

## 本輪實作與回歸

Runtime 僅改 **src/trial-render.ts**，新增 **src/court-staging.ts**。14 張既有法庭人物卡片，以原 witness pivot62/64、實際 camera up 及既有支撐面進行接地。法官／辯護人／檢察官支撐面 .72、證人 .49、陪審員 .55，腳底另留 .04；原 x/z 作為腳底錨點，不改劇情與碰撞座標。七位陪審員統一成人顯示高度1.7、寬1.2。隱藏不更新，dispose 釋放 references；沒有新增 mesh/texture。新增唯讀 courtStaging 實際腳底／誤差觀察。

guardia1000 原有 **15 張樹木／樹冠卡片**改用既存且未修改的 drawWoodlandOak，仍64×80 nearest-alpha、原數量、位置、幾何與世界尺度。沒有改全域樹木 painter。H 地面384×352／16×14／y=.02及31薄飾面、時門位置、其他八張 fair/trial 地圖、鏡頭與G音訊保留；原 native routes/captures/assertions/workflow 和 state/time/quality 門檻不變。

最終 **2245 Node 通過、0 fail／0 skip；407 Python 通過**。新增16 Node＋3 Python；16針對測試通過，pre-I兩個針對斷言確實失敗。assets/typecheck/build/完整check/diff通過，**465非文件程式輸入**前後及發布前指紋相同；469檔 assembled 快照另含四份 root 文件。三種viewport、實際相機角度、14bindings、隱藏／dispose、同tick偏好精確還原及八其他地圖原pixels均有獨立I離線回歸。

三檔12個精確片段的 test-only inverse 保留 CI79 原始完整SHA及missing/duplicate/unrelated負測試，Node/Python對齊。歷史HvsCI78明示用pre-I port；當前I獨立測試，沒有把新畫面假裝成歷史pixels。最初timeout／兩個unit斷言缺陷、Python歷史H負測試輸入修正前logs均保留；最終全套重新執行，不回填舊failure。詳 **evidence/VQ03I_TESTED_BATCH.json**。

已看三張離線圖：courtroom-before、courtroom-after、forest-gate-after；要求678×452，實際CPUbuffer542×361，Node畫布不繪文字／曲線。這些不是CI80原圖或原生遊玩。樹冠重複／重疊、法庭平台與空間構圖仍開放，沒有新美術分數或完整動畫／聆聽認證。

## 最新限定範圍接受：CI79／Pages73，不重驗

**CI79／36109184360** completed/success，provider updated2026-09-25T08:07:32Z；H source **1dd4686f30c2fb7b6e67524131468dca90e6730a**。三jobs均success，原conditional skips保留；CPU600／救援／審判確實執行。原chooser、主報告、十ledger173列由exactsource唯讀重算逐byte相同，**570原檔未改**；sourcearchive root匹配。原fair-vendors before/restored bytes一致。

**Pages73／36111225598** success，workflowhead7da8b8c2為文件，selectedCI79/sourceH/artifact**10853380936**。Playable/staged/deployed HTML **5737166bytes**，SHA256 **ef74cac63d775c11f7bd7008363c2c8010c864d5efb8f36ce984e5ce47a45a05**逐byte相同，public exactHTTP provider step成功；沒有本機HTTP/browser重播。

102張原圖全contact審查，僅forest-gate/reduced和courtroom/reduced兩張看全尺寸，其餘100僅縮圖。168.4秒原片全解碼、337連續2fps畫格／6表已看，無全尺寸影片樣本、原速播放或音軌聆聽。**CI79_ACCEPTANCE.json**已在parent876cea59提交並回讀。這取代CI78作為最新有界技術基準，不等於全美術／真機／長時間／全遊戲接受。CI77／CI75仍failure，CI71歷史accepted=false不回填。

## 雲端保存與恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。I已測包 **Chrono-VQ03I-court-canopy-tested.zip**，file **1MVnJyLotTvO3P7Y0HAwkshn49i0L_S0F**；**1161444bytes**，SHA256 **9be8f6bf7e52ded25ce22da2b4a3198c2dacc1dd7dc742ea00e0dc91f23deda4**。14變更檔／469快照／完整及失敗logs／離線圖／51manifest，已實際下載核parent/size/hash/CRC/manifest。program-snapshot.tar.gz是assembled已測程式，不是publishedGitarchive／最新docs；包內sourcePublished=false是發布前歷史，不能據此重送。

CI79包 **Chrono-CI79-reviewed-evidence.zip**，file **1QmVKR7e8YXm3sH-GFtI7H2lVOPV0MpN8**；**90393537bytes**，SHA256 **59b68dabf639ea9cdad8e86e0ec8fe1b16e6617851f07225bfa68ea7485144e7**。七份未改原ZIP及審查紀錄／32manifest已實際下載核parent/size/hash/外內CRC/manifest。舊恢復點保留DELIVERY_INDEX，不重驗。臨時容器不是權威，最新進度只讀GitHubmain。

## 接續與完整範圍

先完成CI80同source/run/HTML三job、原生完整旅程／chooser／十ledger／G音訊回歸，特別審查I法庭腳底與陪審員比例、證人顯示、15樹冠與隊伍／時門辨識；接matchingPages及原ZIP的正確Drive保存回讀後才有界接受。失敗只修實際缺口，不放寬斷言。支持成功後續T05更廣的人物／植物／道具尺度輪廓、原作構圖、法庭平台／空間和樹冠重複、完整動畫、合法完整音訊／實際聆聽及原速移動／淡化／viewport舒適性。

完整T03規則版本拓樸數值；T04成長報酬掉落經濟道具飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／原始產物雲端回讀。原30/100scorecard屬較舊runtime，release仍BLOCKED，沒有新score。

固定限制：main only/singleAI/non-force，不建branch/PR/平行candidate；TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8保留，無P3/ARPG/框架重造。禁止native game/time/save/collision造數，禁止放寬<.12／原tick／單一30秒／250ms-256／CPU畫質或記憶體。Held家具不得提升、換管道或間接替換；prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules且保留esbuild hardlink，不覆舊source/config或開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM／原媒體／字型／憑證不公開；文件[skip ci]並回讀。
