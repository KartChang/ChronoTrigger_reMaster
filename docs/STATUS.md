# Current status — VQ03L 已發布；matching CI83 驗證中

接續只讀本檔、handoff/IMMEDIATE_CONTINUATION.md、evidence/CI83_CHECKPOINT.json；main確認一次，直接remainingReview，不盤點歷史。

Repository **KartChang/ChronoTrigger_reMaster**，唯一 **main**；single AI／non-force。Root **T05-early-visual-cohesion**，terminal **CI83-canyon-relief-evidence**。目前 **VQ03L／0.9.59** source **897823dbb73401e453913497f08b96a56cef4109**，source tree **264d4c14534132bbc981b6edee63fffa1ce18af8**，parent **1f0492959069b6219105da7d7986b3fa4277b94b**。17程式／測試檔已一次發布並回讀；完整Git root等於已測程式加當時main docs tree **487c777c89e4ba32667db45400a5c1c6fd6e43b9**。L/K/J及更早批次不重送。

Matching **CI83／36169357410**，workflow360357259/.github/workflows/ci.yml，push/attempt1，發布後一次觀察 **in_progress/null**，provider updated **2026-09-25T17:47:51Z（台灣2026-09-26 01:47:51）**。Exact source全event/state共1run，沒有extra dispatch/rerun。未讀CI83 jobs/artifacts、未matchingPages接受、L accepted=false。續作只查exactrun一次；仍active保存checkpoint，不輪詢到中斷。

## 本輪合批實作

Runtime只改 **src/canyon-render.ts**，新增 **src/canyon-relief.ts、src/canyon-canopy-art.ts**。原4岩台與4草頂改為8邊形切角輪廓：頂角退縮、底角最多裁.035，保留原AABB／錨點／高度／shadow caster清單，**碰撞與導航仍使用原矩形規則**。不是把所有幾何說成不變；8個mesh的vertices/indices/UV有明確改動，每個48vertices/28triangles，共增加128triangles。

原8樹卡使用單一272×80nearest-alpha atlas，4種既有且未改J樹冠各64×80，左右各2透明欄，固定UV分配，不做鏡像光照或逐幀隨機變化。原樹卡位置／數量／尺度保留；mesh/material/texture數量不增，atlas原始RGBA增加66560bytes，這不是完整原生記憶體或FPS證明。K地面／岩壁／草面painter及C小怪配色、camera、Gaudio、劇情、原生routes/captures/assertions/workflow保持。

## 最終回歸

最終 **2302Node通過／0fail／0skip、416Python通過**。新增20Node＋3Python；20新targeted與38合併targeted（包含18既有K）通過，pre-L舊runtime兩項新斷言確實fail。完整check/typecheck/build/assets/export/diff通過，**490非文件程式輸入**前後與發布前指紋相同；494assembled快照另含4rootdocs。

回歸涵蓋封閉mesh／外向法線／bounds／cap外緣、私有資料／非法輸入、atlas gutters／UV、3viewport、新pixels／原state-camera-enemies／精確偏好還原、其他8map原pixels、靜態資源／隱藏／dispose。新atlas匯出由獨立PNG CRC與Pillow解碼比對runtime RGBA；原4K匯出byte相同。4原檔11精確L片段與CI82 fullhash、missing/duplicate/unrelated負測試保留；歷史KvsCI81明示pre-L，當前L獨立測試，不轉換原生證據。

初始typecheck FloatArray型別、targeted上下表面反向頂點排序，以及第一輪完整Node2302中3個歷史K負測試輸入問題均已修正並保留失敗logs；最後全套重跑，不回填舊failure。詳 **evidence/VQ03L_TESTED_BATCH.json**。

## 最新有界接受，不重驗

