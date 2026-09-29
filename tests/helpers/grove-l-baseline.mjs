import {roofMSpec,roofMIfDeclared,roofMFrozenBytes} from './roof-m-baseline.mjs';
/** L -> K SOURCE-only inverse. Never changes native images, reports, State or routes. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const groveLSpec=JSON.parse(readFileSync(new URL('../baselines/vq04l-declared-art-edits.json',import.meta.url),'utf8'));
if(groveLSpec.schema!=='chrono-vq04l-source-only-v1')throw Error('Invalid L source declaration');
groveLSpec.newPaths.push(...roofMSpec.newPaths);
export function groveLBaseline(name,source,verify=true){
 source=roofMIfDeclared(name,source);
 const e=Object.hasOwn(groveLSpec.files,name)?groveLSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared L source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('L missing/duplicate source: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('L unrelated source drift: '+name);return source;
}
export function groveLIfDeclared(name,source){source=roofMIfDeclared(name,source);const e=Object.hasOwn(groveLSpec.files,name)?groveLSpec.files[name]:null;return e&&typeof source==='string'&&e.hunks.some(h=>source.includes(h.after))?groveLBaseline(name,source,false):source;}
export function groveLFrozenBytes(name,data){data=roofMFrozenBytes(name,data);return Object.hasOwn(groveLSpec.files,name)?Buffer.from(groveLBaseline(name,data.toString('utf8'))):data;}
export function groveLIsNew(name){return groveLSpec.newPaths.includes(name);}
/** Explicit frozen K component only; the application build does not use this plugin. */
export const groveLEntryPlugin={name:'L-to-K-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/]art-directed-world\.ts$/},a=>({contents:groveLIfDeclared('src/art-directed-world.ts',readFileSync(a.path,'utf8')),loader:'ts'}));}};
