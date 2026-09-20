# 功能快照 — CI36／Pages30 已閉環，VQ01T／CI37 待驗證

目前以 STATUS／IMMEDIATE_CONTINUATION／CI37_CHECKPOINT 為準，不新增完成百分比或品質分數。

CI36／35525474467、Pages30／35527138223、0.9.16 已完成既有可玩範圍與部署驗收：三job、13主旅程、9原生選檔紀錄、3來源驗證紀錄與報告雜湊一致；6guide／6quiet、18工具列觀察、12鏡頭、地面三視窗與暫停不變、人物接地及真正ATB突進、商店裝備經濟、v8／IndexedDB、完整審判及原有故事均保留。部署source4029c82ec0568dff0f687be6fa0947256b63350c與CI／playable／HTML一致，公開HTTP由成功deploy步驟驗證，不冒稱本機另做即時瀏覽器驗證。

前回合已檢查但未保存的六份原始ZIP及真實畫面檢查，現在已放入指定Drive並回讀，主驗收收據CI36_ACCEPTANCE.json隨本文件發布。CI36／Pages30與CI35／Pages29及更早閉環不重做。地面技術及静態畫面通過，不等於時間抖動、真機FPS、完整美術或90分通過。

VQ01T／0.9.17的11份原有未發布增量已原樣恢復、重驗並正式寫入main。Source e2bc7e8b19d535ec4072fa5dd68ab4ff24e1929c，唯一CI37／35530142731最後觀察in_progress。探索底部以正常flow排列提示／按鈕／角色名稱／操作說明／頁尾，窄版換行及44px原生按鈕；依實際高度保留訊息與觸控間距。main.ts僅量測及ResizeObserver區塊修改；整份main正規化雜湊驗證其餘遊戲、輸入、存檔內容不变。戰鬥／開始畫面保留原有display:contents與間距規則。

實際DOM文字範圍、裁切、重疊、按鈕九點命中檢查已加入既有序章及棚布旅程，包含五種視窗×guide／quiet；失敗先保存當下畫面，清理錯誤不掩蓋根因。881Node／139Python與資產／型別／建置／compile通過；原festival23／early25／equipment83／prologue37／keyboard28／trial53／witness42斷言保留。無本機瀏覽器、force click、假存檔、重試或timeout放寬。新版0.9.17仍待CI37，CI36的圖片不是新版證據。

已保存VQ01A/B/C/P/S、四主角、祭典棚布／鐘／傳送器／販商／遮擋／地面、鏡頭／接地陰影均保留。家中家具與母親、重複鋪面、初遇輪廓重疊、完整動畫音樂與真機仍有缺口。受限prologue-render.ts未動，不由別的管道繞過；家中→2300抵達、裝備與v1–v8不重造。完整T03–T08、前段90與實體裝置未完成。

復原包Drive1BpCWHWw28QxZTfA9xNdI-URlc050ZYW9在正確資料夾，40manifest／11增量／6原始ZIP及整包hash／CRC／父資料夾回讀一致。檔案內UNPUBLISHED是前次封存的歷史標記，已由目前main覆蓋；最新發布包與收據見DELIVERY_INDEX及VQ01T_CLOUD_RETENTION.json。
