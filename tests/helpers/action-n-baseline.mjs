import {readFileSync} from 'node:fs';
import {bodyOIfDeclared} from './body-o-baseline.mjs';
export const actionNSpec=JSON.parse(readFileSync(new URL('../baselines/vq03n-declared-action-edits.json',import.meta.url),'utf8'));
/** Test-only exact declared N -> M inverse. Never transforms native evidence. */
export function actionNBaseline(name,source){source=bodyOIfDeclared(name,source);const edits=actionNSpec.files[name];if(!edits)throw Error('Undeclared N source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('N hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}return source;}
export function actionNIfDeclared(name,source){source=bodyOIfDeclared(name,source);return actionNSpec.files[name]?.some(e=>source.includes(e.after))?actionNBaseline(name,source):source;}
