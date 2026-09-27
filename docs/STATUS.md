# Status — V 已發布，唯一 CI93 執行中

Authority：本檔與 evidence/T05_ANIMATION_CHECKPOINT.json；另見 TODO、handoff/IMMEDIATE_CONTINUATION。唯一 KartChang/ChronoTrigger_reMaster main、singleAI／non-force。Root T05-early-visual-cohesion；terminal T05-field-foe-action-animation。開始只讀 STATUS/checkpoint、main確認一次，依 remainingWork 續作，不重讀歷史。

## 唯一目前位置

**VQ03V／0.9.69 已一次發布並回讀**：source **a8aeaf2414875b3ab82518e4373b69ae17d88648**，root **2fb99bb4b30ea4f89760595519bba986f90377cf**，parent文件 **1d5b513697a265603596751288ed07f703e7e2f5**。20檔（11修改／9新增），遠端src/scripts/tests與完整測試的凍結版本匹配；source保留live main docs，workflow與heldprologue不變。

唯一matching **CI93／36301106757**，workflow360357259／.github/workflows/ci.yml，push／attempt1／main／exact V。最後provider觀察 **in_progress／conclusion null**，created **2026-09-27T06:46:52Z**，updated **2026-09-27T06:46:57Z（台灣2026-09-27 14:46:57）**；exact source全event/state共1run。這是已記錄觀察，不保證之後仍相同。沒有未發布candidate；不重送V、不另dispatch。詳 CI93_CHECKPOINT；V原生尚未accepted。

## 本批實作與中斷恢復

V新增trial-enemy-body.ts，接trial-render.ts：守衛24tick/.20出手、車體-.08反作用、車輪.10位移依真實enemyAction來源；龍頭保持實際修復動作，不虛構攻擊。實際HP下降且來源明確才有18tick/.10受擊退縮；無origin的真實受擊只中止出手、不猜方向。邏輯位置、傷害、ATB、死亡、碰撞及v1–v8存檔不改。

原敵人於原HP0時刻立即停用；独立48×64／64×64靜態材質僅複製上傳一次，24simulationticks縮短／淡出／釋放，最多3個／49152rawRGBAbytes。此為設計上限，不是原生總memory/FPS認證。保留U圖與M–Ucontrollers。同tick／pause／reduced／hidden／owner／rewind／chapter／defeat／dispose與copy read/upload/mesh allocation失敗清理有回歸，24筆history不是同步framebuffer。

本次从v26中斷點恢復既有最終包，核59manifest、587snapshot、20changes、原final logs/exit0及程式樹，補完缺少傳輸後一次發布。**沒有重做V，也沒有重跑已完成開發測試或CI92驗收**。傳輸中未提交的二進位blob筆誤已換回原封存exact bytes，最後三個程式樹吻合才發布，未改已測source/tests或門檻。

## 完整測試與雲端保存

中斷前final **2913 Node／0fail／0skip，569 Python／0fail**；新增65Node／20Python含在總數，asset/typecheck/build通過。本次讀回原紀錄，不重複計為新測試。**586凍結輸入＝582programinputs＋4rootdocs**，前後hash同；加未改THIRD_PARTY共587snapshot。三viewport／四death種類／三outgoing種類離線CPU正向像素、same-tick及exact U還原保持。12PNG在開發期匯出，只曾看兩張小尺寸；本次未新增圖片、影片或聆聽檢視。

指定folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。V final **Chrono-VQ03V-trial-body-tested.zip／1UOO0T74CcGE95AW3oswKMtxT_OmoyRaT**，**1585595bytes**，SHA256 **7ad6830ee15b83caa4b9c05daaf1674fd015a98bd75d60f85c703fb964907e7e**。本次實際下載核parent/size/hash/CRC/59manifest/587snapshot/20changes。原始失敗logs與working版本保留intermediate/；詳 VQ03V_TESTED_BATCH。Snapshot是assembled已測程式，不是publishedGitarchive或最新docs；包內false/null、oldparent effa760及partial7files是歷史，V現在已發布，不能再送。

## 已接受基準與直接接續

最新有界accepted仍是U **074776a5cb2157937bfaf7d9bd8dbc40d8bff6d7／CI92／Pages86**，CI92_ACCEPTANCE及closed checkpoint原樣保留，本次不重驗。原包 **Chrono-CI92-reviewed-evidence.zip／1QiSj6Mfu72DQxALGADhCwmFREwjVpnOq**，89695950bytes／SHA256 **dbfac36aeab1a976df133e17312cce19a31c9320902ebb19b6a2ef1ec43637fd**／19manifest沿用既有回驗。先前不存在的U文件SHA29e859...已由既有修復記錄更正，不把它當published HEAD。

只接CI93。若queued/in_progress，保存可靠點，不長輪詢或另dispatch。完成後用exact V tests/trial_enemy_body.py核原trial-enemy-body報告與六boundary observations（WebGL/CPU），驗證真實出手位移、HP-loss退縮、原死亡立即停用、靜態copy與24tick釋放；缺完整deathphase保持缺口，不改遊戲tick或等待造樣本。保留原U／N–T報告、完整主報告/nativechooser/CPU600救援審判/ledgers，核matchingPages selectedCI/source/artifact/HTML。未修改原ZIP/reports/video/source/manifest指定Drive下載回驗後才boundedacceptance。V原生body/death皆仍false。

## 完整範圍与固定限制

完整方向sprites／全角色敵人move/attack/hurt/down/death／實際遊玩、尺度輪廓／原作構圖、山道法庭壓縮／重疊樹列、合法完整音訊／實際聆聽、原速舒適性與真機仍開放。CPUwheel／Hench出手／完整Yakra死亡／P倒地／Q受擊换目標缺口保留。完整T03規則版本拓樸數值、T04成長報酬掉落經濟道具飾品學習換人雙三人技、T05全美術建模動畫音訊、T06全時代主支線結局、T07整體>=90/各面向>=80%與requiredassets/fivegates/zerocritical及真機input/FPS/frame-time/load/memory/background/save/audio、T08每批fulltests/onesource/matchingCI/cloudoriginalreadback不縮；2300不是完整未來，releaseBLOCKED、無新score。

Mainonly/nonforce/no branchPRparallelcandidate/multiwriter。No localbrowser/native game-time-save-collision造數，不放寬原ticks/routes/keys/waits/captures/assertions/<.12/single30s/250ms-256/CPUquality-memory。保留TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1/P2/自主第三/v1-v8。Heldprologue blob **2711a74185aacf3c6bddf9db85ba99a2afbc507a**／母親家具不提升或間接替換，ROM/media/fonts/credentials不公開。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules/保留esbuildhardlink，不覆source/config/bootstrap。Docs[skip ci]/cloudreadback，臨時容器非權威。CI77/75failure、CI71歷史false不回填。
