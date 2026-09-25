# ChronoTrigger reMaster 開發白皮書

版本 **product-2026-09-25-vq03i-ci80**。動態authority為STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI80_CHECKPOINT；歷史原收據、失敗、產物不改寫。唯一root **T05-early-visual-cohesion**，terminal **CI80-court-canopy-evidence**。

目前 **VQ03I／0.9.56** source **b0f4b3f4bfbb233fcdc6cee5b06cd1fd29e0786b**，tree **6479f59e11849e807664ee8e2d1099bddfe7b7cc**，parent **876cea59ec4a4832406aec1b14554d84cef2380a**。14程式／測試檔已一次non-force發布並回讀，完整root與已測程式＋當時main文件一致。Matching **CI80／36117413556**，push/attempt1；發布後一次觀察queued/null，provider created/updated2026-09-25T09:15:24Z。I原生驗收未完成；最新有界基準為 **CI79／Pages73**，不是全美術、原速舒適性、聆聽或全遊戲接受。

## 一、完整產品目標與品質標準

完整HD-2D重製：像素人物搭配立體場景，保留原作辨識度、世界背景與場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面、全部時代主支線和結局。先把前段實際美術、建模、動畫、遮擋、HUD、操作和音訊改善，再擴後段；不得把全遊戲改為前段展示，也不因CI綠勾提早擴後段。

整體>=90、各面向>=80%必須基於實際畫面／遊玩／裝置證據及required assets、five gates、zero critical。測試數量、文件完整度或新特效不能換成美術分數。原工具30/100是較舊runtime評分卡，不是I當前分數，release仍BLOCKED。沒有新增品質分數或全遊戲認證。

## 二、架構與不能改變的行為

保留TypeScript、Babylon.js、esbuild及既有package/lock。玩家執行自含HTML不需要ROM、Python、帳號或後端。Controls → main固定1/60秒 → core規則 → render/HUD/audio。音畫只呈現既有狀態，不決定傷害、資源、碰撞或故事。CPU與WebGL共用場景／規則，不造第二套關卡。

暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入、A*遵守碰撞。P1克羅諾、P2依故事；露卡加入／回歸、瑪兒／青蛙自主第三、獨立選敵與雙確認合技保留。無P3、不改ARPG、不重造框架。

IndexedDB與JSON白名單v1–v8相容，舊檔未知行為不造證詞，查看不強制改寫；守恆檢查不是防作弊簽章。Render/audio偏好與診斷不放入遊戲存檔。禁止原生game/time/save/collision注入、改走位/sleep/tick/畫質以通過。明示Node離線fixture／unit port不是原生證據；歷史比較port不得用來改写當前CI觀察。

## 三、保留玩法與尚未完成範圍

現有家中醒來／樓梯、縮尺世界、祭典行為與初遇、項鍊異變、600年山道／托魯斯／森林／王城、皇后消失、露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲與露卡、龍戰車三部位、重聚時門和2300抵達均保留。**2300抵達不是完整未來篇**；所有時代主支線及結局仍在目標內。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容與份數、金幣庫存守恆、交易上限、裝備後戰鬥保持。400G、價格與普通攻防增減是明示暫定值，不冒稱原作完整數值；經驗紀錄不是完整成長。完整成長、學習、報酬掉落、消耗品經濟、飾品、換人與雙三人技須按T04完成。

## 四、既有美術、CPU與相機基礎

既有角色像素片段、固定tick動畫與實際步伐/cache、相機接地、祭典道具棚布／地面、探索HUD／觸控、光照與銅材質、樹根陰影、石材倒角及caster合併保留。Held VQ01Z／母親家具不提升、換管道或間接替換；prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

先嘗試WebGL2/1，失敗用真正CPU triangle/texture/depth至Canvas2D。保留640×480pixel cap、最大邊1280、原tiers、32MiB/512entries及120活動FrameWindow。CPU不提供shadow map/glow/specular/postprocessing，不承諾與GPU同画質或真機流暢。P row-span/packed-clear優化沿用；J/K平滑預設OFF，opaque-affine可縮圖混合，alpha與透視仍nearest，關閉/dispose釋放mip。Nodebenchmark或六短窗口不是原生長時間FPS。

