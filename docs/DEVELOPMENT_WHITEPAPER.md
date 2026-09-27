# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03w-ci94-reviewed**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT v30。唯一main、singleAI、non-force；root T05-early-visual-cohesion，development/execution terminal T05-field-foe-action-animation。前一版完整原文blob **4434c115eca0032f0ae8a80ccbe72e12aa6496ff**原封保留於 **evidence/CI94_PRE_ACCEPTANCE_WHITEPAPER.md**；歷史設計細節仍有效，該檔pending及未驗旗標是當時觀察，不是目前狀態。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景，瀏覽器優先；保留世界背景、原作辨識度與構圖、縮尺大地圖、城鎮/室內切換、原地ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。前段人物、場景、完整動畫、遮擋、HUD、操作與音訊先達舒適品質，不縮成展示或因CI綠勾提早擴後段。

品質需整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical，由實际畫面、遊玩及真機量測支持。測試數/文件/匯出圖不是美術分數；工具歷史30/100不是W現在評分。ReleaseBLOCKED，無newscore、全動畫、美術、原速、聆聽、真機、長時段或全遊戲接受。

## 二、架構與不可變行為

保留TypeScript/Babylon.js/esbuild、固定依賴、自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不能決定傷害、ATB、死亡、碰撞或劇情。CPU/WebGL共用規則；無GPU走CPU triangle/texture/depth回退，不另造低品質關卡。

暫停、背景、對話、背包、native選檔與context loss凍結simulation，恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守碰撞。P1克羅諾/P2依劇情/自主第三、獨立選敵與雙確認合技保持；不加P3、不改ARPG。V1-v8白名單IndexedDB/JSON相容，診斷與動畫cache不入save。

CPU640×480cap、最大邊1280、tiers、32MiB/512entries、120活動FrameWindow保持；不承諾GPU shadow/glow/specular/postprocess。Packedclear/rowspan、預設OFF opaque-affine minification、alpha/perspective nearest及mip釋放保持；短benchmark不是真機長時段認證。

## 三、既有流程與完整遊戲缺口

保留家中醒來/樓梯、縮尺世界、祭典行為/初遇/項鍊異變、600山道/托魯斯/森林/王城、皇后消失/露卡合作、修道院青蛙/管風琴暗門/亞克拉救援返鄉、护送審判、兩條越獄、弗里茲/露卡、龍戰車三部位、重聚時門與2300抵達。2300抵達不是完整未來篇。

既有13商品、武器/身體/頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G/價格/普通攻防仍為明示暫定值，不冒稱完整原作數值。T03全規則版本差異/拓樸/數值；T04完整成長/報酬/掉落/消耗品經濟/飾品/學習/換人/雙三人技；T06全時代主支線結局均未縮分母。

## 四、已實作美術、動畫、相機、音訊與限制

HDhero固定tick/實際步伐/cache/接地、NPC姿態、遮擋取景/landmark遲滯、植物下肢保護、祭典材質及村莊窗框玻璃保持。C fieldenemy unlit emission/24×32 nearestalpha/五採樣；M四姿態、N真實敵方來源、O field身體/24tick殘影、P角色出手/downclip、Q保持實際draw受擊朝向、R simulation效果時鐘、S修道院姿態、T修道院身體/殘影、U守衛/龍戰車姿態/真實修復及NPC材質所有權皆保留。H-I-J-K-L森林時門/法庭接地/山道岩壁/8切角平台/8樹卡4冠atlas不重做。

Q不猜attacker/origin、不延長90/90/100/130ms hurtclip。R保留0.42秒/0.55距離突進、0.6秒刀光、>1.25秒數字expiry/0.8上升；same-tick/pause不動、reduced零突進/刀光隱藏/必要文字靜止。U同來源多目標只啟動一次、零傷害不誤播受擊。

V body原守衛24tick/.20、車體-.08、車輪.10依真實來源；龍頭只修復。HP-loss+origin支持18tick/.10退縮，未知origin只中止出手。HP0立即停用原敵人；獨立48×64/64×64一次copy、24tick縮短淡出、最多3個/49152rawRGBAbytes，需要正常釋放，不能冒稱零資源或全FPS驗證。W不修改上述動作、timing或原畫圖。V原CI93仍failure；V實作的限定body/守衛death樣本在W/CI94另有新驗證，不回填V。

