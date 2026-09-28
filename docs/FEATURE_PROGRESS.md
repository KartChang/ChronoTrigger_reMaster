# 功能進度 — v40，VQ04F托魯斯與法庭實際美術

Authority：STATUS／TODO／checkpointv40。F0.9.79 source da615f1e4a803fa8fdaddf4723ab782038e14266已發布；唯一CI10336441789439觀察in_progress。這不是F部署或原生批准；最後完成的限定部署審查是E／CI102／Pages96。

## 新增F實作

托魯斯新增一個透明土草路緣／原建築門檻及接地色地表，保留真正原底圖與道路；法庭兩講台、七座席改木作材質指派，新增七薄座墊與八條木飾線，原角色支撐／位置／幾何不改。四張作者材質與PNG同源，ArtDirectedWorld的CPU/WebGL共同使用，沒有旁路或假舊像素。新pass最多四texture、655360bytes RGBA、五material、16mesh；靜態不重上傳，root/dispose回收及owner保護已測。

41F專屬Node與4Python新增；全Node3425／Python621／assets／typecheck／qualityschema／build通過。實際CPU framebuffer改變、14非target／held畫面相同、原State／camera／幾何／actor/baseRGBA不變及切場資源已驗證。F→E source-only inverse及前代保護保留原hash、native路線和goldens。667E原程式檔不變，662受掃描輸入保持。

## 已完成基礎不重做

E七類NPC336作者欄位／28ambient真實owned upload沿用，308方向walk/greet仍未playback；256combat作者欄位runtimeApplied=false。D四角色探索ready/victory256欄位、另256原combat格、A/B/C環境與山岸沿用。heldhome／母親家具、core／clock／camera及original native門檻不改。

CI102與Pages96已success，七ZIP／三lane29原entry／source及Pages九payload限定同源，空.nojekyll未入tar明示。三張WebGL靜態審查不等於影片、完整motion、聆聽或真機。

## 仍待完成

先接CI103的原始產物与F場景native／部署限定審查；不要重送F/E/D。完整party/enemy/NPC方向與全动作death、概念級前段構圖尺度遮擋、原作縮尺地圖與城鎮切換、合法完整音訊聆聽、原速／真機／長時段及完整T03–T08仍open。2300抵達非完整未來。Tank/Yakra完整native death、Hench outgoing、Pdown、Qselector-change缺口保留。

全成果在main或指定Drive並回讀，詳DELIVERY_INDEX及PRODUCTION_ART_VQ04F。art/fullAnimation/originalSpeed/listening/device/longSession/wholeGame=false，newScore=null、releaseBLOCKED；測試數量與CI綠勾不是美術評分。
