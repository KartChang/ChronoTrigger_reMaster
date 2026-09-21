# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq02a-independent-audio-ci43-pending。更新既有產品進度，不重新規劃。動態source／run依STATUS、IMMEDIATE_CONTINUATION及CI43_CHECKPOINT。前版完整白皮書保留於 **d089b25ad75d8aebea67c748aacaaa4e5c01fa74**；其中Z發布受限沒有解除，本批只新增獨立音訊。

## 目標、順序與固定架構

完整《超時空之鑰》HD-2D重製目標不縮小：像素人物＋立體場景、原作辨識度、縮尺大地圖及城鎮／室內切換、原地ATB、單人或同機雙人共畫面，完整時代、主支線及結局。合作不是改ARPG。先完成前幾幕場景、人物、美術建模動畫、鏡頭遮擋HUD、操作與聲音，以實際證據達到品質門檻再擴後段，不把完整版縮為序章。

TypeScript＋Babylon.js＋esbuild自含HTML，保留package/lock與工具鏈。Node建置，Python／Playwright驗收；玩家不用Python、ROM、帳號或後端。不改Unity／Three.js，不增加.NET／SQL／RAG／SaaS或平行框架。

Controls→main固定1/60秒→core規則→render/HUD/audio呈現。畫面與聲音不決定傷害、資源或劇情。暫停／背景／對話／背包／原生選檔不推進模擬，恢復不補算背景時間。InputBoundary清邊界舊輸入；A*使用既有碰撞，不瞬移穿牆。P1克羅諾／P2露卡及劇情入離隊控制權保留；青蛙／瑪兒為有HP／MP／ATB、可被敵方選中與自主行動的第三同伴，不是P3或完整自由換人。保留独立選敵與雙確認合技，不因測試改數值或業務條件。

## 既有內容與不可重做範圍

已串接家中醒來／上下樓→縮尺區域圖→千年祭初遇與行為→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕／證詞兩裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。舊pending/failure不重開；2300抵達不是完整未來篇，經驗紀錄不是等級系統。

既有裝備與梅爾基歐商店：相容角色、武器／身體／頭部、穿戴份數、金幣庫存守恆及交易上限，不能賣仍穿戴裝備。400G旅費、13項商品、價格與普攻／防禦加減是明示暫定重建，不是假稱原作數值。完整成長、技能學習、戰鬥金幣、飾品、自由換人尚未完成。

IndexedDB／JSON白名單v1–v8覆蓋技術村落、千年祭、異變、王國救援、序章、審判越獄與裝備。舊檔未知行為不補造證詞，僅查看不強迫改寫；匯入本人舊檔是合法回溯，守恆不是防作弊簽章。snapshot／paused／view／audio只讀，不設通關旗標、改進度或製造正向存檔。音訊偏好與節拍不進遊戲存檔。

## 前段品質與保存資產

使用者認為缺乏承諾的精緻HD-2D仍是交付落差，不是期待錯誤。引擎、像素尺寸、模型數、測試數或七段配樂都不等於成品品質；90是實際完成後的驗收門檻。沒有目前美術90有效證據，舊30stale，release仍BLOCKED。

A/B/C四主角、鏡頭、接地陰影；P祭典棚布／鐘／傳送器攤位；S地面明暗取樣；T探索HUD；U觸控context；V固定tick動態與reduced-motion；W局部光照銅材質／6樹根8柔邊陰影；X細石板石縫／走道鐘庭／grassmask；Y較淺投影、保留caster資格的合併、20件原邊界倒角和微幅人物寬度對齊，全部保留。不重畫已保存素材，不套舊independent-ui，不旁路家中renderer；歷史43／31不是現在缺檔數。

## 最後已驗收：Y／CI42／Pages36

Y0.9.21 source **3c2e03e02c7be0e5921fa689f32d674c68ae64f4**，tree **afd919fc37bbac025006fbdbad2e942757ea766d**。CI42 **35568827641**，三job／13最終主報告／9原生紀錄／3source-run-attempt-HTML ledger與列入bytes/hash已閉環，三ledger為只讀產物重現。實際九場景圖有較淺投影與鐘庭倒角，仍有木料平塗／人物植物與道具材質密度／直向地標裁切問題，不是90分。

原HUD10、地面3、三視窗正常／暫停／減少動態、接地／ATB突進／匯入清理、觸控context退休與兩視窗、商店裝備經濟／v8／IndexedDB／勝利／完整審判及故事均保留。Y觸控完整load4929.48ms低於原30000ms，未放寬。

Pages36 **35571121776** 已匹配source與CI／HTML5637348bytes，SHA2567760a26e592a17516836cd32a2f87cfa9d5fe2a3d6b2ae35083b71eec9d70a43。公開HTTP驗證來源為2026-09-21T07:03:31.7352603Z成功deploy步驟，沒有另一次本機live-byte/browser宣稱。CI42_ACCEPTANCE／CLOUD_RETENTION／VISUAL_REVIEW／PAGES36_PROVENANCE不改動；CI42及更早閉環不重開。

## Z／0.9.22：已保存，仍未發布且受限

Z17個程式／測試／建置檔保存於指定Drive。內容是重用material-art木料／灰泥矩形、祭典限定紋理與物理UV，以及角色安全優先的直向地標水平構圖。此前966Node／213Python通過、102組未受影響相機比對屬Z本機紀錄，不是本批結果；沒有實際after圖或新Pages驗收。

