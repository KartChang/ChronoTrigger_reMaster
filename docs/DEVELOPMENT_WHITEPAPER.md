# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02y-ci67-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI67_CHECKPOINT。沿用完整產品目標；runtime X/0.9.46不變，Y是驗證器修正，不重新規劃遊戲。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材與原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32暖色玻璃、W原inn-sign固定XY2.75全部保留。招牌原anchor[-4.7,2.4,-3.4]、4vertices/6indices、Z1不改。W原40x20 gate與source-failure獨立first-error/exit1保存器仍生效，原報告不改寫。CI62/CI64/CI66失敗紀錄仍留於各FAILURE收據，修正不回填歷史success。

X只改src/render.ts及town-camera.ts，限定Truce且buffer比<.85；依實際可見P1/P2／第三同伴mesh頂點與距P1<13原inn-sign，重用EarlyCameraMotion。最小half7.2、雙人分離立即擴展，HUD安全區[.045,.955,.12,.80]、fixed-tick平滑、resize／reduced-motion保留。人物／招牌／材質／幾何及其他場景不改；Y不修改這些runtime。原三viewport12PNG增加唯讀camera投影、P0>=30px／samebuffer／完整state與橫向恢復；只限技術門檻，不是美術評分。

## 當前技術基準

最後完整技術accepted仍為 **CI65／35859095751／W source11ae55d6c90d8bb6eb5f6f75eed05993191bfa35／Pages59 35862694649**，見evidence/CI65_ACCEPTANCE.json。既有三job／13主報告／9native＋完整CPU／七ledger139列／同run存檔链及三view12PNG已結案。playable/staged/deployed HTML5711878bytes，SHA256 996400b0548762dfa446eec412ac02eec0f3f555db8c4c2e1a68a043e475ea86。CI64與CI66仍為歷史failure，不覆寫為success；不重開CI65/Pages59或更早。

## Y驗證器修正與模組邊界

VQ02Y為**驗證器修正批次**；runtime/build仍為**VQ02X／0.9.46**，不冒稱0.9.47。已發布source **3dc95cb3f9487953ce11214f9a6561b915e3f368**；root tree **e8fb226d479be3303d177aa4dc76b9578eda96de**；parent **cb2f3978a2df89be08984a885642d316c8ad97c4**。七檔一次non-force發布，380程式檔及原main文件組成的tree與已測快照一致，main已回讀。唯一 **CI67／35885061454**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後in_progress/null，created **2026-09-23T15:55:08Z**、updated **2026-09-23T15:55:13Z**（台灣23:55:13）。只查一次，未讀CI67 jobs/artifacts/Pages；X/Y尚未完整原生接受。

Y只改scripts/town-camera-evidence.mjs、新增scripts/town-party-evidence.mjs及五份回歸測試／fixture。joined是保留的雙人控制偏好，不代表角色於目前劇情在場。驗證器依完整凍結story state獨立推導activeSlot/guestKind，要求實際p0／可用p1／guest與inn-sign精確一致；禁止漏掉實際P2、單人跟隨者或第三同伴，也禁止離隊幽靈角色、重複／未知owner及缺少phase。原投影、>=30px人物、>=40x20招牌、HUD安全區、全state及走位／時間／畫質門檻不變。沒有修改src、build、assets、workflow、原生observer或原始報告；沒有改相機、材質、碰撞、遊戲時間或存檔。

完整npm run check通過：**1649 Node、364 Python、assets、typecheck、build、diff check**。新增40個Node測試，包含4776組phase／控制偏好與未修改production規則比對、8組production World離線三視窗往返、真實CI66節錄回歸、缺少／多出角色負測試及失敗診斷留存。4776是型別組合，非聲稱全部可遊玩抵達；8組World為離線CPU port，非本機browser或原生驗收。完整CI66 era600原報告唯讀重算通過，但沒有改報告／產生新原生證據／把CI66改成success。check-first.log本機host中斷不算通過；check-complete及最終check-final均exit0，全部logs已保存。

CI66／35875725015／X sourcee18ac52e5ad37b0259ef1f27ce40c3d6fb9f6ef4 實際completed/failure。validate job107230992459首先step23失敗：Town camera evidence: second human retained。原始arrival/vista、trial none、tick48、joined=true，但production activeSlot(1)=false，原生鏡頭正確只有p0與inn-sign；是新oracle錯把偏好當在場。CPU主旅程及兩witness job成功，CPU rescue/trial被跳過、adventure verifier失敗，未產生playable，不接受X。原始source-failure、2303496bytes報告及原圖保留於CI66_FAILURE.json指向的未修改ZIP。只全尺寸檢視一張直式village-canvas-1.png；招牌仍遮住部分屋牆，不是完整美術驗收。

## 驗收與剩餘完整範圍

CI67 queued/in_progress只保存回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI67_CHECKPOINT完成全部原reports、實際畫面、七ledger逐byte/hash、原始ZIP Drive回讀與matching Pages/source/HTML後才接受X/Y。版本仍0.9.46，但CI內嵌source應是新SHA；不能使用本機source=null或CI66 HTML作新hash基準。通過後先處理直式人物／招牌遮擋、其他站位與移動舒適性，再續前段人物植物道具、完整動畫與合法音訊、長時間及真機。

原三job／13primary／9native＋完整CPU兩旅程／600／救援／審判、audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W素材與操作、X實際camera、三view12PNG、逐鍵全state及恢復viewport/native resume不減；六短窗口不等於長時間或真機。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Y已測包 **10MdC4_H_8oijTDrTjC-JQn_FCTTwz6vy／Chrono-CI66-failure-VQ02Y-tested-batch.zip**，862898bytes，SHA256 e1779e7c91a3819ac326132c4ea7dd1689fdecdb014cdf6649f5891aedecbae8；已下載回驗parent/hash/CRC/24manifest/380程式tar與Git blob。快照development/VQ02Y-tested-program-snapshot.tar.gz為assembled已測程式，非published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，Y已發布不重送。原CI66 browser ZIP另存 **10ne2hfCNybesZBD13jlUOG-jadtl8yFu**，24148544bytes，SHA256 37598e446752bd7a980fddb498748e41b9772177b0399254c0d1edf796184529，已下載回驗hash/CRC/parent及exact X source tree；不是七份success ZIP。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
