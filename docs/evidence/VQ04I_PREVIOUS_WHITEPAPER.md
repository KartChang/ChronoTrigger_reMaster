# ChronoTrigger reMaster 開發白皮書

版本product-vq04h-production-v42；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v42。唯一main／single AI／non-force。前版完整白皮書原blob f94440e698f3bb52a01ed298cb9cbaf616c23b2f保留於evidence/VQ04H_PREVIOUS_WHITEPAPER.md；未改架構、數值、音訊與完整分母沿用，不重讀歷史。

## 產品與固定架構

完整《超時空之鑰》瀏覽器HD-2D、像素角色＋立體場景、原作背景辨識度與構圖、縮尺大地圖／城鎮／室內切換、fixed ATB、P1/P2及自主第三、全部時代主支線結局。2300抵達不是完整未來；前段實際美術與舒適性優先，不縮成展示或以反覆邊界維護取代。

保留TS/Babylon/esbuild、原World／fixed simulation／A*／InputBoundary／v1-v8、暫停背景規則。ArtDirectedWorld在同一scene組合美術，CPU/WebGL共同入口，不另造renderer、ARPG、P3或裝置旁路。原State／HP／角色位置／時間／save／碰撞不寫；native route/tick/key/wait/capture/assertion/golden、<.12／單一30秒／250ms-256／CPU品質記憶體門檻不變。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a與母親家具不提升。

## H模型比例與來源保護

A/B/C環境、D探索256格與山岸、E作者NPC336格、F路緣木作及G224方向ambient/greet接入沿用。H以私有Geometry重新塑形原城鎮100件、法庭10件：城鎮Y=.33／高度.82，被告席.50／法官台.72。保留原parent-space XZ、scene transform、UV、材質、texture和角色位置，原屋頂坡向不反轉；不是改碰撞地圖或以診斷回傳假像素。

完整root／名稱／位置／旋轉／material／box positions/normals/UV/indices符合已宣告來源才接入；原講台physical boxTextureUV與其他unit UV分別核對。換owner／source drift fail-closed；僅還原仍由自己持有的geometry。上限2root／110owned geometries／100320bytes幾何buffer payload，不含JS heap overhead；0新增mesh／texture／material。詳PRODUCTION_ART_VQ04H。

G仍只讀真實active存活隊員位置和原producer clock，224ambient/greet可選欄位不代表全格native覆蓋；112walk／NPC導航及256party combat仍未啟用。H不改作者pixels。

## 驗證、失敗與部署分離

H原完整Node3553／Python629／assets／TS／quality schema／build成功，717source全測前後一致；52H專屬Node與15非target／held CPUframe一致。既存CI103 beforeState離線51ray記錄G6遮擋、H0，不能當H瀏覽器或真機批准；離線CPU study沒有證明中位draw更快。H→G SOURCE-only inverse及前代傳遞保留原pins/native/goldens，不適用於native/image/State。原失敗與中斷logs保留。

CI104 failure：reunited／truce雙人z7.6路線311ticks>309；空間達標不取消時間預算失敗，root cause及H修復未證明。Pages98 skipped、Pages97 failure保留；最後已審查部署仍E／CI102／Pages96。H已於fb57de8eb15fc3e46e078a946766ed42e59611e4單次發布，唯一CI105執行中；以checkpoint接原始產物，不重送、rerun或dispatch。

## 持久交付

H最終包11JsLBJkTyPUy8VOKh6Xd0JyRhSMwec0t已存唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。中斷後本輪真實下载核93manifest／717source／25delta及Git root；此輪沒有新增遊戲程式或重新全測。包內715檔early收據不冒充最終pre-push回驗，詳DELIVERY_INDEX及VQ04H_RECOVERY_READBACK。snapshot不覆蓋最新docs，工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuild hardlink。文件[skip ci]，容器不是權威。

## 全範圍與批准

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06全時代主支線結局；T07真實畫面遊玩裝置整體>=90、各面向>=80%、requiredassets/fivegates/zero critical；T08fulltests/onesource/matchingCI/cloud回驗，不縮分母。完整party/enemy/NPC方向動作death、場景構圖尺度遮擋、縮尺地圖切換、合法完整音訊／聆聽／原速／真機／長時段仍open。Tank/Yakradeath、Hench outgoing、Pdown、Qselectorhurt樣本缺口保留。

art/fullAnimation/originalSpeed/listening/device/longSession/wholeGame批准皆false，newScore=null、releaseBLOCKED；舊30/100不是H分數。ROM/media/fonts/credentials私有，No localbrowser/native造數。
