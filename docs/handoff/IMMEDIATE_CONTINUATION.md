# 立即接續 — CI52失敗已修；唯一CI53待完整驗收

立即使用GitHub connector，必要時Drive，接手KartChang/ChronoTrigger_reMaster。唯一main／單一AI／non-force；不建branch／PR／平行candidate或多人防撞，不盤點历史／重做章節，不要求token／ROM／手動造證據。全部交付雲端回讀，文件[skip ci]。臨時環境不是權威。

## 唯一目前位置

**VQ02K／0.9.33**。
Source **3028e2499d5a268d20c5251a3aec6e8c2c5a09e2**。
Source root **23c26af9f62ec1b6dc2f1e7e56974e0dc35a3ea0**。
Parent **0df37add4bf68e3b2314593b13413c1173e0cc09**。
8檔整批測試，一次non-force發布並main回讀，完整testedroot一致；最新docs子樹16ad4d35353bc7a1010de9713814ceb3deaf5308原樣保留。

唯一 **CI53 35684197933**，Playable prototype CI／workflow360357259／.github/workflows/ci.yml，push／attempt1。
最後 **in_progress/null**；created2026-09-22T03:43:21Z、updated2026-09-22T03:43:32Z（台灣 **2026-09-22 11:43:32**），exactSHA全event/state count1。未查jobs，無dispatch/rerun/cancel/waitloop。
機器點 **docs/evidence/CI53_CHECKPOINT.json**，terminal **CI53-pending-full-validation**。

開始只讀STATUS、本檔、CI53_CHECKPOINT，確認main一次、同run一次。只是文件HEAD不同仍接同source/run；真的有更新currentcheckpoint才前移。pending保存回報不長等；failure同run第一實際根因；success完整原報告／實圖／雲端／Pages。不回CI52pending，不重驗CI51／Pages45或舊E。

## K已實作並測試，不重做

改scripts/build.mjs、scripts/test.mjs、src/cpu-minification.ts、cpu-raster.ts、cpu-scene.ts、tests/cpu_era_route.py；新增cpu-minification-fractional.test.mjs與cpu_sampling_failure_test.py。

原圖→第一mip和相鄰mip採連續log2足跡混合，補1<rho<2無作用區；每triangle選層、整數層單lookup、fractional兩RGBlookup。預設OFF、原快取32MiB／512entry保留；放大／無效／透視nearest、alpha/opacity/blend/cutout/vertexalpha輪廓不濾。新增fractionalTriangles真實計數。原assets/material/UV/geometry/camera/WebGL不動，不是Z替代。

era失敗前保存filteringAttempt（nearest/filtered/restored snapshot），failure保留type/message/原traceback再rethrow，裸assert不再只有空字串。39原assertion AST與30原move／keys／budget不變，原CPUdriver、Ihelper、六verifier、workflow／index／package／lock原樣。J同頁本人Gato/v2後600路線已存在，不重寫，不減epsilon／tick預算／30秒，不改state/time/save/collision。

新跑 **1250Node／262Python／assets／typecheck／build／完整npmcheck exit0**，Pythonexit0；11Node／3Python新增。兩個修正前red回歸、兩份工具中斷check與後續完整成功log分開保存。既有World／rect-onlyUNITcanvas三尺寸與0→1482取樣計數只是unit，不是瀏覽器after圖／成功nativefixture／美術認證。本機未操作browser。

## CI52真正失敗位置與保存證據

CI52 **35680779688**／Jsource **e93733179a4e0e0cb5fd254d7a841c2eb3df542d**，completed/failure，updated **2026-09-22T03:13:29Z**（台灣11:13:29）。validate **106597074095** step21失敗；good **106597074278**／bad **106597074334**成功。

第一root **CI52-cpu-mild-minification-level-gap**。原兩CPUcase已passed，10放鍵抵達／本人v2／IndexedDB／原生匯入保留，不是G/H/I舊走位問題。新era在cpu_era_route.py:154檢查minifiedTriangles>0失敗：enabledtrue、mipBytes349524、minifiedTriangles0、buffer543×362、fair／ticks52。尚未執行任何新600走位。

