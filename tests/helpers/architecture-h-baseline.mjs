/** H -> G SOURCE-only inverse. Forbidden for images, runtime State and native reports. */
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
const envelope=JSON.parse(readFileSync(new URL('../baselines/vq04h-declared-art-edits.json',import.meta.url),'utf8'));
if(envelope.schema!=='chrono-vq04h-source-only-envelope-v1'||!Array.isArray(envelope.zlibBase64))throw Error('Invalid H source envelope');
const bytes=inflateSync(Buffer.from(envelope.zlibBase64.join(''),'base64'));
if(createHash('sha256').update(bytes).digest('hex')!==envelope.decodedSha256)throw Error('H source digest mismatch');
export const artHSpec=JSON.parse(bytes.toString('utf8'));
export function artHBaseline(name,source,verify=true){
 const e=Object.hasOwn(artHSpec.files,name)?artHSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared H source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('H source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('H unrelated source drift: '+name);return source;
}
export function artHIfDeclared(name,source){const e=Object.hasOwn(artHSpec.files,name)?artHSpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?artHBaseline(name,source,false):source;}
export function artHFrozenBytes(name,data){return Object.hasOwn(artHSpec.files,name)?Buffer.from(artHBaseline(name,data.toString('utf8'))):data;}
export function artHIsNew(name){return artHSpec.newPaths.includes(name);}
