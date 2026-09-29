import {build} from 'esbuild';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {groveLEntryPlugin} from '../tests/helpers/grove-l-baseline.mjs';
export async function buildGroveTests(){
 for(const [entry,name]of [['src/production-grove-art.ts','grove-l-art'],['src/production-grove-finish.ts','grove-l-finish'],['tests/cpu-entry.ts','cpu-entry']])await build({entryPoints:[entry],bundle:true,outfile:'.test/'+name+'.mjs',format:'esm',platform:'node',packages:'external'});
 for(const prior of[false,true])await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/grove-'+(prior?'k':'l')+'-world.mjs',format:'esm',platform:'node',packages:'external',plugins:prior?[groveLEntryPlugin]:[]});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildGroveTests();const r=spawnSync(process.execPath,['--test','tests/production-grove.test.mjs','tests/production-grove-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
