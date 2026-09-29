import {build} from 'esbuild';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {sightJEntryPlugin} from '../tests/helpers/sightline-j-baseline.mjs';
export async function buildSightlineTests(){
 for(const n of ['production-sightline-art','production-sightline-finish'])await build({entryPoints:['src/'+n+'.ts'],bundle:true,outfile:'.test/'+n+'.mjs',format:'esm',platform:'node',packages:'external'});
 for(const previous of [false,true])await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/sightline-'+(previous?'i':'j')+'-world.mjs',format:'esm',platform:'node',packages:'external',plugins:previous?[sightJEntryPlugin]:[]});
 await build({entryPoints:['tests/cpu-entry.ts'],bundle:true,outfile:'.test/cpu-entry.mjs',format:'esm',platform:'node',packages:'external'});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildSightlineTests();const r=spawnSync(process.execPath,['--test','tests/production-sightline.test.mjs','tests/sightline-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
