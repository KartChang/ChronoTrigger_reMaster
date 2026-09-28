# VQ04E 立即續作指南 — 不重畫已恢復九檔

2026-09-28交接v38。遊戲main仍D0.9.77；E0.9.78是同一未發布工作，非分支、非已測發布。完整恢復包1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr，hash及復原方法見DELIVERY_INDEX。

## 精確已恢復程式

src/native-actor-pixels.ts
src/production-story-npc-art.ts
src/production-story-npc-finish.ts
src/art-directed-world.ts
src/production-combat-art.ts
scripts/production-character-export.mjs
scripts/build.mjs
assets/manifest.json
tests/current_build_test.py

以上九檔與早期Drive checkpoint逐byte相同，非依圖片臆造重建。program-vq04e-recovered.tar.gz提供完整669檔，保留最新GitHub docs。兩張作者圖是前輪OFFLINE圖；11PNG則是本次由恢復程式實際匯出並核592cell hashes，不混充CI圖片。

## 可直接沿用的設計

七類NPC：resident、innkeeper、king、guard、nun、chancellor、queen。原root/name allowlist綁定truce/castle/cathedral/sanctum既有物件；先比對未改legacyStoryNpcCell的原RGBA，才在owned DynamicTexture.update畫新ambient格。未辨識來源不替換；草稿已有換owner／resize／dispose處理，但還需要完整current-app回歸，不能把存在的分支當測試已過。

NPC336slots中僅28ambient slots由草稿adapter映射；308方向／walk／greet只匯出，不改原靜態NPC導航。四主角combat作者API256slots，manifest始終runtimeApplied=false；不改D production-party-finish的protected 256格與native goldens。這些數字是畫格欄位，不是獨立動作數或測試數。

## 本次完成的有限檢查

npm run typecheck、npm run check:assets、node scripts/production-character-export.mjs各exit0。11PNG的PNG SHA／整張RGBA SHA／592cell SHA都與runtime作者API匯出manifest一致；669snapshot及40package entries回下載一致。

沒有恢復較晚完整Node/Python成功logs或較晚E source；本次未跑完整Node/Python/build，也未驗證新E current-app。因此不要重建「全測已過」收據、不直接推未測source。

## 下一步只補未完部分

先補E專屬作者／exact upload／unknown來源／held場景／資源／切場／current-app tests。D保護測試的明示source-only E→D層與新增E檔排除傳遞尚待接入；原hash不變，原native routes/assertions/goldens不動，不能用inverse處理native/image/State。

完成後全Node/Python/assets/typecheck/build合批一次；保存測試logs、source snapshot及素材到指定Drive並回讀，才一次non-force source push main。接唯一matchingCI；pending留checkpoint不長poll。不要重送D、重跑CI101或重畫本頁九檔。

完整戰鬥／敵人／NPC／death、前段構圖與概念級品質、合法完整音訊聆聽、原速／真機／長時段仍待完成；保持完整T03–T08與heldprologue限制。所有進度先落雲端，再提供對話摘要。
