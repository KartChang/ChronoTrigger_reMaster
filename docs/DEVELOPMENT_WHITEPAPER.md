# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02g-ci49-pending。更新既有進度，不重新規劃。唯一執行依STATUS／IMMEDIATE_CONTINUATION／CI49_CHECKPOINT。前版全文保留於 **526684e957436f05a95813750793ba2aa3035a6e**；其CI48待驗收文字由實際failure及本批CI49取代，不重開舊驗收。

## 產品目標、順序與架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮為序章。先讓前段場景、人物、美術建模動畫、鏡頭遮擋HUD、操作與聲音取得真實品質證據，再擴後段。90是實際達標後的驗收結果，不是特效開關或AI自評。

TypeScript＋Babylon.js＋esbuild自含HTML及固定package/lock保留。玩家不需ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；CPU呈現重用既有場景圖，不重造平行關卡規則。音畫不決定傷害、資源或劇情；暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景时间。InputBoundary清舊輸入，A*保留碰撞。P1克羅諾／P2露卡與劇情入離隊所有權、瑪兒／青蛙自主第三同伴、獨立選敵與雙確認合技保留。不新增P3、不以可寫測試hook通關、不弱化斷言或timeout。

## 已有功能，不重做

家中醒來／樓梯→縮尺區域圖→千年祭行為初遇→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕與兩裁決→敲門越獄或等露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇；經驗紀錄不是完整等級成長。舊pending不重開已完成章節。

梅爾基歐商店、武器／身體／頭部裝備具角色相容、穿戴份數、金幣庫存守恆與交易上限，不能賣仍穿戴品。400G、13商品、價格與普通攻防增減是明示暫定重建，非原作數值認證。完整成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人仍未完成。

IndexedDB／JSON白名單v1-v8保留。舊檔未知行為不補造證詞，查看不強制改寫；本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu/frame觀察唯讀；CPU專項同run真匯出v2不取代原裝備v8或其他存檔旅程。渲染偏好與診斷不寫入遊戲存檔。

## 保存素材與實際品質界線

A/B/C主角與鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態與reduced-motion、W局部光照銅材質六樹根八陰影、X細鋪面與分區grassmask、Y投影閱讀性／caster合併／20石材倒角皆保留。C角色播放用原片段／影格，固定tick動作、位移步伐、96格CPU快取。A七段自製短曲與B靜音修正保留，非原作OST或完整配樂。不重畫保存素材，不套回舊independent-ui。

使用者反映欠缺精緻HD-2D仍是交付落差。木料平塗、人物植物／立體道具材質語言、尺度輪廓與窄視窗地標構圖仍需改善；家中升級母親家具、完整動畫音樂尚未完成。既有母親對話可操作不等於新美術整合。測試數、引擎、模型數、短曲、CPU相容与FPS標籤不能替代美術90證據。舊30stale，release仍blocked，沒有目前整體已接近完成的量化認證。

Z0.9.22材質／UV／直向構圖仍雲端保留、未發布且受限，沒有新的允許結果；不重送、改編碼管道、間接替換或部分提升。prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**與localbrowser限制保留，不因一般繼續解除。這不代表GitHub／Drive不能讀寫。

## 既有CPU能力與最後驗收

D/E已實作WebGL2/1不可用時的預設CPU／Canvas2D fallback，真正處理既有頂點矩陣、簡化光照、UV紋理、透明深度與像素，不是NullEngine空跑或只顯示錯誤。640×480基準像素cap、最大邊1280、紋理32MiB/512格；不做shadowmap/glow/specular，不能保證WebGL視覺一致或所有裝置流暢。E保守剔除畫面外submesh、省去完全畫面內三角形裁切、重用每幀方向光，原像素規則與真實work計數保留。

最後已驗收仍 **E0.9.27 sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／tree00efc6b0ea450961739948a952bd2756ea7f2eb1／CI47 35615882220／Pages41 35618506663**。原13主、9原native加CPU native、五ledger、音訊actor/HUD/接地ATB/裝備v8/完整故事審判與觸控、實圖、原包及source/HTML已閉環。前段CPU真正走完家中至祭典、P1/P2、ATB勝利及同run自己匯出v2再原生匯入。這不是全章CPU、裝置、聽感或整體90認證。CI47和更早不重開，不補造CI45獨立驗收。

F0.9.28的CPUtiers在原cap之後套用，初始auto保留舊尺寸，auto0–3／quality0／compatibility2真正改變buffer；120格活動frame interval、mean/P95/max/FPS、CPU/Canvas2D標示及統一build/source身份已實作。這些是負載控制與觀察，不保證FPS或美術提升。G全部src不變，因此完整保留F實作，但CI48failure沒有讓F獲得完整native驗收。

