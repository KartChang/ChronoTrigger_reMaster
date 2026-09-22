import {outsideClipVolume} from './cpu-visibility';
import {DirectionalLight,HemisphericLight,PointLight,Mesh,StandardMaterial,VertexBuffer,Vector3,Matrix} from '@babylonjs/core';
import type {Engine,Scene,BaseTexture,AbstractMesh} from '@babylonjs/core';
import {CpuEngine} from './cpu-engine';
import {CpuRaster} from './cpu-raster';
import type {ClipVertex,CpuTexture,CpuSurface} from './cpu-raster';
type Packet={vertices:ClipVertex[];indices:ArrayLike<number>;start:number;end:number;material:CpuSurface;depth:number};
const owned=new WeakMap<Engine,CpuScene>();
/** Draws the existing Babylon scene graph, not a second set of levels. Shadow maps,
 * postprocess/glow and specular highlights are intentionally absent in CPU mode. */
export class CpuScene {
 private raster:CpuRaster|null=null;private image:ImageData|null=null;
 private consideredSubmeshes=0;private culledSubmeshes=0;private shadedVertices=0;
 private draws=0;private meshes=0;private textured=0;private unsupported=0;private elapsed=0;
 private lastNames:string[]=[];private perFrameTextures=new Map<BaseTexture,CpuTexture|null>();private perFrameOpaqueTextures=new Map<BaseTexture,CpuTexture|null>();
 constructor(private engine:CpuEngine){}
 private texture(t:BaseTexture|null,minify=false):CpuTexture|null{
  minify=minify&&this.engine.opaqueMinificationEnabled();
  const cache=minify?this.perFrameOpaqueTextures:this.perFrameTextures;
  if(!t)return null;if(cache.has(t))return cache.get(t)!;
  const internal=t.getInternalTexture(),pixels=internal?this.engine.readTexturePixels(internal,minify):null;
  if(!pixels){this.unsupported++;cache.set(t,null);return null;}
  const sample={...pixels,mips:minify?pixels.mips:undefined,wrapU:t.wrapU,wrapV:t.wrapV,matrix:Array.from(t.getTextureMatrix().m)};
  cache.set(t,sample);return sample;
 }
 private material(m:StandardMaterial,mesh:AbstractMesh):CpuSurface{
  const diffuse=m.disableLighting&&m.emissiveTexture?m.emissiveTexture:m.diffuseTexture;
  const alphaTexture=!!diffuse&&(m.useAlphaFromDiffuseTexture||m.needAlphaTesting());
  const texture=this.texture(diffuse,!alphaTexture&&!m.opacityTexture&&!m.needAlphaBlendingForMesh(mesh));
  const opacity=m.opacityTexture===diffuse&&alphaTexture?null:this.texture(m.opacityTexture);
  return {texture,opacity,opacityFromRGB:m.opacityTexture?.getAlphaFromRGB??false,textureAlpha:alphaTexture,
   alpha:m.alpha*mesh.visibility,cutoff:m.needAlphaTesting()?m.alphaCutOff:0,
   blend:m.needAlphaBlendingForMesh(mesh),emission:m.emissiveColor.asArray()};
 }
 draw(scene:Scene):void{
  const start=performance.now(),camera=scene.activeCamera;if(!camera)return;
  const width=this.engine.getRenderWidth(),height=this.engine.getRenderHeight();
  if(this.raster?.width!==width||this.raster?.height!==height){this.raster=new CpuRaster(width,height);this.image=this.engine.cpuContext.createImageData(width,height);}
  const raster=this.raster!;raster.clear(scene.clearColor.asArray());this.perFrameTextures.clear();this.perFrameOpaqueTextures.clear();this.meshes=0;this.textured=0;this.unsupported=0;this.lastNames=[];
  this.consideredSubmeshes=0;this.culledSubmeshes=0;this.shadedVertices=0;
  // Render observers own existing light/visibility synchronization. No GPU render,
  // material mutation, gameplay tick, collision, save or input processing occurs here.
  scene.incrementRenderId();camera.update();scene.updateTransformMatrix(true);scene.onBeforeRenderObservable.notifyObservers(scene);
  const vp=scene.getTransformMatrix(),eye=camera.globalPosition,opaque:Packet[]=[],blended:Packet[]=[];
  // Normalize each live directional light once per frame, after render observers.
  const directions=new Map(scene.lights.filter(l=>l instanceof HemisphericLight||l instanceof DirectionalLight).map(l=>[l,(l as DirectionalLight|HemisphericLight).direction.clone().normalize()]));
  for(const mesh of scene.meshes){
   if(!(mesh instanceof Mesh)||!mesh.isEnabled()||!mesh.isVisible||mesh.visibility<=0||!mesh.material||(mesh.layerMask&camera.layerMask)===0)continue;
   const positions=mesh.getVerticesData(VertexBuffer.PositionKind),indices=mesh.getIndices();if(!positions||!indices?.length)continue;
   mesh.computeWorldMatrix(true);const world=mesh.getWorldMatrix(),clip=world.multiply(vp).m;
   const normalMatrix=Matrix.Transpose(Matrix.Invert(world)),normals=mesh.getVerticesData(VertexBuffer.NormalKind),uvs=mesh.getVerticesData(VertexBuffer.UVKind),colors=mesh.useVertexColors?mesh.getVerticesData(VertexBuffer.ColorKind):null;
   const lights=scene.lights.filter(l=>l.isEnabled()&&l.canAffectMesh(mesh));let included=false;
   for(const sub of mesh.subMeshes??[]){
    const mat=sub.getMaterial();if(!(mat instanceof StandardMaterial)){this.unsupported++;continue;}
    const surface=this.material(mat,mesh);this.consideredSubmeshes++;if(surface.texture)this.textured++;included=true;
    if(outsideClipVolume(positions,clip,sub.verticesStart,sub.verticesCount)){this.culledSubmeshes++;continue;}
    const vertices:ClipVertex[]=new Array(positions.length/3);this.shadedVertices+=sub.verticesCount;
    let depth=0;
    for(let i=sub.verticesStart;i<sub.verticesStart+sub.verticesCount;i++){
     const x=positions[i*3]!,y=positions[i*3+1]!,z=positions[i*3+2]!,p=Vector3.TransformCoordinates(new Vector3(x,y,z),world);
     let r=mat.disableLighting?1:scene.ambientColor.r,g=mat.disableLighting?1:scene.ambientColor.g,b=mat.disableLighting?1:scene.ambientColor.b;
     if(!mat.disableLighting){
      const n=normals?Vector3.TransformNormal(new Vector3(normals[i*3]!,normals[i*3+1]!,normals[i*3+2]!),normalMatrix).normalize():Vector3.Up();
      for(const light of lights){
       let intensity=0;
       if(light instanceof HemisphericLight){const weight=(Vector3.Dot(n,directions.get(light)!)+1)/2;
        r+=(light.diffuse.r*weight+light.groundColor.r*(1-weight))*light.intensity;g+=(light.diffuse.g*weight+light.groundColor.g*(1-weight))*light.intensity;b+=(light.diffuse.b*weight+light.groundColor.b*(1-weight))*light.intensity;continue;}
       if(light instanceof DirectionalLight)intensity=Math.max(0,-Vector3.Dot(n,directions.get(light)!))*light.intensity;
       else if(light instanceof PointLight){const d=light.getAbsolutePosition().subtract(p),distance=d.length();intensity=Math.max(0,Vector3.Dot(n,d.normalize()))*light.intensity*Math.max(0,1-distance/Math.max(.001,light.range));}
       r+=light.diffuse.r*intensity;g+=light.diffuse.g*intensity;b+=light.diffuse.b*intensity;
      }
     }
     // Emissive-as-illumination actors preserve their painted palette once.
     const authored=mat.disableLighting&&!!mat.emissiveTexture;
     r*=authored?1:mat.diffuseColor.r;g*=authored?1:mat.diffuseColor.g;b*=authored?1:mat.diffuseColor.b;
     if(colors){r*=colors[i*4]!;g*=colors[i*4+1]!;b*=colors[i*4+2]!;}
     const w=x*clip[3]!+y*clip[7]!+z*clip[11]!+clip[15]!,cz=x*clip[2]!+y*clip[6]!+z*clip[10]!+clip[14]!;
     vertices[i]={x:x*clip[0]!+y*clip[4]!+z*clip[8]!+clip[12]!,y:x*clip[1]!+y*clip[5]!+z*clip[9]!+clip[13]!,z:cz,w,
      u:uvs?.[i*2]??0,v:uvs?.[i*2+1]??0,r,g,b,a:colors&&mesh.hasVertexAlpha?colors[i*4+3]!:1};
     depth+=Vector3.DistanceSquared(p,eye);
    }
    const packet={vertices,indices,start:sub.indexStart,end:sub.indexStart+sub.indexCount,material:surface,depth:depth/Math.max(1,sub.verticesCount)};
    (surface.blend?blended:opaque).push(packet);
   }
   if(included){this.meshes++;if(this.lastNames.length<64)this.lastNames.push(mesh.name);}
  }
  // Opaque fragments write depth. Alpha-blended surfaces are far-to-near and do
  // not hide later transparent fragments with a depth write. Cutouts still write depth.
  blended.sort((a,b)=>b.depth-a.depth);
  for(const p of [...opaque,...blended])for(let i=p.start;i+2<p.end;i+=3){
   const a=p.vertices[p.indices[i]!]!,b=p.vertices[p.indices[i+1]!]!,c=p.vertices[p.indices[i+2]!]!;
   if(a&&b&&c)raster.triangle(a,b,c,p.material);
  }
  this.image!.data.set(raster.rgba);this.engine.cpuContext.putImageData(this.image!,0,0);this.draws++;
  this.perFrameTextures.clear();this.perFrameOpaqueTextures.clear();this.elapsed=performance.now()-start;scene.onAfterRenderObservable.notifyObservers(scene);
 }
 inspect(){return {profile:'vq02d-existing-scene-cpu-raster',draws:this.draws,meshes:this.meshes,texturedSurfaces:this.textured,unsupportedResources:this.unsupported,
  triangles:this.raster?.triangles??0,fragments:this.raster?.fragments??0,frameMs:this.elapsed,
  work:{profile:'vq02e-conservative-cpu-work',consideredSubmeshes:this.consideredSubmeshes,culledSubmeshes:this.culledSubmeshes,shadedVertices:this.shadedVertices,submittedTriangles:this.raster?.submitted??0,fastAccepted:this.raster?.fastAccepted??0,trivialRejected:this.raster?.trivialRejected??0,clipped:this.raster?.clipped??0},
  sampling:{profile:'vq02j-opaque-affine-minification',enabled:this.engine.opaqueMinificationEnabled(),minifiedTriangles:this.raster?.minifiedTriangles??0,fractionalTriangles:this.raster?.fractionalTriangles??0,levelSelection:'continuous-base-to-mip',alphaCutouts:'nearest',perspective:'nearest-fallback'},
  bufferBytes:(this.raster?.rgba.byteLength??0)+(this.raster?.depth.byteLength??0)+(this.image?.data.byteLength??0),
  textureMemory:this.engine.textureMemory(),meshSamples:[...this.lastNames],shadowMaps:false,postprocess:false,artApproved:false};}
}
export function renderCompatibleScene(engine:Engine,scene:Scene):void{
 if(!(engine instanceof CpuEngine)){scene.render();return;}
 let renderer=owned.get(engine);if(!renderer){renderer=new CpuScene(engine);owned.set(engine,renderer);scene.onDisposeObservable.add(()=>owned.delete(engine));}
 renderer.draw(scene);
}
export function inspectCpuRendering(engine:Engine){
 return engine instanceof CpuEngine?{profile:'vq02d-existing-scene-cpu-raster',backend:'cpu-canvas2d',pixelBudget:640*480,canvas2dFallback:true,browserChoosesBackend:false,forcedSoftware:false,cpu:owned.get(engine)?.inspect()??null}:{backend:'webgl'};
}
