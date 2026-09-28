# Status — VQ04I已合批發布；唯一CI106執行中，v43

Authority：本頁／TODO／evidence/T05_ANIMATION_CHECKPOINT.json v43。唯一KartChang/ChronoTrigger_reMaster／main，single AI／non-force，不建分支、PR或平行candidate。Root T05-early-visual-cohesion；execution T05-early-production-art；work item T05-early-production-art-canyon-court。

## 目前source與唯一驗證

VQ04I／0.9.82 source **e6512e40a48d68df1dab351a8151d1e40b637a36**，tree **c9da8d56a6cdece842d82b9a993524061269ac06**，parent **89e7f811541a803b7639c89cae5fdee72da4f9c4**。完整727程式檔、19差異（9修改／10新增）與最終已測、已下載回驗的Drive快照相同；一次non-force更新main後已讀回commit／parent／tree。文件另用[skip ci]。

唯一 **CI106／36472872816**，push／attempt1／exact I；最後觀察in_progress／conclusion=null，provider updated **2026-09-28T19:31:56Z**。不長poll、不rerun／dispatch／重送I/H/G。I原生修復及部署未證明。

## 本批實作與完整驗證

只改cpu-raster.ts與cpu-scene.ts兩個runtime檔：展開三個原半平面逐列邊界；透明度／cutoff先於RGB，略過被丟棄片元的色彩計算；重用frame-local座標、法線與點光源向量。保留原浮點運算、像素、深度、覆蓋及工作計數。沒有降低解析度／取樣品質／記憶體門檻，沒有改State、時鐘、input、碰撞、native routes／waits／captures／assertions／goldens。不是新美術或動畫啟用；H模型、G NPC及held prologue／母親家具均保持。

最終完整 **Node3590／3590、Python633／633、assets／typecheck／quality schema／build全過**；37專屬Node涵蓋4000隨機三角形、17場景、CI105兩個既有位置及兩種取樣模式的整張CPU畫面。708個H程式、703受掃描原輸入保持。I→H SOURCE-only inverse及前代傳遞不處理native／image／State。

傳輸曾產生兩個未引用的錯誤Git blob，hash不符即擋下，未進commit或main。新I宣告改小型精確context hunks後，保留同九個H SHA，再跑完整Node／Python／build全套。最終全測前已記錄727檔hash，完成後全部一致；早期run／包／傳輸紀錄另存，不倒填成最終版。quality30/100仍是舊review，非I新分數。

離線543×362四組交錯H/I量測中位draw減少約9.4%–20.6%，像素與工作計數一致；只是此容器量測，不是browser FPS、真機接受或CPU路線已修好。

## CI105 failure與Pages99 skipped

CI105／36463822283 exact H failure，updated2026-09-28T18:52:04Z；Pages99／36468216778 skipped，updated18:52:14Z。CPU rescue reunited／truce雙人z7.6，原route1210→1523共313ticks>309；兩人已在<.12，但預算仍失敗。16FPS記錄不能隔離渲染／排程／傳輸根因。四原ZIP、717source、四ledger／63entry與兩張靜態WebGL圖限定核對後存Drive且回下載；無H playable／部署，不擴為全motion或藝術批准。

## 持久交付與下一步

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。I最終包 **1rQFMxpJqWT26Z8lKM2hiHYNcOwSmK68D**／Chrono-VQ04I-production-batch.zip，1689278bytes，SHA256 **24655f9a0f7afc929569e0cf3a7075c7e42fa54cf5f2a8efcfa785a9165132a0**；60manifest／727snapshot／19delta／完整logs。2026-09-28T19:31:20.092344Z已真正下載核parent／size／SHA／CRC／全部manifest／snapshot／delta，之後才push。早期同ID包已取代，非平行candidate；program-vq04i.tar.gz不含docs／node_modules，不覆蓋最新main文件。

先接CI106原始結果，驗證不變的CPU rescue時間預算及後續trial／取樣／持續觀察，再接Pages exact CI與artifact部署；若失敗沿真實terminal續修，不重送舊source。成功後回到實際美術主線。112NPCwalk／256combat仍staged，全T03–T08、全動作death、構圖尺度、縮尺地圖、合法完整音訊／聆聽／原速／真機／長時段不縮。最後已審查部署仍E／CI102／Pages96；CI104/105 failure、Pages97 failure及98/99 skipped保留。全部品質批准false，newScore=null，releaseBLOCKED。No localbrowser／native造數；ROM/media/fonts/credentials私有。
