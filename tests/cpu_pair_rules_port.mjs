// Unit-only synchronous IPC against the CURRENT game core, not a browser hook.
import {build} from 'esbuild';
import {createInterface} from 'node:readline';
const output=await build({entryPoints:['src/core.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {step,IDLE,interactKingdom}=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].contents).toString('base64'));
let state;
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 try{
  const r=JSON.parse(line);
  if(r.op==='init')state=structuredClone(r.state); // Explicit constructed regression state, never exported.
  else if(r.op==='step'){
   const input=structuredClone(IDLE);
   for(const key of r.keys){const found={a:[0,'x',-1],d:[0,'x',1],w:[0,'z',1],s:[0,'z',-1],ArrowLeft:[1,'x',-1],ArrowRight:[1,'x',1],ArrowUp:[1,'z',1],ArrowDown:[1,'z',-1]}[key];if(!found)throw Error('Unexpected unit key');input[found[0]][found[1]]=found[2];}
   for(let i=0;i<r.ticks;i++)step(state,input,1/60);
  }else if(r.op==='talk'){process.stdout.write(JSON.stringify({dialog:interactKingdom(state,0),state})+'\n');continue;}
  else throw Error('unknown unit command');
  process.stdout.write(JSON.stringify({state})+'\n');
 }catch(e){process.stdout.write(JSON.stringify({error:String(e)})+'\n');}
}
