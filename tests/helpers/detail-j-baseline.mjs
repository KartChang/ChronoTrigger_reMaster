import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03j-declared-detail-edits.json',import.meta.url),'utf8'));
/** Test-only exact source inverse. Never transforms native state, images or reports. */
export function detailJBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared J source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('J hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function detailJIfDeclared(name,source){const edits=spec.files[name];return edits?.some(e=>source.includes(e.after))?detailJBaseline(name,source):source;}
