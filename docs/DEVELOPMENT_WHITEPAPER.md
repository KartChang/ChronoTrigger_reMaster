# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02i-ci51-pending。更新既有進度，不重新規劃。唯一執行依STATUS／IMMEDIATE_CONTINUATION／CI51_CHECKPOINT。前版全文保留於 **0fe330ddbfac451667e57d0f5b3917a6bdcfa651**；其CI50待驗收文字由本次實際failure及I/CI51取代，不重開已完成章節或舊驗收。

## 產品目標、順序與架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮成序章。先讓前段場景、人物、美術建模動畫、鏡頭遮擋HUD、操作與聲音取得真實品質證據，再擴後段。90是實際達標驗收結果，不是AI自評或特效數量。

TypeScript＋Babylon.js＋esbuild自含HTML及固定package/lock保留，玩家不需ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；CPU呈現重用既有場景圖，不重造平行關卡規則。音畫不決定傷害、資源或劇情。暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入，A*保留碰撞。P1克羅諾／P2露卡及劇情入離隊所有權，瑪兒／青蛙自主第三同伴，獨立選敵、雙確認合技保留。不加P3、不以可寫測試hook通關、不弱化斷言或timeout。

## 已有功能與保存素材，不重做

家中醒來／樓梯→縮尺區域圖→千年祭行為初遇→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕與兩裁決→敲門越獄或等露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇；經驗紀錄不是完整等級成長。

梅爾基歐商店、武器／身體／頭部裝備具角色相容、穿戴份數、金幣庫存守恆及交易上限；不能賣仍穿戴品。400G、13商品、價格與普通攻防增減為明示暫定重建，非原作數值認證。完整成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人仍未完成。

IndexedDB／JSON白名單v1-v8保留；舊檔未知行為不補造證詞，查看不強制改寫；本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu/frame觀察唯讀；CPU同run真匯出v2不能取代原裝備v8或其他存檔旅程。渲染偏好與診斷不寫入遊戲存檔。

A/B/C主角與鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態及reduced-motion、W局部光照銅材質六樹根八陰影、X細鋪面分區grassmask、Y投影閱讀性／caster合併／20石材倒角保留。C角色用原片段／影格、固定tick動作及位移步伐、96格CPU快取。A七段自製短曲與B靜音修正保留，非原作OST或完整配樂。不重畫保存素材，不套回舊independent-ui。

## 真正品質界線與固定限制

欠缺精緻HD-2D仍是交付落差。木料平塗、人物植物與立體道具材質語言、尺度輪廓、窄視窗地標構圖，以及家中升級母親家具、完整動畫音樂仍有缺口。既有母親對話可操作不等於新美術整合。測試數、引擎、模型數、短曲、CPU相容與FPS標示不能替代美術90證據。舊30stale、release仍blocked，沒有目前整體已接近完成的量化認證。

Z0.9.22材質／UV／直向構圖仍雲端保留、未發布且受限，不重送、換編碼管道、間接替換或部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**及localbrowser限制不因一般繼續解除；這不表示GitHub／Drive不能讀寫。

## CPU能力與最後完整驗收

D/E已實作WebGL2/1不可用時預設CPU／Canvas2D fallback，真正處理既有頂點矩陣、簡化光照、UV紋理、透明深度與像素，不是NullEngine空跑或只顯示錯誤。640×480基準像素cap、最大邊1280、紋理32MiB/512格，不做shadowmap/glow/specular，不保證WebGL視覺一致或全部裝置流暢。E保守剔除畫面外submesh、省去完全畫面內三角形裁切、重用每幀方向光；原像素規則及真實work計數保留。

最後已驗收仍 **E0.9.27／sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／tree00efc6b0ea450961739948a952bd2756ea7f2eb1／CI47 35615882220／Pages41 35618506663**。13主、9原native加CPU native、五ledger、音訊actor/HUD/接地ATB/裝備v8/完整故事審判及觸控、實圖、原包與source/HTML已閉環。CPU前段真正走過家中至祭典、P1/P2、ATB及自己匯出v2再原生匯入；不是全章CPU／裝置／聽感或90認證。CI47及更早不重開，不補造CI45獨立驗收。

F0.9.28已實作CPUtiers在原cap後套用，初始auto保留舊尺寸、auto0–3／quality0／compatibility2實際buffer；120格活動frame interval、mean/P95/max/FPS、CPU/Canvas2D及統一build/source身份。這是負載控制與觀察，不保證FPS或美術提升。G/H/I全部src不變，完整保留F實作，新增完整native驗收尚待通過。

G原生鍵盤release後snapshot／反方向修正、H長腿最多250ms距離縮放降低讀取成本均已發布，不重做。CI48/CI49皆實際failure，不接受或重跑；詳細原因與原包收據保留。CI50已真正通過這兩個先前卡点，不能把舊pending當現行工作。

## CI50實際根因與部分native成功

**CI50 35669876213**／Hsource **840ffe01882c8248f11603ee1c4da246f5aa2ccc**，completed/failure，updated2026-09-22T00:15:21Z。validate **106563719363** step21CPU失敗；good **106563719387**／bad **106563719274**成功。

第一CPUcase已完整家中到祭典，六次move釋放後抵達；先前大地圖長腿before747／after1000，253/315tick，z5.060000000000005。Fpresentation已記錄61真活動sample：mean45.657377ms／P95 60.1／max81／FPS21.902266，統計一致、CPU/version/source標示吻合，原生quality678×452／compatibility452×301真正改變buffer，完整pausedstate相同，portrait與shortlandscape斷言到達。這是可保留的部分原生證據，不是全CPU／持續效能或裝置認證。

