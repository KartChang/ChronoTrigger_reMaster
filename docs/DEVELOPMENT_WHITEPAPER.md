# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-24-vq03c-ci71-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI71_CHECKPOINT。完整產品目標不縮；CI70/Pages64原技術結果已接受，動態審查界線仍保留；C/0.9.50待原生驗收。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材及原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32玻璃、W原inn-sign XY2.75及anchor[-4.7,2.4,-3.4]保留。X直式Truce同buffer比<.85構圖、half>=7.2及HUD安全區[.045,.955,.12,.80]，Y依完整劇情state推導在場角色，joined不是在場證據。Z招牌降.30／私有blend還原、A四棟各26部件共104mesh僅遮擋群組降.16、原9tick指數／12tick保持均保留，不改共用材質或幾何。

B取景必要隊伍優先，可選旅店地標採1.5/1.6幾何遲滯，成本太高只移除取景要求，不隱藏招牌、不裁切P2／guest。原EarlyCameraMotion、fixed-tick與state／resize／reduced-motion重置保留。同一原生CPU context/page的960×844 WebM由context.close後保存，與source/run/HTML/bytes/hash綁定；host時間只近似導覽，無音訊、無frame-exact或真機宣稱。C不重做B。

## 當前技術基準

**CI70／35953426299／B source4c3df07c1a6e067afbd3d42f423481d8e406f9c6／Pages64 35955841858已技術接受**。收據evidence/CI70_ACCEPTANCE.json已獨立發布於b2e3c134d56b6df157dd9b72d23400050cf656ad並回讀。三job、13主報告、9原native chooser加完整CPU、同run存檔鏈、67腿／4遇敵／2props／17里程碑／6窗口與20張村莊圖均保留；七份ledger精確原程式唯讀重算148列逐byte/hash一致。playable/staged/deployed HTML5721203bytes，SHA25686abc671d3d17f3c106e20c47c88dd18f9ac4ac9bd6d595e2959e244bfd85957，Pages公共HTTP步驟成功。

CI70完整原生WebM 18801088bytes／SHA256697050a4bf5fb79e5f08736a7f07db125908e2b11b238bbf40dc01799134552c，VP8 960×844已完整ffmpeg解碼exit0。實際檢視方式是原城鎮路線2fps連續取樣的六張畫格聯絡表，另85張CPU圖由八張聯絡表檢視及出口原圖全尺寸；**不是原速連續播放，也不是每一原始frame都檢視**。可見走位、淡化與出口構圖改善；host時間僅近似導覽，與影片內容可能差數秒，未做逐幀精確對時。原速動態舒適性／完整過渡審查仍開放，沒有錄音、真機、長時間或美術90分認證；技術接受沒有取消這些TODO。

## C原小怪配色與實際像素證據

VQ03C／0.9.50 source **62469eb87e3c736a99d970d555d4155fab4b8e79**；root tree **b226e44083a186005d4930915b6a9e44ac962e11**；parent **b2e3c134d56b6df157dd9b72d23400050cf656ad**。20 檔一次 non-force 發布，413 程式檔與最終已測快照匹配，三個程式子樹及完整 root tree 一致，main 已回讀。唯一 **CI71／35976206740**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source 全 event/state count1。最後 queued/null，created/updated **2026-09-24T08:36:12Z**（台灣 **2026-09-24 16:36:12**）。只查一次，未讀 CI71 jobs/artifacts/Pages；C 尚未原生接受。

Runtime 只改 src/render.ts 並新增 src/field-enemy-palette.ts。山道／森林的三個既有小怪 sprite 接回現有 preservePixelPalette 單一 unlit emission 配色流程，去除舊灰色自發光、環境光及高光相加；diffuse/emissive 使用同一原貼圖，不重畫 drawImp。記住原材質設定，離開這兩章或 dispose 時還原；重複 draw 不累加材質或貼圖。不改原24×32 nearest-alpha、圖像內容、模型／位置／尺度、敵人數值／出現規則、相機、Z/A/B遮擋與取景、core/main/input/time/save/collision 或 CPU品質／記憶體。

