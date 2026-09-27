# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03w-ci94-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main、singleAI、non-force；root **T05-early-visual-cohesion**，development terminal **T05-field-foe-action-animation**，execution terminal **T05-trial-repair-history-eviction**。前版完整白皮書原blob **d042c23d93a599657812856b4acb3c224ea70c4a** 保留於 **evidence/CI94_PREVIOUS_WHITEPAPER.md**，歷史設計與原收據不改寫；舊狀態不作目前發布authority。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景，瀏覽器優先；保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。先改善前段人物、場景、完整動畫、遮擋、HUD、操作與音訊；不縮成展示，不因CI綠勾提早擴後段。

品質需整體>=90／各面向>=80%、required assets／five gates／zero critical，並由實際畫面、遊玩及真機測量支持。測試數、文件、匯出圖或新增效果不是美術分數。工具歷史30/100不是W目前評分；release BLOCKED，沒有新score、全動畫、美術、原速、聆聽、真機、長時間或全遊戲接受。

## 二、架構與不可變行為

保留TypeScript／Babylon.js／esbuild與固定依賴、單一自含HTML；玩家不需ROM、Python、帳號或後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不能決定傷害、ATB、死亡、碰撞或劇情。CPU/WebGL共用場景規則，無GPU走真正CPU triangle/texture/depth回退，不建立第二套低品質關卡。

暫停、背景、對話、背包、native選檔與context loss凍結simulation；恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守碰撞。P1克羅諾、P2依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵與雙確認合技保持；不加P3、不改ARPG、不重造框架。V1–v8白名單IndexedDB/JSON相容；診斷、動畫cache及呈現metadata不入save，不造旧版行為證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB／512entries、120活動FrameWindow保持。CPU不承諾GPU shadow/glow/specular/postprocess品質；packedclear/rowspan、預設OFF opaque-affine minification、alpha/perspective nearest及mip釋放不變。Nodebenchmark及短window不能替代真機與長時間流暢認證。

## 三、既有流程與完整缺口

家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門與2300抵達維持。**2300抵達不是完整未來篇**，全部時代主支線結局仍須完成。

既有13商品、武器／身體／頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持；400G、價格與普通攻防仍為明示暫定值，不冒稱完整原作數值。T03全部規則／版本差異／拓樸／數值忠實；T04完整成長、報酬掉落、消耗品經濟、飾品、學習、換人及雙三人技仍開放。

## 四、保留的美術、動畫、相機與音訊

HDhero固定tick／實際步伐／cache／接地、NPC姿態、遮擋取景與landmark遲滯、植物下肢保護、祭典材質、村莊窗框玻璃等保持。C fieldenemy unlit emission／24×32 nearestalpha／五採樣；M原四姿態、N真實來源、O field方向身體／24tick殘影、P角色出手朝向／downclip、Q保持實際draw受擊朝向、R突進刀光數字simulation時鐘、S修道院手臂姿態、T修道院身體／殘影、U守衛及龍戰車各部位姿態與真實修復，均不重做。H/I/J/K/L森林時門、法庭陪審員接地、山道地面岩壁、8切角平台與8樹卡／4冠atlas保留。

Q不猜attacker/origin、不延長原90/90/100/130ms hurtclip。R保留0.42秒／0.55距離突進、0.6秒刀光、>1.25秒數字expiry與0.8上升，以實際Effect交付tick計算；同tick/pause不動，reduced零突進／刀光隱藏／必要文字靜止。S原rest、Yakraready與rescue-art保留。U避免戰鬥守衛材質被一般NPC更新覆寫，頭部真正修復、多目標只啟動同來源一次、零傷害不誤播受擊。

V已實作但未接受：借U原mesh/art，守衛24tick/.20出手、車體-.08反作用、車輪.10位移依真實來源；龍頭只修復，不造攻擊。HP-loss+origin支持18tick/.10退縮，未知origin只中止出手。原HP0立即停用原敵人，另有独立48×64/64×64一次材質copy、24tick縮短淡出、最多3個／49152rawRGBAbytes；屬需要釋放的暫態GPU/CPU資源，不是零新增物件或總memory/FPS證據。V實作與原畫圖在W保持，不因CI93失敗重造既有身體動作，也不冒稱V已接受。

