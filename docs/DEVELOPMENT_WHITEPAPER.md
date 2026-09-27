# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03y-ci96-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT **v32**。唯一main、singleAI/nonforce。Root T05-early-visual-cohesion，development/execution terminal T05-field-foe-action-animation。

前一版完整原文blob **66c9afeb79d4552b7614fb750f2f83fc56599708**原封保存於 **evidence/VQ03Y_PREVIOUS_WHITEPAPER.md**，其中歷史設計與未改限制仍有效；舊X/CI95 pending旗標已由本輪failure與Y/CI96接續取代，不可從封存文件倒退現況。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製：像素角色加立體場景、瀏覽器優先、保留世界背景與原作辨識度/構圖、縮尺大地圖、城鎮室內切換、原地ATB、單人及同機雙人共畫面，全部時代主支線與結局。前段人物、場景、全動畫、遮擋、HUD、操作與音訊先達舒適品質，不縮成展示，也不因CI綠勾提前擴後段。

整體>=90、各面向>=80%、requiredassets/fivegates/zerocritical，必須由實際畫面、遊玩及真機量測支持。測試數、文件或匯出圖不是美術分數；工具印出的歷史30/100不是Y評分。ReleaseBLOCKED，沒有newScore、全動畫、美術、原速、聆聽、真機、長時段或全遊戲批准。

## 二、架構與不可變行為

保留TypeScript/Babylon.js/esbuild、固定依賴、自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不能決定傷害、ATB、死亡、碰撞、存檔或劇情。CPU/WebGL共用規則；無GPU使用CPU triangle/texture/depth回退，不另造低品質關卡。

暫停、背景、對話、背包、native選檔與context loss凍結simulation，恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守碰撞。P1克羅諾/P2依劇情/自主第三、獨立選敵與雙確認合技保留；不加P3、不改ARPG。V1-v8白名單IndexedDB/JSON相容，動畫診斷/cache不入save。

CPU640×480cap、最大邊1280、tiers、32MiB/512entries與120活動FrameWindow保持；不承諾GPU shadow/glow/specular/postprocess。Packedclear/rowspan、預設OFF opaque-affine minification、alpha/perspective nearest與mip釋放保持；短benchmark不是真機長時段批准。

## 三、既有流程與完整遊戲缺口

保留家中醒來/樓梯、縮尺世界、祭典行為/初遇/項鍊異變、600山道/托魯斯/森林/王城、皇后消失/露卡合作、修道院青蛙/管風琴暗門/亞克拉救援返鄉、護送審判、兩條越獄、弗里茲/露卡、龍戰車三部位、重聚時門與2300抵達。2300抵達不是完整未來篇。

既有13商品、武器/身體/頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G/價格/普通攻防仍是明示暫定值，不冒稱完整原作數值。T03全規則版本差異/拓樸/數值；T04完整成長/報酬/掉落/經濟/消耗品/飾品/學習/換人/雙三人技；T06全時代主支線結局皆未縮分母。

## 四、既有美術、動畫、相機、音訊

HDhero固定tick/實際步伐/cache/接地、NPC姿態、遮擋取景/landmark遲滯、植物下肢保護、祭典材質及村莊窗框玻璃保持。C fieldenemy unlit emission/24×32 nearestalpha/五採樣；M四姿態，N真實敵方來源，O field身體/24tick殘影，P角色出手/downclip，Q保持實際draw受擊朝向，R simulation效果時鐘，S修道院姿態，T修道院身體/殘影，U守衛/龍戰車姿態/真實修復及NPC材質所有權保留。H-I-J-K-L森林時門/法庭接地/山道岩壁/8切角平台/8樹卡4冠atlas不重做。

Q不猜attacker/origin、不延長90/90/100/130ms hurtclip。R保留0.42秒/0.55距離突進、0.6秒刀光、>1.25秒數字expiry/0.8上升；same-tick/pause不動，reduced零突進/刀光隱藏/必要文字靜止。U同來源多目標只啟動一次，零傷害不誤播受擊。

V body守衛24tick/.20、車體-.08、車輪.10依真實來源，龍頭僅修復。HP-loss+origin支持18tick/.10退縮，未知origin只中止出手。HP0立即停用原敵人；獨立48×64/64×64一次copy、24tick縮短淡出、最多3個/49152rawRGBAbytes，需釋放，不冒稱零資源/全FPS。W保留原24row上限及idle→superseded→duplicate→oldest策略與四counter，不補幀/事件；新owner清自己樣本，victory留真history。CI94有自己的V/W限定樣本，不能回填CI93。

Held VQ01Z/母親家具不得提升或間接替換；src/prologue-render.ts固定blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。G七自製合成音型/七段配樂不取ROM/OST/第三方採樣，每型<=3聲部/level<=.04/尾音<=.5秒，共用16聲部/master.55，單audio-clock不加timer；dialoghold立即停、失敗獨立清理、analyser1024真訊號。Graph/unit/無音軌video不能代替完整音訊或實際聆聽。

