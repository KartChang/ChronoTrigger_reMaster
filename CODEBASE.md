# 專案地圖 — Opening 0.3

Repository：KartChang/ChronoTrigger_reMaster；main 開發。2026-09-17 GitHub 實查為 public，本批未變更可見性。HD-2D、瀏覽器優先、同機雙人、保留 ATB。不是 GauAI／IoT Colony 或 .NET 後台。

## 模組

TypeScript + Babylon.js + esbuild；沒有後端。Node.js 22+ 供建置，Python 供 Playwright 驗收，玩家不需安裝。固定相依版本以 package.json／lockfile 為準。

| 路徑 | 職責 |
|---|---|
| index.html / src/style.css | 基礎 UI 與舊村落樣式 |
| src/adventure.css | 千年祭／山道的精簡探索 HUD 與藍框對話 |
| src/main.ts | 啟動、UI 指令、固定步長、暫停、存檔及演出整合 |
| src/core.ts | 移動碰撞、ATB、合技、開場演出、有效隊員、事件與存檔驗證 |
| src/fair-data.ts / src/story-data.ts | 千年祭互動、章節型別、開場階段、山道共用碰撞資料 |
| src/fair-render.ts / src/canyon-render.ts | 兩張冒險地圖；只呈現事件狀態，不決定進度 |
| src/pixel-art.ts | 手製角色、魔物與樹冠像素繪製 |
| src/render.ts | 共用 Babylon 場景、地圖切換、角色可見性、鏡頭與特效 |
| src/input.ts | 鍵盤、觸控與標準 Gamepad API 的玩家所有權 |
| src/save.ts | IndexedDB：lab 用 slot1；fair 與 canyon 共用 fair-slot1 |
| scripts/build.mjs | 合併兩份 CSS，打包單一 HTML；build-meta 為 0.3.0 與 source SHA |
| scripts/test.mjs | 編譯純規則，執行 core/fair/opening 單元測試 |
| tests/core.test.mjs / tests/fair.test.mjs | 原有 53 項回歸測試，未改動 |
| tests/opening.test.mjs | 26 項演出、隊員離隊、山道與 v3 存檔測試 |
| tests/browser_smoke.py / tests/fair_browser.py | 原有實際操作瀏覽器驗收，未改動 |
| tests/opening_browser.py | 新增項鍊、山道、單人遭遇戰、v3 reload／錯誤匯入驗收 |
| .github/workflows/ci.yml | 三段 journeys、exact source archive 與證據／試玩 artifact |

流程：Controls → main → core → render/HUD。規則不依賴 DOM／Babylon。固定步長 1/60 秒；單幀 delta 上限 0.1 秒。背景／對話／手動暫停不推進。低 FPS 牆鐘時間不等於模擬時間。測試使用有限 tick 與牆鐘預算，不修改遊戲速度來過關。

## 章節與存檔

lab 是原創村落技術測試，保留 v1；fair 從兩人已同行的千年祭開始，未開始新事件前保留 v2。演出透過 approach/resonance/lost/pendant/crossing/canyon/vista 階段串到 600 年山道。

瑪兒消失後 inactive；P2 設定保留但不能移動、攻擊、累積 ATB 或成為敵方目標。山道只有克羅諾，重聚尚未製作。

v3 僅保存持久階段 lost/pendant/canyon/vista；不保存／匯入演出中的 transient state。驗證來源、章節、時代、前置旗標、角色座標與數值。fair/canyon 共用冒險槽，lab 不覆蓋。測試 hook 僅唯讀 snapshot／paused。

## 指令

```sh
npm ci
npm run check
npm run preview
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
python tests/fair_browser.py
python tests/opening_browser.py
```

preview 4173；三個 harness 自行啟動 4175／4176／4177。dev 是 build + serve，目前非 HMR。package 舊版本標籤未調整，以 build-meta 區分產物。

CI 全部通過才上傳 chrono-hd2d-playable；chrono-hd2d-browser-evidence 包含報告、截圖及 tracked source tar.gz。本地 candidate 不等於已驗收 artifact。沒有公開遊戲部署、安裝式 PWA 或原生包；實體裝置效能未認證。

AI 規則：AGENTS.md；唯一動態進度：docs/STATUS.md；操作：README.md；忠實度與範圍：docs/OPENING_SLICE.md。
