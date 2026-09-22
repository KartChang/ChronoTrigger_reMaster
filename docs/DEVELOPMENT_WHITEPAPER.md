# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02h-ci50-pending。更新既有進度，不重新規劃。唯一執行依STATUS／IMMEDIATE_CONTINUATION／CI50_CHECKPOINT。上一版全文保留於 **3c3c1909f03df9a839c7569860e0506d6c05ac2c**；其CI49待驗收文字已由本次實際failure與H/CI50取代，不重開已完成章節或舊驗收。

## 產品目標、順序與架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮成序章。先讓前段場景、人物、美術建模動畫、鏡頭遮擋HUD、操作與聲音取得真實品質證據，再擴後段。90是實際達標驗收結果，不是AI自評或特效數量。

TypeScript＋Babylon.js＋esbuild自含HTML及固定package/lock保留，玩家不需ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；CPU呈現重用既有場景圖，不重造平行關卡規則。音畫不決定傷害、資源或劇情。暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入，A*保留碰撞。P1克羅諾／P2露卡及劇情入離隊所有權，瑪兒／青蛙自主第三同伴，獨立選敵、雙確認合技保留。不加P3、不以可寫測試hook通關、不弱化斷言或timeout。

## 已有功能與保存素材，不重做

家中醒來／樓梯→縮尺區域圖→千年祭行為初遇→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕與兩裁決→敲門越獄或等露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇；經驗紀錄不是完整等級成長。

梅爾基歐商店、武器／身體／頭部裝備具角色相容、穿戴份數、金幣庫存守恆及交易上限；不能賣仍穿戴品。400G、13商品、價格與普通攻防增減為明示暫定重建，非原作數值認證。完整成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人仍未完成。

IndexedDB／JSON白名單v1-v8保留；舊檔未知行為不補造證詞，查看不強制改寫；本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu/frame觀察唯讀；CPU同run真匯出v2不能取代原裝備v8或其他存檔旅程。渲染偏好與診斷不寫入遊戲存檔。

A/B/C主角與鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態及reduced-motion、W局部光照銅材質六樹根八陰影、X細鋪面分區grassmask、Y投影閱讀性／caster合併／20石材倒角保留。C角色用原片段／影格、固定tick動作及位移步伐、96格CPU快取。A七段自製短曲與B靜音修正保留，非原作OST或完整配樂。不重畫保存素材，不套回舊independent-ui。

## 真正品質界線與固定限制

欠缺精緻HD-2D仍是交付落差。木料平塗、人物植物與立體道具材質語言、尺度輪廓、窄視窗地標構圖，以及家中升級母親家具、完整動畫音樂仍有缺口。既有母親對話可操作不等於新美術整合。測試數、引擎、模型數、短曲、CPU相容與FPS標示不能替代美術90證據。舊30stale、release仍blocked，沒有目前整體已接近完成的量化認證。

Z0.9.22材質／UV／直向構圖仍保留於雲端、未發布且受限，不重送、換編碼管道、間接替換或部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**及localbrowser限制不因一般繼續解除；這不表示GitHub／Drive不能讀寫。

## CPU能力與最後完整驗收

D/E已實作WebGL2/1不可用時預設CPU／Canvas2D fallback，真正處理既有頂點矩陣、簡化光照、UV紋理、透明深度與像素；不是NullEngine空跑或只顯示錯誤。640×480基準像素cap、最大邊1280、紋理32MiB/512格，不做shadowmap/glow/specular，不保證WebGL視覺一致或全部裝置流暢。E保守剔除畫面外submesh、省去完全畫面內三角形裁切、重用每幀方向光；原像素規則及真實work計數保留。

最後已驗收仍 **E0.9.27／sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／tree00efc6b0ea450961739948a952bd2756ea7f2eb1／CI47 35615882220／Pages41 35618506663**。其13主、9原native加CPU native、五ledger、音訊actor/HUD/接地ATB/裝備v8/完整故事審判及觸控、實圖、原包與source/HTML已閉環。CPU前段真正走過家中至祭典、P1/P2、ATB及自己匯出v2再原生匯入；不是全章CPU／裝置／聽感或90認證。CI47及更早不重開，不补造CI45獨立驗收。

F0.9.28已實作CPUtiers在原cap後套用，初始auto保留舊尺寸、auto0–3／quality0／compatibility2實際buffer；120格活動frame interval、mean/P95/max/FPS、CPU/Canvas2D及统一build/source身份。這是負載控制與觀察，不保證FPS或美術提升。G/H全部src不變，F實作完整保留，但尚待完整新native驗收。

## CI49實際根因與H修正

G0.9.29／source **8c9f8a26ad1e7e8a5683936604165a799f8acbec**已用原生按鍵release後snapshot改善舊CI48樓梯overshoot；不重做。**CI49 35641527652**實際completed/failure，updated2026-09-21T19:15:06Z；validate **106471733017**在step21CPU失敗、good **106471733186**及bad **106471733213**成功。

