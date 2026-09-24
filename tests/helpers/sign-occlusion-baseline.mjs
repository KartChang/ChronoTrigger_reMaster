import {buildingIfDeclared} from './building-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02z-declared-sign-occlusion-edits.json',import.meta.url),'utf8'));
/** Source-only Z -> exact CI67 inverse. Never changes native reports or runtime. */
export function signOcclusionBaseline(name,source){
 source=buildingIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared sign occlusion source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Sign occlusion edit missing, duplicated or changed: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const signOcclusionIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)?signOcclusionBaseline(name,source):source;
