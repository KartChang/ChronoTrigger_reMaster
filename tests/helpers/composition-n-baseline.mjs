/** N -> M SOURCE-only inverse. Never used by production or native capture. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const compositionNSpec=JSON.parse(readFileSync(new URL('../baselines/vq04n-declared-art-edits.json',import.meta.url),'utf8'));
if(compositionNSpec.schema!=='chrono-vq04n-source-only-v1')throw Error('Invalid N source declaration');
export function compositionNBaseline(name,source,verify=true){
 const e=Object.hasOwn(compositionNSpec.files,name)?compositionNSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared N source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('N missing/duplicate source: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('N unrelated source drift: '+name);return source;
}
export function compositionNIfDeclared(name,source){const e=Object.hasOwn(compositionNSpec.files,name)?compositionNSpec.files[name]:null;return e&&typeof source==='string'&&e.hunks.some(h=>source.includes(h.after))?compositionNBaseline(name,source,false):source;}
export function compositionNFrozenBytes(name,data){return Object.hasOwn(compositionNSpec.files,name)?Buffer.from(compositionNBaseline(name,data.toString('utf8'))):data;}
export function compositionNIsNew(name){return compositionNSpec.newPaths.includes(name);}
export const compositionNEntryPlugin={name:'N-to-M-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/](art-directed-world|production-environment|production-architecture-finish)\.ts$/},a=>({contents:compositionNIfDeclared('src/'+a.path.split(/[\\/]/).at(-1),readFileSync(a.path,'utf8')),loader:'ts'}));}};
