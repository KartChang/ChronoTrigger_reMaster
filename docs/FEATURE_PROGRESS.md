# 功能快照 — VQ01G 測試契約批次已發布，CI24 驗證中

更新2026-09-19。Source **1bf64db0200358895214605fe20430e264fa8c31**；唯一CI24 **35449183706** 最後觀察in_progress。遊戲runtime仍0.9.6，HTML與CI23輸入逐位元組相同。最近已驗收仍是0.9.4／CI21／Pages15。這不是完成百分比或90分核准；立即接續看STATUS／IMMEDIATE_CONTINUATION。

本批完成15份測試／支援檔：八份瀏覽器旅程統一在原生按鈕啟動前接收FileChooser，再送入同次旅程真正匯出的存檔。補齊逐次事件序號、選檔目標、選檔期間狀態凍結、結果／焦點、失敗階段紀錄，以及空選擇、壞JSON、超限檔、同檔重選。原有裝備Enter／Space／tap、觸控、金幣庫存、ATB、IndexedDB、勝利與劇情檢查保留；八份修改腳本原297個assertions全部保留，現300個。

本機719Node／32Python、型別、資產、建置、Python編譯通過。三份CI23真實輸出只作單元事件順序與parser回歸，不用來偽造新瀏覽器旅程。本機未重試受限制的瀏覽器；單元mock不算真實選檔／真機／畫面證據。完整CI24結果仍待驗收。

CI23實際失敗：validate序章、good／bad證人路線在首次存檔匯入後等待成功訊息逾時；鍵盤旅程成功，裝備及後續未執行。舊driver直接填hiddeninput與新版open/read生命週期不相容。本批修測試呼叫契約，沒有改動遊戲規則、碰撞、存檔版本或放寬guard；舊trace未證明原生取消的確切時序，不宣告舊根因已關閉。

交付已存正確Drive資料夾：1AfuEDjDHDnrMDOAE0GEJfK6nvw2iZS4N，27manifest項目／15增量及四份CI23原始產物已回讀核對。細節見DELIVERY_INDEX及evidence/CI24_CHECKPOINT.json。

前段完整視覺、角色動作、原作地理、正式音樂、真機與全遊戲仍未驗收。已保存的VQ01+B+C場景／角色／相機等不重畫、不繞過限制發布。T03–T08完整範圍與90分門檻不變；2300只到達入口，不等於未來篇完成。
