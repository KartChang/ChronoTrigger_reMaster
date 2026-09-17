# ChronoTrigger reMaster — HD-2D Prototype 0.1

**目前是可操作的技術原型，不是完成的《超時空之鑰》重製版。**

目標：最快能玩到 HD-2D 與本機雙人合作。採 TypeScript + Babylon.js，先做瀏覽器，不先做手機上架、Windows 安裝包或網路多人。

## 直接試玩

在 Actions 的 **Playable prototype CI** 成功 run，下載 `chrono-hd2d-playable` artifact，解壓後用 Chrome／Edge 開啟 `index.html`。遊戲與素材都在單一 HTML 內，不需要 Node.js、CDN、後端或 ROM。

`index.html` 原始碼模板不是遊戲成品；請用 artifact 或自行 build 後的 `dist/index.html`。

企業瀏覽器若禁止本機 HTML、WebGL 或 IndexedDB，需要改用允許的瀏覽器／環境。本機存檔可能隨瀏覽器資料清理而消失，請匯出備份。不要隨意變更檔案路徑後假設瀏覽器存檔仍可共用。

## 操作

| 功能 | P1 | P2 |
|---|---|---|
| 移動 | WASD | 方向鍵 |
| 攻擊 | J | 逗號 `,` 或數字鍵盤 1 |
| 技能 | K | 句號 `.` 或數字鍵盤 2 |
| 合技確認 | L | 斜線 `/` 或數字鍵盤 3 |
| 互動 | E | Enter |

C 切換 P2 加入／退出（探索模式限定）；Esc 暫停。也可按介面按鈕。

標準 Gamepad API：左搖桿／十字鍵移動，A 攻擊、X 技能、Y 合技、B 互動；P1 Start 暫停，P2 Start 加入／退出。Gamepad API 模擬測試不代表所有實體手把均已驗證；兩支手把建議依 P1、P2 順序連接並先按按鈕讓瀏覽器識別。共享鍵盤可能受鍵盤 ghosting 限制。

## 本版範圍

- 3D 村落、固定俯斜視角、程序式像素角色、光影與河流。
- 單人＋基本跟隨夥伴，或同機雙人共用鏡頭與各自輸入。
- 簡化 ATB、兩隻敵人、普通攻擊、技能、需要雙方確認的合技。
- 勝利／失敗後返回村落補給。
- 修復晶核、現在／未來切換，以及存檔後保留的事件旗標。
- IndexedDB 本機存檔，JSON 匯出／匯入，背景暫停。
- 觸控 P1 方向鍵、響應式介面。尚未驗證手機實機。

**不包含**原作完整場景／角色素材／劇情／音樂、原作數值還原、裝備系統、完整尋路、三人隊伍、連線多人、即時動作砍擊、原生 App 或安裝式 PWA。測試村落、旅人、守望者與共鳴斬均為自製佔位內容。

雙人操作不等於改成《聖劍傳說2》的即時動作戰鬥。本版保留 ATB 方向；若要 ARPG，需另行決定並重新設計命中、碰撞、敵人 AI 與合技平衡。

## 開發

需要 Node.js 22+：

```sh
npm ci
npm run check
npm run preview
```

開啟 `http://127.0.0.1:4173`。或 `npm run dev` 先建置再啟動本機伺服器（目前不含熱更新）。

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser_smoke.py
```

`src/core.ts` 不依賴畫面、DOM 或網路；`render.ts` 僅呈現場景；`input.ts` 管理玩家輸入；`save.ts` 管理 IndexedDB。測試觀察器僅在 `?test=1`／測試文件標記時提供唯讀快照，不能修改狀態。

依賴使用已驗證的固定版本及 lockfile，不聲稱是最新版本。初版用 esbuild 產生單一可攜 HTML，優先降低試玩安裝步驟。

## 資產與 repository

ROM、原作擷取素材、原聲帶、使用者上傳附件及密鑰不得提交。`.gitignore` 與 `check:assets` 阻擋常見 ROM/SPC 副檔名，但這不是完整著作權掃描。提供 ROM 並不代表可公開散布原作內容。本案尚未完成原作資產／公開發行授權確認。

保持私人 repository。未啟用 Pages、未公開部署、未變更可見性。第三方程式授權見 `docs/THIRD_PARTY.md`。

進度、已知限制與後續順序見 `docs/STATUS.md`。測試證據以 exact commit 的 CI artifact 為準。
