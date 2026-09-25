# ChronoTrigger reMaster 開發白皮書

版本 **product-2026-09-25-vq03h-ci79**。動態authority為STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI79_CHECKPOINT；原歷史收據與失敗不改寫。唯一root **T05-early-visual-cohesion**；terminal **CI79-trial-scenery-evidence**。

目前VQ03H／0.9.55 source **1dd4686f30c2fb7b6e67524131468dca90e6730a**，tree **59f9f7474dab2850dd80aac330efafeb7b21e9ae**，parent **49d9c9d4c8959e0f00c9c3b21efa5ce9b9adb5bc**。16程式／測試檔已一次non-force發布，完整tree與已測程式＋當時main文件一致並回讀。Matching **CI79／36109184360**，push/attempt1，最後in_progress/null，provider updated2026-09-25T07:44:28Z。H尚未原生accepted；最新有界技術接受為CI78／Pages72，不等於全美術、原速舒適性、聆聽或全遊戲接受。

## 一、完整產品目標

完整HD-2D重製：像素人物搭配立體場景、原作辨識度與構圖、縮尺大地圖、城鎮與室內切換、原地ATB、單人及同機雙人共畫面、全部時代主支線與結局。先改善前段實際美術、建模、動畫、遮擋、HUD、操作及音訊，再擴後段；不能把全遊戲目標改為前段展示，也不能因CI綠勾提前擴後段。

整體>=90、各面向>=80%必須基於實際畫面／遊玩／裝置證據與required assets、five gates、zero critical。測試數量、文件完整度、新特效都不等於美術分數。原工具30/100是較舊runtime的評分卡，不是H當前分數；release仍BLOCKED。

## 二、架構與不變行為

保留TypeScript、Babylon.js、esbuild和固定package/lock。玩家執行自含HTML不需要ROM、Python、帳號或後端。Controls → main固定1/60秒 → core規則 → render／HUD／audio。音畫只呈現既有狀態，不決定伤害、資源、碰撞或故事；CPU與WebGL共用場景與規則，不是第二套關卡。

暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間。InputBoundary清理舊輸入，A*遵守既有碰撞。P1克羅諾，P2依故事；露卡加入／回歸與瑪兒／青蛙自主第三保留，獨立選敵和雙確認合技不變。無P3，不改ARPG、不重造框架。

IndexedDB與JSON白名單v1–v8相容；舊檔未知行為不造證詞，查看不強制改寫。守恆檢查不是防作弊簽章；render/audio偏好及診斷不放入遊戲存檔。禁止原生測試注入game/time/save/collision state，禁止改走位、sleep、tick或畫質來通過。明示Node unit port使用離線fixture不是原生證據。

## 三、保留玩法範圍與未完成範圍

家中醒來／樓梯、縮尺世界、祭典行為與初遇、項鍊異變、600年山道／托魯斯／森林／王城、皇后消失、露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲與露卡、龍戰車三部位、重聚時門及2300抵達的現有流程均保留。**2300抵達不是完整未來篇**，所有時代主支線及結局仍在完整目標內。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容及份數、金幣庫存守恆、交易上限、裝備後戰鬥保持原流程。400G、價格與普通攻防增減是明示暫定值，不冒稱原作完整數值。經驗紀錄不是完整成長系統；完整成長、技能學習、報酬掉落、消耗品經濟、飾品、換人及雙三人技仍須完成T04。

## 四、既有美術與CPU呈現基礎

角色像素片段、固定tick動畫與實際步伐／cache、鏡頭接地、祭典道具棚布／地面、探索HUD／觸控、光照與銅材質、樹根陰影、石材倒角及caster合併保留。Held VQ01Z／母親家具禁止提升、換管道或間接替換；prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

