import {pauseBaseline} from './pause-baseline.mjs';
import {readFileSync} from 'node:fs';
const changes=JSON.parse(readFileSync(new URL('../fixtures/runtime-info-integration.json',import.meta.url),'utf8')).replacements;
/** Source-only reversal of six declared diagnostics/text wires. No runtime branch. */
export function runtimeBaseline(source){
 source=pauseBaseline('src/main.ts',source);
 for(const [before,after] of [...changes].reverse()){
  if(source.split(after).length!==2)throw Error('Runtime diagnostics wire missing/duplicated: '+after);
  source=source.replace(after,before);
 }
 return source;
}
export const runtimeBaselineBytes=(path,bytes)=>path==='src/main.ts'?runtimeBaseline(bytes.toString('utf8')):bytes;
