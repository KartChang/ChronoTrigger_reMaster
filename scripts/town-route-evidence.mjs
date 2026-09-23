import {expectedTownParty} from './town-party-evidence.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why,observation)=>{if(!ok){const e=Error('Town route readability: '+why);e.observation=structuredClone(observation??null);throw e;}};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const ids=['entry','resident','inn','exit'];
export function assertTownSignOcclusion(o,state){
 const expected=expectedTownParty(state);
 need(o?.profile==='vq02z-inn-actor-visibility'&&o.active===true&&o.owner==='kingdom-truce/inn-sign'&&o.approved===false,'sign identity',o);
 need(o.tick===state.ticks&&o.method==='parallel-orthographic-triangle-rays','same rendered simulation tick',o);
 need(same(o.subjects,expected),'exact in-story actor ray owners',{expected,observed:o.subjects});
 need(Array.isArray(o.blockedBy)&&new Set(o.blockedBy).size===o.blockedBy.length&&o.blockedBy.every(id=>expected.includes(id)),'blocked actor ownership',o);
 need(Number.isSafeInteger(o.meshRayTests)&&o.meshRayTests>=expected.length&&o.meshRayTests<=expected.length*9,'bounded actual ray tests',o);
 need(finite(o.visibility)&&o.visibility>=.3&&o.visibility<=1&&o.originalVisibility===1&&o.meshVisibility===o.visibility,'actual sign opacity',o);
 need(o.originalMaterialMode===1&&o.materialMode===(o.visibility<1?2:1),'real alpha blending, not alpha discard',o);
 need(o.fadeTicks===9&&o.holdTicks===12&&o.textureUnchanged===true&&o.geometryUnchanged===true,'authored sign and fixed tick contract',o);
 return true;
}
/** A required addition to the CLI; original movement and all prior source gates remain unchanged. */
export function assertTownRoute(r,routes,observation,receipt){
 need(r?.schema==='chrono-town-route-readability-v1'&&r.status==='passed'&&r.physicalDevice===false&&r.artApproved===false&&r.motionVideo===false,'record identity',r);
 need(Number.isSafeInteger(r.routeStart)&&r.routeStart===9&&r.routeEnd===15,'six original Truce legs');
 need(same(routes.slice(9,15).map(t=>[t.axis,t.target,t.coop]),[['z',1,false],['x',-4.5,false],['x',0,false],['z',-4.3,false],['x',-6.5,false],['x',7.3,false]]),'route order unchanged');
 need(same(r.originalViewport,{width:960,height:640})&&same(r.restoredViewport,r.originalViewport),'original viewport restored');
 need(same(r.beforeRestore,r.afterRestore)&&r.beforeRestore?.chapter==='truce','resize complete state frozen');
 need(r.stops?.length===4&&same(r.stops.map(v=>v.name),ids),'four released stop observations');
 const ends=[9,11,14,15];
 for(const [i,v] of r.stops.entries()){
  observation(v,true);assertTownSignOcclusion(v.signOcclusion,v.state);
  need(v.paused===true&&v.fullStateEqual===true&&same(v.after,v.state)&&v.state.chapter==='truce'&&v.state.mode==='explore','complete paused stop state');
  need(same(v.viewport,{width:390,height:844})&&v.routeEnd===ends[i],'portrait and native route association');
  need(v.image.path===`town-route-${ids[i]}.png`&&receipt(v.canvasImage)&&v.canvasImage.path===`town-route-${ids[i]}-canvas.png`&&v.canvasImage.source==='actual-cpu-canvas','DOM and actual canvas receipts');
  const c=v.camera,f=c?.camera;
  need(c?.townProfile==='vq02x-town-portrait'&&f.active&&f.portrait&&c.motion.tick===v.state.ticks,'actual portrait camera');
  need(Math.abs(f.ratio-v.renderer.width/v.renderer.height)<1e-8&&same(f.bounds,{left:.045,right:.955,top:.12,bottom:.8}),'same CPU buffer and HUD margins');
  need(same(c.rects.filter(a=>a.id!=='inn-sign').map(a=>a.id),expectedTownParty(v.state)),'all active projected actors');
  for(const a of c.rects){need([a.left,a.right,a.top,a.bottom].every(finite)&&a.right>a.left&&a.bottom>a.top,'finite projected subject');need(a.left>=.045-1e-5&&a.right<=.955+1e-5&&a.top>=.12-1e-5&&a.bottom<=.8+1e-5,'projected subject within HUD margins',a);}
  if(i){const a=routes[ends[i]-1].afterRelease.state;need(v.state.ticks>=a.ticks&&same(v.state.players.map(p=>[p.x,p.z]),a.players.map(p=>[p.x,p.z])),'stopped players match original released route');}
 }
 need(same(r.beforeResize,r.stops[0].state),'entry resize cannot advance simulation');
 need(r.stops[2].signOcclusion.blockedBy.includes('p0')&&r.stops[2].signOcclusion.visibility<1,'inn arrival actually reveals the obstructed player',r.stops[2].signOcclusion);
 need(r.stops[0].signOcclusion.visibility===1&&r.stops[3].signOcclusion.blockedBy.length===0&&r.stops[3].signOcclusion.visibility===1,'clear arrival/exit restore the authored sign');
 return true;
}
