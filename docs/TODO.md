# Execution TODO — v38，直接續完已恢復的 VQ04E

Authority：STATUS／T05_ANIMATION_CHECKPOINT v38。唯一main／singleAI／nonforce，不建分支、PR或平行candidate。Root T05-early-visual-cohesion；execution T05-early-production-art；原work item T05-early-production-art-canyon-court。以使用者要求的實際美術程式為優先。

已發布D source4620737f6434043dcea3cb8dcc63ea85e9dbf9c2／0.9.77；CI101/36401626967與Pages95/36405777143皆success。沒有active validation，不rerun或重送D。本輪沒有新source push／新CI。

## 已完成，不重做

- [x] D四角色idle/walk/ready/victory四方向256slots、山道北端景片、A/B/C環境、held還原與3292Node/613Python完整已測基礎保留。
- [x] CI101／Pages95既存限定review、七原ZIP與兩份Drive包恢复並下載回驗；playable/staged/Pages九payload一致，空.nojekyll缺失明示。不是全動畫／真機批准。
- [x] 找回早期E九個原byte程式／建置變更，合成完整669檔程式快照；不是重畫。七類NPC、adapter、四主角staged combat、export及asset登錄均已保存。
- [x] 本次typecheck／assets／character export通過；11PNG／592cell hashes與作者API同源。本次完整Node/Python/build及current-app整合未執行，後續必須補足。
- [x] 完整恢復包1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr已存指定folder並真正下載回驗40manifest／669snapshot。舊early E包被這個恢復包取代，仍只有一份未發布E工作。

## 唯一立即步驟：E測試收尾與一次發布

- [ ] 從恢復包program-vq04e-recovered.tar.gz取程式，保留最新GitHub docs；直接沿九個已恢復檔案，不重新作者整套NPC／combat。VQ04E_RECOVERY_GUIDE列精確檔案及驗證狀態。
- [ ] 補齊E專屬tests：七類NPC所有來源格／未知來源fail-closed、真實owned upload與原參數、換材質／dispose／切場／heldhome不變、current ArtDirectedWorld、PNG同源與角色尺寸pivot。方向／移動欄位僅匯出不可冒稱已playback；四主角combat繼續明示runtimeApplied=false。
- [ ] 補明示E→D source-only preservation與必要前代傳遞；目前恢復包沒有較晚的完整E測試／保護宣告。保留原hash與所有native/golden斷言，不以刪測試、改斷言、假source pixels處理。這是待完成E變更，不是重驗D歷史。
- [ ] 完整Node／Python／assets／typecheck／build通過後，一次non-force source push到main，接唯一matchingCI。先保存完整logs／source／manifest到指定Drive並回讀；pending留checkpoint，不長poll。未完成全測前，不直接發布恢復包。

## 同一美術主線後續

- [ ] 完整party attack/cast/hurt/down/death、enemy與NPC美術、連續動作／方向／比例／接地與遮擋。256combat作者欄位尚未runtime啟用；308NPC方向walk/greet欄位尚未playback。需要不破壞原證據的合法接入，不偽造golden或刪除完整目標。
- [ ] 前段原作構圖、山岸／遠山／門口接縫、城鎮／縮尺大地圖、建築／家具／植物尺度及概念級品質。完整合法音訊、實際聆聽、原速、真機、長時段保持未完成。

Tank/Yakra完整native death、Hench outgoing、Pdown、Q受擊selector-change缺口保留，不因缺樣本推定runtime故障。W／Y／B／C已有有界接受不重做；CI93／95／98仍failure，不rerun或回填。

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全美術建模動畫合法音訊；T06全時代主支線結局，2300抵達非完整未來；T07整體>=90／各面向>=80%、requiredassets/fivegates/zero critical與真機完整驗收；T08fulltests/onesource/matchingCI/cloudoriginalreadback。分母不縮。

TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8與heldprologue2711a74185aacf3c6bddf9db85ba99a2afbc507a／母親家具不變。No localbrowser/native造數，不改原route/timing/capture/assertion/golden或放寬<.12／單一30秒／250ms-256／CPU品質記憶體。全成果GitHub或folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb；docs[skip ci]；art/fullAnimation/wholegame=false，score=null，releaseBLOCKED。
