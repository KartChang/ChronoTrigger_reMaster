# 功能進度 — Q 受擊朝向連續性已發布，CI88 待原生驗證

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main，root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。最新source **7cf434e43a2ec4d791ec45720e52a84938adb3b5**／tree **ff3530b61bff361b8e7c83150f80645608c86a2f**，**VQ03Q／0.9.64**；唯一CI88／36234759501最後in_progress/null。沒有未發布candidate；Q尚未原生接受。

## 已接受基礎

M四姿態、N真實敵人出手兩姿態、O身體回應與獨立24tick死亡殘影、P真實角色出手朝向及保留down clip均不重做。CI87接受支持P兩次真實出手／8材質畫格，以及N/O正向觀察；**P角色原生完整倒地仍沒有樣本**。CI87_ACCEPTANCE為最新bounded收據。該次只有action08/09兩張fullsize PNG審查，無其他圖或影片播放／聆聽，不能當完整觀感核准。

## Q本輪實作

新增party-reaction.ts，透過既有party-combat-motion.ts接線。只有精確、唯一、活著且啟用的角色被真實交付hit擊中，才保留上一個已實際draw的朝向。不是從target猜attacker；不新增origin、不改ActorTimeline/PosePlayer、原48×64角色圖、core、render.ts、傷害/ATB/死亡/碰撞/save。

未draw、初次已死、近似或重疊目標、outgoing/guest動作、heal/combo、inactive/lab等不產生虛假方向。連續實際hit按交付tick更新；同tick不累加。出手中斷→hurt保持真正已畫朝向，cast/down中斷不恢復舊受擊；reduced/pause/rewind/rebase/identity/dispose清理有回歸。最多24筆實際48×64 cell指紋，零新增GPU資源，history不是framebuffer同步。

## 測試與未驗證邊界

完整 **2530Node／0fail／0skip，474Python／0fail**，新增65Node＋17Python含在總數；asset/typecheck/build通過，535inputs前後hash一致。三viewport實際CPU繪圖在受擊換目標時與P不同，結束逐像素恢復P；獨立Python核離線2完整reaction／8cells／3differentFallbackSamples。這是離線fixture，不是native。

Q native suffix只在原N/O/P全部inputs/waits/captures/assertions之後加只讀observation/report；原buildchecker預設仍嚴格，Q傳明確expected_build。**nativeReactionVerified、nativeSelectorChangeVerified、nativePartyDownVerified皆false**，須等CI88原始證據；不造數、不改門檻。

## 保存與後續

Q已測zip **16P0lwUaO1ku_2e4AhAmVTPUEfundpJj_**／1127875bytes／SHA2562dd093d6a6256073fe468b07fc6ade11b140644f6575b1cb12d9a1eff11d4d25；41manifest／536snapshot實際下載回驗。Source18檔已一次發布與tree回讀；正式狀態以STATUS/checkpoint為準，不看zip封裝false/null重送。

只接唯一CI88原native/原旅程/Pages/原ZIP雲端回讀，再續全部角色敵人完整動畫及前段尺度構圖、壓縮山道法庭、重疊樹列、完整合法音訊與聆聽、原速舒適性。完整T03–T08不縮，releaseBLOCKED；無新score、全動畫、美術、原速、聆聽、真機、長時間或全遊戲接受。原held/no-local-browser/native-state/CPU/tick門檻保持。
