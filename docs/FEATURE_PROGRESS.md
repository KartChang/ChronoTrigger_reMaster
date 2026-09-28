# 功能進度 — v42，H場景比例已發布，CI105待驗

Authority STATUS／TODO／checkpointv42；H source fb57de8eb15fc3e46e078a946766ed42e59611e4／0.9.81。這輪恢復上次中斷的已發布成果與原測試紀錄，沒有另寫遊戲source或重開CI。

## 已發布工程

H四棟托魯斯建築100結構件高度.82，法庭被告席.50／法官台.72及八飾線，共110既有件以私有Geometry塑形。原XZ、camera、State、碰撞、UV、材質和actor pixels保持；exact layout／owner／dispose／資源上限均有專屬測試。不是完整美術接受。

原Node3553／Python629、assets／TS／quality schema／build通過；52H專屬Node、15非target／held CPUframe一致。717source／25delta與最終Drive包及Git tree已在本輪核對。原失敗／中斷logs保留；離線ray改善不是native／真機證據。

F路緣木作、G224 NPC四方向ambient/greet及D探索256格保留。112NPCwalk／導航與256party combat仍未啟用，沒有把來源格數當完整動畫。

## 未完成與接續

CI104 failure、Pages98 skipped，沒有G playable或部署；H唯一CI105／36463822283最後in_progress，H是否通過相同雙人route預算尚待原生結果。Pages exact trigger selector尚無成功部署證據，最後已審查部署E／CI102／Pages96。先接CI105，不重跑CI104或另開candidate。

仍需完整party/enemy/NPC方向動作death、建築招牌居民可視性、山道法庭樹列家具構圖、縮尺大地圖城鎮切換、合法完整音訊與實際聆聽、原速／真機／長時段和全部T03–T08。Tank/Yakradeath、Hench outgoing、Pdown、Qselectorhurt樣本缺口不造數。全部完整品質批准false，newScore=null、releaseBLOCKED。
