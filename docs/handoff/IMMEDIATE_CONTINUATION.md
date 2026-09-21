# 立即接續 — CI47／Pages41已閉環；唯一CI48待驗收

立即用GitHub connector，必要時Drive，接手KartChang/ChronoTrigger_reMaster。唯一main／單一AI／非force，不開branch、PR、平行candidate，不盤點歷史或重做章節，不要求token／ROM／手動證據。

## 唯一目前位置

VQ02F／0.9.28 source **38edba36ccd75a3ef8129aea62d21769d847f749**。
Root tree **d5dbe994553244225992594452379ff38b49b9dd**。
Parent **de92955eb4946ff766f8e2b6080ea340bb1e81a3**。
19檔整批測試後一次非force發布，main回讀；完整src/tests/scripts與index匹配已測bytes，.github不變，最新文件子樹保留。後續[skip ci]文件HEAD不是另一個gamesource。

唯一CI **CI48 35634970145**，push/attempt1，source如上；最後in_progress/null，created2026-09-21T17:54:32Z、updated17:54:36Z（台灣2026-09-22 01:54:36）。exactSHA全event/state count=1，無dispatch/rerun/cancel/waitloop。
Checkpoint **docs/evidence/CI48_CHECKPOINT.json**，terminal **CI48-pending-full-validation**。

開始只讀STATUS、本檔、CI48_CHECKPOINT，確認main一次並接同run。文件HEAD不同不重開CI；queued/in_progress保存回報不長等；failure查同run第一實際root；success完整報告實圖雲端Pages閉環。不要重跑CI47，也不要重看全部舊ZIP／歷史。

## 本批已完成，不重做

修正CPU解析度層級被640×480固定像素上限抵消的問題。先算原CPU基準cap再乘tier：auto0–3、原畫質基準0、相容tier2。起始auto保留原畫布尺寸，原WebGL密度／30warmup+90samples自動條件不變；不改場景、人物、鏡頭、ATB或存檔。

120格活動影格間隔統計替代NullEngine FPS；排除啟動／恢復邊界與暫停，保留有效活動長幀，唯讀mean/P95/max/FPS。頁腳正確顯示CPU/Canvas2D或WebGL、取樣／暫停狀態與真正buffer尺寸；tooltip說明不是GPU時間或真機認證。build與runtime使用同一注入version/batch/source；暫停顯示身份，移除靜態0.9.17與舊章節版本字樣。

新跑 **1161Node／220Python**、assets/typecheck/build、PythonAST、diff檢查通過。六項明列main診斷／文字逆向比對，保留原hash預期及22遊戲函式檢查；World/core/input/save/camera/CPU scene/raster及held檔案原樣。初次6個舊pin失敗、中途1160通過與最終1161成功log均保留。未提交的測試blob傳輸多一引號，發布前修回已測內容，全樹匹配；沒有改測試掩蓋它。本機沒有browser，沒有F實圖／新真機結果。

## CI47／Pages41實際已驗收

E0.9.27 source **f07a42bfa7357e1a9ddcebfa8a790855927051b4**，tree **00efc6b0ea450961739948a952bd2756ea7f2eb1**。
CI47 **35615882220** success updated2026-09-21T15:22:33Z；validate106386347752/good106386347748/bad106386347601全成功。13最終主報告、9原native加1CPU native、三lane+render+CPU共5ledger，列入bytes/hash核對並只讀精確重現。原audio/actor/HUD/場景/接地ATB/商店裝備v8/IndexedDB/完整審判與故事保留；觸控load4927.24ms、原30000ms不鬆、兩視窗、trace123項CRC。

CPU原兩條旅程：家中下樓／母親既有對話／大地圖／祭典，P1/P2各自操作，岡薩雷斯ATB勝利，同run匯出v2與原生匯入。九CPU原PNG與work守恆通過，不是全章CPU／裝置速度認證。已看9CPU、9場景、4actor、5render圖；平塗材質、sprite/3D語言與直向鐘庭裁切仍在，不是90分。

