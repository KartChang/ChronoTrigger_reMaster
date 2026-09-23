import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02v-declared-town-detail-edits.json',import.meta.url),'utf8'));
/** Test-only, enumerated inverse to keep U/T/S/R comparisons on their exact
 * historical source. Never edits a native report, save, runtime state or hash. */
export function detailBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared town detail source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Town detail edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
export const detailIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)?detailBaseline(name,source):source;
