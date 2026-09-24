# VQ03G 音效與音訊生命週期

本批為 T05 的局部音訊呈現實作，不是完整配樂、實際聆聽或真機喇叭驗收。原七段自製配樂不變，新增的是既有 frequency API 下的自製合成音型；沒有取用 ROM、原版 OST、第三方音效樣本或外部音訊服務。

## 音型與觸發

| 既有頻率 | 自製音型 | 排程聲部數 |
|---|---|---:|
| 262 Hz | organ：兩聲部持音 | 2 |
| 330 Hz | strike：短促降頻 | 2 |
| 440 Hz／無參數 | interact：保留單音 | 1 |
| 520 Hz | skill：錯開的上行滑音 | 3 |
| 620 Hz | restore：三音短上行 | 3 |
| 660 Hz | chime：雙音鈴聲，仍由鐘聲與合技共用 | 2 |
| 800 Hz | gate：雙聲部上行滑音 | 2 |

其他 40–4000 Hz 的有限頻率維持原 0.12 秒、0.04 level、triangle 單音；無效值拒絕。每個音型最多三聲部、單型 level 加總不超過 0.04、含尾音最長 0.5 秒。這是合成參數界限，不是音量安全或聽感認證。

同一音型只讀一次 audio clock 錨點，再排定相對 offset；不使用 timer、不改 simulation tick。音效和配樂共用原 16 聲部上限；不足時不分配超額聲部、不排背景補播，因此滿載時音型可能只有部分聲部。這個取捨保留上限，沒有調低原配樂品質策略。

`src/main.ts` 及其原始觸發點逐 byte 保留。緊接對話、選單、時代切換等 hold 的音效仍可能被立即停止；不得為了讓七種音效都聽見而放寬 hold、加 sleep、延後對話或造遊戲狀態。缺少的實際觸發聆聽證據保持 TODO。

## 資源處理

AudioContext、master gain、analyser 的初始圖必須完整建立及連接後，才登記由 SceneAudio 持有。中途失敗會分別清除 handler、斷開已建立節點並嘗試關閉 context；單一清理失敗不阻止其他清理。使用者可在失敗後重新啟用，正常路徑仍只建立一個 context。

每一聲部自建立到 start/stop 都有錯誤清理；包含 oscillator 已建立而 gain 建立失敗、第二聲部失敗、參數排程或連接失敗。失敗會關閉本次音訊請求並停止所有既有聲部；錯誤不被當成成功。motifsStarted／voicesStarted 記錄曾成功排程的聲部，即使後面失敗而取消，計數也不假裝未啟動過。

暫停、靜音、重設及 dispose 保留原 immediate master gate 與 stop/disconnect。恢復不重播被中止的音效。analyser 重用 1024 個 Float32 樣本的緩衝，讀取仍反映實際 analyser，hold 時不人工寫零以通過驗收；dispose 釋放緩衝且不再讀取 analyser。

## 驗證範圍

Unit ports 是明示的 Web Audio 替身，只驗證參數、節點生命週期及排程，不是原生音訊證據。七組既有配樂與 exact CI76 的 SceneAudio 基準逐事件比較，涵蓋跳過過期節拍、hold、重設及 state replacement；既有 main／core／music-score／render／held prologue／原生流程及證據 gate 都保留 SHA256。

G 對 build/test 註冊的變更使用精確唯一片段還原到 F；原 F→E 的 SHA256 與 missing/duplicate/unrelated 負向測試仍保留，Node 與 Python 皆有鏡像測試。原 WebGL PNG 負向測試已加入完整 Node 測試清單。

Matching CI 保留原三 job、十份 source ledger、CPU 完整旅程及既有實際 music/analyser/hold/import/mute 驗證。該既有旅程不保證會在音訊啟用期間觸發每種音效，因此成功只能支持它實際執行的範圍，不能推導七音型已原生試聽、完整 OST 已完成、長時間或真機通過。原片沒有音軌，影片解碼與 2fps 圖像抽樣也不是聆聽或原速舒適性證明。
