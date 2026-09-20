# 專案地圖 — 瀏覽器 HD-2D 與冒險模組

Repository：KartChang/ChronoTrigger_reMaster；main；HD-2D、瀏覽器、同機雙人與 ATB。實際提交／CI／Pages 狀態只看 docs/STATUS.md，不從本文件推定已上線。

## 執行與製作模組

TypeScript + Babylon.js + esbuild；沒有後端。Node.js 22+ 用於建置，Python／Playwright 用於驗收，不是玩家安裝條件。相依固定版本及 lockfile 沿用既有工具鏈。

| 路徑 | 職責 |
|---|---|
| index.html / src/style.css / src/adventure.css | UI、冒險藍框對話、双人與第三隊員面板 |
| src/main.ts | 啟動、指令、固定步長、暫停、存讀檔及演出整合 |
| src/core.ts | 碰撞、ATB、有效队員、選敵、合技、回復藥、事件、v1–v7 存檔白名單 |
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

## 原有階段與隊員（0.6 基礎；本批增量見下節）

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

原0.6規則套件260項，本批375項；實際結果只看 STATUS 與相符CI。原0.6素材26張PNG，本批42組PNG/JSON、421筆影格資料，不等於402張獨特原作動畫。外部編輯後圖集的通用回匯仍未做。

CI 成功才產生 chrono-hd2d-playable；證據含 exact source tar、報告、截圖與使用者流程匯出檔。Pages 只部署已通過來源，deployment.json 記錄 source／CI／artifact／HTML hash；資料與 HTML 原封不動核對。CI／Pages 成功不代表畫面或整款達90分。

穩定規則 AGENTS.md；章節契約 docs/RESCUE_SLICE.md；來源 assets/reference-index.json；動態進度唯一 docs/STATUS.md。

## Trial/prison extension (0.8 candidate)

`src/trial-data.ts` defines staged maps/collision and authored tank components. `src/trial-rules.ts` owns trial choices, alternate escape, inventory and v7 whitelist validation; core delegates and retains v1–v6. `src/trial-render.ts`/`trial-art.ts` use the existing renderer/export pipeline. `tests/trial_browser.py` consumes the preceding same-run rescue export (not the unit fixture) and tests both escape routes. `docs/TRIAL_T03.md` separates implemented function from remaining original-fidelity work. Exact source/run belongs to STATUS.

- `src/art-profile.ts`: executable production scale/camera/bridge/animation contract; project conventions, not ROM claims.
- `src/material-art.ts` / `src/material-runtime.ts`: shared integer-pixel material export/runtime, scene caching and size-based UV; no original bytes.
- `docs/ART_PRODUCTION_CONTRACT.md`: applied art rules and actual pending review gates.

## 現有背包／裝備的獨立呈現層

`src/equipment-ui.ts` 沿用 `src/equipment.ts`／core 裝備規則，呈現角色、買賣、換裝與可收合說明；說明展開狀態不進存檔。`src/modal-focus.ts` 管理既有 modal 的焦點、背景 inert、換裝同列焦點與背包 PageUp/PageDown/Home/End。`src/inventory.css` 由 build 接在 adventure.css 之後，將背包標頭、可捲動內容與回饋列分開；不更動場景 renderer。`tests/equipment_browser.py` 沿用同 run 真實 v6 匯出與原生選檔旅程，使用 `tests/inventory_comfort.py` 量測七種視窗；`inventory_comfort_test.py` 的合成幾何僅測量測斷言，不是遊玩證據。舊段落的批次數字與裝備未完成敘述只描述當時切片，不得據此重造框架；目前完成範圍與 exact CI 一律看 STATUS。

## 呈現生命週期與原生匯入（VQ01H / 0.9.7）

`src/presentation-state.ts` 的 `takeFrameEffects` 只由未暫停的 main-loop 交付效果，`World.draw` 接收 readonly effect batch，不再清除 `State.effects`。`FeedbackClock` 只計算未暫停閱讀時間。`src/render.ts` 在 state identity 或章節變更時清理自有傷害數字／揮擊 meshes、突進及姿勢歷史；不重建共用人物、場景或資產。`src/save-import.ts` 的原生請求／讀取／取消生命週期不變。

