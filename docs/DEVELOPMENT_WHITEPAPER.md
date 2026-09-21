# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-ci41-closed-immediate-handoff。更新既有進度，不重新規劃。精確source／run／接續點以STATUS／IMMEDIATE_CONTINUATION為準。前版全文保留於93dde6539f64bbc155af01ef2b222035802c6664，舊CI41-pending已由本次驗收關閉。

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

## 前段品質與使用者回饋

使用者反映試玩缺乏承諾的HD-2D精緻感，這仍是視覺交付落差。像素人物＋立體引擎不等於統一成熟的成品；90是完成後的證據門檻，不是特效开關或測試累計。沒有目前美術90分的有效證據；舊30分stale，不作新評分。

本次CI41實際桌面、直向、短橫向与九個正常／暫停／減少動態畫面已檢視。細石板、較柔和石縫與走道／鐘庭分區可見，棚布淡化、探索提示分列和選單有界；但偏黑投影、像素人物植物與立體道具的材質語言、比例輪廓及窄視窗地標構圖仍不一致。家中母親／家具、完整動作與動畫音訊、實體裝置仍未完成。不得以HUD、測試數或全畫面模糊代替主要美術交付。

## 最新已閉環與保留工作

**CI41 35561161523／Pages35 35563000350／0.9.20**，sourcea67178ae18c00bcfd552dff25174d6f14b759292、tree3662cd550ba6ad9a990ca24ab6d14d52c16f7bfa，三job／13主報告／9原生選檔／3來源ledger及全部列入報告bytes/hash通過。三份原始ledger已用只讀產物檢查精確重現，不是重跑瀏覽器。HUD十案例、地面三視窗、場景正常／暫停／減少動態、X各階段六條16×1實際canvas資料、W光材質6樹根／8柔邊陰影、觸控完整load4884.01ms／兩視窗／trace及原有劇情戰鬥存讀皆保留。原30秒load條件不變，不以progress代替最終審判。

Pages35兩job成功；staged10622877567與playable10622413321/source/CI/HTML一致，5633660bytes/SHA2560a174c1b808dbd3d4dd20323f3a57b158d6ec607996fdf2e18147da61092dffb。公開HTTP由2026-09-21T05:01:49Z實際成功deploy步驟核對；沒有本機獨立live-byte或瀏覽器宣稱。六原始ZIP已雲端回讀，CI41_ACCEPTANCE/CI41_VISUAL_REVIEW只接受既有可玩與部署，不是美術90／全作／硬體。CI41／Pages35、CI40／Pages34及更早閉環不重開。

VQ01A/B/C保存畫筆、四主角、鏡頭、接地與陰影，P祭典棚布／鐘／傳送器／攤位，S地面明暗／取樣，T探索HUD，U觸控生命週期，V固定tick動態，W獨立光照／銅件／樹根接觸全部保留。家中保存素材不重畫；受限renderer不能旁路替換。歷史43／31不是当前缺檔數。

## 已發布並完成既有可玩驗收 VQ01X／0.9.20

Source **a67178ae18c00bcfd552dff25174d6f14b759292**，tree **3662cd550ba6ad9a990ca24ab6d14d52c16f7bfa**，13份程式／測試／建置檔案非force發布並匹配完整測試tree與blob，保留目前文件子樹。**CI41 35561161523**，push/attempt1，建立2026-09-21T04:29:12Z，completed/success updated05:01:23Z。本次交接只更新文件證據，沒有新runtime、candidate或CI42。

保留原drawSurface／鋪面畫筆程式不變，透過虛擬2倍畫筆密度在同512×512紋理形成較小石板，降低石縫對比，並加入中央／南側暖色走道、鐘庭邊框及外緣。花園像素含原2×2邊界stamp全部逐byte保留；不改地圖方向、尺寸、地形碰撞或已整合素材。不新增runtime網格／圖檔／shadowmap，不逐幀紋理更新；CPU繪製成本增加，沒有真機速度宣稱。素材匯出fair-ground與runtime現在使用同一構圖。

既有三視窗正常／暫停／減少動態旅程記錄六條16×1實際canvas像素，和明示為來源畫筆預期而非驗收證據的fixture比對。原九张實際截圖位置保留，所有舊瀏覽器斷言保留。938Node／186Python、資產／型別／建置／compile通過；初次兩項新增單元的舊1×1mock尺寸與Size原型比較已修正，沒有刪舊斷言或掩蓋runtime失敗。

上述HTML已由CI41與Pages35完成原始報告、實際畫面、部署來源核對；來源畫筆預覽仍不是遊戲畫面。本次沒有重跑單元／build／本機瀏覽器，938Node／186Python是之前source的結果。接續既有T05-early-visual-cohesion，整批處理偏黑投影／閱讀性與人物場景尺度輪廓一致性，保留既有素材與受限renderer邊界；不能把這批鋪面稱為完整90分場景。

## 未完成範圍與門檻

T03：隱藏規則／版本差異／完整地圖室內迷宮拓樸及原作數值。T04：成長／技能／報酬掉落／完整經濟消耗品飾品／角色雙三人技。T05：完整美術動畫及權利清楚的音訊，先做前段整體品質。T06：完整未來篇及其餘時代、主支線與結局；2300抵達不是完整未來篇。T07：整體90與每面向80%、零critical、必需素材及五項證據gate、實體裝置輸入／FPS／frame-time／載入／記憶體／背景恢复／存檔。T08：每批GitHub／指定Drive閉環。完整遊戲目標不縮小；不改分母、不只評已完成功能、不用測試或模型數自評灌分。

## 雲端與限制

只放folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新原始證據包 **1XBi5NQWZznGrtT1Zs1nhzmgTmLt-NCCt**，38905599bytes/SHA2564e72ec1f1d0264e3b38fc652b7d5b766e49b5799cc5e226b63e2def068c785d5，已下載回讀hash／CRC／13項清單／6原始ZIP與父資料夾。raw/CI41-browser.zip內含exacta671 source tar，不需再套舊增量鏈；最新main文件優先於來源封存舊文件。本次cloud最終收據晚於包內technical-review的cloud-pending欄位，見CI41_CLOUD_RETENTION。舊保存包保留於DELIVERY_INDEX，不重新下載或驗收。臨時容器不是永久依據。

main只有本AI流程，不建branch／PR／多人防撞。每批相關修改整合測試後一次sourcecommit／非force／回讀／一次完整CI；文件[skip ci]。CI排隊或執行即保存exact點不長輪詢、不取消重派，失敗只處理同run第一根因；成功仍保留原始產物、看實際畫面並核對Pages來源／HTML。

受限prologue-render.ts及本機瀏覽器沒有新允許結果，不重送／改管道旁路／提升不完整staging；renderer2711a74185aacf3c6bddf9db85ba99a2afbc507a保留。固定工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuildhardlink，不覆蓋source/config或另開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳；ROM、原圖音訊、字型檔、憑證不公开。
