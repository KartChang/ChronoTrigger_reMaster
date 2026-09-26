import {combatTimingRIfDeclared} from './combat-timing-r-baseline.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const reactionQSpec=JSON.parse(readFileSync(new URL('../baselines/vq03q-declared-reaction-edits.json',import.meta.url),'utf8'));
/** Exact source-only Q -> P. No native state, report or pixel input is accepted here. */
export function reactionQBaseline(name,source,verifyBase=true){source=combatTimingRIfDeclared(name,source);const edits=reactionQSpec.files[name];if(!edits)throw Error('Undeclared Q source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('Q hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==reactionQSpec.originalSha256[name])throw Error('Q unrelated source drift: '+name);return source;}
export function reactionQIfDeclared(name,source){source=combatTimingRIfDeclared(name,source);return reactionQSpec.files[name]?.some(e=>source.includes(e.after))?reactionQBaseline(name,source,false):source;}
