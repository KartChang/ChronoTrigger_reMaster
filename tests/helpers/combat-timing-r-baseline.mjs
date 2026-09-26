import {rescueSIfDeclared} from './rescue-s-baseline.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const combatTimingRSpec=JSON.parse(readFileSync(new URL('../baselines/vq03r-declared-timing-edits.json',import.meta.url),'utf8'));
/** Exact source-only R -> Q. Never accepts native game state, reports or pixels. */
export function combatTimingRBaseline(name,source,verifyBase=true){source=rescueSIfDeclared(name,source);const edits=combatTimingRSpec.files[name];if(!edits)throw Error('Undeclared R source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('R hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==combatTimingRSpec.originalSha256[name])throw Error('R unrelated source drift: '+name);return source;}
export function combatTimingRIfDeclared(name,source){source=rescueSIfDeclared(name,source);return combatTimingRSpec.files[name]?.some(e=>source.includes(e.after))?combatTimingRBaseline(name,source,false):source;}
