import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const trialUSpec=JSON.parse(readFileSync(new URL('../baselines/vq03u-declared-trial-edits.json',import.meta.url),'utf8'));
/** Exact source-only U -> T; never used on native reports/state/pixels. */
export function trialUBaseline(name,source,verifyBase=true){const edits=trialUSpec.files[name];if(!edits)throw Error('Undeclared U source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('U hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==trialUSpec.originalSha256[name])throw Error('U unrelated source drift: '+name);return source;}
export function trialUIfDeclared(name,source){return trialUSpec.files[name]?.some(e=>source.includes(e.after))?trialUBaseline(name,source,false):source;}