來源可见opaqueMipLevel拒絕rho<2；相同World/Babylon與rect-onlyunitport計算rho約1.272581，非原生量測。已看真正era600/failure.png：有祭典、鋪面、攤位及勾選平滑的暫停UI，不是WebGL／CPU空白。父CPUreport頂層failed，steps22/23缺成功report為次生，沒有playable／新Pages。4原ZIP size/hash/CRC、11原CPU PNGhash及6renderledger檔核對；這次未重跑verifier、未重產ledger或宣稱全lane驗收。完整原因及十arrivals在CI52_FAILURE_ROOT與Drive原包。

## CI53成功仍需原全套加J新增項

原3job／13主／9native+CPU／五ledger及每個列入bytes/hash；audio/actor.playback/HUD/正常暫停減動態/接地ATB/equipmentv8/fulltrial/touch不能省。原两CPUjourneys／本人v2/IndexedDB/nativeimport、>=60真sample統計/labels、quality尺寸/fullpausedstate、11原PNG/14原CPUledger檔。

另查 **test-results/cpu-renderer/era600/report.json**、native-import-report.json/source-ledger.json：第六16-fileledger、30afterRelease<.12且原budget／chordorder、同runGato父v2、普通P2stageapproach、departureP2inactive、兩soloATB／兩cinematicpause、LuccaP2、本人v3-v4匯出原生chooser、cathedralendpoint。11extraPNG逐hash並看圖；實際canvas ON改變、OFF精確恢復、完整state不變、mipmemory原上限與清理、alpha輪廓不退。K unit1482或progress不是原生證據；失敗利用新增filteringAttempt／failuretrace，不改斷言。

保存未修改rawZIP到指定Drive並下載hash/CRC/parent核對，再同CI metadata/HTML/Pages。CI嵌入sourceSHA，不能拿本機source=null的HTMLhash作基準。不宣稱真機／持續流暢／聽感／美術90。

## 快速雲端恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
最新 **Chrono-CI52-terminal-VQ02K-tested-batch.zip**。
ID **1dHLUbuu8p3VtqwVENV0jO6PJid2g7etZ**。
Bytes **55142554**。
SHA256 **8b13ed2682cc5be8d5527b8a28ea11c25dc0c7b1d3beae112b4f7ea8bab54a3c**。
下載hash/CRC/46manifest/四原ZIP/parent核對完成。
恢復 **recovery/VQ02K-tested-program-snapshot.tar.gz**，282檔，assembled不是publishedGitarchive；僅THIRD_PARTY屬docs。raw/CI52-browser.zip另含exactJ Gitarchive。封存nullsource為發布前，最終GitHub K收據補發布身分不改原log。最新main文件另讀，不拿tar覆蓋進度。

## 已驗收與完整後續，不重開／不縮小

最新已驗收仍 **I0.9.31／source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5／CI51 35675330433／Pages45 35676767742**。原5ledger/13主/9native+CPU/两旅程/11圖及Pages已閉環；原包1sgU-n16eUnPExIBtFsx2RHgGDf51BC4U保留。G/H/I與E閉環不重開，CI48–50、52仍failed不回填。

CI53後依TODO接现有章節CPU完整覆蓋（修道院救援／審判至2300入口）、device/sustained觀察，再允許的實圖相容、人物植物道具材質比例輪廓／窄地標／全動畫音樂。J只到cathedral入口且尚未native接受；2300抵達非全未來。完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90/各面向80%/真機、T08每批雲端不縮小；舊30stale無新分數。

Z／升級母親家具仍held，不重送／換編碼管道／間接替換／部分提升。prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與本機browser限制不變。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1Crono/P2Lucca/自主第三、home-to2300/equipmentv1-v8，不加P3/ARPG/framework。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆source/config或bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM／原圖音訊／字型／憑證。這些限制不等於connector不能存取。
