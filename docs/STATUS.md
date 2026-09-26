# Status — VQ03O 已發布，唯一 CI86 待完成

Authority：本檔、TODO、handoff/IMMEDIATE_CONTINUATION、evidence/T05_ANIMATION_CHECKPOINT.json。Repository **KartChang/ChronoTrigger_reMaster**，唯一 **main**、single AI、non-force。Root **T05-early-visual-cohesion**；terminal **T05-field-foe-action-animation**。只讀 STATUS 與 checkpoint，確認 main 一次，依 remainingWork 接續；不盤點歷史或重做已接受批次。

## 唯一目前位置

**VQ03O／0.9.62** 已一次發布並回讀。Source **116bcd03b431e12135bbadf6584d6a06b826f639**，root tree **00abe47a184d80e60bfec5435bd0e7af86c6bc8a**；parent 文件 **27353c12df378a59c41d1c8770123a1bdb17f0f7**。20 個程式／測試／build 檔案，remote src/scripts/tests tree 與完整測試的 frozen 版本完全一致；原 workflow 不改，source 提交保留最新 main docs。

唯一 matching **CI86／36219307419**，workflow360357259／.github/workflows/ci.yml、push、attempt1、main、exact O SHA；全 event／全 state 共1 run。最後 provider 觀察 **queued／conclusion null**，created/updated **2026-09-26T04:56:18Z（台灣2026-09-26 12:56:18）**。這是已記錄的觀察，不保證之後仍相同。沒有未發布 candidate，不重送 O、不另外 dispatch。詳 CI86_CHECKPOINT。

## 本輪已完成

CI85／36195520068及Pages79／36198492443已 bounded accepted／closed，詳 CI85_ACCEPTANCE。N source517426f3979244ce9ae2bcddc5a0518533e1500b仍是最新已接受的原生基準；O是published但未原生接受。N原checker核實存活受擊frame3一筆、同一真實來源的frame4/5三組；十ledger173列逐byte相同、原始報告不改、sourcearchive root匹配。七原ZIP／18manifest已存Drive並實際下載回驗。不重查CI84/85、Pages78/79或重送M/N。

O新增 **field-enemy-body.ts**，render.ts僅接線。依真實已交付 origin/target 作出手方向位移與受擊退縮；無origin的combo不猜方向。原敵人在原死亡判定立即隱藏，另建最多3個獨立24×32靜態材質殘影，僅複製upload一次，24 simulation ticks內下沉／縮短／淡化並釋放；最多9216 raw RGBA bytes不是原生總記憶體證據。Core／傷害／ATB／碰撞／死亡時機／v1–v8存檔及M/N像素繪製不改。

同tick不累加、reduced motion、暫停固定tick、隱藏／死亡原材質停更、回退／換state／換場景／dispose／分配失敗清理有回歸。新增原生suffix在全部N路線按鍵等待截圖及斷言之後，使用正常選敵與普通攻擊讓18HP→0，觀察真實transform／靜態texture／expiry；**尚待CI86，nativeBodyVerified=false、nativeDeathVerified=false**。歷史不是同步framebuffer，未用local browser。

Frozen完整check：**2401 Node／0fail／0skip、442 Python／0fail**；新增41Node及8Python已包含總數；asset/typecheck/build通過，517程式inputs前後hash一致。三viewport實際CPU triangle出手正向差異、結束逐像素恢復N；額外離線死亡／半程差異為192×128:60/40、256×160:93/66、240×180:116/80，24tick後三者都與N逐byte相同。全部離線fixture，不是原生或真機認證。早期失敗logs保留，未放寬原門檻。

## 已持久保存並回讀

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

**O已測包** Chrono-VQ03O-field-foe-body-tested.zip／**1hBerRJsROrDa6YY0pXXloUVm1iSTerVM**，**1105642bytes**，SHA256 **c38285c734adc51dd6e949c84f286b616b2bdbdc9b5bd008da9b2bb1fab4c724**。已實際下載核parent/size/hash/CRC／38manifest／518snapshot檔hash。517非文件inputs＋未改THIRD_PARTY，沒有node_modules/ROM/font/credentials。不是published Git archive或最新進度；包內false/null是封裝歷史，O已發布，不重送。

**CI85原證據** Chrono-CI85-reviewed-evidence.zip／**1Y2eBSYn36UbXfzMreaiC9vWXoIjYupvd**，**89299477bytes**，SHA256 **4d91262210c17c73e08a94364e09f0c5db4c94898ffeb13e78d022bdeb13146d**，七未改ZIP／18manifest實際下載回驗。106張PNG縮圖／4聯絡表，只有action06/07兩張fullsize、104縮圖；本輪未decode影片或原速播放／聆聽。Software runner短樣本3.65/3.72FPS不構成舒適性接受。

## 直接接續

先接唯一CI86。若queued/in_progress，保存可靠接續点，不輪詢到中斷。完成後以exact O核field-enemy-action/field-enemy-body-report.json、N原positive報告、原主報告／chooser／CPU600救援審判與同source ledger；再核matching Pages／HTML，原ZIP及影片存指定Drive並回讀後才限定範圍接受。失敗只修實際terminal，不把未觀察當故障或重寫M/N/O。

之後續完整方向sprite／移動／攻擊受擊死亡與全遊玩證據，再處理人物植物道具尺度輪廓、原作構圖、山道／法庭壓縮空間／樹列重疊、完整合法音訊與實際聆聽、原速走位／淡化／viewport舒適性。前段實際品質優先，不因綠勾擴後段。

## 不變範圍與限制

完整T03規則版本拓樸數值；T04成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊；T06全部時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、required assets/five gates/zero critical與真機input/FPS/frame time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／原產物雲端回讀。沒有新score，全動畫／美術／原速／聆聽／真機／長時間／全遊戲均未核准，release BLOCKED。

保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1-P2-autonomous third/v1–v8。No branch/PR/parallel candidate或多人防撞。No localbrowser/native game-time-save-collision造數；不放寬<.12／原tick／單一30秒／250ms/256／CPU畫質或記憶體。Held VQ01Z／母親家具不提升或間接替換；prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules且保留esbuild hardlink。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM/media/fonts/credentials不公開。Docs [skip ci]，臨時容器不是權威。CI77/75 failure、CI71歷史accepted=false保留。
