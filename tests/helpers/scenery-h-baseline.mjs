import {stagingIIfDeclared} from './staging-i-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03h-declared-scenery-edits.json',import.meta.url),'utf8'));
/** Exact-fragment test-only H inverse; callers enforce retained full-file SHA256. Never touches native state, pixels, reports or runtime files. */
export function sceneryHBaseline(name,source){
 source=stagingIIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared H source: '+name);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('H hunk changed/missing/duplicated: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export function sceneryHIfDeclared(name,source){
 source=stagingIIfDeclared(name,source);
 const edits=spec.files[name];return edits?.some(e=>source.includes(e.after))?sceneryHBaseline(name,source):source;
}
