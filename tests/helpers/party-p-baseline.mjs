import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const partyPSpec=JSON.parse(readFileSync(new URL('../baselines/vq03p-declared-party-edits.json',import.meta.url),'utf8'));
/** Exact source-only P -> O. Never receives native game state, images or reports. */
export function partyPBaseline(name,source,verifyBase=true){const edits=partyPSpec.files[name];if(!edits)throw Error('Undeclared P source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('P hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==partyPSpec.originalSha256[name])throw Error('P unrelated source drift: '+name);return source;}
export function partyPIfDeclared(name,source){return partyPSpec.files[name]?.some(e=>source.includes(e.after))?partyPBaseline(name,source,false):source;}

// Composed historical inverses preserve unrelated bytes for their own full-file hash checks.
// The direct P acceptance inverse still verifies the entire exact O file by default.
