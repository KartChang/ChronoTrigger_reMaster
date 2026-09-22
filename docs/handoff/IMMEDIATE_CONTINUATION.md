# 立即接續 — 唯一 CI55 待完整驗收

使用 GitHub connector 接手 KartChang/ChronoTrigger_reMaster；必要時 Drive。唯一 main、單一 AI、non-force。不盤點歷史、不建 branch/PR、不重做章節、不索取 token/ROM/手動造證據。成果存雲端並回讀，文件 [skip ci]；臨時容器不是權威。

## 唯一目前位置

**VQ02M / 0.9.35**。
Source **238bb31976e58accaf48769b8a72a3693518a4de**。
Source tree **8ff0e84846d3e9c3c9c890d170ca3a0d031675b0**。
Parent **b27f2f7d2e9ea2a4d6dc7e5994ce9f538d10ac6d**（L/0.9.34）。

L 十二檔批次與 M 五檔修正均已發布；M 全 tree 與本機已測程式及原 docs 子樹相同。src/ 全部保持 K 的 **18c602e8c79e292ced059da37a4ee39a5e2075bb**。後續文件 HEAD 不同，不代表另一個遊戲版本。

唯一 **CI55 35696071243**，workflow360357259/.github/workflows/ci.yml，push/attempt1。Exact SHA 全 event/state count=1，最後 **pending/null**，created2026-09-22T06:42:39Z、updated06:42:40Z（台灣14:42:40）。沒有重跑、重派或取消。Terminal **CI55-pending-full-validation**，機器接續點 **docs/evidence/CI55_CHECKPOINT.json**。

開始只讀 STATUS、本檔、checkpoint，查這一個 run。Pending 保存回報，不長等。不要重写 L/M、重驗 CI53/Pages47 或重讀全部白皮書歷史。

## 已完成內容及 CI54 真正失敗

L 只延伸既有內容的 CPU 原生驗證，不重做救援／審判。既有 rescue_browser.py、trial_browser.py 加 CI-only CHRONO_CPU_CHAIN=1，原 WebGL 流程及斷言保留。CPU 用真正 --disable-webgl、auto fallback、平滑預設 OFF。

本人同 run 鏈：cpu-renderer/era600/cpu-kingdom-v4.json -> CPU 救援本人 rescue-returned-v5.json -> CPU 審判本人 v7。另一條三天救援越獄只讀回這個流程自己的 trial-cell-v7.json；原生 chooser/IndexedDB 不變，不得代用舊 CI 成功存檔。

67 coordinate legs（救援37/審判30）、四遇敵接近、两個實體道具提示接近；原 I helper、放鍵後 <.12、距離 tick 公式、單次30秒／250ms pulse／256上限及清理不變。P2 依實際故事存在決定，不復活隱形瑪兒。

十救援＋七審判里程碑含 Naga/青蛙/管風琴/補給/亞克拉/王后大臣/返鄉；審判/敲門越獄/弗里茲/露卡/龍戰車三部位火焰阻擋修理/背包直向/2300入口/另一條等待路線。新增17張 checkpoint真PNG與同步唯讀canvas/renderer/state。返鄉祭典、未來入口各三個連續不重疊 >=120 draw活動視窗，保留120影格mean/P95/max/FPS、texture及可用browser heap，非RSS／真機／長時間遊玩認證。

**CI54 35694463695 的 validate 106638181958 在 Python tests失敗，尚未跑該job瀏覽器**：282 tests中兩個AST保存subtest，3.12.14CI與3.13.5本機的ast.dump顯示格式指紋不一致。缺少後續ledger是結果，不是多個新gameplay故障。原failureZIP已存雲端；CI54不接受，不回填成功。其其他jobs在最後檢視時仍執行，沒有取消。

M 改固定語意AST序列化，保留每個欄位、None、空清單、型別與順序；只省略位置資訊。新expected從**CI53原始Gitarchive**算出，不拿failed hash直接覆蓋，舊display hash留歷史metadata。八個新Python測試驗空欄位／舊metadata形狀／語意變更反例；改原作業斷言、數值、互動、目標或越獄條件依然失敗。M 不改src/、workflow或browser旅程本體。

最終 **1330 Node／290 Python／assets／typecheck／build／完整npm check／diff check 通過**。本機沒有實跑Python3.12或browser；兩者不能冒稱已驗。新L/M原生驗收仍等CI55。

