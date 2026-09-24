# 功能進度 — G鏡頭還原修復已發布，CI78待驗收

Authority：STATUS、TODO、IMMEDIATE_CONTINUATION、CI78_CHECKPOINT。Root **T05-early-visual-cohesion**；terminal **CI78-frozen-camera-restoration-evidence**。Source **c65fa91afd407d69976a4ca8e58855d3fff9cc34**，tree **76a4efda08985cc8d668319905a00ae907993c89**，仍VQ03G/0.9.54。Matching **CI78／36054333321**發布後觀察queued/null at2026-09-24T20:21:37Z，尚未accepted。不重送G或camera修復。

## 本輪完成

CI77原CPU fair-vendors暫停偏好切換三張原PNG的before/restored差76像素；NPC畫格／完整state還原仍通過，鏡頭卻在切換時將原緩動位置丟掉。本次runtime只改camera-motion.ts，保留同tick／相同取景身份的原frame，reduced仍snap安全目標，切回時精確還原；時間、場景、比例、目標、角色安全框、reset改變則失效。正常緩動不補時間，不改安全框或native state。

合批六檔，新增14Node回歸，最終 **2205Node／401Python**通過，Node0fail／0skip；完整assets/typecheck/build/check/diff與451非文件程式指紋一致。455檔快照另含四root文件。Camera共38項測試包含反覆切換、cache失效、外部修改隔離、恢復後正常緩動、明示Node CPU port以及原SHA256五片段inverse負測試。修前targeted37測試34pass3fail，修後37pass，最後加inverse測試；不是刪除失敗斷言。

原生PNG差76與offlineCPU差22屬不同測量；offline修復後差0只支持離線回歸，不代替新CI。原native路線、captures、exactPNG還原斷言、workflow、G音訊、其他runtime與heldprologue都不變。沒有本機browser。詳CI77_CAMERA_REPAIR與CI77_FAILURE。

## G原音訊實作保留，非本輪重做

原frequencyAPI的七組自製合成音型：262管風琴、330攻擊、440互動單音、520技能、620恢復、660鐘聲／合技、800時門；其他合法頻率保留原單音。每型最多3聲部、level總和<=.04、尾音<=.5秒；共用16聲部及master .55，超額不排隊補播。這不是聽感或音量安全認證，main觸發點與七段自製配樂保留。沒有使用ROM／原版OST／第三方音效採樣。

初始audio graph、部分聲部失敗與dispose獨立清理；analyser重用1024Float32緩衝且仍讀實際訊號，hold不造零。已成功排程聲部計數不因後續取消而改寫。先前G原2191Node／401Python與143targeted屬前批成果，不混成這輪新增數。原G18檔／452快照及logs仍在原Drive包；本輪六檔獨立保存。

## 驗收界線與雲端

CI77原run failure保留，good/bad成功不能當validate或後续完整CPU600救援審判完成；四原ZIP沒有playableartifact，不宣稱不存在的完整錄影。新修復與原失敗產物保存 **Chrono-CI77-camera-restoration-repair.zip／1S1kHlFoN-aeirWHVcB-9ouA-VrdnGix-**，54893149bytes、SHA256 **1bba02d639a727f691d4b7b179772fb43e2ab25afe8424adbc3ea11b9aba2ac6**，四原ZIP／24manifest／parent／hash／CRC實際下載回驗。455assembled快照不是publishedGitarchive或最新docs，不可因包內發布前false重送。

最後有界接受仍是CI76/Pages70；其102contact／6全尺寸原圖、360個2fps影片樣本不是原速播放、實際聆聽、真機或長時間認證。CI75failure與CI71歷史accepted=false保留。工具旧30/100stale，releaseBLOCKED；沒有新美術分數。

## 仍開放

CI78同run完整原生journeys／十ledger／G音訊回歸／fair-vendors exactPNG／matchingPages與Drive保存待完成。通過後才有界接受，再续T05人物植物道具尺度輪廓／原作構圖（森林時門地面雜訊、法庭稀疏）、完整角色動畫、完整合法音訊／實際聆聽及原速走位淡化viewport舒適性。鏡頭單元修復不等於這些品質TODO已完成。

T03全規則版本拓樸數值、T04完整成長報酬掉落經濟道具飾品學習雙三人技、T05全美術建模動畫音訊、T06所有時代主支線結局、T07整體>=90／各面向>=80%與requiredassets/fivegates/zerocritical/真機測量、T08每批完整CI／原始產物回讀都保留。2300抵達不是完整未來。沿用STATUS的main-only／heldprologue／no-local-browser與所有原native state／時間／CPU品質記憶體限制。
