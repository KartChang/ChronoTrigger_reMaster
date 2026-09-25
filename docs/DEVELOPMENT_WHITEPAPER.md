# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03m-ci84-accepted-handoff**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。歷史原收據、失敗與產物不改寫。

唯一repository **KartChang/ChronoTrigger_reMaster**、branch **main**，singleAI／non-force。Root **T05-early-visual-cohesion**，唯一development terminal **T05-field-foe-action-animation**。目前已發布source **32672b15a8df76ff243f7840ef95a9b8b817a052**、tree **e2584ffecb08463567c192e94aa6a9840cf2658a**、**VQ03M／0.9.60**。**CI84／Pages78已完成限定範圍接受**，不再等待CI，也不是完整動畫／美術核准。本次交接只完成證據核對、雲端保存與文件更新，未修改遊戲source/tests/assets/workflow，沒有新source、CI85、未發布candidate或active validation。M及更早批次不重送。

## 一、完整產品目標與品質

完整HD-2D重製：像素人物搭配立體場景，保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人與同機雙人共畫面，以及全部時代主支線與結局。先改善前段實際美術、建模、完整動畫、遮擋、HUD、操作與音訊，再擴後段；不縮成前段展示、不因CI綠勾提早擴章節。

整體>=90／各面向>=80%須由實際畫面、遊玩、裝置證據及required assets／five gates／zero critical支持。測試數量、文件完整度、新效果或匯出圖不是美術評分。原工具30/100屬舊runtime，不是M當前分數；release仍BLOCKED，無新score或全遊戲接受。

## 二、架構及不可變遊戲行為

保留TypeScript／Babylon.js／esbuild及固定package/lock，自含HTML供玩家執行不需要ROM、Python、帳號或後端。Controls→main固定1/60秒→core規則→render/HUD/audio；呈現不能決定傷害、資源、碰撞或劇情。CPU/WebGL共用場景與規則，不製造第二套低品質關卡。

暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間；InputBoundary清理舊輸入，A*遵守原碰撞。P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三保留；獨立選敵及雙確認合技保持，無P3、不改ARPG、不重造框架。

v1–v8存檔白名單與IndexedDB／JSON相容；未知舊行為不造證詞，查看不強制改寫。診斷、動畫快取、render/audio偏好不存入遊戲存檔；守恆檢查不是防作弊簽章。禁止native game/time/save/collision注入、改走位／sleep／tick／畫質以求通過；Node fixture與歷史pre-change port只能明示離線，不能冒充當前原生證據。

## 三、現有遊玩範圍與玩法缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇、項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門與2300抵達。**2300抵達不是完整未來篇**，所有時代主支線與結局仍須完成。

現有梅爾基歐13商品、武器／身體／頭部三裝備位、角色相容與份數、金幣庫存守恆、交易上限及裝備後戰鬥保持。400G、價格與普通攻防增減是明示暫定值，不冒稱原作完整數值；經驗紀錄不是完整成長。完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人與雙三人技仍在T04。

## 四、保留的前段呈現、CPU與相機

先嘗試WebGL2/1，失敗使用真正CPU triangle/texture/depth至Canvas2D。640×480pixel cap、最大邊1280、原tiers、32MiB／512entries及120活動FrameWindow不變。CPU不提供shadowmap/glow/specular/postprocess，不承諾GPU同品質或真機流暢；既有row-span／packed-clear與預設OFF的opaque-affine minification保留，alpha／透視nearest、關閉/dispose釋放mip。短窗口與Node benchmark不是原生長時間FPS認證。

既有角色固定tick／實際步伐／cache、接地、HUD／觸控、祭典道具材質、光照銅材質、root shadows、村莊detail／窗框玻璃、NPC原姿態和植物下肢保護保留。Held VQ01Z／母親家具不得提升、換管道或間接替換，prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

Town X/Y必要角色取景，Z招牌.30，A104mesh遮擋群組.16與9tick指數／12tick保持，B必要隊伍優先、地標1.5/1.6遲滯保留。C fieldenemy單一unlit emission、原drawImp及24×32nearest-alpha和五採樣保持；M僅明列新增手臂姿態，frame0仍原圖。D下肢保護與CPU透明背面修正、E/F NPC減少動態frame0/currenttick還原／隱藏停更／dispose，以及CI78同tick可逆camera偏好還原不重做。

H森林時門低對比地面／法庭石板及31薄飾面；I14法庭卡片以實際camera/pivot接地、7成人陪審員、15原樹卡；J原平台cap/edge及4樹冠變體；K山道512×448原路徑地面、64×64層狀岩壁及共用草面均保留。

L四岩台＋四草頂為8邊形切角，頂角退縮、底部最多裁.035，原AABB／位置／高度／caster及矩形碰撞導航不變；8mesh vertices/indices/UV確有改動，每個48vertices／28triangles，共+128triangles。原8樹卡共用272×80nearest-alpha atlas，4種未改J樹冠64×80、左右2透明欄，固定UV、無逐幀隨機或鏡像照明；mesh/material/texture數量不增，rawRGBA+66560bytes不是原生記憶體或FPS認證。L最終2302Node／416Python屬歷史批次，詳VQ03L_TESTED_BATCH，不算本輪新增。

