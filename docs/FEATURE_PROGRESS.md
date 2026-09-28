# 功能進度 — v41，G四方向NPC招呼與exact Pages CI已合批發布

Authority STATUS／TODO／checkpointv41。G0.9.80 source1512fcaf3601c31834d2047042b7fbb3a61aee66，唯一CI10436454035999／push／attempt1執行中；source發布、離線工程通過不等於native／部署／完整藝術批准。

## 已完成新增功能

七類NPC、八個既有mesh正式runtime可選四方向ambient/greet224格；E作者RGBA不變，比28前向ambient多196格。依現有active存活隊員真實位置朝向／招呼，target／axis／radius有有限滯後。原NPCframe clock、位置與導航、State、HP、save、camera、碰撞皆不改；非探索／cutscene／無有效目標／held回預設。112walk仍staged、256party combat仍runtimeApplied=false。

維持真正owned upload及來源逐byte／name/root/material/size/exclusive檢查，unknown不換圖，this/args/return/exception與owner/dispose/held還原完整保留；同key不重上傳、0新增GPUtexture／12binding／294912CPU bytes。7PNG／224格同源及build parity通過。

Pages workflow_run改exact trigger GET並核id/SHA/attempt，不再靠全域success-list或較舊CI fallback；原artifact唯一、未過期、repo/source/digest檢查保留。移除獨立push觸發，不manual dispatch。19新＋17原Pages測試通過；新部署仍需CI104完成後驗證。

## 實證與待辦

完整Node3501／Python625／assets／TS／quality schema／build通過，703程式全測前後一致。76新增Node含actual-current CPUframe與11非target/held相同；G→F及前代SOURCE-only inverse、原pins/native/goldens保留。早期三個新增offline fixture失敗logs照存，非改native湊證據。完整包及readback見DELIVERY_INDEX。

CI103 success與五原ZIP／690Fsource／29entry／兩張靜態圖完成限定review。Pages97 failure、無部署，原錯誤與摘錄保留；最後已審查部署仍E／CI102／Pages96。實際F圖仍有建築壓場、townsperson屋頂遮擋及中央講台下身遮擋，完整motion舒適性未證明。

接續CI104真實來源／原生NPC方向招呼／Pages部署，再做112NPCwalk/導航及全party/enemy/NPC方向動作death、概念級場景構圖尺度遮擋、縮尺大地圖與城鎮切換、完整合法音訊實際聆聽／原速／真機／長時段。Tank/Yakradeath、Hench outgoing、Pdown、Qselectorhurt樣本缺口保留。T03–T08全範圍不縮；art/fullAnimation/wholeGame等完整批准false，newScore=null、releaseBLOCKED。
