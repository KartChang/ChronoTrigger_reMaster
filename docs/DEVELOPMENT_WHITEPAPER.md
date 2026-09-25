# ChronoTrigger reMaster 開發白皮書

版本product-vq03l-ci83。動態authority為STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/CI83_CHECKPOINT；歷史收據／失敗／原產物不改寫。

Repository **KartChang/ChronoTrigger_reMaster**，唯一 **main**；single AI／non-force。Root **T05-early-visual-cohesion**，terminal **CI83-canyon-relief-evidence**。目前 **VQ03L／0.9.59** source **897823dbb73401e453913497f08b96a56cef4109**，source tree **264d4c14534132bbc981b6edee63fffa1ce18af8**，parent **1f0492959069b6219105da7d7986b3fa4277b94b**。17程式／測試檔已一次發布並回讀；完整Git root等於已測程式加當時main docs tree **487c777c89e4ba32667db45400a5c1c6fd6e43b9**。L/K/J及更早批次不重送。

Matching **CI83／36169357410**，workflow360357259/.github/workflows/ci.yml，push/attempt1，發布後一次觀察 **in_progress/null**，provider updated **2026-09-25T17:47:51Z（台灣2026-09-26 01:47:51）**。Exact source全event/state共1run，沒有extra dispatch/rerun。未讀CI83 jobs/artifacts、未matchingPages接受、L accepted=false。續作只查exactrun一次；仍active保存checkpoint，不輪詢到中斷。

## 一、完整產品目標與品質

完整HD-2D重製：像素人物搭配立體場景，原作辨識度／世界背景／構圖、縮尺大地圖、城鎮與室內切換、原地ATB、單人和同機雙人共畫面、全部時代主支線與結局。先改善前段實際美術、建模、完整動畫、遮擋、HUD、操作和音訊，再擴後段。完整目標不縮成展示，CI綠勾／測試數量不能換成美術分數。整體>=90／各面向>=80%須由實際畫面、遊玩、裝置證據及requiredassets/fivegates/zerocritical支持；目前無新score或全遊戲接受。

## 二、架構及不變遊戲行為

TypeScript/Babylon/esbuild與固定package/lock保留，自含HTML供玩家執行不需要ROM/Python/後端。Controls→main固定1/60秒→core規則→render/HUD/audio；呈現不能決定傷害、資源、碰撞、劇情。CPU與WebGL共用場景規則，不造第二套低品質關卡。

暫停、背景、對話、背包、原生選檔及context loss凍結模擬；恢復不補跑背景時間。InputBoundary清理舊輸入、A*遵守碰撞。P1克羅諾/P2依故事、自主第三、獨立選敵及雙確認合技維持；沒有P3／ARPG。v1–v8存檔白名單與IndexedDB/JSON相容，未知舊行為不造證詞，查看不強制改写。診斷與render/audio偏好不存入遊戲；守恆檢查不是防作弊簽章。

禁止native game/time/save/collision注入，禁止改走位/sleep/tick/畫質以通過。Node fixture只能明示離線，歷史pre-change port不能冒充當前原生畫面。

## 三、目前遊玩範圍與缺口

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇、項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門及2300抵達。2300抵達不是完整未來篇，後續全時代主支線與結局未完成。

現有13商品、三裝備位、相容與份數、金幣庫存守恆、交易上限／裝備戰鬥保留。400G與價格／普通攻防增減是明示暫定值，經驗紀錄不是完整成長系統。完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人、雙三人技仍按T04完成。

## 四、保留的前段呈現與CPU

先嘗試WebGL2/1，失敗採真正CPU triangle/texture/depth至Canvas2D；640×480pixelcap／最大邊1280／原tiers／32MiB和512entries／120活動FrameWindow不變。CPU不提供shadowmap/glow/specular/postprocess，不承諾與GPU同品質或真機流暢。既有row-span/packed-clear、預設OFF的opaque-affine minification保留；alpha與透視nearest，關閉/dispose釋放mip。短窗口與Node benchmark不是長時間FPS認證。

