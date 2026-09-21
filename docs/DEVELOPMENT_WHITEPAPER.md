# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02f-ci48-pending。更新既有進度，不重新規劃。唯一執行以STATUS／IMMEDIATE_CONTINUATION／CI48_CHECKPOINT為準。前版全文保留於 **de92955eb4946ff766f8e2b6080ea340bb1e81a3**；CI47待驗收文字已由本次真實閉環取代，不重跑歷史。

## 目標、順序與架構

完整《超時空之鑰》HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、单人／同機雙人共畫面、全部時代主支線與結局。不改ARPG、不縮為序章。先讓前段場景、人物、美術建模動畫、鏡頭遮擋HUD、操作與聲音取得真實品質證據，再擴後段；90是達標後的驗收結果，不是特效開關。

TypeScript＋Babylon.js＋esbuild自含HTML和固定package/lock保留，玩家不需ROM/Python/帳號/後端。Controls→main固定1/60秒→core規則→render/HUD/audio。CPU相容呈現重用既有場景圖，不重造遊戲關卡規則。音畫不決定傷害、資源或劇情；暫停／背景／對話／背包／原生選檔／context loss凍結模擬，恢復不補跑背景時間。InputBoundary清舊輸入，A*保留碰撞。P1克羅諾／P2露卡與劇情入離隊所有權、自主第三同伴瑪兒／青蛙、独立選敵與雙確認合技保留。不新增P3、不假存檔通關、不弱化斷言或timeout。

## 已有功能與完整範圍

已連貫家中醒來／樓梯→縮尺區域圖→千年祭行為初遇→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→王后大臣救援返鄉→護送被捕與两裁決→敲門越獄或等露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇，經驗紀錄不是完整等級成長，已完成章節不因舊pending重開。

梅爾基歐商店與武器／身體／頭部裝備已有角色相容、穿戴份數、金幣库存守恆與交易上限，不能賣仍穿戴品。400G、13商品、價格與普通攻防增減是明示暫定重建，非原作數值認證。完整成長、技能學習、報酬、消耗品經濟、飾品與自由換人未完成。

IndexedDB／JSON白名單v1-v8保留；舊檔未知行為不補造證詞，查看不強制改寫，本人存檔回溯合法而非防作弊簽章。snapshot/view/audio/cpu/frame統計只讀，不設可寫通關hook。CPU專項同run真匯出v2不取代原裝備v8或其他存檔旅程。渲染偏好與統計不寫入遊戲存檔。

## 已保存美術與品質限制

A/B/C主角與鏡頭接地，P祭典道具棚布，S地面取樣，T探索HUD，U觸控context，V固定tick動態/reduced-motion，W局部光照銅材質六樹根八陰影，X細鋪面／分區grassmask，Y投影閱讀性／caster合併／20石材倒角全部保留。C角色播放重用原片段與影格，固定tick動作、實際位移步伐、96格CPU快取。A七段自製短曲和B靜音清理保留，非原作OST／完整曲庫。不重畫保存素材，不套回舊independent-ui。

欠缺承諾的精緻HD-2D仍是交付落差。木料平塗、人物植物／立體道具材質語言、尺度輪廓與直向地標構圖仍需改善；家中升級母親家具、完整動畫音樂仍未完成。既有母親對話通過不代表新母親美術整合。測試數、模型數、引擎、短曲、CPU相容與FPS標示均不能替代美術90證據；舊30stale、release仍blocked，不新增品質分數。

Z0.9.22材質／UV／直向構圖仍雲端保存且未發布，實際安全封鎖沒有新允許結果。不得重送、改編碼管道、間接替換或部分提升。prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a與本機browser限制保留。這不等於GitHub／Drive不可存取。

## D/E既有CPU能力與CI47／Pages41閉環

D已實作WebGL2/1不可用時的預設CPU／Canvas2D fallback，實際做既有頂點／矩陣、簡化光照、UV紋理、透明深度与像素填色，不是NullEngine空跑或只顯示錯誤。640×480像素cap、最大邊1280、紋理32MiB/512格；不做shadowmap/glow/specular，不能保證WebGL視覺一致或全裝置流暢。E保留像素規則並減少無效裁切／畫面外submesh計算、重用每幀光線方向，真實work計數保留。

最新已驗收 **E0.9.27 sourcef07a42bfa7357e1a9ddcebfa8a790855927051b4／tree00efc6b0ea450961739948a952bd2756ea7f2eb1**。CI47 **35615882220** push/attempt1 success updated2026-09-21T15:22:33Z，validate106386347752/good106386347748/bad106386347601全成功。13最終主報告、9原native加1CPU native、三lane＋render＋CPU五ledger及列入bytes/hash核對，均由原source verifier只讀精確重現，不是重跑browser。

