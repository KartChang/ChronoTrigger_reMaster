# VQ04B — 山道／法庭／森林與配角的正式美術整合

Source **b5e92d92940e28344f4a9f5a618050d513f6253a**，0.9.75／CI99。此批是production code，不是概念圖生成；目標品質尚未批准。

## 場景

production-art沿A原尺寸與13surface名稱：重寫四款oak，分叉根幹、5主枝、41不等形葉团及共同左上光色，減弱圓盤內描邊；減少山道路面閃點／草簇／碎石和草皮噪點，保留安靜通路。遠山使用三層角形稜線、空氣透視、非矩形遠林。法庭無徽木料弱化反覆金框，不干擾法官主徽記。所有runtimeRGBA無ROM／外部圖／服務輸入。

1000森林paintProductionForestFloor直接覆原384×352地面DynamicTexture，三條既有路段與navigation不变。不是追加背板；不新配GPU貼圖。

法庭CI98的windowtop約.020705<原.065造成原20swait失敗。B保留原zoom半高max(7.8,9/aspect)、target及angle，ortho上下界同移+1.2。離線finaltop.097628，5viewports原條件通過；沒有改測試等候或縮小演員掩蓋問題。四組側柱x±7.7／z-4.8,-.8由12parts組成、使用舊石材且不可pick、不加collision。連A合计法庭27+山道1productionparts。

## 配角色料／形體處理

production-actor-finish僅綁法庭judge/defender/prosecutor/juror/testimony，修改本來48×64畫格的色料與有限形體明暗；8style×4原ambient格，不是32個新pose。Alpha、darkkeyline、pixel位置、pivot和clocks不變，party/guest/enemy/mother不綁。完整角色重畫仍待續，這項不得充當全party方向與戰鬥動畫。

Adapter借用DynamicTexture.update，在真實upload前處理源RGBA，原arguments/return/errors保留。原raw/finished各一份，不重複累積，newpose重新處理；章節退出還原raw、重入重套，texture/scene釋放恢復自身wrapper並清記憶體。最多24bindings/589824CPUbytes、GPU新增0。本批既有environment13texture合計6,213,632rawbytes未增加，非整遊戲記憶體。

ArtDirectedWorld每次draw先begin(chapter)再super.draw(state,dt,animate,frameEffects)，四參數保留；原World仍render/gameplayowner，沒有localbrowser/test/device專用顯示模式、timer或State寫入。

## 匯出、測試與真實範圍

原13環境PNG路徑dist/art/production-vq04a保留，profile改B；新增dist/art/production-vq04b含8castatlases+1forestfloor共9PNG。32cells／森林RGBA與runtime經解碼逐byte驗證。22PNG由原CI artartifact蒐集、workflow不變；Drive包runtime-art/已保存。不是22新texture，也不是遊戲截圖。

3160Node／605Python、asset/typecheck/build全通過，新增50Node/4Python。613未改程式inputs及原native/golden/held斷言皆保持。新currentBapp CPUintegration涵蓋三場景改變、State／非新增幾何／party敵方像素不變、5viewports、borrowedupload上限/切場/釋放、完整effectsforward、非目標home等exactframe。Acomponent明确凍結A，不能拿A測試替代B。

Source-onlyinverse保留原Ahash且不能處理native/pixel/game資料；開發失敗attempt保存，最終GitHubtree完全等於已測。OFFLINE作者工作图不是CI實際圖，未注入任何native狀態。CI98保持failure、B獨立原生驗證尚未完成。

下一步以CI99 actualPNG與連續運動檢查樹冠尺度、岩壁／远山銜接、法庭柱體遮擋與裁切、cast明暗；繼續完整角色方向／move/attack/hurt/down/death、所有早期美術與實際遊玩。現在仍低於concept目標，沒有90分、art/fullanimation/device/listening/wholegame批准。
