# 功能進度 — S修道院敵人姿態已發布，CI90待原生驗證

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main；root T05-early-visual-cohesion，terminal T05-field-foe-action-animation。Published **VQ03S／0.9.66** source **f14c9ac42581b80d6028bb00fad0fbcf5695f5eb**／tree **f2192325d0bb13d9f04be5016762ff1c579f07a4**。CI90／36261482173最後in_progress/null；沒有未發布candidate，不重送S。

## 已接受基礎

M四姿態、N真實出手、O身體回應與24tick殘影、P角色出手朝向/down clip、Q真實受擊朝向、R simulation-tick突進刀光與數字保持。CI89／Pages83是最新限定範圍接受基準，詳原CI89_ACCEPTANCE；本次不重驗。P完整原生倒地與Q selector-change仍缺，不因後續批次回填。

## S已完成

新增rescue-enemy-art.ts、rescue-enemy-motion.ts，render.ts接線；core僅擴既有enemyAction metadata至rescueMap。Naga/Hench/Yakra保留原靜止與Yakra原準備畫格，新增有限手臂姿態。真實攻擊依attacker index/tick/origin/target，受擊依實際hit，不猜來源／不造事件；傷害ATB死亡碰撞v1-v8不改。

固定tick攻擊姿態2/3/1、存活受擊4；same-tick/reduced/hidden/dead/cache/identity/rewind/rebase/dispose與24筆有界觀察回歸，無新增GPU資源。原rescue-art、M–R controllers及heldprologue保持。

原rescue screenshots02/06/07之後追加三個只讀觀察，同一腳本由既有WebGL與CPU lane使用；不改keys/routes/waits/captures/assertions/workflow。材質history不代表同步framebuffer或完整原速動畫。

## 測試、恢復及待驗界線

中斷前final2684Node／0fail／0skip、509Python／0fail；108Node＋19Python新增已含總數。Asset/typecheck/build通過。三敵種×三viewport離線CPU真實材質/像素與15PNG CRC/fullRGBA驗證已在原包；不是native。17檔42hunk source-only inverse保留原斷言，不轉native state/report/pixels。

本次只恢復final包並核77manifest、554snapshot、27changes及程式樹／原始final logs，沒有重跑或重做S。原初期失敗logs保留。27檔一次source發布，remote src/scripts/tests吻合已測版。

**nativeRescueEnemyMotionVerified=false**，需CI90原始報告及原始產物雲端回讀，不能由checker存在或unit通過推定。Fullanimation/art/originalspeed/listening/device/longsession/wholegame均未核准，無新分數。

## 交付與後續

指定Drive同ID **1QG4Ws5XaOT0P_D9J4tndKO8C4mpco5M7** final包1611479bytes／SHA256dab441851eebd14b87c8a2485241e7c32cd769ad3ebdcc56b40c9fac8898983a，本次實際下載回驗完成。詳細VQ03S_TESTED_BATCH／DELIVERY_INDEX。

先CI90，再按TODO續完整方向動畫／全遊玩、尺度輪廓構圖、山道法庭壓縮樹列、完整合法音訊聆聽及原速真機舒適性。完整T03–T08與原native/state/heldprologue/private素材限制維持。