## 五、X/Y致死交付與來源驗證

X已修trial/rescue七種敵人：真實致死事件仍排隊時，paused空effects draw不得覆蓋已繪製的存活來源。Y將同一機制補到既存FieldEnemyBody，山道三個、森林兩個位置離線重現修前5fail；修後五正例及十四反例共19pass。只讀pending條件包含同owner/先前存活/battle/已顯示/唯一真實致死事件；只有正常delivery建立原一次copy，不提前消耗queue或推算新事件。清queue、換owner、mode離開、首次已死、reduced、事前隱藏或模糊target不能生造死亡。原24tick、立即停用原敵人、釋放/資源限制均不變。此為offline production World/core回歸，不證明缺陷曾發生於CI94/95。

CI95失敗原因是X0.9.71/VQ03X被原生入口仍傳入的W expected_build拒絕；原checker行為正確，序列停止導致後續report未產生。Y **tests/current_build.py**從checked-out scripts/build.mjs唯一標準宣告綁定producer，不以report作expected。三入口共九個metadata參數更新；原checker defaults、原生路線/ticks/keys/waits/captures/行為斷言未變。缺少/錯誤/重複/模糊宣告failclosed；AST/exact-source及mutation tests防止退化。

Y→X→W來源逆轉僅處理明示source hunks，不接受native報告/狀態/像素，保留所有原expectedhashes並拒絕缺漏/重複/額外修改。77保護項是573未改程式輸入的子集合，不得加總充數。

## 六、當前發布與原生接受邊界

**Y0.9.72 source8024dc43a4e91d0a5f9a319a5ba8c6afdadc1485**；tree **257d953bca5d60c240646d9fa639c3a22384dc53**。完整3019Node/594Python/asset/typecheck/build通過，新增31Node/7Python；21變更檔合批一次non-force發布，GitHub root等於已測tree。唯一matching **CI96/36324453650** push/attempt1，最後in_progress，providerupdated2026-09-27T14:01:58Z。沒有Y原生或部署接受，文件SHA不是遊戲source。

CI95/36320908543始終failure、不rerun、不回填；四份原ZIP已保留雲端。W/CI94/Pages88有界來源/材質/transform/部署接受保持closed，包括repair-history、CPUwheel event1529真實1/2/3格、Vbody及守衛完整死亡。CI93本身亦仍failure。

完整Tank/Yakra死亡仍缺：W WebGL capture致死仍排隊；CPU Tank age9、Yakra age12未滿24tick；勝利不停止simulation。Hench outgoing、Pdown、Q受擊selector-change亦未取得足夠新原生覆蓋。不得改等待/capture或注入狀態補足。History不是同步framebuffer或連續timeline，不同boundary重疊不能重算獨立樣本。本輪未看图、播video、聆聽或測真機。

## 七、下一步與全範圍分母

直接續 **T05-trial-rescue-death-and-action-coverage**。CI96完成後讀該exactY的新native/ledger/原ZIP及matchingPages；保存指定Drive並真正下載回驗，不重送Y、不重驗CI94、不長輪詢。失敗只修真正定位原因，樣本不足如實open。再續全部party/enemy方向與move/attack/hurt/down/death/實際遊玩，前段尺度輪廓/原作構圖/山道法庭壓縮/重疊樹列、合法完整音訊與聆聽、原速/真機長時段。

T03/T04/T06完整範圍如前；T05全部美術/建模/動畫/合法音訊；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整tests/onesource/matchingCI/原始產物雲端回驗。全部分母不縮，沒有newScore或fullapproval。

## 八、持久交付與治理

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Y已測包 **Chrono-VQ03Y-field-and-build-tested.zip／11OO9WpRzU6aNbsIXF7jwFxDMJkGWXTOb**，2744621bytes／SHA256 **677ac8646dfcc8b86d397c670886177434699adfbd5c7f06d17b69f8374d68b0**，69manifest/594snapshot；CI95失敗包 **Chrono-CI95-failed-evidence.zip／1K-0GVsXj2tkG7GPvCocofOPM-wQ__rfM**，40517351bytes／SHA256 **f31219ec7c52d1a665d3ca923f0a3b8f405e4391a60a804368655415cb86aa95**，四原ZIP/6manifest。兩包已真正下載核parent/size/hash/CRC/逐檔；Ysnapshot逐byte一致。成功及失敗logs都保存，不只摘要。封裝false旗標是歷史，currentmain收據優先；snapshot不得覆蓋main文件，local-build不是部署。

Mainonly/singleAI/nonforce，不建branch/PR/parallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數；不放寬原ticks/routes/keys/waits/captures/行為斷言/<.12/單一30秒/250ms-256/CPUquality-memory。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只node_modules/esbuildhardlink，不覆舊source/config或另開bootstrapCI。ROM/media/fonts/credentials私有。所有成果GitHub/正確Drive/readback，docs[skip ci]；main優先於臨時容器及歷史封存。CI77/75/93/95failure與CI71歷史false保持。
