import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const rescueSSpec=JSON.parse(readFileSync(new URL('../baselines/vq03s-declared-rescue-edits.json',import.meta.url),'utf8'));
/** Exact source-only S -> R. Never pass native state, images or reports. */
export function rescueSBaseline(name,source,verifyBase=true){const edits=rescueSSpec.files[name];if(!edits)throw Error('Undeclared S source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('S hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==rescueSSpec.originalSha256[name])throw Error('S unrelated source drift: '+name);return source;}
export function rescueSIfDeclared(name,source){return rescueSSpec.files[name]?.some(e=>source.includes(e.after))?rescueSBaseline(name,source,false):source;}
