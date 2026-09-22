# Current status — CI60 accepted; VQ02S / CI61

唯一current root：T05-early-visual-cohesion。唯一execution terminal：CI61-pending-full-validation。只讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI61_CHECKPOINT.json開始。Main only，one AI，non-force。

## 已發布與唯一CI

S/0.9.41 source **9b9020e05b3c9c68aee378ceab74dc8fa4677c88**；root tree **432ce1a0a42bb35f392601eaee774123dffb4684**；parent **8b950ea2a8122b69c19b955c6163a403ba9ff2d4**。23檔一次non-force發布，main已回讀，完整程式樹匹配已測338檔。唯一 **CI61 35765515107**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1。最後in_progress/null，created2026-09-22T18:11:14Z，updated18:11:19Z（台灣2026-09-23 02:11:19）。尚未讀jobs或接受S；文件HEAD不是另一遊戲source。

## 中斷恢復已完成，不重做S

前輪S已完成並存到正確Drive，尚未完成GitHub提交便中斷。本輪從該包恢復，補齊缺少的Git物件；最終root tree與前輪expected完全一致。没有重新設計素材或重寫測試。僅source提交啟動CI61；後續文件[skip ci]不另開CI。

S完成托魯斯六組64x64自製材質（灰泥、木材、石材、石板瓦、陶瓦、木門），原80x40旅店招牌改為床圖示與手繪像素INN，沒有外部字型。VillageFinish僅接到既有托魯斯mesh，不改幾何、位置、角色尺度、森林或NPC。六材質快取重用；原旅店plane/texture重用。原600旅程同次托魯斯到訪加原生暫停後960x640／390x844／844x390觀察，各留DOM與實際CPU canvas PNG，完整state凍結，恢復原viewport並原生resume；失敗保留部分觀察。七ledger不減，新增village profile／材質owner／尺寸／nearest-alpha／RGBA及3view/6PNG bytes/hash/IHDR檢查。Source preview及單元fixture不是原生成功證據。

已恢復前輪完整通過的 **1415 Node／345 Python／assets/typecheck/build/full npm check/diff check** 版本（新增23 Node／8 Python）。本輪沒有重寫或重跑S整套；以23改檔及338檔程式快照的完整Git tree確認與已測bytes完全相同。前輪兩次local host中斷不是CI failure，最終npm-complete.exit=0及python-final.log已保存。十章節對照與六次地圖往返保持geometry/state、僅托魯斯pixels改變，mesh/texture不累增、32MiB/512上限不改。歷史expected hash不換；只反向明列S接線，再驗R/P/Q舊契約，缺少／重複／其他改動仍拒絕。沒有本機browser或S原生驗收。

## CI60／Pages54已結案

最後完整技術accepted：**R/0.9.40/source f7de177305e46cf5d72a63968404d74451579677 / CI60 35749870324 / Pages54 35753711429**。CI60三job成功；原13主流程、9原native加完整CPU兩旅程／600／救援／審判、本人v4-v5-v7及alternate own cell鏈、67原adventure腿／4遇敵／2props／17里程碑／6窗口保留。原始source唯讀重算七ledger逐byte相同，127列bytes/hash一致；39主CPU PNG已檢視。R森林／托魯斯真貼圖profile、384x352地表、64x80樹冠、4／12棵active樹與nearest alpha/RGBA已驗。Pages prepare/deploy及公共HTTP step成功，playable/staged/deployed HTML同5699662bytes、SHA256 979e8b282259e246831abeb53460fab2cce37134deb3476464b265ae13817442。沒有本機HTTP/browser驗收，不代表美術90、真機或長時間流暢。

## 持久保存與接續

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新程式恢復包 **Chrono-CI60-accepted-VQ02S-tested-batch.zip / 11X_BtNMbdeJHKiIQMMwuSUYpTci-alZq**，67039136bytes，SHA256 **3c03bb97fd4185a3af6b2bf86741e28d64f318bb90ec0462dc22857b5eea5f5b**。本輪由Drive下載核對bytes/hash/ZIP CRC/52manifest/七未修改CI60與Pages54原ZIP/parent，全部一致。recovery/VQ02S-tested-program-snapshot.tar.gz含338程式檔，是assembled快照而非published Gitarchive，不含進度docs（THIRD_PARTY除外）。包內source=null為前輪發布前歷史；S現已發布，最新GitHub文件補足身分。不要重送S或用舊docs覆蓋進度。

CI61先依checkpoint完成原suite與新3view/6PNG／實際材質驗收及matching Pages。之後只按真圖處理相容／可讀性問題，再依既有TODO改善前段人物植物道具材質、尺度輪廓、窄地標、完整動畫／合法音訊與有意義長時間／真機觀察。六短窗口不等於長時間認證，不因綠勾擴後段；不預設開平滑、不提升held家中素材。

Pending只保存回報，不長等／輪詢／rerun／dispatch／cancel。Failure處理同run首個真root，不放寬斷言與預算。Success必須全原報告、真圖、ledger、原始雲端與Pages一致，不能只看綠勾。

T03：隱含規則、版本差異、全拓樸與數值忠實。T04：成長、報酬掉落、完整經濟道具飾品、角色與學習技能／雙三人技。T05：完整美術、動畫與合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線、結局。T07：完整範圍整體>=90、每面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次non-force source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來；舊30stale，沒有新美術90、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三及家中至2300、v1-v8裝備存檔。無branch/PR/P3/ARPG/框架重造。Held Z/升級母親家具不提升；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變，不間接替換。禁止本機browser、可寫原生game/time/save/collision hook、假原生成功存檔、公開ROM/原始外部媒體/字型/憑證。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳。臨時容器不是authority。
