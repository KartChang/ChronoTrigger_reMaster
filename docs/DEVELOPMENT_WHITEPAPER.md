# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04d-art-first-ci101-pending**。Authority STATUS/TODO/T05_ANIMATION_CHECKPOINT **v37**。唯一main／singleAI／nonforce。Root T05-early-visual-cohesion，execution T05-early-production-art。

前版完整原文blob **9bc8a9ad45260bfe2d6a9a517ae4418bc6630799**保存在 **evidence/VQ04D_PREVIOUS_WHITEPAPER.md**；未改詳細架構、既有遊戲數值與完整分母仍適用。更早鏈不重讀；本版取代C/CI100 pending狀態，不從歷史flags倒退main。

## 一、完整產品與美術優先

完整《超時空之鑰》HD-2D、像素人物與立體景觀、瀏覽器優先、全部時代主支線結局、原作辨識度／背景／構圖、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人。2300抵達不是完整未來，不縮成演示。

使用者認可的山道／法庭concept是品質目標，交付必須是正式程式和資產而非對話圖。前段未舒適時美術優先，不能反覆僅做動畫邊界維護。M-Z動作基礎保留；D探索畫格更新不等於全人物完成。整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical，必須有真實畫面／遊玩／裝置證據；素材數或測試數不算分。當前newScore=null，releaseBLOCKED，歷史工具30/100不是D新評分。

## 二、既有系統界線

TS/Babylon/esbuild／固定依賴／自含HTML，無CDN/ROM/後端才能遊玩需求。Controls→1/60秒fixedsimulation→core→render/HUD/audio，呈現不決定HP/ATB/碰撞/存檔/劇情。P1/P2自主第三、獨立選敵與雙確認技、InputBoundary/A*、v1-v8保持；不加P3／ARPG／重造framework。

暫停背景對話背包native選檔contextloss凍結simulation，不補跑。CPU/WebGL相同遊戲規則，CPUtriangle/texture/depthfallback不是另做低品質版本。原640×480cap／最大邊1280／32MiB／512entries／120活動FrameWindow及alpha/perspectivenearest、mip釋放保持。No localbrowser/native state-time-save-collision注入，原route/tick/key/wait/capture/assertion/golden/<.12/單一30秒/250ms-256/CPU品質記憶體不放寬。

ArtDirectedWorld沿原World唯一renderowner，super.draw原四參數保持；新美術adapter接同scene真textureupload，不新增另一條原生／device／URL專用路徑。

## 三、D人物與山道實作

四名Crono/Marle/Lucca/Frog原生48×64重新作者化idle/walk/ready/victory，四方向4slots共256slot；個別腿鞋手臂、衣身、皮帶圍巾、髮束馬尾、眼鏡帽盔、披風與青蛙眼部。原pivot24,62、2pixelmargin／接地及clock不改，步態0/2接觸格仍相同，所以不是256独立姿勢。

Attack/cast/hurt/down另256slot exact drawHDHero。現行native party_combat／party_reaction將這些來源goldens固定；不能以修改goldens、diagnostics回舊圖或改路線假裝新圖accepted。本批僅實作可在此契約下合法替换的探索/ready/victory；完整combat/death與敵人NPC仍在TODO，不因這個限制永久排除。

正式partyfinish讀目前真sampled pose/frame/facing，再用512fingerprint候選＋重算oldsource全byte確認；不是拿native報告映射圖。71個oldcell bytealias可同時屬探索和protected，要以真pose分辨。未知和protected原畫布像素不被替换，productionArt.party另外報partialpaintprofile，幾何／動作profile保留。

借用原texture.update保留arguments/return/errors，不新配partyGPUtexture。8binding／各raw與finished兩份／196608保留CPUbytes；static/protected重frame不無故upload，切held家中還原raw、重入一次重套、dispose只移自己wrapper不踩後續owner。靜態Lucca/Marle/Frogcopy只在allowlist非held場景套用。

Canyonrearbank512×128、262144rawRGBA，一lazytexture/material/plane，z12.25 y1.6寬24高4，在原navigation之外，明暗岩層草緣alpha非矩形，中間低鞍保留關口。原camera/道路/collision不改；新原生構圖與遮擋仍待CI101。A/B/C樹冠、法庭配角／柱材、12室內root及植被材質全部沿用，不重做。

## 四、匯出與驗證

