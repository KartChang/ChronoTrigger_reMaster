# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq02b-ci44-pending。這是既有產品進度更新，不重新規劃。精確source／run依STATUS、IMMEDIATE_CONTINUATION、CI44_CHECKPOINT。前版全文保留在88f3ee4aa7cb63bcc172bbeaf790ee477ba10760；其中CI43-pending已被實際failure及本批CI44取代，Z的限制不變。

## 目標、順序及固定架構

完整《超時空之鑰》HD-2D：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮／室內切換、原地ATB、單人與同機雙人共畫面、完整時代主支線結局。合作不是ARPG。先讓前幾幕場景／人物／圖檔建模動畫／鏡頭遮擋HUD／操作與聲音取得實際品質證據，再擴充後段；不把完整版縮成序章。

TypeScript＋Babylon.js＋esbuild自含HTML，固定package/lock。Node建置，Python/Playwright驗收，玩家不需Python、ROM、帳號或後端。不改引擎，不增加平行框架。Controls→main固定1/60秒→core規則→render/HUD/audio呈現。音畫不決定傷害、資源、劇情。暫停／背景／對話／背包／原生選檔／繪圖context中斷不推進遊戲；恢復不補算背景時間。InputBoundary清舊輸入，A*使用既有碰撞。

P1克羅諾／P2露卡及劇情入離隊控制權保留。青蛙／瑪兒是有HP/MP/ATB且可被選中、自主行動的第三同伴，不是P3或完整自由換人。雙確認合技及獨立選敵保留，不為測試更改數值、偽造存檔、刪斷言或放寬timeout。

## 已有內容，禁止重做

家中醒來／上下樓→縮尺區域圖→千年祭初遇與行為→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕／證詞两裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇，經驗記錄不是等級系統。

已實作梅爾基歐商店、角色相容裝備、武器／身體／頭部、穿戴份數、金幣库存守恆與交易上限；不能出售仍穿戴裝備。400G旅費、13項商品及價格／普通攻防加減明示為暫定重建，不是假称原版數值。完整成長、技能學習、戰鬥金幣、飾品與自由換人未完成。

IndexedDB／JSON白名單v1-v8保留技術村落、千年祭、異變、王國救援、序章、審判越獄、裝備。舊檔未知行為不補造證詞，僅查看不強制改寫；匯入本人舊檔是合法回溯，守恆不是防作弊簽章。snapshot/view/audio皆唯讀。音訊與渲染偏好不進遊戲存檔，不建立可寫通關hook。

## 美術現況、最後驗收與受限項目

使用者認為欠缺精緻HD-2D仍是交付落差。引擎、像素尺寸、模型數、測試數、七段短曲或相容設定都不能代替成熟美術。沒有目前美術90分證據；舊30stale，release仍blocked。

已保存A/B/C主角與鏡頭接地，P祭典道具棚布，S地面取樣，T探索HUD，U觸控context，V固定tick動態/reduced-motion，W局部光照銅材質及六樹根八陰影，X細鋪面分區grassmask，Y投影閱讀性／caster合併／20件原邊界倒角與人物微幅寬度對齊皆保留。歷史43/31不是當前缺檔數，不套舊independent-ui或重畫保存素材。

最後已驗收 **Y0.9.21 source3c2e03e02c7be0e5921fa689f32d674c68ae64f4／CI42 35568827641／Pages36 35571121776**。三job、13主、9native、3來源ledger、實圖、原始產物、部署HTML已閉環。實圖有較淺投影和鐘庭倒角，但木料平塗、像素人物植物与道具材質密度及直向地標裁切未解決。CI42/Pages36及CI41更早不重開；其正式收據不改成新版本結果。

Z0.9.22已本機完成17檔材質／UV／直向構圖及966Node/213Python，但source-tree寫入遭安全檢查封鎖，沒有發布。快照保留，不重送／換編碼管道／間接替換／部分提升。B沒有fair-surfaces/fair-composition，fair-render/festival-kit/early-comfort不變。受限prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a及localbrowser同樣不旁路。限制不等於connector不可存取。

## A音訊與CI43實際失敗

A0.9.23 sourceb54ff3079c8d087bb1396229bc3adf718f2e8cd4新增hearth/fair/road/tension/battle/victory/defeat七段自製短曲與選擇性WebAudio。沒有抽取或轉錄原作OST，沒有外部音檔／樣本／新依賴；多場景仍共用短曲，不是完整配樂。預設關、真實輸入啟用、固定tick節拍、最多16音源、有限包絡與清理、不補播逾時音符，選單與背景清音。

