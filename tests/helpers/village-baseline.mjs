import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02s-declared-village-edits.json',import.meta.url),'utf8'));
/** Test-only exact inversion. No runtime, observed-state or native save changes. */
export function villageBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared village source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Village edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
