import {readFileSync} from 'node:fs';
export const canyonKSpec=JSON.parse(readFileSync(new URL('../baselines/vq03k-declared-script-edits.json',import.meta.url),'utf8'));
/** Exact script-only inverse for historic pins; no image, state or runtime transformation. */
export function canyonKBaseline(name,source){
 const edits=canyonKSpec.files[name];if(!edits)throw Error('Undeclared K script: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('K hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function canyonKIfDeclared(name,source){const edits=canyonKSpec.files[name];return edits?.some(e=>source.includes(e.after))?canyonKBaseline(name,source):source;}
