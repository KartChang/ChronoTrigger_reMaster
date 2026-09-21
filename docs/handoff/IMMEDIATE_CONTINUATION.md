# 立即接續 — CI48失敗已修；唯一CI49待驗收

立即使用GitHub connector，必要時Drive，接手KartChang/ChronoTrigger_reMaster。唯一main／單一AI／非force；不建立branch、PR、平行candidate或多人防撞，不盤點歷史、不重做章節、不要求token、ROM或手動證據。所有成果回GitHub或指定Drive並回讀；文件[skip ci]，臨時環境不是依據。

## 唯一目前位置

版本 **VQ02G／0.9.29**。
Source **8c9f8a26ad1e7e8a5683936604165a799f8acbec**。
Source root tree **3d6df6621fc91ce7dcc9590db4ada2cef85eb308**。
Parent **526684e957436f05a95813750793ba2aa3035a6e**。
4檔一次非force sourcecommit已發布並回讀，完整tested子樹匹配。全部src／index／.github不變，原最新文件子樹保留。後續[skip ci]文件HEAD不是另一個source，不因此重跑CI。

唯一驗證 **CI49 35641527652**，push／attempt1，source如上；最後 **in_progress/null**。created2026-09-21T18:55:25Z、updated2026-09-21T18:55:29Z，台灣 **2026-09-22 02:55:29**。exactSHA全event/state count=1，未查jobs，無dispatch/rerun/cancel/waitloop。
機器點 **docs/evidence/CI49_CHECKPOINT.json**；terminal **CI49-pending-full-validation**。

開始只讀STATUS、本檔、CI49_CHECKPOINT，確認main一次，再接同run一次。queued/in_progress保存回報不長等；failure查同run第一實際root；success完整最終報告／實圖／雲端／Pages閉環。只接更新的current checkpoint，不回舊CI failure/pending。不要先下載全部舊證據、讀整份白皮書或全庫盤點。

## 本批修正完成，不重做

tests/cpu_native_route.py改用一般原生鍵盤短脈衝，每次釋放全部按鍵後才讀snapshot確認抵達；若越過目標，以反方向原生按鍵修正，誤差仍必須<.12。每腿沿用原ceil((距離/速度+2)*60)tick預算與單一30秒上限，不因修正重設。部分co-op按鍵失敗仍全部釋放，保留nativeRoutes的before/afterRelease及失敗診斷。不注入時間、不改state/save/collision、不製造正向存檔。

CPUdriver只改move wrapper/import，其餘9函式與所有原路線、終點、斷言、timeout原樣。另新增12Python port測試，涵蓋觀察到的x=-.9 overshoot、36方向/軸/延遲子案例及co-op/blocked/pause/transition/deadline/cleanup。scripts/build.mjs只前移版本/批次。全部src與F的CPUtiers、FrameWindow、runtime身份保留原樣。

新跑 **1161Node／232Python／assets／typecheck／build** 通過，diff檢查通過。初次pulse振盪和新測試token拼字已修，原斷言沒放寬；先前完整check工具逾時與後續exit0完整log分別保留。未提交的buildscript手動傳輸escaping錯誤於發布前修回已測bytes，全root一致。單元port不是原生遊玩；本機未操作browser，G實際修復驗收仍待CI49。

## CI48實際是failure，不是accepted

CI48 **35634970145**／Fsource **38edba36ccd75a3ef8129aea62d21769d847f749**，completed/failure，updated **2026-09-21T18:19:17Z**。validate **106450040224**失敗，good **106450040254**與bad **106450040327**成功。

第一root **CI48-cpu-stairs-post-release-overshoot**：CPU新遊戲房間中，舊move按住鍵時只判斷跨過x=0，釋放後未重新要求抵達。原始末位x=-0.8999999999999996、z=-4.533333333333337，仍是bedroom；原stairs(0,-4.1)/radius.65不可能由x=-.9直往南觸發。等待home/no-transition耗盡原250tick預算，30秒門檻沒改。已檢視真正failure.png，是CPU已繪出房間但人物在樓梯旁南牆，不是WebGL啟動失敗。完整原因見CI48_FAILURE_ROOT.json，修正是否閉環仍看CI49。

