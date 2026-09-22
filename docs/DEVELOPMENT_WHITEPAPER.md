# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02k-ci53-pending。依既有產品與TODO續作，不重新規劃。唯一入口STATUS／IMMEDIATE_CONTINUATION／CI53_CHECKPOINT。前版全文保留於0df37add4bf68e3b2314593b13413c1173e0cc09；其CI52pending由本次實際failure與K／CI53取代，不重開舊章節。

## 產品目標與架構

完整《超時空之鑰》HD-2D重製：像素人物加立體場景、原作辨識度、縮尺大地圖及城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮成序章。前段人物場景、美術建模動畫、鏡頭遮擋HUD、操作聲音先取得實際品質證據，再擴後段。90須來自實際驗收，不是AI自評、引擎或特效數量。

保留TypeScript＋Babylon.js＋esbuild自含HTML及固定package／lock。玩家不需ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；音畫不決定傷害、資源、碰撞或故事。CPU共用現有場景圖，不重造平行關卡。暫停、背景、對話、背包、原生選檔、contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入、A*保留碰撞。P1克羅諾／P2露卡與劇情所有權、瑪兒／青蛙自主第三同伴、各自選敵與雙確認合技不變，不加P3或可寫通關hook。

## 已有功能與資產，不重做

家中醒來／樓梯、縮尺區域圖、千年祭行為與初遇、項鍊異變、600山道、托魯斯、森林王城、露卡、修道院青蛙／管風琴暗門／密道補給／亞克拉、王后大臣救援返鄉、護送被捕與兩裁決、敲門越獄或等露卡／弗里茲／看守室、三部位龍戰車、重聚、森林時門、2300抵達皆已有實作。2300抵達不是完整未來篇，經驗紀錄不是完整成長。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容、穿戴份數、金幣庫存守恆及交易上限保留，不能出售仍穿戴品。400G、價格及普通攻防增減為明示暫定重建，不冒稱原作數值。成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人仍不完整。

IndexedDB／JSON白名單v1-v8保留。舊檔未知行為不補造證詞，查看不強制改寫，本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu/frame唯讀；CPU專項本人v2/v3/v4不能取代原裝備v8與其他存檔驗收。渲染偏好及診斷不存入遊戲檔。

保留A/B/C主角、鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態/reduced-motion、W局部光照銅材質六樹根八陰影、X鋪面grassmask、Y投影閱讀性/caster合併/20石材倒角。C原片段與影格、固定tick動作及位移步伐、96格CPU快取不重畫。A七段自製短曲及B靜音修正保留，不是原作OST或完整配樂。

## 品質界線與固定限制

精緻HD-2D仍有交付落差：木料平塗、人物植物／立體道具材質語言、尺度輪廓、窄視窗地標、升級母親家具、完整動畫音樂尚未全部完成。既有母親對話不等於新美術整合。測試數、模型數、短曲、CPU相容或FPS標示不能代替90。舊30stale、release仍blocked，不宣稱全作接近完成。

Z0.9.22材質／UV／直向構圖仍未發布且受限，不重送、換編碼管道、間接替換或部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與本機browser限制不因一般繼續解除。J／K沒有改素材／材質／UV／幾何／鏡頭，不是繞道推送Z。這些特定限制不表示GitHub／Drive不能讀寫。

## CPU既有能力與已驗收基準

D/E在WebGL2/1不可用時預設CPU／Canvas2D，實際處理既有頂點矩陣、簡化光照、UV紋理、透明深度與像素，不是NullEngine空跑或錯誤頁。640×480像素cap、最大邊1280、紋理32MiB／512格，不做shadowmap/glow/specular，不保證WebGL完全一致或真機流暢。E保守剔除、完全畫面內三角形快速路徑、重用方向光與真實work計數保留。

F的CPU密度tiers、auto/quality/compatibility實際尺寸、120活動frameinterval與mean/P95/max/FPS、CPU/Canvas2D及build/source身分保留。G放鍵後抵達檢查、H長腿最多250ms脈衝、I近目標P1內層按鍵避免P2transport拖長，仍保留<.12、原tick公式／30秒與全部cleanup。這些修正已在I完整native驗收，不重做；失敗的CI48–50不回填成功。

