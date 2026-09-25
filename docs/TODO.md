# Execution TODO — T05-field-foe-action-animation / CI85 pending

Authority：STATUS／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main／singleAI／non-force。Root **T05-early-visual-cohesion**；terminal **T05-field-foe-action-animation**。

目前已發布 **VQ03N／0.9.61** source **517426f3979244ce9ae2bcddc5a0518533e1500b**／tree **bbea6d5ff42cd634518b61b5bf78d6003e46e5e2**。**CI85／36195520068** exact source、push／attempt1，最後觀察 **in_progress**（provider updated2026-09-25T22:12:10Z）。沒有未發布candidate；N不重送，不另dispatch。M／CI84／Pages78維持先前限定範圍accepted／closed，不能把N待驗混作M待重驗。

## 本批完成

- [x] 真實敵方出手只在原事件附來源index/tick/origin/target；不猜攻擊者，傷害/ATB/死亡/碰撞/save不改。
- [x] M四姿態保留；新增frame4/5出手手臂姿態及bounded24筆實際texture觀察，reduced/pause/cache/hidden/death/rebase/dispose回歸。
- [x] 新增獨立正常按鍵的非致命攻擊／自然敵方ATB native scenario；保留全部原路線、等待、截圖與斷言。這是已實作，不是已取得native正向證據。
- [x] 本批完整2360Node、434Python、asset/typecheck/build通過；新27Node＋10Python已含總數，原失敗logs保留。
- [x] 21檔一次source提交／non-force發布／遠端tree與已測檔逐內容hash一致；唯一matching CI85已確認。
- [x] N已測包1G_CAXzv-aWc18UzKO3bNWafAhTbecnd2存指定Drive，實際下載核hash/CRC/31manifest/510snapshot。

## 目前待驗與續作

- [ ] CI85完成後，以exact source原checker核原始field-enemy-action-report／recoil/action observations：活著18HP敵人的frame3，及同一真實出手事件frame4/5。現在兩項nativeVerified均false；不能以unit輸出勾選。
- [ ] 核CI85原三jobs／主報告／chooser／完整CPU600救援審判與同source ledger；成功後matching Pages來源artifact/HTML。原始ZIP／影片／source／reports／manifest存指定Drive並回讀，再写有界接受。
- [ ] 完整角色／敵人方向、移動、攻擊／受擊／死亡動畫與完整遊玩證據。先接目前field foe，不重做M基礎，不把N兩姿態當完整動畫。
- [ ] 人物／植物／道具尺度輪廓與原作構圖、山道／法庭壓縮空間及重疊樹列。
- [ ] 完整合法音訊與實際聆聽；原速走位／淡化／viewport舒適性及真機長時間證據。不能以CI綠勾或2fps縮圖取代。

## 已接受歷史，不重驗

CI84／Pages78、原十ledger173列／589原檔、100聯絡表／3fullsize、181.76秒原片364個2fps樣本的限定範圍接受沿用CI84_ACCEPTANCE；不是原速聆聽或全遊戲證明。M native原frame0/1/2已驗，所有原hurtTick=null是證據缺口，不是已證明故障。本輪僅為恢復source下載核舊整包hash，未重跑CI84驗收。

## 完整T03–T08及限制不變

T03完整規則版本拓樸數值；T04完整成長報酬掉落經濟道具飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06所有時代主支線結局，2300非完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08完整測試、一次source、matchingCI、原產物雲端回讀。無新score，全遊戲release仍BLOCKED。

沿用STATUS全部held/no-local-browser/私人素材/native state與時間CPU門檻。CI pending不長時間輪詢，不建branch/PR/parallel candidate；文件[skip ci]。CI77/75 failure、CI71歷史accepted=false保持。
