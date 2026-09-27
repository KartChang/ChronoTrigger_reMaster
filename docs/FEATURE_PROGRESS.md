# 功能進度 — W觀察保留與生命週期修正已發布，CI94待原生驗證

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main、root T05-early-visual-cohesion、development terminal T05-field-foe-action-animation；execution terminal T05-trial-repair-history-eviction。**VQ03W／0.9.70** source **70f9888ea0bc9c7cfb4fc8c4eeadac8cc917809a**、tree **bdac0b30a9bb53e37f12264327c607dcb9b140c5**；唯一 **CI94／36307776528**，最後in_progress/null（provider2026-09-27T08:56:24Z）。無未發布candidate，不重送W。

## 已接受與未接受的邊界

M原四姿態、N真實敵方來源、O field身體與殘影、P角色出手/downclip、Q受擊朝向、Rsimulation效果時鐘、S修道院姿態、T修道院身體/殘影、U守衛/龍戰車姿態及真正修復均保留。最新boundedaccepted仍 **U／CI92／Pages86**，不重驗。V身體/死亡呈現已實作，但 **CI93failure，沒有接受V**。CPUwheel/Hench outgoing/完整Yakra death/Pdown/Qselector-change缺口保持。

CI93原遊玩修復已發生，後續材質報告卻沒有保留head repair：tick699、headRepairs1、24rows、64dropped、0repair。ExactV離線重現真正draw2/3/1被idle FIFO移除；證明的是記錄保留缺陷，不是由counter證明遺失原生畫格。原報告、失敗與後續gates未執行的界線均保留，詳CI93_TERMINAL及CI93_CHECKPOINT。

## W合批修正

Runtime只新增trial-motion-history.ts並接trial-enemy-motion.ts。維持24筆總上限，先移除idle，再移除同角色/同操作已由新事件取代的row、同事件重複phase，最後才移除最舊唯一row。保留原始row物件資料/來源/tick/actualcell，沒有造幀或新事件；新增policy與四類eviction counter，披露非連續timeline。

Victory保留上一場實際樣本直到新owner進場；同一State更換encounter物件不會繼承舊repair證據。借用mesh dispose清除自己的chapter/index紀錄。Same-tick/reduced/hidden/reload/rewind/chapter/dispose/inspect複本均有回歸。原畫圖、poses、GPU物件數、core/trialrules/body/傷害ATB死亡碰撞save不變。

既有head repair、outgoing action與positive body斷言仍必須通過；W只加policy/counter contract與明列expected_build，原native路線按鍵等待截圖斷言不放寬。歷史source-only inverse完整恢復V的原hash，不轉換native state/reports/pixels。History可證明實際保留的draw觀察，但不能宣稱連續播放或同步framebuffer。

## 完整測試及保存

本輪完整 **2950Node/0fail/0skip、582Python/0fail**，新增37Node/13Python含總數，asset/typecheck/buildpass。594frozeninputs＋THIRD_PARTY共595檔前後hash一致。三viewport/drawcadence的production CPU對照驗證：W保留原已draw修復cells，V丟失；核心state、畫面pixels與資源數完全相同。這些全部是離線開發測試，不是native/原速/美術/真機認證。

全20檔一次發布，src/scripts/tests匹配已測版。容器於傳輸期間重置，由同一已回驗雲端包恢復exact檔案；未重做W或再跑全套。Wfinal **1bbUqQj0BFZ6CTsGTDntQMb2ySU9KV_rS**，1298160bytes／SHA25603502f61fffcc06307f868026af30f6c4ca28aefbbdfbdcbe1194ade234d22c6，43manifest/595snapshot下載回驗。CI93failed原包 **1pz9pcUPtzI694DDAOaHd64hlmMo81oPO** 同樣下載回驗；詳DELIVERY_INDEX及VQ03W_TESTED_BATCH。

## 接續

CI94原生retention／Vbody及完整native journey、CPU與matchingPages原產物仍未核，nativeRepairRetentionVerified=false；只接唯一matchingrun，不重送W或重跑CI93。之後續全角色敵人方向及完整動畫、全遊玩、構圖尺度/山道法庭/樹列、合法完整音訊/聆聽/原速/真機。T03–T08完整分母與原門檻不縮，heldprologue及私人素材限制保持；無newscore，releaseBLOCKED。
