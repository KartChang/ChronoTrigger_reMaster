# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-ci42-closed-vq01z-publication-held。更新既有進度，不重新規劃。精確執行依STATUS／IMMEDIATE_CONTINUATION／VQ01Z_CHECKPOINT；前版全文保存於 **ed42d424da5f3637144809c247d557b9a13bc91b**，更早全文4f428d5f7d9640a134a0510807d0f3f98506aebc／93dde6539f64bbc155af01ef2b222035802c6664仍保留。

## 目標、顺序與固定架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖及城鎮／室內切換、原地ATB、單人或同機雙人共畫面，保留完整時代、主支線與結局，不改ARPG。先完成前幾幕場景、人物、圖檔建模動畫、鏡頭遮擋HUD及操作舒適度，以實際證據達90以上再擴後段，這是順序而非縮小完整版。

TypeScript＋Babylon.js＋esbuild自含HTML；固定package/lock。Node建置，Python／Playwright驗收，玩家不需Python、ROM、帳號或後端。不改Unity／Three.js，不引入.NET／SQL／RAG／SaaS或平行框架。

Controls→main固定1/60秒→core規則→render/HUD呈現；傷害資源事件不由畫面決定。暫停／背景／對話／背包／原生選檔不推進模擬，恢復不補算背景時間；InputBoundary清除邊界舊輸入，A*用既有碰撞，不瞬移穿牆。P1克羅諾／P2露卡控制權與劇情加入離隊保留；青蛙／瑪兒是有HP／MP／ATB、可被敵方選中並自主行動的第三同伴，不是P3或完整自由換人。保留獨立選敵與雙確認合技，不因測試改數值或放寬業務條件。

## 已有內容，不重做

連貫家中醒來／上下樓→縮尺區域地圖→千年祭初遇與行為→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕／證詞兩裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。舊pending／failure不得重開。2300抵達不是完整未來篇，經驗記錄不是等級系統。

已實作裝備與梅爾基歐商店：相容角色、武器／身體／頭部、穿戴份數、金幣庫存守恆及交易上限，不能賣仍穿戴裝備。400G旅費、13項商品、價格與普攻／防禦增減是明示暫定重建，不假稱原作數值。完整成長、技能學習、戰鬥金幣、飾品、自由換人尚未完成。

IndexedDB／JSON白名單v1–v8：技術村落、千年祭、異變山道、王國救援、序章、審判越獄、裝備。舊檔未知行為不補造證詞，僅查看不強迫改寫。守恆不是簽章防作弊，匯入本人舊檔是合法回溯。snapshot／paused／view唯讀，不設通關旗標、改進度或製造正向存檔。

## 前段品質與已保存實作

使用者反映缺乏承諾的精緻HD-2D，仍是交付落差。引擎、像素尺寸、模型數、測試數不能取代場景完成度；90是實際完成後門檻，不是特效开關，目前沒有美術90有效證據。舊30stale，release仍BLOCKED。

A/B/C四主角、相機、接地陰影；P祭典棚布鐘／傳送器攤位；S地面明暗取樣；T探索HUD；U觸控context；V固定tick動態／reduced-motion；W祭典獨立光照銅材質與6樹根8柔邊陰影；X細石板石縫／走道鐘庭／grassmask；Y投影閱讀性、caster-preserving合併、20件同邊界石材倒角與微幅人物寬度對齊均保留。家中資產不重畫，不繞過受限renderer；歷史43／31不是目前缺檔數。

## 本次 CI42／Pages36 實際閉環

已驗收 **VQ01Y／0.9.21**，source **3c2e03e02c7be0e5921fa689f32d674c68ae64f4**，tree **afd919fc37bbac025006fbdbad2e942757ea766d**。CI42 **35568827641**，push／attempt1，success updated2026-09-21T07:03:07Z；validate106235941306、good106235941564、bad106235941149全成功。13份最終主報告、9原生選檔、3source/run/attempt/HTMLledger及所有列入bytes/hash核對完成，三ledger只讀精確重現，不是browser重跑。

HUD10、地面3、三視窗正常／暫停／減少動態、實際canvas鋪面／材質／caster／頂點／人物、接地／真正ATB突進／匯入reset、商店裝備經濟／v8／IndexedDB／勝利／完整審判及原旅程保留。觸控context退休、同run自產v8原生匯入、兩視窗／trace122項CRC通過，完整load4929.48ms，原30000ms門檻未放寬。

實际九場景圖與保留CI41baseline已看：投影較淺、鐘庭倒角存在；但木料仍大面平塗、像素植物人物與道具材質密度不一致，直向鐘庭右側仍裁切。1.35→1.36人物寬度不可冒稱感知品質突破。既有HUD／棚布／暫停正常；不等於完整美術、動畫音訊或裝置驗收。

Pages36 **35571121776**，prepare106242784918／deploy106242826082成功，staged10626077120與playable10626225622匹配來源CI与HTML：5637348bytes／SHA2567760a26e592a17516836cd32a2f87cfa9d5fe2a3d6b2ae35083b71eec9d70a43。公開HTTP由2026-09-21T07:03:31.7352603Z實際成功deploy步驟核對，沒有本機live-byte／browser宣稱；workflowheaded42d424da5f3637144809c247d557b9a13bc91b不是遊戲source。CI42_ACCEPTANCE／CLOUD_RETENTION／VISUAL_REVIEW／PAGES36_PROVENANCE只關閉既有可玩與部署。CI41／Pages35及更早閉環不重開。

