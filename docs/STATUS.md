# Status — VQ04A 實際美術已接入，CI98 驗證中

Authority：本檔、TODO、evidence/T05_ANIMATION_CHECKPOINT.json **v34**。唯一 KartChang/ChronoTrigger_reMaster main／single AI／non-force。使用者已明確要求優先做專案美術，以認可的山道與法庭概念圖為目標，不是繼續只交示意圖或一輪輪動畫邊界修補。

## 唯一目前位置

**VQ04A／0.9.74** source **4dc7449ff41a6b87e452c45184198b3c9a1929e2**；source tree **18e4e642f7e54cfdf7c7f2581712afb6533933af**；parent **781e3a34664752771056c51aeec2edd1aa61c539**。23 個 source/test/asset 檔合批、完整測試後一次 non-force source push。沒有新分支、PR、平行候選、manual dispatch 或未發布 candidate。

唯一 matching **CI98／36338351176**，push／attempt1／exact source，最後 **in_progress**，provider updated **2026-09-27T17:49:23Z**。新美術尚無這一輪原生截圖或 matching Pages 接受。此後文件提交只有 docs／[skip ci]；文件 HEAD 不是遊戲 source。

## 本輪實際美術增量

山道：重新編寫並接入地表、草地、層理岩壁、四款有不同輪廓的樹冠 atlas、遠山景片；保留原道路邊界、既有岩台及碰撞。法庭：石材地面與牆面、紅金地毯、法官木作、陪審席木料、絨布、彩窗與旗幟，另加牆柱、柱頭、燭台部件及簷口，調整取景但不搬動角色。1000 年森林：既有十五個樹卡換用共用四款樹冠；不是重做 600 年森林或 held 家具。

合計 **13 組 authored runtime surfaces、3 個場景、16 個新增靜態景物 mesh**。13 組完整 RGBA 共 **6,213,632 bytes**，共用且延遲建立，不每幀重畫。正式 main.ts 已使用 ArtDirectedWorld；其仍繼承原 World，並在同一 Babylon scene 裝入美術材質與牆面物件。CPU/WebGL、各啟動模式都走同一入口，沒有測試專用畫面或展示分支。

建置會把同一份 runtime 像素匯出到 **dist/art/production-vq04a/**，由原有 CI art artifact 收集。不是把概念圖貼到遊戲背後，不是匯出一套遊戲沒有使用的 PNG。詳細素材與整合說明：PRODUCTION_ART_VQ04A.md。

## 已測與未批准的界線

完整 **3,110 Node／601 Python**，0 fail／0 skip，asset／typecheck／build 通過；新增42 Node／4 Python。新整合測試實例化真正 ArtDirectedWorld，比對 actual CPU renderer pixels 已改變，同時 State/events/actors/原幾何 transform 不變；held bedroom/home/overworld/fair 圖像與原 World 相同。另測章節切換、停畫／reduced、資源重用與釋放、橫直取景、13PNG解碼與 runtime RGBA 一致。601 個未改輸入維持 byte-exact；原 expected hashes 與負例保留。成功、失敗與中斷 logs 都保存。

**這不代表已達概念圖等級。角色、敵人 sprites 本批沿用，不冒稱全人物美術或全動畫已完成。** OFFLINE 圖是 CPU 單元 fixture 的美術工作圖，不是新 browser/native/gameplay/device 證據，不能拿來評90分。實際新原生畫面、遮擋、動態、裝置舒適性尚待驗證。fullAnimationComplete／artApproved／wholeGameAccepted=false，newScore=null，releaseBLOCKED。

## 持久交付

指定 folder **1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb**：**Chrono-VQ04A-production-art-tested.zip／1IkkI26IMQX83OWLIsUK_ETUsmI_MN_q-**，57,499,039 bytes，SHA256 **18d310dd0509c832031b40e606a5546f0e226974f67a805ca9eabbbb9dbcce6d**。79項manifest、624檔program snapshot、23變更檔、13素材PNG與manifest、完整logs、離線工作圖、原CI97 browser ZIP都在包內。已真正下載驗 parent／size／hash／CRC／逐檔內容及snapshot每個byte。

封裝時 sourcePublishedAtPackaging=false／cloudReadbackAtPackaging=false 是歷史；最新 GitHub receipt/checkpoint 已記錄後續發布與實際下載，不可因此重送或重跑。早期WIP包16Z0wVuAyqHsFbHMKU5cGXBGkFkt1e0m2已被完整已測包取代，不作目前程式來源。snapshot無docs，不能覆蓋main文件。

## 接續順序

Root **T05-early-visual-cohesion**；development/execution **T05-early-production-art**；next **T05-early-production-art-canyon-court**。CI98完成後先看該source的山道／法庭／森林實際畫面，依概念目標檢查細節密度、比例、輪廓、光色、取景與遮擋，接著合批續修美術及完整人物/敵人方向動作；沒有真阻塞，不再把整輪轉回動畫維護。不要重送本批、重驗歷史或長輪詢。

CI97／Pages91 provider metadata 已success；本輪只恢复需要的Zsource並保留browser原ZIP，未宣稱新Z整包原生或Pages bytes接受。最新有界接受仍是Y／CI96／Pages90；W／CI94等closed不重開，CI93/95仍failure。Tank/Yakra完整death、Hench outgoing、Pdown、Q受擊selector-change仍open，但不得改等待/capture/原生資料補樣本。

T03-T08完整目標不縮、2300抵達非完整未來。TS/Babylon/esbuild/fixedATB/A*/InputBoundary/P1P2自主第三/v1-v8保留；heldprologue2711a74185aacf3c6bddf9db85ba99a2afbc507a與母親家具不動。No localbrowser/native造數；原route/tick/key/wait/capture/assertion/<.12/單一30秒/250ms-256/CPU品質記憶體不放寬。ROM/media/fonts/credentials私有，工具鏈只node_modules/esbuildhardlink。全部成果GitHub或指定Drive/readback；臨時容器非authority。
