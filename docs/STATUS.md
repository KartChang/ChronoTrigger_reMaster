# Current status — CI69 accepted; VQ03B / CI70 pending

Current root：**T05-early-visual-cohesion**。Execution terminal：**CI70-pending-full-validation**。Authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI70_CHECKPOINT。文件 HEAD 不是另一遊戲 source。

## 本批已發布

VQ03B／0.9.49 source **4c3df07c1a6e067afbd3d42f423481d8e406f9c6**；root tree **439cc6b946698b701a91e4b9ed7aebf408540110**；parent **fdc8f1b13fb35a70dbe82b35f9732b7309f7a483**。21 檔一次 non-force 發布，405 程式檔與已測快照匹配，main 已回讀。唯一 **CI70／35953426299**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source 全 event/state count1。最後 in_progress/null，created **2026-09-24T03:54:55Z**、updated **2026-09-24T03:55:00Z**（台灣 **2026-09-24 11:55:00**）。只查一次，未讀 CI70 jobs/artifacts/Pages；B 尚未原生接受。

Runtime 只改 src/render.ts 並新增 src/town-landmark.ts。Truce 直式取景先計算必須保留的 p0/p1/guest 所需範圍，再評估原 inn-sign 的額外縮放成本。可選地標採進入1.5／退出1.6倍的幾何遲滯；成本太高只移除地標取景要求，不隱藏或移動招牌。所有在場隊員仍為必要對象，沒有裁切 P2 的 zoom ceiling。重用原 EarlyCameraMotion、安全 bounds、fixed-tick 平滑、state identity／非Truce／橫向重置。不改角色尺度、任何場景幾何／材質／位置、Z 招牌與 A 建築淡化、core/main/input/time/save/collision 或 CPU 品質門檻。

同一個原 Playwright CPU context/page 與原 home→fair→600AD 旅程啟用 public record_video，原生路線、六段Truce走位、四停點及20張PNG不變。context.close 後保存 era600/native-session.webm，以新source/run/HTML及 bytes/SHA256 綁定，再刪除唯一冗餘 staging 副本；失敗保留第一個原始錯誤。固定錄影畫幅960×844，host-monotonic-us提供起訖及四停點定位。這是近似導覽時間，不是逐幀精確對時；不錄音、不宣稱裝置／長時間／流暢性已通過。原靜態 stop 記錄 motionVideo=false 保留，完整影片另外在 parent CPU report.nativeVideo。

新增獨立 landmark 幾何驗證，核對實際 candidates、全部劇情在場 owner、1.5/1.6 遲滯決策；出口必須不再強留遠旅店，實際 P0 高度仍>=30px。新增影片來源、完整關閉 context、WebM header、bytes/hash、單調時間及四停點覆蓋檢查，原 era ledger 追加影片檔案列。這不是影片解碼或流暢度驗收；成功後仍須取得完整原片、確認可解碼並觀看實際走位、遮擋淡化及取景變化，不能只看 header 或綠勾。

最終 locked 完整 npm run check 通過：**1782 Node、373 Python、assets、typecheck、build、diff check**，相較 A 新增29 Node／5 Python。405 項最終測試輸入指紋未變。locked-check exit0 完成UTC2026-09-24T03:33:14.266968+00:00；locked-python exit0 完成UTC2026-09-24T03:32:23.810492+00:00。四個 CI69 原始停點 state 僅作離線回歸：DPR1/2 的入口／鎮民／旅店保持 A 像素，出口改為隊伍取景；分離P2/第三同伴、reduced-motion、凍結resize與橫向恢復、九個非Truce章節雙方向像素／幾何、六次warm-cache往返皆驗。B→exact A 嚴格 inverse 保留原hash與斷言；失敗的初稿測試與最終 logs 均保存，沒有本機 browser，也沒有把 unit WebM bytes 冒稱原片。

## 已接受基準

**CI69／35940156052／A source4210a1f6438426d9933039f17178a8414dc94696／Pages63 35942278765 已正式技術接受**。收據 evidence/CI69_ACCEPTANCE.json 已於 fdc8f1b13fb35a70dbe82b35f9732b7309f7a483 獨立發布；本輪沿用，不重驗。原三job／13主報告／9native加完整CPU、七ledger逐byte重算147列、同run存檔鏈、67腿／4遇敵／2props／17里程碑／6窗口與20張村莊圖均已閉環。playable/staged/deployed HTML5720166bytes，SHA25622345927aad23a3a5696ff4ba6b729d9bbe27f1427741481ef46cb8138cc3bcb。85張CPU圖由上輪以8聯絡表、四停點原尺寸拼圖與鎮民原圖檢視，非85張全尺寸。鎮民建築淡化有效；出口為保留遠旅店令half達17.670250309289564而縮小人物，是 B 依據。技術接受不是最終美術或連續動態接受；CI69/Pages63及更早不重開，歷史failure不回填success。

## 雲端與唯一接續

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。B 已測包 **1GazRKfFsIlESBqM7NHdvKxBQgeZ8y2qf／Chrono-CI69-accepted-VQ03B-tested-batch.zip**，**950818bytes**，SHA256 **50716b0add56e2920becaf88cdc8bc64e5268495619e8adf654b856ec822d4e5**；已下載回驗 parent/hash/CRC/21manifest/405程式tar與Git blob。development/VQ03B-tested-program-snapshot.tar.gz 為 assembled 已測程式，非 published Git archive；不含進度docs（THIRD_PARTY除外）。包內 publishedSource=null 為封裝前歷史，B 現已發布，不重送；最新文件只讀 main。

CI69/Pages63 原始證據 **1CTwbpnf6VaibN5luuwNzQ_ESwF_l5wwh／Chrono-CI69-VQ03A-evidence.zip**，69376462bytes，SHA256 **b1c032d306942f791a9eab0e68acf0ac016e5d5521ef701f01192e75e4276f6a**；22manifest、7未修改原ZIP的既有回驗沿用。本輪只取需要的原四停點回歸資料，不重驗已接受的完整CI。

CI70 queued/in_progress 只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure 處理同run首個實際root及原artifact/source-failure，不放寬斷言。Success 依 CI70_CHECKPOINT 完成全部原reports、20PNG、七ledger逐byte/hash、新原生影片、正確Drive原ZIP下載回驗，以及 matching Pages/source/playable/staged/deployed HTML 後才接受B。新HTML必須用B同run來源；local source=null、A/CI69 hash不能當新基準。先親看出口人物及連續城鎮路線、鏡頭／建物／招牌過渡，再續前段人物植物道具材質、尺度輪廓、完整動畫與合法音訊、長時間及實體裝置觀察。

## 固定完整範圍

原三job／13主報告／9native加完整CPU兩旅程／600／救援／審判，audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W/X/Y/Z/A素材與操作、三view12PNG及四停點8PNG、全paused state、Tab/Space、恢復viewport及native resume不減；只追加 B 地標決策與原session影片，沒有以新增項目替換舊門檻。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
