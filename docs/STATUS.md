# Current status — CI81 accepted; canyon presentation continuation

## 唯一目前位置

Repository **KartChang/ChronoTrigger_reMaster**；main only／single AI／non-force。Root **T05-early-visual-cohesion**。本次由最新 main **587e14d6671513e08c74e66711d58797d4f1b855** 恢復。該 HEAD 已新增 **docs/evidence/CI81_ACCEPTANCE.json**；舊 STATUS、TODO、handoff 與 CI80/81_CHECKPOINT 的等待敘述因中斷尚未同步，不能據此重跑已接受的 CI80／CI81 或重送 I／J。

目前正式 source **235fcf143a853cdeb8599b3f8703b090542eda5a**，root **b2741de9f8c759b27139174a996167c7ed74f1db**；**VQ03J／0.9.57** 已發布。最新 main 相對此 source 只有兩份新增文件，沒有較新 runtime。CI81 **36125796673**／Pages75 **36128075047** 已按 CI81_ACCEPTANCE 有界接受；本輪不重验它們。沒有本輪新 source、CI82 或新原生驗收。

## 直接續作

唯一 development terminal：**T05-canyon-material-clarity**。依 CI81_ACCEPTANCE.nextAction，改善山道地面密集亮紋、磚塊狀岩壁及草面辨識；保留原地形／幾何／碰撞／鏡頭、C 小怪配色、遊戲數值、走位與原生斷言。合批相關 renderer／painter／匯出與回歸後，只發布一次 source，再辨識 matching CI。不重做 J 法庭飾面與森林樹冠變化，不提早擴後段。

中斷前 K 只見離線圖片；本轮按指定 Drive 查 VQ03K 與 canyon 尚未找到保存包，不將圖片當成已測或已發布程式。以 exact J source 恢復並續作，臨時容器不是權威。新開發尚未通過本輪測試或原生CI，不能標完成。

## 已保存的權威恢復點

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

CI81 原始證據：**Chrono-CI81-reviewed-evidence.zip**，ID **1kXO-zxI4b0Yb8ycaV6AdqZagL-ugrKnn**；90823168 bytes，SHA256 **69fe41e525c66f94bbb5b7f793434f033e024f89157aa3289baf304c44987f07**。七原ZIP及32manifest的既有驗收不重做；本輪只為恢復原檔下載並核對整包hash，匹配。

J 已測包：**Chrono-VQ03J-static-detail-tested.zip**，ID **1A4URAW8CREMtET8qTuj3LDHFQTF6x7OP**；1040492 bytes，SHA256 **95fe6a402699f196a8e38052cb6d4f505dc8aac41bb2d35f5bbef821581b2dd6**。已保存的 J 原測試2264Node／410Python、473inputs／477snapshot屬前批成果，本輪沒有重跑。包內發布前false/null不得觸發重送。

CI81視覺審查界線：102contact／3fullsize原圖；178.24秒原片356個2fps樣本／六表，不是原速播放、音軌聆聽、真機或長時間。CI77／CI75維持failure，CI71歷史accepted=false不回填。

## 完整範圍與固定限制

T03完整規則版本拓樸數值；T04完整成長／報酬掉落／經濟道具飾品／學習換人與雙三人技；T05全部美術建模動畫合法音訊，前段實際品質優先；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、required assets／five gates／zero critical與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／雲端原始產物回讀。無新分數或全遊戲接受。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。禁止本機browser、P3/ARPG/框架重造、人造native game/time/save/collision state、改原路線／tick／單一30秒／<.12／250ms-256／CPU品質記憶體門檻。Held VQ01Z／母親家具不提升或間接替換；prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules且保留esbuild hardlink，不覆舊source/config或開bootstrapCI。私人ROM／原媒體／字型／憑證不公開。所有文件[skip ci]，成果存GitHub／指定Drive並回讀。
