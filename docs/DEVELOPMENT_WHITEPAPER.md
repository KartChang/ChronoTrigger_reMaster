# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq01y-ci42-pending。更新既有進度，不重新規劃。精確source／run／接續點以STATUS／IMMEDIATE_CONTINUATION／CI42_CHECKPOINT為準。前版全文保留於4f428d5f7d9640a134a0510807d0f3f98506aebc；更早全文93dde6539f64bbc155af01ef2b222035802c6664保留。CI41已閉環，本批只有CI42待驗收。

## 目標、順序與固定技術

完整《超時空之鑰》HD-2D重製目標不縮小：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮／室內切換、原地ATB、單人與同機雙人共用畫面。合作不等於改ARPG。完整時代、主線、支線、結局均保留。

最高優先仍是前幾幕的場景、人物、圖檔、建模、動畫、鏡頭、遮擋、HUD與操作舒適度，先取得實際證據支持的90分以上，再擴充後段劇情與系統。這是執行順序，不是把完整版縮成序章。

沿用TypeScript＋Babylon.js＋esbuild自含HTML；Node為建置工具，Python／Playwright為驗收工具，玩家不需Python、ROM、帳號或後端。固定package/lock版本；不更換Unity／Three.js，也不引入.NET／SQL／RAG／SaaS或平行框架。

Controls→main固定1/60秒步長→core規則→render/HUD呈現。傷害、資源與事件不由畫面決定。暫停／背景／對話／背包／原生選檔不推進模擬；恢復不補算背景時間。InputBoundary清除邊界舊輸入；A*使用既有碰撞，不瞬移、不穿牆。

P1克羅諾／P2露卡及依劇情加入離隊的控制權保留；青蛙或瑪兒為有HP／MP／ATB、可被敵方選中及自主行動的第三同伴，不是P3或完整自由換人。保留獨立選敵與雙確認合技；不得為測試改數值、放寬條件或刪斷言。

## 已有內容與不可重做範圍

連貫路線：家中醒來／上下樓→縮尺區域地圖→千年祭初遇與行為→傳送異變→600山道／托魯斯／森林／王城→露卡→修道院／青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援與返鄉→護送被捕／證詞與兩裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。不得依舊pending／失敗重新建立。2300抵達不是完整未來篇；經驗記錄不是等級系統。

既有裝備與梅爾基歐商店：角色相容、武器／身體／頭部、穿戴份數、金幣／庫存守恆及交易上限由規則管理，不能賣仍穿戴裝備。400G初始旅費、13項商品、價格與普通攻擊／防禦加減值是明示暫定重建，不是假稱原作數值。完整成長、技能學習、戰鬥金幣、飾品、自由換人尚未完成。

IndexedDB與JSON白名單v1–v8保留：技術村落、千年祭、異變山道、王國、救援、序章、審判越獄與裝備外層。舊檔沒有的行為仍未知，不補造證詞；僅查看不強迫改寫存檔。守恆不是簽章防作弊，匯入自己的舊檔是合法回溯。snapshot／paused／view僅供讀取，不得設通關旗標、改進度或製造正向存檔。

## 前段品質與使用者回饋

使用者反映試玩缺乏承諾的HD-2D精緻感，這仍是交付落差。像素人物＋立體引擎不等於統一成熟成品；90是完成後證據門檻，不是特效開關或測試累計。沒有目前美術90分有效證據；舊30分stale，不作新評分。

CI41已驗收實圖呈現細鋪面、走道／鐘庭分區及可用HUD／棚布，但偏黑投影、像素人物植物與立體道具材質語言、比例輪廓與窄視窗地標構圖仍不一致。家中母親／家具、完整動作動畫音訊與實體裝置仍未完成。不得以HUD、測試數、模型數或全畫面模糊替代美術交付。

## 本批 VQ01Y／0.9.21 — 已發布，尚未完成實圖驗收

Source **3c2e03e02c7be0e5921fa689f32d674c68ae64f4**；tree **afd919fc37bbac025006fbdbad2e942757ea766d**；parent4f428d5f7d9640a134a0510807d0f3f98506aebc。一次非force sourcecommit，10程式／測試／建置檔，main及完整src/tests/scripts子樹已回讀匹配本機測試內容。

以現有T05-early-visual-cohesion為範圍，不新增章節／畫筆資產／框架。沿用原ShadowGenerator，祭典啟用時把darkness參數下限設為.34以保留陰影中的閱讀性，離場、父節點停用或dispose恢復原值。原主光／W補光／銅材質／shadowmap／filter／bias保留，其他場景不永久套用祭典值。

靜態合併按材質與投影資格分組，修正低矮零件合併後被重新加入投影的問題。鐘柱、柱帽、拱石與傳送器橫梁保留結構投影；低石縫、花朵、花床、基座不因同色合併变成caster。既有樹根與八個柔邊接觸陰影不重造。

20件鐘庭石材改為封閉的固定頂點倒角：6平面、12窄邊、8角部，維持原外接尺寸、位置及碰撞。倒角寬以既有1.85高／64px人物的texel校準，最多1.5texel且不超過最短邊12%；細邊色階讓立體石材的輪廓節奏更接近像素角色。每件96頂點／44三角形是實作成本，不是美術分數；不新增影像、逐幀紋理或全畫面模糊。投影分組可能增加drawcall，沒有真機效能改善宣稱。

