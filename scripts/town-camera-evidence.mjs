import {assertTownPartyCoverage} from './town-party-evidence.mjs';
/** Extra source-bound geometry gate for the same paused Truce captures; not an art grade. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why)=>{if(!ok)throw Error('Town camera evidence: '+why);};
const finiteRect=r=>r&&[r.left,r.right,r.top,r.bottom].every(Number.isFinite)&&r.right>r.left&&r.bottom>r.top;
const shape=c=>({camera:c?.camera,rects:c?.rects,townProfile:c?.townProfile});
export function assertTownCameraLayouts(record){
 need(record?.views?.length===3,'all three original views');
 need(record.beforeCamera?.townProfile===null&&record.afterCamera?.townProfile===null,'original landscape restored');
 need(same(shape(record.beforeCamera),shape(record.afterCamera)),'exact restored camera geometry');
 for(const [i,v] of record.views.entries()){
  const c=v.camera,f=c?.camera,r=v.renderer;
  need(c?.profile==='vq01b-readable-actors'&&c.fullScenePublished===false&&f&&r,'read-only observation identity');
  need([f.x,f.z,f.half,f.ratio,r.width,r.height].every(Number.isFinite)&&f.half>0&&r.width>0&&r.height>0,'finite camera');
  need(Math.abs(f.ratio-r.width/r.height)<1e-8,'same actual CPU buffer');
  need(c.motion?.tick===v.state.ticks&&c.motion.approved===false,'same frozen simulation tick');
  if(i!==1){need(c.townProfile===null&&f.active===false&&f.portrait===false&&c.rects.length===0,'landscape policy retained');continue;}
  need(c.townProfile==='vq02x-town-portrait'&&f.active===true&&f.portrait===true,'portrait active');
  need(same(f.bounds,{left:.045,right:.955,top:.12,bottom:.8}),'original UI safe margins');
  need(f.half>=7.2&&f.half<8/f.ratio,'portrait enlarges, not logical actor scaling');
  need(Array.isArray(c.rects)&&Array.isArray(f.actors)&&c.rects.length===f.actors.length,'actual subject coverage');
  const ids=c.rects.map(a=>a.id);need(new Set(ids).size===ids.length&&ids.includes('p0')&&ids.includes('inn-sign'),'human and nearby landmark');
  need(same(v.state,record.before),'complete frozen party state');
  assertTownPartyCoverage(v.state,ids);
  need(same(ids,f.actors.map(a=>a.id)),'policy and projected mesh identities');
  for(const a of c.rects){
   need(finiteRect(a),'finite projected mesh');
   need(a.left>=f.bounds.left-1e-5&&a.right<=f.bounds.right+1e-5&&a.top>=f.bounds.top-1e-5&&a.bottom<=f.bounds.bottom+1e-5,'complete subject within UI margins');
  }
  const hero=c.rects.find(a=>a.id==='p0');need((hero.bottom-hero.top)*r.height>=30,'actual portrait player height');
  const inn=c.rects.find(a=>a.id==='inn-sign'),p=v.village.details.sign.projection;
  need(p?.source==='scene-matrix-projection'&&p.viewport.width===r.width&&p.viewport.height===r.height,'landmark same canvas owner');
  for(const [actual,expected] of [[inn.left*r.width,p.rect.x],[inn.top*r.height,p.rect.y],[(inn.right-inn.left)*r.width,p.rect.width],[(inn.bottom-inn.top)*r.height,p.rect.height]])
   need(Math.abs(actual-expected)<.002,'independent landmark projections agree');
 }
 return true;
}
