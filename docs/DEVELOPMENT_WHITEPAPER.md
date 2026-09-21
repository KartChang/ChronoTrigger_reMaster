# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-vq02e-ci47-pending。更新既有進度，不重新規劃。唯一執行以STATUS／IMMEDIATE_CONTINUATION／CI47_CHECKPOINT為準。上一完整白皮書保留於54d46a47ca23791ee5579eb7cd027ee189711dfb（該source含中斷前的CI45文件）；本次修正進度落差，不回頭重做CI45。

## 目標、順序與固定架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖及城鎮室內切換、原地ATB、單人／同機雙人共畫面，保留全部時代主支線與結局。不改ARPG、不缩為序章。先让前幾幕場景、人物、圖檔建模動畫、鏡頭遮擋HUD、操作與聲音取得真實品質證據，再擴後段。

沿用TypeScript＋Babylon.js＋esbuild自含HTML和固定package/lock，玩家不需ROM/Python/帳號/後端。不换引擎或重造平行遊戲框架。Controls→main固定1/60秒→core規則→render/HUD/audio。CPU相容呈現重用相同場景圖，不建立另一套關卡規則。音畫不決定傷害、資源、劇情；暫停／背景／對話／背包／原生選檔／context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入，A*保留既有碰撞。

P1克羅諾／P2露卡與劇情入離隊所有權保留。瑪兒／青蛙可為具HP/MP/ATB、可被選中並自主行動的第三同伴，不是P3或自由換人系統。保留獨立選敵、雙確認合技；不改數值通關、不製造正向存檔、不刪斷言、不放寬timeout。

## 已有內容與未完成邊界

已有連貫路線：家中醒來與樓梯→縮尺區域圖→千年祭行為初遇→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕與兩裁決→敲門越獄或等露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。不得因舊pending重開；2300抵達不是完整未來篇，經驗記錄不是完整等級成長。

梅爾基歐商店與武器／身體／頭部装備已具角色相容、穿戴份數、金幣库存守恆及交易上限，不能賣仍穿戴品。400G旅費、13商品及價格／普通攻防增減仍是明示暫定重建，不冒稱原作數值。完整成長、技能學習、戰鬥報酬、消耗品經濟、飾品與自由換人未完成。

IndexedDB與JSON白名單v1-v8保留。舊檔未知行為不補造證詞，查看不強制改寫；本人存檔回溯合法，守恆不是防作弊簽章。snapshot/view/audio/cpu觀察只讀，不加可寫通關hook。CPU專項測試使用同run真正匯出的v2，不替代原裝備v8或其他存檔旅程。

## 已保存美術與前段品質

A/B/C既有主角鏡頭接地、P祭典道具棚布、S地面取樣、T探索HUD、U觸控context、V固定tick動態/reduced-motion、W局部光照銅材質六樹根八陰影、X細鋪面分區grassmask、Y投影閱讀性/caster合併/20石材倒角全部保留。C角色播放使用原影格與片段，固定tick動作、實際位移步伐、96影格CPU快取；不重畫角色。A音訊七段自製短曲與B靜音清理保留，不是原作OST或全曲庫。

使用者反映欠缺精緻HD-2D仍是有效交付落差。CPU相容、測試數、模型數、短曲與引擎都不能替代成熟場景或90分證據。原場景木料平塗、人物植物／道具材質語言、尺度輪廓與窄視窗地標仍需改善；家中升級母親／家具美術、完整動畫配樂未完成。既有母親對話可操作不等於新美術整合。舊30stale、release仍blocked，不新增品質分數。

Z0.9.22的材質／UV／直向構圖批次仍保留在Drive但未發布，實際安全封鎖不因一般繼續解除。不得重送、改編碼管道、間接替換或部分提升。prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a及localbrowser限制同樣保留。這不等於GitHub／Drive不能存取。

## D／CI46／Pages40：實際完成並驗收的相容性

D0.9.26 source **54d46a47ca23791ee5579eb7cd027ee189711dfb**，tree **dd071fde6ad668995504b6882378fb3d9f88cb55**。前次只發布source即中斷，main文件仍停CI45；本次直接確認新source与CI46，不重新審計舊run，也不補造CI45獨立驗收。

CPU fallback已實作：WebGL2/1無法建立時，預設auto使用CpuEngine處理既有資源，再由cpu-scene/cpu-raster執行頂點變換、簡化光照、UV取樣、透明／深度與像素填色，Canvas2D顯示算好的RGBA。不是只建NullEngine，不是强迫瀏覽器提供SwiftShader，也不是改遊戲關卡。640×480像素上限、紋理32MiB/512entries；CPU不做shadowmap/glow/specular，不能宣稱與WebGL視覺一致或裝置皆流暢。