最新已驗收仍 **I0.9.31／source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5／CI51 35675330433／Pages45 35676767742**。其3job、13主、9原native加CPU、音訊actor/HUD/正常暫停減動態/接地ATB/裝備v8/全審判故事/觸控及五ledger逐bytes閉環保留。兩CPU旅程（家中至祭典；雙人ATB／本人v2匯出／IndexedDB／原生匯入）、10放鍵抵達／11真圖，以及品質尺寸和完整pausedstate皆已驗收；不是真機／持續流暢／聽感或美術90。CI51、舊CI47及更早閉環不重開。

Pages45的selectedsource是I，與workflow文件HEAD不同是正常。原playable/staged/deployedHTML相同5686369bytes／SHA256ca963b73d55cdc37e9f348dd93476c1a86089c3f4fed7313147f7a9f935c43a3；CI端實際公共HTTP/source/hash/launcher通過。本機獨立HTTP當時DNS不可用，沒有額外本機HTTP/browser證據。詳CI51_ACCEPTANCE／CI51_VISUAL_REVIEW／PAGES45_PROVENANCE。

## J能力保留，CI52未完成新驗收

J0.9.32 sourcee93733179a4e0e0cb5fd254d7a841c2eb3df542d已新增預設OFF的CPU「遠景紋理平滑」，以原texture生成按需box-filter mipchain，原快取32MiB／512entry、失效／關閉／dispose清理保留。原人物植物alpha／opacity／blend／cutout及透視nearest；原assets／WebGL不變。實際圖片的縮小條紋是修正動機，但不能由單張靜圖推論已解決時間閃爍。

原兩CPUcase之後，同頁本人Gato／v2續項鍊異變／P2離隊、600山道三敵獨戰、本人v3原生匯入、托魯斯旅店、森林兩敵獨戰、王城／王后消失、LuccaP2、本人v4原生匯入至cathedral入口。30legs重用Ihelper、原epsilon／tickformula／30s；真Gato站位以一般P2靠近stage，不造起始存檔。兩cinematicpause／P2離隊與回歸所有權均要求。此路線已實作但尚未native接受，不是新章節或整段600完成。

第六era ledger16檔與11extraPNG（8場景＋3取樣比較）、兩本人v3/v4、父v2/nativeimportreport補充原五ledger／14CPUfiles／11原图；不取代任何原斷言。Canvashash比較真畫布而非checkbox不同的UI；ON必須改變、OFF必須精確恢復、完整pausedstate相同、mip釋放和alpha輪廓保留。J的3jobs／45分鐘與原CPUdriver10函式／Ihelper／core／碰撞／package／lock沿用。

**CI52 35680779688**實際failure，updated **2026-09-22T03:13:29Z**。validate106597074095 step21失敗，good106597074278／bad106597074334成功。原兩CPUcase已passed、十次放鍵抵達及本人v2／IndexedDB／原生匯入到達；新增era尚未任何走位，即在cpu_era_route.py:154的minifiedTriangles>0失敗。

第一root **CI52-cpu-mild-minification-level-gap**：原生報告enabledtrue、mipBytes349524、minifiedTriangles0、buffer543×362。程式拒絕rho<2，漏掉輕度縮小。相同World/Babylon配rect-onlyUNITcanvas計算rho約1.272581，此為計算所得而非原生量測。原era失敗圖有祭典、鋪面攤位與checked選項；非空白renderer。steps22／23因failedreport次生失敗；沒有playable或新Pages。4原ZIP大小／hash／CRC、11原CPU圖hash、6renderledger列入檔已核對；這次未重跑verifier／重產ledger／全lane驗收。詳CI52_FAILURE_ROOT，原報告不改成成功。

## K實際修正與測試邊界

**VQ02K／0.9.33**，source **3028e2499d5a268d20c5251a3aec6e8c2c5a09e2**，tree **23c26af9f62ec1b6dc2f1e7e56974e0dc35a3ea0**，parent0df37add4bf68e3b2314593b13413c1173e0cc09。8檔一次non-force發布並回讀，完整testedroot一致；最新docs子樹保留。

