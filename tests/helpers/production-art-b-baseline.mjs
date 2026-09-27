import {artCIfDeclared,artCFrozenBytes,artCIsNew} from './early-scene-c-baseline.mjs';
/** B -> A exact SOURCE compatibility only. Native reports, pixels, fixtures,
 * gameplay and checks are never transformed. Current B tests use the real app. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const artBSpec=JSON.parse(readFileSync(new URL('../baselines/vq04b-declared-art-edits.json',import.meta.url),'utf8'));
export function artBBaseline(name,source,verify=true){
 source=artCIfDeclared(name,source);
 const e=artBSpec.files[name];if(!e)throw Error('Undeclared B source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('B source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('B unrelated source drift: '+name);return source;
}
export function artBIfDeclared(name,source){source=artCIfDeclared(name,source);return artBSpec.files[name]&&artBSpec.files[name].hunks.some(h=>source.includes(h.after))?artBBaseline(name,source,false):source;}
export function artBFrozenBytes(name,data){data=artCFrozenBytes(name,data);return artBSpec.files[name]?Buffer.from(artBBaseline(name,data.toString('utf8'))):data;}
export function artBIsNew(name){return artBSpec.newPaths.includes(name)||artCIsNew(name);}
