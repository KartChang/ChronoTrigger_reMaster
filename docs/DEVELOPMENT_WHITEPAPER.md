# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03k-ci82**。目前authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI82_CHECKPOINT。唯一root **T05-early-visual-cohesion**，terminal **CI82-canyon-material-evidence**。歷史原收據、失敗與產物不改寫。

**VQ03K／0.9.58** source **64732e5907e653f5e2fb7ed20f70856ed7f5da00**，tree **a126f073e0e648898dfbd1da06ba9ac7d12b05f1**，parent **027639920ca508d4aa544b4da05b64450a996384**。16程式／測試檔一次non-force發布並回讀，完整tree等於已測程式＋當時main docs b2a40748976bb582024ab8751869e084150681bc。Matching **CI82／36157428126**，push/attempt1，last observed in_progress/null，provider updated2026-09-25T15:55:44Z；尚未原生接受。最新有界基準 **CI81／Pages75** 已在本輪開始前接受，不重驗。

## 一、完整產品目標與品質標準

完整HD-2D重製：像素人物搭配立體場景，保留原作辨識度、世界背景與構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面、全部時代主支線與結局。先改善前段實際美術、建模、完整動畫、遮擋、HUD、操作及音訊，再擴後段；不是縮成前段展示，也不因CI綠勾提早扩後段。

整體>=90、各面向>=80%必須由實際畫面／遊玩／裝置證據及required assets、five gates、zero critical支持。測試數量／文件完整度／新特效不是美術分數。原工具30/100為較舊runtime評分卡，不是K目前分數；release仍BLOCKED，沒有新增全遊戲認證。

## 二、架構、遊戲狀態與固定行為

保留TypeScript、Babylon.js、esbuild與既有package/lock。玩家執行自含HTML不需要ROM、Python、帳號或後端。Controls → main固定1/60秒 → core規則 → render/HUD/audio；音畫只呈現既有狀態，不決定傷害、資源、碰撞或故事。CPU/WebGL共用場景與規則，不另造低品質關卡。

暫停、背景、對話、背包、原生選檔與context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入；A*遵守碰撞。P1克羅諾、P2依故事；露卡加入／回歸、瑪兒／青蛙自主第三、獨立選敵及雙確認合技保留。無P3，不改ARPG或重造框架。

IndexedDB與JSON白名單v1–v8相容；舊檔未知行為不造證詞，查看不強制改寫。守恆檢查不是防作弊簽章。Render/audio偏好與診斷不放進遊戲存檔。禁止原生game/time/save/collision注入或改走位/sleep/tick/畫質取巧。Node離線fixture／歷史比較port須明示，不能變更原生state/PNG/report或冒充原生播放。

## 三、保留玩法與未完成遊戲內容

家中醒來／樓梯、縮尺世界、祭典行為／初遇、項鍊異變、600年山道／托魯斯／森林／王城、皇后消失、露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲與露卡、龍戰車三部位、重聚時門及2300抵達等現有流程保留。**2300抵達不是完整未來篇**，全時代主支線及結局仍需完成。

梅爾基歐13商品、武器／身體／頭部裝備、相容份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G、價格及普通攻防增減仍是明示暫定值，不冒稱完整原作數值；經驗紀錄不是完整成長。T04仍含完整成長、學習、報酬掉落、消耗品經濟、飾品、換人與雙三人技。

## 四、CPU、既有美術與相機

先嘗試WebGL2/1；失敗使用真正CPU triangle/texture/depth至Canvas2D。保留640×480pixel cap、最大邊1280、原tiers、32MiB/512entries及120活動FrameWindow。CPU不提供shadow map/glow/specular/postprocessing，不承諾GPU同畫質或真機流暢。P row-span/packed-clear沿用；J/K舊CPU平滑預設OFF，opaque-affine可縮圖混合、alpha與透視仍nearest，關閉/dispose釋放mip。Nodebenchmark與六短窗口不等於原生長時間FPS；此處J/K指既有CPU批次，非新VQ03J/K場景批次。

角色像素片段、固定tick動畫／實際步伐/cache、相機接地、祭典道具棚布／地面、探索HUD／touch、光照銅材質、樹根陰影／石材倒角／caster合併保留。Q七storyNPC四姿勢；R戶外地表樹冠蕨類；S六64×64建材與80×40自繪INN/床；T五花箱與響應式暫停；U Space原生checkbox；V八窗框窗櫺玻璃pane；W旅店招牌XY2.75/anchor[-4.7,2.4,-3.4]均保留。技術證據不等於全美術核准。

X直式Truce同buffer構圖與HUD安全區[.045,.955,.12,.80]；Y以完整故事state推導在場角色，joined不是在場證據。Z招牌.30；A四棟共104mesh遮擋群組.16、9tick指數/12tick保持與私有blend還原不變。B必要隊伍優先，可選旅店地標1.5/1.6幾何遲滯，成本高只移除地標取景要求，不隱藏mesh或裁切P2/guest。