先嘗試WebGL2/1，失敗使用真正CPU triangle／texture／depth至Canvas2D。維持640×480 pixel cap、最大邊1280、原tiers、32MiB／512entries及120活動FrameWindow。CPU不提供shadow map/glow/specular/postprocessing，不承諾與GPU同畫質或真機流暢。P row-span／packed-clear最佳化沿用；J/K平滑預設OFF，opaque-affine可縮圖混合，alpha與透視仍nearest，關閉或dispose釋放mip。Node benchmark或短窗口不是原生長時間FPS。

Q七個story NPC與原四姿勢、R戶外地表／樹冠／蕨類、S六組64×64建材及原80×40自繪INN／床圖、T五花箱與響應式暫停、U Space原生checkbox、V八窗框／窗櫺與八玻璃pane、W原inn-sign XY2.75和anchor[-4.7,2.4,-3.4]保留。有技術證據不等於完整美術接受。

X直式Truce同buffer構圖與HUD安全區[.045,.955,.12,.80]；Y依完整故事state推導實際在場角色，joined旗標不當在場證據。Z招牌透明度.30，A四棟各26部件共104mesh僅遮擋群組降至.16；9tick指數／12tick保持、私有blend還原不改。B必要隊伍優先，可選旅店地標使用1.5/1.6幾何遲滯；成本過高只移除地標取景要求，不隱藏mesh或裁切P2／guest。安全取景、state／resize重設及reduced-motion安全snap保留。

C原山道／森林小怪採preservePixelPalette單一unlit emission；drawImp、24×32 nearest-alpha、五RGBA採樣、位置尺度／數值與出現規則不變，原PNG/CRC/pixel gate與村莊證據共存。D原植物alpha遮擋保護腿部／腳底標記，CPU透明建物背面修正保留。E/F將減少動態傳入王國／救援／祭典證人商販／法庭監獄NPC，frame0與current-tick還原、隱藏不更新／dispose釋放binding、穩定seed及私有貼圖保持。森林時門只停止非必要旋轉，不凍結任務動作。

CI78鏡頭修復保留相同tick/context/target/viewport/actor安全框的原緩動frame，進reduced仍安全snap，反向才精確還原；tick/clock/context/ratio/base/actors/bounds/reset變動使快取失效。不消耗正常緩動時間、不加timer或native state寫入。這是已接受技術工作，H不重做。

## 五、既有G自製音型及生命週期

scene-audio.ts／sound-effect-score.ts的七組自製合成音型保留：262管風琴、330攻擊降頻、440互動單音、520技能滑音、620恢復上行、660鐘聲／合技雙音、800時門上行；其他合法40–4000Hz保留原單音。每型最多3聲部、level總和<=.04、含尾音<=.5秒，共用16聲部與master .55。這些是排程參數，不是聽感、音量安全或全配樂認證。沒有ROM／原OST／第三方音效採樣或外部音訊服務；七段自製配樂也不是完整原作OST。

單一audio-clock錨點，無timer或simulation tick；不足聲部丟棄而不排隊補播，滿載可能只播部分音型。main原觸發點不變，緊接dialog/hold的音效仍可能立即停止；不延遲對話或放寬hold以求播完。初始graph完整建立才持有；部分建立、connect/start/stop失敗及dispose分別清理handler／node並嘗試close。成功排程計數保留真實發生量，不因後續取消回填。暫停／mute／reset／dispose立即關master、stop/disconnect，不恢復舊音效。

Analyser重用1024Float32緩衝且讀實際訊號，hold不造零、dispose不再讀。CI78原生旅程支持原music/analyser/hold/import/mute範圍；七音型unit不證明全部實際觸發、聆聽或完整音訊完成。詳AUDIO_PRESENTATION與既有G收據，H不更動音訊。

## 六、CI78／Pages72最新有界接受

CI78 **36054333321**，source c65fa91afd407d69976a4ca8e58855d3fff9cc34／tree76a4efda08985cc8d668319905a00ae907993c89，2026-09-24T20:55:06Z completed/success。三jobs原條件skip保留，原chooser、CPU600／救援／審判及全部十ledger173列由exactsource唯讀重算逐byte相同，555原檔不改，sourcearchive tree與heldblob一致。

