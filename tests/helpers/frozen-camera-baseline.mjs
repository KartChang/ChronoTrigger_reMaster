import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const spec=JSON.parse(readFileSync(new URL('../baselines/ci77-camera-restoration-edits.json',import.meta.url)));
/** Exact declared camera-repair inverse, for source-preservation tests only. */
export function frozenCameraBaseline(source){
 for(const {before,after} of [...spec.edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Camera repair hunk missing/duplicated');
  source=source.replace(after,before);
 }
 if(createHash('sha256').update(source).digest('hex')!==spec.originalSha256)throw Error('Unrelated camera source change');
 return source;
}
