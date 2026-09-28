# 功能進度 — VQ04D 角色探索美術合批／CI101 pending

Authority STATUS/TODO/checkpointv37。Source **4620737f6434043dcea3cb8dcc63ea85e9dbf9c2**，tree6259343245e0cba54242e0c042cc52e986e1b8ed。24檔一次source，matchingCI101/36401626967，最後in_progress（2026-09-28T09:08:49Z）。

四名角色Crono/Marle/Lucca/Frog原生48×64的idle/walk/ready/victory已重新編寫與接入，四方向共256slots，原接地／pivot／clock維持。外型與服裝輪廓不再只是舊圖色料finish。Attack/cast/hurt/down另256slots完整原像素保留；沒有全party combat/death、敵人或NPC重製完成宣告。

實際texture upload用真正sampled pose及source全byte辨識，避免71個探索與protected畫格byte別名誤判。未知與protected保留raw；8bindings/196608CPUbytes、額外partyGPUtexture0，重複幀不重上傳；heldhome切入還原，重返重套，dispose清理。原World/game/render/camera仍唯一owner。

山道北端新1張512×128草岸／岩層alpha景片、262144rawbytes、lazy1mesh/texture，z12.25可走區之外，不移動路線／門／敵人／相機。舊A/B/C景觀保持。Dist/art/production-vq04d四個角色圖集加山岸5PNG同runtime逐像素，manifest明示256新／256沿用，assets主manifest新required/review。

3292Node/613Python/assets/typecheck/build通過，新增72/4。635未改程式input byte-exact；實際currentD八場景像素改變但State／原geometry/camera/diagnostics一致，三個held家中完整frame不變；512格真upload、PNG解碼、別名／未知、資源釋放覆蓋。舊Ccomponent明確凍結，不拿旧測試替代currentD。Native路線、等待、按鍵、擷取、斷言與golden都未改。

CI100/Pages94限定接受：三來源lane、29entryhashsize、四縮圖場景、九部署payload同staged，空.nojekyll缺失揭露。七原ZIP在正確Drive兩包並下載驗外內CRC/10manifest；不是全motion/video/audio/device批准。

完整D包 **12mvODAj_eJDm4QqXA3ngep4YIPMawSeD** 已實際下載回驗2118560bytes/SHA256/CRC/57manifest/664programsnapshot/24changes/5PNG。source tree完全等於已測。相關收據evidence/VQ04D_TEST_RECEIPT.json及CI100_PAGES94_REVIEW.json。

CI101新原生、概念級場景、完整combat/reaction/death及敵人NPC、合法音訊聆聽／原速／真機長時段仍未完成；artApproved/fullAnimationComplete/wholeGameAccepted=false，newScore=null，releaseBLOCKED。全T03-T08維持，不因探索圖重畫縮小分母。
