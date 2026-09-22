# 立即接續 — CI50失敗已修；唯一CI51待完整驗收

立即使用GitHub connector，必要時Drive，接手KartChang/ChronoTrigger_reMaster。唯一main／單一AI／non-force；不建立branch、PR、平行candidate或多人防撞，不盤點歷史、不重做章節、不要求token、ROM或手動證據。所有交付回GitHub／指定Drive並回讀；文件[skip ci]。臨時環境不是權威。

## 唯一目前位置

**VQ02I／0.9.31**。
Source **44ba3922ac2e6b1dd002624a38f4156edcd7d2c5**。
Source root tree **5563d8c44fded9b43c72461411aef7a1ab2d6376**。
Parent **0fe330ddbfac451667e57d0f5b3917a6bdcfa651**。
3檔整批測試、一次non-force sourcecommit發布並main回讀，完整tested程式子樹一致。全部src/index/.github/config及原CPUbrowserdriver不變，原最新文件子樹保留。後續文件HEAD不是另一個source，不因此重跑CI。

唯一 **CI51 35675330433**，Playable prototype CI／workflow360357259／.github/workflows/ci.yml，push／attempt1，source如上。
最後 **in_progress/null**；created2026-09-22T01:19:31Z、updated2026-09-22T01:19:34Z，台灣 **2026-09-22 09:19:34**。exactSHA全event/state count1，未查jobs，無dispatch/rerun/cancel/waitloop。
機器點 **docs/evidence/CI51_CHECKPOINT.json**，terminal **CI51-pending-full-validation**。

開始只讀STATUS、本檔、CI51_CHECKPOINT，確認main一次，再接同run一次。只有後續文件HEAD仍接同source/run；有真正更新current checkpoint才接新位置。queued/in_progress保存回報，不长等或密集輪詢。failure查同run第一實際root；success完整報告／實圖／雲端／Pages閉環。不回CI50/49/48舊pending，不重驗CI47/Pages41。

## I三檔修正已完成，不重做

改scripts/build.mjs、tests/cpu_native_route.py、新tests/cpu_native_chord_test.py。保留H長距離coarse按鍵效率；接近目標改成 **P2down→P1down→hold→P1up→P2up**，讓需要精準抵達的P1不再持續按住跨越P2兩次transport。該腿一旦進入precision order便維持，只重新學習release位移估計；不重設／扣除clock、ticks、budget。

原釋放全部按鍵後讀snapshot、距離<.12、每腿ceil((距離/速度+2)*60)、單一30秒、先budget再arrival、250ms maxhold、部分按鍵失敗仍全部cleanup保留。所有按鍵與未按鍵的讀取ticks照算。native_pulse函式、整份CPUbrowserdriver、G/H原測試與36/24子案例、全部src/index/.github/config原樣。FCPUtiers／FrameWindow／CPU與build/source身份不變；本批不是美術／章節。

nativeRoutes新增arrivalOwner/chordPolicy、每pulse keys/releaseKeys/chordOrder，保留before／afterRelease。沒有writable state/save/time/collision hook、teleport或假通關存檔。

新跑 **1161Node／250Python／assets／typecheck／build**，完整npmcheck最終exit0。新增10Python測試，48長路線方向/軸/速度/成本子案例，原四co-op座標序列、兩種chord失敗cleanup、單人獨立與負向預算／deadline／pause／transition。CI50成本模型舊172/165fail，新86/165、4pulse、P1z-2.0666667；**模型不是native驗收**，individual nativecall延遲拆分不是實測時間戳。初次red、全程inner草稿長腿失敗及工具中斷check均另保存，只有最後完整exit0算通過。本機未操作browser。

## CI50實際根因與部分成功證據

CI50 **35669876213**／Hsource **840ffe01882c8248f11603ee1c4da246f5aa2ccc**，completed/failure，updated2026-09-22T00:15:21Z。
validate **106563719363** CPUstep21失敗；good **106563719387**／bad **106563719274**成功。
第一root **CI50-cpu-coop-primary-outer-chord-oscillation**。

第一CPUcase已完整家中→祭典，六個move釋放後抵達；前大地圖長腿253/315tick、z5.06。不是CI48樓梯或CI49長腿再次失败，不重做G/H。

