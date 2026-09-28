# VQ04F — 托魯斯路緣與法庭木作實作

批次 VQ04F／0.9.79。沿 E source 870c2fb64afd42dcb7bd618f84928643c995fa94；本文件描述已完整離線測試的實際美術程式，不是 native、真機、概念級品質或完整遊戲批准。發布位置以 STATUS／checkpoint 為準。

## 實際畫面改動

`production-place-art.ts` 提供四組與 renderer 共用的作者 API：town-verge 384×352、court-oak 128×128、court-seat 128×64、court-velvet 64×64。城鎮透明路緣層依原 woodlandPath 與 KINGDOM_SOLIDS.truce 放置破碎土草交界、零星石粒、齊平門檻及建築側邊接地色；中央通路與外圍保持透明，不另造入口或障礙。

法庭只改兩座講台與七組座席的材質指派，使用直向木紋、橫向座板及低彩度紅座墊；新增七片薄座墊與八條木作飾線。原支撐幾何、角色 pivot、角色貼圖、底圖、camera、道路、State、碰撞與時鐘不變。托魯斯只有一個額外透明地表，不以假的舊來源像素掩蓋畫面。

## 接線、界線與資源

`installProductionPlaces` 接在真正 `ArtDirectedWorld`，CPU／WebGL 使用同一入口，沒有裝置、品質、測試模式分支。只允許 kingdom-truce／trial-courtroom 的既有構造；城鎮 floor 位置、尺寸、旋轉與縮放，法庭材質名稱、直接父節點、講台名稱唯一性、2＋7數量與 mesh 構造都先檢查。不匹配不分配新資源。

混合兩場景最多四張材質貼圖、655360 bytes RGBA、五個材質、16個新增 mesh。靜態繪製不重複上傳。移除 root 會釋放該 root 的新增物件；最後一個 root 釋放材質及貼圖。dispose 僅還原仍由本 pass 持有的材質指派，不覆蓋較晚 owner 的材質，保留原材質／貼圖物件。這是新增 pass 的資源統計，不是全遊戲 GPU 記憶體測量。

## 測試與前代保護

41 項 F 專屬 Node 測試：作者尺寸、確定性、透明與不透明契約、未知 selector、四 PNG 解碼對作者 RGBA、真正 current-app framebuffer 改變、原幾何／actor與底圖RGBA／State／camera不變、14個非目標／held場景與 E framebuffer 相同、切場重入、無額外上傳、根節點銷毀、新 owner、material ownership 與資源回收。

F→E 只限 SOURCE 的明示 inverse 保留既有 source hash，並傳遞到 E→D／C／B／A。原 E current-app 測試改明示 frozen E component，F 另有實際 current-app 整合；不把 frozen 測試充作當前遊戲驗收。原 native 路線、wait、capture、assertion、golden 全部原 byte；source inverse 不得接收 native／image／State。662個受掃描 E 原始輸入保持，總690檔程式中667個E檔完全不变。

最終完整 Node **3425 passed／0 failed／0 skipped**、Python **621 passed**；assets、quality schema、typecheck、build全部exit0。首次完整 Node 子程序 SIGKILL 失敗保留；未改 source，降低離線 CPU affinity 後整批重測通過。沒有降低測試斷言、native計時、CPU品質或記憶體門檻。quality所列30/100是較舊runtime評分，不能當本批新分數。

四張 PNG 由實際作者 API 匯出；完整build產物與獨立PNG同源測試的輸出一致。離線canvas fixture及CPU framebuffer不是本機browser或真機證據。F尚需 matchingCI／原生畫面／部署限定審查；其狀態另見當前checkpoint。

## 未完成與完整範圍

E既有七類NPC28ambient保持，308方向／walk／greet僅匯出；256combat作者格仍runtimeApplied=false。party／enemy／NPC全方向attack／cast／hurt／down／death、前段建築樹列家具尺度遮擋、原作縮尺大地圖與城鎮切換、完整合法音訊與聆聽、原速／真機／長時段及完整T03–T08仍待完成，2300抵達非完整未來。

held prologue 2711a74185aacf3c6bddf9db85ba99a2afbc507a／母親家具不變；TS／Babylon／esbuild／fixed ATB／A*／InputBoundary／P1P2自主第三／v1-v8不變。無localbrowser、native State/time/save/collision注入；無放寬<.12、單一30秒、250ms-256、CPU品質記憶體門檻。ROM/media/fonts/credentials私有。全部品質批准false、newScore=null、releaseBLOCKED。
