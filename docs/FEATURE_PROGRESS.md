# 功能進度 — v38，D已部署，E作者程式已恢復待全測

權威STATUS／TODO／checkpointv38。已發布source **4620737f6434043dcea3cb8dcc63ea85e9dbf9c2**／D0.9.77；CI101及Pages95 completed/success，限定review恢復入庫；沒有active validation。本輪只更新文件與Drive工作包，沒有新遊戲source或CI。

## 已發布基礎

D四名角色48×64的idle/walk/ready/victory四方向256欄位、山道後岸與A/B/C環境保留，已測3292Node/613Python不用重跑。受保護attack/cast/hurt/down另256欄位仍原圖；heldhome、原時計／geometry／core／camera不改。詳PRODUCTION_ART_VQ04D及既有收據。

## E恢復進度

九個原程式／建置變更已找回並保存完整669檔工作snapshot，D其餘660檔原byte。七類NPC336作者欄位與exact-source borrowed-upload adapter草稿接線已存在；28ambient格有runtime映射，308direction/walk/greet只匯出，尚無E原生／部署證據。四主角256combat欄位作者API已恢復且匯出，runtimeApplied=false，不列為啟用完成。

本次typecheck／check:assets／character export通過，11PNG／592cell hashes與作者來源一致。完整E Node／Python／build／current-app整合與較晚完整測試logs未取得；不得從聊天成功說法回填。下一步補E tests與source-only preservation，完整回歸後一次發布。

完整包1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr已在指定folder並下載回驗40manifest／669snapshot。兩張原有OFFLINE作者圖與11實際匯出素材都存包內，不是在對話交圖，也不是CI原生畫面。

全party/enemy/NPC方向動作與死亡、概念級場景尺度構圖、原作地圖、合法完整音訊聆聽、原速／真機／長時段仍open。art/fullAnimation/wholeGame=false，newScore=null／releaseBLOCKED；完整T03–T08不縮。
