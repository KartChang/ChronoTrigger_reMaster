# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03r-ci89-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main/singleAI/non-force；root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。前一版完整白皮書原blob保存在 **evidence/CI89_PREVIOUS_WHITEPAPER.md**，更早設計與接受收據原樣保留；歷史狀態不作目前發布authority。

## 一、完整產品目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先，保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。先改善前段人物、場景、完整動畫、遮擋、HUD、操作與音訊，不縮成展示，不因CI綠勾提早擴後段。

品質需整體>=90／各面向>=80%、required assets／five gates／zero critical與實際畫面、遊玩及真機測量支持。測試數、文件、匯出圖或效果不是美術分數。工具歷史30/100不是R當前評分；release仍BLOCKED，沒有新score或全遊戲接受。

## 二、架構與不可變行為

保留TypeScript／Babylon.js／esbuild與固定依賴、單一自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不決定傷害、ATB、死亡、碰撞或劇情。CPU/WebGL共用場景及規則，無GPU時用真正CPU triangle/texture/depth回退，不建立第二套低品質關卡。

暫停、背景、對話、背包、native選檔、contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入、A*遵守原碰撞。P1克羅諾、P2依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵／雙確認合技維持，不加P3／ARPG／框架重造。V1–v8白名單IndexedDB/JSON相容，診斷與動畫cache不入save，不造舊版行為證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB／512entries、120活動FrameWindow保持。CPU不承諾GPU shadow/glow/specular/postprocess品質；packedclear/rowspan、預設OFF opaqueaffine minification、alpha/perspective nearest與mip釋放不變。Nodebench與短window不作真機或長時間流暢認證。

## 三、既有流程與全範圍缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門及2300抵達。**2300抵達不是完整未來篇**。

既有13商品、武器身體頭部裝備、相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥維持；400G／價格／普通攻防為明示暫定值，不冒稱完整原作數值。T03完整規則／版本差異／拓樸／數值，T04完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人、雙三人技均仍須完成。

## 四、保留美術、相機、動畫與音訊

HDhero固定tick／實際步伐／cache／接地、NPC姿態、遮擋取景與landmark遲滯、植物下肢保護、祭典材質、村莊細節窗框玻璃保留。C fieldenemy unlit emission／24×32nearestalpha／五採樣；Mframe0–3、Nframe4/5、O真實origin方向身體回應與獨立24tick死亡殘影、P真實角色出手朝向與down clip、Q真實hit保留已繪製受擊朝向維持。H/I/J/K/L森林時門／法庭陪審員接地／山道地面岩壁／8切角平台／8樹卡4冠atlas不重做。

Q精確唯一活著目標hit只保持上一個實際draw方向，不猜attacker/origin，不延長90/90/100/130ms既有hurtclip。未draw、firstdead、近似/重疊目標、outgoing/guest/heal/combo/inactive/lab不造方向；連續hit、cast/down中斷、reduced/pause/rewind/rebase/identity/dispose回歸保留。24筆48×64材質指紋不等於同步framebuffer。

Held VQ01Z／母親家具不提升或間接替換；src/prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

G七組自製合成音型／七段配樂不取ROM/原OST/第三方採樣。每型<=3聲部、level合計<=.04、尾音<=.5秒，共用16聲部/master.55、單audio-clock不加timer，超額丟棄不補播。Dialoghold立即停止，graph/connect/start/stop失敗及dispose獨立清理；analyser1024重用但讀真訊號，不造零。Graph/unit/無音軌影片不代替完整音訊、實際聆聽或装置音量安全；R不改audio。

## 五、R三個戰鬥呈現時鐘

Published **VQ03R／0.9.65** source **2175dba2fde6e58bcd0548dc750b16a4eeded319**，root **310ca4ddb5ae78db3279f6c61d1c9017a30f039c**，parent文件 **7da11e86704db9414beb5b47947916ce42dbfdd2**。20檔一次nonforce發布；runtime新增combat-timing.ts及render.ts接線。Remote src/scripts/tests等於完整測試版，source保留live docs。

ExactQ離線重現：simulation tick143不變，重複draw仍會使突進、刀光、傷害文字累加render delta。R以真實Effect交付tick計算絕對age，統一三者時序，保留原.42秒/.55距離sine突進、.6秒刀光/scale/alpha、>1.25秒文字到期與.8上升。不改core、damage、ATB、logicaldeath、collision或save；poseclips和圖也不改。

