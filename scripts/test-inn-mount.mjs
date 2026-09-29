import {groveLEntryPlugin} from '../tests/helpers/grove-l-baseline.mjs';
import {build} from 'esbuild';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import {innKEntryPlugin} from '../tests/helpers/inn-mount-k-baseline.mjs';
export async function buildInnMountTests(){
 for(const [entry,name]of [['src/production-sightline-art.ts','inn-k-art'],['src/production-sightline-finish.ts','inn-k-finish'],['tests/cpu-entry.ts','cpu-entry']])await build({entryPoints:[entry],bundle:true,outfile:'.test/'+name+'.mjs',format:'esm',platform:'node',packages:'external'});
 for(const prior of [false,true])await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/inn-'+(prior?'j':'k')+'-world.mjs',format:'esm',platform:'node',packages:'external',plugins:prior?[innKEntryPlugin,groveLEntryPlugin]:[groveLEntryPlugin]});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildInnMountTests();const r=spawnSync(process.execPath,['--test','tests/inn-mount-k.test.mjs','tests/inn-mount-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
