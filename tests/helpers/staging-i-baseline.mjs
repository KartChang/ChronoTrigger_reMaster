import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03i-declared-staging-edits.json',import.meta.url),'utf8'));
/** Test-only inverse of exact I hunks. Full-file historical pins remain enforced by callers. */
export function stagingIBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared I source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('I hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function stagingIIfDeclared(name,source){
 const edits=spec.files[name];return edits?.some(e=>source.includes(e.after))?stagingIBaseline(name,source):source;
}