Same-tick及pause不推進；reduced零突進、隱藏刀光、必要數字靜止，同tick切回還原当前phase而不是重播。死亡/受擊/停用/模式離開/角色identity切換只中止突進，腳底及影子同步；rewind/rebase/scene/reset/dispose釋放owned transient引用資源。最多24筆實際source/transform/expiry觀察，不新增GPU物件，不當同步framebuffer。

原N/O/P/Q route/keys/waits/captures/assertions保持；最後新增readonly timingJSON與checker，原checker預設仍嚴格，明列R expected_build。Native checker驗同一真實交付source下三類效果的start/middle/expired、tick/age/direction/foot/transform/alpha/scale/disposal。沒有localbrowser或native state/time/save/collision注入。

## 六、本批測試與最新接受基準

Final **2576Node/0fail/0skip、490Python/0fail**；新增46Node/16Python已包含。Asset/typecheck/buildpass，543inputs前後hash一致。三viewportCPU actual actortriangles正向差異與same-tick畫面一致、效果到期transients0；獨立Python核1source/9transformrows/1completecombinedevent。這些皆為明示離線fixture；unitcanvas不繪製文字與curve，不宣稱刀光或數字nativepixels。12檔34hunk strict sourceinverse與missing/duplicate/unrelated負測試不轉native資料。

第一次fullcheck被工具180秒限制中斷，partiallog不當pass或productfailure；同一frozen版本完整重跑通過。傳輸中的未提交test筆誤恢復成已測原bytes後，整棵程式樹匹配才發布；不改測試求通過。原log與早期working包保留。詳細VQ03R_TESTED_BATCH。

最新accepted為 **Q／CI88／Pages82**，而不是R。CI88/36234759501與Pages82/36236803130 completed/success，收據CI88_ACCEPTANCE、CI88_CHECKPOINT已closed；原生1完整reaction/4cells、0selector-change、0party-down，N/O/P正向保留。十ledger173列逐byte，611原檔不改，exactarchive root及playable/staged/deployedHTML匹配；七原ZIP指定Drive下載回驗。只看action06/09兩張fullsize，無contact/其他PNG/video decode/play/listening/device認證。不重驗CI88或更早批次。

R唯一 **CI89／36249382768**，push/attempt1/exactR，最後queued/null（provider2026-09-26T14:41:50Z）。**nativeCombatTimingVerified=false、nativeSelectorChangeVerified=false、nativePartyDownVerified=false**。需原始matchingCI證據；presenter/harness存在及unitpass不是nativeacceptance。

## 七、接續及完整分母

先读STATUS/checkpoint、main確認一次，只接CI89。Queued/in_progress不長輪詢、不另dispatch、不重送R；完成後核combat-timing、原Q/P/O/N、主報告/nativechooser/CPU600救援審判/ledgers與matchingPages來源/HTML。原ZIP/reports/video/source/manifest保存下載回驗後才限定接受；缺樣本保持缺口，只修真正terminal。

T03完整規則版本拓樸數值；T04完整成長報酬掉落經濟道具飾品學習換人雙三人技；T05全角色/敵人方向sprite與移動攻擊受擊倒地死亡、全遊玩、人物植物道具尺度輪廓/原作構圖、山道法庭壓縮/樹列、完整合法音訊與聆聽、原速走位淡化viewport舒適性；T06全時代主支線結局；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical與真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試/一次source/matchingCI/原產物雲端回讀。前段實際品質優先，不因CI綠勾擴後段。

## 八、持久交付與限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。R已測包 **14LzErkCJX_pWgJt5VqEyxZLdufdbXDJE**，1291610bytes/SHA256 **1f04bea09c75c3185144d9e557bd46380e7b3603a26b1e5224b6d30dafdd63bc**，43manifest/544snapshot實際下載回驗。CI88原包 **1vLwhZttA4zvkXtSSD2jyElt2deHy6fZg**，89323797bytes/SHA256 **c112f2ea3bebd03a306be4f1e899349c0335d3b45ed2e00754ca427fe635eb68**，七ZIP/24manifest實際下載回驗。詳DELIVERY_INDEX。Assembled快照不是publishedGitarchive或最新docs；封裝false/null及較早parent歷史，不授權重送R。

Mainonly/nonforce/no branchPRparallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數，不放寬<.12/原ticks/routes/keys/waits/captures/assertions/single30s/250ms-256/CPUquality-memory。Toolchain1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/保留esbuildhardlink，不覆舊source/config/bootstrapCI。私人ROM/media/fonts/credentials不公開。Docs skipci/cloudreadback；臨時容器不是權威；CI77/75failure及CI71歷史false不回填。