`tests/native_import.py` 為八份實際旅程共用原生選檔 driver；保留完整 snapshot 相等斷言，失敗報告新增差異欄位路徑與完整 hash，不排除 effects 或 ticks。`tests/presentation-pause.test.mjs` 執行 production 方法配合事件／圖形 ports，屬單元測試，不是 WebGL 或真機證據。`keyboard_browser.py` 才驗證實際原生匯入後的 transient 清理及暫停時的提示閱讀時間；最新結果／來源／雲端收據只看 STATUS 指定的當前 CI checkpoint。

## 初遇邊界與提示（VQ01I / 0.9.8）

`src/prologue-data.ts` 的 `prologueHint` 依原有距離／優先序返回查看女孩、拾取／歸還項鍊與同行邀請文字，不寫入劇情資料；`main.ts` 將文字與單雙人正確按鍵接到既有互動按鈕。`adventure.css` 只在初遇探索狀態調整字級、按鈕尺寸及提示位置，不替换場景 renderer。

`tests/meeting_approach.py` 與唯讀 `meeting-approach-probe.js` 識別現有近距離 collision 邊界，於任一原路徑步驟停止舊座標等待並釋放按鍵。`tests/early_comfort.py` 由兩條真實序章旅程觀察三種 viewport 的 DOM 邊界並保存截圖；對應單元測試的事件替身／合成幾何不能作為實際畫面證據。驗證結果與接續一律看 STATUS。

## 前段鏡頭整合（VQ01K / 0.9.10）

`src/early-comfort.ts` 與 `src/camera-motion.ts` 分別沿用保存的 VQ01B 框景與 VQ01C 固定 tick 緩動，非重寫。`src/early-camera-view.ts` 唯讀觀察既有 sprite 的實際變換頂點，將腳底支點、縮放、突進納入框景，再透過 Babylon camera 投影輸出觀察矩形。`World.frameEarlyScene` 整合有效隊員、附近既有可見互動對象與加藤；依 state identity、章節／模式、視窗及 reduced-motion 重置或約束回應。起床鏡頭、大地圖及後段維持既有規則。`inspectEarlyCamera` 複製輸出，不提供寫入遊戲狀態或 live frame 的介面。

`tests/early_camera.py` 接到原有序章旅程，觀察房間／家中／初遇視窗、真實暫停與原生匯入後取景；reduced-motion 是媒體模擬而非真機。相應 Node NullEngine 與 Python 合成幾何只測方法／斷言；實際接受狀態看 STATUS。沒有啟用保存中的 full-scene／occlusion renderer，沒有改 core、輸入、存檔或重畫素材。

## 人物腳底與陰影（VQ01L / 0.9.11）

`src/hd-hero-art.ts` 採用保存的 VQ01A 四主角 painter，不是另畫素材。`src/sprite-contact.ts` 依實際 sprite scale 與 texture pivot 對齊畫面腳底和自有陰影；`World.groundActors` 使用呈現突進位移但不修改 core 座標，保留起床姿勢及大地圖縮放。`fair-conduct-render.ts` 將保存的可見 NPC 接地設計接上共用 placement，附近販商與主人沿用既有框景。適用目前無旋轉／單位縮放的角色根節點，不宣稱任意父變換支援。

`inspectSpriteContacts` 由實際 mesh world matrix 量測腳底支點，回傳複製值；World 保留有上限的突進觀察，在換檔／場景時清除。`tests/actor_grounding.py` 接到既有 HD 人物與裝備旅程，記錄實際商店／戰鬥／匯入後接地與截圖。對應 NullEngine／合成幾何僅為方法及斷言測試，原版 painter hash 證明重用而非美術分數；瀏覽器、實體裝置與最終畫面接受狀態只看 STATUS。

## 原生選檔監聽與簡潔提示（VQ01M / 0.9.12）

`tests/native_chooser.py` 在新頁面 about:blank 時登記公開 FileChooser listener，跨導覽／reload 保留，回呼僅計數；`native_import.py` 與裝備旅程的既有匯入 driver 讀取複製計數並要求每次正好一個新事件。仍使用真正的按鍵／點擊／tap 及 FileChooser.set_files，不寫遊戲狀態，不呼叫 CDP 或私有協定；各頁關閉時釋放記錄。`native_chooser_test.py` 的延遲協定模型與 AST 接線檢查不是作業系統選檔證據。

`adventure.css` 僅在初遇探索的 quiet 模式隱藏重複浮動文字；具體動作按鈕及 guide 模式保留。`early_comfort.py` 透過真正的 display 按鈕測試 guide／quiet，保留原幾何斷言，新增簡潔模式的可讀性／焦點／故事狀態檢查並恢復原偏好。實際來源／驗收只看 STATUS。
