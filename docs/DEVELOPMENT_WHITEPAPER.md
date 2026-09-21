# ChronoTrigger reMaster 開發白皮書

版本：product-2026-09-21-ci44-closed-vq02c-ci45-pending。更新既有進度，不重新規劃。精確執行依STATUS／IMMEDIATE_CONTINUATION／CI45_CHECKPOINT；前版全文保留於a2492d881d6119e1737bc5ba734bafba35762782。CI44已閉環，下一批C未驗收，不能沿用舊pending或將原source結果改稱新版結果。

## 完整目標、順序與固定架構

完整《超時空之鑰》HD-2D重製不縮小：像素人物＋立體場景、原作辨識度、縮尺大地圖與城鎮／室內切換、原地ATB、單人與同機雙人共畫面，以及完整時代、主支線、結局。合作不改為ARPG。先完成前幾幕場景、人物、圖檔建模動畫、鏡頭遮擋HUD、操作及聲音，以實際證據取得品質門檻，再擴充後段，不將完整版縮成序章。

固定TypeScript＋Babylon.js＋esbuild自含HTML、package/lock；Node建置、Python/Playwright驗收，玩家不用Python、ROM、後端或帳號。不換引擎／平行框架。Controls→main固定1/60秒→core規則→render/HUD/audio呈現，音画不決定傷害、資源、劇情。暫停／背景／對話／背包／原生選檔／context中斷不推進遊戲；恢復不補算背景時間。InputBoundary清舊輸入，A*用原碰撞，不穿牆瞬移。

P1克羅諾／P2露卡及劇情入離隊所有權不變。青蛙／瑪兒是可受擊、具HP/MP/ATB並自主行動的第三同伴，不是P3或完整自由換人。保留獨立選敵與雙確認合技，不為測試改數值、偽造存檔、刪斷言或放寬timeout。

## 已有內容，不重做

已連通家中醒來／上下樓→縮尺區域圖→祭典初遇與行為→異變→600山道／托魯斯／森林王城→露卡→修道院青蛙／管風琴暗門／密道補給／亞克拉→救援返鄉→護送被捕／證詞兩裁決→敲門逃出或等待露卡／弗里茲／看守室→三部位龍戰車／重聚／森林時門→2300抵達。2300抵達不是完整未來篇，經驗記錄不是等級系統。

梅爾基歐商店、角色相容武器／身體／頭部裝備、穿戴份數、金幣庫存守恆、交易上限均存在，不能賣仍穿戴裝備。400G旅費、13商品、價格與普通攻防增減為明示暫定重建，不是假稱原作值。成長、技能學習、戰鬥金幣、飾品、完整自由換人未完成。

IndexedDB與JSON白名單v1–v8保留技術村落、祭典、異變、王國救援、序章、審判越獄及裝備；未知舊檔行為不補造證詞，僅查看不強制改寫，本人舊檔匯入為合法回溯。守恆不是防作弊簽章。snapshot/view/audio與新增playback僅只讀，不設通關旗標，音訊與渲染偏好不進遊戲存檔。

## 前段品質與保留資產

使用者認為缺乏精緻HD-2D是仍未解決的交付落差。引擎、像素尺寸、測試數、模型數、音樂或快取不能替代美術品質。90是實際完成後門檻，目前無有效美術90證據，舊30stale，release仍blocked。

A/B/C原主角／鏡頭／接地，P祭典棚布道具，S地面取樣，T探索HUD，U觸控context，V固定tick動態，W局部光照銅材質／六樹根八陰影，X細鋪面分區grassmask，Y較淺投影／caster合併／鐘庭20件同邊界倒角全部保留。不重畫保存素材，不套回舊independent-ui。家中母親家具、整體人物植物／立體道具材質比例、窄視窗構圖、完整動畫音樂及真機仍有缺口。

Z0.9.22既有17檔材質／直向構圖程式已測試保存，但source-tree寫入安全封鎖未解除。不得重送、換編碼管道、間接替換或提升部分；本批不套Z，fair-surfaces/fair-composition仍無，fair-render/festival-kit/early-comfort保持原樣。受限prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a與localbrowser邊界也保留；限制不等於connector不可存取。

## 已閉環：B0.9.24／CI44／Pages38

Source7b1537382467935ea37fe4cc6a2dc88d96a8d46c/treefe2791e0d0fc0c4a12f6d01e8fe04c90855834ac。CI44 35583275426 push/attempt1 success，updated2026-09-21T09:51:01Z。validate106280729548/good106280729566/bad106280729438皆成功。13最終主報告、9native、3lane及額外render ledger與列入bytes/hash核對完成；四ledger只讀精確重現，沒有browser重跑。所有原旅程、HUD／鋪面／接地／真正ATB突進／所有權／商店裝備經濟／v8／IndexedDB／完整審判保留；觸控兩視窗、同run自產v8匯入、context退休與trace124項CRC通過，load3575.88ms，原30000ms不變。

七段A自製短曲不是原作OST或完整曲庫。B的master-gate修正已在實際音訊觀察中通過：pause/inventory/dialog皆零voices/gain/RMS，播放有能量、原nativev6匯入／epoch清理及mute皆保留。這關閉新版上的靜音回歸觀察；CI43當時沒有最後sample，不能倒推其確切失敗子條件。CI43仍為歷史failure，不改稱accepted。沒有聽感／實體喇叭／全音訊製作驗收。

