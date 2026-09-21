# 功能快照 — CI44／Pages38 已閉環；VQ02C／CI45 待驗收

以STATUS／IMMEDIATE_CONTINUATION／CI45_CHECKPOINT為準，不增加完成百分比或品質分數。

**最新開發版本VQ02C／0.9.25**，source9b9a5721f47638ac25a272db6bd9491a5a9ba2d0／tree045d553322ce68895a729d8b2f673b56611b22e4。19檔一次非force發布並回讀，完整程式子樹匹配本機測試。唯一CI45 35600568002，push/attempt1，最後12:37:03Z觀察in_progress，未驗收。

本批完成角色播放時序：動作按固定遊戲tick，走路按實際位移及大地圖縮放比例換步；停止、位置重置與換場不延續舊步伐。待機／備戰錯開相位，減少動態保留必要行走施法受擊、抑制裝飾動作。加入96影格上限的CPU像素區段快取，回放到既有紋理，無新GPU紋理。四角色共512既有影格的冷／熱快取RGBA逐byte一致，原畫筆未修改。

新跑1073Node／214Python及assets/typecheck/build通過；原始成功與中途失敗log保留。原source pin透過16項明列接線逆向比對仍成立，不刪舊斷言。原reference旅程追加真移動、暫停、減少動態勝利與四張PNG；本機無browser，新版實際播放效果待CI45。這不是新美術、全動畫完成或FPS提升證據。

**最新已驗收版本B0.9.24／source7b1537382467935ea37fe4cc6a2dc88d96a8d46c／CI44 35583275426／Pages38 35585552575**。三job、13最終主報告、9native、3lane與額外render ledger及列入hash完成核對；音訊暫停／背包／對話零輸出，原v6匯入／靜音、軟體WebGL1/2、原生context中斷恢復與解析度選擇均通過。原HUD／鋪面／接地／ATB／所有權／商店裝備／v8／審判及觸控兩視窗保留；觸控load3575.88ms，原30秒不變。看過九場景及五相容畫面，仍有材質與直向裁切缺口，非美術90／真機／聽感。

CI44/Pages38原包1g_tlqBUKwknUzdTQPrNbj_18xHFzkOvl：51552702bytes、12manifest、六原始ZIP；C本機包14tfPggGAsfpJrZPv44yGDyX87RcLidji：1885136bytes、30manifest、19改檔／7logs／244檔快照。均在指定folder下載回讀hash／CRC／parent通過。CI44及更早驗收不重開，CI43不改稱成功。

完整T03–T08保留。未完成：整體材質比例／窄視窗／家中母親家具／全美術動畫音樂／實體裝置，以及完全無WebGL仍可玩的後端。Z仍受限未發布，未重送或間接套用；home renderer與localbrowser限制不變。2300抵達不是全未來，舊30stale，音訊與快取不能替代精緻HD-2D交付。
