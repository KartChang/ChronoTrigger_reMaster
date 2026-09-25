import {impMIfDeclared} from './imp-m-baseline.mjs';
import {readFileSync} from 'node:fs';
export const canyonLSpec=JSON.parse(readFileSync(new URL('../baselines/vq03l-declared-relief-edits.json',import.meta.url),'utf8'));
/** Restore only declared source hunks for historic comparisons, never native evidence. */
export function canyonLBaseline(name,source){
 source=impMIfDeclared(name,source);
 const edits=canyonLSpec.files[name];if(!edits)throw Error('Undeclared L source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('L hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function canyonLIfDeclared(name,source){source=impMIfDeclared(name,source);const edits=canyonLSpec.files[name];return edits?.some(e=>source.includes(e.after))?canyonLBaseline(name,source):source;}
