# Delivery index — VQ04A 實際美術已測發布

Authority：STATUS／TODO／T05_ANIMATION_CHECKPOINT v34。唯一main、singleAI/nonforce。唯一Drive folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。上一完整索引blob **dad06bb2eb60f1235f70c5c198fc799e48136bae**原封保存於 **evidence/VQ04A_PREVIOUS_DELIVERY_INDEX.md**，只為必要bytes恢復沿用，不重新審計歷史。

## 目前已測完整包

**Chrono-VQ04A-production-art-tested.zip**
File **1IkkI26IMQX83OWLIsUK_ETUsmI_MN_q-**
Bytes **57499039**
SHA256 **18d310dd0509c832031b40e606a5546f0e226974f67a805ca9eabbbb9dbcce6d**

已真正下載回驗parent/size/SHA256/外層與CI97內層ZIPCRC、79manifest exactfile set與逐檔內容；624program snapshot與本批已測程式逐byte吻合。checkedAt **2026-09-27T17:48:39.901494+00:00**。不是只拿upload success做完成宣稱。

changes/23個變更檔；review/program-snapshot.tar.gz/624檔（無docs）；runtime-assets/13組實际runtime像素PNG與manifest；test-results/全部成功失敗及中斷logs；review/來源hash、程序樹、來源逆轉作者工具、明確OFFLINE工作圖及作者script；local-build-not-deployment/sourceSha=null，非CI或部署。

original/CI97-browser-evidence.zip為provider artifact10936661851原ZIP，53,629,246bytes／SHA256 **4a20c3f175075b19509ad4d0aa6bd10dcef28fd78915a366913d3ddec84929d5**；其source-fa109ffa446f69881745b2b2c09b78c494f4e2fc.tar.gz可恢復必要Zsource，內含舊docs不能覆蓋main。這是原檔保管與source恢復，不冒稱Z完整原生/Pages接受。

A0.9.74 source **4dc7449ff41a6b87e452c45184198b3c9a1929e2**／tree **18e4e642f7e54cfdf7c7f2581712afb6533933af**。完整3110Node/601Python/asset/typecheck/build通過，23檔一次source發布。唯一matching **CI98/36338351176** push/attempt1／exactA，最後in_progress，providerupdated2026-09-27T17:49:23Z。詳見 **evidence/VQ04A_TEST_RECEIPT.json**。

sourcePublishedAtPackaging=false/cloudReadbackAtPackaging=false是封裝時狀態；當前main receipt已記錄發布和download。snapshot不得覆蓋最新docs，不因包內歷史false重送source、重跑tests或另bootstrapCI。

## 本輪中途保全，非目前來源

WIP **Chrono-VQ04A-art-development-checkpoint.zip／16Z0wVuAyqHsFbHMKU5cGXBGkFkt1e0m2**，26877bytes／SHA256 **b2274f3ff59cb3091ef96e45e0354cdcb3c4df57f5d5c0a6c1ea533a67f7bf9e**，8項早期checkpoint亦曾下載核hash/CRC。此包已被上方79manifest完整已測包取代，不恢復成候選。

## 既存接受與歷史恢復

Y／CI96／Pages90有界接受原包 **1gQQduODqLkfxmfyjMgXiSAGB_67EMJn7**，88,515,875bytes，SHA256 **388c5293e822918d69592f3a3153196118b6e70aef624733e6c9a03660e3c595**，六ZIP/7manifest，既存接受保持closed。Z已測包 **1hGbOPVJPe9QnQPraMf0N83TLOZqMufk9**，3,030,737bytes，SHA256 **61f348063f0ba7e5c0d00179c769c8f8fceb80eba1ede8bdf68efbe55ace7c8e**，187manifest/611snapshot/3068Node597Python，仍有效但不是A來源。

CI97/Pages91 metadata success已記錄在CI97_PROVIDER_STATUS；沒有stagedPages新byte review或fullZacceptance。W/CI94更早closed鏈與CI93/95失敗原檔見保存的previous索引，不重驗、不回填。舊animation樣本gap保留open，優先接A實際美術。

工具鏈 **1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE**只node_modules/esbuildhardlink，不覆舊source/config。ROM/media/fonts/credentials不公開；全素材與logs持久保存，native原檔不改，docs[skip ci]。main與指定Drive才是authority，不信任臨時/mnt/data或歷史封裝pending。完整T03-T08分母、held資產與原門檻不變；releaseBLOCKED/newScore=null。
