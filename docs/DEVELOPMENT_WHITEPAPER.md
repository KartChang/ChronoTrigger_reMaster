# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-22-vq02r-ci60-pending。權威STATUS/TODO/IMMEDIATE_CONTINUATION/CI60_CHECKPOINT。完整原目標保留，舊批次歷史留Git，不重規劃或縮小範圍。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用，重用保存素材。七段自製短曲和靜音修正不是原作OST/完整配樂。材質語言、木料平塗、人物植物道具尺度輪廓、窄地標、升級母親家具、全動畫及聆聽品質仍有落差；held素材不得擅自提升。P不更動這些美術素材。

## CPU與Q最新技術基準

沿用先WebGL2/1、失敗再真正CPU triangle/texture/depth至Canvas2D。保留原pixel cap/tiers、32MiB/512entries、120活動FrameWindow、預設OFF的opaque-affine minification和nearest alpha輪廓。P的exact conservative row spans／packed clear減少無效候選工作，沒有降低畫質或改input/time；不將Node benchmark當原生FPS。

最後完整技術accepted為 **Q/0.9.39/sourcef0abb3ef0ecc67164031d0ac3b14b7333a13a8f9/CI59 35740055642/Pages53 35743956702**。三jobs、13primary、9原生chooser加原CPU/600/救援/審判、本人v4-v5-v7與alternate own cell鏈、原67腿/4遇敵/2props/17里程碑/6窗口全部核對。用exact Q原始source唯讀重算七ledger，逐byte相同，127列bytes/hash通過；39張CPU主原PNG已檢視。Pages prepare/deploy及公共HTTP step通過，playable/staged/deployed HTML同5695936bytes、SHA256 520c219ee39d26e013de34ab75675e7c21d081dabc916b1326108b63a53e6ae4。未做本機HTTP/browser。

Q七個48x64自製story NPC角色、四個fixed-tick pose、穩定腳底已整合並有同source原生觀察；尚無全美術approval。L/M/N/O/P的CPU完整前段相容旅程在Q本次通過，但歷史失敗不回填success。CPU61活動sample mean50.4066ms/P9565.8ms/max180.5ms/FPS19.8387；返鄉三120draw窗口FPS19.77/23.47/24.11，未來入口44.44/44.25/43.91。只為CI59當次有界觀察，非真機／長時間／穩定流暢承諾。前次回覆中斷之後舊STATUS還停CI58，本次按真正Q/CI59修正，不重新發布Q。

## R戶外材質一致性批次

本批改善僅限kingdom-render的托魯斯／森林戶外：384x352低頻地表色塊與稀疏草葉、64x80分組樹冠／枝幹樹根、24x32岩邊蕨類卡片。保留原painted route predicate、場景geometry/plane尺寸/物件座標/隨機序列消耗；不增加障礙或改角色尺寸。src/woodland-art.ts為可重用自製像素繪圖，src/kingdom-render.ts接用；共享pixel-art/world-art與prologue皆未改。

模組位置：src/woodland-art.ts負責固定尺寸authoring；src/kingdom-render.ts僅選擇這兩個戶外view的貼圖，保留原樹plane/rock/house位置、random消耗與幾何。原pixel-art/world-art、主角、室內及held prologue都不改。地面相鄰高頻變化下降由source測試確認，不等於原生可讀性已接受；樹冠與蕨類的實際遮擋／尺度仍看新CI。

view().storyNpcs.kingdom.woodland提供唯讀真texture尺寸、nearest/alpha、選定RGBA、active樹位置；offmap為null。原era600捕捉新增觀察，不增減動作、終點、預算；script/cpu-era父鏈額外驗真profile與pixels而非fixture。既有七ledger與39CPU主PNG門檻保留，新expected為明示source-authoring單元基準，不拿來製造native report或存檔。

最終1392Node/337Python/assets/typecheck/build/full npm check/diff check通過。新圖純CPU場景與exact Q對照確認geometry/state不变、僅兩戶外畫面改變；六次地圖往返不增加mesh/texture；nearest二元alpha、接地、快取上限、完整原painted路徑、失敗反例及held blob均保留。三個明列R接線反向还原至Q，再驗原P/Q及舊旅程hash；expected未換，缺少/重複hunk或其他檔案改動仍拒絕。初次unused import與預期source pin失敗已修正，原log保留，最終各check exit0。全部本機證據非browser／真機驗收。

R/0.9.40 source **f7de177305e46cf5d72a63968404d74451579677**；root tree **5f73024510d273a19f85e3a9f78eaa83598decf6**；parent **f0abb3ef0ecc67164031d0ac3b14b7333a13a8f9**。21檔一次non-force發布，main回讀且完整程式tree與已測版本一致。唯一 **CI60 35749870324**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1。最後in_progress/null，created2026-09-22T15:49:24Z，updated15:49:32Z（台灣23:49:32）。尚未查jobs或接受R；文件HEAD不是另一遊戲source。

## 驗收、後續與完整範圍

CI60必須完整原三job/13主流程/native+CPU/audio/actor/HUD/normal-paused-reduced/ATB/touch/v8/fulltrial和七ledger、本人v4-v7與alternatecell、67legs/4遇敵/2props/17PNG/6窗口，再檢視Rforest/truce畫面與真貼圖資料，下載保存同CI原始ZIP並核對Pages/source/HTML。Source=null本機HTML不作CIhash基準。待驗時保存接續，不長等或重派。

原生閉環後继续前段人物植物道具材質與尺度輪廓、窄視窗地標、全動畫與完整合法音訊聆聽，以及長時間與實體裝置觀察。六短窗口不是長時間；Q/R不是完整美術完成，綠勾不能縮小全遊戲scope。

T03：隱含規則、版本差異、完整拓樸與數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色與學習技能／雙三人技。T05：完整美術、動畫與合法音訊，前段實際品質優先。T06：完整未來及其餘時代主支線、結局。T07：完整範圍整體>=90、每面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次non-force source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮，2300抵達不是完整未來，舊30stale，沒有新美術90、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三及家中至2300、v1-v8裝備存檔；無branch/PR/P3/ARPG/框架重造。Held Z/升級母親家具不提升，src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變，不間接替換。禁止本機browser、可寫原生game/time/save/collision hook、假原生成功存檔、公開ROM/原始外部媒體/字型/憑證。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅恢復node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳。臨時容器不是authority。

## 持久交付

唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。最新Chrono-CI59-accepted-VQ02R-tested-batch.zip /16En-zDfwXGNnF2ozBrHlOjZ8KoFzEiK7，67658651bytes，SHA256 dce88526c8c33fd971aa9161af21161eaa06d237d650b2d814db882eadc00430。60manifest/325程式檔/七份未修改CI59及Pages53原ZIP，下載bytes/hash/CRC/全部manifest/rawZIP/parent均一致。recovery/VQ02R-tested-program-snapshot.tar.gz為assembled程式快照，不是published Gitarchive；不含進度docs（THIRD_PARTY除外）。包內source=null為發布前歷史，最新main文件補足實際身分，不重送已發布R、不用舊docs覆蓋進度。
