# 功能進度 — Y field死亡交付與原生build綁定已實作，CI96中

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT v32。**Y0.9.72 source8024dc43a4e91d0a5f9a319a5ba8c6afdadc1485**，tree257d953bca5d60c240646d9fa639c3a22384dc53；21source/test合批完整測試後一次發布。唯一matchingCI96/36324453650最後in_progress（providerupdated2026-09-27T14:01:58Z）。沒有Y原生或部署接受。

## 本批實作增量

**Field死亡來源跨暫停交付**：沿用X的只讀pending-lethal辨識，補到既存FieldEnemyBody。山道三個及森林兩個位置在production World/core離線重現修前source-loss；只在真實致死事件仍排隊時保留已畫出的存活owner/HP/visibility/battle witness，正常delivery才生成原一次copy。24tick、原HP0立即停用、資源上限/释放不變。清queue、換owner、離開mode、首次已死、reduced、事前隱藏、模糊目標均不憑空產生死亡。修前19測試14pass/5fail，修後19pass。沒有聲稱此缺陷已在某次native中觀察。

**Native版本入口修正**：CI95的X實際build被舊W expected_build拒絕；Y三條入口九個metadata參數改由checked-out producer唯一宣告決定，不從native report取得expected。宣告不完整、重複或模糊即failclosed。原checker和行為斷言完全保留，未改原路線/按鍵/ticks/等待/capture。新增AST/exact-source與mutation反例，不放寬接受條件。

**測試／来源保護**：3019Node/594Python/asset/typecheck/build通過，新增31Node/7Python。77保護項包含於573未改程式輸入，不是額外573。Y→X→W來源逆轉保留歷史expectedhashes，拒絕缺hunk/重複/額外修改；來源adapter不能處理native報告。全部失敗及成功logs已保存。

## 開發完成不等於原生接受

CI95仍failure，四個原ZIP未改寫，沒有playable accepted宣稱。其六項通過與出手觀察只用於定位，未把失敗report改成passed。CI96完成後需讀Y自己的原生原檔/ledger/部署證據，不借W收據。

Tank/Yakra完整death、Hench outgoing、P observedFalls、Q differentFallbackSamples仍缺新完整原生樣本。W的CPU死亡capture age9/12未滿24，WebGL致死尚排隊；不能靠延長等待/改capture湊齊。W/CI94/Pages88的repair-history、CPUwheel event1529、Vbody/守衛完整death等有界樣本保持closed，CI93自身仍failure。

全party/enemy方向與move/attack/hurt/down/death、前段尺度/輪廓/原作構圖/山道法庭樹列、合法完整音訊/聆聽、原速/真機/長時段仍open。本輪未檢視圖片、播放影片、聆聽或測真機。歷史quality30/100不屬於Y新評分。fullAnimationComplete/artApproved/wholeGameAccepted=false，newScore=null，releaseBLOCKED。

## 持久成果

folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**：Y已測包 **11OO9WpRzU6aNbsIXF7jwFxDMJkGWXTOb**（2744621bytes、SHA256677ac8646dfcc8b86d397c670886177434699adfbd5c7f06d17b69f8374d68b0、69manifest/594snapshot）；CI95失敗原包 **1K-0GVsXj2tkG7GPvCocofOPM-wQ__rfM**（40517351bytes、SHA256f31219ec7c52d1a665d3ca923f0a3b8f405e4391a60a804368655415cb86aa95、四原ZIP/6manifest）。兩包已真正下載核parent/size/hash/CRC/內容，Ysnapshot逐byte匹配。封裝時false旗標屬歷史，以main收據為準。T03-T08完整目標、held資產、原門檻均不變。
