# 功能進度 — V監獄／龍戰車身體回應已發布，CI93待原生驗證

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main，root T05-early-visual-cohesion，terminal T05-field-foe-action-animation。**VQ03V／0.9.69** source **a8aeaf2414875b3ab82518e4373b69ae17d88648**，tree **2fb99bb4b30ea4f89760595519bba986f90377cf**。唯一 **CI93／36301106757**，最後in_progress/null（provider2026-09-27T06:46:57Z）；V未原生接受、沒有未發布candidate。

## 已接受基礎

M原四姿態、N真實出手來源、O field身體與殘影、P角色出手/down clip、Q受擊朝向、Rsimulation效果時鐘、S修道院姿態、T修道院身體/殘影、U守衛與龍戰車各部位姿態及真實修復保持。U／CI92／Pages86為最新既有boundedaccepted基準，原收據及原產物雲端回驗保留；本次不重驗。CPUwheel、Hench出手、完整Yakra死亡、P原生倒地與Q原生受擊換目標仍有缺口。

## V本批呈現

新增trial-enemy-body.ts並接trial-render.ts，借用原U mesh與材質，不改core/trial-rules/原圖/ATB/damage/death/collision/save。守衛依真實source起點與目標作24tick/.20出手，車體-.08反作用，車輪.10位移；龍頭維持修復姿態，不假造攻擊。實際HP-loss與origin支持18tick/.10退縮；無origin只中斷原出手，不推測方向。多目標事件不重複啟動同一來源。

四類死亡保留原HP0立即停用，另外複製一次48×64／64×64實際材質，獨立24tick縮短/淡出/釋放，max3／49152rawRGBAbytes。不是延後原死亡，也不是原生總memory/FPS數據。Same-tick/pause/reduced、hidden、owner/state reload、rewind、chapter/defeat/dispose與source-read/upload/mesh allocation失敗清理完整回歸；24筆history只代表transform/statictexture，不是同步framebuffer。

## 測試與恢復

中斷前final **2913Node/0fail/0skip、569Python/0fail**；新增65/20已包含，asset/typecheck/buildpass。582programinputs＋4rootdocs＝586frozeninputs前後一致，另THIRD_PARTY共587snapshot。三viewport、四death種類、三outgoing種類離線CPU正向像素與exact U還原；12離線PNG匯出，開發期只檢視兩張原小尺寸，無native/聆聽/真機認證。

本次不重新執行測試，實際下載final包核59manifest/587snapshot/20changes與原final logs，再將所有exact frozen檔案傳入GitHub。Remote src/scripts/tests完全匹配，20檔一次發布。初期測試失敗紀錄保留；未提交傳輸筆誤在發布前恢復exact bytes，不改測試求通過。

## 原生驗證與保存

V只於原trial六battle/victory邊界追加唯讀observations；原routes/keys/waits/screenshots/assertions與workflow不變。Exact V checker核真正source-owned offset、HP-loss、原死亡、copy及expiry；U checker保留嚴格default並傳explicit V expected_build。**nativeTrialBodyVerified=false、nativeTrialDeathVerified=false**，須CI93原始證據；勝利停表缺phase不得由改時間補成完成。

V final **1UOO0T74CcGE95AW3oswKMtxT_OmoyRaT**，1585595bytes／SHA2567ad6830ee15b83caa4b9c05daaf1674fd015a98bd75d60f85c703fb964907e7e，59manifest/587snapshot本次下載回驗。CI92原包與前代索引见DELIVERY_INDEX，原始文件保留CI93_PREVIOUS_*。包內false/null及舊parent已是歷史，不重送V。

接CI93完整原始驗證、matchingPages與原ZIP雲端回讀；再續完整方向動畫、全遊玩、構圖尺度、山道法庭/樹列、合法完整音訊/聆聽、原速/真機品質。完整T03–T08、heldprologue、原生門檻與私人素材限制不变，無新score，releaseBLOCKED。
