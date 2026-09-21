# 立即接續 — CI46／Pages40閉環；唯一CI47待驗收

立即使用GitHub connector，必要時Drive接手KartChang/ChronoTrigger_reMaster。只有main，單一AI、非force；不建branch/PR/平行candidate，不盤點歷史，不要求token、ROM或手動證據。

## 唯一當前位置

VQ02E／0.9.27 source **f07a42bfa7357e1a9ddcebfa8a790855927051b4**。
Source root tree **00efc6b0ea450961739948a952bd2756ea7f2eb1**。
Parent **54d46a47ca23791ee5579eb7cd027ee189711dfb**。
16檔一次非force sourcecommit已發布，main回讀；完整src/tests/scripts與index匹配本機測試，.github不變。後續[skip ci]文件HEAD不是另一個source。

唯一驗證 **CI47 35615882220**，push/attempt1；最後 **in_progress/null**，created2026-09-21T14:59:36Z，updated14:59:40Z（台灣22:59:40）。exactSHA全event/state count=1；沒有dispatch/rerun/cancel/waitloop。
Machine checkpoint **docs/evidence/CI47_CHECKPOINT.json**；terminal **CI47-pending-full-validation**。

先讀STATUS／本檔／CI47_CHECKPOINT，確認main一次，再接同run。queued/in_progress即保存回報，不長等；failure只查同run第一實際根因；success完成全部最終報告與實圖原包Pages閉環。不要因文件HEAD變動重開CI，不重跑CI46或回到CI45。

## 本批已完成，不重做

CPU保守減負：畫面內三角形略過完整裁切、共用同一外側plane者快速排除；讀即時頂點與矩陣，只剔除確定在視野外的submesh，不使用陳舊bounds。原材質支援檢查保留，方向光每frame一次正規化。原像素填色、深度、透明、UV、場景geometry、解析度與規則不變。增加實際工作量觀察；暫停CPU說明HTML已修。沒有重畫角色／素材、沒有碰main/World/鏡頭/玩法/受限檔案。

新跑 **1141Node／220Python**、assets/typecheck/build全過，PythonAST與diff空白檢查通過。5000三角形新舊RGBA/depth一致，22既有場景×2單元視窗像素與state一致。測試canvas是矩形替身，未繪文字曲線，不是原生遊玩。CI46舊實作只是tests/baselines差分oracle，production不匯入。Node640×480、5warmup+15交错samples：祭典中位93.6771→54.3625ms，家中48.4115→45.9998，大地圖47.2071→46.8945；不是瀏覽器FPS或真機加速。本機未跑browser。

## CI46／Pages40已驗收

D0.9.26 source **54d46a47ca23791ee5579eb7cd027ee189711dfb**，tree **dd071fde6ad668995504b6882378fb3d9f88cb55**。
CI46 **35609380108** success updated14:27:10Z；validate106364372337/good106364372099/bad106364372325均成功。13主、9原native加1CPU native，三lane+render+CPU五ledger及列入bytes/hash精確只讀重現。保留音訊、角色播放、HUD、地面、場景正常/暫停/減動態、接地ATB、商店裝備v8/IndexedDB/全審判與故事。觸控load4945.54ms、原30000ms不鬆、trace129項CRC。

**無WebGL可玩CPU已實作並有前段原生證據**。在--disable-webgl預設auto，真正由家中下樓、母親既有對話、大地圖到祭典；P1/P2獨立操作、岡薩雷斯ATB勝利、IndexedDB、自行匯出v2再原生匯入、九張CPU原PNG皆通過。不是只有錯誤畫面／NullEngine空跑，也不是強制SwiftShader。全章CPU原生旅程、裝置速度與畫質仍未驗收；光影簡化不等於WebGL畫面一致。

Pages40 **35612258615**，prepare106374039994/deploy106374133537成功。playable10645086075/staged10644058295/source/CI匹配，HTML **5673691bytes**／SHA256 **3493ec1fa7ef601950c1f8b8d9da43888b52bce705ff5437565f258fd1303c43**。公開HTTP來自14:27:40.1618415Z實際成功deploy步驟，無另一次本機live/browser。已看CPU、角色、九场景與render/recovery原圖衍生sheet；材質平塗與窄視窗仍有缺口，不是90分／聽感／真機／全作驗收。

上一中斷只發布D，文件還是CI45；本次直接從最新main/CI46恢復並完成收據，不重新審計CI45、不補造其獨立acceptance。CI45舊pending已取消當前authority；CI44/Pages38及更早閉環不重開。

## CI47成功必查

三job、13finalprimary、9原native、三lane、render與CPUledger，音訊/actor.playback及既有全部斷言。CPU原兩條native旅程、九PNG、同runv2匯出與原生import都保留；額外要求真實work計數守恆與CPU說明。檢視原圖、核對bytes/hash/source/run/attempt/HTML，完整原ZIP到指定Drive回讀，再匹配Pages。不得用progress/合成fixtures取代最終報告，不能把單元benchmark當CI/裝置FPS。

## 快速恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
已驗收包 **Chrono-CI46-Pages40-accepted-evidence.zip**：ID **14tSUKqvNA95il7QAOlGCpm6IVgK9MIp9**，**55007154bytes**，SHA256 **5ef7c9f254ee1afd463569e5ad78ffb1af72b8f9758ea1937fdbb0e9d378eba0**；下載hash/CRC/15manifest/六原ZIP/parent均核對。raw/CI46-browser.zip內source-54d46a47ca23791ee5579eb7cd027ee189711dfb.tar.gz，Gitarchivecomment匹配。

E包 **Chrono-VQ02E-tested-source-local-evidence.zip**：ID **1JYsFtMMuNMwPmGEciEqp6rmvCo628868**，**1858994bytes**，SHA256 **2f4f81351162667c75f9998d7efb55fc8c11bb7d9a6d77b9e7f396fa8ef7dfee**；下載hash/CRC/28manifest/parent核對。16changes、原始local logs、benchmark原samples、未驗收HTML與 **recovery/VQ02E-tested-program-snapshot.tar.gz（263檔）**。這是assembled snapshot，不冒稱publishedGitarchive；封存nullsource正確，最新GitHub收據補足身份。最新文件永遠另外讀main，不用tar舊文件覆蓋。

## 保留限制與完整範圍

Z0.9.22仍未發布受限，不重送、換編碼管道、間接替換或部分提升。prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 及localbrowser限制不變。CPU使用原場景不是整合受限新母親／家具；既有對話通過不代表升級美術完成。此類限制不等於connector無法存取。

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90各面向80%/實體裝置、T08每批雲端不縮小。先前段真品質，再擴後段。全章原生CPU/持續frame-time與装置、材質尺度窄視窗、升級母親家具、完整動畫音樂仍未完成；舊診斷/版本標籤尚有整理項。2300抵達不是全未來、舊30stale，不灌分。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1克羅諾/P2露卡/自主第三同伴及home-to2300/equipment/v1-v8，不加P3不改ARPG不重造框架。固定工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlinks。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM/原圖原音訊/字型/憑證。所有成果回存GitHub或正確Drive並回讀；文件[skip ci]，臨時容器不作權威。
