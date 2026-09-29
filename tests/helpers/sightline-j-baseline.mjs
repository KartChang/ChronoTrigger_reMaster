/** J -> I SOURCE-only inverse. No native, pixel, State or golden input is accepted. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const sightJSpec=JSON.parse(readFileSync(new URL('../baselines/vq04j-declared-art-edits.json',import.meta.url),'utf8'));
if(sightJSpec.schema!=='chrono-vq04j-source-only-v1')throw Error('Invalid J source declaration');
export function sightJBaseline(name,source,verify=true){
 const e=Object.hasOwn(sightJSpec.files,name)?sightJSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared J source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('J source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('J unrelated source drift: '+name);return source;
}
export function sightJIfDeclared(name,source){const e=Object.hasOwn(sightJSpec.files,name)?sightJSpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?sightJBaseline(name,source,false):source;}
export function sightJFrozenBytes(name,data){return Object.hasOwn(sightJSpec.files,name)?Buffer.from(sightJBaseline(name,data.toString('utf8'))):data;}
export function sightJIsNew(name){return sightJSpec.newPaths.includes(name);}
/** Used exclusively by predecessor source component builds, never the real game build. */
export const sightJEntryPlugin={name:'J-to-I-source-only-predecessor',setup(b){b.onLoad({filter:/[\\/]src[\\/]art-directed-world\.ts$/},a=>({contents:sightJIfDeclared('src/art-directed-world.ts',readFileSync(a.path,'utf8')),loader:'ts'}));}};
