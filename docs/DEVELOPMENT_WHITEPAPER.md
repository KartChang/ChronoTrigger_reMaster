# ChronoTrigger reMaster 開發白皮書

版本 **product-2026-09-25-vq03g-ci77**。動態authority：STATUS、TODO、handoff/IMMEDIATE_CONTINUATION、evidence/CI77_CHECKPOINT。本檔整理目前架構、保留功能與驗收界線；原始歷史收據、失敗報告與雲端產物不改寫。

唯一current root **T05-early-visual-cohesion**；terminal **CI77-audio-presentation-evidence**。VQ03G／0.9.54 source **fe7b733640263800ab419358b7dfcf3109bed6f6**，root **ac7940e93467103c2350cf84bd30f9e50ee3ac16**；parent **b6c3f33a4176d9f7c446d2eb84a0ef6c03a565a8**。18檔已一次non-force發布並回讀，不重送C/D/E/F/PNG/G。Matching **CI77／36046993131**，push/attempt1，最後觀察 **2026-09-24T19:16:18Z／台灣2026-09-25 03:16:18** 為in_progress/null，G尚未accepted。最後限定範圍技術基準為CI76／Pages70，不是全美術、原速舒適性、聆聽或全遊戲接受。

## 一、完整產品目標

完整HD-2D重製：像素人物搭配立體場景、原作辨識度與場景构圖、縮尺大地圖、城鎮與室內切換、原地ATB、單人與同機雙人共畫面、全部時代主支線及結局。先改善前段實際美術、建模、動畫、鏡頭遮擋、HUD、操作與音訊，再擴後段。不得把全遊戲目標改為前段展示，也不因CI綠勾提前擴後段。

整體>=90、各面向>=80%必須依實際畫面／遊玩／裝置證據與既有required assets、five gates、zero critical驗收；測試數量、文件完整度或新特效不等於美術分數。原工具30/100評分卡屬較舊runtime，不是目前G評分，release仍BLOCKED。

## 二、架構與不能改變的行為

保留TypeScript、Babylon.js、esbuild及固定package/lock；玩家執行自含HTML不需要ROM、Python、帳號或後端。Controls → main固定1/60秒 → core規則 → render／HUD／audio。音畫只呈現既有狀態，不決定傷害、資源、碰撞或故事；CPU與WebGL共用原場景與規則，不是第二套關卡。

暫停、背景、對話、背包、原生選檔及context loss凍結模擬，恢復不補跑背景時間。InputBoundary清除舊輸入；A*遵守既有碰撞。P1克羅諾、P2依故事；露卡加入／回歸、瑪兒／青蛙自主第三不變，獨立選敵與雙確認合技保留，無P3、不改ARPG、不重造框架。

IndexedDB與JSON白名單v1–v8相容，舊檔未知行為不造證詞、查看不強制改寫。守恆檢查不是防作弊簽章；診斷與render/audio偏好不放入遊戲存檔。禁止原生測試注入game/time/save/collision state，禁止改走位／sleep／tick／畫質來取得通過。

## 三、已存在的玩法範圍與尚未完成之處

保留家中醒來與樓梯、縮尺世界、祭典行為與初遇、項鍊異變、600年山道／托魯斯／森林／王城、皇后消失、露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲與露卡、龍戰車三部位、重聚時門及2300抵達的既有流程。**2300抵達不是完整未來篇**；仍須全部時代主支線與結局。

梅爾基歐13商品、武器／身體／頭部裝備、角色相容與份數、金幣庫存守恆、交易上限與裝備後戰鬥仍在原流程。400G、價格與普通攻防增減是明示暫定值，不冒稱原作完整數值。經驗紀錄不是完整成長系統；完整成長、技能學習、報酬掉落、消耗品經濟、飾品、換人與雙三人技仍按T04完成。

## 四、前段畫面與CPU呈現基準

既有新角色像素片段、固定tick動畫與實際步伐／cache、鏡頭接地、祭典道具棚布與地面、探索HUD／觸控、光照與銅材質、樹根陰影、石材倒角和caster合併均保留。Held VQ01Z／母親家具不得擅自提升、換管道或間接替換；prologue-render.ts blob固定2711a74185aacf3c6bddf9db85ba99a2afbc507a。

先嘗試WebGL2/1，失敗後使用真正CPU triangle／texture／depth至Canvas2D。保留640×480 pixel cap、最大邊1280、原tiers、32MiB／512entries及120活動FrameWindow；CPU不提供shadow map/glow/specular/postprocessing，不承諾與GPU同畫質或真機流暢。P row-span／packed-clear最佳化沿用；J/K平滑預設OFF，opaque-affine可縮圖混合，alpha與透視仍nearest；關閉或dispose釋放mip。Node benchmark與六個短窗口不是原生長時間FPS。

Q七個story NPC與原四姿勢、R戶外地表／樹冠／蕨類、S六組64×64建材及原80×40自繪INN／床圖、T五花箱與響應式暫停介面、U Space原生checkbox修正、V八窗框／八窗櫺木紋與八玻璃pane、W原inn-sign XY2.75及anchor[-4.7,2.4,-3.4]均保留。這些有技術證據不代表全美術完成。

