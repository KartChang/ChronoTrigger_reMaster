import {trialUIfDeclared} from './trial-u-baseline.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const rescueBodyTSpec=JSON.parse(readFileSync(new URL('../baselines/vq03t-declared-rescue-body-edits.json',import.meta.url),'utf8'));
/** Exact source-only T -> S. Never transforms native state, reports or pixels. */
export function rescueBodyTBaseline(name,source,verifyBase=true){source=trialUIfDeclared(name,source);const edits=rescueBodyTSpec.files[name];if(!edits)throw Error('Undeclared T source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('T hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==rescueBodyTSpec.originalSha256[name])throw Error('T unrelated source drift: '+name);return source;}
export function rescueBodyTIfDeclared(name,source){source=trialUIfDeclared(name,source);return rescueBodyTSpec.files[name]?.some(e=>source.includes(e.after))?rescueBodyTBaseline(name,source,false):source;}
