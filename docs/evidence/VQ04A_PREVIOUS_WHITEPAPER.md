# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03z-ci97-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT **v33**。唯一main、singleAI/nonforce。Root T05-early-visual-cohesion，development/execution terminal T05-field-foe-action-animation。

前版完整原文blob **7854ddcf92ce0b4c905486132483991c3d27aa89**原封保存在 **evidence/VQ03Z_PREVIOUS_WHITEPAPER.md**；其未改設計/數值/已接受範圍仍有效，歷史Y/CI96 pending由本版已接受與Z/CI97 pending取代。更早設計鏈保留於VQ03Y_PREVIOUS_WHITEPAPER.md。不從封存旗標倒退currentmain或重讀全部歷史。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製：像素角色加立體場景、瀏覽器優先、保留世界背景與原作辨識度/構圖、縮尺大地圖、城鎮室內切換、原地ATB、單人及同機雙人共畫面，全部時代主支線與結局。前段人物、場景、全動畫、遮擋、HUD、操作與音訊先達舒適品質，不縮成展示，也不因CI綠勾提前擴後段。

整體>=90、各面向>=80%、requiredassets/fivegates/zerocritical，必須由實際畫面、遊玩及真機量測支持。測試數、文件或匯出圖不是美術分數；工具印出的歷史30/100不屬Y/Z新評分。ReleaseBLOCKED，newScore=null；全動畫、美術、原速、聆聽、真機、長時段與全遊戲未批准。

## 二、架構與不可變行為

保留TypeScript/Babylon.js/esbuild、固定依賴、自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不能決定傷害、ATB、死亡、碰撞、存檔或劇情。CPU/WebGL共用規則；無GPU使用CPU triangle/texture/depth回退，不另造低品質關卡。

暫停、背景、對話、背包、native選檔與context loss凍結simulation，恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守碰撞。P1克羅諾/P2依劇情/自主第三、獨立選敵與雙確認合技保留；不加P3、不改ARPG。V1-v8白名單IndexedDB/JSON相容，動畫診斷/cache不入save。

CPU640×480cap、最大邊1280、tiers、32MiB/512entries與120活動FrameWindow保持；不承諾GPU shadow/glow/specular/postprocess。Packedclear/rowspan、預設OFF opaque-affine minification、alpha/perspective nearest與mip釋放保持；短benchmark不是真機長時段批准。

## 三、既有流程與完整遊戲缺口

保留家中醒來/樓梯、縮尺世界、祭典行為/初遇/項鍊異變、600山道/托魯斯/森林/王城、皇后消失/露卡合作、修道院青蛙/管風琴暗門/亞克拉救援返鄉、護送審判、兩條越獄、弗里茲/露卡、龍戰車三部位、重聚時門與2300抵達。2300抵達不是完整未來篇。

既有13商品、武器/身體/頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G/價格/普通攻防仍是明示暫定值，不冒稱完整原作數值。T03全規則版本差異/拓樸/數值；T04完整成長/報酬/掉落/經濟/消耗品/飾品/學習/換人/雙三人技；T06全時代主支線結局皆未縮分母。

## 四、既有美術、動畫、相機、音訊

HDhero固定tick/實際步伐/cache/接地、NPC姿態、遮擋取景/landmark遲滯、植物下肢保護、祭典材質及村莊窗框玻璃保持。C fieldenemy unlit emission/24×32 nearestalpha/五採樣；M四姿態，N真實敵方來源，O field身體/24tick殘影，P角色出手/downclip，Q保持實際draw受擊朝向，R simulation效果時鐘，S修道院姿態，T修道院身體/殘影，U守衛/龍戰車姿態/真實修復及NPC材質所有權保留。H-I-J-K-L森林時門/法庭接地/山道岩壁/8切角平台/8樹卡4冠atlas不重做。

Q不猜attacker/origin、不延長90/90/100/130ms hurtclip。R保留0.42秒/0.55距離突進、0.6秒刀光、>1.25秒數字expiry/0.8上升；same-tick/pause不動，reduced零突進/刀光隱藏/必要文字靜止。U同來源多目標只啟動一次，零傷害不誤播受擊。

V body守衛24tick/.20、車體-.08、車輪.10依真實來源，龍頭僅修復。HP-loss+origin支持18tick/.10退縮，未知origin只中止出手。HP0立即停用原敵人；獨立48×64/64×64一次copy、24tick縮短淡出、最多3個/49152rawRGBAbytes，需釋放，不冒稱零資源/全FPS。W保留原24row上限及idle→superseded→duplicate→oldest策略與四counter，不補幀/事件；新owner清自己樣本，victory留真history。CI94有自己的V/W限定樣本，不能回填CI93。

Held VQ01Z/母親家具不得提升或間接替換；src/prologue-render.ts固定blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。G七自製合成音型/七段配樂不取ROM/OST/第三方採樣，每型<=3聲部/level<=.04/尾音<=.5秒，共用16聲部/master.55，單audio-clock不加timer；dialoghold立即停、失敗獨立清理、analyser1024真訊號。Graph/unit/無音軌video不能代替完整音訊或實際聆聽。

## 五、X/Y交付與Z生命週期

