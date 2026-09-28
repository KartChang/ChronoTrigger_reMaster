import {artEIfDeclared,artEFrozenBytes,artEIsNew} from './production-character-e-baseline.mjs';
/** Declared D -> C SOURCE-only inverse. Not usable on pixels, native reports or state. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {inflateSync} from 'node:zlib';
const encoded=JSON.parse(readFileSync(new URL('../baselines/vq04d-declared-art-edits.json',import.meta.url),'utf8'));
export const artDSpec=JSON.parse(inflateSync(Buffer.from(encoded.zlibBase64,'base64')).toString('utf8'));
export function artDBaseline(name,source,verify=true){
 source=artEIfDeclared(name,source);
 const e=artDSpec.files[name];if(!e)throw Error('Undeclared D source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('D source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('D unrelated source drift: '+name);return source;
}
export function artDIfDeclared(name,source){source=artEIfDeclared(name,source);return artDSpec.files[name]&&artDSpec.files[name].hunks.some(h=>source.includes(h.after))?artDBaseline(name,source,false):source;}
export function artDFrozenBytes(name,data){data=artEFrozenBytes(name,data);return artDSpec.files[name]?Buffer.from(artDBaseline(name,data.toString('utf8'))):data;}
export function artDIsNew(name){return artDSpec.newPaths.includes(name)||artEIsNew(name);}
