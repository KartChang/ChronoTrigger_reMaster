# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02p-ci58-pending。權威入口STATUS／TODO／IMMEDIATE_CONTINUATION／CI58_CHECKPOINT。更新既有產品計畫；O及先前完整細節保留於f1981836a41163f445d446c09d5ed5aa91f5c1c2的Git歷史，不重規劃或縮小範圍。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用，重用保存素材。七段自製短曲和靜音修正不是原作OST/完整配樂。材質語言、木料平塗、人物植物道具尺度輪廓、窄地標、升級母親家具、全動畫及聆聽品質仍有落差；held素材不得擅自提升。P不更動這些美術素材。

## CPU能力與已驗基準

先WebGL2/1，不可用自動使用真正CPU triangle/texture/depth rasterizer輸出Canvas2D RGBA，不是NullEngine空跑/錯誤頁。保留640x480像素cap、最大邊1280、32MiB/512紋理、保守剔除/三角形快速路徑/光向量重用/實際密度tiers。CPU不做shadowmap/glow/specular/postprocessing，不保證與WebGL視覺相等或真機流暢。FrameWindow記錄120個真正活動renderloop interval，mean/P95/max/FPS不是GPUtime。

可選遠景平滑預設OFF。J/K從原texturebytes生成boxmip，按log2足跡連續混合含1<rho<2；三角形選層，整數單lookup/分數雙RGBlookup。放大/無效/透視/alpha/opacity/blend/cutout/vertexalpha保留nearest輪廓。關閉/dispose釋放mip，原budgets/asset/UV/鏡頭不改。

最後accepted **K/0.9.33/source3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**。3jobs/13主流程/9原native+2CPU native/6sourceledger及全部列入bytes/hash核對；CPU兩旅程10legs+600前段30legs/本人v3-v4/兩獨戰/兩劇情暫停/LuccaP2/修道院入口已驗，22CPU原圖已看。平滑ON改真canvas，OFF精確還原/mip釋放/fullpausedstate不變，不等於消除閃爍或美術合格。61活動samples約17.0125FPS非持續效能認證。

Pages47 selected K source；playable/staged/deployed HTML同5690213bytes，SHA2563fda62047f3d6d5d1ce308534e51856a0da6ce0d88f531ad85b90d6af18c0a39。沒有額外本機HTTP/browser驗收，不重開CI51/53及更早閉環；CI52/54/55/56/57不回填成功。

## 既有CPU延伸與CI57觀察

L以CI-only adapter重用rescue/trial本體，--disable-webgl/auto/平滑OFF，本人同run CPUv4->rescuev5->兩條監獄v7/龍戰車/2300，chooser/IndexedDB不變。67coordinatelegs、4遇敵/2props、17里程碑與真canvas/state/renderer/PNG；返鄉祭典和未來入口各3個不重疊>=120draw活動窗口，保留120frame統計/texture/browserheap，非RSS/長時間/真機認證；第七source ledger驗父鏈、原事實、檔案與統計，不放寬前六gate。

M語意AST取代跨Python顯示hash，原expected由CI53原檔建立。N雙owner原生走位、獨立精準修正、原P1預算/one30s/.12/250ms/256上限與完整source驗證保留。O只在兩次反向短pulse未抵達後用公開keyboard.press，保留實際放鍵snapshot及部分失敗全鍵清理，不保證sub-frame。這些已實作，不重寫；L/N完整原生延伸尚未結案。

**CI57 35712112661/O source9425f58c423897be08fe1ca0d810ec9d6088f7b3 completed/failure**，updated2026-09-22T10:09:47Z。Validate106694937164首敗step21；兩witness jobs成功。第一家中至祭典完成，第二旅程co-op z=-2以169/165ticks失敗。O driverOperations明確顯示50/16/17ms press完成但仍4movementticks，放鍵位置反覆-2.133333333333331/-1.8666666666666643，兩側誤差.133333。N救援/trial未到，不能宣稱其已修好或新失敗。

末次CPU draw67.1ms，48活動interval mean65.31875/P9570/max85/FPS15.30954，buffer678x452。程式每render取一次input共用於fixed substeps，與觀察粗粒度一致；沒有事件timestamp層因果證明，不能把渲染优化視作已證明根治。原failurePNG有祭典/鐘樓/棚位/雙人，非空白。四passed preCPUledger35列bytes/hash與四rawZIP一致，未重跑verifier；後續missing ledger/skipped為次生結果。CI57無playable/Pages驗收。

## P實際繪圖優化與驗證邊界

