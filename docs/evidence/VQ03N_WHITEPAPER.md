# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03n-ci85-validation**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。歷史原收據、失敗與產物不改寫。

唯一repository **KartChang/ChronoTrigger_reMaster**、branch **main**，singleAI／non-force。Root **T05-early-visual-cohesion**，唯一development terminal **T05-field-foe-action-animation**。最新published **VQ03N／0.9.61** source **517426f3979244ce9ae2bcddc5a0518533e1500b**、tree **bbea6d5ff42cd634518b61b5bf78d6003e46e5e2**。一次21檔source提交與遠端tree回讀完成，**CI85／36195520068**唯一matching push/attempt1，觀察為 **in_progress**，provider updated **2026-09-25T22:12:10Z**。N不是已接受版本，沒有未發布candidate，不重送或另dispatch。

最新有界接受基準仍是 **M／CI84／Pages78**，M source32672b15a8df76ff243f7840ef95a9b8b817a052、treee2584ffecb08463567c192e94aa6a9840cf2658a。第六至八節為既有結案／開發歷史，本輪沒有查CI84、重算其ledger或回填接受。N內容與待驗界線在第九節。

## 一、完整產品目標與品質

完整HD-2D重製：像素人物搭配立體場景，保留原作辨識度、世界背景、場景構圖、縮尺大地圖、城鎮／室內切換、原地ATB、單人與同機雙人共畫面，以及全部時代主支線與結局。先改善前段實際美術、建模、完整動畫、遮擋、HUD、操作與音訊，再擴後段；不縮成前段展示、不因CI綠勾提早擴章節。

整體>=90／各面向>=80%須由實際畫面、遊玩、裝置證據及required assets／five gates／zero critical支持。測試數量、文件完整度、新效果或匯出圖不是美術評分。原工具30/100屬舊runtime，不是N當前分數；release仍BLOCKED，無新score或全遊戲接受。

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

部分graph／connect/start/stop失敗與dispose獨立清理，成功排程計數不回填；analyser1024Float32重用但讀真實訊號，hold不造零。現有原生music/analyser/hold/import/mute只支持實際測到的範圍；七音型unit和無音軌影片不是完整觸發、聆聽或裝置音量安全認證。M與N均未改音訊、主迴圈或戰鬥傷害／ATB規則。

## 六、最新已接受CI84／Pages78 — 歷史收據不重驗

**CI84／36179274810**，M source **32672b15a8df76ff243f7840ef95a9b8b817a052**／tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，push／attempt1，provider updated **2026-09-25T19:56:43Z（台灣2026-09-26 03:56:43）**，completed/success。Validate108217405616、good108217405321、bad108217405728均success，原conditional skips保留；CPU600／救援／審判確實執行。

原主報告／chooser／完整旅程及十ledger **173列**，由未修改exactsource verifiers唯讀重算，逐byte相同；**589原始解壓regular files**前後hash不變，部署artifact.tar保留未再展開計入分母。Source archive重建Git root匹配，原報告不改。這不是重播browser或重跑M開發測試。

M新增三個原生觀察點由原tests/field_enemy_motion.py核tick/mode及實際RGBA：CPU山道tick1146 explore **[0,0,0]**，CPU森林tick883 explore **[1,0]**，opening WebGL戰鬥tick912 **[2,2,2]**。只正向驗證此處frame0／1／2；全部記錄hurtTick=null，**受擊frame3正向原生發生仍未驗證，不是已證明runtime錯誤**。Opening JSON在原05-canyon-battle.png之後，不能當逐幀同步。舊opening report無embedded source/run，以同run artifact、exactsource與原validate ledger綁定，不回填欄位。

