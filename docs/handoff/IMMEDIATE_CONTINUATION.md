# 新對話立即接手 — ChronoTrigger_reMaster

這是立即執行型交接，不是repository盤點、歷史審計或產品重新規劃。請用GitHub及必要的Google Drive connector直接接續。所有main／其他分支僅此AI操作，不設計多協作者防撞，不另建平行候選。不是GauAI或IoT Colony；不可借用其治理。

## 起手只做這些

1. 讀 `docs/STATUS.md`（exact位置）與本文件；只在排下一項時讀 `docs/TODO.md`。
2. 一次確認 main HEAD 與 exact run **35243837438**。本輪新增的是[skip ci]文件提交，gameplay source仍 **2eec00c4a9e74c7873724217bd14f5087c42acf0**、tree **5f93fb2d04bfdfbef3511b0473ef7927d31ded24**。
3. 直接接 **T00：CI12結果**。不要先讀全部repo、舊branches、舊runs、所有artifacts或全白皮書。

## 已知最後狀態

- CI12/job105278814517：in_progress；npm run check成功、前六段browser成功；第七段 tests/rescue_browser.py正在跑。
- 沒有新遊戲candidate；不要重複dispatch、不要重跑CI1–11。
- source與修道院已成功發布；先前寫入被攔截及ZIP恢復是已解決歷史，不要再次搬舊ZIP覆蓋main。
- 最後已知網站0.5.1，source a9b013c55e10f51aae6ffd268f93f7ee4c3848f0；CI11 35232983328，Pages #3 35234477003。0.6未確認部署。

## 下一個動作取決於該run

still running：不要長時間等待或密集輪詢，保存checkpoint後回報；不要擅改正在驗收source。若使用者稍後通知完成再讀結果即可。
failed：下載同run evidence，檢查 job logs、rescue/rescue-report.json、failure.png及lastObserved，只修第一個真實terminal。若first terminal不在rescue，以真實結果為準。不删断言、不制造存檔、不直接設旗標／瞬移、不只放寬timeout。
success：取得同run的browser-evidence、playable、art-review-kit，保存Drive及來源雜湊；實際看救援／戰鬥／重聚畫面，再確認既有Pages workflow已部署同source/hash。完成T01後續T02，不把CI成功當90分或整款完成。

## 可直接沿用的實作

TS+Babylon+esbuild／單一HTML、固定步長ATB、單人同機雙人、獨立選敵、合技、A*跟隨、動畫、InputBoundary、暫停／背景、IndexedDB/JSON與v1–v5存檔。
千年祭→異變→600年山道→托魯斯/森林/王城→露卡加入；0.6另有修女伏擊→青蛙第三同伴→管風琴→密道→亞克拉→王后/大臣→瑪兒重聚→返1000年。都是已有程式；待驗收不等於待實作。
P1克羅諾、P2露卡，第三同伴青蛙後為瑪兒；原版完整roster/自由換人/三人技尚未完成。不要把聖劍傳說合作訴求當作同意改即時ARPG。

## 完整遊戲的實際剩餘項目

參照TODO：先完成當前驗收及局部畫面問題，再補真正的醒來／初遇、審判／越獄；增量完成物品装备成长、角色技能、其餘時代支線與結局。原版圖對照美術、動畫、音樂与真機品質持續提升。不縮小整款範圍，也不因新章節而重造舊框架。不要只完成一小項就停，除非等CI或真正外部阻擋。

## 必須雲端保存，不要再只貼對話附件

GitHub main是source/狀態權威。
Drive folder ID: **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**
URL: https://drive.google.com/drive/folders/1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb
17份歷史交付封存 file ID: **15XAmLxm597Lplx4XQPTk9madKmu0iFrI**
SHA256: **86942783045635b306557c37a4d0e8fbb6559527625935b8f56a7696899dfb48**
已upload、metadata readback、raw download重算hash與內部17份雜湊一致。這是回溯保存，不是新source。不需要下載全部封存才開始工作；需要某舊交付時才取用。

每輪程式與動態STATUS寫回GitHub；交付包、素材、截圖、報告存Drive並將ID/source/run/hash放DELIVERY_INDEX。不要只給/mnt/data或sandbox。臨時環境可能隨時清除；GitHub現有source才是恢復起點，必要時可用其exact source archive，不能自行還原舊版。

ROM未讀取／擷取，原作圖／音訊不公開打包；概念海報不是遊戲截圖。舊30/100已stale，不是現版評分。未達90不稱完成，但也不要停在文件迴圈；依TODO持續補齊。

稳定文件入口：CODEBASE.md（只在改相關模組時讀）、AGENTS.md、docs/DEVELOPMENT_WHITEPAPER.md、docs/FEATURE_PROGRESS.md。此交接已固定下一個動作，不需要再問使用者要從哪開始。
