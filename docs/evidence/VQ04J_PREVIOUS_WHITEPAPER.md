# ChronoTrigger reMaster 開發白皮書

版本 product-vq04i-production-v43；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v43。唯一main、single AI／non-force。v42原白皮書blob702b89364576d34656c484ae03f7d1e5d843fcdb保存於evidence/VQ04I_PREVIOUS_WHITEPAPER.md；未改架構、數值及完整分母沿用，不重審歷史。

## 產品與固定架構

完整瀏覽器HD-2D超時空之鑰、像素角色＋立體場景、原作背景辨識度／構圖、縮尺大地圖／城鎮室內切換、fixedATB、P1/P2及自主第三、全部時代主支線結局。2300抵達不是完整未來；不縮成展示。前段實際遊玩與美術舒適性優先，不以概念展示圖或反覆邊界維護取代。

保留TS/Babylon/esbuild、原World／fixed simulation／A*／InputBoundary／v1-v8及CPU/WebGL共同美術入口。不另造框架、ARPG、P3或測試裝置旁路。原State／HP／位置／時間／save／collision、暫停背景恢復、native route/tick/key/wait/capture/assertion/golden、<.12／單一30秒／250ms-256／CPU品質記憶體門檻不變。Heldprologue2711a74185aacf3c6bddf9db85ba99a2afbc507a與母親家具不得直接或間接提升。

## 既有美術直接沿用

A/B/C環境、D探索四角色256格、E七類NPC336作者格及256combat作者格、F城鎮路緣法庭木作、G224四方向ambient/greet及H100建築件／10法庭件比例皆保留，不重作者。112NPCwalk／導航及256combat runtime啟用仍未完成。W/Y/B/C原有有界接受沿用，完整motion／death／美術風格和原作構圖尚未完成。

## I像素不變的CPU成本修正

因CI104/105都在不變的CPU雙人路線超tick預算，I針對已觀察的渲染熱點減少計算與暫存分配；未宣稱該trace隔離了唯一根因。cpu-raster逐列半平面邊界展開，保留精確判斷／順序；先算alpha與cutoff，被丟棄片元不算RGB；cpu-scene每frame三個Vector3重用，vertex保存scalar而非可變alias。原live scene／observer／光線與transform每次仍生效，無舊scene cache或假像素。

37專屬Node涵蓋4000randomtriangles、RGBA／Float32depth／工作計數、alpha／opacity／mip／wrap／clipping、燈光與動態變換、17場景及2原CI105位置整張畫面。I→H SOURCE-only inverse及前代傳遞保留原hash/native/goldens，不能用於native/image/State。最終Node3590／Python633／assets／TS／quality schema／build全過，727檔全測前後一致。兩未引用錯誤傳輸物件未提交；新宣告縮小後全套重測、舊紀錄保留。

543×362四case交錯離線量測draw中位減少約9.4%–20.6%，不是browser FPS／真機批准／native路線修復證據。實作及原始量測見CPU_HOT_LOOP_VQ04I與Drive完整包。I沒有新增美術或縮小視覺品質。

## CI與持久交付

I0.9.82 source e6512e40a48d68df1dab351a8151d1e40b637a36、treec9da8d56a6cdece842d82b9a993524061269ac06單次non-force發布，唯一CI106／36472872816。pending記checkpoint不長poll，完成才看原生CPU rescue／trial／持續觀察與Pages exact-source部署。CI105 failure／Pages99 skipped保留；最後已審查部署仍E／CI102／Pages96。

所有source/tests/logs/manifests/素材及文件存main或folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。I同ID1rQFMxpJqWT26Z8lKM2hiHYNcOwSmK68D已更新最終60manifest／727snapshot／19delta，真正下載回驗後才push。snapshot不含docs/node_modules，不蓋main最新文件；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink。docs[skip ci]，容器不是權威。

## 完整範圍及品質

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全美術建模動畫合法音訊；T06全時代主支線結局；T07實际畫面遊玩真機整體>=90、各面向>=80%、requiredassets/fivegates/zero critical；T08fulltests/onesource/matchingCI/cloud回驗，不縮。Tank/Yakra完整native death、Hench outgoing、P down、Q受擊selector-change樣本缺口保留。

完整party/enemy/NPC方向動作death、概念級場景構圖尺度遮擋、縮尺地圖切換、完整合法音訊實際聆聽／原速／真機／長時段仍open。全部art/fullAnimation/originalSpeed/listening/device/longSession/wholeGame批准false，newScore=null／releaseBLOCKED，舊30/100不是I評分。ROM/media/fonts/credentials私有，No localbrowser或native造數。
