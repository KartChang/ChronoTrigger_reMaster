import {fieldEnemyIfDeclared} from './field-enemy-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03b-declared-landmark-edits.json',import.meta.url),'utf8'));
/** Strict test-only B -> A source inverse, never a gameplay or native-report adapter. */
export function landmarkBaseline(name,source){
 source=fieldEnemyIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared landmark edit: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Landmark edit missing or duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const landmarkIfDeclared=(name,source)=>{source=fieldEnemyIfDeclared(name,source);return Object.hasOwn(spec.files,name)&&spec.files[name].some(e=>source.includes(e.after))?landmarkBaseline(name,source):source;};
