# 功能進度 — S已驗；T已發布；CI62待驗

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI62_CHECKPOINT。

T/0.9.42 source **85f35c062720ed494b9869488b0c39e94b7c82b4**；root tree **c8eadf451849aa2b7d6f5e9f0b1176a3294a5b33**；parent **44349c5c9b1a09b86b83607039d61758f86b8c47**。24檔一次non-force發布，349檔程式與已測快照匹配；main已回讀。唯一 **CI62 35776529708**，workflow360357259/.github/workflows/ci.yml，push/attempt1，exact source全event/state count1；最後queued/null，created/updated **2026-09-22T19:52:01Z**（台灣2026-09-23 03:52:01）。只查一次，尚未讀jobs、artifacts或接受T。

## T實作完成，原生驗收待CI62

T合併暫停卡響應式排版與既有五個托魯斯花箱材質。暫停卡所有原文字／選項保留，寬畫面雙欄、窄畫面單欄，控制目標至少44px，既有focus/scroll不改；標題用div隔離舊HUD全域header絕對定位與pointer-events:none。五花箱共用一張64x64自製不透明木紋／土壤／植栽貼圖，不增移mesh、不改角色尺度或S六建材／原旅店招牌。inspect新增vq02t-truce-planters／owner／五個mesh／nearest／RGBA。

同次原生托魯斯三viewport保留S原六PNG，另加Tab順序、Space切換與恢復、完整paused state、控制項命中與邊界／44px／font>=14觀察；各追加pause-controls-i.png與實際CPU的village-nearest-i.png，共六PNG，列入原era600 ledger的bytes/hash/IHDR。僅增加驗證，不刪原七ledger、原路徑或預算；失敗保留部分原觀察与第一個例外。這些新增native驗收尚待CI62，不是單元fixture或source預覽可代替。

完整npm run check通過：1462 Node、assets、typecheck、build；Python353與diff check通過。兩個初輪Node失敗為原paragraph結構與巢狀inverse token連續性，修正實作後通過；提交前另隔離global header衝突並重跑完整檢查。失敗及最終logs均保存。10章節對照保留S geometry/state和非托魯斯畫面，S六建材／招牌逐項相同，只有五花箱像素改變及一张共享貼圖；六次地圖往返不累增mesh/texture，32MiB/512上限不改。原hash不換，僅明列T逆向接線再驗S/R/P/Q原契約；缺少／重複／其他變更拒絕。沒有本機browser或T原生驗收。

## 已驗與未完成的界線

CI61 / VQ02S / source9b9020e05b3c9c68aee378ceab74dc8fa4677c88 與 Pages55 已正式結案；收據 **docs/evidence/CI61_ACCEPTANCE.json**。三job、13主報告、9原native chooser加完整CPU兩旅程／600／救援／審判、同run本人v4-v5-v7及alternate own cell、67腿／4遇敵／2props／17里程碑／6窗口保留。七ledger以exact S原始程式唯讀重算逐byte相同，133列bytes/hash一致；39主CPU圖及6張S新圖已檢視。S六材質／旅店招牌真實owner、尺寸、nearest-alpha/RGBA與三viewport全paused state、恢復及六PNG已驗。Pages55 35769247113 selected CI61/source正確，公共HTTP step成功；playable/staged/deployed HTML同5704004bytes，SHA256 bd23d550062b186cec198efa7879a5889cdf5c78e351562a38db078f2cd6a9e8。沒有本機browser/HTTP複跑，沒有美術或真機認證。不重開CI61/Pages55、CI60/Pages54或更早。

T沒有增加故事範圍、沒有完成全美術；直式人物／旅店小地標尚需真圖改善。原家中至2300、雙人操作、第三同伴、ATB、裝備v8與全部故事流程保留，不以花箱或暫停介面替代其他TODO。

CI62 pending只保存回報，不長等、輪詢、rerun/dispatch/cancel或另推source。Failure只處理同run第一個實際root及原artifact，不放寬原斷言或畫質。Success依CI62_CHECKPOINT完成全部原始報告、真圖、ledger、Drive原ZIP下載hash/CRC/parent與同CI Pages/source/HTML核對，不能只看綠勾。其後先依T真圖處理相容／可讀性，再續前段人物植物道具材質／尺度輪廓／窄地標／全動畫／合法音訊／有意義長時間和真機；直式人物與旅店招牌仍偏小，尚未解決最終窄地標品質。

T03：隱含規則、版本差異、全拓樸及數值忠實。T04：完整成長、報酬掉落、經濟道具飾品、角色學習與雙三人技。T05：全美術、完整動畫、合法音訊，前段實際品質優先。T06：完整未來與其餘時代主支線結局。T07：全範圍整體>=90／各面向>=80%、required assets/five gates/zero critical與實體裝置輸入、FPS/frame time、載入、記憶體、背景、存檔及音訊。T08：每批實作測試、一次source、完整matching CI、正確Drive原檔回讀及[skip ci]文件。分母不縮；2300抵達不是完整未來。舊30分stale，沒有新美術90分、長時間、真機或全遊戲認證。

唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。T保存包 **Chrono-CI61-accepted-VQ02T-tested-batch.zip / 13Ink_1PPYbZNYBrHFi1Bau7RRj-p15uI**，**828192 bytes**，SHA256 **9b4985368a2cc0ba7d00d3590512002dd6d9b145be48d383743f526c4bcab3af**。已下載回驗bytes/hash/ZIP CRC/18項manifest/349程式檔hash與Git blob/parent。recovery/VQ02T-tested-program-snapshot.tar.gz為assembled程式快照，不冒稱published Git archive；不含進度docs（THIRD_PARTY除外）。包內publishedSource=null是發布前歷史，現已發布，最新進度讀main，不用舊包覆蓋docs。

保留TS/Babylon/esbuild/fixed ATB/A*/InputBoundary/P1/P2/自主第三與v1-v8存檔。Main only、one AI、non-force，無branch/PR/P3/ARPG/框架重造。本機browser禁用，不造原生game/time/save/collision state；不放寬.12、原tick預算、單一30秒、250ms/256或畫質。Held VQ01Z／母親家具不得提升或間接替換；src/prologue-render.ts blob2711a74185aacf3c6bddf9db85ba99a2afbc507a不變。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules並保留esbuild hardlink，不覆舊source/config或bootstrap CI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM不重傳；ROM／原媒體／字型／憑證不公開。臨時容器不是權威。
