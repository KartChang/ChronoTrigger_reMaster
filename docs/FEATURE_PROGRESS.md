# 功能進度 — U/T已驗；V已發布待CI64

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI64_CHECKPOINT。

VQ02V／0.9.44 source **3cf048e5debba3a679385112c21f45c55c5d0e19**；root tree **8741d19d6b9f2ca932db8c23a644a45448684472**；parent **6ae32507b65293825d1c0a4dc538caf55b09ac77**。18檔一次non-force發布；360程式檔及最新main文件組成的tree與已測快照一致，main已回讀。唯一 **CI64／35847433193**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後queued/null，created/updated **2026-09-23T10:12:20Z**（台灣18:12:20）；只查一次，未讀CI64 jobs/artifacts/Pages，V尚未原生接受。

## 新功能與既有功能界線

V沿用原旅店80x40圖、material、anchor[-4.7,2.4,-3.4]、4vertices/6indices，只將原inn-sign的XY scale由1改1.6（Z仍1），不是新招牌或新字型。八window框與八mullion共用一張64x64自製木紋，八glass共用一張32x32暖色窗玻璃；兩張nearest、opaque貼圖同owner快取。不增移mesh、不改碰撞／人物尺度／相機；S六建材和招牌原pixels、T五花箱、U暫停路由全保留。

VillageDetail唯讀inspect新增vq02v-town-details、真實owner／兩resource／16+8使用量／RGBA與原招牌transform及scene-matrix-projection。既有三次原生Truce視窗仍要原12PNG、T控制項及U逐鍵state；只增加新材質與招牌投影屬於同CPU canvas、無裁切、至少40x20px的斷言，不替代原門檻。

完整npm run check通過：**1535 Node、356 Python、assets、typecheck、build、diff check**；比U新增48 Node。十章節離線對照除原招牌scale與24窗戶材質外，state／幾何／其餘material和像素不變，非Truce九章節pixels一致；六次地圖往返不增加mesh/texture。三種視窗離線投影通過，但矩形Canvas unit port不等於原生畫面。T/S/R歷史對照改用精確反向還原的U world，原assert與hash不改，V另驗唯一明列的差異；缺少／重複／其他修改拒絕。held prologue blob2711a74185aacf3c6bddf9db85ba99a2afbc507a未變。

CI63/Pages57接受U原生暫停操作与T排版／五花箱，完整原suite與139列ledger已閉環，見CI63_ACCEPTANCE。V仍待自己的原生證據；U截圖不能代替V。原家中至2300、雙人操作、第三同伴、ATB、裝備v8與全部既有故事流程保留。沒有新故事範圍、完整成長或全遊戲完成聲明。

CI64 pending只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run第一個實際root及原ZIP，不放寬斷言。Success依CI64_CHECKPOINT完成原reports／真圖／七ledger／原ZIP Drive回讀／matching Pages與HTML後才接受V。下一批先看V原生招牌裁切／遮擋／可讀性，再續前段人物植物道具材質、尺度輪廓、窄地標／鏡頭留白、全動畫與合法音訊。直式人物偏小／留白未解決，窗戶或招牌改良不等於前段美術90分。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

程式、logs及360檔恢復快照已存Drive 1H1NrWpgkA3dMXrnvm819Vw-8x4zrUpX2並回驗；原CI63/Pages57完整包1Zltufu3mZ_mJqX1_zrt8eETvp8-uJuzJ。最新進度讀main，舊包不覆蓋文件。