## VQ01Z／0.9.22 整批本機完成；發布受限

在上述實圖缺口後接續同一T05root，完成17個程式／測試／建置檔，不新增章節或框架。重用原material-art的timber／plaster全部繪圖矩形，只映射既有色階成中性調制，以保留原道具底色；沒有重新畫已保存資產。兩張64×64紋理採nearest與mipmap／anisotropy4，僅祭典木結構與鐘庭石材使用。UV在靜態合併前按物理長度烘焙，64px對應1.85世界單位，木紋跟隨面最長方向，不隨每個盒子任意伸縮。材質clone共享快取，範圍限制於祭典，釋放時還原原材質。棚布、金屬、角色、植被與其他場景不套用；不是全畫面濾鏡或逐幀紋理更新。

直向祭典探索加入柔和距離權重地標水平偏移，之後仍套原角色／UI安全clamp；不縮小人物，不改鏡頭高度／垂直視角，不改戰鬥、室內、寬視窗或其他地圖政策。相機easing本體不變，分離雙人仍優先可見。這是有限構圖修正，不是保證全地圖地標永遠同框。

原三視窗正常／暫停／減少動態捕捉保留，追加actual紋理像素／UV／材質／live地標投影觀察。966Node／213Python、assets／typecheck／build通過；102組未受影響相機輸出符合exactCI42序列化基準。early-comfort.ts前版整檔hash斷言因有意政策變更而明確更新預期值，並未刪除；其餘固定檔、原功能斷言與timeout保留。新增JSONfixture最初-0／0嚴格比較改為雙方同樣序列化，不放寬runtime條件；所有原始成功與中途失敗log保留。NullEngine／synthetic fixture不能冒充GPU／browser。新localHTML5642078bytes／SHA256f1824317b197d4623dcca853aafc6572519b9470021aec025f46c67380a81754，source=null，未驗收。

本次GitHub.create_tree程式寫入被工具安全檢查封鎖，沒有treeSHA／sourcecommit／ref更新／CI43。没有重送、换編碼管道、間接替換或提升不完整tree；不宣稱connector不可存取。VQ01Z **未發布、無after圖、無新Pages、無90分結論**；最後已驗收版本仍Y。精確受限terminal和可恢復測試成果記於VQ01Z_CHECKPOINT／LOCAL_VALIDATION／CLOUD_RETENTION，不重做此批，也不因一般「繼續」解除限制。

## 完整未完成範圍與證據門檻

T03：隱藏規則／版本差異／完整地圖室內迷宮拓樸及原作數值。T04：成長／技能／報酬掉落／完整經濟消耗品飾品／完整角色雙三人技。T05：全美術動畫與權利清楚音訊，先前段整體品質；家中母親家具、整體比例材質與完整動作音樂仍有缺口。T06：完整未來篇、其餘時代、主支線與結局。T07：整體90／每面向80%、零critical、必需素材及五gate、實體裝置輸入／FPS／frame-time／載入／記憶體／背景恢復／存檔。T08：每批GitHub或指定Drive回讀閉環。完整遊戲目標不縮小，不改分母、不只評已完成功能、不以測試數灌分。

## 雲端、接續與限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。已驗收原始包 **1wlMzDYoWV7a9fHnrBQQ9KjyHMl-1FqjW**，38906842bytes／SHA2565722a13f28ae55e02b720eefb5c96fdfdf4f8d2e2a001d4aa2fcc1ff13dff765，下載回讀hash／CRC／14manifest／六未改原始ZIP／parent完成。raw/CI42-browser.zip含exactsource Gitarchive並已匹配comment，最新文件另讀main。

Z未發布程式包 **1hTbyvTOdJ0K7QtM4Pm_2ZLV4aW6pxpV9**，2105945bytes／SHA256a0262e90f384569b8c7f6974f4c55d663870deaa14d3ce0503e0805f77258242，下載回讀hash／CRC／29manifest／parent完成，含17changes、原始log、未驗收localHTML、CI42baseline、226檔程式恢復快照。快照為CI42＋本批17檔組合，不冒稱已發布Gitarchive；source=null正確。封存早於封鎖，最終以GitHubcheckpoint為準，不能自動提升成部署。之前Y／CI41及更早雲端表保留於DELIVERY_INDEX及歷史不可變commit。

main單AI流程、不開branch／PR／多人防撞。未來真正允許的source整批測試後一次非forcecommit／完整CI；排隊／執行中保存exact點即回報、不長等或取消重派，failure處理同run第一實際根因，success查最終報告／實圖／雲端／Pages-source-HTML。文件[skip ci]不改source。新寫入限制維持hold，僅另行允許的獨立項目可續作，不繞過。

舊prologue-render.ts／本機瀏覽器界線保持，rendererblob2711a74185aacf3c6bddf9db85ba99a2afbc507a，不重送／改管道旁路／間接替換／不完整staging。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules與esbuildhardlink，不覆蓋source/config或開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳，ROM／原圖音訊／字型／憑證不公開。所有結果寫回雲端，臨時容器不是權威。
