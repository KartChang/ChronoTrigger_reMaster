# VQ04J — 旅館招牌與法庭圓弧平台比例

正式 ArtDirectedWorld 的 private geometry pass；只處理原 inn-sign 與三個 court-curved-dais。招牌原世界中心與 transform 保持，XY 局部頂點縮至 0.66，維持 2:1 像素比例；法庭平台 X/Y 不改，局部 Z 縮至 0.70，保留原 UV／indices 並重算法線。這是實際模型，不是改 native 診斷、回傳舊像素或對角色遮罩。

上限兩 root、四 binding、16,384 bytes geometry buffer payload；實際四份 clone 15,512 bytes。無新 mesh、texture 或 material；State、角色 transform、貼圖、時計、碰撞及 held 家庭場景不改。完整來源 positions/normals/UV/indices／名稱／parent／material／唯一owner／transform 通過才接入；dispose 和 ownership drift 只還原本 pass 的幾何。

I→H 的 CPU 優化沿用。本批 J→I source-only inverse 與前代傳遞僅供 SOURCE component regression；新專屬測試直接 bundle 未修改的真正 J entry。原 native routes、waits、captures、assertions、goldens 和 source baseline hashes 保留。

CI106 兩張原 WebGL 圖用於限定靜態觀察。法庭曲線靠近主角輪廓是畫面構圖問題；offline 三角形頭胸射線在 I 原已可為零，不宣稱已證明曲線直接遮住人物不透明像素。本批測試驗證平台投影前緣退後、沒有新增射線阻擋、角色投影與位置不動。整體屋頂／樹列尺度、全部場景及完整動畫仍待續作。

本批測試與 offline PNG 不是新 native 截圖；原生效果、Pages 與裝置批准須後續 exact matching CI 原證據。所有完整藝術／動畫／聆聽／真機／完整遊戲批准 false，newScore=null，releaseBLOCKED。

## 最終離線驗證

Node3656／3656、Python637／637、assets／typecheck／quality schema／build全部exit0；66項新增Node與4Python。738程式檔全測前後同byte，原I的716檔保留，711項受掃描輸入pin保持。原始driver把75個新test-results產物算入after集合，原紀錄未改；final-source-verification.json逐檔證明738source不變，75項皆原.gitignore已排除的產物。這不是source變更或測試放寬。

最初dedicated工具逾時與四項新fixture假設失敗照存；修正招牌投影的獨立驗證、既有H釋放後的隔離計數與無阻擋射線假設後，66項全部通過。無原生測試被刪除或修改。模型四JSON與四offline比較PNG在指定Drive包內，不在public runtime另加圖像。

CI106／Pages100是已限定核對的I版本，不是J；J需要發布後的唯一matching CI與原生畫面。
