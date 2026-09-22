# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-22-vq02o-ci57-pending。權威入口STATUS／TODO／IMMEDIATE_CONTINUATION／CI57_CHECKPOINT。更新既有計畫而非重新規劃；N詳細歷史保留於e5174d5c760b683137311b80ad71725d134a28e5，完整範圍不縮。

## 目標、架構與既有內容

完整HD-2D重製：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮室內切換、原地ATB、單人／同機雙人共畫面、全部時代主支線結局。先改善前段實際美術、建模動畫、鏡頭遮擋HUD及操作聲音，再擴後段。90分必須依實際驗收，不是AI自評、特效或測試數量。

保留TypeScript、Babylon.js、esbuild自含HTML及固定package/lock；玩家不需要ROM/Python/帳號/後端。Controls -> main固定1/60秒 -> core規則 -> render/HUD/audio。音畫不能決定傷害/資源/碰撞/故事；CPU與WebGL共用原場景，非第二套關卡。暫停/背景/對話/背包/原生選檔/contextloss凍結模擬，恢復不補跑背景時間；InputBoundary清舊輸入，A*保留碰撞。

P1克羅諾、P2依故事，露卡加入／回歸與瑪兒／青蛙自主第三不變，獨立選敵、雙確認合技、無P3。既有家中醒來樓梯、縮尺世界、祭典行為初遇、項鍊異變、600山道托魯斯森林王城、修道院青蛙／暗門／亞克拉救援返鄉、護送審判與兩條越獄、弗里茲露卡、龍戰車三部位、重聚時門及2300抵達全部保留。2300抵達不是完整未來篇；經驗紀錄不是完整成長系統。

梅爾基歐13商品、武器/身體/頭部裝備、角色相容/份數、金幣庫存守恆與交易上限已在既有流程。400G/價格/普通攻防增減為明示暫定值，不冒稱原作。完整成長、技能、報酬掉落、消耗品經濟、飾品及換人待完成。IndexedDB/JSON白名單v1-v8保留，舊檔未知行為不造證詞、查看不強制改寫；守恆非防作弊簽章。診斷與render偏好不進存檔。

角色新像素片段、固定tick動態/實際步伐/cache、鏡頭接地、祭典道具棚布地面、探索HUD/觸控、光照銅材質、樹根陰影、石材倒角及caster合併沿用，重用保存素材。七段自製短曲和靜音修正不是原作OST/完整配樂。材質語言、木料平塗、人物植物道具尺度輪廓、窄地標、升級母親家具、全動畫及聆聽品質仍有落差；held素材不得擅自提升。

## CPU能力與技術基準

先WebGL2/1，不可用自動使用真正CPU triangle/texture/depth rasterizer輸出Canvas2D RGBA，不是NullEngine空跑/錯誤頁。保留640x480像素cap、最大邊1280、32MiB/512紋理、保守剔除/三角形快速路徑/光向量重用/實際密度tiers。CPU不做shadowmap/glow/specular/postprocessing，不保證與WebGL視覺相等或真機流暢。FrameWindow記錄120個真正活動renderloop interval，mean/P95/max/FPS不是GPUtime。

可選遠景平滑預設OFF。J/K從原texturebytes生成boxmip，按log2足跡連續混合含1<rho<2；三角形選層，整數單lookup/分數雙RGBlookup。放大/無效/透視/alpha/opacity/blend/cutout/vertexalpha保留nearest輪廓。關閉/dispose釋放mip，原budgets/asset/UV/鏡頭不改。

最後accepted **K/0.9.33/source3028e2499d5a268d20c5251a3aec6e8c2c5a09e2/CI53 35684197933/Pages47 35685874454**。3jobs/13主流程/9原native+2CPU native/6sourceledger及全部列入byteshash核對；CPU兩旅程10legs+600前段30legs/本人v3-v4/兩獨戰/兩劇情暫停/LuccaP2/修道院入口已驗，22CPU原圖檢視。平滑ON改真canvas，OFF精確還原/mip釋放/fullpausedstate不變，不等於消除時間閃爍或美術合格。61活動samples約17.0125FPS不是持續效能認證。

Pages47 selectedsourceK；playable/staged/deployed HTML同5690213bytes，SHA2563fda62047f3d6d5d1ce308534e51856a0da6ce0d88f531ad85b90d6af18c0a39。沒有額外本機HTTP/browser驗收。不重開CI51/53及更早閉環，CI52/54/55/56不回填成功。

## L/M/N延伸與本次O

L以CI-only adapter重用原rescue/trial browser本體：--disable-webgl/auto/平滑OFF，本人同run CPUv4->rescuev5->兩條監獄v7/龍戰車/2300，chooser/IndexedDB不變。67coordinatelegs、4遇敵/2實體提示、17里程碑及真canvas/state/renderer/PNG；返鄉祭典和未來入口各3個不重疊>=120draw活動窗口，保留120frame統計/texture/browserheap，非RSS/長時間/真機認證。第七ledger先验原CPU/era父鏈再驗新報告/存檔/files/statistics，原六gate不放寬。

M固定語意AST結構取代跨Python版本ast.dump顯示格式，保留None/empty/listorder/type，基準由CI53原Gitarchive算出。CI55已通過Python3.12gate和原CPU/600/平滑。CI55新增救援到9/10里程碑36/37腿後，在托魯斯P2偏移令間距3.5815887>原3.5，正確等待同行者。N保留原目標與一份P1距離tick預算/30秒/.12/250ms/256上限，遠距共同按鍵、近距獨立修正，兩owner放鍵均到位；verifier拒絕錯owner/按鍵順序/不連續snapshot或未操作角色及垂直軸漂移。N九檔已實作，不重寫。

