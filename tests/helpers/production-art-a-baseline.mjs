/** VQ04A source-only compatibility view for frozen component regression inputs.
 * The actual app and new integration tests always use ArtDirectedWorld.
 * No report, state, image, route or native assertion can enter this inverse.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const artASpec=JSON.parse(readFileSync(new URL('../baselines/vq04a-declared-art-edits.json',import.meta.url),'utf8'));
export function artABaseline(name,source,verifyBase=true){
 const edits=artASpec.files[name];if(!edits)throw Error('Undeclared art source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('Art source hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==artASpec.originalSha256[name])throw Error('Unrelated art source drift: '+name);return source;
}
export function artAIfDeclared(name,source){return artASpec.files[name]?.some(e=>source.includes(e.after))?artABaseline(name,source,false):source;}
export function artAFrozenBytes(name,bytes){return artASpec.files[name]?Buffer.from(artABaseline(name,bytes.toString('utf8'))):bytes;}
export function artAIsNew(name){return artASpec.newPaths.includes(name);}
