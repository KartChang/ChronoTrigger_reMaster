# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq01s-ci36-handoff。更新既有狀態與順序，不重新規劃。精確source、run與下一步只看STATUS及IMMEDIATE_CONTINUATION；新對話不必先重讀白皮書或歷史。前一版CI35交接全文保留於Git commit e36994092190a1fd412cef9b9e6ee8ea026c6113，CI20歷史全文保留於4f831e1728be56e230d9285d1318f2587dfafbfb；舊pending不再是目前待辦。

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

最新已完整記錄的既有可玩範圍閉環為 **0.9.15／CI35 35518793605／Pages29 35520392818**，source28759aa7cb6d60a5649e169e483eb578b0f25a4e、tree804627e7e113db22e2be0c64dfbaac92f469b1f7。三job、13主旅程、9份原生選檔紀錄、3份source/run/attempt/HTML ledger及其報告bytes/hash通過。6guide／6quiet、18工具列觀察、12前段鏡頭（四場景各三視窗）、接地／真正ATB突進／匯入清理、棚布淡化與完整暫停、商店裝備／經濟／v8／IndexedDB／勝利及所有既有劇情均保留。最終審判是完整trial-report，不以progress代替。舊CI34走道失敗与CI33總時間上限都已解除於此來源，不重跑舊run。

Pages29 prepare與deploy成功；來源／CI35／playable10606994885和HTML一致，staged與CI原HTML逐byte一致：5619402bytes、SHA256b54d4d25309dffc763ff21a2280c3de40242533bdcfbf83dfd78385f4ccdc4dd。公開HTTP來源／hash由成功deploy step的實際紀錄支持。本機獨立HTTP查詢因DNS失敗，沒有第二次本機即時驗證。workflow使用文件HEAD e369不代表遊戲source不同，亦非重跑理由。

已檢視全尺寸家中／雙人直向和25張原始場景／選單／戰鬥圖的三份接觸表。HUD不擋按鈕、棚布淡化保留人物、商店接近成功、窄視窗選單有界；但家中母親／家具簡化、大面積重複鋪面、初遇人物輪廓重疊依然存在。**CI35_ACCEPTANCE.json、CI35_VISUAL_REVIEW.md**只接受既有可玩路線與該source部署，不是全作、美術90或真機驗收。CI35／Pages29與更早CI28／Pages22保持關閉，不重新驗收；CI32的歷史provider success不需補重跑。

已保存且整合的VQ01B/C人物取景、固定tick鏡頭、VQ01A四主角48×64畫筆修整、腳底支點／突進陰影、祭典NPC接地、獨立輸入／modal／選單／交易舒適度均保留。VQ01P祭典曲面棚布、鐘、傳送器、貨物、販商和人物前方棚布淡化已存在。VQ01Q原三job工作量平衡與完整報告檢查、VQ01R四段安全走道與鬆鍵後診斷均保留；不重做。

完整保存美術仍含房間材質、分件家具、陶器、曲面布料、母親及三角面前景淡化等。A→B→C工作鏈已存在，不得重畫；家中整合仍部分受限。歷史43／31差異不是現在未完成檔案數。沒有通用外部OBJ自動回匯、全NPC方向動作或完整音樂完成的宣稱。畫筆重用不是重畫或放大舊貼圖；四個走路時槽不等於四張獨特畫面；圖集／模型／測試數不是美術分數。

本批 **VQ01S／0.9.16**已發布九份程式／測試，source4029c82ec0568dff0f687be6fa0947256b63350c、tree3dd6c5d2f8b912ad7a3ed0386562ff9c156c1651；唯一 **CI36 35525474467**最後觀察queued/null，建立及updated2026-09-20T17:19:04Z，push/attempt1。只改善獨立祭典地面：保留既有鋪面畫筆與原尺寸／位置，靜態世界座標頂點明暗區分中央走道／鐘前景與外緣；32細分、1089頂點／2048三角形與不可變不透明color buffer。地面單獨啟用NEAREST_NEAREST_MIPLINEAR及anisotropy4，角色仍nearest。没有額外覆蓋網格／紋理／collider或每幀地面上傳；細分與mipmap有幾何／儲存成本，尚無真機效能及視覺提升證明。

