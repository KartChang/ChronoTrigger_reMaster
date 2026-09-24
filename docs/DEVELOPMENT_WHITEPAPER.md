# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-25-vq03f-ci76-png-fix。Authority：STATUS、TODO、IMMEDIATE_CONTINUATION、CI76_CHECKPOINT。Root T05-early-visual-cohesion；terminal CI76-webgl-png-evidence。Source19697fc3758b7fd484826a61dc2a98b7ddd6837e/treeeff9bafc7f4118b56b8901b782793ef726476706，VQ03F0.9.53 evidence-only修復已一次發布。MatchingCI76/36037654752最後觀察queued/null；accepted=false。F原456446早已發布，舊文件的未發布說法作廢，不重送C/D/E/F。最後有界acceptedCI73/Pages67，不是全美術/原速comfort/完整遊戲認證。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材及原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32玻璃、W原inn-sign XY2.75及anchor[-4.7,2.4,-3.4]保留。X直式Truce同buffer比<.85構圖、half>=7.2及HUD安全區[.045,.955,.12,.80]，Y依完整劇情state推導在場角色，joined不是在場證據。Z招牌降.30／私有blend還原、A四棟各26部件共104mesh僅遮擋群組降.16、原9tick指數／12tick保持均保留，不改共用材質或幾何。

B取景必要隊伍優先，可選旅店地標採1.5/1.6幾何遲滯，成本太高只移除取景要求，不隱藏招牌、不裁切P2／guest。原EarlyCameraMotion、fixed-tick與state／resize／reduced-motion重置保留。同一原生CPU context/page的960×844 WebM由context.close後保存，與source/run/HTML/bytes/hash綁定；host時間只近似導覽，無音訊、無frame-exact或真機宣稱。後續批次不重做B。

## C原小怪配色與實際像素證據（保留的既有實作）

VQ03C／0.9.50 source62469eb87e3c736a99d970d555d4155fab4b8e79；source tree b226e44083a186005d4930915b6a9e44ac962e11；20檔原批次、413程式檔已發布。runtime只改render.ts及新增field-enemy-palette.ts，山道／森林既有小怪用原preservePixelPalette單一unlit emission，diffuse/emissive同原貼圖、去除額外灰色／ambient／specular；離圖／dispose還原。原drawImp、24×32 nearest-alpha／尺度位置／出現規則／數值及其他章節不改。

同原600AD路線在山道與森林原遇敵前唯讀觀察，加field-canyon-canvas.png、field-forest-canvas.png；不加按鍵、路線或暫停。獨立PNG bounded RGB/RGBA scanline解碼、CRC／bytes／hash／IHDR、五RGBA採樣與實際藍金／深色像素數核對。山道3隻、森林2隻必須各有藍金色，原20村莊PNG與完整影片、七ledger及原斷言保留。

C當時最終1843 Node／377 Python、assets/typecheck/build/check/diff通過，74項針對測試及413輸入指紋一致，屬歷史測試不冒稱E新結果。原CI70 state僅作離線回歸，DPR1/2、10個非field章節雙向pixels／geometry、同旅程lab還原及六次warm-cache資源穩定均已測；未啟動本機browser。C→exact B inverse只用於測試，不能改寫原報告／存檔／遊戲state；修正負測試no-op問題不放寬原門檻。

## CI71歷史證據與未接受界線

CI71／35976206740／attempt1已於2026-09-24T09:12:24Z成功，三job及原完整報告核對。七份原ledger由未修改exact C唯讀重算150列逐byte相同；原source archive重建tree匹配。Pages65／35979820044 selected CI/source/artifact10799354174正確，playable/staged/deployed HTML5723474bytes、SHA2563ca579cd2555629bc48e0ae5298668f1b98d98b2503c917ebeb1b43d1734b303一致，公共HTTP步驟success。

CI71完整native-session.webm為18949301bytes／SHA2564d9e18a15284582b6d79a729a4bf2eabd33a440e2a65645cfdd07b2cbff43d22，VP8 960×844、174.360秒，ffmpeg全檔解碼exit0。CI71交接當時只明確全尺寸檢視兩張新field原PNG，其餘85張及影片審查未閉環，因此**CI71歷史accepted=false**，沒有CI71_ACCEPTANCE。後續D已發布並由CI72獨立形成新有界基準，不回填CI71接受，也不因舊checkpoint重驗已完成技術證據。解碼、元資料、像素數字或抽樣不能冒稱原速觀看／舒適性／美術90分。

CI70_ACCEPTANCE.json與commit b2e3c134d56b6df157dd9b72d23400050cf656ad仍保留為歷史收據，不重驗、不改寫failure。其原片曾全解碼與2fps取樣，不是原速動態舒適性證明；該TODO持續開放。CI72有界接受是歷史基準；目前最後accepted為CI73/Pages67，最新修復等CI76，不重驗舊CI。

## D可見性修正與CI72有界接受

