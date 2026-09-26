# 功能進度 — O身體動作與死亡殘影已發布，CI86原生待驗

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／T05_ANIMATION_CHECKPOINT。Main only；root **T05-early-visual-cohesion**／terminal **T05-field-foe-action-animation**。最新published **VQ03O／0.9.62**，source **116bcd03b431e12135bbadf6584d6a06b826f639**，tree **00abe47a184d80e60bfec5435bd0e7af86c6bc8a**。唯一CI86／36219307419，push/attempt1，最後queued，2026-09-26T04:56:18Z；未原生接受，不重送O。

## 新增且完成開發測試

出手沿真實enemyAction origin→target作0.20上限方向位移，再回到原anchor；受擊沿真實allied Effect.origin退縮0.10上限，分別24／18simulationticks。無origin不猜方向，重疊事件保留受擊優先。位置只改render mesh，原state/effects不變。

死亡仍在原規則時刻HP0並隱藏原敵人。只在同一state與敵人物件確實曾活著、收到致命事件時，另建24×32靜態nearest-alpha殘影，維持原palette，材質複製一次；24ticks縮短淡出並釋放。最多3殘影／9216rawRGBAbytes；不當原生memory或FPS測量。載入已死亡、換state、隱藏、reduced中死亡不補造殘影。

Same-tick不累加、暫停固定tick、reduced立即抑制與同tick還原、expire不重播、rewind/rebase/chapter/dispose及部分建立失敗清理都有回歸。M/N姿態、face/feet/C配色與已接受cache保持，Core／ATB／傷害／死亡／碰撞／save不改。

20檔、最終2401Node／442Python通過，新增41＋8包含總數；517inputs不變，remote src/scripts/tests tree相同。三viewport實际CPU出手／死亡正向像素差異與24tick後精確N還原；這些都是明示離線fixture。

## 原生結果的界線

CI85／Pages79本輪closed/accepted，只證明N原生living frame3一筆及三組source-paired4/5、原有技術旅程與有限靜態圖。106縮圖／2fullsize，沒有影片原速或聆聽。原報告／十ledger173列與七ZIP保存回讀。

O在N完整native路線／按鍵／等待／截圖／斷言之後追加正常選敵及普通攻擊18HP→0，收實際transform／texture／expiry報告。**CI86資料仍未取得：nativeBodyVerified=false、nativeDeathVerified=false**。不把texture/transform history當同步framebuffer。

## 持久交付

O已測包 **1hBerRJsROrDa6YY0pXXloUVm1iSTerVM**，1105642bytes，SHA256c38285c734adc51dd6e949c84f286b616b2bdbdc9b5bd008da9b2bb1fab4c724；38manifest／518快照實際下載回驗。CI85原包 **1Y2eBSYn36UbXfzMreaiC9vWXoIjYupvd**，89299477bytes，SHA2564d91262210c17c73e08a94364e09f0c5db4c94898ffeb13e78d022bdeb13146d；七原ZIP／18manifest回驗。都在指定folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。包內prepublicationfalse是歷史，不重送。

## 尚未完成

全角色／全敵人方向sprite及完整移動攻擊受擊死亡、所有遊玩證據；人物植物道具尺度／原作構圖、山道法庭壓縮與樹列重疊；完整合法音訊／實際聆聽、原速舒適性及真機。完整T03–T08分母不變，2300抵達不是完整未來。Release BLOCKED，無新score／全動畫／美術／原速／聆聽／裝置／長時間／全遊戲接受。Held、原門檻、no-local-browser、私人素材限制全部保持。
