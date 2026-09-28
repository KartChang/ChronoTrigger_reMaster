import {artHSpec,artHIfDeclared,artHFrozenBytes,artHIsNew} from './architecture-h-baseline.mjs';
/** G -> F SOURCE-only inverse. Forbidden for images, runtime State and native reports. */
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
const envelope=JSON.parse(readFileSync(new URL('../baselines/vq04g-declared-art-edits.json',import.meta.url),'utf8'));
if(envelope.schema!=='chrono-vq04g-source-only-envelope-v1'||!Array.isArray(envelope.zlibBase64))throw Error('Invalid G source envelope');
const bytes=inflateSync(Buffer.from(envelope.zlibBase64.join(''),'base64'));
if(createHash('sha256').update(bytes).digest('hex')!==envelope.decodedSha256)throw Error('G source digest mismatch');
export const artGSpec=JSON.parse(bytes.toString('utf8'));
artGSpec.newPaths.push(...artHSpec.newPaths);
export function artGBaseline(name,source,verify=true){
 source=artHIfDeclared(name,source);
 const e=Object.hasOwn(artGSpec.files,name)?artGSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared G source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('G source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('G unrelated source drift: '+name);return source;
}
export function artGIfDeclared(name,source){source=artHIfDeclared(name,source);const e=Object.hasOwn(artGSpec.files,name)?artGSpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?artGBaseline(name,source,false):source;}
export function artGFrozenBytes(name,data){data=artHFrozenBytes(name,data);return Object.hasOwn(artGSpec.files,name)?Buffer.from(artGBaseline(name,data.toString('utf8'))):data;}
export function artGIsNew(name){return artGSpec.newPaths.includes(name)||artHIsNew(name);}
