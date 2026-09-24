import {npcComfortIfDeclared} from './npc-comfort-baseline.mjs';
import {detailIfDeclared} from './detail-baseline.mjs';
import {pauseBaseline} from './pause-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq02t-declared-readability-edits.json',import.meta.url),'utf8'));
/** Exact inverse for test comparisons only, never a runtime or evidence mutation. */
export function readabilityBaseline(name,source,includePause=true){
 source=npcComfortIfDeclared(name,source);
 if(includePause)source=['scripts/build.mjs','scripts/test.mjs'].includes(name)?pauseBaseline(name,source):detailIfDeclared(name,source);
 const edits=spec.files[name];if(!edits)throw Error('Undeclared readability source');
 for(const {before,after} of [...edits].reverse()){
  if(!after||source.split(after).length!==2)throw Error('Readability edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
