# Status — VQ04J已發布；唯一CI107執行中，v44

Authority：本頁／TODO／evidence/T05_ANIMATION_CHECKPOINT.json v44。唯一KartChang/ChronoTrigger_reMaster／main，single AI／non-force。Root T05-early-visual-cohesion；execution T05-early-production-art；work item T05-early-production-art-canyon-court。

## 目前source與唯一驗證

VQ04J／0.9.83 source **2b5fbc384188eb18ed2d76d9da14e01d90aec08b**，tree **31f37080ef4b5c0531e964910cd2a087fcb8aed1**，parent **c3c177a5e314ed3fa3251e3dc0c9841a1ff52f7e**。一次non-force發布且回讀main／commit／parent／tree；738程式檔、22差異（11修改／11新增）與最終已測、已回下載快照一致。文件另用[skip ci]，不再追加遊戲source。

唯一 **CI107／36502989585**，push／attempt1／exact J，最後in_progress／conclusion=null，provider updated **2026-09-29T00:25:14Z**。J原生效果及部署尚未確認；pending保存接續點，不長poll、不rerun／dispatch／重送J/I。

## 本批實際美術及完整測試

旅館招牌local XY縮至.66，維持原2:1比例及世界anchor；三個法庭圓弧平台local Z縮至.70，保留原X/Y寬度與高度、UV與indices並重算法線。正式ArtDirectedWorld的四份private Geometry、15512bytes payload（上限16384）；0新增mesh／texture／material。角色位置、貼圖、State、時鐘、camera演算法、碰撞、held母親家具不變。這不是完整屋頂／城鎮重設。

**Node3656／3656、Python637／637、assets／typecheck／quality schema／build全過**；66專屬Node與4Python、16非target／held整張CPU畫面一致、4個actual-current target案例、4份實際模型JSON及4張offline比較圖。J→I SOURCE-only保護與前代傳遞，原native routes／waits／captures／assertions／goldens不改。

738source全測前後逐byte相同，716個I程式及711受掃描原輸入保持。原driver將75個原.gitignore已排除的test-results產物算入after集合，原false摘要未改；SOURCE_VERIFICATION明示738source未變，75產物全存包內。早期dedicated中斷與四項新fixture失敗、兩個錯誤未引用Git物件均照存；沒有改已測source或原生斷言。

原I離線射線阻擋數已為0；本批證明的是平台投影前緣後退、未新增阻擋及角色投影不動，不宣稱解決所有不透明像素遮擋。實際原生畫面仍待CI107。舊quality30/100不是J新分數。

## CI106／Pages100成功，回到美術主線

I source e6512e40a48d68df1dab351a8151d1e40b637a36：CI106／36472872816 success，updated2026-09-28T20:10:48Z；Pages100／36477353924 success，updated20:11:19Z。CPU rescue原雙人路線291ticks<=309、<.12／30秒等門檻不變，後續CPU trial與source-bound checks通過。這是一輪成功原生觀察，不證明單一根因或長期可靠性；CI104/105 failure不回填。

Pages實際選CI106／exact I／playable10994152919。七原ZIP、727source、五ledger／150原entry及九Pages payload同源完成限定核對；空.nojekyll不在tar明示。兩張WebGL靜態審查，不是全motion／影片／聆聽／真機；未另抓live site。最後已限定審查部署更新為I／Pages100，非E。

## 持久交付與下一步

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。J最終包 **13wktlxljWmQLlXpo5Aw8CM7OKmAXsy_7**／Chrono-VQ04J-production-batch.zip，2124403bytes／SHA256 **265983e672f416817c760fa26b1cdb3733d6ff39f6893e104b88017aee955b58**；165manifest／738snapshot／22delta／完整logs／模型／offline圖與75產物。2026-09-29T00:24:35.571632Z真正回下載核parent／size／hash／CRC及全部bytes後才push。program-vq04j.tar.gz不含docs／node_modules，不能覆蓋最新main文件。

先接CI107原始結果／J招牌平台構圖／原CPU與部署限定review，再續完整美術。112NPCwalk／256combat仍staged；全T03–T08、全動作death、縮尺地圖、合法完整音訊／聆聽／原速／真機／長時段不縮。完整品質批准false，newScore=null，releaseBLOCKED。No localbrowser／native造數；ROM/media/fonts/credentials私有。
