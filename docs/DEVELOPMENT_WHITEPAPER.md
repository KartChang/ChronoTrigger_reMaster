# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02v-ci64-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI64_CHECKPOINT。沿用完整產品計畫；CI63/Pages57接受U及T保留內容，V已發布待原生驗收。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。


## CPU與目前技術基準

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

**CI63／35807473251／U source1d2be87885c129442d6123625b030d599ed8db50／Pages57 35809349787 已完整技術接受**，見evidence/CI63_ACCEPTANCE.json。三job成功，原13主報告、9原native chooser及完整CPU兩旅程／600／救援／審判保留。七ledger以exact U原始程式唯讀重算逐byte一致、139列bytes/hash相符；本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口均由原verifier驗證。三viewport各5個Tab/Space步驟維持完整paused state並恢復sampling/focus；原12張村莊PNG齊全。60張原CPU圖以7張聯絡表檢視，另2張原圖全解析度檢視；不冒稱60張皆全尺寸檢視。playable/staged/deployed HTML同5707852bytes，SHA256 1e8f3920a0c983606d31384e42024c331b0ea05d71272e8adfe92d82de61d4e4，Pages公共HTTP步驟成功。無本機browser/HTTP複跑，無新美術／長時間／真機認證。CI62仍是歷史failure，其U修正已由CI63接受；不重開CI61或更早。

## V前段窗戶與旅店辨識度批次

VQ02V／0.9.44 source **3cf048e5debba3a679385112c21f45c55c5d0e19**；root tree **8741d19d6b9f2ca932db8c23a644a45448684472**；parent **6ae32507b65293825d1c0a4dc538caf55b09ac77**。18檔一次non-force發布；360程式檔及最新main文件組成的tree與已測快照一致，main已回讀。唯一 **CI64／35847433193**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後queued/null，created/updated **2026-09-23T10:12:20Z**（台灣18:12:20）；只查一次，未讀CI64 jobs/artifacts/Pages，V尚未原生接受。

V沿用原旅店80x40圖、material、anchor[-4.7,2.4,-3.4]、4vertices/6indices，只將原inn-sign的XY scale由1改1.6（Z仍1），不是新招牌或新字型。八window框與八mullion共用一張64x64自製木紋，八glass共用一張32x32暖色窗玻璃；兩張nearest、opaque貼圖同owner快取。不增移mesh、不改碰撞／人物尺度／相機；S六建材和招牌原pixels、T五花箱、U暫停路由全保留。

VillageDetail唯讀inspect新增vq02v-town-details、真實owner／兩resource／16+8使用量／RGBA與原招牌transform及scene-matrix-projection。既有三次原生Truce視窗仍要原12PNG、T控制項及U逐鍵state；只增加新材質與招牌投影屬於同CPU canvas、無裁切、至少40x20px的斷言，不替代原門檻。

完整npm run check通過：**1535 Node、356 Python、assets、typecheck、build、diff check**；比U新增48 Node。十章節離線對照除原招牌scale與24窗戶材質外，state／幾何／其餘material和像素不變，非Truce九章節pixels一致；六次地圖往返不增加mesh/texture。三種視窗離線投影通過，但矩形Canvas unit port不等於原生畫面。T/S/R歷史對照改用精確反向還原的U world，原assert與hash不改，V另驗唯一明列的差異；缺少／重複／其他修改拒絕。held prologue blob2711a74185aacf3c6bddf9db85ba99a2afbc507a未變。

模組邊界：village-detail-art.ts只產生自製pixels；village-detail.ts只綁定既有Truce窗戶及原招牌，先驗完整owner才分配resource；village-finish.ts只接入與回傳details。kingdom-render／角色／相機／輸入／core／save／碰撞不改。script僅新增原生視窗證據門檻與版號，測試的歷史逆向只供離線對照，不改native觀察或原hash。

## 驗收與接續

CI64 pending只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure只處理同run第一個實際root及原ZIP，不放寬斷言。Success依CI64_CHECKPOINT完成原reports／真圖／七ledger／原ZIP Drive回讀／matching Pages與HTML後才接受V。下一批先看V原生招牌裁切／遮擋／可讀性，再續前段人物植物道具材質、尺度輪廓、窄地標／鏡頭留白、全動畫與合法音訊。直式人物偏小／留白未解決，窗戶或招牌改良不等於前段美術90分。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。CI63七原ZIP與review包 **1Zltufu3mZ_mJqX1_zrt8eETvp8-uJuzJ／Chrono-CI63-VQ02U-evidence.zip**，68549728bytes，SHA256 79cab3b7a41f3080b35689c97ba469522675b3e62ad8bb8e1840c2d4873d7946；下載回驗parent／hash／CRC／22manifest／7內層ZIP。V已測包 **1H1NrWpgkA3dMXrnvm819Vw-8x4zrUpX2／Chrono-CI63-accepted-VQ02V-tested-batch.zip**，770020bytes，SHA256 862fc920a1725a13c13762bef398f7ad3e57ce162f5600d5658298660e7d6ee7；下載回驗parent／hash／CRC／20manifest／360程式tar與Git blob。development/VQ02V-tested-program-snapshot.tar.gz是assembled已測程式快照，非published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史；V已發布，不重送。最新文件讀main。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM不重傳，ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
