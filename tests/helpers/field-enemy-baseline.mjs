import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03c-declared-enemy-palette-edits.json',import.meta.url),'utf8'));
/** Exact C -> B test-only source inverse. Never changes gameplay or native reports. */
export function fieldEnemyBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared field enemy edit: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Field enemy edit missing or duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const fieldEnemyIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)&&spec.files[name].some(e=>source.includes(e.after))?fieldEnemyBaseline(name,source):source;
