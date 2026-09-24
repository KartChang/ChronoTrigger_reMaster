import {expectedTownParty} from './town-party-evidence.mjs';
const houseIds=['truce-house:-7,4','truce-house:7,4','truce-house:-6.5,-1.5','truce-house:6.5,-0.6'];
const partCounts={'truce-chimney':1,'truce-crossbeam':1,'truce-door':1,'truce-glass':2,'truce-lintel':1,'truce-mullion':2,'truce-pitched-roof':2,'truce-plaster':1,'truce-ridge':1,'truce-roof-course':8,'truce-stone-plinth':1,'truce-timber':3,'truce-window':2};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why,o)=>{if(!ok){const e=Error('Town building visibility: '+why);e.observation=structuredClone(o??null);throw e;}};
export function assertTownBuildingRoute(r){
 need(r?.stops?.length===4,'all original stops retained',r);
 for(const s of r.stops){const o=s.buildingOcclusion;
  need(o?.profile==='vq03a-town-building-visibility'&&o.active===true&&o.approved===false,'actual observer identity',o);
  need(o.tick===s.state.ticks&&o.method==='parallel-orthographic-triangle-rays'&&same(o.subjects,expectedTownParty(s.state)),'same frozen tick and story actors',o);
  need(o.fadeTicks===9&&o.holdTicks===12&&Number.isSafeInteger(o.meshRayTests)&&o.meshRayTests>=0&&o.meshRayTests<=2808,'fixed tick and bounded ray contract',o);
  need(o.groups?.length===4&&new Set(o.groups.map(g=>g.id)).size===4&&o.groups.every(g=>houseIds.includes(g.id)),'four original houses',o);
  for(const g of o.groups){
   need(g.owner==='kingdom-truce'&&Number.isFinite(g.visibility)&&g.visibility>=.16&&g.visibility<=1,'owner and opacity',g);
   need(Array.isArray(g.blockedBy)&&new Set(g.blockedBy).size===g.blockedBy.length&&g.blockedBy.every(id=>o.subjects.includes(id)),'no ghost or duplicate actor',g);
   need(g.members?.length===26,'all original building parts',g);
   need(g.members.every(m=>Object.hasOwn(partCounts,m.name))&&Object.entries(partCounts).every(([name,n])=>g.members.filter(m=>m.name===name).length===n),'exact authored part names and counts',g);
   const anchor=g.members.find(m=>m.name==='truce-plaster');need(anchor?.position?.[1]===1.5&&g.id===`truce-house:${anchor.position[0]},${anchor.position[2]}`,'actual house anchor identity',g);
   for(const m of g.members)need(m.originalVisibility===1&&m.visibility===g.visibility&&m.blend===(g.visibility<1)&&m.position?.length===3&&m.position.every(Number.isFinite),'actual per-mesh blending and authored visibility',m);
  }
 }
 const resident=r.stops.find(s=>s.name==='resident');need(resident?.buildingOcclusion.groups.some(g=>g.blockedBy.includes('p0')&&g.visibility<1),'resident player actually revealed',resident?.buildingOcclusion);
 const entry=r.stops.find(s=>s.name==='entry');need(entry?.buildingOcclusion.groups.every(g=>g.blockedBy.length===0&&g.visibility===1),'clear entry unchanged',entry?.buildingOcclusion);
 return true;
}