Step22CPU來源檢查因未有成功finalreport失敗是次生錯誤。原lane/render檢查通過且列入bytes/hash核對，但本次沒有重新執行verifier，不能宣稱重新精確產生ledger。只產生4份原始ZIP，沒有playable artifact／新Pages驗收。CPU後段的quality/save/presentation仍未完成，不把partial統計當F已验收。

## 最後已驗收，禁止重開

仍是 **VQ02E0.9.27／CI47 35615882220／Pages41 35618506663**。
Source **f07a42bfa7357e1a9ddcebfa8a790855927051b4**，tree **00efc6b0ea450961739948a952bd2756ea7f2eb1**。13最終主報告、9原native加CPU native、五ledger、實圖、原包及部署HTML已閉環；CI47_ACCEPTANCE/CLOUD_RETENTION/VISUAL_REVIEW/PAGES41_PROVENANCE保留，不重驗。CI46更早也不重開，不補造歷史CI45獨立acceptance。

## CI49成功必查

3job、13finalprimary、9原native加CPU native、三lane/render/CPU五ledger和所有列入bytes/hash，保留audio/actor.playback/HUD/場景正常暫停減動態/接地ATB/商店裝備v8/完整審判故事/觸控所有斷言。

CPU原兩native旅程與同run自己匯出v2/IndexedDB/原生匯入必須完整；F的presentation.active至少60真sample、mean/P95/max/FPS一致、CPU/build/source標籤、原生quality/compatibility尺寸變化、完整pausedstate相同；原11CPU PNG與14CPUledgerfiles都核對並看圖。新nativeRoutes讀實際afterRelease位置，必要抵達<.12、原預算與全部路線保留。不得用progress、合成fixture、假存檔或可寫hook代替。

CI會把sourceSHA嵌入HTML，與source=null本機HTML的bytes/hash不同是預期；以同CI metadata/原HTML/Pages匹配。保存未修改原ZIP到指定Drive並回讀，最後才close。沒有設備、聽感、持續流暢或美術90認證。

## 雲端快速恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
新包 **Chrono-CI48-terminal-VQ02G-tested-batch.zip**。
ID **1XIFKO-hLoFWrEPwC6oBE74hIuHikDKoi**。
Bytes **51526156**。
SHA256 **f941eccb3bfaa7147eb3485ef34322f5a7f484dff2593e10d8e6d857099f8275**。
下載回讀hash/CRC/23manifest/4原ZIP/parent全核對。含原CI48browser/good/bad/art、failedreport檢查、4改檔、7原始log/exit檔、未驗收localHTML、**recovery/VQ02G-tested-program-snapshot.tar.gz（271檔）**。assembled快照不是publishedGitarchive；除了THIRD_PARTY不含docs。raw/CI48-browser.zip另含exactF source tar，Gitarchivecomment匹配。封存source=null是發布前狀態，最新GitHub收據補足身份，不重寫原logs。最新main文件永遠另外讀，不拿tar舊文件覆蓋進度。

已驗收E原包 **1mwt02LrSZpAIIIlQtv8QWFtb78aCcd35** 保留；不需為接手先下載。先前F包1jDHFP8Mmd58iZNK5A-8spp_9KLphxjtG仍保存，勿把CI48 failure當作CPUbackend不存在。

## 固定限制與完整範圍

無WebGL可玩CPUfallback已存在，前段E驗收保留；全章原生CPU/實體裝置仍未完成。Z0.9.22仍未發布受限，不重送／換編碼管道／間接替換／部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與localbrowser限制不因一般繼續解除；不等於connector無法存取。

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90/每面向80%及真機、T08每批雲端不縮小。前段真品質優先，材質比例、窄視窗地標、升級母親家具、全動畫音樂仍有缺口；測試數與CPU診斷不能代替美術成果。2300抵達不是全未來，舊30stale，不新增完成分數。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1克羅諾/P2露卡/自主第三同伴及home-to2300/equipment/v1-v8，不加P3、不改ARPG、不重造框架。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**僅node_modules/esbuildhardlinks，不覆舊source/config或開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳，不公開ROM/原圖原音訊/字型/憑證。所有交付雲端回讀，文件[skip ci]。
