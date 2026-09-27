# Execution TODO — 實際美術優先，接 VQ04A／CI98

Authority：STATUS／T05_ANIMATION_CHECKPOINT **v34**。唯一main/singleAI/nonforce；禁止branch/PR/parallel candidate/multiwriter。使用者重新明確指定：以已認可山道、法庭概念圖為美術目標，做進遊戲，不是產生圖片展示，不再優先一輪輪動畫維護。

Source **4dc7449ff41a6b87e452c45184198b3c9a1929e2**／tree **18e4e642f7e54cfdf7c7f2581712afb6533933af**／VQ04A0.9.74。23個變更檔、3110Node/601Python/asset/typecheck/build完成後一次source push；唯一matching **CI98／36338351176** push/attempt1，最後in_progress（2026-09-27T17:49:23Z）。沒有未發布candidate；不重送、不manualdispatch、不重跑同批完整tests，除非實際改程式。

## 本批已完成，不重做

- [x] 實際入口ArtDirectedWorld接入原World/Babylon場景，沒有展示分支或test-mode美術。
- [x] 山道地表/草地/岩壁/四款樹冠/遠山；法庭地面/石壁/木作/地毯/布幔/彩窗/旗幟及15個牆面構件；1000森林15既有樹卡共用新樹冠。共13材質與16新增静態mesh，不搬角色或改碰撞。
- [x] 同runtime像素13PNG/manifest匯出到原CI的dist/art，無新workflow、無外部請求、無概念圖嵌入。
- [x] 新增42Node/4Python，含真正應用入口像素/原State與actor不變、held場景不間接替換、取景/資源/釋放/章節切換、PNG逐byte驗證及來源保護。完整3110/601全部通過；79manifest/624snapshot指定Drive實際下載回驗。
- [x] CI97/Pages91 provider success已記錄；不假裝已完成本輪未做的Z原生整包審查。Y/CI96及W/CI94既有接受與M-Z已實作基礎不重做。

## 唯一下一 work item：T05-early-production-art-canyon-court

- [ ] **接CI98自己的實際畫面**：完成後讀exactsource的原始山道、法庭、1000森林截圖與必要動態/來源結果，確認matchingPages；原ZIP持久保存、回下載核對。CI pending先留checkpoint，不長輪詢。不得拿concept或OFFLINEfixture當原生。
- [ ] **場景品質完成**：對照認可概念，逐場景調整輪廓、層次、細節密度與重複感、樹冠大小/光向、岩壁與地表銜接、法庭留白/家具尺度/牆面取景、前景遮擋。當前是已接入環境美術一批，尚未達目標批准；不以材質數或測試數代替畫面驗收。
- [ ] **角色與敵人美術**：完整party/enemy方向sprites與move/attack/hurt/down/death、NPC姿態、比例及黑邊辨識；本批未新繪角色，不得勾完成。保留現有已接受動畫播放規格，依真實畫面缺口整批補足。
- [ ] **前段全場景與音訊/舒適性**：原作構圖、縮尺大地圖/室內切換、祭典/城鎮/王城/修道院/監獄等美術，完整合法音訊與實際聆聽、原速/真機/長時段。先讓前段舒適，不急擴後段。

合併可開發的美術修改、完整tests後一次source/matchingCI。除真正阻塞，不再把本輪工作轉成只修animation edge cases，也不重新產生概念圖來代替開發。

## 保留未關閉的原生動畫樣本，不造證據

T05-trial-rescue-death-and-action-coverage仍open：Tank/Yakra完整death、Hench outgoing、Pdown、Q受擊selector-change。先前缺樣本不等於runtime故障；WebGL致死尚排隊、CPU age9/12短於24tick，勝利非simulation停止。不得增加等待、改tick/route/key/capture/assertion或注入game/time/save/collision湊樣本。W repair-history、CPUwheel event1529及既有body/guarddeath有界接受保持closed；CI93/95保持failure不rerun或回填。

## 完整分母及固定限制

T03全規則版本/拓樸/數值；T04成長/獎勵/掉落/經濟/物品飾品/學習/換人/雙三人技；T05全美術建模動畫合法音訊；T06全時代主支線結局，2300抵達非完整未來；T07整體>=90、各面向>=80%、requiredassets/fivegates/zerocritical、真機input/FPS/frame-time/load/memory/background/save/audio；T08每批fulltests/onesource/matchingCI/cloudoriginalreadback。全scope不縮。

fullAnimation/art/originalspeed/listening/device/longsession/wholegame未批准，newScore=null/releaseBLOCKED。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8；heldprologue2711a74185aacf3c6bddf9db85ba99a2afbc507a/母親家具不變。No localbrowser/native造數；原<.12/單一30秒/250ms-256/CPU品質記憶體門檻不放寬。所有成果GitHub或folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb/readback，docs[skip ci]。
