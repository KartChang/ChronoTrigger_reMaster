# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04b-art-first-ci99-pending**。Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT **v35**。唯一main/singleAI/nonforce；Root T05-early-visual-cohesion，execution T05-early-production-art。

前版完整原文blob **d1ee2b7b816cc76b5aa83222231a72633aace249**原封保存在 **evidence/VQ04B_PREVIOUS_WHITEPAPER.md**；未修改的詳細架構、數值、已接受基礎與完整分母仍有效。更早鏈由A/Z/Y封存保留，不重讀全部歷史；本版取代A/CI98 pending及開發狀態。

## 一、完整產品與美術優先

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先、原作世界辨識度／背景／構圖、縮尺大地圖與城鎮室內切換、原地ATB、單人與同機雙人共畫面，全部時代主支線與結局。2300抵達不是完整未來。不縮成展示，不因CI綠勾提前擴後段。

使用者認可的山道／法庭概念圖是品質目標，交付必須是實際遊戲程式與資產。概念圖、匯出PNG、測試數或OFFLINE工作圖不能當runtime美術批准。前段尚未舒適時，美術是優先路線；保留M-Z動畫基礎，只有真阻塞才轉修，不再以一整批邊界維護代替畫面開發。完整party/enemy/NPC造型方向動作仍在分母內，本輪保留舊角色源不等於永久不重製。

整體>=90、每面向>=80%、requiredassets/fivegates/zerocritical，需實際畫面、遊玩、装置證據支持。當前未達概念品質，所有完整品質批准false，newScore=null，releaseBLOCKED。工具輸出的歷史30/100不屬於B新評分。

## 二、保留架構與行為

TS/Babylon.js/esbuild與既有固定依賴、自含HTML，無CDN/ROM/後端需求。Controls→固定1/60秒simulation→core→render/HUD/audio；presentation不得決定HP/ATB/碰撞/存檔/劇情。P1/P2/自主第三、獨立選敵與雙確認合技、InputBoundary/A*及v1-v8IndexedDB/JSON保持。不加P3、不改ARPG、不重造框架。

暫停、背景、對話、背包、native選檔及context loss凍結simulation，恢復不補跑。CPU/WebGL走同規則；CPU triangle/texture/depth fallback不是另一個降質關卡。CPU640×480cap、最大邊1280、32MiB/512entries/120活動FrameWindow不變；原alpha/perspective nearest與mip释放不改。不得放寬原route/tick/key/wait/capture/assertion/<.12/單一30秒/250ms-256/CPUmemory品質門檻。

原World仍擁有遊戲與renderloop，ArtDirectedWorld只在同scene接入production environment及法庭cast finish。draw的State/dt/animate/frameEffects四參數原樣傳給super.draw，沒有test/device/URL專用模式、timer或game state寫入。

## 三、B實際美術與資源

沿用A13組材質／尺寸及6,213,632rawRGBAbytes共享cache：山道路面與草皮降低雜訊、四款樹改分叉根幹與41個不等形葉團、共同左上光色；遠山改三層不等高稜線與大氣色、遠林尖冠。原道路／地形／碰撞／樹卡UV位置保持。不是把concept畫面貼成關卡。

法庭保留max(7.8,9/aspect)zoom、角度與目標，以orthographic上下界同移+1.2修正北牆窗戶HUD-safe裁切，不縮小人物。增加四組側柱共12個構件，放在x±7.7的原角色走道外，使用既有石材、不可pick、不加collision。北牆原15構件保留，法庭27＋山道1＝28production static parts。陪審木料使用安靜無徽木紋，不反覆金色畫框。

1000森林在原有384×352地面DynamicTexture重繪三段原路線、落葉草叢与明暗，不另配GPUtexture、不修改navigation。不影響600森林診斷或heldhome。

法庭supporting cast：production-actor-finish借用其48×64 DynamicTexture.update，8款既有角色各4ambient格做色料／衣褶／形體明暗，保留alpha、深色keyline、pivot、pose、clock。不是新方向／新姿勢或完整人物重畫。Party/guest/enemy及mother不綁定，不改其native source-cellgolden。最多24bindings、兩份RGBA／binding，CPU上限589824bytes、新GPUtextures0；重複upload不累積處理，換pose以原raw重算，切場還原、回場重套、dispose移除自己的adapter。正常upload參數／回傳值／例外保留。

