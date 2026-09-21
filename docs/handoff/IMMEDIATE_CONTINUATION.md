# 立即接續 — VQ02B 已發布；唯一 CI44 待驗收

立即使用GitHub connector接手KartChang/ChronoTrigger_reMaster，必要時Drive。只有main／單一AI／非force，不開branch、PR、平行candidate或多人防撞。不盤點歷史、不重做章節、不要求token／ROM／手動證據。

## 唯一目前位置

Source：**7b1537382467935ea37fe4cc6a2dc88d96a8d46c**。
Source root tree：**fe2791e0d0fc0c4a12f6d01e8fe04c90855834ac**。
Parent：**88f3ee4aa7cb63bcc172bbeaf790ee477ba10760**。
版本：**VQ02B／0.9.24**。
一次非force sourcecommit已發布並回讀；26個改檔與src/tests/scripts/.github完整四子樹匹配本機測試。後續[skip ci]文件HEAD不是另一個source。

唯一驗證：**CI44 35583275426**，push／attempt1，main，source如上；最後觀察 **queued／null**，created／updated **2026-09-21T09:26:16Z（台灣17:26:16）**。exactSHA全event／全state count=1。沒有手動dispatch、rerun、取消或等待輪詢。
機器接續點：**docs/evidence/CI44_CHECKPOINT.json**。
Terminal：**CI44-pending-full-validation**，active=true／accepted=false。

開始只讀STATUS、本檔、CI44_CHECKPOINT，確認main一次，再读同run一次。只有新文件HEAD就仍接同source/run，不重開CI。queued/in_progress保存回報、不長等；failure查同run第一實際根因；success才核對全部最終報告、實圖、雲端與Pages。不要回到舊CI42／全部ZIP／整份歷史。

## CI43 實際是 failure，已保存並由新批接續

CI43 **35576672389**，sourceb54ff3079c8d087bb1396229bc3adf718f2e8cd4，completed/failure updated08:39:15Z。validate106259969610、bad106259969885成功；good106259969846的equipment旅程失敗。第一root為暫停後wait_silent在原10秒內未同時觀察到activeVoices=0、masterGain=0、rms<0.000001。原audio=null，未保存最後AudioParam/analyser讀值，不能武斷說某一項已被證實；已看暫停房間failure圖，不是WebGL啟動失敗。

五份原始ZIP已保留hash／CRC。只讀重現validate及bad ledger完全相同；good仍failed，但缺檔錯誤含掛載路徑，並非逐byte相同。原列入報告hash均已核對，不把失敗報告當驗收。見CI43_FAILURE_ROOT及更新後CI43_CHECKPOINT。不要rerun CI43，不接受其partial綠勾。

## 本批完成，勿重做

音訊：清除master所有舊排程，再直接設gain；既有音源釋放與音符包絡保留。新增失敗時lastAudio／state／focus診斷；analyser回報真實RMS，不造零值。10秒／靜音門檻／原斷言不變。這是修正來源可見風險，CI44才決定瀏覽器問題是否解決。

渲染：沿用Babylon WebGL2→WebGL1與瀏覽器決定的GPU／軟體後端；已知軟體名稱只作hint，資訊隱藏或未知不當成硬體。軟體hint或持續低幀才降低繪圖buffer解析度，暫停選單可選auto／原畫質／相容解析度。不改人物大小、場景建模、光照濾鏡、鏡頭政策或ATB速度。

真正context中斷時凍結遊戲音訊、清輸入與累積時間；恢復時重新計時，不補跑背景輸入、不自動覆寫存檔。完全無WebGL顯示可操作錯誤／原生重新載入，不黑畫面。但 **並未完成完全不依賴WebGL的可玩CPU／Canvas2D後端，也不能強制瀏覽器提供被停用的軟體WebGL**。這項需求仍在TODO，不能拿降解析度或錯誤畫面說已完成軟體fallback。

新跑 **1046Node／214Python**、assets／typecheck／build通過。17個既有World方法及22個遊戲函式hash保留；6個歷史整檔pin因有意新增接線明確前移，原斷言不刪不鬆。合成fixture／fakeAudio只是單元；本機瀏覽器未執行，沒有新after圖／聆聽／真機／90分結論。

## CI44 成功時必須做

核對validate/good/bad三job；下載原始browser/good/bad/playable/art。保留13主／9native／3原source-run-attempt-HTMLledger及列入bytes/hash、equipment.audio與scene-audio-report.json。

另外核對 **render-compatibility/report.json／source-ledger.json**：實際softwareWebGL2與WebGL1、原canvas像素、P1操作、原生select切解析度、native WEBGL_lose_context中斷恢復、凍結與清輸入、無WebGL的錯誤／reload；原PNG和hash都要保留。CI命令列選用software是測試設定，不代表一般瀏覽器一定自動fallback。Canvas2D只讀原WebGL畫面像素，不是新renderer。

原HUD、三視窗normal/pause/reduced、人物接地／ATB突進、觸控context退休／同run v8原生匯入／兩視窗／30秒load、裝備金幣庫存／IndexedDB／勝利／完整審判及既有旅程不得省略。看實圖、保存原始ZIP到指定Drive並回讀，再匹配Pages/source/HTML。不能只看綠勾、progress或合成fixture；不得宣稱喇叭聽感、實體裝置或美術90已通過。

## 快速恢復與固定範圍

唯一Drive folder：**1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。
新包：**Chrono-CI43-terminal-VQ02B-tested-batch.zip**。
ID：**17SEnE-8kzSYX2zRcHmbYf_yGKUSHaNFD**。
Bytes：**26323163**。
SHA256：**4b42d2ff9e45b81e9987fc0c934eedfd075f00a35516192cae98955096356fcb**。
下載回讀hash／CRC／49manifest／五原始ZIP／正確parent完成。含26changes、8原始本機logs、CI43失敗與只讀核對、未驗收localHTML、**recovery/VQ02B-tested-program-snapshot.tar.gz（228檔）**。此為assembled快照，不冒稱published Gitarchive；封存source=null是當時未發布狀態，GitHub最終收據補足身份。最新main文件永遠另讀。

最後已驗收仍Y0.9.21／source3c2e03e02c7be0e5921fa689f32d674c68ae64f4／CI42 35568827641／Pages36 35571121776，原始包1wlMzDYoWV7a9fHnrBQQ9KjyHMl-1FqjW保留，不重開CI42/CI41等。CI43未驗收。

Z0.9.22仍受限、未發布，包1hTbyvTOdJ0K7QtM4Pm_2ZLV4aW6pxpV9保留，不重送／換編碼管道／間接替換／部分提升。本批未套Z；fair-surfaces/fair-composition仍無、fair-render/festival-kit/early-comfort不變。受限prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a** 與localbrowser同樣不旁路。限制不是connector不能存取。

完整T03規則版本拓樸、T04成長報酬經濟技能、T05全美術動畫音訊、T06其餘時代主支線結局、T07整體90／每面向80%／實體裝置、T08每批雲端不縮小。先前段實際品質，人物道具材質比例／窄視窗／家中母親家具／完整動畫音樂仍未完成；2300抵達不是全未來，舊30stale。保留TS/Babylon/esbuild、固定ATB/A*/InputBoundary、P1克羅諾/P2露卡/自主第三同伴、家中至2300/裝備v1-v8，不加P3、不改ARPG、不重造框架。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules／esbuildhardlink，私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原圖原音訊／字型／憑證不公開。所有成果回寫GitHub/指定Drive並回讀，文件[skip ci]，不依賴臨時環境。