既有棚布瀏覽器旅程加入桌面1365×900／直向390×844／短橫向844×390的實際buffer／sampler／checksum／截圖觀察，視窗切換與原生暫停維持地面不變；先留失敗當下畫面再清理，清理錯誤不掩蓋原斷言。873Node／125Python、資產／型別／建置／compile通過（新增12Node、11Python）；原瀏覽器斷言全保留，festival22→23，其餘equipment83／early25／keyboard28／prologue37／trial53／witness42未刪改。沒有本機瀏覽器、force click、假存檔、狀態寫入、重試或timeout放寬。

新HTML5621452bytes、SHA256cda87f62f553247de4bad7430f196b1a8f19de92fd051e4a6fe616d7dceef25f尚未驗收。CI36需原三job／13主旅程／3ledger與全部原生、舒適度、鏡頭、人物、裝備／劇情驗收，加上地面三視窗及暫停不變、原始產物、實際畫面檢查與Pages來源／HTML核對。取樣參數正確不等於美術得分。

## 未完成範圍與品質門檻

T03：原作隱藏規則、版本／補丁差異、完整地圖／城鎮室內／迷宮拓樸及精確數值。T04：等級成長、技能、戰鬥報酬與掉落、完整商店消耗品飾品、角色與雙三人技。T05：完整美術、動畫及權利清楚的音樂音訊，先改善前段。T06：完整未來篇、其餘時代、主支線與結局。T07：整體90、裝置與效能證據。T08：每批GitHub與指定Drive閉環。

仍可見缺口包括重複地板、簡化家中家具／母親、輪廓重疊、壓縮法庭、前段構圖、完整動畫音樂及真機操作。新地面批次不是已通過畫面；已發布鐘／攤位不重畫。完整遊戲>=90、各面向>=80%、零critical、五項證據gate與必需素材通過才可release:check。不能改分母、隱藏缺口或只評完成部分。舊quality30明確stale，不作目前分數或重開功能依據。

真實鍵盤／手把、FPS／frame-time、載入、記憶體、背景恢復與保存屬實體裝置門檻；Chromium觸控模擬、NullEngine、合成幾何、概念圖與軟體GPU不能冒充真機。Pages僅部署全CI通過的exact artifact；deployment.json綁source/run/artifact/HTML，文件HEAD與遊戲source不同不是重跑理由。file://與HTTP靠JSON搬移，不是雲端存檔同步。

## 雲端、限制與立即接續

GitHub main是程式與進度權威，只由本AI流程使用，不建立多人防撞／平行candidate／PR／歷史審計。相關修改整批測試後一次source commit→非force更新→回讀→一次完整CI；文件使用[skip ci]。CI仍排隊／執行時保存exact點並回報，不長時間輪詢、取消或重派；失敗只處理同run第一根因，成功保存原產物、看實際畫面及匹配Pages。

只放 **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。本次已驗收來源包 **1P-jRHa_BiTcAoETgQpPuizLTw9RhyuG9**（26132246bytes／14項manifest）與待驗證增量包 **1Tj2bjfoiAaBZ2NHCq_TMjIHFgPoduuam**（567859bytes／18項manifest／9增量）均已下載回讀整包hash／CRC／清單／正確父資料夾。精確hash在DELIVERY_INDEX與收據。新包的CI35 source tar＋9delta恢復程式，文件另以GitHub main為準；封存checkpoint早於最終雲端收據。臨時容器不是永久記憶，先读STATUS／IMMEDIATE_CONTINUATION再查CI36，不下載所有舊包。

受限的新src/prologue-render.ts寫入與本機瀏覽器操作沒有新允許結果，不得重送、改管道繞過或提升不完整staging。renderer2711a74185aacf3c6bddf9db85ba99a2afbc507a保留；其他允許的獨立改善繼續，特定限制不等於connector無法存取。

ROM私人保存在Drive1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM，不需重傳。HiROM／checksum不能證實原版或補丁身份；不能把未核實解析當原作規則。ROM、原圖、原音訊、字型檔與憑證不進公開repo／CI／Pages／試玩包。固定工具鏈只恢復node_modules並保留esbuild hardlink，不還原舊source／config，不另開bootstrapCI。