**CI82／36157428126、Pages76／36161247227** 已有界接受；sourceK64732e5907e653f5e2fb7ed20f70856ed7f5da00。三jobs／原chooser／完整CPU600救援審判／十ledger173列唯讀重算逐byte相同，578原檔不改。Selectedartifact10875890674；playable/staged/deployed HTML5742708bytes、SHA256 **8da134dabaa4eb11226e06f946ff31b1a625d141f0eda44a6e8ddaad44be4c33**一致，public exactHTTP provider step通過。Fair-vendors原PNG精確還原。

102原圖以4聯絡表全看，只有山道／法庭reduced／森林時門reduced共3張全尺寸，其餘99縮圖。172.28秒原片18169575bytes／SHA256 **8a766e5f98b56c92100e70d2ca2a883979c2ca2713610584ce2cd8f2afe2549b**全decode，345連續2fps樣本／6表已看；無全尺寸影片樣本／原速播放／音軌聆聽／真機／長時間接受。收據 **CI82_ACCEPTANCE.json** 於parent1f049295建立並回讀，不重验CI82或CI81以前已接受工作。CI77/75 failure與CI71歷史accepted=false不回填。

## 雲端恢復

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。L包 **Chrono-VQ03L-canyon-relief-tested.zip／10ksiEetVGovT6j7LSTtGmzGvbrkpAD_2**，1126895bytes／SHA256 **3aaf3fa31c5e806e30617ff31f58fc9ca196e196c9ce426ca5305eaaa621177f**；17差異／494snapshot／完整與失敗logs／離線图／atlas匯出／54manifest，已實際下載核parent/size/hash/CRC/manifest/tar。根program-snapshot.tar.gz為assembled已測程式，不是publishedGitarchive／最新docs；發布前false/null不得重送L。

CI82原始包 **Chrono-CI82-reviewed-evidence.zip／1nItZC2tjiHlwhTnxAI9zeBidXz5Pr0ZN**，89076905bytes／SHA256 **6b9970febb18997d795237231b4a64d68c6b64a8d3e03752e79b741da1f480d4**，7未改原ZIP／33manifest／exactsource/movie/reports/review已存同folder並實際下載回驗。更早恢复點保留DELIVERY_INDEX，臨時容器不是權威。

## 接續與固定範圍

先完成 **CI83_CHECKPOINT.remainingReview**：原三jobs／主報告／chooser／完整CPU600救援審判／十ledger，特別新山道切角面／底部碰撞辨識／4樹冠atlas與C敵人可見性，以及G音訊與既有場景回歸。核matchingPages exactsource/run/artifact/HTML/publicHTTP及原ZIP指定Drive下載回讀後，才有界接受。失敗只修同root實際缺口，不改路線／時間／畫質／斷言。

L只完成輪廓和樹冠差異實作；壓縮山道／法庭構圖、樹木重疊、更廣人物植物道具尺度輪廓、完整角色動畫、完整合法音訊／實際聆聽、原速移動／淡化／viewport舒適性仍開放。已看L離線before/after全尺寸542×361（requested678×452），Node不繪文字／曲線，不是CI83原圖／原速遊玩。無新score，舊30/100屬舊runtime，release仍BLOCKED。

T03完整隱含規則／版本差異／拓樸數值；T04完整成長／報酬掉落／經濟道具飾品／學習換人／雙三人技；T05全部美術建模動畫合法音訊，前段實際品質優先；T06所有時代主支線結局，2300抵達不是完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08每批完整check／一次source／matchingCI／原始產物雲端回讀。分母不縮，無全美術／真機／長時間／全遊戲認證。

Main only/non-force/no branch/PR/平行candidate／防撞機制。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8；無P3/ARPG/框架重造。禁止本機browser、native game/time/save/collision造數，不能放寬<.12、原tick、單一30秒、250ms/256、CPU畫質記憶體。Held家具不提升／間接替換，prologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules並保留esbuildhardlink，不覆舊config或開bootstrapCI。私人ROM／原媒體／字型／憑證不公開；文件[skip ci]，成果雲端保存並回讀。
