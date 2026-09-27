# VQ04C — 前段室內建築與山道近景的正式美術程式

Source **0aefa412e71d522dc1b667b9fcdf850f8cf4e65c**／0.9.76。Matching **CI100／36349691934**；目前 in_progress，尚無 C 原生或部署驗收。

## 實際接入範圍

ArtDirectedWorld 在原 scene 安裝 early-scene-finish，原 World、render loop、camera、gameplay 仍是唯一 owner。使用現有 root 與明示結構名稱 allowlist，僅在場景第一次可見時套用。沒有另一條展示路線、local browser、URL/test/device 模式或概念圖背板。

12 個 root：castle、chamber、cathedral、passage、sanctum、hall1000、cellblock、execution、prisonstairs、warden、prisonbridge、canyon。法庭、600森林、1000森林、城鎮、祭典與 held home 不在本批新增表面 allowlist；B 已有法庭與森林美術保留。

城堡／王后房：安靜小石板、接縫倒角與牆邊層次、紅金 runner、雕槽石柱、木框家具、被褥／枕頭與彩窗。修道院／地下：石坪、木長椅與風琴木作、管件、祭壇石材及冷色地下砌石。監獄：地面與塔樓砌石、木床／箱櫃／刑具、布料與鐵件、橋面木板和原 void 邊界。這些是材質與有限建築構件更新，不是所有建築或道具完整重建。

64 個靜態構件：castle16、cathedral12、sanctum12、hall1000 16、canyon8。柱圈／雕槽沿原柱腳與柱頭範圍，不在通道增加高大物件；山道八張低矮植物卡共用四格 atlas，配置在外側土岸 |x|>=8.7，並非搬動敵人／道路來避遮擋。新增物件不可 pick，不新增碰撞。透明囚室門保持原 alpha .42；不替換角色、鑰匙、火焰、秘密門陰影或動態貼圖。

## 素材、邊界與資源

16 個確定性 source painters：六張384×352地表；limestone、column-stone、crypt-stone、carved-oak、quilt各128×128；ironwork64×64、royal-runner96×256、linen96×96、lancet-glass128×160、四格understory256×128。橋面採原 bridgeDeckPixels，沒有改寬可走區。非植被全部opaque；understory透明留邊與四格UV獨立。

全部來自本批程式像素，無 ROM／外部影像／字型／服務輸入。16張 raw RGBA 合計3,936,256bytes，lazy共享並只上傳一次；非整遊戲GPU或CPU總量。既有A/B13環境及配角資源仍保留。章節切換不重生材質或構件，scene dispose清除觀察者與登錄。未放寬CPU原32MiB/512entries等門檻，也不把離線記憶體觀察當真機長時段。

scripts/early-scene-export.mjs 從同一函式輸出到 dist/art/production-vq04c，16PNG＋manifest；每張PNG解碼後逐byte等於runtime buffer。原A/B輸出路徑及CI workflow保留。獨立manifest記錄新素材；本批沒有修改主assets/manifest.json，不宣稱全部required assets已登錄或批准。素材、作者工作圖及driver均存Drive專案包，沒有在對話交概念圖。

## 工程驗證及美術界線

完整3220Node／609Python、asset/typecheck/build通過，新增60Node/4Python；625未改程式inputs保持byte-exact。新C測試真正跑current ArtDirectedWorld與CPU framebuffer，12root像素有變；State、原角色素材/transform、相機、既有幾何與gameplay診斷不變。十個非目標chapter framebuffer與B相同；橫直取景、貼圖重用、切場重返、dispose、transparent gate及橋界線有覆蓋。

舊B component明示凍結B，不能冒充currentC；C→B source-only inverse只處理列明source，拒絕缺失／重複／額外變異，不能接native資料、pixels或State。原native route/tick/key/wait/capture/assertion/golden files完全未改。早期測試失敗與修正紀錄、最後完整通過log都保留。

OFFLINE作者工作圖是單元fixture渲染，不是native evidence。C還沒有CI原生畫面、連續運動、聆聽或真機批准。主角、敵人和NPC的完整造型／四方向／move/attack/hurt/down/death本批沒有重畫；不能把16材質或64構件當成全部美術完成。山道北端銜接、角色原型感、剩餘前段場景與概念級品質仍open；artApproved/fullAnimationComplete/wholeGameAccepted=false，newScore=null，releaseBLOCKED。
