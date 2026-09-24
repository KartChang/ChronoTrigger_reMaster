# 功能進度 — D有界驗收；E已發布，CI73待完成

動態進度以STATUS與CI73_CHECKPOINT為準。Current root仍為T05-early-visual-cohesion，terminal為**CI73-npc-motion-evidence**。VQ03E／0.9.52、source **344fa860b5c8153b007f75912e16926d966862fa**；本批已一次發布，matching CI73／36008892936最後觀察in_progress，尚未accepted，不重送C/D/E。

## 本輪完成的實作

D的植物實際alpha遮擋保護人物下肢、CPU建物淡化背面修正，已依CI72／Pages66原證據取得有界技術與靜態／抽樣回歸接受。保留原圖與影片，沒有把這項修正當作全美術或原速舒適性驗收。

E把既有減少動態媒體偏好傳入王國／救援NPC：使用保留的原frame0，恢復時回到當前simulation tick相位，不補跑。隱藏、停用或visibility=0時停止貼圖更新；dispose釋放binding，存活NPC錯開動畫的seed不重新編號。增加無效tick、跨scene、重複binding及共享可變貼圖檢查。Runtime只改story-npc-motion、render、kingdom-render、rescue-render四檔，沒有新畫稿、位置尺度、碰撞、數值、故事或存檔變更。

既有暫停Truce第一個960×640 viewport內增加before／reduced／restored觀察與三張原生CPU canvas PNG；不新增按鍵、走位、sleep或game state。凍結完整state與重複觀察、角色frame／上傳次數、原偏好／focus／renderer／viewport／canvas精確還原都有新gate。原七ledger、三job與完整CPU救援／審判等證據保留，新NPC四列ledger是額外驗證，尚待CI73實際原生結果。

27個變更檔、431檔已測程式：最終1990 Node／389 Python、assets/typecheck/build/check/diff均通過；70項NPC針對測試含在完整Node結果。E->D保留19個原SHA256，以精確差異片段還原並保留負向測試；未啟動本機browser。已測包與logs／指紋已存指定Drive並下載回驗，見DELIVERY_INDEX與VQ03E_TESTED_BATCH。

## 驗收界線

最新技術基準CI72_ACCEPTANCE只覆蓋有界工程及明列視覺抽樣：87張CPU圖contact、22張全尺寸；174.88秒原片350個2fps畫格及4個全尺寸畫格。沒有原速播放、真機、長時間或音訊聆聽認證。CI71的中斷視覺審查仍保留歷史accepted=false，不補填接受；CI72接替技術基準，不重驗旧CI。

E的CI73仍待完成、原始產物審查及matching Pages／Drive留存。工具既有30/100舊scorecard不適用新runtime，release仍BLOCKED；這不是E新分數，測試數量不能轉成美術90分。

## 完整剩餘功能

接著完成CI73 checkpoint.remainingReview，再續T05人物／植物／道具尺度輪廓、原速移動與淡化舒適性、全角色動畫及合法音訊。C小怪配色、Z招牌、A建物、B取景與D有界遮擋修正不重做。既有家中到2300、雙人合作／自主第三、fixed ATB、v1-v8存檔與裝備經濟保留；2300不等於完整未來，經驗紀錄不等於完整成長。

T03規則版本拓樸數值；T04完整成長報酬掉落、經濟道具飾品、角色學習與雙三人技；T05全美術動畫音訊；T06所有時代主支線結局；T07全範圍>=90且各面向>=80%、required assets／five gates／zero critical與真機測量；T08每批雲端回讀，均未縮減。Held母親家具及prologue blob、禁止本機browser、原tick／品質／記憶體門檻一律沿用STATUS。
