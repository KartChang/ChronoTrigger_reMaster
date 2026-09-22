/** Additional source-bound observations, not a replacement for the original CPU gates. */
const profile='vq02q-story-npc-cloth-and-silhouette';
const pairs=a=>a.map(x=>`${x.name}:${x.kind}`).sort();
export function expectedStoryNpcs(s){
 const k=[],r=[];
 if(s.chapter==='truce')k.push('townsperson:resident','innkeeper:innkeeper');
 if(s.chapter==='castle')k.push('king:king','guard:guard');
 if(s.chapter==='cathedral'&&s.rescue?.stage==='entered'&&s.mode==='explore')r.push(...Array(3).fill('disguised-nun:nun'));
 if(s.chapter==='sanctum'){
  if(!s.rescue?.yakraWon&&s.mode==='explore')r.push('false-chancellor:chancellor');
  if(s.mode!=='battle')r.push('queen-leene:queen');
  if(s.rescue?.chancellorFreed&&s.mode==='explore')r.push('true-chancellor:chancellor');
 }
 return {kingdom:k.sort(),rescue:r.sort()};
}
export function assertStoryNpcs(o){
 const need=(ok,why)=>{if(!ok)throw Error('Story NPC evidence: '+why);};
 const expected=expectedStoryNpcs(o.state);
 for(const owner of ['kingdom','rescue']){
  const v=o.storyNpcs?.[owner];need(v?.profile===profile&&v.approved===false&&Array.isArray(v.actors),'profile '+owner);
  need(JSON.stringify(pairs(v.actors))===JSON.stringify(expected[owner]),'visibility/role '+owner);
  for(const a of v.actors){need(Number.isInteger(a.frame)&&a.frame>=0&&a.frame<4,'frame');need(Number.isSafeInteger(a.uploads)&&a.uploads>=0,'uploads');need(a.cell?.width===48&&a.cell?.height===64,'actual cell');}
 }
 return true;
}
