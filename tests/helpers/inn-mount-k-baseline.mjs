/** K -> J SOURCE-only inverse. Never transforms native data, pixels or game State. */
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
export const innKSpec=JSON.parse(readFileSync(new URL('../baselines/vq04k-declared-art-edits.json',import.meta.url),'utf8'));
if(innKSpec.schema!=='chrono-vq04k-source-only-v1')throw Error('Invalid K source declaration');
export function innKBaseline(name,source,verify=true){
 const e=Object.hasOwn(innKSpec.files,name)?innKSpec.files[name]:null;
 if(!e||typeof source!=='string')throw Error('Undeclared K source: '+name);
 for(const h of [...e.hunks].reverse()){
  if(!h.after||source.split(h.after).length!==2)throw Error('K missing/duplicate source: '+name);
  source=source.replace(h.after,()=>h.before);
 }
 if(verify&&createHash('sha256').update(source).digest('hex')!==e.sha256)throw Error('K unrelated source drift: '+name);
 return source;
}
export function innKIfDeclared(name,source){const e=Object.hasOwn(innKSpec.files,name)?innKSpec.files[name]:null;return e&&e.hunks.some(h=>source.includes(h.after))?innKBaseline(name,source,false):source;}
export function innKFrozenBytes(name,data){return Object.hasOwn(innKSpec.files,name)?Buffer.from(innKBaseline(name,data.toString('utf8'))):data;}
export function innKIsNew(name){return innKSpec.newPaths.includes(name);}
/** Frozen component builds only; the actual K app and production build never use this plugin. */
export const innKEntryPlugin={name:'K-to-J-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/]production-sightline-art\.ts$/},a=>({contents:innKIfDeclared('src/production-sightline-art.ts',readFileSync(a.path,'utf8')),loader:'ts'}));}};