**CI43 35576672389 completed/failure**，updated08:39:15Z。validate106259969610/bad106259969885成功；good106259969846在equipment音訊暫停wait_silent10s失敗。未同時觀察到零voice／零masterGain／RMS<0.000001；原audio=null且無最後讀值，不能證明究竟哪項未滿足。原始failure圖為已啟動的暫停房間，不是WebGL失敗。五原始ZIP、列入報告hash與只讀ledger重現已保存；validate/bad精確，good仍failed但缺檔錯誤路徑不同，不冒稱全三ledger逐byte一致。CI43未驗收、無新Pages，詳CI43_FAILURE_ROOT。

## VQ02B／0.9.24 本批已發布，CI44待驗收

Source **7b1537382467935ea37fe4cc6a2dc88d96a8d46c**，root tree **fe2791e0d0fc0c4a12f6d01e8fe04c90855834ac**，parent88f3ee4aa7cb63bcc172bbeaf790ee477ba10760。26檔整批測試後一次非force sourcecommit，main回讀及src/tests/scripts/.github完整四子樹完全匹配。本機新跑 **1046Node／214Python**、assets/typecheck/build通過，原始log與中途修正均雲端保存。

音訊修正清除master全部舊automation，再設intrinsic gain；停止/斷開音源如舊，音符包絡仍排程。Inspector保留真实RMS，加contextTime/analyserSize；失敗時保存lastAudio與暫停state/focus，不造零值。原10秒與靜音閾值不鬆。這是修正來源可見master-gate風險；是否解決CI43只能由新瀏覽器證據確認。

使用者要求無硬體渲染時自動處理：保留Babylon的WebGL2→1與瀏覽器後端選擇，不拒絕slow-context。已知SwiftShader/llvmpipe等只作software hint，隱藏／其他driver為unverified，不假稱硬體。auto依software hint或持續低幀降低drawing-buffer解析度，保留原畫質手動切換與有限三級調降；不改場景、陰影特效、人物比例、鏡頭政策或戰鬥速度。context loss凍結音畫/遊戲與清输入；恢復重新計時，無背景補跑或自動存檔。無WebGL顯示可操作的accessible錯誤/reload。

**已做的是自動相容判斷與解析度調整，不是網頁強制切CPU，也不是完全無WebGL仍可玩的CPU/Canvas2D後端。** 瀏覽器若拒絕所有WebGL，現版仍不能遊玩。這項完整fallback期待仍待實作，不以錯誤UI／NullEngine／降低畫質冒稱完成。Chromium已記載自動軟體WebGL fallback的棄用，driver資訊也可能因隱私不可見；技術引用及完整政策見RENDER_COMPATIBILITY.md。

新增17個既有World方法與22個遊戲函式fingerprint保護；6個歷史整檔/normalized pin因有意接線明確前移，沒有刪原斷言。CI保留三job及原45分鐘、13主/9native/3來源ledger所有旅程；追加softwareWebGL2/1、native WEBGL_lose_context、原生select、無WebGL/reload、真實canvas pixel與來源hash驗證。新driver僅CI執行；受控software測試設定不是一般瀏覽器必定自動fallback，Canvas2D取樣不是renderer。

**CI44 35583275426** push/attempt1，最後queued/null，09:26:16Z。沒有新runtime after圖、瀏覽器audio證據、Pages驗收、聽感/真機/90結論。本機HTML5649823bytes/SHA256a6f7ecd69f5050b09ca5f6d0cc8937ea7fa4d5405852b808e6061df0beaa7103，sourceSha=null，是local build。後續[skip ci]文件不同HEAD不產生另一candidate。

## 完整未完成範圍與接續

T03隱藏規則／版本差異／完整拓樸與原作數值；T04成長/報酬掉落/技能/完整經濟飾品角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來、其餘時代主支線結局；T07整體90/各面向80%/zero-critical/必需資產五gate/實體輸入FPS-frame-time載入記憶體背景存檔及音訊；T08每批雲端閉環。無WebGL真正可玩後端列入相容性未完成。家中母親家具、全材質比例、窄視窗、完整動畫音樂仍開放；不縮小分母、不只評已完成功能。

目前只接CI44。pending保存回報不長等/取消重派；failure處理同run第一實際root；success核對3job與原finalreports/audio，以及render-compatibility/report/source-ledger/實際PNG，原始ZIP上指定Drive回讀，再匹配Pages/source/HTML。不用progress或合成fixtures代替證據，綠勾不是美術或真機驗收。

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。新包17SEnE-8kzSYX2zRcHmbYf_yGKUSHaNFD／26323163bytes／SHA2564b42d2ff9e45b81e9987fc0c934eedfd075f00a35516192cae98955096356fcb，49manifest／5原始ZIP／下載hashCRCparent已驗證，26changes、8rawlogs、228檔assembled恢復快照。封存早於發布的nullsource正確，GitHub最終收據補身份；最新main文件另讀。已驗收Y與heldZ原包保留，詳DELIVERY_INDEX。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuildhardlink，私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM/原圖音訊/字型/憑證；臨時容器不是權威。