**P十二檔**只在CPU raster減少無效工作：保守row spans以原edge界線加1pixel保護，仍逐像素使用原top-left/depth/UV/alpha判斷及算術順序；固定形狀project、numeric與row invariant外提、packed clear共用原RGBA buffer。沒有低畫質替代、降解析度、改材質UV/幾何或改遊戲時間輸入。CpuScene只加唯讀rasterPolicy/boundingPixels/candidatePixels。project及texture快取實驗沒有收益而被拒絕，未進產品。

保留CI57原raster blobff7029702da8567c765acb4c76cc29442125a7d7作獨立oracle。新增11Node涵蓋22章節x2視窗x2sampling共88組完整scene packet，4000deterministic textured/opacity/blend/wrap三角形、near-plane/nonfinite/邊界/紋理變更、clear共用buffer；RGBA/depth及原計數精確相等，state不變。新增5Python只反向明列兩render改動後比歷史hash，expected未換；缺失/突變/重複hunk及其他source不獲豁免。純unit構造不進原生成功存檔。

Node kernel benchmark8warmups、24組交替paired測量，fair960off mean60.12->50.28ms，fair960on67.74->56.17，fairportrait33.24->28.48，bedroom33.93->25.11，cathedral37.42->28.91，約14.34%-25.99%。排除scene traversal、browsercanvas/events/cadence/GPU；不是FPS改善或原生precision修復證據。真正畫面、完整旅程、裝置仍需驗收。

P **0.9.38/source71f0cc05a6b0b3b09a314242405d2f7ba543b130/treef5866487151c269043b181b530199d7631b5a3c6**，parentf1981836a41163f445d446c09d5ed5aa91f5c1c2，一次non-force發布並回讀完整程式tree。最終 **1350Node/325Python/assets/typecheck/build/fullnpmcheck/差異檢查通過**；初次source-pin拒絕與本機host中斷log保留，最終完整check exit0。本機無browser。所有main/input/time/core/collision/native drivers/路線目標及時間預算/index/.github保持。

唯一 **CI58 35722175327** push/attempt1，最後in_progress/null（2026-09-22T11:34:27Z）。尚未查jobs，P為已測成本緩解，不可先標原生root repaired。Pending保存接續，不輪詢或另開CI。

## 驗收、完整剩餘範圍與限制

CI58保留原3jobs/13primary/9native+CPU/audio/actor.playback/HUD/scenery/ATB/touch/equipmentv8/fulltrial/六ledger，再完整CPU2+600+rescue+trial本人v4-v7及alternatecell/67双ownerlegs/4遇敵2提示/17PNG/6窗口/第七ledger。檢視O真press與P work/frame資料、原尺寸tier/平滑預設/輪廓和所有原始bytes/hash/真圖；原Drive下載回讀與同CI Pages/source/HTML不可省，不以local source=null HTML為基準。原生閉環後依TODO接實際相容效能、長時間/真機、允許前段材質尺度輪廓地標、全動畫和合法音訊聆聽。六短窗口非長時間，不因綠勾擴後段。

T03：隱含規則、版本差異、完整拓樸與數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色、學習技能與雙三人技。T05：完整美術、動畫與合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線及結局。T07：完整範圍整體>=90、每面向>=80%、required assets／five gates／zero critical，加實體裝置輸入、FPS/frame time、載入、記憶體、背景恢復、存檔與音訊。T08：每批實作測試、一次non-force source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來，舊30為stale，沒有新的美術90、真機或全遊戲認證。

保留TS/Babylon/esbuild、fixed ATB、A*、InputBoundary、P1/P2/自主第三與家中至2300及v1-v8裝備存檔。無新branch/PR/P3/ARPG或框架重造。Held Z/升級母親家具仍held，prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變，不間接替換或局部提升。禁止本機browser、可寫原生game/time/save/collision hook、假原生成功存檔、公開ROM/原始外部媒體/字型/憑證。工具鏈只恢復node_modules及esbuild hardlink。臨時容器不是authority。

## 持久交付

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。最新 **Chrono-CI57-terminal-VQ02P-tested-batch.zip /1qIQpqFbfG684IdOAH9Mi8JPblXmOkv0G**，52200466bytes，SHA256 **873f8e80be5774fc7fee10bcd6a153d0d059a8fc71634238c03751fbaedc7688**。37manifest/305程式檔/四未修改CI57原ZIP，下載hash/CRC/manifest/parent已核。包內source=null僅發布前歷史，最新main docs優先；assembled snapshot不是Gitarchive，不用假ancestry推送。

前O包1zRzBn2uz9QOsg0kQ84LWllgEialwf7mL及K原始包1h9THuGPcjSkcAPIIdqIeWPO7-5M2u7Kf不重抓。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳或公開。每批原始log/產物/程式/文件寫回正確雲端並回讀，文件[skip ci]。
