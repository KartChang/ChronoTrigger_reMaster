# VQ04E 接續入口 — v39，已全測並發布source

本指南取代v38「只恢復、未全測」的目前操作狀態；歷史evidence/VQ04E_RECOVERY.json不改写。唯一main，singleAI／nonforce，不開新branch／PR／candidate。先看STATUS／TODO／T05_ANIMATION_CHECKPOINT v39，不重讀全部歷史。

## 最短接續

E／0.9.78 source870c2fb64afd42dcb7bd618f84928643c995fa94，source tree7ed4d2a0be97c8e8b48f063c0d18866981039d02已發布。唯一CI102／36429066870／push／attempt1觀察為in_progress（provider updated2026-09-28T13:30:18Z）。不要重推、rerun或dispatch。完成後保存其原始ZIP、確認exact source／部署payload並做限定review；pending保存checkpoint不長poll。D／CI101／Pages95已成功，不能等待CI101通知。

已完成E3384Node／617Python／assets／typecheck／quality schema／build與正式入口離線整合，不重做這批工程。下一步是matching CI review及完整實際美術主線，不能把尚未確認的native／Pages標成成功。

## 容器遺失時

唯一最新工作包Chrono-VQ04E-production-batch.zip，Drive ID1K_C2XsNeKvlnIb4k2c8pQ0CGzGbu-Pu9，folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb，1719284bytes，SHA256 d10e34da05be87ab9776ca062c837019d2141200a086584c98eceb8777c772b7。已真正回下載驗證71manifest／678program snapshot。

從program-vq04e.tar.gz恢復完整程式；program-files.json有每檔SHA256／Git blob；changes/有24差異；logs/含失敗及最後整批成功、無損封裝等價紀錄。快照不含docs或node_modules，最新GitHub文件不可被舊包覆蓋。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules／esbuildhardlink，不覆蓋source/config，不開bootstrap CI。

舊1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr含669檔，只保留歷史來源，不再是續作主快照。Drive search回空不表示已確認ID不存在；直接fetch已知ID。

## 不變界線

NPC336作者欄位中28ambient套入，308direction/walk/greet僅匯出；combat256作者格仍runtimeApplied=false。原golden／native route/timing/capture/assertion、held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不變。No localbrowser／native State／time／save／collision注入，不放寬品質門檻。E→D inverse只處理明示SOURCE，不能改native／image／game State。

完整T03–T08、party/enemy/NPC方向動作death、山道／法庭／城鎮／縮尺地圖、合法音訊聆聽、原速／真機／長時段與所有樣本缺口保留。品質批准false、newScore=null、releaseBLOCKED。成果存main或指定Drive並回讀，docs[skip ci]。
