# Current status — G 鏡頭還原修復已發布，matching CI78

## 唯一目前位置

Repository KartChang/ChronoTrigger_reMaster，main only／single AI／non-force。Current root **T05-early-visual-cohesion**；唯一 terminal **CI78-frozen-camera-restoration-evidence**。接續只讀本檔、handoff/IMMEDIATE_CONTINUATION.md 與 **evidence/CI78_CHECKPOINT.json**，main確認一次；不重查CI77失敗log或重送G／本修復，不重驗CI76與更早已接受工作。

目前source **c65fa91afd407d69976a4ca8e58855d3fff9cc34**，source root **76a4efda08985cc8d668319905a00ae907993c89**，parent **a4957689983b4e9ef6a44327065d5d7ba774e7f4**。版本仍 **VQ03G／0.9.54**。六檔合批一次non-force發布並回讀；整棵Git tree等於已測程式加發布當時main文件，無其他branch／PR／平行candidate。

Matching **CI78／36054333321**，workflow360357259／.github/workflows/ci.yml，push／attempt1。發布後一次觀察 **queued／conclusion=null**，provider updated **2026-09-24T20:21:37Z／台灣2026-09-25 04:21:37**。accepted=false；尚未驗收CI78原始產物或matching Pages。仍active時保存接續點，不輪詢到中斷。

## 本輪修復與測試

CI77／36046993131已completed/failure。原CPU fair-vendors暫停切換減少動態後，NPC畫格與遊戲state已還原，但before／restored原PNG仍有76個像素不同。根因是EarlyCameraMotion在兩次偏好邊緣都snap至目標，丟失原緩動位置，不是音訊RMS或需要放寬PNG斷言。good/bad成功不能代替validate；後續完整CPU600／救援／審判沒有本run完成證據。CI77保留failure，詳CI77_FAILURE.json。

本批runtime只改 **src/camera-motion.ts**：同tick、相同context與取景請求下保留原緩動frame，減少動態仍立即使用安全目標，切回原偏好才精確還原。tick前進／倒退、場景、比例、目標、角色安全框、reset等改變會使快取失效，不跨情境復用。不改正常緩動時間或安全取景、不造native game/time/save/collision state。G音訊、nativecaptures、workflow、走位、時間／畫質門檻與逐byte還原斷言不變。

新增14項Node回歸，含反覆切換、失效邊界、回傳值隔離、恢復後緩動、原CI77 released state的明示離線CPU port與strict source inverse。原失敗圖差76像素；離線重現差22，修復後0，兩者不可混稱同一原生重播。修前37項camera測試34pass/3fail，修後37pass，最後再加入inverse負測試，完整suite共38項camera測試。

最終 **2205 Node／401 Python全通過，Node0fail／0skip**；assets/typecheck/build/check/diff通過。**451項非文件程式輸入**檢查前後及發布前不變；455檔assembled快照另含四份root文件，沒有省略source/test/config。原camera SHA256以五個精確片段test-only inverse保留，missing/duplicate/unrelated均拒絕，不是整檔豁免。收據 **evidence/CI77_CAMERA_REPAIR.json**。沒有本機browser；旧30/100scorecard不適用當前runtime，release仍BLOCKED，沒有新分數。

## 雲端恢復

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新包 **Chrono-CI77-camera-restoration-repair.zip**，file **1S1kHlFoN-aeirWHVcB-9ouA-VrdnGix-**，**54893149bytes**，SHA256 **1bba02d639a727f691d4b7b179772fb43e2ab25afe8424adbc3ea11b9aba2ac6**。四份未修改CI77 ZIP、exactG source／失敗report／實際已產生影片、六檔修復、455檔快照及logs；實際下載驗parent/size/hash/CRC/24manifest及四原ZIP。CI77沒有playable artifact，不冒稱保存不存在的完整CPU影片。

`development/CI77-camera-repair-program-snapshot.tar.gz`是assembled已測程式，不是published Git archive或最新docs。修復已發布，包內sourcePublished=false僅發布前歷史，不可重送。最新進度只讀GitHubmain；臨時容器不是權威。

最後有界accepted仍是 **CI76／36037654752、Pages70／36041702741**，receipt CI76_ACCEPTANCE.json，Drive **11w0HNMxSC6Olyzu6UoaXFC1-L6tj3fm_**；原十ledger173列、102contact/6full-size、179.88秒影片360個2fps樣本界線保留，不是原速播放、聆聽或真機。本輪不重驗。CI75failure、CI71historicalaccepted=false不回填。

## 後續與固定範圍

先完成CI78同source/run/HTML的原三job／全部主報告／nativechooser／完整CPU600救援審判／十ledger，特別是原fair-vendors精確還原；接matchingPages及正確Drive原檔回讀，再做有界接受。失敗只修同root實際缺口。接續T05人物植物道具尺度輪廓與構圖、森林時門地面雜訊／法庭稀疏、完整動畫／合法音訊與實際聆聽、原速移動淡化舒適性；不重做C/Z/A/B/D/E/F/G或提前擴後段。

完整T03規則版本拓樸數值；T04成長報酬掉落經濟道具飾品學習與雙三人技；T05全部美術建模動畫合法音訊；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批實作測試／一次source／完整matchingCI／雲端原始產物回讀。分母不縮，無新評分／真機／長時間／全遊戲認證。

main only/non-force，保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。無P3/ARPG/框架重造、人造native state或放寬<.12／原tick／單一30秒／250ms-256／CPU畫質記憶體門檻。Held VQ01Z／母親家具不得提升或間接替換，prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser；工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**僅node_modules／保留esbuild hardlink，不覆舊source/config、不開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**、原媒體／字型／憑證不公開；docs[skip ci]並回讀。
