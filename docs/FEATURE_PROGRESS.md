# 功能進度 — Z 敵人動畫生命週期已修正，CI97中

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT **v33**。**Z0.9.73 sourcefa109ffa446f69881745b2b2c09b78c494f4e2fc**，treee1724fc3c1ff13979aef7ae62c86331d6fb5f6ad；16source/test合批完整測試後一次發布。matchingCI97/36330900305最後in_progress（providerupdated2026-09-27T15:48:28Z）。沒有Z原生或部署接受。

## 本批實作增量

FieldEnemyMotion 不再把slot index當成持久敵人身分；attack/hurt cause綁實際Enemy，替換、移除、已觀察死亡後復活、state/chapter/rewind清掉失效動作。既存physical texture cache及未變slot不受影響，same-tick draw不重複upload。缺少/null origin/target先拒絕，避免不完整effect讓繪製中止。

FieldEnemyBody 換owner還原舊anchor並清old displacement/live witness/pending；已生成死亡copy取消釋放。Field及Rescue同owner恢復HP>0時立即取消copy，不讓活人帶著舊死亡殘影。記錄cancelled，不伪稱24tick完整expiry；原HP0立即隱藏、正常交付、24tick/singlecopy/資源上限不變。Naga/Hench/Yakra、山道與森林五場景控制回歸覆蓋。

同一組38項production World離線回歸：原Y9pass29fail，Z38pass。其他既有正反例仍通過。完整 **3068Node/597Python/asset/typecheck/build**，新增49Node（38行為＋11來源）/3Python。595未改程式輸入以canonical aggregate及完整逐檔map保留；Z→Y→X來源逆轉保留原expected hashes且拒絕缺hunk/重複/額外修改，不接受native資料。

## 已接受與仍未接受

Y **CI96/36324453650、Pages90/36326834462** completed/success，新原檔/source-cell-transform/部署連續性有界接受。Pages ledger選Ysource及CI96playable10933304554；HTML5804622bytes逐byte相同。六原ZIP/7manifest已雲端下載回驗；收據evidence/CI96_ACCEPTANCE.json。這不代表全部動畫、美術90分、真機或Z接受。

Tank/Yakra完整death、Hench outgoing、P observedFalls、Q differentFallbackSamples仍open。Y WebGL致死尚排隊；CPU Tank age9/Yakra12未滿24tick，不能以增等待/改capture补足。raw可能victory停時的推測未被證實，原文未改。W/CI94/Pages88的repair-history、CPUwheel event1529、Vbody/守衛完整死亡既有接受保持closed。CI93及CI95自身仍failure，不rerun/回填。

全party/enemy方向及move/attack/hurt/down/death、前段尺度/輪廓/原作構圖/山道法庭樹列、合法完整音訊/聆聽、原速/真機長時段仍open。本輪實際查看CI96山道及法庭兩原PNG，仍prototype級，沒有新評分；未播放影片、聆聽或測真機。歷史quality30/100是更舊runtime，不是Y/Z新分數。fullAnimationComplete/artApproved/wholeGameAccepted=false，newScore=null，releaseBLOCKED。

## 持久成果與下一步

folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb：Z測試包 **1hGbOPVJPe9QnQPraMf0N83TLOZqMufk9**（3030737bytes、SHA25661f348063f0ba7e5c0d00179c769c8f8fceb80eba1ede8bdf68efbe55ace7c8e、187manifest/611snapshot）；CI96/Pages90原始review包 **1gQQduODqLkfxmfyjMgXiSAGB_67EMJn7**（88515875bytes、SHA256388c5293e822918d69592f3a3153196118b6e70aef624733e6c9a03660e3c595）。兩者已真正下載核parent/size/hash/CRC/exactmanifest，Zsnapshot逐byte匹配。成功失敗/timeout日志都保存，localbuild非部署，封裝false旗標由最新main收據解釋。

接CI97自己的新原生證據，pending不長poll或重送；然後依TODO合批續全動畫/早期品質，T03-T08完整分母、held資產、原門檻均不變。