build保留原13環境PNG輸出到production-vq04a（profile已為B），另外production-vq04b輸出8cast圖集與1森林地表，共22PNG與manifest，與runtime來源像素一致。這22PNG不是22新GPUtexture；本批新增GPUtexture count0。所有素材在指定Drive包runtime-art/，不是對話展示。原assets/manifest.json保持A的既有13組登錄，本批新cast/forest以獨立匯出manifest和本文件記錄，不偽稱已更新主manifest或完成全required assets。

## 四、CI98原因與B測試

CI98/36338351176 exactA completed/failure、updated2026-09-27T18:04:13Z。三路trial/witness在原20s彩窗top>=.065等待失敗；實際top約.020705，14NPC全部48×64、JSerrors空。後續software/native lanes跳過，沒有playable。不推定CPU raster故障，不延長wait，不改assertion。四份原ZIP/hash/CRC/內容及原報告保持；CI98永遠仍failure，不借B結果回填。

B離線同場景重現A失敗後，finalwindowtop.09762804197989591；1200×800、1280×720、600×400、320×480、400×800五種case保留原.065條件通過。這只是offline regression，不冒充新的browser/device驗收。

完整3160Node/605Python、asset/typecheck/build通過，新增50Node/4Python；613未改程式輸入及原native routes/assertions/golden/core/held exacthash保留。Acomponent明確凍結A，新B測試實際current app/CPUframebuffer/state與幾何不變/cast資源/完整effects參數/held場景exactpixels。source-only B→A inverse使用boundeduniquehunks，保留原hash，拒絕缺失／重複／額外修改，native資料不可當輸入。

第一次完整Node有21項source inverse因replacement字串展開舊註解dollar序列失敗；改callback後45sourcechecks及最終全部通過。初始typing/signature實驗修正完才跑final。所有失敗成功logs保存，沒有刪舊斷言取綠勾。GitHub未提交傳輸tree中的rootsource拼字錯誤於publication前替換為已測正確blob；最終整tree完全吻合已測tree，無額外sourcepush。

## 五、發布與持久成果

VQ04B0.9.75 source **b5e92d92940e28344f4a9f5a618050d513f6253a**，tree **7499f0798c4111789f81153288901de0ccd897f9**，parent09b58835a05deab472b2f7f2202b0a4a7be8b433。21檔合批一次non-forcepush，沒有manualdispatch；matching **CI99/36342361270** push/attempt1，最後in_progress，updated2026-09-27T18:54:22Z。文件HEAD不等於source，B native/Pages/art尚未批准。

完整包 **Chrono-VQ04B-production-art-tested.zip／1y1rv5lVly36x6abap1CBKLcyb8e5JGGr**，folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**，34093917bytes、SHA256 **56b9d85ad8791f5dda3313e6ea1c7e395b5d1b001c714d8978b32dac74e40eb6**。96manifest、634programsnapshot、21changes、22PNG、四CI98原ZIP與完整logs。2026-09-27T18:48:57.284805+00:00已真正下載回驗parent/size/hash/外內CRC/exactmanifest/逐檔與snapshotbytes。早期1-aWddwHGVjlsTqu99V2lBUWTjIKEbMBc被final取代；snapshot不含最新docs；localbuild不是部署，封裝false旗標僅歷史。

## 六、續作與完整分母

先接CI99 exactsource新native畫面／報告／來源及matchingPages，依山道輪廓/樹冠遮擋/地表/遠山銜接/法庭構圖/配角可讀性修真阻塞，再合批完整角色方向動作與所有前段美術。美術仍優先，不能又變動畫維護專案。Pending不長poll，不重送B，不重驗舊accepted。完整音訊／聆聽／原速／真機長時段仍需實證。

T03全規則版本差異拓樸數值；T04完整成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06全部時代主支線結局；T07整體>=90/每面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08fulltests/onesource/matchingCI/cloudoriginalreadback。既有13商品、裝備相容守恆、明示暫定400G/數值、7自製音型7段音樂16聲部/master.55等未更動，詳見封存白皮書，不能冒稱完整原作規則或聆聽。

最新有界收據Y/CI96/Pages90仍closed；W/CI94 repair-history/CPUwheel1529/Vbody/guarddeathclosed；CI97/Pages91provider成功不是新整包批准；CI93/95/98failure保留。Tank/Yakra完整death/Henchoutgoing/Pdown/Qselector仍open，不注入state/time/save/collision或改capture補样本。

Held prologueblob2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不可提升／間接替換；ROM/media/fonts/credentials私有。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆source/config或另bootstrap。No localbrowser。全部成果GitHub/正確Drive/readback，docs[skip ci]，臨時容器與封存舊旗標不是current authority。
