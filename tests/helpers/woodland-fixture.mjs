import {readFileSync} from 'node:fs';
const e=JSON.parse(readFileSync(new URL('../fixtures/woodland-pixels-unit.json',import.meta.url),'utf8'));
/** In-memory verifier schema fixture. Never exported as a save, image or native success. */
export function woodlandFixture(chapter){
 if(!['truce','forest'].includes(chapter))return null;
 return {profile:e.profile,approved:false,chapter,ground:{name:chapter+'-ground',width:384,height:352,samples:structuredClone(e.ground[chapter])},trees:Array.from({length:chapter==='truce'?4:12},()=>({name:'oak',position:[0,2,0],cell:{width:64,height:80},sampling:1,alpha:true,samples:structuredClone(e.tree)}))};
}