## CI48實際失敗與G修正

CI48 **35634970145**，Fsource **38edba36ccd75a3ef8129aea62d21769d847f749**，completed/failure updated2026-09-21T18:19:17Z。Validate106450040224在step21CPU新遊戲路線失敗，good106450040254／bad106450040327成功。第一root為舊move只接受按住鍵時跨過x目標，釋放後未確保抵達；原始最後P1x=-.9、z=-4.533333333333337，仍在bedroom且超出原stairs(0,-4.1)/radius.65。後續home/no-transition在原250tick預算內沒有成立。原始failure.png已檢視，CPU有畫面，非WebGL啟動失敗。

次生step22CPU來源檢查缺成功finalreport，不是另一個產品根因。原lane/rendercheck與列入bytes/hash通過，但這次僅只讀核對，沒有重新執行verifier或宣稱重現ledger。四原ZIP已保存；CI48沒有playable artifact、新Pages或完整CPUquality/save結果，不接受partial綠勾。CI48_FAILURE_ROOT保存精確失敗與來源界線。

**G0.9.29 source8c9f8a26ad1e7e8a5683936604165a799f8acbec／tree3d6df6621fc91ce7dcc9590db4ada2cef85eb308**，parent526684e957436f05a95813750793ba2aa3035a6e。4檔整批測試後一次非force發布並回讀，完整子樹匹配。改tests/cpu_native_route.py、cpu_native_route_test.py、cpu_renderer_browser.py及build版本；全部src／index／workflow原樣。

原生鍵盤脈衝後先釋放全部按鍵，再读snapshot要求真正距離<.12；越過以一般反向按鍵修正，維持原每腿tick與单一30秒预算。延遲釋放估計只影響下一次真實hold時長，不注入時鐘／遊戲state。按鍵部分失敗仍cleanup；nativeRoutes保留before/afterRelease與failure。Driver其餘9函式、路線、終點、assertion與timeout原樣。12新Python port測試含觀察到的x=-.9與36方向/軸/latency子案例，模型不是原生瀏覽器證據。

新執行 **1161Node／232Python／assets／typecheck／build** 通過。初次新helper測試失敗、完整check中途工具逾時與後續真正exit0的完整log均保存。手動傳輸時未引用tree的escaping偏差在commit前修回已測bytes，沒有錯誤source發布。没有本機browser、Gafter圖／native修復或真機認證。

唯一 **CI49 35641527652**，push/attempt1，最後in_progress/null，updated2026-09-21T18:55:29Z（台灣2026-09-22 02:55:29）。不等待輪詢、取消或重派。後續只接同run；fail查第一根因，success核對原全部finalreport/fiveledger與Fpresentation60真sample/quality尺寸/pausedstate、11CPU原圖/14ledgerfiles、自己匯出v2原生匯入和GnativeRoutes真抵達，保存原包回讀後核对Pages/source/HTML。CI嵌入sourceSHA，null-source本機HTML不是CIbyte基準。

## 完整剩餘範圍與持久交付

T03隱藏規則／版本差異／完整拓樸／原作數值；T04成長報酬掉落／全經濟飾品／技能角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來／其他時代主支線結局；T07整體90、每面向80%、zero-critical、必需素材五gate、實體輸入FPS-frame-time載入記憶體背景存檔音訊及全章CPU；T08每批雲端。不得縮小分母或只評已做功能。先完成前段真品質，再擴後段。

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。新 **Chrono-CI48-terminal-VQ02G-tested-batch.zip／1XIFKO-hLoFWrEPwC6oBE74hIuHikDKoi**，51526156bytes，SHA256f941eccb3bfaa7147eb3485ef34322f5a7f484dff2593e10d8e6d857099f8275。下載hash/CRC/23manifest/4原ZIP/parent全核對；含4changes、7rawlogs/exit、完整failure核對、未驗收localHTML與271檔assembled程式快照。封存source=null是發布前，GitHub最終收據補身份，不改寫原證據。最新main文件永遠另讀，不能被tar舊文件覆蓋。既有E/F和所有素材包繼續保留，見DELIVERY_INDEX。

工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules及esbuildhardlink，不覆舊source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳、不公開ROM/原圖原音訊/字型/憑證。所有成果回GitHub或正確Drive並回讀，文件[skip ci]，不依賴臨時容器。
