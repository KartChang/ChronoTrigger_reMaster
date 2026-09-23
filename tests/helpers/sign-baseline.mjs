import {readFileSync} from 'node:fs';
import {townCameraIfDeclared} from './town-camera-baseline.mjs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02w-declared-sign-edits.json',import.meta.url),'utf8'));
/** Strict test-only W -> exact V inverse. Never mutates observations or game state. */
export function signBaseline(name,source,includeTown=true){
 const edits=spec.files[name];if(!edits)throw Error('Undeclared sign source');
 if(includeTown)source=townCameraIfDeclared(name,source);
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Sign edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
export const signIfDeclared=(name,source)=>Object.hasOwn(spec.files,name)?signBaseline(name,source):townCameraIfDeclared(name,source);
