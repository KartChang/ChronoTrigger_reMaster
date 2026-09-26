# 功能進度 — R戰鬥呈現時鐘已發布，CI89待原生驗證

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main，root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。Published **R／0.9.65** source **2175dba2fde6e58bcd0548dc750b16a4eeded319**／tree **310ca4ddb5ae78db3279f6c61d1c9017a30f039c**。唯一CI89／36249382768，最後queued/null（provider2026-09-26T14:41:50Z）。沒有未發布candidate，不重送R。

## 已接受基礎

M四姿態、N真實敵方出手、O有方向身體回應及24tick死亡殘影、P角色真實出手朝向/down clip、Q保留實際已繪製受擊朝向維持。CI88／Pages82已boundedaccepted/closed，Q1完整受擊/4cells，但0differentFallback及0party-down。原N/O/P正向、十ledger173列/source/HTML與七ZIP回驗保留；只看action06/09兩張fullsize，無影片/原速/聆聽/真機。不可擴張接受或重驗已結案工作。

## R本批實作

ExactQ離線重現：simulation tick143不變，重複draw仍使突進、刀光與傷害文字前進。新增combat-timing.ts透過render.ts接線，按真實Effect交付tick算絕對age，修復render-delta累加；不造action/time。原.42秒/.55距離突進、.6秒刀光曲線、>1.25秒文字到期與.8上升保留。

同tick/pause不動；reduced零突進、隱藏刀光、必要文字靜止，切回按同tick還原phase。受擊/死亡/停用/模式/identity更換中止突進，不移動邏輯位置；影子跟隨實際脚底。Rewind/rebase/scene/reset/dispose清理引用與ownedeffect資源；最多24筆實際source/transform/expiry歷史、零新增GPU物件，history不是同步framebuffer。

Runtime只新增clock並修改render wiring；core、ActorTimeline/PosePlayer、HD圖、M/N/O/P/Qcontrollers、InputBoundary、傷害ATB死亡碰撞v1-v8save及原workflow不改。Native suffix僅在原N/O/P/Q全部路線按鍵等待截圖斷言後新增唯讀JSON/檢查；原checkers用明列R expected_build，預設舊build仍嚴格。

## 測試及證據界線

完整 **2576Node/0fail/0skip，490Python/0fail**；新增46/16已含總數；asset/typecheck/buildpass、543inputs前後一致。三viewportCPU實際actortriangles正向差異、same-tickframe一致和效果到期0資源；獨立Python核1source/9rows/1completecombinedevent。這些都是離線，CPU測試canvas不畫文字/curve，不能宣稱stroke/numbernativepixels。

初次fullcheck被工具180秒上限中斷，同版本完整重跑pass；partiallog與早期working包保留，不調門檻。20檔remote程式樹與frozen包匹配後一次發布。**nativeCombatTimingVerified=false；nativeSelectorChangeVerified=false；nativePartyDownVerified=false**，須原始CI89證據，不把檢查器存在或unitpass当nativeacceptance。

## 保存與後續

R包 **14LzErkCJX_pWgJt5VqEyxZLdufdbXDJE**，1291610bytes，SHA2561f04bea09c75c3185144d9e557bd46380e7b3603a26b1e5224b6d30dafdd63bc，43manifest/544snapshot已實際下載回驗。CI88包 **1vLwhZttA4zvkXtSSD2jyElt2deHy6fZg** 已驗回，詳細DELIVERY_INDEX。最新main checkpoint優先於包內歷史false/null與舊parent。

接CI89 timing及完整原報告/Pages/原產物回讀；之後續全角色/敵人方向與完整動畫、尺度輪廓/構圖、山道法庭壓縮/樹列、全合法音訊/聆聽與原速舒適性。完整T03–T08及真機品質門檻維持；2300非完整未來，無新score，releaseBLOCKED。所有mainonly/nonforce/heldprologue/no-localbrowser/native-state原門檻與私人素材限制不變。