**Pages78／36182739088** completed/success，provider updated2026-09-25T19:57:21Z；workflowhead10baa32b是文件，selectedCI84／sourceM／artifact **10884945541**。Playable/staged/deployed HTML **5748112bytes**，SHA256 **5e3a05697472e461a91cdcb4fb86c980e8fbf01549bd5133cee6ce7cd6f0504c** 相同；deploy108228869812 public exactHTTP step成功。沒有本機HTTP或browser重播。

視覺範圍：99CPU PNG＋原opening05，共 **100張聯絡表／4表**全部檢視；只有山道field、森林field、opening05 **3張全尺寸**，其他97只縮圖。原片 **181.76秒／19200790bytes／VP8 960×844**，SHA256 **2e2245a87b16335ef9490a9e09a7ffc03aca43214ef2e3dd79650f3e5975ecd5** 全decode exit0；全部 **364個連續2fps样本／6表**已檢視，無fullsize影片畫格、原速播放、音軌聆聽、真機或長時間接受。樣本可見城鎮走位／建物招牌淡化，但不足關閉原速舒適性。

**CI84_ACCEPTANCE.json** 是最新限定範圍收據，**CI84_CHECKPOINT.closed=true／accepted=true**。七原ZIP／48manifest／原片／exactsource／reports／review已存正確Drive並實際下載核對。CI84取代CI83／Pages77作最新基準；舊CI83收據與7ZIP保存不改，也不重驗。CI77／75 failure與CI71歷史accepted=false不回填。沒有全動畫、美術、原速、聆聽、裝置、長時間或全遊戲核准。

## 七、M前段小怪姿態、生命週期與原生觀察基礎

M當時runtime只修改render.ts，新增imp-motion.ts／field-enemy-motion.ts。四種手臂姿態：原靜止、待機抬臂、戰鬥準備、受擊張臂。Frame0逐byte等於原drawImp24×32；臉部、腳底、原調色盤與C五像素採樣不變，原位置、幾何與尺度保持。這不是完整方向移動／攻擊／死亡動畫，也不是原作動畫時序認證；N不重做M基礎。

待機依(tick+index×37)%180，最後30ticks抬臂；戰鬥依24tick節拍及index×11偏移切換準備／抬臂。受擊僅依原已交付且唯一命中活著小怪的player/guest/combo hit位置顯示18ticks，不虛構敵人攻擊來源、不將healing當受擊。減少動態回原frame0但保留必要傷害文字等回饋；固定tick不額外推進時間。倒退、換state與非戰鬥清除暫態hit，恢復按當前tick、不補播。

只在可見且畫格改變時更新原texture；同場景state rebase保留實際物理畫格cache以免隱藏重畫或可見恢復錯畫。原章節進場drawImp及upload保留，seedOriginal只記錄，不重複frame0 upload。隱藏／死亡／停用不加姿態更新，dispose清references，零新增mesh/material/texture。唯讀fieldEnemyMotion含frame/tick/cell/實際RGBA，uploads明示pose-changes-only，不含原entry uploads。

M原CPU field capture同一次evaluate追加motion，原PNG與Cgate維持，PNG保存後才新增獨立gate；opening原05-canyon-battle.png之後加一次readonly JSON，先存field-enemy-battle-motion.json再斷言。原按鍵／路線／等待／截圖／budget均未改，但兩處harness是明示追加。CI84已驗證實際觀察點，不把Node ports算native，也不把它擴張成frame3正向證據。

## 八、M歷史最終測試與界線

M final **2333Node通過、零失敗／零跳過；424Python通過**，新31Node＋8Python包含於M總數；31Mtargetedpass、pre-M兩姿態RGBA新斷言在舊L確實fail。完整check/assets/typecheck/build/diff通過，500非文件程式輸入前後／發布前不變；504assembledsnapshot另含4rootdocs。三viewport、原state/camera/geometry/palette、pause/reduced精確還原、hidden/dead/dispose/rewind/rebase與相同原版lab往返順序有回歸。這些數字是M歷史收據，不算N新增測試；N本輪完整回歸另列下一節。