祭典露卡／三攤販平面統一至既有主角1.36×1.85尺度（原宽1.35的小幅對齊），48×64素材、pivot、nearest與接地保持。主要人物、樹木、已整合畫筆不重畫。此小幅對齊和石材校準不代表全面材質／尺度問題已解决。

原三視窗正常／暫停／減少動態的場景捕捉保留，增加只讀實際generator值、caster名單、頂點／法線／色彩buffer與人物平面觀察；原finish斷言仍執行。單元檢查封閉幾何、法線／邊界、shadow離場／dispose還原、合併投影、buffer突變可見性、人物尺度／接地，以及暫停／減少動態不新增幾何／紋理或寫遊戲狀態。

本批新跑 **948Node／199Python** 全通過，assets／typecheck／build通過。發布前曾修正AbstractMesh存取buffer的型別問題，最終以Mesh guard完成；沒有刪舊斷言或掩蓋runtime失敗。synthetic fixture僅測驗證器，不能冒充瀏覽器／GPU。原始log與hash已雲端保存，見VQ01Y_LOCAL_VALIDATION；本機未執行瀏覽器。

**CI42 35568827641**，push／attempt1，source如上，最後觀察queued／null，2026-09-21T06:30:57Z。只有這個active validation；不取消、重派或長等。本機HTML5637348bytes、SHA2567760a26e592a17516836cd32a2f87cfa9d5fe2a3d6b2ae35083b71eec9d70a43僅是local build，sourceSha=null，不是已驗收CI／Pages證據。新版after畫面、完整原始報告與Pages/source/HTML匹配尚待完成，不能先宣稱美術改善已通過或達90。

## 最新已閉環與保留工作

上一已驗收 **CI41 35561161523／Pages35 35563000350／VQ01X0.9.20**，sourcea67178ae18c00bcfd552dff25174d6f14b759292、tree3662cd550ba6ad9a990ca24ab6d14d52c16f7bfa。三job／13主旅程／9原生選檔／3來源ledger與報告bytes/hash皆通過；三ledger已只讀精確重現，不是重跑瀏覽器。HUD十案例、地面三視窗、三視窗正常／暫停／減少動態、X各階段六條16×1canvas、W六樹根八陰影、觸控load4884.01ms／兩視窗／trace及原劇情戰鬥存讀皆保留；原30秒load門檻未放寬。

Pages35兩job成功；staged10622877567及playable10622413321/source/CI/HTML一致，5633660bytes／SHA2560a174c1b808dbd3d4dd20323f3a57b158d6ec607996fdf2e18147da61092dffb。公開HTTP核對來自2026-09-21T05:01:49Z實際deploy log，沒有另一次本機live-byte／瀏覽器宣稱。CI41_ACCEPTANCE／CI41_VISUAL_REVIEW只接受既有可玩与部署，不是美術90／全作／硬體。CI41／Pages35、CI40／Pages34和更早閉環不重開。原938Node／186Python是VQ01X記錄，不當作本批執行結果。

VQ01A/B/C四主角、鏡頭、接地與陰影，P祭典棚布／鐘／傳送器／攤位，S地面明暗取樣，T探索HUD，U觸控生命週期，V固定tick動態，W独立光照／銅件／樹根，X細石板／低對比石縫／走道鐘庭分區與grassmask全部保留。不重畫家中保存素材，不旁路受限renderer。歷史43／31不是目前缺檔數。

## 未完成範圍與門檻

T03：隱藏規則／版本差異／完整地圖室內迷宮拓樸及原作數值。T04：成長／技能／報酬掉落／完整經濟消耗品飾品／角色雙三人技。T05：完整美術動畫與權利清楚音訊，先前段整體品質。T06：完整未來篇、其餘時代、主支線與結局。T07：整體90與每面向80%、零critical、必需素材及五項證據gate、實體裝置輸入／FPS／frame-time／載入／記憶體／背景恢復／存檔。T08：每批GitHub／指定Drive閉環。完整遊戲不縮小；不改分母、不只評已完成功能、不用測試／模型數灌分。

## 雲端、接續與限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新tested-source/log包 **1MO3Rsw1KKgaoU28J4AS-ZMCKUHPdDhWm**，2036670bytes／SHA256bdcf8bc8b99c69c4b8f1cebdefefbf15e61ea345f720bf229cc472340df69015。已下載回讀hash／CRC／23項manifest／父資料夾，含10改檔、原始local logs、local未驗收HTML、CI41未修改baseline及218檔程式恢復快照。快照是exacta671＋本批改檔的組合，不冒稱已發布Git archive；封存時null sourceSha由GitHub最終發布收據補足，三子樹精確匹配。最新main文件始終優先。原已驗收包1XBi5NQWZznGrtT1Zs1nhzmgTmLt-NCCt／38905599bytes／SHA2564e72ec1f1d0264e3b38fc652b7d5b766e49b5799cc5e226b63e2def068c785d5保留；不重新下載全部歷史。

現在只接CI42同run。queued／in_progress保存exact點不長輪詢／取消重派；failure處理第一實際根因；success查三job／全部最終原始報告與實圖／source-HTML、保存原始產物，再匹配Pages。文件[skip ci]不改source。臨時容器不是永久依據。

受限prologue-render.ts與本機瀏覽器沒有新允許結果，不重送／改管道旁路／間接替換／提升不完整staging；renderer2711a74185aacf3c6bddf9db85ba99a2afbc507a保留。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuildhardlink，不覆蓋source/config、不另開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳；ROM、原圖音訊、字型檔、憑證不公開。
