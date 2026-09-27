# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03x-ci95-pending**；動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT v31。唯一main／singleAI／non-force。上一版完整白皮書以原blob **7b9ebd3a83461af4f7b1109f28368cc9d93639f3** 原封保存於 **evidence/VQ03X_PREVIOUS_WHITEPAPER.md**；其完整設計規格及更早封存鏈仍有效，但舊current/pending字樣不是本版authority。本版只延續T05，不重規劃或縮小产品。

## 一、完整產品與品質

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先；保留原作世界背景、構圖與辨識度、縮尺世界及城鎮室內切換、原地ATB，單人或同機雙人共畫面，全部時代主支線與結局。前段人物場景／完整動畫／遮擋HUD／操作音訊須先舒適，不縮成展示或因CI成功提前跳後段。2300抵達不是完整未來篇。

整體>=90／各面向>=80%，requiredassets／fivegates／zerocritical，以實際畫面、遊玩及真機量測支持；測試數／來源ledger／文件不能當美術分數。FullAnimation、art、original-speed、listening、physical-device、long-session、whole-game批准皆false，newScore=null，releaseBLOCKED。工具仍印出的30/100明示屬older runtime，不是本批X評分。

## 二、不可變架構與行為

TypeScript／Babylon.js／esbuild固定依賴、自含HTML；玩家不需ROM／Python／帳號／後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不決定ATB、傷害、死亡、碰撞或劇情。CPU/WebGL同規則，無GPU走CPU triangle/texture/depth回退，不另造低品質遊戲。

暫停、背景、對話、背包、native選檔、context loss凍結simulation且不補跑；InputBoundary清舊輸入、A*遵守碰撞；P1/P2／自主第三不變，不加P3、不改ARPG；v1-v8存檔白名單保持，診斷與動畫cache不入save。CPU640×480cap／最大邊1280／32MiB/512entries／120活動FrameWindow與既有採樣、alpha、depth、品質及記憶體限制不放寬。

## 三、既有內容與全範圍分母

已實作前段家中／祭典／600山道與城鎮王城／皇后消失／露卡／修道院青蛙管風琴與Yakra／返鄉護送審判／兩條越獄／龍戰車三部位／2300抵達保持；13商品與既有裝備相容、份數、金幣库存守恆及交易上限保持。400G／價格／普通攻防仍為明示暫定，不冒稱完整原作數值。

T03全規則版本／拓樸／數值；T04完整成長／報酬／掉落／經濟／道具／飾品／學習／換人／雙三人技；T05全美術建模動畫與合法音訊；T06所有時代主支線結局；T07上述品質與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批fulltests／onesource／matchingCI／原始產物雲端下載回驗。所有分母維持。

## 四、已接受M-W與held資產

沿上一版保留HDhero／NPC姿態、像素nearestalpha／fieldenemy、森林時門／法庭接地／山道岩壁平台樹冠、party action/down、Q實際draw受擊朝向、R simulation效果時鐘、修道院及trial真實來源動作。原90/90/100/130ms hurtclip、R0.42秒/.55突進、0.6秒刀光、數字>1.25秒expiry／.8上升及reduced限制保持。

V guard24tick/.20、tankBody-.08、wheel.10、head真實repair、18tick/.10 recoil、HP0停原敵人、獨立copy一次／death24tick／最多3份資源保持。W24row／idle→superseded→duplicate→oldest retention及counters不變。本批沒有重造renderer或修改這些動作與材質。

Held src/prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 與母親家具不得提升或間接替換。既有七自製合成音型／七段配樂與16聲部/master.55及cleanup限制保持，不取ROM/OST/第三方採樣；仍未完成完整合法音訊與實際聆聽批准。

## 五、X的增量與證據邊界

X0.9.71 source **441c924246e79f43ab0a90ba54fbd9a60f9f2b02**／tree **13fa12d504b4894d2f471d91331a4b73126e30a8**。只新增read-only pending-lethal guard，讓trial/rescue body在暫停空effects繪製時保留先前實際畫過的存活來源；正常frame-owned致死事件交付後才可建立原死亡copy。沒有新timer、queue消耗、core寫入、native路線修改或延長death。清queue／換owner／離場／首次已死／reduced delivery不得產生殘影。

七種敵人以production World/core.action離線重現修前失敗、修後通過；新增38Node/5Python。完整2988Node／587Python／asset／typecheck／build通過，73項原gameplay/native/held/workflow等inputs hash一致；精確X→W來源逆轉保留原expected hashes，optional adapter不能抹去unrelated drift。

四份W死亡原觀察顯示WebGL仍排隊，CPU Tank age9／Yakra age12未滿24tick；勝利本身不停止simulation。這是固定capture界線，不能當完整death接受，也沒有證據證明上述獨立暫停缺陷發生於CI94。W已接受收據不重驗、原報告不改寫、CI93failure不回填。X尚無原生／部署／framebuffer／原速影片／聆聽／真機接受。

## 六、接續與持久交付

Root T05-early-visual-cohesion／execution T05-field-foe-action-animation；next T05-trial-rescue-death-and-action-coverage。Matching CI95 **36320908543** push/attempt1/in_progress，provider updated2026-09-27T13:00:50Z。只接exact X新結果與matching Pages，不另dispatch、重送或長輪詢。原Tank/Yakra完整死亡、Hench outgoing、Pdown、Q selector-change原生缺口保持；再續全方向sprites及move/attack/hurt/down/death、人物植物道具尺度輪廓、原作構圖、山道法庭樹列、完整合法音訊／聆聽／原速／真機品質。

Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**；X已測包 **1Mkeuf5o7-_GBu4gE-rAvrim9VAbL950a**，3196498bytes／SHA256 **12f1e35ab1bdc592703799a23a00e49f2c6ceb026062a3385100a46c44cc4b39**，已下載核parent/size/hash/ZIP CRC/254manifest及602snapshot可讀。含15changes／完整成功和失敗log／四份唯讀原觀察／七份離線結果；local-build sourceSha=null不是部署。詳細索引DELIVERY_INDEX；包內封裝時false不推翻後續readback。

## 七、固定治理

Mainonly/singleAI/nonforce，不建branch/PR/parallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數；不放寬原ticks/routes/keys/waits/captures/assertions/<.12/單一30秒/250ms-256/CPUquality-memory。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆舊source/config或另開bootstrapCI。ROM/media/fonts/credentials私有；全部成果GitHub／指定Drive／readback，docs[skip ci]，最新main高於臨時容器與封存舊docs。CI77/75/93failure、CI71歷史false保持。
