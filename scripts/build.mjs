import {exportAssets} from './asset-export.mjs';
import {runQuality} from './quality.mjs';
import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const out=await build({entryPoints:['src/main.ts'],bundle:true,write:false,format:'iife',platform:'browser',target:['es2022'],minify:true,legalComments:'inline',metafile:true});
let template=await readFile('index.html','utf8');
const css=(await readFile('src/style.css','utf8'))+'\n'+(await readFile('src/adventure.css','utf8'))+'\n'+(await readFile('src/inventory.css','utf8'))+'\n'+(await readFile('src/hud-notice.css','utf8'));
const js=out.outputFiles[0].text.replaceAll('</script','<\\/script');
// A replacement callback preserves literal $&, $$ and related sequences in bundled engine code.
template=template.replace('/*__STYLES__*/',()=>css).replace('/*__GAME__*/',()=>js);
if(template.includes('/*__GAME__*/')||template.includes('/*__STYLES__*/'))throw new Error('Unresolved HTML build marker.');
if(template.slice(template.indexOf('<script>')+8,template.lastIndexOf('</script>'))!==js)throw new Error('Bundled script changed during HTML insertion.');
await mkdir('dist',{recursive:true});
await writeFile('dist/THIRD_PARTY_LICENSE.txt',await readFile('node_modules/@babylonjs/core/license.md'));
await writeFile('dist/THIRD_PARTY_NOTICES.md',await readFile('docs/THIRD_PARTY.md'));
await writeFile('dist/index.html',template);
await writeFile('dist/build-meta.json',JSON.stringify({version:'0.9.13',sourceSha:process.env.GITHUB_SHA??null,bundled:true,externalRequests:0,bytes:Buffer.byteLength(template)},null,2));
console.log(`Built self-contained dist/index.html (${(Buffer.byteLength(template)/1024/1024).toFixed(2)} MiB). No CDN, server or ROM required to play.`);

await exportAssets();
const quality=await runQuality();
await writeFile('dist/QUALITY_STATUS.json',JSON.stringify(quality,null,2));