第二CPUcase第一腿co-op z=-5→-2：P1先按／最後放，跨過P2兩次transport仍移動。記錄zero-ms pulse仍令P1移動8–9ticks、P2移動2–3ticks，修正反覆越界。十pulse耗172/165tick，before177／afterRelease349，P1z=-2.199999999999998／P2z=-2.8666666666666667；catch352是較晚觀察。不能放寬誤差或時間／tick預算來混過。

F的presentation已到達61真活動samples，mean45.657377／P95 60.1／max81／FPS21.902266統計一致，CPU/version/source標示正確；原生quality678×452與compatibility452×301、完整pausedstate一致、portrait/shortlandscape斷言已到達。這是partialnative證據，非完整co-op/ATB/ownsave/nativeimport或流暢／裝置認證。

已看原failure.png：CPU祭典雙人、鐘、鋪面與攤位可見，非WebGL啟動失敗。Step22缺成功CPUfinalreport是次生。四原ZIP大小/hash/CRC、十張實際CPU PNG（九前段加failure，非11張成功图）與renderledger六列入檔bytes/hash核對；沒有重跑verifier、重產精確ledger或全lane複驗宣稱。沒playable／newPages，CI50不接受。CI50_FAILURE_ROOT與指定Drive保留十pulse完整分析。

## CI51成功仍必須完整驗收

3job、13finalprimary、9原native加CPU native、三lane/render/CPU共五ledger及每一列入bytes/hash；原audio／actor.playback／HUD／場景正常暫停減動態／接地ATB／商店裝備v8／完整審判故事／觸控斷言不得省略。

CPU原兩旅程：家中到祭典；雙人操作／ATB／同run自己匯出v2／IndexedDB／原生匯入。Fpresentation.active>=60真sample、mean/P95/max/FPS一致、CPU/build/source標示、quality/compatibility真buffer變化、完整pausedstate相同；11CPU原始成功PNG與14CPUledgerfiles。看nativeRoutes真afterRelease<.12且原budget內，Icoarse/precision按鍵與release順序正確且未重設clock。250ms只是hold上限，不是擴大timeout。不用progress／合成fixture／假存檔／可寫hook代替。

保留未修改原ZIP到指定Drive並下載hash/CRC回讀，再核對Pages/source/HTML。CI嵌入sourceSHA，source=null本機HTMLhash不是CI基準。沒有真機、聽感、持續流暢或美術90認證。

## 快速雲端恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
最新 **Chrono-CI50-terminal-VQ02I-tested-batch.zip**。
ID **1OwdrRCffGd6YtJx2YMn1qzoPE2CnvYoV**。
Bytes **53409483**。
SHA256 **a48de01346c3fdc37a46e538cc9dffd5ff629984d4002bedfda7b2dce6858a5a**。
下載回讀hash/CRC/30manifest/四原ZIP/parent已核對。

恢復 **recovery/VQ02I-tested-program-snapshot.tar.gz**，273檔，assembled tested快照，不是publishedGitarchive。除THIRD_PARTY.md不含docs；最新文件另讀GitHubmain，不用歷史tar覆蓋進度。raw/CI50-browser.zip含exactH source tar，Gitarchivecomment匹配。封存source=null為發布前狀態，最終GitHub ILOCAL_VALIDATION/CLOUD_RETENTION補足發布身分，不重寫原log。

## 固定邊界、完整範圍與後續

最後已驗收仍 **E0.9.27／sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／CI47 35615882220／Pages41 35618506663**；不重開。CPU無WebGL可玩後端已存在，前段有原生證據，不重造或說不存在。

CI51閉環後照TODO整批做前段真品質：完整原生CPU章節及裝置觀察、實圖相容缺陷、人物植物／道具材質、尺度輪廓、窄視窗地標、全動畫音樂；重用素材，測試數不能代替美術。升級母親家具及Z材質構圖仍受限，一般繼續不解除；前段品質未閉環不提早擴後段。

Z未發布，不重送／換編碼管道／間接替換／部分提升。prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與本機browser限制保留，不等於connector不能存取。

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90/每面向80%及真機、T08每批雲端不縮小。home-to2300/equipmentv1-v8不重做，2300抵達非完整未來；舊30stale、沒有新分數。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1克羅諾/P2露卡/自主第三同伴，不加P3/ARPG/新框架。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只node_modules／esbuildhardlink，不覆source/config或bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳，不公開ROM/原圖音訊/字型/憑證。所有成果雲端回讀。
