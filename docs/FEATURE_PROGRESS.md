# 功能快照 — CI52失敗；K已發布／唯一CI53待驗收

Authority：STATUS／IMMEDIATE_CONTINUATION／CI53_CHECKPOINT。沒有新增完成百分比、美術分數或全遊戲已接近完成的認證。

**VQ02K／0.9.33**，source **3028e2499d5a268d20c5251a3aec6e8c2c5a09e2**，tree **23c26af9f62ec1b6dc2f1e7e56974e0dc35a3ea0**。8檔整批測試後一次non-force發布，main回讀及完整testedroot相同。

這次修正實際產品取樣缺口：CPU「遠景紋理平滑」原本只在rho>=2才作用，現在原圖與第一縮圖之間、相鄰縮圖之間依log2足跡連續混合，涵蓋1<rho<2。整數層單次取樣，分數層兩次RGB取樣，選層仍每三角形一次。預設仍OFF；放大、無效與透視回nearest，透明人物／植物、opacity/blend/cutout及vertex-alpha輪廓保留。原素材、材質、UV、幾何、鏡頭與WebGL不變；原32MiB／512entry快取及清理保留，不是解封Z或新美術資產。

同批補上失敗證據：在原斷言之前留下nearest／filtered／restored實際snapshot，裸AssertionError也保存類型、訊息和原traceback後重新拋出。39個原600驗收assertion、30段原生路線、I走位helper、所有預算與30秒、原CPUdriver與六個verifier均未改。J已存在的同頁Gato/v2→600前段／本人v3-v4／cathedral入口路線保留，不重造故事。

新跑 **1250Node／262Python／assets／typecheck／build／完整npmcheck exit0**。新增11Node與3Python，含既有World於678／543／452三尺寸的UNIT canvas、輕度縮小、精確關閉還原、alpha／UV／透視／裁切／記憶體與失敗保存。兩個修正前回歸測試失敗，修正後通過；兩次工具中斷check另存，不當成功。unit543×362的0→1482取樣計數不是原生browser畫面，也不能認證改善幅度或效能。本機未操作browser。

CI52 **35680779688**於2026-09-22T03:13:29Z failure；validate106597074095／good106597074278／bad106597074334。兩原CPUcase已成功、10次放鍵抵達、本人v2／IndexedDB／原生匯入保留；新era在任何走位之前因enabledtrue、mip349524bytes但minifiedTriangles0失敗。buffer543×362；原始failure圖有祭典與已勾選開關，不是空白renderer。模型算得rho約1.272581，明示非native數據。原報告頂層仍failed，steps22／23是次生；無playable／新Pages。4原ZIP、11原CPU圖hash與6renderledger列入檔已核對，未重跑verifier或宣稱全驗收。

唯一 **CI53 35684197933**，push／attempt1，最後in_progress/null、updated2026-09-22T03:43:32Z（台灣11:43:32），exactSHA count1，未查jobs／未接受。原全套證據加J新era六號ledger／30路段／11新圖／本人v3-v4、真canvas開關還原與完整pausedstate仍須完整驗收，再原包雲端與Pages閉環。

最後已驗收仍 **I0.9.31／CI51 35675330433／Pages45 35676767742**，source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5。五ledger、原兩CPU旅程及部署閉環不重開，G/H/I不重做；CI48–50、52不回填成功。

指定folder已保存 **Chrono-CI52-terminal-VQ02K-tested-batch.zip／1dHLUbuu8p3VtqwVENV0jO6PJid2g7etZ**，55142554bytes、46manifest、4原ZIP、282檔恢復；下載hash／CRC／parent一致。封存nullsource為發布前，最終GitHub收據補身分；assembled快照不是publishedGitarchive，最新docs另讀main，不依賴容器。

完整T03–T08不縮小；CPU全章與裝置／持續效能／聽感、材質尺度輪廓窄地標、全動畫音樂、成長經濟技能、其餘時代主支線結局與90仍有缺口。Z／升級母親家具／prologue-render／localbrowser限制不變且不可旁路。2300抵達非全未來；舊30stale，測試數不能代替美術交付。
