import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03f-declared-fair-trial-edits.json',import.meta.url),'utf8'));
/** Offline F -> exact E only. Never modifies gameplay, reports or native artifacts. */
export function fairTrialBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared fair/trial source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Fair/trial hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function fairTrialIfDeclared(name,source){const edits=spec.files[name];return edits?.some(e=>source.includes(e.after))?fairTrialBaseline(name,source):source;}
