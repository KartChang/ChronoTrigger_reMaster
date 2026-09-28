# Status — VQ04G已合批發布；唯一CI104執行中，v41

Authority：本頁／TODO／evidence/T05_ANIMATION_CHECKPOINT.json **v41**。唯一KartChang/ChronoTrigger_reMaster／main，single AI／non-force；不建分支、PR或平行candidate。Root T05-early-visual-cohesion；execution T05-early-production-art；work item T05-early-production-art-canyon-court。

## 目前source與唯一驗證

**VQ04G／0.9.80** source **1512fcaf3601c31834d2047042b7fbb3a61aee66**，tree **2c8416cf127f2224425a6012ad0dd17585828b87**，parent **919243172c4e00713a4f2f63e70ad8daa5b96250**。一次non-force發布後已讀回main／commit／parent／tree；27差異（14修改、13新增），703程式檔與最終已測、已回下載快照完全一致。文件另以[skip ci]提交，不新增遊戲source。

唯一 **CI104／36454035999**，push／attempt1／exact G，最後觀察 **in_progress**／conclusion=null，provider updated **2026-09-28T16:51:31Z**。不長poll、不rerun、不manual dispatch、不重送G/F/E/D。G原生與部署尚未驗收；下一步直接接這個matching run的原ZIP、來源與實際畫面／部署限定review。

## 本批真正開發與測試

沿用未改的E作者像素，七類故事NPC四方向ambient／greet共224欄位接入正式owned upload，比前代28前向ambient多196可選欄位。由現有存活active隊員真實位置決定朝向及近距離招呼，保留原producer frame clock；不是NPC移動／導航。112walk仍staged，四主角256combat仍runtimeApplied=false；可選欄位不代表每格已有native樣本。

原八NPC名稱／parent／48×64來源逐byte辨識、材質獨占、this／參數／回傳／例外、unknown fail-closed、換owner／held還原／dispose保留。0新增GPUtexture、12binding及294912CPU RGBA上限；來源frame／facing／pose未變不重上傳。原State、camera、幾何、held prologue／母親家具、native routes／waits／captures／assertions／goldens均不改。

**完整Node3501／3501、Python625／625、assets／typecheck／quality schema／build皆通過**。76新增專屬Node含真實owned upload、全部224作者欄位PNG同源、正式current-app CPU畫面、11非target／held場景與F一致、原資源生命週期和Pages選取。703source測試前後一致；676F程式原byte、671受掃描原輸入保護通過。早期三項新增離線fixture失敗及修正紀錄保留，不改native route或放寬斷言。quality30/100是舊review，不是G新評分。

## CI103成功，Pages97失敗已分開處理

F source da615f1e4a803fa8fdaddf4723ab782038e14266：CI103／36441789439 success，updated2026-09-28T15:52:41Z。五原ZIP、690source、三lane／29原始entry和兩張WebGL靜態圖限定核對完成，原檔已在指定Drive並下載回驗。完整motion／影片／聆聽／真機未批准。

Pages97／36446907519 failure，updated2026-09-28T15:52:56Z；prepare選CI失敗，staging與deploy跳過。原success-list回應沒有記錄，不能斷言provider一致性原因。G改為workflow_run直接GET並核對觸發的exact run／SHA／attempt，無較舊CI fallback；保留原artifact/provenance/digest門檻，移除獨立Pages push觸發。Pages97保持failure，不重跑。最後已限定審查部署仍E／CI102／Pages96，不假稱F部署成功。

## 持久交付與完整目標

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。G最終包 **1oe-CpAhb2AMAbD5GddhbOsukB-jqcy8F／Chrono-VQ04G-production-batch.zip**，**1499878bytes**／SHA256 **403bbc3895a4e85a43a8c5318f25d6ab1ff1d2f30701563de6d82d27730b2134**；68manifest／703snapshot／27delta／7PNG／完整logs。2026-09-28T16:32:37.188337Z真實下載核parent／size／hash／CRC／全部manifest／snapshot與delta bytes後才推送。snapshot program-vq04g.tar.gz不含docs或node_modules，不覆蓋main最新文件；同ID早期包已被最終包取代。

詳細見DELIVERY_INDEX、PRODUCTION_ART_VQ04G與evidence/VQ04G_*、CI103_PAGES97_REVIEW。完整T03–T08、完整party/enemy/NPC方向动作death、前段構圖／尺度遮擋、縮尺大地圖、合法完整音訊／聆聽、原速／真機／長時段不縮。全部完整品質批准false、newScore=null、releaseBLOCKED。No localbrowser／native State-time-save-collision注入；原<.12／單一30秒／250ms-256／CPU品質記憶體門檻不變；ROM/media/fonts/credentials私有。
