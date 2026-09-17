# Cloud delivery index — 2026-09-18

## Authority and destinations

Source／進度：GitHub KartChang/ChronoTrigger_reMaster main。Game source `2eec00c4a9e74c7873724217bd14f5087c42acf0`；文件HEAD可比source更新，不是另一候選。

Google Drive専用資料夾：[ChronoTrigger_reMaster](https://drive.google.com/drive/folders/1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb)
Folder ID：`1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb`。

已補存封存：[ChronoTrigger-delivery-archive-2026-09-18.zip](https://drive.google.com/file/d/15XAmLxm597Lplx4XQPTk9madKmu0iFrI/view)
File ID：`15XAmLxm597Lplx4XQPTk9madKmu0iFrI`；size 16,705,596 bytes。
SHA256：`86942783045635b306557c37a4d0e8fbb6559527625935b8f56a7696899dfb48`。

已完成：Drive upload → metadata readback → raw download → 整包SHA256相等 → ZIP CRC與17個成員SHA256相等。不是只宣稱有上傳。相符manifest在封存根目錄MANIFEST.json，每份交付保持原檔名及原始bytes。

## 封存內17份既有交付

1. a_single_composite_promotional_gameplay_mockup_ima.png（概念，不是引擎截圖）
2. chrono-ci10-playable.zip
3. chrono-existing-browser-evidence.zip
4. chrono-hd2d-fair-v0.2-candidate.zip
5. chrono-hd2d-fair-v0.2-ci6.zip
6. chrono-hd2d-kingdom-v0.4-candidate.zip
7. chrono-hd2d-opening-v0.3-candidate.zip
8. chrono-hd2d-pages-navigation-v0.5.1-candidate.zip
9. chrono-hd2d-playable-v0.1-ci5.zip
10. chrono-hd2d-prototype-art-kit-v0.4.1.zip
11. chrono-hd2d-quality-v0.4.1-candidate.zip
12. chrono-hd2d-reference-art-v0.5.zip
13. chrono-hd2d-reference-v0.5-candidate.zip
14. chrono-hd2d-rescue-v0.6-art-review.zip
15. chrono-hd2d-rescue-v0.6-candidate.zip
16. chrono-hd2d-rescue-v0.6-source.zip
17. chrono_hd2d_ai_guidelines_v1.zip

這是本對話當前仍可取得的所有既有生成交付物，不是全帳戶備份。歷史候選、來源包內的舊blocked文字及品質聲明保持原貌，不能凌駕最新STATUS。現行source已在GitHub，舊source ZIP只作歷史留存，不能拿來覆蓋main。

排除使用者的ROM及原始AI模板ZIP；未讀取／擷取ROM。封存内沒有ROM/SPC及字型副檔名；這是交付衛生檢查，不是完整IP清權稽核。

## 新版CI交付如何入庫

CI12仍執行中，新的artifact ID尚未取得。成功後保存三類：browser-evidence（含來源與實際save）、playable、art-review-kit；失敗亦保存evidence。每項寫清source SHA、run、artifact ID、Drive file ID、byte size、SHA256、實際驗證狀態。不得以舊candidate冒充新CI成功包，不以會到期的artifact網址當唯一持久留存。

文件主入口：STATUS.md、TODO.md、DEVELOPMENT_WHITEPAPER.md、FEATURE_PROGRESS.md、handoff/IMMEDIATE_CONTINUATION.md均在GitHub。本輪不再以sandbox附件作交付入口；後續也遵守此規則。Drive分享權限沿用建立時設定，未擴大公開分享。
