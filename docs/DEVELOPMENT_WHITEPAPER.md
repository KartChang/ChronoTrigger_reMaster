# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq01t-ci37-handoff。更新既有進度，不重新規劃。精確source／run／下一步以STATUS及IMMEDIATE_CONTINUATION為準，不必重讀歷史。前版完整白皮書保留於commit997a2a2d127150c68d9b7cfe0ef954185bc41a1c；舊pending與工具清單限制已非目前狀態。

## 目標、順序與固定技術

完整《超時空之鑰》HD-2D重製目標不縮小：像素人物＋立體場景、保留原作辨識度、縮尺大地圖與城鎮／室內切換、原地ATB、單人與同機雙人共用畫面。合作不等於改ARPG。完整時代、主線、支線與結局都保留。

最高優先仍是前幾幕的場景、人物、圖檔、建模、動畫、鏡頭、遮擋、HUD與操作舒適度，先取得實際證據支持的90分以上，再擴充後段劇情與系統。這是執行順序，不是把完整版縮成序章。

沿用TypeScript＋Babylon.js＋esbuild自含HTML；Node為建置工具，Python／Playwright為驗收工具，玩家不需Python、ROM、帳號或後端。固定package/lock版本；不更換Unity／Three.js，也不引入.NET／SQL／RAG／SaaS或平行框架。

Controls→main固定1/60秒步長→core規則→render/HUD呈現。傷害、資源與事件不由畫面決定。暫停／背景／對話／背包／原生選檔不推進模擬；恢復不補算背景時間。InputBoundary清除場景及劇情邊界的舊輸入；A*用既有碰撞，不瞬移、不穿牆。

P1克羅諾／P2露卡及依劇情加入離隊的控制權保留；青蛙或瑪兒為有HP／MP／ATB、可被敵方選中及自主行動的第三同伴，不是P3或完整自由換人。保留獨立選敵與雙確認合技；不得以測試需求改數值、放寬業務條件或刪斷言。

## 已有內容與不可重做範圍

連貫路線已存在：家中醒來／上下樓→縮尺區域地圖→千年祭初遇與行為→傳送異變→600山道／托魯斯／森林／王城→露卡→修道院／青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援與返鄉→護送被捕／證詞與兩裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。不得依舊pending或舊失敗重新建立。2300抵達不是完整未來篇；經驗記錄不是等級系統。

原有裝備與梅爾基歐商店已在：角色相容、武器／身體／頭部、穿戴份數、金幣／庫存守恆及交易上限由規則管理，不能賣仍穿戴的裝備。400G初始旅費、13項商品、價格與普通攻擊／防禦加減值是明示暫定重建，不是假稱原作數值。完整成長、技能學習、戰鬥金幣、飾品、自由換人並未完成。

IndexedDB與JSON白名單v1–v8保留：技術村落、千年祭、異變山道、王國、救援、序章、審判越獄與裝備外層。舊檔沒有的行為仍未知，不補造證詞；僅查看不強迫改寫存檔。守恆不是簽章防作弊，匯入自己的舊檔是合法回溯。驗收snapshot／paused／view僅供讀取，不得設通關旗標、修改進度或製造正向存檔。

## 前段品質工作與目前驗收邊界

最新閉環為 **0.9.16／CI36 35525474467／Pages30 35527138223**，source4029c82ec0568dff0f687be6fa0947256b63350c、tree3dd6c5d2f8b912ad7a3ed0386562ff9c156c1651。三job、13主旅程、9原生選檔紀錄、3來源驗證紀錄與報告bytes/hash通過。6guide／6quiet、18工具列、12鏡頭及地面三視窗通過；靜態地面checksum c0d62fe9與完整暫停不變，人物接地／真正ATB突進／原生匯入清理、裝備經濟／v8／IndexedDB／勝利／完整trial-report和既有劇情都保留。12鏡頭與guide/quiet部分覆蓋重疊，不灌成額外獨立旅程。

Pages30 prepare106121155726／deploy106121189437成功；staged10609853342與playable10609747917、來源／CI36一致。HTML5621452bytes、SHA256cda87f62f553247de4bad7430f196b1a8f19de92fd051e4a6fe616d7dceef25f逐byte一致。公開HTTP由成功deploy步驟於2026-09-20T17:50:53Z檢查；沒有第二次本機即時瀏覽器驗證。Pages工作流HEAD997a是文件來源，不是遊戲source，兩者不同不需重跑。

前次已完成的原始畫面與技術檢查本次补齊指定Drive保存、回讀與main收據，見CI36_ACCEPTANCE.json／CI36_VISUAL_REVIEW.md／PAGES30_PROVENANCE.json。三張全尺寸地面與六張其他畫面可見地面、透明棚布與人物保留；靜態圖不證明時間抖動、FPS、記憶體或原汁原味分數。直向探索底部角色名稱與操作提示擁擠是已知畫面缺口，非當時已有DOM量測；CI36圖片沒有VQ01T新排版。閉環只接受既有可玩路線與source部署，不是全作、美術90或真機驗收。CI35／Pages29、CI28／Pages22及更早已關閉工作不重開。

已保存並整合的VQ01A/B/C四主角48×64畫筆、固定tick鏡頭、腳底支點／突進陰影、祭典NPC接地、獨立輸入／modal／選單／交易舒適度保留。VQ01P祭典曲面棚布、鐘、傳送器、貨物、販商與人物前方棚布淡化已存在；VQ01Q三job工作量平衡、來源完整報告檢查與VQ01R安全走道／鬆鍵診斷不重做。

