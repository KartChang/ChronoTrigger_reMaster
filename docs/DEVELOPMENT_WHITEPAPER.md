# ChronoTrigger reMaster 開發白皮書

版本product-vq04m-production-v46；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v46。唯一main／singleAI／nonforce。前代完整白皮書原blob **4c15a01d919151dcd492bcac6035244e5af1a21c** 原byte存evidence/VQ04M_PREVIOUS_WHITEPAPER.md；未改架構、數值、音訊與全部分母直接沿用，不重審歷史。

## 產品與固定架構

完整《超時空之鑰》瀏覽器HD-2D：像素角色＋立體場景、原作背景辨識度與構圖、縮尺大地圖／城鎮／室內切換、fixed ATB、P1/P2與自主第三、全時代主支線結局。2300抵達非完整未來。優先前段實際遊戲美術及舒適性，不能縮為展示圖或反覆邊界維護。

TS/Babylon/esbuild、原World／fixed simulation／A*／InputBoundary／v1-v8不變。ArtDirectedWorld組合同一scene，CPU/WebGL共用正式入口，不加P3／ARPG／裝置測試旁路。State、時鐘、input、save、碰撞、camera算法、native routes/waits/captures/assertions/goldens及CPU品質／記憶體門檻保持；held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a和母親家具不提升。

## 沿用與M實作

A–L基礎沿用，K旅館立面、L苔根蕨葉與I CPU優化不重做。M以純作者dressProductionRoof作為既有H Geometry建立時的依賴；正式入口固定傳入作者，無版本／裝置／CI環境分支。完整白名單、來源layout與unit UV等檢查在變更前執行，漂移時既有owner還原原Geometry，外部替代物件不被覆寫。

四棟屋頂44件：8屋面UV (u,v)→(v,1-u)，使原瓦片横列順斜坡；32橫條截面.42、4屋脊上緣.60。保持原貼圖／材質、原mesh transform、坡面主體位置、屋脊底座與橫條長度，法線重算。實際畫面會變；診斷仍讀真實source texture及mesh，不偽裝L畫面。M沒有額外mesh/texture/material/retained geometry buffer，沿用town91200及town+court100320bytes幾何payload，不宣稱引擎總記憶體。

M不處理完整樹冠、屋頂外形與區域重設。G224NPC ambient/greet保留；112walk與256party combat仍staged。所有完整動作和劇情目標不縮。

## 驗證與發布分開

完整Node3809／Python649／assets／TS／quality schema／build通過，770source前後相同。57專屬Node／4Python、16非target/held完整frame、4CI109原inn停點gate、44模型與獨立/build匯出同源；4圖只算offline。M→L及前代SOURCE-only還原限舊source/component，不作用native/image/State；首輪H字串检查失敗以明示source還原修正，原斷言與pins保留，M實際整合仍不還原。

CI109／Pages103成功，七原ZIP、759Lsource、八ledger179entry及九Pages payload回驗；原CPU rescue302<=309且trial過。三張原生靜態圖非全motion/聆聽/真機；空.nojekyll不在tar，未抓live site。最後限定部署L0.9.85。M0.9.86 sourcee2018f2a3752f14dc52a55517839797cac67e0c7已單次nonforce發布；唯一CI11036538709652最後in_progress，尚無M原生或部署批准。

## 持久交付與完整分母

全部source/tests/logs/manifests/models/offline views存main或唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。M包1O4U8moauYaLlwajGFtzCV0-YpydBsNnX，143manifest／770snapshot／23delta，已真正下載回驗後才push；snapshot排除docs/node_modules，不能覆蓋main最新文件。文件[skip ci]；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢复node_modules/esbuild hardlink；臨時容器非權威。

T03全規則版本拓樸數值、T04全成長經濟道具裝備飾品學習換人雙三人技、T05全美術建模動畫合法音訊、T06全時代主支線結局、T07真實畫面遊玩裝置整體>=90及各面向>=80%／requiredassets／fivegates／zero critical、T08fulltests/onesource/matchingCI/cloud回驗不縮。完整方向動作death、屋頂樹冠與家具構圖、縮尺地圖、音訊聆聽／原速／真機／長時段仍open。全部完整批准false、newScore=null、releaseBLOCKED；舊30/100非新評分，ROM/media/fonts/credentials私有。