Held VQ01Z／母親家具不得提升或間接替換，src/prologue-render.ts固定blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。呈現history只能支持實際觀察到的材質／transform，不等於同步framebuffer、原速播放或美術認證。

G七組自製合成音型／七段配樂不取ROM、原OST或第三方採樣；每型<=3聲部、level<=.04、尾音<=.5秒，共用16聲部／master.55，單audio-clock無額外timer，超額丟棄不補播。Dialoghold立即停止，graph/connect/start/stop失敗與dispose獨立清理；analyser1024讀真訊號不造零。Graph/unit/無音軌影片不代替完整音訊、實際聆聽與裝置音量安全；W不改audio。

## 五、CI93失敗與W保留策略

CI93／36301106757、V sourcea8aeaf2414875b3ab82518e4373b69ae17d88648已completed/failure，沒有V原生接受。原遊玩head repair斷言已通過，但後續motion report為 **No actual head repair action**：tank-repair tick699、headRepairs1、history24、historyDropped64、retainedrepair0。ExactV離線production renderer先真正draw出repair2/3/1，再被後续idle FIFO全部擠掉，證實記錄保留缺陷。不能以headRepairs或離線紀錄重建／填補遺失native畫格，原CI93報告與失敗保持。

Published **VQ03W／0.9.70** source **70f9888ea0bc9c7cfb4fc8c4eeadac8cc917809a**，root **bdac0b30a9bb53e37f12264327c607dcb9b140c5**，parent文件 **532c956e196e58889cb84dd808f57da63a4b1ecf**。20檔一次nonforce；runtime只新增trial-motion-history.ts並修改trial-enemy-motion.ts的診斷存放與生命週期，沒有改動戰鬥規則、動畫clip或實際畫圖。

24筆總上限保持，overflow依序移除無cause的idle、同chapter/index/敵種/操作且已有較新event的row、同一event/frame/reduced偏好的重複phase，最後才移除最舊唯一row。只選擇移除既有樣本，不修改留下的cause/tick/cell，不補frame或生成event。Policy vq03w-semantic-trial-history與idle/superseded/duplicate/capacity counters完整披露overflow，counter和等於historyDropped。選擇後仍為原tick順序，但**不保證連續timeline**；不同保留優先權也不構成全過程已觀察。

新encounter owner清除同一State中上一場的舊證據；victory保留實際上一場樣本直到owner更換。Borrowedmesh dispose只清自己的chapter/index歷史。State/rewind/chapter/dispose清理；same-tick、reduced往返、hidden、peer flood、缺修復不造數、inspect深複本均有回歸。W沒有新增GPU物件，也不改damage/ATB/death/collision/save、V身體/殘影或M-U美術。

原native repair、outgoing action及positive body要求都保留；只明列W expected_build並加policy/counter/chronology contract。原routes/keys/waits/screenshots/assertions及workflow不改，不增加觀察等待湊樣本。Strict12file26hunk source-only inverse恢復原V sourcehash，用於歷史斷言，不轉native state/report/pixels。

## 六、完整測試與原生界線

本輪final **2950Node／0fail／0skip、582Python／0fail**，新增37Node/13Python含總數；asset/typecheck/build通過。594frozeninputs＝590programinputs＋4rootdocs，另THIRD_PARTY共595檔，前後hash不變。三viewport/drawcadence（192×128/7、256×160/11、240×180/19）的production CPU對照逐次驗證corestate/pixels/resources等於exactV；W保留同一組已draw修復2/3/1而V在後續idle消失。這些皆離線fixtures，不是真機、原速或native修復驗收。

Container於檔案傳輸途中重置，從同一已下載回驗的W包恢復exact檔案與hash，沒有重做實作或再執行完整測試。一次未提交script傳輸重複項改回原已測bytes，完整src/scripts/tests吻合才一次source發布。原frozenreceipt/hash/logs在W包review/，正式source映射见VQ03W_TESTED_BATCH。無W測試failure，不把CI93failure消除或混算為W結果。

