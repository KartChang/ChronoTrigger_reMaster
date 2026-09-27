import {lifecycleZIfDeclared} from './enemy-lifecycle-z-baseline.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const nativeBuildYSpec=JSON.parse(readFileSync(new URL('../baselines/vq03y-declared-field-build-edits.json',import.meta.url),'utf8'));
/** Y -> X exact declared source inverse only; never native report/state/pixels. */
export function nativeBuildYBaseline(name,source,verifyBase=true){source=lifecycleZIfDeclared(name,source);
 const edits=nativeBuildYSpec.files[name];if(!edits)throw Error('Undeclared Y source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('Y hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==nativeBuildYSpec.originalSha256[name])throw Error('Y unrelated source drift: '+name);return source;
}
export function nativeBuildYIfDeclared(name,source){source=lifecycleZIfDeclared(name,source);return nativeBuildYSpec.files[name]?.some(e=>source.includes(e.after))?nativeBuildYBaseline(name,source,false):source;}
