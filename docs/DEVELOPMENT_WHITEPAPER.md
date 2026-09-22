# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02n-ci56-pending。權威入口STATUS／TODO／IMMEDIATE_CONTINUATION／CI56_CHECKPOINT。更新既有計畫，不重規劃或縮小完整範圍；前次M完整狀態保留於91e79f707cb28974140359d9759e6de4f155348f的Git歷史。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段真實美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須是實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家無須ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不得決定傷害、資源、碰撞或故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/context loss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2身分依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變。獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達保留。抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容、份數、金幣庫存守恆與交易上限已在原流程。400G、價格與普通攻防增減是明示暫定數值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人仍待完成。IndexedDB/JSON白名單v1-v8保留；舊檔未知行為不造證詞、查看不強制改寫；守恆不是防作弊簽章。診斷/render偏好不進存檔。

既有角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用，不重畫已存素材。七段自製短曲和靜音修正不是原作OST或完整配樂。材質語言、木料平塗、人物植物道具尺度輪廓、窄地標、升級母親家具、全動畫及聆聽品質仍有落差。

## CPU能力與已接受基準

自動先WebGL2/1，不可用再用CPU triangle/texture/depth rasterizer輸出Canvas2D RGBA，不是NullEngine空跑／錯誤頁。保留640x480像素cap、最大邊1280、32MiB/512紋理、保守剔除/三角形快速路徑/光向量重用、實際密度tiers。CPU不做shadow map/glow/specular/postprocessing，不保證WebGL視覺同等或真機流暢。FrameWindow保留120真正活動render-loop interval，mean/P95/max/FPS不是GPU timing。

可選遠景平滑預設OFF。J/K由原texture bytes建立box mip，按log2足跡連續混合含1<rho<2；三角形選層，整數單lookup/分數雙RGBlookup。放大、無效、透視、alpha/opacity/blend/cutout/vertex-alpha保留nearest輪廓。關閉/dispose釋放mip，原budgets不改，不改asset/UV/鏡頭。

最新accepted **K/0.9.33/source3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**。三jobs、13主流程、9原native加兩CPU native、六source ledger及每列bytes/hash已核對；兩CPU旅程/10legs和600前段30legs/本人v3-v4選檔/兩獨戰/兩劇情暫停/LuccaP2/修道院入口已驗。22CPU真圖已檢視；ON真canvas變/OFF精確還原/mip釋放/full paused state不變，不等於消除時間閃爍或美術合格。61活動samples約17.0125FPS不是持續效能認證。

Pages47 selected K source正確；playable/staged/deployed HTML同5690213bytes，SHA256 3fda62047f3d6d5d1ce308534e51856a0da6ce0d88f531ad85b90d6af18c0a39。沒有額外本機HTTP/browser驗收。不重開CI51/CI53及更早閉環，失敗CI52/54/55不回填成功。

## L/M延伸、CI55實際結果與N修正

L十二檔以CI-only adapter重用既有rescue/trial browser本體。CPU --disable-webgl/auto/平滑OFF，本人同run v4 ->救援v5 ->兩條監獄v7/龍戰車/2300，原生chooser/IndexedDB不變。67coordinate legs、四遇敵、兩實體道具提示、17既有里程碑及真canvas/state/renderer/PNG；兩安全探索端點各三個不重疊>=120draw窗口與120-frame統計/texture/browser heap，非RSS、長時間或真機認證。第七ledger先驗原CPU/era父鏈再验新報告/存檔鏈/原事實/files/statistics，原六gate不放寬。

M五檔改固定語意AST結構而非ast.dump顯示格式，保留None/empty/list order/type；基準由CI53原始Gitarchive建立，原斷言變動仍fail。CI55已通過Python3.12 gate及原瀏覽器/CPU/600/平滑驗證，因此CI54顯示格式root不再重做。

**CI55 35696071243/source238bb31976e58accaf48769b8a72a3693518a4de completed/failure**。首個step24：救援9/10里程碑、36/37腿後，托魯斯回山道時P1(-.06666666666666181,7.599999999999995)、P2(2.1666666666666767,4.800000000000005)，間距3.5815887225891454>原3.5。舊driver只驗P1，P2偏差累積；遊戲正確拒絕轉場「等待同行者」。原圖已檢視，非CPU/WebGL啟動失敗。六份passed ledger的65列bytes/hash及救援檔案核對一致，本輪未重跑verifier。CPU trial skipped及第七ledger缺失為後果，CI55無整體驗收或新Pages。

