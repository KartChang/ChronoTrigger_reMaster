# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03m-ci84**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI84_CHECKPOINT；歷史原收據、失敗與產物不改寫。

唯一repository **KartChang/ChronoTrigger_reMaster**、branch **main**，singleAI／non-force。Root **T05-early-visual-cohesion**，terminal **CI84-field-foe-motion-evidence**。目前 **VQ03M／0.9.60** source **32672b15a8df76ff243f7840ef95a9b8b817a052**，tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，parent **86dbf83505a8da7f9b839f6d654a735c287124c2**。25程式／測試檔一次發布，完整root與已測程式＋當時main docs67df40799bd6a34e2141a690b1ce52ecc35ec42c一致並回讀。Matching **CI84／36179274810**，push/attempt1，last observed in_progress/null，provider updated2026-09-25T19:22:38Z（台灣2026-09-26 03:22:38）。M尚未原生接受；CI83／Pages77是最新有界基準，不重驗或重送L/M。

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

L四岩台＋四草頂為8邊形切角，頂角退縮、底部最多裁.035，原AABB／位置／高度／caster及矩形碰撞導航不變；8mesh vertices/indices/UV確有改動，每個48vertices／28triangles，共+128triangles。原8樹卡共用272×80nearest-alpha atlas，4種未改J樹冠64×80、左右2透明欄，固定UV、無逐幀隨機或鏡像照明；mesh/material/texture數量不增，rawRGBA+66560bytes不是原生記憶體或FPS認證。L最終2302Node／416Python屬歷史批次，詳VQ03L_TESTED_BATCH，不算M新增。

## 五、G音訊及聆聽界線

7組自製合成音型、7段配樂保留，不取ROM／原OST／第三方採樣。每型<=3聲部、level總和<=.04、尾音<=.5秒，共用16聲部／master.55，單一audio-clock、不加timer，超額丟棄不排隊補播。Main原觸發點／dialog-hold立即停止保持，不延後對話以播放完整尾音。

部分graph／connect/start/stop失敗與dispose獨立清理，成功排程計數不回填；analyser1024Float32重用但讀真實訊號，hold不造零。現有原生music/analyser/hold/import/mute只支持實際測到的範圍；七音型unit和無音軌影片不是完整觸發、聆聽或裝置音量安全認證。M未改音訊、主迴圈或戰鬥規則。

## 六、最新已接受CI83／Pages77

CI83 **36169357410**，sourceL897823dbb73401e453913497f08b96a56cef4109／tree264d4c14534132bbc981b6edee63fffa1ce18af8，provider updated2026-09-25T18:10:53Z completed/success。Validate108184832005、good108184832242、bad108184832506均success，條件skip保留；CPU600／救援／審判確實執行。原主報告／chooser／十ledger173列以同source唯讀重算逐byte相同，580原檔不改，sourcearchive root匹配，fair-vendors before/restored PNG相同。

Pages77 **36171776438**，workflowhead faf81e73為文件；selectedCI83/sourceL/artifact10881020674。Playable/staged/deployed HTML **5744867bytes**／SHA256 **4fed5cc782a623338f9dd30b3675363ce8d08b9e2572d466b9058c4bbae00cd2** 相同，public exactHTTP provider step成功，無本機HTTP/browser重播。

102原圖以4contact sheets檢視，山道／法庭reduced／森林時門reduced3張全尺寸，其餘99僅縮圖；169.28秒原片18161348bytes／SHA256 **f5d2215f0600ec7b6978521e3149678965c81b1be75d7a8763db01d7974324a8** 全解碼，339連續2fps樣本／6表已看。無fullsize影片樣本、原速播放、音軌聆聽、真機或長時間接受。切角面與樹冠差異可見，山道／法庭壓縮構圖、森林重疊仍是缺口。

**CI83_ACCEPTANCE.json** 在parent **86dbf83505a8da7f9b839f6d654a735c287124c2** 提交並回讀；七原ZIP已雲端保存並下載驗證。CI83取代CI82作最新有界技術基準；CI82及更早工作不重驗，CI77／75 failure、CI71歷史accepted=false不回填。CI84尚不可拿此收據代替。

## 七、M前段小怪姿態、生命週期與原生觀察

Runtime只修改render.ts，新增imp-motion.ts／field-enemy-motion.ts。四種手臂姿態：原靜止、待機抬臂、戰鬥準備、受擊張臂。Frame0逐byte等於原drawImp24×32；臉部、腳底、原調色盤與C五像素採樣不變，原位置、幾何與尺度保持。這不是完整方向移動／攻擊／死亡動畫，也不是原作動畫時序認證。

待機依(tick+index×37)%180，最後30ticks抬臂；戰鬥依24tick節拍及index×11偏移切換準備／抬臂。受擊僅依原已交付且唯一命中活著小怪的player/guest/combo hit位置顯示18ticks，不虛構敵人攻擊來源、不將healing當受擊。減少動態回原frame0但保留必要傷害文字等回饋；固定tick不額外推進時間。倒退、換state與非戰鬥清除暫態hit，恢復按當前tick、不補播。