既有角色固定tick動畫／實際步伐與cache、接地、HUD/觸控、祭典材質、光照銅材質／rootshadows、村莊detail、玻璃窗、NPC原四姿勢、plant遮擋及heldhome規則保留。Town X/Y必要角色取景、Z招牌.30、A104mesh遮擋.16與9tick/12tick保持、B必要隊伍優先與地標1.5/1.6遲滯不重做。C fieldenemy單一unlitemission與原drawImp24×32nearestalpha保留。D下肢保護與透明背面修正，E/F NPC減少動態frame0/currenttick還原／隱藏停更／dispose，CI78同tick可逆camera偏好還原皆保留。

H森林地面／法庭低對比石板及31薄飾面；I14法庭卡actualcamera/pivot腳底錨定、7成人陪審員、15原樹卡；J原平台cap/edge與4樹冠變體；K山道512×448原路徑、64×64層岩／共用草面都已发布並沿用既有有界接受，不因L重新製作。L只改下節明列的8mesh輪廓与8樹卡UV／atlas，沒有改heldhome或這些遊戲規則。

## 五、G音訊保留與聆聽界線

7組自製合成音型與7段配樂保留，不取ROM/原OST/第三方採樣。每型<=3聲部、level總和<=.04、尾音<=.5秒，共用16聲部/master.55，單audio-clock無timer，超額丟棄不排隊補播。Main觸發點／dialog-hold立即停止不變，不延後對話以求聲音完整。部分graph／connect/start/stop失败與dispose獨立清理，成功排程計數不回填；analyser1024Float32重用但讀真實值，hold不造零。現有原生music/analyser/hold/import/mute支持的是實際測到的範圍；七音型unit及無音軌影片不是完整觸發、聆聽或裝置音量安全認證。

## 六、最新已接受CI82／Pages76

**CI82／36157428126、Pages76／36161247227** 已有界接受；sourceK64732e5907e653f5e2fb7ed20f70856ed7f5da00。三jobs／原chooser／完整CPU600救援審判／十ledger173列唯讀重算逐byte相同，578原檔不改。Selectedartifact10875890674；playable/staged/deployed HTML5742708bytes、SHA256 **8da134dabaa4eb11226e06f946ff31b1a625d141f0eda44a6e8ddaad44be4c33**一致，public exactHTTP provider step通過。Fair-vendors原PNG精確還原。

102原圖以4聯絡表全看，只有山道／法庭reduced／森林時門reduced共3張全尺寸，其餘99縮圖。172.28秒原片18169575bytes／SHA256 **8a766e5f98b56c92100e70d2ca2a883979c2ca2713610584ce2cd8f2afe2549b**全decode，345連續2fps樣本／6表已看；無全尺寸影片樣本／原速播放／音軌聆聽／真機／長時間接受。收據 **CI82_ACCEPTANCE.json** 於parent1f049295建立並回讀，不重验CI82或CI81以前已接受工作。CI77/75 failure與CI71歷史accepted=false不回填。

## 七、L岩台輪廓與共用樹冠atlas

Runtime只改 **src/canyon-render.ts**，新增 **src/canyon-relief.ts、src/canyon-canopy-art.ts**。原4岩台與4草頂改為8邊形切角輪廓：頂角退縮、底角最多裁.035，保留原AABB／錨點／高度／shadow caster清單，**碰撞與導航仍使用原矩形規則**。不是把所有幾何說成不變；8個mesh的vertices/indices/UV有明確改動，每個48vertices/28triangles，共增加128triangles。

原8樹卡使用單一272×80nearest-alpha atlas，4種既有且未改J樹冠各64×80，左右各2透明欄，固定UV分配，不做鏡像光照或逐幀隨機變化。原樹卡位置／數量／尺度保留；mesh/material/texture數量不增，atlas原始RGBA增加66560bytes，這不是完整原生記憶體或FPS證明。K地面／岩壁／草面painter及C小怪配色、camera、Gaudio、劇情、原生routes/captures/assertions/workflow保持。

