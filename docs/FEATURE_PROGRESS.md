# 功能進度 — v47，M已完成CI110／Pages104限定審查

Authority STATUS／TODO／checkpointv47。M0.9.86 sourcee2018f2a3752f14dc52a55517839797cac67e0c7；CI11036538709652／push／attempt1 success，Pages10436542208681 success、實際選playable11020128885。目前沒有active validation；本輪只續完證據保存與交接文件，沒有新source或全測重跑。

## 已完成，沿用不重做

四棟Truce建築8屋面UV轉向、32橫條截面.42、4屋脊上緣.60，共44件；沿用H自有Geometry，0額外mesh/texture/material/retained geometry buffer。原texture bytes、人物、State、camera、collision及held資產不變。

原完整Node3809／Python649／assets／typecheck／quality schema／build、57專屬Node／4Python、16非target/held完整frame及44模型同源紀錄不改。M→L source-only保護及原pins/native/goldens保持，詳細實作見PRODUCTION_ART_VQ04M。

本輪七原ZIP、770source與已測M快照一致，10ledger198引用逐項hash相符（191不同archive/path）。五playable與staged、九Pages uploaded payload與staged相同；空.nojekyll不在tar明示。CPU rescue272<=309及CPU trial通過。三張靜態原生圖限定review已上雲回下載，未抓live site、未作全motion或真機批准。

## 下一工作與缺口

屋頂大輪廓、樹冠／樹列、山道／法庭家具尺度與遮擋、縮尺地圖和城鎮切換仍未完成；本輪法庭畫面仍見被告席橫條穿過上身。不重做K招牌／L苔根／M瓦列，也不以展示圖或動畫維護替代美術。

G224 ambient/greet已接入；112NPCwalk／導航、256party combat仍未啟用。完整party/enemy/NPC方向attack/cast/hurt/down/death、合法音訊／聆聽／原速／真機／長時段繼續。Tank/Yakra death、Hench outgoing、P down、Q selectorhurt樣本缺口保留。全T03–T08不縮；全部完整品質批准false、newScore=null、releaseBLOCKED。
