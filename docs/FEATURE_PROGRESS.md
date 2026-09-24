# 功能進度 — F已發布；PNG證據修復進入CI76

Current root T05-early-visual-cohesion；terminal CI76-webgl-png-evidence。Source **19697fc3758b7fd484826a61dc2a98b7ddd6837e**，tree **eff9bafc7f4118b56b8901b782793ef726476706**，VQ03F/0.9.53。MatchingCI76/36037654752最後觀察queued/null，尚未accepted。

## 既有F功能與本批差異

F在456446c3f2e3b6c38425800542c76ac4f92ae355已完成祭典商販/證人與法庭/監獄NPC減少動態設定傳遞、保留frame0及current-tick恢復、隱藏/銷毀binding處理、穩定seed與私有貼圖檢查；審判森林時門抑制非必要旋轉，必要任務動作不變。其原生觀察在既有暫停區間，不新增走位或人工state。這些是已發布F，不是本批重寫。

CI75的runtime旅程/原validate及good成功；bad在PNG證據解碼失敗。真正問題為WebGL960x640套用CPU307200像素上限。本批只改四個script/test檔，分離614400像素/1280邊長/4MiB的WebGL證據解碼器，保留原CPUdecoder、畫面、路線、時間、畫質與完整凍結state/frame/exactrestore門檻。新增真實尺寸的synthetic單元測試、CRC/結構/filter/過大/非法/解壓結尾負測試；fixture不冒充原生證據。

F runtime、資產、workflow、nativecapture逐byte不變；版本仍0.9.53。本次未採用因舊文件誤導而產生的重疊E-based本機實驗；已排除並在雲端investigation-only明列不可發布。

## 已測與未驗收界線

最終2090Node/0fail/0skip，397Python、57targeted含於Node、assets/typecheck/build/check/diff通過；441輸入指紋不變。原CI75未修改證據重現舊錯誤，修復後offlinebad5/validate14列通過、278檔hash相同，不能改記CI75為success。三張原WebGL960x640PNG全尺寸檢視只支持本修復診斷，不是完整movie或art驗收。

matchingCI76與Pages尚待本run原生結果、原圖/原片審查和雲端回驗。最後有界accepted為CI73/Pages67，其靜態及2fps審查不是原速播放。不宣稱新美術分數、真機/長時間/聆聽通過；release仍BLOCKED，舊30/100不適用本runtime。

已測修复/CI75五原ZIP/logs已存指定Drive並實際回驗，詳DELIVERY_INDEX、VQ03F_PNG_REPAIR及CI76_CHECKPOINT。下一步照checkpoint，不重送F。

## 完整剩餘

T05人物/植物/道具尺度輪廓及原作构圖、原速移動/淡化/viewport舒適性、完整角色動畫、合法完整音訊仍開放。既有家中到2300、雙人合作/自主第三、fixedATB、v1-v8存檔與裝備經濟保留；不重做C/Z/A/B/D/E/F。

T03規則/版本/完整拓樸/數值忠實；T04完整成長、報酬掉落、經濟道具飾品、學習及雙三人技；T05全部美術/完整動畫/合法音訊，前段品質優先；T06所有時代主支線與結局，2300抵達不是完整未來；T07整體>=90、各面向>=80%、required assets/five gates/zero critical及真機輸入/FPS/frame time/載入/記憶體/背景/存檔/音訊；T08每批實作測試、一次source、完整matchingCI與原始產物雲端回讀。分母不縮。

main only/single AI/non-force；無新branch、PR、平行candidate或多人防撞。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。不造game/time/save/collision state，不放寬<.12、原tick預算、單一30秒、250ms/256、CPU畫質或記憶體門檻。Held VQ01Z/母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。禁止本機browser。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules及esbuild hardlink，不覆舊source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM及原媒體/字型/憑證不公開。文件[skip ci]、雲端回讀；臨時容器不是權威。
