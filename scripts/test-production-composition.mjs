import {rowOEntryPlugin} from '../tests/helpers/row-o-baseline.mjs';
import {build} from 'esbuild';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {compositionNEntryPlugin} from '../tests/helpers/composition-n-baseline.mjs';
export async function buildCompositionTests(){
 await build({stdin:{contents:"export * from './src/production-composition-art';export * from './src/production-art';export * from './src/production-architecture-art';export * from './src/production-roof-art';export * from './src/architecture-source-layout';export * from './src/trial-scenery-art';export * from './src/material-runtime';export * from './src/production-environment';",resolveDir:process.cwd(),loader:'ts'},bundle:true,outfile:'.test/composition-n-art.mjs',format:'esm',platform:'node',packages:'external'});
 for(const prior of [false,true])await build({entryPoints:['src/art-directed-world.ts'],bundle:true,outfile:'.test/composition-'+(prior?'m':'n')+'-world.mjs',format:'esm',platform:'node',packages:'external',plugins:prior?[compositionNEntryPlugin]:[rowOEntryPlugin]});
 await build({entryPoints:['tests/cpu-entry.ts'],bundle:true,outfile:'.test/cpu-entry.mjs',format:'esm',platform:'node',packages:'external'});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){await buildCompositionTests();const r=spawnSync(process.execPath,['--test','tests/production-composition.test.mjs','tests/production-composition-source.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);}
