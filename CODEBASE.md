# 專案地圖

私人 repository：KartChang/ChronoTrigger_reMaster；目前在 main 開發。HD-2D、瀏覽器優先、同機雙人、保留 ATB。不是 GauAI／IoT Colony，也不是 .NET 後台。

## 執行與檔案

TypeScript + Babylon.js + esbuild，沒有後端。Node.js 22+ 只供建置；Python 只執行 Playwright 驗收。固定版本依 package.json／lockfile，不為此批次換引擎或升級套件。

| 路徑 | 職責 |
|---|---|
| index.html / src/style.css | 開始選單、HUD、雙人操作與響應式介面 |
| src/main.ts | UI 指令、固定步長、暫停、章節入口與存檔整合 |
| src/core.ts | 移動／碰撞、ATB、合技、章節事件與存檔白名單驗證 |
| src/fair-data.ts | 千年祭攤位 footprint、碰撞、互動座標及事件旗標型別 |
| src/fair-render.ts | 千年祭手製場景、鐘台、攤位、角色代理與傳送平台 |
| src/render.ts | 共用 Babylon 場景、舊村落／千年祭顯示切換、玩家像素與 HUD 特效 |
| src/input.ts | 鍵盤、觸控與標準 Gamepad API 的玩家所有權 |
| src/save.ts | IndexedDB；舊村落 slot1，千年祭 fair-slot1 |
| scripts/build.mjs | 單一 dist/index.html；build-meta 記錄 0.2.0 與 CI source SHA |
| scripts/test.mjs | 編譯純規則後跑 original core + fair tests |
| tests/core.test.mjs | 原有 32 項核心回歸測試 |
| tests/fair.test.mjs | 新場景、雙人事件、存檔、完整步行路線測試 |
| tests/browser_smoke.py | 原有 13 項 file/HTTP 瀏覽器檢查 |
| tests/fair_browser.py | 真實按鍵：鐘台、機器人合技、露卡、傳送、存檔／匯入 |
| .github/workflows/ci.yml | 兩段 browser journeys、private artifacts 與 exact source archive |

流程：Controls → main → core → render/HUD。規則不依賴 DOM 或 Babylon。固定步長 1/60 秒、單幀 delta 上限 0.1 秒；背景／對話／手動暫停不推進。低 FPS 與牆鐘時間不同，測試使用有限模擬 tick 預算與有限牆鐘保險上限，不改遊戲數值。

## 章節與存檔

`lab` 保留原創技術村落：兩隻敵人、晶核與現在／未來測試。`fair` 是從兩人已同行開始的千年祭場景試作，含鐘台、可選機器人戰鬥、露卡與短距離傳送。後續時門事件尚未完成。fair 攤位的畫面與碰撞共用資料，其餘地圖 authoring 尚未完全统一。

lab 匯出 v1；fair 匯出 v2，包含 chapter 和 fair flags。讀檔仍接受舊 v1，不強制改版。不同章節使用不同 IndexedDB key，匯入資料先驗證再替換遊戲狀態。測試 hook 僅唯讀 snapshot／paused。

## 指令與交付

```sh
npm ci
npm run check
npm run preview
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
python tests/fair_browser.py
```

preview 預設 4173；lab harness 自啟 4175，fair harness 自啟 4176。dev 是 build + serve，目前非 HMR。package 的版本標籤未隨場景 build revision 改動；build-meta 與画面版本是 0.2。

CI 全部成功才產生 chrono-hd2d-playable；chrono-hd2d-browser-evidence 包含報告／截圖與完整 tracked source tar.gz。沒有公開網站、安裝式 PWA 或原生安裝包。硬體／實體手把／手機效能尚需實測。

AI 規則看 AGENTS.md；唯一動態進度看 docs/STATUS.md；試玩看 README.md；本輪場景假設與限制看 docs/FAIR_SLICE.md。