原fair-vendors before/restored PNG逐byte相同，SHA256 abc287597b106cb7c2010ff23060f0b919bdaffe3488184c92f00a472b8add4d。CI77原76像素失敗仍是failure，不能回填成功；先前offline22→0測量不是CI78原圖。

Pages72 **36058079290** selectedCI78／sourcec65／artifact10833415468；workflow head413feaa是文件而非game source。Playable/staged/deployedHTML5734168bytes、SHA256 **0bce7e85f5ae89ca8e496dd8565ec4fec328804c383a4e1d084d3af13ca087f5**相同，public exact HTTP provider step成功。沒有本機HTTP/browser重播。

102原圖全contact審查，只有森林時門／法庭reduced两張全尺寸，其餘100僅縮圖。175.88秒原片全解碼、352連續2fps樣本／六表皆看，無fullsizemovie樣本、原速播放、音軌／聆聽或真機／長時間認證。原圖指出地面雜訊與法庭細節不足，H針對它們實作但仍需新原生驗收。首次local ledger路徑缺失已改為同byte playable；接觸表排版重疊修正後全六表重看，原CI產物未改。完整收據 **CI78_ACCEPTANCE.json** 於49d9c9d提交並回讀，原始包下載驗證完成。

CI78取代CI76／Pages70作為最新有界基準；CI76及更早接受工作不重驗。CI77／CI75維持failure；CI75原WebGL decoder尺寸修復與CI76收據保留。CI71中斷審查的歷史accepted=false不回填。

## 七、H森林時門與法庭呈現製作

VQ03H／0.9.55 runtime只改trial-render.ts並新增trial-scenery-art.ts。原森林時門地面改為低對比大塊苔地、中央土徑、往原gate(5.5,4)的分支；少量成對葉片避開土徑。繪製為固定deterministic hash／平滑色塊，沒有Math.random、clock、browser、gameplay寫入或碰撞資料。樹冠與原樹木本批不改，樹冠雜訊仍屬後續缺口。

法庭使用較大且低對比的石板、細邊地毯和節制紋樣；在七陪審台、原法官講台／被告席新增31薄飾面。不是新增站立障礙物，沒有更改原dais、彩窗、窗簾或角色配置。原floor384×352／world16×14／y=.02／nearest保留；原geometry／state、camera、actors、gate、story、audio、native routes/captures/assertions/workflow不變。

Detail specification不可變，場景沿用原cached roots、隱藏停用與dispose；沒有逐frame新增資源。Export增加兩張同runtime painter PNG，整數邊界與不透明面覆蓋皆測，沒有新增runtime外部請求。新PNG是review/editing artifacts，未核准最終美術、沒有PNG re-import。

H只改善兩處既有製作品質缺口的一部分；法庭平台／角色尺度、人物植物道具比例輪廓、完整構圖與動畫仍開放，不能藉31飾面把整場評為完成。

## 八、H測試、發布與接受界線

16程式／測試檔，新增24Node＋3Python；最終 **2229Node零fail／零skip、404Python**。assets/typecheck/build/check/diff通過；458非文件程式輸入前後及發布前一致，462assembled快照另含四root文件。相同原生CI78 released full checkpoints只用於明示Node offline tests，沒有在瀏覽器注入game/time/save/collision。

測試含deterministic palette／opaque／integer scaling／invalid input、原north-up座標、土徑留白、31thin immutable facings、實際root/floor/painter同bytes、cache/hide/dispose、三viewport原geometry/state與精確偏好還原、八其他fair/trial map原pixels。原source五檔13片段test-only inverse以原完整SHA256與missing/duplicate/unrelated負測試保護，Node/Python鏡像。歷史F/E比較明示pre-H port，currentH另外測，沒有整檔豁免或改寫native evidence。

