# Execution TODO — v41，G正式NPC朝向／招呼及Pages修正已發布

Authority：STATUS／T05_ANIMATION_CHECKPOINT v41。唯一main／singleAI／nonforce，不建branch／PR或平行candidate。Root T05-early-visual-cohesion；execution T05-early-production-art；work item T05-early-production-art-canyon-court。

## 本批完成，直接沿用

- [x] CI103／36441789439 success；五原ZIP／690Fsource／三lane29entry／兩WebGL靜態畫面限定review完成，原檔存指定Drive並下載回驗。Pages97／36446907519保持failure：prepare選CI失敗，無部署，不rerun。
- [x] 七類NPC四方向ambient／greet224欄位接入正式ArtDirectedWorld，沿用E作者圖；真實active存活隊員位置、有限target／方向／距離滯後、原frame clock、held／cutscene／無目標還原；不移動NPC或寫State。
- [x] 真實owned upload、unknown fail-closed、原this／參數／return／exception、換owner／尺寸／dispose／資源界線與224格PNG同源；76新增Node含actual-current整張CPUframe與11非target／held場景一致。
- [x] Pages workflow_run使用exact trigger GET並驗證SHA／attempt／原checkRun及artifact門檻；移除獨立push選舊CI風險，保留explicit dispatch能力但本輪未執行。19新增及17原Pages測試通過。
- [x] G→F SOURCE-only inverse及F→E/D/C/B/A傳遞；原pins／native routes/waits/captures/assertions/goldens、heldprologue保留；676F程式及671受掃描原輸入原byte。
- [x] 完整Node3501／Python625／assets／typecheck／quality schema／build成功，703檔全測前後一致；原三項新增offline fixture失敗logs保留，不放寬native或原斷言。
- [x] G最終68manifest／703snapshot／27delta／7PNG／完整logs存指定Drive 1oe-CpAhb2AMAbD5GddhbOsukB-jqcy8F，真正下載回驗後單次non-force source 1512fcaf3601c31834d2047042b7fbb3a61aee66／tree2c8416cf127f2224425a6012ad0dd17585828b87，接唯一CI104。

## 立即接續，不重做G/F/E或历史驗收

- [ ] 只讀 **CI104／36454035999**／push／attempt1／exact G。最後觀察in_progress，updated2026-09-28T16:51:31Z。pending保存checkpoint不長poll；completed保存原ZIP／logs／manifest至指定Drive且真實下載回驗，做來源／原生NPC朝向招呼／遮擋與部署限定review。不rerun／dispatch／重送source。
- [ ] 新Pages驗證須實際選取CI104及同源playable、staged／deployed bytes核對，不能僅因selector單測通過標記修復完成。Pages97仍failure；最後已審查部署E／CI102／Pages96。
- [ ] 112個NPC walk欄位仍staged，尚無NPC行走導航；256party combat作者欄位runtimeApplied=false。續完整party／enemy／NPC方向attack／cast／hurt／down／death、連續動作、接地比例及真實來源相容接入，不改golden或回傳假舊像素，不縮目標。
- [ ] 實際前段美術優先：山道／法庭／樹列／建築／家具尺度構圖、門口接縫／遮擋、原作縮尺大地圖與城鎮切換。F靜態圖仍見建築壓場／townsperson屋頂遮擋及法庭講台遮住角色下半身，不能由兩張圖判定完整motion品質；後續需真實畫面改善，不用展示圖或整輪animation-only維護取代。
- [ ] 完整合法音訊與實際聆聽、原速、真機、長時段與全遊戲T03–T08。

D探索256欄位、A/B/C/F環境及W/Y/B/C有界接受沿用。CI93／95／98與Pages97保持failure；Tank/Yakra完整native death、Hench outgoing、P down、Q受擊selector-change樣本缺口保留，不注入造數。

T03全規則版本拓樸數值；T04成長獎勵掉落經濟道具裝備飾品學習換人雙三人技；T05全部美術建模動畫合法音訊；T06全時代主支線結局（2300抵達非完整未來）；T07整體>=90／各面向>=80%、requiredassets/fivegates/zero critical與真機；T08fulltests/onesource/matchingCI/cloud回驗，分母不縮。

TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8與heldprologue2711a74185aacf3c6bddf9db85ba99a2afbc507a／母親家具不變。不改ARPG或P3；No localbrowser/native State-time-save-collision造數，不改route/timing/capture/assertion/golden或<.12／單一30秒／250ms-256／CPU品質記憶體門檻。所有成果main或folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb並回讀，docs[skip ci]；全部完整品質批准false、newScore=null、releaseBLOCKED。
