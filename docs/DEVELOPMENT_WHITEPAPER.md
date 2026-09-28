# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04g-production-v41**；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v41。唯一main／singleAI／nonforce。前代完整白皮書以原blob **0bdebe01eb5f9945bfbc53b1f1d5f0ff585f4144** 保存於 **evidence/VQ04G_PREVIOUS_WHITEPAPER.md**；未改的架構、数值、音訊與既有完整分母直接沿用，不重新審計歷史。

## 產品與固定架構

完整《超時空之鑰》瀏覽器HD-2D、像素角色＋立體場景、原作背景辨識度與構圖、縮尺大地圖／城鎮／室內切換、fixed ATB、P1/P2及自主第三、全部時代主支線結局。2300抵達不是完整未來。先把前段實際遊戲美術與舒適性做好，不以展示圖或反覆邊界維護取代。

TS/Babylon/esbuild、原World／fixed simulation／A*／InputBoundary／v1-v8不改。ArtDirectedWorld只組合同一scene的美術pass，CPU/WebGL共同入口，沒有額外遊戲框架、P3、ARPG或測試裝置旁路。原State／HP／位置／時間／save／碰撞不寫；暫停／背景恢復規則、原native route/tick/key/wait/capture/assertion/golden、<.12／單一30秒／250ms-256／CPU品質記憶體门檻不變。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不能直接或間接提升。

## 已有基礎與G實際接入

A/B/C環境、D探索四角色256格與山岸、E七類NPC336格作者程式、F托魯斯路緣／門檻及法庭木作材質保留，不重新作者。W/Y/B/C有界接受、CI101/Pages95及CI102/Pages96既存限定review沿用；CI93/95/98與Pages97失敗維持原狀。

G使用未改的E來源，以原owned DynamicTexture.update邊界選四方向ambient/greet224欄位，比前代28前向ambient多196可選格。NpcAttention複製現有active存活有限座標隊員0/1，在explore與非cutscene決定朝向／近距離招呼；有限target/axis/radius滯後防止抖動，原producer時鐘不變。112walk欄位和NPC導航仍未啟用，256party combat作者格仍runtimeApplied=false。不能把eligible數目當native覆蓋或完整動畫。

原八mesh名稱／parent／48×64 raw逐byte驗證、獨占材質、unknown fail-closed、this/args/return/exception、owner/resize/dispose與held真raw還原維持。0新增GPUtexture、12binding、294912bytes retained CPU RGBA與12attention choices；不變key不重上傳。七PNG／224cell作者同源並與build匯出一致，所有素材已存指定Drive。

## 驗證與部署分離

完整Node3501／Python625／assets／typecheck／quality schema／build已過，703檔全測前後同byte。76專屬Node含真正owned upload及current-app CPUframe，11非target／heldframe與F一致；原失敗offline fixture logs保留。G→F SOURCE-only inverse及前代傳遞保護原pins/native/goldens，不能用於native/image/State。具體測試與作者範圍見PRODUCTION_ART_VQ04G。

CI103已success、五原ZIP／690source／三lane29entry／兩WebGL靜態圖完成限定核對。Pages97 prepare選CI失敗，沒有staging/deploy；未記錄success-list原回應，不推論確切provider原因。G workflow_run改直接GET exact trigger並驗證id/SHA/attempt及原checkRun/unique artifact/digest；移除獨立Pages push觸發，無fallback舊CI。修正單測通過不代表新Pages部署已完成。

G0.9.80 source1512fcaf3601c31834d2047042b7fbb3a61aee66已單次nonforce發布；唯一CI10436454035999執行中，實際狀態以checkpoint為準。最後已限定審查部署仍E／CI102／Pages96。

## 持久交付

所有source/tests/logs/manifests/素材在main或唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。G最終包1oe-CpAhb2AMAbD5GddhbOsukB-jqcy8F，1499878bytes／SHA403bbc3895a4e85a43a8c5318f25d6ab1ff1d2f30701563de6d82d27730b2134，68manifest／703snapshot／27deltas／7PNG，先真實下載核對再push；收據見DELIVERY_INDEX與evidence/VQ04G_*。snapshot排除docs/node_modules，不蓋main最新文件；同ID中間包不是第二candidate。文件[skip ci]，工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuild hardlink；容器非權威。

## 全範圍與品質批准

T03全規則版本拓樸數值；T04成長／經濟／道具／裝備／飾品／學習換人雙三人技；T05全部美術建模動畫合法音訊；T06全時代主支線結局；T07真實畫面遊玩裝置整體>=90、各面向>=80%、requiredassets/fivegates/zero critical；T08fulltests/onesource/matchingCI/cloud回驗，分母不縮。Tank/Yakra完整native death、Hench outgoing、Pdown、Q受擊selector-change樣本缺口仍open。

完整party/enemy/NPC方向戰鬥受擊倒下death、前段構圖建築尺度遮擋、縮尺地圖與城鎮切換、合法完整音訊及實際聆聽、原速／真機／長時段未完成。art/fullAnimation/originalSpeed/listening/device/longSession/wholeGame批准皆false；newScore=null、releaseBLOCKED，舊30/100不是新評分。ROM/media/fonts/credentials私有；No localbrowser或native造數。
