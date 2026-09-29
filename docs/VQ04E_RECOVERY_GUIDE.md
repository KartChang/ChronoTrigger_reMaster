# Recovery entry — v48，直接用唯一N

本檔名稱沿用，不是重做E。確認main一次，读STATUS／TODO／T05_ANIMATION_CHECKPOINT v48。N source 9f6b6c66a51fb0856618d36318470fefa58e74a3／tree7d4e43fb4ce50cfe5e7458171ac2662033bac2a0／0.9.87。CI111／36609405380／push／attempt1／exact N：in_progress，conclusion=null；provider updated 2026-09-29T18:04:15Z。 只接exact N，不重送source、不rerun、不dispatch；pending存checkpoint。CI110／M已完成限定審查，不再等待。

程式恢復Drive 1OlTMP27yhci9bgPVUn4tU0szRlU2dnzy的Chrono-VQ04N-production-batch.zip：5365405bytes，SHA256 7a1598a6ce12315e8c1cb94a15df9e733f4b3f2dca98ad0e3e01958a8789c8e6。此ID的早期WIP已由最後全測包替換，舊收據的unpublished是push前時間點，不是另一candidate。恢復program-vq04n.tar.gz的780檔，不含docs/node_modules；最新docs取GitHub main。N完整失敗／成功logs、23delta、manifest、模型／offline圖都在同包。

工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只恢復node_modules/esbuild hardlink，不覆盖source/config、不開bootstrap CI。唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。需要M舊證據時直接用已確認ID，search空不能認定不存在；不再整包審計CI110。No localbrowser/native造數；原門檻及held保持；所有完整批准false／newScore=null／releaseBLOCKED。
