# VQ01C：獨立輸入／選單發布與保留中的鏡頭修整

2026-09-19。使用者要求前幾幕先達到舒服的遊玩體驗，再推進後續系統與劇情。本批不重做章節、不縮減完整遊戲範圍；實際開發、測試及雲端保存分成以下兩個清楚的範圍。

## 可獨立發布的完整輸入／選單版本0.9.3

以目前已發布的0.9.0 runtime 16313037a0d1ab59358963014e797f7e11ea95d1為基礎，僅修改14份輸入、UI、build與測試檔。所有既有場景renderers、主角畫筆、core、存檔規則、assets、quality及workflow保持原來bytes。特別是src/prologue-render.ts仍為原已發布blob2711a74185aacf3c6bddf9db85ba99a2afbc507a；沒有包含、重試或換管道送出先前被攔截的新場景內容。這是一個經獨立完整check的UI版本，不是將不完整VQ暫存tree移到main。

工具列採同一套公開／test共用的quiet／guide外觀，按鈕保留native語意、文字標籤及Tab操作。原生Enter／Space啟動、選檔器open／closed／error與取消後焦點恢復，接續CI19的第一次filechooser失敗修正。真實filechooser事件、同run匯出及v8庫存／金幣／戦鬥斷言皆保留，沒有直接向input灌檔來繞過驗收。

對話、背包、暫停與勝利／敗北結果只讓最上層現有選單取得操作權；Tab及Shift+Tab留在可見、未停用的控制項，背景設為inert。從暫停返回原選單時恢復先前的有效焦點；選單關閉再恢復遊戲焦點。普通HUD刷新不重設焦點，也不攔截瀏覽器的Ctrl／Alt／Meta快捷鍵。

裝備頁重繪後，若剛使用的買賣／換裝按鈕變成不可用，焦點保留在同一個穩定項目列，而不是跳到另一筆交易或返回按鈕。保留捲動位置；停在項目列時再按Enter不會交易或關掉背包。返回按鈕置頂黏附、長內容可捲動，回饋文字置底黏附；新增窄直向與短橫向的排版限制及減少動態效果CSS。

## 仍保留在工作鏈、沒有混入UI發布的鏡頭修整

VQ01C工作版本接續VQ01與VQ01B，共15份本批差異檔。新增以固定模擬tick計算的平移／拉近緩動、隊伍分開時立即安全拉遠、角色投影範圍優先限制。暫停不前進；换場景／模式／視窗或時鐘重設時不沿用舊移動。OS要求減少動態效果時直接採安全構圖。沒有更改人物座標。

完整工作鏈相對原0.9.0有43個不同路徑；獨立14檔UI版本發布後，工作鏈尚有31個未發布差異，包含原本場景、美術與鏡頭，以及完整工作版特有的build／test串接。此範圍不能拿UI的CI成功冒稱也已驗收。被攔截的新prologue-render.ts保持原bytes，未修改或重送；本批雲端增量包不包含該檔或完整HTML執行檔。

## 本機驗證與瀏覽器案例

獨立UI完整check：681 Node passed／0 failed／0 skipped，加16 Python，typecheck／build／素材／compileall通過。保留原有CI19全套測試，再新增UI相關案例；不是用完整VQ的結果代替獨立候選結果。
完整保留工作鏈：763 Node passed／0 failed／0 skipped，加16 Python及上述檢查通過（比VQ01B增加57）。DOM雙替身與Babylon矩陣檢查明示為單元證據，不是browser或無障礙認證。

既有keyboard與equipment瀏覽器旅程已增加真實Tab／Shift+Tab完整循環、背景inert、同列焦點／捲動、重複Enter不誤觸，以及1200／650／390／844×390排版。原生選檔、真正匯出／IndexedDB重載、買賣數值與實際攻防斷言保留。勝利結果維持既有非暫停tick行為，檢查模式／資源不变，沒有偷偷改遊戲時鐘。

本批沒有再次嘗試已被管理政策攔截的本機browser，沒有新遊戲截圖。新CI須使用獨立UI exactsource，全三個job成功再保存五份artifact、檢查實際畫面與匹配Pages。尚未核准原生選檔修正、裝備流程、前段90分、真機或完整遊戲。

## 可重建交付

Drive專案資料夾1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。
本批檔案Chrono-VQ01C-0.9.3-ui-camera-deltas.zip，ID16iHw_Py_RGLr819nPAEG6d5h98JuyLNe，233959bytes，SHA25626548a1a9d6bf70899b8d002e97ebf8b6733bb0468b2326e02e4d28d9eea7ea2。上傳後原始下載回讀／整包hash／ZIPCRC及39項manifest均一致，正確parent已確認。
independent-ui/提供14檔相對publishedruntime的差異；working-delta/提供15檔相對VQ01B差異。evidence/CI20_LOCAL_VALIDATION.json含全部待發布檔的base／target／Gitblob雜湊，evidence/VQ01C_LOCAL_VALIDATION.json含43檔完整工作鏈及31檔後續差異；實際日誌與初次開發失敗也保留。依RESTORE.md還原，不覆蓋現行GitHub文件、不提升舊不完整stagingtree。沒有ROM、原版媒體、字型、依賴執行檔或憑證。

## 參考與限制

行為參考（2026-09-19讀取）：WAI modal dialog pattern https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ ，MDN HTMLElement.inert https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/inert ，Window.matchMedia https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia 及prefers-reduced-motion https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion 。引用規範與單元測試不等於無障礙審核。

全套場景仍須正常獲允許發布、真正構圖／透明混合／動畫／效能及使用者試玩驗收；不以測試數或幾何通過代替90分。托魯斯／王城／法庭細節、原作地圖、完整NPC／角色動作、合法音樂與實體裝置仍開啟，後續篇章暫緩。
