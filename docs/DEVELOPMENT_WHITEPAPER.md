# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02s-ci61-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI61_CHECKPOINT。更新原產品計畫，不重規劃、不縮範圍；R詳細歷史保留於8b950ea2a8122b69c19b955c6163a403ba9ff2d4。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與R最新技術基準

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D。保留640x480 pixel cap、最大邊1280、實際tiers、32MiB/512entries、120活動FrameWindow。CPU不做shadow map/glow/specular/postprocessing，不承諾WebGL同畫質或真機流暢。P exact conservative row spans／packed clear減少無效工作，不降低解析度或改input/time；Node benchmark不當原生FPS。J/K平滑預設OFF，opaque-affine縮圖連續混合，alpha/透視等保留nearest；關閉/dispose釋放mip。

最後完整技術accepted：**R/0.9.40/source f7de177305e46cf5d72a63968404d74451579677 / CI60 35749870324 / Pages54 35753711429**。CI60三job成功；原13主流程、9原native加完整CPU兩旅程／600／救援／審判、本人v4-v5-v7及alternate own cell鏈、67原adventure腿／4遇敵／2props／17里程碑／6窗口保留。原始source唯讀重算七ledger逐byte相同，127列bytes/hash一致；39主CPU PNG已檢視。R森林／托魯斯真貼圖profile、384x352地表、64x80樹冠、4／12棵active樹與nearest alpha/RGBA已驗。Pages prepare/deploy及公共HTTP step成功，playable/staged/deployed HTML同5699662bytes、SHA256 979e8b282259e246831abeb53460fab2cce37134deb3476464b265ae13817442。沒有本機HTTP/browser驗收，不代表美術90、真機或長時間流暢。

CI60六個有界活動窗口與逐幀資料留在雲端CI60_ACTIVE_OBSERVATIONS；不冒稱長時間、RSS或實體裝置測試。R原森林路徑、幾何與角色尺度不變；真圖顯示低頻地表與成組樹冠較安靜，托魯斯建築平塗及旅店小字仍待改善，為S工作依據。

## S城鎮材質與窄畫面觀察批次

S完成托魯斯六組64x64自製材質（灰泥、木材、石材、石板瓦、陶瓦、木門），原80x40旅店招牌改為床圖示與手繪像素INN，沒有外部字型。VillageFinish僅接到既有托魯斯mesh，不改幾何、位置、角色尺度、森林或NPC。六材質快取重用；原旅店plane/texture重用。原600旅程同次托魯斯到訪加原生暫停後960x640／390x844／844x390觀察，各留DOM與實際CPU canvas PNG，完整state凍結，恢復原viewport並原生resume；失敗保留部分觀察。七ledger不減，新增village profile／材質owner／尺寸／nearest-alpha／RGBA及3view/6PNG bytes/hash/IHDR檢查。Source preview及單元fixture不是原生成功證據。

模組：src/village-art.ts負責自製像素，src/village-finish.ts管理既有mesh材質與唯讀profile，src/kingdom-render.ts限定托魯斯接線。沒有外部原圖／ROM／字型，沒有新增障礙、門口或幾何，不改房屋位置、森林畫面、NPC與原生路線。原state及quality tiers不變。

tests/village_capture.py在原生托魯斯到訪中讀取實際畫面，暫停後三viewport，各輸出DOM PNG與直接由實際CPU canvas匯出的PNG，不隱藏overlay或改遊戲state。逐view state等於paused基準，結束恢復960x640及native resume；錯誤仍保留已取得觀察與第一個例外。新增verifier強制profile vq02s-town-craft、六材質使用數、像素／尺寸／nearest／alpha與檔案hash/IHDR；單元像素期望是authoring baseline，不能生成成功native報告。

已恢復前輪完整通過的 **1415 Node／345 Python／assets/typecheck/build/full npm check/diff check** 版本（新增23 Node／8 Python）。本輪沒有重寫或重跑S整套；以23改檔及338檔程式快照的完整Git tree確認與已測bytes完全相同。前輪兩次local host中斷不是CI failure，最終npm-complete.exit=0及python-final.log已保存。十章節對照與六次地圖往返保持geometry/state、僅托魯斯pixels改變，mesh/texture不累增、32MiB/512上限不改。歷史expected hash不換；只反向明列S接線，再驗R/P/Q舊契約，缺少／重複／其他改動仍拒絕。沒有本機browser或S原生驗收。

S/0.9.41 source **9b9020e05b3c9c68aee378ceab74dc8fa4677c88**；root tree **432ce1a0a42bb35f392601eaee774123dffb4684**；parent **8b950ea2a8122b69c19b955c6163a403ba9ff2d4**。23檔一次non-force發布，main已回讀，完整程式樹匹配已測338檔。唯一 **CI61 35765515107**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1。最後in_progress/null，created2026-09-22T18:11:14Z，updated18:11:19Z（台灣2026-09-23 02:11:19）。尚未讀jobs或接受S；文件HEAD不是另一遊戲source。

## 驗收與後續完整範圍

CI61先依checkpoint完成原suite與新3view/6PNG／實際材質驗收及matching Pages。之後只按真圖處理相容／可讀性問題，再依既有TODO改善前段人物植物道具材質、尺度輪廓、窄地標、完整動畫／合法音訊與有意義長時間／真機觀察。六短窗口不等於長時間認證，不因綠勾擴後段；不預設開平滑、不提升held家中素材。

CI61仍須原三job／13主流程/native+CPU/audio/actor/HUD/正常暫停減動態/ATB/touch/equipmentv8/fulltrial、七ledger所有hash、同run本人存檔鏈與原67腿、17milestones、六窗口及R woodland。新S三viewport／六PNG不可省；原始雲端與同CI Pages/source/HTML匹配後才能接受S。Pending保存接續，不等待到中斷；failure按首個實際root，不放寬。

T03：隱含規則、版本差異、全拓樸與數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色與學習技能／雙三人技。T05：完整美術、動畫與合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線、結局。T07：完整範圍整體>=90、每面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次non-force source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來；舊30stale，沒有新美術90、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三及家中至2300、v1-v8裝備存檔。無branch/PR/P3/ARPG/框架重造。Held Z/升級母親家具不提升；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變，不間接替換。禁止本機browser、可寫原生game/time/save/collision hook、假原生成功存檔、公開ROM/原始外部媒體/字型/憑證。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳。臨時容器不是authority。

## 持久交付

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新程式恢復包 **Chrono-CI60-accepted-VQ02S-tested-batch.zip / 11X_BtNMbdeJHKiIQMMwuSUYpTci-alZq**，67039136bytes，SHA256 **3c03bb97fd4185a3af6b2bf86741e28d64f318bb90ec0462dc22857b5eea5f5b**。本輪由Drive下載核對bytes/hash/ZIP CRC/52manifest/七未修改CI60與Pages54原ZIP/parent，全部一致。recovery/VQ02S-tested-program-snapshot.tar.gz含338程式檔，是assembled快照而非published Gitarchive，不含進度docs（THIRD_PARTY除外）。包內source=null為前輪發布前歷史；S現已發布，最新GitHub文件補足身分。不要重送S或用舊docs覆蓋進度。
