# VQ04E — 故事 NPC 正式貼圖接入與角色作者資產

本批版本0.9.78，延續v38已恢復的九檔，不重畫D或重建引擎。正式source／CI／Drive回驗位置以STATUS與evidence/T05_ANIMATION_CHECKPOINT.json為準。本文件說明實作與測試範圍，不授予藝術、原生動畫或完整遊戲批准。

## 本批真正接入的畫面

resident／innkeeper／king／guard／nun／chancellor／queen七類故事NPC。作者程式每類48欄，共336欄；正式adapter僅套用正面ambient的4格，共28格。308個方向／walk／greet欄位只匯出，NPC位置、導航、互動與原有動畫時鐘沒有改動。八個既有物件名稱與四個既有root／chapter被精確綁定：truce、castle、cathedral、sanctum；兩位chancellor共用同角色畫格。

四主角attack／cast／hurt／down的256作者欄位維持runtimeApplied=false。作者程式可匯出，並不等於戰鬥已啟用。D的256探索／ready／victory欄位與另256受保護combat欄位保持原有實際來源；原native source-cell goldens完全未改，不回傳假舊像素。

## Owned DynamicTexture upload

只有同一scene、名稱／直接parent／章節在allowlist內、獨占48×64 DynamicTexture的既有mesh可接入。綁定後仍重新核對material身分、貼圖、名稱、root、尺寸與獨占擁有權，包含不可見的共用者。未知或跨角色RGBA不替換；只有逐byte比對未修改drawStoryNpc輸出的四個原格後，才繪入實際新像素並调用原update。

update的this、全部參數、回傳值與例外照原樣傳遞。穩定格不每幀重上傳；未知靜態格不每幀重試。換章節時只還原仍由本adapter擁有且仍等於本adapter產出的像素，不覆蓋外部新繪圖或後裝wrapper。換owner／name／parent／material／尺寸會解除綁定。texture／mesh／scene dispose移除監聽與參照，舊texture的dispose不會刪除新binding。

最多12個binding；每個保留兩份48×64×4來源／完成RGBA，CPU上限294912bytes，新增GPUtexture為0。不新建clock、texture atlas、game State、路線、碰撞或存檔機制。正式ArtDirectedWorld始終接此adapter，沒有測試／裝置／品質專用旁路。

## 專屬驗證與既有保護

作者tests覆蓋七類×三pose、四主角×四combat pose的全方向／frame、原生48×64尺寸、pivot、邊界、獨立記憶體、非法參數與真正legacy來源。11PNG由同一作者API輸出，逐張PNG與RGBA hash以及592個cell hash核對；28／308／256的啟用界線寫入export manifest。

整合tests使用真實Babylon DynamicTexture與原上傳呼叫，覆蓋全部八個物件、未知來源、heldhome、換owner／材質／貼圖／尺寸、16次資源替換、dispose、12binding上限及現行完整ArtDirectedWorld。四個target章節有實際離線framebuffer差異；12個非target／held章節與D完全一致；幾何、camera、動作診斷、State、texture數量與既有CPU記憶體門檻保留。

上述是明示OFFLINE單元／整合fixtures，不是native瀏覽器、真機或原速證據。cathedral fixture明示進入既有rescue stage，以顯示原有nun；未注入native／browser的State、時間、save或collision，沒有改既有原生路線或報告。

E→D inverse只讀取明示十個SOURCE檔，逐hunk逆轉並核對D原SHA256；所有其他649個受掃描程式輸入維持D原byte，包括原baseline、native routes、assertions、goldens及held prologue。14個E新檔明示排除在歷史分母外，必要傳遞接入D→C／B／A。壓縮僅是宣告檔儲存格式，解壓後仍是可審查UTF-8 hunk。inverse不得用於native報告、image、遊戲State或原生路線。D component測試使用明示SOURCE-only D編譯，E另有現行正式入口測試，不讓前代golden偽裝當代畫面。

## 完整結果與邊界

完整Node／Python／素材／typecheck／quality／build結果、失敗前案與修正後完整log由本批雲端manifest記錄。恢復版兩筆E素材缺evidence欄位，已補實際source／tests並新增真實register回歸；品質checker與門檻未放寬。quality scorecard是較舊runtime的評估，不能成為本批新分數。

原T03–T08分母、原作構圖／縮尺大地圖／城鎮切換、完整party／enemy／NPC方向與death、完整合法音訊與聆聽、原速／真機／長時段都仍需後續完成。artApproved／fullAnimationComplete／wholeGameAccepted等仍false，newScore=null，releaseBLOCKED。
