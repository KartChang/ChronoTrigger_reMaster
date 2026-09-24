import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03d-declared-visibility-edits.json',import.meta.url),'utf8'));
/** Strict D -> C offline source inverse. Never changes native reports or state. */
export function visibilityBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared visibility edit: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Visibility edit missing or duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const visibilityIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)&&spec.files[name].some(e=>source.includes(e.after))?visibilityBaseline(name,source):source;