四姿態PNG經獨立chunkCRC／Pillow／runtimeRGBA核對，frame0PNG等原imp.png，匯出仍review-not-approved。Production observer scripts先前在Node CPU port與獨立Python checker的canyon/forest/battle檢查屬離線；M的原生結果僅如第六節。先前已看姿態聯絡表與離線542×361圖，不能代替原速觀感。

13檔36精確source-only M inverse片段保留原whole-file hashes與missing/duplicate/unrelated負測試，Node/Python一致；L/G/F歷史輸入只去除明列M片段，native state/PNG/report不轉換。初始partialunitport缺controller、capture替身缺motion與G/L/F來源問題failure logs保留。Lab首入與返回61pixel差異在原L同樣存在，新舊同順序差0，未增加容差；去掉隱藏重畫及重複entry後已完整重跑。詳細 **VQ03M_TESTED_BATCH.json** 為開發歷史收據，不作最新CI狀態authority。

## 九、N本輪實作、完整回歸及唯一CI85

**VQ03N／0.9.61 source517426f3979244ce9ae2bcddc5a0518533e1500b** 已一次non-force發布，tree **bbea6d5ff42cd634518b61b5bf78d6003e46e5e2**。21檔source/tests/build/workflow明列改動；遠端四個program subtree匹配frozen已測內容，原main文件保留。無平行candidate，不重送N。

core只在原真實敵方damageAlly交付事件附EnemyAction的index/tick/origin/target，限canyon／forest呈現；從實際attacker取得index，不從受擊者猜。傷害、ATB、死亡時機、碰撞與v1–v8保存規則不變。N source-only精確inverse把明列四段metadata改動還原至M whole-file hash；四場景逐tick全state/effects（扣除此metadata）及敗北/致命/存檔比對一致，不轉換native證據。

新增 **imp-action.ts** frame4 strike／frame5 follow-through，age0–7／8–15 ticks，16–23回準備frame2，24後回原phase；受擊18tick優先、reducedframe0。M0–3委派原函式，臉腳/Cpalette/24×32保持；不是預判蓄力、方向移動或死亡動畫。src/imp-motion.ts、render.ts、pixel-art.ts、InputBoundary與held prologue原bytes不變。

FieldEnemyMotion只接同State、真實living source及正確origin/target/tick事件，過期/矛盾/重複/無source的敵hit不得猜動作。保留cache/reduced/pause/hidden/dead/rebase/dispose；最多24筆detached歷史逐姿態讀實際textureRGBA與cause，無新mesh/material/texture。History scope是 **actual-texture-after-pose-update-not-framebuffer**，不是畫面截圖同步或舒適性證明。

新增獨立 **tests/field_enemy_action_browser.py**，原opening／CPU／救援／審判routes/keys/waits/captures/assertions不動。相同正常opening前段進山道後，P1普通攻擊30令48HP→18HP，等自然enemy ATB出手，要求livingframe3與同一來源事件frame4/5。它不注入native game/time/save/collision state、不延後死亡；PNG在觀察後，不聲稱逐幀同步。仍須matching CI原始report／RGBA才有正向native證據，現在 **nativeRecoilVerified=false、nativeAttackVerified=false**。

本輪frozen完整 **npm run check exit0，2360Node／0fail／0skip，434Python／0fail，asset/typecheck/build通過**；新增27Node＋10Python已含總數。Node124616.323744ms／Python5.121s。相同tick/cache/reduced、無效事件、palette/geometry、save/ATB、hidden/death、rebase/dispose與boundedhistory測試通過；offline CPU不是native。早期三Node fixture/sourceguard問題與Python sourceguard/prefix問題修正後全過，失敗logs仍保存；原whole-file hashes靠嚴格宣告inverse保留，原路線／門檻無放寬。詳 **VQ03N_TESTED_BATCH.json**。

