/** DOM recovery UI. No renderer emulation, privileged browser settings or save writes. */
export function showRenderFailure(doc:Document,error:unknown):HTMLElement {
 const el=doc.createElement('section');el.id='render-unavailable';el.className='fatal';el.tabIndex=-1;
 el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','render-unavailable-title');
 const title=doc.createElement('h2');title.id='render-unavailable-title';title.textContent='無法建立遊戲畫面';
 const message=doc.createElement('p');message.textContent='目前的繪圖設定未能建立遊戲畫面。這不等於沒有獨立顯示卡；一般內建顯示晶片也可能提供所需功能。';
 const help=doc.createElement('p');help.textContent='WebGL 失敗時預設使用 CPU／Canvas2D 相容繪圖。若選擇僅使用 WebGL，請移除網址的 renderer=webgl。若仍無法建立畫面，請檢查瀏覽器限制。本次啟動失敗不會覆寫本機存檔。';
 const details=doc.createElement('details'),summary=doc.createElement('summary'),reason=doc.createElement('p');
 summary.textContent='技術資訊';reason.textContent=error instanceof Error?error.message:String(error);details.append(summary,reason);
 const retry=doc.createElement('button');retry.id='render-reload';retry.textContent='重新載入';retry.onclick=()=>doc.defaultView?.location.reload();
 el.append(title,message,help,details,retry);doc.body.append(el);return el;
}
