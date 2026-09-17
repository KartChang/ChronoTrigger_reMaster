/* Read-only deployment metadata. Never render fetched strings as HTML. */
(async()=>{
 const el=document.getElementById('build');
 try{
  const r=await fetch('./deployment.json',{cache:'no-store'});if(!r.ok)throw new Error('metadata unavailable');
  const d=await r.json();
  if(d.kind!=='development-preview'||!/^\d+\.\d+\.\d+$/.test(d.version)||!/^([a-f0-9]{40})$/.test(d.sourceSha))throw new Error('invalid metadata');
  el.textContent=`版本 ${d.version} · ${d.sourceSha.slice(0,7)} · CI #${d.ciRunNumber} 通過 · 開發試玩`;
 }catch{el.textContent='暫時無法讀取版本資訊。遊戲入口仍可使用；部署證據見頁尾。';}
})();
