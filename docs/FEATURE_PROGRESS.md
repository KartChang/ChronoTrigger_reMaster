# 功能進度 — VQ03I 已發布，CI80待驗收

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI80_CHECKPOINT。Root **T05-early-visual-cohesion**；terminal **CI80-court-canopy-evidence**。VQ03I／0.9.56 source **b0f4b3f4bfbb233fcdc6cee5b06cd1fd29e0786b**，tree **6479f59e11849e807664ee8e2d1099bddfe7b7cc**。Matching **CI80／36117413556**，push/attempt1，發布後一次觀察queued/null（provider updated2026-09-25T09:15:24Z）。I尚未原生accepted，不重送。

## 本輪實作

法庭14張既有角色卡片以原witness pivot62/64、actual camera up和現有支撐面對齊腳底；法官與兩位訴訟人物用.72、證人.49、陪審員.55，另加.04腳底間隙。原x/z變成腳底錨點，渲染卡中心隨相機補償，不改劇情／遊戲位置或碰撞。七陪審員顯示高度1.7／寬1.2，原姿態／cell／NPC current-tick減少動態還原政策保留。隱藏不寫入，dispose清除引用，新增courtStaging唯讀實際腳底及誤差觀察；沒有新增mesh/texture。

1000AD逃亡森林原15張樹木卡改用已存在、未修改的drawWoodlandOak，減少舊亮點型葉片。64×80 nearest-alpha、原樹木位置／幾何／尺度／數量不變；不改全域woodland-art或其他森林。H地面384×352／16×14／y=.02與31家具薄飾面、時門、玩家、鏡頭、故事、G音訊、native captures/routes/assertions/workflow保留。Runtime只改trial-render.ts並新增court-staging.ts，整批14程式／測試檔一次發布。

## 回歸與界線

最終 **2245Node／407Python通過，Node零fail／零skip**；新增16Node＋3Python，16targeted通過，pre-I兩針對斷言失敗。完整assets/typecheck/build/check/diff及465程式輸入前後／發布前指紋一致；469快照另含四root文件。三種viewport、三組相機角度、全部支撐bindings、隱藏／dispose、精確偏好還原、Hground與其他八地圖原pixels均已測。原生CI79的beforeState只作明示Nodeofflinefixture，不注入瀏覽器。

12精確片段／三原檔fullhash及missing/duplicate/unrelated負測試於Node/Python鏡像。歷史H對CI78只在pre-I port測，當前I独立測試；不把I像素冒充舊版、不改native evidence。第一輪timeout／兩個unit缺陷、PythonH負測試輸入修正前logs保留，最後全套重新跑過，詳VQ03I_TESTED_BATCH。

離線全尺寸看courtroom-before／courtroom-after／forest-gate-after，實際buffer542×361；不是CI80原生截图。Node畫布不含文字／曲線；樹冠重複／重疊和法庭平台／空間壓縮仍開放，無新美術分數。這輪没有完成全角色動畫、原速舒適性或實際聆聽。

## CI79／Pages73已有界接受

CI79三job與原chooser、完整CPU600／救援／審判、十ledger173列核對完成，570原檔未改；fair-vendors前後PNG byte相同。Pages73 selectedCI79/sourceH/artifact10853380936、playable/staged/deployed HTML5737166bytes／SHA256 ef74cac63d775c11f7bd7008363c2c8010c864d5efb8f36ce984e5ce47a45a05一致，public exactHTTP step成功。收據CI79_ACCEPTANCE於876cea59提交並回讀，不能用它代替CI80。

CI79視覺只102contact／2fullsize原圖、168.4秒原片337個2fps樣本／6表；沒有fullsize影片樣本、原速播放、音軌聆聽、真機或長時間認證。CI79取代CI78作有界基準；CI77／CI75failure及CI71歷史accepted=false保留。

## 持久交付與剩餘範圍

I包 **Chrono-VQ03I-court-canopy-tested.zip／1MVnJyLotTvO3P7Y0HAwkshn49i0L_S0F**，1161444bytes，SHA256 **9be8f6bf7e52ded25ce22da2b4a3198c2dacc1dd7dc742ea00e0dc91f23deda4**，51manifest／469快照／14檔／logs已下載核parent/size/hash/CRC。CI79原生包 **Chrono-CI79-reviewed-evidence.zip／1QmVKR7e8YXm3sH-GFtI7H2lVOPV0MpN8**，90393537bytes，SHA256 **59b68dabf639ea9cdad8e86e0ec8fe1b16e6617851f07225bfa68ea7485144e7**，七未改ZIP／32manifest已回驗。皆在指定folder，非僅臨時容器。前者是assembled測試快照，不是新CI或當前docs；發布前false不得重送。

先完成CI80原圖／原片／原三job完整旅程與matchingPages、Drive保存下載回驗，再續更廣人物植物道具尺度輪廓／構圖、法庭平台／空間與樹冠重複、完整動畫／合法完整音訊與聆聽、原速走位淡化viewport舒適性。T03全規則版本拓樸數值、T04完整成長經濟掉落學習雙三人技、T05全美術建模動畫音訊、T06全時代支線結局、T07整體>=90／各面向>=80%與requiredassets/fivegates/zerocritical和真機測量、T08每批完整CI／原始產物回讀皆保留；2300抵達不是完整未來。沿用STATUS所有heldprologue/no-local-browser及state時間CPU限制，release仍BLOCKED，無全遊戲認證。
