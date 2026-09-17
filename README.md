# ChronoTrigger reMaster — HD-2D Prototype 0.2

**目前是千年祭場景與雙人 ATB 的開發試作，不是完整重製版。**

TypeScript + Babylon.js，先讓瀏覽器直接遊玩；不先做會員後台、手機上架、Windows 安裝包或網路多人。

## 試玩

在 Actions 的 **Playable prototype CI** 找到成功 run，下載 `chrono-hd2d-playable`，解壓後用 Chrome／Edge 開啟 `index.html`。完整程式在單一 HTML，不需要 Node.js、CDN、後端或 ROM。repository 根目錄 index.html 是模板，不是建置成品。

0.2 開始畫面提供「千年祭 · 單人開始／雙人開始」，下方仍保留舊版「技術村落」。CI #5 的 0.1 artifact 只有舊村落；新內容是否完成驗收以 docs/STATUS.md 的 exact run 為準，不以 main 上有程式就認定通過。

千年祭可走到左側鐘台互動、向西挑戰岡薩雷斯，或直接向北找露卡。和露卡交談後，靠近左側傳送圓盤互動，會移動到右側平台。機器人挑戰不是傳送的必要條件。完整時門、項鍊與 600 年地圖尚未製作。

## 操作

| 功能 | P1 | P2 |
|---|---|---|
| 移動 | WASD | 方向鍵 |
| 攻擊 | J | 逗號或數字鍵盤 1 |
| 技能 | K | 句號或數字鍵盤 2 |
| 合技確認 | L | 斜線或數字鍵盤 3 |
| 互動 | E | Enter |

C 在探索時加入／退出 P2；Esc 暫停。戰鬥等 ATB 充滿再下指令。雙人合技需雙方確認，各有足夠 MP／ATB。单人時夥伴自動跟隨和攻擊。觸控方向鍵目前只提供 P1。

標準 Gamepad API：搖桿／十字鍵移動，A 攻擊、X 技能、Y 合技、B 互動；P1 Start 暫停，P2 Start 加入／退出。API 模擬不等於所有實體手把已認證；共享鍵盤可能受 ghosting 限制。双人操作不代表已改成即時動作 ARPG；目前仍保留 ATB。

## 存檔

技術村落使用原來的 v1 與 IndexedDB slot1；千年祭使用 v2 與獨立 fair-slot1。讀檔、JSON 匯出／匯入都會驗證資料，舊 v1 仍可使用。檔案路徑或瀏覽器資料清除可能影響本機儲存，請另外匯出備份。不能假設換了 HTML 路徑還會共用 file:// 存檔。

## 已有與未完成

已有：兩個場景入口、同機雙人／基本跟隨、共用鏡頭、簡化碰撞、ATB、合技、勝敗補給、千年祭互動、舊村落跨時代旗標、本機存檔与備份。

千年祭美術是手製像素代理＋3D 場景 blockout，配置已重排；不是原作地圖／素材擷取或最終美術。數值、通用技能與合技尚非原作還原。尚無完整開場、原作音樂、背包裝備、完整尋路、三人隊伍、連線合作、原生 App 或實體裝置認證。

## 開發

```sh
npm ci
npm run check
npm run preview
```

需要 Node.js 22+；preview 預設 http://127.0.0.1:4173。詳見 CODEBASE.md。browser 測試需要 Python 與 tests/requirements.txt。

素材與 ROM／使用者上傳附件不提交、不打包。沒有公開部署或變更 private 可見性。程式第三方授權見 docs/THIRD_PARTY.md，場景來源與假設見 docs/FAIR_SLICE.md。取得 ROM 不等於已確認原作內容的公開發行授權。
