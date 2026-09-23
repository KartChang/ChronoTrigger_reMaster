import {readFileSync} from 'node:fs';
const expected=JSON.parse(readFileSync(new URL('../tests/fixtures/planter-pixels-unit.json',import.meta.url),'utf8'));
const need=(ok,why)=>{if(!ok)throw Error('Readability evidence: '+why);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const finite=n=>typeof n==='number'&&Number.isFinite(n);
export function assertPlanters(p){
 need(p?.profile==='vq02t-truce-planters'&&p.approved===false&&p.name==='truce-planter-craft','planter identity');
 need(p.width===64&&p.height===64&&p.meshes===5&&p.sampling===1&&p.alpha===false,'five existing nearest opaque planters');
 need(same(p.samples,expected.samples),'actual planter RGBA');return true;
}
export function assertPauseLayout(v,viewport,focus){
 need(same(v?.viewport,viewport)&&v.focus===focus,'keyboard focus and viewport');
 const d=v.dialog;need(d&&['x','y','width','height'].every(k=>finite(d[k]))&&d.width>0&&d.height>0,'dialog geometry');
 need(d.x>=0&&d.y>=0&&d.x+d.width<=viewport.width+.01&&d.y+d.height<=viewport.height+.01,'dialog viewport bounds');
 need(['scrollTop','scrollHeight','clientHeight'].every(k=>finite(v[k]))&&v.scrollTop>=0&&v.clientHeight>0&&v.scrollHeight>=v.clientHeight,'real scroller');
 need(v.controls?.length===3&&same(v.controls.map(c=>c.id),['resume','render-quality','cpu-sampling']),'all controls retained');
 for(const c of v.controls){
  const b=c.rect;need(c.visible===true&&c.hit===true&&finite(c.fontSize)&&c.fontSize>=14,'visible hit-tested readable control');
  need(b&&['x','y','width','height'].every(k=>finite(b[k]))&&b.width>=44&&b.height>=44,'44px control target');
  need(b.x>=Math.max(0,d.x)&&b.y>=Math.max(0,d.y)&&b.x+b.width<=Math.min(viewport.width,d.x+d.width)+.01&&b.y+b.height<=Math.min(viewport.height,d.y+d.height)+.01,'unclipped controls');
 }
 return true;
}
export function assertPauseAccess(r,frozen,viewport,index,observation,receipt){
 need(r?.schema==='chrono-pause-access-v1'&&r.status==='passed'&&r.physicalDevice===false,'pause access identity');
 need(typeof r.originalSampling==='boolean'&&r.restoredSampling===r.originalSampling,'sampling restored');
 need(same(r.before,frozen)&&same(r.after,frozen),'complete frozen state');
 assertPauseLayout(r.initial,viewport,'resume');assertPauseLayout(r.qualityFocus,viewport,'render-quality');assertPauseLayout(r.samplingFocus,viewport,'cpu-sampling');
 const keys=r.originalSampling?['Tab','Tab','Space','Space','Tab']:['Tab','Tab','Tab'];
 const order=r.originalSampling?['render-quality','cpu-sampling','cpu-sampling','cpu-sampling','resume']:['render-quality','cpu-sampling','resume'];
 need(same(r.keys,keys)&&same(r.focusOrder,order),'native keys and wrapping focus');
 assertPauseKeySteps(r.steps,keys,order,frozen,r.originalSampling);
 const n=r.nearest;observation(n,false);
 need(n.paused===true&&same(n.state,frozen)&&n.chapter==='truce','nearest actual paused state');
 need(n.image.path===`pause-controls-${index}.png`,'nearest DOM owner');
 need(receipt(n.canvasImage)&&n.canvasImage.path===`village-nearest-${index}.png`&&n.canvasImage.source==='actual-cpu-canvas','nearest canvas owner');
 return true;
}

/** Additional source-bound key transitions. Old focus/state/image gates remain above. */
export function assertPauseKeySteps(steps,keys,order,frozen,original){
 need(Array.isArray(steps)&&steps.length===keys.length,'one raw transition per native key');
 let focus='resume',sampling=original;
 for(let i=0;i<keys.length;i++){
  const s=steps[i];need(s?.key===keys[i]&&s.completed===true,'completed native key identity');
  for(const p of [s.before,s.after])need(p?.paused===true&&same(p.state,frozen)&&typeof p.sampling==='boolean','per-key complete frozen state');
  need(s.before.focus===focus&&s.before.sampling===sampling,'key continuity before activation');
  if(keys[i]==='Space')sampling=!sampling;
  focus=order[i];need(s.after.focus===focus&&s.after.sampling===sampling,'native checkbox toggle and focus');
 }
 need(focus==='resume'&&sampling===original,'key sequence restores focus and sampling');return true;
}
