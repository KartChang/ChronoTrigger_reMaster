import {readFileSync} from 'node:fs';
const changes=JSON.parse(readFileSync(new URL('../fixtures/actor-render-integration.json',import.meta.url),'utf8')).replacements;
/** Undo only enumerated VQ02C presentation wiring before applying the original
 * CI44 source pins. This is a SOURCE comparison, not a browser result. */
export function actorBaseline(source){
 for(const [before,after] of [...changes].reverse()){
  if(!source.includes(after))throw Error('Declared actor wiring missing: '+after);
  source=source.split(after).join(before);
 }
 return source;
}
export function actorBaselineBytes(path,bytes){return path==='src/render.ts'?actorBaseline(bytes.toString('utf8')):bytes;}
