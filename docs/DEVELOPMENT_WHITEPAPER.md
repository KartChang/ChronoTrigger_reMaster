# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-24-vq02z-ci68-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI68_CHECKPOINT。沿用完整產品目標；CI67/Pages61已接受X/Y，Z/0.9.47已發布待驗。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材與原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32暖色玻璃、W原inn-sign固定XY2.75全部保留。招牌原anchor[-4.7,2.4,-3.4]、4vertices/6indices、Z1不改。W原40x20 gate與source-failure獨立first-error/exit1保存器仍生效，原報告不改寫。CI62/CI64/CI66失敗紀錄仍留於各FAILURE收據，修正不回填歷史success。

X限定Truce且buffer比<.85；依實際可見P1/P2／第三同伴mesh頂點與距P1<13原inn-sign，重用EarlyCameraMotion。最小half7.2、雙人分離立即擴展，HUD安全區[.045,.955,.12,.80]、fixed-tick平滑、resize／reduced-motion保留。原三viewport12PNG、P0>=30px／samebuffer／完整state與橫向恢復保留。Y依完整凍結劇情狀態獨立推導在場角色，joined只是控制偏好；不得遺漏實際P2／跟隨者／guest，也不得出現離隊／重複／未知owner。這些技術內容已在CI67接受。

## 當前技術基準

CI67／35885061454／Y source3dc95cb3f9487953ce11214f9a6561b915e3f368（runtime X/0.9.46）與Pages61／35889031138已正式技術接受，收據evidence/CI67_ACCEPTANCE.json已在3a3eddbad8929dc1bdc0da8bda919738524f3c8c獨立發布；本輪沿用，不重驗。三job／13主報告／9原native chooser與完整CPU兩旅程／600／救援／審判、七ledger139列、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口及三view12PNG均已閉環。playable/staged/deployed HTML5713356bytes，SHA256 da60de8ffad26b2cb672f7a0d3343e3a3c4d615d27ff643e19bf626c30b83cac。77張CPU圖以7聯絡表及3張村莊全尺寸檢視，不冒稱77張皆全尺寸。CI66仍是歷史failure；不重開CI67/Pages61或更早。

## Z遮擋可讀性與模組邊界

VQ02Z／0.9.47 source **e1bda62c363ee82844333937f130736d20581205**；root tree **507ef1d9c3c9f05a5dd978b73c09897e4fdc902c**；parent **3a3eddbad8929dc1bdc0da8bda919738524f3c8c**。20檔一次non-force發布，388程式檔與修正版已測快照一致；main已回讀。唯一 **CI68／35907329257**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後in_progress/null，created **2026-09-23T19:08:40Z**、updated **2026-09-23T19:08:44Z**（台灣2026-09-24 03:08:44）。只查一次，未讀CI68 jobs/artifacts/Pages；Z尚未原生接受。

Z沿用中斷前已保存的招牌遮擋實作。Runtime只改src/render.ts並新增src/town-sign-occlusion.ts：實際平行相機射線檢查原inn-sign是否遮擋在場p0/p1/guest，遮擋降至.30 visibility，9固定tick淡入淡出、12tick邊緣保持；重置／離圖恢復與reduced-motion保留。只在其私有材質上暫用alpha blend而非alpha discard，透明度恢復後還原原材質模式。原80x40pixels、XY2.75、anchor[-4.7,2.4,-3.4]、4vertices/6indices與所有角色尺度／其他材質不改；不改core/main/input/time/save/collision、CPU tiers/pixelcap/memory或held家具。

同一原生600AD旅程、原六段Truce走位順序與預算保留；入口／鎮民／旅店／出口四個放鍵停點新增390x844的DOM及實際CPU canvas，共8PNG。使用原生Escape／Enter暫停恢復、完整凍結state與原viewport還原；不是新路線、teleport或人造存檔。source verifier保留原12PNG／全部七ledger，再驗四停點真實遮擋／alpha blend／同tick／角色owner／HUD安全區／原始走位關聯／恢復。新增8PNG尚待CI68產出，不把fixture或靜態照片當移動舒適性認證。

發布前恢復檢查找到原Z inspector的const receipt陰影遮蔽全域驗證函式，會在新增路線gate觸發temporal-dead-zone ReferenceError。已將後面的原存檔局部變數改名parentReceipt，保留原驗證函式；只追加嚴格inverse和兩個production lexical-scope正負回歸。修正涉及原20檔中的3檔，runtime與保存Z完全相同。原未修正a3f94a06d722efc08d0eab25145bd05c89dfb52b tree從未發布，不應再恢復為當前版本。

修正版完整npm run check通過：1713 Node、assets、typecheck、build；368 Python與diff check通過。receipt負回歸先重現失敗，修正後41項路線測試通過；新增2項相較保存Z1711。check-repaired.log遭本機工具時限中止，不算成功；check-complete.log與result.json記錄exit0。十章節／雙方向離線pixels與幾何對照、六次地圖往返資源穩定、真三角形射線／重複tick／恢復／reduced-motion皆屬單元驗證，不是本機browser或新原生驗收。失敗與最終logs均存雲端。

## 驗收與剩餘完整範圍

CI68 queued/in_progress只保存回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI68_CHECKPOINT完成所有原報告、真圖、七ledger逐byte/hash、原始ZIP指定Drive下載回驗及matching Pages/source/HTML後才接受Z。先親看四停點人物／招牌／屋牆遮擋、alpha過渡和其他站位，再續前段人物植物道具、完整動畫及合法音訊、長時間與真機；不因綠勾擴後段或自評90分。

原三job／13主報告／9native與完整CPU，audio/actor.playback/HUD/normal-paused-reduced/ATB/touch/equipmentv8/fulltrial、同run本人存檔鏈／67腿／4遇敵／2props／17里程碑／6窗口及七ledger每byte/hash全保留；新增8PNG不能替代原12PNG或真正長時間／真機／聆聽觀察。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新修正版 **1ZrJs8QqmUbOmJO-Do0465d1wtV7FrXKo／Chrono-VQ02Z-repaired-tested-batch.zip**，1662278bytes，SHA256 **585c7bb70ab598716f9321aee6745a3b27167f10eb0fa3075ce36e86b53b14ab**。已下載回驗parent／hash／CRC／18項manifest／388程式tar及Git blob；內含未修改舊Z原包作歷史。development/VQ02Z-tested-program-snapshot.tar.gz是assembled已測程式快照，非published Git archive，不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是封裝前歷史；本批現已發布，不重送。最新進度讀main。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
