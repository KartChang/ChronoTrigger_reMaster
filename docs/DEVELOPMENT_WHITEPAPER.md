# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04a-art-first-ci98-pending**。Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT **v34**。唯一main／singleAI／nonforce。Root T05-early-visual-cohesion；目前execution T05-early-production-art。

前一版完整白皮書blob **de00d94a2c76e715728e4f78d69ecf4219f05823**原封保留於 **evidence/VQ04A_PREVIOUS_WHITEPAPER.md**；未改的詳細設計、數值、歷史與限制仍有效。下列目前狀態取代其舊Z/CI97 pending與動畫優先順序，不從封存資料倒退currentmain或重做已完工作。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先、原作世界背景/辨識度/構圖、縮尺大地圖與城鎮/室內切換、原地ATB、單人與同機雙人共畫面，包含全部時代、主支線與結局。不縮成展示；2300抵達不是完整未來篇。

使用者已再次明確要求先完成美術，以認可的山道與法庭概念圖為品質目標。應優先把原型材質、場景尺度、角色輪廓、背景與建築做成實際遊戲資產，不再用生成圖代替開發，也不把每輪全部時間用於動畫邊界維護。已實作的M-Z動畫基礎保留；只有真阻塞才切回修理，不否認仍開放的原生樣本缺口。

整體>=90、每面向>=80%、requiredassets/fivegates/zerocritical，必須由實際畫面、遊玩及裝置證據支持。概念圖認可不是runtime批准，測試數或匯出PNG不是美術分數。前段未舒適前不急擴後段。newScore=null，releaseBLOCKED。

## 二、保留架構與行為

TypeScript/Babylon.js/esbuild、既有固定依賴、自含HTML、無CDN/ROM/後端需求。Controls→固定1/60秒simulation→core→render/HUD/audio，呈現不得決定HP/ATB/碰撞/存檔/劇情。P1/P2/自主第三，原獨立選敵/雙確認合技，InputBoundary與A*；不加P3、不改ARPG、不重造框架。

暫停、背景、dialog/inventory/native選檔/context loss保持simulation凍結，不補跑背景時間。v1-v8白名單IndexedDB/JSON維持；診斷或美術cache不入save。CPU/WebGL共用規則，無GPU時使用原CPU triangle/texture/depth fallback，不另造低品質遊戲。

CPU640×480cap、最大邊1280、32MiB/512entries/120活動FrameWindow及既有品質記憶體門檻不變。已有opaque-affine minification預設OFF、alpha/perspective nearest及mip資源釋放不變；不聲稱短離線測試代表真機FPS或長時段。原native route/tick/key/wait/capture/assertion/<.12/單一30秒/250ms-256一律不放寬。

## 三、VQ04A 實際美術增量

正式入口用ArtDirectedWorld繼承原World，super(canvas)後在同一scene安裝production-environment，所有模式/CPU/WebGL皆同一路徑；不重建renderloop、事件或framework。確定性production-art編寫13组RGBA，無ROM/外部image/font/service輸入，不拿concept或截圖作遊戲背板。

山道：768×672路面、128×128岩壁/草皮、544×160四款樹冠atlas、640×256遠山。道路邊界/既有地形/碰撞不變；八張樹卡保留normalizedUV，僅增加北侧1張遠山景片。

法庭：768×704地板/紅金地毯、256×320台階atlas、石材/徽記木作/無徽木料、64×256布幔、256×160彩窗、96×256旗幟。保留既有角色/幾何，增加15個北牆柱/旗幟/燭台部件/簷口，不新增碰撞；只縮短固定相機空景，直式仍容納陪審兩側。靜態窗光是紋理明暗，不冒稱即時反射、體積光或GPU專屬效果。

1000森林：十五張既有tree/canopy卡共用四款atlas，不更換600森林材質或heldhome。13材質共6,213,632rawRGBAbytes、lazy共享cache，非每幀重製；不聲稱整體遊戲只用6MiB。人物/敵人sprites与動作本批沿用，尚未完成完整角色藝術。

