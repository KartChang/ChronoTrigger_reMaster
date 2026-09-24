# 立即接續 — CI69 checkpoint only

用GitHub connector接KartChang/ChronoTrigger_reMaster，必要時Drive。立即續作，不盤點／歷史審計／重規劃。只讀STATUS、本檔、CI69_CHECKPOINT；main一次、同run一次。文件HEAD不同仍接同source/run，不索取ROM/token/手動證據。

Current root：**T05-early-visual-cohesion**。Execution terminal：**CI69-pending-full-validation**。Authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI69_CHECKPOINT。文件HEAD不是另一遊戲source。

VQ03A／0.9.48 source **4210a1f6438426d9933039f17178a8414dc94696**；root tree **de48ad754afedf9b5366dd7a809cfa03ddd0f158**；parent **759aa08adf79cb3c4ef0ba3bda2b9a158909a966**。16檔一次non-force發布，395程式檔與已測快照匹配，main已回讀。唯一 **CI69／35940156052**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後in_progress/null，created **2026-09-24T00:49:28Z**、updated **2026-09-24T00:49:31Z**（台灣08:49:31）。只查一次，未讀CI69 jobs/artifacts/Pages；A尚未原生接受。

## 不重做與直接續作

Runtime只改src/render.ts並新增src/town-building-occlusion.ts。四棟既有Truce屋舍各26部件，共104個既有mesh；先以包圍盒篩選，再用實際平行相機三角形射線判斷是否遮擋在場p0/p1/guest，只把擋住角色的屋舍群組降至.16 per-mesh visibility，離開後恢復。沿用9tick指數過渡時間常數及12tick邊緣保持；重複／暫停tick不推進，重置、離圖及reduced-motion保留。不新增mesh/material/texture，不改共用材質alpha／透明模式／pixels、幾何／位置／碰撞／人物尺度／相機。原Z招牌遮擋控制獨立保留；core/main/input/time/save/collision、CPU tiers/pixelcap/memory與held家具完全不改。

同一原生600AD旅程、六段Truce走位、入口／鎮民／旅店／出口四放鍵停點與原20張PNG全部保留。observer只追加唯讀townBuildingOcclusion；新gate核對同凍結tick、劇情在場角色、四個精確house ID／各26部件名稱數量及plaster位置、per-mesh原visibility／blend與有界射線。鎮民停點必須實際命中p0並淡化，入口必須未遮擋且不透明。原Tab/Space、全state／viewport恢復、40x20招牌／30px人物、七ledger、所有原旅程與預算不減。新原生畫面及群組資料仍待CI69，不能以離線fixture當通過。

最終完整npm run check通過：**1753 Node、368 Python、assets、typecheck、build、diff check**，相較Z新增40 Node。657項最終輸入指紋保持一致。四個CI68原始停點state只作離線回歸；九個其他章節兩方向pixels／geometry完全相同，六次warm-cache往返資源數量不增。離線CPU角色移除對照在312x675：原CI68鎮民停點角色貢獻0像素，新A為542像素；這不是原生畫面或美術分數，unit Canvas不完整支援文字／曲線。新負測試拒絕未知／重複群組與角色、遺漏部件、錯誤blend或位置。A→exact Z嚴格source-only inverse保留所有舊hash與斷言，舊Z對照不受A污染。

CI69 queued/in_progress只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI69_CHECKPOINT完成原reports、真圖、七ledger逐byte/hash、原始ZIP指定Drive下載回驗及matching Pages/source/HTML後才接受A。先親看鎮民與旅店角色輪廓、建物半透明效果、其他站位與過渡，再續前段人物植物道具、完整動畫／合法音訊與長時間／真機。離線像素增加、投影數字及綠勾不代表舒適性或美術90分。

CI68/Pages62已由759aa08adf79cb3c4ef0ba3bda2b9a158909a966獨立結案並回讀，receipt是CI68_ACCEPTANCE；不要重新驗收CI68或更早。

## 最小恢復

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。CI68七未修改原ZIP及review包 **1FPe4IxJTDpgiGQLIhY70_C6SvMIxbVQ7／Chrono-CI68-VQ02Z-evidence.zip**，68882392bytes，SHA25636ebc98c57c263ecca226d7a7847271b50d25ac2f5d809569844a6992a180325；已下載回驗parent/hash/CRC/20manifest/7內層ZIP。A最終已測包 **13RKIPZ6zo-9fH_Hq6eee5SxRQFYCrXn4／Chrono-CI68-accepted-VQ03A-tested-batch.zip**，1104248bytes，SHA256 **2d31f759f33bf13607bad4e674414bf0284ae3a639114bd83f5aa065cc244e57**；已下載回驗parent/hash/CRC/32manifest/395程式tar及Git blob。

A快照development/VQ03A-tested-program-snapshot.tar.gz是assembled已測程式，不是published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是封裝前歷史，A現已發布，不重送。相同Drive ID先前1037984bytes／1752測試版本已由最終包取代，必須使用1104248bytes／1753測試版。最新進度只讀GitHub main。

原三job／13主報告／9native加完整CPU兩旅程／600／救援／審判、audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W/X/Y/Z素材與操作、三view12PNG與四停點8PNG、全paused state、恢復viewport及native resume不減。六短窗口與靜態圖片不是長時間／真機／移動／聆聽認證。

## 全範圍與限制

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
