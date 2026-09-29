import {compositionNEntryPlugin} from '../tests/helpers/composition-n-baseline.mjs';
import {build} from 'esbuild';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {roofMEntryPlugin} from '../tests/helpers/roof-m-baseline.mjs';
export async function buildRoofTests(){
 for(const [entry,name]of [['src/production-roof-art.ts','roof-m-art'],['src/production-architecture-finish.ts','roof-m-finish'],['tests/cpu-entry.ts','cpu-entry']])await build({entryPoints:[entry],bundle:true,outfile:'.test/'+name+'.mjs',format:'esm',platform:'node',packages:'external'});
 for(const prior of[false,true])await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/roof-'+(prior?'l':'m')+'-world.mjs',format:'esm',platform:'node',packages:'external',plugins:prior?[roofMEntryPlugin]:[compositionNEntryPlugin]});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildRoofTests();const r=spawnSync(process.execPath,['--test','tests/production-roof.test.mjs','tests/production-roof-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