最初typecheck undefined palette access已修；第一輪兩Node／兩Python inverse負測試失敗，修為保留unrelated bytes交由既有全檔hash拒絕。首個pre-H負測試因Buffer diff輸出過大被終止，不能當證明；改為同樣精確的Buffer.compare數值斷言後，四個舊painter針對assertions實際fail，currentH24targetedpass。所有前失敗log保存。詳細收據 **VQ03H_TESTED_BATCH.json**。

H已一次發布，完整source tree59f9f7474dab2850dd80aac330efafeb7b21e9ae由已測程式與當時main docs tree0d0fb850ff66c7ee1a9666bbe2aa95f2300f5b2d重建相同，16blob匹配。MatchingCI79 **36109184360**最後in_progress/null，尚待原生全旅程及新畫面／Pages。不得重送H或將offline圖、CI78舊圖或unit綠勾代替CI79證據。

## 九、完整剩餘範圍

先完成CI79_CHECKPOINT.remainingReview；接續只查exactrun一次，active保存不久等。Failure保留原artifact、只修真實同root缺口，不改時間、路線、畫質或斷言。成功仍須同source/run/HTML三jobs／主報告／chooser／完整CPU600救援審判／十ledger、新H場景原PNG及既有G音訊回歸、matchingPages與Drive原檔下載回讀，才能有界接受。

接續T05人物／植物／道具尺度輪廓與原作構圖、樹冠雜訊、法庭平台／角色尺度、完整角色動畫、完整自製或合法授權音訊與實際聆聽、原速移動／淡化／viewport舒適性。不得重做已接受C/Z/A/B/D/E/F/G/camera或提前擴後段。

T03：隱含規則、版本差異、完整拓樸與數值忠實。
T04：完整成長、報酬掉落、經濟道具飾品、學習、換人與雙三人技。
T05：全部美術、建模、完整動畫、合法完整音訊；前段實際品質優先。
T06：全部時代主支線及結局；2300抵達不等於完整未來篇。
T07：整體>=90、各面向>=80%、requiredassets/fivegates/zerocritical，以及真機輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。
T08：每批完整測試、一次source、matchingCI、原始產物雲端保存及回讀。

分母不縮，無新score、全美術、原速舒適性、聆聽、真機、長時間或全遊戲認證。

## 十、持久交付與固定限制

唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。H已測包 **1HHFaTQ0bkUEk3qvd7WaMpTzKJjPTlaUL**，1116344bytes／SHA256 **0a8110419032cbea0fa1871404e0e85c647b3ced6236c88bd27562fabc77c209**；50manifest／462快照／16變更檔／logs／offline圖與同painterexports已實際下載parent/size/hash/CRC回驗。`program-snapshot.tar.gz`不是publishedGitarchive／最新docs；包內發布前false不可觸發重送。

CI78原始包 **1c7wxq1v7elzKMrRfWKpgUkwEc2rdph_M**，91355191bytes／SHA256 **b8d989542822d3f54cfe931b1022217555103a5ab689b68e8ce99f63089c20cc**，七未改原ZIP／28manifest／review已下載驗外內CRC/hash/parent。Camera修復與CI77原失敗、G原已測音訊、CI76及更早完整恢復位置見DELIVERY_INDEX與原收據，不重新核驗。

main only／single AI／non-force，不建branch、PR、平行candidate或多人防撞。原<.12、tick預算、單一30秒、250ms／256、CPU畫質與記憶體門檻不放寬。Held家具不得提升或間接替換，prologue blob固定2711a74185aacf3c6bddf9db85ba99a2afbc507a。禁止本機browser；工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules／保留esbuild hardlink，不覆舊source/config、不另開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳，ROM／原媒體／字型／憑證不公開。所有文件[skip ci]，成果存GitHub或指定Drive並回讀；臨時容器不是權威。
