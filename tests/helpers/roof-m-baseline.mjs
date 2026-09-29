/** M -> L SOURCE-only preservation. Never accepts native reports, pixels or State. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const roofMSpec=JSON.parse(readFileSync(new URL('../baselines/vq04m-declared-art-edits.json',import.meta.url),'utf8'));
if(roofMSpec.schema!=='chrono-vq04m-source-only-v1')throw Error('Invalid M source declaration');
export function roofMBaseline(name,source,verify=true){
 const e=Object.hasOwn(roofMSpec.files,name)?roofMSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared M source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('M missing/duplicate source: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('M unrelated source drift: '+name);return source;
}
export function roofMIfDeclared(name,source){const e=Object.hasOwn(roofMSpec.files,name)?roofMSpec.files[name]:null;return e&&typeof source==='string'&&e.hunks.some(h=>source.includes(h.after))?roofMBaseline(name,source,false):source;}
export function roofMFrozenBytes(name,data){return Object.hasOwn(roofMSpec.files,name)?Buffer.from(roofMBaseline(name,data.toString('utf8'))):data;}
export const roofMEntryPlugin={name:'M-to-L-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/]art-directed-world\.ts$/},a=>({contents:roofMIfDeclared('src/art-directed-world.ts',readFileSync(a.path,'utf8')),loader:'ts'}));}};