Q七story NPC／四姿勢、R戶外地表／樹冠／蕨類、S六64×64建材及80×40自繪INN/床、T五花箱／響應式暫停、U Space原生checkbox、V八窗框／窗櫺與玻璃pane、W原旅店招牌XY2.75/anchor[-4.7,2.4,-3.4]保留。技術證據不等於全美術接受。

X直式Truce同buffer構圖與HUD安全區[.045,.955,.12,.80]；Y以完整故事state推導在場角色，joined旗標不當在場證據。Z招牌透明度.30、A四棟共104mesh遮擋群組.16、9tick指數/12tick保持與私有blend還原不變。B必要隊伍優先，可選旅店地標1.5/1.6幾何遲滯，成本過高只移除地標取景要求，不隱藏mesh或裁切P2/guest。安全取景與state/resize/reduced安全snap保留。

C山道／森林小怪單一unlit emission/preservePixelPalette；原drawImp、24×32nearest-alpha、五RGBA採樣、幾何位置尺度／數值／出現規則不變，原PNG/CRC/pixel gate與村莊證據共存。D植物alpha保護下肢／腳底與CPU透明建物背面修正保留。E/F既有NPC減少動態frame0/current-tick還原、隱藏不更新、dispose釋放、穩定seed及私有貼圖保持；森林時門只停止非必要旋轉，不凍結任務動作。

CI78相機修復保留相同tick/context/target/viewport/actor安全框的原緩動frame；進reduced安全snap、反向精確還原。時間前進／倒退、context、ratio、base、actors、bounds或reset變更即失效。不耗正常緩動時間、不加timer/native state寫入。I不重做以上已接受批次。

## 五、G自製音型與生命週期保留

七組自製合成音型：262管風琴、330攻擊降頻、440互動單音、520技能滑音、620恢復上行、660鐘聲/合技雙音、800時門上行；其他合法40–4000Hz保留單音。每型最多3聲部、level總和<=.04、含尾音<=.5秒，共用原16聲部及master.55。這是排程參數，不是聽感、音量安全或全配樂認證；未用ROM、原OST、第三方音效採樣或外部音訊服務，七段自製配樂也不是完整原作OST。

單一audio-clock錨點，不加timer/simulation tick；不足聲部丟棄不補播，滿載可能只播部分音型。Main觸發點保持，緊接dialog/hold的音效仍可能立即停止，不延後對話或放寬hold。完整graph建立才持有；部分建立/connect/start/stop例外與dispose獨立清理handler/node並嘗試close。成功排程計數保留，不因取消回填；hold/mute/reset/dispose立即關master、stop/disconnect，不恢復舊音效。

Analyser重用1024Float32緩衝並讀實際值，hold不造零、dispose不再讀。原生回歸只支持實際music/analyser/hold/import/mute範圍，七音型unit不證明全部原生觸發、已聆聽或完整音訊完成。I未改audio/main，詳細歷史AUDIO_PRESENTATION與G收據保留。

## 六、H場景成果與最新CI79／Pages73有界接受

H只改既有guardia1000/courtroom地面：大塊低對比苔地、中央土徑與往原gate分支；法庭低對比石板／細邊地毯及原七陪審台／講台／被告席31薄飾面。原384×352nearest、world16×14、y=.02、位置與碰撞保持，兩張同runtime painter匯出仍屬review。H沒有重建平台、彩窗、窗簾、樹木或角色；I保留H地面／飾面。

