# Current status — CI62 failed; VQ02U / CI63 pending

唯一current root：**T05-early-visual-cohesion**。唯一execution terminal：**CI63-pending-full-validation**。先讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI63_CHECKPOINT.json；文件HEAD不是另一遊戲source。

## 已發布修正批次

U/0.9.43 source **1d2be87885c129442d6123625b030d599ed8db50**；root tree **ba4480efcb7ed06451a3202cbbb55958a27a819c**；parent **eef741ed12b8dec3326e385d14a84f5302fb947f**。14檔一次non-force發布，352程式檔與已測快照匹配；main已回讀。唯一 **CI63 35807473251**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1；最後queued/null，created/updated **2026-09-23T01:43:34Z**（台灣2026-09-23 09:43:34）。只查一次，未讀jobs/artifacts/Pages，U尚未原生驗收。

U只在src/main.ts原manualPause分支前加入focused cpu-sampling＋Space回傳native，讓原生checkbox keyup完成切換；不人工click、不改togglePause或模擬時間。其他resume快捷鍵、P1/P2、InputBoundary、core/collision/save、所有材質、幾何、T排版和五花箱均保留。新增完整production router＋真Controls的離線事件回歸，原T路由可重現同一錯誤；補齊重複按鍵、清除舊移動、雙人歸屬、原快捷鍵與native邊界。原生pause_access額外逐鍵保存完整before/after paused/state/focus/sampling及completed，失敗先保留真實觀察再拋錯；source verifier逐鍵驗凍結、連續、checkbox切換／恢復。原三視窗十二張PNG及所有既有斷言不減。

完整npm run check：**1487 Node**、assets、typecheck、build通過；**356 Python**及diff check通過。比T新增25 Node／3 Python。原hash不換，只明列U兩行路由、build版號與test註冊的嚴格test-only inverse，再驗T/S/R/P/Q原契約；缺少、重複或其他變動仍拒絕。原T十章節幾何／像素對照、六次往返不累增材質及所有既有測試保留。沒有本機browser、原生成功fixture或新美術分數。

## CI62實際失敗

CI62 **35776529708**／T source85f35c062720ed494b9869488b0c39e94b7c82b4 已completed/failure，不是accepted。實際validate job106911025319首先在step21「Test playable CPU fallback without WebGL」失敗：原生托魯斯暫停後Tab、Tab到cpu-sampling，第一次Space被manualPause通用路由當作resume。原始report的paused斷言失敗，ticks由63到失敗快照109；只取得第一個960x640 view。兩witness job成功；後續CPU verifier失敗、CPU rescue/trial跳過，沒有playable，不宣稱T全套或Pages驗收。詳細traceback與原檔來源見evidence/CI62_FAILURE.json。

CI62未修改原始browser ZIP另存 **1QStW1BRZQ-jTqlS6KcOo-QYcrfvRZCQs**，22638488bytes，SHA256 **b3a9a93f1cdc209e9ea9b4b4959a40b07f83194cc847d7359cdbaae7cc163ec3**；artifact10716852740，已下載核對bytes/hash/CRC/parent，包內source archive tree與exact T相同。原始失敗report／圖片不改成成功；早期一份decoded-log回應與原檔函式及artifact ID不一致，不作root或完整rawlog依據。

## 已結案基準

最後完整技術accepted維持 **S/0.9.41/source9b9020e05b3c9c68aee378ceab74dc8fa4677c88／CI61 35765515107／Pages55 35769247113**，收據evidence/CI61_ACCEPTANCE.json。三job、13主報告、9原native chooser與完整CPU兩旅程／600／救援／審判、本人v4-v5-v7及alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口、七ledger133列／39主CPU圖＋6S圖已閉環。playable/staged/deployed HTML5704004bytes，SHA256 bd23d550062b186cec198efa7879a5889cdf5c78e351562a38db078f2cd6a9e8。不重開CI61/Pages55、CI60/Pages54或更早。

## 雲端與接續

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。U保存包 **Chrono-CI62-failure-VQ02U-tested-batch.zip / 1JfJL4VqTemOr_iW71wYzQ6-vJ_tzeWK9**，**723879 bytes**，SHA256 **fefc1848058566da709098d498032b37e697be2e97566dd75bee7619436f7e5d**。已下載回驗bytes/hash/ZIP CRC/21項manifest/352程式tar與Git blob/parent。recovery/VQ02U-tested-program-snapshot.tar.gz是assembled已測程式快照，不冒稱published Git archive，不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史；U現在已發布，不重送，用最新main文件補足身分。

CI63 pending只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure處理同run首個實際root及原ZIP，不放寬原斷言或畫質。Success依CI63_CHECKPOINT驗全部原reports、真圖、七ledger、原始Drive回讀及matching Pages/source/HTML；不能只看綠勾。U未得到原生驗證前不把T標accepted，不重做花箱或S/R/Q素材。通過後先處理真圖相容／可讀性，再續前段人物植物道具材質、尺度輪廓、窄地標、全動畫、合法音訊、長時間與真機觀察；直式人物／旅店仍偏小，未完成最終美術。

## 固定完整範圍

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，沒有新美術90分、長時間、真機或全遊戲認證。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。Main only、one AI、non-force，無branch/PR/P3/ARPG/框架重造。本機browser禁用，不造原生game/time/save/collision state；不放寬.12、原tick預算、單一30秒、250ms/256或畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config或bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
