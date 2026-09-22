# 立即接續 — CI49失敗已修；唯一CI50待完整驗收

立即使用GitHub connector，必要時Drive，接手KartChang/ChronoTrigger_reMaster。唯一main／單一AI／non-force；不建立branch、PR、平行candidate或多人防撞，不盤點歷史、不重做章節、不要求token、ROM或手動證據。所有成果回GitHub／指定Drive並回讀；文件[skip ci]。

## 唯一目前位置

**VQ02H／0.9.30**。
Source **840ffe01882c8248f11603ee1c4da246f5aa2ccc**。
Source root tree **205bc73a075b92a5efd5ac072f45f6857b037b4a**。
Parent **3c3c1909f03df9a839c7569860e0506d6c05ac2c**。
3檔一次non-force sourcecommit已發布，main回讀、完整tested程式子樹匹配。全部src、index、workflow及原CPUbrowserdriver不變。後续文件HEAD不是另一個source，不因此重跑CI。

唯一 **CI50 35669876213**，Playable prototype CI／workflow360357259／.github/workflows/ci.yml，push／attempt1，source如上。
最後 **in_progress/null**；created2026-09-21T23:57:33Z、updated2026-09-21T23:57:35Z，台灣 **2026-09-22 07:57:35**。exactSHA全event/state count=1，未查jobs，無dispatch/rerun/cancel/waitloop。
機器點 **docs/evidence/CI50_CHECKPOINT.json**，terminal **CI50-pending-full-validation**。

開始只讀STATUS、本檔、CI50_CHECKPOINT，確認main一次，再接同run一次。只有後續文件HEAD仍接同source/run；若真正有更新current checkpoint才接新位置。queued/in_progress保存回報，不長等或密集輪詢。failure查同run第一實際root；success完整報告／實圖／雲端／Pages閉環。不要回CI49／CI48的舊pending或重驗CI47／Pages41。

## H三檔修正已完成，不重做

改scripts/build.mjs、tests/cpu_native_route.py、新tests/cpu_native_route_cost_test.py。長直線按距離使用最多250ms的普通原生按鍵hold，接近目標仍縮短、考慮實際release位移，必要時反向修正。只降低過多短脈衝的讀取成本，**不是把timeout或tickbudget加大**。

釋放全部按鍵後才讀snapshot、真正誤差<.12、原每腿ceil((距離/速度+2)*60)、單一30秒上限、先檢查budget再接受抵達、部分co-op失敗仍全部cleanup，全保留。所有未按鍵的讀取ticks照算，不扣除／重設，不注入遊戲時間或修改state/save/collision。

整份CPUbrowserdriver、G原12測試及36子案例、全部src/index/.github/package/config完全未改。F的CPUtiers、FrameWindow、CPU/Canvas2D與build/source身份不变。本批不是新美術或新章節。

新跑 **1161Node／240Python／assets／typecheck／build**，完整npm run check最終exit0。新增8Python測試、24長路線子案例，含讀取成本、原budget/deadline、blocked與co-op。依CI49成本的單元模型：舊323/315失敗，修正255/315、13pulse、z5.06；**模型不是原生驗收**。初次red與兩次工具中斷的check原log保留，後來完整成功log另存。本機未操作browser。

## CI49真正失敗位置與證據

CI49 **35641527652**／Gsource **8c9f8a26ad1e7e8a5683936604165a799f8acbec**，completed/failure，updated2026-09-21T19:15:06Z。
validate **106471733017**在step21CPUroute失敗；good **106471733186**／bad **106471733213**成功。
第一root **CI49-cpu-native-observation-overhead-budget**。

這次已真正通過房間樓梯、家中與大地圖，不重做CI48樓梯修正。第五腿從大地圖z=-2.7到5.1，29次100ms原生hold／release／snapshot累積超過原315tick；before736，afterRelease1059，elapsed323，x=.039999999999998766、z=4.980000000000005。由位移推算192移動ticks、131其他ticks。catch最後state1061不是同一個觀察。位置數值雖剛好小於.12，但超budget必須先fail；不能把抵達檢查移到前面混過。

已看原failure.png：CPU有完整大地圖／人物／祭典帳棚，非WebGL啟動失敗。step22缺成功CPUfinalreport是次生。四原ZIP大小/hash/CRC、renderledger列入6檔bytes/hash核對；沒有重跑verifier、重產精確ledger或重驗整個lane的宣稱。沒playable／新Pages，不接受CI49。詳CI49_FAILURE_ROOT與CI49_CHECKPOINT（已inactive並指向50）。

## CI50成功仍須完整驗收

3job、13finalprimary、9原native加CPU native、三lane/render/CPU共五ledger及所有列入bytes/hash，原audio／actor.playback／HUD／場景正常暫停減動態／接地ATB／商店裝備v8／完整審判故事／觸控斷言都不能省。

CPU原兩旅程：家中到祭典；雙人操作／ATB／同run自己匯出v2／IndexedDB／原生匯入。F的presentation.active>=60真sample，mean/P95/max/FPS一致，CPU/build/source標示，原生quality/compatibility實際buffer改變，完整pausedstate相同，11CPU原始PNG與14CPUledgerfiles。看nativeRoutes實際afterRelease<.12且在原budget內，不用progress／合成fixture／假存檔或可寫hook代替。250ms只是新hold上限，不是擴大驗收預算。

保存未修改原ZIP到指定Drive、下載hash/CRC回讀，再核對Pages/source/HTML。CI會嵌入sourceSHA，不能拿source=null本機HTMLhash當CI基準。沒有真機、聽感、持續流暢或美術90認證。

## 快速雲端恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
最新 **Chrono-CI49-terminal-VQ02H-tested-batch.zip**。
ID **1w5T1edXd0vXOhciA23SRC3CWNqKEMPyb**。
Bytes **52245774**。
SHA256 **428c22ed7f6522f8eb83bd324b3306da22e07f8206afc4f82152e4a305366c40**。
下載回讀hash/CRC/36manifest/四原ZIP/parent已全部核對。

恢復 **recovery/VQ02H-tested-program-snapshot.tar.gz**，272檔，assembled tested快照，不冒稱publishedGitarchive。除THIRD_PARTY.md不含docs；最新進度必須另讀GitHubmain，不用歷史tar覆蓋。raw/CI49-browser.zip含exactG source tar，其Gitarchivecomment匹配。封存source=null是在發布前，最終GitHub HLOCAL_VALIDATION/CLOUD_RETENTION補足發布身份，不重寫原log。

## 固定邊界與後續

最後已驗收仍 **E0.9.27／sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／CI47 35615882220／Pages41 35618506663**；不重開。無WebGL CPU可玩後端已存在，前段有原生證據，不重造或說不存在。

CI50閉環後照TODO做前段真品質：完整原生CPU章節與裝置觀察、實圖相容缺陷、人物植物／道具材質語言、尺度輪廓、窄視窗地標、全動畫音樂；重用素材，測試數不能代替美術。升級母親家具及Z材質構圖仍受限；一般繼續不解除。

Z未發布，不重送／換編碼管道／間接替換／部分提升。prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與本機browser限制保留，不等於connector不能存取。

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90/每面向80%及真機、T08每批雲端不縮小。home-to2300/equipmentv1-v8不重做，2300抵達非完整未來；舊30stale、無新分數。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1克羅諾/P2露卡/自主第三同伴，不加P3/ARPG/新框架。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只node_modules／esbuildhardlink，不覆舊source/config或bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳，不公開ROM/原圖音訊/字型/憑證。所有交付雲端回讀，臨時環境不是權威。
