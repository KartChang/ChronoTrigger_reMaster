# Current status — CI61 / Pages55 accepted; T05 continuation

唯一 current root：**T05-early-visual-cohesion**。唯一 execution terminal：**VQ02T-pause-and-village-readability-development**。目前沒有 active validation，也沒有新 source candidate。Main only、single AI、non-force。

## 已正式完成的目前基準

VQ02S / 0.9.41 source **9b9020e05b3c9c68aee378ceab74dc8fa4677c88**；tree **432ce1a0a42bb35f392601eaee774123dffb4684**。CI61 **35765515107**，push/attempt1，三 job success，完成 2026-09-22T18:44:59Z。Exact source 全 event/state count1。

已完成13主報告、9原native chooser加完整CPU兩旅程／600／救援／審判，audio、actor.playback、HUD、normal/paused/reduced、接地ATB、觸控、裝備v8、完整審判；本人同run v4-v5-v7和alternate own cell、67腿／4遇敵／2props／17里程碑／6個120draw窗口。以 exact S 原始程式唯讀重算七份 ledger，全部逐byte相同、133列檔案bytes/hash一致。CI內保留source tar組裝出的Git tree完全匹配公布source；原始ZIP未改。

S六種64x64建材、80x40原旅店招牌，實際owner／nearest-alpha／RGBA已驗。960x640、390x844、844x390同一次托魯斯暫停完整state一致，3DOM＋3實際CPU canvas PNG已驗；恢復原viewport並原生resume。39主CPU原圖透過標記contact sheets檢視，6張新S原圖另逐張打開。旅店陶瓦／招牌可見，直式人物與招牌仍偏小，不代表窄畫面最終可讀性。短橫向暫停卡下部CPU選項／說明落在初始可視範圍下方，下一批先查既有捲動行為並改善排版。

Pages55 **35769247113**：prepare/deploy及公共HTTP核對step成功；selected CI61/source S正確，文件workflow HEAD不同不是另個遊戲版本。playable／staged／deployed HTML完全相同：**5704004 bytes**，SHA256 **bd23d550062b186cec198efa7879a5889cdf5c78e351562a38db078f2cd6a9e8**。沒有本機browser/HTTP複跑，不能拿本機source=null HTML當基準。

正式收據：`docs/evidence/CI61_ACCEPTANCE.json`。CI61/Pages55、CI60/Pages54和更早均已結案，不重驗、不重做S／R森林／Q NPC。

## 雲端與接續

正確Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
目前證據包 **Chrono-CI61-VQ02S-evidence.zip / 1KA38Hu9qJ6HsnQqr8bAW1-kZQVAqCd87**；**70055052 bytes**；SHA256 **9a751b9ea880c771fb410a620b9b75b7ea4e6608fd9a6e3e11460f845567d991**。已下載回驗hash/bytes/outer CRC/26項manifest/七個未修改原始ZIP的CRC與正確parent。完整S source在recovery/source-9b9020e05b3c9c68aee378ceab74dc8fa4677c88.tar.gz；該archive內docs是source發布時歷史，最新進度另讀main。

下一批從真圖所見處理短橫向暫停介面與前段植物／道具／窄地標可讀性，保留S全部材質及幾何契約，新增證據不取代舊報告。先讀會修改的source與直接測試，不盤點歷史。測試後一次non-force source，不能只完成一個checkbox就停止；同CI pending時保存checkpoint並回報，不長等、輪詢、rerun/dispatch/cancel。

## 固定範圍與限制

T03：規則版本、隱含規則、完整拓樸及數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色學習與雙三人技。T05：完整美術、動畫、合法音訊；前段實際品質優先。T06：完整未來、其餘時代主支線及結局。T07：整體>=90／每面向>=80%、required assets/five gates/zero critical、實體裝置輸入/FPS/frame time/載入/記憶體/背景/存檔/音訊。T08：每批實作測試、一次source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；沒有新美術90分、長時間或實體裝置認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三和v1-v8存檔。無branch/PR/P3/ARPG/框架重造；不寫原生game/time/save/collision hook，不放寬.12、tick、單一30秒、250ms/256或畫質。禁止本機browser。Held VQ01Z／母親家具不提升或間接替換；src/prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**必須保留。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules並保留esbuild hardlink，不覆舊source/config。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳、不公開；原媒體／字型／憑證不公開。臨時容器不是權威。
