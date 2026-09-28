# ChronoTrigger reMaster 開發白皮書

版本 **product-vq04e-production-v39**；authority STATUS／TODO／T05_ANIMATION_CHECKPOINT v39。唯一main／singleAI／nonforce。完整D白皮書原blob add8b5541492e244ab0163550a6f6af43740f978仍保留於evidence/VQ04E_PREVIOUS_WHITEPAPER.md；未改架構、数值、音訊設計與完整分母沿用，不重新審計歷史。

## 產品與固定架構

完整《超時空之鑰》瀏覽器HD-2D、像素角色與立體場景、原作背景／辨識度／構圖、縮尺大地圖與城鎮／室內切換、fixed ATB、P1/P2及自主第三、全部時代主支線結局。2300抵達不是完整未來，不縮成展示。先完成前段實際美術與舒適性，不能用生成展示圖或反覆動畫邊界維護取代。

保留TS/Babylon/esbuild、原World／固定simulation／A*／InputBoundary／v1-v8。ArtDirectedWorld只組合原scene美術pass，不能另造框架或改State／HP／碰撞／時間／存檔。暫停／背景恢復及CPU/WebGL共同入口保留。原CPU品質／記憶體門檻、route／tick／key／wait／capture／assertion／golden／<.12／單一30秒／250ms-256不放寬。No localbrowser／native造數。Held prologue2711a74185aacf3c6bddf9db85ba99a2afbc507a及母親家具不得直接或間接替換。

## 已接受基礎，不重做

D0.9.77／4620737f6434043dcea3cb8dcc63ea85e9dbf9c2，tree6259343245e0cba54242e0c042cc52e986e1b8ed；四角色idle／walk／ready／victory四方向256欄位、另256原combat格、A/B/C環境及D山岸保持。原3292Node／613Python已接受基礎沿用，本批完整回歸是驗證E變更，非重開D歷史验收。

CI101／36401626967與Pages95／36405777143皆success；Pages選D／CI101／playable10961967519。七原ZIP與九payload一致的限定review沿用，空.nojekyll不在tar維持揭露。W／Y／B／C原有有界接受沿用；CI93／95／98維持failure，不rerun或回填。

## E正式生產美術程式

從v38恢復的九檔直接續作；七類NPC336欄，僅28ambient實際接入，308direction／walk／greet只匯出。四主角256combat作者格仍runtimeApplied=false。原人物導航、時鐘、位置及native source-cell goldens未改，不宣稱完整戰鬥重畫已啟用。

本批補全owned DynamicTexture upload身分／尺寸／獨占／root驗證、未知來源fail-closed、原參數／this／回傳值／例外傳遞、靜態格節流、held切場還原、換owner及dispose監聽清除。12binding上限，新增GPUtexture0、額外保留CPU RGBA最多294912bytes。完整ArtDirectedWorld共用此入口，不增加框架或裝置測試旁路。

作者與PNG同源、全部八個NPC物件、原上傳、資源生命週期、正式入口四target章節及12非target／held章節測試已納入全套；E→D明示SOURCE-only inverse與必要前代傳遞保護原hash／native/golden。測試與技術細節見PRODUCTION_ART_VQ04E.md；完整結果與雲端收據見STATUS／DELIVERY_INDEX。離線fixture不是原生遊玩或真機證據。

## 持久交付與接續

唯一folder1UhnvGAlVgAySLaV2Oka0LjNidTaxMeEb。本批完整程式、tests、logs、manifest與11PNG先入庫並回下載驗證，才一次non-force main source發布。唯一matchingCI及Pages實際狀態以checkpoint為準；pending保存接續點，不長輪詢、rerun或manual dispatch。舊恢復包1YMrtU5O5nATW6aFeuKZELc_fH-op6ltr保留為來源鏈，非平行candidate。

所有成果GitHub或指定Drive並回讀，docs[skip ci]；snapshot不含docs／node_modules，不覆蓋最新main文件。工具鏈1JItxu6LhYFyTwMysm7mlY4lQsClUrvjE僅node_modules／esbuildhardlink；container非權威。

## 全範圍與批准仍未完成

完整T03規則、T04成長經濟技能、T05全部美術動畫合法音訊、T06全時代主支線結局、T07實際畫面／遊玩／真機整體>=90与各面向>=80%、requiredassets／fivegates／zero critical、T08fulltests／onesource／matchingCI／cloud回驗均不縮。Tank／Yakra完整native death、Hench outgoing、P down、Q受擊selector-change樣本缺口保留。

完整party／enemy／NPC方向動作與death、概念級場景尺度構圖、合法完整音訊聆聽、原速／真機／長時段仍在TODO。art／fullAnimation／originalSpeed／listening／device／longSession／wholeGame批准皆false；newScore=null，releaseBLOCKED。舊quality scorecard不是E新分數；CI綠勾與素材／測試數不是藝術評分。ROM／media／fonts／credentials私有。
