import {sightJSpec,sightJIfDeclared,sightJFrozenBytes,sightJIsNew} from './sightline-j-baseline.mjs';
/** I -> H SOURCE-only inverse. Never accepts game State, images, native reports or goldens. */
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
const e=JSON.parse(readFileSync(new URL('../baselines/vq04i-declared-cpu-edits.json',import.meta.url),'utf8'));
if(e.schema!=='chrono-vq04i-source-only-envelope-v1'||!Array.isArray(e.zlibBase64))throw Error('Invalid I source envelope');
const bytes=inflateSync(Buffer.from(e.zlibBase64.join(''),'base64'));
if(createHash('sha256').update(bytes).digest('hex')!==e.decodedSha256)throw Error('I source digest mismatch');
export const cpuISpec=JSON.parse(bytes.toString('utf8'));
cpuISpec.newPaths.push(...sightJSpec.newPaths);
export function cpuIBaseline(name,source,verify=true){
 source=sightJIfDeclared(name,source);
 const e=Object.hasOwn(cpuISpec.files,name)?cpuISpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared I source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('I source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('I unrelated source drift: '+name);return source;
}
export function cpuIIfDeclared(name,source){source=sightJIfDeclared(name,source);const e=Object.hasOwn(cpuISpec.files,name)?cpuISpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?cpuIBaseline(name,source,false):source;}
export function cpuIFrozenBytes(name,data){data=sightJFrozenBytes(name,data);return Object.hasOwn(cpuISpec.files,name)?Buffer.from(cpuIBaseline(name,data.toString('utf8'))):data;}
export function cpuIIsNew(name){return cpuISpec.newPaths.includes(name)||sightJIsNew(name);}