新第一root **CI50-cpu-coop-primary-outer-chord-oscillation**，在第二CPUcase第一腿雙人z=-5→-2。P1先按／最後放，跨越P2兩次transport期間仍在移動。記錄zero-ms hold仍讓P1移動8–9等效ticks、P2移動2–3ticks，導致在原<.12目標兩側振盪。10pulse耗172/165tick，before177／afterRelease349，P1z=-2.199999999999998、P2z=-2.8666666666666667；catch352是之後的snapshot。真正individual event延遲拆分沒有時間戳，測試port中的拆分明示為模型。

原failure.png已檢視，CPU祭典雙人、鐘、鋪面與攤位可見，非WebGL啟動失敗。Step22缺成功final CPUreport是次生。四原ZIP大小/hash/CRC、十張實際CPU PNG與renderledger六列入檔bytes/hash核對；十張為九前段加failure，非11成功圖。沒有重跑verifier、重產精確ledger或全lane複驗宣稱。ATB/本人v2匯出/IndexedDB/原生匯入仍未完成，沒有playable／新Pages。CI50不接受，CI50_FAILURE_ROOT及雲端保留完整十pulse分析與原圖。

## I修正發布與本機測試界線

**I0.9.31／source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5／tree5563d8c44fded9b43c72461411aef7a1ab2d6376**，parent0fe330ddbfac451667e57d0f5b3917a6bdcfa651。三檔整批測試後一次non-force發布回讀、完整tested子樹匹配：tests/cpu_native_route.py、新cpu_native_chord_test.py、scripts/build.mjs版本。全部src/index/.github/config、整份CPUbrowserdriver、G/H原測試與36/24子案例不變。

長距離保留Hcoarse高效率P1外層順序；接近目標改為P2down→P1down→hold→P1up→P2up，让精準觀察的P1在P2transport期間不再被持續按住。這一腿一旦進入precision便保持，僅重新估計release位移，沒有重設clock/tickbudget或扣除成本。原<.12、釋放全部後snapshot、每腿ceil((距離/速度+2)*60)、單一30秒、先budget再arrival、250ms maxhold與全attempted-key cleanup保留。native_pulse函式不變；trace增加arrivalOwner/chordPolicy/keys/releaseKeys/chordOrder。没有遊戲時間/state/save/collision改寫。

新跑 **1161Node／250Python／assets／typecheck／build**，完整npmcheck最終exit0。新增10Python測試及48長腿方向/軸/速度/讀取成本子案例、原四co-op座標串行、兩種按鍵順序cleanup、單人獨立及負向budget/deadline/blocked/pause/transition。CI50成本模型重現舊172/165fail，最終86/165、4pulse、P1z-2.0666667；模型不是nativebrowser／成功存檔證據。初次red、淘汰的全程inner草稿長腿失敗、工具中斷check及最後完整成功logs分開保存；未發布被淘汰草稿。本機沒有操作browser。

唯一 **CI51 35675330433**，push/attempt1、exactSHA全event/state count1，最後in_progress/null updated2026-09-22T01:19:34Z（台灣2026-09-22 09:19:34）。未查jobs，不等待輪詢、取消、重派。pending保存回報，failure同run第一實際根因，success完整同source證據，不因後續文件HEAD重跑CI。

## 完整驗收與剩餘工作

CI51成功仍需原3job／13finalprimary／9原native加CPU／fiveledgers與所有列入bytes/hash，原audio/actor.playback/HUD/正常暫停減動態/接地ATB/equipmentv8/完整trial/touch全部保留。CPU兩原生旅程、同run自己匯出v2與IndexedDB/原生匯入，>=60真sample一致統計/身份、quality真正尺寸、完整pausedstate、11成功原圖/14CPUledgerfiles，及原budget內afterRelease<.12與I實際coarse/precision按鍵release順序都須核對。原包指定Drive下載回讀後再核對Pages/source/HTML。CI嵌入sourceSHA，不以本機null-sourceHTML作hash基準。不用progress或fixture替代。

T03隱藏規則／版本差異／完整拓樸／數值忠實度；T04成長報酬掉落／全經濟物品飾品／技能角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來與其他時代主支線結局；T07整體90、每面向80%、zero-critical、必需素材五gate、實體輸入FPS/frame-time/載入/記憶體/背景/存檔/音訊及全章CPU；T08每批雲端。不得縮小分母只評已做功能。

前段真品質優先。CI51完整閉環後，整批接續全原生CPU章節及裝置觀察／實圖相容缺陷、人物植物與道具材質比例輪廓、窄視窗地標、動畫音樂；重用保存素材，不以測試數替代美術，不擅自解封Z／升級母親家具或提早擴後段。

## 持久交付與恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新 **Chrono-CI50-terminal-VQ02I-tested-batch.zip／1OwdrRCffGd6YtJx2YMn1qzoPE2CnvYoV**，53409483bytes，SHA256 **a48de01346c3fdc37a46e538cc9dffd5ff629984d4002bedfda7b2dce6858a5a**。下載hash/CRC/30manifest/四原ZIP/parent全部一致；含完整failure分析、三改檔、原logs/exit、未驗收localHTML與273檔assembled程式恢復快照。不是publishedGitarchive；除THIRD_PARTY不含docs，最新main文件另讀。原browserZIP內保留exactH Gitarchive。封存nullsource在發布前，最終GitHub I收據補身分，不重寫原證據。

固定工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules及esbuildhardlink，不覆source/config或開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳；不公開ROM、原圖原音訊、字型檔或憑證。所有修改交付回GitHub／指定Drive並回讀，文件[skip ci]，臨時環境可能清除，不能當權威。
