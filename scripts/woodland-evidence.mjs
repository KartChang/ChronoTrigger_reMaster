import {readFileSync} from 'node:fs';
const expected=JSON.parse(readFileSync(new URL('../tests/fixtures/woodland-pixels-unit.json',import.meta.url),'utf8'));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/** Extra check on actual same-run texture samples; original CPU/pixels/routes remain mandatory. */
export function assertWoodland(value,chapter){
 const need=(ok,why)=>{if(!ok)throw Error('Woodland evidence: '+why);};
 if(chapter!=='truce'&&chapter!=='forest'){need(value===null,'off-map visibility');return true;}
 need(value?.profile===expected.profile&&value.approved===false&&value.chapter===chapter,'identity');
 const g=value.ground;need(g?.name===chapter+'-ground'&&g.width===384&&g.height===352,'actual ground');
 need(same(g.samples,expected.ground[chapter]),'actual ground pixels');
 need(Array.isArray(value.trees)&&value.trees.length===(chapter==='truce'?4:12),'active tree count');
 for(const tree of value.trees){
  need(tree.name==='oak'&&tree.cell?.width===64&&tree.cell?.height===80&&tree.sampling===1&&tree.alpha===true,'actual tree resource');
  need(Array.isArray(tree.position)&&tree.position.length===3&&tree.position.every(Number.isFinite),'tree anchor');
  need(same(tree.samples,expected.tree),'actual tree pixels/contact');
 }
 return true;
}
