import {build} from 'esbuild';import {mkdir,readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
/** Actual pure roof author output; no native image or model approval is implied. */
export async function exportProductionRoof(out='dist/art/production-vq04m'){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export * from './src/production-roof-art';export * from './src/production-architecture-art';export * from './src/architecture-source-layout';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'.test/roof-author-export.mjs'});
 const {ROOF_ART,dressProductionRoof,reshapeArchitecture,ARCHITECTURE_ART,ARCHITECTURE_SOURCE_LAYOUT}=await import(pathToFileURL(resolve('.test/roof-author-export.mjs')).href);
 const {VertexData}=await import('@babylonjs/core'),models=[];
 for(const [name,x,y,z,w,h,d,rz,material]of ARCHITECTURE_SOURCE_LAYOUT['kingdom-truce']){
  const box=VertexData.CreateBox({width:w,height:h,depth:d}),base=reshapeArchitecture(Array.from(box.positions),y,rz,ARCHITECTURE_ART.town.anchorY,ARCHITECTURE_ART.town.heightScale),shape=dressProductionRoof(name,base,Array.from(box.uvs));if(!shape)continue;
  const normals=[];VertexData.ComputeNormals(shape.positions,box.indices,normals);models.push({name,position:[x,y,z],rotation:[0,0,rz],material,positions:shape.positions,normals,uvs:shape.uvs,indices:Array.from(box.indices)});
 }
 const modelBytes=JSON.stringify({schema:'chrono-vq04m-roof-model-v1',nativeEvidence:false,models},null,2)+'\n';
 await writeFile(resolve(out,'roof-models.json'),modelBytes);
 const manifest={schema:'chrono-vq04m-roof-export-v1',profile:ROOF_ART,modelCount:models.length,newBitmapAssets:0,nativeEvidence:false,approved:false,romExtracted:false,sourceSha256:createHash('sha256').update(await readFile('src/production-roof-art.ts')).digest('hex'),modelSha256:createHash('sha256').update(modelBytes).digest('hex')};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionRoof(process.argv[2]),null,2));