原兩條CPU原生旅程在disable-webgl/defaultauto走完家中楼梯／母親／大地圖／祭典、P1/P2分開操作、岡薩雷斯ATB勝利、IndexedDB與同runv2原生匯入。九CPU原圖/work計數通過。原音訊、角色播放、HUD／地面／正常暫停減動態／接地ATB／裝備金幣庫存v8／完整審判與故事保留；觸控load4927.24ms、原30000ms不鬆、兩視窗與trace123項CRC。

Pages41 **35618506663** prepare106395338147/deploy106395411907成功，HTML5675518bytes／SHA256bbfdb7f259150ec583c4b86b71c8578cbaebce24257d87f0876274cc37979e56與source/CI/playable/staged匹配。公開HTTP來自2026-09-21T15:26:48.2571224Z成功deploy步驟，非新本機live-byte/browser。實際9CPU/9場景/4actor/5render圖已檢視；單次祭典CPUframeMs23.1–50.4不是持續FPS或控制變因加速比較。E歷史Node基準與5000triangle／22graph差分保留，但不當真機證據。CI47正式收據關閉此批；CI46、CI44與更早不重開，不補造CI45獨立驗收。

## F／0.9.28整批完成，CI48待驗收

Source **38edba36ccd75a3ef8129aea62d21769d847f749**，tree **d5dbe994553244225992594452379ff38b49b9dd**，parentde92955eb4946ff766f8e2b6080ea340bb1e81a3。19檔一次非force發布並回讀，完整src/tests/scripts和index與已測內容一致，workflow不變。原最新docs子樹保留。新跑 **1161Node／220Python／assets／typecheck／build** 通過，初次6個pin失敗及中途1160結果均保留；沒有把舊結果寫成本次新跑。

修正CPU固定cap抵消密度調降：先確定原CPU基準cap再乘auto0–3層、quality0、compatibility2。初始auto畫布不變，後續層級真正降低像素。原WebGL密度與30warmup+90samples閾值保留，不改人物尺寸、場景、相機或ATB。較低buffer會犧牲清晰度，不冒稱無成本效能提升；原生品質選單可覆寫。

新增最多120個活動影格迴圈間隔，排除開始／恢復邊界與暫停，保留有效活動長幀，唯讀平均/P95/max/FPS。不是GPU時間、螢幕實際呈現延遲或裝置認證。頁腳識別CPU/Canvas2D而非WebGL0，顯示取樣／暫停狀態；build-meta與runtime共用version/batch/source身份，清除靜態0.9.17及舊章節版本。六項明列main文字／診斷逆向比對維持原expectedhash與22遊戲函式，World/core/input/save/camera/CPU raster/scene/held檔不改。

原CPU旅程僅追加>=60真實intervalsample、正確backend/build/source文字、原生quality/compatibility实际buffer及完整pausedstate相同；加cpu-quality/cpu-compatibility兩PNG至11張、CPUledger14files。原13主9native與CPU native、五ledger、audio/actor及原断言timeout全部保留。單元port與合成fixture不是原生證據，本機未操作browser。詳RUNTIME_DIAGNOSTICS_T05／CPU_RENDERING_T05。

**CI48 35634970145** push/attempt1，最後in_progress/null updated2026-09-21T17:54:36Z。未驗收，沒有F新Pages／after圖／真機／90分結果。此批把真正sourceSHA嵌入HTML，故CI與source=null本機HTML bytes/hash不同是預期；用同runmetadata/HTML/Pages匹配，不拿localhash作假failure。pending保存回報不長等／取消重派；failure查同run第一根因；success看全部最終報告、實圖、原包雲端與部署身份，不以progress/fixture或綠勾替代。

## 完整剩餘與雲端

T03隱藏規則版本差異／完整拓樸／數值；T04成長報酬掉落／全經濟飾品／技能角色雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來／其餘時代主支線結局；T07整體90／每面向80%／zero-critical／必需素材五gate／實體輸入FPS-frame-time載入記憶體背景存檔音訊與全章CPU；T08每批雲端回讀。不縮分母、不只評已完成功能。F提供活動影格觀察不等於持續真機驗收；所有實際品質缺口仍列待辦。

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。已驗收CI47原包 **1mwt02LrSZpAIIIlQtv8QWFtb78aCcd35**，54510480bytes/14manifest/六原ZIP；F最終包 **1jDHFP8Mmd58iZNK5A-8spp_9KLphxjtG**，2026104bytes/34manifest/19changes/11logs與269programfiles。兩包下載hash/CRC/parent/manifest全核對。F較早同ID包已於發布前更新，最終hash見VQ02F_CLOUD_RETENTION；封存nullsource是歷史時點，GitHub補身份不重寫logs。exactE tar/Fassembled快照供恢復，最新main文件另讀，不覆蓋進度。詳DELIVERY_INDEX。

工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules保留esbuildhardlink，不覆蓋舊source/config、不開bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳、不公開ROM／原圖原音訊／字型／憑證。所有程式文件驗證回GitHub或正確Drive並回讀，文件[skip ci]，不依賴臨時容器。
