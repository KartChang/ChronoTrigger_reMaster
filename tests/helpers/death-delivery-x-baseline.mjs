import {nativeBuildYIfDeclared} from './native-build-y-baseline.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const deathDeliveryXSpec=JSON.parse(readFileSync(new URL('../baselines/vq03x-declared-death-delivery-edits.json',import.meta.url),'utf8'));
/** Exact declared X -> W source inverse only. Never native data, ticks, routes or pixels. */
export function deathDeliveryXBaseline(name,source,verifyBase=true){source=nativeBuildYIfDeclared(name,source);
 const edits=deathDeliveryXSpec.files[name];if(!edits)throw Error('Undeclared X source: '+name);
 for(const {before,after} of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('X hunk changed/missing/duplicated: '+name);source=source.replace(after,before);}
 if(verifyBase&&createHash('sha256').update(source).digest('hex')!==deathDeliveryXSpec.originalSha256[name])throw Error('X unrelated source drift: '+name);return source;
}
export function deathDeliveryXIfDeclared(name,source){source=nativeBuildYIfDeclared(name,source);return deathDeliveryXSpec.files[name]?.some(e=>source.includes(e.after))?deathDeliveryXBaseline(name,source,false):source;}