CI79 **36109184360** source **1dd4686f30c2fb7b6e67524131468dca90e6730a**／tree59f9f7474dab2850dd80aac330efafeb7b21e9ae，provider updated2026-09-25T08:07:32Z completed/success。Validate107988503520、good107988503401、bad107988503611均success；原conditional skips保留，CPU600／救援／審判確實執行。主報告／chooser／十ledger173列由exactsource唯讀重算逐byte相同，570原檔不改，sourcearchive Git root與heldblob匹配。Fair-vendors before/restored bytes一致。

Pages73 **36111225598**，workflowhead7da8b8c2是文件不是遊戲source，selectedCI79/sourceH/artifact10853380936正確。Playable/staged/deployed HTML **5737166bytes**、SHA256 **ef74cac63d775c11f7bd7008363c2c8010c864d5efb8f36ce984e5ce47a45a05**相同；public exactHTTP provider step成功，無本機HTTP/browser重播。

102原圖全contact審查，只有forest-gate/reduced與courtroom/reduced兩張全尺寸，其他100僅縮圖。168.4秒原片18096990bytes／SHA25685962dd5cd66c8d2b48fe170c5a2b9ee6d65ef55309e6923d702416c5e6d03eb完成decode，337連續2fps样本／六表已看；無全尺寸影片樣本、原速播放、音軌／聆聽或真機／長時間認證。圖中確認地面較安靜，但樹冠亮點密集、法庭部分人物似埋入平台／陪審員過小；這是I的實作來源，不代表I已原生改善驗收。

**CI79_ACCEPTANCE.json**於 **876cea59ec4a4832406aec1b14554d84cef2380a**提交及回讀，原七ZIP指定Drive保存與下載回验。CI79取代CI78/Pages72為最新有界基準，舊接受技術工作不重驗。CI77原相機76像素差異失敗、CI75原WebGL PNG上限失敗仍為failure；各後續修復不回填舊run成功。CI71中斷視覺審查的歷史accepted=false不回填。

## 七、I法庭接地、比例與樹冠整合

Runtime只修改trial-render.ts、新增court-staging.ts。14既有法庭卡片包含法官／辯護人／檢察官3、證人4、陪審員7。原witness pivot62/64配actual camera up、渲染高度，將腳底錨定於既有支撐面：counsel/judge.72、testimony.49、juror.55，均+.04。原x/z當腳底錨點，僅調渲染卡中心，不改quest/game/collision座標。七陪審員height1.7/width1.2，保留原pose/cell和NPC減少動態current-tick政策。

原root快取不增加mesh/texture或shadowcaster，隱藏bindings停止位置寫入，dispose移除引用。CourtStaging.inspect讀實際transform的foot/error，不寫遊戲state。三相機方向與三viewport驗證腳底誤差<1e-5，只屬unit公差，不新增或放寬原生驗收門檻。

Guardia1000原15個tree/canopy平面由drawTree改接**未修改既有drawWoodlandOak**；64×80nearest-alpha、原位置／幾何／尺度／數量保持，沒有改全域painter／其他森林／gate。H地面／31飾面、其他八fair/trial地圖、既有camera/audio/core/main/nativecapture/routes/assertions/workflow保留。更換既有painter不代表完整森林美術、尺度或構圖完成。

## 八、I最終測試、可重建交付與界線

**2245Node全部通過、零失敗／零跳過；407Python通過**，新增16Node＋3Python，16targetedpass；pre-I兩個targeted確實失敗。完整npm run check、assets/typecheck/build/diff通過，465非文件程式輸入前後及發布前一致；469assembled快照額外含四rootdocs。三viewport192×128/96×160/160×96、相機角度、14bindings、支撐／隱藏／dispose、Hground、同tick偏好精確還原及八其他地圖originalofflinepixels均測。

三檔12精確片段test-onlyinverse與CI79完整原SHA/missing/duplicate/unrelated負測試於Node/Python鏡像。歷史HvsCI78使用明示pre-Iport，當前I獨立驗證；不把I像素假裝成H或更舊、不改native證據。第一輪timeout／unitfloat與whole-trial-dispose觀察缺陷、三個Python歷史H負測試輸入不一致logs保留；修正後完整check/Python再跑通過，沒有回填旧failure。完整記錄 **VQ03I_TESTED_BATCH.json**。

