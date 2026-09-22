# Current status — VQ02N / CI56

唯一 current root：**T05-early-visual-cohesion**。唯一 execution terminal：**CI56-pending-full-validation**。先讀本檔、`handoff/IMMEDIATE_CONTINUATION.md`、`evidence/CI56_CHECKPOINT.json`。Main only；單一AI；non-force；不要盤點歷史或重開已驗收章節。

## 已發布、目前待驗

Source **3f65ae23b2b09be1bb4c23ed559003ae541fe1d3**，root tree **f9320655ffcb75c7de8f6c9c969e7a0d0c95cc91**，VQ02N/0.9.36。一次source commit，parent **91e79f707cb28974140359d9759e6de4f155348f**；main已回讀，完整程式樹與測試版本一致。所有src/仍為 **18c602e8c79e292ced059da37a4ee39a5e2075bb**。文件更新不改遊戲source、不另開CI。

唯一run：**CI56 35706073669**，Playable prototype CI /360357259，push/attempt1，exact source全event/state查詢count=1。最後 **in_progress/null**，created 2026-09-22T08:40:19Z，updated 08:40:23Z（台灣16:40:23）。尚未查jobs、尚未驗收；不輪詢、rerun、dispatch、cancel或再推source。

N九檔修正CI-only CPU rescue/trial雙人走位：遠距離同向原生按鍵共走，依實際放鍵後snapshot修正落後者；已到位者不被另一人的精準修正拖走。兩人均須在原目標軸誤差<.12內，沿用P1原始距離計算的一份tick預算、单一30秒deadline、250ms pulse/256次上限，不因P2修正重設。Verifier要求雙owner、實際按鍵/放鍵顺序、連續snapshot、未操作者及垂直軸不動。原I helper、原CPU/600 driver、rescue/trial本體、遇敵與實體道具路線、src/index/.github不變。

最終 **1339 Node /305 Python /assets/typecheck/build/完整npm run check/diff check通過**。新增9 Node/15 Python；48方向/軸/延遲子例、36實際觀察走位×3延遲模型的108個core碰撞回歸、原托魯斯最後兩腿及真正轉場規則。皆本機單元/整合證據，非新原生瀏覽器驗收；本機未操作browser。

## CI55已失敗，不再是pending入口

CI55 **35696071243** / source **238bb31976e58accaf48769b8a72a3693518a4de** completed/failure，updated **2026-09-22T07:08:46Z**。validate106643830853 failure；good106643830978及bad106643831050 success。首個root **CI55-cpu-rescue-companion-drift-at-truce-return**，step24。

原CPU兩旅程、600前段、平滑及M語意AST檢查已通過；新增救援已達9/10里程碑、36/37原coordinate legs，亞克拉、王后/大臣、返鄉重逢均有原始觀察。托魯斯出口P1=(-.06666666666666181,7.599999999999995)，P2=(2.1666666666666767,4.800000000000005)，距離3.5815887225891454>原3.5；遊戲正確回應「等待同行者」。舊driver只確認P1，P2偏移累積。不得改同行距離或碰撞來通過。

已看原始failure.png；CPU確實畫出托魯斯與分離角色。六份原passed ledger共65列bytes/hash及救援列入檔案均核對；本輪未重新執行verifier，不宣稱重建ledger。CPU trial未執行、第七ledger不完整是後果；CI55不接受、無playable或新Pages驗收。詳見CI55_FAILURE_ROOT。

## 持久保存與下一步

指定folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新 **Chrono-CI55-terminal-VQ02N-tested-batch.zip** / **1irVUTuklzPVqGjRd2cBCbGPlZo8YcRqn**，58936843 bytes，SHA256 **e444e9968d7b8762877997cef320d216a612e17aba00f7cfd858267723fc5969**。下載回讀已核對hash/CRC/31manifest/四原ZIP/parent；含294檔assembled程式快照，非published Git archive。包內source=null是發布前歷史；最新身分以GitHub本次文件為準。不可重送已發布N或用包內舊docs覆蓋目前文件。

最後完整技術accepted仍是 **K/3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**；不重開。CI56成功後依checkpoint核對原全套及完整CPU救援/審判/本人存檔鏈/67腿/四遇敵/兩提示/17里程碑/六窗口/第七ledger、原圖、Drive及同CI Pages。再處理實際相容/效能與前段美術品質；綠勾不代表長時間、真機或美術認證。

T03–T08完整範圍不縮：規則版本拓樸、成長報酬經濟技能、全美術動畫音訊、其餘時代主支線結局、整體>=90/每面向>=80%與實體裝置、每批雲端。2300抵達非完整未來；舊30stale，無新分數。TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三保留。Z/母親家具仍held；prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變；不間接提升。禁止本機browser、可寫時間/存檔/碰撞hook、偽原生成功存檔、公開ROM/原媒體/字型/憑證。工具鏈只恢復node_modules/esbuild hardlink。
