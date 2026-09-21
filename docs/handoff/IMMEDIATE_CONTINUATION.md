# 立即接續 — VQ01Y 已發布，唯一 CI42 待完成

立即使用 GitHub connector 接手 KartChang/ChronoTrigger_reMaster；必要時 Drive。main 是唯一分支，只有此 AI 流程；非 force、不新增分支／PR／平行 candidate／多人防撞。不要盤點歷史、重做章節、要求 token／重傳 ROM／手動造證據。

## 唯一目前位置

本批 source：**3c2e03e02c7be0e5921fa689f32d674c68ae64f4**。
Source root tree：**afd919fc37bbac025006fbdbad2e942757ea766d**。
Parent：4f428d5f7d9640a134a0510807d0f3f98506aebc。
版本：VQ01Y／0.9.21。
一次非 force source commit 已發布並回讀 main；src／tests／scripts 完整子樹與本機測試內容完全一致，包含10個修改檔。文件 [skip ci] 提交不改 source，不是新 candidate。

唯一驗證：**CI42 35568827641**，Playable prototype CI，push／attempt1，head_branch=main，source 如上，最後觀察 queued／conclusion=null，created_at／updated_at=**2026-09-21T06:30:57Z**。當時 exact-SHA 全 event／全 state count=1。沒有手動 dispatch、rerun、取消或長時間等待。
機器接續點：**docs/evidence/CI42_CHECKPOINT.json**。
Root：T05-early-visual-cohesion。
Execution terminal：CI42-pending-full-validation。
active=true、accepted=false；不要把舊 CI41_CHECKPOINT 的 currentValidation=null 當成本批狀態。

## 開始只做最少確認

先讀 STATUS／本檔／CI42_CHECKPOINT，確認 main 一次。若只有較新的文件提交，仍接這個 exact source／run，不另跑 CI。若確有更新的 source／checkpoint，接最新點而非舊 failure。只讀目前同一 run 一次：queued／in_progress 即保留接續點並回報，不等到中斷、不密集輪詢、取消或重派。failure 處理同 run 第一個實際根因。success 才核對三 job、全部最終原始報告、bytes/hash、實際畫面、原始產物雲端保存，再核对 Pages／source／HTML；不能只看綠勾或 progress。

## 本批已完成開發，不要重做

1. 沿用既有 ShadowGenerator，祭典啟用時投影明度下限 .34，離開／父節點停用／dispose 恢復原值；不動全域主光、W補光、銅材質、filter、bias 或 shadowmap。
2. 靜態合併按材質與投影資格分組，鐘柱／拱石／傳送器橫梁仍投影；小石縫／花朵／花床／基座不因合併重新變成投影者。
3. 20件鐘庭石材使用封閉、固定頂點的像素人物尺度倒角，保留原本外接尺寸、位置與碰撞；窄邊色階／受光輪廓，不重畫紋理、不全畫面模糊。
4. 露卡／三攤販平面與既有主角1.36×1.85尺度一致；48×64原圖、pivot與nearest不變。這不是宣稱全面解決人物／環境比例與材質落差。
5. 在原三視窗正常／暫停／減少動態的實際觀察中增加 generator／buffer／caster／actor 資料，保留原畫面與所有原斷言。

本批新跑 **948 Node／199 Python 全通過**，assets／typecheck／build通過；不是沿用旧938／186。先前型別檢查的 AbstractMesh buffer access 已在發布前改為 Mesh guard。原始 log 與檔案 hash 見 VQ01Y_LOCAL_VALIDATION.json／Drive。checker fixture 明標 synthetic，不是假造遊戲／GPU證據。本機瀏覽器沒有執行。

**CI42 尚未驗收，沒有新版 after 圖片或90分美術結論。** 使用者認為畫面不夠精緻仍是未解決缺口。待實際圖比較投影、鐘庭輪廓與閱讀性；尚有像素人物植物／立體道具材質、窄視窗構圖、家中家具母親、完整動畫音樂與實體裝置。不要以測試數、倒角數、引擎名稱替代品質。

## 最新雲端與快速恢復

唯一 folder：**1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
新增 **Chrono-VQ01Y-tested-source-local-evidence.zip**。
File ID：**1MO3Rsw1KKgaoU28J4AS-ZMCKUHPdDhWm**。
Bytes：**2036670**。
SHA256：**bdcf8bc8b99c69c4b8f1cebdefefbf15e61ea345f720bf229cc472340df69015**。
已下載回讀整包 hash／CRC／23項 manifest／正確父資料夾。包含10檔 changes、原始本機 log、明標未驗收的本機HTML、未修改CI41 baseline、**recovery/VQ01Y-tested-program-snapshot.tar.gz**（218程式／設定檔）。此快照由 exact a671 程式＋本批10檔組合，不冒稱已發布 commit 的 Git archive；不含 node_modules／ROM／外部原圖音訊字型憑證。封存时 sourceSha=null 是當時狀態，GitHub最終收據已匹配發布後 source 與完整三子樹。文件永遠另讀最新main，不覆蓋最新進度。

之前已驗收原始包 **1XBi5NQWZznGrtT1Zs1nhzmgTmLt-NCCt**／38905599bytes／SHA2564e72ec1f1d0264e3b38fc652b7d5b766e49b5799cc5e226b63e2def068c785d5保留。CI41／Pages35 已閉環：sourcea67178ae18c00bcfd552dff25174d6f14b759292、tree3662cd550ba6ad9a990ca24ab6d14d52c16f7bfa；CI41 35561161523、Pages35 35563000350。它們及 CI40／Pages34、更早項目都不重開。Pages35仍是最後已驗收部署；不要宣稱Pages36或新的live-byte驗證。

## 固定範圍與限制

保留完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90／每面向80%／實體裝置、T08每批雲端。先前段實際品質達標再擴後段；2300抵達不是完整未來篇；舊30分stale。保留家中至2300、裝備與v1–v8、TS＋Babylon＋esbuild、固定ATB／A*／InputBoundary、P1克羅諾／P2露卡／自主第三同伴；不加P3、不改ARPG、不重造框架。

A/B/C/P/S/T/U/V/W/X整合資產、鋪面grassmask、W光材質樹根、固定tick動態、HUD、相機、接地、輸入所有權不重做。不套回舊independent-ui，不重畫已完成素材。
受限 **src/prologue-render.ts** 與本機瀏覽器沒有新允許結果；原blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 保留。不重送、改管道旁路、間接替換或提升不完整staging。
固定工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只恢復node_modules，保留esbuildhardlink，不覆蓋舊source/config，不另開bootstrapCI。
私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM** 不需重傳；ROM／原圖音訊／字型／憑證不得公開。所有程式、白皮書、功能、進度、證據寫回GitHub或指定Drive並回讀；文件[skip ci]。臨時容器隨時可能清除，不是權威。
