import {artFIfDeclared,artFFrozenBytes,artFIsNew,artFSpec} from './production-place-f-baseline.mjs';
/** E -> D SOURCE-only inverse. Never use on game state, images or native reports. */
import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';import {createHash} from 'node:crypto';
// Lossless whole-spec compression, matching D's source-only storage model.
const encoded=JSON.parse(readFileSync(new URL('../baselines/vq04e-declared-art-edits.json',import.meta.url),'utf8'));
if(encoded.schema!=='chrono-vq04e-source-only-envelope-v1'||!Array.isArray(encoded.zlibBase64))throw Error('Invalid E source envelope');
const decoded=inflateSync(Buffer.from(encoded.zlibBase64.join(''),'base64'));
if(createHash('sha256').update(decoded).digest('hex')!==encoded.decodedSha256)throw Error('E source envelope digest mismatch');
export const artESpec=JSON.parse(decoded.toString('utf8'));
artESpec.newPaths.push(...artFSpec.newPaths);
export function artEBaseline(name,source,verify=true){
 source=artFIfDeclared(name,source);
 const e=Object.hasOwn(artESpec.files,name)?artESpec.files[name]:null;if(!e||typeof source!=='string')throw Error('Undeclared E source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('E source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('E unrelated source drift: '+name);return source;
}
export function artEIfDeclared(name,source){source=artFIfDeclared(name,source);const e=Object.hasOwn(artESpec.files,name)?artESpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?artEBaseline(name,source,false):source;}
export function artEFrozenBytes(name,data){data=artFFrozenBytes(name,data);return Object.hasOwn(artESpec.files,name)?Buffer.from(artEBaseline(name,data.toString('utf8'))):data;}
export function artEIsNew(name){return artESpec.newPaths.includes(name)||artFIsNew(name);}
