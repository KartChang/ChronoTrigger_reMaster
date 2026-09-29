# VQ04K — 旅館招牌立面安裝與真實遮擋相容

版本0.9.84；接續J／0.9.83，唯一main。這是實際模型安裝修正，不是新NPC或戰鬥動畫啟用，也不是完整城鎮重設。原生修復是否成立，以matching CI與原始畫面為準。

## 問題與來源

CI107／36502989585的J source 2b5fbc384188eb18ed2d76d9da14e01d90aec08b失敗。原cpu-renderer/era600/source-failure.json記錄「Town route readability: inn arrival actually reveals the obstructed player」。旅館停點tick582的真實ray觀察blockedBy=[]、visibility=1，沒有原native gate要求的遮擋後透明化。原report.json SHA256為005388ea64e65983b90a7c3f8c331a0f33fcd06aa51350827e9e80d6653d7a97。

原生WebGL救援與法庭成功；CPU rescue／trial因前置gate失敗而skipped，不能算通過。Pages101 skipped，沒有J playable或部署。四原ZIP、738J程式、五ledger／49原始entry和三張靜態圖只作限定核對，存在性ledger不覆蓋失敗的語義gate。原始檔與失敗維持不變。

## 正式遊戲修改

僅src/production-sightline-art.ts增加招牌local X=-.32、Y=-.10的安裝偏移，保留J的XY=.66縮尺與2:1面板比例、原mesh world transform、UV、indices及材質。面板內縮、下移至屋簷下門旁立面，沒有擴大招牌或移動人物來改變測試。

正式ArtDirectedWorld沿用既有private Geometry與原inn遮擋入口；四份geometry、15512bytes payload（上限16384）不成長，0新增mesh／texture／material。三個法庭平台Z=.70保持；原ray算法、visibility／alpha漸變、未知來源拒絕、owner／drift／held還原／dispose與資源上限保持。沒有把測試停點或路線放進runtime，也沒有直接指定blockedBy或診斷值。

原CPU優化、解析度、取樣、State、時鐘、input、save、碰撞、camera、角色來源像素，以及held prologue 2711a74185aacf3c6bddf9db85ba99a2afbc507a／母親家具不變。No local browser；原native route/wait/capture/assertion/golden及<.12／適用路段309ticks／單一30秒／250ms-256／CPU品質記憶體門檻均不改。

## 驗證與限制

新增46項Node與4項Python；作者數學／原source拒絕、真實owned geometry與生命週期、正式current-app全畫面、CI107四個原停點×兩種reduced-motion模式、三viewport案例、16個非target／held全frame與J一致。原inn gate使用真實ray結果：離線K在原inn停點命中p0並淡化，其餘入口／居民／出口不命中而維持不透明；未改gate。保存J/K各四停點共8份installed模型JSON及8張離線CPU比較圖，明示rect-only Canvas port，不冒充native截圖。

最終完整Node3702／3702、Python641／641、assets／typecheck／quality schema／build全部通過。747程式檔全測前後一致；19差異（10修改、9新增）、728J原程式及723受掃描原輸入保持。K→J明示SOURCE-only inverse及J→I／前代傳遞只用於舊source測試；不作用於native、image或State。

早期dedicated被工具timeout中斷的log及新增fixture的一項失敗保留。原cached root切home是disabled而非立即dispose；新增fixture改為先驗disabled，再實際dispose後驗binding清零。沒有變更runtime生命週期或原生斷言。完整Node/Python沒有放寬門檻。quality30/100是舊review，不是K新分數。

完整source/tests/logs/manifest/models/offline views先入唯一Drive folder 1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb並真正下載回驗，再一次non-force source push；pending保存matching CI，不長poll／rerun／dispatch。快照program-vq04k.tar.gz不含docs或node_modules，不覆蓋最新main文件。

離線通過不等於原生修復或完整藝術批准。下一步驗原gate、CPU rescue／trial和後續gates、原生招牌構圖及exact Pages source；再續屋頂樹列／建築家具／縮尺地圖與完整動作。112NPCwalk、256party combat仍staged。完整T03–T08與音訊聆聽／原速／真機／長時段不縮；全部完整品質批准false、newScore=null、releaseBLOCKED。ROM/media/fonts/credentials私有。

## v45恢復補記

以上為找回的原技術紀錄，不回填原發布前驗證。K最後pre-push回下載收據未找回，現有證據為本輪發布後實際下載回驗。CI108／Pages102已success並完成限定來源／三張靜態圖／部署核對；目前source已續作L，唯一CI109。詳細權威見STATUS與VQ04K_RECOVERY_READBACK；原下一步／未證明敘述保留其當時脈絡，不當成目前pending。
