# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02u-ci63-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI63_CHECKPOINT。沿用原產品計畫，不縮範圍；CI61已結案，CI62failure，U修正已發布但尚未原生accepted。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與目前技術基準

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D。保留640x480 pixel cap、最大邊1280、實際tiers、32MiB/512entries、120活動FrameWindow。CPU不做shadow map/glow/specular/postprocessing，不承諾WebGL同畫質或真機流暢。P exact conservative row spans／packed clear減少無效工作，不降低解析度或改input/time；Node benchmark不當原生FPS。J/K平滑預設OFF，opaque-affine縮圖連續混合，alpha/透視等保留nearest；關閉/dispose釋放mip。

最後完整技術accepted維持 **S/0.9.41/source9b9020e05b3c9c68aee378ceab74dc8fa4677c88／CI61 35765515107／Pages55 35769247113**，收據evidence/CI61_ACCEPTANCE.json。三job、13主報告、9原native chooser與完整CPU兩旅程／600／救援／審判、本人v4-v5-v7及alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger133列／39主CPU圖＋6S圖已閉環。playable/staged/deployed HTML5704004bytes，SHA256 bd23d550062b186cec198efa7879a5889cdf5c78e351562a38db078f2cd6a9e8。不重開CI61/Pages55、CI60/Pages54或更早。

S六組64x64灰泥／木材／石材／石板瓦／陶瓦／木門與原80x40床圖示／手繪INN招牌已驗；沒有外部字型。VillageFinish限定原Truce mesh、六材質快取、原旅店plane/texture；三viewport全paused state及六PNG保留。S真圖顯示直式人物與招牌仍偏小，短橫向暫停卡下部控制在初始視區之外但原本有捲動，作為T排版依據。

## T保留與U暫停鍵盤修正

U/0.9.43 source **1d2be87885c129442d6123625b030d599ed8db50**；root tree **ba4480efcb7ed06451a3202cbbb55958a27a819c**；parent **eef741ed12b8dec3326e385d14a84f5302fb947f**。14檔一次non-force發布，352程式檔與已測快照匹配；main已回讀。唯一 **CI63 35807473251**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1；最後queued/null，created/updated **2026-09-23T01:43:34Z**（台灣2026-09-23 09:43:34）。只查一次，未讀jobs/artifacts/Pages，U尚未原生驗收。

T原pause寬雙欄／窄單欄、44px控制與global header隔離保留；五個flower-box共享64x64自製木紋／土壤／植栽貼圖、vq02t-truce-planters唯讀owner/尺寸/nearest/RGBA保留。不改S六建材／招牌、R/Q、場景幾何與角色尺度。T的index.html／render-status.css、village-planter-art.ts／village-finish.ts不重寫。

CI62 **35776529708**／T source85f35c062720ed494b9869488b0c39e94b7c82b4 已completed/failure，不是accepted。實際validate job106911025319首先在step21「Test playable CPU fallback without WebGL」失敗：原生托魯斯暫停後Tab、Tab到cpu-sampling，第一次Space被manualPause通用路由當作resume。原始report的paused斷言失敗，ticks由63到失敗快照109；只取得第一個960x640 view。兩witness job成功；後續CPU verifier失敗、CPU rescue/trial跳過，沒有playable，不宣稱T全套或Pages驗收。詳細traceback與原檔來源見evidence/CI62_FAILURE.json。

U只在src/main.ts原manualPause分支前加入focused cpu-sampling＋Space回傳native，讓原生checkbox keyup完成切換；不人工click、不改togglePause或模擬時間。其他resume快捷鍵、P1/P2、InputBoundary、core/collision/save、所有材質、幾何、T排版和五花箱均保留。新增完整production router＋真Controls的離線事件回歸，原T路由可重現同一錯誤；補齊重複按鍵、清除舊移動、雙人歸屬、原快捷鍵與native邊界。原生pause_access額外逐鍵保存完整before/after paused/state/focus/sampling及completed，失敗先保留真實觀察再拋錯；source verifier逐鍵驗凍結、連續、checkbox切換／恢復。原三視窗十二張PNG及所有既有斷言不減。

完整npm run check：**1487 Node**、assets、typecheck、build通過；**356 Python**及diff check通過。比T新增25 Node／3 Python。原hash不換，只明列U兩行路由、build版號與test註冊的嚴格test-only inverse，再驗T/S/R/P/Q原契約；缺少、重複或其他變動仍拒絕。原T十章節幾何／像素對照、六次往返不累增材質及所有既有測試保留。沒有本機browser、原生成功fixture或新美術分數。

## 驗收與後續完整範圍

CI63 pending只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure處理同run首個實際root及原ZIP，不放寬原斷言或畫質。Success依CI63_CHECKPOINT驗全部原reports、真圖、七ledger、原始Drive回讀及matching Pages/source/HTML；不能只看綠勾。U未得到原生驗證前不把T標accepted，不重做花箱或S/R/Q素材。通過後先處理真圖相容／可讀性，再續前段人物植物道具材質、尺度輪廓、窄地標、全動畫、合法音訊、長時間與真機觀察；直式人物／旅店仍偏小，未完成最終美術。

原三job／13primary／native＋完整CPU、audio/actor.playback/HUD/normal-paused-reduced/ATB/touch/equipmentv8/fulltrial、本人存檔鏈、67腿/4遇敵/2props/17里程碑/6窗口、七ledger及所有hash不省。S六PNG＋T六PNG、真材質與三view控制項、U逐鍵raw state完整檢查；六短窗口不是長時間或實體裝置性能認證。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，沒有新美術90分、長時間、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。Main only、one AI、non-force，無branch/PR/P3/ARPG/框架重造。本機browser禁用，不造原生game/time/save/collision state；不放寬.12、原tick預算、單一30秒、250ms/256或畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config或bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。

## 持久交付

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。U保存包 **Chrono-CI62-failure-VQ02U-tested-batch.zip / 1JfJL4VqTemOr_iW71wYzQ6-vJ_tzeWK9**，**723879 bytes**，SHA256 **fefc1848058566da709098d498032b37e697be2e97566dd75bee7619436f7e5d**。已下載回驗bytes/hash/ZIP CRC/21項manifest/352程式tar與Git blob/parent。recovery/VQ02U-tested-program-snapshot.tar.gz是assembled已測程式快照，不冒稱published Git archive，不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史；U現在已發布，不重送，用最新main文件補足身分。

CI62未修改原始browser ZIP另存 **1QStW1BRZQ-jTqlS6KcOo-QYcrfvRZCQs**，22638488bytes，SHA256 **b3a9a93f1cdc209e9ea9b4b4959a40b07f83194cc847d7359cdbaae7cc163ec3**；artifact10716852740，已下載核對bytes/hash/CRC/parent，包內source archive tree與exact T相同。原始失敗report／圖片不改成成功；早期一份decoded-log回應與原檔函式及artifact ID不一致，不作root或完整rawlog依據。
