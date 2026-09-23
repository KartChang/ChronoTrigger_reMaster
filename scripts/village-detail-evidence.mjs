import {readFileSync} from 'node:fs';
const e=JSON.parse(readFileSync(new URL('../tests/fixtures/village-detail-pixels-unit.json',import.meta.url),'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why)=>{if(!ok)throw Error('Town detail evidence: '+why);};
/** Added to the original three native Truce views, never a replacement for the
 * S/T/U gates, original captures, source identity or actual pixel receipts. */
export function assertTownDetails(v,renderSize){
 need(v?.profile===e.profile&&v.approved===false&&v.owner==='kingdom-truce','identity and owner');
 need(Array.isArray(v.windows)&&v.windows.length===2&&new Set(v.windows.map(w=>w.kind)).size===2,'two shared window textures');
 for(const w of v.windows){
  need(['frame','glass'].includes(w.kind),'kind');const size=w.kind==='frame'?64:32;
  need(w.name==='truce-detail-'+w.kind&&w.width===size&&w.height===size&&w.meshes===(w.kind==='frame'?16:8),'existing window use');
  need(w.sampling===1&&w.alpha===false&&same(w.samples,e.windows[w.kind]),'actual nearest opaque pixels');
 }
 const s=v.sign;
 need(s?.name==='inn-sign'&&s.texture==='truce-inn-sign'&&s.vertices===4&&s.indices===6&&same(s.scaling,[1.6,1.6,1]),'original plane and declared scale');
 need(Array.isArray(s.position)&&s.position.length===3&&s.position.every((n,i)=>Number.isFinite(n)&&Math.abs(n-[-4.7,2.4,-3.4][i])<1e-9),'original anchor');
 const p=s.projection,r=p?.rect,b=p?.viewport;
 need(p?.source==='scene-matrix-projection'&&p.inside===true&&b&&Number.isSafeInteger(b.width)&&Number.isSafeInteger(b.height)&&b.width>0&&b.height>0&&b.width*b.height<=307200,'real bounded projection');
 if(renderSize)need(same(b,{width:renderSize.width,height:renderSize.height}),'projection belongs to this canvas');
 need(r&&['x','y','width','height'].every(k=>Number.isFinite(r[k]))&&r.width>=40&&r.height>=20&&Math.abs(r.width-2*r.height)<.001,'readable sign rectangle');
 need(r.x>=0&&r.y>=0&&r.x+r.width<=b.width+.001&&r.y+r.height<=b.height+.001,'unclipped sign');
 return true;
}