**CI56 35706073669/source3f65ae23b2b09be1bb4c23ed559003ae541fe1d3 completed/failure**，updated2026-09-22T09:05:32Z。首敗step21原CPU第二旅程第一co-op z=-2，第一家中到祭典已過。0/17ms短hold皆移動4ticks，真放鍵位置在-2.133333333333331/-1.8666666666666643間反覆，兩端誤差約.133333未達<.12；8pulses185/165ticks。N救援/trial skipped，不能以此證明其失敗或通過。原CPUfailurePNG有完整祭典/雙人，非WebGL啟動失敗。4passedpreCPUledger35列byteshash核對，未重執行verifier；後續缺ledger是結果。CI56無playable/Pages/整體驗收。

**O九檔**只在觀察兩次短hold反向越界且都未到位後改傳輸：公開Playwright keyboard.press執行最內鍵down/delay/up，保留外鍵順序，消除Python往返造成的額外heldinterval；相同方法接入N獨立精準修正。不是JS合成事件、CDP或注入遊戲時間。成功仍須真afterRelease<.12、原tick預算/one30s，不保證sub-frame精度。只重估傳輸成本，不重設tick/deadline；部分dispatch失敗釋放全部已嘗試鍵且保留首因，driverOperations保留attempted/completed/failed。

原native_pulse本體、原CPU/600/rescue/trial browser旅程/目標斷言、Ncoarse/雙owner規則及verifier、全部src/index/.github均未改。原Ihelper驗證只反向移除明示O接線後比舊hash，不換expected；數值語意突變仍fail。新增15Python含12方向軸drivercost、8雙owner精準、3既有core案例。原0/17ms負例重現，延伸66ms plateau及driver0/1/2tick是模型假設，不冒稱原生實測；不可達精度仍按原budget失敗，constructedsnapshot不進browser或存檔。

O **0.9.37/source9425f58c423897be08fe1ca0d810ec9d6088f7b3/tree8e9b4f10329ddfe3b482670efac1b4229039ce07** 一次non-force發布且main回讀，整個程式tree與已測版一致。最終 **1339Node/320Python/assets/typecheck/build/fullnpmcheck/diffcheck通過**，無本機browser。唯一 **CI57 35712112661** push/attempt1，最後in_progress/null（2026-09-22T09:44:48Z），尚未看jobs/驗收，不長等或再開CI。

## 驗收與完整剩餘範圍

CI57須原三jobs完整13報告/原native+CPU/audio/actor.playback/HUD/正常暫停減動態/接地ATB/觸控/裝備v8/完整審判及六ledger，再完整CPU兩旅程/600/救援/審判/本人v4-v7及alternatecell/67legs雙人放鍵/4遇敵2提示/17PNG/6窗口/第七ledger。額外檢視O真driverOperations與releasedsnapshot。全部sourcebound byteshash/實圖/成本核對，再Drive raw下載及同CI Pages selectedsource與HTML一致；不能拿本機source=nullhash做基準。原生閉環之後依TODO改善觀察到的相容效能、長時間/真機、前段材質尺度輪廓地標、完整動畫及合法音訊聆聽。

T03：隱含規則/版本差異/全拓樸/數值忠實。T04：成長/報酬掉落/全經濟道具飾品/角色/學習技能及雙三人技。T05：完整美術/動畫/合法音訊，前段真實品質優先。T06：完整未來及其餘時代主支線/結局。T07：全scope>=90、每面向>=80%、requiredassets/fivegates/zerocritical與實體裝置輸入/FPS/frametime/loading/memory/background/saves/audio。T08：每批實作測試、一次nonforcesource、完整matchingCI、正確Drive及raw回讀、[skipci]文件。不縮denominator；2300arrival非fullfuture，old30stale，無新分數、美術/真機/全遊戲認證。六短窗口不替代長時間；不因綠勾預設平滑或擴後段。

TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三及家中至2300/equipmentv1-v8保留；無branch/PR/P3/ARPG/framework重造。HeldZ/升級母親家具/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a保持，不間接替換或局部提升；本機browser限制保持。禁可寫time/state/save/collisionhook、偽原生成功存檔及公開ROM/原媒體/字型/憑證。

## 持久交付

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。最新 **Chrono-CI56-terminal-VQ02O-tested-batch.zip /1zRzBn2uz9QOsg0kQ84LWllgEialwf7mL**，51889991bytes，SHA256 **4b99193b4b6a6d6c108586de77ccf90d569812ffee3e08c9ed8c59a7a6a11a8e**，28manifest/298程式檔/4未改CI56原ZIP；下載hash/CRC/manifest/parent已驗。包內source=null是發布前歷史，最新main docs優先；assembledsnapshot不是Gitarchive，不使用本機假ancestry推送。先前N包1irVUTuklzPVqGjRd2cBCbGPlZo8YcRqn及K原始包1h9THuGPcjSkcAPIIdqIeWPO7-5M2u7Kf不重抓。

工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuildhardlink；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳/公開。每批原始log/產物/程式/文件寫回正確雲端並回讀；文件使用[skip ci]。臨時容器不是authority。