C山道／森林小怪preservePixelPalette單一unlit emission、原drawImp/24×32nearest-alpha、五RGBA採樣、位置尺度／數值／出現規則不改；原PNG/CRC gate與村莊證據共存。D植物alpha保護下肢／腳底與CPU透明建物背面修正保留。E/F既有NPC減少動態frame0/current-tick還原、隱藏不更新／dispose釋放、穩定seed與私有貼圖；森林時門只停非必要旋轉，任務動作不凍結。

CI78鏡頭修復保留相同tick/context/target/viewport/actor安全框的原緩動frame；進reduced安全snap，反向精確還原。時間／context／ratio／base／actor／bounds／reset改變即失效。不耗正常緩動時間，不加timer/native state寫入。以上均不重做。

## 五、G音訊與H/I/J場景既有成果

G七種自製合成音型保留：262管風琴、330攻擊降頻、440互動單音、520技能滑音、620恢復、660鐘聲/合技、800時門，其他合法40–4000Hz保留單音。每型最多3聲部、level總和<=.04、尾音<=.5秒，共用16聲部/master.55；這是排程參數，不是聽感／音量安全／完整配樂認證。無ROM/原OST/第三方採樣/外部音訊服務，七段自製配樂非完整OST。

單一audio-clock，不加timer/simulation tick；不足聲部丟棄不排隊補播，滿載可只播部分音型。Main觸發點不變，緊接dialog/hold的音效仍可能立即停止，不延後對話或放寬hold。完整graph建立才持有，部分建立/connect/start/stop例外與dispose獨立清理handler/node/close；成功排程計數不因取消改寫。Hold/mute/reset/dispose立即關master、stop/disconnect。Analyser重用1024Float32且讀真值，hold不造零、dispose不再讀。原生驗收僅支持實際music/analyser/hold/import/mute，七音型unit不證明都已原生觸發或聆聽。

H保留原guardia1000/courtroom384×352nearest、world16×14/y=.02地面幾何：低對比苔地／中央土徑／通往原gate分支，法庭石板細邊地毯、原家具31薄飾面。沒有新增碰撞家具或重建場景。

I法庭14既有角色卡以原witness pivot62/64與actual camera up對齊支撐面：法官與訴訟人物.72、證人.49、陪審員.55，+.04脚底間隙；原x/z為脚底錨點，僅補償渲染卡中心，不改遊戲碰撞座標。七陪審員height1.7/width1.2，隱藏停止更新、dispose移除binding，不新增mesh/texture。原guardia1000的15樹卡整合既有oak。

J三個原法庭平台圓柱共用128×160nearest opaque cap/edge atlas與分區UV，未改支撐面／幾何／人物接地。原15樹卡使用四種靜態樹冠輪廓的穩定序列，保留既有樹根接觸像素、位置尺度數量；無逐幀重畫。J原source **235fcf143a853cdeb8599b3f8703b090542eda5a** 已發布，15檔／473inputs／477snapshot、2264Node410Python屬既有成果，本輪不重做。樹冠重疊、法庭壓縮構圖仍需改善。

## 六、已接受CI81及中斷恢復

本輪初始main **587e14d6671513e08c74e66711d58797d4f1b855** 已有 **CI81_ACCEPTANCE.json**，但STATUS/白皮書/TODO/handoff與CI80/81checkpoint等待內容落後。直接根據最新收據恢复J，確認此HEAD相对J只新增兩份文件；不重跑CI80/81、不將舊queued敘述當真。現在已同步所有目前文件並按原收據關閉舊checkpoint，不改原接受／失敗報告。

最新有界接受 **CI81／36125796673、Pages75／36128075047**，Jroot **b2741de9f8c759b27139174a996167c7ed74f1db**。原三jobs成功／conditional skips保留，chooser、CPU600救援審判與十ledger173列逐byte相同、570原檔未改；sourcearchive root匹配。Pages selectedCI81/sourceJ/artifact10860835779，playable/staged/deployed HTML **5741404bytes**／SHA256 **f17b04b039dbb2f6cb5df0630292af6bd2dd6bfcc0ba6fe833950b00bb176f67**相同，publicHTTP step通過。這些是先前已保存的驗收，本輪只恢復原檔，沒有重驗或本機HTTP/browser。

CI81原圖102contact／3fullsize（courtroom、forest-gate、field-canyon），其餘99縮圖。178.24秒原片／19108932bytes，SHA256 **bd78ed00ee238ddea3ad873fcb34c14f30cd832c62240eec04873de492a63f42**，完整decode及356連續2fps樣本／六表，無fullsize影片樣本／原速／音軌聆聽／真機／長時間認證。這指出山道亮紋、磚格岩壁與草面干擾，成為K實作依據。

CI80/更早原收據保留且不重驗。CI77相機76像素差異失敗、CI75WebGL PNG上限失敗依然failure，各後續修復不回填舊run。CI71未完成視覺審查的歷史accepted=false不回填。

## 七、K山道材質與可重建測試

