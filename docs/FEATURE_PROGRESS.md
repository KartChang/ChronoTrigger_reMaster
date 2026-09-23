# 功能進度 — U/T已驗；V受CI64阻擋；W已發布待CI65

Current root：**T05-early-visual-cohesion**。Execution terminal：**CI65-pending-full-validation**。Authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI65_CHECKPOINT。文件HEAD不是另一遊戲source。

VQ02W／0.9.45 source **11ae55d6c90d8bb6eb5f6f75eed05993191bfa35**；root tree **faf4656e7b1eedecc9d808ac5c2896fccd6ee0b6**；parent **d900565412c6d74d60ea993e006086fb434fb915**。17檔一次non-force發布；368程式檔加當時main文件組成的tree與已測快照一致，main已回讀。唯一 **CI65／35859095751**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後queued/null，created/updated **2026-09-23T12:12:59Z**（台灣20:12:59）。只查一次，未讀CI65 jobs/artifacts/Pages；W尚未原生接受。

## 本批功能與證據界線

W的runtime只改src/village-detail-art.ts之signScale **1.6→2.75**，固定比例，不依DPR或tier動態變形。原inn-sign／truce-inn-sign、80x40原pixels與material、anchor[-4.7,2.4,-3.4]、4vertices/6indices及Z scale1保留。V兩窗戶材質／16+8用途、S六建材／旅店原圖、T五花箱與排版、U暫停Space修正均不重做。不改相機、人物、CPU降級策略／sampling／pixelcap／memory、main/core/input/time/collision/save或原native路線。

原生取證路徑與12PNG不改。village-detail-evidence保持owner／RGBA／同canvas／inside／40x20／unclipped門檻，只在錯誤中附上實測projection、renderSize與required。cpu-era-evidence仍先跑完整原verifier，失敗時另寫source-failure.json，保留首個error/stack/observation及原report bytes/hash；不改原report／ledger，仍exit1。缺報告或保存失敗不能掩蓋原root；新增negative tests防止偽造passed。

完整npm run check通過：**1560 Node、360 Python、assets、typecheck、build、diff check**；比V新增25 Node／4 Python。追加三viewport／DPR1與2／auto0–3及quality、compatibility、回auto的42組離線production policy投影；最小167x361 canvas上40.184375x20.092188px，inside=true，原40x20門檻不降。原CI64失敗component用exact V verifier仍會被拒絕；DPR1/auto1的V離線投影與三張原觀察數值匹配。十章節除原sign scale外state／幾何保留，非Truce九章節像素一致，六次往返不累增mesh/texture。W→V精確列舉test-only inverse保留原hash與舊斷言，缺少／重複／其他修改拒絕。這是離線unit／policy驗證，不是新native／真機／全DPR保證；未開本機browser。前期本機測試與host中斷logs及最終完整成功log均保留。

CI64 **35847433193／V source3cf048e5debba3a679385112c21f45c55c5d0e19** 已completed/failure（updated2026-09-23T10:38:27Z）。validate job107136875166首先在step23「Verify same-source CPU sampling and native 600 AD continuation」失敗；不是native步驟21或暫停走位失敗。原era600 report雖status=passed且有三view，exact source gate在390x844／CPU auto1／249x540 canvas讀到sign **34.859999x17.430000px**，低於原40x20，拋出 **Town detail evidence: readable sign rectangle**。Desktop與短橫向分別65.393550x32.696772及44.980645x22.490322px。兩witness job成功，CPU rescue/trial跳過，adventure verifier下游失敗，沒有playable，不接受V或聲稱Pages完成。原始來源／reproduction／metadata差異見evidence/CI64_FAILURE.json。

CI63/Pages57接受U原生暫停操作與T排版／五花箱、七ledger139列；V/W仍待新run完整證據。既有家中至2300、雙人合作、第三同伴、fixed ATB、裝備v8及故事流程全部保留。本批没有增加故事章節、完整成長或全遊戲完成聲明。

CI65 queued/in_progress只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run首個實際root與原artifact／source-failure，不放寬原斷言。Success依CI65_CHECKPOINT完成原reports／真圖／七ledger／正確Drive原ZIP回讀及matching Pages/source/HTML後才接受V/W。先親看2.75招牌的裁切、遮擋、畫面比例及三視窗可讀性，不因數值40x20就給美術分數；其後續前段人物植物道具、尺度輪廓、窄地標與鏡頭留白、完整動畫、合法音訊及有意義長時間／實體裝置觀察。直式人物偏小／留白仍未解決，不擴後段掩蓋前段品質。

## 完整剩餘功能

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

程式、失敗與成功logs、368檔恢復快照已存Drive 1BVuwwwOub4u88TkPWy-Zefq5hxRrLYnD並下載回驗；CI64未修改原browser ZIP為13ZHgUXvPFvpD2CJtEy5wu7gj_Sfy8HkU。包內null source是發布前歷史，最新進度讀main，不覆舊文件。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
