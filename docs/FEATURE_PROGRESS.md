# 功能快照 — CI35／Pages29 已驗收，VQ01S／CI36 待驗證

目前以STATUS／IMMEDIATE_CONTINUATION／CI36_CHECKPOINT為準；沒有新增完成百分比或美術分數。

**0.9.15／CI35 35518793605／Pages29 35520392818已完成既有可玩範圍驗收**，source28759aa7cb6d60a5649e169e483eb578b0f25a4e。三job、13主旅程、9份原生選檔紀錄與3份來源綁定ledger通過；報告bytes/hash、6guide／6quiet／18工具列觀察／12鏡頭案例及原生匯入、接地、真正ATB突進、棚布遮擋／暫停、装備經濟、v8、IndexedDB、勝利繼續與完整既有劇情已核對。12鏡頭是四個場景各三視窗，不當成額外獨立旅程。

Pages29的prepare/deploy均成功，來源／CI／playable ID與HTML一致；公開HTTP hash由實際成功deploy step驗證。本機獨立HTTP因DNS失敗，沒有第二份本機即時驗證。實際全尺寸圖片與25張原始圖的三份接觸表已看過；HUD、棚布、商店、窄視窗選單和戰鬥可見，但簡化家中／母親／家具、重複鋪面和初遇輪廓重疊仍存在。驗收不等於完整遊戲、美術90或真機通過。

**本批VQ01S／0.9.16已發布九份程式／測試**，source4029c82ec0568dff0f687be6fa0947256b63350c；唯一CI36／35525474467最後觀察queued。祭典地面增加靜態世界座標明暗，區分中央走道／鐘前景與外緣；原有鋪面畫筆完全保留，未重畫素材或修改碰撞。32細分地面為1089頂點／2048三角形；只地面採mipmap與anisotropy4，人物仍nearest。沒有額外覆蓋網格或紋理，也不每幀上傳地面資料；細分與mipmap增加幾何／儲存，不宣稱零成本或真機效能提升。

實際buffer／checksum／取樣參數可由唯讀觀察讀取。既有棚布旅程加入1365×900、390×844、844×390的真實地面觀察與截圖、切換視窗不變及原生暫停不變檢查；失敗當下先留圖再清理，清理錯誤不掩蓋根因。873Node／125Python、資產／型別／建置／compile通過，新增12Node／11Python；所有原瀏覽器斷言保留。没有本機瀏覽器，視覺改善仍待CI36實際畫面，不能用數量或取樣常數當分數。

VQ01P祭典曲面棚布／鐘／傳送器／貨物／販商／遮擋、四主角／鏡頭／接地陰影／HUD、VQ01Q三job分工和VQ01R走道修正均保留；core/main/input/collision/camera/save/UI/畫筆及受限prologue-renderer未修改。新HTML5621452bytes，SHA256cda87f62f553247de4bad7430f196b1a8f19de92fd051e4a6fe616d7dceef25f尚未驗收。

兩個包均在指定folder且已回讀：CI35驗收1P-jRHa_BiTcAoETgQpPuizLTw9RhyuG9，14項清單；VQ01S接續1Tj2bjfoiAaBZ2NHCq_TMjIHFgPoduuam，18項清單／9增量。GitHub新文件優先於封存舊文件。CI35／Pages29、CI28／Pages22閉環不重開；T03–T08完整範圍、前段90和實體裝置仍未完成。家中→2300抵達、裝備、v1–v8、固定ATB、P1克羅諾／P2露卡／自主第三同伴保持；2300抵達不是完整未來篇。
