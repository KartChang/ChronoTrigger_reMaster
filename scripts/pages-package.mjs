/** Stage only a source-matched CI playable. Never execute files from its artifact. */
import {readFile,writeFile,mkdir,readdir,lstat,copyFile,rm} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export const PLAYABLE_FILES=['index.html','build-meta.json','QUALITY_STATUS.json','THIRD_PARTY_LICENSE.txt','THIRD_PARTY_NOTICES.md'];
export function checkRun(run,repositoryId) {
  if(run?.status!=='completed'||run.conclusion!=='success'||run.head_branch!=='main'||
     run.path!=='.github/workflows/ci.yml'||run.head_repository?.id!==repositoryId||
     !['push','workflow_dispatch'].includes(run.event)||!Number.isSafeInteger(run.id)||run.id<=0||
     !/^[a-f0-9]{40}$/.test(run.head_sha??''))throw new Error('Only a successful main CI from this repository can be showcased.');
  return run;
}
export async function stagePages({root=process.cwd(),artifactDir,run,repositoryId,artifactId,artifactDigest}) {
  checkRun(run,repositoryId);
  if(!Number.isSafeInteger(artifactId)||artifactId<=0||!/^sha256:[a-f0-9]{64}$/.test(artifactDigest??''))throw new Error('Missing artifact identity/digest');
  const source=resolve(artifactDir),out=resolve(root,'pages-site');
  if(source===out||source.startsWith(out+'/'))throw new Error('Artifact cannot be the output directory');
  const dir=await lstat(source);if(!dir.isDirectory()||dir.isSymbolicLink())throw new Error('Artifact must be an ordinary directory');
  const names=(await readdir(source)).sort();
  if(JSON.stringify(names)!==JSON.stringify([...PLAYABLE_FILES].sort()))throw new Error('Unexpected/missing artifact entries; only the five playable files may be published');
  let total=0;
  for(const name of names){const st=await lstat(join(source,name));if(!st.isFile()||st.isSymbolicLink()||st.nlink>1)throw new Error('Links and non-files are not publishable');total+=st.size;}
  if(total>30*1024*1024)throw new Error('Playable exceeds the current 30 MiB demo budget');
  const html=await readFile(join(source,'index.html')),meta=JSON.parse(await readFile(join(source,'build-meta.json'),'utf8'));
  const quality=JSON.parse(await readFile(join(source,'QUALITY_STATUS.json'),'utf8'));
  if(meta.sourceSha!==run.head_sha||meta.bytes!==html.length||meta.bundled!==true||meta.externalRequests!==0||!/^\d+\.\d+\.\d+$/.test(meta.version??''))throw new Error('Build metadata does not match the validated source');
  if(html.includes('/*__GAME__*/')||html.includes('/*__STYLES__*/')||!html.includes('<html'))throw new Error('Unbuilt HTML template');
  if(quality.scope!=='whole-remake'||typeof quality.releaseApproved!=='boolean')throw new Error('Missing whole-remake quality disclosure');
  const disclosure={schemaVersion:1,kind:'development-preview',version:meta.version,sourceSha:run.head_sha,
    ciRunId:run.id,ciRunNumber:run.run_number,ciConclusion:run.conclusion,artifactId,artifactDigest,
    htmlSha256:createHash('sha256').update(html).digest('hex'),htmlBytes:html.length,
    wholeGameAccepted:quality.releaseApproved===true&&!quality.stale,qualityAssessment:quality,
    notice:'本頁為開發試玩；CI 通過不代表完整重製或 90 分驗收。存檔保存在這個瀏覽器，舊檔請手動匯入。'};
  // A fixed staging directory only; never upload the repository root, ROM or references.
  const old=await lstat(out).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
  if(old?.isSymbolicLink())throw new Error('Refuse a symlink staging destination');
  await rm(out,{recursive:true,force:true});await mkdir(join(out,'play'),{recursive:true});
  for(const name of PLAYABLE_FILES)await copyFile(join(source,name),join(out,'play',name));
  for(const name of ['index.html','preview.js','preview.css'])await copyFile(join(root,'site',name),join(out,name));
  await writeFile(join(out,'.nojekyll'),'');
  await writeFile(join(out,'deployment.json'),JSON.stringify(disclosure,null,2));
  return disclosure;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [artifactDir,record]=process.argv.slice(2);if(!artifactDir||!record)throw new Error('Usage: node scripts/pages-package.mjs ARTIFACT_DIR APPROVAL_JSON');
  const approval=JSON.parse(await readFile(record,'utf8'));
  console.log(JSON.stringify(await stagePages({artifactDir,...approval}),null,2));
}
