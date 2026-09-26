# 功能進度 — T修道院身體回應已發布，CI91待原生證據

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT。唯一main、root T05-early-visual-cohesion、terminal T05-field-foe-action-animation。**VQ03T／0.9.67** source **c5e0359e87c991e495566f7444042ee972f4df9d**／tree **9eef2dbf9010febf39e058c7877c4d5207691dd1**，唯一CI91／36268788532，最後queued/null（provider2026-09-26T20:13:54Z）。T已發布未原生接受，無未發布candidate。

## 已接受基礎

M四姿態、N來源明確的敵方出手、O前段敵人身體與24tick殘影、P角色出手朝向/down clip、Q受擊保持已繪製方向、R三種戰鬥效果simulation時鐘與S修道院手臂姿態保留。CI90/Pages84為最新有界接受：WebGL及CPU各1Yakra出手收招、guard/Yakra存活受擊；Naga/Hench出手缺正向。P倒地與Q受擊換目標亦缺，不能當故障直接重寫或擴張認證。

CI90十ledger177列、634原檔/source/HTML與七原ZIP下載回驗完成。僅rescue07及CPUrescue06兩張fullsize檢視，無其他PNG、聯絡表、影片解碼/播放、聆聽或真機。CI90_ACCEPTANCE與closedcheckpoint保留，不重驗已接受批次。

## T本批實作

新增RescueEnemyBody，render.ts僅接線。真實enemyAction的source origin/target决定出手方向，24ticks／.20幅度；實際唯一存活目標hit與明確origin決定受擊退縮，18ticks／.10幅度。無origin combo不猜方向，沒有另一套gameState或邏輯移動。

原敵人按原HP0時刻立即停用；新獨立靜態texture殘影複製原24×32或48×48 RGBA一次，24simulationticks內依實際相機up與原幾何缩短／淡化／釋放。最多3／27648rawbytes，不代表原生總memory/FPS。Reduced不建立新death殘影，已存在者隱藏且同tick可恢復；same-tick重畫不累加，pause不消耗phase。

受擊中斷、hidden/dead、identity/reset/rebase/rewind/modeexit/dispose及texturecopy分配失敗釋放有回歸。診斷只存24筆真實source/transform/texture指紋，非同步framebuffer。Core、傷害ATB死亡碰撞v1–v8save、InputBoundary、S原圖/M-Scontrollers/workflow均不改。

## 測試與原生界線

完整 **2748Node/0fail/0skip、531Python/0fail**，新增64/22已包含；asset/typecheck/buildpass。562programinputs＋4rootdocs＝566frozen前後相同，另THIRD_PARTY共567snapshot。三viewport與三敵種離線actualCPU motion/death/half/expiry正向差異與到期逐像素exactS還原，資源一致；13files47hunk嚴格source-only inverse與負測試不轉native資料。

初期44targeted22fail修正端點、原stroke/number資源期望及start/out區分後通過；firstfull2735pass10fail因partialWorld缺controller，補實際controller且原斷言保留；最後全套pass。所有初期logs及working檔保存，沒有放寬門檻。

Native六個唯讀觀察在原battle/victory邊界，不增加keys/waits/screenshots或改原斷言。原S checker預設仍嚴格，T明列expected_build；N-R也保留原檢查。**nativeRescueBodyVerified=false／nativeRescueDeathVerified=false**，需CI91原始結果；胜利凍結导致缺完整deathphase仍須如實記錄。

## 保存與後續

同ID final **1Smn-MRJWOYBkCIs4IpBjqLhOnHiiCuxX**，1584014bytes，SHA256 **9eca85a42008f673d58f86adb6153d0a73dac76444c31ece5a3703b8201a0532**，57manifest/567snapshot已實際下載回驗。發布22檔程式樹匹配已測版，包內false/null與舊parent是歷史。Source後文件不改程式。

接CI91原始body/motion/完整旅程/Pages及雲端回讀，再續全部角色敵人方向動畫、尺度構圖、山道法庭壓縮/樹列、完整合法音訊聆聽及原速真機舒適性。T03–T08完整分母與品質門檻不縮，2300非完整未來；無新score，releaseBLOCKED。固定mainonly/nonforce/no-localbrowser/native-state原門檻/heldprologue/私人素材限制保持。