新增連續相鄰mip混合，原圖→第一mip覆蓋1<rho<2，不採直接ceil造成突變模糊。依log2足跡每triangle一次選層，整數層單lookup、分數層兩RGBlookup；counter如實記錄fractionalTriangles。放大／無效／透視／alpha/opacity/blend/cutout/vertex-alpha皆保留nearest。預設OFF、原快取界線及生命周期不變；未改原素材／材質／UV／幾何／鏡頭／WebGL，實際效果與額外取樣成本仍待原生觀察。

新增失敗可追查性：filteringAttempt在原assert之前保存nearest/filtered/restored的snapshot与canvasHash，失敗記錄type/message/原traceback後rethrow。裸assert不再只留下空字串。原39assertion AST、所有30原生move／keys／預算／30秒不變；原CPUdriver／Ihelper／六verifier／workflow／index／package／lock原樣。沒有注入gameclock/state/save/collision或造成功nativefixture。

新跑 **1250Node／262Python／assets／typecheck／build／完整npmcheck exit0**，Pythonexit0。新增11Node／3Python包含輕度分數取樣、既有World三尺寸678/543/452、關閉精確還原、UV、alpha／透視／裁切深度／記憶體／計數及錯誤保存。修正前兩回歸失敗，修正後通過；兩次中斷check與後來完整成功log分開保存。unit在543×362由0變1482minified/fractionaltriangles、state未變，這不是browser新畫面或成功存檔，也不證明美術／效能已達標。本機未操作browser。

## 唯一CI53與完整後續範圍

**CI53 35684197933**，push／attempt1，exactSHA全event/state count1，最後 **in_progress/null**，created2026-09-22T03:43:21Z、updated2026-09-22T03:43:32Z（台灣11:43:32）。未查jobs，不等待輪詢／取消／重派。Pending保存回報，failure同run第一root并保留新舊斷言，success原3job／全報告／五ledger加第六eraledger／30路段／11新圖／本人v3-v4／真canvas開關還原／memory及fullpause，原ZIP指定Drive下載回讀後再Pages/source/HTML。CI嵌入sourceSHA，本機nullsourceHTML不是其hash基準。

前段真品質優先。CI53閉環後接現有救援／審判至未來入口的CPU完整覆蓋、持續與實體裝置觀察、實圖相容問題，再允許的材質比例輪廓／窄地標／全動畫音樂聽感。不得用測試数或counter替代美術，也不因一般continue解封Z或提早擴後段。

完整T03隱藏規則／版本差異／拓樸／數值忠實度；T04成長報酬掉落／全經濟物品飾品／角色技能雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來及其他時代主支線結局；T07整體90、各面向80%、zero-critical、requiredassets五gate、真機輸入FPS/frame-time/載入/記憶體/背景/存檔/音訊與全章CPU；T08每批雲端。不縮小分母只評已做功能。2300抵達不是完整未來，舊30stale、不新增分數。

## 持久交付

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新 **Chrono-CI52-terminal-VQ02K-tested-batch.zip／1dHLUbuu8p3VtqwVENV0jO6PJid2g7etZ**，55142554bytes，SHA256 **8b13ed2682cc5be8d5527b8a28ea11c25dc0c7b1d3beae112b4f7ea8bab54a3c**。下載hash／CRC／46manifest／四原ZIP／parent全部匹配，含8改檔／原logs／失敗分析與282檔assembled恢復；只有THIRD_PARTY屬docs，最新main進度另讀。封存nullsource是發布前，最終GitHub K收據綁定source，不能改寫原log或冒稱Gitarchive。

I驗收原包1sgU-n16eUnPExIBtFsx2RHgGDf51BC4U與J批次14HDH1dKKIKzkHfqWCAfHtRgjKs6j0gNd仍保留，不必為接手先下载歷史。固定工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules／esbuildhardlink，不覆source/config或bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM／原圖音訊／字型／憑證。所有交付寫回GitHub／正確Drive並回讀，文件[skip ci]，臨時容器不是權威。
