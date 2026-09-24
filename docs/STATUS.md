# Current status — CI71 success; evidence retained; visual/motion review pending

Current root：**T05-early-visual-cohesion**。唯一 execution terminal：**CI71-visual-motion-review**。Authority：本檔、TODO、handoff/IMMEDIATE_CONTINUATION、evidence/CI71_CHECKPOINT.json。這是立即交接文件更新，不是另一個遊戲 source；沒有 CI72、新 candidate、分支或 PR。

## 唯一已發布程式

VQ03C／0.9.50 source：**62469eb87e3c736a99d970d555d4155fab4b8e79**；source root tree：**b226e44083a186005d4930915b6a9e44ac962e11**。原20檔批次與413程式檔已發布，不重做或重送。原程式 parent：b2e3c134d56b6df157dd9b72d23400050cf656ad。此次文件更新的 parent：086c440e104777dd35f12ec286f8d6757acc44cd。

C只在src/render.ts及新增src/field-enemy-palette.ts，將山道／森林既有小怪接回preservePixelPalette單一unlit emission，保留原24×32 nearest-alpha圖像、五個RGBA採样、幾何、位置、尺度、敵人規則、相機及Z/A/B功能。離圖或dispose還原原材質，不新增貼圖。原600AD路線遇敵前追加兩份實際CPU PNG與唯讀觀察，沒有新增按鍵、走位、暫停或人造state。新增PNG實際解碼／CRC／色彩數量gate保留全部舊門檻。

中斷前C最終完整check：1843 Node、377 Python、assets、typecheck、build及diff通過；74項針對測試、413輸入指紋與413程式快照已保存。此次沒有重跑這套程式測試，也沒有本機browser。

## 本輪已完成，下一對話不要重驗

CI71／**35976206740**／push／attempt1／workflow360357259（.github/workflows/ci.yml）已於 **2026-09-24T09:12:24Z／台灣17:12:24** completed/success。三job 107557189738、107557190001、107557190190均success；原CPU救援及審判未跳過。原13主報告、9native及完整CPU兩旅程／600／救援／審判、同run本人存檔鏈與67腿／4遇敵／2props／17里程碑／6窗口，由同source verifiers核對。

七份ledger使用CI71內保留的未修改C程式唯讀重算，**150列逐byte相同**，各列數17／8／4／6／14／39／62。source archive重建Git tree與b226e44083a186005d4930915b6a9e44ac962e11完全相同，held prologue blob仍為2711a74185aacf3c6bddf9db85ba99a2afbc507a。原報告沒有被改寫。

同CI的Pages65／**35979820044**已success。selected CI、source與artifact10799354174正確；playable／staged／deployed HTML均 **5723474bytes**，SHA256 **3ca579cd2555629bc48e0ae5298668f1b98d98b2503c917ebeb1b43d1734b303**。公共HTTP exact-bytes step成功，沒有本機HTTP重播。

完整native-session.webm：**18949301bytes**，SHA256 **4d9e18a15284582b6d79a729a4bf2eabd33a440e2a65645cfdd07b2cbff43d22**，VP8／960×844／174.360秒；ffmpeg完整解碼exit0。只表示可解碼，不表示觀看過影片。此次全尺寸親看兩張新增field PNG：山道三隻、森林兩隻小怪可見藍金配色及深色輪廓；其餘85張CPU圖及影片視覺內容尚未完成本輪審查。

**CI71 accepted仍為false。** 不將上述已完成技術工作冒稱完整驗收；不存在CI71_ACCEPTANCE收據。最後正式技術接受仍為CI70／Pages64，原速動態舒適性仍開放。詳evidence/CI71_REVIEW_PROGRESS.json。

## 已回讀雲端與最少恢復

唯一Drive folder：**1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。

CI71／Pages65完整證據交接包：**1e5coZaU45p3QZy1I-eOesqj5Md7wI8dO／Chrono-CI71-VQ03C-evidence-review-handoff.zip**；**86421383bytes**；SHA256 **54d971655c70040276c4d0c9fbf2560175ead3f5452d9db29722ab9576d2284a**。已從Drive下載回驗parent、大小、hash、ZIP CRC、17項manifest及七個未修改內層ZIP。內含完整原影片及exact source archive（在原browser ZIP內）、獨立ledger重算程式、結果與影片解碼紀錄；不是只保存摘要。

C已測開發包：17PqOqK16Wn4LM8HlxaZ8nfnVXp_75tVu，2045961bytes，SHA256801681286c565e1ec3298646414cecb24008e12b5ac77ebd4f698e5ca8a3ddfc。413檔assembled快照不是published Git archive；包內source=null是封裝前歷史，C已發布。必要時取development/VQ03C-tested-program-snapshot.tar.gz；進度一律讀GitHub main，不以舊包覆蓋。

## 直接接續

只讀本檔、IMMEDIATE_CONTINUATION及CI71_CHECKPOINT的completedChecks／remainingReview。main確認一次，若只是此文件HEAD，不需再查已完成run，不重跑CI71／C測試／七ledger／已確認Pages，也不重開CI70或更早。

從證據包原browser ZIP繼續看剩餘85張CPU原圖（含20張村莊图與既有角色、HUD、ATB、救援／審判）及完整影片的實際城鎮走位／鏡頭／招牌／建築過渡。影片host时间只作近似導覽，不是逐幀精確對時；解碼與抽樣不能冒稱原速播放。全部必要審查完成後才寫CI71_ACCEPTANCE並關閉CI71。若有實際問題，只修當前根因，保留原artifact及斷言。

再接既有T05：植物遮住人物下肢、尺度輪廓、原速移動及淡化舒適性、完整角色動畫與合法音訊；將可實作／回歸項目合成一批後再一次source／matching CI。不要把完整遊戲改成只有前段，也不要因綠勾就擴後段或自評90分。

## 完整範圍與限制

T03規則版本／拓樸／數值忠實；T04完整成長、掉落報酬、經濟道具飾品與角色雙三人技；T05全部美術動畫合法音訊、前段實際品質優先；T06所有時代主支線結局；T07全範圍整體>=90且各面向>=80%、required assets／five gates／zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔、音訊；T08每批實作測試、一次source、完整matching CI及雲端原檔回讀。2300抵達不是完整未來篇。舊30分stale，沒有新分數、真機或長時間認證。

main only／single AI／non-force；無平行candidate、其他branch、PR、多人防撞、P3、ARPG或框架重造。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三及v1-v8存檔。不得造game/time/save/collision state，不放寬<.12、原tick預算、單一30秒、250ms／256及品質門檻。Held VQ01Z與母親家具不得提升或間接替換，prologue-render.ts blob維持2711a74185aacf3c6bddf9db85ba99a2afbc507a。禁止本機browser。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只取node_modules並保留esbuild hardlink，不覆舊source/config、不開bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳、不公開ROM／原媒體／字型／憑證。臨時容器不是權威。
