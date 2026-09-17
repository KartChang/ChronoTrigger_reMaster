# 專案地圖 — Reference art 0.5

KartChang/ChronoTrigger_reMaster，main 開發。HD-2D、瀏覽器優先、同機雙人、保留 ATB；不是其他專案的後台架構。2026-09-17 GitHub metadata 為 public，本批未變更可見性或部署。

## 目前模組

TypeScript + Babylon.js + esbuild；無後端。Node.js 22+ 用於建置，Python／Playwright 用於驗收，玩家不需安裝。固定相依見 package.json／lockfile。

| 路徑 | 職責 |
|---|---|
| index.html / src/style.css / src/adventure.css | UI 模板、村落樣式、冒險藍框對話與精簡 HUD |
| src/main.ts | 啟動、玩家指令、固定步長、暫停、存檔與演出整合 |
| src/core.ts | 移動碰撞、ATB、隊員有效性、事件、v1-v4 存檔驗證 |
| src/fair-data.ts / src/story-data.ts | 千年祭／開場／山道型別及碰撞資料 |
| src/kingdom-data.ts | 王國階段、四張地圖的共用碰撞與互動點 |
| src/fair-render.ts / src/canyon-render.ts | 千年祭與山道畫面 |
| src/kingdom-render.ts | 首次進入才建立城鎮／森林／大廳／王后房間 |
| src/pixel-art.ts | 克羅諾、瑪兒、露卡、NPC、魔物與樹冠像素 |
| src/render.ts | 共用 Babylon 場景、角色、鏡頭與呈現用斬擊／踏步 |
| src/input.ts | 鍵盤／觸控／Gamepad 所有權 |
| src/save.ts | IndexedDB：lab 的 slot1 與冒險 fair-slot1 分開 |
| scripts/build.mjs | 自含 HTML；build-meta 0.5.0 與 GITHUB_SHA |
| scripts/test.mjs | 純規則單元測試：core/fair/opening/kingdom |
| tests/kingdom_browser.py | 消費同一 CI 前段實際匯出的 v3 存檔，走新路線、驗 v4 |
| .github/workflows/ci.yml | 四段既有流程＋第五段素材／選敵操作、來源封存與 artifacts |

Controls → main → core → render/HUD。規則不依賴 DOM／Babylon。固定步長 1/60 秒、單幀 delta 上限 0.1 秒；暫停／背景／對話不推進。低 FPS 的牆鐘時間不等於模擬時間。

## 章節與隊員

lab 原創村落保留 v1；fair 從兩人已同行開始，未演出前為 v2；lost/pendant/canyon/vista 持久開場為 v3。瑪兒離隊後 inactive，不能接受控制或成為敵人目標。

從 vista 下山後 opening.phase 保留 vista，kingdom.phase 管新劇情：arrival/audience/erasing/missing/rescue。erasing 是暫態，不能存檔。rescue 才代表露卡已真實加入 P2，不代表王后救援已完成。可退回 canyon，進度仍是 v4。

城鎮、森林、大廳與房間是壓縮地圖，不是精確世界地圖。根節點首次進入建立後保留，共四張有限地圖；不是完整的資源串流系統。森林勝利獨立旗標，往返不重生。終點是西方修道院方向標記，內部尚未實作。

v4 驗證地圖／時代／開場前置／持久階段／角色數值與距離。v1-v3 格式保留，舊匯出不強制升版。所有冒險地圖共用既有存檔槽。測試 hook 僅唯讀 snapshot／paused。

## 指令與驗證

```sh
npm ci
npm run check
npm run preview
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
python tests/fair_browser.py
python tests/opening_browser.py
python tests/kingdom_browser.py
```

preview 4173；harness 依序自行啟動 4175、4176、4177、4178。kingdom 需接續 opening 的真實匯出檔；不得合成或直接改測試狀態。dev 目前 build + serve，非 HMR。

163 單元測試包含原有 133 項與新增 30 項；舊四段 browser journeys 不變。CI 全過才上傳 chrono-hd2d-playable；chrono-hd2d-browser-evidence 保存報告、截圖與 exact source tar.gz。本機 candidate 不等於已驗收 artifact，軟體 GPU 不等於真機效能認證。

規則 AGENTS.md；現行接續只看 docs/STATUS.md；玩法 README.md；來源與範圍 docs/KINGDOM_SLICE.md。

## 品質修正模組

`src/input-boundary.ts`：start/load/import 同步 rebase；模擬階段切換只清一次輸入。`scripts/asset-export.mjs`：同源程序式像素匯出 PNG／JSON，不是 ROM extractor 或外部圖集 importer。`scripts/quality.mjs`：固定加權、證據、runtime digest、必需素材與 release gates。`quality/scorecard.json` 是受評版本快照；live TODO 仍只有 STATUS.md。

assets:export → dist/art（15 重畫圖集／297 frame records）；check:quality → test-results/quality-report.json；release:check 未達標 exit 1。build 會產生 art review 與 QUALITY_STATUS.json；新增素材／品質測試不改原四段 browser journeys。

## 原版對照美術與戰鬥目標

`src/hero-art.ts` 統一三名角色／七種姿態；`src/pose-player.ts` 控制 presentation clip 時間，不改 core 傷害／ATB；`src/world-art.ts` 以 north=+z 的同源座標製作地表與石材。`core.ts` 的 transient targets 及 selectedEnemy/cycleTarget 分開 P1/P2 目標；存檔白名單不保存此暫態。

`tests/reference_browser.py` 為第五段實際鍵盤／按鈕驗收，自行開 4179。`__CHRONO_TEST__.view()` 是 render frame/pose/mesh 的 cloned observation，並非改狀態指令。新來源索引不含原作圖片bytes。