VQ01S地面保留鋪面畫筆、尺寸／位置／碰撞；靜態頂點明暗區分走道／鐘前與外緣，32細分／1089頂點／2048三角形及不可變不透明buffer。地面mipmap／anisotropy4，人物仍nearest；沒有額外覆蓋網格、紋理、碰撞或逐幀地面上傳。幾何與mipmap成本仍待真機量測。完整保存美術還有房間材質、分件家具、陶器、布料、母親與前景淡化等，A→B→C工作鏈存在；家中整合仍部分受限，不重畫。歷史43／31差異不是目前缺少檔案數；沒有通用OBJ回匯、全NPC動作或完整音樂完成宣稱。圖集／模型／測試數不等於美術分數。

## 本批已發布 VQ01T／0.9.17

十一份先前未發布的增量已原樣恢復、重新測試與正式非force發布，source **e2bc7e8b19d535ec4072fa5dd68ab4ff24e1929c**、tree **77f9c36c3749b7729e469445de52e10031531f23**。唯一 **CI37 35530142731**，push/attempt1，最後觀察in_progress/null，建立2026-09-20T18:46:29Z、updated18:46:32Z。前次未提供write工具的限制已解除，不能再把此批標為未發布，也不能重做。

探索底部flow整合提示／原生互動按鈕／角色名稱／第三同伴／操作說明／頁尾，窄版換行，最小44px互動按鈕，純文字不接管pointer。開始與戰鬥保留display:contents及原本間距。main.ts只改layoutFeedback與ResizeObserver，以實際底部高度計算探索訊息／觸控間距；新測試正規化這段後比對整份原main雜湊，確定核心、輸入、存檔都未改。受限renderer、其他renderers／畫筆／相機不變。

新增實際DOM文字Range範圍、裁切／重疊與原生按鈕九點命中驗證，接入既有初遇與棚布旅程。五尺寸1365×900／390×844／844×390／320×568／568×320各guide/quiet，用真正顯示按鈕；失敗先存當下画面再清理，清理錯誤不掩蓋原始失敗。恢復後881Node／139Python與資產／型別／建置／compile通過；先前CSS解析與patch測試保留。原festival23／early25／equipment83／prologue37／keyboard28／trial53／witness42瀏覽器斷言未刪；沒有本機瀏覽器、force click、假存檔、狀態寫入、重試或timeout放寬。

新版HTML5626292bytes、SHA256480e15b0c1cdf722de662731216bbfac8a87e769883ced531f5df5f641092658仍待CI37。除了原三job／13主旅程／9原生／3ledger與全部原有驗收，還需新dock五尺寸及初遇DOM觀察、原始產物、實際畫面與Pages來源／HTML核對後接受。單元模擬不能代替真正瀏覽器／真機，也不能因此宣告視覺90。

## 未完成範圍與品質門檻

T03：原作隱藏規則、版本／補丁差異、完整地圖／城鎮室內／迷宮拓樸及精確數值。T04：等級成長、技能、戰鬥報酬與掉落、完整商店消耗品飾品、角色與雙三人技。T05：完整美術、動畫及權利清楚的音樂音訊，先改善前段。T06：完整未來篇、其餘時代、主支線與結局。T07：整體90、裝置與效能證據。T08：每批GitHub與指定Drive閉環。

仍可見缺口包括家中家具／母親簡化、重複地板、初遇輪廓重疊、壓縮法庭、構圖、完整動畫音樂及真機。新HUD尚未通過畫面，既有美術不重畫。完整遊戲>=90、各面向>=80%、零critical、五項證據gate與必需素材通過才可release:check。不能改分母、隱藏缺口或只評完成部分。舊quality30明確stale，不作目前分數或重開功能依據。

真實鍵盤／手把、FPS／frame-time、載入、記憶體、背景恢復與保存屬實體裝置門檻；Chromium觸控模擬、NullEngine、合成幾何、概念圖與軟體GPU不能冒充真機。Pages僅部署全CI通過的exact artifact；deployment.json綁source/run/artifact/HTML，文件HEAD與遊戲source不同不是重跑理由。file://與HTTP靠JSON搬移，不是雲端存檔同步。

## 雲端、限制與立即接續

GitHub main是程式與進度權威，只由本AI流程使用，不建立多人防撞／平行candidate／PR／歷史審計。相關修改整批測試後一次source commit→非force更新→回讀→一次完整CI；文件使用[skip ci]。CI仍排隊／執行時保存exact點並回報，不長時間輪詢、取消或重派；失敗只處理同run第一根因，成功保存原產物、看實際畫面及匹配Pages。

所有檔案只放folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。恢復包 **1BpCWHWw28QxZTfA9xNdI-URlc050ZYW9**，28766764bytes，SHA256f72f04086b2b353d8470e0bd1b03b4524c4930a494ea325a6f5b2e716c7dc0ba，40manifest／11測試增量／6原始ZIP、CRC、父資料夾及完整回讀皆一致。包內UNPUBLISHED／尚未上傳標記是前次封存的歷史，現在由main正式收據覆蓋，沒有竄改原產物。最新發布包與回讀紀錄見DELIVERY_INDEX／VQ01T_CLOUD_RETENTION。由raw/CI36-browser.zip內exact4029tar加11delta恢復程式；文件必須另取當前main。不要為了開始重新下載舊包。

受限的新src/prologue-render.ts寫入與本機瀏覽器操作沒有新允許結果，不得重送、改管道繞過或提升不完整staging。renderer2711a74185aacf3c6bddf9db85ba99a2afbc507a保留；其他允許的獨立改善繼續，特定限制不等於connector無法存取。

ROM私人保存在Drive1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM，不需重傳。HiROM／checksum不能證實原版或補丁身份；不能把未核實解析當原作規則。ROM、原圖、原音訊、字型檔與憑證不進公開repo／CI／Pages／試玩包。固定工具鏈只恢復node_modules並保留esbuild hardlink，不還原舊source／config，不另開bootstrapCI。
