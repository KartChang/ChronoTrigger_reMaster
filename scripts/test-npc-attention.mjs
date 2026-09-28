import {buildArchitectureTests} from './test-production-architecture.mjs';
import {build} from 'esbuild';import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
import {artGIfDeclared} from '../tests/helpers/npc-attention-g-baseline.mjs';
export async function buildNpcAttentionTests(){
 for(const n of ['production-npc-attention','production-story-npc-finish','production-story-npc-art','art-directed-world'])await build({entryPoints:['src/'+n+'.ts'],bundle:true,outfile:'.test/'+n+'.mjs',format:'esm',platform:'node',packages:'external'});
 await build({entryPoints:['tests/cpu-entry.ts'],bundle:true,outfile:'.test/cpu-entry.mjs',format:'esm',platform:'node',packages:'external'});
 await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/art-directed-world-f.mjs',format:'esm',platform:'node',packages:'external',plugins:[{name:'G-to-F-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/](art-directed-world|production-story-npc-finish)\.ts$/},a=>({contents:artGIfDeclared('src/'+a.path.split(/[\\/]/).at(-1),readFileSync(a.path,'utf8')),loader:'ts'}));}}]});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildNpcAttentionTests();await buildArchitectureTests();const r=spawnSync(process.execPath,['--test','tests/production-npc-attention.test.mjs','tests/production-npc-attention-integration.test.mjs','tests/npc-attention-source.test.mjs','tests/pages-select.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
