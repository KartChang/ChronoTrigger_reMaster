import {fairTrialIfDeclared} from './fair-trial-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03e-declared-npc-comfort-edits.json',import.meta.url),'utf8'));
/** Strict offline E -> D source inverse only. Never touches reports or game state. */
export function npcComfortBaseline(name,source){
 source=fairTrialIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared NPC comfort source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('NPC comfort edit changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const npcComfortIfDeclared=(name,source)=>{source=fairTrialIfDeclared(name,source);return Object.hasOwn(spec.files,name)&&spec.files[name].some(e=>source.includes(e.after))?npcComfortBaseline(name,source):source;};
