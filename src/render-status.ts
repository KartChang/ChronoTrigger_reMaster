/** DOM recovery UI. No renderer emulation, privileged browser settings or save writes. */
export function showRenderFailure(doc:Document,error:unknown):HTMLElement {
 const el=doc.createElement('section');el.id='render-unavailable';el.className='fatal';el.tabIndex=-1;
 el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','render-unavailable-title');
 const title=doc.createElement('h2');title.id='render-unavailable-title';title.textContent='無法建立遊戲畫面';
 const message=doc.createElement('p');message.textContent='目前瀏覽器未能提供可用的 WebGL。這不等於沒有獨立顯示卡；內建顯示晶片也可能支援。瀏覽器允許的軟體 WebGL 會自動採較低解析度，但網頁無法強制啟用已被停用的軟體後端。';
 const help=doc.createElement('p');help.textContent='請檢查瀏覽器的圖形加速設定與顯示驅動，或改用能提供 WebGL 的瀏覽器／裝置。尚未提供完全不依賴 WebGL 的可玩繪圖後端。本次啟動失敗不會覆寫本機存檔。';
 const details=doc.createElement('details'),summary=doc.createElement('summary'),reason=doc.createElement('p');
 summary.textContent='技術資訊';reason.textContent=error instanceof Error?error.message:String(error);details.append(summary,reason);
 const retry=doc.createElement('button');retry.id='render-reload';retry.textContent='重新載入';retry.onclick=()=>doc.defaultView?.location.reload();
 el.append(title,message,help,details,retry);doc.body.append(el);return el;
}
