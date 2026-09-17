# 專案地圖 — 修道院救援 0.6

Repository：KartChang/ChronoTrigger_reMaster；main；HD-2D、瀏覽器、同機雙人與 ATB。實際提交／CI／Pages 狀態只看 docs/STATUS.md，不從本文件推定已上線。

## 執行與製作模組

TypeScript + Babylon.js + esbuild；沒有後端。Node.js 22+ 用於建置，Python／Playwright 用於驗收，不是玩家安裝條件。相依固定版本及 lockfile 沿用既有工具鏈。

| 路徑 | 職責 |
|---|---|
| index.html / src/style.css / src/adventure.css | UI、冒險藍框對話、双人與第三隊員面板 |
| src/main.ts | 啟動、指令、固定步長、暫停、存讀檔及演出整合 |
| src/core.ts | 碰撞、ATB、有效队員、選敵、合技、回復藥、事件、v1–v5 存檔白名單 |
| src/input.ts / src/input-boundary.ts | 鍵盤／觸控／Gamepad 所有權；狀態替換同步 rebase，階段切換清除一次舊輸入 |
| src/navigation.ts | 有界確定性 A*；跟隨走現有 collision，不瞬移、不控制已加入的 P2 |
| src/fair-data.ts / src/story-data.ts / src/kingdom-data.ts | 千年祭、開場、山道、王國共用地圖／互動資料 |
| src/rescue-data.ts | cathedral/passage/sanctum 碰撞、互動點、救援階段與第三角色資料 |
| src/render.ts | 共用 Babylon 畫面、相機、角色動畫、目標提示、第三角色／敵人與特效 |
| src/fair-render.ts / src/canyon-render.ts / src/kingdom-render.ts / src/rescue-render.ts | 各地圖呈現；王國及修道院首次進入才建立，根節點依章節啟用 |
| src/pixel-art.ts / src/hero-art.ts / src/world-art.ts / src/rescue-art.ts | 同源手製像素與地表；不是 ROM 資產 |
| src/pose-player.ts | 純呈現動畫影格／时间，不改 core 傷害與資源 |
| src/save.ts | IndexedDB；技術村落 slot1 與冒險 fair-slot1 分開 |
| scripts/build.mjs / scripts/asset-export.mjs | 自含 HTML、source metadata、PNG＋JSON 圖集 |
| scripts/quality.mjs / quality/scorecard.json / assets/manifest.json | 有來源綁定的評估、素材階段與 90 分發布門檻 |
| .github/workflows/pages.yml / scripts/pages-package.mjs / site/ | 取得通過 CI 的 exact artifact，不另建置；展示頁與 play/ 分離 |

Controls → main → core → render/HUD。core 不依賴 DOM／Babylon。固定步長 1/60 秒、單幀累計上限0.1秒；暫停／背景／對話不推進。軟體 GPU 牆鐘時間不是遊戲模擬時間。

## 階段與隊員

lab 保留 v1；fair 未開始異變為 v2；持久的 lost/pendant/canyon/vista 為 v3。瑪兒消失後不可控制／受擊。kingdom.phase 的 rescue 只表示露卡加入，不表示救援已完成；該路線為 v4。

修道院首次進入後，rescue.stage 依 entered → cleared → allied → rescued → homecoming → reunited → returned 推進，開始輸出 v5。管風琴、守衛、頭目、箱內大臣與補給旗標分開。三張地圖是壓縮重建，不是完整原版迷宮。

P1 克羅諾，P2 露卡；第三角色在 allied/rescued 為青蛙，homecoming 離隊，reunited/returned 為瑪兒。第三角色有獨立 HP／MP／ATB、敵方可命中、A* 跟隨與自動攻擊／回復，並非 P3 或自由 roster 選角。隊伍全滅需所有有效角色倒下。回復藥只是單一物品；完整背包／裝備／成長未完成。

v1–v4 不強制破壞升版。v5 檢查地圖／時代／前置旗標／角色及補給，不還原 transient ATB、effects、targets 或 followPlan。冒險仍共用存檔槽。readonly snapshot/paused/view 不提供直接設旗標或瞬移能力。

## 指令與驗收

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
python tests/reference_browser.py
python tests/navigation_browser.py
python tests/rescue_browser.py
```

preview 是4173；七段 browser harness 自行啟動4175–4181。kingdom 消費同次 opening 真正匯出的 v3；rescue 消費同次 kingdom 真正匯出的 v4，不製造存檔。舊六段斷言保留。完整 job 有45分鐘有限上限，不為過關放寬遊戲等待條件。dev 是 build＋serve，非 HMR。

本地規則套件260項，含原有195項與65項救援／美術測試；實際結果只看 STATUS 與相符CI。素材輸出26張PNG、402筆影格資料，不等於402張獨特原作動畫。外部編輯後圖集的通用回匯仍未做。

CI 成功才產生 chrono-hd2d-playable；證據含 exact source tar、報告、截圖與使用者流程匯出檔。Pages 只部署已通過來源，deployment.json 記錄 source／CI／artifact／HTML hash；資料與 HTML 原封不動核對。CI／Pages 成功不代表畫面或整款達90分。

穩定規則 AGENTS.md；章節契約 docs/RESCUE_SLICE.md；來源 assets/reference-index.json；動態進度唯一 docs/STATUS.md。
