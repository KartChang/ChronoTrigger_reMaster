# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03t-ci91-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。唯一main、singleAI、non-force；root T05-early-visual-cohesion，terminal T05-field-foe-action-animation。前一版完整白皮書原blob保存於 **evidence/CI91_PREVIOUS_WHITEPAPER.md**，歷史設計與收據不改寫，舊狀態不作目前發布authority。

## 一、完整產品與品質目標

完整《超時空之鑰》HD-2D重製，像素角色＋立體場景、瀏覽器優先，保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人及同機雙人共畫面，涵蓋全部時代主支線與結局。先改善前段人物、場景、完整動畫、遮擋、HUD、操作與音訊；不縮成展示，不因CI綠勾提早擴後段。

品質需整體>=90／各面向>=80%、requiredassets／fivegates／zerocritical與實際畫面、遊玩及真機测量。測試數、文件、匯出圖或新增效果不是美術分數。工具歷史30/100不是T當前評分；releaseBLOCKED，無新score或全遊戲接受。

## 二、架構與不可變行為

保留TypeScript／Babylon.js／esbuild與固定依賴、單一自含HTML；玩家不需ROM/Python/帳號/後端。Controls→固定1/60秒simulation→core→render/HUD/audio；呈現不決定傷害、ATB、死亡、碰撞或劇情。CPU/WebGL共用場景與規則，無GPU時用真正CPU triangle/texture/depth回退，不能建立低品質第二關卡。

暫停、背景、對話、背包、native選檔及contextloss凍結simulation，恢復不補跑背景時間；InputBoundary清舊輸入，A*遵守原碰撞。P1克羅諾、P2依劇情、瑪兒／露卡／青蛙自主第三、獨立選敵與雙確認合技保持；不加P3、不改ARPG、不重造框架。V1–v8白名單IndexedDB/JSON相容；診斷與動畫cache不入save，不造舊版證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB/512entries、120活動FrameWindow保留。CPU不承諾GPU shadow/glow/specular/postprocess品質；packedclear/rowspan、預設OFF opaqueaffine minification、alpha/perspective nearest與mip釋放不變。Nodebench與短window不是真機或長時間流暢認證。

## 三、既有遊玩與完整缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門與2300抵達。**2300抵達不是完整未來篇**，全部時代主支線結局仍要完成。

現有13商品、武器／身體／頭部裝備、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G、價格與普通攻防為明示暫定值，不冒稱原作完整數值。T03全規則／版本差異／拓樸／數值；T04完整成長、報酬掉落、消耗品經濟、飾品、學習、換人與雙三人技仍開放。

## 四、保留的美術、動畫、相機及音訊

HDhero固定tick／實際步伐／cache／接地，NPC姿態、遮擋取景與landmark遲滯、植物下肢保護、祭典材質、村莊窗框玻璃等保持。C fieldenemy unlit emission／24×32nearestalpha／五採樣；Mframe0–3、Nframe4/5與真實來源、O方向身體回應/24tick殘影、P角色出手朝向/down clip、Q保留實際draw受擊方向、R突進/刀光/數字simulation時鐘、S修道院Naga/Hench/Yakra手臂姿態均不重做。H/I/J/K/L森林時門／法庭陪審員接地／山道地面岩壁／8切角平台／8樹卡4冠atlas保持。

Q不猜attacker/origin、不延長原90/90/100/130ms hurtclip；R保留.42/.55突進、.6刀光、>1.25數字expiry與.8上升。S原rest與Yakraready圖、rescue-art保留。T不修改這些controllers/painters。HeldVQ01Z／母親家具不提升或間接替換，src/prologue-render.ts固定blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

G七組自製合成音型／七段配樂不取ROM/原OST/第三方採樣；每型<=3聲部、level<=.04、尾音<=.5秒，共用16聲部/master.55、單audio-clock無timer，超額丟棄不補播。Dialoghold立即停，graph/connect/start/stop失敗與dispose獨立清理；analyser1024讀真訊號，不造零。Graph/unit/無音軌影片不代替全音訊、實際聆聽或裝置音量安全，T沒有改audio。

## 五、T修道院身體與死亡呈現

**VQ03T／0.9.67** source **c5e0359e87c991e495566f7444042ee972f4df9d**，root **9eef2dbf9010febf39e058c7877c4d5207691dd1**，parent文件 **fcac31d7c78cf95f85a7b43a6c5c60c2ea5bddae**。22檔一次nonforce發布，remote src/scripts/tests與完整測試版匹配；source保留live docs。

Runtime新增rescue-enemy-body.ts、render.ts接線，不改core。真實已交付enemyAction origin/target驱動24tick/.20出手方向位移；實際精確唯一活著敵人hit且有origin才退縮18tick/.10。無origin combo不虛構方向，呈現不移動邏輯位置。

