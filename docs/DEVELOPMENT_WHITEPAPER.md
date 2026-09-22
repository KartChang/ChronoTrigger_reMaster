# ChronoTrigger reMaster 開發白皮書

版本product-2026-09-23-vq02t-ci62-pending。Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI62_CHECKPOINT。沿用原產品計畫，不縮範圍；舊批次詳情保留於Git歷史，CI61正式結案見CI61_ACCEPTANCE。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用。七段自製短曲和靜音修正不是原作OST/完整配樂。材質一致性、人物植物道具尺度輪廓、窄地標、全動畫及聆聽品質仍有落差；held母親家具不得擅自提升。Q七個story NPC與四fixed-tick pose、R兩戶外地表／樹冠／蕨類已具實際技術證據，不等於全美術完成。

## CPU與目前技術基準

先WebGL2/1，失敗再真正CPU triangle/texture/depth至Canvas2D。保留640x480 pixel cap、最大邊1280、實際tiers、32MiB/512entries、120活動FrameWindow。CPU不做shadow map/glow/specular/postprocessing，不承諾WebGL同畫質或真機流暢。P exact conservative row spans／packed clear減少無效工作，不降低解析度或改input/time；Node benchmark不當原生FPS。J/K平滑預設OFF，opaque-affine縮圖連續混合，alpha/透視等保留nearest；關閉/dispose釋放mip。

CI61 / VQ02S / source9b9020e05b3c9c68aee378ceab74dc8fa4677c88 與 Pages55 已正式結案；收據 **docs/evidence/CI61_ACCEPTANCE.json**。三job、13主報告、9原native chooser加完整CPU兩旅程／600／救援／審判、同run本人v4-v5-v7及alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口保留。七ledger以exact S原始程式唯讀重算逐byte相同，133列bytes/hash一致；39主CPU圖及6張S新圖已檢視。S六材質／旅店招牌真實owner、尺寸、nearest-alpha/RGBA與三viewport全paused state、恢復及六PNG已驗。Pages55 35769247113 selected CI61/source正確，公共HTTP step成功；playable/staged/deployed HTML同5704004bytes，SHA256 bd23d550062b186cec198efa7879a5889cdf5c78e351562a38db078f2cd6a9e8。沒有本機browser/HTTP複跑，沒有美術或真機認證。不重開CI61/Pages55、CI60/Pages54或更早。

S六組64x64灰泥／木材／石材／石板瓦／陶瓦／木門與原80x40床圖示／手繪INN招牌已驗；沒有外部字型。VillageFinish限定原Truce mesh、六材質快取、原旅店plane/texture；三viewport全paused state及六PNG保留。S真圖顯示直式人物與招牌仍偏小，短橫向暫停卡下部控制在初始視區之外但原本有捲動，作為T排版依據。

## T可讀性與前段道具批次

T/0.9.42 source **85f35c062720ed494b9869488b0c39e94b7c82b4**；root tree **c8eadf451849aa2b7d6f5e9f0b1176a3294a5b33**；parent **44349c5c9b1a09b86b83607039d61758f86b8c47**。24檔一次non-force發布，349檔程式與已測快照匹配；main已回讀。唯一 **CI62 35776529708**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1；最後queued/null，created/updated **2026-09-22T19:52:01Z**（台灣2026-09-23 03:52:01）。只查一次，尚未讀jobs、artifacts或接受T。

T合併暫停卡響應式排版與既有五個托魯斯花箱材質。暫停卡所有原文字／選項保留，寬畫面雙欄、窄畫面單欄，控制目標至少44px，既有focus/scroll不改；標題用div隔離舊HUD全域header絕對定位與pointer-events:none。五花箱共用一張64x64自製不透明木紋／土壤／植栽貼圖，不增移mesh、不改角色尺度或S六建材／原旅店招牌。inspect新增vq02t-truce-planters／owner／五個mesh／nearest／RGBA。

模組邊界：index.html及src/render-status.css只改pause；src/village-planter-art.ts產出自製pixels；src/village-finish.ts只追加已存在flower-box材質與唯讀資源觀察。src/kingdom-render.ts、src/village-art.ts、角色、森林及原生game/input/time/save/collision不改。新單張材質快取共用，不造另一套場景。

同次原生托魯斯三viewport保留S原六PNG，另加Tab順序、Space切換與恢復、完整paused state、控制項命中與邊界／44px／font>=14觀察；各追加pause-controls-i.png與實際CPU的village-nearest-i.png，共六PNG，列入原era600 ledger的bytes/hash/IHDR。僅增加驗證，不刪原七ledger、原路徑或預算；失敗保留部分原觀察与第一個例外。這些新增native驗收尚待CI62，不是單元fixture或source預覽可代替。

完整npm run check通過：1462 Node、assets、typecheck、build；Python353與diff check通過。兩個初輪Node失敗為原paragraph結構與巢狀inverse token連續性，修正實作後通過；提交前另隔離global header衝突並重跑完整檢查。失敗及最終logs均保存。10章節對照保留S geometry/state和非托魯斯畫面，S六建材／招牌逐項相同，只有五花箱像素改變及一张共享貼圖；六次地圖往返不累增mesh/texture，32MiB/512上限不改。原hash不換，僅明列T逆向接線再驗S/R/P/Q原契約；缺少／重複／其他變更拒絕。沒有本機browser或T原生驗收。

## 驗收與後續完整範圍

CI62 pending只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure只處理同run第一個實際root及原artifact，不放寬原斷言或畫質。Success依CI62_CHECKPOINT完成全部原始報告、真圖、ledger、Drive原ZIP下載hash/CRC/parent與同CI Pages/source/HTML核對，不能只看綠勾。其後先依T真圖處理相容／可讀性，再續前段人物植物道具材質／尺度輪廓／窄地標／全動畫／合法音訊／有意義長時間和真機；直式人物與旅店招牌仍偏小，尚未解決最終窄地標品質。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，沒有新美術90分、長時間、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。Main only、one AI、non-force，無branch/PR/P3/ARPG/框架重造。本機browser禁用，不造原生game/time/save/collision state；不放寬.12、原tick預算、單一30秒、250ms/256或畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config或bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。

## 持久交付

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。T保存包 **Chrono-CI61-accepted-VQ02T-tested-batch.zip / 13Ink_1PPYbZNYBrHFi1Bau7RRj-p15uI**，**828192 bytes**，SHA256 **9b4985368a2cc0ba7d00d3590512002dd6d9b145be48d383743f526c4bcab3af**。已下載回驗bytes/hash/ZIP CRC/18項manifest/349程式檔hash與Git blob/parent。recovery/VQ02T-tested-program-snapshot.tar.gz為assembled程式快照，不冒稱published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，現已發布，最新進度讀main，不用舊包覆蓋docs。

CI61原始包1KA38Hu9qJ6HsnQqr8bAW1-kZQVAqCd87已驗70055052bytes／SHA256 9a751b9ea880c771fb410a620b9b75b7ea4e6608fd9a6e3e11460f845567d991／七原ZIP／26manifest／parent。T保存包包含24改檔、349程式快照、logs及標記非native的單元authoring preview；最新GitHub文件補足source/run身分，不把local source=null HTML當CI位元基準。
