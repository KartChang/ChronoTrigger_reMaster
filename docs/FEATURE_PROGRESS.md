# 功能快照 — VQ01H 0.9.7 已發布，CI25 驗證中

更新2026-09-19 UTC。Source **afec069dfb6fe4fc169c4b7240ec1af270914cf5**；CI25 **35454492528** 最後觀察in_progress。最近已驗收仍是0.9.4／CI21／Pages15。以下不是完成百分比或90分認證；即時接續看STATUS／IMMEDIATE_CONTINUATION。

## 本批完成程式、尚待瀏覽器證據

暫停、原生選檔及讀取期間，畫面不再清空State.effects；由有效主迴圈影格依序且只交付一次效果。讀取同場景或切換章節時清除舊傷害數字、揮擊與突進／姿勢記錄，保留共用場景及人物資產。提示訊息以未暫停的閱讀時間計時，不在選單、選檔或背景時過期。

原生匯入仍比較完整snapshot；新增差異欄位路徑、完整雜湊與失敗類型，不排除effects/ticks等欄位。鍵盤旅程加入真實匯入後效果清理、4.6秒暫停閱讀與焦點恢復。原22項斷言全留、增加6項；原生helper仍14項完整條件。新增驗證尚待CI25。

本次729Node／35Python、資產／型別／建置／Python編譯通過；基線2項production draw單元失敗在修正後通過，新增10項單元全部通過。圖形／事件port是替身，不是真機或OS選檔證據。未重試受限制的本機瀏覽器。

## CI24 實際狀態

主validate在第11步第一次Enter原生匯入的狀態凍結比較失敗，已觀察chooser事件、尚未提供檔案；原報告未留下差異欄位，不能宣稱歷史差異已確定。兩條證人旅程成功，共20次真實原生匯入。後續裝備、觸控及主要旅程跳過，不是整批通過。此根因的候選修正在CI25；沒有新Pages驗收。

## 既有及保留範圍

家中到千年祭、600救援返鄉、審判／兩裁決／兩越獄／弗里茲、三部位龍戰車與2300抵達保留；P1克羅諾／P2露卡／自主第三同伴、ATB、A*、裝備／商店／v1–v8保存不重造。匯入生命週期與序號、Enter／Space／tap、金幣庫存、IndexedDB及原旅程斷言保留。

完整VQ01+B+C房間／家具／布料／祭典裝置／人物／鏡頭遮擋工作已保存，仍未發布；不重畫、不繞過特定renderer限制。T03–T08完整原作忠實度、成長報酬技能、美術音樂、其餘主支線結局、真機效能及90分均保留。2300抵達不是完整未來篇，舊30已stale。

雲端：Chrono-CI24-terminal-VQ01H-pause-presentation.zip，Drive **1cLXGg8qCdeCkvn3kIEjydw9tdi2_drc6**，指定folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**，25manifest／10deltas及整包hash/CRC回讀一致；詳DELIVERY_INDEX／CI25_CHECKPOINT。
