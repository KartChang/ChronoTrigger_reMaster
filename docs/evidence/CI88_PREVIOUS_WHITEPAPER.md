# ChronoTrigger reMaster 開發白皮書

版本 **product-vq03o-ci86-pending**。動態authority：STATUS／TODO／handoff/IMMEDIATE_CONTINUATION／evidence/T05_ANIMATION_CHECKPOINT。Main only／singleAI／non-force。Root **T05-early-visual-cohesion**；terminal **T05-field-foe-action-animation**。前一版完整白皮書原blob另存evidence/VQ03N_WHITEPAPER.md，歷史說明不作當前發布狀態。

## 一、完整目標與品質

完整《超時空之鑰》HD-2D重製，像素人物＋立體場景、瀏覽器優先、原作辨識度／世界背景／場景構圖／縮尺大地圖／城鎮室內切換／原地ATB、單人及同機双人共畫面、所有時代主支線及結局。前段人物、場景、完整動畫、遮擋、HUD、操作與音訊實際品質優先，不缩成展示、不因CI綠勾提前擴後段。

T07需整體>=90／各面向>=80%、requiredassets/fivegates/zerocritical並有實際畫面、遊玩與真機證據。測試數、文件、匯出圖與新效果不能代替美術評分。現有工具30/100是舊runtime記錄，不是O現況評分；release BLOCKED，沒有新score／完整遊戲接受。

## 二、架構與不可變行為

TypeScript／Babylon.js／esbuild及固定依賴，單一自含HTML，玩家不需ROM/Python/帳號/後端。Controls→main固定1/60秒→core規則→render/HUD/audio；呈現不得決定傷害、ATB、碰撞、劇情或死亡。CPU/WebGL使用同場景與規則；無GPU需真正CPU triangle/texture/depth回退，不造第二套低品質關卡。

暫停、背景、對話、背包、native選檔和contextloss凍結模擬；恢復不補跑背景時間。InputBoundary清舊輸入，A*遵守原碰撞。P1克羅諾、P2依劇情、露卡／瑪兒／青蛙自主第三與獨立選敵／雙確認合技保持；不加P3、不改ARPG、不重造框架。V1–v8白名單IndexedDB／JSON相容，診斷／動畫快取不入save；不造舊版本行為證詞。

CPU原640×480cap、最大邊1280、tiers、32MiB/512entries與120活動FrameWindow保持；CPU不等於GPU的shadow/glow/specular/postprocess品質。Packedclear/rowspan、預設OFF opaqueaffine minification、alpha/perspective nearest、mip釋放不改。不能用短window或Nodebench當真機流暢／長時間認證。

## 三、已存在流程及未完成遊戲面

保留家中醒來／樓梯、縮尺世界、祭典行為／初遇／項鍊異變、600山道／托魯斯／森林／王城、皇后消失／露卡合作、修道院青蛙／管風琴暗門／亞克拉救援返鄉、護送審判、兩條越獄、弗里茲／露卡、龍戰車三部位、重聚時門與2300抵達。**2300抵達不是完整未來篇**。

現有13商品、武器身體頭部裝備、角色相容與份數、金幣庫存守恆、交易上限／裝備後戰鬥保持；400G價格與普通攻防是明示暫定值，不冒稱原作完整數值。完整規則／版本差異／拓樸／數值是T03；完整成長、報酬掉落、消耗品經濟、飾品、技能學習、換人、雙三人技仍是T04。

## 四、保留的前段美術／相機／音訊

既有HDhero固定tick／實際步伐／cache／接地、NPC姿態、原遮擋／取景／landmark遲滯、植物下肢保護、祭典材質銅光照、村莊細節／窗框與玻璃保持。C fieldenemy unlit emission、24×32 nearestalpha和五採樣；M frame0–3與Nframe4/5保持。H/I/J/K/L的森林時門／法庭／陪審員接地／山道地面岩壁、8切角平台、8樹卡4樹冠atlas不重做。

Held VQ01Z／母親家具不得提升或間接替換，src/prologue-render.ts blob固定 **2711a74185aacf3c6bddf9db85ba99a2afbc507a**。

G七組自製合成音型／七段配樂不取ROM/原OST/第三方採樣。每型<=3聲部、level合計<=.04、尾音<=.5秒，共用16聲部/master.55、單audio-clock不加timer，超額丟棄不補播。Dialoghold立即停止，graph/connect/start/stop失敗和dispose獨立清理；analyser1024重用且讀真訊號，不造零。Graph/unit/無音軌影片不能替代完整音訊、實際聆聽與裝置音量安全。O不改audio。

## 五、O本批呈現與邊界