## 五、G音訊及聆聽界線

7組自製合成音型、7段配樂保留，不取ROM／原OST／第三方採樣。每型<=3聲部、level總和<=.04、尾音<=.5秒，共用16聲部／master.55，單一audio-clock、不加timer，超額丟棄不排隊補播。Main原觸發點／dialog-hold立即停止保持，不延後對話以播放完整尾音。

部分graph／connect/start/stop失敗與dispose獨立清理，成功排程計數不回填；analyser1024Float32重用但讀真實訊號，hold不造零。現有原生music/analyser/hold/import/mute只支持實際測到的範圍；七音型unit和無音軌影片不是完整觸發、聆聽或裝置音量安全認證。M與本次文件交接未改音訊、主迴圈或戰鬥規則。

## 六、最新已接受CI84／Pages78

**CI84／36179274810**，M source **32672b15a8df76ff243f7840ef95a9b8b817a052**／tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，push／attempt1，provider updated **2026-09-25T19:56:43Z（台灣2026-09-26 03:56:43）**，completed/success。Validate108217405616、good108217405321、bad108217405728均success，原conditional skips保留；CPU600／救援／審判確實執行。

原主報告／chooser／完整旅程及十ledger **173列**，由未修改exactsource verifiers唯讀重算，逐byte相同；**589原始解壓regular files**前後hash不變，部署artifact.tar保留未再展開計入分母。Source archive重建Git root匹配，原報告不改。這不是重播browser或重跑M開發測試。

M新增三個原生觀察點由原tests/field_enemy_motion.py核tick/mode及實際RGBA：CPU山道tick1146 explore **[0,0,0]**，CPU森林tick883 explore **[1,0]**，opening WebGL戰鬥tick912 **[2,2,2]**。只正向驗證此處frame0／1／2；全部記錄hurtTick=null，**受擊frame3正向原生發生仍未驗證，不是已證明runtime錯誤**。Opening JSON在原05-canyon-battle.png之後，不能當逐幀同步。舊opening report無embedded source/run，以同run artifact、exactsource與原validate ledger綁定，不回填欄位。

**Pages78／36182739088** completed/success，provider updated2026-09-25T19:57:21Z；workflowhead10baa32b是文件，selectedCI84／sourceM／artifact **10884945541**。Playable/staged/deployed HTML **5748112bytes**，SHA256 **5e3a05697472e461a91cdcb4fb86c980e8fbf01549bd5133cee6ce7cd6f0504c** 相同；deploy108228869812 public exactHTTP step成功。沒有本機HTTP或browser重播。

視覺範圍：99CPU PNG＋原opening05，共 **100張聯絡表／4表**全部檢視；只有山道field、森林field、opening05 **3張全尺寸**，其他97只縮圖。原片 **181.76秒／19200790bytes／VP8 960×844**，SHA256 **2e2245a87b16335ef9490a9e09a7ffc03aca43214ef2e3dd79650f3e5975ecd5** 全decode exit0；全部 **364個連續2fps样本／6表**已檢視，無fullsize影片畫格、原速播放、音軌聆聽、真機或長時間接受。樣本可見城鎮走位／建物招牌淡化，但不足關閉原速舒適性。

**CI84_ACCEPTANCE.json** 是最新限定範圍收據，**CI84_CHECKPOINT.closed=true／accepted=true**。七原ZIP／48manifest／原片／exactsource／reports／review已存正確Drive並實際下載核對。CI84取代CI83／Pages77作最新基準；舊CI83收據與7ZIP保存不改，也不重驗。CI77／75 failure與CI71歷史accepted=false不回填。沒有全動畫、美術、原速、聆聽、裝置、長時間或全遊戲核准。

## 七、M前段小怪姿態、生命週期與原生觀察基礎

Runtime只修改render.ts，新增imp-motion.ts／field-enemy-motion.ts。四種手臂姿態：原靜止、待機抬臂、戰鬥準備、受擊張臂。Frame0逐byte等於原drawImp24×32；臉部、腳底、原調色盤與C五像素採樣不變，原位置、幾何與尺度保持。這不是完整方向移動／攻擊／死亡動畫，也不是原作動畫時序認證；本輪不重做M。

待機依(tick+index×37)%180，最後30ticks抬臂；戰鬥依24tick節拍及index×11偏移切換準備／抬臂。受擊僅依原已交付且唯一命中活著小怪的player/guest/combo hit位置顯示18ticks，不虛構敵人攻擊來源、不將healing當受擊。減少動態回原frame0但保留必要傷害文字等回饋；固定tick不額外推進時間。倒退、換state與非戰鬥清除暫態hit，恢復按當前tick、不補播。

只在可見且畫格改變時更新原texture；同場景state rebase保留實際物理畫格cache以免隱藏重畫或可見恢復錯畫。原章節進場drawImp及upload保留，seedOriginal只記錄，不重複frame0 upload。隱藏／死亡／停用不加姿態更新，dispose清references，零新增mesh/material/texture。唯讀fieldEnemyMotion含frame/tick/cell/實際RGBA，uploads明示pose-changes-only，不含原entry uploads。

