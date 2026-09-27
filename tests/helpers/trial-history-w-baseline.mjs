import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const trialHistoryWSpec=JSON.parse(readFileSync(new URL('../baselines/vq03w-declared-history-edits.json',import.meta.url),'utf8'));
/** Exact W -> V source only. Native data, time, state and pixels never enter here. */
export function trialHistoryWBaseline(name,source,verifyBase=true){const edits=trialHistoryWSpec.files[name];if(!edits)throw Error('Undeclared W source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('W hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==trialHistoryWSpec.originalSha256[name])throw Error('W unrelated source drift: '+name);return source;}
export function trialHistoryWIfDeclared(name,source){return trialHistoryWSpec.files[name]?.some(e=>source.includes(e.after))?trialHistoryWBaseline(name,source,false):source;}
