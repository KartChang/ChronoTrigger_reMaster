# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-24-vq03a-ci69-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI69_CHECKPOINT。沿用完整產品目標；CI68/Pages62已接受Z，A/0.9.48已發布待原生驗收。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材及原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32玻璃、W原inn-sign XY2.75及anchor[-4.7,2.4,-3.4]全部保留。X直式Truce同buffer比<.85構圖、half>=7.2與HUD安全區[.045,.955,.12,.80]，Y依劇情state推導在場角色，不把joined偏好當角色存在。Z原招牌遮擋降.30與私有材質blend/還原獨立保留；原20張村莊圖與receipt TDZ修正不變。歷史failure不回填success。

## 當前技術基準

**CI68／35907329257／Z sourcee1bda62c363ee82844333937f130736d20581205／Pages62 35911000105已正式技術接受**，收據evidence/CI68_ACCEPTANCE.json獨立發布於759aa08adf79cb3c4ef0ba3bda2b9a158909a966並回讀。三job／13主報告／9原native chooser加完整CPU兩旅程／600／救援／審判、七ledger逐byte重算一致共147列、同run本人v4-v5-v7及alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口與20張村莊圖均保留。playable/staged/deployed HTML5716318bytes，SHA256 7121b7c66be16945b0ce112e52e89133b283621ce831ceacb56c18d22cc15369，Pages公共HTTP步驟成功。85張CPU圖以8聯絡表檢視，另旅店與鎮民兩張全尺寸，不冒稱85張皆全尺寸。旅店招牌淡化有效，但鎮民停點被建築遮住，這是A的工作依據，並非已接受最終美術。CI68技術結案不重開；CI66等歷史failure不回填success。

## A建築遮擋可讀性與模組邊界

VQ03A／0.9.48 source **4210a1f6438426d9933039f17178a8414dc94696**；root tree **de48ad754afedf9b5366dd7a809cfa03ddd0f158**；parent **759aa08adf79cb3c4ef0ba3bda2b9a158909a966**。16檔一次non-force發布，395程式檔與已測快照匹配，main已回讀。唯一 **CI69／35940156052**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後in_progress/null，created **2026-09-24T00:49:28Z**、updated **2026-09-24T00:49:31Z**（台灣08:49:31）。只查一次，未讀CI69 jobs/artifacts/Pages；A尚未原生接受。

Runtime只改src/render.ts並新增src/town-building-occlusion.ts。四棟既有Truce屋舍各26部件，共104個既有mesh；先以包圍盒篩選，再用實際平行相機三角形射線判斷是否遮擋在場p0/p1/guest，只把擋住角色的屋舍群組降至.16 per-mesh visibility，離開後恢復。沿用9tick指數過渡時間常數及12tick邊緣保持；重複／暫停tick不推進，重置、離圖及reduced-motion保留。不新增mesh/material/texture，不改共用材質alpha／透明模式／pixels、幾何／位置／碰撞／人物尺度／相機。原Z招牌遮擋控制獨立保留；core/main/input/time/save/collision、CPU tiers/pixelcap/memory與held家具完全不改。

同一原生600AD旅程、六段Truce走位、入口／鎮民／旅店／出口四放鍵停點與原20張PNG全部保留。observer只追加唯讀townBuildingOcclusion；新gate核對同凍結tick、劇情在場角色、四個精確house ID／各26部件名稱數量及plaster位置、per-mesh原visibility／blend與有界射線。鎮民停點必須實際命中p0並淡化，入口必須未遮擋且不透明。原Tab/Space、全state／viewport恢復、40x20招牌／30px人物、七ledger、所有原旅程與預算不減。新原生畫面及群組資料仍待CI69，不能以離線fixture當通過。

最終完整npm run check通過：**1753 Node、368 Python、assets、typecheck、build、diff check**，相較Z新增40 Node。657項最終輸入指紋保持一致。四個CI68原始停點state只作離線回歸；九個其他章節兩方向pixels／geometry完全相同，六次warm-cache往返資源數量不增。離線CPU角色移除對照在312x675：原CI68鎮民停點角色貢獻0像素，新A為542像素；這不是原生畫面或美術分數，unit Canvas不完整支援文字／曲線。新負測試拒絕未知／重複群組與角色、遺漏部件、錯誤blend或位置。A→exact Z嚴格source-only inverse保留所有舊hash與斷言，舊Z對照不受A污染。

早期node-first/check-first本機中斷不算成功；新指數淡化測試的錯誤預期已修正為既有過渡法則，沒有修改原runtime或門檻。發布前另補正build batch從stale VQ02Z到VQ03A（version0.9.48），追加build metadata回歸並重跑最終全套；final-check-result.json exit0，完成UTC2026-09-24T00:39:28.748318。失敗、中斷及最終logs均保存。沒有本機browser。

## 驗收與完整剩餘範圍

CI69 queued/in_progress只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI69_CHECKPOINT完成原reports、真圖、七ledger逐byte/hash、原始ZIP指定Drive下載回驗及matching Pages/source/HTML後才接受A。先親看鎮民與旅店角色輪廓、建物半透明效果、其他站位與過渡，再續前段人物植物道具、完整動畫／合法音訊與長時間／真機。離線像素增加、投影數字及綠勾不代表舒適性或美術90分。

原三job／13主報告／9native加完整CPU兩旅程／600／救援／審判、audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W/X/Y/Z素材與操作、三view12PNG與四停點8PNG、全paused state、恢復viewport及native resume不減。六短窗口與靜態圖片不是長時間／真機／移動／聆聽認證。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。CI68七未修改原ZIP及review包 **1FPe4IxJTDpgiGQLIhY70_C6SvMIxbVQ7／Chrono-CI68-VQ02Z-evidence.zip**，68882392bytes，SHA25636ebc98c57c263ecca226d7a7847271b50d25ac2f5d809569844a6992a180325；已下載回驗parent/hash/CRC/20manifest/7內層ZIP。A最終已測包 **13RKIPZ6zo-9fH_Hq6eee5SxRQFYCrXn4／Chrono-CI68-accepted-VQ03A-tested-batch.zip**，1104248bytes，SHA256 **2d31f759f33bf13607bad4e674414bf0284ae3a639114bd83f5aa065cc244e57**；已下載回驗parent/hash/CRC/32manifest/395程式tar及Git blob。

A快照development/VQ03A-tested-program-snapshot.tar.gz是assembled已測程式，不是published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是封裝前歷史，A現已發布，不重送。相同Drive ID先前1037984bytes／1752測試版本已由最終包取代，必須使用1104248bytes／1753測試版。最新進度只讀GitHub main。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
