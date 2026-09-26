import {partyPIfDeclared} from './party-p-baseline.mjs';
import {readFileSync} from 'node:fs';
export const bodyOSpec=JSON.parse(readFileSync(new URL('../baselines/vq03o-declared-body-edits.json',import.meta.url),'utf8'));
/** Test-only exact O -> N source inverse. Never transforms native state, reports or pixels. */
export function bodyOBaseline(name,source){source=partyPIfDeclared(name,source);const edits=bodyOSpec.files[name];if(!edits)throw Error('Undeclared O source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('O hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}return source;}
export function bodyOIfDeclared(name,source){source=partyPIfDeclared(name,source);return bodyOSpec.files[name]?.some(e=>source.includes(e.after))?bodyOBaseline(name,source):source;}
