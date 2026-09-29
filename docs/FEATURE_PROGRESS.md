# 功能進度 — v45，L樹根／蕨葉正式接入，K中斷交付已恢復

Authority STATUS／TODO／checkpointv45；L0.9.85 sourceb8cc1b603c419ac11724cec9a7292d38c984b066，唯一CI10936516603995最後in_progress。source發布、離線測試通過不等於native／部署／美術批准。

## 本批新增

托魯斯4與森林12原樹點，新增苔根接地平面與低矮蕨葉；兩張256×64原創像素圖集各四變體，共8cell。正式CPU/WebGL共享ArtDirectedWorld入口、nearest／alpha-test。32mesh、2texture、2material上限；131072bytes為RGBA payload，非全engine記憶體。原樹冠與材質／人物texture／camera／State／碰撞保持，不以移動角色湊畫面。

原樹點數量、parent、layout、plane buffers與原texture尺寸契約白名單，未知／duplicate／drift拒絕或釋放；root／pass／scene dispose清理自有資源，不改外部owner。切home為cached root disabled，資源保持到dispose；不重複上傳靜態素材。

完整Node3752／Python645／assets／typecheck／quality schema／build過；50新專屬Node／4Python、15非target／held全frame一致、4原CI108只讀停點的inn gate保持。759source全測前後相同，736K程式原byte、731受掃描原輸入保護。2PNG及manifest与build同源，2模型JSON與6張圖為offline，不充作原生證據。

## 接回K與當前部署

K在前次中斷前已發布，恢復747source及原3702Node／641Python logs但不重做K。CI108與Pages102 success，exact K／playable11009780958，七原ZIP／八ledger179entry／九payload核對並上雲回下載。三張静態圖見原inn停點按真實遮擋淡化；不是全motion或真機批准。原CI107 failure／Pages101 skipped保留，最后已限定部署K0.9.84，不是L。

## 未完成

CI109原生植被接地、比例遮擋、原CPU門檻及Pages exact L待審。屋頂樹冠、完整前段构圖／家具尺度、縮尺大地圖／城鎮切換、全party/enemy/NPC attack/cast/hurt/down/death、112NPCwalk、256combat、合法完整音訊與聆聽／原速／真機／長時段仍open。Tank/Yakradeath、Hench outgoing、Pdown、Qselector-hurt原生樣本缺口不造數。T03–T08不縮；全部完整批准false、newScore=null、releaseBLOCKED。
