# 立即接續 — CI70 checkpoint only

用GitHub connector接KartChang/ChronoTrigger_reMaster，必要時Drive。立即續作，不盤點／審計／重新規劃；只讀STATUS、本檔、CI70_CHECKPOINT，確認main一次與同run一次。文件HEAD不同仍接同source/run。不索取ROM/token/手動證據。

Current root：**T05-early-visual-cohesion**。Execution terminal：**CI70-pending-full-validation**。Authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI70_CHECKPOINT。文件 HEAD 不是另一遊戲 source。

VQ03B／0.9.49 source **4c3df07c1a6e067afbd3d42f423481d8e406f9c6**；root tree **439cc6b946698b701a91e4b9ed7aebf408540110**；parent **fdc8f1b13fb35a70dbe82b35f9732b7309f7a483**。21 檔一次 non-force 發布，405 程式檔與已測快照匹配，main 已回讀。唯一 **CI70／35953426299**，workflow360357259／.github/workflows/ci.yml，push／attempt1；exact source 全 event/state count1。最後 in_progress/null，created **2026-09-24T03:54:55Z**、updated **2026-09-24T03:55:00Z**（台灣 **2026-09-24 11:55:00**）。只查一次，未讀 CI70 jobs/artifacts/Pages；B 尚未原生接受。

## 已做，不重做

Runtime 只改 src/render.ts 並新增 src/town-landmark.ts。Truce 直式取景先計算必須保留的 p0/p1/guest 所需範圍，再評估原 inn-sign 的額外縮放成本。可選地標採進入1.5／退出1.6倍的幾何遲滯；成本太高只移除地標取景要求，不隱藏或移動招牌。所有在場隊員仍為必要對象，沒有裁切 P2 的 zoom ceiling。重用原 EarlyCameraMotion、安全 bounds、fixed-tick 平滑、state identity／非Truce／橫向重置。不改角色尺度、任何場景幾何／材質／位置、Z 招牌與 A 建築淡化、core/main/input/time/save/collision 或 CPU 品質門檻。

同一個原 Playwright CPU context/page 與原 home→fair→600AD 旅程啟用 public record_video，原生路線、六段Truce走位、四停點及20張PNG不變。context.close 後保存 era600/native-session.webm，以新source/run/HTML及 bytes/SHA256 綁定，再刪除唯一冗餘 staging 副本；失敗保留第一個原始錯誤。固定錄影畫幅960×844，host-monotonic-us提供起訖及四停點定位。這是近似導覽時間，不是逐幀精確對時；不錄音、不宣稱裝置／長時間／流暢性已通過。原靜態 stop 記錄 motionVideo=false 保留，完整影片另外在 parent CPU report.nativeVideo。

完整1782Node／373Python／assets/typecheck/build/check/diff已通過；locked405輸入指紋與21改檔全保存。CI69/Pages63收據已正式結案，本輪沿用。不要因舊CI69 pending、A或Z快照再重做；現在是B/CI70。

## 直接接續

CI70 queued/in_progress 只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure 處理同run首個實際root及原artifact/source-failure，不放寬斷言。Success 依 CI70_CHECKPOINT 完成全部原reports、20PNG、七ledger逐byte/hash、新原生影片、正確Drive原ZIP下載回驗，以及 matching Pages/source/playable/staged/deployed HTML 後才接受B。新HTML必須用B同run來源；local source=null、A/CI69 hash不能當新基準。先親看出口人物及連續城鎮路線、鏡頭／建物／招牌過渡，再續前段人物植物道具材質、尺度輪廓、完整動畫與合法音訊、長時間及實體裝置觀察。

新增獨立 landmark 幾何驗證，核對實際 candidates、全部劇情在場 owner、1.5/1.6 遲滯決策；出口必須不再強留遠旅店，實際 P0 高度仍>=30px。新增影片來源、完整關閉 context、WebM header、bytes/hash、單調時間及四停點覆蓋檢查，原 era ledger 追加影片檔案列。這不是影片解碼或流暢度驗收；成功後仍須取得完整原片、確認可解碼並觀看實際走位、遮擋淡化及取景變化，不能只看 header 或綠勾。

原三job／13主報告／9native加完整CPU兩旅程／600／救援／審判，audio/actor.playback/HUD/normal-paused-reduced/grounded ATB/touch/equipmentv8/fulltrial、同run本人v4-v5-v7／alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger每byte/hash均保留。Q/R/S/T/U/V/W/X/Y/Z/A素材與操作、三view12PNG及四停點8PNG、全paused state、Tab/Space、恢復viewport及native resume不減；只追加 B 地標決策與原session影片，沒有以新增項目替換舊門檻。

## 最小恢復

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。B 已測包 **1GazRKfFsIlESBqM7NHdvKxBQgeZ8y2qf／Chrono-CI69-accepted-VQ03B-tested-batch.zip**，**950818bytes**，SHA256 **50716b0add56e2920becaf88cdc8bc64e5268495619e8adf654b856ec822d4e5**；已下載回驗 parent/hash/CRC/21manifest/405程式tar與Git blob。development/VQ03B-tested-program-snapshot.tar.gz 為 assembled 已測程式，非 published Git archive；不含進度docs（THIRD_PARTY除外）。包內 publishedSource=null 為封裝前歷史，B 現已發布，不重送；最新文件只讀 main。

## 全範圍與限制

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets／five gates／zero critical，及實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊。T08：每批實作測試、一次source、matching完整CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale；無新美術90分、長時間、真機或全遊戲認證。

Main only、single AI、non-force，無branch／PR／P3／ARPG／框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。不造原生game/time/save/collision state，不放寬.12／原tick預算／單一30秒／250ms/256／畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
