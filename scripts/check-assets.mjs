import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
const bad=[];const skip=new Set(['node_modules','.git','dist','.test','test-results']);
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(skip.has(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())await walk(p);else if(/\.(smc|sfc|rom|spc)$/i.test(p))bad.push(p);}}
await walk('.');if(bad.length){console.error('Original game binaries must stay outside the repository:',bad);process.exit(1);}console.log('Asset check passed: no ROM/SPC files in project source. This is not a copyright audit.');
