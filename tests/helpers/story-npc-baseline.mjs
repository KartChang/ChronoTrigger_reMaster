import {readFileSync} from 'node:fs';
import {woodlandBaseline} from './woodland-baseline.mjs';
const declared=JSON.parse(readFileSync(new URL('../baselines/vq02q-declared-scene-edits.json',import.meta.url),'utf8')).files;
/** SOURCE-only inversion, never an altered runtime or evidence snapshot. */
export function storyNpcBaseline(name,source,includeWoodland=true){
 if(includeWoodland&&name==='src/kingdom-render.ts')source=woodlandBaseline(name,source);
 const edits=declared[name];if(!edits)throw Error('Undeclared story source');
 for(const {before,after} of [...edits].reverse()){
  if(source.split(after).length!==2)throw Error('Story edit missing, duplicated or changed');
  source=source.replace(after,before);
 }
 return source;
}
