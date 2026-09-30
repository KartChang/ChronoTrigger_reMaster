import {build} from 'esbuild';import {mkdir,mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {VertexData} from '@babylonjs/core';
export async function exportProductionTreeRows(out){
 const root=await mkdtemp(resolve('.','row-o-export-'));
 try{await build({entryPoints:['src/production-tree-row-art.ts'],bundle:true,outfile:join(root,'author.mjs'),platform:'node',format:'esm'});const {TREE_ROWS,reshapeTreeRow,TREE_ROW_ART}=await import(pathToFileURL(join(root,'author.mjs')).href);
  const models=[];for(const [owner,rows]of Object.entries(TREE_ROWS))for(const row of rows){const source=VertexData.CreatePlane({width:row.width,height:row.width*1.25}),positions=reshapeTreeRow(owner,row.x,row.z,Array.from(source.positions)),normals=[];VertexData.ComputeNormals(positions,source.indices,normals);models.push({owner,name:'oak',position:[row.x,row.width*1.25/2+.1,row.z],positions,normals,uvs:Array.from(source.uvs),indices:Array.from(source.indices)});}
  await mkdir(out,{recursive:true});const bytes=Buffer.from(JSON.stringify({profile:TREE_ROW_ART.id,approved:false,nativeEvidence:false,models},null,2)+'\n');await writeFile(join(out,'tree-row-models.json'),bytes);
  const manifest={profile:TREE_ROW_ART.id,modelCount:models.length,modelBytes:bytes.length,modelSha256:createHash('sha256').update(bytes).digest('hex'),geometryPayloadBytes:2432,additionalTextures:0,additionalMaterials:0,additionalMeshes:0,nativeEvidence:false,approved:false};await writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
 }finally{await rm(root,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await exportProductionTreeRows(process.argv[2]??'dist/art/production-vq04o')));
