# 功能進度 — v39，VQ04E生產美術與完整離線回歸

權威STATUS／TODO／checkpointv39。版本0.9.78的source、唯一matchingCI與實際Pages狀態以權威checkpoint為準；不得把source push或離線通過當成已部署與原生驗收。完整測試與雲端回驗記錄見DELIVERY_INDEX。

## 本批完成範圍

七類NPC336作者欄位保留並接入28ambient欄位；308direction／walk／greet僅匯出，不增加NPC導航。八個既有NPC物件使用真實owned DynamicTexture update、exact-source逐byte辨識、名稱／root／章節／尺寸／獨占綁定；未知來源拒絕，原update參數與語義保留。

補強換owner／material／texture／尺寸、切場held還原、dispose清理、靜態格不重上傳、12binding與294912bytes上限、0新增GPUtexture。作者／592格PNG同源、正式ArtDirectedWorld、12非target／held章節一致性與前代SOURCE-only保護納入完整回歸。兩筆新增asset register的evidence欄位修正，品質門檻不變。

D四角色探索／ready／victory四方向256格、另256原combat格、A/B/C環境与山岸、heldhome／母親家具、core／geometry／camera／clock均保持。E四主角attack／cast／hurt／down另256作者格仍runtimeApplied=false；沒有透過假像素或改native golden啟用。

## 仍待完成

唯一matchingCI原生瀏覽器與部署限定review依checkpoint接續；離線測試不是原速／真機批准。完整party／enemy／NPC方向動作與death、概念級前段場景尺度／遮擋／構圖、原作縮尺地圖與城鎮切換、合法完整音訊與聆聽、原速／真機／長時段仍open。

Tank／Yakra完整native death、Hench outgoing、P down、Q受擊selector-change樣本缺口保留。CI93／95／98仍failure；CI101／Pages95的D有界接受沿用不重跑。

art／fullAnimation／wholeGame等完整批准false；newScore=null，releaseBLOCKED。完整T03–T08分母不縮，2300抵達不是完整未來。No localbrowser、native State／時間／save／collision注入；所有成果只在main或指定Drive持久交付。
