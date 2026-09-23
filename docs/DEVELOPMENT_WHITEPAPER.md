# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02x-ci66-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI66_CHECKPOINT。完整产品目標不縮；CI65/Pages59接受W/V，X已發布待原生驗收。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與保留美術

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D，與WebGL使用同場景／規則。640x480 pixel cap、最大邊1280、原tiers、32MiB/512entries、120活動FrameWindow不改。CPU沒有shadow map/glow/specular/postprocessing，不承諾同畫質或真機流暢。P row spans／packed clear優化保留；J/K平滑預設OFF，opaque-affine縮圖混合，alpha／透視等仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

S六組64x64建材與原80x40自繪INN/床圖、T五花箱及響應式pause、U checkbox Space原生修正、V八窗框＋八窗櫺共享64x64木紋與八pane共享32x32暖色玻璃、W原inn-sign固定XY2.75全部保留。招牌原anchor[-4.7,2.4,-3.4]、4vertices/6indices、Z1不改。W原40x20 gate與source-failure獨立first-error/exit1保存器仍生效，原報告不改寫。CI62/CI64失敗紀錄仍留於各FAILURE收據；修正成功不回填成歷史success。

## 目前技術基準

**CI65／35859095751／W source11ae55d6c90d8bb6eb5f6f75eed05993191bfa35／Pages59 35862694649已正式技術接受**，收據evidence/CI65_ACCEPTANCE.json已獨立發布於028052e37af97670f4d941550a0dce503bee2638並回讀。三job／13主報告／9原native chooser與完整CPU兩旅程／600／救援／審判保留；七ledger以exact W程式唯讀重算逐byte一致，139列bytes/hash相符。本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、U逐鍵及三view12PNG完整。W招牌2.75與V窗戶均通過原owner/RGBA/40x20/inside門檻。playable/staged/deployed HTML同5711878bytes、SHA256 996400b0548762dfa446eec412ac02eec0f3f555db8c4c2e1a68a043e475ea86，Pages公共HTTP步驟成功。77張原CPU圖以7聯絡表檢視，另3張村莊canvas全解析度檢視，非全77張全尺寸。CI64仍為已修正的歷史failure，不重開CI65/Pages59或更早。

## X直式構圖批次與模組邊界

VQ02X／0.9.46 source **e18ac52e5ad37b0259ef1f27ce40c3d6fb9f6ef4**；root tree **eb8399aae63fa07d672aa865933e0bd28e841690**；parent **028052e37af97670f4d941550a0dce503bee2638**。23檔一次non-force發布，377程式檔及當時main文件組成的tree與已測快照一致，main已回讀。唯一 **CI66／35875725015**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source全event/state count1。最後queued/null，created/updated **2026-09-23T14:38:56Z**（台灣22:38:56）。只查一次，未讀CI66 jobs/artifacts/Pages；X尚未原生接受。

Runtime只改src/render.ts與新增src/town-camera.ts，限定Truce且實際canvas寬高比<.85。讀取現有可見P1/P2／第三同伴的mesh頂點及距P1<13的原inn-sign，重用EarlyCameraMotion與既有安全約束；最小half7.2，雙人分離時可立即擴展，不以zoom ceiling裁切P2。保留normalized HUD bounds [.045,.955,.12,.80]、fixed-tick平滑、重置／resize／reduced-motion。只改構圖，不改人物尺度、招牌2.75／pixels／anchor、任何材質或場景幾何、main/core/input/time/save/collision及CPU tiers／pixelcap／memory。其他章節與Truce橫向走原鏡頭。

同一次原生Truce暫停與三viewport，原12PNG／Tab-Space／全state／恢復viewport及native resume不變，只追加beforeCamera／每view camera／afterCamera唯讀原觀察。source verifier增加同CPU buffer ratio、同frozen tick、P0/可用P1/nearby inn實際投影位於HUD安全區、直式P0高度>=30px、兩條獨立inn投影一致及原橫向鏡頭幾何完全恢復。原40x20招牌／七ledger／所有舊旅程斷言保留；失敗保留真實觀察與first-root。新門檻不是美術分數，離線fixture不是原生證據。

完整npm run check通過：**1609 Node、364 Python、assets、typecheck、build、diff check**。比W新增49 Node／4 Python。離線production policy的DPR1/2、tiers/modes、雙人分離、暫停／橫直回復、九個非Truce章節兩方向pixels與幾何、Truce橫向pixels、六次warm-cache往返均已驗。X→W精確列舉source-only inverse保留原hash與negative assertions；W負測試先回到exact W文字再突變，防止X已換字串造成no-op。新鏡頭算術單元比較容許16*Number.EPSILON浮點誤差，原CPU pixels與game state仍exact；不是放寬原走位／時間門檻。兩次本機host中斷不算通過，首輪完整check四個失敗已修正，最終check-locked.log全通過；失敗與成功logs全保存，未開本機browser。

## 驗收與剩餘完整範圍

CI66 queued/in_progress只保存與回報，不長等／輪詢／rerun／dispatch／cancel或另推source。Failure處理同run首個實際root與原artifact/source-failure，不放寬斷言或造狀態。Success依CI66_CHECKPOINT驗完整原reports／實際畫面／七ledger／原ZIP Drive回讀／matching Pages/source/HTML，才接受X。先親看直式P1/P2、招牌比例遮擋、鏡頭留白及移動舒適性，再續前段人物植物道具、完整動畫與合法音訊、長時間及真機；不能以新投影數字或綠勾宣稱前段美術90分。招牌覆蓋部分屋牆、其他站位遮擋與全遊戲美術仍待處理。

原三job／13主報告／9native與完整CPU、audio/actor.playback/HUD/normal-paused-reduced/ATB/touch/equipmentv8/fulltrial、本人存檔鏈／67腿／4遇敵／2props／17里程碑／6窗口及七ledger每byte/hash均保留。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，不是本批分數；無新美術90分、長時間、真機或全遊戲認證。

## 持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。CI65原始證據包 **1CgCUvasru_dmbtH7fVFMDVR11gTXSrBA／Chrono-CI65-VQ02W-evidence.zip**，68574605bytes，SHA256 7068c5fbe2c58b6c4a3506f1cdeb51da265ba5297a85d70af16729591897a590；已下載回驗parent/hash/CRC/20manifest/7未修改原ZIP。X已測包 **12cLTT6A7wH-1NsYesWZaRAsdnriyWoH1／Chrono-CI65-accepted-VQ02X-tested-batch.zip**，842490bytes，SHA256 003e77103ddc709d48aba9ead9abe3665a986455adfb8377ba0897c0eeccf1f0；已下載回驗parent/hash/CRC/18manifest/377程式tar及Git blob。development/VQ02X-tested-program-snapshot.tar.gz是assembled已測程式快照，非published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，X已發布不重送；進度只讀最新main。

Main only、single AI、non-force；無branch/PR/P3/ARPG/框架重造。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔保留。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
