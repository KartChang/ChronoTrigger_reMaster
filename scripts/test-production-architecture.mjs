import {sightJEntryPlugin} from '../tests/helpers/sightline-j-baseline.mjs';
import {build} from 'esbuild';import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {artHIfDeclared} from '../tests/helpers/architecture-h-baseline.mjs';
export async function buildArchitectureTests(){
 for(const n of ['production-architecture-art','production-architecture-finish','art-directed-world'])await build({entryPoints:['src/'+n+'.ts'],bundle:true,outfile:'.test/'+n+'.mjs',format:'esm',platform:'node',packages:'external',plugins:[sightJEntryPlugin]});
 await build({entryPoints:['tests/cpu-entry.ts'],bundle:true,outfile:'.test/cpu-entry.mjs',format:'esm',platform:'node',packages:'external'});
 await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/art-directed-world-g.mjs',format:'esm',platform:'node',packages:'external',plugins:[{name:'H-to-G-source-only-component',setup(b){b.onLoad({filter:/[\\/]src[\\/]art-directed-world\.ts$/},a=>({contents:artHIfDeclared('src/art-directed-world.ts',readFileSync(a.path,'utf8')),loader:'ts'}));}}]});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildArchitectureTests();const r=spawnSync(process.execPath,['--test','tests/production-architecture-art.test.mjs','tests/production-architecture-integration.test.mjs','tests/production-architecture-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
