import {createHash} from 'node:crypto';
import {decodeCanvasPng} from './field-enemy-evidence.mjs';
import {expectedTownParty} from './town-party-evidence.mjs';
const need=(ok,why)=>{if(!ok)throw Error('VQ03D visibility evidence: '+why);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
const anchors=[[-10,2.4125,-7],[10,2.4125,8],[-10,2.4125,9],[9,2.4125,-8]];
/** Mandatory addition to the original four-stop, seven-ledger native route gates.
 * Pixel probes are independently read from retained PNG bytes, not flags or a unit image.
 * This is technical evidence, never proof of original-speed comfort or final art quality. */
export function assertVisibilityStop(v,bytes){
 const s=v?.state,o=v?.visibility,w=o?.woodland,expected=expectedTownParty(s);
 need(o?.profile==='vq03d-native-visibility'&&o.physicalDevice===false&&o.artApproved===false,'native observer scope');
 need(s?.chapter==='truce'&&s.mode==='explore'&&integer(s.ticks,0,Number.MAX_SAFE_INTEGER),'original stopped state');
 need(w?.profile==='vq03d-woodland-actor-visibility'&&w.active===true&&w.chapter===s.chapter&&w.tick===s.ticks&&w.approved===false,'same rendered tick and woodland owner');
 need(w.method==='parallel-rays-nearest-authored-alpha'&&w.samplesPerActor===12&&w.fadeTicks===9&&w.holdTicks===12,'fixed sampling/fade contract');
 need(same(w.subjects,expected)&&integer(w.cachedTrees,4,16)&&w.alphaMaskBytes===w.cachedTrees*64*80,'party and bounded alpha masks');
 need(integer(w.meshRayTests,4*expected.length,4*expected.length*12)&&integer(w.alphaTests,0,w.meshRayTests),'bounded actual ray/alpha tests');
 need(w.groups?.length===4&&same(w.groups.map(g=>g.position),anchors),'unchanged four tree anchors');
 for(const g of w.groups){
  need(g.name==='oak'&&g.owner==='kingdom-truce'&&same(g.scale,[1,1,1])&&same(g.cell,{width:64,height:80})&&g.sampling===1&&g.alpha===true,'original geometry and nearest-alpha texture');
  need(Number.isFinite(g.visibility)&&g.visibility>=.3&&g.visibility<=1&&g.originalVisibility===1&&g.meshVisibility===g.visibility,'actual bounded mesh visibility');
  need(g.originalMaterialMode===1&&g.materialMode===(g.visibility<1?2:1),'private alpha blend and restore');
  need(Array.isArray(g.hits)&&g.hits.length<=expected.length&&same(g.blockedBy,g.hits.map(h=>h.id))&&new Set(g.blockedBy).size===g.blockedBy.length,'one hit per actor');
  for(const h of g.hits){need(expected.includes(h.id)&&integer(h.sample,0,11)&&h.alpha===255&&Number.isFinite(h.distance)&&h.distance>0&&h.distance<63.98,'actual opaque foreground hit');need(h.uv?.length===2&&h.uv.every(u=>Number.isFinite(u)&&u>=0&&u<=1)&&same(h.pixel,[Math.min(63,Math.floor(h.uv[0]*64)),Math.min(79,Math.floor((1-h.uv[1])*80))]),'nearest original texture coordinate');}
 }
 if(v.name==='entry')need(w.groups.every(g=>g.visibility===1&&!g.hits.length),'clear entry stays unchanged');
 if(v.name==='exit')need(w.groups[3].visibility<1&&w.groups[3].hits.some(h=>h.id==='p0'&&h.sample%4<=1),'original exit lower leg actually revealed');
 const b=o.blend;need(b?.profile==='vq03d-material-blend-face-culling'&&b.opaqueUnchanged===true&&b.doubleSidedUnchanged===true&&integer(b.faceCulled,0,7*v.renderer.cpu.work.submittedTriangles),'CPU material-facing policy');
 if(v.name==='resident')need(b.faceCulled>0,'real faded buildings exercised culling');
 const receipt=v.canvasImage;need(receipt?.path===`town-route-${v.name}-canvas.png`&&receipt.bytes===bytes.length&&receipt.sha256===createHash('sha256').update(bytes).digest('hex'),'unchanged source-bound original PNG receipt');
 const png=decodeCanvasPng(bytes),p=o.lowerBody;
 need(p?.source==='actual-cpu-canvas'&&p.width===png.width&&p.height===png.height&&png.width===v.renderer.width&&png.height===v.renderer.height,'same original CPU buffer');
 need(Array.isArray(p.samples)&&same(p.samples.map(a=>a.id),expected),'all actual story actors sampled');
 for(const a of p.samples){const r=v.camera.rects.find(r=>r.id===a.id);need(r&&[r.left,r.right,r.top,r.bottom].every(Number.isFinite),'projected actor rectangle');const points=[];for(const dy of [.82,.9,.96])for(const dx of [.3,.5,.7]){const x=Math.max(0,Math.min(png.width-1,Math.floor((r.left+(r.right-r.left)*dx)*png.width))),y=Math.max(0,Math.min(png.height-1,Math.floor((r.top+(r.bottom-r.top)*dy)*png.height))),at=(y*png.width+x)*4;points.push({x,y,rgba:Array.from(png.rgba.subarray(at,at+4))});}need(same(a.points,points),'independent PNG lower-body pixels');}
 return true;
}