唯一 **CI85／36195520068**，workflow360357259／.github/workflows/ci.yml／push／attempt1／sourceN；exact SHA全event/state只有1run，回讀in_progress，provider updated2026-09-25T22:12:10Z。**CI85_CHECKPOINT accepted=false/closed=false**。本機browser未執行，raw artifacts／matching Pages尚未核對或雲端保存。Pending不是failure或acceptance，不長時間輪詢或另dispatch。

## 十、直接續作與完整剩餘工作

只讀STATUS與 **T05_ANIMATION_CHECKPOINT.remainingWork**，main一次，接唯一CI85；不重驗CI84／Pages78、不重算舊ledger、不重送M/N。CI85完成後先核field-enemy-action原report、recoil/action observations及PNG，使用exact N checker唯讀核source/build/真實來源/tick/HP/RGBA；再核三jobs/原主報告/chooser/完整CPU600救援審判與same-source ledgers，成功時核matching Pages原HTML來源。原始ZIP/reports/影片/source/manifest存指定Drive實際回讀後才寫有界接受；失敗只修實際terminal，不改原規則/路線/門檻求通過。

其後繼續既有完整角色／敵人方向移動、攻擊／受擊／死亡動畫及實際遊玩證據；M四手臂姿態＋N兩姿態不等於全動畫。再續廣泛人物／植物／道具尺度輪廓與原作構圖、山道／法庭壓縮空間及重疊樹列、完整合法音訊／實際聆聽、原速走位／淡化／viewport舒適性。不重做已完成L/K/J/I/H/M基礎，不提早擴後段。

T03完整隱含規則／版本差異／全拓樸與數值忠實；T04完整成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊，前段品質優先；T06所有時代主支線結局，2300抵達非完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／matchingCI／原始產物雲端回讀。分母不縮，沒有新全遊戲或品質核准。

## 十一、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

最新N已測包 **Chrono-VQ03N-field-foe-action-tested.zip／1G_CAXzv-aWc18UzKO3bNWafAhTbecnd2**，1072604bytes，SHA256 **d6aa83145205e835a6ba0732b336c625edf6da194f2bcef37f71af11027d63d1**；實際下載核parent/size/hash/CRC、31manifest與510snapshot（509非文件inputs＋原THIRD_PARTY），含全部21改動及完整/初始失敗logs。不是publishedGitarchive或最新docs，包內prepublication false/null在發布後只是歷史；source/CI狀態以main receipt與checkpoint為準，不重送N。CI85原始證據尚待產生並保存。

最新已接受原始證據 **Chrono-CI84-reviewed-evidence.zip／1k-EnihB3KS3k1791bR3rAZXVzhPVhucx**，**91590088bytes**，SHA256 **2ecd1b7a1f2696722106a36266a53fb42dd5bf24d7e180e36f9fdc2abddbd288**；七未改原ZIP、48manifest、原片、exactsource、reports/review沿用先前完整回讀。本輪只為恢復source核整包hash，不重驗收。Source恢復：originals/CI84-browser-evidence.zip內source-32672b15a8df76ff243f7840ef95a9b8b817a052.tar.gz；archive內舊docs不得覆蓋目前進度。

M包 **Chrono-VQ03M-field-foe-motion-tested.zip／1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes，SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**；25差異／504snapshot／90manifest／完整與失敗logs／offline／exports沿用既有回驗。根program-snapshot.tar.gz不是publishedGitarchive／最新docs，false/null不重送M。所有更早恢復點逐byte封存於CI84_DELIVERY_INDEX，從目前DELIVERY_INDEX連入，不作目前狀態authority。

Main only/non-force/no branch/PR/平行candidate／多人防撞。Held家具不提升／間接替換，prologue blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser或native game/time/save/collision造數，不放寬<.12、原tick、單一30秒、250ms/256、CPU畫質記憶體。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**／原媒體／字型／憑證不公開。文件[skip ci]，成果存回指定雲端並回讀。
