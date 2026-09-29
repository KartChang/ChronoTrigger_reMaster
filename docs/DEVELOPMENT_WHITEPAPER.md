# ChronoTrigger reMaster 開發白皮書

版本product-vq04l-production-v45；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v45。唯一main／singleAI／nonforce。前代完整白皮書原blob b48b01a295435aa6c38dab52f16bba9c75777928保留於evidence/VQ04L_PREVIOUS_WHITEPAPER.md，未修改的架構、數值、音訊與完整分母沿用，不重新審计歷史。

## 產品與不可變架構

完整《超時空之鑰》瀏覽器HD-2D：像素角色＋立體場景、原作背景／辨識度／構圖、縮尺大地圖與城鎮／室內切換、fixed ATB、P1/P2及自主第三、所有時代主支線結局。2300抵達不算完整未來；前段實際遊戲美術与舒適性优先，不能縮為展示或反覆邊界維護。

TS/Babylon/esbuild、原World／fixed simulation／A*／InputBoundary／v1-v8不改。ArtDirectedWorld組合同一scene美術pass，CPU/WebGL同入口；不造P3／ARPG／裝置旁路。原State、時鐘、save、碰撞、camera算法、native routes/waits/captures/assertions/goldens及CPU品質／記憶體门檻不變；held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不提升。

## 沿用與本批新增

A–J美術與I像素不變CPU優化沿用；K招牌立面內縮／下移已在main且CI108／Pages102成功。本輪找回中斷K文件、完整source與原logs，沒有再作者或重送K。原CI107 failure／Pages101 skipped保留；K最終pre-push下載收據未恢復，明示發布後回驗。

L兩個原創256×64像素圖集各四64×64變體，於托魯斯4及森林12原樹點補破碎苔根地表與扇狀蕨葉。正式installProductionGrove使用原scene之onBeforeRender；白名單結構與原plane／material／texture尺寸契約不符即拒絕。接入後drift釋放自有物件，不寫回外部樹。max2cached roots／32mesh／2texture／2material，131072bytes只指RGBA payload；root/pass/scene dispose回收，不冒稱cached root切home立即消失。

原樹冠、屋頂、道路、人物RGBA、geometry與遊戲State不改。新葉叢不可pick／無collision，主路外布置；這是局部接地層，不是完整樹列、屋頂或原作構圖批准。G224NPC ambient/greet保留，112NPCwalk及256party combat仍未啟用。

## 驗證與可驗證發布

L完整Node3752／Python645／assets／TS／quality schema／build通過；759source前後一致，50專屬Node／4Python、15非target／held整張frame及4原CI108停點保持。2PNG／manifest獨立與build同源，2模型／6圖明示offline。L→K及前代SOURCE-only inverse僅用舊component／source回歸，不處理native/image/State，正式L應用無inverse。

CI108七原ZIP、747Ksource、八ledger／179entry、九Pages payload實際核對；僅三張靜態圖review，不擴為motion／聆聽／真機。最後限定部署K0.9.84／CI10836509304093／Pages10236512444855；L0.9.85 sourceb8cc1b603c419ac11724cec9a7292d38c984b066已發布，唯一CI10936516603995最後in_progress。L品質與部署不能由K或離線綠勾推定。

## 持久交付與完整範圍

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。L完整包1Yzcp3ZOSCCHb_lE9-ax5626D1aHBI2oz保存source/tests/logs/assets/manifest/models/offline views，759snapshot／23delta／69manifest；先真實下載回驗再單次non-force sourcepush。GitHub文件[skip ci]；snapshot排除docs/node_modules，不覆蓋最新main文件；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢复node_modules/esbuild。容器非權威。

T03全規則版本拓樸數值、T04完整成長經濟裝備學習與雙三人技、T05全部美術動畫合法音訊、T06所有時代主支線結局、T07真實畫面／遊玩／裝置整體>=90及各面向>=80%／requiredassets／fivegates／zero critical、T08完整測試與來源／CI／cloud回驗不縮。完整動作death、屋頂樹冠／家具構圖、縮尺地圖、音訊聆聽／原速／真機／長時段仍open。art/fullAnimation/originalSpeed/listening/device/longSession/wholeGame皆false，newScore=null、releaseBLOCKED。ROM/media/fonts/credentials私有；不以舊30/100或素材數冒稱新評分。
