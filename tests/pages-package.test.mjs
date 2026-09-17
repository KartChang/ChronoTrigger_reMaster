import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkRun,stagePages,PLAYABLE_FILES} from '../scripts/pages-package.mjs';
const run=()=>({id:123,run_number:10,status:'completed',conclusion:'success',event:'push',head_branch:'main',path:'.github/workflows/ci.yml',head_repository:{id:42},head_sha:'a'.repeat(40)});
async function fixture(fn){const root=await mkdtemp(join(tmpdir(),'chrono-pages-'));try{
 const artifactDir=join(root,'in');await mkdir(artifactDir);await mkdir(join(root,'site'));
 const html='<!doctype html><html lang="zh-Hant"><p>開發試作</p></html>';
 for(const file of PLAYABLE_FILES)await writeFile(join(artifactDir,file),file==='index.html'?html:file==='build-meta.json'?JSON.stringify({sourceSha:'a'.repeat(40),bytes:Buffer.byteLength(html),bundled:true,externalRequests:0,version:'0.5.0'}):file==='QUALITY_STATUS.json'?JSON.stringify({scope:'whole-remake',releaseApproved:false,stale:true,score:30}):'license notice');
 for(const file of ['index.html','preview.js','preview.css'])await writeFile(join(root,'site',file),'fixture');
 const opts={root,artifactDir,run:run(),repositoryId:42,artifactId:456,artifactDigest:'sha256:'+'b'.repeat(64)};
 await fn(opts);
 }finally{await rm(root,{recursive:true,force:true});}}

test('accepts only a successful same-repository main CI',()=>assert.equal(checkRun(run(),42).id,123));
for(const [name,patch] of [['failed',{conclusion:'failure'}],['running',{status:'in_progress'}],['PR',{event:'pull_request'}],['other branch',{head_branch:'feature'}],['wrong workflow',{path:'.github/workflows/other.yml'}],['fork',{head_repository:{id:13}}],['invalid sha',{head_sha:'main'}]]){
 test(`rejects ${name} as deploy authority`,()=>assert.throws(()=>checkRun({...run(),...patch},42)));
}
test('staging preserves CI game bytes and exposes honest status',()=>fixture(async o=>{
 const d=await stagePages(o);assert.equal(d.sourceSha,o.run.head_sha);assert.equal(d.wholeGameAccepted,false);
 assert.deepEqual(await readFile(join(o.root,'pages-site/play/index.html')),await readFile(join(o.artifactDir,'index.html')));
 assert.deepEqual((await readdir(join(o.root,'pages-site/play'))).sort(),[...PLAYABLE_FILES].sort());
 assert.equal(JSON.parse(await readFile(join(o.root,'pages-site/deployment.json'),'utf8')).kind,'development-preview');
}));
test('extra artifact files including ROM are refused, not copied',()=>fixture(async o=>{
 await writeFile(join(o.artifactDir,'unexpected.smc'),'test fixture not ROM');await assert.rejects(stagePages(o),/Unexpected/);
}));
test('wrong source metadata is rejected',()=>fixture(async o=>{
 const p=join(o.artifactDir,'build-meta.json'),m=JSON.parse(await readFile(p));m.sourceSha='c'.repeat(40);await writeFile(p,JSON.stringify(m));await assert.rejects(stagePages(o),/metadata/);
}));
test('changed HTML byte count is rejected',()=>fixture(async o=>{
 await writeFile(join(o.artifactDir,'index.html'),'<html>changed</html>');await assert.rejects(stagePages(o),/metadata/);
}));
test('symlink artifact entry is rejected',()=>fixture(async o=>{
 const path=join(o.artifactDir,'THIRD_PARTY_LICENSE.txt');await rm(path);await symlink(join(o.root,'site/index.html'),path);await assert.rejects(stagePages(o),/Links/);
}));
test('old staging contents are removed without publishing stale files',()=>fixture(async o=>{
 await mkdir(join(o.root,'pages-site'));await writeFile(join(o.root,'pages-site','old.json'),'stale');await stagePages(o);assert.equal((await readdir(join(o.root,'pages-site'))).includes('old.json'),false);
}));
test('output symlink is rejected before recursive removal',()=>fixture(async o=>{
 await symlink(join(o.root,'site'),join(o.root,'pages-site'));await assert.rejects(stagePages(o),/symlink/);assert.equal(await readFile(join(o.root,'site/index.html'),'utf8'),'fixture');
}));
test('unverified artifact digest is rejected',()=>fixture(async o=>{await assert.rejects(stagePages({...o,artifactDigest:null}),/identity/);}));
test('launcher keeps all local references project-path relative',async()=>{
 const html=await readFile(new URL('../site/index.html',import.meta.url),'utf8');
 for(const [,link] of html.matchAll(/(?:href|src)="([^"]+)"/g))assert.ok(link.startsWith('./'),link);
 assert.ok(html.includes('非官方'));assert.ok(html.includes('90 分'));assert.ok(html.includes('匯入'));
});