X trial/rescue七類與Y field五位置已補paused lethal-source保留：只在真實致死事件仍排隊時保留已繪製、同owner、原battle/HP>0 witness，正常delivery才建立原一次copy。清queue、换owner、首次已死、reduced、隱藏/模糊target不生造死亡；原24tick/HP0停用/釋放不變。

CI95的X曾被入口舊W expected_build拒絕；Y三native入口九metadata參數改由checked-out producer唯一宣告綁定expected，不從report取expected。缺少/錯誤/重複/模糊failclosed，原checker、路線/ticks/keys/waits/captures/行為斷言不變。CI95原failure保留，Y成功不回填它。

Z把FieldEnemyMotion attack/hurt來源綁實際Enemyowner，替換、移除、觀察死亡後復活、state/chapter/rewind清失效來源，其他slot及physicaltexture cache不受影響。FieldEnemyBody換owner還原anchor，取消oldlivewitness/pending/remnant；field/rescue同owner復活也立即cancel/releasecopy，記cancelled而不是假完整expiry。缺少/null origin/target直接拒絕，避免render拋錯。這些回歸使用offline production World，不冒充native觀察或修改gameplay。

固定24tick/singlecopy/HP0原敵人停用與所有規則/資源上限保留。同一38tests在原Y9pass/29fail、Z38pass。595未改程式輸入canonical aggregate/fullmap與原expectedhashes保留；Z→Y→X來源逆轉只處理明示source hunks、拒絕缺漏重複額外修改，不能接受native資料。

## 六、當前發布與接受邊界

**Z0.9.73 sourcefa109ffa446f69881745b2b2c09b78c494f4e2fc**，tree **e1724fc3c1ff13979aef7ae62c86331d6fb5f6ad**。16變更檔合批一次non-force發布，GitHub三program subtrees與已測一致、currentmain其他root不變。完整 **3068Node/597Python/asset/typecheck/build通過**，新增49Node/3Python。matching **CI97/36330900305** push/attempt1/exactZ，最後in_progress（providerupdated2026-09-27T15:48:28Z）。無Z原生/部署接受；文件HEAD非game source。

Ysource8024dc43a4e91d0a5f9a319a5ba8c6afdadc1485／CI96/36324453650／Pages90/36326834462已completed/success並完成新原始資料有界審閱。Pagesledger選CI96/playable10933304554，HTML5804622bytes/SHA2560afdc0161d7ce73947ce005963eb79095c8138c20f867b905548400daf441d0c逐byte相同。只接受technical/source-cell-transform/部署連續性。W/CI94/Pages88 repair-history/CPUwheel1529/Vbody/守衛完整death既有接受closed；CI93/95自身failure不變。

**Tank/Yakra完整death、Hench outgoing、Pdown、Q受擊selector-change仍缺**。Y WebGL致死仍排隊，CPU Tankage9/Yakraage12未滿24tick；raw所述victory可能停時未被證實。不得改wait/capture/tick或注入狀態補足；history不是同步framebuffer/完整連續timeline。本輪查看CI96山道與法庭兩原PNG，仍prototype級，沒有新分數；未播video/聆聽/真機。

## 七、下一步與全範圍分母

直接續 **T05-trial-rescue-death-and-action-coverage**：接CI97新原始報告/source ledger/matchingPages，指定Drive保存並真正下載回驗。Pending不長poll/duplicatepush/dispatch；failure只定位真terminal，樣本不足如實open。不再重送或重驗CI96/94與本批offline fulltests。

之後續全部party/enemy方向及move/attack/hurt/down/death/實際遊玩，前段人物植物物件尺度輪廓/原作構圖/山道法庭壓縮/重疊樹列、合法完整音訊/實際聆聽、原速/真機長時段。可做開發合批完整tests後一次source/CI，不逐項開CI。

T03/T04/T06完整範圍如前；T05全部美術/建模/動畫/合法音訊；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批fulltests/onesource/matchingCI/原始產物雲端回驗。分母不縮，沒有newScore或fullapproval。

## 八、持久交付與治理

唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Z已測包 **1hGbOPVJPe9QnQPraMf0N83TLOZqMufk9**，3030737bytes/SHA25661f348063f0ba7e5c0d00179c769c8f8fceb80eba1ede8bdf68efbe55ace7c8e，187manifest/611snapshot。CI96/Pages90原始包 **1gQQduODqLkfxmfyjMgXiSAGB_67EMJn7**，88515875bytes/SHA256388c5293e822918d69592f3a3153196118b6e70aef624733e6c9a03660e3c595，六原ZIP/7manifest。已真正下載核parent/size/hash/CRC/exactmanifest/逐檔；Zsnapshot逐byte一致。完整成功失敗timeoutlogs保存；localbuild不是部署，封裝false旗標是歷史，以main收據為準。snapshot不含docs；前代恢復鏈見DELIVERY_INDEX，不覆main最新文件。

Mainonly/singleAI/nonforce；no branch/PR/parallelcandidate/multiwriter/localbrowser/native game-time-save-collision造數。原ticks/routes/keys/waits/captures/行為斷言/<.12/單一30秒/250ms-256/CPUquality-memory不放寬。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆舊source/config或另開bootstrapCI。ROM/media/fonts/credentials私有。全部GitHub/正確Drive/readback，docs[skip ci]；main優先臨時容器/封存旗標。CI77/75/93/95failure與CI71歷史false保留。
