# 功能現況快照 — 0.8 候選 / 2026-09-18

即時 source/run 以 STATUS.md 為準。本表不代表完成百分比或90分。

| 領域 | 目前實作 | 驗收與缺口 |
|---|---|---|
| 網頁／ATB／同機雙人 | 既有 TS/Babylon 自含HTML、固定步長、獨立選敵、雙確認合技與跟隨 | CI13舊路線通過；實體手把、完整原版技能數值未認證 |
| 原作開場 | 起床、家中、縮尺大地圖、初遇與選擇、v6 | CI13與Pages6 0.7.0已驗收；完整原作地理／演出仍有差距 |
| 600年與修道院 | 托魯斯／王城／露卡／青蛙／亞克拉／重聚／返鄉 | 既有內容與七段回歸旅程保留，不重做；完整迷宮拓樸仍缺 |
| 審判／越獄 | 護送、法庭問題、敲門或等待救援、弗里茲、階梯守衛、看守室 | 0.8已實作，本地規則路線通過；新瀏覽器待驗收，祭典證詞與原版七陪審員判定未完整 |
| 龍戰車與逃亡 | 橫向吊橋、三部位選敵、頭部修復／火焰盾、瑪兒重聚、森林時門 | 0.8候選；原版數值、動作與精細地圖未完成 |
| 未來世界 | 2300年破損巨蛋抵達，可走動與v7保存 | 只有主線接點，巨蛋外世界、後續時代／主線／支線／結局仍未完成 |
| 物品與成長 | I背包、共用回復藥、乙太、目標與ATB原子扣量、一次性補給和戰鬥XP記錄 | 0.8候選；裝備、商店、貨幣、完整等級／技能／自由roster尚未完成 |
| 存檔與控制權 | v7新增；v1–v6相容；牢房無P2，露卡歸隊恢復P2，瑪兒自主同行 | 本地白名單／非法狀態／走路整合已測；新UI存讀待CI |
| 美術與音樂 | 原版構圖參照、自製法庭／牢房／橫向橋／戰車三部位，沿用PNG匯出 | 非原作擷取；非最終藝術認證；完整音樂、動畫、環境仍缺 |
| Pages／保存 | 最後已驗證0.7.0 source809a／CI13／Pages6；ROM私人Drive保存 | 0.8尚未宣稱上線；永久收據見DELIVERY_INDEX |
| 整體90分 | 完整遊戲範圍與既有release guard保留 | 沒有本輪新分數；舊30已stale，真機／原汁原味／完整內容未驗收 |

本批最終本地check：375項通過，0失敗。新瀏覽器因本地管理政策阻擋而交由唯一新CI；未製造截圖、存檔或通過結果。

## Batched art implementation (0.8 candidate; browser pending)

Executable production contract r1, five cached nearest-filtered material families with dimension-based UV, miniature mountain silhouette, curtain-child animation fix, shared deck/collision metrics, real tick-bound two-frame Dragon Tank visuals, 42 PNG/JSON review sets and 421 frame records. 375 local tests passed. No external edited atlas runtime import, soundtrack, full geography, final-art or >=90 acceptance.
