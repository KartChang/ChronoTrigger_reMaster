# Execution TODO — 2026-09-18 / CI13 checkpoint

延續既有開發順序，不是重新規劃或重做專案。Exact source/run/status 以 `docs/STATUS.md` 為準。main 單線、非 force；已實作待驗收與尚未開發必須分開。

## 已關閉基線

### T00 — CI12 修道院完整驗收【已完成】

CI12 `35243837438` 成功，七段瀏覽器流程通過；三份 exact artifact 已保存專案 Drive 並下載回讀核對。見 `evidence/CI12_ACCEPTANCE.md`。不要重做修道院／第三隊員／v5，也不要再 dispatch 同 source 的 CI12。

### T01 — 0.6 畫面檢查與 Pages 更新【已完成基線；單一視覺修正在 CI13 驗收】

實際檢查修道院、三人戰鬥、亞克拉、重聚。Pages5 `35246072981` 成功，0.6.0 HTML/source hash 相符。已知回復藥提示被戰鬥面板遮住，修正已併入 T02 source，使用面板實際高度定位；原 rescue browser 的真實用藥流程加入桌面／窄直向幾何檢查。不可在 CI13 截圖檢查前把這個缺口標成視覺驗收完成。

## 目前唯一優先任務

### T02 — 原作初始開場【已提交；CI13 驗收中，不是未實作】

Source `809a5671a63e19c2a573d2b0be759dbe006989ea`；CI13 `35262006198` / job `105339788184`。最後觀察 in_progress，npm run check 成功；本機 292 tests 通過。不要修改正在驗收的 source、取消或重複 dispatch，也不要密集輪詢。

已加入家中醒來、房間／一樓、縮尺區域大地圖、入口地名與確認進入、初遇碰撞、拾取／歸還項鍊、同意／拒絕同行、真實先關心或先撿項鍊的記錄。v6 保留實際選擇，舊 v1–v5 保持原版本與未知經歷；保留原有 fair/canyon/kingdom/rescue 入口、ATB、雙人權限、動畫與存檔，不重造框架。

第一個新 browser `tests/prologue_browser.py` 走全新開場到 600 年，另走雙人／先拾取路徑；其後七段原旅程全部保留。Local browser origin 被環境阻擋，未產生新的本機畫面通過證據。失敗必須看同 run 的第一個真實失敗、報告 lastObserved 與 failure.png，不刪斷言、注入遊戲狀態、捏造存檔或只加 timeout。

若 CI13 成功：保存 browser-evidence、playable、art-review-kit 三份 exact artifact，記錄 source/run/artifact ID/SHA256，下載回讀。檢查房間、家中、大地圖、初遇、同行、600 年與用藥提示實際畫面；沿用既有 Pages、核對 source/HTML hash 後再宣稱 0.7.0 上線。參照 `ORIGINAL_FIDELITY.md`，不能把區域大地圖當成全世界地形／城鎮／室內／迷宮已精確還原。完成後直接接 T03。

## 後續實作順序（不要平行多候選）

### T03 — 審判與越獄【未實作，接 returned checkpoint】

從已存在 rescue.stage=returned 接護送／王城審判／囚禁／逃出路線。先研究明確原作行為，再使用 T02 白名單旗標；不硬判所有舊存檔同一行為，不猜成精確陪審規則。沿用 ATB、地圖、輸入、存檔與動畫，只擴充必要 schema；舊 v1–v6 仍可匯入。新切片須真正走路／對話／戰鬥／存讀檔，不能只加文字標記。

### T04 — 背包、裝備、成長與角色／技能管理【部分基礎已有，整套未完成】

保留一次性回復藥及扣除原子性，增量建立物品資料、背包／裝備 UI、貨幣／商店、經驗與能力成長；分離 UI 與規則。完整 roster／控制權切換、技能學習與二／三人技仍待補；第三自主同伴不等於整套 roster 已完成。

### T05 — 原版對照美術、動作、音樂持續提升【持續，與新切片合併交付】

沿用 reference index、繪製函式、PNG/JSON 匯出、角色姿勢與素材登錄，不另建重複管線。T02 已加入原作手冊／房間／大地圖對照記錄；研究範圍與未核對項目必須明列，不宣稱已完整逆向全遊戲。依實際原版畫面優化，生成海報不算原版或現有截圖。補齊需用素材與音訊並在引擎驗證。完整迷宮拓樸、城鎮房屋內外、地形鄰接、更多動作、配樂與原作數值仍是缺口；原作檔／ROM 不公開上傳。

### T06 — 後續時代、主線、支線與結局【未完成】

在實際可玩接點逐章增加其餘世界與內容，先取得相關版本參考；不要以空場景取代主線。保留各時代地理、人物與事件因果。原有章節只因真實 bug 或新增內容需要做局部相容修改，不能重做已完成里程碑。

### T07 — 整體 90 分與實體裝置驗收【最終門檻，尚未通過】

每切片保留缺口，整體總分>=90、各面向>=80%、無 critical blocker、五項證據 gates 與必要資產通過。真機 keyboard/gamepad、FPS/frame time、載入／記憶體、背景與存檔須實測；軟體 GPU 不等於玩家硬體。保留完整遊戲目標，不能自評灌分、刪除缺口、只評已做的切片或拿舊30分當本版分數。瀏覽器優先；不擅自改為原生App、網路多人或即時ARPG。

## 永久交付規則

T08（每批執行）：source/tests/progress 寫回 GitHub；試玩／原始碼／素材／報告／截圖存 GitHub artifact 後再留存專案 Drive，記錄版本、exact SHA、CI、雜湊、URL及回讀狀態。這批 working package 與 local validation logs/manifest 已完成 Drive 回讀；CI13 正式 artifacts 尚待 run 結束，不得混稱。見 DELIVERY_INDEX。
不要只貼聊天附件或以臨時路徑作 authority；Drive 必須放 `1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`，不放根目錄。不把文件持久化當成新遊戲功能，也不刪未完成項目湊90分。