X直式Truce同buffer构圖和HUD安全區[.045,.955,.12,.80]；Y依完整故事state推導實際在場角色，不把joined旗標當在場證據。Z招牌降至.30，A四棟各26部件共104mesh僅遮擋群組降至.16，原9tick指數與12tick保持、私有blend還原仍在。B必要隊伍優先，可選旅店地標使用1.5/1.6幾何遲滯；成本太高只移除地標取景要求，不隱藏mesh或裁切P2／guest。原鏡頭state／resize／reduced-motion重設不重做。

C讓原山道／森林小怪採preservePixelPalette單一unlit emission；原drawImp、24×32 nearest-alpha、五RGBA採樣、幾何位置尺度／數值與出現規則不變。兩張field原PNG及CRC／實際像素gate與20村莊圖、原完整影片共存。D以原植物alpha遮擋保護腿部／腳底標記，並修CPU透明建物背面覆蓋，不是重新製作原場景。E/F將既有減少動態偏好傳入王國／救援／祭典證人商販／法庭監獄NPC，採原frame0和current-tick恢復，隱藏時停止貼圖更新、dispose釋放binding、穩定seed與私有貼圖；森林時門只停止非必要旋轉，必要任務動作保留。

人物／植物／道具尺度輪廓與原作構圖仍待改善。CI76觀察的森林時門地面雜訊、法庭稀疏屬製作品質缺口；G音訊批次沒有改善它們。完整角色動畫與原速走位／淡化／viewport舒適性也仍待實際驗證。

## 五、CI76已完成的限定範圍接受

F原source456446c3f2e3b6c38425800542c76ac4f92ae355早已發布；舊文件一度落後造成重疊E-based本機實驗，提交前已排除，investigation-only從未發布，不當成本輪source。CI75／36025802235在新增WebGL witness PNG gate失敗：真實960×640原圖誤用CPU307200像素上限。修復source19697fc3758b7fd484826a61dc2a98b7ddd6837e只分離WebGL證據decoder，限定614400像素／1280邊／4MiB，保留CRC／RGB-RGBA8／filter／解壓界限；原CPUdecoder、runtime、nativecapture與state/frame/hash/exactrestore斷言不變。**CI75仍failure，Pages69 skipped，歷史不回填成功。**

CI76／36037654752已於2026-09-24T18:30:23Z成功；三job包含實際CPU600／救援／審判及修復後WebGL gate。原十份ledger由未修改exactsource唯讀重算173列逐byte相同，432原始檔未改，source archive root與heldblob一致。Pages70／36041702741 selectedCI76/source19697fc/artifact10826509408正確；playable/staged/deployed HTML5731566bytes、SHA256b083f7f07c7da3f4a36f01525a5303cf0de55ae8d3eeffab67d484706e2f3f15一致，公開HTTP exact-bytes步驟成功。沒有本機HTTP/browser重播。

99CPU＋3WebGL共102原圖以聯絡表檢視，6張全尺寸：WebGL witnesses before/reduced/restored，以及CPU fair-vendors/courtroom/forest-gate reduced；其餘96張只看縮圖。179.88秒原片全解碼，360個連續2fps樣本／12聯絡表已審查，無全尺寸影片樣本。**不是原速播放，無音軌／聆聽／真機／長時間認證。** 收據CI76_ACCEPTANCE，acceptance commit b6c3f33a4176d9f7c446d2eb84a0ef6c03a565a8。

CI76取代CI73／Pages67的有界技術基準，CI73/72/70及更早已接受技術工作不重驗。CI71中斷視覺審查的歷史accepted=false保留，沒有回填CI71_ACCEPTANCE。較早完整decode或2fps抽樣也不能換成原速舒適性通過。

## 六、G自製音型與音訊生命週期

VQ03G／0.9.54只在runtime修改scene-audio.ts及新增sound-effect-score.ts，配合測試共18檔。原frequency API接入七組自製合成音型，262管風琴、330短促降頻、440原互動单音、520技能滑音、620恢復上行、660鐘聲與合技共用雙音、800時門上行；其他合法40–4000Hz保留原單音。最多3聲部／音型level總和<=.04／含尾音<=.5秒，仍共用原16聲部與master .55。這些是排程参数，不是聽感、音量安全或全配樂認證。沒有ROM／原版OST／第三方音效採樣或外部音訊服務。

單一audio-clock錨點維持聲部相對時序，不加timer或simulation tick。聲部不足時丟棄超额部分，不排背景補播；滿載可能只播放部分音型。main原觸發點完全保留，緊接對話或hold的音效仍可能立即停止；不為了聽到全部音型而放寬hold、加入sleep或延後對話。原七段自製配樂不改，也不是原作完整OST。