HP0原敵人立即停用，獨立靜態殘影copy實際原texture24×32或48×48一次，24simulationticks依原幾何/相機up縮短淡化，到期或rebase/rewind/identity/modeexit/dispose釋放。Max3／27648rawRGBAbytes為設計上限，不是原生總memory/FPS。沒有延後死亡或碰撞/ATB/save改動。

同tick重畫不累加，pause保持phase；reduced不建立新殘影、既有者隱藏並可同tick還原。受擊中斷與copy分配失敗清理有回歸。24筆有限source/transform/texturehistory保留actualcopy指紋，不等於同步framebuffer或原速觀感。T不重構O已接受fieldcontroller。

## 六、完整測試與原生界線

Final **2748Node/0fail/0skip、531Python/0fail**；新增64Node/22Python含總數，asset/typecheck/buildpass。**562programinputs＋4rootdocs＝566frozeninputs**前後hash同，另THIRD_PARTY共567snapshot。三viewport、三敵種離線actualCPU body/death/half/expiry正向像素與到期exactS還原，logicalstate一致。13files47hunksourceinverse及missing/duplicate/unrelated負測試只處理歷史source，絕不轉native state/report/pixels。

初期44targeted22fail包含端點sign、原stroke/number資源期望及start/out未區分；修正後44再61pass。初次full2735pass10fail是3個partialWorld ports缺Tcontroller，加入實際controller保留原斷言，最後完整2748/531pass。原失敗logs/working包保留，不放寬門檻。TESTED_BATCH詳列完整結果。

Native在原rescue3戰鬥截圖後及原3勝利邊界追加6readonly觀察，原keys/routes/waits/screenshots/assertions/workflow保持。ExactT tests/rescue_enemy_body.py核source/tick/offset/statictexturecopy/resources；需actualpositivebodyaction，但缺完整deathphase須如實列缺口。Victory可能停表，不能造time或增加wait來湊完phase。S checkerdefault嚴格，T明列expected_build，舊N-R報告同理保持。

**CI91／36268788532** 唯一matching push/attempt1，最後queued/null，provider **2026-09-26T20:13:54Z**。**nativeRescueBodyVerified/nativeRescueDeathVerified=false**，未取得原始產物/Pages，不把unitpass或checker存在當nativeacceptance。

最新accepted仍是 **S／CI90／Pages84**：兩lane各1Yakra出手收招、guard/Yakra存活受擊；Naga/Hench出手缺樣本。十ledger177列、634原檔/source/HTML與七原ZIP回讀完成，CI90_CHECKPOINT closed。只檢視rescue07、CPUrescue06兩張fullsize，無其他PNG/contact/movie decode/play/listening/device。P原生完整倒地與Q受擊換目標缺口保持，不重驗CI90或舊批次。

## 七、接續與完整分母

先讀STATUS/checkpoint、main一次，只接CI91。Queued/in_progress保存接續點，不長輪詢、不另dispatch、不重送T。完成後核body原報告/六observations、S motion與R/Q/P/O/N、原main/nativechooser/CPU600救援審判/ledgers、matchingPages selectedsource/artifact/HTML；原ZIP/reports/video/exactsource/manifest指定Drive下載回驗後才boundedacceptance。只修實際terminal，不造正向證據。

T03全規則版本拓樸數值；T04完整成長報酬掉落經濟道具飾品學習換人雙三人技；T05全角色/敵人方向sprites及move/attack/hurt/down/death/實際遊玩、人物植物道具尺度輪廓／原作構圖、山道法庭壓縮／重疊樹列、合法完整音訊聆聽、原速走位淡化viewport；T06全時代主支線結局；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／雲端原產物回讀。先前M-S保持，T接受後亦不重做；前段品質優先，不因綠勾擴後段。

## 八、持久交付與限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。T final **1Smn-MRJWOYBkCIs4IpBjqLhOnHiiCuxX**，1584014bytes／SHA256 **9eca85a42008f673d58f86adb6153d0a73dac76444c31ece5a3703b8201a0532**，57manifest/567snapshot下載回驗。CI90 originals **1m2mgK_s_ASvNqi90nDers48HVUF9H-q8**，88784330bytes／SHA256 **1cc7ce19ad912545e1360232b2914b36e9912db5908d70421a0b857983921bc9**，七ZIP/13manifest下載回驗。詳DELIVERY_INDEX與保留歷史鏈。

Snapshot是assembled已測inputs，不是publishedGitarchive或目前docs。包內false/null與較早parent256a3d歷史，actualparentfcac31，T已發布不重送。Mainonly/nonforce/no branchPRparallelcandidate/multiwriter；no localbrowser/native game-time-save-collision造數，不放寬<.12/原ticks/routes/keys/waits/captures/assertions/single30s/250ms-256/CPUquality-memory。Toolchain1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules且保留esbuildhardlink，不覆source/config/bootstrapCI。私人ROM/media/fonts/credentials不公開。Docs[skip ci]/雲端回讀，臨時容器非權威；CI77/75failure與CI71歷史false不回填。
