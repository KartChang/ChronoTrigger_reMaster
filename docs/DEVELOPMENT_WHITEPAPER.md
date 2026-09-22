# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02j-ci52-pending。依既有產品與TODO續作，不重新規劃。唯一入口STATUS／IMMEDIATE_CONTINUATION／CI52_CHECKPOINT。前版完整文字保留於a22054d7efa9f963376e145ec9ccb762300ca628；其CI51pending由本次I驗收與J／CI52取代，不重開舊章節。

## 產品目標與架構

完整《超時空之鑰》HD-2D重製：像素人物加立體場景、原作辨識度、縮尺大地圖及城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮成序章。前段人物場景、美術建模動畫、鏡頭遮擋HUD、操作聲音先取得實際品質證據，再擴後段。90須來自實際驗收，不是AI自評、引擎或特效數量。

保留TypeScript＋Babylon.js＋esbuild自含HTML及固定package／lock。玩家不需ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；音畫不決定傷害、資源、碰撞或故事。CPU共用現有場景圖，不重造平行關卡。暫停、背景、對話、背包、原生選檔、contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入、A*保留碰撞。P1克羅諾／P2露卡與劇情所有權、瑪兒／青蛙自主第三同伴、各自選敵與雙確認合技不變，不加P3或可寫通關hook。

## 已有功能與資產，不重做

家中醒來／樓梯、縮尺區域圖、千年祭行為與初遇、項鍊異變、600山道、托魯斯、森林王城、露卡、修道院青蛙／管風琴暗門／密道補給／亞克拉、王后大臣救援返鄉、護送被捕與兩裁決、敲門越獄或等露卡／弗里茲／看守室、三部位龍戰車、重聚、森林時門、2300抵達皆已有實作。2300抵達不是完整未來篇，經驗紀錄不是完整成長。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容、穿戴份數、金幣庫存守恆及交易上限保留，不能出售仍穿戴品。400G、價格及普通攻防增減為明示暫定重建，不冒稱原作數值。成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人仍不完整。

IndexedDB／JSON白名單v1-v8保留。舊檔未知行為不補造證詞，查看不強制改寫，本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu/frame唯讀；CPU專項本人v2/v3/v4不能取代原裝備v8與其他存檔驗收。渲染偏好及診斷不存入遊戲檔。

保留A/B/C主角、鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態/reduced-motion、W局部光照銅材質六樹根八陰影、X鋪面grassmask、Y投影閱讀性/caster合併/20石材倒角。C原片段與影格、固定tick動作及位移步伐、96格CPU快取不重畫。A七段自製短曲及B靜音修正保留，不是原作OST或完整配樂。

## 品質界線與固定限制

精緻HD-2D仍有交付落差：木料平塗、人物植物／立體道具材質語言、尺度輪廓、窄視窗地標、升級母親家具、完整動畫音樂尚未全部完成。既有母親對話不等於新美術整合。測試數、模型數、短曲、CPU相容或FPS標示不能代替90。舊30stale、release仍blocked，不宣稱全作接近完成。

Z0.9.22材質／UV／直向構圖仍未發布且受限，不重送、換編碼管道、間接替換或部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與本機browser限制不因一般繼續解除。J未動素材／材質／UV／幾何，不是繞道推送Z。這些特定限制不表示GitHub／Drive不能讀寫。

## CPU既有能力與I正式驗收

D/E在WebGL2/1不可用時預設CPU／Canvas2D，實際處理既有頂點矩陣、簡化光照、UV紋理、透明深度與像素，不是NullEngine空跑或錯誤頁。640x480像素cap、最大邊1280、紋理32MiB／512格，不做shadowmap/glow/specular，不保證WebGL完全一致或真機流暢。E保守剔除、完全畫面內三角形快速路徑、重用方向光與真實work計數保留。

F實作CPU密度tiers、auto/quality/compatibility实际尺寸、120活動frameinterval與mean/P95/max/FPS、CPU/Canvas2D及build/source身分。G放鍵後抵達檢查、H長腿最多250ms脈衝、I近目標P1內層按鍵避免P2transport拖長，保留<.12、原tick公式／30秒與全部cleanup。這些修正現在由I的完整native成功閉環，不再重做。CI48–50是失敗，不能回填成功；舊CI47／Pages41等閉環不重開。

最新已驗收 **I0.9.31／source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5／CI51 35675330433／Pages45 35676767742**。CI51於2026-09-22T01:42:33Z success；validate106580545339／good106580545667／bad106580545619成功。13主、9原native加CPU、音訊actor/HUD/場景暫停減動態/接地ATB/裝備v8/完整審判故事/觸控完整；五份原source驗證器重跑後ledger逐bytes相同，列入檔全部hash一致。Good/bad原ZIP缺HTML，以同CI playableHTML配對其原metadata，未改原始證據。

CPU兩原生旅程全部完成：家中至祭典；雙人操作、ATB、本次本人v2匯出／IndexedDB讀回／原生匯入。10次放鍵後抵達均<.12且原預算內，11CPU真圖已看。61活動sample mean41.059016ms／P9549.4／max85.4／FPS24.355186一致，品質678x452與相容452x301、完整pausedstate及身分正確；不是持續流暢、聽感、實體装置或美術90認證。