Build新增dist/art/production-vq04d四張768×512角色圖集與一山岸PNG＋manifest；512slots逐一明示256新與256沿用，pose/facing/frame/pivot和RGBAhash可對照，解碼逐byte同runtime。主assetsmanifest新增party-exploration-vq04d required/review；原required不刪。與原A/B/C匯出同CIartartifact，沒有新workflow或對話圖交付。

完整3292Node/613Python/assets/typecheck/build通過，新增72/4；635其他程式inputsbyteexact。全512actualupload／別名和unknownfailclosed／held還原重入／memory/dispose／PNG同源、八currentD場景pixels變但State／camera／geometry／diagnostics不變，三held家中fullframe包括返場維持Cexact。C舊component明确凍結，而D新測試跑真正目前ArtDirectedWorld；不拿baseline測試冒充新runtime。

D→C source-onlyinverse是列明檔案／唯一hunk／原sha驗證，拒絕native/image/game資料，沿用前版assertions；zlibJSON僅declaredhunk儲存格式。Initialsole問題在畫師補接地；offlinefixture隔離與lazy章節warm修正；Python3個predecessoraggregate問題以傳遞D新paths處理而非改原hash；所有失敗與最後成功logs保存。一次傳輸declaredspec文字有誤，未commit前以正確blob替換；最終src/scripts/tests/assets與整root全等已測bytes，只有一次sourcepush。

這些是OFFLINE作者與工程驗證，不是browser原生／真機批准。全角色戰鬥與敵人NPC、概念級場景／原速／連續遊玩／合法完整音訊聆聽／真機長時段仍open。

## 五、發布、前批限定接受與保存

VQ04D0.9.77 source **4620737f6434043dcea3cb8dcc63ea85e9dbf9c2**／tree **6259343245e0cba54242e0c042cc52e986e1b8ed**，parent80b5eef720ce53febd042dbe0d7d6730a991cfbc。24files一次nonforce，matching **CI101/36401626967** push/attempt1最後in_progress，updated2026-09-28T09:08:49Z。沒有manualdispatch／未發布candidate；文件commit只docs[skip ci]。

D最終包 **12mvODAj_eJDm4QqXA3ngep4YIPMawSeD**，2118560bytes，SHA9345767a477cd1f2a84edc23121707a63410c10d43ec6e87f567a9da0b162803，57manifest／664programsnapshot／5PNG／24changes／fullsuccessfailurelogs。2026-09-28T08:55:50.294141+00:00實際下載驗parent／size／hash／CRC／集合／snapshotbyte一致。review/program-vq04d.tar.gz不含docs，不能覆latestmain；早期19LxeQPjnK_RNUWR481j4A1BFT0pN4wKf被final取代，封裝false是歷史。

前批CI100/36349691934、Pages94/36352084356成功；選source0aefa412...與playable10942019762。三lane29entryhashsize、四縮圖scene、九Pagespayloadbyte同staged；空.nojekyll缺失明示。無新完整motionledger／video／listening／device批准。七原ZIP分 **1ZprgQapOyjY0abK834f7CMajh3h6DrRk**／65705629bytes與 **1GIEOtIaewwooaX3_a23y0TIj0qEP-MLi**／40284196bytes，各已實際下載外內CRC／共10manifest回驗。大合包失敗未上傳，不把local檔當cloud交付。完整hash與scope見DELIVERY_INDEX及evidence/CI100_PAGES94_REVIEW.json。

## 六、續作與完整分母

先接CI101 newnative／source／Pages，檢查新party方向接地與保留combat銜接、山岸／門／遠山，續完整角色／敵人NPC／剩餘早期場景尺度構圖。Pending留checkpoint不長poll，禁止重跑已完C、duplicateDsource或用證據注入湊通過。保留W/Y/B/C有界接受，CI93/95/98failure不回填，CI97仍provideronly；Tank/Yakrafull death/Henchoutgoing/Pdown/Qhurtsel native缺口仍open。

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06全時代主支線結局；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08全tests/onesource/matchingCI/cloudoriginalsreadback。既有13商品、裝備相容守恆、明示暫定400G／數值、7自製音型7段音樂16聲部/master.55等未改，詳封存白皮書；不能冒稱完整原作規則或聆聽已完成。

Heldprologue **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與母親家具不提升／間接替換。ROM/media/fonts/credentials私有。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆source/config、不bootstrap。所有成果GitHub或folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb／readback；main優先，臨時環境非權威。全品質flags仍false，score=null，releaseBLOCKED。
