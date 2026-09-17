import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
await build({entryPoints:['src/core.ts'],bundle:true,outfile:'.test/core.mjs',format:'esm',platform:'node'});
const r=spawnSync(process.execPath,['--test','tests/core.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);
