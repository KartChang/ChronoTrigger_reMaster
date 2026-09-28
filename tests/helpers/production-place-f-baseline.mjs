import {artGSpec,artGIfDeclared,artGFrozenBytes,artGIsNew} from './npc-attention-g-baseline.mjs';
/** F -> E SOURCE-only inverse. Forbidden for images, runtime State and native reports. */
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
const envelope=JSON.parse(readFileSync(new URL('../baselines/vq04f-declared-art-edits.json',import.meta.url),'utf8'));
if(envelope.schema!=='chrono-vq04f-source-only-envelope-v1'||!Array.isArray(envelope.zlibBase64))throw Error('Invalid F source envelope');
const bytes=inflateSync(Buffer.from(envelope.zlibBase64.join(''),'base64'));
if(createHash('sha256').update(bytes).digest('hex')!==envelope.decodedSha256)throw Error('F source digest mismatch');
export const artFSpec=JSON.parse(bytes.toString('utf8'));
artFSpec.newPaths.push(...artGSpec.newPaths);
export function artFBaseline(name,source,verify=true){
 source=artGIfDeclared(name,source);
 const e=Object.hasOwn(artFSpec.files,name)?artFSpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared F source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('F source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('F unrelated source drift: '+name);return source;
}
export function artFIfDeclared(name,source){source=artGIfDeclared(name,source);const e=Object.hasOwn(artFSpec.files,name)?artFSpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?artFBaseline(name,source,false):source;}
export function artFFrozenBytes(name,data){data=artGFrozenBytes(name,data);return Object.hasOwn(artFSpec.files,name)?Buffer.from(artFBaseline(name,data.toString('utf8'))):data;}
export function artFIsNew(name){return artFSpec.newPaths.includes(name)||artGIsNew(name);}
