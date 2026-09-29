import {build} from 'esbuild';import {mkdir,writeFile,readFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {png} from './asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Final author arrays and actual atlas; offline model export, never native evidence. */
export async function exportProductionComposition(out='dist/art/production-vq04n'){
 await mkdir(out,{recursive:true});await mkdir('.test',{recursive:true});
 await build({stdin:{contents:"export * from './src/production-composition-art';export * from './src/production-art';export * from './src/production-architecture-art';export * from './src/production-roof-art';export * from './src/architecture-source-layout';export * from './src/trial-scenery-art';export * from './src/material-runtime';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.test/composition-n-export.mjs'});
 const a=await import(pathToFileURL(resolve('.test/composition-n-export.mjs')).href),{VertexData}=await import('@babylonjs/core'),models=[];
 for(const [name,x,y,z,w,h,d,rz]of a.ARCHITECTURE_SOURCE_LAYOUT['kingdom-truce']){
  const b=VertexData.CreateBox({width:w,height:h,depth:d}),hPositions=a.reshapeArchitecture(Array.from(b.positions),y,rz,a.ARCHITECTURE_ART.town.anchorY,a.ARCHITECTURE_ART.town.heightScale),m=a.dressProductionRoof(name,hPositions,Array.from(b.uvs)),p=a.reshapeProductionRoof(name,m?.positions??hPositions,y,rz);if(!p)continue;
  const normals=[];VertexData.ComputeNormals(p,b.indices,normals);models.push({name,position:[x,y,z],rotation:[0,0,rz],positions:p,normals,uvs:m?.uvs??Array.from(b.uvs),indices:Array.from(b.indices)});
 }
 for(const f of a.courtFixtureDetails()){
  const b=VertexData.CreateBox({width:f.w,height:f.h,depth:f.d,faceUV:a.boxTextureUV(f.w,f.h,f.d)}),name='courtroom-'+f.name,p=a.reshapeCourtFascia(name,Array.from(b.positions),[f.x,f.y,f.z],[0,0,0]);if(!p)continue;
  const normals=[];VertexData.ComputeNormals(p,b.indices,normals);models.push({name,position:[f.x,f.y,f.z],rotation:[0,0,0],positions:p,normals,uvs:Array.from(b.uvs),indices:Array.from(b.indices)});
 }
 const pixels=a.paintCompositionSurface('canopy-atlas',a.paintProductionSurface('canopy-atlas')),bytes=png({...pixels,rgba:Buffer.from(pixels.rgba)}),model=JSON.stringify({schema:'chrono-vq04n-composition-model-v1',nativeEvidence:false,models},null,2)+'\n';
 await writeFile(resolve(out,'composition-models.json'),model);await writeFile(resolve(out,'canopy-atlas.png'),bytes);
 const manifest={schema:'chrono-vq04n-composition-export-v1',profile:a.COMPOSITION_ART,modelCount:models.length,canopyVariants:4,sourceSha256:sha(await readFile('src/production-composition-art.ts')),modelSha256:sha(model),canopyRgbaSha256:sha(Buffer.from(pixels.rgba)),canopyPngSha256:sha(bytes),nativeEvidence:false,approved:false,romExtracted:false};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionComposition(process.argv[2]),null,2));
