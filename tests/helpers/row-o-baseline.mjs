/** O -> N SOURCE-only inverse. Not imported by application/native/image readers. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const rowOSpec=JSON.parse(readFileSync(new URL('../baselines/vq04o-declared-edits.json',import.meta.url),'utf8'));
if(rowOSpec.schema!=='chrono-vq04o-source-only-v1')throw Error('Invalid O source declaration');
export function rowOBaseline(name,source,verify=true){const e=Object.hasOwn(rowOSpec.files,name)?rowOSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared O source: '+name);for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('O missing/duplicate source: '+name);source=source.replace(h.after,()=>h.before);}if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('O unrelated source drift: '+name);return source;}
export function rowOIfDeclared(name,source){const e=Object.hasOwn(rowOSpec.files,name)?rowOSpec.files[name]:null;return e&&typeof source==='string'&&e.hunks.some(h=>source.includes(h.after))?rowOBaseline(name,source,false):source;}
export function rowOFrozenBytes(name,data){return Object.hasOwn(rowOSpec.files,name)?Buffer.from(rowOBaseline(name,data.toString('utf8'))):data;}
export const rowOEntryPlugin={name:'O-to-N-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/](art-directed-world|render-capability|production-grove-finish)\.ts$/},a=>({contents:rowOIfDeclared('src/'+a.path.split(/[\\/]/).at(-1),readFileSync(a.path,'utf8')),loader:'ts'}));}};
