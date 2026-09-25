import {readFileSync} from 'node:fs';
export const impMSpec=JSON.parse(readFileSync(new URL('../baselines/vq03m-declared-imp-edits.json',import.meta.url),'utf8'));
export function impMBaseline(name,source){const edits=impMSpec.files[name];if(!edits)throw Error('Undeclared M source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('M hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}return source;}
export function impMIfDeclared(name,source){const edits=impMSpec.files[name];return edits?.some(e=>source.includes(e.after))?impMBaseline(name,source):source;}
