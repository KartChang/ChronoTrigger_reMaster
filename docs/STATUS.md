# Current status — immediate handoff 2026-09-18 (Asia/Taipei)

**DEVELOPMENT CANDIDATE — FULL GAME IN PROGRESS; NOT 90-POINT ACCEPTED.**

## 唯一目前位置

- Repository: KartChang/ChronoTrigger_reMaster; active branch: main. 使用者確認所有分支僅此 AI 工作流程使用，不設計多人防撞或平行候選。
- Gameplay source: `2eec00c4a9e74c7873724217bd14f5087c42acf0`.
- Gameplay tree: `5f93fb2d04bfdfbef3511b0473ef7927d31ded24`.
- 本次文件提交的 parent HEAD: `8a2e00a94571b516360126500b40f29c04a18326`，parent tree `63d4582beba56171a44f882cf8e2454f48cd89e8`。本次只保存交接與進度，沒有新遊戲候選、沒有重新建置／啟動 CI。
- Current task: **T00 — 接收 CI12 最終結果**。不得重新恢復 v0.6 ZIP、重做修道院或重新跑舊 CI。

## 本次實查到的 CI

CI **#12 / 35243837438**, job **105278814517**, source 如上，push event。
最後觀察：job **in_progress**，完整結論尚未產生。

已 completed success：npm ci、npm run check、Python／Chromium 安裝，及以下六段瀏覽器流程：
1. browser_smoke.py：原始 file／HTTP 流程。
2. fair_browser.py：千年祭／合技／存檔。
3. opening_browser.py：項鍊異變／山道／v3。
4. kingdom_browser.py：城鎮／森林／王城／露卡／v4。
5. reference_browser.py：獨立選敵與動作。
6. navigation_browser.py：夥伴繞路與 P2 所有權。

正在執行第七段：`tests/rescue_browser.py`（修道院、青蛙、亞克拉、返鄉與 v5）。artifacts steps 尚 pending；未取得新 artifact ID，不得編造。
本次只讀目前 job，未重跑六段驗收。上輪本機 260/260、型別／建置及 26 PNG 檢查結果沿用，並非本輪重新執行。

## 第一個續作動作

只讀本文件與 `docs/handoff/IMMEDIATE_CONTINUATION.md`，然後一次確認 main HEAD 與上列 exact run/job。

- still queued/in_progress：不改 source、不另 dispatch、不長輪詢。回報 exact checkpoint；可整理不影響當前 source 的必要交接資料，不能宣稱驗收通過。
- failure：取得該 job logs 及 `chrono-hd2d-browser-evidence`，先看 `rescue/rescue-report.json`／failure.png／lastObserved；若實際 first terminal 在別處，以真實 first terminal 為準。只修該問題及對應測試，保留既有斷言。不要靠加長等待、直接設狀態或重跑歷史過關。
- success：讀新 evidence 的救援畫面／報告，取得 `chrono-hd2d-playable` 與 `chrono-hd2d-art-review-kit`，保存 Drive，記錄 exact source、run、artifact ID、SHA256。接續 T01：核對 Pages 部署來源／HTML hash，再依 TODO 進入下一內容切片。

## Pages 狀態

既有網站：https://kartchang.github.io/ChronoTrigger_reMaster/
最後已知成功來源：`a9b013c55e10f51aae6ffd268f93f7ee4c3848f0`，v0.5.1，CI11 `35232983328`、Pages #3 `35234477003`（承接既有 checkpoint；本輪未重新測試舊部署）。
0.6 尚未確認部署，不稱已上線。既有 pages.yml 會取得通過的 exact artifact，不重建成另一份未驗證遊戲；成功後再核對 deployment.json。不要重做 Pages 或要求使用者再次啟用。

## 已存在實作，不要重造

TypeScript + Babylon.js + esbuild、自含 HTML、瀏覽器單人／同機雙人、ATB、各自選敵、雙方確認合技、A* 跟隨、動畫、暫停、IndexedDB／JSON 匯入匯出與 v1–v5 相容。
已有千年祭 → 異變 → 600 年山道 → 托魯斯／森林／王城 → 露卡加入；0.6 已提交：修女伏擊 → 青蛙實際第三角色 → 管風琴暗門 → 密道／補給 → 亞克拉 → 王后與大臣 → 王城重聚 → 返回 1000 年。
P1 克羅諾／P2 露卡，第三角色青蛙後換瑪兒為自主同伴，不是第三人輸入或自由換人。救援是壓縮三房間路線、暫定數值；完整原版迷宮仍有差距。

## 雲端保存已完成

GitHub 是目前 source／規則／進度 authority；Drive 是交付物持久留存，不替代 main。
Drive 專用資料夾：`1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`。
交付封存：`15XAmLxm597Lplx4XQPTk9madKmu0iFrI`，`ChronoTrigger-delivery-archive-2026-09-18.zip`，16,705,596 bytes，SHA256 `86942783045635b306557c37a4d0e8fbb6559527625935b8f56a7696899dfb48`。
已經 Google Drive upload、metadata readback、raw download 回讀；封存 SHA256、17 個成員雜湊及 ZIP CRC 全部一致。保存的是本對話目前可取得的 17 份既有交付檔；不是整個帳戶備份。歷史候選仍是歷史候選，不提升為已驗收。ROM 與使用者原始模板排除，未讀取或擷取 ROM。
完整入口、檔名與使用規則：`docs/DELIVERY_INDEX.md`。不得把交付只放 sandbox／聊天；每輪 source、報告、圖片、素材、包均應保存 GitHub 或此 Drive 並留收據。

## 專案與品質邊界

完整遊戲尚未完成，不能因『接近完成』的措辭就刪除審判／越獄、真正開場、背包裝備、成長、剩餘時代與結局、音樂等實際缺口；也不能因它們尚未完成而重做已有框架。
舊評分 30/100 已 stale，不是此版新評分或完成百分比。生成概念圖不是實際畫面；原版圖對照、角色／場景／動畫／音樂與真機效能仍須有證據。未達90繼續迭代，不虛填分數、不縮小整款範圍。

文件：`docs/TODO.md` 是既有下一步的任務化索引；`docs/DEVELOPMENT_WHITEPAPER.md` 固定架構與交付原則；`docs/FEATURE_PROGRESS.md` 是本 checkpoint 功能快照；動態 exact run／source 以本文件為準。不要每次重讀白皮書或整個歷史。