**N九檔**新增僅供CPU rescue/trial使用的dual-owner operator。远距離相同方向用原生共同按鍵，依實際snapshot估計按鍵傳輸成本；接近或其中一人到位後只修正未到位者，兩個owner最終皆須在原目标軸<.12。單一原P1距離tick預算／30秒deadline不重設；含全部未按鍵讀取時間；每pulse<=250ms、最多256。Verifier保留原P1斷言並要求雙owner放鍵位置、按鍵/放鍵順序、連續raw snapshot、未命令角色/垂直軸不動。原I helper與原CPU/600 driver、rescue/trial本體、所有67路線/四遇敵/兩提示、src/index/workflow全部不變；無遊戲跟隨/teleport/state/save/time修改。

N **0.9.36/source3f65ae23b2b09be1bb4c23ed559003ae541fe1d3/tree f9320655ffcb75c7de8f6c9c969e7a0d0c95cc91** 已一次non-force发布並回讀完整程式樹。最終 **1339 Node/305 Python/assets/typecheck/build/check/diff check** 通過；新增9 Node/15 Python，48方向軸延遲子例、36觀察位置×3模型=108個原core碰撞回歸及最後兩腿真正轉場規則。初次模型失敗已修正原生操作而非放寬預算；兩次本機check被工具host中斷，最終整套exit0。全部是本機單元/整合，未本機操作browser。

唯一 **CI56 35706073669** push/attempt1，最後in_progress/null（2026-09-22T08:40:23Z）。必須核對原三jobs全套、完整新CPU救援/審判/v4-v7/67腿雙人放鍵/17里程碑/六窗口/第七ledger/原圖，再Drive原產物回讀與同CI Pages/source/HTML。不得以本機source=null HTML hash當CI基準。Pending保存接續不長等；failure處理首個root不放寬斷言。

## 完整剩餘範圍與限制

T03: hidden rules, version differences, full topology and numerical fidelity. T04: growth, battle rewards/drops, complete economy/items/accessories, roster, learned skills and dual/triple techs. T05: complete art/animation/rights-cleared audio, prioritizing actual early-scene quality. T06: complete future and remaining eras, main/side quests and endings. T07: whole-scope >=90, every dimension >=80%, required assets/five gates/zero critical plus physical-device input, FPS/frame time, loading, memory, background, saves and audio. T08: batch implementation/tests, non-force source publication, full matching CI, correct Drive/raw readback and [skip ci] documentation. No reduced denominator. 2300 arrival is not complete future. Old30 stale; no new score or art/device/full-game approval.

依TODO在原生閉環後處理觀察到的相容/效能，再做有意義長時間/真機、前段人物植物道具材質尺度輪廓、窄地標、動畫及合法音訊/聆聽。六短窗口不取代長時間測試；不因綠勾就預設平滑或拓展後段。保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三及家中至2300/equipment v1-v8。無branch/PR/P3/ARPG/framework重造。Held Z/升級母親家具、prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a保持，不間接替換或局部提升；本機browser限制保持。不用可寫time/state/save/collision hook或偽原生存檔，不公開ROM/原媒體/字型/憑證。

## 持久交付

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新N包 **1irVUTuklzPVqGjRd2cBCbGPlZo8YcRqn /Chrono-CI55-terminal-VQ02N-tested-batch.zip**，58936843bytes，SHA256 **e444e9968d7b8762877997cef320d216a612e17aba00f7cfd858267723fc5969**；31manifest/294程式檔/四份未修改CI55原ZIP，下載hash/CRC/所有manifest/parent已驗。包內null發布身分只是當時歷史；最新main docs優先，assembled snapshot不是published Gitarchive，不按本機假ancestry推送。

前M包1Sc2809rDWRDCvYZgM1DkI2b2VGpz5gyA、L包1NfZu0QvDnMd2Mm17uiZPYsef4OfHyshr、CI53/Pages47原包1h9THuGPcjSkcAPIIdqIeWPO7-5M2u7Kf已保存，不需重下載舊歷史。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules/esbuild hardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳。每批原始log/產物/程式/文件寫回正確雲端並回讀；文件[skip ci]；臨時容器不是authority。
