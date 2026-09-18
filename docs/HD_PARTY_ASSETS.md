# 新像素角色資產 — native48x64-r1 / 2026-09-18

## 實際變更，不以放大冒充重製

前版使用24×32程式繪製角色；那是自製低細節原型，不是已完成現代像素重製，也不是原作ROM擷取。本批新增 `src/hd-hero-art.ts`：在原生48×64整數網格重新繪製克羅諾、瑪兒、露卡、青蛙。未讀舊PNG、沒有drawImage/scale/內插或ROM來源。髮束、臉部輪廓、眼鏡、衣褶、靴緣、披風與武器由新座標/色階構成；不是將舊圖每像素變四點。

這是程式繪製的新圖，不是影像生成模型的輸出。也不把48×64本身等同「高畫質」、原汁原味或90分。輪廓、動作流暢度、場景融合與原作辨識仍須實際評審。

## 可用輸出與整合

每角色一張416×884透明PNG與一份JSON，100筆frame records、28個方向/動作clip：idle四方向、walk四方向、attack/cast/hurt/down/victory各四方向。共四圖、400筆新影格；包含循環/定格的重複姿勢，不能稱400張互不相同原創畫面。原生cell48×64、padding2、腳底pivot(24,62)、nearest sampling，沿用既有動作時序。

`crono-hd.png/.json`、`marle-hd.png/.json`、`lucca-hd.png/.json`、`frog-hd.png/.json` 與 `hd-party-report.json` 由原有 `npm run assets:export` 產出。完整素材包共46組PNG/JSON、821筆frame records；舊圖集保留作歷史/回歸比較，不冒稱整套46組都完成高解析重畫。

執行期採相同繪製函式，已接到主隊伍、第三同伴、千年祭露卡、瑪兒初遇/王后房間/重聚、青蛙登場。各處原生DynamicTexture尺寸跟隨同一HD_ART資料；技術村落仍保留舊原創測試角色。碰撞框、移動速度、世界單位、相機、ATB、存檔與控制權不因貼圖尺寸而改變。

目前沒有任意外部修改PNG後的runtime回匯編輯器，不能把匯出稱為完成外部素材匯入。NPC、Gato、Yakra、Dragon Tank、其餘敵人和全場景並未在本批全部改成此新密度；人物肖像、完整動畫、環境/音樂和全世界拓樸仍待完成。

## 本機與CI驗證

本機 `npm run check` **415 passed / 0 failed**，TypeScript、asset hygiene與build通過。新增40個測試驗證原生非2倍放大細節、透明邊、方向、有效參數、逐列PNG/繪製函式相符、圖集座標及引擎整合。`tests/hd_party_browser.py` 只讀實際renderer資料，隨既有prologue/trial旅程保存原生貼圖尺寸、姿勢與實際截圖，不造存檔、不更改state。

逐一查看匯出图集的角色/方向/動作contact sheet，確認四角色輪廓、眼鏡、馬尾、披風、武器有差異；修正瑪兒背面仍有前側項鍊的圖層問題。這是圖集檢查，不是遊戲截圖驗收。美術仍可見簡化輪廓、通用身形與有限四幀演出，尚未最終核准。

本機使用正常localhost HTTP/Chromium嘗試，導航返回ERR_BLOCKED_BY_ADMINISTRATOR，沒有繞過、沒有新本機遊戲截圖或完整browser pass。唯一新CI須保留八段既有流程及第九段trial，讀真正報告與畫面後才可驗收。既有舊30分綁定過期runtime，本批未自行改分或宣稱>=90。

## 保存与来源

GitHub main保存source/tests/docs，專案Drive保存完整工作包/PNG/JSON/contact sheet/logs/manifest，入口DELIVERY_INDEX。原作参考沿用assets/reference-index.json；没有新增未实际检查的原图证据。ROM单独保存在私人Drive，未模擬或擷取，不加入公開source、Actions、Pages或試玩包。
