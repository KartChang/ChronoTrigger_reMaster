import {artAIfDeclared,artAFrozenBytes,artAIsNew} from './production-art-a-baseline.mjs';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const lifecycleZSpec=JSON.parse(readFileSync(new URL('../baselines/vq03z-declared-lifecycle-edits.json',import.meta.url),'utf8'));
/** Exact Z -> Y source inverse. Never pass native observations, state or pixels. */
export function lifecycleZBaseline(name,source,verifyBase=true){
 source=artAIfDeclared(name,source);
 const edits=lifecycleZSpec.files[name];if(!edits)throw Error('Undeclared Z source: '+name);
 for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('Z source hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==lifecycleZSpec.originalSha256[name])throw Error('Z unrelated source drift: '+name);return source;
}
export function lifecycleZIfDeclared(name,source){source=artAIfDeclared(name,source);return lifecycleZSpec.files[name]?.some(e=>source.includes(e.after))?lifecycleZBaseline(name,source,false):source;}

/** Canonical fingerprint of bounded, unchanged program inputs, including Pages. */
export function unchangedZEntries(pin){
 const paths=[...pin.rootFiles];
 const scan=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){if(e.name==='__pycache__'||e.name.endsWith('.pyc'))continue;const p=dir+'/'+e.name;if(e.isSymbolicLink())throw Error('Unpinned symbolic link: '+p);if(e.isDirectory())scan(p);else if(e.isFile())paths.push(p);}};
 for(const root of pin.roots)scan(root);
 return paths.sort().filter(p=>!pin.exclude.includes(p)&&!artAIsNew(p)).map(p=>[p,createHash('sha256').update(artAFrozenBytes(p,readFileSync(p))).digest('hex')]);
}