Held VQ01Z/母親家具不能提升或間接替換；src/prologue-render.ts固定blob2711a74185aacf3c6bddf9db85ba99a2afbc507a。G七自製合成音型/七段配樂不取ROM/OST/第三方採樣，每型<=3聲部/level<=.04/尾音<=.5秒，共用16聲部/master.55，單audio-clock不加timer；dialoghold立即停、失敗獨立清理、analyser1024真訊號。Graph/unit/無音軌video不能代替完整音訊與實際聆聽。

## 五、W診斷保留與當輪原生驗收

W/0.9.70 source **70f9888ea0bc9c7cfb4fc8c4eeadac8cc917809a**，tree **bdac0b30a9bb53e37f12264327c607dcb9b140c5**。原24row上限、idle→superseded→duplicate→oldest的淘汰順序及四counter保留真實row，不補幀/事件。New encounter owner及borrowed mesh disposal清自己的舊樣本，victory保留最近真實history；不改core/rules/ATB/damage/death/collision/save或新增GPU物件。

CI94／36307776528 completed/success，2026-09-27T09:35:42Z；Pages88／36309871443 completed/success，09:36:16Z。兩lane六觀察head repair、outgoing、body原checker及13當輪native報告通過；10source ledgers與原檔一致。WebGL repair545、CPU repair576均有1/2/3格；CPU wheel attack1529亦有1/2/3格，舊CPUwheel未觀察缺口關閉。正向body/recoil與守衛完整死亡copy樣本已驗，但Tank各部位完整死亡未驗。

這是有界來源/材質/transform驗收。History非連續timeline、不同boundary重疊不加總、非同步framebuffer。本輪未看圖/播放video/聆聽/真機。CI93仍failure；它未執行的gates不借用，CI94有自己的完整原始產物。W先前完整2950Node/582Python/asset/typecheck/build已完成，本輪沒有重跑已完成開發測試或發新source/CI。

## 六、下一步與全範圍分母

直接續TODO **T05-trial-rescue-death-and-action-coverage**：Tank WebGL無death row、CPU tankBody2337僅start/fading；Yakra CPU不完整/WebGL無保留；Hench outgoing、Pdown、Qselector-change缺樣本。先分辨未播放/未留存/勝利停時，不能僅因缺樣本推定runtime故障；不得放寬原等待/路線/門檻或造數，不能重造已接受M-W。

T05仍包括全部party/enemy方向sprites/move/attack/hurt/down/death/全遊玩、人物植物道具尺度輪廓、原作構圖、山道法庭壓縮/重疊樹列、合法完整音訊及聆聽、原速走位/淡化/viewport。T03/T04/T06完整範圍如上；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批fulltests/onesource/matchingCI/原產物下載回驗。所有分母不縮。

## 七、持久交付與恢復

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。當輪 **Chrono-CI94-reviewed-evidence.zip／1EzKKEm3JkhvrW3wGeCxUMlUBhyHNqDtC**，89144663bytes／SHA256 **9ab8cc7e321d440c157d234c81f9afdd75dfe7dc71e8088ebf197767219b0b29**。7provider原ZIP＋10review檔＝17manifest；已下載核parent/size/hash/外內CRC/逐檔。保留948檔Git archive重算root匹配source。Pages實際選CI94/artifact10928725618，HTML5803620bytes/hash876d846e66ad207903bd620cf03d23872260891f2aebdc3fbf3b405fb701d37c；九部署檔與staged一致，staged-only空.nojekyll明示排除，不宣稱完整封存同檔案集合。Provider公開HTTP/hash step通過，本輪未另HTTP抓取。

原ZIP在original/；review/有ledger driver/logs、原生檢核、phase coverage與source/Pages核對；雲端readback旗標以main/CI94_ACCEPTANCE為準，包內false是封裝歷史。W開發包/CI93失敗包/CI92及前代索引保持，可由DELIVERY_INDEX定位；只恢復需要的bytes，不重查全部歷史。

## 八、固定治理

Mainonly/singleAI/nonforce，不建branch/PR/parallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數；不放寬原ticks/routes/keys/waits/captures/assertions/<.12/單一30秒/250ms-256/CPUquality-memory。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆舊source/config或另開bootstrapCI。ROM/media/fonts/credentials私有。全部成果GitHub/指定Drive/readback，docs[skip ci]；main優先於臨時容器和封存舊docs。CI77/75/93failure、CI71歷史false保持。
