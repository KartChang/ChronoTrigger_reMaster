# Status — VQ04H已發布；恢復中斷接續，CI105執行中，v42

Authority：本頁／TODO／evidence/T05_ANIMATION_CHECKPOINT.json v42。唯一KartChang/ChronoTrigger_reMaster／main，single AI／non-force，不建分支、PR或平行candidate。Root T05-early-visual-cohesion；execution T05-early-production-art；work item T05-early-production-art-canyon-court。

## 目前source與唯一CI

VQ04H／0.9.81 source fb57de8eb15fc3e46e078a946766ed42e59611e4，tree 3a8641d56cf3add8c5ffb3d29b779eaedcb3f966，parent 891dbf710ee149a931515bb6a2e2bf41b7587a4b。上次中斷發生在source已發布、文件仍停v41之後；本輪讀回main／commit／tree並恢復H，不重做或重送G/H。本輪只補文件／收據，沒有新遊戲source、重新全測或另開CI。

唯一CI105／36463822283，push／attempt1／exact H，最後觀察in_progress／conclusion=null，created2026-09-28T18:14:44Z，provider updated2026-09-28T18:14:49Z。pending保存接續點，不長poll、不rerun／dispatch／重送source。H原生與部署尚未確認。

## H實際模型與已恢復驗證

四棟托魯斯建築100結構件以Y=.33為錨點、高度比例.82；法庭被告席.50／法官台.72，含兩講台與八飾線共10件。使用私有Geometry改模型；保留原X/Z、transform、UV、材質、貼圖、camera、State及碰撞，不移動角色湊畫面。最多110 owned geometries、100320bytes幾何buffer payload，0新增mesh／texture／material。不是全場景或美術品質批准。

已恢復原始完整logs：Node3553／3553、Python629／629、assets／typecheck／quality schema／build通過；52項H專屬Node、15個非目標／held完整CPU畫面一致。CI103既存beforeState離線51條ray記錄為G6遮擋、H0；只是離線模型測試，不是新原生畫面。CPU study沒有證明中位draw更快，不能宣稱修復native效能。

本輪下載H包核93manifest／717source／25delta（11修改、14新增），全部sizes／SHA256／Git blobs及delta bytes相符；717個before-full hashes匹配snapshot，原after-full summary記零變更。計算Git root與已發布H tree完全一致；692G程式原byte、held prologue blob不變。原失敗／中斷／UV辨識修正logs保留。這是恢復與來源綁定，不是本輪重跑全測。

## CI104 failure／Pages98 skipped，不能回填成功

CI104／36454035999已failure，updated2026-09-28T17:28:14Z；Pages98／36458343628 skipped，updated17:28:17Z。四原ZIP、三source lanes／59原始entries之既存限定review與完整包已恢復；無playable、無G部署。CPU rescue在reunited／truce往z7.6的雙人路線用了311ticks，超過309；最後位置在<.12範圍內，但原預算仍失敗。根因與H是否修復均未證明，原30秒、250ms-256及tick門檻不放寬。

最後已審查部署仍E／CI102／Pages96；Pages97 failure保留。新Pages exact-run selector尚無成功部署證據，不因單測通過批准。

## 持久來源與下一步

唯一Drive folder 1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。H完整包11JsLBJkTyPUy8VOKh6Xd0JyRhSMwec0t，1876159bytes，SHA256 e6eac00744fdac80f3096d52074e9def1049ac9101cf5c87d0b3e615176defd4；program-vq04h.tar.gz不含docs／node_modules。本輪已真正下載回驗，見VQ04H_RECOVERY_READBACK；包內715檔early readback只是歷史，沒有冒充最終包的pre-push回驗。

先接CI105完成後的原ZIP／失敗或成功報告／H真實比例遮擋／Pages限定review，再續完整美術。G224 NPC ambient/greet保留，112walk與256party combat仍未啟用。全T03–T08、全party/enemy/NPC動作death、縮尺地圖切換、合法完整音訊／聆聽／原速／真機／長時段不縮。完整品質批准false、newScore=null、releaseBLOCKED。No localbrowser／native State-time-save-collision注入；ROM/media/fonts/credentials私有。文件[skip ci]，容器非權威。
