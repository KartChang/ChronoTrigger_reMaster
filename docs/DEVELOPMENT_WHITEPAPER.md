# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03v-ci93-pending**。動態 authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一 main、singleAI、non-force；root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。本次更新前的完整白皮書原 blob **4c56c1209c8965e15296d84ba08da4666e52afca** 保存在 **evidence/CI93_PREVIOUS_WHITEPAPER.md**。歷史設計、接受收據、失敗與恢復鏈保留，舊狀態不作目前發布 authority。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D 重製，像素角色＋立體場景，瀏覽器優先；保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地 ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。先改善前段人物、場景、完整動畫、遮擋、HUD、操作與音訊；不縮成展示，不因 CI 綠勾提早擴後段。

品質需整體 >=90／各面向 >=80%、required assets／five gates／zero critical，並有實際畫面、遊玩及真機測量支持。測試數、文件、匯出圖或新增效果不是美術分數。工具歷史 30/100 不是 V 當前評分；release BLOCKED，沒有新 score 或全遊戲接受。

## 二、架構與不可變行為

保留 TypeScript／Babylon.js／esbuild 與固定依賴、單一自含 HTML；玩家不需 ROM、Python、帳號或後端。Controls → 固定 1/60 秒 simulation → core → render／HUD／audio；呈現不決定傷害、ATB、死亡、碰撞或劇情。CPU／WebGL 共用場景與規則，無 GPU 時用真正 CPU triangle／texture／depth 回退，不能建立低品質第二關卡。

暫停、背景、對話、背包、native 選檔與 context loss 凍結 simulation；恢復不補跑背景時間。InputBoundary 清舊輸入，A* 遵守原碰撞。P1 克羅諾、P2 依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵與雙確認合技保持；不加 P3、不改 ARPG、不重造框架。V1–v8 白名單 IndexedDB／JSON 相容；診斷、動畫 cache、呈現 metadata 不入 save，不造舊版證詞。

CPU 原 640×480 cap、最大邊 1280、tiers、32 MiB／512 entries、120 活動 FrameWindow 保留。CPU 不承諾 GPU shadow／glow／specular／postprocess 品質；packed clear／row span、預設 OFF opaque-affine minification、alpha／perspective nearest 與 mip 釋放不變。Node benchmark 與短 window 不是真機或長時間流暢認證。

## 三、既有遊玩與完整缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600 山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門與 2300 抵達。**2300 抵達不是完整未來篇**；全部時代主支線結局仍要完成。

現有 13 商品、武器／身體／頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G、價格與普通攻防為明示暫定值，不冒稱原作完整數值。T03 全規則／版本差異／拓樸／數值；T04 完整成長、報酬掉落、消耗品經濟、飾品、學習、換人與雙三人技仍開放。

## 四、保留的美術、動畫、相機與音訊

HD hero 固定 tick／實際步伐／cache／接地，NPC 姿態、遮擋取景與 landmark 遲滯、植物下肢保護、祭典材質、村莊窗框玻璃等保持。C field enemy unlit emission／24×32 nearest alpha／五採樣；M 原四姿態、N 真實出手来源、O field 方向身體回應與 24 tick 殘影、P 角色出手朝向／down clip、Q 保留實際 draw 受擊方向、R 突進／刀光／數字 simulation 時鐘、S 修道院 Naga／Hench／Yakra 手臂姿態、T 修道院身體與死亡殘影、U 監獄守衛與龍戰車各部位姿態／真實修復均不重做。H／I／J／K／L 森林時門、法庭陪審員接地、山道地面岩壁、8 切角平台與 8 樹卡／4 冠 atlas 保持。

Q 不猜 attacker／origin、不延長原 90／90／100／130 ms hurt clip。R 保留 0.42 秒／0.55 距離突進、0.6 秒刀光、>1.25 秒數字 expiry 與 0.8 上升，依實際 Effect 交付 tick 計算；同 tick／pause 不推進，reduced 零突進、刀光隱藏、必要文字靜止。S 原 rest、Yakra ready 及 rescue-art 保留。T 不重構 O field controller。U 戰鬥守衛材質只由戰鬥控制器更新，其他 NPC 節奏保持；頭部修復、多受擊目標不重複啟動同一 source，零傷害不冒充受擊。V 不修改 M–U 原圖與這些控制器。

Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts 固定 blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。呈現 history 只記錄實際材質或 transform，不等於同步 framebuffer、原速播放或美術核准。

G 七組自製合成音型／七段配樂不取 ROM／原 OST／第三方採樣；每型 <=3 聲部、level <=.04、尾音 <=.5 秒，共用 16 聲部／master .55，單 audio-clock、無額外 timer，超額丟棄不補播。Dialog hold 立即停止，graph／connect／start／stop 失敗與 dispose 獨立清理；analyser 1024 讀真訊號，不造零。Graph／unit／無音軌影片不代替完整音訊、實際聆聽或裝置音量安全。V 未改 audio。

