# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03q-ci88-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main、singleAI、non-force；root **T05-early-visual-cohesion**，terminal **T05-field-foe-action-animation**。前一版完整白皮書原blob保存在 **evidence/CI88_PREVIOUS_WHITEPAPER.md**，更早設計及收據原樣保留，歷史狀態不作目前發布authority。

## 一、完整產品目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先，保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。先改善前段實際人物、場景、完整動畫、遮擋、HUD、操作與音訊，不縮成展示，不因CI綠勾提早擴後段。

品質需整體>=90／各面向>=80%、required assets／five gates／zero critical與實際畫面、遊玩及真機測量支持。測試數、文件、匯出圖或效果不是美術分數。工具歷史30/100不是Q當前評分；release仍BLOCKED，沒有新score或全遊戲接受。

## 二、架構與不可變行為

保留TypeScript／Babylon.js／esbuild及固定依賴、單一自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不決定傷害、ATB、死亡、碰撞或劇情。CPU/WebGL共用場景與規則，無GPU時真正CPU triangle/texture/depth回退，不改成第二套低品質關卡。

暫停、背景、對話、背包、native選檔、contextloss凍結模擬，恢復不補跑背景时间；InputBoundary清舊輸入、A*遵守原碰撞。P1克羅諾、P2依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵／雙確認合技維持，不加P3／ARPG／框架重造。V1–v8白名單IndexedDB/JSON相容，診斷及動畫cache不入save，不造舊版行為證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB／512entries、120活動FrameWindow保持。CPU不承諾GPU shadow/glow/specular/postprocess品質；packedclear/rowspan、預設OFF opaqueaffine minification、alpha/perspective nearest與mip釋放不變。Nodebench與短window不作真機或長時間流暢認證。

## 三、既有流程及全範圍缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門及2300抵達。**2300抵達不是完整未來篇**。

既有13商品、武器身體頭部裝備、相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥維持；400G／價格／普通攻防為明示暫定值，不冒稱完整原作數值。T03完整規則／版本差異／拓樸／數值，T04完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人、雙三人技均仍須完成。

## 四、保留的美術、相機與音訊

HDhero固定tick／實際步伐／cache／接地、NPC姿態、遮擋取景及landmark遲滯、植物下肢保護、祭典材質、村莊細節窗框玻璃保留。C fieldenemy unlit emission／24×32nearestalpha／五採樣；Mframe0–3、Nframe4/5、O真實origin方向身體回應與独立24tick死亡殘影、P真實角色出手朝向與down clip保持。H/I/J/K/L森林時門／法庭陪審員接地／山道地面岩壁／8切角平台／8樹卡4樹冠atlas不重做。

Held VQ01Z／母親家具不提升或間接替換，src/prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

G七組自製合成音型／七段配樂不取ROM/原OST/第三方採樣。每型<=3聲部、level合計<=.04、尾音<=.5秒，共用16聲部/master.55、單audio-clock不加timer，超額丟棄不補播。Dialoghold立即停止，graph/connect/start/stop失敗与dispose独立清理；analyser1024重用但讀真訊號，不造零。Graph/unit/無音軌影片不代替完整音訊、實際聆聽或裝置音量安全；Q不改audio。

## 五、Q受擊朝向連續性

**VQ03Q／0.9.64** source **7cf434e43a2ec4d791ec45720e52a84938adb3b5**，root **ff3530b61bff361b8e7c83150f80645608c86a2f**，一次18檔nonforce發布。Runtime只新增party-reaction.ts並接party-combat-motion.ts；render.ts、core、原角色繪圖、ActorTimeline/PosePlayer/MNO/傷害ATB死亡碰撞save／原workflow不變。