最新boundedaccepted仍 **U／CI92／Pages86**，原接受與雲端回驗沿用，不重驗。CI93僅完成失敗診斷與四原ZIP封存；後續CPU/fallback/ledger gates未執行，不能當通過，不宣稱CI93playable或matchingPages成功。本輪沒有native圖片檢视、video播放、聆聽或真機評測。

W唯一matching **CI94／36307776528**，push/attempt1/main/exactW；最後provider觀察 **in_progress/null**，created2026-09-27T08:56:21Z、updated **2026-09-27T08:56:24Z（台灣2026-09-27 16:56:24）**。只是記錄時狀態，nativeRepairRetentionVerified／nativeTrialBodyVerifiedOnW／nativeTrialDeathVerifiedOnW仍false。CI94原始reports/Pages未核，不能由unitpass或修復存在先行接受。

## 七、直接接續與全範圍分母

只讀STATUS/checkpoint並確認main一次，接唯一CI94。Pending保存可靠點，不長輪詢、不另dispatch、不重送W。完成後用exactW trial_enemy_motion.py／trial_history_contract.py核WebGL和CPU trial-motion原報告及六observations：真實head repair/outgoing、24row／原tick/cell／counter；再核Vbody/death及原N-U報告、main/nativechooser/CPU600/rescue/trial/same-sourceledgers、matchingPages selectedCI/source/artifact/HTML。未改原ZIP/reports/video/exactsource/manifest指定Drive下載回驗後才boundedacceptance。CI93永遠failure，不從其未跑gates借pass；缺phase保持gap，只修實際terminal。

T03全部規則、版本差異、拓樸、數值忠實。T04完整成長、報酬掉落、經濟、道具、飾品、學習、換人、雙三人技。T05全部美術／建模、全party/enemy方向sprites/move/attack/hurt/down/death/實際遊玩、人物植物道具尺度輪廓、原作構圖、山道法庭壓縮／重疊樹列、完整合法音訊與聆聽、原速走位／淡化／viewport舒適性。T06全部時代主支線結局，2300抵達不是完整未來。T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical，加真機input/FPS/frame-time/load/memory/background/save/audio。T08每批fulltests/onesource/matchingCI/cloudoriginalreadback。

CPUwheel、Hench出手、完整Yakra死亡、Pdown及Q受擊中換目標仍有原生樣本缺口。M-U已接受基礎不重做；V/W待當輪證據，不回填。W僅診斷保留與lifecycle，不能關閉完整動畫。前段實際品質優先，不因CI綠勾擴後段；完整分母不縮。

## 八、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Wfinal **Chrono-VQ03W-trial-history-tested.zip／1bbUqQj0BFZ6CTsGTDntQMb2ySU9KV_rS**，1298160bytes，SHA256 **03502f61fffcc06307f868026af30f6c4ca28aefbbdfbdcbe1194ade234d22c6**，43manifest/595snapshot/20changes實際下載回驗。changes/及review/changed-files.json為發布inputs；snapshot在review/program-snapshot.tar.gz，完整紀錄在review/。Assembled快照不是publishedGitarchive/currentdocs；包內false/null、parent293d6d是歷史，actualparent532c956，W已發布不再提交。

CI93failed **1pz9pcUPtzI694DDAOaHd64hlmMo81oPO**，50697084bytes，SHA256 **ec4ddf3c2c38e2c5ad7c5d07c55ddb093ae16d9cb2bcd4477a0eb18be6b5d360**，四未改providerZIP／5manifest，parent,size,hash,外內CRC/manifest已下載回驗。它是失敗證據，不是接受。CI92與V及更早恢復鏈在DELIVERY_INDEX／CI94_PREVIOUS_DELIVERY_INDEX，不重驗；缺失的U文件SHA29e859...沿用既有更正，不當authority。

Mainonly/singleAI/nonforce，不建branch/PR/parallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數，不放寬原ticks/routes/keys/waits/captures/assertions/<.12/單一30秒/250ms-256/CPUquality-memory。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只node_modules、保留esbuildhardlink，不覆舊source/config或另開bootstrapCI。Held家具／prologue不可提升或間接替換，ROM/media/fonts/credentials私有。全部成果GitHub/指定Drive/readback，docs[skip ci]；main優先於temporarycontainer與archive舊docs。CI77/75/93failure、CI71歷史false維持，不回填。