VQ03D／0.9.51 source1d2a59bfa14b761969c2dfaf7261e6868bcdcd37、tree1a9fc65f5083e8f5e4a1a361b48647eaa38a48f1已發布。D針對植物實際alpha遮擋保護人物下肢，以及CPU透明建物的面向判定，保留原畫稿、幾何、走位與Z/A/B機制；不是重新製作已完成場景。

CI72／35996220194與Pages66／35999168625成功；三job包含實際CPU救援／審判，原七ledger用exact D未修改程式唯讀重算150列逐byte相同。Source archive重建root相符；playable/staged/deployed HTML5729236bytes、SHA2567618be126d8f7864fd0c1d598ab1f82820b0ef92f3e267a8e88c1cfee925bdfe一致，公共HTTP exact-bytes步驟success。原報告未改寫，未使用本機HTTP/browser重播。

D原87張CPU PNG均以contact sheet檢視，其中22張全尺寸（20村莊／路線／暫停原圖＋2field），其餘65張僅縮圖。174.88秒原片350個2fps畫格全部15張聯絡表檢視，4個取樣畫格另以原尺寸檢視；不是原速播放、沒有音訊／真機／長時間認證。原圖支持出口樹葉淡化後腿部／腳底標記可辨與CPU建物背面覆蓋修正。`CI72_ACCEPTANCE.json`只接受有界技術及明列靜態／抽樣回歸，沒有全美術分數或原速舒適性接受。

## E NPC減少動態與生命週期整合

VQ03E／0.9.52 source344fa860b5c8153b007f75912e16926d966862fa，27個變更檔（19既有＋8新增）、431程式檔；runtime只改story-npc-motion.ts、kingdom-render.ts、rescue-render.ts、render.ts四檔。World既有reduced-motion媒體偏好傳入王國／救援NPC，使用保留原frame0，恢復時採當前simulation tick相位，不補跑。隱藏／停用／visibility=0停止texture upload；mesh／scene dispose釋放binding而不重編存活NPC的錯開seed。無效tick、跨scene／disposed／duplicate binding及共享可變texture均有檢查。沒有新timer、media query實例、圖稿、尺度、碰撞、故事或存檔改動。

原生觀察置於既有暫停Truce第一個960×640 viewport內，依序before／reduced／restored，以媒體偏好切換與render frame boundary觀察；不新增按鍵、走位、sleep、save或game/time state寫入。完整凍結state、同tick重複觀察、NPC角色／seed／frame／upload及原偏好／focus／renderer／viewport必須相符；三張actual CPU canvas PNG在npc-comfort/保存，before／restored要求精確byte hash相同。

新scripts/npc-comfort-evidence.mjs以同source/run/HTML綁定，独立PNG解碼／CRC／bytes／hash／尺寸與frame/upload核對；新增4列npc-comfort-source-ledger.json（原報告＋3 PNG）。這是額外gate，原七ledger、三job／13主報告／9native選檔及完整CPU600／救援／審判、20村莊圖／完整影片／2field PNG與全部舊門檻保留。原速舒適性不能由paused frame或unit fixtures推導。

最終npm run check為1990 Node全通過、0failed／0skipped，Python389全通過，assets/typecheck/build/diff通過；70項NPC針對測試包含於完整Node結果。431程式輸入指紋檢查前後及發布前一致。E→D使用精確唯一差異片段，19個原D SHA256保留，missing／duplicate／unrelated負向測試保留；不是豁免整檔或改寫原生報告。Git整棵已發布tree等於已測程式加當時main文件。Log hash及Drive恢復點見VQ03E_TESTED_BATCH.json。沒有本機browser。

CI73/36008892936已completed/success並完成有界accepted；Pages67/36013140375 selected exact E。原三job/完整CPU與原七ledger150列+NPC4列、source/root及HTML已核對；90CPU圖contact/7full-size、178.68秒原片357個2fps畫格/2full-size樣本為明列審查範圍，不是原速播放。CI73_ACCEPTANCE與雲端1YiSgMeQG7zDqE3ZgiQEVlqMXk8glvdM6沿用，不重验。品質工具舊30/100仍不適用目前runtime，release BLOCKED，沒有新分數。

## F既有動態功能、CI75失敗與四檔PNG證據修復

F456446c3f2e3b6c38425800542c76ac4f92ae355/tree611d402cee95f3319ef7313cb63bcea772422a6a已發布祭典商販/證人及審判NPC減少動態、binding生命週期與森林時門非必要旋轉抑制。Runtime必要任務/戰鬥動作不改；原生觀察附加於既有凍結區間。舊STATUS/handoff落後造成一次重疊E-based本機實驗，提交前tree比對已識別並排除，沒有再次提交F；investigation-only記錄不可作為發布來源。

