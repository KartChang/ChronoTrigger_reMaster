const need=(ok,msg)=>{if(!ok)throw Error('Actor playback: '+msg);};
/** Checks renderer observations from the existing reference journey. Unit
 * fixtures and source pixel parity are not GPU/visual approval. */
export function assertActorPlaybackEvidence(r){
 need(r?.profile==='vq02c-tick-and-distance-playback'&&r.source==='actual-reference-journey-renderer','actual observations missing');
 need(r.artApproved===false&&r.physicalDevice===false,'unsupported approval');
 need(Array.isArray(r.moves)&&r.moves.length===3,'all original movement observations required');
 for(const m of r.moves){
  const p=m.playback;need(Number.isSafeInteger(m.tick)&&p?.profile===r.profile,'tick/profile missing');
  need(Array.isArray(p.actors)&&p.actors.length===2,'two existing party slots required');
  for(const a of p.actors){
   need(a.clock==='simulation-ticks'&&a.current?.tick===m.tick&&a.stateMutation===false,'actor clock or boundary mismatch');
   need(Array.isArray(a.history)&&a.history.length<=24,'bounded live history missing');
   for(const h of a.history){
    need(Number.isSafeInteger(h.tick)&&h.tick<=m.tick&&Number.isInteger(h.frame)&&h.frame>=0&&h.frame<4&&Number.isFinite(h.distance)&&h.distance>=0&&Number.isFinite(h.cycle)&&h.cycle>0,'invalid pose observation');
    if(h.pose==='walk')need(h.frame===Math.floor((h.distance+1e-10)/h.cycle*4)%4,'gait is not distance-driven');
   }
  }
  need(new Set(p.actors[0].history.filter(h=>h.pose==='walk').map(h=>h.frame)).size>=2,'real P1 gait never advanced');
  const c=p.cache;need(c?.profile==='vq02c-retained-pixel-span-cache'&&c.entries>0&&c.entries<=c.limit&&c.limit===96&&c.hits>0&&c.additionalGpuTextures===0&&c.spanBytes<=96*48*64*6,'bounded live replay cache missing');
 }
 need(r.pause?.stateUnchanged===true&&JSON.stringify(r.pause.before)===JSON.stringify(r.pause.after),'pause changed playback');
 need(r.reduced?.poses?.length===2&&r.reduced.poses.every(p=>p.pose==='victory'&&p.frame===0)&&r.reduced.playback?.actors.length===2&&r.reduced.playback.actors.every(a=>a.reducedMotion===true),'reduced-motion victory missing');
 return true;
}
