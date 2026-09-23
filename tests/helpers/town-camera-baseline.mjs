import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02x-declared-town-camera-edits.json',import.meta.url),'utf8'));
/** Strict source-only X -> W inverse; never used by game or native report code. */
export function townCameraBaseline(name,source){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared town camera source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Town camera edit missing, duplicated or changed: '+name);
  source=source.replace(after,before);
 }
 return source;
}
export const townCameraIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)?townCameraBaseline(name,source):source;