## 五、V 監獄與龍戰車身體／死亡呈現

**VQ03V／0.9.69** 已一次發布：source **a8aeaf2414875b3ab82518e4373b69ae17d88648**，root **2fb99bb4b30ea4f89760595519bba986f90377cf**，parent 文件 **1d5b513697a265603596751288ed07f703e7e2f5**。20 檔（11 修改／9 新增），remote src／scripts／tests 與完整測試的凍結版吻合；source 保留 live main docs 與原 workflow。

Runtime 新增 trial-enemy-body.ts 並接 trial-render.ts，借用 U 原 mesh／art，不改 core、trial-rules、damage、ATB、logical death、collision 或 save。真實 enemyAction origin／target 支持守衛 24 tick／.20 出手、車體 -.08 反作用、車輪 .10 位移；龍頭維持真正修復姿態，不虛構攻擊。实际 HP 下降及已知 origin 才支持 18 tick／.10 受擊退縮；無 origin 的實際受擊只中斷既有出手，不猜方向。多目標交付不重複觸發自身動作，邏輯位置保持不動。

守衛、龍頭、車體、車輪仍在原 HP0 時刻立即停用原 mesh；另以一次實際材質 copy 建立獨立 48×64／64×64 靜態殘影，24 simulation ticks 內按原幾何與相機 up 縮短／淡出／釋放。最多 3 個、49152 raw RGBA bytes，這是設計上限，不是原生總記憶體或 FPS 證據。殘影是有限、獨立擁有並需釋放的 GPU／CPU 資源，不能宣稱 V 零新增暫態 GPU 物件；也不因此延後原敵人的死亡、碰撞或選敵判定。

同 tick 重畫不累加，pause 保持 simulation phase；reduced 清理殘影且不重播已死亡物件。同 tick／reduced、hidden、state owner／reload、rewind、chapter／defeat／dispose，以及材質讀取、upload、mesh allocation 失敗後清理均有回歸。History 上限 24，actual source／transform／copy 指紋不等於同步畫面或原速舒適性證據。

在原 trial 六個 battle／victory 邊界追加唯讀觀察，原路線、按鍵、等待、截圖、斷言與 workflow 保持。Exact V tests/trial_enemy_body.py 核對真正來源的位移、HP-loss、原敵人立即停用、靜態 copy 與 expiry。U checker 保留嚴格舊 default，V 顯式傳 expected_build；原 U／N–T 報告不改寫、不轉換。Victory 可能在最後死亡的完整 phase 前停止 simulation，缺樣本仍列缺口，不修改 tick／等待或遊戲狀態湊證據。

## 六、完整測試、恢復與原生接受界線

中斷前 final **2913 Node／0 fail／0 skip、569 Python／0 fail**；新增 65 Node／20 Python 已包含於總數。Asset／typecheck／build 通過，**582 program inputs＋4 root docs＝586 frozen inputs** 前後 hash 一致，另未改 THIRD_PARTY 共 587 snapshot。三種 viewport、四類死亡、三類出手的離線 actual CPU 正向像素、同 tick 畫面一致及 exact U 還原有回歸。Unit canvas 不繪文字／curve，不宣稱相應原生像素證據。12 個 offline PNG 在開發期匯出，只曾檢視兩張原小尺寸；本次發布恢復未新增圖片、影片或聆聽檢視。

11 檔／27 hunk 的嚴格 source-only inverse 及 missing／duplicate／unrelated drift 負向檢查保持；它只處理歷史 source，不轉換 native state／report／pixels。初期 offline DOM port、資源數量期望、PNG Buffer 介面失敗與工具中斷紀錄均保留；修正離線介面並維持原斷言後，最終全套通過。詳細 **VQ03V_TESTED_BATCH.json** 與原封存 logs，不放寬原生 gates。

本次從 v26 中斷點實際下載 final 包，核對 59 manifest／587 snapshot／20 changes、原 final logs／exit0 及凍結輸入；**未重新執行已完成開發測試，也沒有重做 V**。補齊 exact frozen 檔案傳輸，三個遠端程式樹匹配才一次發布。傳輸中的未提交 binary 筆誤已換回原封存 bytes，沒有發布錯誤 blob、沒有修改已測 source／tests／門檻。包內 false／null、old parent effa760 與 partial7-file tree 是發布前歷史，不能據此再次提交 V。

最新有界 accepted 仍為 **U source074776a5cb2157937bfaf7d9bd8dbc40d8bff6d7／CI92／Pages86**。既有 CI92_ACCEPTANCE 與 closed checkpoint、原 ZIP 雲端回驗保持，本次不重驗。CPU wheel、Hench 出手、完整 Yakra 死亡、P 原生完整倒地與 Q 原生受擊換目標仍有缺口。既有更正記錄已指出 U 文件 SHA29e859... 不存在，不將它當成 published HEAD。