只在可見且畫格改變時更新原texture；同場景state rebase保留實際物理畫格cache以免隱藏重畫或可見恢復錯畫。原章節進場drawImp及upload保留，seedOriginal只記錄，不重複frame0 upload。隱藏／死亡／停用不加姿態更新，dispose清references，零新增mesh/material/texture。唯讀fieldEnemyMotion含frame/tick/cell/實際RGBA，uploads明示pose-changes-only，不含原entry uploads。

原CPU field capture同一次evaluate追加motion，原PNG與Cgate維持，PNG保存後才新增獨立gate；原opening 05-canyon-battle.png之後加一次readonly JSON，先存field-enemy-battle-motion.json再斷言。原按鍵／路線／等待／截圖／budget均未改，但兩處harness是明示追加，不宣稱整個檔案未變。新JSON晚於截圖，不能當逐幀同步；受擊正向原生發生目前未證明。完整matchingCI84必須核這些實際資料，不能拿Node ports造native通過。

## 八、M最終測試與明確界線

Final **2333Node通過、零失敗／零跳過；424Python通過**，新31Node＋8Python包含於總數，31Mtargetedpass、pre-M兩姿態RGBA新斷言在舊L確實fail。完整check/assets/typecheck/build/diff通過，500非文件程式輸入前後／發布前不變；504assembledsnapshot另含4rootdocs。三viewport、原state/camera/geometry/palette、pause/reduced精確還原、hidden/dead/dispose/rewind/rebase與相同原版lab往返順序有回歸。

四姿態PNG經獨立chunkCRC／Pillow／runtimeRGBA核對，frame0PNG等原imp.png，匯出仍review-not-approved。Production observer scripts在Node CPU port與獨立Python checker的canyon/forest/battle正向檢查是離線驗證；無本機browser、新原生或聆聽認證。已看四姿態聯絡表與canyon-after離線542×361圖（requested678×452），Node不畫文字／曲線，不能代替原速觀感。

13檔36精確source-only M inverse片段保留原whole-file hashes與missing/duplicate/unrelated負測試，Node/Python一致；L/G/F歷史輸入只去除明列M片段，currentM獨立測，native state/PNG/report不轉換。初始partialunitport缺controller、capture替身缺motion與G/L/F來源問題的failure logs保留。Lab首入與返回61pixel差異在原L同樣存在，新舊同順序差0，未增加容差。去掉隱藏重畫和重複entry uploads後最終全套重跑；不是只驗新增測試。詳細 **VQ03M_TESTED_BATCH.json**。

## 九、目前驗收與完整剩餘工作

直接完成CI84_CHECKPOINT.remainingReview，續作只查exactrun一次；active保存，不久等或重送M。完成後核原三jobs／全部主報告／chooser／CPU600救援審判／十ledger，特別CPUfield motion與opening戰鬥JSON的tick/mode/frame/實際pixels、原C和各場景reduced/state/quality/resource門檻、G音訊回歸。原圖原片明列fullsize/contact/sample；matchingPages selectedsource/run/artifact/HTML/publicHTTP及指定Drive原檔保存下載回讀後才有界接受。失敗只修同root真實缺口，不改斷言或路線時間畫質。

成功後續完整角色敵人動畫、廣泛人物／植物／道具尺度輪廓與原作構圖、山道／法庭壓縮空間及樹木重疊、完整合法音訊／實際聆聽、原速走位／淡化／viewport舒適性。M四手臂姿態不關閉全動畫，不重做已接受L/K/J/I/H或提早擴後段。

T03完整隱含規則／版本差異／全拓樸與數值忠實；T04完整成長／報酬掉落／經濟道具飾品／角色學習換人／雙三人技；T05全部美術建模動畫合法音訊，前段品質優先；T06所有時代主支線結局，2300抵達非完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整測試／一次source／完整matchingCI／原始產物雲端回讀。分母不縮，無全美術、原速、聆聽、真機、長時間或全遊戲認證。

## 十、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。M包 **Chrono-VQ03M-field-foe-motion-tested.zip／1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes／SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**，25差異／504snapshot／90manifest／完整與失敗logs／offline／exports已實際下載核parent/size/hash/CRC/tar。封裝前false/null屬歷史，最新publishedsource/root/run在GitHub收據，不能重送或覆蓋進度。

CI83原包 **Chrono-CI83-reviewed-evidence.zip／1hjxKhDgg7P4bcU-WxH8SRsfyG4ykMJee**，90790903bytes／SHA256 **eb8e1029f9b9be4641f0ddc7357518c732f012527a0e1046a1cc349a35383b2d**，7未改原ZIP／exactsource/movie/reports/review／39manifest已存同folder並實際下載核對。L及CI82、更早恢復點保留DELIVERY_INDEX，臨時容器不是權威。

Main only/non-force/no branch/PR/平行candidate／多人防撞。Held家具不提升／間接替換，prologue blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser或native game/time/save/collision造數，不放寬<.12、原tick、單一30秒、250ms/256、CPU畫質記憶體。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules並保留esbuildhardlink，不覆舊source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM／原媒體／字型／憑證不公開；文件[skip ci]，成果存回指定雲端並回讀。
