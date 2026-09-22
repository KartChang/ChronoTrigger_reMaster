# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02m-ci55-pending。權威入口 STATUS／TODO／IMMEDIATE_CONTINUATION／CI55_CHECKPOINT。更新既有產品計畫，不重新規劃或縮小完整範圍；先前完整記錄留在Git歷史。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體场景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先提升前段真實美術、建模動畫、鏡頭遮擋HUD與操作聲音，再擴後段。90分必須是實際驗收，不是AI自評或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家無須ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio；音畫不得決定傷害、資源、碰撞或進度。CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/context loss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2身分依故事，露卡加入／回歸和瑪兒／青蛙自主第三不改。獨立選敵與雙確認合技保留，無P3。既有家中醒來樓梯、缩尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門與2300抵達均保留。抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器／身體／頭部装備、角色相容、份數、金幣庫存守恆和交易上限已在原流程。400G、價格與普通攻防增減是明示暫定數值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品和換人仍待完成。IndexedDB/JSON白名單v1-v8保留；舊檔未知行為不造證詞、查看不強制改寫。守恆不是防作弊簽章。診斷、render偏好不進存檔。

既有角色新像素及片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角與caster合併沿用，不重畫已存素材。七段自製短曲和靜音修正不是原作OST或完整配樂。材質語言、木料平塗、人物植物道具尺度輪廓、窄地標、升級母親家具、全動畫與聆聽品質仍有落差。

## CPU能力與最新技術驗收

自動先WebGL2/1，不可用再用真正CPU triangle/texture/depth rasterizer輸出Canvas2D RGBA，不是NullEngine空跑／錯誤頁。保留640x480像素cap、最大邊1280、32MiB/512紋理、保守剔除/三角形快速路徑/光向量重用、實際密度tiers。CPU不做shadow map/glow/specular/postprocessing，不保證WebGL視覺同等或真機流暢。FrameWindow保留120真正活動render-loop interval，mean/P95/max/FPS非GPU timing。

可選遠景平滑預設OFF。J/K由原texture bytes建立box mip、按log2足跡連續混合含1<rho<2；三角形選層，整數單lookup/分數雙RGBlookup。放大、無效、透視、alpha/opacity/blend/cutout/vertex-alpha保留nearest輪廓。關閉和dispose釋放mip，原budgets不改，不改asset/UV/鏡頭。

最新接受 **K/0.9.33/source 3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**。三jobs、13主流程、9原native加兩CPU native、六source ledger及每列bytes/hash完整核對；原兩CPU旅程/10legs和600前段30legs/本人v3-v4選檔/兩獨戰/兩劇情暫停/LuccaP2/修道院入口已驗。22CPU真圖已檢視。平滑ON真canvas改變，OFF精確還原/mip釋放/full paused state不變，但不等於消除時間閃爍或美術合格。61活動samples約17.0125FPS，不是持續效能認證。

Pages47 selected K source正確；playable/staged/deployed HTML同5690213bytes，SHA256 3fda62047f3d6d5d1ce308534e51856a0da6ce0d88f531ad85b90d6af18c0a39。沒有額外本機HTTP/browser驗收。CI52/CI54不回填成功，CI51/G/H/I/CI53不重驗。

## L/M完成、CI55未驗收

L十二檔以CI-only adapter重用既有rescue/trial browser流程。CPU --disable-webgl/auto/平滑OFF，本人同run v4 ->救援v5 ->兩條監獄v7/龍戰車/2300，原生chooser/IndexedDB不變。67coordinate legs、四遇敵、兩實體道具接近沿用原I輸入helper、放鍵後<.12、距離tick預算/單次30秒/250ms pulse。17既有里程碑加真canvas/state/renderer/PNG；兩安全探索端點各三個不重疊>=120draw活動窗口與120-frame統計/texture/browser heap，非RSS、長時間或真機認證。第七source ledger先驗原CPU/era父鏈，再驗新報告、本人存檔鏈、原事實、檔案hash與統計；不放寬原六gate。

CI54 validate先在Python preservation兩個subtest失敗，未執行該job瀏覽器。原用ast.dump顯示格式作指紋，3.12CI與3.13本機結果不一。M五檔改固定語意結構，保留None/empty/list order/type，基準由CI53原始Gitarchive建立、非更换failed hash；原斷言變動仍fail。所有src/、原遊戲和M前browser本體不變，非新章節或美術完成。

M **0.9.35/source 238bb31976e58accaf48769b8a72a3693518a4de/tree 8ff0e84846d3e9c3c9c890d170ca3a0d031675b0** 已一次non-force發布，最後本機 **1330 Node/290 Python/assets/typecheck/build/完整npm check/diff check通過**。本機未跑Python3.12或browser，不能代替新CI。唯一 **CI55 35696071243** push/attempt1，最後pending/null。成功須驗原三jobs全套加新17里程碑/67legs/四遇敵/兩提示/本人v4-v7/六窗口/第七ledger及真圖，再原始Drive回讀與同CI Pages/source/HTML。失敗看首個root，不放寬預算。Pending保存接續，不長等。

## 完整剩餘範圍及限制

T03: hidden rules, version differences, full topology and numerical fidelity. T04: growth, battle rewards/drops, complete economy/items/accessories, roster, learned skills and dual/triple techs. T05: complete art/animation/rights-cleared audio, prioritizing actual early-scene quality. T06: complete future and remaining eras, main/side quests and endings. T07: whole-scope >=90, every dimension >=80%, required assets/five gates/zero critical plus physical-device input, FPS/frame time, loading, memory, background, saves and audio. T08: batch implementation/tests, non-force source publication, full matching CI, correct Drive/raw readback and [skip ci] documentation. No reduced denominator. 2300 arrival is not the complete future. Old score 30 is stale; no new score or art/device/full-game approval.

Keep TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/autonomous third and existing home-to-2300/equipment saves v1-v8. No branch/PR/P3/ARPG/framework restart, writable test state/time/save/collision hooks or manufactured positive native saves. Held Z/upgraded mother/furniture and prologue-render.ts blob 2711a74185aacf3c6bddf9db85ba99a2afbc507a remain restricted; no indirect replacement or partial promotion. Local browser restriction remains. No public ROM/original external media/fonts/credentials. Temporary containers are not authority.

## 持久交付

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新M包 **1Sc2809rDWRDCvYZgM1DkI2b2VGpz5gyA**（1340053bytes/14manifest/290程式檔；SHA256 885edaa1cf481a5c534382470eadda22ea4275b15645e437283232ec67db1dd3），含CI54原始失敗ZIP。L包 **1NfZu0QvDnMd2Mm17uiZPYsef4OfHyshr**（688057bytes/24manifest），CI53/Pages47原包 **1h9THuGPcjSkcAPIIdqIeWPO7-5M2u7Kf**（59450174bytes/七原ZIP）均下載核验。包是不可变的當時checkpoint；最新SHA/run與docs另看main。已測assembled snapshot不是Gitarchive，不按本機假ancestry推送。

工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳或公開。每批原始log/產物/程式/文件寫回正確雲端，文件[skip ci]並回讀。
