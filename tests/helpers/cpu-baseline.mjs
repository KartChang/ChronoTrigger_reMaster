import {storyNpcBaseline} from './story-npc-baseline.mjs';
import {readFileSync} from 'node:fs';
const changes=JSON.parse(readFileSync(new URL('../fixtures/cpu-render-integration.json',import.meta.url),'utf8')).replacements;
/** SOURCE-only normalization of the four explicit engine/presentation wires. */
export function cpuBaseline(source){
 source=storyNpcBaseline('src/render.ts',source);
 for(const [before,after] of [...changes].reverse()){
  if(source.split(after).length!==2)throw Error('CPU integration missing or duplicated: '+after);
  source=source.replace(after,before);
 }
 return source;
}
