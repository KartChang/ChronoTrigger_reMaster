import {sceneryHIfDeclared} from './scenery-h-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03g-declared-audio-edits.json',import.meta.url),'utf8'));
/** Test-only inverse of explicit G build/test registration. No runtime/report writes. */
export function audioGBaseline(name,source){
 source=sceneryHIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared G source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('G hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function audioGIfDeclared(name,source){
 source=sceneryHIfDeclared(name,source);
 const edits=spec.files[name];return edits?.some(e=>source.includes(e.after))?audioGBaseline(name,source):source;
}