Pages41 **35618506663** prepare106395338147/deploy106395411907成功。staged10647891482/playable10647046921/source/CI/HTML匹配：**5675518bytes／bbfdb7f259150ec583c4b86b71c8578cbaebce24257d87f0876274cc37979e56**。公開HTTP來自2026-09-21T15:26:48.2571224Z成功deploy步驟，不是另一次本機live-byte/browser；workflowHEADde929是文件HEAD不是runtime。CI47正式收據已閉環，不重跑CI47／CI46或更早。

## CI48成功必查

三job、13finalprimary、9原native加CPU native、三lane/render/CPUledger，原audio與actor.playback及所有既有旅程。CPU仍是原兩條native路線與同runv2匯出／原生匯入；新增 **presentation.active** 至少60個真正活動sample、finite一致mean/P95/max/FPS、正確CPU與build/source標籤；原生quality/compatibility切換後實際buffer尺寸變小、完整pausedstate不變。CPU11PNG：原9張加 **cpu-quality.png／cpu-compatibility.png**；CPUledger14files。所有原bytes/hash及PNG要核對並看實圖，不以progress或syntheticfixture代替。

**F會把真正CI sourceSHA嵌入HTML**，故CI bytes/hash與source=null的localHTML不同是預期行為。以同run的build-meta／source/run/attempt／原HTML／Pages匹配，不用localhash造成假failure。完整原ZIP存指定Drive回讀後才close；不靠綠勾／計數認定美術、聽感、真機或全章CPU完成。

## 雲端快速恢復

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
最新已驗收 **Chrono-CI47-Pages41-accepted-evidence.zip**：ID **1mwt02LrSZpAIIIlQtv8QWFtb78aCcd35**，**54510480bytes**，SHA256 **5d84469bfcf0681edcd5be641ed473184f6e8f6e48572d5fda2412ec1804dee9**。下載hash/CRC/14manifest/六原ZIP/parent全核對。raw/CI47-browser.zip內 **source-f07a42bfa7357e1a9ddcebfa8a790855927051b4.tar.gz**，Gitarchivecomment匹配。

F測試包 **Chrono-VQ02F-tested-source-local-evidence.zip**：ID **1jDHFP8Mmd58iZNK5A-8spp_9KLphxjtG**，最終 **2026104bytes**，SHA256 **320e0aed8b00a6ab5dde31354f10103a030076c916099643fe05b1dacadfba22**。同ID於17:46:04.450Z更新後已下載核對hash/CRC/34manifest/parent；先前1981926bytes/32項版本不是最終包。19changes、11log/exit檔、local-validation、未驗收localHTML、**recovery/VQ02F-tested-program-snapshot.tar.gz（269檔）**。assembled非publishedGitarchive；封存nullsource正確，最終GitHub收據補身份。快照除THIRD_PARTY外不含docs，最新文件永遠另外讀main。

## 限制與完整範圍

無WebGL的可玩CPUfallback已存在並驗收前段，不重造；全章原生CPU與實體裝置仍未完成。Z仍未發布受限，不重送／換編碼管道／間接替換／部分提升；prologue-render.ts **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 和localbrowser限制保留，不能把一般繼續當解除，也不能說connector因此不可用。

完整T03規則版本拓樸／T04成長報酬經濟技能／T05全美術動畫音訊／T06其餘時代主支線結局／T07整體90各面向80%及真機／T08每批雲端不縮小。先前段真品質再擴後段，材質比例／窄視窗／升級母親家具／完整動畫音樂仍未完成。2300抵達不是全未來，舊30stale。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1克羅諾/P2露卡/自主第三同伴、home-to2300/equipment/v1-v8，不加P3不改ARPG不重造框架。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules保留esbuildhardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM/原圖原音訊/字型/憑證。所有成果GitHub或指定Drive回讀，文件[skip ci]，臨時環境不是依據。
