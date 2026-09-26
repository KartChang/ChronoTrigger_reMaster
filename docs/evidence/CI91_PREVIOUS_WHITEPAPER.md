# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03s-ci90-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main/singleAI/non-force；root T05-early-visual-cohesion，terminal T05-field-foe-action-animation。前一版完整白皮書原blob保存在 **evidence/CI90_PREVIOUS_WHITEPAPER.md**；既有設計、原收據、失敗與恢復鏈不改寫，歷史狀態不作目前發布authority。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景，瀏覽器優先；保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人與同機雙人共畫面、全部時代主支線與結局。先改善前段人物、場景、完整動畫、遮擋、HUD、操作與音訊，不縮成展示，不因綠CI提早擴後段。

整體>=90／各面向>=80%、requiredassets／fivegates／zerocritical須由實際畫面、遊玩與真機測量支持。測試數、文件、效果、匯出圖不是美術評分。歷史30/100不是S目前分數；release BLOCKED，沒有新分數或全遊戲接受。

## 二、架構與不可變行為

保留TS／Babylon.js／esbuild、固定依賴與單一自含HTML，玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不能决定傷害、ATB、死亡、碰撞或劇情。CPU與WebGL共用場景規則，GPU不可用時走真正CPU triangle/texture/depth回退，不建立第二套低品質關卡。

暫停、背景、對話、背包、native選檔、contextloss凍結模擬；恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守原碰撞。P1克羅諾、P2依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵與雙確認合技維持；無P3/ARPG/框架重造。V1–v8白名單IndexedDB/JSON相容，診斷、動畫cache與action metadata不入save，不造舊版行為證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB／512entries、120活動FrameWindow不變。不承諾GPU shadow/glow/specular/postprocess品質；packedclear/rowspan、預設OFF opaque-affine minification、alpha/perspective nearest及mip釋放保持。Nodebench、短window不是原生長時間或真機流暢認證。

## 三、既有流程與完整缺口

家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門及2300抵達保持。**2300抵達不是完整未來篇**。

既有13商品、武器／身體／頭部裝備、相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持；400G／價格／普通攻防為明示暫定值，不冒稱完整原作數值。T03完整規則版本差異、拓樸與數值忠實；T04完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人與雙三人技仍須完成。

## 四、保留的美術、動作與音訊

HDhero固定tick／實際步伐／cache／接地、NPC姿態、遮擋取景與landmark遲滯、植物下肢保護、祭典材質、村莊細節窗框玻璃保持。C fieldenemy unlit emission／24×32nearestalpha／五採樣；M原四姿態、N真實出手、O origin方向身體回應與獨立24tick死亡殘影、P角色出手朝向/down clip、Q真實hit保留已繪製朝向、R三個simulation效果時鐘不重做。H/I/J/K/L森林時門、法庭陪審員接地、山道地面岩壁、8切角平台及8樹卡4冠atlas保持。

Q不推測attacker，不延長90/90/100/130ms既有hurtclip；近似或重疊目標、未draw、firstdead、heal等不造方向。R保留.42秒/.55距離sine突進、.6秒刀光、>1.25秒數字/.8上升，依實際Effect交付tick算age；同tick/pause不動，reduced零突進、隱藏刀光、必要文字靜止。Body/remnant/hurt/timing histories只記錄實際材質或transform，不等於同步framebuffer或原速觀感。

Held VQ01Z／母親家具不提升或間接替換，prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

G七組自製合成音型／七段配樂不取ROM、原OST或第三方採樣。每型<=3聲部、level合計<=.04、尾音<=.5秒，共用16聲部/master.55，單audio-clock不加timer，超額丟棄不補播。Dialoghold立即停止，graph/connect/start/stop失敗與dispose獨立清理；analyser1024重用但讀真訊號，不造零。Unit與無音軌影片不代替完整音訊、實際聆聽或裝置音量安全；S未改audio。

## 五、S修道院敵人有限動作

Published **VQ03S／0.9.66** source **f14c9ac42581b80d6028bb00fad0fbcf5695f5eb**，root **f2192325d0bb13d9f04be5016762ff1c579f07a4**，parent文件 **a3d34df9150f5901b1c5e72759c1c25d6fdf09e6**。27檔一次nonforce發布；runtime新增rescue-enemy-art.ts與rescue-enemy-motion.ts，render接線。Core一處條件擴展既有enemyAction metadata至rescueMap；來源由真實attacker/index/tick/origin/target產生，不由目標猜敵人，不改傷害ATB死亡碰撞或save。

