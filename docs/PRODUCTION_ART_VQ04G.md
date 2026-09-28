# VQ04G — 真實故事 NPC 朝向／招呼與 exact CI Pages 選取

本批宣告 0.9.80；source／matching CI／雲端位置以 STATUS、checkpoint、publication 收據為準。完整美術／動畫／裝置／聆聽批准仍 false，newScore=null／releaseBLOCKED。

## 真正接入的美術

沿用 E 的 production-story-npc-art 作者 bytes，不重新畫圖或替換原 native goldens。七類故事 NPC 的四方向 ambient／greet，每姿勢每方向四格，共224個可由正式 runtime 選用的欄位；前代只有28個前向 ambient，故新增可選用196格。七張 G activation PNG 與224逐格 hashes 同作者 API，獨立測試匯出與 build 匯出一致。可選用不等於每格已有原生樣本。

112個 walk 欄位仍 staged，不新增 NPC 位移／導航；四主角256個 combat 作者欄位仍 runtimeApplied=false。E 歷史匯出之 ambient-only 標記保留為前代紀錄，由 G activation manifest 明示接續，作者圖本身未改。

NpcAttention 僅複製 active、存活、位置有限的現有隊員0/1資料；不保存 State 引用、不寫入任務／HP／位置／時間／存檔或碰撞。自主第三與既有 fixed ATB／A*／InputBoundary 不改。探索時以最近實際隊員決定朝向，近距離招呼；選人、斜向軸及距離均有有限滯後，避免邊界抖動。章節切換、過場、非探索、無有效隊員／非法 tick 回預設；退離後恢復原向，不宣稱原作逐格 choreography 已批准。

## 真正 owned upload 與資源界線

原八個 NPC mesh 名稱／parent allowlist、48×64來源逐 byte 辨識、材質／貼圖獨占、this／參數／回傳／例外傳遞、換owner／resize／dispose／held還原皆保留。新增選取只把已辨識 legacy frame 對應至真實 authored facing／pose；未知 RGBA 不改寫，source frame仍由原 producer clock 提供。原框架不增加測試或裝置旁路。

source frame／朝向／姿勢 key 相同不重上傳；只在實際選取改變時更新原 owned texture。仍最多12 binding、0新增GPU texture，最多294912 bytes retained CPU RGBA；最多12個presentation choice。切scene及dispose釋放，母親與held prologue維持原 bytes。

## Pages97缺口與本批修正

CI103成功但Pages97 prepare選取步驟失敗，原錯誤為找不到可接受的same-repository main CI；沒有staging或deployment。原API success-list response沒有記錄，不能斷言是哪一種provider一致性問題。Pages97保持failure，不rerun。

workflow_run現在直接GET觸發它的runId，保留checkRun原successful／same-repository／main／CI path／40hex source檢查，並比對trigger id、SHA與attempt；不fallback到較舊成功run。原artifact唯一、未過期、source/repository identity及digest檢查不改。移除Pages獨立push觸發，避免同一source push先選舊CI；保留CI完成的workflow_run及既有explicit workflow_dispatch能力，本批沒有手動dispatch。

## 完整本批驗證與限制

專屬76 Node：全部八owned mesh、224作者方向／姿勢欄位、原上傳語義、unknown、held、切場、資源上限／释放、read-only State，以及正式current ArtDirectedWorld實際CPU畫面。托魯斯旅店NPC與城堡守衛的整張framebuffer確有新像素；11個非target／held場景與F逐byte相同，原幾何／camera／非NPC貼圖／gameplay資料不變。Pages19項新增測試與原17项皆通過。

最終完整Node3501／3501、Python625／625，assets、quality schema、typecheck、build均exit0；703檔source測試前後一致。早期新增offline fixture三失敗保留：初始章節phase不符P2顯示條件，以及townsperson被屋頂遮住使整張frame相同；修正的是新增離線fixture，不改原native route/capture或放寬斷言。

G→F SOURCE-only inverse、F→E/D/C/B/A傳遞及原pins保留；14舊檔明示變更、13新檔、676個F程式原byte、671個受掃描原輸入。原artist、heldprologue、native routes/waits/captures/assertions/goldens不改。SOURCE-only inverse不得用於native reports／images／State。

本批新G仍需matching CI原生畫面與部署驗證，離線fixtures不是瀏覽器／原速／聆聽／真機／長時段證據。完整T03–T08及前段構圖／建築尺度／全party-enemy-NPC動作／death、合法音訊與完整遊戲目標不縮。