V 唯一 matching **CI93／36301106757**，workflow360357259／.github/workflows/ci.yml，push／attempt1／main／exact V。最後 provider 觀察 **in_progress／conclusion null**，created **2026-09-27T06:46:52Z**、updated **2026-09-27T06:46:57Z（台灣2026-09-27 14:46:57）**。此為記錄的觀察，不保證之後仍相同。**nativeTrialBodyVerified=false、nativeTrialDeathVerified=false**；CI93 原始產物與 matching Pages 尚未核對，不以 unit pass、checker 存在或 CI 執行中代替接受。

## 七、接續與完整分母

開始只讀 STATUS／checkpoint、main 確認一次，只接 CI93。Queued／in_progress 保存可靠點，不長輪詢、不另 dispatch、不重送 V。完成後用 exact V checker 唯讀核 trial/trial-enemy-body-report.json 與六個 trial-body-{cellguards-victory,stairguards-victory,tank-animation,tank-repair,tank-victory,stairguards-victory-2}-observation.json，分別核 WebGL／CPU lane 的真正 source 與 phase；缺死亡階段如實列出。

原 U／N–T、完整 main／native chooser／CPU600／rescue／trial／same-source ledgers 與 matching Pages selected CI／source／artifact／HTML 一併核對。未修改原 ZIP／reports／video／exact source／manifest 存指定 Drive，實際下載回驗後才 bounded acceptance。Green CI 不等於全遊戲認證，history 不是同步 framebuffer；只修真正失敗 terminal，不造原生狀態、時間或正向樣本。

T03 完整規則、版本差異、拓樸與數值忠實。T04 完整成長、報酬掉落、經濟、道具、飾品、學習、換人、雙三人技。T05 全角色／敵人方向 sprites 與移動／攻擊／受擊／倒地／死亡／實際遊玩，全部美術／建模、人物植物道具尺度輪廓與原作構圖、山道法庭壓縮空間／重疊樹列、合法完整音訊與實際聆聽、原速走位／淡化／viewport 舒適性。T06 全部時代主支線與結局，2300 抵達不算完整未來。T07 整體 >=90／各面向 >=80%、required assets／five gates／zero critical，加上真機 input／FPS／frame time／load／memory／background／save／audio。T08 每批完整測試、一次 source、matching CI 與原始產物雲端回讀。

完整分母不縮；有限 body／殘影不關閉完整動畫，已接受 M–U 及 V 接受後都不重做。前段實際品質優先，不因綠勾擴後段。沒有新 score、完整動畫、美術、原速、聆聽、真機、長時間或全遊戲核准。

## 八、持久交付與固定限制

唯一 Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

V final **Chrono-VQ03V-trial-body-tested.zip／1UOO0T74CcGE95AW3oswKMtxT_OmoyRaT**，**1585595 bytes**，SHA256 **7ad6830ee15b83caa4b9c05daaf1674fd015a98bd75d60f85c703fb964907e7e**。本次實際下載核 parent／size／hash／CRC／59 manifest／587 snapshot／20 changes。早期 working 與原測試紀錄保留 intermediate/，不是平行 candidate。

CI92 原包 **Chrono-CI92-reviewed-evidence.zip／1QiSj6Mfu72DQxALGADhCwmFREwjVpnOq**，89695950 bytes，SHA256 **dbfac36aeab1a976df133e17312cce19a31c9320902ebb19b6a2ef1ec43637fd**，19 manifest 沿用既有驗回，本次不重做。前版完整交付索引原 blob **1188d2885efe841ebd3f812c1f1fac0f9fd7b6eb** 保留在 **evidence/CI93_PREVIOUS_DELIVERY_INDEX.md**；U／T／更早封存鏈、CI91 與更早收據詳 DELIVERY_INDEX。

Snapshot 是 assembled 已測 inputs，不是 published Git archive 或當前進度文件。Main checkpoint 優先於暫存、包內 false／null、較早 parent 或歷史 docs，不能覆蓋最新進度或重送 V。Main only／singleAI／non-force，不建立 branch／PR／parallel candidate／multiwriter 機制。

禁止 local browser 或 native game／time／save／collision 造數，不放寬原 ticks／routes／keys／waits／captures／assertions／<.12／單一30秒／250ms-256／CPU 畫質與記憶體門檻。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只恢復 node_modules、保留 esbuild hardlink，不覆舊 source／config、不開 bootstrap CI。Held prologue／母親家具不提升或間接替換；ROM／media／fonts／credentials 私人不公開。所有成果 GitHub／指定 Drive／readback，docs 使用 [skip ci]；臨時容器不是權威。CI77／75 failure、CI71 歷史 false 保留，不回填接受。
