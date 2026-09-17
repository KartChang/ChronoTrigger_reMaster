# AI coding 準則評估與遊戲化調整

評估日期：2026-09-17。
來源：使用者上傳 `ai_project_md_template_dotnet_sme_v1.zip`。
SHA-256：`cd8eca6bc0cb9811fa2bddbb913a9d1ad37978b077afd92ad4a060d3c9e8a05b`。

## 結論

通用協作與交付原則有用，但原始模板不是可直接套用的遊戲開發準則。保留方法，改寫專案實作邊界；不把 .NET 後台、其他 AI 產品設定及整套角色庫搬進本案，也不重建已存在的 TypeScript／Babylon 原型。

Archive 共 336 個檔案、289 份 Markdown，解壓後總大小約 3.50 MiB。檢閱重點是根目錄 AGENTS／CODEBASE／CLAUDE／session 與 tracker，以及 reference 中的憲章、架構、風格、未知管理、務實交付與 AI/RAG 契約；角色目錄與範例程式已盤點，未逐一審閱其全部實作。沒有執行模板腳本，也沒有把原始 ZIP 提交到 repo。

## 保留的核心

- 修改前先讀最新 source；保留手動修改，遵循真實專案慣例。
- 最小必要修改、按風險驗證，避免過早抽象、額外框架及無關重構。
- 不捏造 build／test 成功，不以代理自述取代驗收。
- 規則按需載入、持久化接續點，減少靠聊天記憶及重讀歷史。
- 未知資料與假設分開記錄，真正有副作用的決策先確認。

## 必須修正的地方

| 原文位置 | 發現 | 本案處理 |
|---|---|---|
| `CODEBASE.md` §1／§3；`reference/project_constitution.md` §0 | 可選架構限定 .NET／Dapper／SQL／Serilog／Razor／React 等後台型態 | 改寫成現有遊戲模組地圖，不先做帳號、DB 或 API |
| `AGENTS.md` §2 token 規則 | 寫「對話是本產品核心」，強制 AI actor／RAG／長對話矩陣 | 本案核心是探索、ATB、合作、事件與存檔；不帶入 AI 客服產品前提 |
| `AGENTS.md` §2 subagent／standing worker | 固定模型、`canonical DB`、`18766` 與其他環境授權 | 刪除不屬本案的上下文；只用當前真實工具與明確授權 |
| `AGENTS.md` §2 對照 §8；core constitution／SOP subagent 章節 | 前段允許不另詢問的子代理，後段又預設禁止 | 統一預設單代理；委派須能力真實、授權清楚、單檔單 writer |
| `AGENTS.md` §9 Implement 對照 `unknown_management.md` §4 | 廣泛禁止 placeholder，但 prototype 章節允許 fake data，邊界不清 | 明確允許標示的原創佔位美術／fixture；禁止假功能、假驗證與假還原聲明 |
| 架構核准與未知訪談規則 | 全部套用可能讓小型可逆實作反覆等核准 | 既定範圍內直接推進；引擎、戰鬥改制、網路、公開發行、付費與破壞性操作另行確認 |
| `session-update.md`；SOP §12；多份 tracker | 同一進度容易分散，強制每次同步所有文件增加成本 | `docs/STATUS.md` 為唯一動態狀態；CODEBASE 只記穩定地圖 |
| `AGENTS.md` §3.2 的一般後台驗證基線 | ModelState／attribute 的預設不適用任意匯入資料 | 不移除現有存檔 schema、大小、數值、位置與版本驗證 |

這些是模板在本專案的適用性調整，不是宣稱所有後台專案也應採用遊戲架構。

## 補上的遊戲開發契約

1. 規則與渲染分離；固定步長、背景暫停、低幀率與真實效能分別驗證。
2. 同機雙人所有權、加入／退出、裝置斷線、鏡頭範圍及兩人合技原子性。
3. 版本化存檔、匯出／匯入與真正 reload 後的事件一致性。
4. 素材與原作資料的來源／版本／授權範圍；未核實數值不得當原作數值。
5. 區分工程驗收、原型佔位、忠實章節、美術品質與實體裝置認證。
6. 能真正操作的一小段遊戲優先於巨大文件庫，但不因「快」省掉關鍵規則驗證。

## 落地文件

- `AGENTS.md`：本案精簡規則與紅線。
- `CLAUDE.md`：只引用 AGENTS，不複製另一份規則。
- `CODEBASE.md`：依實際 source 填寫的遊戲地圖與現有指令。
- `docs/STATUS.md`：沿用並更新既有接續文件。
- 本評估：保留調整理由；不是每次工作都必讀的前置資料。

沒有整包匯入 `.agent/personal`。game designer、level designer、technical artist、audio 等角色分工可以作為後續檢查視角，但角色提示詞不是已安裝的引擎、工具或會自動合作的代理。

## 本輪 CI 修正的證據與邊界

接手 HEAD `dbe7517a39a6b165cc80681351f7617f0dc1a0bc`，最新 CI #4／35203279913：32 項核心測試、TypeScript 與建置通過；6 個 browser checkpoints 通過，接著首次 ATB 等待 20 秒逾時。

從該 run 的 `02-explore.png` 可見約 1 FPS。`src/main.ts` 每幀 delta 上限 0.1 秒，`core.ts` 的 ATB 速率是每模擬秒 0.42，因此從空條充滿需約 2.38 模擬秒（固定步長約 143 ticks）。在 1 FPS 情境，20 秒牆鐘可能只推進約 2 秒模擬時間。這支持低速渲染造成等待預算不足的診斷；原失敗報告沒有 ATB／tick 快照，不能因此排除其他狀態問題。

本輪僅修 harness：以觀察到的模擬 ticks 設定 readiness 預算，保留 90 秒有限牆鐘上限；暫停、非預期模式、P2 所有權遺失或超出 tick 預算即失敗，保存診斷。ATB、damage、MP、暫停實作與所有 22 個既有 assert 不變。

本機完成 Python 語法／AST 檢查、13 個 wait predicate 合成斷言，以及既有 assertion 結構比對。這不是 browser acceptance；新 E2E 結果仍須由 exact commit 的 CI 證據確認。