軟體WebGL1/2、真canvas像素及P1移動、原生select解析度、native context中斷恢復／凍結清輸入與無WebGL錯誤reload皆通過。這是受控瀏覽器軟體後端驗證，不是一般瀏覽器必定自動允許software。完全無WebGL仍可玩的CPU/Canvas2D後端尚未完成，不能用降解析度／錯誤UI冒稱。

Pages38 35585552575 prepare106287936695/deploy106288021933成功，staged10632176055/playable10632051389匹配source／CI／HTML5649823bytes，SHA256a6f7ecd69f5050b09ca5f6d0cc8937ea7fa4d5405852b808e6061df0beaa7103。公開HTTP由09:55:35.6538271Z實際成功deploy步驟核對，無另一次本機live-byte/browser宣稱。workflowHEADa249文件不是gamesource。九場景及五相容畫面已檢視，仍有平塗木料與直向鐘庭裁切；非美術90。正式收據CI44_ACCEPTANCE/CLOUD_RETENTION/VISUAL_REVIEW/PAGES38_PROVENANCE。CI44及更早閉環不重開。

## C0.9.25 獨立角色播放：已發布，CI45待驗收

Source9b9a5721f47638ac25a272db6bd9491a5a9ba2d0/tree045d553322ce68895a729d8b2f673b56611b22e4，parenta2492d881d6119e1737bc5ba734bafba35762782。19檔相關開發測試後一次非force發布，main與完整src/tests/scripts匹配測試內容，.github不變，保留最新文件子樹。未提交blob的手動傳輸拼字差異已在發布前修正，未提升未測試內容。

ActorTimeline重用PosePlayer及原畫筆：動作改以simulation tick/60播放，原片段時長不變；步伐按兩次觀察的實際位置距離及大地圖比例換幀，停止、尺度變更、位置重置與rollback不補舊步。這是render取樣距離，不冒稱重建未觀察到的曲線路徑。待機／備戰相位依slot錯開；reduced-motion固定裝飾性idle/ready/victory，必要walk/attack/cast/hurt保留，沒有改遊戲規則。

HeroFrameCache為lazy LRU96格CPU像素區段，原drawHDHero最終像素轉為水平區段後回放同一DynamicTexture；不新增GPU紋理或canvas/DOM保留，釋放場景清理。spanBytes只計typed-array，不能當完整JS記憶體。冷miss仍執行原畫筆；單元矩形呼叫減少不是實體FPS提升證據。

新跑1073Node／214Python、assets/typecheck/build通過；四角色全部512既有影格冷／熱RGBA逐byte一致，原48×64畫筆、palette與clip未重畫。16項明列接線逆向正規化回到exactCI44，原hash預期保留；main/core/input/save/camera／受限場景不改。初次完整測試的directdrawHDHero依賴檢查失敗，已在production快取明確接入原畫筆後通過，未放寬原斷言。

原reference旅程保留三段真移動、原戰鬥／受擊／暫停／勝利，追加只讀history/cache/暫停不變/reduced勝利及四張PNG，由既有validate ledger核對；不新增正向假檔或writablehook，不改timeout。CI45 35600568002 push/attempt1，lastobservedin_progress/null，created12:37:00Z/updated12:37:03Z。沒有本機browser或C新版after圖，尚無CI45／Pages／動畫品質驗收。localHTML5653959bytes/SHA256e5e433d79c06c4ff36c2204490a0169c3e0c8ab8e4b3e67a3aeb79b0bd8e78be、sourceSha=null，僅localbuild。

## 剩餘範圍與交付

T03完整規則版本差異拓樸與原值；T04成長／報酬掉落／經濟／消耗品飾品／完整角色技能雙三人技；T05全美術動畫與權利清楚音訊；T06完整未來及其餘時代、主支線、結局；T07整體90／各面向80%／zero-critical／必需素材五gate／實體輸入FPS-frame-time載入記憶體背景存檔音訊；T08每批雲端回讀。完全無WebGL可玩後端仍開放。不改分母、不只評已完成部分。

接CI45同run：pending保存回報不長等取消重派；failure第一實際root；success查3job與13final/9native/3ledger、原audio/render報告和新playback/PNG，實圖檢視、原始產物上指定Drive回讀，再匹配Pages/source/HTML。後續文件[skip ci]不建另一source。

唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。CI44/Pages38原包1g_tlqBUKwknUzdTQPrNbj_18xHFzkOvl／51552702bytes／SHA256743c04dfdd0d3a4eb934abd1b2d9fa36b940c6c4df14d983f064bfe045e612da，12manifest/6rawZIP；C包14tfPggGAsfpJrZPv44yGDyX87RcLidji／1885136bytes／SHA25664eb34511c4bb2afb6e139549057b388d633010d33ddce1703289bc7b685a222，30manifest/19changes/7logs/244檔assembled快照。均已下載回讀hash/CRC/parent。C封存nullsource為發布前狀態，最新GitHub收據補身份；latestmain文件永遠另讀。舊原包詳DELIVERY_INDEX保留，工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules/esbuildhardlinks；私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳，不公開ROM／原圖原音訊／字型／憑證。臨時容器不是權威。