## 八、L回歸、測試保存与剩餘驗收

最終 **2302Node通過／0fail／0skip、416Python通過**。新增20Node＋3Python；20新targeted與38合併targeted（包含18既有K）通過，pre-L舊runtime兩項新斷言確實fail。完整check/typecheck/build/assets/export/diff通過，**490非文件程式輸入**前後與發布前指紋相同；494assembled快照另含4rootdocs。

回歸涵蓋封閉mesh／外向法線／bounds／cap外緣、私有資料／非法輸入、atlas gutters／UV、3viewport、新pixels／原state-camera-enemies／精確偏好還原、其他8map原pixels、靜態資源／隱藏／dispose。新atlas匯出由獨立PNG CRC與Pillow解碼比對runtime RGBA；原4K匯出byte相同。4原檔11精確L片段與CI82 fullhash、missing/duplicate/unrelated負測試保留；歷史KvsCI81明示pre-L，當前L獨立測試，不轉換原生證據。

初始typecheck FloatArray型別、targeted上下表面反向頂點排序，以及第一輪完整Node2302中3個歷史K負測試輸入問題均已修正並保留失敗logs；最後全套重跑，不回填舊failure。詳 **evidence/VQ03L_TESTED_BATCH.json**。

先完成 **CI83_CHECKPOINT.remainingReview**：原三jobs／主報告／chooser／完整CPU600救援審判／十ledger，特別新山道切角面／底部碰撞辨識／4樹冠atlas與C敵人可見性，以及G音訊與既有場景回歸。核matchingPages exactsource/run/artifact/HTML/publicHTTP及原ZIP指定Drive下載回讀後，才有界接受。失敗只修同root實際缺口，不改路線／時間／畫質／斷言。

L只完成輪廓和樹冠差異實作；壓縮山道／法庭構圖、樹木重疊、更廣人物植物道具尺度輪廓、完整角色動畫、完整合法音訊／實際聆聽、原速移動／淡化／viewport舒適性仍開放。已看L離線before/after全尺寸542×361（requested678×452），Node不繪文字／曲線，不是CI83原圖／原速遊玩。無新score，舊30/100屬舊runtime，release仍BLOCKED。

## 九、完整未完成範圍

T03完整隱含規則／版本差異／拓樸數值；T04完整成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊，前段實際品質優先；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整check／一次source／matchingCI／原始產物雲端回讀。分母不縮，無全美術／真機／長時間／全遊戲認證。

## 十、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。L包 **Chrono-VQ03L-canyon-relief-tested.zip／10ksiEetVGovT6j7LSTtGmzGvbrkpAD_2**，1126895bytes／SHA256 **3aaf3fa31c5e806e30617ff31f58fc9ca196e196c9ce426ca5305eaaa621177f**；17差異／494snapshot／完整與失敗logs／離線图／atlas匯出／54manifest，已實際下載核parent/size/hash/CRC/manifest/tar。根program-snapshot.tar.gz為assembled已測程式，不是publishedGitarchive／最新docs；發布前false/null不得重送L。

CI82原始包 **Chrono-CI82-reviewed-evidence.zip／1nItZC2tjiHlwhTnxAI9zeBidXz5Pr0ZN**，89076905bytes／SHA256 **6b9970febb18997d795237231b4a64d68c6b64a8d3e03752e79b741da1f480d4**，7未改原ZIP／33manifest／exactsource/movie/reports/review已存同folder並實際下載回驗。更早恢复點保留DELIVERY_INDEX，臨時容器不是權威。

Main only/non-force/no branch/PR/平行candidate／防撞機制。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8；無P3/ARPG/框架重造。禁止本機browser、native game/time/save/collision造數，不能放寬<.12、原tick、單一30秒、250ms/256、CPU畫質記憶體。Held家具不提升／間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules並保留esbuildhardlink，不覆舊config或開bootstrapCI。私人ROM／原媒體／字型／憑證不公開；文件[skip ci]，成果雲端保存並回讀。
