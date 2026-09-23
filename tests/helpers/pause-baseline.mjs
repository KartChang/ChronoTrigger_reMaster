import {detailBaseline} from './detail-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02u-declared-pause-edit.json',import.meta.url),'utf8'));
/** Test-only exact inverse; does not touch runtime evidence or original hash baselines. */
export function pauseBaseline(name,source){
 if(['scripts/build.mjs','scripts/test.mjs'].includes(name))source=detailBaseline(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared pause correction');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Pause correction missing/duplicated/changed');
  source=source.replace(after,before);
 }
 return source;
}
