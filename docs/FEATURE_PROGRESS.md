# 功能進度 — VQ04C前段場景美術／CI100 pending

Authority：STATUS/TODO/checkpointv36。Source **0aefa412e71d522dc1b667b9fcdf850f8cf4e65c**，tree **7f352b9553cbb7c4ffdf3283454b1f524c66677d**。20檔合批一次sourcepush；CI100/36349691934 exact C最後in_progress。沒有Cnative/Pages/art批准。

## 本批實際增量

12場景root：城堡、王后房、修道院、地下通道、祭壇、1000王城、囚室、刑場、監獄樓梯、典獄室、監獄橋、山道。地板／牆面／柱體／木家具／布料／鐵件／彩窗以16組自編程式像素套入正式應用；柱圈與雕槽、山道外岸低矮植被共64個靜態構件。不是整座建築重建或所有美術批准。

新增rawRGBA共3,936,256bytes，lazy共享、重返場景不反覆上傳；不宣稱整遊戲記憶體。保留原橋面／void界線與透明囚門alpha .42，不改原actors、camera、geometrytransform、collision、ATB、save、frameEffects。原A/B法庭、山道、1000森林與法庭配角色料仍保留。held home在current C framebuffer與B一致。

build新增dist/art/production-vq04c的16PNG＋manifest，解碼逐byte等於runtime。主assets/manifest.json本批未改；這些是本批資產，不代表required assets全完成。全部檔案保存在專案Drive而非對話圖片。

## 測試／來源結果

完整3220Node、609Python、asset/typecheck/build通過，新增60Node/4Python，625其他inputs byte-exact。新C整合使用真正currentapp：12root pixels改變，State／角色源格／變換／相機與原診斷不變；十個非目標場景逐pixel保持、資源重用／釋放／橫直取景測試通過。frozenBcomponent與currentC分開；原native／golden／held斷言不動。全部失敗與成功logs已持久。

CI99/Pages93本批完成限定審查：3lane／29entry hash、7ZIP、exact B playable與Pages payload一致，四張原生static圖片看過；法庭裁切阻塞在B新路線上解除。Pages少一個空.nojekyll marker已如實記錄。不是新完整動畫ledger、video、聆聽或裝置批准；CI98仍failure。

## 仍未完成

完整party/enemy/NPC四方向與move/attack/hurt/down/death重畫，本批新增姿勢0，不能把環境材質視為角色美術完成。山道北端銜接、剩餘前段構圖、概念級質感與遮擋、合法完整音訊／聆聽／原速／真機長時段仍open。art/fullAnimation/wholegamefalse，newScore=null，releaseBLOCKED。

持久收據：evidence/VQ04C_TEST_RECEIPT.json與CI99_PAGES93_REVIEW.json。C包 **1krZ_U705oJiiBbgX9wOfyw73G3tPAUzt**（88manifest/650snapshot/16PNG）；CI99包 **1d7iHSDTGUyLRqmy8Ckxy7r3EEXoX5nie**（7原ZIP/10manifest），皆指定folder真正下載回驗。下一開發批次沿原TODO角色／敵人與場景品質主線，先接CI100新證據，不重跑C。
