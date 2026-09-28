# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04c-art-first-ci100-pending**。Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT **v36**。唯一main/singleAI/nonforce；Root T05-early-visual-cohesion，execution T05-early-production-art。

前版完整B白皮書blob **08a94d9533310fcc4aae57b2c2eef2e875b9cb2c** 原封保存在 **evidence/VQ04C_PREVIOUS_WHITEPAPER.md**。未改的詳細架構、數值、既有音訊設計、歷史收據及完整分母繼續有效。本版覆蓋其B/CI99 pending狀態，不需重读更早歷史或重做已完工作。

## 一、產品與品質

完整《超時空之鑰》HD-2D，像素角色＋立體場景、瀏覽器優先、原作背景／辨識度／構圖、縮尺大地圖／城鎮／室內切換、原地ATB、單人與同機雙人、全部時代主支線結局。2300抵達非完整未來篇，不縮成demo。前段未舒適不急擴後段。

使用者認可山道／法庭concept是美術目標，不是runtime批准。實際程式與素材必須接進正式遊戲，不能只產圖給使用者；也不能一輪輪動畫邊界維護替代美術。完整角色／敵人／NPC方向與動作資產始終在範圍內，保留舊baseline不代表免除重畫。

整體>=90、各面向>=80%、requiredassets/fivegates/zerocritical，需真實畫面、遊玩與裝置證據。當前未達概念級品質，art/fullAnimation/原速/聆聽/真機/長時段/wholegame批准false，newScore=null，releaseBLOCKED。工具歷史30/100不屬於C新評分。

## 二、固定架構與驗證邊界

TS/Babylon.js/esbuild與固定依賴、自含HTML無CDN/ROM/後端需求；Controls→固定1/60simulation→core→render/HUD/audio。呈現不決定HP/ATB/collision/save/story。P1/P2/自主第三、独立選敵與雙確認合技、InputBoundary/A*及v1-v8 IndexedDB/JSON保留；不加P3、不改ARPG、不重造框架。

暫停／背景／對話／背包／native選檔／context loss凍結simulation，恢復不補跑。CPU與WebGL共用入口與規則；CPU triangle/texture/depth fallback不是另一個低品質遊戲。640×480cap、最大邊1280、32MiB/512entries/120活動FrameWindow、既有nearest與mip釋放不變。原native route/tick/key/wait/capture/assertion/golden/<.12/單一30秒/250ms-256/CPUmemory品質門檻不可放寬；不使用localbrowser或native state/time/save/collision注入。

ArtDirectedWorld仍只在原World的同scene組合art passes，四參數draw原樣轉交，沒有新renderloop或test/device專用模式。held prologue blob2711a74185aacf3c6bddf9db85ba99a2afbc507a和母親家具不得直接／間接改動。

## 三、C實際美術增量

新增early-scene-art確定性像素與early-scene-finish結構allowlist，12root套入16表面：城堡、王后房、修道院、地下通道、祭壇、王城、監獄五區與橋、山道。安靜小石板／接縫倒角／牆邊層次、雕槽柱、砌石、木框、布料、鐵件和彩窗；64靜態柱圈／雕槽／外岸近景植物。原橋界線採bridgeDeckPixels；透明囚門alpha .42保留，不處理actor、key、flame、秘密門陰影。詳PRODUCTION_ART_VQ04C.md。

16表面rawRGBA合計3,936,256bytes，lazy共享只上傳一次，場景重返不增生，dispose釋放；這不是完整遊戲記憶體。原A/B13環境、法庭27＋山道1構件、1000森林及配角色料處理都保留。C沒有全角色重畫，也沒有改相機或原結構transform/collision。

build由相同runtime函式輸出16PNG＋manifest到dist/art/production-vq04c，原A/Bexport路徑及CI workflow保留。解碼逐pixel同源，非截圖或概念背板；新素材以獨立manifest記錄，主assets/manifest.json未改，required資產仍未全完成。所有素材與OFFLINE作者圖／driver放Drive專案包。

## 四、工程測試與新原生審查

C20個source/test/build檔合批；完整3220Node/609Python/asset/typecheck/build全過，新增60Node/4Python，625其他程式inputs保持byte-exact。current C實際應用測12場景framebuffer改變但State／角色源格／原幾何／相機不變；十個非目標framebuffer與B相同。資源重用／釋放、橫直取景、bank atlas、橋界及囚門有覆蓋。frozenBcomponent與currentC分開，source-only inverses不得處理native/image/State，舊hash不重寫；早期失敗與最後成功logs都保留。

CI99／36342361270與Pages93／36344129732已success，獨立B來源。這輪限定審查3lane manifests／29原始entry SHA/size、7ZIP、部署payload與4張static原圖。B法庭裁切在原native路線上解除；沒有新native numeric top宣稱，舊.097628仍只offline。Pages tar對上9payload檔，staging空.nojekyll未包入已明示，不假稱10項全同。沒有新全motionledger/video/listening/device批准。CI98仍failure，不能借B回填。

## 五、發布與持久成果

C source **0aefa412e71d522dc1b667b9fcdf850f8cf4e65c**，tree **7f352b9553cbb7c4ffdf3283454b1f524c66677d**，parentb201464cf848673e75a08f4d859d5645a728e6c2。remote src/scripts/tests/fullroot等於已測tree，保留最新Bdocs，一次non-forcepush。Matching **CI100/36349691934** push/attempt1 exactC，最後in_progress，providerupdated2026-09-27T20:53:43Z。尚無C原生或Pages批准。

唯一Drivefolder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。C最終包 **1krZ_U705oJiiBbgX9wOfyw73G3tPAUzt**：2528924bytes、SHAf5f6df4d7d56d8b127e61ba710d87cd6e801899b75527d04da0af99b62e897ca、88manifest／650snapshot／16PNG；真正下載核對parent/size/hash/CRC/exactmanifest/snapshotbytes完成。CI99/Pages93包 **1d7iHSDTGUyLRqmy8Ckxy7r3EEXoX5nie**：102263339bytes、SHA69bb250407d2914821611344b35cef946b518cc2001d7224fccc3c155014d29b、7ZIP／10manifest；同樣下載完整回驗。詳DELIVERY_INDEX及兩份evidence收據。

## 六、接續與完整分母

只接CI100新原始畫面／必要動態／source及matchingPages，pending不長poll、不重送C、不rerun已測批次。接著面對仍未完成的party/enemy/NPC四方向／move/attack/hurt/down/death與原型感，繼續原作前段構圖、山道北端銜接、場景遮擋與品質收斂。不能用環境材料數代替全部美術；合法完整音訊／聆聽／原速／真機長時段仍需實證。

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全美術建模動畫合法音訊；T06全時代主支線結局；T07整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio；T08fulltests/onesource/matchingCI/cloudoriginalreadback。分母不縮。

Y/CI96及W/CI94有限接受保持closed；CI97/Pages91provider成功不冒充新全包接受；CI93/95/98保持failure。Tank/Yakra完整death、Henchoutgoing、Pdown、Q受擊selector-change仍open，不造樣本。ROM/media/fonts/credentials私有；工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/esbuildhardlink，不覆source/config、不另bootstrapCI。全成果GitHub/指定Drive/readback，docs[skip ci]，臨時環境與封存false旗標不是current authority。
