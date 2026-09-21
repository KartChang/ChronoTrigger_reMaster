# 立即接續 — VQ02A 已發布；唯一 CI43 執行中；Z 仍受限

立即使用 GitHub connector 接手 KartChang/ChronoTrigger_reMaster，必要時 Drive。唯一main，非force、只有本AI流程；不開分支／PR／平行candidate／多人防撞。不盤點歷史、不重做章節、不要求token／ROM／手動證據。

## 一、唯一當前位置

新遊戲source：**b54ff3079c8d087bb1396229bc3adf718f2e8cd4**。
Source root tree：**e9fce47b7454f0a30bb389f3b96628b94c491cbb**。
Parent：**d089b25ad75d8aebea67c748aacaaa4e5c01fa74**。
Batch／version：**VQ02A／0.9.23**，獨立前段音訊，不是VQ01Z。
一次非force sourcecommit已發布，main已回讀。完整src/tests/scripts子樹與19個改檔全部匹配本機測試內容；後續[skip ci]文件HEAD不是另一個source。

唯一驗證：**CI43 35576672389**，Playable prototype CI，push／attempt1，main，source如上。
最後觀察 **in_progress／conclusion=null**；created2026-09-21T08:12:19Z，updated2026-09-21T08:12:24Z（台灣16:12:24）。exactSHA全event／全state count=1。没有手動dispatch、rerun、取消或等待輪詢。
機器接續點：**docs/evidence/CI43_CHECKPOINT.json**。
Root：T05-early-visual-cohesion；workstream：independent-early-audio。
Execution terminal：**CI43-pending-full-validation**；active=true，accepted=false。

先讀STATUS、本檔、CI43_CHECKPOINT，確認main一次。若只是文件更新仍接相同source/run，不另開CI。讀同run一次：queued/in_progress即保存回報；failure查同run第一實際根因；success才核對三job／完整原始報告／實圖與音訊觀察／雲端／Pages。不要讀全部舊workflow或舊ZIP，不重跑CI42。

## 二、本批開發已完成，勿重做

七段自製短曲：家中、祭典、道路、緊張、戰鬥、勝利、敗北；不是原作OST擷取／轉錄，也不是完整配樂。原sound按鈕可開關音樂與音效，預設關且不建立AudioContext；僅真實按鍵／pointer啟用或恢復。固定遊戲tick驅動節拍，不補播逾時音符；最多16音源、有限包絡、結束或中斷即清理。暫停／對話／背包／背景／原生選檔靜音，換檔／換曲／tick回退清舊transport，音訊失敗不改遊戲狀態。選單期間效果音也被抑制；恢復等下一有效節拍。

主迴圈只追加音訊接線與唯讀audio觀察。22個既有遊戲函式在移除明列音訊呼叫後符合exactCI42函式hash；四個歷史main／normalized-main hash預期明確前移，不刪斷言。既有場景、人物、相機、core、碰撞、存檔、輸入所有權全部保留。

本批新跑 **987Node／208Python** 全通過，assets／typecheck／build／Python語法解析通過；不是沿用Y的948/199，也不含未發布Z的測試。原始log及初次pin／fixture修正已保存。NullEngine與fake audio ports／合成fixture只屬單元，不是瀏覽器或聽感證據。本機瀏覽器沒有執行。

新browser觀察接進原equipment旅程：真實鍵盤開音訊，讀實際WebAudio analyser能量，檢查暫停／背包／操作對話零音源零輸出與遊戲凍結，使用原先同run v6檔的同一次原生匯入，觀察換曲及epoch清理，再關音訊。沒有增加正向存檔／假旗標／額外匯入。13主報告、9原生紀錄、原斷言與原timeout都保留。

## 三、CI43 成功時的閉環

檢查validate/good/bad三job。下載原始browser/good/bad/playable/art產物，核對13最終主報告、9native、3ledger及列入bytes/hash/source/run/attempt/HTML。新資料在equipment/equipment-report.json的audio及equipment/scene-audio-report.json；不能以合成fixture代替實際analyser或用progress代替最終報告。

保留原HUD、三視窗正常／暫停／減少動態、接地突進、觸控context退休／兩視窗／原30秒load、商店裝備經濟／v8／IndexedDB／勝利／審判及既有故事。實際畫面仍要看，不因音訊批次跳過。原始ZIP保存指定Drive回讀，再核對Pages/source/HTML。軟體瀏覽器analyser不是聽感／實體喇叭，也不是完整音訊或美術90。

## 四、Z 與舊限制仍在，不能混入新批

VQ01Z／0.9.22的GitHub.create_tree寫入封鎖沒有新允許結果，仍 **未發布**，保存於VQ01Z_CHECKPOINT／LOCAL_VALIDATION／CLOUD_RETENTION。不重送、不改編碼管道、不間接替換、不提升不完整staging。本批沒有fair-surfaces/fair-composition，fair-render/festival-kit/early-comfort均保持Y。Z歷史文件的ci43Exists=false指當時Z未發布，不是目前沒有獨立音訊CI43。

受限src/prologue-render.ts與本機browser同樣不可重送或旁路；renderer **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 原樣。工具封鎖不等於connector不可存取，本批GitHub與Drive實際讀寫皆成功。

## 五、雲端快速恢復

唯一folder：**1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
新包：**Chrono-VQ02A-tested-source-local-evidence.zip**。
File ID：**1_JwcNmG7FmSnNKcAQ-dYhtv7x4jN_DLu**。
Bytes：**1928839**。
SHA256：**fda53969d477b14dfb322b691b9a501e5d3a2c1db7d6005ecd7634fa284ad02d**。
已下載回讀整包hash／ZIPCRC／34manifest／parent。19改檔、原始local log、明標未驗收localHTML、**recovery/VQ02A-tested-program-snapshot.tar.gz**（226檔）。快照由exactY＋獨立音訊組成，不是已發布commit的Gitarchive。封存時source=null是正確歷史狀態；GitHub最終收據已匹配發布後source與完整子樹。最新main文件另讀，不用快照舊文件覆蓋。

最後已驗收 **Y0.9.21／CI42 35568827641／Pages36 35571121776**，source3c2e03e02c7be0e5921fa689f32d674c68ae64f4，原始包 **1wlMzDYoWV7a9fHnrBQQ9KjyHMl-1FqjW** 保留。CI42／Pages36及CI41更早全部不重開。Z未發布包 **1hTbyvTOdJ0K7QtM4Pm_2ZLV4aW6pxpV9** 留存，不套用到A。

## 六、完整範圍不變

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90／每面向80%／實體裝置、T08每批雲端。先前段實際品質達標再擴後段；音訊不是替代精緻HD-2D交付。素材材質比例／窄視窗構圖／家中母親家具／完整動畫音樂仍有缺口；無90分新證據，舊30stale。2300抵達不是完整未來篇。

保留TS＋Babylon＋esbuild、固定ATB／A*／InputBoundary、P1克羅諾／P2露卡／自主第三同伴、家中至2300與裝備v1–v8，不加P3、不改ARPG、不重造框架。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules／保留esbuildhardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳。ROM／原圖原音訊／字型／憑證不公開。所有成果與接續點回寫GitHub或指定Drive，文件[skip ci]；不依賴臨時容器。