其GitHub.create_tree程式寫入遭工具安全檢查封鎖，沒有Z sourcecommit或candidate。不能因一般「繼續」重送、換編碼管道、間接替換或提升部分tree。VQ01Z_CHECKPOINT的ci43Exists=false是當時Z封鎖狀態，不代表後來獨立音訊不能有CI43。本批從已驗收Y恢復，未套Z；fair-surfaces/fair-composition仍不存在，early-comfort/festival-kit/fair-render保持Y。這是保留限制，不是宣稱GitHub／Drive不可存取。

## VQ02A／0.9.23：獨立前段音訊整批已發布

Source **b54ff3079c8d087bb1396229bc3adf718f2e8cd4**，tree **e9fce47b7454f0a30bb389f3b96628b94c491cbb**，parentd089b25ad75d8aebea67c748aacaaa4e5c01fa74。19個改檔一次非force發布與回讀；完整src/tests/scripts與本機測試bytes一致，未夾帶Z。詳述見AUDIO_T05.md。

music-score.ts新增hearth/fair/road/tension/battle/victory/defeat七段短曲，旋律與編排在本案自製，沒有抽取或轉錄原作OST，不冒稱完整曲庫／原作音樂忠實度。三種聲部使用原生triangle/sine oscillator，不增加音檔、網路、字型、樣本或外部素材。勝利／敗北為一次性短句，其餘短曲循環；多個尚未專屬配曲的場景共用road/tension。

scene-audio.ts僅是選擇性呈現：預設關，真實使用者開啟才建立AudioContext；只有真實pointer/keyboard事件resume，不在frame loop重試。固定simulation tick決定節拍，跳過逾時步而非補播。max16 voices，有限音量包絡，ended與逾時reap雙清理。原聲音按鈕整合開關；主迴圈只傳狀態和halted，音訊不改碰撞、ATB、輸入或存檔。

暫停／對話／背包／背景／原生選檔會停音源且master歸零，對話期間效果音也被抑制。換state、換cue、tick回退會清舊phrase；恢復在下一有效節拍繼續，不補舊音效。異步resume晚回、靜音切換、dispose及裝置錯誤都有清理。音訊失敗只回報狀態並關音，不拋入遊戲規則。這些是實作行為，不是假稱已完成所有真機背景音訊驗收。

新跑 **987Node／208Python**、assets／typecheck／build全通過。22個既有main遊戲函式在移除明列音訊呼叫後與exactY函式hash一致；原整檔hash斷言因有意音訊接線前移，沒有刪斷言。已保存初次pin／新增fixture修正紀錄；native AudioParam的float32僅容許1e-6讀值誤差，不放寬零音源／靜音／狀態與timeout。計數以Y為base，不包含被保留但未發布的Z測試。

既有equipment旅程附加真正按鍵／原同run v6匯入與live analyser觀察，不新增假存檔或writable hook。檢查無autoplay、波形能量、pause/inventory/dialog零輸出且遊戲凍結、原生chooser立即清音、換檔epoch／fair曲與mute。資料嵌入equipment最終報告並另存scene-audio-report.json，由lane verifier核對；原13主／9native／3ledger與所有故事觸控畫面斷言保留。

**CI43 35576672389**，push/attempt1，last observedin_progress/null，updated2026-09-21T08:12:24Z。未驗收、無新Pages／聆聽／實體裝置結論。本機未跑browser；fake ports與synthetic fixture不是聲音證據。本機HTML5643715bytes／SHA256ba5114bf5879458c28cdd68a9ae7df4498939bb4bc0a8450541bca9ddf715ee9，sourceSha=null，僅local build。CI43成功仍須核對原報告、實際圖與analyser、保存原產物、Pages/source/HTML匹配；有波形不等於聽感或藝術品質。

## 未完成完整範圍與接續

T03隱藏規則／版本差異／全地圖室內迷宮拓樸與原作數值；T04成長／技能／報酬掉落／完整經濟消耗品飾品／完整角色雙三人技；T05全美術動畫與權利清楚音訊，家中母親家具、整體材質比例、窄視窗構圖、完整動作與配樂聽感仍有缺口；T06完整未來篇及其餘時代主支線結局；T07整體90／每面向80%、零critical、必需素材五gate及實體裝置輸入／FPS／frame-time／載入／記憶體／背景恢復／存檔；T08每批GitHub／指定Drive回讀。完整目標不縮小、不改分母、不只評已完成項目。

只接CI43同run：pending保存回報、不長輪詢；failure處理第一實際根因；success原始證據閉環後再接其他允許的前段工作，不以音訊掩蓋美術缺口。不取消、重派或另開candidate。文件[skip ci]。

## 雲端與固定限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。VQ02A新包 **1_JwcNmG7FmSnNKcAQ-dYhtv7x4jN_DLu**，1928839bytes／SHA256fda53969d477b14dfb322b691b9a501e5d3a2c1db7d6005ecd7634fa284ad02d，下载回讀hash／CRC／34manifest／parent通過。19改檔、原始log、未驗收localHTML、226檔assembled snapshot；不是新commit的Gitarchive。封存nullsource是prepublication狀態，最終GitHub收據提供source及完整子樹匹配，最新main文件另讀。

Y已驗收原包1wlMzDYoWV7a9fHnrBQQ9KjyHMl-1FqjW與Z受限包1hTbyvTOdJ0K7QtM4Pm_2ZLV4aW6pxpV9留存，詳DELIVERY_INDEX。不重傳ROM，不下載全部歷史。不觸碰受限prologue-render.ts／localbrowser；原rendererblob2711a74185aacf3c6bddf9db85ba99a2afbc507a。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules與esbuildhardlink，不覆蓋source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM、原圖原音訊、字型檔、憑證不公開。容器不是永久依據。
