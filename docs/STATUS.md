# Status — VQ03N published / CI85 in progress

唯一 authority：本文件、TODO、handoff/IMMEDIATE_CONTINUATION、evidence/T05_ANIMATION_CHECKPOINT.json。Repository **KartChang/ChronoTrigger_reMaster**，唯一 **main**、singleAI、non-force。Root **T05-early-visual-cohesion**，唯一 development terminal **T05-field-foe-action-animation**。

## 現在位置

**VQ03N／0.9.61 已一次發布並回讀**。Source **517426f3979244ce9ae2bcddc5a0518533e1500b**，root tree **bbea6d5ff42cd634518b61b5bf78d6003e46e5e2**，parent 文件 HEAD **16bcb048c107d1c3b073fddbed936d14c32d4503**。21 個 source/tests/build/workflow 變更，遠端四個程式 subtree 與已測封存版本完全一致；source 提交保留當時 main 的最新 docs，沒有用 M archive 的舊進度覆蓋。

唯一 matching **CI85／36195520068**，workflow360357259／.github/workflows/ci.yml，push／attempt1。回讀為 **in_progress／conclusion null**，provider updated **2026-09-25T22:12:10Z（台灣2026-09-26 06:12:10）**。Exact source 全 event／全 state 共1 run；不是已通過，也不是失敗。沒有未發布 candidate，不另外 dispatch、不重送 N。詳 **evidence/CI85_CHECKPOINT.json**。

最新已接受基準仍為 **M source32672b15a8df76ff243f7840ef95a9b8b817a052／tree e2584ffecb08463567c192e94aa6a9840cf2658a、CI84／Pages78**。CI84_ACCEPTANCE／CI84_CHECKPOINT 保持 closed/accepted；本輪沒有查舊 run、重算其 ledger 或改寫原報告。M及更早批次不重送。

## 本批完成的實作

真實 field foe 出手在原 damageAlly 事件附上敵人 index／simulation tick／origin／target；僅 canyon／forest，不能由被打的人猜攻擊者。傷害、ATB、死亡時機、碰撞及存檔 schema 沒改。新增 imp-action.ts 的 strike／follow-through 兩個手臂姿態（frame4/5），保留 M frame0–3、24×32、臉／腳／C配色；不是預判蓄力、方向移動或完整死亡動畫。

FieldEnemyMotion 增加只讀、最多24筆的實際 texture RGBA 動作歷史；保留同 tick/cache、reduced原frame0、隱藏／死亡停更、rewind/rebase/dispose。歷史記錄不是 framebuffer，也不是與後續PNG同步的證明。src/imp-motion.ts、render.ts、pixel-art.ts、InputBoundary及held prologue保持原bytes。

新增獨立 native 路線，原 opening／CPU／救援／審判腳本、原按鍵等待截圖斷言不改。新路線以相同前段正常輸入抵達山道後，P1普通攻擊令48HP→18HP，再等原ATB敵方出手；只讀核 frame3 與同一事件 frame4/5。**尚待 CI85 原始證據，nativeRecoilVerified=false／nativeAttackVerified=false。**

## 已完成測試與雲端回讀

Frozen21檔完整 **npm run check exit0：2360Node／0fail／0skip，asset/typecheck/build通過**；完整Python **434pass／0fail**。新增27Node＋10Python已含總數。四場景與exact M core逐tick規則比對、實際離線CPU texture、致命/敗北/save、負向事件、pose/快取/生命週期及嚴格source inverse回歸通過；均不是native證據。原始早期失敗logs保留，不放寬門檻。詳細 **evidence/VQ03N_TESTED_BATCH.json**。

指定Drive **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**：**Chrono-VQ03N-field-foe-action-tested.zip／1G_CAXzv-aWc18UzKO3bNWafAhTbecnd2**，**1072604bytes**，SHA256 **d6aa83145205e835a6ba0732b336c625edf6da194f2bcef37f71af11027d63d1**。已實際下載核parent/size/hash/CRC、31manifest及510快照檔hash。509非文件inputs＋原THIRD_PARTY；沒有node_modules/ROM/font/credentials。不是publishedGitarchive或最新docs；包內prepublication false/null是封裝歷史，不授權重送。CI85 raw artifacts尚未取得／雲端回讀。

## 直接接續，不重驗舊批次

先讀本文件＋T05_ANIMATION_CHECKPOINT.remainingWork。CI85仍queued/in_progress就保存接續點，不輪詢至中斷。完成後先核exact N action report／positive RGBA／原PNG與原CI主報告及全旅程，保存原始ZIP與matching Pages來源及HTML證據，再寫有界接受。失敗只處理真正terminal，不把缺證據當成任意重做M的理由。

完整方向移動／攻擊受擊死亡動畫、全遊玩證據仍開放；其後為人物植物道具尺度與原作構圖、山道／法庭壓縮及樹列重疊、完整合法音訊與聆聽、原速走位／淡化／viewport舒適性。前段品質優先。無新score、全動畫、美術、原速、音訊聆聽、真機、長時間或全遊戲認證；release仍BLOCKED。

## 固定範圍及限制

T03完整規則／版本／拓樸／數值；T04完整成長報酬掉落經濟道具飾品學習換人雙三人技；T05全美術建模動畫合法音訊；T06全部時代主支線結局，2300抵達非完整未來；T07整體>=90／各面向>=80%、required assets／five gates／zero critical與真機input/FPS/frame time/load/memory/background/save/audio；T08每批完整測試、一次source、matchingCI及原產物雲端回讀。不得縮小。

保留TS/Babylon/esbuild、fixed ATB、A*、InputBoundary、P1/P2/自主第三、v1–v8。Held VQ01Z／母親家具不得提升或間接替換；**prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser／native game/time/save/collision造數；不放寬<.12、原tick、單一30秒、250ms/256或CPU畫質/記憶體門檻。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config或bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM及原媒體／字型／憑證不公開。所有成果存指定雲端並回讀；文件[skip ci]。CI77/75維持failure，CI71歷史accepted=false不回填。
