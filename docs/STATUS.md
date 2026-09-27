# Status — VQ04B 美術合批已發布，CI99 驗證中

Authority：STATUS／TODO／evidence/T05_ANIMATION_CHECKPOINT **v35**／handoff/IMMEDIATE_CONTINUATION。唯一 KartChang/ChronoTrigger_reMaster **main**，single AI／non-force；不建 branch、PR、parallel candidate 或多人防撞。使用者優先要求實際美術開發，不是生成概念圖或再做一整輪動畫維護。

## 唯一目前位置

**VQ04B／0.9.75 source b5e92d92940e28344f4a9f5a618050d513f6253a**；source tree **7499f0798c4111789f81153288901de0ccd897f9**，parent **09b58835a05deab472b2f7f2202b0a4a7be8b433**。21 個程式／測試檔合批，完整測試後一次 non-force source push；整個 GitHub tree 等於已測 tree，保留最新 main docs，不覆蓋 source archive 的舊文件。

Matching **CI99／36342361270**，push／attempt1／exact B，最後 **in_progress**，provider updated **2026-09-27T18:54:22Z**。沒有 manual dispatch、未發布 candidate 或 B 原生／部署批准。後續文件提交只有 docs／[skip ci]；文件 HEAD 不是遊戲 source。不長輪詢，不重送 B。

## 本批已落地的美術

山道／樹列：四款樹冠改為分叉樹幹、根系與不等形葉團，弱化圓盤式內框；共同左上光源、分層葉片及樹皮。地表草簇、石粒與閃點降低，保留安靜行走通路；遠山改不等高稜線、三層大氣色與尖冠遠林。原路線／碰撞／角色座標不變。

法庭：保留原 zoom／相機角度與目標，將 orthographic 上下界同移 +1.2，修正彩窗安全區裁切而不縮小角色；四組側柱共12構件使用既有石材，置於原角色走道之外。陪審木材不再反覆出現金色框線。場景既有北牆構件保留，總 production 靜態構件28（法庭27、山道1）。

配角：正式 ArtDirectedWorld 接入法庭 supporting cast 色料與形體明暗處理，8款既有角色／每款4個 ambient frame，共32格匯出；不是新畫32個姿勢。保持48×64、alpha、黑邊、pivot與動畫時鐘，借用原texture更新而不新增GPU貼圖，最多24個綁定／589824CPU bytes。切章節還原、回場重套、釋放時移除自己的adapter。主角／同伴／敵人畫師及其原生golden cells本批保留，不代表完整角色美術已完成。

1000森林：直接重繪原本擁有的384×352地表貼圖，保留既有三段道路，加入地表層次／落葉／光色；不新增GPU材質資源或改navigation。既有13組環境PNG及新增8配角圖集＋1森林地表共22PNG由runtime同源匯出，存專案交付包，不在對話交圖。

## CI98 真正失敗與驗證

**CI98／36338351176 completed/failure**，updated2026-09-27T18:04:13Z。三份 trial／witness 報告皆在原20秒彩窗safe-area wait失敗，top約.020705低於原.065；14張NPC均48×64，JS errors為空。後續software/native驗證被跳過，沒有playable；不是已觀察的CPU raster失敗。四原ZIP及診斷未改寫，存入本輪包。CI98本身不rerun、不回填 accepted。

B離線同場景已重現A裁切並修正，final top **.09762804197989591**，五種橫直viewports保留同一.065條件；這不是新的原生接受。所有原route／tick／key／wait／capture／assertion／golden files未改。

完整 **3160Node／605Python**，fail0／skip0，asset／typecheck／build通過；新增50Node／4Python。613程式輸入byte-exact。原A component tests明確凍結為A，B新增測試實際跑current ArtDirectedWorld／CPU輸出／State不變／四參數effects交付／cast生命週期／held畫面還原，沒有以舊component冒充新app驗證。全部失敗、成功與初始實驗logs保留。

## 持久成果與直接接續

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。**Chrono-VQ04B-production-art-tested.zip／1y1rv5lVly36x6abap1CBKLcyb8e5JGGr**：34093917bytes，SHA256 **56b9d85ad8791f5dda3313e6ea1c7e395b5d1b001c714d8978b32dac74e40eb6**，96manifest／634program snapshot／21changes／22PNG／四CI98原ZIP。已真正下載核parent、size、hash、外內ZIP CRC、manifest exact集合與逐檔內容，snapshot逐byte匹配，checked2026-09-27T18:48:57.284805+00:00。snapshot不含最新docs，不能覆蓋main；early checkpoint1-aWddwHGVjlsTqu99V2lBUWTjIKEbMBc已被final包取代。

Root **T05-early-visual-cohesion**；execution **T05-early-production-art**；next **T05-early-production-art-canyon-court**。接CI99 exact B的新原始畫面／來源及匹配Pages，先修真實美術阻塞，再續高品質人物敵人完整方向動作、前段場景尺度／構圖／遮擋。不能因保留舊sprite就排除角色重製，也不能以本輪色料finish宣稱完整重繪。

目前仍未達認可概念圖品質。artApproved／fullAnimationComplete／originalSpeedComfortApproved／listeningVerified／physicalDeviceApproved／longSessionApproved／wholeGameAccepted全部false，newScore=null，releaseBLOCKED。最新有界接受仍Y／CI96／Pages90；CI97/Pages91只provider狀態保留。W closed基礎不重做，CI93/95/98 failure不回填；Tank/Yakra完整死亡、Hench/Pdown/Qselector原生缺口保留但不搶走美術優先。

TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8與T03-T08完整目標均保留；2300抵達非完整未來。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a／母親家具不改。No localbrowser/native造數，不放寬原門檻，ROM/media/fonts/credentials私有。全部成果GitHub／正確Drive及readback；工具鏈只恢復node_modules/esbuildhardlink，臨時環境不是權威。