新第一root **CI49-cpu-native-observation-overhead-budget**。這次真正通過臥室樓梯、家中與大地圖，前四次move抵達；第五腿z=-2.7→5.1用29次100ms原生hold/release/readback，before736、afterRelease1059，323ticks超過原315budget，x=.039999999999998766／z=4.980000000000005。由位移推得192移動ticks與131其他ticks；catch1061是較晚觀察。位置數值已剛好小於.12，也必須先因超budget失敗，不能把抵達檢查放到前面或扣除讀取成本。

已檢視原failure.png，大地圖與玩家、帳棚、地形皆由CPU繪出，非WebGL啟動失敗。Step22缺成功CPUfinalreport是次生。四原始ZIP大小/hash/CRC、renderledger列入六檔bytes/hash核對，但沒有重跑verifier、重產精確ledger或重驗全lane的宣稱。無playable／新Pages；CI49與CI48皆非accepted。詳CI49_FAILURE_ROOT。

**H0.9.30／source840ffe01882c8248f11603ee1c4da246f5aa2ccc／tree205bc73a075b92a5efd5ac072f45f6857b037b4a**，parent3c3c1909f03df9a839c7569860e0506d6c05ac2c。三檔整批測試後一次non-force發布回讀、完整tested程式子樹匹配：tests/cpu_native_route.py、新cpu_native_route_cost_test.py、scripts/build.mjs版本。全部src/index/.github/config、整份CPUbrowserdriver和G原port測試不變。

長腿以距離決定原生hold、上限250ms；近目標仍縮短並依已觀察的release位移調整，必要反方向修正。改善短脈衝讀取成本，而非增大timeout/tickbudget。原<.12、每腿ceil((距離/速度+2)*60)、單一30秒、先budget再arrival、全部readbackticks照算、release後snapshot與部分co-op失敗的cleanup全部保留。沒有遊戲時間/state/save/collision更動。

新跑 **1161Node／240Python／assets／typecheck／build**，完整npm run check最終exit0。新增8Python測試含24長腿方向/軸/章節/讀取成本子案例及負向budget/deadline/blocked/co-op；G原36子案例保留。CI49成本的單元模型重現舊323/315失敗，H為255/315、13pulse、z5.06；它不是browser或通關存檔fixture，更不是native修復驗收。初次red、兩次工具中斷check與後續完整成功log分開保存。本機未操作browser。

唯一 **CI50 35669876213**，push/attempt1、exactSHA全event/state count1，最後in_progress/null updated2026-09-21T23:57:35Z（台灣2026-09-22 07:57:35）。未查jobs、不等待輪詢取消重派。只接同run；失敗修第一根因；成功須原3job/13primary/9native加CPU/fiveledgers/所有列入bytes/hash與原audio/actor/HUD/scenes/ATB/equipmentv8/fulltrial/touch，再驗兩CPU原生旅程／自己匯出v2及原生匯入、60真sample與一致統計/身份、quality實際尺寸/完整pausedstate、11原圖/14ledgerfiles、原budget內實際afterRelease<.12。原包雲端回讀後核對Pages/source/HTML；CI嵌入sourceSHA，不拿本機null-sourceHTML作hash基準。

## 完整剩餘範圍與持久交付

T03隱藏規則／版本差異／完整拓樸／數值忠實度；T04成長報酬掉落／全經濟物品飾品／技能角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來及其他時代主支線結局；T07整體90、每面向80%、zero-critical、必需素材五gate、實體輸入FPS/frame-time/載入/記憶體/背景/存檔/音訊及全章CPU；T08每批雲端。不得縮小分母只評已做功能。前段真品質優先；H驗收後先CPU完整章節及裝置／實圖相容，再材質比例輪廓、窄視窗地標、動畫音樂，不擅自解封Z或提早擴後段。

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新 **Chrono-CI49-terminal-VQ02H-tested-batch.zip／1w5T1edXd0vXOhciA23SRC3CWNqKEMPyb**，52245774bytes、SHA256 **428c22ed7f6522f8eb83bd324b3306da22e07f8206afc4f82152e4a305366c40**。下載hash/CRC/36manifest/四原ZIP/parent全匹配；含失敗分析、三改檔、原logs/exit、未驗收localHTML與272檔assembled程式快照。不是publishedGitarchive；除THIRD_PARTY不含docs，最新main文件永遠另讀。封存nullsource在發布前，最終GitHub H收據補身分，不重寫原證據。

固定工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules、保留esbuildhardlink，不覆source/config或開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不需重傳；不公開ROM、原圖原音訊、字型檔或憑證。所有修改與交付回GitHub／指定Drive並回讀，文件[skip ci]；臨時環境可能清除，不能當接续權威。