## CI55 結束後直接做

失敗：看第一失敗step與同run原始artifact。若是CPU救援或審判，取cpu-renderer/rescue或trial的cpu-journey.json、rescue-report.json/trial-report.json、native-import-report.json、failure.png；保留首個exception，不放寬走位、預算或斷言。

成功：原三jobs／13primary／既有native/audio/actor/HUD/觸控／裝備v8／全審判及六ledger都保留；再驗新67legs/四遇敵/兩提示/17里程碑及圖片/v4-v5-v7本人原生chain/六活動視窗／第七adventure-source-ledger。用exactsource唯讀verifier重算逐列bytes/hash；檢視真圖與效能，存未改raw ZIP到正確Drive、下載核驗、同CI Pages selected source與playable/staged/deployed HTML。不能用本機source=null HTML比對CI內嵌source的hash。

## 已結案基準

K/0.9.33/source **3028e2499d5a268d20c5251a3aec6e8c2c5a09e2**、**CI53 35684197933／Pages47 35685874454** 已技術驗收。三jobs／13主流程／9原native加兩CPU native／六ledger與原檔hash、原10legs及600前段30legs、22CPU圖均已確認。平滑ON真canvas變、OFF精確還原／mip釋放／full paused state不變。CPU實際61活動interval約17.0125FPS、mean58.7803/P9569.2/max102.6ms，不宣稱穩定流暢。

Pages47 selected source為K，workflow HEAD為3c6bbbc226110ffc450a5171ab1ba1d761f5ff69；playable/staged/deployed為5690213bytes，SHA256 **3fda62047f3d6d5d1ce308534e51856a0da6ce0d88f531ad85b90d6af18c0a39**。沒有額外本機HTTP/browser認證。詳CI53_ACCEPTANCE，不用重驗。CI52仍failure，CI51/G/H/I不重開。

## 臨時環境消失的恢復點

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
M包 **1Sc2809rDWRDCvYZgM1DkI2b2VGpz5gyA**，Chrono-CI54-failure-VQ02M-tested-batch.zip，1340053bytes，SHA256 **885edaa1cf481a5c534382470eadda22ea4275b15645e437283232ec67db1dd3**；14manifest／290程式檔、raw下載hash/CRC/parent都一致。包含真正CI54validate失敗ZIP、修正五檔、完整程式assembled snapshot與最終log。包內發布前狀態是當時記錄；最新source/run以上述checkpoint為準，不再提交一次。

L包 **1NfZu0QvDnMd2Mm17uiZPYsef4OfHyshr**，688057bytes／24manifest／288程式檔，已下載核驗。CI53／Pages47原包 **1h9THuGPcjSkcAPIIdqIeWPO7-5M2u7Kf**，59450174bytes／七原ZIP／12manifest，已下載核驗。snapshot不含進度docs（只有THIRD_PARTY），目前文件另讀main；不先抓全部舊包。

工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 僅node_modules/esbuild hardlink，不覆source/config或bootstrap CI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM** 不重傳或公開。GitHub/Drive本輪均已實際讀寫成功。

## 不變範圍

T03: hidden rules, version differences, full topology and numerical fidelity. T04: growth, battle rewards/drops, complete economy/items/accessories, roster, learned skills and dual/triple techs. T05: complete art/animation/rights-cleared audio, prioritizing actual early-scene quality. T06: complete future and remaining eras, main/side quests and endings. T07: whole-scope >=90, every dimension >=80%, required assets/five gates/zero critical plus physical-device input, FPS/frame time, loading, memory, background, saves and audio. T08: batch implementation/tests, non-force source publication, full matching CI, correct Drive/raw readback and [skip ci] documentation. No reduced denominator. 2300 arrival is not the complete future. Old score 30 is stale; no new score or art/device/full-game approval.

Keep TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/autonomous third and existing home-to-2300/equipment saves v1-v8. No branch/PR/P3/ARPG/framework restart, writable test state/time/save/collision hooks or manufactured positive native saves. Held Z/upgraded mother/furniture and prologue-render.ts blob 2711a74185aacf3c6bddf9db85ba99a2afbc507a remain restricted; no indirect replacement or partial promotion. Local browser restriction remains. No public ROM/original external media/fonts/credentials. Temporary containers are not authority.
