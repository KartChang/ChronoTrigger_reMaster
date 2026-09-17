# ChronoTrigger reMaster — HD-2D Pages／尋路 0.5.1 候選

**千年祭 → 600 年山道 → 托魯斯 → 加爾迪亞森林／王城 → 露卡加入的開發試作，不是完整重製版或最終美術。**

TypeScript + Babylon.js，瀏覽器優先、同機雙人、保留 ATB；不需要登入後台、ROM 或 Node.js 才能遊玩。

## 0.5 本次變更

以原版圖片校準角色比例、千年祭鐘台／攤位／地面與森林材質。三名角色加入攻擊、施法、受擊、倒地、勝利姿勢；冒險鏡頭更靠近隊伍。這是參考重畫，不是擷取原圖、原版逐像素還原或完成整款遊戲。

戰鬥中 P1 按 **Q／R**，P2 按 **左、右方括號鍵 `[`／`]`** 切換目標；手把 LB／RB 或各自 HUD 箭頭也可用。選目標不花 ATB／MP，兩人互不搶選擇。沒有變更原有 ATB、傷害或存檔格式。

本次未新增劇情地圖；原有進度仍可接續。原版參考與差異見 `assets/reference-index.json`、`docs/REFERENCE_ART_PASS.md`。CI 試玩包仍是開發版本，不是 90 分放行。

## 試玩與接續

在 Actions 的 Playable prototype CI 找到成功 run，下載 chrono-hd2d-playable，解壓後用 Chrome／Edge 開啟 index.html。repository 根目錄 index.html 只是模板。candidate ZIP 是本機建置候選包，不等於成功 CI artifact；實際狀態看 docs/STATUS.md。

選「千年祭 · 單人開始」或「千年祭 · 雙人開始」。向北找露卡，試用左側平台，再找露卡觀看瑪兒的展示。異變後拾取項鍊、追入時門，沿山道向南戰鬥並下山。鐘台、糖果攤與機器人不是主線強制條件。

已有 0.3 進度：先在舊版匯出 JSON，於新版開始千年祭後按「匯入」。山道出口第一次互動觀看遠景，再按 E 前往托魯斯；原 v3 vista 存檔可直接接續。

新路線：托魯斯鎮民／旅店 → 東南小路 → 森林戰鬥 → 向北進王城 → 向衛兵說明來意 → 東側樓梯 → 瑪兒 → 回大廳找露卡 → 兩人返回森林西方。修道院內部未製作，西方標記明確顯示試玩界線。

## 操作與隊伍

| 功能 | P1 | P2 |
|---|---|---|
| 移動 | WASD | 方向鍵 |
| 攻擊 | J | 逗號或數字鍵盤 1 |
| 技能 | K | 句號或數字鍵盤 2 |
| 合技確認 | L | 斜線或數字鍵盤 3 |
| 互動 | E | Enter |

C 在探索時加入／退出 P2；Esc 暫停。等 ATB 充滿再下指令；雙人合技需雙方確認並有足夠 MP。觸控方向鍵只提供 P1。

瑪兒離隊後 P2 暫時觀戰；王后房間的瑪兒是 NPC。回王城大廳與露卡交談後，P2 才恢復操作並顯示露卡。P1 帶領主線與換圖；兩人換圖前要靠近彼此。不是讓已消失角色繼續攻擊，也不是即時動作 ARPG。露卡加入後，本版尚無新的可重複遭遇戰。

標準 Gamepad API：搖桿／十字鍵移動，A 攻擊、X 技能、Y 合技、B 互動；P1 Start 暫停，P2 Start 加入／退出。API 模擬不等於實體手把認證；共享鍵盤可能受 ghosting 限制。

## 畫面、存檔與限制

像素角色、3D 地圖、藍框底部對話、簡化踏步／斬擊效果。所有地圖是壓縮重建；對白重新編寫，動作幀、數值、技能不是精確原作。旅店只提供門口休息，尚無室內／金錢系統。

村落 v1、千年祭 v2、開場 v3 保留相容；進入王國路線採 v4。冒險共用存檔槽，技術村落分開。過場不能存檔；匯入檢查版本、旗標、時代、地圖、座標與能力值。更新 HTML、移動檔案或清理瀏覽器前先匯出備份；不保證不同 file:// 路徑共用存檔。

尚無家中醒來／最初相遇、完整世界地圖、修道院內部／青蛙／王后救援、原作配樂、背包裝備與升級、完整世界導航、三人隊伍、網路多人、原生安裝包或實體裝置認證。

## 開發與素材

```sh
npm ci
npm run check
npm run preview
```

Node.js 22+ 用於建置；preview 預設 http://127.0.0.1:4173。其他指令：CODEBASE.md；唯一動態進度：docs/STATUS.md。

未讀取或擷取 ROM；原聲帶、原作擷取素材、使用者附件與密鑰不提交、不打包。未做公開遊戲部署。2026-09-17 GitHub 實查 repository 為 public，本批未改可見性。原作內容的公開發行授權尚未確認。

第三方程式授權：docs/THIRD_PARTY.md；來源與限制：docs/OPENING_SLICE.md、docs/KINGDOM_SLICE.md。

## 品質與可編輯素材

目前不屬 90 分驗收版本。最新已檢視基準暫評 30/100；程式修改後需要重新取得相符證據，不能因測試通過自動升分。CI 的 playable artifact 是開發試玩包，不是完整產品發布。

`npm run assets:export` 產生 `dist/art` 的 15 張重畫／材質 PNG 圖集、297 個 frame records 與 JSON；與遊戲共用像素繪製函式，並非 ROM 素材或完成的高品質素材包。CI 另保留 `chrono-hd2d-art-review-kit`。

`npm run check:quality` 產生評估報告但不阻擋開發；`npm run release:check` 會阻擋未達標發布。圖集動作驗收與全部素材缺口，見 `assets/manifest.json`、`quality/scorecard.json`、`docs/QUALITY_AND_ASSETS.md`。

## GitHub Pages 開發試玩

已加入自動展示流程，僅採用 main 上完整 CI 成功的試玩 artifact，並保留原 HTML 的 exact bytes。展示頁會顯示版本／SHA／CI，清楚標示未完成。這不是 90 分正式發布。

首次啟用：repository **Settings → Pages → Build and deployment → Source 選 GitHub Actions**，再從 **Actions → GitHub Pages preview → Run workflow** 執行一次。之後每次遊戲 CI 成功會自動更新。尚未啟用時 workflow 只產生 staged preview，不會假裝已上線；目前實際狀態看 docs/STATUS.md。預定 project site 為 `https://kartchang.github.io/ChronoTrigger_reMaster/`，須以部署後實際 HTTP 驗證為準。

本機 HTML 的 IndexedDB 不會自動轉移到網頁；先從舊版匯出 JSON，再在網站遊戲內匯入／存檔。沒有雲端存檔同步。

0.5.1 加入使用實際碰撞資料的單人夥伴繞路，保留雙人控制及舊存檔。這一批不宣稱新增故事章節；整個重製仍持續開發。