離線全尺寸看courtroom-before/after及forest-gate-after；要求canvas678×452，CPUbuffer542×361。使用未改原CI79 beforeState作Nodefixture，非瀏覽器注入／原生截圖；unit畫布不繪文字／曲線。樹冠重複／重疊、法庭平台／空間壓縮仍開放，無新artscore／原速／聆聽／真機認證。

完整發布tree **6479f59e11849e807664ee8e2d1099bddfe7b7cc**由已測src d114dd38、tests38f4205c、scriptsb0db1cf5與其他原程式entry、當時main docs720126e8重建匹配；source已一次發布並回讀。CI80最後queued/null、原生accepted=false，不能用CI79收據或Iunit替代。

## 九、完整剩餘工作

直接完成CI80_CHECKPOINT.remainingReview，接續只讀exactrun一次；仍active保存不久等。完成後核同source/run/HTML原三job／全部主報告／nativechooser／CPU600救援審判／十ledger與G音訊原回歸。特别審查I法庭接地／七陪審員比例／證人顯示、森林15樹冠與隊伍時門辨識；保留原frame/state/texture/resource/quality/exactrestore斷言。核matchingPages及指定Drive原始產物下載回讀後才能有界接受。失敗只修真實同root缺口，不改路線／時間／畫質／斷言。

支持成功後續T05人物植物道具尺度輪廓與原作構圖、法庭平台／空間與樹冠重複、完整動畫、完整合法音訊／實際聆聽、原速移動淡化viewport舒適性。不重做C/Z/A/B/D/E/F/G/H或已發布I，不提前擴後段。

T03：隱含規則、版本差異、完整拓樸與數值忠實。
T04：完整成長、報酬掉落、經濟道具飾品、角色學習、換人與雙三人技。
T05：全部美術、建模、完整動畫與合法完整音訊，前段實際品質優先。
T06：所有時代、主支線與結局，2300抵達不是完整未來。
T07：整體>=90／各面向>=80%、required assets／five gates／zero critical，以及真機input/FPS/frame-time/load/memory/background/save/audio。
T08：每批實作測試／一次source／完整matchingCI／原始產物雲端保存及回讀。

分母不縮，沒有新全美術、原速舒適性、聆聽、實體裝置、長時間或全遊戲接受。

## 十、雲端恢復與固定限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。I：**Chrono-VQ03I-court-canopy-tested.zip／1MVnJyLotTvO3P7Y0HAwkshn49i0L_S0F**，1161444bytes，SHA256 **9be8f6bf7e52ded25ce22da2b4a3198c2dacc1dd7dc742ea00e0dc91f23deda4**，14差異／469快照／51manifest／logs／offline已實際下載核parent/size/hash/CRC。根目錄program-snapshot.tar.gz非publishedGitarchive／最新docs；封裝前false不得觸發重送。

CI79：**Chrono-CI79-reviewed-evidence.zip／1QmVKR7e8YXm3sH-GFtI7H2lVOPV0MpN8**，90393537bytes，SHA256 **59b68dabf639ea9cdad8e86e0ec8fe1b16e6617851f07225bfa68ea7485144e7**；七未改原ZIP／exactsource/movie/report/review／32manifest已下載核parent/size/hash/外內CRC。H、CI78、camera修復、G及更舊原始包保留DELIVERY_INDEX，不重驗。最新進度只讀GitHubmain，臨時容器不是權威。

Main only/singleAI/non-force，不建branch/PR/平行candidate或防撞。Held VQ01Z／母親家具不得提升或間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**保持。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules並保留esbuildhardlink，不覆舊source/config或開bootstrapCI。不得放寬<.12、原tick、單一30秒、250ms/256、CPU畫質或記憶體門檻。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM、原媒體、字型、憑證不公開／不重傳。文件[skip ci]；所有成果存GitHub或正確Drive並回讀。
