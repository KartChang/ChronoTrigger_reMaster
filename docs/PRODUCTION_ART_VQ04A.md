# VQ04A — 山道、法庭、森林美術的實際整合

版本0.9.74。Source4dc7449ff41a6b87e452c45184198b3c9a1929e2，CI98/36338351176目前驗證中。這是正式應用的環境美術一批，不是概念圖生成或完整美術批准；使用者認可的兩張概念圖仍是目標，不能說本批已達同等品質。

## 應用與素材來源

src/main.ts只改World import，改由ArtDirectedWorld繼承既有World；super(canvas)後，production-environment在同一scene掛接靜態材質與景物。原renderer/core/state/input/collision/ATB/animation仍由既有World擁有。所有啟動模式與CPU/WebGL都經過相同入口，沒有URL/test/device/quality條件繞開。

src/production-art.ts以固定座標與確定性紋理函式編寫RGBA。無ROM/OST/font/下載/AI服務/外部PNG輸入，不讀State、不消耗effect、不生成遊戲事件，不以概念圖或舊截圖覆蓋場景。唯一景片為場景北側的遠山背景；道路、岩壁、樹木、人物、敵人仍是實際mesh與sprite。13PNG由同一函式匯出，解碼後RGBA與runtime完全一致。

## 13組素材

| runtime kind | size | 用途 |
|---|---:|---|
| canyon-ground | 768×672 | 原canyonPathBounds道路、安靜通路、草地/碎石銜接 |
| canyon-rock | 128×128 | 層理、裂隙、苔痕岩壁 |
| canyon-turf | 128×128 | 岩台草皮 |
| canopy-atlas | 544×160 | 四款128×160樹冠，136 stride、4px gutter；normalized UV保留 |
| mountain-distance | 640×256 | 三層遠山及北側植被輪廓 |
| court-ground | 768×704 | 石板、鑲線、紅金地毯與靜態窗光色塊 |
| court-dais | 256×320 | 保留既有atlas比例的台面與階緣 |
| court-stone | 128×128 | 石牆、柱與簷口 |
| court-wood | 128×128 | 法官及被告木作，獨立徽記 |
| court-timber | 128×128 | 無徽記陪審席木料，非同張貼圖充數 |
| court-velvet | 64×256 | 原布幔的明暗褶皺 |
| court-window | 256×160 | 彩窗與自製日光翼紋，binary alpha |
| court-banner | 96×256 | 紅金旗幟及流蘇，binary alpha |

完整13組RGBA合計6,213,632bytes，低於這批新增6MiB靜態材質預算；不代表整個遊戲只用6MiB。nearest採樣、binary alpha與舊CPU alpha/depth流程相容。材質共用與每種一次upload；不每幀重新繪製。Scene釋放時對應texture/material同生命周期；沒有額外timer、shader特效或外部資產請求。

## 三場景範圍

山道truce-canyon-600：替換floor、terrace-cliff/ridge、terrace-turf、八張pixel-canopy的材質，保留原地形幾何/碰撞。北側新增1個遠山plane。不是把示意圖放上去冒充關卡。

法庭trial-courtroom：替換既有地板、弧形台階、石牆、法官/被告木作、陪審席、布幔、彩窗材質；北牆新增6個柱腳/柱身/柱頭、2面旗幟、6個燭台部件、1條簷口，共15 mesh，不新增行走障礙。固定相機角度與目標不改，ortho half-height=max(7.8,9/aspect)，縮短空景並讓直式畫面保留兩側陪審席。角色位置、動作、scale不改；其本身美術仍待後續完成。

1000森林trial-guardia1000：十五張既有tree/canopy卡使用同一四款atlas；不搬物件、不改碰撞。600森林的既有診斷材質與held home/prologue不在作用範圍，不能藉此間接替換母親家具。

## 測試、資源與證據

正式入口整合測試直接建立ArtDirectedWorld，而不是只測PNG或只測base World。三場景CPU framebuffer相對base確實改變，但State/events、actor transform、既有mesh transform及動作診斷相同。停畫/reduced重繪不重配材質；章節切換隱藏非當前景物。bedroom/home/overworld/fair與base畫面逐byte相同。橫直式取景、獨立inspect資料、scene dispose、CPU unsupportedResources=0及既有32MiB/512entries限制均有離線測試。

新增42Node/4Python；完整3110Node/601Python/asset/typecheck/build通過。601未改程式輸入byte-exact。原component baseline hashes用明示source-only逆轉保留，缺hunk/重複/額外改動拒絕；不接收native報告、像素或State。這只是保留舊component回歸，不能代替新增真正應用整合測試或原生驗收。

原CI workflow未改。scripts/build.mjs在既有asset export後新增exportProductionArt，輸出dist/art/production-vq04a/13PNG與manifest，原有art artifact即會收集。完整tested source/tree及成功/失敗/中斷logs在指定Drive包與evidence/VQ04A_TEST_RECEIPT.json。

## 明確未完成

目前只是環境細節、材質與靜態構件落地；沒有新繪完整party/enemy/NPC方向sprites，也沒有把原作全場景/地圖還原完成。靜態窗光不是即時反射或光線追蹤；離線384級工作圖不是1200級原生畫面、實際遊玩、聆聽或真機成果。

CI98新畫面還須檢查樹冠輪廓與尺度、地表雜訊/重複、岩壁銜接、法庭層次與留白、旗幟/柱體遮擋、黑邊及角色辨識，以及行走/戰鬥下的穩定性。高階概念图細節目標未達批准；不自評90、不將concept或OFFLINE工作圖塞入native證據。artApproved/fullAnimationComplete/wholeGameAccepted=false，newScore=null，releaseBLOCKED。
