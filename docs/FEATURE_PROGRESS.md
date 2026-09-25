# 功能進度 — VQ03M 已發布；CI84原生驗收待完成

Authority：STATUS／TODO／IMMEDIATE_CONTINUATION／CI84_CHECKPOINT。Root **T05-early-visual-cohesion**，terminal **CI84-field-foe-motion-evidence**。Source **32672b15a8df76ff243f7840ef95a9b8b817a052**／tree **e2584ffecb08463567c192e94aa6a9840cf2658a**，版本 **VQ03M／0.9.60**。25檔一次non-force發布，完整tree匹配已測程式加當時main文件。Matching **CI84／36179274810**最後in_progress/null，provider updated2026-09-25T19:22:38Z；尚未讀原生產物或matchingPages，不重送M。

## 本輪已實作

山道／森林小怪新增四手臂姿態，frame0保留原drawImp逐byte，另外三張分別抬臂待機、準備及張臂受擊。原臉部／腳底／24×32／C五採樣與配色不變，不重做C、不替換原pixel-art或單一emission材質。Runtime只改render.ts及新增imp-motion.ts／field-enemy-motion.ts。

原simulation tick驅動待機相位与準備姿態；受擊僅在原已交付player/guest/combo hit唯一指向活著小怪時顯示18ticks，沒有生成遊戲事件或捏造敵人攻擊者。減少動態使用原frame0但必要傷害回饋照舊。暫停不補跑，時間回退／state替換清受擊；同場景保持真實貼圖frame cache，隱藏或死亡不upload。原章節entry upload只記錄，不再額外重畫；只在姿態改變更新既有貼圖，dispose清references。沒有新增mesh/material/texture或存檔欄位。

新增fieldEnemyMotion只讀診斷，含實際frame/tick/cell/RGBA；uploadScope為pose-changes-only，不含原進場更新。既有CPU capture同一次evaluate追加實際motion，原PNG先保存才新gate。Opening原05-canyon-battle.png之後追加一次只讀JSON并先保存再斷言，原按鍵／等待／走位／截圖不變。新的JSON和precedingPNG不視為同步幀；CI84未驗收，尤其受擊姿態正向native發生未證明。

## 已完成的回歸與持久保存

Final **2333Node／424Python通過，Node零fail零skip**，新31Node＋8Python；31Mtargeted通過、pre-M兩項姿態RGBA斷言失敗。完整check/assets/typecheck/build/diff与500inputs前後／發布前一致，504assembledsnapshot另含4rootdocs。三viewport原state/camera/palette/geometry、exactreduced roundtrip、hidden/disposed/回退/rebase和原版同順序lab往返已測。四export獨立CRC/Pillow/runtimeRGBA匹配，frame0PNG與原imp相同；仍是review-not-approved。

13檔36精確M片段的source-only inverse保留原完整hash與missing/duplicate/unrelated負測試、Node/Python對齊。Partial test ports改用實際新controller，原版lab初入/返回差異按相同原流程比較；沒有native報告／PNG改寫或新增容差。早期failure logs保留，清理隱藏重畫後最終全套重跑；不是只跑新測試。原生observer目前只有明示Node/Python離線驗證，沒有本機browser。

M包 **Chrono-VQ03M-field-foe-motion-tested.zip／1YOjQHTPvlwkBuNd__o6lz6rTI6JDCBhk**，1279540bytes／SHA256 **7a72c83dc65fa4b64b79e31caa2c26bcbdab3ca224a6b879c351d97801759d76**；25檔／504snapshot／90manifest及logs已存指定folder並實際下載核parent/hash/CRC/tar。封裝前false是歷史，最新正式source/run見 **VQ03M_TESTED_BATCH.json**，不重送或覆舊docs。

## 最新接受與仍開放

CI83／Pages77已按CI83_ACCEPTANCE有界接受：580原檔不改／十ledger173列相同／三jobs完整CPU旅程與HTML/publicHTTP通過。102contact、3fullsize原圖与169.28秒339個2fps樣本不是原速／聆聽／真機認證。7原ZIP／39manifest已保存 **1hjxKhDgg7P4bcU-WxH8SRsfyG4ykMJee**，下載核對完成。CI77／75失敗與CI71歷史未接受保留。

先完成CI84的兩處新motion原生觀察、原C及全部舊門檻、原圖原片、matchingPages和原ZIP雲端回讀。四手臂姿態不等於完整方向移動／攻擊／死亡動畫，完整角色動畫TODO仍開放；山道／法庭構圖、樹木重疊、廣泛人物植物道具尺度輪廓、完整合法音訊／聆聽與原速舒適性也未關閉。T03–T08完整範圍與原品質分母不縮，2300抵達非完整未來；release仍BLOCKED、無新score。沿用STATUS所有heldprologue／no-local-browser／state時間CPU限制。
