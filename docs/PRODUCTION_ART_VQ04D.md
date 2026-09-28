# VQ04D — 四名角色探索画格與山道銜接的正式美術

Source **4620737f6434043dcea3cb8dcc63ea85e9dbf9c2**／0.9.77，CI101/36401626967目前in_progress。這是原生像素作者程式與正式runtime接入，不是concept展示。

## 作者範圍

production-party-art.ts重新編寫Crono/Marle/Lucca/Frog的48×64 idle/walk/ready/victory。四方向、每動作4slots，四人合計256slots。形體包括分開的腿與鞋底、彎肘、非矩形衣身、皮帶圍巾、馬尾與頭盔眼鏡、青蛙眼部與披風。保留pivot24,62、2pixel邊距、原接地／時鐘／步態0與2接觸重複，因此256不是256個獨立姿勢。

Attack/cast/hurt/down仍drawHDHero原圖，256slots全byte一致，沒有暗中切換另一套假診斷。原native party-combat/reaction的goldens釘住來源格，本輪不得改；全combat/death與全敵人/NPC目標保留open。Ready屬本批新圖，但不是attack完成。

## 正式上傳與來源

ArtDirectedWorld安裝production-party-finish，原World仍控制playback與draw，四參數完整forward。只allowlist實際party／同伴靜態copy，排除mother與held home/bedroom/downstairs/lab。讀super.inspect().partyCombat.current[slot]的實際pose/frame/facing；不注入或修改這些狀態。

LEGACY_PARTY_CELLS的512個FNV是作者來源lookup hints，不是native evidence；候選仍要逐byte對照由未修改hd-hero-art重新生成的格。71個探索／protected格bytealias用真pose區分，不單憑hash、畫格相同或未知資料代替。未知／protected保持原canvas原像素，productionArt.party另列paintprofile與partialstatus，不聲稱actorArt幾何profile變成完整新美術。

借用原DynamicTexture.update，在真正upload前畫新格；原arguments/return/errors保留。每綁定只保留raw/finished兩份、最多8／196608CPUbytes，未新增partyGPUtexture。靜態／protected重繪不每frame無故再upload。關閉章節還原raw；重入只refresh一次；texture或scene dispose只撤除自己的wrapper，後來owner不被覆蓋。

## 山道近遠景銜接

canyon-horizon-finish安裝低矮不規則草岸／岩層景片，原root同scene。512×128、262144rawRGBA、一個lazy texture/material/plane，z12.25、y1.6、width24/height4；位於原navigation外，不碰角色／道路／camera。Alpha上方留白、中間低鞍讓原關口可讀；非新collision或可走地形。原北端是否已達目標仍待CI101新原始圖和運動視角，不能用離線圖批准。

## 匯出与验证

Build輸出dist/art/production-vq04d四張768×512角色atlas與山岸PNG＋manifest。各角色128slots中64重畫、64沿用，所有pose/frame/facing/pivot／原新標記與RGBAhash明示；PNG解碼逐byte同runtime。素材在指定Drive包runtime-art/，不是在對話交圖。主assets manifest新增party-exploration-vq04d required/review，原required保留。

3292Node/613Python/assets/typecheck/build通過，新增72Node/4Python，635其他inputsbyteexact。四hero全512实际upload、未知與protected別名、held還原／重入、釋放／上限、真正currentD八場景、三個家中完整frame、PNGpixelparity均覆蓋。Ccomponent明示凍結，currentD不是只跑前版fixture。原native routes/waits/captures/assertions/golden不改。

作者工作圖標OFFLINE，不是localbrowser/native或真機。全戰鬥／死亡、敵人／NPC、概念級場景構圖、原速／連續遮擋／合法完整音訊聆聽／真機長時段仍open；art/fullAnimation/wholegame未批准，score=null，releaseBLOCKED。