CI75/36025802235，validate/good成功，bad107733204147在新增PNG gate失敗：實際WebGL960x640被CPU-only307200像素decoder誤拒。這不是縮小圖片或改renderer就能通過的理由。Current source19697fc3758b7fd484826a61dc2a98b7ddd6837e只修改fair-trial-comfort-evidence、新webgl-canvas-png及兩個test共4檔。獨立WebGLdecoder限定614400像素/1280edge/4MiBcompressed，校驗IHDR/chunkCRC/IDAT/IEND/8bitRGB-RGBA/5filter/解壓長度及streamboundary；原CPUdecoder逐byte不變。既有exactdimensions/source/run/HTML/hash/frozenstate/frame/上传次數/exactrestore門檻保留，全部runtime/assets/workflow/nativecapture不變。仍F0.9.53，不是美術重做。

原CI75證據唯讀重現失敗，修復後bad5/validate14列通过，278原檔hash不變；這只是診斷，CI75仍failure、Pages69 skipped，不回填成功。三張原WebGL960x640PNG全尺寸檢視，不延伸成完整movie/原速/真機驗收。新matchingCI76/36037654752仍待原生結果。

最終2090Node/397Python、57targeted含於Node，assets/typecheck/build/check/diff與441輸入指紋通過，發布全樹eff9bafc7f4118b56b8901b782793ef726476706等於已測程式+當時main docs。新CI的原始三job、全部旅程與附加gate不可由offline結果取代。收據VQ03F_PNG_REPAIR、CI75_FAILURE、CI76_CHECKPOINT。

## 完整剩餘範圍

先完成CI76_CHECKPOINT.remainingReview：僅查exact matching run一次，active先保存接續点，不久等。完成後核對原三job/主報告/nativechooser/完整CPU链、原七ledger及E/F附加gate；審查本run原圖原片與matchingPages，原ZIP/source/movie/reports存指定Drive回讀後才有界接受。CI75failure原狀保留，offline診斷不可替代CI76；不重送F或PNG修復。

接續T05人物／植物／道具製作品質的尺度輪廓、原速移動與淡化舒適性、完整動畫與合法音訊；D有界植物修正不等於所有尺度遮擋問題完成，E減少動態整合不等於全動畫或音訊完成。前段實際品質優先不變。

T03規則版本、全拓樸與數值忠實；T04完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技；T05全部美術動畫音訊；T06全部時代主支線結局；T07整體>=90／各面向>=80%、required assets／five gates／zero critical及真機輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊；T08每批實作測試、一次source、完整matching CI與雲端原始產物回讀。沒有新評分或分母縮減。

## 持久交付與限制

F最終修復及CI75五原ZIP：Chrono-VQ03F-witness-motion-batch.zip/file1mfQYN5dk3BxM9syRQnJ_F_Dv4nY0h3o0，86370495bytes/SHA256e369dde3b2b68c3affdda1788590f538e5daedd32f2500b47912e6590f264b65；同一指定folder實際下載parent/size/hash/CRC/47manifest/5原ZIP回驗。含完整原片/source/report及441已測快照；snapshot非publishedGitarchive/最新docs，investigation-only不可套用。修復已發布，封裝前published=false/source=null僅歷史。

唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。E已測包Chrono-VQ03E-npc-comfort-batch.zip，file1gbx0yzpPjOr9fmSTvAHQNQ1VPer0n078，1097022bytes／SHA2560766df6c10901c85d9ff0345fce4a98b9180c9aa8d572f465e939e1f5b7dfc26；parent／size與實際下載hash／CRC／30manifest已回驗。431檔assembled程式快照不是published Git archive、不含最新進度docs；E已發布，歷史source=null不能觸發重送。

D／CI72原始證據包Chrono-CI72-VQ03D-reviewed-evidence.zip，file1uApj0yusWMaC5Ed7Kz1cMIqQjmXiHTYW，93705018bytes／SHA25610749b84c0478732fda681307d64ba46876be6998ee2de76118f723a51189a4d；七個未修改ZIP、exact source／完整影片／報告／review與47manifest已下載回驗，不重做。

CI71／Pages65歷史原證據包1e5coZaU45p3QZy1I-eOesqj5Md7wI8dO，86421383bytes／SHA25654d971655c70040276c4d0c9fbf2560175ead3f5452d9db29722ab9576d2284a，七未修改ZIP及17項manifest既有回驗保留；C開發包17PqOqK16Wn4LM8HlxaZ8nfnVXp_75tVu保存413檔已測assembled快照，不當最新進度。最新文件一律讀main。詳DELIVERY_INDEX及目前CI76_CHECKPOINT。

main only、single AI、non-force，不建其他branch／平行candidate／PR／多人防撞、P3、ARPG或重造框架。不造game/time/save/collision state，不放寬<.12、原tick預算、單一30秒、250ms／256及品質。Held VQ01Z／母親家具禁止提升或間接替換；prologue-render.ts blob保持2711a74185aacf3c6bddf9db85ba99a2afbc507a。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