Runtime只改canyon-render.ts、新增canyon-art.ts。原512×448地面／world24×22/y=.05/z=1與sin路徑外形保留；低對比苔地土路、稀疏成組邊缘草葉與24小石取代密集亮紋。原64×64岩壁改不規則沉積層／開放裂隙。各既有terrace-turf共用一張新64×64貼圖，其原始RGBA16384bytes不是完整GPU/CPU記憶體量測。原8張64×80nearest-alpha樹卡接未改drawWoodlandOak。

原mesh數量／UV／transform／shadowcaster／material數量、所有碰撞資料、角色、C小怪palette、相機、Gaudio、H/I/J、main/core與native routes/captures/assertions/workflow逐程式範圍保持。只多一張共用turf texture，不新增地形物件。四個runtime-painter review exports（canyon-floor/rock/turf/oak）byte相同且獨立PNG解碼，不是原素材抽取或最終核准資產。

**2282Node全pass、零fail/skip；413Pythonpass**，新增18Node＋3Python。18targetedpass，舊CI81canyon在兩項新runtime斷言fail，明示離線回歸不是原生失敗。完整assets/typecheck/build/check/diff通過，481非文件inputs前後與發布前一致，485assembledsnapshot加四rootdocs。三viewport192×128/96×160/160×96檢查新畫面／原state-geometry-camera-enemy、精確偏好還原；另外八張map原offlinepixels相同。重複draw/隱藏不upload／不增生，dispose釋放。

K三script八精確片段inverse與原CI81 fullhash/NodePython missing-duplicate-unrelated guards保留；J歷史script先剝除明示K片段，當前K runtime對exact舊canyon module獨立測試。歷史port不是當前原生證據。匯出checker首次誤查dist/assets後改為dist/art，保留診斷、不改runtime/native斷言。

離線before/after requested678×452、actual542×361，Node rect-onlycanvas不含文字/曲線；已實際檢視，不是CI82原圖／原速遊玩。原CI81完整state僅作明示Nodefixture，不注入browser。地面材質較安靜，但箱狀平台、視野壓縮／樹卡重複未結案。完整收據 **VQ03K_TESTED_BATCH.json**。

發布root **a126f073e0e648898dfbd1da06ba9ac7d12b05f1**由已測src acf72241、tests2edf16ba、scripts0123f295、其餘原程式與實際main docs b2a40748組合，remote root完全一致。一次source與唯一matchingCI82已識別；尚未accepted，不能拿CI81原生或Kunit當CI82結果。

## 八、完整剩餘工作與交付治理

直接完成CI82_CHECKPOINT.remainingReview。只查exactrun一次，active保存不久等；完成後核同source/run/HTML三jobs／主報告／chooser／CPU600救援審判／十ledger／Gaudio，特別新山道PNG／同run影片與原敵人palette、資源/quality/exactrestore gates。保留原擷取／走位／tick／sleep／畫質，不以CI81舊圖或Koffline代替。MatchingPages selectedCI/source/artifact/exactHTML/publicHTTP及原ZIP/source/movie/report/review正確Drive保存下載回讀後，才有界accepted；失敗只修真實同root缺口。

支持成功續T05更廣人物植物道具尺度輪廓、原作構圖、山道箱狀平台與樹冠重複、法庭壓縮空間、完整角色動畫、完整合法音訊／實際聆聽及原速移動／淡化／viewport舒適性。不重做accepted批次，不提前擴後段。

T03：隱含規則／版本差異／完整拓樸與數值忠實。
T04：完整成長／報酬掉落／經濟道具飾品／學習換人及雙三人技。
T05：全部美術／建模／完整動畫／合法完整音訊，前段實際品質優先。
T06：所有時代／主支線／結局，2300抵達不是完整未來。
T07：整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio。
T08：每批完整實作測試／一次source／完整matchingCI／原始產物雲端保存回讀。

唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。K包 **11ksb0vJbgJMa-uWUWlJAI-Y4d-IpvC4u**／1007203bytes／SHA256 **2ba644a51aa4883a255a2ede56111675cf379c1714c887b53c7702ea63904e30**，16差異／485snapshot／48manifest／logs/offline/exports已實際下載核parent/size/hash/CRC/tar。CI81原包 **1kXO-zxI4b0Yb8ycaV6AdqZagL-ugrKnn**、J已測包 **1A4URAW8CREMtET8qTuj3LDHFQTF6x7OP**及更早恢復點保留DELIVERY_INDEX；舊archive prepublicationfalse不能重送，進度以GitHubmain為準。

Main only/singleAI/non-force、不建branch/PR/平行candidate或防撞。Held VQ01Z／母親家具不提升、換管道或間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**固定。禁止本機browser；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules／esbuildhardlink，不覆舊config或開bootstrapCI。原<.12／tick／單一30秒／250ms256／CPU品質記憶體不放寬。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM／原媒體／字型／憑證不公開。文件[skip ci]且回讀，臨時容器不是權威。無新美術分數、原速／聆聽／真機／長時間或全遊戲接受。