初始AudioContext/master/analyser圖全部建立連接後才登記持有；中途失敗分別清除handler、斷開節點、嘗試close。oscillator已建立但gain失敗、後續音型聲部失敗、start/stop/連接例外均清理，不因其中一個cleanup錯誤而跳過其他部分。已成功排程的聲部計數保留實際發生量，即使後面失敗全部取消。暫停／靜音／reset／dispose仍立即關閉master、stop/disconnect，不恢復舊音效。analyser重用1024個Float32樣本且仍讀實際值，hold時不造零，dispose後不再讀取。詳AUDIO_PRESENTATION.md。

main/core/music-score/render/held prologue/assets/workflow/nativecapture逐byte保留。原生音訊旅程仍驗證它實際執行的music/analyser/hold/import/mute範圍，沒有新增人工觸發或人造遊戲state。因此七音型的unit成功不能推導七音型都在原生遊戲觸發、已聆聽或完整音訊完成；聆聽與實際裝置驗收仍開放。

## 七、G測試結果與目前CI界線

最終完整npm run check：**2191 Node通過、零失敗／零跳過**；Python **401通過**；**143針對測試包含於Node**。assets/typecheck/build/check/diff與**452程式輸入指紋**檢查前後、發布前一致。原七組配樂與exactCI76音訊基準逐排程比較，涵蓋hold／reset／state replacement與跳過過期節拍。明示WebAudio unit ports只驗證參數及節點生命週期，不冒充原生聲音。

G→F僅還原精確build/test註冊片段，原19個F→E SHA256與missing/duplicate/unrelated負向測試保留，Node/Python鏡像驗證；不是整檔豁免。原WebGL PNG負測試已加入完整Node執行清單。最初工具timeout未完成，以及清理／Node-Python舊指紋失敗logs全部保存，不能當成已通過；最終結果綁定實際發布程式。沒有本機browser。完整收據與loghash：VQ03G_TESTED_BATCH.json。

G source已一次發布並回讀，整棵rootac7940e等於已測452程式加當時main文件。CI77／36046993131最後觀察in_progress/null；原始三job／主報告／十ledger／完整CPU旅程／音訊回歸、matchingPages及雲端原始產物審查尚未完成，G accepted=false。不能拿CI76收據、G unit排程或無音軌影片當CI77音訊接受。续作只查exactrun一次，仍active保存checkpoint，不久等或重送。

## 八、完整剩餘範圍

先完成CI77_CHECKPOINT.remainingReview；失敗保留原artifact，只修同root實際缺口，不改路線／時間／畫質／斷言。成功後继续T05尺度輪廓／構圖製作品質、完整角色動畫、完整自製或合法授權音訊／實際聆聽、原速移動與淡化舒適性；不重新做C/Z/A/B/D/E/F/G或擴後段。

T03：隱含規則、版本差異、完整拓樸與數值忠實。
T04：完整成長、報酬掉落、經濟道具飾品、角色學習、換人及雙三人技。
T05：全部美術、建模、完整動畫與合法完整音訊，前段實際品質優先。
T06：全部時代、主支線與結局，2300抵達不是完整未來篇。
T07：整體>=90／各面向>=80%、required assets／five gates／zero critical，以及真機輸入、FPS/frame time、載入、記憶體、背景、存檔與音訊。
T08：每批實作測試、一次source、完整matchingCI、原始產物雲端保存及回讀。

分母不縮，沒有新評分、完整美術、原速舒適性、聆聽、實體裝置、長時間或全遊戲認證。

## 九、持久交付與固定限制

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。G最終已測包 **Chrono-VQ03G-audio-presentation-batch.zip**，file **1eZQt5-o8ubX3Sfx-lmL6RDttuGN0a3Li**，1027848bytes／SHA256 **b4c5924420f12bcb1fd3e1940b6060c2690349f0cf69513594bed89963c3ddd9**；實際下載parent/size/hash/CRC/48manifest回驗。development/VQ03G-program-snapshot.tar.gz為452檔assembled已測程式，不是publishedGitarchive／最新docs；G已發布，封裝前false/null不能觸發重送。

CI76原始包 **Chrono-CI76-VQ03F-reviewed-evidence.zip**，file **11w0HNMxSC6Olyzu6UoaXFC1-L6tj3fm_**，95731703bytes／SHA256 **648577a9ed8de07f3ada15e275130372a5854f863c0dff72958b0c9d2d04c82b**；7未改寫ZIP、source/movie/report/review與39manifest已下載回驗。F修復與CI75失敗包file1mfQYN5dk3BxM9syRQnJ_F_Dv4nY0h3o0、E/D/C及舊CI完整恢復位置均保留於DELIVERY_INDEX，不重驗它們。所有進度讀最新GitHub main，臨時容器不是權威。

main only、single AI、non-force，不建其他branch／平行candidate／PR／多人防撞。不放寬<.12、原tick預算、單一30秒、250ms／256、CPU畫質或記憶體門檻。Held VQ01Z／母親家具禁止提升或間接替換；src/prologue-render.ts blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。禁止本機browser；工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只恢復node_modules並保留esbuild hardlink，不覆舊source/config、不另開bootstrapCI。私人ROM **1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM**不重傳，ROM／原媒體／字型／憑證不公開。所有文件[skip ci]，成果寫回GitHub或正確Drive並回讀。
