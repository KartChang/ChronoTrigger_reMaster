# VQ04H — 城鎮建築比例與法庭講台遮擋

H pre-publication 技術紀錄；最終 source／CI／Pages 狀態由 main STATUS／checkpoint 決定。固定架構與完整 T03–T08 分母不縮。

## 正式模型接入

ArtDirectedWorld 在既有 production-place pass 後安裝 production-architecture-finish；CPU／WebGL 共用同一 scene，不另造 renderer 或改 camera／State／碰撞／角色位置。四棟托魯斯建築100個結構件，以 .33 接地錨點將高度壓至 .82；保留 X/Z、原 transform、UV、材質、貼圖及屋頂坡向。法庭被告席高度比例 .50、法官台 .72，含原兩台與八個既有飾線共10件，不移動人物湊畫面。

完整 root／名稱／位置／旋轉／材質／box dimensions／positions／normals／UV／indices 原始來源均吻合才建立 owned Geometry。原講台使用 physical boxTextureUV，城鎮與 F 飾線為 unit UV，嚴格辨識兩種合法來源；沒有放寬成只認名稱。父節點、材質、geometry owner 或 transform 漂移 fail-closed；釋放只還原自己仍持有的 geometry，不覆寫後來的新 owner。

最多2root／110 owned geometries，宣告 geometry buffer payload上限100320bytes（不含JS object／heap overhead），0新增texture／material／mesh；既有CPU texture／品質上限不變。CPU framebuffer、ray intersection與inspection均讀實際模型，不返回前代假像素。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a、母親家具及15非目標場景原像素保持。

## 實際測試

完整Node3553／3553（0fail／skip）、Python629／629、assets／typecheck／quality schema／build成功。52個H專屬Node與4個Python，涵蓋原XZ、exact source layout、invalid／shared geometry、duplicate root、owner replacement、釋放換場、正式H vs frozenG current-app CPUframe、15非目標／held framebuffer相同。Immutable CI103 courtroom beforeState的51條真實mesh ray：G6遮擋、H0。這是offline fixture，不是browser State注入或新native證據。

H→G明示SOURCE-only inverse與前代傳遞保護原native route／key／tick／wait／capture／assertion／golden。717程式檔全測前後相同，25delta（11修改／14新增）、692G程式原byte、687受掃描舊輸入保留。早期中斷及新增fixture／UV admission失敗logs均保留；最終零失敗不代表每次嘗試成功。

作者輸出architecture-model.json與離線模型視圖，沒有假報新PNG角色畫格。E/G NPC與D party作者pixels未改。

## CI104失敗仍保留

CI104/36454035999最終failure（2026-09-28T17:28:14Z）；Pages98/36458343628 skipped。四原ZIP存在，無playable artifact。原CPU rescue report完成9項checkpoint，在reunited／truce往z7.6的paired route耗311ticks超過309；兩人最後雖在<.12，原預算檢查仍失敗。原30秒／250ms界線不改。此trace尚未隔離host transport、scheduling與render成本，不聲稱碰撞／NPC程式根因或H已修復；matching H CI必須實測。

兩個immutable recorded positions的5樣本離線CPU study：H candidate pixels較少，但中位draw時間未比G快。不得當成原速／真機效能改善或native failure fixed。CPU trial lane與後續驗證缺口保留；完整motion、NPC224格原生覆蓋、聆聽及真機未批准。

## 後續仍開放

G224 NPC ambient/greet可選格保留；112walk仍staged、256party combat runtimeApplied=false。招牌與居民可視性、完整山道／法庭／樹列／家具構圖、原作縮尺地圖與切換、全party/enemy/NPC動作death、合法完整音訊、原速／真機／長時段及T03–T08仍待完成。所有完整品質批准false，newScore=null，releaseBLOCKED。
