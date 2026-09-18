import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
await build({entryPoints:['src/core.ts'],bundle:true,outfile:'.test/core.mjs',format:'esm',platform:'node'});
await build({entryPoints:['src/input-boundary.ts'],bundle:true,outfile:'.test/input-boundary.mjs',format:'esm',platform:'node'});
await build({entryPoints:['src/pixel-art.ts'],bundle:true,outfile:'.test/pixel-art.mjs',format:'esm',platform:'node'});
for(const name of ['hero-art','pose-player','world-art','navigation','rescue-data','rescue-art','prologue-data','prologue-art','trial-data','trial-art','trial-rules','art-profile','material-art'])await build({entryPoints:[`src/${name}.ts`],bundle:true,outfile:`.test/${name}.mjs`,format:'esm',platform:'node'});
const r=spawnSync(process.execPath,['--test','tests/core.test.mjs','tests/fair.test.mjs','tests/opening.test.mjs','tests/kingdom.test.mjs','tests/input-boundary.test.mjs','tests/quality.test.mjs','tests/asset-export.test.mjs','tests/targeting.test.mjs','tests/reference-art.test.mjs','tests/navigation.test.mjs','tests/pages-package.test.mjs','tests/rescue.test.mjs','tests/rescue-art.test.mjs','tests/prologue.test.mjs','tests/trial.test.mjs','tests/trial-route.test.mjs','tests/trial-art.test.mjs','tests/art-profile.test.mjs'],{stdio:'inherit'});process.exit(r.status??1);
