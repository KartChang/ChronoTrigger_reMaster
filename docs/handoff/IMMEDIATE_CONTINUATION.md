# 立即接續 — CI41／Pages35 已閉環，下一項前段 T05

請立即使用 GitHub connector 接手 KartChang/ChronoTrigger_reMaster，必要時使用 Google Drive connector。唯一分支main，只有此AI流程使用，非force；不建立多人防撞、平行candidate或PR。這是立即執行交接，不是盤點／歷史審計／重做章節。不要要求token、重傳ROM或手動製造證據。

## 一、唯一目前位置

已驗收遊戲：VQ01X／0.9.20。
Source：a67178ae18c00bcfd552dff25174d6f14b759292。
Source tree：3662cd550ba6ad9a990ca24ab6d14d52c16f7bfa。
最新文件提交以GitHub main為準；本次只有[skip ci]文件與證據更新，沒有新runtime／candidate／active validation／CI42。文件HEAD與source不同不是重跑CI的理由。
機器可讀點：docs/evidence/CI41_CHECKPOINT.json，active=false、accepted=true、currentValidation=null。

## 二、開始只做最少讀取

讀docs/STATUS.md及本檔，確認main一次。若仍是本次文件位置，直接依docs/TODO.md接續T05-early-visual-cohesion，不重查或重驗已關閉的CI41／Pages35，也不下載全部旧ZIP／白皮書／所有workflow。若main確有更新，只接較新提交的current checkpoint；不要回到舊CI失敗。

## 三、已完成，不要重做

CI41：35561161523，push／attempt1，completed／success，updated2026-09-21T05:01:23Z。
validate106214169832、good106214169748、bad106214169911全部成功。
13主旅程、9原生選檔、3來源ledger及列入的報告bytes/hash一致；三ledger已只讀精確重現，沒有瀏覽器重跑。HUD10、地面3、場景3視窗×正常／暫停／減少動態、X各階段六條16×1canvas、W材質6樹根8陰影、6guide6quiet18toolbar12camera、真正ATB突進／接地／匯入清理、商店裝備金幣庫存／v8／IndexedDB／勝利／完整審判及既有故事均保留。觸控context正確關閉、同run自產v8原生匯入、兩視窗／traceCRC通過；完整load4884.01ms，原30秒未放寬。

Pages35：35563000350，prepare106219285318／deploy106219320868成功。staged10622877567及playable10622413321/source/CI/HTML匹配：5633660bytes，SHA2560a174c1b808dbd3d4dd20323f3a57b158d6ec607996fdf2e18147da61092dffb。公開HTTP驗證來自05:01:49Z實際deploy log；沒有另一次本機live-byte或瀏覽器宣稱。CI41_ACCEPTANCE／PAGES35_PROVENANCE／CI41_VISUAL_REVIEW已記錄。CI41／Pages35、CI40／Pages34及更早閉環都不重開。

VQ01V固定tick動態、W局部光照銅材質與樹根、X細石板石縫走道鐘庭、T探索HUD、U觸控生命週期及更早已保存人物鏡頭接地均存在。原938Node／186Python只是source已記錄結果，本文件交接沒有重跑build／unit／browser。

## 四、直接續作既有T05

本次實際圖已看，細鋪面已進遊戲，但偏黑投影、像素人物植物與立體道具的材質／尺度／輪廓、窄視窗地標構圖仍不一致。使用者說沒有精緻HD-2D感是尚未解決的交付缺口，不能拿綠勾／像素尺寸／模型數替代，也沒有有效90分評分。

下一root：T05-early-visual-cohesion。整批處理投影明暗／閱讀性與人物場景尺度輪廓一致性，使用保存素材；先讀擁有實作的src/fair-render.ts、src/fair-finish.ts、src/fair-ground.ts及必要的直接人物／contact／camera測試，不先盤點全repo。不重畫X鋪面／草地mask、不重建HUD／光照框架、不重做既有章節。保留碰撞、角色所有權、固定ATB、所有原斷言，完成相關修改與測試後才一次非force sourcecommit＋一次完整CI。

未來CI仍queued／in_progress就保存exact點並回報，不長等、密集輪詢、重派或取消；failure處理同run第一根因；success保存原始產物、實際畫面及Pages/source/HTML，不能只看綠勾。

## 五、雲端與恢復

唯一folder：1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。
最新已驗收原始包：Chrono-CI41-Pages35-accepted-evidence.zip。
File ID：1XBi5NQWZznGrtT1Zs1nhzmgTmLt-NCCt。
Bytes：38905599。
SHA256：4e72ec1f1d0264e3b38fc652b7d5b766e49b5799cc5e226b63e2def068c785d5。
已下載回讀hash／CRC／13項manifest／六份未修改原始ZIP及父資料夾。
直接恢復raw/CI41-browser.zip內source-a67178ae18c00bcfd552dff25174d6f14b759292.tar.gz，Git archive comment已匹配，不需舊增量鏈。文件永遠另讀最新main；包內technical-review的cloud-pending是封存當時狀態，最終CI41_CLOUD_RETENTION為準。臨時容器可能隨時清除，不是權威。

## 六、不可丟失的範圍與限制

完整T03規則／版本／拓樸，T04成長報酬經濟技能，T05全美術動畫音樂，T06其餘時代主支線結局，T07整體90與實體裝置，T08每批雲端均保留。先前段實際>=90再擴後段；完整遊戲目標不縮小，2300抵達不是完整未來篇，舊30分stale。

保留TS＋Babylon.js＋esbuild、固定ATB、A*、InputBoundary、P1克羅諾／P2露卡與自主第三同伴、家中至2300／裝備／v1–v8；不新增P3、不改ARPG、不重造框架。
已保存A/B/C及P/S/T/U/V/W/X不重畫、不套舊independent-ui。受限src/prologue-render.ts與本機瀏覽器沒有新允許結果，不重送／旁路／間接替換／提升不完整staging；原renderer blob2711a74185aacf3c6bddf9db85ba99a2afbc507a保留。
工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuildhardlink，不覆蓋舊source/config、不另開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳；ROM／原圖音訊／字型／憑證不公開。
所有程式、進度、證據都寫回GitHub或指定Drive並回讀，不能只貼聊天或留sandbox。