CI46 **35609380108** push/attempt1 success14:27:10Z，三job全部成功。13最終主報告、9原native加1CPU native、三lane＋render＋CPU五ledger均只讀精確重現，列入bytes/hash一致。原故事、商店裝備v8、音訊、C角色播放、HUD／場景／接地ATB／context與觸控保留；觸控load4945.54ms、原30000ms不放寬、trace129項CRC。

真正--disable-webgl、defaultauto旅程走完家中醒來下樓、既有母親對話、大地圖到祭典、P1/P2分開操作、岡薩雷斯ATB勝利、IndexedDB讀取及同run匯出v2原生匯入。九CPU原PNG與own-save來源核對。此處只接受已觀察前段CPU旅程，不是全部22場景原生通關、實體裝置或完整遊戲。實際圖已看，CPU畫質简化且祭典單次繪圖觀察仍約60–100ms，不能當持續FPS。

Pages40 **35612258615**兩job成功，HTML **5673691bytes**／SHA256 **3493ec1fa7ef601950c1f8b8d9da43888b52bce705ff5437565f258fd1303c43**，playable/staged/source/CI匹配。公開HTTP證據為14:27:40.1618415Z成功deploy步驟，非新本機live-byte/browser。正式收據CI46_ACCEPTANCE/CLOUD_RETENTION/VISUAL_REVIEW/PAGES40_PROVENANCE；CI44與更早閉環不重開。

## E／CI47：保留CPU像素的減負批次

E0.9.27 source **f07a42bfa7357e1a9ddcebfa8a790855927051b4**，tree **00efc6b0ea450961739948a952bd2756ea7f2eb1**，parent為D。16檔一次非force發布，完整src/tests/scripts與index回讀匹配本機測試，.github/main/World/core/inputs/saves/camera及held檔案不變。

完全畫面內的三角形直接保留原fill，省去六plane裁切；共用外側plane者排除，跨界或near-zero-w仍走原clip。submesh用當前頂點與矩陣保守剔除，不依賴stalebounds、不隱藏不支援材質。既有render observers後每方向光只正規化一次。像素填色／depth/alpha/UV及解析度不變，不靠減場景物件、缩人物或改慢ATB求速度。附加真實work計數，修復暫停段落與CPU說明。

本批新跑 **1141Node／220Python**、assets/typecheck/build全過。5000seed三角形差分RGBA/depth一致；22既有chapter graph×2小型單元視窗像素与state不變。測試port只繪矩形，不支援文字/曲線；這不是全章原生遊玩。test-only CI46 oracle保留原blobpins，不進production。原全部斷言/timeout保留，本機未操作browser。

可重現Node640×480 benchmark，5warmups與每版15交錯samples：祭典中位93.6771→54.3625ms，家中48.4115→45.9998，大地圖47.2071→46.8945；每次比較像素一致。這只是本機計算觀察，不是瀏覽器FPS、耗電或裝置加速認證。原samples與執行log已保存。

**CI47 35615882220** push/attempt1，最後in_progress/null updated14:59:40Z。未驗收，沒有E新Pages／actual after圖／真機／90結論。後續同run保留原13主9native與五ledger、音訊actor觀察、CPU兩旅程九PNG/own-save，再驗證新增work守恆與說明，完整原包雲端及Pages匹配。queued/in_progress不長等／取消／重派，failure查第一實際root，不用progress/fixture充數。

## 完整剩餘範圍與雲端

T03隱藏規則版本差異／全拓樸／原作數值；T04成長報酬掉落／經濟飾品／技能角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來／其餘時代主支線結局；T07整體90／各面向80%／zero-critical／必需素材五gate／實體輸入FPS-frame-time載入記憶體背景存檔音訊與CPU覆蓋；T08每批雲端回讀。CPU全章原生旅程、持續frame-time/裝置、舊診斷/版本標籤仍有待辦，不縮分母、不只評已做功能。

唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。CI46原包 **14tSUKqvNA95il7QAOlGCpm6IVgK9MIp9**，55007154bytes／15manifest／六原ZIP；E包 **1JYsFtMMuNMwPmGEciEqp6rmvCo628868**，1858994bytes／28manifest／16changes與263programfiles。兩包下載hash/CRC/parent/manifest已核對；封存nullsource是發布前，GitHub補final身份不覆寫logs。原包exactDtar與E快照供恢复，最新main文件另讀，不能覆蓋進度。詳DELIVERY_INDEX與cloud收據。

固定工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules保留esbuildhardlinks，不覆蓋source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不需重傳。ROM/原圖原音訊/字型/憑證不公開。臨時容器不是權威，所有交付與接續寫回雲端。
