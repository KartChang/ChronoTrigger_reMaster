# Current status — CI66 failed; VQ02Y verifier correction / CI67 pending

Current root：**T05-early-visual-cohesion**。Execution terminal：**CI67-pending-full-validation**。Authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI67_CHECKPOINT。文件HEAD不是另一遊戲source。

## 目前已發布

VQ02Y為**驗證器修正批次**；runtime/build仍為**VQ02X／0.9.46**，不冒稱0.9.47。已發布source **3dc95cb3f9487953ce11214f9a6561b915e3f368**；root tree **e8fb226d479be3303d177aa4dc76b9578eda96de**；parent **cb2f3978a2df89be08984a885642d316c8ad97c4**。七檔一次non-force發布，380程式檔及原main文件組成的tree與已測快照一致，main已回讀。唯一 **CI67／35885061454**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後in_progress/null，created **2026-09-23T15:55:08Z**、updated **2026-09-23T15:55:13Z**（台灣23:55:13）。只查一次，未讀CI67 jobs/artifacts/Pages；X/Y尚未完整原生接受。

Y只改scripts/town-camera-evidence.mjs、新增scripts/town-party-evidence.mjs及五份回歸測試／fixture。joined是保留的雙人控制偏好，不代表角色於目前劇情在場。驗證器依完整凍結story state獨立推導activeSlot/guestKind，要求實際p0／可用p1／guest與inn-sign精確一致；禁止漏掉實際P2、單人跟隨者或第三同伴，也禁止離隊幽靈角色、重複／未知owner及缺少phase。原投影、>=30px人物、>=40x20招牌、HUD安全區、全state及走位／時間／畫質門檻不變。沒有修改src、build、assets、workflow、原生observer或原始報告；沒有改相機、材質、碰撞、遊戲時間或存檔。

完整npm run check通過：**1649 Node、364 Python、assets、typecheck、build、diff check**。新增40個Node測試，包含4776組phase／控制偏好與未修改production規則比對、8組production World離線三視窗往返、真實CI66節錄回歸、缺少／多出角色負測試及失敗診斷留存。4776是型別組合，非聲稱全部可遊玩抵達；8組World為離線CPU port，非本機browser或原生驗收。完整CI66 era600原報告唯讀重算通過，但沒有改報告／產生新原生證據／把CI66改成success。check-first.log本機host中斷不算通過；check-complete及最終check-final均exit0，全部logs已保存。

## 實際失敗與已接受基準

CI66／35875725015／X sourcee18ac52e5ad37b0259ef1f27ce40c3d6fb9f6ef4 實際completed/failure。validate job107230992459首先step23失敗：Town camera evidence: second human retained。原始arrival/vista、trial none、tick48、joined=true，但production activeSlot(1)=false，原生鏡頭正確只有p0與inn-sign；是新oracle錯把偏好當在場。CPU主旅程及兩witness job成功，CPU rescue/trial被跳過、adventure verifier失敗，未產生playable，不接受X。原始source-failure、2303496bytes報告及原圖保留於CI66_FAILURE.json指向的未修改ZIP。只全尺寸檢視一張直式village-canvas-1.png；招牌仍遮住部分屋牆，不是完整美術驗收。

最後完整技術accepted仍為 **CI65／35859095751／W source11ae55d6c90d8bb6eb5f6f75eed05993191bfa35／Pages59 35862694649**，見evidence/CI65_ACCEPTANCE.json。既有三job／13主報告／9native＋完整CPU／七ledger139列／同run存檔链及三view12PNG已結案。playable/staged/deployed HTML5711878bytes，SHA256 996400b0548762dfa446eec412ac02eec0f3f555db8c4c2e1a68a043e475ea86。CI64與CI66仍為歷史failure，不覆寫為success；不重開CI65/Pages59或更早。

## 雲端與唯一接續

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Y已測包 **10MdC4_H_8oijTDrTjC-JQn_FCTTwz6vy／Chrono-CI66-failure-VQ02Y-tested-batch.zip**，862898bytes，SHA256 e1779e7c91a3819ac326132c4ea7dd1689fdecdb014cdf6649f5891aedecbae8；已下載回驗parent/hash/CRC/24manifest/380程式tar與Git blob。快照development/VQ02Y-tested-program-snapshot.tar.gz為assembled已測程式，非published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，Y已發布不重送。原CI66 browser ZIP另存 **10ne2hfCNybesZBD13jlUOG-jadtl8yFu**，24148544bytes，SHA256 37598e446752bd7a980fddb498748e41b9772177b0399254c0d1edf796184529，已下載回驗hash/CRC/parent及exact X source tree；不是七份success ZIP。

CI67 queued/in_progress只保存回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI67_CHECKPOINT完成全部原reports、實際畫面、七ledger逐byte/hash、原始ZIP Drive回讀與matching Pages/source/HTML後才接受X/Y。版本仍0.9.46，但CI內嵌source應是新SHA；不能使用本機source=null或CI66 HTML作新hash基準。通過後先處理直式人物／招牌遮擋、其他站位與移動舒適性，再續前段人物植物道具、完整動畫與合法音訊、長時間及真機。

## 固定完整範圍

原三job／13primary／9native＋完整CPU兩旅程／600／救援／審判、audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W素材與操作、X實際camera、三view12PNG、逐鍵全state及恢復viewport/native resume不減；六短窗口不等於長時間或真機。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
