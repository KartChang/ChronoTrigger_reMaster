import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
await build({entryPoints:['src/core.ts'],bundle:true,outfile:'.test/core.mjs',format:'esm',platform:'node'});
await build({entryPoints:['src/input-boundary.ts'],bundle:true,outfile:'.test/input-boundary.mjs',format:'esm',platform:'node'});
await build({entryPoints:['src/pixel-art.ts'],bundle:true,outfile:'.test/pixel-art.mjs',format:'esm',platform:'node'});
const r=spawnSync(process.execPath,['--test','tests/core.test.mjs','tests/fair.test.mjs','tests/opening.test.mjs','tests/kingdom.test.mjs','tests/input-boundary.test.mjs','tests/quality.test.mjs','tests/asset-export.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);