M原CPU field capture同一次evaluate追加motion，原PNG與Cgate維持，PNG保存後才新增獨立gate；opening原05-canyon-battle.png之後加一次readonly JSON，先存field-enemy-battle-motion.json再斷言。原按鍵／路線／等待／截圖／budget均未改，但兩處harness是明示追加。CI84已驗證實際觀察點，不把Node ports算native，也不把它擴張成frame3正向證據。

## 八、既有M最終測試與界線

前輪final **2333Node通過、零失敗／零跳過；424Python通過**，新31Node＋8Python包含於總數；31Mtargetedpass、pre-M兩姿態RGBA新斷言在舊L確實fail。完整check/assets/typecheck/build/diff通過，500非文件程式輸入前後／發布前不變；504assembledsnapshot另含4rootdocs。三viewport、原state/camera/geometry/palette、pause/reduced精確還原、hidden/dead/dispose/rewind/rebase與相同原版lab往返順序有回歸。**本次交接未重跑這組開發測試，不能算本輪新增測試數。**

四姿態PNG經獨立chunkCRC／Pillow／runtimeRGBA核對，frame0PNG等原imp.png，匯出仍review-not-approved。Production observer scripts先前在Node CPU port與獨立Python checker的canyon/forest/battle檢查屬離線；本輪的原生結果僅如第六節。先前已看姿態聯絡表與離線542×361圖，不能代替原速觀感。

13檔36精確source-only M inverse片段保留原whole-file hashes與missing/duplicate/unrelated負測試，Node/Python一致；L/G/F歷史輸入只去除明列M片段，currentM獨立測，native state/PNG/report不轉換。初始partialunitport缺controller、capture替身缺motion與G/L/F來源問題failure logs保留。Lab首入與返回61pixel差異在原L同樣存在，新舊同順序差0，未增加容差；去掉隱藏重畫及重複entry後已完整重跑。詳細 **VQ03M_TESTED_BATCH.json** 為開發歷史收據，不作最新CI狀態authority。

## 九、直接續作與完整剩餘工作

本輪CI84驗收已結案，**直接執行T05_ANIMATION_CHECKPOINT.remainingWork**。開始只讀STATUS及此新checkpoint，main确认一次；不要再查CI84/Pages78或重算十ledger，不重送M。

先續既有完整角色／敵人動作動畫與受擊正向原生證據，入口src/field-enemy-motion.ts、src/imp-motion.ts、src/render.ts及src/core.ts相關action／Effect／damageAlly。**現有敵方hit只記錄受擊目標，不識別敵人攻擊者；不能從目標猜攻擊者或造事件。** 任何動作呈現必須由真實既有action支持，不改傷害、ATB、死亡時間、碰撞、存檔schema或原生路線來取得漂亮證據。Frame3未觀察是證據缺口，不直接當作需重寫M的故障。

將可完成的相關動畫實作、資源生命週期、pause/reduced/rebase與原場景/配色回歸合批，完整check後一次non-force source，再辨識唯一matchingCI。若CI仍queued/in_progress，保存接續點，不輪詢至中斷、不另外dispatch。本輪沒有新source／CI85／active validation。

其後續廣泛人物／植物／道具尺度輪廓與原作構圖、山道／法庭壓縮空間及重疊樹列、完整合法音訊／實際聆聽、原速走位／淡化／viewport舒適性。M四手臂姿態不關閉全動畫；不重做L/K/J/I/H或提早擴後段。

T03完整隱含規則／版本差異／全拓樸與數值忠實；T04完整成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊，前段品質優先；T06所有時代主支線結局，2300抵達非完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／原始產物雲端回讀。分母不縮。

## 十、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
最新原始證據 **Chrono-CI84-reviewed-evidence.zip／1k-EnihB3KS3k1791bR3rAZXVzhPVhucx**，**91590088bytes**，SHA256 **2ecd1b7a1f2696722106a36266a53fb42dd5bf24d7e180e36f9fdc2abddbd288**；七未改原ZIP、48manifest、原片、exactsource、reports/review已實際下載核parent/size/hash/外內CRC/manifest。Source恢復：originals/CI84-browser-evidence.zip內source-32672b15a8df76ff243f7840ef95a9b8b817a052.tar.gz。Archive內舊docs不得覆蓋目前進度。

M包 **Chrono-VQ03M-field-foe-motion-tested.zip／1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes，SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**；25差異／504snapshot／90manifest／完整與失敗logs／offline／exports沿用既有下載回驗。根program-snapshot.tar.gz為assembled已測程式，不是publishedGitarchive／最新docs，封裝前false/null不重送M。CI83及L/K/J等恢復點保留DELIVERY_INDEX，臨時容器不是權威。

Main only/non-force/no branch/PR/平行candidate／多人防撞。Held家具不提升／間接替換，prologue blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser或native game/time/save/collision造數，不放寬<.12、原tick、單一30秒、250ms/256、CPU畫質記憶體。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**／原媒體／字型／憑證不公開。文件[skip ci]，成果存回指定雲端並回讀。
