import {readFileSync} from 'node:fs';
import {assertPlanters,assertPauseAccess} from './pause-access-evidence.mjs';
const expected=JSON.parse(readFileSync(new URL('../tests/fixtures/village-pixels-unit.json',import.meta.url),'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const need=(ok,why)=>{if(!ok)throw Error('Village evidence: '+why);};
const counts={stone:8,plaster:4,timber:24,slate:30,clay:10,door:4};
export function assertVillage(v,chapter){
 if(chapter!=='truce'){need(v===null,'off-map visibility');return true;}
 need(v?.profile===expected.profile&&v.approved===false&&v.chapter==='truce','identity');
 need(Array.isArray(v.surfaces)&&v.surfaces.length===6,'all six existing surface groups');
 need(new Set(v.surfaces.map(s=>s.kind)).size===6,'duplicate surface');
 for(const s of v.surfaces){
  need(Object.hasOwn(counts,s.kind)&&s.name==='truce-craft-'+s.kind&&s.width===64&&s.height===64,'surface resource');
  need(s.sampling===1&&s.alpha===false&&s.meshes===counts[s.kind],'surface use');
  need(same(s.samples,expected.surfaces[s.kind]),'actual surface pixels');
 }
 const sign=v.sign;need(sign?.kind==='sign'&&sign.name==='truce-inn-sign'&&sign.width===80&&sign.height===40&&sign.sampling===1&&sign.alpha===true,'existing inn sign');
 need(same(sign.samples,expected.sign),'actual sign pixels');assertPlanters(v.planters);return true;
}
/** Extra evidence gate; the original eight chapter views and all old gates stay required. */
export function assertVillageLayouts(r,observation,receipt){
 need(r?.schema==='chrono-village-layouts-v1'&&r.status==='passed'&&r.physicalDevice===false&&r.artApproved===false,'layout identity');
 need(r.before?.chapter==='truce'&&r.before.mode==='explore'&&r.fullStateEqual===true&&same(r.before,r.after),'full paused state');
 const sizes=[[960,640],[390,844],[844,390]];
 need(r.views?.length===3,'layout coverage');
 r.views.forEach((v,i)=>{
  observation(v,true);assertVillage(v.village,'truce');
  assertPauseAccess(v.pauseAccess,r.before,v.viewport,i,observation,receipt);
  need(v.paused===true&&same(v.state,r.before)&&same(v.viewport,{width:sizes[i][0],height:sizes[i][1]}),'actual viewport and pause');
  need(v.image.path===`village-layout-${i}.png`,'DOM screenshot owner');
  need(receipt(v.canvasImage)&&v.canvasImage.path===`village-canvas-${i}.png`&&v.canvasImage.source==='actual-cpu-canvas','actual canvas export');
 });
 need(same(r.restoredViewport,{width:960,height:640}),'viewport restored');return true;
}
