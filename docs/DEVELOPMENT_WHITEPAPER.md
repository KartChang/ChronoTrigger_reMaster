# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02w-ci65-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI65_CHECKPOINT。沿用完整產品計畫；CI63/Pages57已接受，CI64是failure，W已發布待原生驗收。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與目前技術基準

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

最後完整技術accepted維持 **CI63／35807473251／U source1d2be87885c129442d6123625b030d599ed8db50／Pages57 35809349787**，見evidence/CI63_ACCEPTANCE.json。三job／13主報告／9原native chooser與完整CPU兩旅程／600／救援／審判、本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger139列與原12村莊PNG已閉環。playable/staged/deployed HTML5707852bytes，SHA256 1e8f3920a0c983606d31384e42024c331b0ea05d71272e8adfe92d82de61d4e4。60原CPU圖是7聯絡表＋另2張全解析度，不冒稱全60張皆全尺寸。CI62仍為已修正的歷史failure；不重開CI63/Pages57或更早。

## V保留內容與W低解析度地標修正

VQ02W／0.9.45 source **11ae55d6c90d8bb6eb5f6f75eed05993191bfa35**；root tree **faf4656e7b1eedecc9d808ac5c2896fccd6ee0b6**；parent **d900565412c6d74d60ea993e006086fb434fb915**。17檔一次non-force發布；368程式檔加當時main文件組成的tree與已測快照一致，main已回讀。唯一 **CI65／35859095751**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後queued/null，created/updated **2026-09-23T12:12:59Z**（台灣20:12:59）。只查一次，未讀CI65 jobs/artifacts/Pages；W尚未原生接受。

V八窗框＋八窗櫺共享64x64自製木紋，八pane共享32x32暖色玻璃；兩張nearest/opaque貼圖與真實owner快取保留。VillageDetail仍唯讀回傳vq02v-town-details／16+8使用量／RGBA／原招牌scene-matrix-projection。

W的runtime只改src/village-detail-art.ts之signScale **1.6→2.75**，固定比例，不依DPR或tier動態變形。原inn-sign／truce-inn-sign、80x40原pixels與material、anchor[-4.7,2.4,-3.4]、4vertices/6indices及Z scale1保留。V兩窗戶材質／16+8用途、S六建材／旅店原圖、T五花箱與排版、U暫停Space修正均不重做。不改相機、人物、CPU降級策略／sampling／pixelcap／memory、main/core/input/time/collision/save或原native路線。

CI64 **35847433193／V source3cf048e5debba3a679385112c21f45c55c5d0e19** 已completed/failure（updated2026-09-23T10:38:27Z）。validate job107136875166首先在step23「Verify same-source CPU sampling and native 600 AD continuation」失敗；不是native步驟21或暫停走位失敗。原era600 report雖status=passed且有三view，exact source gate在390x844／CPU auto1／249x540 canvas讀到sign **34.859999x17.430000px**，低於原40x20，拋出 **Town detail evidence: readable sign rectangle**。Desktop與短橫向分別65.393550x32.696772及44.980645x22.490322px。兩witness job成功，CPU rescue/trial跳過，adventure verifier下游失敗，沒有playable，不接受V或聲稱Pages完成。原始來源／reproduction／metadata差異見evidence/CI64_FAILURE.json。

原生取證路徑與12PNG不改。village-detail-evidence保持owner／RGBA／同canvas／inside／40x20／unclipped門檻，只在錯誤中附上實測projection、renderSize與required。cpu-era-evidence仍先跑完整原verifier，失敗時另寫source-failure.json，保留首個error/stack/observation及原report bytes/hash；不改原report／ledger，仍exit1。缺報告或保存失敗不能掩蓋原root；新增negative tests防止偽造passed。

完整npm run check通過：**1560 Node、360 Python、assets、typecheck、build、diff check**；比V新增25 Node／4 Python。追加三viewport／DPR1與2／auto0–3及quality、compatibility、回auto的42組離線production policy投影；最小167x361 canvas上40.184375x20.092188px，inside=true，原40x20門檻不降。原CI64失敗component用exact V verifier仍會被拒絕；DPR1/auto1的V離線投影與三張原觀察數值匹配。十章節除原sign scale外state／幾何保留，非Truce九章節像素一致，六次往返不累增mesh/texture。W→V精確列舉test-only inverse保留原hash與舊斷言，缺少／重複／其他修改拒絕。這是離線unit／policy驗證，不是新native／真機／全DPR保證；未開本機browser。前期本機測試與host中斷logs及最終完整成功log均保留。

模組邊界：W只有village-detail-art.ts的常數影響runtime；village-detail.ts、village-finish.ts、kingdom-render、角色、相機、CPU策略、輸入、core、存檔與碰撞均不變。原始native觀察不重寫；新的保存器只為失敗另存可追溯診斷，不把缺證据變成功。

## 驗收與接續

CI65 queued/in_progress只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run首個實際root與原artifact／source-failure，不放寬原斷言。Success依CI65_CHECKPOINT完成原reports／真圖／七ledger／正確Drive原ZIP回讀及matching Pages/source/HTML後才接受V/W。先親看2.75招牌的裁切、遮擋、畫面比例及三視窗可讀性，不因數值40x20就給美術分數；其後續前段人物植物道具、尺度輪廓、窄地標與鏡頭留白、完整動畫、合法音訊及有意義長時間／實體裝置觀察。直式人物偏小／留白仍未解決，不擴後段掩蓋前段品質。

原三job／13主報告／9native及完整CPU兩旅程／600／救援／審判、audio、actor.playback、HUD、normal-paused-reduced、grounded ATB、touch、equipmentv8/fulltrial，以及本人v4-v5-v7/alternate cell、67腿/4遇敵/2props/17里程碑/6窗口、七ledger與三viewport12PNG全部保留。42組離線tier/DPR投影不是新原生、任意裝置或美術品質證據。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。W包 **1BVuwwwOub4u88TkPWy-Zefq5hxRrLYnD／Chrono-CI64-failure-VQ02W-tested-batch.zip**，1043818bytes，SHA256 **e4b0bcdf3ee285daeaa9fe34c987c80bca92797a6f820c31db18500cd7af0fd9**；已下載回驗parent／hash／ZIP CRC／20manifest／368程式tar與Git blob。development/VQ02W-tested-program-snapshot.tar.gz是assembled已測程式快照，非published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，W已發布，不重送；最新文件讀GitHub main。

CI64未修改原browser ZIP **13ZHgUXvPFvpD2CJtEy5wu7gj_Sfy8HkU**，實際24221183bytes，SHA256 **b06fb1478f908a27c36338c070c5fb48c295d54617c7e741070f80fac52bc819**；已下載回驗parent／hash／CRC及source tree8741d19d6b9f2ca932db8c23a644a45448684472。GitHub artifact metadata曾報27269718bytes，但下載與Drive返回的實際bytes相同、digest吻合，以實際檔為準，不冒稱metadata一致。CI63舊包1Zltufu3mZ_mJqX1_zrt8eETvp8-uJuzJ已閉環，不需再下載。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
