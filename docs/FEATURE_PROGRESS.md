# 功能快照 — CI51已驗收；J已發布／唯一CI52待驗收

Authority：STATUS／IMMEDIATE_CONTINUATION／CI52_CHECKPOINT。沒有新增完成百分比、美術分數或全遊戲接近完成認證。

**VQ02J0.9.32** source **e93733179a4e0e0cb5fd254d7a841c2eb3df542d**，tree **23bfe048c311e8afdb4913283c8257ebff910adb**。15檔整批測試，一次non-force發布，main回讀及完整tested root一致。

本批有實際產品功能：CPU暫停選單新增「遠景紋理平滑」實驗選項，預設關閉。只對不透明原紋理建立按需box-filter mip層，以正交三角形足跡挑選，32MiB／512格預算、更新失效、關閉及dispose清理完整。人物／透明植物輪廓、opacity/blend、原WebGL、素材與UV／幾何不變；透視回nearest。這是CPU縮小取樣改善，不是新美術資產，也不是解封Z；實圖改善與負載仍待CI52確認。

原生CPU覆蓋新增同頁後續：保留家中到祭典、双人ATB／本人v2／IndexedDB／原生匯入兩原case，再接既有項鍊異變、600山道獨戰、托魯斯旅店、森林獨戰、王城／王后消失、露卡P2及修道院入口。30原生放鍵後抵達路段、兩段劇情暫停、本人v3／v4原生匯入與11新PNG由新第六ledger驗證；原5ledger／14CPU列入檔／11CPU成功圖不減。這是既有章節的CPU驗收覆蓋，不是重造故事，也尚未原生通過。

新跑 **1239Node／259Python／assets／typecheck／build**，完整npmcheck及Python皆exit0。新增78Node／9Python，含minification、反例驗證器、純規則輸入及實際serialize/deserialize路線、按鍵例外cleanup。模型／記憶體fixture不輸出原生成功證據；本機沒有操作browser。原CPUdriver10函式、I走位helper、G/H/I測試、core／碰撞／素材／package／lock原樣；workflow僅加驗證步驟，3jobs與45分鐘不改。

唯一 **CI52 35680779688** push／attempt1，最後queued/null at2026-09-22T02:47:53Z，台灣10:47:53；exactSHA count1，未查jobs／未接受。沒有等待輪詢、取消、重派或多開CI。

最後已驗收前移為 **I0.9.31／source44ba3922ac2e6b1dd002624a38f4156edcd7d2c5／CI51 35675330433／Pages45 35676767742**。3job成功，13主報告、9原native加CPU、五ledger重新執行後逐bytes相同。兩CPU旅程、10次原budget內afterRelease抵達、11真圖、61活動sample與品質／暫停／source標示通過。約24.36FPS只是該觀察窗口，不是真機持續效能。Pages原產物同source同HTML及CI端公共HTTP驗證通過；本機獨立HTTP因DNS不可用，不冒稱已讀到。G/H/I不重做，CI48–50仍記錄為失敗，舊E閉環不重開。

指定Drive已保存兩包並下載hash／CRC／manifest／parent核對：CI51原包 **1sgU-n16eUnPExIBtFsx2RHgGDf51BC4U**（20manifest／7rawZIP），J批次 **14HDH1dKKIKzkHfqWCAfHtRgjKs6j0gNd**（58593820bytes／43manifest／280檔恢復）。最新main文件另讀；封存nullsource是發布前，GitHub收據補身分，不改寫原log。

完整T03–T08、規則數值拓樸、成長經濟技能、全美術動畫配樂、剩餘時代主支線結局、各面向80%／整體90與真機、每批雲端均保留。CPU全章、持續效能、聽感、人物植物與道具材質、尺度／窄視窗地標仍有缺口。Z／升級母親家具／prologue-render／localbrowser限制不變且不可旁路。2300抵達非全未來，舊30stale；測試數不可替代美術。
