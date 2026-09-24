import {expectedTownParty} from './town-party-evidence.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why)=>{if(!ok)throw Error('Town landmark evidence: '+why);};
const up={y:26/Math.hypot(23,26),z:23/Math.hypot(23,26)};
// Independent geometry calculation; do not import the production selection policy.
function half(subjects,ratio){
 const left=Math.min(...subjects.map(a=>a.x-a.halfWidth)),right=Math.max(...subjects.map(a=>a.x+a.halfWidth));
 const bottom=Math.min(...subjects.map(a=>a.z*up.z+a.groundY*up.y-.06));
 const top=Math.max(...subjects.map(a=>a.z*up.z+a.groundY*up.y+a.height));
 return Math.max(7.2,(right-left+.16)/(2*ratio*.91),(top-bottom+.16)/(2*.68));
}
export function assertTownLandmarkRoute(route){
 need(route?.stops?.length===4,'four original stops');
 for(const stop of route.stops){
  const c=stop.camera,o=c?.landmark;need(o?.profile==='vq03b-party-first-landmark'&&o.active===true&&o.approved===false,'native selection identity');
  need(typeof o.wasRetained==='boolean'&&typeof o.retained==='boolean'&&o.ratio===c.camera.ratio,'selection boolean and actual ratio');
  const a=o.candidates;need(Array.isArray(a)&&new Set(a.map(a=>a.id)).size===a.length,'unique candidates');
  need(a.every(a=>[a.x,a.z,a.halfWidth,a.height,a.groundY].every(Number.isFinite)&&a.height>0&&a.halfWidth>0),'finite actual mesh extents');
  const party=a.filter(a=>a.id!=='inn-sign');need(same(party.map(a=>a.id),expectedTownParty(stop.state)),'all story-active party candidates');
  const ph=half(party,o.ratio),lh=half(a,o.ratio),limit=o.wasRetained?1.6:1.5;
  need(Math.abs(ph-o.partyHalf)<1e-8&&Math.abs(lh-o.withLandmarkHalf)<1e-8&&o.limit===limit,'independent extent budgets');
  need(o.retained===(a.some(a=>a.id==='inn-sign')&&lh<=ph*limit),'optional landmark selection');
  need(same(c.rects.map(a=>a.id),a.filter(a=>a.id!=='inn-sign'||o.retained).map(a=>a.id)),'selected real mesh projection ownership');
 }
 const exit=route.stops[3],o=exit.camera.landmark,p=exit.camera.rects.find(a=>a.id==='p0');
 need(o.retained===false&&o.withLandmarkHalf>o.partyHalf*1.6,'distant exit landmark no longer forces zoom out');
 need(exit.camera.camera.half<=o.partyHalf*1.6&&p&&(p.bottom-p.top)*exit.renderer.height>=30,'native exit party remains readable');
 return true;
}
