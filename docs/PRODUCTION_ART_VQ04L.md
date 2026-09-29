# VQ04L — 托魯斯／森林樹列根部與低矮植被

版本0.9.85；接續已發布K／0.9.84。這是正式遊戲新增的根部接地與蕨類葉叢，不是展示圖、完整樹冠重畫、NPC行走或戰鬥動畫啟用。發布與唯一matching CI以STATUS／checkpoint為準。

## 實際作者素材與場景

兩張256×64原創像素图集：root-moss與fern-fronds；每張四個64×64變體、透明留白邊界、nearest取樣及alpha test。苔根使用破碎的土壤／苔色輪廓與分岔根脈；葉叢採扇狀蕨葉，第四變體有種穗。PNG直接從正式作者API匯出，不含ROM或外部圖像。

正式ArtDirectedWorld共同入口在托魯斯4處、森林12處既有樹點各加一個接地平面與一個低矮billboard，共最多32mesh。原樹冠、屋頂、道路、人物贴圖、State／位置／camera／時鐘／input／碰撞均不修改。新增物件不可pick，不加入碰撞；葉叢在主路外，沒有用角色移位或假舊像素湊畫面。

## 來源准入與資源界線

僅接受kingdom-truce／kingdom-forest完整既存布局。樹點數量、名稱、直接parent、position、billboard／scale／rotation、plane位置／法線／UV／indices及原材質與64×80 DynamicTexture尺寸契約不符則拒絕接入。重複root或接入後外部drift會釋放本pass自有mesh，不改寫外部樹物件；非target與held場景不建立新資產。

最多2個cached root、32mesh、2個共用DynamicTexture與2material；texture RGBA payload上限131072bytes，這不是整個engine的總記憶體數字。首次各上傳一次，重進場不重上傳；root dispose或pass／scene dispose回收owner及本pass資產。cached場景切home為disabled而非立即釋放，不冒稱切場即零資源。

## 已實際執行的驗證

完整Node3752／3752、Python645／645，assets、typecheck、quality schema與build均exit0。50個L專屬Node包含作者像素／PNG同源、正式current-app新增畫面、原所有tree／actor textures與模型及State／camera不變、15非target／held完整frame一致、4個原CI108只讀停點的既有inn遮擋gate、unknown／drift／duplicate root／dispose與资源上限。4個新Python涵蓋原輸入與declared inverse。

759個source在全測前後逐SHA256相同；23差異（11修改、12新增），736個K程式原byte，731個受掃描K輸入保護。L→K與前代SOURCE-only inverse僅供凍結版本的component／source測試；不處理native、image、State或golden。正式L应用程式測試無此inverse。原native route／wait／capture／assertion／golden與<.12／適用309tick／單一30秒／250ms-256／CPU品質記憶體門檻不改。

獨立匯出與完整build的2PNG／manifest逐byte相同；另保存2個正式scene mesh JSON、K/L三組共6張離線CPU比較圖。比較圖使用rect-only Canvas port，明示實際render尺寸，不能作native、裝置或藝術批准。初次typecheck tuple型別錯誤及離線PNG exporter誤用requested尺寸的失敗log照存；前者修正後才全測，後者只修review exporter，未改已測source。

## 範圍與未批准事項

離線圖可見局部樹根與葉叢，不等於整體原作構圖已达標；L的原生表現、CPU時間預算、幀率與部署仍須matching CI／實際證據。不能以新增測試、素材或mesh數量作美術評分。K的CI108／Pages102限定成功另記，不當作L驗收。

完整屋頂／樹冠重製、原作縮尺大地圖與城鎮切換、全party/enemy/NPC方向與attack/cast/hurt/down/death、112NPCwalk／256combat、全T03–T08與合法音訊／聆聽／原速／真機／長時段仍待完成。全部完整批准false、newScore=null、releaseBLOCKED。ROM/media/fonts/credentials私有；No localbrowser/native造數。所有source/tests/logs/manifests/素材回存main或唯一Drive folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb並回讀；docs[skip ci]。