**VQ03O／0.9.62** source **116bcd03b431e12135bbadf6584d6a06b826f639**，tree **00abe47a184d80e60bfec5435bd0e7af86c6bc8a**。20檔一次nonforce提交；runtime只新增field-enemy-body.ts並接render.ts。Core、M/N繪圖、傷害ATB死亡碰撞save、原workflow皆不變。

出手與退縮只依實際既有事件origin/target，24tick／.20與18tick／.10的render-only位移，起終點原anchor；無origin不猜方向，受擊重疊優先。不是預判出手、不增加敵人游走規則，也不是完整方向sprite sheets。

死亡原sprite照HP0當刻隱藏。只有同物件曾活着且交付致命hit，才建立獨立24×32靜態nearestalpha殘影，原palette、一次textureupload、最多3個／9216rawbytes；24ticks縮短／淡出並釋放。下緣沿billboardup補償，不移logicalanchor，不延長可選取／碰撞／生命。已死載入／rebase／hidden／reduced不補造；same-tick不累加、pause固定tick、reduced切換、expired不replay、rewind/rebase/chapter/dispose/建立失敗釋放有回歸。

## 六、測試／原生接受狀態

最終 **2401Node／0fail／0skip；442Python／0fail**，新41＋8包含其中；asset/typecheck/build通過。517程式inputs前後一致，遠端src/scripts/tests tree全部吻合。三viewportCPU正向出手差異與精確N復原；額外死亡／半程像素差異192×128:60/40、256×160:93/66、240×180:116/80，24ticks後逐byte同N。12檔35hunk source-only inverse及missing/duplicate/unrelated負測試保持舊版門檻；初期fixture/port失敗logs保留。全部離線fixture不是native。

最新已接受 **N／CI85及Pages79**：實際livingframe3一筆、三組同來源frame4/5，十ledger173列逐byte、原sourcearchive及playable/staged/deployedHTML同byte；七原ZIP與manifest實際Drive回驗。106PNG縮圖／4表、2fullsize、104縮圖；本輪無影片decode／原速播放／聆聽／真機。Software runner短樣本3.65/3.72FPS不是流暢接受。CI85_ACCEPTANCE bounded/closed；不重驗CI84/85或早期收據。

O唯一 **CI86／36219307419**、push/attempt1，最後queued，provider2026-09-26T04:56:18Z。O原生受擊位移／死亡尚未接受。原Nnative路線／按鍵／等待／截圖／斷言保留，新suffix只在完成後用正常選敵及attack18HP→0觀察殘影到期。Exactsource報告由field_enemy_body.py唯讀核對；transform/texturehistory不是同步framebuffer。

## 七、後續與完整分母

當前只接CI86原始產物與matchingPages。Pending不當failure、不追加dispatch；完成後核原完整journey/chooser/CPU600/rescue/trial/ledgers、新原生body報告及原PNG／source／HTML，原ZIP/影片保存Drive回讀再接受。只修確定terminal，不改時間／門檻／狀態來求過關。

完整T05仍需全部角色／敵人方向sprite、移動攻擊受擊死亡與實際遊玩；人物植物道具尺度輪廓／原作構圖、山道法庭壓縮／重疊樹列、完整合法音訊及聆聽、原速走位淡化viewport舒適性。T06所有時代主支線結局不縮。T07真機input/FPS/frame-time/load/memory/background/save/audio、整體>=90/各面向>=80%、requiredassets/fivegates/zerocritical。T08每批完整測試／一次source／matchingCI／原產物雲端回讀。無新全動畫、美術、原速、聆聽、真機、長時間或全遊戲核准。

## 八、持久交付與治理

唯一folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**。O已測包 **1hBerRJsROrDa6YY0pXXloUVm1iSTerVM**，1105642bytes，SHA256c38285c734adc51dd6e949c84f286b616b2bdbdc9b5bd008da9b2bb1fab4c724，38manifest／518snapshot已實際downloadverified。CI85原包 **1Y2eBSYn36UbXfzMreaiC9vWXoIjYupvd**，89299477bytes，SHA2564d91262210c17c73e08a94364e09f0c5db4c94898ffeb13e78d022bdeb13146d，七原ZIP／18manifest已回驗。詳DELIVERY_INDEX；assembled快照不是publishedGitarchive／最新docs，封裝false/null不重送O。

Main only/singleAI/non-force，no branch/PR/parallel candidate或多人防撞。No localbrowser／native game-time-save-collision造數，不放寬<.12、原ticks、單一30秒、250ms/256、CPU畫質／記憶體。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE只node_modules、保留esbuildhardlink，不覆source/config／bootstrapCI。私人ROM1yMJ5jL8UeUi60D60BZ9Ffy1cyme3EpvM及media/font/credentials不公開。文件[skip ci]，所有成果正確雲端回讀，臨時容器不作權威；CI77/75failure、CI71歷史false不回填。
