# 功能進度 — N真實出手姿態已發布，CI85原生證據待驗

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／T05_ANIMATION_CHECKPOINT。main only，root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。最新published **VQ03N／0.9.61** source **517426f3979244ce9ae2bcddc5a0518533e1500b**／tree **bbea6d5ff42cd634518b61b5bf78d6003e46e5e2**。唯一 **CI85／36195520068**，push/attempt1，最後provider觀察in_progress（2026-09-25T22:12:10Z）；未有native接受，沒有未發布candidate，不重送N。

## N本輪已完成

原core敵方hit追加真實敵人來源index/tick/origin/target，只作用山道/森林呈現。Damage/ATB/死亡/碰撞/save不改。新增strike與follow-through frame4/5兩姿態；M0–3逐byte保持，原24×32、Cpalette、臉腳及render.ts不動。這是既有傷害交付後的動作，不是預判蓄力或完整方向死亡動畫。

FieldEnemyMotion保留cache、固定tick、reducedframe0、hidden/dead停更、rebase/dispose，增加最多24筆實際textureRGBA動作歷史。來源缺失、偽造/過期/矛盾事件不呈現出手。History與cause回傳detached副本；不是原生framebuffer或PNG同步證據。

原native路線/按鍵/等待/截圖/斷言保持；新獨立normal-input路線做非致命30傷害（48→18）及自然敵方ATB，要求正向livingframe3与同action4/5。**nativeRecoilVerified=false、nativeAttackVerified=false**，等待CI85原始report核對，不拿單元fixture勾選。

完整本輪 **2360Node/434Python，0fail，Node0skip；新27Node+10Python**，asset/typecheck/build通過。Exact M core逐tick規則與save比對、CPU實際texture（離線）、快取/資源生命週期與負測試通過，完整與早期失敗logs保留。21檔已合成一次source發布/回讀，四程式subtree等於frozen已測版本。這不是全動畫或美術認證。

## 已接受的M，不重做／重驗

M四手臂姿態、drawImpframe0、reduced/cache/hidden/dispose基礎保留。M來源32672b15a8df76ff243f7840ef95a9b8b817a052、CI84/Pages78限定範圍接受仍為最新已接受基準；CI84_ACCEPTANCE、CI84_CHECKPOINT closed/accepted不改。原native山道[0,0,0]／森林[1,0]／opening[2,2,2]僅證明0/1/2，hurtTick全null是證據缺口，非已證明故障。本輪未查CI84或重算其ledger。

既有100聯絡表／3fullsize、181.76秒影片364個2fps樣本仍非原速／聆聽／真機；CI綠勾不能關閉完整品質。M2333Node/424Python為歷史批次，不混算本輪新增數。

## 持久交付及接續

指定folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**；N包 **1G_CAXzv-aWc18UzKO3bNWafAhTbecnd2**（Chrono-VQ03N-field-foe-action-tested.zip），1072604bytes，SHA256 **d6aa83145205e835a6ba0732b336c625edf6da194f2bcef37f71af11027d63d1**。已下载核parent/size/hash/CRC/31manifest/510snapshot。包內封裝前false/null不是重送指示；当前狀態看GitHub main。詳VQ03N_TESTED_BATCH與DELIVERY_INDEX。CI85 raw artifact尚待保存回讀。

先接唯一CI85的source-bound positive evidence、原三jobs與全旅程/ledger，再保存原始ZIP與matching Pages證據。Pending不長時間輪詢、不dispatch。其後完整角色敵人方向/移動/攻擊受擊死亡與全遊玩證據，尺度輪廓／原作構圖／山道法庭壓縮／樹列重疊、完整合法音訊與聆聽、原速走位淡化viewport舒適性保持開放。

T03完整規則版本拓樸數值、T04完整成長經濟掉落道具飾品學習換人雙三人技、T05全美術建模動畫音訊、T06全時代主支線結局、T07整體>=90／各面向>=80%及requiredassets/fivegates/zerocritical與真機測量、T08完整matchingCI／原產物雲端回讀不縮；2300非完整未來。無新score，releaseBLOCKED。STATUS所有held/no-local-browser/私人素材/native state時間CPU限制沿用，CI77/75failure與CI71歷史accepted=false不回填。