同一原生 CPU 600AD 旅程，在原山道與森林遇敵之前各追加一次唯讀觀察及實際 CPU PNG：field-canyon-canvas.png、field-forest-canvas.png。不輸入新按鍵、不寫 state、不插入新走位或暫停；原20張村莊圖、全部旅程與 native-session.webm 保留。observer 核對當前 state／tick、可見敵人 owner、原貼圖五個 RGBA 點、材質與投影，保存可取得觀察後才拋錯。獨立 verifier 解碼同一原始 PNG 的有界 RGB/RGBA scanline，驗 CRC／bytes／hash／IHDR及實際像素配色數量；山道3隻／森林2隻必須各有藍、金色，群組有深色輪廓，不只相信材質旗標。兩份原始 PNG 追加到既有 era ledger，七份 ledger 與所有舊斷言不減。

最終 locked 完整 npm run check 通過：**1843 Node、377 Python、assets、typecheck、build、diff check**，比 B 增加61 Node／4 Python。413 項最終輸入指紋未變；npm check exit0 完成UTC2026-09-24T08:12:52.459260，Python及diff於08:12:55完成且exit0。74項針對性測試通過。原CI70山道／森林遇敵前 state 僅作離線回歸，DPR1/2、真實observer JS配合production World port及獨立PNG gate均驗；10個非field章節兩方向像素／幾何、相同往返旅程的lab材質還原、六次warm-cache資源不增均驗。單元Canvas不是本機browser或新原生畫面。

首輪完整check遭本機host時限中止不算通過。初稿lab測試誤把返回場景與全新場景比較，改為相同旅程基準；舊NPC負測試因新增inspect前綴而可能沒有真的修改字串，改先還原精確B再突變並強制檢查非no-op。C→exact B是嚴格test-only source inverse，不改原報告、存檔或遊戲state；原數字／hash斷言不放寬。失敗、中斷與最終logs均保留，沒有本機browser。

## 驗收與完整剩餘範圍

CI71 queued/in_progress只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure處理同run首個實際root與原artifact/source-failure，不放寬門檻。Success依CI71_CHECKPOINT核對完整原reports、七ledger逐byte/hash、原20張村莊圖與新增2張實際field PNG、完整影片及同CI Pages/source/HTML；原始ZIP放指定Drive並下載驗hash/CRC/parent後才接受C。先親看山道／森林小怪藍金配色、深色輪廓及與人物／背景的分離，再續植物遮住下肢、原速移動及淡化舒適性、全角色動畫與合法音訊。不得以像素數字、離線fixture或綠勾宣稱美術完成；不重開CI70已閉環的技術證據。

原三job／13主報告／9native加完整CPU兩旅程／600／救援／審判，audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W/X/Y/Z/A/B素材與操作、三viewport12PNG及四停點8PNG、全paused state、Tab/Space、viewport恢復及native resume不減。B錄影原片必須保留；完整解碼及抽樣畫格不等於原速動態、長時間／真機／聆聽認證。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。C已測包 **17PqOqK16Wn4LM8HlxaZ8nfnVXp_75tVu／Chrono-CI70-accepted-VQ03C-tested-batch.zip**，**2045961bytes**，SHA256 **801681286c565e1ec3298646414cecb24008e12b5ac77ebd4f698e5ca8a3ddfc**；已下載回驗parent/hash/CRC/54manifest/413程式tar及Git blob。development/VQ03C-tested-program-snapshot.tar.gz是assembled已測程式，非published Git archive，不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是封裝前歷史；C現已發布，不重送，最新文件只讀main。

CI70／Pages64七個未修改原ZIP、完整影片及review包 **1BCla-ZC2E0oHLCdFJQEQyEhlWCMB0hV9／Chrono-CI70-VQ03B-evidence.zip**，87991208bytes，SHA256 **ab139df4f8213f4fc8a7b26aa34fe517f5c226629dc497b9b64afbd6797f2227**；已下載回驗parent/hash/CRC/29manifest及七個內層ZIP。既有CI69及更早結案不重驗；歷史failure不回填success。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