真實交付且精確唯一活著目標的hit，只保持上一個已實際繪製的方向，避免受擊中跟著選敵扭轉；target-only不推測attacker或origin。不觸發或延長hurt，不改90/90/100/130ms既有clip。未draw／firstdead／近似或重疊目標／outgoing/guest/heal/combo/inactive/lab不造方向。連續hit依真實交付tick、同tick不累加；cast/down中斷不恢復舊hit；reduced/pause/rewind/rebase/identity/dispose均有回歸。24筆有界實際48×64材質指紋不等於同步framebuffer，零新增GPU資源。

## 六、測試與原生接受界線

本輪Q最終 **2530Node／0fail／0skip，474Python／0fail**；新65Node＋17Python包含其中。Asset/typecheck/build通過，535inputs前後一致，remote src/scripts/tests完全吻合。四方向×五有效角色slot、64hurt cells、負向事件與生命週期、三viewportCPU真實繪圖正向差異及結束逐像素P還原有回歸；獨立Python核離線2完整reaction／8cells／3differentfallback。9檔19hunks嚴格Q→P source inverse保持歷史完整斷言，不轉native資料。以上是離線開發證據。

最新已接受 **P／CI87／Pages81**：原checker核2真實角色出手／8cells，N/O原生正向、十ledger173列逐byte、原source/HTML與七原ZIP雲端回驗完成。僅action08/09兩張fullsize PNG，無其他圖片或影片播放／聆聽。**P原生倒地完整序列仍缺**。收據CI87_ACCEPTANCE，closed；不重驗已接受O與更早批次。前次中斷P已發布而checkpoint滯後，本輪恢復既有source，不重送P。

Q唯一 **CI88／36234759501**，push/attempt1，最後in_progress/null（provider2026-09-26T10:06:12Z）。Q suffix僅在原N/O/P所有inputs/waits/captures/assertions之後加只讀JSON與checker，原buildchecker預設仍嚴格，Q明確expected_build。**nativeReactionVerified/nativeSelectorChangeVerified/nativePartyDownVerified均false**；須核exactQ原始報告，不以開發測試先行接受。

## 七、接續及完整分母

先讀STATUS/checkpoint、main確認一次，只接CI88原始產物。Pending不當failure，不另dispatch／重送Q，不長時間輪詢。完成後核party-reaction、原P/N/O、主報告／chooser／CPU600救援審判／ledgers、matchingPages來源及HTML；保存原ZIP/reports/影片/source/manifest到Drive並下載回驗才boundedacceptance。缺selector-change/down樣本保持缺口，不虛構native。

T05全部角色／敵人方向sprite、移動攻擊受擊死亡／全遊玩，人物植物道具尺度輪廓、原作構圖、山道法庭壓縮／重疊樹列、完整合法音訊與聆聽、原速走位淡化viewport舒適性仍開放。T06所有時代主支線結局；T07真機input/FPS/frame-time/load/memory/background/save/audio與整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical；T08每批完整測試／一次source／matchingCI／原始產物雲端回讀。沒有全動畫、美術、原速、聆聽、真機、長時間或全遊戲核准。

## 八、持久交付與限制

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。Q已測包 **16P0lwUaO1ku_2e4AhAmVTPUEfundpJj_**，1127875bytes／SHA2562dd093d6a6256073fe468b07fc6ade11b140644f6575b1cb12d9a1eff11d4d25，41manifest／536snapshot實際下載回驗。CI87原包 **1fp3_q1D8jTOrg8xCeLr5n7BZafFkSli2**，89039149bytes／SHA256c2b12d802dc95a9c6e6684880e13a839d6b534c16602d85ae9864a79bd7c6615，七ZIP／14manifest實際下載回驗。詳DELIVERY_INDEX；assembled快照不是最新docs或publishedGitarchive，Q已發布，不依封裝false/null重送。

Mainonly/nonforce/no branchPRparallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數，不放寬原<.12/ticks/routes/keys/waits/captures/assertions/single30s/250ms-256/CPUquality-memory。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules、保留esbuildhardlink，不覆source/config或bootstrapCI。私人ROM/media/fonts/credentials不公開。文件skipci／雲端回讀，臨時容器不是權威；CI77/75failure、CI71歷史false不回填。