scripts/production-art-export.mjs從同一runtime函式輸出13PNG/manifest到dist/art/production-vq04a；建置接入原CI已有的art artifact，未修改workflow。詳見PRODUCTION_ART_VQ04A.md，requiredassets新增review而非approved項；不刪除舊required範圍。

## 四、已測與原生界線

23個程式/測試/素材檔合批；完整3110Node/601Python/asset/typecheck/build通過，新增42Node/4Python。新actual application測試證明三場景CPU像素有改變、原State/events/actors/幾何transform不變，held/non-target圖像不變；章節切換/橫直取景/材質cache/釋放/PNG與runtime逐pixel同源有覆蓋。

601未改程式輸入byte-exact。原component baseline hashes以明示source-only inverse保留並測缺hunk/重複/額外變異，不接收native報告/像素/State。保留component測試不等於只測舊World：新integration確實使用正式ArtDirectedWorld。全部成功/失敗/中斷logs已持久保存。

OFFLINE工作圖是未改fixture的CPU作者檢視，不是localbrowser、新native路線、裝置測試或藝術批准。當前環境改造未達concept等級；新CI實際畫面、連續遮擋/行走/戰鬥、原速/真機舒適性仍須驗證。不得把概念圖或工作圖當成CI97/98原生資料。

## 五、目前發布與持久成果

VQ04A0.9.74 source **4dc7449ff41a6b87e452c45184198b3c9a1929e2**／tree **18e4e642f7e54cfdf7c7f2581712afb6533933af**，parent781e3a34664752771056c51aeec2edd1aa61c539。GitHub四個program subtree等於已測tree，source push保留當時最新main docs；一次nonforce發布。唯一matching **CI98/36338351176** push/attempt1最後in_progress，providerupdated2026-09-27T17:49:23Z。尚無A原生/Pages/art批准。

指定Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**：完整已測包 **Chrono-VQ04A-production-art-tested.zip／1IkkI26IMQX83OWLIsUK_ETUsmI_MN_q-**，57,499,039bytes、SHA256 **18d310dd0509c832031b40e606a5546f0e226974f67a805ca9eabbbb9dbcce6d**，79manifest/624snapshot/23changes/13PNG/完整logs/原CI97 browser ZIP。已真正下載驗parent/size/hash/外內CRC/逐檔及snapshot bytes；包內無最新docs，不能覆蓋main。封裝false旗標是歷史，以當前receipt/v34為準。

CI97/Pages91 provider已success；本輪只核來源及恢复code，不宣稱新的整包原生/部署bytes接受。最新完整有界收據仍是Y/CI96/Pages90；W/CI94/repair-history/CPUwheel event1529等closed，CI93/95各自保持failure。Tank/Yakra完整death、Hench outgoing、Pdown、Q受擊selector-change仍open，不增加等待或注入狀態湊樣本。

## 六、下一步與完整未完範圍

直接接 **T05-early-production-art-canyon-court**：CI98新原始畫面→對照概念檢查細節密度/輪廓/光色/材質銜接/法庭留白/樹冠遮擋→合批美術續修→完整人物敵人方向動作/原作前段構圖與其他場景→合法完整音訊/實際聆聽/原速/真機長時段。不重跑已測A、不重送source、不連續開多輪CI、不長輪詢到中斷。

T03所有規則/版本差異/拓樸/數值；T04完整成長/獎勵/掉落/經濟/道具裝備飾品/學習/換人/雙三人技；T05全部美術建模動畫合法音訊；T06所有時代主支線結局；T07整體>=90/每面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08完整tests/onesource/matchingCI/cloudoriginalreadback。已存在13商品/裝備相容/守恆與暫定400G等規格不因本批美術變更；完整原作數值仍未冒稱完成。

Held src/prologue-render.ts固定blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與母親家具不提升/間接替換。既有7自製音型/7段配樂、16聲部/master.55等設計見封存白皮書，未在本批更改；圖像/graph/unit不能代替完整音訊或聆聽。ROM/media/fonts/credentials私有。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules/esbuildhardlink，不覆蓋source/config或另bootstrapCI。全成果GitHub/正確Drive/readback，docs[skip ci]，臨時container不可信。