Pages45成功，workflowhead是文件a22054而selectedsource是I，合理且已核對。Playable／staged／deployedHTML相同5686369bytes/SHA256ca963b73d55cdc37e9f348dd93476c1a86089c3f4fed7313147f7a9f935c43a3。CI端真正公共HTTP/source/hash/launcher斷言成功；本機獨立HTTP因DNS不可用，不宣稱額外讀回成功。詳CI51_ACCEPTANCE、CI51_VISUAL_REVIEW與PAGES45_PROVENANCE。

## J已發布：CPU取樣功能與原生600覆蓋

**J0.9.32／sourcee93733179a4e0e0cb5fd254d7a841c2eb3df542d／tree23bfe048c311e8afdb4913283c8257ebff910adb**。15檔整批測試後一次non-force發布，main回讀／完整testedroot一致；原最新docs保留。

實際CPU圖片可見細木紋、草地在縮小尺度出現重複條紋。因此新增CPU暫停選单「遠景紋理平滑」實驗功能，預設關閉，讓驗收前原預設畫面不變。只對不透明表面的原texture bytes按需建立box-filter mipchain；正交三角形依texel足跡選層，一triangle一次而非每pixel；透視nearest fallback。人物／透明植物／opacity/blend/cutoff保留nearest輪廓；原WebGL、資產、材質、UV、幾何不变。Mipbytes列入原32MiB／512entry上限，texture更新失效、關閉及dispose清理與控制listener生命周期已測。沒有把新filter等同新美術或宣稱已消除時間閃爍；效果／成本需實圖驗收。

同頁在兩個原CPUcase之後接續本次真正Gato／v2狀態，項鍊異變與P2離隊、600山道三敵獨戰、本人v3匯出原生匯入、托魯斯／旅店、森林兩敵獨戰、王城／王后消失、露卡P2、本人v4原生匯入至修道院入口。30coordinatelegs重用Ihelper、原epsilon/tickformula/30s；原Gato站位較寬，普通P2按鍵靠近展示台，不替換起點或造存檔。兩段劇情暫停完整state不變，離隊P2不動與回歸後獨立P2皆要求。

新驗證器先调用原CPU完整驗證，再加第六ledger16檔：新report、11張額外PNG（8場景+nearest/filter/restored3圖）、兩本人v3/v4、父v2與nativeimportreport。Canvashash比較本身，不用checkbox不同的整張UI截圖假裝有畫質變化；on須改變、off須精確恢復，pausedfullstate相同、mipmemory釋放及cutout輪廓不退化。所有原3job／13主／9native／CPU／5ledger／14CPU檔／11原圖保留，workflow只加一項驗證，45分鐘不變。原CPUdriver10函式、Ihelper、core／碰撞、原素材及package/lock不動。這是既有章節CPU覆蓋，不是新章節重作，也不是整段600或全章覆蓋。

新跑 **1239Node／259Python／assets／typecheck／build**，完整npmcheck／Python exit0。新增78Node（11取樣、66驗證器、1純規則路線）及9Pythoncleanup/契約。纯規則從factory、公用輸入、戰鬥、serialize/deserialize走完整既有路線；模型及記憶體schema fixture不寫native成功report／存檔，不是browser證據。兩次中斷Node工具記錄另存，只有後續完整exit0計成功。本機未操作browser，沒有Jafter圖。

## 唯一CI52與後續完整範圍

**CI52 35680779688**，push/attempt1／exactSHA count1，最後queued/null at2026-09-22T02:47:53Z（台灣10:47:53），未查jobs、不等待輪詢／取消／重派。pending存接續点，failure處理同run第一root並保留所有新舊斷言；success驗全原證據及新era600/sixthledger/11新圖/30路段/nativeownv3-v4/filtercanvas還原與memory/fullpause，原ZIP指定Drive下載hash/CRC回讀後核對Pages/source/HTML。CI注入sourceSHA，本機null-sourceHTML不是CIhash基準。

CI52閉環後继续前段真品質：CPU覆蓋修道院內救援／審判至既有未來入口、持續及實體装置觀察、實圖相容缺陷、允許範圍內材質比例輪廓／窄視窗地標、全動畫音樂聽感。不得用測試數替代美術，或以一般continue解封Z／升級母親家具／提前擴後段。

T03隱藏規則／版本差異／完整拓樸／數值忠實度；T04成長報酬掉落／全經濟物品飾品／角色技能雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來及其餘時代主支線結局；T07整體90、每面向80%、zero-critical、requiredassets五gate、真機輸入FPS/frame-time/載入/記憶體/背景/存檔/音訊與全章CPU；T08每批雲端。不縮小分母只評已做功能。

## 持久交付

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。CI51原包1sgU-n16eUnPExIBtFsx2RHgGDf51BC4U，56597286bytes、20manifest、7原ZIP，下載hash/CRC/parent一致。

J最新包 **Chrono-CI51-accepted-VQ02J-tested-batch.zip／14HDH1dKKIKzkHfqWCAfHtRgjKs6j0gNd**，58593820bytes，SHA **f48e75f308b02182bb3635e651d3be0b461f685daa5c78de6c8677c9fc199fe2**；43manifest與280程式檔assembled恢復，原包不變，下載hash/CRC/parent全核對。只有THIRD_PARTY.md屬docs；最新main進度永遠另讀。封存nullsource是發布前，最终GitHub收據補發布身分不改原logs。固定toolchain1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules與esbuildhardlink，不覆舊source/config或bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳，不公開ROM/原圖音訊/字型/憑證。全部交付寫回GitHub或正確Drive並回讀，文件[skip ci]，臨時容器不是權威。
