# 專案地圖

## 範圍

Repository：`KartChang/ChronoTrigger_reMaster`，私人；目前在 `main` 開發。
目標：Chrono Trigger HD-2D 重製。當前產物：原創佔位場景的系統原型，不是完整重製或忠實章節。
使用者優先：盡快試玩、雙人操作。現行選擇：瀏覽器、同機合作、保留 ATB；即時 ARPG、網路多人與原生上架未定案。

## 已存在技術與入口

瀏覽器遊戲：TypeScript；3D 呈現：Babylon.js；建置：esbuild；本機進度：IndexedDB；樣式：CSS／HTML。沒有後端 API 或業務資料庫。

固定相依版本見 `package.json` 與 `package-lock.json`。Node.js 22+ 用於建置／測試，不是玩家執行遊戲所需的後端。Python 只執行 Playwright 驗收腳本，不是遊戲語言。

| 路徑 | 職責 |
|---|---|
| `index.html` | UI 模板；不是已打包遊戲 |
| `src/main.ts` | 啟動、UI 指令、固定步長、暫停與模組整合 |
| `src/core.ts` | 探索移動／碰撞、簡化 ATB、合技、時代旗標、存檔 schema |
| `src/input.ts` | 鍵盤、觸控與標準 Gamepad API 的玩家輸入 |
| `src/render.ts` | Babylon 3D 世界、程序式像素角色、動畫與呈現 |
| `src/save.ts` | IndexedDB 存取 |
| `src/style.css` | 遊戲介面與響應式排版 |
| `scripts/build.mjs` | 將程式與資源打包為 `dist/index.html` |
| `scripts/check-assets.mjs` | 常見 ROM／SPC 副檔名檢查；不是著作權完整稽核 |
| `tests/core.test.mjs` | 規則與存檔的單元驗證 |
| `tests/browser_smoke.py` | 真實 Chromium：啟動、輸入、戰鬥、存檔、穿越與排版 |
| `.github/workflows/ci.yml` | GitHub-hosted 建置、單元與 browser journey、artifact |

## 主要流程

玩家裝置 → Controls → main 指令／固定 step → core 狀態 → World 與 HUD。
存檔：core serialize → save IndexedDB；讀檔／匯入：core deserialize 驗證 → main 替換狀態。

主迴圈固定步長 1/60 秒；單幀累計 delta 上限 0.1 秒。低 FPS 下模擬時間可能慢於牆鐘時間，不能把軟體 GPU 跑 20 秒當成模擬必然走了 20 秒。真機效能仍需獨立驗證。

目前只有兩名佔位角色、一張村落地圖的現在／未來變體、兩隻敵人的練習戰鬥、一次晶核修復事件、一個存檔槽與匯入／匯出。數值是原型值。

## 指令

```sh
npm ci
npm run check
npm run preview
```

`check` 執行資產副檔名檢查、單元測試、TypeScript 檢查與建置。`preview` 預設啟動本機 4173；`dev` 先 build 再 serve，目前不是 HMR。

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
```

browser harness 會自行啟動 4175。`?test=1` 提供唯讀狀態快照與暫停觀察。simulation waits 使用 tick 預算與 90 秒牆鐘保險上限，失敗記錄到 `test-results/wait-evidence.json`，不更改遊戲時間。

## 交付與限制

CI 成功才產生 `chrono-hd2d-playable` artifact，內含 standalone HTML、build metadata 與第三方授權文件；證據在 `chrono-hd2d-browser-evidence`。這不是公開網站網址。

目前不含原作完整地圖、角色／音樂、故事章節、三人隊伍、背包裝備、完整尋路、網路多人或原生 App。局部 follow steering 與場景／碰撞共同資料化尚待改善。

使用說明看 `README.md`；唯一現行進度看 `docs/STATUS.md`；AI 規則看 `AGENTS.md`。不要把本文件當 CI 即時結果。
