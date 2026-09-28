# 立即執行型交接 — v38／VQ04E已恢復，先完成美術程式

請立即用GitHub connector及必要的Google Drive connector接手KartChang/ChronoTrigger_reMaster。唯一main；single AI／non-force，無其他使用者，不建新branch／PR／平行candidate或多人防撞。不要重新盤點repo、審計歷史、重做已接受章節、索取ROM／token／截圖或手動造證據。

## 目前位置

已發布遊戲 **VQ04D／0.9.77**：source **4620737f6434043dcea3cb8dcc63ea85e9dbf9c2**；source tree **6259343245e0cba54242e0c042cc52e986e1b8ed**。本文件所屬main是docs-only／[skip ci]交接提交，父提交f0068b4915f852acf128c66b6106c92225a205a4。以當前main／STATUS／checkpoint **v38**為權威，舊pending不算目前狀態。

CI101 **36401626967**，push／attempt1／exactD，completed/success，updated2026-09-28T09:47:56Z。Pages95 **36405777143**，completed/success，updated2026-09-28T09:48:33Z，選CI101／Dsource／playable10961967519。**沒有active validation，不等待使用者回CI101 done、不重跑／dispatch／重送D。**

Root T05-early-visual-cohesion；execution T05-early-production-art；原work item T05-early-production-art-canyon-court。最少讀STATUS、evidence/T05_ANIMATION_CHECKPOINT.json、TODO，再直接續恢復E，不重讀所有歷史。

## 唯一未發布E，直接恢復不要重画

完整工作包 **Chrono-VQ04E-recovered-handoff.zip**
Drive file **1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr**
唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**
Bytes **1353612**
SHA256 **8cb93672b85f1ed56b0037187f92705c93556535c2df78176c6c0b97ef74404b**

已真正回下載驗parent／size／SHA／外內CRC／40manifest／669snapshot逐byte。從 **program-vq04e-recovered.tar.gz** 恢復完整E程式，不覆蓋最新main docs；此包不含工具鏈。changes/九檔與早期checkpoint逐byte相同；其餘660個D檔案未變。詳細檔案在VQ04E_RECOVERY_GUIDE.md。

已找回七類NPC作者與原來源比對owned-upload接線、四主角combat作者API、export與asset登錄。NPC336slots中28ambient映射於草稿adapter，308方向／walk／greet仍僅匯出；四主角256attack/cast/hurt/down **runtimeApplied=false**，原native source-cell goldens保持。不是完整動畫完成。

本次typecheck／check:assets／character export皆過，11PNG／592cell hashes逐格同源。**較晚完整E測試紀錄／更晚source沒有恢復；本次完整Node／Python／build／current-app未跑。** 不從聊天成功說法回填，不直接推未全測E。

## 立即操作

補齊E-specific painter／owned upload／未知來源／heldhome／資源釋放／current-app／PNG parity tests，以及明示E→D source-only predecessor preservation；保留全部原hash、native routes／waits／captures／assertions／goldens，不刪測試或造source像素取綠燈。九個作者／接線檔已存在，不重畫。

完整Node/Python/assets/typecheck/build後合批一次source，先將logs／snapshot／manifests／素材存指定Drive並回讀，再non-force推main及接matchingCI。只有一份E工作，不建parallel candidate。pending留checkpoint，不長poll到中斷。

D已完成3292Node／613Python及四角色探索256slots、山道後岸、A/B/C環境不用重做。CI101原始七ZIP及限定review已在Drive兩包並回下載核驗，ID **1VOM_mhZmmLMLghmiONpSoWvERwx4sKMz**、**1t-6QvmDUFs1O3-AvZ9AF3Y-6yUiPuxmg**；不要再次整包審查。九Pages payload一致，空.nojekyll缺失已明示；不是全motion/video/audio/device批准。

再續完整party／enemy／NPC戰鬥／受擊／倒下／death及其餘前段構圖、尺度、樹列／山道／法庭、合法完整音訊／聆聽／原速／真機舒適性；概念图等級尚未達成。不得用生成展示圖或一整輪animation-only維護取代實際美術。

## 固定界線

TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8不變，不改ARPG或P3。Heldprologue **2711a74185aacf3c6bddf9db85ba99a2afbc507a**及母親家具不提升／間接替換。工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE** 只恢復node_modules/esbuildhardlink，不覆source/config或bootstrapCI。No localbrowser／native state-time-save-collision注入；原<.12／單一30秒／250ms-256／CPU品質記憶體門檻不放寬。ROM/media/fonts/credentials私有。

Tank/Yakra完整native death、Hench outgoing、Pdown、Qselector仍open，不造樣本。W/Y/B/C已接受基礎沿用；CI93/95/98保持failure，不rerun／回填。T03–T08完整目標不縮，2300抵達非完整未來；整體>=90／各面向>=80%、requiredassets/fivegates/zero critical仍需實證。art/fullAnimation/wholeGame與聆聽／真機批准false，newScore=null／releaseBLOCKED。

全成果寫GitHub或上述指定Drive／readback，docs[skip ci]。臨時環境隨時會清除；直接用這份已回驗工作包，不依賴舊/mnt/data，也不要求使用者重貼資料。
