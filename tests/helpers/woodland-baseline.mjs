import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02r-declared-woodland-edits.json',import.meta.url),'utf8'));
/** Test-only inversion of enumerated R edits; never alters the browser or an observed state. */
export function woodlandBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared woodland source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Woodland edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
