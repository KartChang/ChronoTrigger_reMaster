import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
export const WEIGHTS={visual:25,battle:20,story:20,audio:10,controls:10,reliability:10,performance:5};
export const GATES=['browser','visual','hardware','content','rights'];
export async function runtimeDigest(root){
 const files=['index.html','package.json','package-lock.json'];
 async function visit(dir){for(const d of await readdir(resolve(root,dir),{withFileTypes:true})){const p=dir+'/'+d.name;if(d.isDirectory())await visit(p);else if(d.isFile())files.push(p);}}
 await visit('src');const hash=createHash('sha256');
 for(const p of files.sort()){hash.update(p+'\0');hash.update(await readFile(resolve(root,p)));hash.update('\0');}
 return hash.digest('hex');
}
export function evaluateQuality(review,assets,digest){
 if(review?.schemaVersion!==1||review.scope!=='whole-remake'||!/^([a-f0-9]{40})$/.test(review.reviewedSourceSha??'')||!/^([a-f0-9]{64})$/.test(review.runtimeDigest??''))throw new Error('Invalid or silently narrowed review scope/source');
 const entries=review.dimensions;
 if(!Array.isArray(entries)||entries.length!==Object.keys(WEIGHTS).length)throw new Error('All seven dimensions are mandatory');
 const seen=new Set();let score=0;const blockers=[];
 for(const d of entries){
  if(!(d.id in WEIGHTS)||seen.has(d.id)||d.weight!==WEIGHTS[d.id]||!Number.isFinite(d.score)||d.score<0||d.score>d.weight||typeof d.reason!=='string'||!d.reason.trim()||!Array.isArray(d.evidence))throw new Error('Invalid dimension, weight or evidence');
  seen.add(d.id);if(d.score>0&&d.evidence.length===0)throw new Error('Positive score without evidence');
  score+=d.score;if(d.score<d.weight*.8)blockers.push(`dimension:${d.id}:below-80-percent`);
 }
 if(!Array.isArray(review.blockers))throw new Error('Missing blocker ledger');
 for(const b of review.blockers){if(typeof b!=='string'||!b.trim())throw new Error('Invalid blocker');blockers.push(b);}
 for(const id of GATES){const g=review.gates?.[id];if(!g||!['pass','fail','unverified'].includes(g.status)||!Array.isArray(g.evidence))throw new Error('Missing gate');if(g.status!=='pass'||g.evidence.length===0)blockers.push(`gate:${id}`);}
 if(!assets||assets.schemaVersion!==1||!Array.isArray(assets.items)||assets.items.length===0)throw new Error('Missing asset register');
 const ids=new Set();
 for(const a of assets.items){if(!a.id||ids.has(a.id)||typeof a.required!=='boolean'||!['missing','prototype','review','approved'].includes(a.stage)||!Array.isArray(a.evidence))throw new Error('Invalid asset register');ids.add(a.id);if(a.required&&(a.stage!=='approved'||a.evidence.length===0))blockers.push(`asset:${a.id}`);}
 const stale=review.runtimeDigest!==digest;if(stale)blockers.push('review:runtime-changed');if(score<90)blockers.push('score:below-90');
 return {scope:review.scope,reviewedSourceSha:review.reviewedSourceSha,score,maximum:100,threshold:90,stale,releaseApproved:score>=90&&blockers.length===0,blockers,notice:'Developer evidence-based assessment, not a player rating. A passing CI does not approve art or the complete remake.'};
}
export async function runQuality(root=process.cwd()){
 const review=JSON.parse(await readFile(resolve(root,'quality/scorecard.json'),'utf8'));
 const assets=JSON.parse(await readFile(resolve(root,'assets/manifest.json'),'utf8'));
 const result=evaluateQuality(review,assets,await runtimeDigest(root));
 await mkdir(resolve(root,'test-results'),{recursive:true});await writeFile(resolve(root,'test-results/quality-report.json'),JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const r=await runQuality();console.log(`QUALITY ${r.score}/100; release ${r.releaseApproved?'APPROVED':'BLOCKED'}; ${r.stale?'review applies to an older runtime':'review matches runtime'}.`);
 if(process.argv.includes('--release')&&!r.releaseApproved){console.error(r.blockers.join('\n'));process.exitCode=1;}
}