Naga/Hench/Yakra保留原rescue-art靜止與Yakra原準備畫格，增加有限手臂姿態：真實attack2/3/1與存活受擊4。Fixedtick、cache、reduced、hidden/dead停更、identity/rewind/rebase/dispose、24筆限額與實際材質fingerprint回歸，無新增GPU資源。不宣稱完整方向sprites、死亡動畫或美術核准。

原rescue screenshots02/06/07後加三個readonly觀察，既有WebGL/CPU lanes沿用同一script；原keys/routes/waits/captures/assertions及workflow均不改。tests/rescue_enemy_motion.py核action來源、原tick/mode/pose及材質；沒有localbrowser或native state/time/save/collision注入。截圖後history不是同步畫面證据。

## 六、測試與中斷恢復

中斷前final **2684Node/0fail/0skip、509Python/0fail**；新增108Node/19Python含總數，asset/typecheck/buildpass。553programinputs＋THIRD_PARTY共554snapshot；三敵種×三viewport離線CPU真實材質/像素、15PNG fullRGBA/CRC與17檔42hunk strict sourceinverse保存，native資料不轉換。

初期Yakra準備reference與version-normalization負測試問題已在中斷前修正；final全套通過，原failure logs保留，未放寬native gates。本次不重跑已完成測試，只下載final包核77manifest／554snapshot／27changes、原logs/exit0及Git程式樹。重用已有src/scripts與blobs，補tests樹後發布；沒有重做S。Source保留live docs，原workflow不變。

最新有界accepted仍為R／CI89／Pages83；CI89_ACCEPTANCE保留原範圍，一組完整source timing，只有兩張fullsize PNG檢視，不是原速/聆聽/真機接受。本次沒有重驗CI89或更早工作。S唯一matching **CI90／36261482173**，push/attempt1；最後in_progress/null（provider2026-09-26T18:08:26Z）。**nativeRescueEnemyMotionVerified=false**；P原生完整倒地、Q selector-change仍未觀察，不把離線測試或後續CI綠勾當原生正向。

## 七、接續與完整分母

開始只讀STATUS/checkpoint、main確認一次，接唯一CI90。Pending不當failure，不長輪詢或重dispatch。完成後核exact S rescue-motion報告/observations、原N/O/P/Q/R、主報告/nativechooser/CPU600救援審判/同source ledgers、matchingPages selectedCI/source/artifact/HTML。原ZIP/reports/video/exactsource/manifest存指定Drive並下載回驗後才限定接受。缺樣本明列evidencegap，只修實際terminal。

T03全規則版本拓樸數值；T04完整成長報酬掉落經濟道具飾品學習換人雙三人技；T05全party/enemy方向sprite、move/attack/hurt/down/death／全遊玩、人物植物道具尺度輪廓/原作構圖、山道法庭壓縮/樹列、全部美術建模及合法完整音訊/聆聽、原速走位淡化viewport舒適性；T06全時代主支線結局；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試/一次source/matchingCI/雲端原產物回讀。不縮範圍；前段實際品質優先，不因綠CI擴後段。

## 八、持久交付與限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Sfinal **1QG4Ws5XaOT0P_D9J4tndKO8C4mpco5M7**，1611479bytes／SHA256 **dab441851eebd14b87c8a2485241e7c32cd769ad3ebdcc56b40c9fac8898983a**，本次77manifest/554snapshot/27changes下載回驗。CI89原包 **1_BZHn1fac-wxLh55NrB_KbFqxG74AIK7** 沿用原回驗，詳細DELIVERY_INDEX。Assembled快照及prepublication false/null不代表最新docs或未發布source；S已發布，不重送。

Mainonly/nonforce/no branchPRparallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數，不放寬<.12/原ticks/routes/keys/waits/captures/assertions/single30s/250ms-256/CPUquality-memory。Toolchain1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/保留esbuildhardlink，不覆舊source/config或bootstrapCI；私人ROM/media/fonts/credentials不公開。Docs skipci/cloudreadback，臨時容器不是權威；CI77/75failure與CI71歷史false不回填。無新分數/fullanimation/art/originalspeed/listening/device/longsession/wholegameapproval。
