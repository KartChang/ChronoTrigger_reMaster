import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const trialBodyVSpec=JSON.parse(readFileSync(new URL('../baselines/vq03v-declared-trial-body-edits.json',import.meta.url),'utf8'));
/** Exact source-only V -> U; never applied to native reports, game state or pixels. */
export function trialBodyVBaseline(name,source,verifyBase=true){const edits=trialBodyVSpec.files[name];if(!edits)throw Error('Undeclared V source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('V hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==trialBodyVSpec.originalSha256[name])throw Error('V unrelated source drift: '+name);return source;}
export function trialBodyVIfDeclared(name,source){return trialBodyVSpec.files[name]?.some(e=>source.includes(e.after))?trialBodyVBaseline(name,source,false):source;}
