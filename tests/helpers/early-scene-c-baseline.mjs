/** C -> B declared SOURCE-only inverse for frozen B/A components.
 * Cannot consume gameplay, native reports, pixels, routes or golden cells. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const artCSpec=JSON.parse(readFileSync(new URL('../baselines/vq04c-declared-art-edits.json',import.meta.url),'utf8'));
export function artCBaseline(name,source,verify=true){
 const e=artCSpec.files[name];if(!e)throw Error('Undeclared C source: '+name);
 for(const h of [...e.hunks].reverse()){if(!h.after||source.split(h.after).length!==2)throw Error('C source missing/duplicate/drift: '+name);source=source.replace(h.after,()=>h.before);}
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('C unrelated source drift: '+name);return source;
}
export function artCIfDeclared(name,source){return artCSpec.files[name]&&artCSpec.files[name].hunks.some(h=>source.includes(h.after))?artCBaseline(name,source,false):source;}
export function artCFrozenBytes(name,data){return artCSpec.files[name]?Buffer.from(artCBaseline(name,data.toString('utf8'))):data;}
export function artCIsNew(name){return artCSpec.newPaths.includes(name);}
