# 功能進度 — v43，VQ04I CPU熱迴圈優化

權威STATUS／TODO／checkpoint v43。I0.9.82 source e6512e40a48d68df1dab351a8151d1e40b637a36已發布，唯一CI106／36472872816最後in_progress。沒有新NPC導航、戰鬥素材啟用或新的美術批准。

## 本批工程完成

cpu-raster三個保守逐列邊界展開、alpha/cutoff先於RGB處理、cpu-scene frame-local座標／法線／點光源向量重用。原運算結果、像素／深度與計數、解析度／取樣／資源門檻保持；不寫State／時鐘／input／碰撞。H100建築件與10法庭件模型、G224方向ambient/greet、全部原圖與held母親家具未改。

完整Node3590／Python633及assets／TS／quality schema／build，在新SOURCE-only宣告縮小後再次通過；37新增Node涵蓋隨機三角形、材質／光線與17場景／原CI105兩位置完整CPU畫面。最終全測前後727檔一致，708H程式原byte。四組543×362離線draw中位減少9.4%–20.6%，不能換算成原生FPS或真機批准。

## 原生與產品仍未完成

CI105 exact H在CPU rescue雙人路線313ticks>309失敗，兩人位置進<.12不等於時間合格。四原ZIP與限定來源／兩靜態圖已入庫；Pages99 skipped，無H部署。I是否解決此terminal須CI106真實結果，不從離線推定。

112NPCwalk仍staged，256party combat仍runtimeApplied=false。完整party/enemy/NPC方向動作death、場景尺度遮擋構圖、縮尺地圖／城鎮切換、完整合法音訊及聆聽、原速／真機／長時段與全T03–T08不縮。原生缺口與失敗歷史保留；全部完整品質批准false，newScore=null，releaseBLOCKED。持久包、原始logs及回驗見DELIVERY_INDEX。
